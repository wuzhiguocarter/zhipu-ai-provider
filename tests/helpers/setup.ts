import { beforeAll, afterAll } from 'vitest';
import { createZhipu } from '../../src/zhipu-provider';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// 手动加载 .env 文件
function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    // .env 文件不存在，忽略
  }
}

loadEnvFile();

// 全局测试配置
export const testConfig = {
  apiKey: process.env.ZHIPU_API_KEY || '',
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  apiDelay: parseInt(process.env.TEST_API_DELAY || '2000'), // 增加到 2 秒以避免限流
  failFast: process.env.TEST_FAIL_FAST === 'true',
};

// 验证 API Key
export function validateApiKey(): void {
  if (!testConfig.apiKey) {
    throw new Error(
      'ZHIPU_API_KEY 环境变量未设置。\n' +
        '请创建 .env 文件并设置 ZHIPU_API_KEY=your-key\n' +
        '参考 .env.example 文件'
    );
  }
}

// 创建测试用 provider
export function createTestProvider() {
  validateApiKey();
  return createZhipu({
    apiKey: testConfig.apiKey,
  });
}

// 延迟工具（避免 API 限流）
export async function delay(ms: number = testConfig.apiDelay): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 全局设置
beforeAll(async () => {
  validateApiKey();
  console.log(`\n🧪 集成测试开始`);
  console.log(`API Key: ${testConfig.apiKey.substring(0, 15)}...`);
  console.log(`超时设置: ${testConfig.timeout}ms`);
  console.log(`API 请求间隔: ${testConfig.apiDelay}ms\n`);
});

afterAll(async () => {
  console.log('\n✅ 集成测试完成\n');
});
