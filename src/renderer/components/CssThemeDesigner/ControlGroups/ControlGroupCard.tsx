import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeDesignerGroupDefinition } from '../types';
import PresetStrip from '../Controls/PresetStrip';

interface ControlGroupCardProps {
  group: ThemeDesignerGroupDefinition;
  expanded: boolean;
  active: boolean;
  activePresetId?: string;
  onToggle: () => void;
  onSelect: () => void;
  onApplyPreset?: (presetId: string) => void;
  children: React.ReactNode;
}

const ControlGroupCard = React.forwardRef<HTMLDivElement, ControlGroupCardProps>(({ group, expanded, active, activePresetId, onToggle, onSelect, onApplyPreset, children }, ref) => {
  const { t } = useTranslation();

  return (
    <section ref={ref} className={`theme-designer-group-card rounded-20px border bg-[var(--bg-1)] transition-all ${active ? 'border-[var(--primary)] shadow-[0_20px_50px_rgba(15,23,42,0.12)]' : 'border-[var(--border-light)]'}`}>
      <button
        type='button'
        onClick={() => {
          onSelect();
          onToggle();
        }}
        className='flex w-full items-start justify-between gap-16px p-16px text-left'
      >
        <div className='space-y-4px'>
          <div className='text-14px font-600 text-[var(--text-primary)]'>{t(group.titleKey)}</div>
          <div className='text-12px text-[var(--text-secondary)]'>{t(group.descriptionKey)}</div>
        </div>
        <span className='mt-2px text-12px text-[var(--text-secondary)]'>{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className='space-y-12px border-t border-[var(--border-light)] px-16px py-14px'>
          <PresetStrip items={group.presets} activeId={activePresetId} onSelect={onApplyPreset} />
          {children}
        </div>
      )}
    </section>
  );
});

ControlGroupCard.displayName = 'ControlGroupCard';

export default ControlGroupCard;
