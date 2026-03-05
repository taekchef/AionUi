/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Light ↔ Dark mode bidirectional sync algorithm.
 *
 * Operates in HSL color space for perceptually meaningful transformations.
 * Each variable category has a specific sync strategy:
 *   - Backgrounds: invert lightness (L → 100 - L)
 *   - Text: invert lightness
 *   - Accents/Semantic: keep hue, shift lightness + adjust saturation
 *   - Manual: no automatic sync (user must set both independently)
 *
 * Features:
 *   - Bidirectional: Light → Dark and Dark → Light
 *   - Revertable: each sync produces a revert record
 *   - Per-variable override: user can disable sync for individual variables
 */

import { getVariableByKey, type ThemeVariable } from './themeVariableMap';

// ---------------------------------------------------------------------------
// Color conversion utilities (Hex ↔ RGB ↔ HSL)
// ---------------------------------------------------------------------------

interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/** Parse hex color (#rgb, #rrggbb) to RGB */
export function hexToRgb(hex: string): RGB | null {
  const cleaned = hex.replace(/^#/, '');
  let r: number, g: number, b: number;

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else if (cleaned.length === 6) {
    r = parseInt(cleaned.substring(0, 2), 16);
    g = parseInt(cleaned.substring(2, 4), 16);
    b = parseInt(cleaned.substring(4, 6), 16);
  } else {
    return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

/** Convert RGB to hex string */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/** Convert RGB to HSL */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
      h = ((b - r) / delta + 2) * 60;
    } else {
      h = ((r - g) / delta + 4) * 60;
    }
  }

  return {
    h: Math.round(h * 10) / 10,
    s: Math.round(s * 1000) / 10,
    l: Math.round(l * 1000) / 10,
  };
}

/** Convert HSL to RGB */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c; g = x;
  } else if (h < 120) {
    r = x; g = c;
  } else if (h < 180) {
    g = c; b = x;
  } else if (h < 240) {
    g = x; b = c;
  } else if (h < 300) {
    r = x; b = c;
  } else {
    r = c; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/** Parse any CSS color value to HSL. Supports hex and rgb(). Returns null for unparseable values. */
export function parseColorToHsl(value: string): HSL | null {
  const trimmed = value.trim();

  // Hex
  if (trimmed.startsWith('#')) {
    const rgb = hexToRgb(trimmed);
    return rgb ? rgbToHsl(rgb) : null;
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return rgbToHsl({
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    });
  }

  return null;
}

/** Convert HSL back to hex string */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

// ---------------------------------------------------------------------------
// Sync strategies
// ---------------------------------------------------------------------------

/** Clamp a number between min and max */
const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

/**
 * Invert lightness: L → 100 - L
 * Used for backgrounds and text colors.
 * Also reduces saturation slightly for dark mode harmony.
 */
function invertLightness(hsl: HSL, _params?: Record<string, number>): HSL {
  return {
    h: hsl.h,
    s: clamp(hsl.s * 0.9, 0, 100), // Slight saturation reduction
    l: clamp(100 - hsl.l, 0, 100),
  };
}

/**
 * Shift lightness by a fixed amount.
 * Used for accent/semantic colors that should remain recognizable.
 * Light → Dark: lighten to maintain visibility on dark backgrounds.
 */
function shiftLightness(
  hsl: HSL,
  params?: Record<string, number>
): HSL {
  const lightnessShift = params?.lightnessShift ?? 15;
  const saturationShift = params?.saturationShift ?? -10;

  return {
    h: hsl.h,
    s: clamp(hsl.s + saturationShift, 0, 100),
    l: clamp(hsl.l + lightnessShift, 0, 100),
  };
}

/**
 * Keep hue, adjust only lightness and saturation.
 * Most conservative strategy — ensures color identity is preserved.
 */
function keepHue(hsl: HSL, params?: Record<string, number>): HSL {
  const lightnessShift = params?.lightnessShift ?? 10;
  return {
    h: hsl.h,
    s: hsl.s,
    l: clamp(hsl.l + lightnessShift, 0, 100),
  };
}

/** Map strategy name to function */
const STRATEGY_MAP: Record<string, (hsl: HSL, params?: Record<string, number>) => HSL> = {
  invertLightness,
  shiftLightness,
  keepHue,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Record of a sync operation, used for revert */
export interface SyncRecord {
  /** Variable key that was synced */
  key: string;
  /** The value that was replaced */
  previousValue: string;
  /** The new computed value */
  newValue: string;
  /** Direction of the sync */
  direction: 'lightToDark' | 'darkToLight';
}

/**
 * Compute the dark mode value for a given light mode value,
 * using the variable's sync rule.
 */
export function computeDarkFromLight(
  key: string,
  lightValue: string
): string | null {
  const varDef = getVariableByKey(key);
  if (!varDef?.darkSyncRule || varDef.darkSyncRule.strategy === 'manual') {
    return null;
  }

  const hsl = parseColorToHsl(lightValue);
  if (!hsl) return null; // Not a parseable color — can't sync

  const strategy = STRATEGY_MAP[varDef.darkSyncRule.strategy];
  if (!strategy) return null;

  const result = strategy(hsl, varDef.darkSyncRule.params);
  return hslToHex(result);
}

/**
 * Compute the light mode value for a given dark mode value.
 * Inverts the direction of the sync strategy.
 */
export function computeLightFromDark(
  key: string,
  darkValue: string
): string | null {
  const varDef = getVariableByKey(key);
  if (!varDef?.darkSyncRule || varDef.darkSyncRule.strategy === 'manual') {
    return null;
  }

  const hsl = parseColorToHsl(darkValue);
  if (!hsl) return null;

  // Reverse the transformation
  const strategy = varDef.darkSyncRule.strategy;
  const params = varDef.darkSyncRule.params;

  let result: HSL;

  switch (strategy) {
    case 'invertLightness':
      // invertLightness is self-inverse (applying twice returns to original)
      result = invertLightness(hsl, params);
      // Restore saturation (reverse the 0.9 factor)
      result.s = clamp(result.s / 0.9, 0, 100);
      break;

    case 'shiftLightness': {
      // Reverse the shifts
      const lightnessShift = params?.lightnessShift ?? 15;
      const saturationShift = params?.saturationShift ?? -10;
      result = {
        h: hsl.h,
        s: clamp(hsl.s - saturationShift, 0, 100),
        l: clamp(hsl.l - lightnessShift, 0, 100),
      };
      break;
    }

    case 'keepHue': {
      const lightnessShift = params?.lightnessShift ?? 10;
      result = {
        h: hsl.h,
        s: hsl.s,
        l: clamp(hsl.l - lightnessShift, 0, 100),
      };
      break;
    }

    default:
      return null;
  }

  return hslToHex(result);
}

/**
 * Sync all variables from one mode to another.
 * Returns an array of SyncRecords for undo support.
 *
 * @param sourceVars - Variable values from the source mode
 * @param targetVars - Current variable values in the target mode (will be overwritten)
 * @param direction - Which direction to sync
 * @param excludeKeys - Set of variable keys to skip (user has disabled sync for these)
 */
export function syncAllVariables(
  sourceVars: Record<string, string>,
  targetVars: Record<string, string>,
  direction: 'lightToDark' | 'darkToLight',
  excludeKeys: Set<string> = new Set()
): { updatedVars: Record<string, string>; records: SyncRecord[] } {
  const updatedVars = { ...targetVars };
  const records: SyncRecord[] = [];

  const computeFn =
    direction === 'lightToDark' ? computeDarkFromLight : computeLightFromDark;

  for (const [key, value] of Object.entries(sourceVars)) {
    if (excludeKeys.has(key)) continue;

    const computed = computeFn(key, value);
    if (computed !== null && computed !== targetVars[key]) {
      records.push({
        key,
        previousValue: targetVars[key] ?? '',
        newValue: computed,
        direction,
      });
      updatedVars[key] = computed;
    }
  }

  return { updatedVars, records };
}

/**
 * Revert a set of sync records — restores previous values.
 */
export function revertSyncRecords(
  vars: Record<string, string>,
  records: SyncRecord[]
): Record<string, string> {
  const result = { ...vars };
  for (const record of records) {
    if (record.previousValue) {
      result[record.key] = record.previousValue;
    } else {
      delete result[record.key];
    }
  }
  return result;
}
