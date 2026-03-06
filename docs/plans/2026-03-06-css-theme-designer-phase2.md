# CSS Theme Designer Phase 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Phase 2 UI shell for the CSS Theme Designer, including previews, control panel scaffolding, foundational controls, and the settings entry integration.

**Architecture:** Add a new `CssThemeDesigner` component subtree that owns mock theme state, preview scene switching, and placeholder control groups. Keep integration shallow by replacing the existing `CssThemeModal` flow inside `CssThemeSettings` with an in-place designer view that reuses the current save/delete/apply logic. Use mock group/control definitions now, with explicit `TODO(themeVariableMap)` markers where Stage 1 outputs will later plug in.

**Tech Stack:** React 19, TypeScript, Arco Design, UnoCSS, react-i18next, Vitest

---

### Task 1: Define Phase 2 mock models and test seams

**Files:**
- Create: `src/renderer/components/CssThemeDesigner/types.ts`
- Create: `src/renderer/components/CssThemeDesigner/mockData.ts`
- Test: `tests/unit/cssThemeDesignerData.test.ts`

**Step 1: Write the failing test**

Write a test that imports the mock group/scene data and verifies:
- there are 10 control groups
- there are 4 preview scenes
- every group has at least one preset preview

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/cssThemeDesignerData.test.ts`
Expected: FAIL because the new modules do not exist yet

**Step 3: Write minimal implementation**

Add typed mock definitions for:
- preview scene IDs
- control group metadata
- placeholder presets
- initial theme variable map for preview rendering

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/cssThemeDesignerData.test.ts`
Expected: PASS

### Task 2: Add preview scene renderers

**Files:**
- Create: `src/renderer/components/CssThemeDesigner/ThemePreview.tsx`
- Create: `src/renderer/components/CssThemeDesigner/ThemePreviewScenes/ChatScene.tsx`
- Create: `src/renderer/components/CssThemeDesigner/ThemePreviewScenes/SidebarScene.tsx`
- Create: `src/renderer/components/CssThemeDesigner/ThemePreviewScenes/SettingsScene.tsx`
- Create: `src/renderer/components/CssThemeDesigner/ThemePreviewScenes/WorkspaceScene.tsx`
- Test: `tests/unit/themePreviewMarkup.test.ts`

**Step 1: Write the failing test**

Write a server-render test with `renderToStaticMarkup` that verifies:
- `ThemePreview` renders a scene tabstrip with 4 tabs
- the default markup contains AionUI-like class names such as `message-item`, `layout-sider`, `arco-btn`
- the current group label is surfaced in the preview shell

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/themePreviewMarkup.test.ts`
Expected: FAIL because `ThemePreview` does not exist

**Step 3: Write minimal implementation**

Build the preview shell and four static scene components that:
- render pure HTML skeletons
- consume CSS variables via `style`
- expose click targets that map back to control-group IDs

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/themePreviewMarkup.test.ts`
Expected: PASS

### Task 3: Add control primitives and panel scaffolding

**Files:**
- Create: `src/renderer/components/CssThemeDesigner/Controls/ColorControl.tsx`
- Create: `src/renderer/components/CssThemeDesigner/Controls/SliderControl.tsx`
- Create: `src/renderer/components/CssThemeDesigner/Controls/DropdownControl.tsx`
- Create: `src/renderer/components/CssThemeDesigner/Controls/ShadowPresetControl.tsx`
- Create: `src/renderer/components/CssThemeDesigner/Controls/PresetStrip.tsx`
- Create: `src/renderer/components/CssThemeDesigner/ControlGroups/ControlGroupCard.tsx`
- Create: `src/renderer/components/CssThemeDesigner/ControlPanel.tsx`

**Step 1: Write the failing test**

Prefer a server-render test that verifies:
- `ControlPanel` renders the visual/code tabs
- a control group card renders preset-strip slots
- placeholder content appears for unresolved controls

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/controlPanelMarkup.test.ts`
Expected: FAIL because these components do not exist

**Step 3: Write minimal implementation**

Implement:
- three-layer `ColorControl`
- shared slider/dropdown controls
- shadow preset control
- collapsible panel/card shell with mock groups

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/controlPanelMarkup.test.ts`
Expected: PASS

### Task 4: Compose ThemeDesigner page

**Files:**
- Create: `src/renderer/components/CssThemeDesigner/ThemeDesigner.tsx`

**Step 1: Write the failing test**

Add a server-render test that verifies:
- toolbar actions render
- control panel and preview render together
- footer shows light/dark mode toggle and current group label

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/themeDesignerMarkup.test.ts`
Expected: FAIL because `ThemeDesigner` does not exist

**Step 3: Write minimal implementation**

Compose the page with:
- mock editable theme state
- current scene/group tracking
- import/export button placeholders
- save/cancel callbacks delegated to parent

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/themeDesignerMarkup.test.ts`
Expected: PASS

### Task 5: Integrate into CssThemeSettings and i18n

**Files:**
- Modify: `src/renderer/components/CssThemeSettings/index.tsx`
- Modify: `src/renderer/i18n/locales/en-US.json`
- Modify: `src/renderer/i18n/locales/zh-CN.json`

**Step 1: Write the failing test**

If practical, add a narrow unit test for any extracted save helpers. Otherwise, rely on the existing new render tests plus manual verification of the integration path.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/cssThemeDesignerData.test.ts tests/unit/themePreviewMarkup.test.ts tests/unit/controlPanelMarkup.test.ts tests/unit/themeDesignerMarkup.test.ts`
Expected: either failure or incomplete coverage before integration changes

**Step 3: Write minimal implementation**

Update `CssThemeSettings` to:
- open `ThemeDesigner` for add/edit flows
- preserve existing save/delete/apply behavior
- exit back to theme card list on cancel/save

Add `settings.themeDesigner.*` translations for user-facing copy in English and Chinese.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/cssThemeDesignerData.test.ts tests/unit/themePreviewMarkup.test.ts tests/unit/controlPanelMarkup.test.ts tests/unit/themeDesignerMarkup.test.ts`
Expected: PASS

### Task 6: Verification

**Files:**
- Verify modified files only

**Step 1: Run targeted tests**

Run: `npm test -- tests/unit/cssThemeDesignerData.test.ts tests/unit/themePreviewMarkup.test.ts tests/unit/controlPanelMarkup.test.ts tests/unit/themeDesignerMarkup.test.ts`

**Step 2: Run lint on touched files**

Run: `npx eslint src/renderer/components/CssThemeDesigner src/renderer/components/CssThemeSettings/index.tsx`

**Step 3: Check formatting**

Run: `npx prettier --check "src/renderer/components/CssThemeDesigner/**/*.{ts,tsx}" src/renderer/components/CssThemeSettings/index.tsx src/renderer/i18n/locales/en-US.json src/renderer/i18n/locales/zh-CN.json`

**Step 4: Manual review checklist**

Verify:
- preview clicks select the expected control group
- panel collapse/expand works
- visual/code tabs switch
- add/edit entry points open the designer instead of the old modal
- `TODO(themeVariableMap)` markers exist where mock data will be swapped later
