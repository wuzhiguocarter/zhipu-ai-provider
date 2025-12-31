import { describe, it } from 'vitest';
import { embed } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';

describe('嵌入模型 - 维度配置', () => {
  const provider = createTestProvider();

  describe('Embedding-3 维度选项', () => {
    const testTexts = [
      '短文本',
      '这是一段中等长度的测试文本，用于验证嵌入向量的生成效果',
      '这是一段较长的测试文本，包含了更多的内容和信息，用于测试嵌入模型对长文本的处理能力。嵌入向量应该能够准确地捕捉到文本的语义信息。',
    ];

    testTexts.forEach((text, index) => {
      describe(`文本长度: ${text.length} 字符`, () => {
        const dimensions = [256, 512, 1024, 2048];
        dimensions.forEach(dim => {
          it(`应该生成 ${dim} 维向量`, async () => {
            await delay();
            const { embedding } = await embed({
              model: provider.textEmbeddingModel('embedding-3', { dimensions: dim }),
              value: text,
            });

            expect(embedding).toBeDefined();
            expect(embedding.length).toBe(dim);
          });
        });
      });
    });
  });

  describe('批量嵌入', () => {
    it('应该支持多个文本的嵌入', async () => {
      const texts = ['文本1', '文本2', '文本3'];

      for (const text of texts) {
        await delay();
        const { embedding } = await embed({
          model: provider.textEmbeddingModel('embedding-3', { dimensions: 256 }),
          value: text,
        });

        expect(embedding).toBeDefined();
        expect(embedding.length).toBe(256);
      }
    });
  });
});
