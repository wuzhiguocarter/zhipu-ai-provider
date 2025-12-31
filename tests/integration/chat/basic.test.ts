import { describe, it } from 'vitest';
import { generateText } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';
import { testPrompts } from '../../helpers/test-data';
import { assertValidText, assertValidUsage } from '../../helpers/assertions';

describe('聊天模型 - 基础功能', () => {
  const provider = createTestProvider();

  // GLM-4.7 系列测试
  describe('GLM-4.7 旗舰模型', () => {
    it('应该生成简短文本', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7'),
        prompt: testPrompts.short,
      });
      assertValidText(result.text, 10);
    });

    it('应该支持中等长度提示', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7'),
        prompt: testPrompts.medium,
      });
      assertValidText(result.text, 50);
    });

    it('应该返回正确的 token 使用统计', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7'),
        prompt: testPrompts.short,
      });
      assertValidUsage(result.usage);
    });
  });

  // GLM-4.6 系列测试
  describe('GLM-4.6 高性能模型', () => {
    it('应该正常响应', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.6'),
        prompt: testPrompts.short,
      });
      assertValidText(result.text);
    });
  });

  // GLM-4.5 系列测试
  describe('GLM-4.5 系列模型', () => {
    it('GLM-4.5 应该正常工作', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.5'),
        prompt: testPrompts.short,
      });
      assertValidText(result.text);
    });

    it('GLM-4.5-X 极速版应该快速响应', async () => {
      await delay();
      const startTime = Date.now();
      const result = await generateText({
        model: provider('glm-4.5-x'),
        prompt: testPrompts.short,
      });
      const duration = Date.now() - startTime;
      assertValidText(result.text);
      expect(duration).toBeLessThan(10000); // 应该在 10 秒内完成
    });

    it('GLM-4.5-Air 高性价比版应该正常工作', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.5-air'),
        prompt: testPrompts.medium,
      });
      assertValidText(result.text);
    });

    it('GLM-4.5-Flash 免费版应该正常工作', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.5-flash'),
        prompt: testPrompts.short,
      });
      assertValidText(result.text);
    });
  });

  // 兼容性测试
  describe('向后兼容性', () => {
    it('GLM-4-Plus 旧旗舰模型应该正常工作', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4-plus'),
        prompt: testPrompts.short,
      });
      assertValidText(result.text);
    });

    it('GLM-4-Flash 应该正常工作', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4-flash'),
        prompt: testPrompts.short,
      });
      assertValidText(result.text);
    });
  });
});
