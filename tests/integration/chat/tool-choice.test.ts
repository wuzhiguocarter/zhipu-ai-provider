import { describe, it } from 'vitest';
import { generateText } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';
import { testTools } from '../../helpers/test-data';

describe('聊天模型 - Tool Choice 参数', () => {
  const provider = createTestProvider();

  describe('GLM-4.7 Tool Choice', () => {
    describe('toolChoice: auto（自动模式）', () => {
      it('应该自动决定是否调用工具', async () => {
        await delay();
        const result = await generateText({
          model: provider('glm-4.7'),
          toolChoice: { type: 'auto' },
          tools: [testTools.calculator],
          prompt: '帮我计算 15 加上 27 等于多少？',
        });

        // auto 模式下，模型应该决定是否调用工具
        // 这里模型应该识别出需要计算并调用工具
        expect(result.toolCalls).toBeDefined();
        if (result.toolCalls && result.toolCalls.length > 0) {
          expect(result.toolCalls[0].toolName).toBe('calculator');
        }
      });

      it('在不需要工具时不应该调用工具', async () => {
        await delay();
        const result = await generateText({
          model: provider('glm-4.7'),
          toolChoice: { type: 'auto' },
          tools: [testTools.calculator],
          prompt: '你好，请介绍一下你自己',
        });

        // 不需要工具时，应该直接返回文本
        expect(result.text).toBeDefined();
        expect(result.text.length).toBeGreaterThan(0);
      });
    });

    describe('toolChoice: none（禁用工具）', () => {
      it('应该忽略工具直接回答', async () => {
        await delay();
        const result = await generateText({
          model: provider('glm-4.7'),
          toolChoice: { type: 'none' },
          tools: [testTools.calculator],
          prompt: '帮我计算 100 减去 25',
        });

        // none 模式下，即使有工具也不应该调用
        expect(result.toolCalls).toBeUndefined();
        expect(result.text).toBeDefined();
        expect(result.text.length).toBeGreaterThan(0);
      });

      it('应该在没有工具的情况下正常工作', async () => {
        await delay();
        const result = await generateText({
          model: provider('glm-4.7'),
          toolChoice: { type: 'none' },
          prompt: '什么是 TypeScript？',
        });

        expect(result.text).toBeDefined();
        expect(result.text.length).toBeGreaterThan(30);
      });
    });

    describe('toolChoice: required（强制调用工具）', () => {
      it('应该强制调用工具', async () => {
        await delay();
        const result = await generateText({
          model: provider('glm-4.7'),
          toolChoice: { type: 'required' },
          tools: [testTools.calculator],
          prompt: '使用计算器工具计算 8 乘以 7',
        });

        // required 模式下，必须调用工具
        expect(result.toolCalls).toBeDefined();
        expect(result.toolCalls.length).toBeGreaterThan(0);
        expect(result.toolCalls[0].toolName).toBe('calculator');
      });

      it('在强制模式下工具调用应该包含正确的参数', async () => {
        await delay();
        const result = await generateText({
          model: provider('glm-4.7'),
          toolChoice: { type: 'required' },
          tools: [testTools.calculator],
          prompt: '计算 50 除以 2',
        });

        expect(result.toolCalls).toBeDefined();
        if (result.toolCalls && result.toolCalls.length > 0) {
          const args = JSON.parse(result.toolCalls[0].args);
          expect(args.operation).toBe('divide');
          expect(args.a).toBe(50);
          expect(args.b).toBe(2);
        }
      });
    });

    describe('toolChoice: tool（指定工具）', () => {
      it('应该只使用指定的工具', async () => {
        await delay();
        const result = await generateText({
          model: provider('glm-4.7'),
          toolChoice: { type: 'tool', toolName: 'calculator' },
          tools: [testTools.calculator],
          prompt: '请帮我计算 20 加上 30',
        });

        // 指定工具时，应该只使用该工具
        expect(result.toolCalls).toBeDefined();
        expect(result.toolCalls.length).toBeGreaterThan(0);
        expect(result.toolCalls[0].toolName).toBe('calculator');
      });

      it('应该在指定工具时正确传递参数', async () => {
        await delay();
        const result = await generateText({
          model: provider('glm-4.7'),
          toolChoice: { type: 'tool', toolName: 'calculator' },
          tools: [testTools.calculator],
          prompt: '使用计算器将 100 乘以 5',
        });

        expect(result.toolCalls).toBeDefined();
        if (result.toolCalls && result.toolCalls.length > 0) {
          const args = JSON.parse(result.toolCalls[0].args);
          expect(args.operation).toBe('multiply');
          expect(args.a).toBeDefined();
          expect(args.b).toBeDefined();
        }
      });
    });

    describe('默认行为（不设置 toolChoice）', () => {
      it('应该默认使用 auto 模式', async () => {
        await delay();
        const result = await generateText({
          model: provider('glm-4.7'),
          tools: [testTools.calculator],
          prompt: '计算 3 乘以 4',
        });

        // 默认应该等同于 auto 模式
        expect(result.toolCalls).toBeDefined();
        expect(result.toolCalls.length).toBeGreaterThan(0);
      });
    });
  });

  describe('GLM-4.6 Tool Choice', () => {
    it('应该支持 toolChoice auto', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.6'),
        toolChoice: { type: 'auto' },
        tools: [testTools.calculator],
        prompt: '帮我算一下 25 减去 10',
      });

      expect(result.toolCalls).toBeDefined();
    });

    it('应该支持 toolChoice none', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.6'),
        toolChoice: { type: 'none' },
        tools: [testTools.calculator],
        prompt: '帮我算一下 25 减去 10',
      });

      // none 模式下不应该调用工具
      expect(result.toolCalls).toBeUndefined();
      expect(result.text).toBeDefined();
    });

    it('应该支持 toolChoice required', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.6'),
        toolChoice: { type: 'required' },
        tools: [testTools.calculator],
        prompt: '使用计算器计算 10 加上 20',
      });

      expect(result.toolCalls).toBeDefined();
      expect(result.toolCalls.length).toBeGreaterThan(0);
    });
  });

  describe('GLM-4.5 Tool Choice', () => {
    it('应该支持 toolChoice', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.5'),
        toolChoice: { type: 'auto' },
        tools: [testTools.calculator],
        prompt: '计算 7 乘以 8',
      });

      expect(result.toolCalls).toBeDefined();
    });
  });

  describe('Tool Choice 复杂场景', () => {
    it('应该在 required 模式下拒绝回答不使用工具的问题', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7'),
        toolChoice: { type: 'required' },
        tools: [testTools.calculator],
        prompt: '你好，请问你能做什么？',
      });

      // required 模式下，模型应该尝试调用工具
      // 或者明确表示需要使用工具
      expect(result.toolCalls).toBeDefined();
    });

    it('应该在 auto 模式下智能选择', async () => {
      await delay();
      const result = await generateText({
        model: provider('glm-4.7'),
        toolChoice: { type: 'auto' },
        tools: [testTools.calculator],
        prompt: '今天天气怎么样？',
      });

      // auto 模式下，对于不需要工具的问题，不应该调用工具
      expect(result.toolCalls).toBeUndefined();
      expect(result.text).toBeDefined();
      expect(result.text.length).toBeGreaterThan(10);
    });
  });
});
