#!/bin/bash
# 加载 .env 文件并运行集成测试

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "✅ .env 文件已加载"
  echo "API Key: ${ZHIPU_API_KEY:0:15}..."
  echo ""
else
  echo "❌ .env 文件不存在"
  exit 1
fi

# 运行集成测试
pnpm test:integration
