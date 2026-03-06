import React from 'react';
import { Button } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';
import type { ShadowPresetValue, ThemeDesignerPreset } from '../types';
import { resolveShadowPresetValue } from '../themeDesignerUtils';
import DropdownControl from './DropdownControl';
import PresetStrip from './PresetStrip';
import SliderControl from './SliderControl';

interface ShadowPresetControlProps {
  label: string;
  presets: ThemeDesignerPreset[];
  value: ShadowPresetValue;
  onChange: (value: ShadowPresetValue) => void;
}

const ShadowPresetControl: React.FC<ShadowPresetControlProps> = ({ label, presets, value, onChange }) => {
  const { t } = useTranslation();
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  return (
    <div className='rounded-16px border border-[var(--border-light)] bg-[var(--bg-1)] p-12px space-y-10px'>
      <div className='flex items-center justify-between gap-12px'>
        <div>
          <div className='text-13px text-[var(--text-primary)]'>{label}</div>
          <div className='text-11px text-[var(--text-secondary)]'>{t('settings.themeDesigner.controls.shadowStyle')}</div>
        </div>
        <Button size='mini' type='secondary' onClick={() => setDetailsOpen((open) => !open)}>
          {detailsOpen ? t('settings.themeDesigner.controls.collapse') : t('settings.themeDesigner.controls.details')}
        </Button>
      </div>

      <PresetStrip items={presets} activeId={value.presetId} onSelect={(presetId) => onChange(resolveShadowPresetValue(presetId, value))} />

      <SliderControl label={t('settings.themeDesigner.controls.intensity')} value={value.intensity} min={0} max={100} unit='%' onChange={(nextValue) => onChange({ ...value, intensity: nextValue })} />

      {detailsOpen && (
        <div className='rounded-14px bg-[var(--bg-2)] p-12px space-y-10px'>
          <DropdownControl
            label={t('settings.themeDesigner.controls.type')}
            value={value.type}
            options={[
              { label: t('settings.themeDesigner.controls.outset'), value: 'outset' },
              { label: t('settings.themeDesigner.controls.inset'), value: 'inset' },
            ]}
            onChange={(nextValue) => onChange({ ...value, type: nextValue as 'outset' | 'inset' })}
          />
          <SliderControl label={t('settings.themeDesigner.controls.offsetX')} value={value.offsetX} min={-24} max={24} unit='px' onChange={(nextValue) => onChange({ ...value, offsetX: nextValue })} />
          <SliderControl label={t('settings.themeDesigner.controls.offsetY')} value={value.offsetY} min={-24} max={32} unit='px' onChange={(nextValue) => onChange({ ...value, offsetY: nextValue })} />
          <SliderControl label={t('settings.themeDesigner.controls.blur')} value={value.blur} min={0} max={64} unit='px' onChange={(nextValue) => onChange({ ...value, blur: nextValue })} />
          <SliderControl label={t('settings.themeDesigner.controls.spread')} value={value.spread} min={-24} max={24} unit='px' onChange={(nextValue) => onChange({ ...value, spread: nextValue })} />
          <SliderControl label={t('settings.themeDesigner.controls.opacity')} value={value.opacity} min={0} max={100} unit='%' onChange={(nextValue) => onChange({ ...value, opacity: nextValue })} />
        </div>
      )}
    </div>
  );
};

export default ShadowPresetControl;
