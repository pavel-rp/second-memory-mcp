import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { extractErrorMessage } from '../utils/errors.js';
export { extractErrorMessage };

// ---------------------------------------------------------------------------
// MCP tool response helpers
// ---------------------------------------------------------------------------

type ErrorType =
  | 'database'
  | 'session'
  | 'computation'
  | 'recommendation'
  | 'system'
  | 'validation'
  | 'not_found'
  | 'generation';

interface ToolErrorOptions {
  type: ErrorType;
  message: string;
  retryable?: boolean;
}

/** Build a structured MCP error response (Pattern B). */
export function toolError(message: string, opts: ToolErrorOptions): CallToolResult {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({
          success: false,
          error: {
            type: opts.type,
            message: opts.message,
            ...(opts.retryable != null && { retryable: opts.retryable }),
          },
          message,
        }),
      },
    ],
  };
}

/** Build a structured MCP success response. */
export function toolOk(message: string, data?: Record<string, unknown>): CallToolResult {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ success: true, ...data, message }),
      },
    ],
  };
}

/** Build an MCP response that JSON-serialises arbitrary data. */
export function toolJson(data: unknown): CallToolResult {
  let text: string;
  try {
    text = JSON.stringify(data);
  } catch (error) {
    return toolError('Failed to serialise tool response payload', {
      type: 'system',
      message: extractErrorMessage(error),
    });
  }

  return { content: [{ type: 'text' as const, text }] };
}
