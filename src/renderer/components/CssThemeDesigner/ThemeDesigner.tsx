import { ipcBridge } from '@/common';
import { Button, Input, Message, Switch } from '@arco-design/web-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ControlPanel from './ControlPanel';
import { applyPresetToVariables, DEFAULT_GROUP_ID, DEFAULT_SCENE_ID, GROUP_KEY_BY_ID, INITIAL_THEME_DESIGNER_VARIABLES, serializeThemeVariables, SHADOW_PRESET_VALUES, THEME_DESIGNER_GROUPS } from './mockData';
import { resolveThemeDesignerSaveCss } from './themeDesignerUtils';
import ThemePreview from './ThemePreview';
import { hexToRgb } from './colorUtils';
import type { ShadowPresetValue, ThemeDesignerGroupId, ThemeDesignerMode, ThemeDesignerPanelTab, ThemeDesignerSavePayload, ThemeDesignerSceneId, ThemeDesignerVariableBundle, ThemeVariableRecord } from './types';

interface ThemeDesignerProps {
  themeName?: string;
  themeCover?: string;
  initialCss?: string;
  onBack: () => void;
  onSave: (payload: ThemeDesignerSavePayload) => void | Promise<void>;
  onDelete?: () => void;
}

const getOtherMode = (mode: ThemeDesignerMode): ThemeDesignerMode => {
  return mode === 'light' ? 'dark' : 'light';
};

const buildShadowCss = (shadow: ShadowPresetValue, primaryColor: string): string => {
  if (shadow.presetId === 'none' || shadow.intensity === 0) {
    return 'none';
  }

  const { r, g, b } = hexToRgb(primaryColor);
  const alpha = Math.min(1, Math.max(0, (shadow.opacity / 100) * (shadow.intensity / 100)));
  const prefix = shadow.type === 'inset' ? 'inset ' : '';

  if (shadow.presetId === 'neon-glow') {
    return `${prefix}0 ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
  }

  if (shadow.presetId === 'classic-3d') {
    const whiteAlpha = Math.min(0.6, alpha + 0.08).toFixed(2);
    return `inset 1px 1px 0 rgba(255, 255, 255, ${whiteAlpha}), ${prefix}${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px rgba(15, 23, 42, ${alpha.toFixed(2)})`;
  }

  return `${prefix}${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px rgba(15, 23, 42, ${alpha.toFixed(2)})`;
};

const ThemeDesigner: React.FC<ThemeDesignerProps> = ({ themeName = '', themeCover, initialCss, onBack, onSave, onDelete }) => {
  const { t } = useTranslation();
  const [name, setName] = React.useState(themeName);
  const [mode, setMode] = React.useState<ThemeDesignerMode>('light');
  const [sceneId, setSceneId] = React.useState<ThemeDesignerSceneId>(DEFAULT_SCENE_ID);
  const [activeGroupId, setActiveGroupId] = React.useState<ThemeDesignerGroupId>(DEFAULT_GROUP_ID);
  const [panelTab, setPanelTab] = React.useState<ThemeDesignerPanelTab>('visual');
  const [panelCollapsed, setPanelCollapsed] = React.useState(false);
  const [linkedMode, setLinkedMode] = React.useState(false);
  const [variableBundle, setVariableBundle] = React.useState<ThemeDesignerVariableBundle>(INITIAL_THEME_DESIGNER_VARIABLES);
  const [appliedPresetIds, setAppliedPresetIds] = React.useState<Partial<Record<ThemeDesignerGroupId, string>>>({});
  const [shadowValue, setShadowValue] = React.useState<ShadowPresetValue>(SHADOW_PRESET_VALUES['soft-float']);
  const [codeValue, setCodeValue] = React.useState(initialCss || serializeThemeVariables(INITIAL_THEME_DESIGNER_VARIABLES));
  const [hasVisualChanges, setHasVisualChanges] = React.useState(false);

  const generatedCss = React.useMemo(() => serializeThemeVariables(variableBundle), [variableBundle]);
  const currentVariables = variableBundle[mode];
  const currentGroupLabelKey = GROUP_KEY_BY_ID[activeGroupId] || GROUP_KEY_BY_ID[DEFAULT_GROUP_ID];

  React.useEffect(() => {
    if (!initialCss || hasVisualChanges) {
      setCodeValue(generatedCss);
    }
  }, [generatedCss, hasVisualChanges, initialCss]);

  const updateVariables = React.useCallback(
    (updates: Partial<ThemeVariableRecord>) => {
      setHasVisualChanges(true);
      setVariableBundle((previous) => {
        const nextCurrent = {
          ...previous[mode],
          ...updates,
        };
        const nextBundle: ThemeDesignerVariableBundle = {
          ...previous,
          [mode]: nextCurrent,
        };

        if (linkedMode) {
          const otherMode = getOtherMode(mode);
          nextBundle[otherMode] = {
            ...previous[otherMode],
            ...updates,
          };
        }

        return nextBundle;
      });
    },
    [linkedMode, mode]
  );

  const handleApplyPreset = React.useCallback(
    (groupId: ThemeDesignerGroupId, presetId: string) => {
      setHasVisualChanges(true);
      setAppliedPresetIds((previous) => ({
        ...previous,
        [groupId]: presetId,
      }));
      setVariableBundle((previous) => {
        const nextCurrent = applyPresetToVariables(groupId, presetId, previous[mode]);
        const nextBundle: ThemeDesignerVariableBundle = {
          ...previous,
          [mode]: nextCurrent,
        };
        if (linkedMode) {
          const otherMode = getOtherMode(mode);
          nextBundle[otherMode] = applyPresetToVariables(groupId, presetId, previous[otherMode]);
        }
        return nextBundle;
      });
    },
    [linkedMode, mode]
  );

  const handleShadowChange = React.useCallback(
    (nextShadow: ShadowPresetValue) => {
      setShadowValue(nextShadow);
      const shadowCss = buildShadowCss(nextShadow, currentVariables['--primary'] || '#4F6BFF');
      updateVariables({ '--theme-shadow-md': shadowCss });
    },
    [currentVariables, updateVariables]
  );

  const handlePreviewAreaClick = React.useCallback((groupId: ThemeDesignerGroupId) => {
    setPanelCollapsed(false);
    setPanelTab('visual');
    setActiveGroupId(groupId);
  }, []);

  const handleImportCss = React.useCallback(async () => {
    try {
      const files = await ipcBridge.dialog.showOpen.invoke({
        properties: ['openFile'],
        filters: [{ name: 'CSS', extensions: ['css'] }],
      });

      if (!files?.[0]) return;

      const importedCss = await ipcBridge.fs.readFile.invoke({ path: files[0] });
      setCodeValue(importedCss);
      setPanelTab('code');
      setHasVisualChanges(false);
      Message.success(t('settings.themeDesigner.importSuccess'));
    } catch (error) {
      console.error('Failed to import theme css:', error);
      Message.error(t('settings.themeDesigner.importFailed'));
    }
  }, [t]);

  const handleExportCss = React.useCallback(() => {
    try {
      const cssToExport = resolveThemeDesignerSaveCss({
        activeTab: panelTab,
        generatedCss,
        codeValue,
      });
      const blob = new Blob([cssToExport], { type: 'text/css;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = (name.trim() || 'theme').replace(/\s+/g, '-').toLowerCase();
      link.href = url;
      link.download = `${safeName}.css`;
      link.click();
      URL.revokeObjectURL(url);
      Message.success(t('settings.themeDesigner.exportSuccess'));
    } catch (error) {
      console.error('Failed to export theme css:', error);
      Message.error(t('settings.themeDesigner.exportFailed'));
    }
  }, [codeValue, generatedCss, name, panelTab, t]);

  const handleSave = React.useCallback(async () => {
    await onSave({
      name: name.trim(),
      css: resolveThemeDesignerSaveCss({
        activeTab: panelTab,
        generatedCss,
        codeValue,
      }),
      cover: themeCover,
    });
  }, [codeValue, generatedCss, name, onSave, panelTab, themeCover]);

  const controlPanelProps = {
    collapsed: panelCollapsed,
    activeTab: panelTab,
    activeGroupId,
    groups: THEME_DESIGNER_GROUPS,
    variables: currentVariables,
    appliedPresetIds,
    shadowValue,
    codeValue,
    onTabChange: setPanelTab,
    onToggleCollapse: () => setPanelCollapsed((collapsed) => !collapsed),
    onGroupSelect: setActiveGroupId,
    onApplyPreset: handleApplyPreset,
    onCodeChange: setCodeValue,
    onSetVariables: updateVariables,
    onShadowChange: handleShadowChange,
  };

  const previewProps = {
    mode,
    sceneId,
    currentGroupId: activeGroupId,
    styleVars: currentVariables,
    onAreaClick: handlePreviewAreaClick,
    onSceneChange: setSceneId,
  };

  return (
    <div className='theme-designer flex min-h-640px flex-col gap-14px'>
      <div className='theme-designer__toolbar flex flex-wrap items-center gap-10px rounded-28px border border-[var(--border-light)] bg-[var(--bg-1)] p-14px'>
        <Input value={name} onChange={setName} placeholder={t('settings.themeDesigner.namePlaceholder')} className='min-w-220px flex-1 [&_.arco-input]:rounded-14px' />
        <Button onClick={() => void handleImportCss()}>{t('settings.themeDesigner.import')}</Button>
        <Button onClick={handleExportCss}>{t('settings.themeDesigner.export')}</Button>
        <label className='flex items-center gap-8px rounded-full bg-[var(--bg-2)] px-12px py-9px text-12px text-[var(--text-primary)]'>
          <Switch checked={linkedMode} onChange={setLinkedMode} size='small' />
          <span>{t('settings.themeDesigner.linkModes')}</span>
        </label>
        {onDelete ? (
          <Button status='danger' type='outline' onClick={onDelete}>
            {t('common.delete')}
          </Button>
        ) : null}
        <div className='ml-auto flex items-center gap-10px'>
          <Button onClick={onBack}>{t('common.cancel')}</Button>
          <Button type='primary' disabled={!name.trim()} onClick={() => void handleSave()}>
            {t('common.save')}
          </Button>
        </div>
      </div>

      <div className='grid flex-1 min-h-0 gap-14px xl:grid-cols-[minmax(320px,32%)_minmax(0,1fr)]'>
        <ControlPanel {...controlPanelProps} />

        <ThemePreview {...previewProps} />
      </div>

      <div className='theme-designer__footer flex flex-wrap items-center gap-10px rounded-24px border border-[var(--border-light)] bg-[var(--bg-1)] px-16px py-12px'>
        <div className='inline-flex rounded-full bg-[var(--bg-2)] p-4px'>
          <button type='button' onClick={() => setMode('light')} className={`rounded-full px-14px py-8px text-12px transition-colors ${mode === 'light' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-secondary)]'}`}>
            {t('settings.themeDesigner.lightMode')}
          </button>
          <button type='button' onClick={() => setMode('dark')} className={`rounded-full px-14px py-8px text-12px transition-colors ${mode === 'dark' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-secondary)]'}`}>
            {t('settings.themeDesigner.darkMode')}
          </button>
        </div>
        <div className='text-12px text-[var(--text-secondary)]'>
          {t('settings.themeDesigner.currentGroupLabel')} <span className='text-[var(--text-primary)]'>{t(currentGroupLabelKey)}</span>
        </div>
      </div>
    </div>
  );
};

export default ThemeDesigner;
