import { describe, expect, it } from 'vitest';
import { hexToRgb, rgbToHex, hslToRgb, parseColorToHsl, computeDarkFromLight, computeLightFromDark, syncAllVariables } from '@/renderer/components/CssThemeDesigner/darkModeSync';

// ---------------------------------------------------------------------------
// Color conversion utilities
// ---------------------------------------------------------------------------

describe('hexToRgb', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgb('#165dff')).toEqual({ r: 22, g: 93, b: 255 });
  });

  it('parses 3-digit hex', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('#xyz')).toBeNull();
    expect(hexToRgb('not-a-color')).toBeNull();
    expect(hexToRgb('#12345')).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('converts RGB to hex', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
  });

  it('clamps out-of-range values', () => {
    expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe('#ff0080');
  });
});

describe('hslToRgb — hue normalization', () => {
  it('treats h=360 the same as h=0 (pure red at full saturation)', () => {
    const rgb0 = hslToRgb({ h: 0, s: 100, l: 50 });
    const rgb360 = hslToRgb({ h: 360, s: 100, l: 50 });
    expect(rgb360).toEqual(rgb0);
  });

  it('handles negative hue values', () => {
    // h=-60 should be equivalent to h=300 (magenta region)
    const rgbNeg = hslToRgb({ h: -60, s: 100, l: 50 });
    const rgb300 = hslToRgb({ h: 300, s: 100, l: 50 });
    expect(rgbNeg).toEqual(rgb300);
  });

  it('handles hue > 360', () => {
    const rgb400 = hslToRgb({ h: 400, s: 100, l: 50 });
    const rgb40 = hslToRgb({ h: 40, s: 100, l: 50 });
    expect(rgb400).toEqual(rgb40);
  });
});

describe('parseColorToHsl', () => {
  it('parses hex colors', () => {
    const hsl = parseColorToHsl('#ff0000');
    expect(hsl).not.toBeNull();
    expect(hsl!.h).toBeCloseTo(0, 0);
    expect(hsl!.s).toBeCloseTo(100, 0);
    expect(hsl!.l).toBeCloseTo(50, 0);
  });

  it('parses rgb() colors', () => {
    const hsl = parseColorToHsl('rgb(0, 128, 255)');
    expect(hsl).not.toBeNull();
    expect(hsl!.s).toBeGreaterThan(0);
  });

  it('parses rgba() colors (alpha is ignored in HSL)', () => {
    const hsl = parseColorToHsl('rgba(255, 255, 255, 0.08)');
    expect(hsl).not.toBeNull();
    expect(hsl!.l).toBeCloseTo(100, 0);
  });

  it('returns null for non-color values', () => {
    expect(parseColorToHsl('8px')).toBeNull();
    expect(parseColorToHsl('auto')).toBeNull();
    expect(parseColorToHsl('var(--something)')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// invertLightness round-trip
// ---------------------------------------------------------------------------

describe('invertLightness round-trip (computeDarkFromLight ↔ computeLightFromDark)', () => {
  // --bg-1 uses invertLightness strategy
  const KEY = '--bg-1';

  it('light → dark → light preserves the original color', () => {
    const lightColor = '#ffffff';
    const darkResult = computeDarkFromLight(KEY, lightColor);
    expect(darkResult).not.toBeNull();

    const restored = computeLightFromDark(KEY, darkResult!);
    expect(restored).not.toBeNull();

    // Compare via HSL to allow minor rounding differences
    const originalHsl = parseColorToHsl(lightColor)!;
    const restoredHsl = parseColorToHsl(restored!)!;

    expect(restoredHsl.h).toBeCloseTo(originalHsl.h, 0);
    expect(restoredHsl.s).toBeCloseTo(originalHsl.s, 0);
    expect(restoredHsl.l).toBeCloseTo(originalHsl.l, 0);
  });

  it('dark → light → dark preserves the original color', () => {
    const darkColor = '#1a1a1a';
    const lightResult = computeLightFromDark(KEY, darkColor);
    expect(lightResult).not.toBeNull();

    const restored = computeDarkFromLight(KEY, lightResult!);
    expect(restored).not.toBeNull();

    const originalHsl = parseColorToHsl(darkColor)!;
    const restoredHsl = parseColorToHsl(restored!)!;

    expect(restoredHsl.h).toBeCloseTo(originalHsl.h, 0);
    expect(restoredHsl.s).toBeCloseTo(originalHsl.s, 0);
    expect(restoredHsl.l).toBeCloseTo(originalHsl.l, 0);
  });

  it('handles a saturated color round-trip without saturation drift', () => {
    const KEY_BG = '--bg-2'; // also uses invertLightness
    const original = '#3366cc';
    const dark = computeDarkFromLight(KEY_BG, original);
    expect(dark).not.toBeNull();

    const restored = computeLightFromDark(KEY_BG, dark!);
    expect(restored).not.toBeNull();

    const originalHsl = parseColorToHsl(original)!;
    const restoredHsl = parseColorToHsl(restored!)!;

    // Saturation should be within 1% tolerance (rounding)
    expect(Math.abs(restoredHsl.s - originalHsl.s)).toBeLessThan(1.5);
  });
});

// ---------------------------------------------------------------------------
// shiftLightness round-trip
// ---------------------------------------------------------------------------

describe('shiftLightness round-trip', () => {
  // --primary uses shiftLightness with lightnessShift: 15, saturationShift: -10
  const KEY = '--primary';

  it('light → dark → light approximately preserves the original', () => {
    const original = '#165dff';
    const dark = computeDarkFromLight(KEY, original);
    expect(dark).not.toBeNull();

    const restored = computeLightFromDark(KEY, dark!);
    expect(restored).not.toBeNull();

    const originalHsl = parseColorToHsl(original)!;
    const restoredHsl = parseColorToHsl(restored!)!;

    // shiftLightness can lose precision at clamp boundaries,
    // but for mid-range values should be close
    expect(restoredHsl.h).toBeCloseTo(originalHsl.h, 0);
    expect(Math.abs(restoredHsl.l - originalHsl.l)).toBeLessThan(2);
  });
});

// ---------------------------------------------------------------------------
// manual strategy — no automatic sync
// ---------------------------------------------------------------------------

describe('manual strategy variables', () => {
  // --fill-0 has strategy: 'manual'
  const MANUAL_KEY = '--fill-0';

  it('computeDarkFromLight returns null for manual variables', () => {
    expect(computeDarkFromLight(MANUAL_KEY, '#ffffff')).toBeNull();
  });

  it('computeLightFromDark returns null for manual variables', () => {
    expect(computeLightFromDark(MANUAL_KEY, '#1a1a1a')).toBeNull();
  });

  it('syncAllVariables skips manual variables', () => {
    const source = { '--fill-0': 'rgba(255, 255, 255, 0.08)', '--bg-1': '#ffffff' };
    const target = { '--fill-0': '#000000', '--bg-1': '#1a1a1a' };

    const { updatedVars, records } = syncAllVariables(source, target, 'lightToDark');

    // --fill-0 should not be synced (manual strategy + rgba not parseable to pure hex)
    expect(updatedVars['--fill-0']).toBe('#000000');
    // --bg-1 should be synced (invertLightness)
    expect(records.some((r) => r.key === '--bg-1')).toBe(true);
    expect(records.some((r) => r.key === '--fill-0')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// syncAllVariables — excludeKeys
// ---------------------------------------------------------------------------

describe('syncAllVariables with excludeKeys', () => {
  it('respects excludeKeys and skips specified variables', () => {
    const source = { '--bg-1': '#ffffff', '--bg-2': '#f0f0f0' };
    const target = { '--bg-1': '#1a1a1a', '--bg-2': '#2a2a2a' };

    const { records } = syncAllVariables(source, target, 'lightToDark', new Set(['--bg-1']));

    expect(records.some((r) => r.key === '--bg-1')).toBe(false);
    expect(records.some((r) => r.key === '--bg-2')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Unknown / unregistered keys
// ---------------------------------------------------------------------------

describe('unregistered variable keys', () => {
  it('computeDarkFromLight returns null for unknown keys', () => {
    expect(computeDarkFromLight('--nonexistent-var', '#ff0000')).toBeNull();
  });

  it('computeLightFromDark returns null for unknown keys', () => {
    expect(computeLightFromDark('--nonexistent-var', '#ff0000')).toBeNull();
  });
});
