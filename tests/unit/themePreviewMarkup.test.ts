import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test, vi } from 'vitest';
import ThemePreview from '@/renderer/components/CssThemeDesigner/ThemePreview';
import ChatScene from '@/renderer/components/CssThemeDesigner/ThemePreviewScenes/ChatScene';
import SettingsScene from '@/renderer/components/CssThemeDesigner/ThemePreviewScenes/SettingsScene';
import { INITIAL_THEME_DESIGNER_VARIABLES } from '@/renderer/components/CssThemeDesigner/mockData';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key,
  }),
}));

describe('ThemePreview', () => {
  test('renders the preview tabs and AionUI-like scene skeleton', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ThemePreview, {
        mode: 'light',
        sceneId: 'chat',
        currentGroupId: 'messages-components',
        styleVars: INITIAL_THEME_DESIGNER_VARIABLES.light,
        onAreaClick: vi.fn(),
        onSceneChange: vi.fn(),
      })
    );

    expect(markup).toContain('theme-preview__scene-tabs');
    expect(markup).toContain('message-item');
    expect(markup).toContain('arco-btn');
    expect(markup).toContain('theme-preview__current-group');
  });

  test('maps the chat tips area to the messages component group', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ChatScene, {
        activeGroupId: 'messages-components',
        onAreaClick: vi.fn(),
      })
    );

    expect(markup).toContain('data-preview-area="chat-tips-message"');
    expect(markup).toContain('data-control-group="messages-components"');
  });

  test('renders a dedicated semantic tone target in the settings preview', () => {
    const markup = renderToStaticMarkup(
      React.createElement(SettingsScene, {
        activeGroupId: 'semantic-colors',
        onAreaClick: vi.fn(),
      })
    );

    expect(markup).toContain('data-preview-area="settings-semantic-tones"');
    expect(markup).toContain('data-control-group="semantic-colors"');
  });
});
