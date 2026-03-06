import { describe, expect, it } from 'vitest';
import { parseCssToVariables, generateCssFromVariables, extractSelectorOverrides, parseThemeCss } from '@/renderer/components/CssThemeDesigner/cssThemeSyncEngine';

// ---------------------------------------------------------------------------
// parseCssToVariables
// ---------------------------------------------------------------------------

describe('parseCssToVariables', () => {
  it('extracts variables from :root block', () => {
    const css = `:root {
  --primary: #165dff;
  --bg-1: #ffffff;
}`;
    const result = parseCssToVariables(css);
    expect(result.lightVariables['--primary']).toBe('#165dff');
    expect(result.lightVariables['--bg-1']).toBe('#ffffff');
  });

  it('extracts variables from [data-theme="dark"] block', () => {
    const css = `[data-theme="dark"] {
  --primary: #4080ff;
  --bg-1: #1a1a1a;
}`;
    const result = parseCssToVariables(css);
    expect(result.darkVariables['--primary']).toBe('#4080ff');
    expect(result.darkVariables['--bg-1']).toBe('#1a1a1a');
  });

  it("extracts variables from [data-theme='dark'] block (single quotes)", () => {
    const css = `[data-theme='dark'] {
  --primary: #4080ff;
}`;
    const result = parseCssToVariables(css);
    expect(result.darkVariables['--primary']).toBe('#4080ff');
  });

  it('preserves unmatched CSS as unmatchedCss', () => {
    const css = `:root {
  --primary: #165dff;
}

.custom-class {
  color: red;
}`;
    const result = parseCssToVariables(css);
    expect(result.lightVariables['--primary']).toBe('#165dff');
    expect(result.unmatchedCss).toContain('.custom-class');
    expect(result.unmatchedCss).toContain('color: red');
  });

  it('handles both light and dark blocks in one CSS string', () => {
    const css = `:root {
  --primary: #165dff;
  --bg-1: #ffffff;
}

[data-theme='dark'] {
  --primary: #4080ff;
  --bg-1: #1a1a1a;
}`;
    const result = parseCssToVariables(css);
    expect(result.lightVariables['--primary']).toBe('#165dff');
    expect(result.darkVariables['--primary']).toBe('#4080ff');
  });

  it('data-color-scheme dark block overrides data-theme dark block', () => {
    const css = `[data-theme='dark'] {
  --primary: #aaa;
}

[data-color-scheme='default'][data-theme='dark'] {
  --primary: #bbb;
}`;
    const result = parseCssToVariables(css);
    // More specific selector should take priority
    expect(result.darkVariables['--primary']).toBe('#bbb');
  });
});

// ---------------------------------------------------------------------------
// generateCssFromVariables
// ---------------------------------------------------------------------------

describe('generateCssFromVariables', () => {
  it('generates :root and dark blocks', () => {
    const css = generateCssFromVariables(
      { '--primary': '#ff0000' },
      { '--primary': '#4080ff' },
      '',
      false // skipDefaults=false to ensure all vars are output
    );
    expect(css).toContain(':root {');
    expect(css).toContain('--primary: #ff0000;');
    expect(css).toContain("[data-theme='dark'] {");
    expect(css).toContain('--primary: #4080ff;');
  });

  it('appends custom CSS section', () => {
    const css = generateCssFromVariables({ '--primary': '#165dff' }, {}, '.my-class { color: red; }');
    expect(css).toContain('/* Custom CSS */');
    expect(css).toContain('.my-class { color: red; }');
  });

  it('skipDefaults=true omits variables matching themeVariableMap defaults', () => {
    // --bg-1 defaultLight is '#f7f8fa' in the map, so passing that should be skipped
    const css = generateCssFromVariables(
      { '--bg-1': '#f7f8fa', '--primary': '#ff0000' },
      {},
      '',
      true // skipDefaults
    );
    // --bg-1 should be skipped (matches default '#f7f8fa')
    expect(css).not.toContain('--bg-1:');
    // --primary: #ff0000 does not match default '#165dff', should be present
    expect(css).toContain('--primary: #ff0000;');
  });

  it('skipDefaults=false preserves all variables including defaults', () => {
    const css = generateCssFromVariables(
      { '--bg-1': '#ffffff', '--primary': '#ff0000' },
      {},
      '',
      false // skipDefaults
    );
    expect(css).toContain('--bg-1: #ffffff;');
    expect(css).toContain('--primary: #ff0000;');
  });
});

// ---------------------------------------------------------------------------
// Lossless round-trip (parse → generate → parse) with skipDefaults=false
// ---------------------------------------------------------------------------

describe('lossless round-trip with skipDefaults=false', () => {
  it('parse → generate → parse preserves all variable declarations', () => {
    const originalCss = `:root {
  --primary: #165dff;
  --bg-1: #ffffff;
  --bg-2: #f0f0f0;
}

[data-theme='dark'] {
  --primary: #4080ff;
  --bg-1: #1a1a1a;
}`;

    // Step 1: Parse
    const parsed = parseCssToVariables(originalCss);

    // Step 2: Generate with skipDefaults=false
    const regenerated = generateCssFromVariables(parsed.lightVariables, parsed.darkVariables, parsed.unmatchedCss, false);

    // Step 3: Parse again
    const reparsed = parseCssToVariables(regenerated);

    // All light variables from step 1 should be present in step 3
    for (const [key, value] of Object.entries(parsed.lightVariables)) {
      expect(reparsed.lightVariables[key]).toBe(value);
    }

    // All dark variables from step 1 should be present in step 3
    for (const [key, value] of Object.entries(parsed.darkVariables)) {
      expect(reparsed.darkVariables[key]).toBe(value);
    }
  });
});

// ---------------------------------------------------------------------------
// extractSelectorOverrides
// ---------------------------------------------------------------------------

describe('extractSelectorOverrides', () => {
  it('extracts font-family from body selector', () => {
    const css = `body {
  font-family: "Varela Round", sans-serif;
}`;
    const result = extractSelectorOverrides(css);
    expect(result['--theme-font-family']).toBe('"Varela Round", sans-serif');
  });

  it('extracts border-radius from .arco-btn-primary', () => {
    const css = `.arco-btn-primary {
  border-radius: 24px;
  font-weight: 600;
}`;
    const result = extractSelectorOverrides(css);
    expect(result['--theme-border-radius-button']).toBe('24px');
    expect(result['--theme-button-font-weight']).toBe('600');
  });

  it('extracts scrollbar width', () => {
    const css = `::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  border-radius: 3px;
}`;
    const result = extractSelectorOverrides(css);
    expect(result['--theme-scrollbar-width']).toBe('6px');
    expect(result['--theme-scrollbar-radius']).toBe('3px');
  });

  it('returns empty object for CSS without known selectors', () => {
    const css = `.unknown-class { color: red; }`;
    const result = extractSelectorOverrides(css);
    expect(Object.keys(result)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// parseThemeCss — full pipeline
// ---------------------------------------------------------------------------

describe('parseThemeCss — full pipeline', () => {
  it('combines variable extraction and selector override extraction', () => {
    const css = `:root {
  --primary: #165dff;
}

body {
  font-family: "Nunito", sans-serif;
}

.arco-btn-primary {
  border-radius: 20px;
}`;

    const result = parseThemeCss(css);
    expect(result.light['--primary']).toBe('#165dff');
    // Selector overrides should be merged into light variables
    expect(result.light['--theme-font-family']).toBe('"Nunito", sans-serif');
    expect(result.light['--theme-border-radius-button']).toBe('20px');
  });

  it('variable declarations override selector overrides (higher priority)', () => {
    const css = `:root {
  --theme-font-family: "IBM Plex Sans", sans-serif;
}

body {
  font-family: "Nunito", sans-serif;
}`;

    const result = parseThemeCss(css);
    // :root variable should win over body selector override
    expect(result.light['--theme-font-family']).toBe('"IBM Plex Sans", sans-serif');
  });
});

// ---------------------------------------------------------------------------
// Minimal preset regression samples
// ---------------------------------------------------------------------------

describe('preset CSS parsing — minimal regression samples', () => {
  it('parses a Misaka-style CSS with :root color variables', () => {
    const misakaCss = `:root {
  --primary: #5F68CE;
  --bg-base: #F1F3FC;
  --bg-1: #FFFFFF;
  --text-primary: #232635;
  --border-base: #DDDFF5;
  --message-user-bg: #5F68CE;
}

[data-theme='dark'] {
  --primary: #8A90E0;
  --bg-base: #151727;
  --bg-1: #1C1F33;
  --text-primary: #ECEDF8;
}`;

    const result = parseCssToVariables(misakaCss);
    expect(result.lightVariables['--primary']).toBe('#5F68CE');
    expect(result.darkVariables['--primary']).toBe('#8A90E0');
    expect(result.lightVariables['--bg-base']).toBe('#F1F3FC');
    expect(result.darkVariables['--bg-1']).toBe('#1C1F33');
  });

  it('parses a Retro-Windows-style CSS with :root variables and selector overrides', () => {
    const retroCss = `:root {
  --primary: #0078D4;
  --bg-1: #C0C0C0;
  --border-base: #808080;
}

body {
  font-family: "MS Sans Serif", "Segoe UI", sans-serif;
}

.arco-btn-primary {
  border-radius: 0px;
}`;

    const result = parseThemeCss(retroCss);
    expect(result.light['--primary']).toBe('#0078D4');
    expect(result.light['--theme-font-family']).toBe('"MS Sans Serif", "Segoe UI", sans-serif');
    expect(result.light['--theme-border-radius-button']).toBe('0px');
  });

  it('parses a Hello-Kitty-style CSS with rounded shapes', () => {
    const helloKittyCss = `:root {
  --primary: #FF69B4;
  --bg-1: #FFF0F5;
  --message-user-bg: #FF69B4;
}

.arco-btn-primary {
  border-radius: 999px;
}

.guidInputCard {
  border-radius: 24px;
}`;

    const result = parseThemeCss(helloKittyCss);
    expect(result.light['--primary']).toBe('#FF69B4');
    expect(result.light['--theme-border-radius-button']).toBe('999px');
    expect(result.light['--theme-border-radius-input']).toBe('24px');
  });
});
