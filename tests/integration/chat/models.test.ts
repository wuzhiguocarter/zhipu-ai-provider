import { describe, it } from 'vitest';
import { generateText } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';
import { assertValidText } from '../../helpers/assertions';

describe('聊天模型 - 所有支持的模型', () => {
  const provider = createTestProvider();

  // GLM-4.7 系列
  const models47 = ['glm-4.7'];

  describe('GLM-4.7 系列', () => {
    models47.forEach(modelId => {
      it(`${modelId} 应该正常工作`, async () => {
        await delay();
        const result = await generateText({
          model: provider(modelId as any),
          prompt: '请用一句话介绍自己',
        });
        assertValidText(result.text, 5);
      });
    });
  });

  // GLM-4.6 系列
  const models46 = ['glm-4.6'];

  describe('GLM-4.6 系列', () => {
    models46.forEach(modelId => {
      it(`${modelId} 应该正常工作`, async () => {
        await delay();
        const result = await generateText({
          model: provider(modelId as any),
          prompt: '什么是 REST API？',
        });
        assertValidText(result.text);
      });
    });
  });

  // GLM-4.5 系列
  const models45 = ['glm-4.5', 'glm-4.5-x', 'glm-4.5-air', 'glm-4.5-flash'];

  describe('GLM-4.5 系列', () => {
    models45.forEach(modelId => {
      it(`${modelId} 应该正常工作`, async () => {
        await delay();
        const result = await generateText({
          model: provider(modelId as any),
          prompt: '2+2 等于几？',
        });
        assertValidText(result.text);
      });
    });
  });

  // 旧版模型
  const legacyModels = ['glm-4-plus', 'glm-4-air', 'glm-4-flash'];

  describe('旧版模型（向后兼容）', () => {
    legacyModels.forEach(modelId => {
      it(`${modelId} 应该正常工作`, async () => {
        await delay();
        const result = await generateText({
          model: provider(modelId as any),
          prompt: '你好',
        });
        assertValidText(result.text);
      });
    });
  });
});
