/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CSS Theme Variable Map
 *
 * A structured index of all CSS variables available for theming in AionUI.
 * Serves three audiences:
 *
 *   1. **Theme Designer UI** — generates control groups and controls programmatically
 *   2. **AI Skills** — provides semantic context for automated theme generation
 *      (what each variable means, what it affects, what values are reasonable)
 *   3. **Design specification** — draft reference for the frontend team to formalize
 *      (suggestedRange and designNote fields are recommendations, design team may revise)
 *
 * Maintenance:
 *   - Update this file when adding new CSS variables to default.css or theme-variables.css
 *   - Fields marked "DRAFT" are suggestions pending design team review
 */

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

/** Control group identifiers — each maps to a collapsible card in Theme Designer */
export type ThemeGroup =
  | 'globalTone'
  | 'aouPalette'
  | 'backgrounds'
  | 'text'
  | 'messages'
  | 'borders'
  | 'semantic'
  | 'shape'
  | 'typography'
  | 'effects';

/** Preview scene identifiers — used for control ↔ preview linkage */
export type PreviewScene = 'chat' | 'sidebar' | 'settings' | 'workspace';

/** Control widget type rendered in the visual editor */
export type ControlType =
  | 'color'
  | 'colorScale'
  | 'colorWithAlpha'
  | 'linkedColorPair'
  | 'slider'
  | 'dropdown'
  | 'toggle'
  | 'gradient'
  | 'shadowPreset'
  | 'texturePreset'
  | 'imageUpload';

export interface ThemeVariable {
  /** CSS variable name, e.g. '--primary' */
  key: string;

  /** Control group this variable belongs to */
  group: ThemeGroup;

  /** i18n key for the display label */
  labelKey: string;

  /**
   * Semantic description of what this variable controls and why it exists.
   * Written to be useful for both humans reading docs and AI generating themes.
   */
  description: string;

  /** Which preview scenes show this variable's effect */
  affectsScenes: PreviewScene[];

  /**
   * CSS selectors that reference this variable (non-exhaustive).
   * Helps AI understand the scope of impact.
   */
  affectsSelectors: string[];

  /** Control widget type for the Theme Designer UI */
  controlType: ControlType;

  /** Whether this variable supports gradient mode in the detailed control layer */
  supportsGradient?: boolean;

  /** Slider range configuration (when controlType is 'slider') */
  range?: {
    min: number;
    max: number;
    step: number;
    unit: string;
  };

  /** Dropdown options (when controlType is 'dropdown') */
  options?: Array<{ value: string; label: string }>;

  /** Default value for light mode */
  defaultLight: string;

  /** Default value for dark mode */
  defaultDark: string;

  /**
   * DRAFT — Suggested value range and design notes.
   * The frontend design team should review and may adjust these.
   */
  suggestedRange?: {
    /** Discrete recommended values */
    values?: string[];
    /** Minimum recommended value */
    min?: string;
    /** Maximum recommended value */
    max?: string;
    /** Accessibility note (e.g. contrast ratio requirements) */
    a11yNote?: string;
    /** Design rationale or guidance */
    designNote?: string;
  };

  /** Rule for automatic light ↔ dark mode value sync */
  darkSyncRule?: {
    strategy: 'invertLightness' | 'shiftLightness' | 'keepHue' | 'manual';
    /** Strategy-specific parameters, e.g. { lightnessShift: 15, saturationShift: -10 } */
    params?: Record<string, number>;
  };
}

/** Metadata for a control group card in the Theme Designer */
export interface ThemeGroupMeta {
  /** Group identifier */
  id: ThemeGroup;
  /** i18n key for the group title */
  labelKey: string;
  /** Short description of what this group covers */
  description: string;
  /** Icon identifier (IconPark icon name) */
  icon: string;
  /** Display order (lower = higher) */
  order: number;
}

// ---------------------------------------------------------------------------
// Group definitions
// ---------------------------------------------------------------------------

export const THEME_GROUPS: ThemeGroupMeta[] = [
  {
    id: 'globalTone',
    labelKey: 'settings.themeDesigner.group.globalTone',
    description: 'Primary color, brand colors — the overall color identity',
    icon: 'Color',
    order: 1,
  },
  {
    id: 'aouPalette',
    labelKey: 'settings.themeDesigner.group.aouPalette',
    description: 'AOU brand 10-shade color palette for UI accents and gradients',
    icon: 'Palette',
    order: 2,
  },
  {
    id: 'backgrounds',
    labelKey: 'settings.themeDesigner.group.backgrounds',
    description: 'Background colors for all layout layers, interactive states, fills',
    icon: 'BackgroundColor',
    order: 3,
  },
  {
    id: 'text',
    labelKey: 'settings.themeDesigner.group.text',
    description: 'Text colors at different hierarchy levels',
    icon: 'Text',
    order: 4,
  },
  {
    id: 'messages',
    labelKey: 'settings.themeDesigner.group.messages',
    description: 'Chat message bubbles, tips, workspace controls',
    icon: 'MessageOne',
    order: 5,
  },
  {
    id: 'borders',
    labelKey: 'settings.themeDesigner.group.borders',
    description: 'Border colors for dividers, outlines, and separators',
    icon: 'RoundMask',
    order: 6,
  },
  {
    id: 'semantic',
    labelKey: 'settings.themeDesigner.group.semantic',
    description: 'Semantic status colors: success, warning, danger, info',
    icon: 'CheckOne',
    order: 7,
  },
  {
    id: 'shape',
    labelKey: 'settings.themeDesigner.group.shape',
    description: 'Border radius for buttons, inputs, bubbles, tooltips, scrollbar',
    icon: 'RoundMask',
    order: 8,
  },
  {
    id: 'typography',
    labelKey: 'settings.themeDesigner.group.typography',
    description: 'Font family, weight, transition speed, scrollbar dimensions',
    icon: 'FontSize',
    order: 9,
  },
  {
    id: 'effects',
    labelKey: 'settings.themeDesigner.group.effects',
    description: 'Advanced visual effects: backdrop blur, shadows, gradients, textures, background images',
    icon: 'Effects',
    order: 10,
  },
];

// ---------------------------------------------------------------------------
// Variable map
// ---------------------------------------------------------------------------

export const THEME_VARIABLE_MAP: ThemeVariable[] = [
  // =========================================================================
  // GROUP 1: Global Tone
  // =========================================================================
  {
    key: '--primary',
    group: 'globalTone',
    labelKey: 'settings.themeDesigner.var.primary',
    description:
      'The main accent color used throughout the UI for primary buttons, links, active states, and focus rings. This is the single most impactful color variable — changing it redefines the entire app personality.',
    affectsScenes: ['chat', 'sidebar', 'settings', 'workspace'],
    affectsSelectors: ['.arco-btn-primary', 'a', '[data-active]', '.arco-checkbox-checked', '.arco-radio-checked'],
    controlType: 'color',
    supportsGradient: true,
    defaultLight: '#165dff',
    defaultDark: '#4d9fff',
    suggestedRange: {
      a11yNote: 'Ensure at least 4.5:1 contrast ratio against white/dark backgrounds for text usage',
      designNote: 'Saturated mid-tone colors work best. Avoid very light or very dark values.',
    },
    darkSyncRule: { strategy: 'shiftLightness', params: { lightnessShift: 15, saturationShift: -10 } },
  },
  {
    key: '--color-primary',
    group: 'globalTone',
    labelKey: 'settings.themeDesigner.var.colorPrimary',
    description: 'Alias of --primary used by Arco Design components internally. Should always match --primary.',
    affectsScenes: ['chat', 'sidebar', 'settings', 'workspace'],
    affectsSelectors: ['.arco-btn-primary', '.arco-switch-checked', '.arco-slider-bar'],
    controlType: 'color',
    defaultLight: '#165dff',
    defaultDark: '#4d9fff',
    darkSyncRule: { strategy: 'shiftLightness', params: { lightnessShift: 15, saturationShift: -10 } },
  },
  {
    key: '--color-primary-light-1',
    group: 'globalTone',
    labelKey: 'settings.themeDesigner.var.primaryLight1',
    description: 'Lighter variant of primary color. Used for hover states on primary elements.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.arco-btn-primary:hover'],
    controlType: 'color',
    defaultLight: '#4080ff',
    defaultDark: '#93c5fd',
    darkSyncRule: { strategy: 'shiftLightness', params: { lightnessShift: 20, saturationShift: -15 } },
  },
  {
    key: '--color-primary-light-2',
    group: 'globalTone',
    labelKey: 'settings.themeDesigner.var.primaryLight2',
    description: 'Second lighter variant of primary. Used for selected item backgrounds.',
    affectsScenes: ['sidebar', 'settings'],
    affectsSelectors: ['.arco-menu-item-selected'],
    controlType: 'color',
    defaultLight: '#6aa1ff',
    defaultDark: '#bfdbfe',
    darkSyncRule: { strategy: 'shiftLightness', params: { lightnessShift: 25, saturationShift: -15 } },
  },
  {
    key: '--color-primary-light-3',
    group: 'globalTone',
    labelKey: 'settings.themeDesigner.var.primaryLight3',
    description: 'Third lighter variant. Used for subtle primary-tinted backgrounds.',
    affectsScenes: ['settings'],
    affectsSelectors: ['.arco-tag-arcoblue'],
    controlType: 'color',
    defaultLight: '#94bfff',
    defaultDark: '#dbeafe',
    darkSyncRule: { strategy: 'shiftLightness', params: { lightnessShift: 30, saturationShift: -20 } },
  },
  {
    key: '--color-primary-dark-1',
    group: 'globalTone',
    labelKey: 'settings.themeDesigner.var.primaryDark1',
    description: 'Darker variant of primary. Used for active/pressed states on primary elements.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.arco-btn-primary:active'],
    controlType: 'color',
    defaultLight: '#0e42d2',
    defaultDark: '#3b82f6',
    darkSyncRule: { strategy: 'shiftLightness', params: { lightnessShift: -10, saturationShift: 5 } },
  },
  {
    key: '--brand',
    group: 'globalTone',
    labelKey: 'settings.themeDesigner.var.brand',
    description: 'Brand identity color. Used for brand-specific UI elements like the sidebar header accent and brand badges.',
    affectsScenes: ['sidebar', 'chat'],
    affectsSelectors: ['.app-titlebar__brand', '.layout-sider-header'],
    controlType: 'color',
    defaultLight: '#7583b2',
    defaultDark: '#a1aacb',
    darkSyncRule: { strategy: 'shiftLightness', params: { lightnessShift: 15, saturationShift: -5 } },
  },
  {
    key: '--brand-light',
    group: 'globalTone',
    labelKey: 'settings.themeDesigner.var.brandLight',
    description: 'Light tint of the brand color. Used for subtle brand-tinted backgrounds.',
    affectsScenes: ['sidebar'],
    affectsSelectors: ['.brand-badge-bg'],
    controlType: 'color',
    defaultLight: '#eff0f6',
    defaultDark: '#3d4150',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--brand-hover',
    group: 'globalTone',
    labelKey: 'settings.themeDesigner.var.brandHover',
    description: 'Brand color hover state.',
    affectsScenes: ['sidebar'],
    affectsSelectors: ['.brand-element:hover'],
    controlType: 'color',
    defaultLight: '#b5bcd6',
    defaultDark: '#6a749b',
    darkSyncRule: { strategy: 'invertLightness' },
  },

  // =========================================================================
  // GROUP 2: AOU Palette (10-shade)
  // =========================================================================
  ...Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    const lightValues = ['#eff0f6', '#e5e7f0', '#d1d5e5', '#b5bcd6', '#97a0c5', '#7583b2', '#596590', '#3f4868', '#262c41', '#0d101c'];
    const darkValues = ['#2a2a2a', '#3d4150', '#525a77', '#6a749b', '#838fba', '#a1aacb', '#b5bcd6', '#d1d5e5', '#e5e7f0', '#eff0f6'];
    return {
      key: `--aou-${n}`,
      group: 'aouPalette' as ThemeGroup,
      labelKey: `settings.themeDesigner.var.aou${n}`,
      description: `AOU brand palette shade ${n}/10. ${n <= 3 ? 'Lightest shades — used for subtle backgrounds and tints.' : n <= 7 ? 'Mid-range shades — used for borders, secondary text, and accents.' : 'Darkest shades — used for primary text and deep backgrounds.'}`,
      affectsScenes: ['chat', 'sidebar', 'settings'] as PreviewScene[],
      affectsSelectors: [`.bg-aou-${n}`, `.text-aou-${n}`],
      controlType: (n === 1 || n === 10 ? 'color' : 'color') as ControlType, // All individual, but parent group uses colorScale
      defaultLight: lightValues[i],
      defaultDark: darkValues[i],
      darkSyncRule: { strategy: 'invertLightness' as const },
    } satisfies ThemeVariable;
  }),

  // =========================================================================
  // GROUP 3: Backgrounds
  // =========================================================================
  {
    key: '--bg-base',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.bgBase',
    description: 'The root background color of the entire application. Everything sits on top of this.',
    affectsScenes: ['chat', 'sidebar', 'settings', 'workspace'],
    affectsSelectors: ['body', 'html', '.app-shell'],
    controlType: 'color',
    defaultLight: '#ffffff',
    defaultDark: '#0e0e0e',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--bg-1',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.bg1',
    description: 'Secondary background. Used for sidebar, settings panels, and card backgrounds. One step darker than --bg-base in light mode.',
    affectsScenes: ['chat', 'sidebar', 'settings', 'workspace'],
    affectsSelectors: ['.layout-content', '.arco-layout-content', '.bg-1'],
    controlType: 'color',
    defaultLight: '#f7f8fa',
    defaultDark: '#1a1a1a',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--bg-2',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.bg2',
    description: 'Tertiary background. Used for input fields, code blocks, and nested card backgrounds.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.bg-2', '.arco-input', '.arco-textarea'],
    controlType: 'color',
    defaultLight: '#f2f3f5',
    defaultDark: '#262626',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--bg-3',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.bg3',
    description: 'Fourth-level background. Also used as a border/divider color in some contexts.',
    affectsScenes: ['chat', 'sidebar', 'settings'],
    affectsSelectors: ['.bg-3', '.arco-divider'],
    controlType: 'color',
    defaultLight: '#e5e6eb',
    defaultDark: '#333333',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--bg-4',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.bg4',
    description: 'Fifth-level background shade.',
    affectsScenes: ['settings'],
    affectsSelectors: ['.bg-4'],
    controlType: 'color',
    defaultLight: '#c9cdd4',
    defaultDark: '#404040',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--bg-5',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.bg5',
    description: 'Sixth-level background shade.',
    affectsScenes: ['settings'],
    affectsSelectors: ['.bg-5'],
    controlType: 'color',
    defaultLight: '#adb4c1',
    defaultDark: '#4d4d4d',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--bg-6',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.bg6',
    description: 'Deep background shade. Also used for disabled/secondary text in some contexts.',
    affectsScenes: ['settings'],
    affectsSelectors: ['.bg-6'],
    controlType: 'color',
    defaultLight: '#86909c',
    defaultDark: '#5a5a5a',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--bg-8',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.bg8',
    description: 'Near-dark background shade.',
    affectsScenes: [],
    affectsSelectors: ['.bg-8'],
    controlType: 'color',
    defaultLight: '#4e5969',
    defaultDark: '#737373',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--bg-9',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.bg9',
    description: 'Very dark background shade.',
    affectsScenes: [],
    affectsSelectors: ['.bg-9'],
    controlType: 'color',
    defaultLight: '#1d2129',
    defaultDark: '#a6a6a6',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--bg-10',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.bg10',
    description: 'Darkest background shade.',
    affectsScenes: [],
    affectsSelectors: ['.bg-10'],
    controlType: 'color',
    defaultLight: '#0c0e12',
    defaultDark: '#d9d9d9',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--bg-hover',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.bgHover',
    description: 'Background color for hover states. Applied to list items, menu items, and interactive elements on mouse-over.',
    affectsScenes: ['sidebar', 'settings'],
    affectsSelectors: ['.arco-menu-item:hover', '.arco-list-item:hover'],
    controlType: 'linkedColorPair',
    defaultLight: '#f3f4f6',
    defaultDark: '#1f1f1f',
    suggestedRange: {
      designNote: 'Should be between --bg-1 and --bg-2 in lightness for subtle feedback',
    },
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--bg-active',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.bgActive',
    description: 'Background color for active/pressed states.',
    affectsScenes: ['sidebar', 'settings'],
    affectsSelectors: ['.arco-menu-item:active', '.arco-list-item:active'],
    controlType: 'linkedColorPair',
    defaultLight: '#e5e6eb',
    defaultDark: '#2d2d2d',
    suggestedRange: {
      designNote: 'Should be slightly darker than --bg-hover for clear press feedback',
    },
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--fill',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.fill',
    description: 'General fill color for component backgrounds (similar to --bg-1).',
    affectsScenes: ['settings'],
    affectsSelectors: ['.arco-card', '.arco-collapse-item'],
    controlType: 'color',
    defaultLight: '#f7f8fa',
    defaultDark: '#1a1a1a',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--fill-0',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.fill0',
    description: 'Fill color variant 0. Pure white in light mode, semi-transparent white in dark mode.',
    affectsScenes: ['settings'],
    affectsSelectors: ['.arco-input-inner-wrapper'],
    controlType: 'colorWithAlpha',
    defaultLight: '#ffffff',
    defaultDark: 'rgba(255, 255, 255, 0.08)',
    darkSyncRule: { strategy: 'manual' },
  },
  {
    key: '--fill-white-to-black',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.fillWhiteToBlack',
    description: 'White in light mode, black in dark mode. Used for absolute contrast elements.',
    affectsScenes: ['chat'],
    affectsSelectors: [],
    controlType: 'color',
    defaultLight: '#ffffff',
    defaultDark: '#000000',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--inverse',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.inverse',
    description: 'Inverse background color. White in both modes — used for elements that must always be white.',
    affectsScenes: [],
    affectsSelectors: [],
    controlType: 'color',
    defaultLight: '#ffffff',
    defaultDark: '#ffffff',
    darkSyncRule: { strategy: 'manual' },
  },
  {
    key: '--dialog-fill-0',
    group: 'backgrounds',
    labelKey: 'settings.themeDesigner.var.dialogFill0',
    description: 'Background fill for modal dialogs and popups.',
    affectsScenes: ['settings'],
    affectsSelectors: ['.arco-modal-body', '.arco-popover-content'],
    controlType: 'color',
    defaultLight: '#ffffff',
    defaultDark: '#333333',
    darkSyncRule: { strategy: 'invertLightness' },
  },

  // =========================================================================
  // GROUP 4: Text
  // =========================================================================
  {
    key: '--text-primary',
    group: 'text',
    labelKey: 'settings.themeDesigner.var.textPrimary',
    description: 'Primary text color. Used for headings, body text, and the most important content. Must have strong contrast against backgrounds.',
    affectsScenes: ['chat', 'sidebar', 'settings', 'workspace'],
    affectsSelectors: ['body', 'p', 'h1', 'h2', 'h3', '.arco-typography'],
    controlType: 'color',
    defaultLight: '#1d2129',
    defaultDark: '#e5e5e5',
    suggestedRange: {
      a11yNote: 'WCAG AA requires 4.5:1 contrast ratio against --bg-base for normal text',
    },
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--text-secondary',
    group: 'text',
    labelKey: 'settings.themeDesigner.var.textSecondary',
    description: 'Secondary text color. Used for descriptions, timestamps, labels, and less prominent content.',
    affectsScenes: ['chat', 'sidebar', 'settings'],
    affectsSelectors: ['.text-t-secondary', '.arco-form-label-item'],
    controlType: 'color',
    defaultLight: '#86909c',
    defaultDark: '#a6a6a6',
    suggestedRange: {
      a11yNote: 'WCAG AA requires 3:1 contrast ratio for large text',
    },
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--text-disabled',
    group: 'text',
    labelKey: 'settings.themeDesigner.var.textDisabled',
    description: 'Disabled text color. Used for inactive controls and placeholder text.',
    affectsScenes: ['settings'],
    affectsSelectors: ['.arco-btn-disabled', '.arco-input-disabled'],
    controlType: 'color',
    defaultLight: '#c9cdd4',
    defaultDark: '#737373',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--text-0',
    group: 'text',
    labelKey: 'settings.themeDesigner.var.text0',
    description: 'Absolute black text in light mode, white in dark mode. Maximum contrast text.',
    affectsScenes: ['chat'],
    affectsSelectors: [],
    controlType: 'color',
    defaultLight: '#000000',
    defaultDark: '#ffffff',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--text-white',
    group: 'text',
    labelKey: 'settings.themeDesigner.var.textWhite',
    description: 'Always-white text. Used on primary buttons and dark overlays.',
    affectsScenes: ['chat', 'sidebar'],
    affectsSelectors: ['.arco-btn-primary'],
    controlType: 'color',
    defaultLight: '#ffffff',
    defaultDark: '#ffffff',
    darkSyncRule: { strategy: 'manual' },
  },

  // =========================================================================
  // GROUP 5: Messages & Components
  // =========================================================================
  {
    key: '--message-user-bg',
    group: 'messages',
    labelKey: 'settings.themeDesigner.var.messageUserBg',
    description: 'Background color for user chat message bubbles. This is one of the most visible UI elements.',
    affectsScenes: ['chat'],
    affectsSelectors: ['.message-item.user .message-bubble', '[class*="message"][class*="user"] .message-content'],
    controlType: 'color',
    supportsGradient: true,
    defaultLight: '#e9efff',
    defaultDark: '#1e2a3a',
    suggestedRange: {
      designNote: 'Should be a tinted version of --primary for visual connection to the brand',
    },
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--message-tips-bg',
    group: 'messages',
    labelKey: 'settings.themeDesigner.var.messageTipsBg',
    description: 'Background color for system tips and notification messages in the chat.',
    affectsScenes: ['chat'],
    affectsSelectors: ['.message-tips'],
    controlType: 'color',
    defaultLight: '#f0f4ff',
    defaultDark: '#1a2333',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--workspace-btn-bg',
    group: 'messages',
    labelKey: 'settings.themeDesigner.var.workspaceBtnBg',
    description: 'Background color for workspace action buttons in the chat interface.',
    affectsScenes: ['chat', 'workspace'],
    affectsSelectors: ['.workspace-btn'],
    controlType: 'color',
    defaultLight: '#eff0f1',
    defaultDark: '#1f1f1f',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--color-guid-agent-bar',
    group: 'messages',
    labelKey: 'settings.themeDesigner.var.guidAgentBar',
    description: 'Background color for the agent selector bar on the home/guide page.',
    affectsScenes: ['chat'],
    affectsSelectors: ['.guidAgentBar'],
    controlType: 'color',
    defaultLight: '#eaecf7',
    defaultDark: 'var(--aou-2)',
    darkSyncRule: { strategy: 'invertLightness' },
  },

  // =========================================================================
  // GROUP 6: Borders
  // =========================================================================
  {
    key: '--border-base',
    group: 'borders',
    labelKey: 'settings.themeDesigner.var.borderBase',
    description: 'Standard border color. Used for card edges, input outlines, and dividers.',
    affectsScenes: ['chat', 'sidebar', 'settings', 'workspace'],
    affectsSelectors: ['.arco-card', '.arco-input', '.arco-divider'],
    controlType: 'color',
    defaultLight: '#e5e6eb',
    defaultDark: '#333333',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--border-light',
    group: 'borders',
    labelKey: 'settings.themeDesigner.var.borderLight',
    description: 'Light/subtle border color. Used for less prominent separators.',
    affectsScenes: ['settings'],
    affectsSelectors: ['.arco-collapse-item'],
    controlType: 'color',
    defaultLight: '#f2f3f5',
    defaultDark: '#262626',
    darkSyncRule: { strategy: 'invertLightness' },
  },
  {
    key: '--border-special',
    group: 'borders',
    labelKey: 'settings.themeDesigner.var.borderSpecial',
    description: 'Special-purpose border color for accent borders and highlighted areas.',
    affectsScenes: ['chat'],
    affectsSelectors: [],
    controlType: 'color',
    defaultLight: 'var(--bg-3)',
    defaultDark: '#60677e',
    darkSyncRule: { strategy: 'manual' },
  },

  // =========================================================================
  // GROUP 7: Semantic Colors
  // =========================================================================
  {
    key: '--success',
    group: 'semantic',
    labelKey: 'settings.themeDesigner.var.success',
    description: 'Success state color. Used for success messages, completed status, and positive actions.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.arco-alert-success', '.arco-tag-green', '.arco-badge-success'],
    controlType: 'color',
    defaultLight: '#00b42a',
    defaultDark: '#23c343',
    darkSyncRule: { strategy: 'shiftLightness', params: { lightnessShift: 10, saturationShift: -5 } },
  },
  {
    key: '--warning',
    group: 'semantic',
    labelKey: 'settings.themeDesigner.var.warning',
    description: 'Warning state color. Used for caution messages and attention-requiring elements.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.arco-alert-warning', '.arco-tag-orange'],
    controlType: 'color',
    defaultLight: '#ff7d00',
    defaultDark: '#ff9a2e',
    darkSyncRule: { strategy: 'shiftLightness', params: { lightnessShift: 10, saturationShift: -5 } },
  },
  {
    key: '--danger',
    group: 'semantic',
    labelKey: 'settings.themeDesigner.var.danger',
    description: 'Danger/error state color. Used for error messages, destructive actions, and critical alerts.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.arco-alert-error', '.arco-tag-red', '.arco-btn-status-danger'],
    controlType: 'color',
    defaultLight: '#f53f3f',
    defaultDark: '#f76560',
    darkSyncRule: { strategy: 'shiftLightness', params: { lightnessShift: 10, saturationShift: -5 } },
  },
  {
    key: '--info',
    group: 'semantic',
    labelKey: 'settings.themeDesigner.var.info',
    description: 'Info state color. Used for informational messages and neutral status indicators.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.arco-alert-info', '.arco-tag-arcoblue'],
    controlType: 'color',
    defaultLight: '#165dff',
    defaultDark: '#4d9fff',
    darkSyncRule: { strategy: 'shiftLightness', params: { lightnessShift: 15, saturationShift: -10 } },
  },

  // =========================================================================
  // GROUP 8: Shape & Radius (new --theme-* variables)
  // =========================================================================
  {
    key: '--border-radius-small',
    group: 'shape',
    labelKey: 'settings.themeDesigner.var.radiusSmall',
    description: 'Small border radius used by Arco Design for compact components (mini buttons, tags). Affects 163+ Arco components.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.arco-btn-size-mini', '.arco-tag'],
    controlType: 'slider',
    range: { min: 0, max: 12, step: 1, unit: 'px' },
    defaultLight: '2px',
    defaultDark: '2px',
    suggestedRange: { min: '0', max: '8px', designNote: 'Arco default is 2px. Values over 8px may look odd on small components.' },
  },
  {
    key: '--border-radius-medium',
    group: 'shape',
    labelKey: 'settings.themeDesigner.var.radiusMedium',
    description: 'Medium border radius. Default for most Arco components (buttons, inputs, cards).',
    affectsScenes: ['chat', 'sidebar', 'settings'],
    affectsSelectors: ['.arco-btn', '.arco-input', '.arco-card'],
    controlType: 'slider',
    range: { min: 0, max: 16, step: 1, unit: 'px' },
    defaultLight: '4px',
    defaultDark: '4px',
    suggestedRange: { min: '0', max: '16px', designNote: 'This is the most impactful radius variable. 0=sharp, 4=default, 12-16=modern rounded.' },
  },
  {
    key: '--border-radius-large',
    group: 'shape',
    labelKey: 'settings.themeDesigner.var.radiusLarge',
    description: 'Large border radius for prominent UI elements.',
    affectsScenes: ['settings'],
    affectsSelectors: ['.arco-modal', '.arco-drawer'],
    controlType: 'slider',
    range: { min: 0, max: 24, step: 1, unit: 'px' },
    defaultLight: '8px',
    defaultDark: '8px',
    suggestedRange: { min: '0', max: '24px' },
  },
  {
    key: '--theme-border-radius-bubble-user',
    group: 'shape',
    labelKey: 'settings.themeDesigner.var.radiusBubbleUser',
    description: 'Border radius for user chat message bubbles. Typically asymmetric: rounded on 3 corners with a small radius on the bottom-right to indicate speech direction.',
    affectsScenes: ['chat'],
    affectsSelectors: ['.message-item.user .message-bubble', '[class*="message"][class*="user"] .message-content'],
    controlType: 'dropdown',
    range: { min: 0, max: 24, step: 1, unit: 'px' },
    defaultLight: '12px 12px 4px 12px',
    defaultDark: '12px 12px 4px 12px',
    suggestedRange: {
      values: ['4px', '12px 12px 4px 12px', '16px 16px 4px 16px', '20px 20px 4px 20px'],
      designNote: 'Asymmetric values create speech-bubble shape. Format: top-left top-right bottom-right bottom-left.',
    },
  },
  {
    key: '--theme-border-radius-bubble-ai',
    group: 'shape',
    labelKey: 'settings.themeDesigner.var.radiusBubbleAi',
    description: 'Border radius for AI response message bubbles. Mirror of user bubble — small radius on bottom-left.',
    affectsScenes: ['chat'],
    affectsSelectors: ['.message-item.ai .message-bubble', '[class*="message"][class*="ai"] .message-content'],
    controlType: 'dropdown',
    range: { min: 0, max: 24, step: 1, unit: 'px' },
    defaultLight: '12px 12px 12px 4px',
    defaultDark: '12px 12px 12px 4px',
    suggestedRange: {
      values: ['4px', '12px 12px 12px 4px', '16px 16px 16px 4px', '20px 20px 20px 4px'],
      designNote: 'Should mirror --theme-border-radius-bubble-user but with the small corner on the opposite side.',
    },
  },
  {
    key: '--theme-border-radius-input',
    group: 'shape',
    labelKey: 'settings.themeDesigner.var.radiusInput',
    description: 'Border radius for the main chat input/sendbox container.',
    affectsScenes: ['chat'],
    affectsSelectors: ['.sendbox-container', '.guidInputCard', '[class*="sendbox"]'],
    controlType: 'slider',
    range: { min: 0, max: 24, step: 1, unit: 'px' },
    defaultLight: '8px',
    defaultDark: '8px',
    suggestedRange: { values: ['4px', '8px', '16px', '20px', '24px'] },
  },
  {
    key: '--theme-border-radius-button',
    group: 'shape',
    labelKey: 'settings.themeDesigner.var.radiusButton',
    description: 'Border radius for primary and secondary action buttons.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.arco-btn-primary', '.arco-btn-secondary', 'button[type="primary"]'],
    controlType: 'slider',
    range: { min: 0, max: 24, step: 1, unit: 'px' },
    defaultLight: '8px',
    defaultDark: '8px',
    suggestedRange: { values: ['4px', '8px', '12px', '20px'] },
  },
  {
    key: '--theme-border-radius-tooltip',
    group: 'shape',
    labelKey: 'settings.themeDesigner.var.radiusTooltip',
    description: 'Border radius for tooltips and popovers.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.arco-tooltip-inner', '.arco-popover-inner', '.arco-popover-content'],
    controlType: 'slider',
    range: { min: 0, max: 16, step: 1, unit: 'px' },
    defaultLight: '8px',
    defaultDark: '8px',
    suggestedRange: { values: ['0', '4px', '8px'] },
  },

  // =========================================================================
  // GROUP 9: Typography & Motion (new --theme-* variables)
  // =========================================================================
  {
    key: '--theme-font-family',
    group: 'typography',
    labelKey: 'settings.themeDesigner.var.fontFamily',
    description: 'Global font family stack. Changes the entire app typography. Include fallback fonts for cross-platform support.',
    affectsScenes: ['chat', 'sidebar', 'settings', 'workspace'],
    affectsSelectors: ['body'],
    controlType: 'dropdown',
    options: [
      { value: 'Inter, -apple-system, BlinkMacSystemFont, PingFang SC, Hiragino Sans GB, noto sans, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif', label: 'System Default (Inter)' },
      { value: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif', label: 'SF Pro Display' },
      { value: '"Varela Round", "Nunito", "PingFang SC", "Microsoft YaHei", sans-serif', label: 'Varela Round (Rounded)' },
      { value: '"MS Sans Serif", "Tahoma", "Arial", "Microsoft YaHei", sans-serif', label: 'MS Sans Serif (Classic)' },
      { value: '"JetBrains Mono", "Fira Code", "Consolas", monospace', label: 'JetBrains Mono (Monospace)' },
      { value: '"Georgia", "Times New Roman", "PingFang SC", serif', label: 'Georgia (Serif)' },
    ],
    defaultLight: 'Inter, -apple-system, BlinkMacSystemFont, PingFang SC, Hiragino Sans GB, noto sans, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif',
    defaultDark: 'Inter, -apple-system, BlinkMacSystemFont, PingFang SC, Hiragino Sans GB, noto sans, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif',
  },
  {
    key: '--theme-transition-duration',
    group: 'typography',
    labelKey: 'settings.themeDesigner.var.transitionDuration',
    description: 'Global transition duration for hover/active state animations. Lower = snappier, higher = smoother.',
    affectsScenes: ['chat', 'sidebar', 'settings'],
    affectsSelectors: ['.arco-btn', 'a', '[class*="sendbox"]', '.layout-sider svg'],
    controlType: 'slider',
    range: { min: 0, max: 1, step: 0.05, unit: 's' },
    defaultLight: '0.2s',
    defaultDark: '0.2s',
    suggestedRange: { min: '0s', max: '0.5s', designNote: '0.2s = snappy, 0.3s = smooth. Above 0.5s feels sluggish.' },
  },
  {
    key: '--theme-transition-timing',
    group: 'typography',
    labelKey: 'settings.themeDesigner.var.transitionTiming',
    description: 'Timing function for transitions. Controls acceleration curve of animations.',
    affectsScenes: ['chat', 'sidebar', 'settings'],
    affectsSelectors: ['.arco-btn', 'a', '[class*="sendbox"]'],
    controlType: 'dropdown',
    options: [
      { value: 'ease', label: 'Ease (default)' },
      { value: 'ease-in-out', label: 'Ease In-Out (symmetric)' },
      { value: 'ease-out', label: 'Ease Out (decelerate)' },
      { value: 'linear', label: 'Linear (constant)' },
      { value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: 'Bounce (playful)' },
    ],
    defaultLight: 'ease',
    defaultDark: 'ease',
  },
  {
    key: '--theme-button-font-weight',
    group: 'typography',
    labelKey: 'settings.themeDesigner.var.buttonFontWeight',
    description: 'Font weight for primary and secondary buttons.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.arco-btn-primary', '.arco-btn-secondary'],
    controlType: 'dropdown',
    options: [
      { value: 'normal', label: 'Normal (400)' },
      { value: '500', label: 'Medium (500)' },
      { value: '600', label: 'Semi-Bold (600)' },
      { value: '700', label: 'Bold (700)' },
    ],
    defaultLight: '500',
    defaultDark: '500',
  },
  {
    key: '--theme-scrollbar-width',
    group: 'typography',
    labelKey: 'settings.themeDesigner.var.scrollbarWidth',
    description: 'Width (and height) of custom scrollbars.',
    affectsScenes: ['chat', 'sidebar', 'settings'],
    affectsSelectors: ['::-webkit-scrollbar'],
    controlType: 'slider',
    range: { min: 4, max: 16, step: 1, unit: 'px' },
    defaultLight: '8px',
    defaultDark: '8px',
    suggestedRange: { values: ['4px', '8px', '12px', '16px'], designNote: '8px is standard. 16px for classic/retro look.' },
  },
  {
    key: '--theme-scrollbar-radius',
    group: 'typography',
    labelKey: 'settings.themeDesigner.var.scrollbarRadius',
    description: 'Border radius for scrollbar thumb. 0 = square, 4px = slightly rounded.',
    affectsScenes: ['chat', 'sidebar', 'settings'],
    affectsSelectors: ['::-webkit-scrollbar-thumb'],
    controlType: 'slider',
    range: { min: 0, max: 8, step: 1, unit: 'px' },
    defaultLight: '4px',
    defaultDark: '4px',
    suggestedRange: { values: ['0', '2px', '4px'], designNote: '0 for sharp classic look, 4px for modern rounded.' },
  },

  // =========================================================================
  // GROUP 10: Advanced Effects (new --theme-* variables)
  // =========================================================================
  {
    key: '--theme-backdrop-blur',
    group: 'effects',
    labelKey: 'settings.themeDesigner.var.backdropBlur',
    description: 'Backdrop blur intensity for frosted-glass effects on sendbox, modals, and overlays. 0 = no blur (opaque), higher values = more frosted glass.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.guidInputCard', '.sendbox-container', '.arco-modal-body'],
    controlType: 'slider',
    range: { min: 0, max: 20, step: 1, unit: 'px' },
    defaultLight: '0px',
    defaultDark: '0px',
    suggestedRange: { min: '0', max: '20px', designNote: '4px=subtle, 8px=moderate, 12px=strong, 20px=heavy frosted glass.' },
  },
  {
    key: '--theme-button-hover-lift',
    group: 'effects',
    labelKey: 'settings.themeDesigner.var.buttonHoverLift',
    description: 'Vertical lift distance on button hover. Creates a "floating" effect. 0 = no lift (flat), -2px = slight lift.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.arco-btn-primary:hover'],
    controlType: 'slider',
    range: { min: 0, max: 4, step: 0.5, unit: 'px' },
    defaultLight: '0px',
    defaultDark: '0px',
    suggestedRange: { values: ['0', '1px', '2px', '3px'], designNote: '0=static, 2px=typical modern hover lift.' },
  },
  {
    key: '--theme-icon-hover-scale',
    group: 'effects',
    labelKey: 'settings.themeDesigner.var.iconHoverScale',
    description: 'Scale factor for icon hover animation. 1 = no scale, 1.1 = slight zoom.',
    affectsScenes: ['chat', 'sidebar'],
    affectsSelectors: ['svg:hover', '.arco-icon:hover'],
    controlType: 'slider',
    range: { min: 1, max: 1.3, step: 0.05, unit: '' },
    defaultLight: '1',
    defaultDark: '1',
    suggestedRange: { min: '1', max: '1.2', designNote: '1=static, 1.1=typical, above 1.2 feels exaggerated.' },
  },
  {
    key: '--theme-shadow-sm',
    group: 'effects',
    labelKey: 'settings.themeDesigner.var.shadowSm',
    description: 'Small shadow preset. Applied to cards, list items, and subtle elevation elements.',
    affectsScenes: ['chat', 'sidebar', 'settings'],
    affectsSelectors: ['.arco-card', '.layout-sider-header'],
    controlType: 'shadowPreset',
    defaultLight: '0 2px 8px rgba(0, 0, 0, 0.08)',
    defaultDark: '0 2px 8px rgba(0, 0, 0, 0.24)',
  },
  {
    key: '--theme-shadow-md',
    group: 'effects',
    labelKey: 'settings.themeDesigner.var.shadowMd',
    description: 'Medium shadow preset. Applied to popovers, dropdowns, and floating panels.',
    affectsScenes: ['chat', 'settings'],
    affectsSelectors: ['.arco-popover', '.arco-dropdown', '.sendbox-container'],
    controlType: 'shadowPreset',
    defaultLight: '0 4px 16px rgba(0, 0, 0, 0.12)',
    defaultDark: '0 4px 16px rgba(0, 0, 0, 0.32)',
  },
  {
    key: '--theme-shadow-lg',
    group: 'effects',
    labelKey: 'settings.themeDesigner.var.shadowLg',
    description: 'Large shadow preset. Applied to modals, drawers, and high-elevation overlays.',
    affectsScenes: ['settings'],
    affectsSelectors: ['.arco-modal', '.arco-drawer'],
    controlType: 'shadowPreset',
    defaultLight: '0 8px 32px rgba(0, 0, 0, 0.16)',
    defaultDark: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  {
    key: '--theme-shadow-glow',
    group: 'effects',
    labelKey: 'settings.themeDesigner.var.shadowGlow',
    description: 'Glow shadow — used for neon/accent glow effects. Default is none.',
    affectsScenes: ['chat'],
    affectsSelectors: ['.arco-btn-primary:hover', '.sendbox-container:focus-within'],
    controlType: 'shadowPreset',
    defaultLight: 'none',
    defaultDark: 'none',
    suggestedRange: {
      designNote: 'Set to colored rgba values for neon glow, e.g. "0 0 12px rgba(96, 165, 250, 0.6)"',
    },
  },
  {
    key: '--theme-gradient-primary',
    group: 'effects',
    labelKey: 'settings.themeDesigner.var.gradientPrimary',
    description: 'Primary gradient used for button backgrounds, sidebar headers, and accent areas. Set to "none" for solid colors.',
    affectsScenes: ['chat', 'sidebar'],
    affectsSelectors: ['.arco-btn-primary', '.layout-sider-header'],
    controlType: 'gradient',
    defaultLight: 'none',
    defaultDark: 'none',
    suggestedRange: {
      values: [
        'none',
        'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      ],
    },
  },
  {
    key: '--theme-gradient-primary-hover',
    group: 'effects',
    labelKey: 'settings.themeDesigner.var.gradientPrimaryHover',
    description: 'Hover state variant of the primary gradient.',
    affectsScenes: ['chat', 'sidebar'],
    affectsSelectors: ['.arco-btn-primary:hover', '.layout-sider-header:hover'],
    controlType: 'gradient',
    defaultLight: 'none',
    defaultDark: 'none',
  },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Get all variables belonging to a specific group */
export const getVariablesByGroup = (group: ThemeGroup): ThemeVariable[] =>
  THEME_VARIABLE_MAP.filter((v) => v.group === group);

/** Get all variables that affect a specific preview scene */
export const getVariablesByScene = (scene: PreviewScene): ThemeVariable[] =>
  THEME_VARIABLE_MAP.filter((v) => v.affectsScenes.includes(scene));

/** Get a variable definition by its CSS key */
export const getVariableByKey = (key: string): ThemeVariable | undefined =>
  THEME_VARIABLE_MAP.find((v) => v.key === key);

/** Get default values for all variables as a Record (for initializing editor state) */
export const getDefaultValues = (mode: 'light' | 'dark'): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const v of THEME_VARIABLE_MAP) {
    if (process.env.NODE_ENV !== 'production' && v.key in result) {
      console.warn(`[themeVariableMap] Duplicate key detected: ${v.key}`);
    }
    result[v.key] = mode === 'light' ? v.defaultLight : v.defaultDark;
  }
  return result;
};
