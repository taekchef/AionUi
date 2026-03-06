import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test, vi } from 'vitest';
import ThemeDesigner from '@/renderer/components/CssThemeDesigner/ThemeDesigner';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key,
  }),
}));

describe('ThemeDesigner', () => {
  test('renders toolbar, panel, preview and footer indicators', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ThemeDesigner, {
        themeName: 'Aurora',
        initialCss: ':root { --primary: #4f6bff; }',
        onBack: vi.fn(),
        onSave: vi.fn(),
      })
    );

    expect(markup).toContain('theme-designer__toolbar');
    expect(markup).toContain('theme-designer-control-panel');
    expect(markup).toContain('theme-preview');
    expect(markup).toContain('theme-designer__footer');
  });
});
