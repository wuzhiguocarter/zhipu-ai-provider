import { describe, it } from 'vitest';
import { generateText } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';
import { testTools } from '../../helpers/test-data';

describe('聊天模型 - 工具调用', () => {
  const provider = createTestProvider();

  describe('GLM-4.7 工具调用', () => {
    it('应该正确调用工具', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7'),
        messages: [
          {
            role: 'user',
            content: '我有两个数字：10 和 25。请使用计算器工具帮我计算它们的和。',
          },
        ],
        tools: [testTools.calculator],
      });

      expect(result.toolCalls).toBeDefined();
      expect(result.toolCalls.length).toBeGreaterThan(0);
      expect(result.toolCalls[0].toolName).toBe('calculator');
    });

    it('应该传递正确的工具参数', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7'),
        messages: [
          {
            role: 'user',
            content: '计算 100 减去 37 等于多少？',
          },
        ],
        tools: [testTools.calculator],
      });

      expect(result.toolCalls).toBeDefined();
      if (result.toolCalls.length > 0) {
        const args = JSON.parse(result.toolCalls[0].args);
        expect(args.operation).toBe('subtract');
        expect(args.a).toBeDefined();
        expect(args.b).toBeDefined();
      }
    });
  });

  describe('GLM-4.6 工具调用', () => {
    it('应该支持工具调用', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.6'),
        messages: [
          {
            role: 'user',
            content: '请使用计算器工具计算 5 乘以 6',
          },
        ],
        tools: [testTools.calculator],
      });

      expect(result.toolCalls).toBeDefined();
    });
  });
});
