// https://bigmodel.cn/dev/howuse/model
export type ZhipuChatModelId =
  // Language Models (GLM-4.7/4.6/4.5 Series - 2025)
  | "glm-4.7" // Latest flagship model, 200K context
  | "glm-4.6" // High performance, 200K context
  | "glm-4.5" // Excellent performance
  | "glm-4.5-x" // Extreme speed version
  | "glm-4.5-air" // Cost-effective
  | "glm-4.5-airx" // Cost-effective extreme speed
  | "glm-4.5-flash" // Free model
  // Legacy Language Models
  | "glm-4-plus"
  | "glm-4-air-250414"
  | "glm-4-air"
  | "glm-4-airx"
  | "glm-4-long"
  | "glm-4-flash"
  | "glm-4-flash-250414"
  | "glm-4-flashx"
  // Vision/Video Models (GLM-4.6V/4.5V Series - 2025)
  | "glm-4.6v" // Flagship vision reasoning, 128K context
  | "glm-4.6v-flash" // Free vision reasoning
  | "glm-4.5v" // Vision reasoning with thinking mode
  // Legacy Vision/Video Models
  | "glm-4v-plus-0111"
  | "glm-4v-plus"
  | "glm-4v"
  | "glm-4v-flash"
  // Reasoning Models
  | "glm-z1-air"
  | "glm-z1-airx"
  | "glm-z1-flash"
  // Vision Reasoning Models
  | "glm-4.1v-thinking-flash"
  | "glm-4.1v-thinking-flashx"
  | (string & {});

export interface ZhipuChatSettings {
  /**
   * The unique ID of the end user, helps the platform intervene in illegal activities, generate illegal or improper information, or other abuse by the end user.
   * ID length requirement: at least 6 characters, up to 128 characters.
   */
  userId?: string;
  /**
   * The unique ID of the request, passed by the user side, must be unique;
   * The platform will generate one by default if not provided by the user side.
   */
  requestId?: string;
  /**
   * When do_sample is true, sampling strategy is enabled, when do_sample is false, the sampling strategy temperature, top_p will not take effect
   */
  doSample?: boolean;
  /**
   * Thinking mode configuration for GLM-4.5/4.6/4.7 series models.
   * Controls whether the model uses deep thinking mode for complex reasoning.
   *
   * @example
   * ```ts
   * const model = zhipu('glm-4.7', {
   *   thinking: { type: 'enabled', clear_thinking: true }
   * })
   * ```
   *
   * @remarks
   * Only supported by GLM-4.5, GLM-4.6, and GLM-4.7 models. When enabled, the model will use
   * chain-of-thought reasoning for complex tasks. Default is controlled by the API (usually "enabled").
   *
   * - `type: "enabled"`: Model uses dynamic thinking based on task complexity
   * - `type: "disabled"`: Model responds immediately without deep reasoning
   * - `clear_thinking: true`: Include reasoning content in the response (reasoning_content field)
   * - `clear_thinking: false`: Hide reasoning content, only show final answer
   */
  thinking?: {
    type: "enabled" | "disabled";
    /**
     * Whether to include the reasoning process in the response.
     * Only supported by GLM-4.5, GLM-4.6, and GLM-4.7 models.
     * When true, the response includes a reasoning_content field with the model's thinking process.
     */
    clear_thinking?: boolean;
  };

  /**
   * Controls whether tool calls use streaming.
   * Only supported by GLM-4.7 and GLM-4.6 models.
   *
   * @example
   * ```ts
   * const model = zhipu('glm-4.7', {
   *   toolStream: true
   * })
   * ```
   *
   * @remarks
   * - `true`: Tool calls are streamed in chunks (faster feedback)
   * - `false`: Tool calls are returned in complete form (wait for full tool call)
   *
   * Default behavior is controlled by the API (typically true for streaming requests).
   */
  toolStream?: boolean;
}
