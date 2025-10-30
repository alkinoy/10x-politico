# OpenRouter Service Implementation Plan

## 1. Service Description

The OpenRouter service provides a clean, type-safe interface for interacting with OpenRouter.ai's API to perform LLM-based chat completions. The service enables structured conversations with various AI models, supporting system and user messages, structured JSON responses via JSON schemas, and configurable model parameters.

### Primary Responsibilities
- Making authenticated API requests to OpenRouter's chat completion endpoint
- Constructing properly formatted message payloads with system and user messages
- Handling structured responses using JSON schema validation
- Managing model selection and configuration parameters
- Providing comprehensive error handling and meaningful error messages
- Ensuring type safety throughout the request/response cycle

### Key Features
- **Type-safe API**: Full TypeScript support with DTOs for requests and responses
- **Structured Output**: Support for JSON schema-based response formatting
- **Flexible Configuration**: Easy model selection and parameter customization
- **Robust Error Handling**: Custom error types with detailed context
- **Security**: API key management and secure HTTP communication
- **Extensibility**: Easy to add support for new models and features

---

## 2. Service Architecture

### File Structure
```
src/lib/services/
  └── openrouter-service.ts  (main service implementation)

src/lib/
  └── openrouter-errors.ts   (custom error types)

src/types.ts                  (add OpenRouter DTOs)
```

### Type Definitions (to be added to `src/types.ts`)

```typescript
// ============================================================================
// OpenRouter API Types
// ============================================================================

/**
 * Message role in a conversation
 */
export type MessageRole = "system" | "user" | "assistant";

/**
 * Individual message in a conversation
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/**
 * JSON schema definition for structured responses
 * Must conform to OpenRouter's expected format
 */
export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
}

/**
 * Model configuration parameters
 */
export interface ModelParameters {
  /** Sampling temperature (0-2). Higher = more random. Default: 1 */
  temperature?: number;
  /** Maximum tokens to generate. Default: model-specific */
  max_tokens?: number;
  /** Nucleus sampling threshold (0-1). Alternative to temperature */
  top_p?: number;
  /** Frequency penalty (-2 to 2). Reduces repetition */
  frequency_penalty?: number;
  /** Presence penalty (-2 to 2). Encourages topic diversity */
  presence_penalty?: number;
  /** Stop sequences to end generation */
  stop?: string | string[];
}

/**
 * Complete request to OpenRouter API
 */
export interface OpenRouterChatRequest {
  /** Model identifier (e.g., "anthropic/claude-3.5-sonnet") */
  model: string;
  /** Conversation messages (system, user, assistant) */
  messages: ChatMessage[];
  /** Optional: Structured response format with JSON schema */
  response_format?: ResponseFormat;
  /** Optional: Model parameters for controlling generation */
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
}

/**
 * Usage statistics from API response
 */
export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/**
 * Individual choice from API response
 */
export interface OpenRouterChoice {
  index: number;
  message: ChatMessage;
  finish_reason: "stop" | "length" | "content_filter" | "tool_calls" | null;
}

/**
 * Complete response from OpenRouter API
 */
export interface OpenRouterChatResponse {
  id: string;
  model: string;
  created: number;
  choices: OpenRouterChoice[];
  usage?: OpenRouterUsage;
}

/**
 * Simplified response for service consumers
 */
export interface ChatCompletionResult<T = string> {
  /** The generated content (string or parsed JSON) */
  content: T;
  /** Model that generated the response */
  model: string;
  /** Why generation stopped */
  finish_reason: string;
  /** Token usage statistics (if available) */
  usage?: OpenRouterUsage;
  /** Full raw response for advanced use cases */
  raw?: OpenRouterChatResponse;
}

/**
 * Configuration for a chat completion request
 */
export interface ChatCompletionConfig {
  /** Model to use (e.g., "anthropic/claude-3.5-sonnet") */
  model: string;
  /** System message to set behavior and context */
  systemMessage?: string;
  /** User message(s) - can be string or array of messages */
  userMessage: string | ChatMessage[];
  /** Optional: JSON schema for structured responses */
  responseFormat?: ResponseFormat;
  /** Optional: Model parameters */
  parameters?: ModelParameters;
}
```

---

## 3. Error Handling Types

Create `src/lib/openrouter-errors.ts`:

```typescript
/**
 * OpenRouter Service Error Types
 *
 * Custom error classes for different failure scenarios
 */

/**
 * Base error class for all OpenRouter-related errors
 */
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: unknown
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

/**
 * Error thrown when API key is missing or invalid
 */
export class OpenRouterAuthError extends OpenRouterError {
  constructor(message = "OpenRouter API key is missing or invalid") {
    super(message, 401);
    this.name = "OpenRouterAuthError";
  }
}

/**
 * Error thrown when request validation fails
 */
export class OpenRouterValidationError extends OpenRouterError {
  constructor(message: string, public validationErrors?: string[]) {
    super(message, 400);
    this.name = "OpenRouterValidationError";
  }
}

/**
 * Error thrown when API rate limits are exceeded
 */
export class OpenRouterRateLimitError extends OpenRouterError {
  constructor(
    message = "OpenRouter API rate limit exceeded",
    public retryAfter?: number
  ) {
    super(message, 429);
    this.name = "OpenRouterRateLimitError";
  }
}

/**
 * Error thrown when the model is not available or doesn't exist
 */
export class OpenRouterModelError extends OpenRouterError {
  constructor(message: string, public modelId?: string) {
    super(message, 404);
    this.name = "OpenRouterModelError";
  }
}

/**
 * Error thrown when response parsing fails
 */
export class OpenRouterParseError extends OpenRouterError {
  constructor(
    message: string,
    public rawContent?: string
  ) {
    super(message);
    this.name = "OpenRouterParseError";
  }
}

/**
 * Error thrown for network-related failures
 */
export class OpenRouterNetworkError extends OpenRouterError {
  constructor(
    message = "Network error while communicating with OpenRouter",
    public originalError?: Error
  ) {
    super(message);
    this.name = "OpenRouterNetworkError";
  }
}
```

---

## 4. Main Service Implementation

Create `src/lib/services/openrouter-service.ts`:

### 4.1 Service Configuration

```typescript
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
  ResponseFormat,
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
 * Get OpenRouter API key from environment
 * @throws OpenRouterAuthError if API key is not configured
 */
function getApiKey(): string {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new OpenRouterAuthError(
      "OPENROUTER_API_KEY environment variable is not set"
    );
  }
  
  return apiKey;
}
```

### 4.2 Request Validation

```typescript
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
    throw new OpenRouterValidationError(
      `Configuration validation failed: ${errors.join(", ")}`,
      errors
    );
  }
}
```

### 4.3 Message Building

```typescript
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
```

### 4.4 Request Building

```typescript
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
```

### 4.5 HTTP Communication

```typescript
/**
 * Make HTTP request to OpenRouter API
 * @throws OpenRouterError for API errors
 * @throws OpenRouterNetworkError for network issues
 */
async function makeApiRequest(
  request: OpenRouterChatRequest
): Promise<OpenRouterChatResponse> {
  const apiKey = getApiKey();

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": import.meta.env.SITE_URL || "http://localhost:4321",
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
    throw new OpenRouterNetworkError(
      "Failed to communicate with OpenRouter API",
      error as Error
    );
  }
}

/**
 * Handle API error responses
 * @throws Appropriate OpenRouter error based on status code
 */
function handleApiError(
  status: number,
  body: unknown,
  model: string
): never {
  const errorMessage = extractErrorMessage(body);

  switch (status) {
    case 401:
    case 403:
      throw new OpenRouterAuthError(errorMessage || "Authentication failed");

    case 404:
      throw new OpenRouterModelError(
        errorMessage || `Model not found: ${model}`,
        model
      );

    case 429:
      const retryAfter = extractRetryAfter(body);
      throw new OpenRouterRateLimitError(
        errorMessage || "Rate limit exceeded",
        retryAfter
      );

    case 400:
      throw new OpenRouterValidationError(
        errorMessage || "Invalid request"
      );

    case 500:
    case 502:
    case 503:
      throw new OpenRouterError(
        errorMessage || "OpenRouter service unavailable",
        status,
        body
      );

    default:
      throw new OpenRouterError(
        errorMessage || `API request failed with status ${status}`,
        status,
        body
      );
  }
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
```

### 4.6 Response Parsing

```typescript
/**
 * Parse response content - handles both string and JSON
 * @throws OpenRouterParseError if JSON parsing fails
 */
function parseResponseContent<T>(
  content: string,
  expectJson: boolean
): T | string {
  if (!expectJson) {
    return content as T;
  }

  // Try to parse as JSON
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new OpenRouterParseError(
      "Failed to parse JSON response from model",
      content
    );
  }
}

/**
 * Extract completion result from API response
 * @throws OpenRouterError if response is invalid
 */
function extractResult<T>(
  response: OpenRouterChatResponse,
  expectJson: boolean
): ChatCompletionResult<T> {
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
```

### 4.7 Public API Function

```typescript
/**
 * Complete a chat interaction with OpenRouter
 *
 * @param config - Chat completion configuration
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
  config: ChatCompletionConfig
): Promise<ChatCompletionResult<T>> {
  // Validate configuration
  validateConfig(config);

  // Build request
  const request = buildRequest(config);

  // Make API request
  const response = await makeApiRequest(request);

  // Extract and return result
  const expectJson = !!config.responseFormat;
  return extractResult<T>(response, expectJson);
}
```

---

## 5. Environment Configuration

Add to `.env` (or `.env.example`):

```bash
# OpenRouter API Configuration
OPENROUTER_API_KEY=your_api_key_here

# Application URL (used in API requests)
SITE_URL=http://localhost:4321
```

Add type definitions to `src/env.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly OPENROUTER_API_KEY: string;
  readonly SITE_URL?: string;
  // ... other env variables
}
```

---

## 6. Usage Examples

### Example 1: Simple Text Completion

```typescript
import { chatCompletion } from "../lib/services/openrouter-service";

// Simple question-answer
const result = await chatCompletion({
  model: "anthropic/claude-3.5-sonnet",
  systemMessage: "You are a helpful assistant.",
  userMessage: "What is the capital of France?",
});

console.log(result.content); // "Paris is the capital of France."
console.log(result.usage?.total_tokens); // e.g., 45
```

### Example 2: Structured JSON Response

```typescript
import { chatCompletion } from "../lib/services/openrouter-service";
import type { ResponseFormat } from "../types";

// Define expected response type
interface CapitalInfo {
  city: string;
  country: string;
  population: number;
}

// Define JSON schema
const responseFormat: ResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "capital_info",
    strict: true,
    schema: {
      type: "object",
      properties: {
        city: { type: "string" },
        country: { type: "string" },
        population: { type: "number" }
      },
      required: ["city", "country", "population"],
      additionalProperties: false
    }
  }
};

// Make request
const result = await chatCompletion<CapitalInfo>({
  model: "openai/gpt-4o",
  systemMessage: "You are a geography expert. Provide accurate data.",
  userMessage: "What is the capital of France? Include population.",
  responseFormat,
});

// Type-safe access
console.log(result.content.city); // "Paris"
console.log(result.content.country); // "France"
console.log(result.content.population); // 2161000
```

### Example 3: With Model Parameters

```typescript
import { chatCompletion } from "../lib/services/openrouter-service";

// Creative writing with higher temperature
const result = await chatCompletion({
  model: "anthropic/claude-3.5-sonnet",
  systemMessage: "You are a creative writer.",
  userMessage: "Write a short poem about autumn.",
  parameters: {
    temperature: 1.5,      // More creative/random
    max_tokens: 200,       // Limit response length
    top_p: 0.9,           // Nucleus sampling
    presence_penalty: 0.6  // Encourage topic diversity
  }
});

console.log(result.content);
```

### Example 4: Multi-Turn Conversation

```typescript
import { chatCompletion } from "../lib/services/openrouter-service";

// Conversation history
const result = await chatCompletion({
  model: "openai/gpt-4",
  systemMessage: "You are a helpful math tutor.",
  userMessage: [
    { role: "user", content: "What is 5 + 3?" },
    { role: "assistant", content: "5 + 3 equals 8." },
    { role: "user", content: "What about if I multiply that by 2?" }
  ],
});

console.log(result.content); // "If you multiply 8 by 2, you get 16."
```

### Example 5: Error Handling

```typescript
import { chatCompletion } from "../lib/services/openrouter-service";
import {
  OpenRouterAuthError,
  OpenRouterRateLimitError,
  OpenRouterModelError,
  OpenRouterParseError,
  OpenRouterValidationError,
  OpenRouterNetworkError,
  OpenRouterError,
} from "../lib/openrouter-errors";

try {
  const result = await chatCompletion({
    model: "anthropic/claude-3.5-sonnet",
    userMessage: "Hello!",
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "greeting",
        strict: true,
        schema: {
          type: "object",
          properties: {
            message: { type: "string" }
          },
          required: ["message"],
          additionalProperties: false
        }
      }
    }
  });

  console.log(result.content);
} catch (error) {
  if (error instanceof OpenRouterAuthError) {
    console.error("Authentication failed:", error.message);
    // Handle: Check API key configuration
  } else if (error instanceof OpenRouterValidationError) {
    console.error("Validation failed:", error.message);
    console.error("Errors:", error.validationErrors);
    // Handle: Fix request parameters
  } else if (error instanceof OpenRouterRateLimitError) {
    console.error("Rate limit exceeded:", error.message);
    console.error("Retry after:", error.retryAfter, "seconds");
    // Handle: Wait and retry
  } else if (error instanceof OpenRouterModelError) {
    console.error("Model error:", error.message);
    console.error("Model:", error.modelId);
    // Handle: Use different model
  } else if (error instanceof OpenRouterParseError) {
    console.error("Parse error:", error.message);
    console.error("Raw content:", error.rawContent);
    // Handle: Check JSON schema or model compatibility
  } else if (error instanceof OpenRouterNetworkError) {
    console.error("Network error:", error.message);
    console.error("Original error:", error.originalError);
    // Handle: Check network connection
  } else if (error instanceof OpenRouterError) {
    console.error("API error:", error.message);
    console.error("Status:", error.statusCode);
    console.error("Body:", error.responseBody);
    // Handle: Generic error
  } else {
    console.error("Unexpected error:", error);
    // Handle: Unknown error
  }
}
```

### Example 6: Using in API Endpoint

```typescript
// src/pages/api/ai/analyze-statement.ts
import type { APIRoute } from "astro";
import { chatCompletion } from "../../../lib/services/openrouter-service";
import type { ResponseFormat } from "../../../types";

interface StatementAnalysis {
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  summary: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { statement } = await request.json();

    if (!statement || typeof statement !== "string") {
      return new Response(
        JSON.stringify({ error: "Statement is required" }),
        { status: 400 }
      );
    }

    const responseFormat: ResponseFormat = {
      type: "json_schema",
      json_schema: {
        name: "statement_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            sentiment: {
              type: "string",
              enum: ["positive", "neutral", "negative"]
            },
            topics: {
              type: "array",
              items: { type: "string" }
            },
            summary: { type: "string" }
          },
          required: ["sentiment", "topics", "summary"],
          additionalProperties: false
        }
      }
    };

    const result = await chatCompletion<StatementAnalysis>({
      model: "anthropic/claude-3.5-sonnet",
      systemMessage: "You are a political statement analyzer. Analyze the sentiment, identify key topics, and provide a brief summary.",
      userMessage: statement,
      responseFormat,
      parameters: {
        temperature: 0.3, // Low temperature for consistent analysis
        max_tokens: 500
      }
    });

    return new Response(
      JSON.stringify({
        analysis: result.content,
        usage: result.usage
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Analysis failed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze statement" }),
      { status: 500 }
    );
  }
};
```

---

## 7. Security Considerations

### 7.1 API Key Protection
- **Never expose API key in client-side code**: Always use API keys only in server-side code (API routes, middleware, server-side rendering)
- **Use environment variables**: Store API key in `.env` file and never commit to version control
- **Rotate keys regularly**: Change API keys periodically and after any potential exposure
- **Use rate limiting**: Configure OpenRouter rate limits for your API key

### 7.2 Input Validation
- **Validate all user inputs**: Never pass user input directly to the API without validation
- **Sanitize messages**: Remove or escape potentially harmful content
- **Limit message length**: Prevent excessively long messages that could consume tokens
- **Validate JSON schemas**: Ensure response formats are properly structured

### 7.3 Error Handling
- **Don't expose internal errors**: Sanitize error messages before sending to clients
- **Log errors securely**: Use structured logging with sensitive data redacted
- **Implement circuit breakers**: Stop making requests after repeated failures
- **Monitor API usage**: Track token consumption and costs

### 7.4 Content Safety
- **Implement content filters**: Screen user inputs for inappropriate content
- **Handle model refusals**: Model may refuse harmful requests - handle gracefully
- **Rate limit user requests**: Prevent abuse by limiting requests per user
- **Implement moderation**: Consider using moderation APIs for user-generated content

---

## 8. Testing Strategy

### 8.1 Unit Tests

Test individual functions:

```typescript
// Example test structure (using Vitest)
import { describe, it, expect, vi } from "vitest";
import { chatCompletion } from "./openrouter-service";

describe("chatCompletion", () => {
  it("should validate required configuration", async () => {
    await expect(
      chatCompletion({
        model: "",
        userMessage: "test"
      })
    ).rejects.toThrow("Model is required");
  });

  it("should build correct message structure", async () => {
    // Test message building logic
  });

  it("should handle API errors appropriately", async () => {
    // Test error handling
  });
});
```

### 8.2 Integration Tests

Test with real API (use test environment):

```typescript
describe("OpenRouter Integration", () => {
  it("should complete basic chat", async () => {
    const result = await chatCompletion({
      model: "anthropic/claude-3.5-sonnet",
      userMessage: "Say hello",
    });
    
    expect(result.content).toBeTruthy();
    expect(result.model).toBeTruthy();
  });

  it("should return structured JSON", async () => {
    // Test JSON schema response
  });
});
```

### 8.3 Mock Testing

For development without API calls:

```typescript
// Mock the service for testing other components
vi.mock("./openrouter-service", () => ({
  chatCompletion: vi.fn().mockResolvedValue({
    content: "Mocked response",
    model: "test-model",
    finish_reason: "stop",
  }),
}));
```

---

## 9. Step-by-Step Implementation Plan

### Phase 1: Foundation (Day 1)
1. **Set up error types** (`src/lib/openrouter-errors.ts`)
   - Create base `OpenRouterError` class
   - Implement specific error classes (Auth, Validation, RateLimit, etc.)
   - Add JSDoc comments

2. **Define TypeScript types** (`src/types.ts`)
   - Add `ChatMessage`, `MessageRole` types
   - Add `ResponseFormat` interface
   - Add `ModelParameters` interface
   - Add request/response types
   - Add `ChatCompletionConfig` and `ChatCompletionResult`

3. **Configure environment**
   - Add `OPENROUTER_API_KEY` to `.env`
   - Update `src/env.d.ts` with type definitions
   - Document environment variables in README

### Phase 2: Core Service (Day 2)
4. **Implement validation functions**
   - Create `validateConfig()` function
   - Test validation rules for all parameters
   - Add comprehensive error messages

5. **Implement message building**
   - Create `buildMessages()` function
   - Handle system messages
   - Handle user messages (string and array)
   - Test with various message configurations

6. **Implement request building**
   - Create `buildRequest()` function
   - Include messages, model, parameters
   - Handle optional response_format
   - Test request structure

### Phase 3: API Communication (Day 3)
7. **Implement HTTP communication**
   - Create `makeApiRequest()` function
   - Set up proper headers (Authorization, Referer, etc.)
   - Handle fetch errors
   - Test with mock responses

8. **Implement error handling**
   - Create `handleApiError()` function
   - Map status codes to error types
   - Extract error messages from responses
   - Handle retry-after headers

9. **Implement response parsing**
   - Create `parseResponseContent()` function
   - Handle string responses
   - Handle JSON responses
   - Create `extractResult()` function
   - Validate response structure

### Phase 4: Public API (Day 4)
10. **Implement main function**
    - Create `chatCompletion()` function
    - Wire up validation, building, API call, parsing
    - Add comprehensive JSDoc with examples
    - Handle all error cases

11. **Add helper functions**
    - Create `getApiKey()` helper
    - Add utility functions as needed
    - Implement any caching if required

### Phase 5: Testing & Documentation (Day 5)
12. **Write unit tests**
    - Test validation logic
    - Test message building
    - Test request building
    - Test error handling
    - Aim for >80% coverage

13. **Write integration tests**
    - Test with real API (use test API key)
    - Test basic completion
    - Test structured responses
    - Test error scenarios
    - Test rate limiting behavior

14. **Create usage documentation**
    - Document all public APIs
    - Provide examples for common use cases
    - Document error handling patterns
    - Create troubleshooting guide

### Phase 6: Polish & Deploy (Day 6)
15. **Code review and refactoring**
    - Review for code quality
    - Check TypeScript types
    - Verify error handling
    - Optimize performance

16. **Security audit**
    - Verify API key protection
    - Check input validation
    - Review error messages (no leaks)
    - Test rate limiting

17. **Create example implementations**
    - Build example API endpoint
    - Create usage examples
    - Document best practices
    - Add to project README

---

## 10. Model Selection Guide

### Recommended Models

**For structured outputs (JSON schema):**
- `openai/gpt-4o` - Best JSON schema support
- `openai/gpt-4o-mini` - Faster, cheaper alternative
- `anthropic/claude-3.5-sonnet` - Good balance

**For creative tasks:**
- `anthropic/claude-3.5-sonnet` - Excellent writing
- `openai/gpt-4o` - Very capable
- `meta-llama/llama-3.1-70b-instruct` - Good quality, lower cost

**For simple tasks:**
- `openai/gpt-4o-mini` - Fast and cheap
- `anthropic/claude-3-haiku` - Very fast
- `google/gemini-flash-1.5` - Good value

**For analysis:**
- `anthropic/claude-3.5-sonnet` - Deep analysis
- `openai/gpt-4o` - Versatile
- `perplexity/llama-3.1-sonar-large-128k-online` - Web search capability

### Model Parameters Guide

**Temperature:**
- `0.0-0.3`: Focused, deterministic (analysis, structured output)
- `0.7-1.0`: Balanced (general conversation)
- `1.0-2.0`: Creative, varied (writing, brainstorming)

**Max Tokens:**
- Short responses: 100-500
- Medium responses: 500-1500
- Long responses: 1500-4000
- Check model limits

**Top P:**
- `0.1`: Very focused
- `0.9`: Standard (good default)
- `1.0`: Full distribution

---

## 11. Common Pitfalls & Solutions

### Pitfall 1: JSON Parsing Failures
**Problem:** Model returns JSON with additional text or invalid format

**Solution:**
- Use `strict: true` in JSON schema
- Select models with good JSON support (GPT-4o, Claude)
- Lower temperature (0.0-0.3) for structured outputs
- Include clear instructions in system message

### Pitfall 2: Rate Limiting
**Problem:** Hitting API rate limits during high load

**Solution:**
- Implement exponential backoff
- Queue requests
- Use caching for repeated queries
- Monitor usage with OpenRouter dashboard

### Pitfall 3: Large Token Consumption
**Problem:** Requests consuming too many tokens, increasing costs

**Solution:**
- Set reasonable `max_tokens` limits
- Truncate long inputs
- Use cheaper models for simple tasks
- Implement token counting before requests

### Pitfall 4: Context Length Exceeded
**Problem:** Messages exceed model context window

**Solution:**
- Check model context limits
- Truncate conversation history
- Summarize earlier messages
- Use models with larger context windows

### Pitfall 5: Security Issues
**Problem:** API key exposure or unauthorized access

**Solution:**
- Never use API key in client-side code
- Validate all inputs
- Implement user authentication
- Rate limit per user
- Use serverless functions or API routes only

---

## 12. Monitoring & Maintenance

### Metrics to Track
- **API Request Count**: Total requests per time period
- **Token Usage**: Prompt tokens, completion tokens, total
- **Error Rates**: By error type and status code
- **Response Times**: Latency for API calls
- **Cost**: Track spending against budget
- **Model Usage**: Which models are used most

### Logging Strategy
```typescript
// Example logging structure
{
  timestamp: "2025-10-30T10:30:00Z",
  service: "openrouter",
  action: "chat_completion",
  model: "anthropic/claude-3.5-sonnet",
  status: "success",
  duration_ms: 1234,
  tokens: {
    prompt: 45,
    completion: 123,
    total: 168
  },
  cost_usd: 0.00234
}
```

### Alerting
Set up alerts for:
- High error rates (>5% in 5 minutes)
- Rate limit warnings (>80% of quota)
- Unusual cost spikes
- API key issues
- High latency (>5 seconds)

---

## 13. Future Enhancements

### Potential Features
1. **Request Retries**: Automatic retry with exponential backoff
2. **Response Caching**: Cache responses for identical requests
3. **Streaming Support**: Stream responses for real-time UX
4. **Batch Requests**: Send multiple requests efficiently
5. **Token Estimation**: Estimate tokens before API call
6. **Cost Tracking**: Built-in cost calculation per request
7. **Model Fallback**: Automatic fallback to alternative models
8. **Request Queue**: Queue system for high-volume scenarios
9. **A/B Testing**: Compare different models/parameters
10. **Prompt Templates**: Reusable prompt templates

### Extensibility Points
- Add more model providers (direct Anthropic, OpenAI)
- Implement prompt engineering helpers
- Add conversation memory management
- Create specialized functions for common tasks
- Build monitoring dashboard

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building a robust, type-safe, and secure OpenRouter service. The service follows best practices from the SpeechKarma codebase including:

- ✅ TypeScript-first with full type safety
- ✅ Functional programming style (exported functions, not classes)
- ✅ Comprehensive error handling with custom error types
- ✅ Early returns and guard clauses
- ✅ Clear separation of concerns
- ✅ Extensive JSDoc documentation
- ✅ Security-first design
- ✅ Testable architecture

Follow the step-by-step implementation plan to build the service systematically, ensuring each component is properly tested before moving to the next phase.

