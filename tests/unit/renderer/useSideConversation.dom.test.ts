/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const createSide = vi.fn();
const listSide = vi.fn();
const update = vi.fn();
const remove = vi.fn();
const sendMessage = vi.fn();
const getConversationMessages = vi.fn();

vi.mock('@/common', () => ({
  ipcBridge: {
    conversation: {
      createSide: { invoke: (...a: unknown[]) => createSide(...a) },
      listSide: { invoke: (...a: unknown[]) => listSide(...a) },
      update: { invoke: (...a: unknown[]) => update(...a) },
      remove: { invoke: (...a: unknown[]) => remove(...a) },
      sendMessage: { invoke: (...a: unknown[]) => sendMessage(...a) },
    },
    database: {
      getConversationMessages: { invoke: (...a: unknown[]) => getConversationMessages(...a) },
    },
  },
}));

vi.mock('@arco-design/web-react', () => ({
  Message: { error: vi.fn(), info: vi.fn() },
}));

import { useSideConversation } from '@/renderer/pages/conversation/components/SideConversationPanel/useSideConversation';
import type { TChatConversation } from '@/common/config/storage';

const parent = {
  id: 'p1',
  type: 'acp',
  name: 'Main',
  created_at: 0,
  modified_at: 0,
  model: { id: 'm', platform: 'openai', name: 'p', base_url: '', api_key: '', use_model: 'gpt' },
  extra: { backend: 'codex', workspace: '/w' },
} as TChatConversation;

beforeEach(() => {
  createSide.mockReset();
  listSide.mockReset();
  update.mockReset();
  remove.mockReset();
  sendMessage.mockReset();
  getConversationMessages.mockReset();
  update.mockResolvedValue(true);
  listSide.mockResolvedValue([]);
  remove.mockResolvedValue(true);
  sendMessage.mockResolvedValue({ msg_id: 'm1' });
  getConversationMessages.mockResolvedValue({
    items: [
      {
        id: 'm2',
        conversation_id: 'p1',
        type: 'text',
        msg_id: 'm2',
        content: { content: '助手回复' },
        position: 'left',
        created_at: 2,
      },
    ],
  });
});

describe('useSideConversation', () => {
  it('restores side tabs from the parent side list after remount', async () => {
    listSide.mockResolvedValue([
      {
        id: 'c2',
        type: 'acp',
        name: 'Side 2',
        created_at: 2,
        modified_at: 3,
        extra: { fork_mode: 'agent_fork', side_mode: true, parent_conversation_id: 'p1' },
      },
      {
        id: 'c1',
        type: 'acp',
        name: 'Side 1',
        created_at: 1,
        modified_at: 1,
        extra: { fork_mode: 'text_snapshot', side_mode: true, parent_conversation_id: 'p1' },
      },
    ]);
    const restoredParent = {
      ...parent,
      extra: { ...parent.extra, active_side_id: 'c2', side_panel_hidden: false },
    } as TChatConversation;

    const { result } = renderHook(() => useSideConversation({ parent: restoredParent }));

    await waitFor(() => {
      expect(result.current.tabs.map((tab) => tab.childId)).toEqual(['c1', 'c2']);
    });
    expect(result.current.activeTabId).toBe('c2');
    expect(result.current.state).toBe('active');
  });

  it('open() creates first tab and re-open without question does not create again', async () => {
    createSide.mockResolvedValue({ conversation_id: 'c1', fork_mode: 'text_snapshot', created: true });
    const { result } = renderHook(() => useSideConversation({ parent }));
    await act(async () => {
      await result.current.open();
    });
    expect(createSide).toHaveBeenCalledTimes(1);
    expect(result.current.tabs).toHaveLength(1);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'p1',
        merge_extra: true,
        updates: expect.objectContaining({
          extra: expect.objectContaining({ active_side_id: 'c1', side_panel_hidden: false }),
        }),
      })
    );
    await act(async () => {
      await result.current.collapse();
    });
    expect(result.current.state).toBe('collapsed');
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'p1',
        updates: expect.objectContaining({
          extra: expect.objectContaining({ active_side_id: 'c1', side_panel_hidden: true }),
        }),
      })
    );
    await act(async () => {
      await result.current.open();
    });
    expect(createSide).toHaveBeenCalledTimes(1);
    expect(result.current.state).not.toBe('collapsed');
  });

  it('openNewTab() always creates another child', async () => {
    createSide
      .mockResolvedValueOnce({ conversation_id: 'c1', fork_mode: 'text_snapshot', created: true })
      .mockResolvedValueOnce({ conversation_id: 'c2', fork_mode: 'text_snapshot', created: true });
    const { result } = renderHook(() => useSideConversation({ parent }));
    await act(async () => {
      await result.current.openNewTab();
      await result.current.openNewTab();
    });
    expect(createSide).toHaveBeenCalledTimes(2);
    expect(result.current.tabs.map((t) => t.childId)).toEqual(['c1', 'c2']);
  });

  it('discardTab removes one tab; collapse keeps tabs', async () => {
    createSide.mockResolvedValue({ conversation_id: 'c1', fork_mode: 'text_snapshot', created: true });
    const { result } = renderHook(() => useSideConversation({ parent }));
    await act(async () => {
      await result.current.open();
    });
    act(() => result.current.collapse());
    expect(result.current.tabs).toHaveLength(1);
    await act(async () => {
      await result.current.discardTab('c1');
    });
    expect(remove).toHaveBeenCalledWith({ id: 'c1' });
    expect(result.current.tabs).toHaveLength(0);
    expect(result.current.state).toBe('none');
  });

  it('promote clears ephemeral flag on active tab', async () => {
    createSide.mockResolvedValue({ conversation_id: 'c1', fork_mode: 'agent_fork', created: true });
    const { result } = renderHook(() => useSideConversation({ parent }));
    await act(async () => {
      await result.current.open();
    });
    act(() => result.current.markTurn());
    await act(async () => {
      await result.current.promote();
    });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1', merge_extra: true }));
    expect(result.current.state).toBe('promoted');
  });
});
