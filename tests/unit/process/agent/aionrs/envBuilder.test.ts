/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';

import type { TProviderWithModel } from '@/common/config/storage';
import { buildSpawnConfig } from '@/process/agent/aionrs/envBuilder';

function createModel(baseUrl: string): TProviderWithModel {
  return {
    id: 'test-provider',
    platform: 'custom',
    name: 'Test Provider',
    baseUrl,
    apiKey: 'test-key',
    useModel: 'test-model',
  };
}

function buildProjectConfig(baseUrl: string): string {
  return buildSpawnConfig(createModel(baseUrl), {
    workspace: '/tmp/aionui-test-workspace',
  }).projectConfig;
}

describe('aionrs envBuilder project config', () => {
  it.each([
    ['Zhipu', 'https://open.bigmodel.cn/api/paas/v4'],
    ['Ark', 'https://ark.cn-beijing.volces.com/api/v3'],
    ['Qianfan', 'https://qianfan.baidubce.com/v2'],
  ])('uses root chat completions path for %s non-v1 OpenAI-compatible API roots', (_name, baseUrl) => {
    const config = buildProjectConfig(baseUrl);

    expect(config).toContain('[providers.openai.compat]');
    expect(config).toContain('api_path = "/chat/completions"');
  });

  it('keeps the default aionrs chat completions path for OpenAI official v1 base URLs', () => {
    const config = buildProjectConfig('https://api.openai.com/v1');

    expect(config).toContain('[providers.openai.compat]');
    expect(config).not.toContain('api_path = "/chat/completions"');
    expect(config).toContain('max_tokens_field = "max_completion_tokens"');
  });
});
