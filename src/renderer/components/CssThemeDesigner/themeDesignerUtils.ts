import { SHADOW_PRESET_VALUES } from './mockData';
import type { ShadowPresetValue, ThemeDesignerPanelTab } from './types';

interface ResolveThemeDesignerSaveCssOptions {
  activeTab: ThemeDesignerPanelTab;
  generatedCss: string;
  codeValue: string;
}

export const resolveThemeDesignerSaveCss = ({ activeTab, generatedCss, codeValue }: ResolveThemeDesignerSaveCssOptions): string => {
  return activeTab === 'code' ? codeValue : generatedCss;
};

export const resolveShadowPresetValue = (presetId: string, currentValue: ShadowPresetValue): ShadowPresetValue => {
  return {
    ...(SHADOW_PRESET_VALUES[presetId] || currentValue),
  };
};
