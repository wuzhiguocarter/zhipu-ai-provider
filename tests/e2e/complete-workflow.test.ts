import { describe, it } from 'vitest';
import { generateText, streamText, embed, experimental_generateImage as generateImage } from 'ai';
import { createTestProvider, delay } from '../helpers/setup';
import { assertValidText, assertValidUsage } from '../helpers/assertions';

describe('端到端测试 - 完整工作流', () => {
  const provider = createTestProvider();

  it('应该完成完整的文本生成工作流', async () => {
    await delay();

    // 1. 生成文本
    const textResult = await generateText({
      model: provider('glm-4.7'),
      prompt: '写一个简短的故事开头，关于一个程序员',
    });

    assertValidText(textResult.text);
    assertValidUsage(textResult.usage);
  });

  it('应该完成工具调用工作流', async () => {
    await delay();

    const result = await generateText({
      model: provider('glm-4.7'),
      messages: [
        { role: 'user', content: '帮我计算 15 乘以 7 等于多少？使用计算器工具。' },
      ],
      tools: [
        {
          type: 'function',
          name: 'calculator',
          description: '数学计算工具',
          parameters: {
            type: 'object',
            properties: {
              operation: { type: 'string', enum: ['multiply'] },
              a: { type: 'number' },
              b: { type: 'number' },
            },
            required: ['operation', 'a', 'b'],
          },
        } as const,
      ],
    });

    expect(result.toolCalls).toBeDefined();
    expect(result.toolCalls.length).toBeGreaterThan(0);
  });

  it('应该完成嵌入和检索工作流', async () => {
    await delay();

    // 生成嵌入
    const { embedding: embedding1 } = await embed({
      model: provider.textEmbeddingModel('embedding-3', { dimensions: 256 }),
      value: '人工智能是计算机科学的一个分支',
    });

    await delay();

    const { embedding: embedding2 } = await embed({
      model: provider.textEmbeddingModel('embedding-3', { dimensions: 256 }),
      value: '机器学习是人工智能的子领域',
    });

    expect(embedding1).toBeDefined();
    expect(embedding2).toBeDefined();
    expect(embedding1.length).toBe(256);
    expect(embedding2.length).toBe(256);
  });

  it('应该完成多轮对话工作流', async () => {
    await delay();

    const messages = [
      { role: 'user' as const, content: '我想创建一个博客系统' },
      { role: 'assistant' as const, content: '好的，我可以帮你设计博客系统。首先，你希望使用什么技术栈？' },
      { role: 'user' as const, content: '使用 Next.js 和 TypeScript' },
      { role: 'assistant' as const, content: '很好的选择。那么你需要哪些功能？' },
      { role: 'user' as const, content: '文章管理、评论系统、用户认证' },
    ];

    const result = await generateText({
      model: provider('glm-4.7'),
      messages: messages.slice(-2), // 最后两轮
    });

    assertValidText(result.text, 20);
  });

  it('应该完成流式输出工作流', async () => {
    await delay();

    const result = await streamText({
      model: provider('glm-4.7'),
      prompt: '列出 5 个 TypeScript 的优点',
    });

    const chunks: string[] = [];
    for await (const chunk of result.textStream) {
      chunks.push(chunk);
    }

    const fullText = chunks.join('');
    expect(fullText.length).toBeGreaterThan(50);
    expect(chunks.length).toBeGreaterThan(1);
  });
});
