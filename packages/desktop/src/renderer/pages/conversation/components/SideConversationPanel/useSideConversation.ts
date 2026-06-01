/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import { buildSideContextPreamble, nextSideState, type SideState } from '@/common/chat/sideConversationState';
import type { TChatConversation } from '@/common/config/storage';
import { useCallback, useEffect, useRef, useState } from 'react';

export type UseSideConversationOptions = {
  parent: TChatConversation;
  initialChildId?: string;
  getRecentTranscript?: () => string;
};

export function useSideConversation({ parent, initialChildId, getRecentTranscript }: UseSideConversationOptions) {
  const [state, setState] = useState<SideState>(initialChildId ? 'collapsed' : 'none');
  const [childId, setChildId] = useState<string | undefined>(initialChildId);
  const ensuring = useRef<Promise<string> | null>(null);

  const persistParentPointer = useCallback(
    async (nextChildId: string | undefined) => {
      await ipcBridge.conversation.update.invoke({
        id: parent.id,
        updates: {
          extra: {
            side_conversation_id: nextChildId,
          },
        } as Partial<TChatConversation>,
        merge_extra: true,
      });
    },
    [parent.id]
  );

  useEffect(() => {
    if (!childId) return;
    void persistParentPointer(childId);
  }, [childId, persistParentPointer]);

  const createChild = useCallback(
    async (initial_prompt?: string): Promise<string> => {
      if (!parent.id) {
        throw new Error('Side conversation requires a parent conversation');
      }
      if (childId) return childId;
      if (ensuring.current) return ensuring.current;
      ensuring.current = (async () => {
        const { conversation_id } = await ipcBridge.conversation.createSide.invoke({
          parent,
          initial_prompt,
        });
        setChildId(conversation_id);
        return conversation_id;
      })();
      try {
        return await ensuring.current;
      } finally {
        ensuring.current = null;
      }
    },
    [childId, parent]
  );

  const sendFirstTurn = useCallback(
    async (sideId: string, question: string) => {
      const preamble = buildSideContextPreamble({
        recentTranscript: getRecentTranscript?.() ?? '',
        question,
      });
      await ipcBridge.conversation.sendMessage.invoke({
        conversation_id: sideId,
        input: preamble,
        files: [],
        loading_id: `side-${Date.now()}`,
      });
      setState((s) => nextSideState(s, 'turn'));
    },
    [getRecentTranscript]
  );

  const open = useCallback(
    async (firstQuestion?: string) => {
      const trimmed = firstQuestion?.trim();
      const hadChild = Boolean(childId);
      const sideId = await createChild(hadChild ? undefined : trimmed);
      setState((s) => nextSideState(s === 'none' ? 'none' : s, 'open'));
      if (trimmed && hadChild) {
        await sendFirstTurn(sideId, trimmed);
      } else if (trimmed) {
        setState((s) => nextSideState(s, 'turn'));
      }
    },
    [childId, createChild, sendFirstTurn]
  );

  const reopen = useCallback(() => {
    setState((s) => nextSideState(s, 'open'));
  }, []);

  const collapse = useCallback(() => setState((s) => nextSideState(s, 'collapse')), []);

  const markTurn = useCallback(() => setState((s) => nextSideState(s, 'turn')), []);

  const promote = useCallback(async () => {
    if (!childId) return;
    await ipcBridge.conversation.update.invoke({
      id: childId,
      updates: { extra: { ephemeral: false } } as Partial<TChatConversation>,
      merge_extra: true,
    });
    setState((s) => nextSideState(s, 'promote'));
  }, [childId]);

  const discard = useCallback(async () => {
    if (childId) {
      await ipcBridge.conversation.remove.invoke({ id: childId });
    }
    setChildId(undefined);
    await persistParentPointer(undefined);
    setState((s) => nextSideState(s, 'discard'));
  }, [childId, persistParentPointer]);

  return { state, childId, open, reopen, collapse, markTurn, promote, discard };
}
