import { describe, expect, test } from 'vitest';
import { createColorValue, formatCssColorValue } from '@/renderer/components/CssThemeDesigner/colorUtils';
import { SHADOW_PRESET_VALUES } from '@/renderer/components/CssThemeDesigner/mockData';
import { resolveShadowPresetValue, resolveThemeDesignerSaveCss } from '@/renderer/components/CssThemeDesigner/themeDesignerUtils';

describe('theme designer phase 2 helpers', () => {
  test('resolveShadowPresetValue swaps in the full preset configuration', () => {
    const currentValue = {
      ...SHADOW_PRESET_VALUES['soft-float'],
      intensity: 99,
      blur: 2,
    };

    const nextValue = resolveShadowPresetValue('neon-glow', currentValue);

    expect(nextValue).toEqual(SHADOW_PRESET_VALUES['neon-glow']);
    expect(nextValue).not.toBe(SHADOW_PRESET_VALUES['neon-glow']);
  });

  test('resolveThemeDesignerSaveCss uses generated CSS in visual mode and codeValue in code mode', () => {
    expect(
      resolveThemeDesignerSaveCss({
        activeTab: 'visual',
        generatedCss: ':root { --primary: #111111; }',
        codeValue: ':root { --primary: #222222; }',
      })
    ).toBe(':root { --primary: #111111; }');

    expect(
      resolveThemeDesignerSaveCss({
        activeTab: 'code',
        generatedCss: ':root { --primary: #111111; }',
        codeValue: ':root { --primary: #222222; }',
      })
    ).toBe(':root { --primary: #222222; }');
  });
});

describe('colorUtils rgba support', () => {
  test('createColorValue preserves rgba alpha instead of falling back to the default accent', () => {
    const colorValue = createColorValue('rgba(255, 255, 255, 0.68)');

    expect(colorValue.color).toBe('#FFFFFF');
    expect(colorValue.alpha).toBe(68);
  });

  test('formatCssColorValue returns rgba strings when alpha is below 100', () => {
    expect(formatCssColorValue('#FFFFFF', 68)).toBe('rgba(255, 255, 255, 0.68)');
    expect(formatCssColorValue('#FFFFFF', 100)).toBe('#FFFFFF');
  });
});
