import { describe, it } from 'vitest';
import { generateText } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';
import { testImages } from '../../helpers/test-data';
import { assertValidText } from '../../helpers/assertions';

describe('视觉模型 - 图像输入', () => {
  const provider = createTestProvider();

  describe('GLM-4.6V 视觉推理', () => {
    it('应该支持图像 URL 输入', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.6v'),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: '描述这张图片' },
              { type: 'image', image: testImages.url },
            ],
          },
        ],
      });
      assertValidText(result.text);
    });

    it('应该支持 base64 图像输入', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.6v'),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: '这张图片是什么颜色？' },
              { type: 'image', image: testImages.base64 },
            ],
          },
        ],
      });
      assertValidText(result.text);
    });
  });

  describe('GLM-4.6V-Flash 免费视觉模型', () => {
    it('应该支持图像输入', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.6v-flash'),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: '描述这个图像' },
              { type: 'image', image: testImages.url },
            ],
          },
        ],
      });
      assertValidText(result.text);
    });
  });

  describe('GLM-4.5V 视觉模型', () => {
    it('应该支持图像输入', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.5v'),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: '这张图片显示了什么？' },
              { type: 'image', image: testImages.url },
            ],
          },
        ],
      });
      assertValidText(result.text);
    });
  });
});
