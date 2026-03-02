import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';

const mockStorage = {
  get: vi.fn(),
  set: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/common/storage', () => ({
  ConfigStorage: mockStorage,
}));

vi.mock('@/common', () => ({
  ipcBridge: {
    application: {
      openDevTools: { invoke: vi.fn().mockResolvedValue(undefined) },
    },
  },
}));

vi.mock('@/renderer/components/PwaPullToRefresh', () => ({
  default: () => null,
}));

vi.mock('@/renderer/components/Titlebar', () => ({
  default: () => null,
}));

vi.mock('@/renderer/components/UpdateModal', () => ({
  default: () => null,
}));

vi.mock('@/renderer/hooks/useDirectorySelection', () => ({
  useDirectorySelection: () => ({ contextHolder: null }),
}));

vi.mock('@/renderer/hooks/useMultiAgentDetection', () => ({
  useMultiAgentDetection: () => ({ contextHolder: null }),
}));

vi.mock('@/renderer/hooks/useDeepLink', () => ({
  useDeepLink: () => {},
}));

vi.mock('@/renderer/utils/platform', () => ({
  isElectronDesktop: () => false,
}));

const NEW_CSS = '.new-theme-flag { color: rgb(1, 2, 3); }';
const OLD_CSS = '.old-theme-flag { color: rgb(3, 2, 1); }';

const Driver: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('custom-css-updated', { detail: { customCss: NEW_CSS } }));
    navigate('/conversation/abc');
  }, [navigate]);
  return React.createElement('div', null, 'driver');
};

describe('layout css sync on route transition', () => {
  beforeEach(() => {
    cleanup();
    mockStorage.get.mockReset();
    mockStorage.set.mockReset();
    mockStorage.set.mockResolvedValue(undefined);

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    mockStorage.get.mockImplementation(async (key: string) => {
      if (key === 'customCss') return OLD_CSS;
      if (key === 'css.activeThemeId') return 'new-theme';
      if (key === 'css.themes') {
        return [
          {
            id: 'new-theme',
            name: 'New Theme',
            css: NEW_CSS,
            isPreset: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];
      }
      return null;
    });
  });

  it('keeps selected new theme css after navigating back to conversation', async () => {
    const { default: Layout } = await import('@/renderer/layout');

    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/settings/gemini'] },
        React.createElement(
          Routes,
          null,
          React.createElement(
            Route,
            {
              path: '/',
              element: React.createElement(Layout, { sider: React.createElement('div', null, 'sider') }),
            },
            React.createElement(Route, { path: 'settings/gemini', element: React.createElement(Driver) }),
            React.createElement(Route, { path: 'conversation/:id', element: React.createElement('div', null, 'conversation') })
          )
        )
      )
    );

    await waitFor(() => {
      const style = document.getElementById('user-defined-custom-css');
      expect(style?.textContent || '').toContain('.new-theme-flag');
      expect(style?.textContent || '').not.toContain('.old-theme-flag');
    });
  });
});
