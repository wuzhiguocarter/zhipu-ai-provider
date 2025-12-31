import { CoreTool } from 'ai';

// 测试提示词模板
export const testPrompts = {
  short: '请用一句话介绍 TypeScript',
  medium: '请解释什么是递归，并给出一个简单的代码示例',
  long: '请详细解释以下概念：闭包、原型链、事件循环，并说明它们之间的关系',
  code: '用 JavaScript 写一个快速排序算法',
  json: '返回一个 JSON 对象，包含 name、age 和 city 三个字段',
  counting: '请从 1 数到 10，每行一个数字',
};

// 测试工具定义
export const testTools: Record<string, CoreTool> = {
  calculator: {
    type: 'function',
    function: {
      name: 'calculator',
      description: '执行基本的数学运算',
      parameters: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: ['add', 'subtract', 'multiply', 'divide'],
            description: '要执行的运算',
          },
          a: { type: 'number', description: '第一个数字' },
          b: { type: 'number', description: '第二个数字' },
        },
        required: ['operation', 'a', 'b'],
      },
    } as const,
  },
};

// 测试图像 URL（公共可访问）
export const testImages = {
  // 使用 placeholder 服务
  url: 'https://via.placeholder.com/300',
  // base64 编码的小图像（1x1 红色像素）
  base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
};

// 多轮对话场景
export const multiTurnScenarios = {
  contextMemory: [
    { role: 'user' as const, content: '我叫 Alice，今年 25 岁，来自北京' },
    { role: 'assistant' as const, content: '你好 Alice！很高兴认识你。' },
    { role: 'user' as const, content: '我叫什么名字？今年多大？' },
  ],
  taskFlow: [
    { role: 'user' as const, content: '帮我创建一个待办事项列表' },
    { role: 'assistant' as const, content: '好的，请告诉我你想添加哪些任务？' },
    { role: 'user' as const, content: '第一项：完成 TypeScript 项目' },
    { role: 'user' as const, content: '第二项：学习 Vitest 测试框架' },
  ],
};
