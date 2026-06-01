/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IConversationMcpStatus, TChatConversation } from '@/common/config/storage';
import AcpChat from '@/renderer/pages/conversation/platforms/acp/AcpChat';
import NanobotChat from '@/renderer/pages/conversation/platforms/nanobot/NanobotChat';
import OpenClawChat from '@/renderer/pages/conversation/platforms/openclaw/OpenClawChat';
import RemoteChat from '@/renderer/pages/conversation/platforms/remote/RemoteChat';
import React from 'react';

export type RenderPlatformChatOptions = {
  conversation: TChatConversation;
  assistantDisplayName?: string;
  hideSendBox?: boolean;
};

/** Single source of truth for type→platform-chat routing. Used by main view and side dock. */
export function renderPlatformChat({
  conversation,
  assistantDisplayName,
  hideSendBox,
}: RenderPlatformChatOptions): React.ReactNode {
  switch (conversation.type) {
    case 'acp':
      return (
        <AcpChat
          key={conversation.id}
          conversation_id={conversation.id}
          workspace={conversation.extra?.workspace}
          backend={conversation.extra?.backend || 'claude'}
          session_mode={conversation.extra?.session_mode}
          agent_name={assistantDisplayName}
          cron_job_id={(conversation.extra as { cron_job_id?: string })?.cron_job_id}
          hideSendBox={hideSendBox}
          loadedSkills={(conversation.extra as { skills?: string[] } | undefined)?.skills}
          loadedMcpServers={(conversation.extra as { mcp_servers?: string[] } | undefined)?.mcp_servers}
          loadedMcpStatuses={
            (conversation.extra as { mcp_statuses?: IConversationMcpStatus[] } | undefined)?.mcp_statuses
          }
        />
      );
    case 'gemini':
      return (
        <AcpChat
          key={conversation.id}
          conversation_id={conversation.id}
          workspace={conversation.extra?.workspace}
          backend='gemini'
          agent_name={assistantDisplayName}
          cron_job_id={(conversation.extra as { cron_job_id?: string })?.cron_job_id}
          hideSendBox={hideSendBox}
          loadedSkills={(conversation.extra as { skills?: string[] } | undefined)?.skills}
          loadedMcpServers={(conversation.extra as { mcp_servers?: string[] } | undefined)?.mcp_servers}
          loadedMcpStatuses={
            (conversation.extra as { mcp_statuses?: IConversationMcpStatus[] } | undefined)?.mcp_statuses
          }
        />
      );
    case 'codex':
      return (
        <AcpChat
          key={conversation.id}
          conversation_id={conversation.id}
          workspace={conversation.extra?.workspace}
          backend='codex'
          agent_name={assistantDisplayName}
          hideSendBox={hideSendBox}
          loadedSkills={(conversation.extra as { skills?: string[] } | undefined)?.skills}
          loadedMcpServers={(conversation.extra as { mcp_servers?: string[] } | undefined)?.mcp_servers}
          loadedMcpStatuses={
            (conversation.extra as { mcp_statuses?: IConversationMcpStatus[] } | undefined)?.mcp_statuses
          }
        />
      );
    case 'openclaw-gateway':
      return (
        <OpenClawChat
          key={conversation.id}
          conversation_id={conversation.id}
          workspace={conversation.extra?.workspace}
          cron_job_id={(conversation.extra as { cron_job_id?: string })?.cron_job_id}
          loadedSkills={(conversation.extra as { skills?: string[] } | undefined)?.skills}
        />
      );
    case 'nanobot':
      return (
        <NanobotChat
          key={conversation.id}
          conversation_id={conversation.id}
          workspace={conversation.extra?.workspace}
          cron_job_id={(conversation.extra as { cron_job_id?: string })?.cron_job_id}
          loadedSkills={(conversation.extra as { skills?: string[] } | undefined)?.skills}
        />
      );
    case 'remote':
      return (
        <RemoteChat
          key={conversation.id}
          conversation_id={conversation.id}
          workspace={conversation.extra?.workspace}
          cron_job_id={(conversation.extra as { cron_job_id?: string })?.cron_job_id}
          loadedSkills={(conversation.extra as { skills?: string[] } | undefined)?.skills}
        />
      );
    default:
      return null;
  }
}
