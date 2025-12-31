# Zhipu AI Provider - 集成测试

## 概述

本目录包含 zhipu-ai-provider 的集成测试，使用真实的 Zhipu AI API 进行端到端测试。

## 环境配置

### 1. 创建环境变量文件

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

### 2. 设置 API Key

在 `.env` 文件中设置你的 API Key：

```bash
ZHIPU_API_KEY=your-actual-api-key-here
```

获取 API Key：访问 [https://open.bigmodel.cn/](https://open.bigmodel.cn/)

## 运行测试

### 运行所有集成测试

```bash
pnpm test:integration
```

### 监听模式运行

```bash
pnpm test:integration:watch
```

### 运行特定测试文件

```bash
npx vitest --config vitest.integration.config.js tests/integration/chat/basic.test.ts
```

### 运行特定测试套件

```bash
npx vitest --config vitest.integration.config.js -t "GLM-4.7"
```

## 测试结构

- `tests/helpers/` - 测试辅助工具
- `tests/integration/chat/` - 聊天模型集成测试
- `tests/integration/vision/` - 视觉模型集成测试
- `tests/integration/embedding/` - 嵌入模型集成测试
- `tests/integration/image-generation/` - 图像生成集成测试
- `tests/e2e/` - 端到端场景测试

## 注意事项

1. **API 限流**：测试会自动添加延迟（默认 1000ms）以避免 API 限流
2. **成本**：集成测试会消耗 API 配额，建议在本地运行而不是 CI/CD
3. **超时**：默认超时时间为 30 秒，可在 `.env` 中配置
4. **并发**：集成测试串行运行（`maxConcurrency: 1`）以避免并发问题

## 故障排除

### API Key 无效

如果看到错误 `ZHIPU_API_KEY 环境变量未设置`：
- 确认 `.env` 文件存在
- 确认 `.env` 文件中设置了 `ZHIPU_API_KEY`
- 确认 API Key 格式正确（通常以 `.` 分隔）

### 测试超时

如果测试经常超时：
- 增加环境变量 `TEST_TIMEOUT` 的值
- 检查网络连接
- 确认 API 服务正常

### API 限流

如果遇到 429 错误：
- 增加环境变量 `TEST_API_DELAY` 的值
- 减少并发测试数量

## 编写新测试

参考现有测试文件的模式：

1. 从 `tests/helpers/setup.ts` 导入辅助函数
2. 使用 `createTestProvider()` 创建 provider
3. 在测试开始前调用 `await delay()` 避免限流
4. 使用 `assert*` 函数进行断言

示例：

```typescript
import { describe, it } from 'vitest';
import { generateText } from 'ai';
import { createTestProvider, delay } from '../../helpers/setup';
import { assertValidText } from '../../helpers/assertions';

describe('新功能测试', () => {
  const provider = createTestProvider();

  it('应该完成某个操作', async () => {
    await delay();
    const result = await generateText({
      model: provider('glm-4.7'),
      prompt: '测试'
    });
    assertValidText(result.text);
  });
});
```

## 测试覆盖范围

### 聊天模型 (GLM-4.x)
- ✅ 基础文本生成
- ✅ 流式输出
- ✅ Thinking 模式
- ✅ 工具调用
- ✅ JSON 模式
- ✅ 多轮对话
- ✅ 所有支持的模型

### 视觉模型 (GLM-xV)
- ✅ 图像 URL 输入
- ✅ base64 图像输入
- ✅ 所有视觉模型

### 嵌入模型 (Embedding-2/3)
- ✅ 基础嵌入生成
- ✅ 维度配置（256/512/1024/2048）
- ✅ 不同文本长度测试

### 图像生成 (CogView)
- ✅ 基础图像生成
- ✅ 质量参数（standard/hd）
- ✅ 中文/英文提示词
