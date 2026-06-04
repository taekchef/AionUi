/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import type { IConversationMcpStatus, IProvider, TChatConversation } from '@/common/config/storage';
import React, { useCallback } from 'react';
import AionrsChat from './AionrsChat';
import { useAionrsModelSelection } from './useAionrsModelSelection';

type Props = {
  conversation: TChatConversation & { type: 'aionrs' };
  isSideMode?: boolean;
  composerPrefix?: React.ReactNode;
};

/** Aionrs chat surface for main view and side dock (requires model selection hook). */
const AionrsPlatformChat: React.FC<Props> = ({ conversation, isSideMode = false, composerPrefix }) => {
  const onSelectModel = useCallback(
    async (_provider: IProvider, modelName: string) => {
      await ipcBridge.conversation.stop.invoke({ conversation_id: conversation.id });
      const ok = await ipcBridge.conversation.update.invoke({
        id: conversation.id,
        updates: { model: { ..._provider, use_model: modelName } },
      });
      return Boolean(ok);
    },
    [conversation.id]
  );

  const modelSelection = useAionrsModelSelection({
    initialModel: conversation.model,
    onSelectModel,
  });

  return (
    <AionrsChat
      conversation_id={conversation.id}
      workspace={conversation.extra.workspace}
      modelSelection={modelSelection}
      session_mode={conversation.extra?.session_mode}
      cron_job_id={(conversation.extra as { cron_job_id?: string })?.cron_job_id}
      loadedSkills={(conversation.extra as { skills?: string[] } | undefined)?.skills}
      loadedMcpServers={(conversation.extra as { mcp_servers?: string[] } | undefined)?.mcp_servers}
      loadedMcpStatuses={
        (conversation.extra as { mcp_statuses?: IConversationMcpStatus[] } | undefined)?.mcp_statuses
      }
      isSideMode={isSideMode}
      composerPrefix={composerPrefix}
    />
  );
};

export default AionrsPlatformChat;
