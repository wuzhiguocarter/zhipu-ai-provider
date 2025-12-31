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
});
