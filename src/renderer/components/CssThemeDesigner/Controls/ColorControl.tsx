import React from 'react';
import { Button, ColorPicker, Input } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';
import { clamp, hexToHsl, hexToRgb, hslToHex, lightenColor, normalizeHex } from '../colorUtils';
import type { ColorControlValue } from '../types';
import DropdownControl from './DropdownControl';
import SliderControl from './SliderControl';

interface ColorControlProps {
  label: string;
  value: ColorControlValue;
  onChange: (value: ColorControlValue) => void;
}

const ColorControl: React.FC<ColorControlProps> = ({ label, value, onChange }) => {
  const { t } = useTranslation();
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [gradientOpen, setGradientOpen] = React.useState(Boolean(value.gradient.enabled));
  const [hexInput, setHexInput] = React.useState(value.color);
  const hsl = React.useMemo(() => hexToHsl(value.color), [value.color]);
  const rgb = React.useMemo(() => hexToRgb(value.color), [value.color]);

  React.useEffect(() => {
    setHexInput(value.color);
  }, [value.color]);

  const updateColor = (nextColor: string) => {
    onChange({
      ...value,
      color: normalizeHex(nextColor),
      gradient: {
        ...value.gradient,
        from: value.gradient.enabled ? value.gradient.from : normalizeHex(nextColor),
      },
    });
  };

  const updateHslChannel = (channel: 'h' | 's' | 'l', nextValue: number) => {
    const nextHsl = {
      ...hsl,
      [channel]: nextValue,
    };
    updateColor(hslToHex(nextHsl.h, nextHsl.s, nextHsl.l));
  };

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(value.color);
  };

  const handlePaste = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    const clipboardValue = await navigator.clipboard.readText();
    updateColor(clipboardValue);
  };

  return (
    <div className='rounded-16px border border-[var(--border-light)] bg-[var(--bg-1)] p-12px space-y-10px'>
      <div className='flex items-center gap-10px'>
        <button type='button' className='h-28px w-28px flex-shrink-0 rounded-10px border border-white/60 shadow-inner' style={{ background: value.gradient.enabled ? `linear-gradient(${value.gradient.angle}deg, ${value.gradient.from}, ${value.gradient.to})` : value.color }} onClick={() => setDetailsOpen((open) => !open)} aria-label={label}></button>
        <div className='min-w-0 flex-1'>
          <div className='text-13px text-[var(--text-primary)]'>{label}</div>
          <div className='text-11px text-[var(--text-secondary)]'>{value.color}</div>
        </div>
        <Button size='mini' type='secondary' onClick={() => setDetailsOpen((open) => !open)}>
          {detailsOpen ? t('settings.themeDesigner.controls.collapse') : t('settings.themeDesigner.controls.expand')}
        </Button>
      </div>

      <SliderControl label={t('settings.themeDesigner.controls.lightness')} value={hsl.l} min={0} max={100} unit='%' onChange={(nextValue) => updateColor(lightenColor(value.color, nextValue))} />

      {detailsOpen && (
        <div className='rounded-14px bg-[var(--bg-2)] p-12px space-y-12px'>
          <div className='grid gap-12px lg:grid-cols-[minmax(0,1fr)_160px]'>
            <div className='rounded-14px border border-[var(--border-light)] bg-[var(--bg-1)] p-10px'>
              <ColorPicker
                value={value.color}
                showText
                presetColors={['#4F6BFF', '#89A2FF', '#22B07D', '#DF5F67', '#111827', '#FFFFFF']}
                onChange={(nextValue) => {
                  if (typeof nextValue === 'string') {
                    updateColor(nextValue);
                  }
                }}
              />
            </div>
            <div className='space-y-8px'>
              <SliderControl label={t('settings.themeDesigner.controls.hue')} value={hsl.h} min={0} max={360} unit='°' onChange={(nextValue) => updateHslChannel('h', nextValue)} />
              <SliderControl label={t('settings.themeDesigner.controls.saturation')} value={hsl.s} min={0} max={100} unit='%' onChange={(nextValue) => updateHslChannel('s', nextValue)} />
              <SliderControl label={t('settings.themeDesigner.controls.lightness')} value={hsl.l} min={0} max={100} unit='%' onChange={(nextValue) => updateHslChannel('l', nextValue)} />
              <SliderControl label={t('settings.themeDesigner.controls.alpha')} value={value.alpha} min={0} max={100} unit='%' onChange={(nextValue) => onChange({ ...value, alpha: clamp(nextValue, 0, 100) })} />
            </div>
          </div>

          <div className='grid gap-10px lg:grid-cols-2'>
            <div className='space-y-6px'>
              <span className='text-12px text-[var(--text-secondary)]'>{t('settings.themeDesigner.controls.hex')}</span>
              <Input value={hexInput} onChange={setHexInput} onBlur={() => updateColor(hexInput)} onPressEnter={() => updateColor(hexInput)} />
            </div>
            <div className='space-y-6px'>
              <span className='text-12px text-[var(--text-secondary)]'>{t('settings.themeDesigner.controls.rgb')}</span>
              <div className='flex h-32px items-center rounded-10px border border-[var(--border-light)] bg-[var(--bg-1)] px-10px text-12px text-[var(--text-secondary)]'>
                {rgb.r}, {rgb.g}, {rgb.b}
              </div>
            </div>
          </div>

          <div className='flex flex-wrap gap-8px'>
            <Button size='mini' type='secondary' onClick={() => setGradientOpen((open) => !open)}>
              {t('settings.themeDesigner.controls.gradientMode')}
            </Button>
            <Button size='mini' onClick={() => void handleCopy()}>
              {t('settings.themeDesigner.controls.copy')}
            </Button>
            <Button size='mini' onClick={() => void handlePaste()}>
              {t('settings.themeDesigner.controls.paste')}
            </Button>
          </div>

          {gradientOpen && (
            <div className='space-y-10px rounded-14px border border-dashed border-[var(--border-base)] bg-[var(--bg-1)] p-12px'>
              <div className='grid gap-12px lg:grid-cols-2'>
                <div className='space-y-6px'>
                  <span className='text-12px text-[var(--text-secondary)]'>{t('settings.themeDesigner.controls.startColor')}</span>
                  <ColorPicker
                    value={value.gradient.from}
                    showText
                    onChange={(nextValue) => {
                      if (typeof nextValue === 'string') {
                        onChange({
                          ...value,
                          gradient: {
                            ...value.gradient,
                            enabled: true,
                            from: normalizeHex(nextValue),
                          },
                        });
                      }
                    }}
                  />
                </div>
                <div className='space-y-6px'>
                  <span className='text-12px text-[var(--text-secondary)]'>{t('settings.themeDesigner.controls.endColor')}</span>
                  <ColorPicker
                    value={value.gradient.to}
                    showText
                    onChange={(nextValue) => {
                      if (typeof nextValue === 'string') {
                        onChange({
                          ...value,
                          gradient: {
                            ...value.gradient,
                            enabled: true,
                            to: normalizeHex(nextValue),
                          },
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <SliderControl
                label={t('settings.themeDesigner.controls.angle')}
                value={value.gradient.angle}
                min={0}
                max={360}
                unit='°'
                onChange={(nextValue) =>
                  onChange({
                    ...value,
                    gradient: {
                      ...value.gradient,
                      enabled: true,
                      angle: nextValue,
                    },
                  })
                }
              />

              <DropdownControl
                label={t('settings.themeDesigner.controls.type')}
                value={value.gradient.type}
                options={[
                  { label: t('settings.themeDesigner.controls.linear'), value: 'linear' },
                  { label: t('settings.themeDesigner.controls.radial'), value: 'radial' },
                ]}
                onChange={(nextValue) =>
                  onChange({
                    ...value,
                    gradient: {
                      ...value.gradient,
                      enabled: true,
                      type: nextValue as 'linear' | 'radial',
                    },
                  })
                }
              />

              <div className='space-y-6px'>
                <span className='text-12px text-[var(--text-secondary)]'>{t('settings.themeDesigner.controls.preview')}</span>
                <div
                  className='h-24px rounded-full border border-[var(--border-light)]'
                  style={{
                    background: value.gradient.type === 'radial' ? `radial-gradient(circle, ${value.gradient.from} 0%, ${value.gradient.to} 100%)` : `linear-gradient(${value.gradient.angle}deg, ${value.gradient.from} 0%, ${value.gradient.to} 100%)`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorControl;
