/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

export type SideState = 'none' | 'empty' | 'active' | 'collapsed' | 'promoted' | 'discarded';
export type SideEvent = 'open' | 'turn' | 'collapse' | 'promote' | 'discard';

const TRANSITIONS: Record<SideState, Partial<Record<SideEvent, SideState>>> = {
  none: { open: 'empty' },
  empty: { turn: 'active', collapse: 'collapsed', discard: 'discarded' },
  active: { collapse: 'collapsed', promote: 'promoted', discard: 'discarded' },
  collapsed: { open: 'active', promote: 'promoted', discard: 'discarded' },
  promoted: {},
  discarded: {},
};

export function nextSideState(state: SideState, event: SideEvent): SideState {
  return TRANSITIONS[state][event] ?? state;
}

export function buildSideContextPreamble(opts: { recentTranscript: string; question: string }): string {
  const guardrail =
    '【侧边会话】这是从主线程分叉出的临时侧边对话。默认不要修改工作区文件或执行有副作用的命令；如确有需要，请先向用户确认。';
  const transcript = opts.recentTranscript.trim()
    ? `\n\n以下为主线程历史，仅供参考（reference-only，请勿据此擅自改动工作区）：\n${opts.recentTranscript.trim()}`
    : '';
  return `${guardrail}${transcript}\n\n用户的侧边问题：\n${opts.question}`;
}
