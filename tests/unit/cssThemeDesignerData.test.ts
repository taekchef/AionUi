import { describe, expect, test } from 'vitest';
import { THEME_DESIGNER_GROUPS, THEME_DESIGNER_SCENES } from '@/renderer/components/CssThemeDesigner/mockData';

describe('css theme designer mock data', () => {
  test('defines the expected control groups and preview scenes', () => {
    expect(THEME_DESIGNER_GROUPS).toHaveLength(10);
    expect(THEME_DESIGNER_SCENES).toHaveLength(4);
    expect(THEME_DESIGNER_GROUPS.every((group) => group.presets.length > 0)).toBe(true);
  });

  test('uses unique preset ids within each control group', () => {
    for (const group of THEME_DESIGNER_GROUPS) {
      const presetIds = group.presets.map((preset) => preset.id);
      expect(new Set(presetIds).size).toBe(presetIds.length);
    }
  });
});
