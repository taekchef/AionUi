import type { CSSProperties } from 'react';
import { createColorValue } from './colorUtils';
import type { ShadowPresetValue, ThemeDesignerGroupDefinition, ThemeDesignerGroupId, ThemeDesignerSceneDefinition, ThemeDesignerVariableBundle, ThemeVariableRecord } from './types';

const createPreset = (id: string, labelKey: string, swatches: string[], previewStyle?: CSSProperties) => ({
  id,
  labelKey,
  swatches,
  previewStyle,
});

export const THEME_DESIGNER_SCENES: ThemeDesignerSceneDefinition[] = [
  { id: 'chat', labelKey: 'settings.themeDesigner.scenes.chat' },
  { id: 'sidebar', labelKey: 'settings.themeDesigner.scenes.sidebar' },
  { id: 'settings', labelKey: 'settings.themeDesigner.scenes.settings' },
  { id: 'workspace', labelKey: 'settings.themeDesigner.scenes.workspace' },
];

export const THEME_DESIGNER_GROUPS: ThemeDesignerGroupDefinition[] = [
  {
    id: 'global-tone',
    titleKey: 'settings.themeDesigner.groups.globalTone.title',
    descriptionKey: 'settings.themeDesigner.groups.globalTone.description',
    sceneIds: ['chat', 'sidebar', 'settings', 'workspace'],
    presets: [createPreset('cool-tide', 'settings.themeDesigner.presets.coolTide', ['#4F6BFF', '#89A2FF']), createPreset('warm-earth', 'settings.themeDesigner.presets.warmEarth', ['#D18152', '#F6C28B']), createPreset('neutral-gray', 'settings.themeDesigner.presets.neutralGray', ['#5A6476', '#C7CEDA']), createPreset('pastel-soft', 'settings.themeDesigner.presets.pastelSoft', ['#9B8BFF', '#FFD8E8']), createPreset('mono', 'settings.themeDesigner.presets.monochrome', ['#111827', '#9CA3AF'])],
  },
  {
    id: 'aou-palette',
    titleKey: 'settings.themeDesigner.groups.aouPalette.title',
    descriptionKey: 'settings.themeDesigner.groups.aouPalette.description',
    sceneIds: ['chat', 'sidebar', 'settings'],
    presets: [createPreset('ocean-blue', 'settings.themeDesigner.presets.oceanBlue', ['#143D8F', '#A9D3FF']), createPreset('forest-green', 'settings.themeDesigner.presets.forestGreen', ['#1A6B4E', '#B7E3C8']), createPreset('sunset', 'settings.themeDesigner.presets.sunset', ['#A93A4A', '#FFD69B']), createPreset('berry', 'settings.themeDesigner.presets.berry', ['#7A2E83', '#F1B3F7']), createPreset('slate', 'settings.themeDesigner.presets.slate', ['#32445F', '#CBD5E1'])],
  },
  {
    id: 'backgrounds',
    titleKey: 'settings.themeDesigner.groups.backgrounds.title',
    descriptionKey: 'settings.themeDesigner.groups.backgrounds.description',
    sceneIds: ['chat', 'sidebar', 'settings', 'workspace'],
    presets: [createPreset('pure-white', 'settings.themeDesigner.presets.pureWhite', ['#FFFFFF', '#F3F5FB']), createPreset('layered-gray', 'settings.themeDesigner.presets.layeredGray', ['#EEF1F7', '#DCE4F0']), createPreset('deep-immersive', 'settings.themeDesigner.presets.deepImmersive', ['#0F172A', '#1E293B']), createPreset('frosted', 'settings.themeDesigner.presets.frostedTransparent', ['#FFFFFFCC', '#DCE8FF99']), createPreset('gradient-flow', 'settings.themeDesigner.presets.gradientFlow', ['#EEF3FF', '#DDE7FF'])],
  },
  {
    id: 'text',
    titleKey: 'settings.themeDesigner.groups.text.title',
    descriptionKey: 'settings.themeDesigner.groups.text.description',
    sceneIds: ['chat', 'sidebar', 'settings', 'workspace'],
    presets: [createPreset('classic-bw', 'settings.themeDesigner.presets.classicBw', ['#111827', '#6B7280']), createPreset('soft-low', 'settings.themeDesigner.presets.lowContrastSoft', ['#3F4A5A', '#7A8798']), createPreset('sharp-high', 'settings.themeDesigner.presets.highContrastSharp', ['#050816', '#475569']), createPreset('accented', 'settings.themeDesigner.presets.coloredAccent', ['#1D4ED8', '#64748B']), createPreset('warm', 'settings.themeDesigner.presets.warmTone', ['#5B4436', '#8A7767'])],
  },
  {
    id: 'messages-components',
    titleKey: 'settings.themeDesigner.groups.messages.title',
    descriptionKey: 'settings.themeDesigner.groups.messages.description',
    sceneIds: ['chat', 'sidebar', 'workspace'],
    presets: [createPreset('soft-blue', 'settings.themeDesigner.presets.softBlue', ['#4F6BFF', '#E8EEFF']), createPreset('warm-orange', 'settings.themeDesigner.presets.warmOrange', ['#F08A5D', '#FFE6D7']), createPreset('gradient-purple', 'settings.themeDesigner.presets.gradientPurple', ['#6E58FF', '#B392FF']), createPreset('glass', 'settings.themeDesigner.presets.frostedGlass', ['#FFFFFF99', '#DCE8FF99']), createPreset('neon', 'settings.themeDesigner.presets.neonOutline', ['#00D0FF', '#112A48'])],
  },
  {
    id: 'borders',
    titleKey: 'settings.themeDesigner.groups.borders.title',
    descriptionKey: 'settings.themeDesigner.groups.borders.description',
    sceneIds: ['sidebar', 'settings', 'workspace'],
    presets: [createPreset('invisible', 'settings.themeDesigner.presets.invisible', ['#FFFFFF00', '#FFFFFF00']), createPreset('hairline', 'settings.themeDesigner.presets.hairline', ['#D7DDF0', '#EDF1FA']), createPreset('shadow-replace', 'settings.themeDesigner.presets.shadowReplace', ['#CBD5E1', '#94A3B8']), createPreset('colored-line', 'settings.themeDesigner.presets.coloredLine', ['#7C92FF', '#C7D2FE']), createPreset('dashed', 'settings.themeDesigner.presets.dashed', ['#7A8798', '#D7DDF0'])],
  },
  {
    id: 'semantic-colors',
    titleKey: 'settings.themeDesigner.groups.semantic.title',
    descriptionKey: 'settings.themeDesigner.groups.semantic.description',
    sceneIds: ['chat', 'settings', 'workspace'],
    presets: [createPreset('classic-rgyb', 'settings.themeDesigner.presets.classicRgyb', ['#22B07D', '#E2A930', '#DF5F67', '#4589FF']), createPreset('macaron', 'settings.themeDesigner.presets.macaronPastel', ['#72D6AE', '#FFD36B', '#FF94A2', '#7EC2FF']), createPreset('neon-glow', 'settings.themeDesigner.presets.neonGlow', ['#00E6A7', '#FFB703', '#FF4D6D', '#50B7FF']), createPreset('earth', 'settings.themeDesigner.presets.earthTone', ['#588157', '#D4A373', '#BC4749', '#5E6472']), createPreset('mono-semantic', 'settings.themeDesigner.presets.monochrome', ['#334155', '#64748B', '#94A3B8', '#CBD5E1'])],
  },
  {
    id: 'shape-radius',
    titleKey: 'settings.themeDesigner.groups.shape.title',
    descriptionKey: 'settings.themeDesigner.groups.shape.description',
    sceneIds: ['chat', 'settings'],
    presets: [createPreset('round-modern', 'settings.themeDesigner.presets.roundModern', ['#14B8A6', '#2DD4BF']), createPreset('extra-round', 'settings.themeDesigner.presets.extraRound', ['#8B5CF6', '#C4B5FD']), createPreset('sharp-classic', 'settings.themeDesigner.presets.sharpClassic', ['#475569', '#CBD5E1']), createPreset('pill', 'settings.themeDesigner.presets.pill', ['#2563EB', '#60A5FA']), createPreset('mixed', 'settings.themeDesigner.presets.mixed', ['#F97316', '#FDBA74'])],
  },
  {
    id: 'typography-motion',
    titleKey: 'settings.themeDesigner.groups.typography.title',
    descriptionKey: 'settings.themeDesigner.groups.typography.description',
    sceneIds: ['chat', 'settings', 'workspace'],
    presets: [createPreset('system-default', 'settings.themeDesigner.presets.systemDefault', ['#111827', '#4B5563']), createPreset('modern-sans', 'settings.themeDesigner.presets.modernSans', ['#0F172A', '#475569']), createPreset('rounded-friendly', 'settings.themeDesigner.presets.roundedFriendly', ['#0284C7', '#67E8F9']), createPreset('classic-serif', 'settings.themeDesigner.presets.classicSerif', ['#7C2D12', '#FDBA74']), createPreset('mono-tech', 'settings.themeDesigner.presets.monoTech', ['#111827', '#94A3B8'])],
  },
  {
    id: 'advanced-effects',
    titleKey: 'settings.themeDesigner.groups.advanced.title',
    descriptionKey: 'settings.themeDesigner.groups.advanced.description',
    sceneIds: ['chat', 'workspace'],
    presets: [createPreset('aurora', 'settings.themeDesigner.presets.auroraGradient', ['#5B6CFF', '#8DF7FF'], { background: 'linear-gradient(135deg, #5B6CFF 0%, #8DF7FF 100%)' }), createPreset('cyber', 'settings.themeDesigner.presets.cyberNeon', ['#00F5D4', '#9B5DE5'], { background: 'linear-gradient(135deg, #00F5D4 0%, #9B5DE5 100%)' }), createPreset('glass-advanced', 'settings.themeDesigner.presets.frostedGlass', ['#FFFFFFA6', '#D6E4FF80']), createPreset('starfield', 'settings.themeDesigner.presets.starfieldTexture', ['#0F172A', '#1E293B']), createPreset('water', 'settings.themeDesigner.presets.waterRipple', ['#38BDF8', '#0EA5E9'])],
  },
];

export const DEFAULT_SCENE_ID = 'chat';
export const DEFAULT_GROUP_ID: ThemeDesignerGroupId = 'global-tone';

export const INITIAL_THEME_DESIGNER_VARIABLES: ThemeDesignerVariableBundle = {
  light: {
    '--primary': '#4F6BFF',
    '--brand': '#5A72FF',
    '--brand-light': '#89A2FF',
    '--brand-hover': '#3D56DB',
    '--bg-base': '#F3F6FC',
    '--bg-1': '#FFFFFF',
    '--bg-2': '#EEF2FB',
    '--bg-3': '#E4EBF9',
    '--bg-hover': '#EDF2FF',
    '--bg-active': '#DEE6FF',
    '--fill': 'rgba(255, 255, 255, 0.82)',
    '--fill-0': 'rgba(255, 255, 255, 0.68)',
    '--text-primary': '#182033',
    '--text-secondary': '#5C6982',
    '--text-disabled': '#97A4BE',
    '--border-base': '#D7DDF0',
    '--border-light': '#E7ECF6',
    '--border-special': 'rgba(79, 107, 255, 0.24)',
    '--message-user-bg': '#4F6BFF',
    '--message-tips-bg': '#E8EEFF',
    '--workspace-btn-bg': '#EEF2FF',
    '--success': '#22B07D',
    '--warning': '#E2A930',
    '--danger': '#DF5F67',
    '--info': '#4589FF',
    '--theme-font-family': '"IBM Plex Sans", "PingFang SC", sans-serif',
    '--theme-border-radius-bubble-user': '18px 18px 6px 18px',
    '--theme-border-radius-bubble-ai': '18px 18px 18px 6px',
    '--theme-border-radius-input': '14px',
    '--theme-border-radius-button': '12px',
    '--theme-border-radius-tooltip': '12px',
    '--theme-transition-duration': '0.28s',
    '--theme-transition-timing': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    '--theme-scrollbar-width': '8px',
    '--theme-scrollbar-radius': '8px',
    '--theme-backdrop-blur': '14px',
    '--theme-shadow-md': '0 16px 44px rgba(23, 31, 62, 0.12)',
    '--theme-gradient-primary': 'linear-gradient(135deg, #4F6BFF 0%, #89A2FF 100%)',
    '--theme-gradient-surface': 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(244,247,255,0.94) 100%)',
  },
  dark: {
    '--primary': '#8DA2FF',
    '--brand': '#9BB0FF',
    '--brand-light': '#C6D2FF',
    '--brand-hover': '#B3C3FF',
    '--bg-base': '#0C1220',
    '--bg-1': '#121A2D',
    '--bg-2': '#182235',
    '--bg-3': '#22304A',
    '--bg-hover': '#1D2940',
    '--bg-active': '#273552',
    '--fill': 'rgba(13, 19, 35, 0.82)',
    '--fill-0': 'rgba(13, 19, 35, 0.6)',
    '--text-primary': '#F5F8FF',
    '--text-secondary': '#B7C0D9',
    '--text-disabled': '#6E7891',
    '--border-base': '#26314A',
    '--border-light': '#33425E',
    '--border-special': 'rgba(141, 162, 255, 0.28)',
    '--message-user-bg': '#5974FF',
    '--message-tips-bg': '#1E2A43',
    '--workspace-btn-bg': '#1D2740',
    '--success': '#39C68D',
    '--warning': '#F0B94B',
    '--danger': '#FF7F8B',
    '--info': '#6AB1FF',
    '--theme-font-family': '"IBM Plex Sans", "PingFang SC", sans-serif',
    '--theme-border-radius-bubble-user': '18px 18px 6px 18px',
    '--theme-border-radius-bubble-ai': '18px 18px 18px 6px',
    '--theme-border-radius-input': '14px',
    '--theme-border-radius-button': '12px',
    '--theme-border-radius-tooltip': '12px',
    '--theme-transition-duration': '0.28s',
    '--theme-transition-timing': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    '--theme-scrollbar-width': '8px',
    '--theme-scrollbar-radius': '8px',
    '--theme-backdrop-blur': '18px',
    '--theme-shadow-md': '0 20px 56px rgba(0, 0, 0, 0.34)',
    '--theme-gradient-primary': 'linear-gradient(135deg, #5974FF 0%, #9BB0FF 100%)',
    '--theme-gradient-surface': 'linear-gradient(180deg, rgba(18,26,45,0.96) 0%, rgba(12,18,32,0.96) 100%)',
  },
};

export const SHADOW_PRESET_VALUES: Record<string, ShadowPresetValue> = {
  'soft-float': {
    presetId: 'soft-float',
    intensity: 56,
    type: 'outset',
    offsetX: 0,
    offsetY: 16,
    blur: 44,
    spread: -14,
    opacity: 18,
  },
  'classic-3d': {
    presetId: 'classic-3d',
    intensity: 72,
    type: 'inset',
    offsetX: 1,
    offsetY: 2,
    blur: 8,
    spread: 0,
    opacity: 28,
  },
  'neon-glow': {
    presetId: 'neon-glow',
    intensity: 68,
    type: 'outset',
    offsetX: 0,
    offsetY: 0,
    blur: 24,
    spread: 2,
    opacity: 54,
  },
  none: {
    presetId: 'none',
    intensity: 0,
    type: 'outset',
    offsetX: 0,
    offsetY: 0,
    blur: 0,
    spread: 0,
    opacity: 0,
  },
};

export const DEFAULT_COLOR_CONTROL_VALUES = {
  primary: createColorValue('#4F6BFF', { to: '#89A2FF' }),
  background: createColorValue('#FFFFFF', { to: '#EEF2FB' }),
  message: createColorValue('#4F6BFF', { to: '#89A2FF' }),
};

export const GROUP_KEY_BY_ID: Record<ThemeDesignerGroupId, string> = THEME_DESIGNER_GROUPS.reduce(
  (accumulator, group) => {
    accumulator[group.id] = group.titleKey;
    return accumulator;
  },
  {} as Record<ThemeDesignerGroupId, string>
);

export const buildPreviewStyle = (variables: ThemeVariableRecord): CSSProperties => {
  return Object.entries(variables).reduce((style, [key, value]) => {
    (style as Record<string, string>)[key] = value;
    return style;
  }, {} as CSSProperties);
};

export const serializeThemeVariables = (bundle: ThemeDesignerVariableBundle): string => {
  const serializeBlock = (selector: string, variables: ThemeVariableRecord): string => {
    return `${selector} {\n${Object.entries(variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`;
  };

  return ['/* TODO(themeVariableMap): generated from phase 2 mock data */', serializeBlock(':root', bundle.light), '', serializeBlock("[data-theme='dark']", bundle.dark)].join('\n');
};

const PRESET_VAR_PATCHES: Record<ThemeDesignerGroupId, Record<string, Partial<ThemeVariableRecord>>> = {
  'global-tone': {
    'cool-tide': { '--primary': '#4F6BFF', '--brand': '#5A72FF', '--brand-light': '#89A2FF' },
    'warm-earth': { '--primary': '#D18152', '--brand': '#D88E5F', '--brand-light': '#F6C28B' },
    'neutral-gray': { '--primary': '#5A6476', '--brand': '#6B7280', '--brand-light': '#C7CEDA' },
    'pastel-soft': { '--primary': '#9B8BFF', '--brand': '#C39DFF', '--brand-light': '#FFD8E8' },
    mono: { '--primary': '#374151', '--brand': '#111827', '--brand-light': '#9CA3AF' },
  },
  'aou-palette': {
    'ocean-blue': { '--brand': '#1D4ED8', '--brand-light': '#A9D3FF' },
    'forest-green': { '--brand': '#1A6B4E', '--brand-light': '#B7E3C8' },
    sunset: { '--brand': '#A93A4A', '--brand-light': '#FFD69B' },
    berry: { '--brand': '#7A2E83', '--brand-light': '#F1B3F7' },
    slate: { '--brand': '#32445F', '--brand-light': '#CBD5E1' },
  },
  backgrounds: {
    'pure-white': { '--bg-base': '#F7F9FE', '--bg-1': '#FFFFFF', '--bg-2': '#F1F4FB' },
    'layered-gray': { '--bg-base': '#EEF1F7', '--bg-1': '#F7F8FB', '--bg-2': '#E2E8F0' },
    'deep-immersive': { '--bg-base': '#0F172A', '--bg-1': '#162033', '--bg-2': '#1E293B' },
    frosted: { '--bg-base': '#F3F6FC', '--fill': 'rgba(255,255,255,0.68)', '--fill-0': 'rgba(220,232,255,0.4)' },
    'gradient-flow': { '--bg-base': '#EEF3FF', '--bg-1': '#F8FAFF', '--bg-2': '#DDE7FF' },
  },
  text: {
    'classic-bw': { '--text-primary': '#111827', '--text-secondary': '#6B7280' },
    'soft-low': { '--text-primary': '#3F4A5A', '--text-secondary': '#7A8798' },
    'sharp-high': { '--text-primary': '#050816', '--text-secondary': '#475569' },
    accented: { '--text-primary': '#17337A', '--text-secondary': '#6B7280' },
    warm: { '--text-primary': '#5B4436', '--text-secondary': '#8A7767' },
  },
  'messages-components': {
    'soft-blue': { '--message-user-bg': '#4F6BFF', '--message-tips-bg': '#E8EEFF' },
    'warm-orange': { '--message-user-bg': '#F08A5D', '--message-tips-bg': '#FFE6D7' },
    'gradient-purple': { '--message-user-bg': '#6E58FF', '--theme-gradient-primary': 'linear-gradient(135deg, #6E58FF 0%, #B392FF 100%)' },
    glass: { '--message-tips-bg': 'rgba(255,255,255,0.7)', '--fill-0': 'rgba(220,232,255,0.48)' },
    neon: { '--message-user-bg': '#00D0FF', '--border-special': 'rgba(0,208,255,0.38)' },
  },
  borders: {
    invisible: { '--border-base': 'rgba(255,255,255,0)', '--border-light': 'rgba(255,255,255,0)' },
    hairline: { '--border-base': '#D7DDF0', '--border-light': '#EDF1FA' },
    'shadow-replace': { '--border-base': '#CBD5E1', '--border-light': '#94A3B8' },
    'colored-line': { '--border-base': '#7C92FF', '--border-light': '#C7D2FE' },
    dashed: { '--border-base': '#7A8798', '--border-light': '#D7DDF0' },
  },
  'semantic-colors': {
    'classic-rgyb': { '--success': '#22B07D', '--warning': '#E2A930', '--danger': '#DF5F67', '--info': '#4589FF' },
    macaron: { '--success': '#72D6AE', '--warning': '#FFD36B', '--danger': '#FF94A2', '--info': '#7EC2FF' },
    'neon-glow': { '--success': '#00E6A7', '--warning': '#FFB703', '--danger': '#FF4D6D', '--info': '#50B7FF' },
    earth: { '--success': '#588157', '--warning': '#D4A373', '--danger': '#BC4749', '--info': '#5E6472' },
    'mono-semantic': { '--success': '#334155', '--warning': '#64748B', '--danger': '#94A3B8', '--info': '#CBD5E1' },
  },
  'shape-radius': {
    'round-modern': { '--theme-border-radius-button': '16px', '--theme-border-radius-input': '16px' },
    'extra-round': { '--theme-border-radius-button': '24px', '--theme-border-radius-input': '24px' },
    'sharp-classic': { '--theme-border-radius-button': '4px', '--theme-border-radius-input': '4px' },
    pill: { '--theme-border-radius-button': '999px', '--theme-border-radius-input': '999px' },
    mixed: { '--theme-border-radius-button': '14px', '--theme-border-radius-input': '10px' },
  },
  'typography-motion': {
    'system-default': { '--theme-font-family': 'system-ui, sans-serif', '--theme-transition-duration': '0.2s' },
    'modern-sans': { '--theme-font-family': '"IBM Plex Sans", sans-serif', '--theme-transition-duration': '0.24s' },
    'rounded-friendly': { '--theme-font-family': '"Nunito", "PingFang SC", sans-serif', '--theme-transition-duration': '0.32s' },
    'classic-serif': { '--theme-font-family': '"Iowan Old Style", Georgia, serif', '--theme-transition-duration': '0.28s' },
    'mono-tech': { '--theme-font-family': '"IBM Plex Mono", monospace', '--theme-transition-duration': '0.18s' },
  },
  'advanced-effects': {
    aurora: { '--theme-gradient-primary': 'linear-gradient(135deg, #5B6CFF 0%, #8DF7FF 100%)', '--theme-backdrop-blur': '18px' },
    cyber: { '--theme-gradient-primary': 'linear-gradient(135deg, #00F5D4 0%, #9B5DE5 100%)', '--theme-shadow-md': '0 0 32px rgba(155, 93, 229, 0.3)' },
    'glass-advanced': { '--theme-backdrop-blur': '20px', '--fill-0': 'rgba(214,228,255,0.48)' },
    starfield: { '--bg-base': '#08111E', '--theme-shadow-md': '0 24px 60px rgba(0, 0, 0, 0.42)' },
    water: { '--theme-gradient-primary': 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)', '--theme-backdrop-blur': '14px' },
  },
};

export const applyPresetToVariables = (groupId: ThemeDesignerGroupId, presetId: string, variables: ThemeVariableRecord): ThemeVariableRecord => {
  const patch = PRESET_VAR_PATCHES[groupId]?.[presetId];
  if (!patch) return variables;
  return {
    ...variables,
    ...patch,
  };
};
