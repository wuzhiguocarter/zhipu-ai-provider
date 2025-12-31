import { describe, it } from 'vitest';
import { generateText } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';
import { assertValidText } from '../../helpers/assertions';

describe('聊天模型 - Thinking 模式', () => {
  const provider = createTestProvider();

  describe('GLM-4.7 Thinking 模式', () => {
    it('应该支持启用 thinking.enabled', async () => {
      await delay();
      const startTime = Date.now();
      const result = await generateText({
        model: provider('glm-4.7', {
          thinking: { type: 'enabled' },
        }),
        prompt: '解释什么是量子计算，以及它与传统计算的区别',
      });
      const duration = Date.now() - startTime;

      assertValidText(result.text, 100);
      // Thinking 模式可能需要更长时间
      expect(duration).toBeGreaterThan(0);
    });

    it('应该支持禁用 thinking.disabled', async () => {
      await delay();
      const startTime = Date.now();
      const result = await generateText({
        model: provider('glm-4.7', {
          thinking: { type: 'disabled' },
        }),
        prompt: 'JavaScript 中如何声明变量？',
      });
      const duration = Date.now() - startTime;

      assertValidText(result.text);
      // 禁用 thinking 应该更快响应
      expect(duration).toBeLessThan(15000);
    });

    it('不设置 thinking 参数时应该正常工作', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7'),
        prompt: '请用一句话介绍 TypeScript',
      });
      assertValidText(result.text);
    });
  });

  describe('GLM-4.6 Thinking 模式', () => {
    it('应该支持 thinking 参数', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.6', {
          thinking: { type: 'enabled' },
        }),
        prompt: '解释 React 的组件生命周期',
      });
      assertValidText(result.text);
    });
  });

  describe('GLM-4.5 Thinking 模式', () => {
    it('应该支持 thinking 参数', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.5', {
          thinking: { type: 'enabled' },
        }),
        prompt: '什么是微服务架构？',
      });
      assertValidText(result.text);
    });
  });
});
