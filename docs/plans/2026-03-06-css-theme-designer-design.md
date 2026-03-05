# CSS Theme Designer — Design Document

> AionUI "Character Creator" style visual theme editor

**Date:** 2026-03-06
**Status:** Draft — Pending team review
**Author:** taekchef + Claude Opus 4.6

---

## 1. Overview

### What

A visual theme editor integrated into Settings → Display, allowing users to customize AionUI's appearance through intuitive controls (color pickers, sliders, preset cards) — like a game character creator for UI themes.

### Why

- Current theme editing requires writing raw CSS in a 600px modal (CssThemeModal)
- Users who want to customize their theme need CSS knowledge
- The gap between "pick a preset" and "write CSS" is too large
- AI Skills generating themes lack a structured variable map to reference

### Goals

1. Enable non-technical users to create custom themes via visual controls
2. Preserve full CSS editing power for advanced users
3. Provide structured variable documentation for AI Skill integration
4. Produce a draft mapping table that can serve as foundation for design team's style specifications

### Non-Goals

- Theme marketplace / sharing (handled by plugin store team)
- Mobile responsive editor (desktop-first for this PR)

---

## 2. Page Layout

### Entry Point

From Settings → Display page, clicking "Edit" on a theme card or "Add New" opens the Theme Designer, replacing the current CssThemeModal.

### Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│  Toolbar                                                      │
│  [Theme Name Input]  [Import CSS] [Export] [🔗 Sync] [Save]  │
├──────────────────────────────┬───────────────────────────────┤
│  Control Panel (30%)          │  UI Preview (70%)             │
│                              │                               │
│  [🎨 Visual] [</> Code] Tab  │  Simulated AionUI interface   │
│                              │  Click any area → links to    │
│  Scrollable control groups   │  corresponding control group  │
│                              │                               │
│  [◀ Collapse]                │                               │
├──────────────────────────────┴───────────────────────────────┤
│  [☀ Light / 🌙 Dark toggle]     [Current group: Messages]    │
└──────────────────────────────────────────────────────────────┘
```

### Key Layout Behaviors

- **Control panel width:** 30% of viewport, collapsible
- **Preview width:** 70% (expands to ~100% when panel collapsed)
- **Collapsed state:** Thin strip with expand button on left edge
- **Click preview area → auto-expand panel** and scroll to relevant control group
- **Tab switch:** Visual controls ↔ Full CodeMirror CSS editor (each can take the full panel width)

---

## 3. Control Panel Design

### 3.1 Control Groups (10 Groups)

| # | Group | CSS Variables / Properties Covered |
|---|-------|-----------------------------------|
| 1 | **Global Tone** | `--primary`, `--brand`, `--brand-light`, `--brand-hover`, `--color-primary-*` |
| 2 | **AOU Palette** | `--aou-1` ~ `--aou-10` (10-shade system) |
| 3 | **Backgrounds** | `--bg-base`, `--bg-1` ~ `--bg-10`, `--bg-hover`, `--bg-active`, `--fill`, `--fill-0`, `--fill-white-to-black`, `--inverse`, `--dialog-fill-0` |
| 4 | **Text** | `--text-primary`, `--text-secondary`, `--text-disabled`, `--text-0`, `--text-white`, `--color-text-1` ~ `--color-text-4` |
| 5 | **Messages & Components** | `--message-user-bg`, `--message-tips-bg`, `--workspace-btn-bg`, `--color-guid-agent-bar` |
| 6 | **Borders** | `--border-base`, `--border-light`, `--border-special`, `--color-border-*` |
| 7 | **Semantic Colors** | `--success`, `--warning`, `--danger`, `--info` |
| 8 | **Shape & Radius** | `--border-radius-none/small/medium/large/circle` (Arco), `--theme-border-radius-bubble-user/ai`, `--theme-border-radius-input`, `--theme-border-radius-button`, `--theme-border-radius-tooltip` (new) |
| 9 | **Typography & Motion** | `--theme-font-family`, `--theme-transition-duration`, `--theme-transition-timing`, `--theme-button-font-weight`, `--theme-scrollbar-width`, `--theme-scrollbar-radius` (new) |
| 10 | **Advanced Effects** | `--theme-backdrop-blur`, shadow presets, gradient backgrounds, texture overlays, background images (new) |

### 3.2 Progressive Complexity (3 Layers)

Each control has up to three interaction layers:

**Layer 1 — Simple (default visible):**
```
User Bubble  [■ #e9efff]  ━━━━●━━━ Lightness
```
A color swatch + single slider. One-glance understanding, one-drag adjustment.

**Layer 2 — Detailed (click to expand):**
```
User Bubble  [■ #e9efff]  ━━━━●━━━ Lightness     [▸ Expand]

  ┌──────────┐  H: 220° [━━━]
  │  Color    │  S: 85%  [━━━]
  │  Wheel ●  │  L: 62%  [━━━]
  └──────────┘  A: 100% [━━━]

  HEX: #e9efff  RGB: 233,239,255
  [Gradient Mode ▸]  [Copy] [Paste]
```
Full color picker with HSL/A parameters, hex/rgb input, copy/paste.

**Layer 3 — Advanced (click "Gradient Mode"):**
```
User Bubble · Gradient
  [■ #e9efff] → [■ #c4d7ff]
  Angle: 135°  [━━━━━●━━━━━━━]
  Type: [linear ▾]
  [Preview bar: ▓▓▓▓▓▒▒▒▒▒░░░░░]
```

### 3.3 Control Types by Property

| Property Type | Control Form | Examples |
|---------------|-------------|----------|
| Single color | Color swatch + lightness slider → color wheel | `--primary`, `--brand` |
| Color scale (10-shade) | **Gradient strip** — pick endpoints, auto-interpolate middle values | `--aou-1` ~ `--aou-10` |
| Color with alpha | Color swatch + opacity slider | `--fill-0` (rgba values) |
| Linked color pair | Base color + auto-derived hover/active with adjustable offset | `--bg-hover`/`--bg-active` |
| Border radius | Slider (0-24px) with numeric input | `--theme-border-radius-*` |
| Blur intensity | Slider (0-20px) | `--theme-backdrop-blur` |
| Duration | Slider (0-1s) | `--theme-transition-duration` |
| Font family | Dropdown with preview | `--theme-font-family` |
| Font weight | Dropdown (normal/500/600/700) | `--theme-button-font-weight` |
| Scrollbar | Width slider + radius slider | `--theme-scrollbar-width/radius` |
| Shadow style | **Preset cards + intensity slider + expandable params** (see Section 3.4) |
| Gradient | Start/end color + angle slider + type dropdown |
| Texture/Pattern | Preset grid + intensity slider + scale slider |
| Background image | Upload + position/size/attachment dropdowns |

### 3.4 Shadow Controls (Special Design)

Box-shadow spans three distinct visual philosophies across existing themes:
- **Soft diffuse** (Misaka, Hello Kitty): `0 4px 16px rgba(..., 0.15)`
- **3D inset/outset** (Retro Windows): `inset 1px 1px 0 rgba(...)`
- **Neon glow** (Hello Kitty dark): `0 0 8px rgba(..., 0.6)`

A single slider cannot express this. Design:

```
┌─ Shadow Style ──────────────────────────────────────┐
│  Presets: [Soft Float] [3D Classic] [Neon Glow] [None] │ ← style cards
│                                                       │
│  Intensity: ━━━━━━●━━━━━ (0-100%)                    │ ← one slider
│  [▸ Expand detailed parameters]                       │
│                                                       │
│  (Expanded)                                           │
│  Type:     [outset ▾]                                │
│  X offset: [━━●━━] 0px                               │
│  Y offset: [━━━●━] 4px                               │
│  Blur:     [━━━━●] 16px                              │
│  Spread:   [━●━━━] 0px                               │
│  Opacity:  [━━━●━] 15%                               │
└───────────────────────────────────────────────────────┘
```

Three-layer experience:
1. **Pick preset** — 1 second
2. **Adjust intensity** — 3 seconds
3. **Fine-tune parameters** — full control

---

## 4. Preset System

### 4.1 Three Levels of Presets

| Level | What it sets | Where it appears |
|-------|-------------|-----------------|
| **Global presets** | All variables + all effects = complete theme | Top of control panel, "🎨 Presets" button |
| **Area presets** | Variables within one group only | Top of each group card, horizontal scroll |
| **Effect presets** | Advanced effects only (gradient, texture, blur, shadow) | Within Advanced Effects group |

### 4.2 Global Presets

Accessed via toolbar button. Opens overlay:

```
┌─ Preset Themes ─────────────────────────────────────────┐
│                                                          │
│  Color Schemes:                                          │
│  [Deep Blue] [Forest Green] [Warm Sun] [Rose Pink]       │
│  [Night Purple] [Monochrome]                             │
│                                                          │
│  Complete Themes:                                        │
│  [Default] [Misaka Mikoto] [Hello Kitty] [Retro Windows] │
│                                                          │
│  Advanced Effects:                                       │
│  [Aurora Gradient] [Cyber Neon] [Frosted Glass]          │
│  [Starfield] [Water Ripple] [Geometric Grid]             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**"Apply = Fill, then tweak"** — Selecting any preset fills all controls with its values. User can adjust any control afterwards. Presets are starting points, not locked states.

### 4.3 Area Presets (Per-Group)

Each control group card has a horizontal scroll strip at the top:

```
┌─ 📦 Messages & Components ──────────────────────────┐
│                                                      │
│  Presets: [Soft Blue] [Warm Orange] [Gradient Purple] │
│          [Frosted Glass] [Neon Border]                │
│                                                      │
│  ────────────────────────────────────────────────── │
│  User Bubble  [■]  ━━━━●━━━                         │
│  AI Bubble    [■]  ━━━━●━━━                         │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

Each preset card is ~48x32px showing a miniature visual preview of that style. Clicking fills only that group's controls.

**Design requirements for area presets:**
- 5-6 presets per group, visually distinct from each other
- Focus on quality and "wow factor" — these are what make users want to use the editor
- Each preset should feel like a coherent mini-design-system for that area

### 4.4 Area Preset Content (Per Group)

| Group | Preset Names (5-6 styles) | Key Differentiators |
|-------|--------------------------|---------------------|
| Global Tone | Cool Tide, Warm Earth, Neutral Gray, High Contrast, Pastel Soft, Monochrome | Hue family + saturation character |
| AOU Palette | Ocean Blue, Forest Green, Sunset, Berry, Slate, Custom (empty) | Endpoint colors for 10-shade interpolation |
| Backgrounds | Pure White, Layered Gray, Deep Immersive, Frosted Transparent, Gradient Flow | Lightness + transparency + gradient |
| Text | Classic B&W, Low Contrast Soft, High Contrast Sharp, Colored Accent, Warm Tone | Contrast ratio + color temperature |
| Messages | Soft Blue, Warm Orange, Gradient Purple, Frosted Glass, Neon Outline | Color + transparency + border style |
| Borders | Invisible, Hairline, Shadow Replace, Colored Line, Dashed | Width + style + visibility |
| Semantic | Classic RGYB, Macaron Pastel, Neon Glow, Earth Tone, Monochrome | Saturation + hue family |
| Shape & Radius | Round Modern (16px), Extra Round (24px), Sharp Classic (4px), Pill (999px), Mixed | radius values |
| Typography & Motion | System Default, Modern Sans, Rounded Friendly, Classic Serif, Mono Tech | font-family + weight + speed |
| Advanced Effects | Aurora Gradient, Cyber Neon, Frosted Glass, Starfield Texture, Water Ripple, Geometric Grid | Complex CSS combinations |

---

## 5. UI Preview

### 5.1 Implementation Strategy

Preview is a **pure CSS-variable-driven static HTML skeleton** — not real React component instances:

```tsx
<div
  className="theme-preview-root"
  style={{
    '--primary': editingVars.primary,
    '--bg-base': editingVars.bgBase,
    '--theme-border-radius-input': editingVars.inputRadius + 'px',
    // ... all editing variables
  }}
>
  <div className="preview-header" />
  <div className="preview-sidebar" />
  <div className="preview-chat">
    <div className="preview-bubble-user">Hello!</div>
    <div className="preview-bubble-ai">Hi there, how can I help?</div>
  </div>
  <div className="preview-sendbox" />
</div>
```

**Why this approach:**
- Zero JS overhead — changing a variable value is a CSS property change, native browser repaint
- No state logic, no API calls, no event handlers in preview
- CSS classes mirror real AionUI component classes for accuracy

### 5.2 Preview Scenes

Bottom tabs switch between 4 scenes:

| Scene | Renders | Shows |
|-------|---------|-------|
| **Chat View** | Header + chat messages (AI/User bubbles) + input box + send button | Core conversation experience |
| **Sidebar Expanded** | Left conversation list + center chat area | Sidebar colors, borders, list items |
| **Settings Page** | Form groups, toggles, inputs, dropdowns | Form control styling |
| **Workspace Panel** | Right-side file preview / code panel expanded | Panel backgrounds, borders |

### 5.3 Preview ↔ Control Linkage

**Control → Preview (forward):**
- When user expands a control group (e.g. "Messages"), the preview area highlights relevant elements with dashed outlines
- If the current scene doesn't contain the edited area, the corresponding scene tab gets a **dot indicator** (●) — "this scene shows what you're editing"
- **No auto-jump** between scenes to avoid disorientation

**Preview → Control (reverse):**
- Click any area in the preview (e.g. click a chat bubble)
- Control panel auto-expands (if collapsed) and scrolls to the corresponding group

---

## 6. Light/Dark Dual Sync Algorithm

### 6.1 User Interface

- Toolbar has a **[🔗 Link]** toggle, default OFF
- When ON: editing a color in either mode auto-computes the corresponding value for the other mode
- Each auto-synced value shows a **↺** marker — click to revert to pre-sync value
- User can turn off linking at any time to edit two sets independently

### 6.2 Sync Strategy (HSL Color Space)

| Variable Category | Light → Dark Rule | Dark → Light Rule |
|-------------------|-------------------|-------------------|
| Backgrounds (`--bg-*`) | Invert lightness: `L → 100 - L`, reduce saturation 10% | Same inverse |
| Text (`--text-*`) | Invert lightness | Same inverse |
| Accent/Semantic (`--primary`, `--success`, etc.) | Keep hue, lightness +15%, saturation -10% | Lightness -15%, saturation +10% |
| Borders (`--border-*`) | Follow background tier correspondence | Same inverse |
| Brand (`--brand`, `--brand-light`, `--brand-hover`) | Keep hue, adjust lightness proportionally | Same inverse |

**Core principle:** Operate in HSL space, not simple color inversion. This produces harmonious dark mode colors that maintain relative relationships.

### 6.3 Undo/Redo for Sync

Every sync operation pushes to the undo stack (see Section 8). Reverting a sync restores both the edited value and the auto-computed value.

---

## 7. CSS Code Mode

### 7.1 Tab Switch

Control panel header has two tabs: `[🎨 Visual]` `[</> Code]`

- **Visual tab:** Shows control groups with all visual controls
- **Code tab:** Full-width CodeMirror editor with CSS syntax highlighting, replaces the control groups area
- Switching tab preserves all state — changes in one mode reflect in the other

### 7.2 Bidirectional Sync Engine

**Visual → Code:**
- Control changes update a structured `editingTheme` state object
- A CSS generator produces the full theme CSS from this state
- CSS is written to the CodeMirror editor value

**Code → Visual:**
- CodeMirror `onChange` triggers CSS parsing (debounced 500ms)
- Parser extracts `:root` / `[data-theme='dark']` blocks
- Known CSS variables are matched to control values
- Selector-level overrides (e.g. `.arco-btn { border-radius: 16px }`) are parsed and mapped where possible
- Unrecognized CSS is preserved as "custom CSS" and not lost

**Conflict resolution:** Code mode is the source of truth. If user writes CSS that contradicts a control, the control updates to match the code.

### 7.3 CSS File Import

- **Toolbar:** `[Import CSS]` button opens file dialog (filters: `.css`)
- Reads file content via IPC (`ipcBridge.fs.readFile` or similar)
- Loaded CSS is set as the CodeMirror value, triggering Code → Visual sync
- Existing values are overwritten (with undo available)

### 7.4 Export

- **Toolbar:** `[Export]` button saves current theme CSS to a `.css` file
- Uses IPC save dialog

---

## 8. Undo/Redo

### 8.1 State History

```typescript
interface ThemeEditorState {
  variables: Record<string, string>;     // All CSS variable values
  customCss: string;                     // Non-variable CSS (selector overrides)
  mode: 'light' | 'dark';               // Which mode was being edited
}

interface HistoryStack {
  past: ThemeEditorState[];              // Undo stack
  present: ThemeEditorState;             // Current state
  future: ThemeEditorState[];            // Redo stack
}
```

### 8.2 Behaviors

- Every control change pushes current state to `past`
- **Undo:** Cmd/Ctrl+Z — pops from `past`, pushes current to `future`
- **Redo:** Cmd/Ctrl+Shift+Z — pops from `future`, pushes current to `past`
- Stack max depth: 50 states
- **Batch changes** (e.g. applying a preset fills 10+ values): treated as a single undo step

---

## 9. Save & Theme Management

### 9.1 Save Logic

**Editing a user theme:**
```
[Overwrite]  [Save as New Theme]
```

**Editing a preset theme (`isPreset: true`):**
```
[Save as New Theme]   ← Cannot overwrite built-in presets
```

**Creating a new theme:**
```
[Save]
```

### 9.2 Unsaved Changes Warning

If user has unsaved changes and tries to:
- Close the editor
- Switch to a different theme
- Navigate away from settings

Show confirmation dialog: "You have unsaved changes. Save before leaving?"
with `[Save]` `[Don't Save]` `[Cancel]`

### 9.3 Atomic Save

Reuse existing atomic save pattern from `CssThemeSettings/index.tsx`:

```typescript
await Promise.all([
  ConfigStorage.set('css.activeThemeId', themeId),
  ConfigStorage.set('customCss', css),
]);
// Dispatch event for immediate UI update
window.dispatchEvent(new CustomEvent('custom-css-updated', { detail: { customCss: css } }));
```

---

## 10. New CSS Variables (To Be Created)

Based on cross-theme analysis of Misaka Mikoto, Hello Kitty, and Retro Windows themes, these properties are customized by all 3 themes but currently lack CSS variables.

### 10.1 Tier 1 — High Priority (all themes customize, high value)

| Variable | Property | Default (Light) | Default (Dark) | Control Type |
|----------|----------|-----------------|----------------|-------------|
| `--theme-font-family` | Global font-family | `Inter, -apple-system, ...sans-serif` | (same) | Dropdown |
| `--theme-border-radius-bubble-user` | User message border-radius | `12px 12px 4px 12px` | (same) | Slider |
| `--theme-border-radius-bubble-ai` | AI message border-radius | `12px 12px 12px 4px` | (same) | Slider |
| `--theme-border-radius-input` | Input/sendbox border-radius | `8px` | (same) | Slider (0-24px) |
| `--theme-border-radius-button` | Button border-radius | `8px` | (same) | Slider (0-24px) |
| `--theme-border-radius-tooltip` | Tooltip/popover border-radius | `8px` | (same) | Slider (0-16px) |
| `--theme-backdrop-blur` | backdrop-filter blur | `0px` | `0px` | Slider (0-20px) |
| `--theme-transition-duration` | Transition duration | `0.2s` | (same) | Slider (0-1s) |
| `--theme-transition-timing` | Transition timing function | `ease` | (same) | Dropdown |
| `--theme-scrollbar-width` | Scrollbar width | `8px` | (same) | Slider (4-16px) |
| `--theme-scrollbar-radius` | Scrollbar thumb radius | `4px` | (same) | Slider (0-8px) |
| `--theme-button-font-weight` | Button font-weight | `500` | (same) | Dropdown |

### 10.2 Tier 2 — Medium Priority (2/3 themes, notable effect)

| Variable | Property | Default | Control Type |
|----------|----------|---------|-------------|
| `--theme-button-hover-lift` | Button hover translateY | `0px` | Slider (0-4px) |
| `--theme-icon-hover-scale` | Icon hover scale | `1` | Slider (1-1.2) |
| `--theme-gradient-primary` | Primary gradient | `none` | Gradient editor |
| `--theme-gradient-primary-hover` | Primary gradient hover | `none` | Gradient editor |

### 10.3 Shadow Variables (Preset-Driven)

Instead of individual shadow variables, provide preset packages:

```css
/* Soft Float (default) */
--theme-shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
--theme-shadow-md: 0 4px 16px rgba(0,0,0,0.12);
--theme-shadow-lg: 0 8px 32px rgba(0,0,0,0.16);
--theme-shadow-glow: none;

/* 3D Classic */
--theme-shadow-sm: inset 1px 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2);
--theme-shadow-md: inset 1px 1px 0 rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.3);
--theme-shadow-lg: inset 1px 1px 0 rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.4);
--theme-shadow-glow: none;

/* Neon Glow */
--theme-shadow-sm: 0 0 8px rgba(var(--primary-rgb), 0.3);
--theme-shadow-md: 0 0 16px rgba(var(--primary-rgb), 0.4);
--theme-shadow-lg: 0 0 24px rgba(var(--primary-rgb), 0.5);
--theme-shadow-glow: 0 0 8px rgba(var(--primary-rgb), 0.6);
```

### 10.4 Where to Define

**Option A (Recommended):** New file `src/renderer/styles/themes/theme-variables.css`
- Contains all new `--theme-*` variable definitions with defaults
- Imported in the theme system alongside `base.css` and `color-schemes/default.css`
- Clear separation from existing Arco variables

**Option B:** Add to existing `base.css`
- Simpler but mixes concerns

**Note:** This is a DRAFT. The `--theme-*` variables and their default values are suggestions. The frontend design team should review and may adjust naming conventions, default values, or decide which variables to adopt.

---

## 11. Theme Variable Map (`themeVariableMap.ts`)

### 11.1 Purpose

A TypeScript constant that serves three audiences:

1. **Theme Designer UI** — generates control groups and controls programmatically
2. **AI Skills** — provides semantic context for theme generation (what each variable means, what it affects, what values are reasonable)
3. **Design Specification** — draft reference for the frontend team to formalize

### 11.2 Data Structure

```typescript
/**
 * CSS Theme Variable Map
 *
 * Usage:
 *   1. Theme Designer editor — control rendering
 *   2. AI Skill theme generation — variable reference
 *   3. Design specification foundation (draft — suggestedRange
 *      fields are recommendations, design team may revise)
 *
 * Maintenance:
 *   - Update this file when adding new CSS variables
 *   - suggestedRange and designNote fields are suggestions,
 *     the design team can modify to form official specs
 */

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

export type PreviewScene =
  | 'chat'
  | 'sidebar'
  | 'settings'
  | 'workspace';

export type ControlType =
  | 'color'
  | 'colorScale'
  | 'slider'
  | 'dropdown'
  | 'toggle'
  | 'gradient'
  | 'shadowPreset'
  | 'texturePreset'
  | 'imageUpload';

export interface ThemeVariable {
  /** CSS variable name (e.g. '--primary') */
  key: string;

  /** Control group this belongs to */
  group: ThemeGroup;

  /** Display label (i18n key) */
  labelKey: string;

  /** Semantic description — what this controls and why it exists.
   *  Written for both humans and AI to understand. */
  description: string;

  /** Which preview scenes show this variable's effect */
  affectsScenes: PreviewScene[];

  /** CSS selectors that reference this variable (for AI context) */
  affectsSelectors: string[];

  /** Control type for the editor UI */
  controlType: ControlType;

  /** Whether this supports gradient mode in the detailed layer */
  supportsGradient?: boolean;

  /** Slider range (when controlType is 'slider') */
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

  /** Suggested value range (DRAFT — pending design team review) */
  suggestedRange?: {
    values?: string[];
    min?: string;
    max?: string;
    a11yNote?: string;
    designNote?: string;
  };

  /** Light/Dark sync rule for this variable */
  darkSyncRule?: {
    strategy: 'invertLightness' | 'shiftLightness' | 'keepHue' | 'manual';
    params?: Record<string, number>;
  };
}

export const THEME_VARIABLE_MAP: ThemeVariable[] = [
  // ... Full variable definitions (see implementation phase)
];
```

### 11.3 Scope

The map will cover:
- All existing CSS variables from `default.css` (~40+ color variables)
- All new `--theme-*` variables defined in Section 10 (~15 non-color variables)
- Arco Design's `--border-radius-*` variables (5)
- Total: approximately **60-70 entries**

---

## 12. Implementation Plan

### Phase 1 — Foundation

- [ ] Create `themeVariableMap.ts` with all variable definitions
- [ ] Create `theme-variables.css` with new `--theme-*` variable defaults
- [ ] Define shadow preset packages (Soft Float, 3D Classic, Neon Glow, None)
- [ ] Set up i18n keys for all control labels (all 5 languages)

### Phase 2 — Core Components

- [ ] Build preview component: 4 scene skeletons with CSS variable binding
- [ ] Build control panel: 10 group cards with collapse/expand
- [ ] Build progressive controls: color picker (3 layers), slider, dropdown
- [ ] Build area preset strip (horizontal scroll cards per group)
- [ ] Implement control ↔ preview linkage (highlight + reverse click)

### Phase 3 — Core Logic

- [ ] Build CSS ↔ visual bidirectional sync engine
- [ ] Build light/dark dual sync algorithm (HSL-based)
- [ ] Build undo/redo state history (max 50 states, Cmd+Z/Shift+Z)
- [ ] Build CSS file import/export

### Phase 4 — Effects & Presets

- [ ] Design and implement all global presets (6 color schemes)
- [ ] Design and implement all area presets (5-6 per group × 10 groups)
- [ ] Design and implement advanced effect presets (6 effects with quality CSS)
- [ ] Build gradient editor control
- [ ] Build texture/pattern selector control
- [ ] Build background image upload with existing `backgroundUtils.ts`

### Phase 5 — Polish

- [ ] Save logic: overwrite vs save-as-new
- [ ] Unsaved changes warning dialog
- [ ] Panel collapse/expand animation
- [ ] Keyboard shortcuts (Cmd+Z undo, Cmd+S save)
- [ ] Integration testing with existing theme system
- [ ] Verify no regression with existing preset themes

### Task Assignment Suggestions

| Task Block | Suggested Executor | Reason |
|------------|-------------------|--------|
| Variable map (`themeVariableMap.ts`) | Claude | Requires careful reading of all CSS and component sources |
| New CSS variables (`theme-variables.css`) | Draft by Claude → Review by frontend team | Touches base architecture |
| Preview component (4 scenes) | Codex or Claude | Structural HTML/CSS work |
| Control panel UI (groups + controls) | Codex or Claude | React component development, depends on variable map |
| Light/Dark sync algorithm | Claude | Algorithm logic, needs careful HSL tuning |
| Advanced effect presets (CSS) | Author + AI Skill | Creative design work, author controls aesthetics |
| Bidirectional sync engine | Claude | Core technical challenge, CSS parsing |
| Save/import/export | Codex | Relatively independent, IPC interaction |
| i18n translations | Parallel task | Can be distributed |

### Dependencies

```
Phase 1 (themeVariableMap.ts)
    ↓
Phase 2 (preview + controls) — can be parallelized
    ↓
Phase 3 (sync engines) — depends on Phase 2 components
    ↓
Phase 4 (presets) — can partially parallel with Phase 3
    ↓
Phase 5 (polish) — final integration
```

---

## 13. Open Questions

1. **Frontend team review:** The `--theme-*` variables in Section 10 are a draft. Frontend team should review naming conventions and default values before implementation.

2. **Arco Design variable scope:** We confirmed `--border-radius-*` (5 variables) are real and used by 163 Arco components. Other Arco non-color variables (`--font-weight-*`) exist but are unused by Arco itself.

3. **Performance:** Preview with 4 scenes + ~70 CSS variables — need to verify no perceptible lag on variable updates. The "pure CSS variable binding" approach should be near-zero cost, but worth measuring.

4. **Preset quality:** The advanced effect presets (Aurora Gradient, Cyber Neon, etc.) need high-quality CSS implementations. This is a creative task that requires design iteration.

5. **Plugin store integration:** Theme import/export format should be compatible with the upcoming plugin store's theme sharing mechanism. Coordinate with the plugin store team on format spec.

---

## Appendix A: Cross-Theme Property Analysis

Reference data from analyzing Misaka Mikoto, Hello Kitty, and Retro Windows themes.

### Properties customized by ALL 3 themes (highest priority for variables)

| Property | Misaka | Hello Kitty | Retro Windows |
|----------|--------|-------------|---------------|
| Bubble border-radius | 16px | 20px | 4px |
| Input border-radius | 16px | 20-24px | 4px |
| Button border-radius | 12px | 20px | 4px |
| font-family | Inter, SF Pro | Varela Round, Nunito | MS Sans Serif, Tahoma |
| backdrop-filter blur | 8px | 12px | 4px |
| transition-duration | 0.3s | 0.3s | 0.2s |
| Scrollbar width | 8px | 8px | 16px |
| Button font-weight | 600 | 600 | normal |
| Shadow philosophy | Soft diffuse | Soft + glow | 3D inset/outset |

### Properties customized by 2/3 themes

| Property | Which themes | Values |
|----------|-------------|--------|
| Button hover lift | MM, HK | translateY(-2px) |
| Icon hover glow | MM, HK (dark) | drop-shadow filter |
| Link hover text-shadow | MM, HK (dark) | 0 0 8px rgba(...) |

### Properties unique to one theme

| Property | Theme | Notes |
|----------|-------|-------|
| Custom keyframe animations | HK | hk-float, hk-pulse |
| Form input complete restyle | RW | border: inset, radius: 0, font-size override |
| Scrollbar button arrows | RW | Classic Windows-style scroll buttons |
| !important overrides | RW | Needed to override Arco inline styles |

---

*This document is a working draft. All design decisions are subject to revision based on team feedback and implementation findings.*
