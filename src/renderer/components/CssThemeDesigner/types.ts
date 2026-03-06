import type { CSSProperties } from 'react';

export type ThemeDesignerMode = 'light' | 'dark';
export type ThemeDesignerPanelTab = 'visual' | 'code';
export type ThemeDesignerSceneId = 'chat' | 'sidebar' | 'settings' | 'workspace';
export type ThemeDesignerGroupId = 'global-tone' | 'aou-palette' | 'backgrounds' | 'text' | 'messages-components' | 'borders' | 'semantic-colors' | 'shape-radius' | 'typography-motion' | 'advanced-effects';

export type ThemeVariableRecord = Record<`--${string}`, string>;

export interface ThemeDesignerVariableBundle {
  light: ThemeVariableRecord;
  dark: ThemeVariableRecord;
}

export interface ThemeDesignerSceneDefinition {
  id: ThemeDesignerSceneId;
  labelKey: string;
}

export interface ThemeDesignerPreset {
  id: string;
  labelKey: string;
  swatches: string[];
  previewStyle?: CSSProperties;
}

export interface ThemeDesignerGroupDefinition {
  id: ThemeDesignerGroupId;
  titleKey: string;
  descriptionKey: string;
  sceneIds: ThemeDesignerSceneId[];
  presets: ThemeDesignerPreset[];
}

export interface GradientControlValue {
  enabled: boolean;
  from: string;
  to: string;
  angle: number;
  type: 'linear' | 'radial';
}

export interface ColorControlValue {
  color: string;
  alpha: number;
  gradient: GradientControlValue;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface ShadowPresetValue {
  presetId: string;
  intensity: number;
  type: 'outset' | 'inset';
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  opacity: number;
}

export interface ThemeDesignerSavePayload {
  name: string;
  css: string;
  cover?: string;
}
