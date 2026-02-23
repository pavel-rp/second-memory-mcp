import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { SessionInputSchema } from '../types/session.js';

export const sessionToolInputSchema = SessionInputSchema.shape;

// ---------------------------------------------------------------------------
// MCP tool response helpers
// ---------------------------------------------------------------------------

type ErrorType = 'database' | 'session' | 'computation' | 'recommendation' | 'system';

interface ToolErrorOptions {
  type: ErrorType;
  message: string;
  retryable?: boolean;
}

/** Extract a human-readable message from an unknown thrown value. */
export function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error occurred';
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
