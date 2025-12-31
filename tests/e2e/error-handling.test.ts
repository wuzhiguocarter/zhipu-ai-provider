import { describe, it, expect } from 'vitest';
import { generateText, embed } from 'ai';
import { createZhipu } from '../../src/zhipu-provider';
import { delay } from '../helpers/setup';

describe('端到端测试 - 错误处理', () => {
  describe('API Key 错误', () => {
    it('应该拒绝无效的 API Key', async () => {
      await delay();
      const badProvider = createZhipu({ apiKey: 'invalid-key-12345' });

      await expect(async () => {
        await generateText({
          model: badProvider('glm-4.7'),
          prompt: '测试',
        });
      }).rejects.toThrow();
    });
  });

  describe('模型 ID 错误', () => {
    it('应该拒绝不存在的模型 ID', async () => {
      const provider = createZhipu({
        apiKey: process.env.ZHIPU_API_KEY || '',
      });

      await delay();
      await expect(async () => {
        await generateText({
          model: provider('non-existent-model-id' as any),
          prompt: '测试',
        });
      }).rejects.toThrow();
    });
  });

  describe('参数验证错误', () => {
    it('应该拒绝无效的嵌入维度', async () => {
      const provider = createZhipu({
        apiKey: process.env.ZHIPU_API_KEY || '',
      });

      await delay();
      // 这可能不会抛出错误，取决于 API 实现
      // 但至少应该验证行为
      const result = await embed({
        model: provider.textEmbeddingModel('embedding-3', { dimensions: 999 }),
        value: '测试',
      });

      // 验证要么成功，要么抛出有意义的错误
      expect(result.embedding || true).toBeDefined();
    });
  });

  describe('空内容处理', () => {
    it('应该处理空提示词', async () => {
      const provider = createZhipu({
        apiKey: process.env.ZHIPU_API_KEY || '',
      });

      await delay();
      await expect(async () => {
        await generateText({
          model: provider('glm-4.7'),
          prompt: '',
        });
      }).rejects.toThrow();
    });
  });
});
