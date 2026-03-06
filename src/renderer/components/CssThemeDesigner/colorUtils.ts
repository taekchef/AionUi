import type { ColorControlValue } from './types';

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

export interface ParsedCssColorValue {
  color: string;
  alpha: number;
}

export const normalizeHex = (value: string): string => {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  const normalized = withHash.toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(normalized)) return normalized;
  if (/^#[0-9A-F]{3}$/.test(normalized)) {
    const [, r, g, b] = normalized;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return '#4F6BFF';
};

export const parseCssColorValue = (value: string): ParsedCssColorValue => {
  const trimmed = value.trim();
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-9]*\.?[0-9]+))?\s*\)/i);

  if (rgbMatch) {
    return {
      color: rgbToHex(Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])),
      alpha: clamp(Math.round(Number.parseFloat(rgbMatch[4] || '1') * 100), 0, 100),
    };
  }

  return {
    color: normalizeHex(trimmed),
    alpha: 100,
  };
};

export const hexToRgb = (value: string): { r: number; g: number; b: number } => {
  const hex = normalizeHex(value).slice(1);
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  const parts = [r, g, b].map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'));
  return `#${parts.join('')}`.toUpperCase();
};

export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;
  const max = Math.max(normalizedR, normalizedG, normalizedB);
  const min = Math.min(normalizedR, normalizedG, normalizedB);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l: Math.round(lightness * 100) };
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  if (max === normalizedR) {
    hue = 60 * (((normalizedG - normalizedB) / delta) % 6);
  } else if (max === normalizedG) {
    hue = 60 * ((normalizedB - normalizedR) / delta + 2);
  } else {
    hue = 60 * ((normalizedR - normalizedG) / delta + 4);
  }

  if (hue < 0) hue += 360;

  return {
    h: Math.round(hue),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
};

export const hexToHsl = (value: string): { h: number; s: number; l: number } => {
  const { r, g, b } = hexToRgb(value);
  return rgbToHsl(r, g, b);
};

export const hslToHex = (h: number, s: number, l: number): string => {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const intermediate = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = lightness - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = chroma;
    green = intermediate;
  } else if (hue < 120) {
    red = intermediate;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = intermediate;
  } else if (hue < 240) {
    green = intermediate;
    blue = chroma;
  } else if (hue < 300) {
    red = intermediate;
    blue = chroma;
  } else {
    red = chroma;
    blue = intermediate;
  }

  return rgbToHex((red + match) * 255, (green + match) * 255, (blue + match) * 255);
};

export const toRgba = (hex: string, alpha: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 100) / 100})`;
};

export const formatCssColorValue = (hex: string, alpha: number): string => {
  const normalized = normalizeHex(hex);
  return clamp(alpha, 0, 100) >= 100 ? normalized : toRgba(normalized, alpha);
};

export const lightenColor = (hex: string, nextLightness: number): string => {
  const { h, s } = hexToHsl(hex);
  return hslToHex(h, s, nextLightness);
};

export const readCssLength = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const createColorValue = (color: string, gradient?: Partial<ColorControlValue['gradient']>): ColorControlValue => {
  const parsedColor = parseCssColorValue(color);
  const parsedGradientFrom = parseCssColorValue(gradient?.from || color);
  const parsedGradientTo = parseCssColorValue(gradient?.to || '#89A2FF');

  return {
    color: parsedColor.color,
    alpha: parsedColor.alpha,
    gradient: {
      enabled: false,
      from: parsedGradientFrom.color,
      to: parsedGradientTo.color,
      angle: gradient?.angle ?? 135,
      type: gradient?.type ?? 'linear',
    },
  };
};
