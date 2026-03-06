import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeDesignerGroupId } from '../types';

interface SidebarSceneProps {
  activeGroupId: ThemeDesignerGroupId;
  onAreaClick?: (groupId: ThemeDesignerGroupId) => void;
}

const getAreaClass = (active: boolean): string => {
  return `rounded-18px border transition-all ${active ? 'border-dashed border-[var(--primary)] shadow-[0_0_0_1px_var(--primary)]' : 'border-transparent hover:border-[var(--border-base)]'}`;
};

const SidebarScene: React.FC<SidebarSceneProps> = ({ activeGroupId, onAreaClick }) => {
  const { t } = useTranslation();

  return (
    <div className='grid h-full gap-12px lg:grid-cols-[220px_minmax(0,1fr)]'>
      <button type='button' className={`layout-sider flex h-full flex-col gap-10px rounded-20px border border-[var(--border-light)] bg-[var(--bg-1)] p-12px text-left ${getAreaClass(activeGroupId === 'backgrounds' || activeGroupId === 'borders')}`} onClick={() => onAreaClick?.('backgrounds')}>
        <div className='layout-sider-header flex items-center justify-between rounded-16px bg-[var(--bg-2)] px-12px py-10px'>
          <span className='text-12px font-600 text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.sidebarTitle')}</span>
          <span className='h-18px w-18px rounded-full bg-[var(--workspace-btn-bg)]'></span>
        </div>
        {['sidebarItem1', 'sidebarItem2', 'sidebarItem3', 'sidebarItem4'].map((itemKey, index) => (
          <div key={itemKey} className={`conversation-item rounded-16px px-12px py-10px ${index === 0 ? 'bg-[var(--bg-2)]' : 'bg-transparent'}`}>
            <div className='text-12px text-[var(--text-primary)]'>{t(`settings.themeDesigner.preview.${itemKey}`)}</div>
            <div className='mt-4px text-11px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.sidebarSnippet')}</div>
          </div>
        ))}
      </button>

      <div className='flex min-h-0 flex-col gap-10px'>
        <button type='button' onClick={() => onAreaClick?.('global-tone')} className={`flex items-center justify-between rounded-18px px-16px py-12px text-left text-white ${getAreaClass(activeGroupId === 'global-tone')}`} style={{ background: 'var(--theme-gradient-primary)' }}>
          <span className='text-14px font-600'>{t('settings.themeDesigner.preview.chatHeaderTitle')}</span>
          <span className='text-11px text-white/80'>{t('settings.themeDesigner.preview.chatHeaderSubtitle')}</span>
        </button>
        <button type='button' onClick={() => onAreaClick?.('messages-components')} className={`message-item ai flex-1 rounded-20px border border-[var(--border-light)] bg-[var(--bg-1)] px-18px py-16px text-left ${getAreaClass(activeGroupId === 'messages-components')}`}>
          <div className='flex h-full flex-col justify-between'>
            <div className='space-y-10px'>
              <div className='message-bubble inline-flex max-w-[74%] rounded-[var(--theme-border-radius-bubble-ai)] border border-[var(--border-light)] bg-[var(--fill)] px-14px py-12px text-13px text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.messageAi1')}</div>
              <div className='message-bubble ml-auto inline-flex max-w-[70%] rounded-[var(--theme-border-radius-bubble-user)] px-14px py-12px text-13px text-white' style={{ background: 'var(--theme-gradient-primary)' }}>
                {t('settings.themeDesigner.preview.messageUser1')}
              </div>
            </div>
            <div className='text-11px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.sidebarFooter')}</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SidebarScene;
