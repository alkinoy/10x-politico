/**
 * OpenRouter Service
 *
 * Provides type-safe interface for OpenRouter.ai API interactions.
 * Supports chat completions with structured responses using JSON schemas.
 */

import type {
  ChatCompletionConfig,
  ChatCompletionResult,
  ChatMessage,
  OpenRouterChatRequest,
  OpenRouterChatResponse,
} from "../../types";

import {
  OpenRouterAuthError,
  OpenRouterError,
  OpenRouterModelError,
  OpenRouterNetworkError,
  OpenRouterParseError,
  OpenRouterRateLimitError,
  OpenRouterValidationError,
} from "../openrouter-errors";

/**
 * OpenRouter API configuration
 */
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Get OpenRouter API key from environment or parameter
 * @param providedKey - Optional API key passed directly
 * @throws OpenRouterAuthError if API key is not configured
 */
function getApiKey(providedKey?: string): string {
  // Try provided key first, then import.meta.env, then process.env (for Node adapter)
  const apiKey = providedKey || 
                 (typeof import.meta !== 'undefined' && import.meta.env?.OPENROUTER_API_KEY) || 
                 (typeof process !== 'undefined' && process.env?.OPENROUTER_API_KEY);

  console.log("🔑 Checking API Key:", {
    "providedKey": providedKey ? "PROVIDED" : "NOT PROVIDED",
    "import.meta.env.OPENROUTER_API_KEY": (typeof import.meta !== 'undefined' && import.meta.env?.OPENROUTER_API_KEY) ? "EXISTS" : "MISSING",
    "process.env.OPENROUTER_API_KEY": (typeof process !== 'undefined' && process.env?.OPENROUTER_API_KEY) ? "EXISTS" : "MISSING",
    "final apiKey": apiKey ? "EXISTS" : "MISSING",
  });

  if (!apiKey) {
    throw new OpenRouterAuthError("OPENROUTER_API_KEY environment variable is not set");
  }

  return apiKey;
}

/**
 * Validate chat completion configuration
 * @throws OpenRouterValidationError if validation fails
 */
function validateConfig(config: ChatCompletionConfig): void {
  const errors: string[] = [];

  // Validate model
  if (!config.model || config.model.trim().length === 0) {
    errors.push("Model is required and cannot be empty");
  }

  // Validate user message
  if (Array.isArray(config.userMessage)) {
    if (config.userMessage.length === 0) {
      errors.push("User message array cannot be empty");
    }
    // Validate each message in array
    for (const msg of config.userMessage) {
      if (!msg.content || msg.content.trim().length === 0) {
        errors.push("Message content cannot be empty");
      }
      if (!["system", "user", "assistant"].includes(msg.role)) {
        errors.push(`Invalid message role: ${msg.role}`);
      }
    }
  } else {
    if (!config.userMessage || config.userMessage.trim().length === 0) {
      errors.push("User message is required and cannot be empty");
    }
  }

  // Validate parameters if provided
  if (config.parameters) {
    const { temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = config.parameters;

    if (temperature !== undefined && (temperature < 0 || temperature > 2)) {
      errors.push("Temperature must be between 0 and 2");
    }

    if (max_tokens !== undefined && max_tokens < 1) {
      errors.push("max_tokens must be at least 1");
    }

    if (top_p !== undefined && (top_p < 0 || top_p > 1)) {
      errors.push("top_p must be between 0 and 1");
    }

    if (frequency_penalty !== undefined && (frequency_penalty < -2 || frequency_penalty > 2)) {
      errors.push("frequency_penalty must be between -2 and 2");
    }

    if (presence_penalty !== undefined && (presence_penalty < -2 || presence_penalty > 2)) {
      errors.push("presence_penalty must be between -2 and 2");
    }
  }

  // Validate response format if provided
  if (config.responseFormat) {
    if (config.responseFormat.type !== "json_schema") {
      errors.push("response_format.type must be 'json_schema'");
    }

    if (!config.responseFormat.json_schema) {
      errors.push("response_format.json_schema is required");
    } else {
      if (!config.responseFormat.json_schema.name) {
        errors.push("response_format.json_schema.name is required");
      }
      if (typeof config.responseFormat.json_schema.strict !== "boolean") {
        errors.push("response_format.json_schema.strict must be a boolean");
      }
      if (!config.responseFormat.json_schema.schema) {
        errors.push("response_format.json_schema.schema is required");
      }
    }
  }

  if (errors.length > 0) {
    throw new OpenRouterValidationError(`Configuration validation failed: ${errors.join(", ")}`, errors);
  }
}

/**
 * Build messages array from configuration
 */
function buildMessages(config: ChatCompletionConfig): ChatMessage[] {
  const messages: ChatMessage[] = [];

  // Add system message if provided
  if (config.systemMessage && config.systemMessage.trim().length > 0) {
    messages.push({
      role: "system",
      content: config.systemMessage.trim(),
    });
  }

  // Add user message(s)
  if (Array.isArray(config.userMessage)) {
    // Already an array of messages - add them all
    messages.push(...config.userMessage);
  } else {
    // Single string message - convert to user message
    messages.push({
      role: "user",
      content: config.userMessage.trim(),
    });
  }

  return messages;
}

/**
 * Build OpenRouter API request from configuration
 */
function buildRequest(config: ChatCompletionConfig): OpenRouterChatRequest {
  const request: OpenRouterChatRequest = {
    model: config.model.trim(),
    messages: buildMessages(config),
  };

  // Add response format if specified
  if (config.responseFormat) {
    request.response_format = config.responseFormat;
  }

  // Add model parameters if specified
  if (config.parameters) {
    if (config.parameters.temperature !== undefined) {
      request.temperature = config.parameters.temperature;
    }
    if (config.parameters.max_tokens !== undefined) {
      request.max_tokens = config.parameters.max_tokens;
    }
    if (config.parameters.top_p !== undefined) {
      request.top_p = config.parameters.top_p;
    }
    if (config.parameters.frequency_penalty !== undefined) {
      request.frequency_penalty = config.parameters.frequency_penalty;
    }
    if (config.parameters.presence_penalty !== undefined) {
      request.presence_penalty = config.parameters.presence_penalty;
    }
    if (config.parameters.stop !== undefined) {
      request.stop = config.parameters.stop;
    }
  }

  return request;
}

/**
 * Extract error message from API response body
 */
function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const errorBody = body as Record<string, unknown>;

  // Try common error message fields
  if (typeof errorBody.error === "string") {
    return errorBody.error;
  }

  if (errorBody.error && typeof errorBody.error === "object") {
    const error = errorBody.error as Record<string, unknown>;
    if (typeof error.message === "string") {
      return error.message;
    }
  }

  if (typeof errorBody.message === "string") {
    return errorBody.message;
  }

  return null;
}

/**
 * Extract retry-after value from error response
 */
function extractRetryAfter(body: unknown): number | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const errorBody = body as Record<string, unknown>;

  if (typeof errorBody.retry_after === "number") {
    return errorBody.retry_after;
  }

  return undefined;
}

/**
 * Handle API error responses
 * @throws Appropriate OpenRouter error based on status code
 */
function handleApiError(status: number, body: unknown, model: string): never {
  const errorMessage = extractErrorMessage(body);

  switch (status) {
    case 401:
    case 403:
      throw new OpenRouterAuthError(errorMessage || "Authentication failed");

    case 404:
      throw new OpenRouterModelError(errorMessage || `Model not found: ${model}`, model);

    case 429: {
      const retryAfter = extractRetryAfter(body);
      throw new OpenRouterRateLimitError(errorMessage || "Rate limit exceeded", retryAfter);
    }

    case 400:
      throw new OpenRouterValidationError(errorMessage || "Invalid request");

    case 500:
    case 502:
    case 503:
      throw new OpenRouterError(errorMessage || "OpenRouter service unavailable", status, body);

    default:
      throw new OpenRouterError(errorMessage || `API request failed with status ${status}`, status, body);
  }
}

/**
 * Make HTTP request to OpenRouter API
 * @param request - The chat request to send
 * @param providedApiKey - Optional API key to use instead of environment variable
 * @throws OpenRouterError for API errors
 * @throws OpenRouterNetworkError for network issues
 */
async function makeApiRequest(request: OpenRouterChatRequest, providedApiKey?: string): Promise<OpenRouterChatResponse> {
  const apiKey = getApiKey(providedApiKey);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": (typeof import.meta !== 'undefined' && import.meta.env?.SITE_URL) || 
                        (typeof process !== 'undefined' && process.env?.SITE_URL) || 
                        "http://localhost:4321",
        "X-Title": "SpeechKarma",
      },
      body: JSON.stringify(request),
    });

    const responseBody = await response.json();

    // Handle error responses
    if (!response.ok) {
      return handleApiError(response.status, responseBody, request.model);
    }

    return responseBody as OpenRouterChatResponse;
  } catch (error) {
    // Network or parsing error
    if (error instanceof OpenRouterError) {
      throw error;
    }
    throw new OpenRouterNetworkError("Failed to communicate with OpenRouter API", error as Error);
  }
}

/**
 * Parse response content - handles both string and JSON
 * @throws OpenRouterParseError if JSON parsing fails
 */
function parseResponseContent<T>(content: string, expectJson: boolean): T {
  if (!expectJson) {
    // When not expecting JSON, T should be string
    return content as T;
  }

  // Try to parse as JSON
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new OpenRouterParseError("Failed to parse JSON response from model", content);
  }
}

/**
 * Extract completion result from API response
 * @throws OpenRouterError if response is invalid
 */
function extractResult<T>(response: OpenRouterChatResponse, expectJson: boolean): ChatCompletionResult<T> {
  // Validate response structure
  if (!response.choices || response.choices.length === 0) {
    throw new OpenRouterError("API response contains no choices");
  }

  const choice = response.choices[0];

  if (!choice.message || !choice.message.content) {
    throw new OpenRouterError("API response choice has no message content");
  }

  // Parse content
  const content = parseResponseContent<T>(choice.message.content, expectJson);

  return {
    content,
    model: response.model,
    finish_reason: choice.finish_reason || "unknown",
    usage: response.usage,
    raw: response,
  };
}

/**
 * Complete a chat interaction with OpenRouter
 *
 * @param config - Chat completion configuration
 * @param apiKey - Optional API key to use instead of environment variable
 * @returns Completion result with generated content
 * @throws OpenRouterAuthError if API key is missing
 * @throws OpenRouterValidationError if configuration is invalid
 * @throws OpenRouterModelError if model is not found
 * @throws OpenRouterRateLimitError if rate limit is exceeded
 * @throws OpenRouterParseError if JSON response parsing fails
 * @throws OpenRouterNetworkError if network communication fails
 * @throws OpenRouterError for other API errors
 *
 * @example Basic text completion
 * ```typescript
 * const result = await chatCompletion({
 *   model: "anthropic/claude-3.5-sonnet",
 *   systemMessage: "You are a helpful assistant.",
 *   userMessage: "What is the capital of France?",
 * });
 * console.log(result.content); // "Paris is the capital of France."
 * ```
 *
 * @example Structured JSON response
 * ```typescript
 * const result = await chatCompletion<{ city: string; country: string }>({
 *   model: "openai/gpt-4",
 *   systemMessage: "You are a geography expert.",
 *   userMessage: "What is the capital of France?",
 *   responseFormat: {
 *     type: "json_schema",
 *     json_schema: {
 *       name: "capital_info",
 *       strict: true,
 *       schema: {
 *         type: "object",
 *         properties: {
 *           city: { type: "string" },
 *           country: { type: "string" }
 *         },
 *         required: ["city", "country"],
 *         additionalProperties: false
 *       }
 *     }
 *   }
 * });
 * console.log(result.content.city); // "Paris"
 * console.log(result.content.country); // "France"
 * ```
 *
 * @example With model parameters
 * ```typescript
 * const result = await chatCompletion({
 *   model: "anthropic/claude-3.5-sonnet",
 *   userMessage: "Write a creative story about a robot.",
 *   parameters: {
 *     temperature: 1.5,
 *     max_tokens: 500,
 *     top_p: 0.9
 *   }
 * });
 * ```
 *
 * @example Multi-turn conversation
 * ```typescript
 * const result = await chatCompletion({
 *   model: "openai/gpt-4",
 *   systemMessage: "You are a helpful math tutor.",
 *   userMessage: [
 *     { role: "user", content: "What is 2+2?" },
 *     { role: "assistant", content: "2+2 equals 4." },
 *     { role: "user", content: "What about 2+3?" }
 *   ]
 * });
 * ```
 */
export async function chatCompletion<T = string>(
  config: ChatCompletionConfig, 
  apiKey?: string
): Promise<ChatCompletionResult<T>> {
  // Validate configuration
  validateConfig(config);

  // Build request
  const request = buildRequest(config);

  // Make API request
  const response = await makeApiRequest(request, apiKey);

  // Extract and return result
  const expectJson = !!config.responseFormat;
  return extractResult<T>(response, expectJson);
}
