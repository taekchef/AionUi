import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeDesignerGroupId } from '../types';

interface WorkspaceSceneProps {
  activeGroupId: ThemeDesignerGroupId;
  onAreaClick?: (groupId: ThemeDesignerGroupId) => void;
}

const getAreaClass = (active: boolean): string => {
  return `rounded-18px border transition-all ${active ? 'border-dashed border-[var(--primary)] shadow-[0_0_0_1px_var(--primary)]' : 'border-transparent hover:border-[var(--border-base)]'}`;
};

const WorkspaceScene: React.FC<WorkspaceSceneProps> = ({ activeGroupId, onAreaClick }) => {
  const { t } = useTranslation();

  return (
    <div className='grid h-full gap-12px lg:grid-cols-[minmax(0,1fr)_280px]'>
      <div className='flex min-h-0 flex-col gap-12px'>
        <button type='button' onClick={() => onAreaClick?.('advanced-effects')} className={`workspace-toolbar-row flex items-center justify-between rounded-18px border border-[var(--border-light)] bg-[var(--bg-1)] px-16px py-12px text-left ${getAreaClass(activeGroupId === 'advanced-effects')}`}>
          <div>
            <div className='text-14px font-600 text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.workspaceTitle')}</div>
            <div className='text-11px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.workspaceSubtitle')}</div>
          </div>
          <div className='flex gap-8px'>
            <span className='workspace-toolbar-icon-btn h-28px w-28px rounded-12px border border-[var(--border-light)] bg-[var(--workspace-btn-bg)]'></span>
            <span className='workspace-toolbar-icon-btn h-28px w-28px rounded-12px border border-[var(--border-light)] bg-[var(--workspace-btn-bg)]'></span>
          </div>
        </button>

        <button type='button' onClick={() => onAreaClick?.('text')} className={`chat-workspace flex-1 rounded-20px border border-[var(--border-light)] bg-[var(--bg-1)] p-16px text-left ${getAreaClass(activeGroupId === 'text' || activeGroupId === 'backgrounds')}`}>
          <div className='grid h-full gap-12px lg:grid-cols-[200px_minmax(0,1fr)]'>
            <div className='rounded-18px bg-[var(--bg-2)] p-12px'>
              <div className='workspace-title-label text-12px font-600 text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.filesTitle')}</div>
              <div className='mt-10px space-y-8px'>
                {['workspaceFile1', 'workspaceFile2', 'workspaceFile3'].map((itemKey) => (
                  <div key={itemKey} className='rounded-12px bg-[var(--bg-1)] px-10px py-8px text-12px text-[var(--text-primary)]'>
                    {t(`settings.themeDesigner.preview.${itemKey}`)}
                  </div>
                ))}
              </div>
            </div>
            <div className='rounded-18px bg-[var(--bg-base)] p-14px'>
              <div className='mb-10px flex items-center justify-between'>
                <span className='text-12px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.codePanelTitle')}</span>
                <span className='text-11px text-[var(--text-disabled)]'>{t('settings.themeDesigner.preview.codePanelMeta')}</span>
              </div>
              <div className='space-y-6px font-mono text-12px text-[var(--text-primary)]'>
                <div>{'<Panel variant="workspace">'}</div>
                <div className='pl-16px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.codeLine1')}</div>
                <div className='pl-16px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.codeLine2')}</div>
                <div>{'</Panel>'}</div>
              </div>
            </div>
          </div>
        </button>
      </div>

      <button type='button' onClick={() => onAreaClick?.('borders')} className={`rounded-20px border border-[var(--border-light)] bg-[var(--bg-1)] p-16px text-left ${getAreaClass(activeGroupId === 'borders')}`}>
        <div className='space-y-10px'>
          <div className='text-14px font-600 text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.inspectorTitle')}</div>
          <div className='rounded-16px bg-[var(--bg-2)] p-12px text-12px text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.inspectorRow1')}</div>
          <div className='rounded-16px bg-[var(--bg-2)] p-12px text-12px text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.inspectorRow2')}</div>
          <div className='rounded-16px bg-[var(--bg-2)] p-12px text-12px text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.inspectorRow3')}</div>
        </div>
      </button>
    </div>
  );
};

export default WorkspaceScene;
