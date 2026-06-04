/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import { acpBackendUsesAgentFork, isSideConversationSupported } from '@/common/chat/sideConversation';

describe('isSideConversationSupported', () => {
  it('allows acp, codex, and aionrs side panels', () => {
    expect(isSideConversationSupported({ type: 'acp', backend: 'claude' })).toBe(true);
    expect(isSideConversationSupported({ type: 'codex', backend: 'codex' })).toBe(true);
    expect(isSideConversationSupported({ type: 'aionrs' })).toBe(true);
  });

  it('disallows openclaw, nanobot, remote, and legacy gemini', () => {
    expect(isSideConversationSupported({ type: 'openclaw-gateway' })).toBe(false);
    expect(isSideConversationSupported({ type: 'nanobot' })).toBe(false);
    expect(isSideConversationSupported({ type: 'remote' })).toBe(false);
    expect(isSideConversationSupported({ type: 'gemini' })).toBe(false);
  });
});

describe('acpBackendUsesAgentFork', () => {
  it('only lists spec fork backends', () => {
    expect(acpBackendUsesAgentFork('claude')).toBe(true);
    expect(acpBackendUsesAgentFork('opencode')).toBe(true);
    expect(acpBackendUsesAgentFork('vibe')).toBe(true);
    expect(acpBackendUsesAgentFork('codex')).toBe(false);
    expect(acpBackendUsesAgentFork('gemini')).toBe(false);
  });
});
