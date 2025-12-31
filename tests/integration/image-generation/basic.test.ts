import { describe, it } from 'vitest';
import { experimental_generateImage as generateImage } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';

describe('图像生成 - 基础功能', () => {
  const provider = createTestProvider();

  describe('CogView-4-250304 最新模型', () => {
    it('应该生成图像并返回 URL', async () => {
      await delay();
      const { providerMetadata } = await generateImage({
        model: provider.ImageModel('cogview-4-250304'),
        prompt: '一只可爱的猫咪在窗台上晒太阳',
      });

      expect(providerMetadata).toBeDefined();
      expect(providerMetadata?.zhipu?.images).toBeDefined();
      expect(providerMetadata?.zhipu?.images[0]?.url).toBeDefined();
      expect(typeof providerMetadata.zhipu.images[0].url).toBe('string');
    });

    it('应该支持中文提示词', async () => {
      await delay();
      const { providerMetadata } = await generateImage({
        model: provider.ImageModel('cogview-4-250304'),
        prompt: '日落时分的海滩，橙红色的天空',
      });

      expect(providerMetadata?.zhipu?.images[0]?.url).toBeDefined();
    });

    it('应该支持英文提示词', async () => {
      await delay();
      const { providerMetadata } = await generateImage({
        model: provider.ImageModel('cogview-4-250304'),
        prompt: 'A futuristic city with flying cars at night',
      });

      expect(providerMetadata?.zhipu?.images[0]?.url).toBeDefined();
    });
  });

  describe('CogView-4 模型', () => {
    it('应该正常生成图像', async () => {
      await delay();
      const { providerMetadata } = await generateImage({
        model: provider.ImageModel('cogview-4'),
        prompt: '雪山风景',
      });

      expect(providerMetadata?.zhipu?.images[0]?.url).toBeDefined();
    });
  });

  describe('CogView-3-Flash 快速模型', () => {
    it('应该快速生成图像', async () => {
      await delay();
      const startTime = Date.now();
      const { providerMetadata } = await generateImage({
        model: provider.ImageModel('cogview-3-flash'),
        prompt: '简单的几何图形',
      });
      const duration = Date.now() - startTime;

      expect(providerMetadata?.zhipu?.images[0]?.url).toBeDefined();
      expect(duration).toBeLessThan(30000); // 应该在 30 秒内完成
    });
  });
});
