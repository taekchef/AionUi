/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TChatConversation } from '@/common/config/storage';

export type SideConversationEligibilityTarget = {
  type: TChatConversation['type'];
  backend?: string;
  /** From /api/agents behavior_policy.supports_side_question. */
  supportsSideQuestion?: boolean;
};

const STANDARD_PIPELINE_TYPES = new Set<TChatConversation['type']>([
  'acp',
  'codex',
  'openclaw-gateway',
  'nanobot',
  'remote',
  // aionrs: requires modelSelection in dock — enable after SideConversationDock wires AionrsChat
]);

export function isSideConversationSupported(target: SideConversationEligibilityTarget): boolean {
  if (target.supportsSideQuestion === false) return false;
  if (target.supportsSideQuestion === true) return true;
  if (target.type === 'gemini') return false;
  return STANDARD_PIPELINE_TYPES.has(target.type);
}

/** Hide ephemeral side threads from the session history list. */
export function isEphemeralSideConversation(conversation: Pick<TChatConversation, 'extra'>): boolean {
  return Boolean(conversation.extra?.side_mode && conversation.extra?.ephemeral);
}
