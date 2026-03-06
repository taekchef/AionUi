import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test, vi } from 'vitest';
import ControlPanel from '@/renderer/components/CssThemeDesigner/ControlPanel';
import { THEME_DESIGNER_GROUPS } from '@/renderer/components/CssThemeDesigner/mockData';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key,
  }),
}));

describe('ControlPanel', () => {
  test('renders visual/code tabs and placeholder group cards', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ControlPanel, {
        collapsed: false,
        activeTab: 'visual',
        activeGroupId: 'global-tone',
        groups: THEME_DESIGNER_GROUPS,
        onTabChange: vi.fn(),
        onToggleCollapse: vi.fn(),
        onGroupSelect: vi.fn(),
        onApplyPreset: vi.fn(),
        codeValue: ':root {}',
        onCodeChange: vi.fn(),
      })
    );

    expect(markup).toContain('theme-designer-control-panel');
    expect(markup).toContain('theme-designer-control-panel__tabs');
    expect(markup).toContain('theme-designer-preset-strip');
    expect(markup).toContain('TODO(themeVariableMap)');
  });

  test('shows transition duration in seconds to match stored CSS values', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ControlPanel, {
        collapsed: false,
        activeTab: 'visual',
        activeGroupId: 'typography-motion',
        groups: THEME_DESIGNER_GROUPS,
        onTabChange: vi.fn(),
        onToggleCollapse: vi.fn(),
        onGroupSelect: vi.fn(),
        onApplyPreset: vi.fn(),
        codeValue: ':root {}',
        onCodeChange: vi.fn(),
      })
    );

    expect(markup).toContain('0.28s');
    expect(markup).not.toContain('28ms');
  });
});
