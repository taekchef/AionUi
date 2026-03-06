import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import type { ThemeDesignerPreset } from '../types';

interface PresetStripProps {
  items: ThemeDesignerPreset[];
  activeId?: string;
  onSelect?: (presetId: string) => void;
  className?: string;
}

const buildPreviewBackground = (preset: ThemeDesignerPreset): string => {
  if (preset.previewStyle?.background && typeof preset.previewStyle.background === 'string') {
    return preset.previewStyle.background;
  }
  if (preset.swatches.length === 1) {
    return preset.swatches[0];
  }
  return `linear-gradient(135deg, ${preset.swatches.join(', ')})`;
};

const PresetStrip: React.FC<PresetStripProps> = ({ items, activeId, onSelect, className }) => {
  const { t } = useTranslation();

  return (
    <div className={classNames('theme-designer-preset-strip flex gap-8px overflow-x-auto pb-4px', className)}>
      {items.map((preset) => {
        const active = preset.id === activeId;
        return (
          <button key={preset.id} type='button' title={t(preset.labelKey)} aria-label={t(preset.labelKey)} onClick={() => onSelect?.(preset.id)} className={classNames('group relative h-32px min-w-48px overflow-hidden rounded-10px border transition-all', active ? 'border-[var(--primary)] shadow-[0_0_0_1px_var(--primary)]' : 'border-[var(--border-light)] hover:border-[var(--border-base)]')} style={{ background: buildPreviewBackground(preset) }}>
            <span className='absolute inset-x-0 bottom-0 h-10px bg-black/12 transition-opacity group-hover:opacity-0'></span>
            <span className='absolute right-4px top-4px h-8px w-8px rounded-full border border-white/60 bg-white/70'></span>
          </button>
        );
      })}
    </div>
  );
};

export default PresetStrip;
