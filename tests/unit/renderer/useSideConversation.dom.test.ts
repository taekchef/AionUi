/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const createSide = vi.fn();
const update = vi.fn();
const remove = vi.fn();
const sendMessage = vi.fn();

vi.mock('@/common', () => ({
  ipcBridge: {
    conversation: {
      createSide: { invoke: (...a: unknown[]) => createSide(...a) },
      update: { invoke: (...a: unknown[]) => update(...a) },
      remove: { invoke: (...a: unknown[]) => remove(...a) },
      sendMessage: { invoke: (...a: unknown[]) => sendMessage(...a) },
    },
  },
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
  update.mockReset();
  remove.mockReset();
  sendMessage.mockReset();
  update.mockResolvedValue(true);
  remove.mockResolvedValue(true);
  sendMessage.mockResolvedValue({ msg_id: 'm1' });
});

describe('useSideConversation', () => {
  it('ensure() creates a child once and caches id', async () => {
    createSide.mockResolvedValue({ conversation_id: 'c1' });
    const { result } = renderHook(() => useSideConversation({ parent }));
    await act(async () => {
      await result.current.open();
    });
    expect(createSide).toHaveBeenCalledTimes(1);
    expect(result.current.childId).toBe('c1');
    expect(result.current.state).toBe('empty');
    await act(async () => {
      await result.current.open();
    });
    expect(createSide).toHaveBeenCalledTimes(1);
  });

  it('collapse keeps childId; discard removes and clears', async () => {
    createSide.mockResolvedValue({ conversation_id: 'c1' });
    const { result } = renderHook(() => useSideConversation({ parent }));
    await act(async () => {
      await result.current.open();
    });
    act(() => result.current.collapse());
    expect(result.current.state).toBe('collapsed');
    expect(result.current.childId).toBe('c1');
    await act(async () => {
      await result.current.discard();
    });
    expect(remove).toHaveBeenCalledWith({ id: 'c1' });
    expect(result.current.state).toBe('discarded');
    expect(result.current.childId).toBeUndefined();
  });

  it('promote clears ephemeral flag', async () => {
    createSide.mockResolvedValue({ conversation_id: 'c1' });
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
