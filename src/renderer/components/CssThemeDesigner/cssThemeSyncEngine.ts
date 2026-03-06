/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Bidirectional sync engine for CSS Theme Designer.
 *
 * Responsibilities:
 *   Visual controls → CSS code:  Generate CSS from structured variable state
 *   CSS code → Visual controls:  Parse CSS to extract variable values
 *
 * Design principles:
 *   - Code mode is source of truth when conflicts arise
 *   - Unrecognized CSS (custom selectors, animations, etc.) is preserved as-is
 *   - Parsing is debounced (consumer should debounce, not this module)
 */

import { THEME_VARIABLE_MAP } from './themeVariableMap';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Structured representation of a theme's editable state */
export interface ThemeEditorState {
  /** CSS variable values keyed by variable name (e.g. '--primary': '#165dff') */
  variables: Record<string, string>;

  /** Raw CSS that doesn't map to known variables (selector overrides, keyframes, etc.) */
  customCss: string;

  /** Which mode these values apply to */
  mode: 'light' | 'dark';
}

/** Result of parsing CSS code */
export interface ParseResult {
  /** Extracted variable values for light mode */
  lightVariables: Record<string, string>;

  /** Extracted variable values for dark mode */
  darkVariables: Record<string, string>;

  /** CSS content that couldn't be mapped to known variables */
  unmatchedCss: string;

  /** Parsing warnings (e.g. unrecognized variable names) */
  warnings: string[];
}

// ---------------------------------------------------------------------------
// CSS Parser — Code → Visual
// ---------------------------------------------------------------------------

/**
 * Regex patterns for extracting CSS variable declarations from different
 * selector blocks. Supports multiple quote styles for data-theme attribute.
 */
const ROOT_BLOCK_RE = /:root\s*\{([^}]*)\}/g;
const DARK_BLOCK_RE = /\[data-theme=["']?dark["']?\]\s*\{([^}]*)\}/g;
const COLOR_SCHEME_DARK_RE = /\[data-color-scheme=["']?default["']?\]\[data-theme=["']?dark["']?\]\s*\{([^}]*)\}/g;

/** Extract CSS custom property declarations from a block body */
function extractVariablesFromBlock(blockBody: string): Record<string, string> {
  const vars: Record<string, string> = {};
  // Match lines like: --primary: #165dff;
  const re = /\s*(--[\w-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(blockBody)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();
    vars[key] = value;
  }
  return vars;
}

/** Set of known variable keys for fast lookup */
const KNOWN_VARIABLE_KEYS = new Set(THEME_VARIABLE_MAP.map((v) => v.key));

/**
 * Parse raw CSS code into structured variable values and unmatched CSS.
 *
 * Extraction priority:
 *   1. :root block → light mode variables
 *   2. [data-theme='dark'] block → dark mode variables
 *   3. [data-color-scheme='default'][data-theme='dark'] block → dark mode variables (override)
 *   4. Everything else → unmatchedCss (preserved verbatim)
 */
export function parseCssToVariables(css: string): ParseResult {
  const lightVariables: Record<string, string> = {};
  const darkVariables: Record<string, string> = {};
  const warnings: string[] = [];

  // Track which parts of the CSS we've consumed
  let remaining = css;

  // 1. Extract :root blocks
  ROOT_BLOCK_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ROOT_BLOCK_RE.exec(css)) !== null) {
    const vars = extractVariablesFromBlock(match[1]);
    for (const [key, value] of Object.entries(vars)) {
      if (KNOWN_VARIABLE_KEYS.has(key)) {
        lightVariables[key] = value;
      } else {
        // Unknown variable — could be theme-specific custom variable
        // Still extract it but warn
        lightVariables[key] = value;
        warnings.push(`Unknown variable in :root: ${key}`);
      }
    }
    remaining = remaining.replace(match[0], '');
  }

  // 2. Extract [data-color-scheme='default'][data-theme='dark'] blocks (more specific)
  COLOR_SCHEME_DARK_RE.lastIndex = 0;
  while ((match = COLOR_SCHEME_DARK_RE.exec(css)) !== null) {
    const vars = extractVariablesFromBlock(match[1]);
    for (const [key, value] of Object.entries(vars)) {
      darkVariables[key] = value;
      if (!KNOWN_VARIABLE_KEYS.has(key)) {
        warnings.push(`Unknown variable in dark block: ${key}`);
      }
    }
    remaining = remaining.replace(match[0], '');
  }

  // 3. Extract [data-theme='dark'] blocks (less specific, don't override)
  DARK_BLOCK_RE.lastIndex = 0;
  while ((match = DARK_BLOCK_RE.exec(css)) !== null) {
    const vars = extractVariablesFromBlock(match[1]);
    for (const [key, value] of Object.entries(vars)) {
      if (!(key in darkVariables)) {
        darkVariables[key] = value;
      }
      if (!KNOWN_VARIABLE_KEYS.has(key)) {
        warnings.push(`Unknown variable in dark block: ${key}`);
      }
    }
    remaining = remaining.replace(match[0], '');
  }

  // 4. Everything left is unmatched CSS
  const unmatchedCss = remaining
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\n{3,}/g, '\n\n') // Collapse excessive newlines
    .trim();

  return { lightVariables, darkVariables, unmatchedCss, warnings };
}

// ---------------------------------------------------------------------------
// CSS Generator — Visual → Code
// ---------------------------------------------------------------------------

/** Group variables by their category for readable CSS output */
const GROUP_COMMENTS: Record<string, string> = {
  globalTone: 'Primary & Brand Colors',
  aouPalette: 'AOU Brand Palette',
  backgrounds: 'Background Colors',
  text: 'Text Colors',
  messages: 'Message & Component Colors',
  borders: 'Border Colors',
  semantic: 'Semantic Colors',
  shape: 'Shape & Border Radius',
  typography: 'Typography & Motion',
  effects: 'Effects & Shadows',
};

/** Order of groups in generated CSS */
const GROUP_ORDER: string[] = ['globalTone', 'aouPalette', 'backgrounds', 'text', 'messages', 'borders', 'semantic', 'shape', 'typography', 'effects'];

/**
 * Generate CSS code from structured variable state.
 *
 * Output structure:
 *   :root { ... light mode variables ... }
 *   [data-theme='dark'] { ... dark mode variables ... }
 *   <unmatched custom CSS>
 *
 * @param skipDefaults - If true (default), variables whose value matches
 *   the themeVariableMap default are omitted. Set to false for lossless
 *   round-trip export (e.g. when the user explicitly set a default value).
 */
export function generateCssFromVariables(lightVars: Record<string, string>, darkVars: Record<string, string>, customCss: string = '', skipDefaults: boolean = true): string {
  const sections: string[] = [];

  // Build :root block
  const lightLines = buildVariableBlock(lightVars, 'light', skipDefaults);
  if (lightLines.length > 0) {
    sections.push(`:root {\n${lightLines.join('\n')}\n}`);
  }

  // Build dark mode block
  const darkLines = buildVariableBlock(darkVars, 'dark', skipDefaults);
  if (darkLines.length > 0) {
    sections.push(`[data-theme='dark'] {\n${darkLines.join('\n')}\n}`);
  }

  // Append custom CSS
  if (customCss.trim()) {
    sections.push(`/* Custom CSS */\n${customCss.trim()}`);
  }

  return sections.join('\n\n') + '\n';
}

/** Build grouped variable declaration lines for a :root or dark block */
function buildVariableBlock(vars: Record<string, string>, mode: 'light' | 'dark', skipDefaults: boolean): string[] {
  const lines: string[] = [];
  let currentGroup = '';

  // Sort variables by group order, then by map order within group
  const sortedKeys = Object.keys(vars).sort((a, b) => {
    const varA = THEME_VARIABLE_MAP.find((v) => v.key === a);
    const varB = THEME_VARIABLE_MAP.find((v) => v.key === b);
    const groupA = varA ? GROUP_ORDER.indexOf(varA.group) : 999;
    const groupB = varB ? GROUP_ORDER.indexOf(varB.group) : 999;
    if (groupA !== groupB) return groupA - groupB;
    // Within same group, preserve map order
    const idxA = varA ? THEME_VARIABLE_MAP.indexOf(varA) : 999;
    const idxB = varB ? THEME_VARIABLE_MAP.indexOf(varB) : 999;
    return idxA - idxB;
  });

  for (const key of sortedKeys) {
    const varDef = THEME_VARIABLE_MAP.find((v) => v.key === key);
    const group = varDef?.group || 'unknown';

    // Skip variables whose value matches the default (no need to override)
    if (skipDefaults && varDef) {
      const defaultValue = mode === 'light' ? varDef.defaultLight : varDef.defaultDark;
      if (vars[key] === defaultValue) continue;
    }

    // Add group comment header
    if (group !== currentGroup) {
      if (lines.length > 0) lines.push('');
      const comment = GROUP_COMMENTS[group] || group;
      lines.push(`  /* ${comment} */`);
      currentGroup = group;
    }

    lines.push(`  ${key}: ${vars[key]};`);
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Selector-level override parser (best-effort)
// ---------------------------------------------------------------------------

/** Known selector → variable mapping for non-variable CSS properties */
interface SelectorOverride {
  /** CSS selector */
  selector: string;
  /** CSS property name */
  property: string;
  /** Corresponding --theme-* variable key */
  variableKey: string;
}

const SELECTOR_OVERRIDES: SelectorOverride[] = [
  { selector: 'body', property: 'font-family', variableKey: '--theme-font-family' },
  { selector: '.arco-btn-primary', property: 'border-radius', variableKey: '--theme-border-radius-button' },
  { selector: '.arco-btn-primary', property: 'font-weight', variableKey: '--theme-button-font-weight' },
  { selector: '.guidInputCard', property: 'border-radius', variableKey: '--theme-border-radius-input' },
  { selector: '.sendbox-container', property: 'border-radius', variableKey: '--theme-border-radius-input' },
  { selector: '.arco-tooltip-inner', property: 'border-radius', variableKey: '--theme-border-radius-tooltip' },
  { selector: '::-webkit-scrollbar', property: 'width', variableKey: '--theme-scrollbar-width' },
  { selector: '::-webkit-scrollbar-thumb', property: 'border-radius', variableKey: '--theme-scrollbar-radius' },
];

/**
 * Attempt to extract known properties from selector-level CSS rules
 * and map them to --theme-* variables.
 *
 * This is a best-effort parser for converting legacy theme CSS
 * (that uses selector overrides) into the new variable system.
 */
export function extractSelectorOverrides(css: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const override of SELECTOR_OVERRIDES) {
    // Build regex to find the selector block and extract the property
    const escapedSelector = override.selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match selector with possible combinators/pseudo-classes after it
    const blockRe = new RegExp(`${escapedSelector}[^{]*\\{([^}]*)}`, 'g');

    let match: RegExpExecArray | null;
    blockRe.lastIndex = 0;
    while ((match = blockRe.exec(css)) !== null) {
      const blockBody = match[1];
      // Extract the specific property
      const propRe = new RegExp(`${override.property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;!]+)`, 'i');
      const propMatch = propRe.exec(blockBody);
      if (propMatch) {
        result[override.variableKey] = propMatch[1].trim();
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Full parse pipeline (CSS code → editor state)
// ---------------------------------------------------------------------------

/**
 * Complete parse pipeline: takes raw CSS and produces structured editor state.
 * Combines variable extraction with selector override extraction.
 */
export function parseThemeCss(css: string): {
  light: Record<string, string>;
  dark: Record<string, string>;
  customCss: string;
  warnings: string[];
} {
  // Step 1: Extract variables from :root and [data-theme='dark'] blocks
  const { lightVariables, darkVariables, unmatchedCss, warnings } = parseCssToVariables(css);

  // Step 2: Try to extract selector overrides from unmatched CSS
  const selectorOverrides = extractSelectorOverrides(unmatchedCss);

  // Step 3: Merge selector overrides into light variables (lower priority)
  const mergedLight = { ...selectorOverrides, ...lightVariables };

  // Step 4: Also check dark-mode selector overrides
  // (look for [data-theme='dark'] prefixed selectors in unmatched CSS)
  const darkSelectorCss = unmatchedCss
    .split('\n')
    .filter((line) => line.includes("[data-theme='dark']") || line.includes('[data-theme="dark"]'))
    .join('\n');
  const darkSelectorOverrides = extractSelectorOverrides(darkSelectorCss);
  const mergedDark = { ...darkSelectorOverrides, ...darkVariables };

  return {
    light: mergedLight,
    dark: mergedDark,
    customCss: unmatchedCss,
    warnings,
  };
}
