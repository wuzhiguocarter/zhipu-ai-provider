import { describe } from "vitest";
import { LanguageModelV2Prompt } from "@ai-sdk/provider";
import {
  createTestServer,
  convertReadableStreamToArray,
} from "@ai-sdk/provider-utils/test";
import { createZhipu } from "./zhipu-provider";

const TEST_PROMPT: LanguageModelV2Prompt = [
  { role: "user", content: [{ type: "text", text: "Hello" }] },
];

const TEST_API_KEY = "test-api-key";
const provider = createZhipu({
  apiKey: TEST_API_KEY,
});

const model = provider.chat("glm-4-flash");

const server = createTestServer({
  "https://open.bigmodel.cn/api/paas/v4/chat/completions": {},
});

describe("doGenerate", () => {
  function prepareJsonResponse({
    content = "",
    tool_calls,
    function_call,
    usage = {
      prompt_tokens: 4,
      total_tokens: 34,
      completion_tokens: 30,
    },
    finish_reason = "stop",
    id = "chatcmpl-95ZTZkhr0mHNKqerQfiwkuox3PHAd",
    created = 1711115037,
    model = "glm-4-flash",
    headers,
  }: {
    content?: string;
    tool_calls?: Array<{
      id: string;
      type: "function";
      function: {
        name: string;
        arguments: string;
      };
    }>;
    function_call?: {
      name: string;
      arguments: string;
    };
    usage?: {
      prompt_tokens?: number;
      total_tokens?: number;
      completion_tokens?: number;
    };
    finish_reason?: string;
    created?: number;
    id?: string;
    model?: string;
    headers?: Record<string, string>;
  } = {}) {
    server.urls[
      "https://open.bigmodel.cn/api/paas/v4/chat/completions"
    ].response = {
      type: "json-value",
      headers,
      body: {
        headers,
        id,
        object: "chat.completion",
        created,
        model,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content,
              tool_calls,
              function_call,
            },
            finish_reason,
          },
        ],
        usage,
        system_fingerprint: "fp_3bc1b5746c",
      },
    };
  }

  it("should extract text response", async () => {
    prepareJsonResponse({ content: "Hello, World!" });

    const { content } = await model.doGenerate({
      prompt: TEST_PROMPT,
    });

    expect(content).toMatchInlineSnapshot(`
      [
        {
          "text": "Hello, World!",
          "type": "text",
        },
      ]
    `);
  }); // Closing brace for the 'it' block on line 90

  it("should extract usage", async () => {
    prepareJsonResponse({
      content: "",
      usage: {
        prompt_tokens: 20,
        total_tokens: 25,
        completion_tokens: 5,
      },
    });

    const { usage } = await model.doGenerate({
      prompt: TEST_PROMPT,
    });

    expect(usage).toMatchObject({
      inputTokens: 20,
      outputTokens: 5,
    });
  });

  it("should send request body", async () => {
    prepareJsonResponse({});

    const { request } = await model.doGenerate({
      prompt: TEST_PROMPT,
    });

    expect(request).toMatchObject({
      body: {
        model: "glm-4-flash",
        messages: [{ role: "user", content: "Hello" }],
      },
    });
  });

  it("should send additional response information", async () => {
    prepareJsonResponse({
      id: "test-id",
      created: 123,
      model: "test-model",
    });

    const { response } = await model.doGenerate({
      prompt: TEST_PROMPT,
    });

    expect(response).toMatchObject({
      id: "test-id",
      timestamp: new Date(123 * 1000),
      modelId: "test-model",
    });
  });

  it("should support partial usage", async () => {
    prepareJsonResponse({
      content: "",
      usage: { prompt_tokens: 20, total_tokens: 20 },
    });

    const { usage } = await model.doGenerate({
      prompt: TEST_PROMPT,
    });

    expect(usage).toMatchObject({
      inputTokens: 20,
      outputTokens: NaN,
    });
  });

  it("should extract finish reason", async () => {
    prepareJsonResponse({
      content: "",
      finish_reason: "stop",
    });

    const response = await model.doGenerate({
      prompt: TEST_PROMPT,
    });

    expect(response.finishReason).toStrictEqual("stop");
  });

  it("should support unknown finish reason", async () => {
    prepareJsonResponse({
      content: "",
      finish_reason: "eos",
    });

    const response = await model.doGenerate({
      prompt: TEST_PROMPT,
    });

    expect(response.finishReason).toStrictEqual("unknown");
  });

  it("should expose the raw response headers", async () => {
    prepareJsonResponse({
      headers: { "test-header": "test-value" },
    });

    const { response } = await model.doGenerate({
      prompt: TEST_PROMPT,
    });

    expect(response?.headers).toMatchObject({
      // default headers:
      "content-type": "application/json",

      // custom header
      "test-header": "test-value",
    });
  });

  it("should pass the model and the messages", async () => {
    prepareJsonResponse({ content: "" });

    await model.doGenerate({
      prompt: TEST_PROMPT,
    });

    expect(await server.calls[0].requestBodyJson).toMatchObject({
      model: "glm-4-flash",
      messages: [{ role: "user", content: "Hello" }],
    });
  });

  it("should pass settings", async () => {
    prepareJsonResponse();

    await provider
      .chat("glm-4-flash", {
        userId: "test-user-id",
      })
      .doGenerate({
        prompt: TEST_PROMPT,
      });

    expect(await server.calls[0].requestBodyJson).toMatchObject({
      model: "glm-4-flash",
      messages: [{ role: "user", content: "Hello" }],
      user_id: "test-user-id",
    });
  });

  it("should pass tools and toolChoice", async () => {
    prepareJsonResponse({ content: "" });

    await model.doGenerate({
      tools: [
        {
          type: "function",
          name: "test-tool",
          inputSchema: {
            type: "object",
            properties: { value: { type: "string" } },
            required: ["value"],
            additionalProperties: false,
            $schema: "http://json-schema.org/draft-07/schema#",
          },
        },
      ],
      toolChoice: {
        type: "tool",
        toolName: "test-tool",
      },
      prompt: TEST_PROMPT,
    });

    expect(await server.calls[0].requestBodyJson).toMatchObject({
      model: "glm-4-flash",
      messages: [{ role: "user", content: "Hello" }],
      tools: [
        {
          type: "function",
          function: {
            name: "test-tool",
            parameters: {
              type: "object",
              properties: { value: { type: "string" } },
              required: ["value"],
              additionalProperties: false,
              $schema: "http://json-schema.org/draft-07/schema#",
            },
          },
        },
      ],
      tool_choice: {
        toolName: "test-tool",
        type: "tool",
      },
    });
  });

  it("should pass headers", async () => {
    prepareJsonResponse({ content: "" });

    const provider = createZhipu({
      apiKey: TEST_API_KEY,
      headers: {
        "Custom-Provider-Header": "provider-header-value",
      },
    });

    await provider.chat("glm-4-flash").doGenerate({
      prompt: TEST_PROMPT,
      headers: {
        "Custom-Request-Header": "request-header-value",
      },
    });

    expect(server.calls[0].requestHeaders).toMatchObject({
      authorization: `Bearer ${TEST_API_KEY}`,
      "content-type": "application/json",
      "custom-provider-header": "provider-header-value",
      "custom-request-header": "request-header-value",
    });
  });

  it("should parse tool results", async () => {
    prepareJsonResponse({
      tool_calls: [
        {
          id: "call_O17Uplv4lJvD6DVdIvFFeRMw",
          type: "function",
          function: {
            name: "test-tool",
            arguments: '{"value":"Spark"}',
          },
        },
      ],
    });

    const result = await model.doGenerate({
      tools: [
        {
          type: "function",
          name: "test-tool",
          inputSchema: {
            type: "object",
            properties: { value: { type: "string" } },
            required: ["value"],
            additionalProperties: false,
            $schema: "http://json-schema.org/draft-07/schema#",
          },
        },
      ],
      toolChoice: {
        type: "tool",
        toolName: "test-tool",
      },
      prompt: TEST_PROMPT,
    });

    expect(result.content).toMatchInlineSnapshot(`
      [
        {
          "input": "{"value":"Spark"}",
          "providerExecuted": false,
          "toolCallId": "call_O17Uplv4lJvD6DVdIvFFeRMw",
          "toolName": "test-tool",
          "type": "tool-call",
        },
      ]
    `);
  });

  describe("response format", () => {
    it("should not send a response_format when response format is text", async () => {
      prepareJsonResponse({ content: '{"value":"Spark"}' });

      const model = provider.chat("glm-4-flash");

      await model.doGenerate({
        prompt: TEST_PROMPT,
        responseFormat: { type: "text" },
      });

      expect(await server.calls[0].requestBodyJson).toMatchObject({
        model: "glm-4-flash",
        messages: [{ role: "user", content: "Hello" }],
      });
    });

    it('should forward json response format as "json_object" without schema', async () => {
      prepareJsonResponse({ content: '{"value":"Spark"}' });

      const model = provider.chat("glm-4-flash");

      await model.doGenerate({
        prompt: TEST_PROMPT,
        responseFormat: { type: "json" },
      });

      expect(await server.calls[0].requestBodyJson).toMatchObject({
        model: "glm-4-flash",
        messages: [{ role: "user", content: "Hello" }],
        response_format: { type: "json_object" },
      });
    });
  });

  it("should pass thinking.enabled parameter to API", async () => {
    const providerWithThinking = createZhipu({
      apiKey: TEST_API_KEY,
    });
    const testModel = providerWithThinking("glm-4.7", {
      thinking: { type: "enabled" },
    });

    prepareJsonResponse({ content: "Test response" });

    await testModel.doGenerate({
      prompt: TEST_PROMPT,
    });

    expect(await server.calls[0].requestBodyJson).toMatchObject({
      model: "glm-4.7",
      messages: [{ role: "user", content: "Hello" }],
      thinking: { type: "enabled" },
    });
  });

  it("should pass thinking.disabled parameter to API", async () => {
    const providerWithThinking = createZhipu({
      apiKey: TEST_API_KEY,
    });
    const testModel = providerWithThinking("glm-4.7", {
      thinking: { type: "disabled" },
    });

    prepareJsonResponse({ content: "Test response" });

    await testModel.doGenerate({
      prompt: TEST_PROMPT,
    });

    expect(await server.calls[0].requestBodyJson).toMatchObject({
      model: "glm-4.7",
      messages: [{ role: "user", content: "Hello" }],
      thinking: { type: "disabled" },
    });
  });

  it("should work without thinking parameter (backward compatibility)", async () => {
    const providerWithoutThinking = createZhipu({
      apiKey: TEST_API_KEY,
    });
    const testModel = providerWithoutThinking("glm-4.7");

    prepareJsonResponse({ content: "Test response" });

    await testModel.doGenerate({
      prompt: TEST_PROMPT,
    });

    const requestBody = await server.calls[0].requestBodyJson;
    expect(requestBody).toMatchObject({
      model: "glm-4.7",
      messages: [{ role: "user", content: "Hello" }],
    });
    // Verify thinking is not in the request when not specified
    expect(requestBody.thinking).toBeUndefined();
  });
});

describe("doStream", () => {
  function prepareStreamResponse({
    content,
    finish_reason = "stop",
    headers,
  }: {
    content: string[];
    finish_reason?: string;
    headers?: Record<string, string>;
  }) {
    server.urls[
      "https://open.bigmodel.cn/api/paas/v4/chat/completions"
    ].response = {
      type: "stream-chunks",
      headers,
      chunks: [
        `data: {"id":"chatcmpl-e7f8e220-656c-4455-a132-dacfc1370798","object":"chat.completion.chunk","created":1702657020,"model":"grok-beta",` +
          `"system_fingerprint":null,"choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}\n\n`,
        ...content.map((text) => {
          return (
            `data: {"id":"chatcmpl-e7f8e220-656c-4455-a132-dacfc1370798","object":"chat.completion.chunk","created":1702657020,"model":"grok-beta",` +
            `"system_fingerprint":null,"choices":[{"index":1,"delta":{"content":"${text}"},"finish_reason":null}]}\n\n`
          );
        }),
        `data: {"id":"chatcmpl-e7f8e220-656c-4455-a132-dacfc1370798","object":"chat.completion.chunk","created":1702657020,"model":"grok-beta",` +
          `"system_fingerprint":null,"choices":[{"index":0,"delta":{},"finish_reason":"${finish_reason}"}]}\n\n`,
        `data: {"id":"chatcmpl-e7f8e220-656c-4455-a132-dacfc1370798","object":"chat.completion.chunk","created":1729171479,"model":"grok-beta",` +
          `"system_fingerprint":"fp_10c08bf97d","choices":[{"index":0,"delta":{},"finish_reason":"${finish_reason}"}],` +
          `"usage":{"queue_time":0.061348671,"prompt_tokens":18,"prompt_time":0.000211569,` +
          `"completion_tokens":439,"completion_time":0.798181818,"total_tokens":457,"total_time":0.798393387}}\n\n`,
        "data: [DONE]\n\n",
      ],
    };
  }

  it("should stream text deltas", async () => {
    prepareStreamResponse({
      content: ["Hello", ", ", "World!"],
      finish_reason: "stop",
    });

    const { stream } = await model.doStream({
      prompt: TEST_PROMPT,
    });

    // note: space moved to last chunk bc of trimming
    expect(await convertReadableStreamToArray(stream)).toMatchInlineSnapshot(`
      [
        {
          "id": "chatcmpl-e7f8e220-656c-4455-a132-dacfc1370798",
          "modelId": "grok-beta",
          "timestamp": 2023-12-15T16:17:00.000Z,
          "type": "response-metadata",
        },
        {
          "id": "0",
          "type": "text-start",
        },
        {
          "id": "txt-0",
          "type": "text-start",
        },
        {
          "delta": "",
          "id": "txt-0",
          "type": "text-delta",
        },
        {
          "delta": "Hello",
          "id": "txt-0",
          "type": "text-delta",
        },
        {
          "delta": ", ",
          "id": "txt-0",
          "type": "text-delta",
        },
        {
          "delta": "World!",
          "id": "txt-0",
          "type": "text-delta",
        },
        {
          "finishReason": "stop",
          "type": "finish",
          "usage": {
            "inputTokens": 18,
            "outputTokens": 439,
            "totalTokens": 457,
          },
        },
      ]
    `);
  });

  // it("should stream tool deltas", async () => {
  //     server.responseChunks = [
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"role":"assistant","content":null,` +
  //             `"tool_calls":[{"index":0,"id":"call_O17Uplv4lJvD6DVdIvFFeRMw","type":"function","function":{"name":"test-tool","arguments":""}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{\\""}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"value"}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"\\":\\""}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"Spark"}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"le"}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":" Day"}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"\\"}"}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[],"usage":{"prompt_tokens":53,"completion_tokens":17,"total_tokens":70}}\n\n`,
  //         "data: [DONE]\n\n",
  //     ];

  //     const { stream } = await model.doStream({
  //         inputFormat: "prompt",
  //         mode: {
  //             type: "regular",
  //             tools: [
  //                 {
  //                     type: "function",
  //                     name: "test-tool",
  //                     parameters: {
  //                         type: "object",
  //                         properties: { value: { type: "string" } },
  //                         required: ["value"],
  //                         additionalProperties: false,
  //                         $schema: "http://json-schema.org/draft-07/schema#",
  //                     },
  //                 },
  //             ],
  //         },
  //         prompt: TEST_PROMPT,
  //     });

  //     expect(await convertReadableStreamToArray(stream)).toStrictEqual([
  //         {
  //             type: "response-metadata",
  //             id: "chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP",
  //             modelId: "glm-4-flash-0125",
  //             timestamp: new Date("2024-03-25T09:06:38.000Z"),
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: '{"',
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: "value",
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: '":"',
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: "Spark",
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: "le",
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: " Day",
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: '"}',
  //         },
  //         {
  //             type: "tool-call",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             args: '{"value":"Sparkle Day"}',
  //         },
  //         {
  //             type: "finish",
  //             finishReason: "tool-calls",
  //             usage: { promptTokens: 53, completionTokens: 17 },
  //         },
  //     ]);
  // });

  // it("should stream tool call deltas when tool call arguments are passed in the first chunk", async () => {
  //     server.responseChunks = [
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"role":"assistant","content":null,` +
  //             `"tool_calls":[{"index":0,"id":"call_O17Uplv4lJvD6DVdIvFFeRMw","type":"function","function":{"name":"test-tool","arguments":"{\\""}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"va"}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"lue"}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"\\":\\""}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"Spark"}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"le"}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":" Day"}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"\\"}"}}]},` +
  //             `"finish_reason":null}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}\n\n`,
  //         `data: {"id":"chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP","object":"chat.completion.chunk","created":1711357598,"model":"glm-4-flash-0125",` +
  //             `"system_fingerprint":"fp_3bc1b5746c","choices":[],"usage":{"prompt_tokens":53,"completion_tokens":17,"total_tokens":70}}\n\n`,
  //         "data: [DONE]\n\n",
  //     ];

  //     const { stream } = await model.doStream({
  //         inputFormat: "prompt",
  //         mode: {
  //             type: "regular",
  //             tools: [
  //                 {
  //                     type: "function",
  //                     name: "test-tool",
  //                     parameters: {
  //                         type: "object",
  //                         properties: { value: { type: "string" } },
  //                         required: ["value"],
  //                         additionalProperties: false,
  //                         $schema: "http://json-schema.org/draft-07/schema#",
  //                     },
  //                 },
  //             ],
  //         },
  //         prompt: TEST_PROMPT,
  //     });

  //     expect(await convertReadableStreamToArray(stream)).toStrictEqual([
  //         {
  //             type: "response-metadata",
  //             id: "chatcmpl-96aZqmeDpA9IPD6tACY8djkMsJCMP",
  //             modelId: "glm-4-flash-0125",
  //             timestamp: new Date("2024-03-25T09:06:38.000Z"),
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: '{"',
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: "va",
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: "lue",
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: '":"',
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: "Spark",
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: "le",
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: " Day",
  //         },
  //         {
  //             type: "tool-call-delta",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             argsTextDelta: '"}',
  //         },
  //         {
  //             type: "tool-call",
  //             toolCallId: "call_O17Uplv4lJvD6DVdIvFFeRMw",
  //             toolCallType: "function",
  //             toolName: "test-tool",
  //             args: '{"value":"Sparkle Day"}',
  //         },
  //         {
  //             type: "finish",
  //             finishReason: "tool-calls",
  //             usage: { promptTokens: 53, completionTokens: 17 },
  //         },
  //     ]);
  // });

  it("should handle unparsable stream parts", async () => {
    server.urls[
      "https://open.bigmodel.cn/api/paas/v4/chat/completions"
    ].response = {
      type: "stream-chunks",
      chunks: [`data: {unparsable}\n\n`, "data: [DONE]\n\n"],
    };

    const { stream } = await model.doStream({
      prompt: TEST_PROMPT,
    });

    const elements = await convertReadableStreamToArray(stream);

    expect(elements.length).toBe(2);
    expect(elements[0].type).toBe("error");
    expect(elements[1]).toMatchObject({
      finishReason: "error",
      type: "finish",
      usage: {
        inputTokens: undefined,
        outputTokens: undefined,
        totalTokens: undefined,
      },
    });
  });

  it("should send request body", async () => {
    prepareStreamResponse({ content: [] });

    const { request } = await model.doStream({
      prompt: TEST_PROMPT,
    });

    expect(request).toMatchObject({
      body: {
        model: "glm-4-flash",
        messages: [{ role: "user", content: "Hello" }],
        stream: true,
        tool_choice: "auto",
        do_sample: undefined,
        max_tokens: undefined,
        request_id: undefined,
        response_format: undefined,
        temperature: undefined,
        tools: undefined,
        top_p: undefined,
        user_id: undefined,
      },
    });
  });

  it("should expose the raw response headers", async () => {
    prepareStreamResponse({
      content: [],
      headers: {
        "test-header": "test-value",
      },
    });

    const { response } = await model.doStream({
      prompt: TEST_PROMPT,
    });

    expect(response?.headers).toMatchObject({
      // default headers:
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",

      // custom header
      "test-header": "test-value",
    });
  });

  it("should pass the messages and the model", async () => {
    prepareStreamResponse({ content: [] });

    await model.doStream({
      prompt: TEST_PROMPT,
    });

    expect(await server.calls[0].requestBodyJson).toMatchObject({
      stream: true,
      model: "glm-4-flash",
      messages: [{ role: "user", content: "Hello" }],
      tool_choice: "auto",
    });
  });

  it("should pass headers", async () => {
    prepareStreamResponse({ content: [] });

    const provider = createZhipu({
      apiKey: TEST_API_KEY,
      headers: {
        "Custom-Provider-Header": "provider-header-value",
      },
    });

    await provider.chat("glm-4-flash").doStream({
      prompt: TEST_PROMPT,
      headers: {
        "Custom-Request-Header": "request-header-value",
      },
    });

    expect(await server.calls[0].requestHeaders).toMatchObject({
      authorization: `Bearer ${TEST_API_KEY}`,
      "content-type": "application/json",
      "custom-provider-header": "provider-header-value",
      "custom-request-header": "request-header-value",
    });
  });
});

describe("GLM-4.5/4.6/4.7 series", () => {
  it("should support glm-4.7 model", async () => {
    const testModel = provider.chat("glm-4.7");
    expect(testModel.modelId).toBe("glm-4.7");
  });

  it("should support glm-4.6 model", async () => {
    const testModel = provider.chat("glm-4.6");
    expect(testModel.modelId).toBe("glm-4.6");
  });

  it("should support glm-4.5 model", async () => {
    const testModel = provider.chat("glm-4.5");
    expect(testModel.modelId).toBe("glm-4.5");
  });

  it("should support glm-4.5-x model", async () => {
    const testModel = provider.chat("glm-4.5-x");
    expect(testModel.modelId).toBe("glm-4.5-x");
  });

  it("should support glm-4.5-air model", async () => {
    const testModel = provider.chat("glm-4.5-air");
    expect(testModel.modelId).toBe("glm-4.5-air");
  });

  it("should support glm-4.5-airx model", async () => {
    const testModel = provider.chat("glm-4.5-airx");
    expect(testModel.modelId).toBe("glm-4.5-airx");
  });

  it("should support glm-4.5-flash model", async () => {
    const testModel = provider.chat("glm-4.5-flash");
    expect(testModel.modelId).toBe("glm-4.5-flash");
  });

  it("should identify glm-4.6v as vision model", async () => {
    const testModel = provider.chat("glm-4.6v");
    // Vision models contain "v" in the model ID
    expect(testModel.modelId).toBe("glm-4.6v");
    expect(testModel.modelId.includes("v")).toBe(true);
  });

  it("should identify glm-4.6v-flash as vision model", async () => {
    const testModel = provider.chat("glm-4.6v-flash");
    expect(testModel.modelId).toBe("glm-4.6v-flash");
    expect(testModel.modelId.includes("v")).toBe(true);
  });

  it("should identify glm-4.5v as vision model", async () => {
    const testModel = provider.chat("glm-4.5v");
    expect(testModel.modelId).toBe("glm-4.5v");
    expect(testModel.modelId.includes("v")).toBe(true);
  });
});

describe("new parameters", () => {
  describe("thinking.clear_thinking", () => {
    it("should include clear_thinking when defined", async () => {
      server.urls[
        "https://open.bigmodel.cn/api/paas/v4/chat/completions"
      ].response = {
        type: "json-value",
        body: {
          id: "test",
          object: "chat.completion",
          created: 1711115037,
          model: "glm-4.7",
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "Hi" },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        },
      };

      const modelWithThinking = provider.chat("glm-4.7", {
        thinking: { type: "enabled", clear_thinking: true },
      });

      await modelWithThinking.doGenerate({
        prompt: TEST_PROMPT,
      });

      expect(await server.calls[0].requestBodyJson).toMatchObject({
        thinking: {
          type: "enabled",
          clear_thinking: true,
        },
      });
    });

    it("should warn when clear_thinking used with unsupported model", async () => {
      server.urls[
        "https://open.bigmodel.cn/api/paas/v4/chat/completions"
      ].response = {
        type: "json-value",
        body: {
          id: "test",
          object: "chat.completion",
          created: 1711115037,
          model: "glm-4-flash",
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "Hi" },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        },
      };

      const modelUnsupported = provider.chat("glm-4-flash", {
        thinking: { type: "enabled", clear_thinking: true },
      });

      const result = await modelUnsupported.doGenerate({
        prompt: TEST_PROMPT,
      });

      expect(result.warnings).toContainEqual({
        type: "unsupported-setting",
        setting: "thinking.clear_thinking",
        details:
          "clear_thinking is only supported by GLM-4.5, GLM-4.6, and GLM-4.7 models.",
      });
    });
  });

  describe("toolStream", () => {
    it("should include tool_stream when defined", async () => {
      server.urls[
        "https://open.bigmodel.cn/api/paas/v4/chat/completions"
      ].response = {
        type: "json-value",
        body: {
          id: "test",
          object: "chat.completion",
          created: 1711115037,
          model: "glm-4.7",
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "Hi" },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        },
      };

      const modelWithToolStream = provider.chat("glm-4.7", {
        toolStream: true,
      });

      await modelWithToolStream.doGenerate({
        prompt: TEST_PROMPT,
      });

      expect(await server.calls[0].requestBodyJson).toHaveProperty(
        "tool_stream",
        true,
      );
    });

    it("should warn when toolStream used with unsupported model", async () => {
      server.urls[
        "https://open.bigmodel.cn/api/paas/v4/chat/completions"
      ].response = {
        type: "json-value",
        body: {
          id: "test",
          object: "chat.completion",
          created: 1711115037,
          model: "glm-4-flash",
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "Hi" },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        },
      };

      const modelUnsupported = provider.chat("glm-4-flash", {
        toolStream: true,
      });

      const result = await modelUnsupported.doGenerate({
        prompt: TEST_PROMPT,
      });

      expect(result.warnings).toContainEqual({
        type: "unsupported-setting",
        setting: "toolStream",
        details: "tool_stream is only supported by GLM-4.7 and GLM-4.6 models.",
      });
    });
  });

  describe("response_format", () => {
    it("should set response_format to json_object for json type", async () => {
      server.urls[
        "https://open.bigmodel.cn/api/paas/v4/chat/completions"
      ].response = {
        type: "json-value",
        body: {
          id: "test",
          object: "chat.completion",
          created: 1711115037,
          model: "glm-4-flash",
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: '{"result": "ok"}' },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        },
      };

      await model.doGenerate({
        prompt: TEST_PROMPT,
        responseFormat: { type: "json" },
      });

      expect(await server.calls[0].requestBodyJson).toMatchObject({
        response_format: { type: "json_object" },
      });
    });

    it("should set response_format to text for text type", async () => {
      server.urls[
        "https://open.bigmodel.cn/api/paas/v4/chat/completions"
      ].response = {
        type: "json-value",
        body: {
          id: "test",
          object: "chat.completion",
          created: 1711115037,
          model: "glm-4-flash",
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "Hello" },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        },
      };

      await model.doGenerate({
        prompt: TEST_PROMPT,
        responseFormat: { type: "text" },
      });

      expect(await server.calls[0].requestBodyJson).toMatchObject({
        response_format: { type: "text" },
      });
    });

    it("should not include response_format when undefined", async () => {
      server.urls[
        "https://open.bigmodel.cn/api/paas/v4/chat/completions"
      ].response = {
        type: "json-value",
        body: {
          id: "test",
          object: "chat.completion",
          created: 1711115037,
          model: "glm-4-flash",
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "Hello" },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        },
      };

      await model.doGenerate({
        prompt: TEST_PROMPT,
      });

      expect(await server.calls[0].requestBodyJson).not.toHaveProperty(
        "response_format",
      );
    });
  });
});
