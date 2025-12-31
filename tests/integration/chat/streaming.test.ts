import { describe, it } from 'vitest';
import { streamText } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';
import { testPrompts } from '../../helpers/test-data';
import { assertValidStream } from '../../helpers/assertions';

describe('聊天模型 - 流式输出', () => {
  const provider = createTestProvider();

  describe('GLM-4.7 流式输出', () => {
    it('应该流式输出文本内容', async () => {
      await delay();
      const result = await streamText({
        model: provider('glm-4.7'),
        prompt: testPrompts.counting,
      });

      const chunks: string[] = [];
      for await (const chunk of result.textStream) {
        chunks.push(chunk);
      }

      assertValidStream(chunks, 3);
    });

    it('应该流式输出并保持完整性', async () => {
      await delay();
      const result = await streamText({
        model: provider('glm-4.7'),
        prompt: testPrompts.medium,
      });

      const fullTextChunks: string[] = [];
      for await (const chunk of result.textStream) {
        fullTextChunks.push(chunk);
      }

      const fullText = fullTextChunks.join('');
      expect(fullText.length).toBeGreaterThan(50);
    });
  });

  describe('GLM-4.6 流式输出', () => {
    it('应该支持流式输出', async () => {
      await delay();
      const result = await streamText({
        model: provider('glm-4.6'),
        prompt: testPrompts.short,
      });

      const chunks: string[] = [];
      for await (const chunk of result.textStream) {
        chunks.push(chunk);
      }

      assertValidStream(chunks);
    });
  });

  describe('GLM-4.5 系列流式输出', () => {
    it('GLM-4.5-Flash 应该支持流式输出', async () => {
      await delay();
      const result = await streamText({
        model: provider('glm-4.5-flash'),
        prompt: testPrompts.counting,
      });

      const chunks: string[] = [];
      for await (const chunk of result.textStream) {
        chunks.push(chunk);
      }

      assertValidStream(chunks);
    });
  });
});
