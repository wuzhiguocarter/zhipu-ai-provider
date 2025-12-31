import { describe, it } from 'vitest';
import { generateText } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';
import { multiTurnScenarios } from '../../helpers/test-data';
import { assertValidText } from '../../helpers/assertions';

describe('聊天模型 - 多轮对话', () => {
  const provider = createTestProvider();

  describe('上下文记忆', () => {
    it('GLM-4.7 应该记住对话上下文', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7'),
        messages: multiTurnScenarios.contextMemory,
      });

      assertValidText(result.text);
      // 验证是否记住了名字和年龄
      const hasName = result.text.toLowerCase().includes('alice');
      const hasAge = result.text.includes('25');
      expect(hasName || hasAge).toBe(true);
    });
  });

  describe('复杂对话流', () => {
    it('应该支持多轮任务流', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7'),
        messages: multiTurnScenarios.taskFlow,
      });

      assertValidText(result.text, 20);
    });
  });

  describe('连续独立对话', () => {
    it('应该支持连续的独立请求', async () => {
      // 第一轮
      await delay();
      const result1 = await generateText({
        model: provider('glm-4.7'),
        prompt: '什么是 TypeScript？',
      });
      assertValidText(result1.text);

      // 第二轮（独立请求）
      await delay();
      const result2 = await generateText({
        model: provider('glm-4.7'),
        prompt: '什么是 Python？',
      });
      assertValidText(result2.text);

      // 两次回复应该不同
      expect(result1.text).not.toBe(result2.text);
    });
  });
});
