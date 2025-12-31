import { describe, it } from 'vitest';
import { experimental_generateImage as generateImage } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';

describe('图像生成 - 质量参数', () => {
  const provider = createTestProvider();

  describe('CogView-4-250304 质量选项', () => {
    it('应该支持 standard 质量', async () => {
      await delay();
      const { providerMetadata } = await generateImage({
        model: provider.ImageModel('cogview-4-250304'),
        prompt: '测试图像',
        providerOptions: {
          zhipu: { quality: 'standard' },
        },
      });

      expect(providerMetadata?.zhipu?.images[0]?.url).toBeDefined();
    });

    it('应该支持 hd 高质量', async () => {
      await delay();
      const { providerMetadata } = await generateImage({
        model: provider.ImageModel('cogview-4-250304'),
        prompt: '高质量风景画',
        providerOptions: {
          zhipu: { quality: 'hd' },
        },
      });

      expect(providerMetadata?.zhipu?.images[0]?.url).toBeDefined();
    });

    it('不设置质量时应该使用默认值', async () => {
      await delay();
      const { providerMetadata } = await generateImage({
        model: provider.ImageModel('cogview-4-250304'),
        prompt: '默认质量测试',
      });

      expect(providerMetadata?.zhipu?.images[0]?.url).toBeDefined();
    });
  });
});
