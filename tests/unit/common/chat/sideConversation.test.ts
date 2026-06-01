/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { isEphemeralSideConversation, isSideConversationSupported } from '@/common/chat/sideConversation';
import type { TChatConversation } from '@/common/config/storage';

describe('isSideConversationSupported', () => {
  it('respects explicit backend opt-in', () => {
    expect(isSideConversationSupported({ type: 'acp', backend: 'kimi', supportsSideQuestion: true })).toBe(true);
  });
  it('respects explicit backend opt-out even on standard pipeline', () => {
    expect(isSideConversationSupported({ type: 'acp', backend: 'claude', supportsSideQuestion: false })).toBe(false);
  });
  it('defaults ON for standard-pipeline types', () => {
    for (const type of ['acp', 'codex', 'openclaw-gateway', 'nanobot', 'remote'] as const) {
      expect(isSideConversationSupported({ type })).toBe(true);
    }
  });
  it('defaults OFF for legacy gemini', () => {
    expect(isSideConversationSupported({ type: 'gemini' })).toBe(false);
  });
});

describe('isEphemeralSideConversation', () => {
  it('matches ephemeral side threads only', () => {
    expect(
      isEphemeralSideConversation({
        extra: { side_mode: true, ephemeral: true, backend: 'codex' },
      } as TChatConversation)
    ).toBe(true);
    expect(
      isEphemeralSideConversation({
        extra: { side_mode: true, ephemeral: false },
      } as TChatConversation)
    ).toBe(false);
  });
});
