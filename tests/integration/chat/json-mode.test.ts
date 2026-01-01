import { describe, it } from 'vitest';
import { generateText } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';
import { assertValidJSON, assertValidText } from '../../helpers/assertions';

describe('聊天模型 - JSON 模式', () => {
  const provider = createTestProvider();

  describe('GLM-4.7 JSON 模式', () => {
    it('应该生成有效的 JSON', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7'),
        prompt: '返回一个 JSON 对象，包含 name、age 和 city 三个字段',
        responseFormat: { type: 'json' },
      });

      assertValidJSON(result.text);
      const parsed = JSON.parse(result.text);
      expect(parsed).toHaveProperty('name');
      expect(parsed).toHaveProperty('age');
      expect(parsed).toHaveProperty('city');
    });

    it('应该生成复杂的 JSON 结构', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7'),
        prompt:
          '生成一个用户配置 JSON，包含 username、settings（对象）、preferences（数组）',
        responseFormat: { type: 'json' },
      });

      assertValidJSON(result.text);
      const parsed = JSON.parse(result.text);
      expect(parsed).toHaveProperty('username');
      expect(parsed).toHaveProperty('settings');
      expect(parsed).toHaveProperty('preferences');
      expect(Array.isArray(parsed.preferences)).toBe(true);
    });
  });

  describe('GLM-4.6 JSON 模式', () => {
    it('应该支持 JSON 模式', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.6'),
        prompt: '返回包含 title 和 description 的 JSON',
        responseFormat: { type: 'json' },
      });

      assertValidJSON(result.text);
    });
  });

  describe('Response Format Text 模式', () => {
    it('应该支持 responseFormat text 类型', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4-flash'),
        prompt: '写一首关于春天的诗',
        responseFormat: { type: 'text' },
      });

      assertValidText(result.text, 50);
      // 确保返回的是普通文本，不是 JSON
      expect(() => JSON.parse(result.text)).toThrow();
    });

    it('应该在 text 模式下返回自然语言', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4-flash'),
        prompt: '请介绍一下你的功能',
        responseFormat: { type: 'text' },
      });

      assertValidText(result.text, 30);
    });

    it('不设置 responseFormat 时应该正常工作', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4-flash'),
        prompt: '什么是人工智能？',
      });

      assertValidText(result.text, 50);
    });
  });
});
