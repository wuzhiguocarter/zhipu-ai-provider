import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/integration/**/*.test.ts', 'tests/e2e/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],

    // 测试超时配置
    testTimeout: 30000,
    hookTimeout: 30000,

    // 并发配置（避免 API 限流）
    maxConcurrency: 1,
    fileParallelism: false,

    // 全局设置
    setupFiles: ['./tests/helpers/setup.ts'],

    // 加载环境变量
    envDir: '.',
    env: {
      NODE_ENV: 'test',
    },

    // 覆盖率（可选）
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/test/**', '**/tests/**', '**/node_modules/**', '**/dist/**'],
    },
  },
});
