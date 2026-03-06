import React from 'react';
import { useTranslation } from 'react-i18next';
import { buildPreviewStyle, GROUP_KEY_BY_ID, THEME_DESIGNER_GROUPS, THEME_DESIGNER_SCENES } from './mockData';
import type { ThemeDesignerGroupId, ThemeDesignerMode, ThemeDesignerSceneId, ThemeVariableRecord } from './types';
import ChatScene from './ThemePreviewScenes/ChatScene';
import SettingsScene from './ThemePreviewScenes/SettingsScene';
import SidebarScene from './ThemePreviewScenes/SidebarScene';
import WorkspaceScene from './ThemePreviewScenes/WorkspaceScene';

interface ThemePreviewProps {
  mode: ThemeDesignerMode;
  sceneId: ThemeDesignerSceneId;
  currentGroupId: ThemeDesignerGroupId;
  styleVars: ThemeVariableRecord;
  onSceneChange: (sceneId: ThemeDesignerSceneId) => void;
  onAreaClick?: (groupId: ThemeDesignerGroupId) => void;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ mode, sceneId, currentGroupId, styleVars, onSceneChange, onAreaClick }) => {
  const { t } = useTranslation();
  const currentGroup = THEME_DESIGNER_GROUPS.find((group) => group.id === currentGroupId);

  const renderScene = () => {
    switch (sceneId) {
      case 'sidebar':
        return <SidebarScene activeGroupId={currentGroupId} onAreaClick={onAreaClick} />;
      case 'settings':
        return <SettingsScene activeGroupId={currentGroupId} onAreaClick={onAreaClick} />;
      case 'workspace':
        return <WorkspaceScene activeGroupId={currentGroupId} onAreaClick={onAreaClick} />;
      case 'chat':
      default:
        return <ChatScene activeGroupId={currentGroupId} onAreaClick={onAreaClick} />;
    }
  };

  return (
    <section
      className='theme-preview flex h-full min-h-0 flex-col rounded-28px border border-[var(--border-light)] bg-[var(--bg-base)] p-16px'
      data-theme={mode}
      style={{
        ...buildPreviewStyle(styleVars),
        color: 'var(--text-primary)',
        fontFamily: 'var(--theme-font-family)',
      }}
    >
      <div className='mb-12px flex items-center justify-between gap-12px'>
        <div>
          <div className='text-13px font-600 text-[var(--text-primary)]'>{t('settings.themeDesigner.previewTitle')}</div>
          <div className='theme-preview__current-group text-12px text-[var(--text-secondary)]'>
            {t('settings.themeDesigner.currentGroupLabel')} {t(GROUP_KEY_BY_ID[currentGroupId] || currentGroup?.titleKey || 'settings.themeDesigner.groups.globalTone.title')}
          </div>
        </div>
        <div className='rounded-full border border-[var(--border-light)] bg-[var(--bg-1)] px-10px py-6px text-11px text-[var(--text-secondary)]'>{t(mode === 'light' ? 'settings.themeDesigner.lightMode' : 'settings.themeDesigner.darkMode')}</div>
      </div>

      <div className='flex-1 min-h-0 rounded-24px border border-[var(--border-light)] bg-[var(--theme-gradient-surface)] p-14px'>{renderScene()}</div>

      <div className='theme-preview__scene-tabs mt-12px flex flex-wrap gap-8px'>
        {THEME_DESIGNER_SCENES.map((scene) => {
          const showsActiveGroup = currentGroup?.sceneIds.includes(scene.id);
          return (
            <button key={scene.id} type='button' onClick={() => onSceneChange(scene.id)} className={`rounded-full px-14px py-8px text-12px transition-colors ${scene.id === sceneId ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-1)] text-[var(--text-secondary)]'}`}>
              {t(scene.labelKey)}
              {showsActiveGroup ? <span className='ml-6px text-[10px] align-middle'>●</span> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ThemePreview;
