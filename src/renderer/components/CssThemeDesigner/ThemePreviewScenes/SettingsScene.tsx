import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeDesignerGroupId } from '../types';

interface SettingsSceneProps {
  activeGroupId: ThemeDesignerGroupId;
  onAreaClick?: (groupId: ThemeDesignerGroupId) => void;
}

const getAreaClass = (active: boolean): string => {
  return `rounded-18px border transition-all ${active ? 'border-dashed border-[var(--primary)] shadow-[0_0_0_1px_var(--primary)]' : 'border-transparent hover:border-[var(--border-base)]'}`;
};

const SettingsScene: React.FC<SettingsSceneProps> = ({ activeGroupId, onAreaClick }) => {
  const { t } = useTranslation();

  return (
    <div className='grid h-full gap-12px lg:grid-cols-[minmax(0,1fr)_260px]'>
      <div className='space-y-12px'>
        <button type='button' onClick={() => onAreaClick?.('typography-motion')} className={`flex w-full flex-col gap-12px rounded-20px border border-[var(--border-light)] bg-[var(--bg-1)] p-16px text-left ${getAreaClass(activeGroupId === 'typography-motion')}`}>
          <div className='text-14px font-600 text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.settingsSectionTitle')}</div>
          <div className='space-y-10px'>
            <div className='arco-form-item'>
              <div className='mb-6px text-12px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.fontLabel')}</div>
              <div className='arco-select-view flex items-center rounded-[var(--theme-border-radius-input)] border border-[var(--border-base)] bg-[var(--fill)] px-12px py-10px text-13px text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.fontValue')}</div>
            </div>
            <div className='arco-form-item'>
              <div className='mb-6px text-12px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.motionLabel')}</div>
              <div className='arco-input-inner-wrapper flex items-center rounded-[var(--theme-border-radius-input)] border border-[var(--border-base)] bg-[var(--fill)] px-12px py-10px text-13px text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.motionValue')}</div>
            </div>
          </div>
        </button>

        <button type='button' onClick={() => onAreaClick?.('shape-radius')} className={`flex w-full flex-col gap-12px rounded-20px border border-[var(--border-light)] bg-[var(--bg-1)] p-16px text-left ${getAreaClass(activeGroupId === 'shape-radius')}`}>
          <div className='text-14px font-600 text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.controlsSectionTitle')}</div>
          <div className='grid gap-10px md:grid-cols-2'>
            <div>
              <div className='mb-6px text-12px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.inputLabel')}</div>
              <div className='arco-input-inner-wrapper rounded-[var(--theme-border-radius-input)] border border-[var(--border-base)] bg-[var(--fill)] px-12px py-10px text-13px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.inputPlaceholder')}</div>
            </div>
            <div>
              <div className='mb-6px text-12px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.buttonLabel')}</div>
              <div className='arco-btn arco-btn-primary inline-flex rounded-[var(--theme-border-radius-button)] px-16px py-10px text-13px font-600 text-white' style={{ background: 'var(--theme-gradient-primary)' }}>
                {t('settings.themeDesigner.preview.saveDraft')}
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className='flex h-full flex-col gap-10px'>
        <button type='button' data-preview-area='settings-summary-panel' data-control-group='backgrounds' onClick={() => onAreaClick?.('backgrounds')} className={`flex flex-1 flex-col justify-between rounded-20px border border-[var(--border-light)] bg-[var(--bg-1)] p-16px text-left ${getAreaClass(activeGroupId === 'backgrounds')}`}>
          <div className='space-y-10px'>
            <div className='text-14px font-600 text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.summaryTitle')}</div>
            <div className='rounded-16px bg-[var(--bg-2)] p-12px'>
              <div className='text-12px text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.summaryRow1')}</div>
              <div className='mt-4px text-11px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.summaryRow2')}</div>
            </div>
          </div>
        </button>
        <button type='button' data-preview-area='settings-semantic-tones' data-control-group='semantic-colors' onClick={() => onAreaClick?.('semantic-colors')} className={`flex flex-col gap-8px rounded-20px border border-[var(--border-light)] bg-[var(--bg-1)] p-16px text-left ${getAreaClass(activeGroupId === 'semantic-colors')}`}>
          {['success', 'warning', 'danger'].map((tone) => (
            <div key={tone} className='flex items-center gap-10px rounded-14px bg-[var(--bg-2)] px-12px py-10px'>
              <span className='h-10px w-10px rounded-full' style={{ backgroundColor: `var(--${tone})` }}></span>
              <span className='text-12px text-[var(--text-primary)]'>{t(`settings.themeDesigner.preview.${tone}Label`)}</span>
            </div>
          ))}
        </button>
      </div>
    </div>
  );
};

export default SettingsScene;
