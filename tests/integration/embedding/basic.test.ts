import { describe, it } from 'vitest';
import { embed } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';
import { assertValidEmbedding } from '../../helpers/assertions';

describe('嵌入模型 - 基础功能', () => {
  const provider = createTestProvider();

  describe('Embedding-3 模型', () => {
    it('应该生成默认维度（2048）的嵌入向量', async () => {
      await delay();
      const { embedding } = await embed({
        model: provider.textEmbeddingModel('embedding-3'),
        value: '你好，世界！',
      });

      assertValidEmbedding(embedding, 2048);
    });

    it('应该支持 256 维度', async () => {
      await delay();
      const { embedding } = await embed({
        model: provider.textEmbeddingModel('embedding-3', { dimensions: 256 }),
        value: '测试文本',
      });

      assertValidEmbedding(embedding, 256);
    });

    it('应该支持 512 维度', async () => {
      await delay();
      const { embedding } = await embed({
        model: provider.textEmbeddingModel('embedding-3', { dimensions: 512 }),
        value: '测试文本',
      });

      assertValidEmbedding(embedding, 512);
    });

    it('应该支持 1024 维度', async () => {
      await delay();
      const { embedding } = await embed({
        model: provider.textEmbeddingModel('embedding-3', { dimensions: 1024 }),
        value: '测试文本',
      });

      assertValidEmbedding(embedding, 1024);
    });
  });

  describe('Embedding-2 模型', () => {
    it('应该正常生成嵌入向量', async () => {
      await delay();
      const { embedding } = await embed({
        model: provider.textEmbeddingModel('embedding-2'),
        value: '测试嵌入向量生成',
      });

      assertValidEmbedding(embedding);
    });
  });
});
