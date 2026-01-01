# Zhipu AI Provider - Vercel AI SDK Community Provider
This is a [Zhipu](https://www.zhipuai.cn/) prodiver for the [AI SDK](https://sdk.vercel.ai/). It enables seamless integration with **GLM** and Embedding Models provided on [bigmodel.cn](https://bigmodel.cn/).


## Setup

```bash
# npm
npm i zhipu-ai-provider

# pnpm
pnpm add zhipu-ai-provider

# yarn
yarn add zhipu-ai-provider
```
Set up your `.env` file / environment with your API key.
```bash
ZHIPU_API_KEY=<your-api-key>
```

## Provider Instance
You can import the default provider instance `zhipu` from `zhipu-ai-provider` (This automatically reads the API key from the environment variable `ZHIPU_API_KEY`):
```ts
import { zhipu } from 'zhipu-ai-provider'
```
Alternatively, you can create a provider instance with custom configuration with `createZhipu`:
```ts
import { createZhipu } from 'zhipu-ai-provider';

const zhipu = createZhipu({
  baseURL: "https://open.bigmodel.cn/api/paas/v4",
  apiKey: "your-api-key"
});
```
You can use the following optional settings to customize the Zhipu provider instance:
- **baseURL**: *string*
  - Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `https://open.bigmodel.cn/api/paas/v4`.
- **apiKey**: *string*
  - Your API key for Zhipu [BigModel Platform](https://bigmodel.cn/). If not provided, the provider will attempt to read the API key from the environment variable `ZHIPU_API_KEY`.
- **headers**: *Record<string,string>*
  - Custom headers to include in the requests.

## Language Model Example

```ts
import { generateText } from 'ai';
import { zhipu } from 'zhipu-ai-provider';

const { text } = await generateText({
  model: zhipu('glm-4-plus'),
  prompt: 'Why is the sky blue?',
});

console.log(result)
```

### Supported Language Models

- **GLM-4.7** (Latest flagship, 200K context): `glm-4.7`
- **GLM-4.6** (High performance, 200K context): `glm-4.6`
- **GLM-4.5** (Excellent performance): `glm-4.5`, `glm-4.5-x`, `glm-4.5-air`, `glm-4.5-airx`, `glm-4.5-flash` (free)
- **GLM-4.6V** (Vision reasoning): `glm-4.6v`, `glm-4.6v-flash` (free)
- **GLM-4.5V** (Vision reasoning): `glm-4.5v`
- **Legacy models**: `glm-4-plus`, `glm-4-air`, `glm-4-flash`, `glm-4-long`, `glm-4v`, `glm-z1-*`

### Thinking Mode (GLM-4.5/4.6/4.7)

GLM-4.5, GLM-4.6, and GLM-4.7 models support a "thinking mode" for complex reasoning:

```ts
import { generateText } from 'ai';
import { zhipu } from 'zhipu-ai-provider';

const { text } = await generateText({
  model: zhipu('glm-4.7', {
    thinking: {
      type: 'enabled',        // Enable deep thinking
      clear_thinking: true    // Include reasoning process in response
    }
  }),
  prompt: 'Explain quantum computing in detail',
});

// To disable thinking for faster responses:
const { text: quickText } = await generateText({
  model: zhipu('glm-4.7', {
    thinking: { type: 'disabled' }
  }),
  prompt: 'What is 2+2?',
});
```

- `thinking: { type: 'enabled' }` - Enable dynamic thinking based on task complexity (default for GLM-4.5+)
- `thinking: { type: 'disabled' }` - Disable thinking for faster, more direct responses
- `thinking: { clear_thinking: true }` - Include the reasoning process in the response (`reasoning_content` field)
- `thinking: { clear_thinking: false }` - Hide the reasoning process, only show final answer

### Tool Streaming (GLM-4.6/4.7)

GLM-4.7 and GLM-4.6 models support controlling tool call streaming:

```ts
const result = await generateText({
  model: zhipu('glm-4.7', {
    toolStream: true  // Stream tool call parameters
  }),
  tools: {
    getWeather: {
      description: 'Get weather information',
      parameters: z.object({
        city: z.string(),
      }),
      execute: async ({ city }) => `${city} Sunny 25°C`
    }
  },
  prompt: 'What is the weather in Beijing today?'
});
```

- `toolStream: true` - Tool call parameters are streamed in chunks for faster feedback
- `toolStream: false` - Wait for complete tool call before returning

### Response Format

Control the output format of the model:

```ts
// JSON mode
const { text } = await generateText({
  model: zhipu('glm-4-flash'),
  responseFormat: { type: 'json' },
  prompt: 'List three fruits in JSON array format'
});

// Text mode (explicit)
const { text } = await generateText({
  model: zhipu('glm-4-flash'),
  responseFormat: { type: 'text' },
  prompt: 'Write a poem'
});
```

- `{ type: 'text' }` - Plain text output (default)
- `{ type: 'json' }` - JSON format output (text models only)

**Note:** Vision and reasoning models do not support JSON format.

## Embedding Example
```ts
const { embedding } = await embed({
  model: zhipu.textEmbeddingModel("embedding-3", {
    dimensions: 256, // Optional, defaults to 2048
  }),
  value: "Hello, world!",
});

console.log(embedding);
```

## Image Generation Example
Zhipu supports image generation with the `cogview` models, but the api does not return images in base64 or buffer format, so the image urls are returned in the `providerMetadata` field.

```ts
import { experimental_generateImage as generateImage } from 'ai';
import { zhipu } from 'zhipu-ai-provider';

const { image, providerMetadata } = await generateImage({
  model: zhipu.ImageModel('cogview-4-250304'),
  prompt: 'A beautiful landscape with mountains and a river',
  size: '1024x1024',  // optional
  providerOptions: {  // optional
      zhipu: {
          quality: 'hd'
      }
  }
});

console.log(providerMetadata.zhipu.images[0].url)
```

## Testing

### Unit Tests
The project includes comprehensive unit tests that use mock data and do not require API calls:

```bash
# Run all unit tests
pnpm test src

# Run specific test file
pnpm test src/zhipu-chat-language-model.test.ts
```

### Integration Tests
Integration tests use the real Zhipu AI API and require an API key:

```bash
# Set up your API key in .env file
echo "ZHIPU_API_KEY=your-api-key-here" > .env

# Run integration tests
pnpm test:node

# Run specific integration test
pnpm test tests/integration/chat/thinking-mode.test.ts
```

**Note**: Integration tests consume API quota. See [tests/INTEGRATION_TEST_GUIDE.md](tests/INTEGRATION_TEST_GUIDE.md) for detailed information.

## Features Support
- [x] Text generation
- [x] Text embedding
- [x] Image generation
- [x] Chat
- [x] Tools
- [x] Streaming
- [x] Structured output
- [x] Reasoning
- [x] Vision
- [x] Vision Reasoning
- [ ] Provider-defined tools
- [ ] Voice Models

## Documentation
- **[Zhipu documentation](https://bigmodel.cn/dev/welcome)** 
- **[Vercel AI SDK documentation](https://sdk.vercel.ai/docs/introduction)**
- **[Zhipu AI Provider Repo](https://github.com/wuzhiguocarter/zhipu-ai-provider)**