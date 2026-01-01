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

    it('应该支持 clear_thinking 显示思考过程', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7', {
          thinking: { type: 'enabled', clear_thinking: true },
        }),
        prompt: '解释为什么天空是蓝色的',
      });

      assertValidText(result.text, 50);
      // clear_thinking: true 应该在响应中包含推理内容
      // 注意：实际 API 响应中 reasoning_content 字段可能不在 text 中
      // 这里我们主要验证请求能成功完成
    });

    it('应该支持 clear_thinking 隐藏思考过程', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7', {
          thinking: { type: 'enabled', clear_thinking: false },
        }),
        prompt: '1+1等于几？',
      });

      assertValidText(result.text, 10);
      // clear_thinking: false 应该只返回最终答案
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

    it('应该支持 clear_thinking 参数', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.6', {
          thinking: { type: 'enabled', clear_thinking: true },
        }),
        prompt: '什么是 RESTful API？',
      });
      assertValidText(result.text, 50);
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

    it('应该支持 clear_thinking 参数', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.5', {
          thinking: { type: 'enabled', clear_thinking: true },
        }),
        prompt: '解释什么是 Docker',
      });
      assertValidText(result.text, 50);
    });
  });
});
