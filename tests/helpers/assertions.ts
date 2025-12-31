import { expect } from 'vitest';

// 验证文本响应
export function assertValidText(text: string, minLength: number = 10): void {
  expect(text).toBeDefined();
  expect(typeof text).toBe('string');
  expect(text.length).toBeGreaterThanOrEqual(minLength);
}

// 验证 JSON 响应
export function assertValidJSON(text: string): void {
  expect(text).toBeDefined();
  let parsed: unknown;
  expect(() => {
    parsed = JSON.parse(text);
  }).not.toThrow();
  expect(parsed).toBeDefined();
  expect(typeof parsed).toBe('object');
}

// 验证 Token 使用情况
export function assertValidUsage(usage: { totalTokens?: number }): void {
  expect(usage).toBeDefined();
  expect(usage.totalTokens).toBeDefined();
  expect(usage.totalTokens).toBeGreaterThan(0);
}

// 验证嵌入向量
export function assertValidEmbedding(
  embedding: number[],
  expectedDimensions?: number
): void {
  expect(embedding).toBeDefined();
  expect(Array.isArray(embedding)).toBe(true);
  expect(embedding.length).toBeGreaterThan(0);

  if (expectedDimensions) {
    expect(embedding.length).toBe(expectedDimensions);
  }

  // 验证所有元素都是数字且在有效范围内
  embedding.forEach((value, index) => {
    expect(typeof value).toBe('number');
    expect(!isNaN(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(-1);
    expect(value).toBeLessThanOrEqual(1);
  });
}

// 验证流式响应完整性
export function assertValidStream(
  chunks: string[],
  minChunkCount: number = 2
): void {
  expect(chunks).toBeDefined();
  expect(Array.isArray(chunks)).toBe(true);
  expect(chunks.length).toBeGreaterThanOrEqual(minChunkCount);

  // 验证连接后的内容不为空
  const fullText = chunks.join('');
  expect(fullText.trim().length).toBeGreaterThan(0);
}
