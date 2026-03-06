import React from 'react';
import { Button, Input } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';
import { createColorValue, formatCssColorValue, parseCssColorValue, readCssLength } from './colorUtils';
import { DEFAULT_COLOR_CONTROL_VALUES, INITIAL_THEME_DESIGNER_VARIABLES, SHADOW_PRESET_VALUES } from './mockData';
import type { ColorControlValue, ShadowPresetValue, ThemeDesignerGroupDefinition, ThemeDesignerGroupId, ThemeDesignerPanelTab, ThemeVariableRecord } from './types';
import ColorControl from './Controls/ColorControl';
import DropdownControl from './Controls/DropdownControl';
import ShadowPresetControl from './Controls/ShadowPresetControl';
import SliderControl from './Controls/SliderControl';
import ControlGroupCard from './ControlGroups/ControlGroupCard';

interface ControlPanelProps {
  collapsed: boolean;
  activeTab: ThemeDesignerPanelTab;
  activeGroupId: ThemeDesignerGroupId;
  groups: ThemeDesignerGroupDefinition[];
  variables?: ThemeVariableRecord;
  codeValue: string;
  appliedPresetIds?: Partial<Record<ThemeDesignerGroupId, string>>;
  shadowValue?: ShadowPresetValue;
  onTabChange: (tab: ThemeDesignerPanelTab) => void;
  onToggleCollapse: () => void;
  onGroupSelect: (groupId: ThemeDesignerGroupId) => void;
  onApplyPreset?: (groupId: ThemeDesignerGroupId, presetId: string) => void;
  onCodeChange: (value: string) => void;
  onSetVariables?: (updates: Partial<ThemeVariableRecord>) => void;
  onShadowChange?: (value: ShadowPresetValue) => void;
}

const FONT_OPTIONS = [
  { labelKey: 'settings.themeDesigner.fonts.ibmPlexSans', value: '"IBM Plex Sans", "PingFang SC", sans-serif' },
  { labelKey: 'settings.themeDesigner.fonts.nunito', value: '"Nunito", "PingFang SC", sans-serif' },
  { labelKey: 'settings.themeDesigner.fonts.serif', value: '"Iowan Old Style", Georgia, serif' },
  { labelKey: 'settings.themeDesigner.fonts.mono', value: '"IBM Plex Mono", monospace' },
  { labelKey: 'settings.themeDesigner.fonts.system', value: 'system-ui, sans-serif' },
];

const TIMING_OPTIONS = [
  { labelKey: 'settings.themeDesigner.timing.snappy', value: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
  { labelKey: 'settings.themeDesigner.timing.ease', value: 'ease' },
  { labelKey: 'settings.themeDesigner.timing.easeOut', value: 'ease-out' },
  { labelKey: 'settings.themeDesigner.timing.spring', value: 'cubic-bezier(0.17, 0.89, 0.32, 1.28)' },
];

const SHADOW_PRESETS = [
  {
    id: 'soft-float',
    labelKey: 'settings.themeDesigner.shadowPresets.softFloat',
    swatches: ['#8DA2FF', '#DCE7FF'],
  },
  {
    id: 'classic-3d',
    labelKey: 'settings.themeDesigner.shadowPresets.classic3d',
    swatches: ['#7A8798', '#E2E8F0'],
  },
  {
    id: 'neon-glow',
    labelKey: 'settings.themeDesigner.shadowPresets.neonGlow',
    swatches: ['#00F5D4', '#9B5DE5'],
  },
  {
    id: 'none',
    labelKey: 'settings.themeDesigner.shadowPresets.none',
    swatches: ['#CBD5E1', '#E2E8F0'],
  },
];

const themePanelVars = INITIAL_THEME_DESIGNER_VARIABLES.light;

const ControlPanel: React.FC<ControlPanelProps> = ({ collapsed, activeTab, activeGroupId, groups, variables = themePanelVars, codeValue, appliedPresetIds, shadowValue = SHADOW_PRESET_VALUES['soft-float'], onTabChange, onToggleCollapse, onGroupSelect, onApplyPreset, onCodeChange, onSetVariables, onShadowChange }) => {
  const { t } = useTranslation();
  const [expandedGroupIds, setExpandedGroupIds] = React.useState<Set<ThemeDesignerGroupId>>(() => new Set<ThemeDesignerGroupId>([activeGroupId]));
  const groupRefs = React.useRef<Partial<Record<ThemeDesignerGroupId, HTMLDivElement | null>>>({});

  React.useEffect(() => {
    setExpandedGroupIds((previous) => {
      const next = new Set(previous);
      next.add(activeGroupId);
      return next;
    });
    groupRefs.current[activeGroupId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeGroupId]);

  const setVariables = (updates: Partial<ThemeVariableRecord>) => {
    onSetVariables?.(updates);
  };

  const buildColorValue = (cssVar: keyof ThemeVariableRecord, gradientSource: { from: keyof ThemeVariableRecord; to: keyof ThemeVariableRecord } = { from: cssVar, to: cssVar }): ColorControlValue => {
    const baseValue = createColorValue(variables[cssVar] || '#4F6BFF', {
      from: parseCssColorValue(variables[gradientSource.from] || variables[cssVar] || '#4F6BFF').color,
      to: parseCssColorValue(variables[gradientSource.to] || variables[cssVar] || '#4F6BFF').color,
    });
    return {
      ...DEFAULT_COLOR_CONTROL_VALUES.primary,
      color: baseValue.color,
      alpha: baseValue.alpha,
      gradient: {
        enabled: cssVar === '--primary' || cssVar === '--message-user-bg',
        from: baseValue.gradient.from,
        to: baseValue.gradient.to,
        angle: 135,
        type: 'linear',
      },
    };
  };

  const toCssColor = (nextValue: ColorControlValue): string => {
    return formatCssColorValue(nextValue.color, nextValue.alpha);
  };

  const renderPlaceholder = (groupId: ThemeDesignerGroupId) => {
    switch (groupId) {
      case 'global-tone':
        return (
          <div className='space-y-12px'>
            <ColorControl label={t('settings.themeDesigner.sampleControls.primaryAccent')} value={buildColorValue('--primary', { from: '--primary', to: '--brand-light' })} onChange={(nextValue) => setVariables({ '--primary': toCssColor(nextValue), '--brand': toCssColor(nextValue), '--brand-light': nextValue.gradient.to })} />
            <div className='theme-designer-placeholder rounded-14px border border-dashed border-[var(--border-base)] bg-[var(--bg-2)] px-12px py-10px text-12px text-[var(--text-secondary)]'>TODO(themeVariableMap): {t('settings.themeDesigner.placeholders.globalTone')}</div>
          </div>
        );
      case 'aou-palette':
        return (
          <div className='space-y-12px'>
            <ColorControl
              label={t('settings.themeDesigner.sampleControls.scaleEndpoints')}
              value={{
                ...createColorValue(variables['--brand'] || '#5A72FF'),
                gradient: {
                  enabled: true,
                  from: parseCssColorValue(variables['--brand'] || '#5A72FF').color,
                  to: parseCssColorValue(variables['--brand-light'] || '#89A2FF').color,
                  angle: 0,
                  type: 'linear',
                },
              }}
              onChange={(nextValue) => setVariables({ '--brand': nextValue.gradient.from, '--brand-light': nextValue.gradient.to })}
            />
            <div className='theme-designer-placeholder rounded-14px border border-dashed border-[var(--border-base)] bg-[var(--bg-2)] px-12px py-10px text-12px text-[var(--text-secondary)]'>TODO(themeVariableMap): {t('settings.themeDesigner.placeholders.aouPalette')}</div>
          </div>
        );
      case 'backgrounds':
        return (
          <div className='space-y-12px'>
            <ColorControl label={t('settings.themeDesigner.sampleControls.surfaceBase')} value={buildColorValue('--bg-1', { from: '--bg-1', to: '--bg-2' })} onChange={(nextValue) => setVariables({ '--bg-1': toCssColor(nextValue), '--bg-2': nextValue.gradient.to, '--fill': toCssColor(nextValue) })} />
            <div className='theme-designer-placeholder rounded-14px border border-dashed border-[var(--border-base)] bg-[var(--bg-2)] px-12px py-10px text-12px text-[var(--text-secondary)]'>TODO(themeVariableMap): {t('settings.themeDesigner.placeholders.backgrounds')}</div>
          </div>
        );
      case 'text':
        return (
          <div className='space-y-12px'>
            <ColorControl label={t('settings.themeDesigner.sampleControls.primaryText')} value={buildColorValue('--text-primary', { from: '--text-primary', to: '--text-secondary' })} onChange={(nextValue) => setVariables({ '--text-primary': toCssColor(nextValue), '--text-secondary': nextValue.gradient.to })} />
            <div className='theme-designer-placeholder rounded-14px border border-dashed border-[var(--border-base)] bg-[var(--bg-2)] px-12px py-10px text-12px text-[var(--text-secondary)]'>TODO(themeVariableMap): {t('settings.themeDesigner.placeholders.text')}</div>
          </div>
        );
      case 'messages-components':
        return (
          <div className='space-y-12px'>
            <ColorControl label={t('settings.themeDesigner.sampleControls.userBubble')} value={buildColorValue('--message-user-bg', { from: '--message-user-bg', to: '--brand-light' })} onChange={(nextValue) => setVariables({ '--message-user-bg': toCssColor(nextValue), '--message-tips-bg': nextValue.gradient.to })} />
            <div className='theme-designer-placeholder rounded-14px border border-dashed border-[var(--border-base)] bg-[var(--bg-2)] px-12px py-10px text-12px text-[var(--text-secondary)]'>TODO(themeVariableMap): {t('settings.themeDesigner.placeholders.messages')}</div>
          </div>
        );
      case 'borders':
        return (
          <div className='space-y-12px'>
            <ColorControl label={t('settings.themeDesigner.sampleControls.borderStroke')} value={buildColorValue('--border-base', { from: '--border-base', to: '--border-light' })} onChange={(nextValue) => setVariables({ '--border-base': toCssColor(nextValue), '--border-light': nextValue.gradient.to })} />
            <div className='theme-designer-placeholder rounded-14px border border-dashed border-[var(--border-base)] bg-[var(--bg-2)] px-12px py-10px text-12px text-[var(--text-secondary)]'>TODO(themeVariableMap): {t('settings.themeDesigner.placeholders.borders')}</div>
          </div>
        );
      case 'semantic-colors':
        return (
          <div className='space-y-12px'>
            <ColorControl label={t('settings.themeDesigner.sampleControls.successTone')} value={buildColorValue('--success', { from: '--success', to: '--warning' })} onChange={(nextValue) => setVariables({ '--success': toCssColor(nextValue), '--warning': nextValue.gradient.to })} />
            <div className='theme-designer-placeholder rounded-14px border border-dashed border-[var(--border-base)] bg-[var(--bg-2)] px-12px py-10px text-12px text-[var(--text-secondary)]'>TODO(themeVariableMap): {t('settings.themeDesigner.placeholders.semantic')}</div>
          </div>
        );
      case 'shape-radius':
        return (
          <div className='space-y-12px'>
            <SliderControl label={t('settings.themeDesigner.sampleControls.buttonRadius')} value={readCssLength(variables['--theme-border-radius-button'], 12)} min={0} max={32} unit='px' onChange={(nextValue) => setVariables({ '--theme-border-radius-button': `${nextValue}px`, '--theme-border-radius-input': `${nextValue}px` })} />
            <div className='theme-designer-placeholder rounded-14px border border-dashed border-[var(--border-base)] bg-[var(--bg-2)] px-12px py-10px text-12px text-[var(--text-secondary)]'>TODO(themeVariableMap): {t('settings.themeDesigner.placeholders.shape')}</div>
          </div>
        );
      case 'typography-motion':
        return (
          <div className='space-y-12px'>
            <DropdownControl label={t('settings.themeDesigner.sampleControls.fontFamily')} value={variables['--theme-font-family'] || FONT_OPTIONS[0].value} options={FONT_OPTIONS.map((option) => ({ label: t(option.labelKey), value: option.value }))} onChange={(nextValue) => setVariables({ '--theme-font-family': nextValue })} />
            <DropdownControl label={t('settings.themeDesigner.sampleControls.timingFunction')} value={variables['--theme-transition-timing'] || TIMING_OPTIONS[0].value} options={TIMING_OPTIONS.map((option) => ({ label: t(option.labelKey), value: option.value }))} onChange={(nextValue) => setVariables({ '--theme-transition-timing': nextValue })} />
            <SliderControl label={t('settings.themeDesigner.sampleControls.transitionDuration')} value={Number(readCssLength(variables['--theme-transition-duration'], 0.28).toFixed(2))} min={0} max={1} step={0.01} unit='s' onChange={(nextValue) => setVariables({ '--theme-transition-duration': `${nextValue.toFixed(2)}s` })} />
            <div className='theme-designer-placeholder rounded-14px border border-dashed border-[var(--border-base)] bg-[var(--bg-2)] px-12px py-10px text-12px text-[var(--text-secondary)]'>TODO(themeVariableMap): {t('settings.themeDesigner.placeholders.typography')}</div>
          </div>
        );
      case 'advanced-effects':
      default:
        return (
          <div className='space-y-12px'>
            <ShadowPresetControl label={t('settings.themeDesigner.sampleControls.shadowStyle')} presets={SHADOW_PRESETS} value={shadowValue} onChange={(nextValue) => onShadowChange?.(nextValue)} />
            <div className='theme-designer-placeholder rounded-14px border border-dashed border-[var(--border-base)] bg-[var(--bg-2)] px-12px py-10px text-12px text-[var(--text-secondary)]'>TODO(themeVariableMap): {t('settings.themeDesigner.placeholders.advanced')}</div>
          </div>
        );
    }
  };

  if (collapsed) {
    return (
      <aside className='theme-designer-control-panel flex h-full w-56px flex-col items-center gap-12px rounded-24px border border-[var(--border-light)] bg-[var(--bg-1)] px-10px py-16px'>
        <button type='button' onClick={onToggleCollapse} className='flex h-32px w-32px items-center justify-center rounded-full border border-[var(--border-light)] text-[var(--text-primary)]'>
          {'>'}
        </button>
        <button type='button' onClick={() => onTabChange('visual')} className={`w-full rounded-12px px-4px py-10px text-11px ${activeTab === 'visual' ? 'bg-[var(--bg-2)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
          V
        </button>
        <button type='button' onClick={() => onTabChange('code')} className={`w-full rounded-12px px-4px py-10px text-11px ${activeTab === 'code' ? 'bg-[var(--bg-2)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
          {'</>'}
        </button>
      </aside>
    );
  }

  return (
    <aside className='theme-designer-control-panel flex h-full min-h-0 w-full flex-col rounded-28px border border-[var(--border-light)] bg-[var(--theme-gradient-surface)] p-16px'>
      <div className='theme-designer-control-panel__tabs flex items-center gap-8px'>
        <button type='button' onClick={() => onTabChange('visual')} className={`rounded-full px-14px py-8px text-12px transition-colors ${activeTab === 'visual' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-2)] text-[var(--text-secondary)]'}`}>
          {'[ ]'} {t('settings.themeDesigner.visualTab')}
        </button>
        <button type='button' onClick={() => onTabChange('code')} className={`rounded-full px-14px py-8px text-12px transition-colors ${activeTab === 'code' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-2)] text-[var(--text-secondary)]'}`}>
          {'</>'} {t('settings.themeDesigner.codeTab')}
        </button>
        <div className='ml-auto'>
          <Button size='mini' type='secondary' onClick={onToggleCollapse}>
            {t('settings.themeDesigner.collapse')}
          </Button>
        </div>
      </div>

      {activeTab === 'visual' ? (
        <div className='mt-14px flex-1 space-y-12px overflow-y-auto pr-4px'>
          {groups.map((group) => {
            const expanded = expandedGroupIds.has(group.id);
            return (
              <ControlGroupCard
                key={group.id}
                ref={(node) => {
                  groupRefs.current[group.id] = node;
                }}
                group={group}
                expanded={expanded}
                active={group.id === activeGroupId}
                activePresetId={appliedPresetIds?.[group.id]}
                onToggle={() =>
                  setExpandedGroupIds((previous) => {
                    const next = new Set(previous);
                    if (next.has(group.id)) {
                      next.delete(group.id);
                    } else {
                      next.add(group.id);
                    }
                    return next;
                  })
                }
                onSelect={() => onGroupSelect(group.id)}
                onApplyPreset={(presetId) => onApplyPreset?.(group.id, presetId)}
              >
                {renderPlaceholder(group.id)}
              </ControlGroupCard>
            );
          })}
        </div>
      ) : (
        <div className='mt-14px flex-1 min-h-0 rounded-20px border border-[var(--border-light)] bg-[var(--bg-1)] p-12px'>
          <div className='mb-8px text-12px text-[var(--text-secondary)]'>{t('settings.themeDesigner.codeModeHint')}</div>
          <Input.TextArea value={codeValue} onChange={onCodeChange} className='theme-designer-control-panel__code h-full [&_.arco-textarea]:min-h-320px [&_.arco-textarea]:font-mono [&_.arco-textarea]:text-12px' placeholder={t('settings.themeDesigner.codeModePlaceholder')} autoSize={{ minRows: 16, maxRows: 24 }} />
        </div>
      )}
    </aside>
  );
};

export default ControlPanel;
