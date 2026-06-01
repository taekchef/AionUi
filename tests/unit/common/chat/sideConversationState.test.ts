/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { buildSideContextPreamble, nextSideState, type SideState } from '@/common/chat/sideConversationState';

describe('nextSideState', () => {
  it('open from none → empty', () => {
    expect(nextSideState('none', 'open')).toBe<SideState>('empty');
  });
  it('first turn: empty → active', () => {
    expect(nextSideState('empty', 'turn')).toBe<SideState>('active');
  });
  it('collapse keeps thread alive', () => {
    expect(nextSideState('active', 'collapse')).toBe<SideState>('collapsed');
  });
  it('reopen from collapsed → active', () => {
    expect(nextSideState('collapsed', 'open')).toBe<SideState>('active');
  });
  it('promote → promoted (terminal)', () => {
    expect(nextSideState('active', 'promote')).toBe<SideState>('promoted');
  });
  it('discard → discarded (terminal)', () => {
    expect(nextSideState('collapsed', 'discard')).toBe<SideState>('discarded');
  });
});

describe('buildSideContextPreamble', () => {
  it('includes guardrail + reference-only transcript', () => {
    const out = buildSideContextPreamble({
      recentTranscript: '用户: 重构 auth\nAI: 已改 3 个文件',
      question: '并发刷新怎么避免重复请求？',
    });
    expect(out).toContain('侧边会话');
    expect(out).toContain('仅供参考');
    expect(out).toContain('重构 auth');
    expect(out).toContain('并发刷新怎么避免重复请求？');
  });
  it('omits transcript block when empty', () => {
    const out = buildSideContextPreamble({ recentTranscript: '', question: 'hi' });
    expect(out).toContain('hi');
    expect(out).not.toContain('仅供参考');
  });
});
