import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeDesignerGroupId } from '../types';

interface ChatSceneProps {
  activeGroupId: ThemeDesignerGroupId;
  onAreaClick?: (groupId: ThemeDesignerGroupId) => void;
}

const getAreaClass = (active: boolean): string => {
  return `rounded-18px border transition-all ${active ? 'border-dashed border-[var(--primary)] shadow-[0_0_0_1px_var(--primary)]' : 'border-transparent hover:border-[var(--border-base)]'}`;
};

const ChatScene: React.FC<ChatSceneProps> = ({ activeGroupId, onAreaClick }) => {
  const { t } = useTranslation();

  return (
    <div className='flex h-full flex-col gap-12px'>
      <button
        type='button'
        className={`preview-header arco-layout-header flex items-center justify-between gap-12px px-16px py-12px text-left ${getAreaClass(activeGroupId === 'global-tone')}`}
        style={{
          background: 'var(--theme-gradient-primary)',
          color: 'white',
          borderRadius: '18px',
        }}
        onClick={() => onAreaClick?.('global-tone')}
      >
        <div>
          <div className='text-14px font-600'>{t('settings.themeDesigner.preview.chatHeaderTitle')}</div>
          <div className='text-11px text-white/80'>{t('settings.themeDesigner.preview.chatHeaderSubtitle')}</div>
        </div>
        <div className='flex gap-8px'>
          <span className='h-10px w-10px rounded-full bg-white/60'></span>
          <span className='h-10px w-10px rounded-full bg-white/35'></span>
        </div>
      </button>

      <div className='flex-1 space-y-10px'>
        <button type='button' onClick={() => onAreaClick?.('messages-components')} className={`message-item ai flex w-full items-start gap-10px px-4px py-2px text-left ${getAreaClass(activeGroupId === 'messages-components')}`}>
          <span className='mt-6px h-28px w-28px rounded-full bg-[var(--bg-3)]'></span>
          <div className='message-bubble flex-1 rounded-[var(--theme-border-radius-bubble-ai)] border border-[var(--border-light)] bg-[var(--bg-1)] px-14px py-12px shadow-[var(--theme-shadow-md)]'>
            <div className='text-13px text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.messageAi1')}</div>
            <div className='mt-6px text-11px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.messageAiMeta')}</div>
          </div>
        </button>

        <button type='button' onClick={() => onAreaClick?.('messages-components')} className={`message-item user flex w-full justify-end px-4px py-2px text-left ${getAreaClass(activeGroupId === 'messages-components')}`}>
          <div className='message-bubble max-w-[72%] rounded-[var(--theme-border-radius-bubble-user)] px-14px py-12px text-white shadow-[var(--theme-shadow-md)]' style={{ background: 'var(--theme-gradient-primary)' }}>
            <div className='text-13px'>{t('settings.themeDesigner.preview.messageUser1')}</div>
            <div className='mt-6px text-11px text-white/80'>{t('settings.themeDesigner.preview.messageUserMeta')}</div>
          </div>
        </button>

        <button type='button' data-preview-area='chat-tips-message' data-control-group='messages-components' onClick={() => onAreaClick?.('messages-components')} className={`message-item tips flex w-full items-start gap-10px px-4px py-2px text-left ${getAreaClass(activeGroupId === 'messages-components')}`}>
          <div className='rounded-16px border border-[var(--border-special)] bg-[var(--message-tips-bg)] px-14px py-12px'>
            <div className='text-12px text-[var(--text-primary)]'>{t('settings.themeDesigner.preview.messageAi2')}</div>
            <div className='mt-6px text-11px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.messageHint')}</div>
          </div>
        </button>
      </div>

      <div className='grid gap-10px md:grid-cols-[minmax(0,1fr)_auto]'>
        <button type='button' onClick={() => onAreaClick?.('shape-radius')} className={`arco-input-inner-wrapper flex min-h-54px items-center rounded-[var(--theme-border-radius-input)] border border-[var(--border-base)] bg-[var(--fill)] px-16px text-left ${getAreaClass(activeGroupId === 'shape-radius')}`}>
          <span className='text-13px text-[var(--text-secondary)]'>{t('settings.themeDesigner.preview.inputPlaceholder')}</span>
        </button>
        <button type='button' onClick={() => onAreaClick?.('global-tone')} className={`arco-btn arco-btn-primary send-button-custom flex min-w-120px items-center justify-center rounded-[var(--theme-border-radius-button)] border border-transparent px-18px py-12px text-13px font-600 text-white ${getAreaClass(activeGroupId === 'global-tone')}`} style={{ background: 'var(--theme-gradient-primary)' }}>
          {t('settings.themeDesigner.preview.send')}
        </button>
      </div>
    </div>
  );
};

export default ChatScene;
