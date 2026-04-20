import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ApiErrorType } from '../domain/types/api-response.js';
import { extractErrorMessage } from '../shared/errors.js';
export { extractErrorMessage };

// ---------------------------------------------------------------------------
// MCP tool response helpers
// ---------------------------------------------------------------------------

/**
 * Legacy ErrorType values accepted by toolError.
 * Mapped to ApiErrorType at serialization time:
 *   auth | session | database | computation | recommendation | generation | system → internal
 *   validation → validation, not_found → not_found, conflict → conflict
 */
type ErrorType =
  | 'auth'
  | 'database'
  | 'session'
  | 'computation'
  | 'recommendation'
  | 'system'
  | 'validation'
  | 'not_found'
  | 'conflict'
  | 'generation'
  | 'internal'
  | 'content_quality';

const ERROR_TYPE_MAP: Record<ErrorType, ApiErrorType> = {
  auth: 'internal',
  database: 'internal',
  session: 'internal',
  computation: 'internal',
  recommendation: 'internal',
  generation: 'internal',
  system: 'internal',
  internal: 'internal',
  validation: 'validation',
  not_found: 'not_found',
  conflict: 'conflict',
  content_quality: 'content_quality',
};

interface ToolErrorOptions {
  type: ErrorType;
  message: string;
  retryable?: boolean;
  findings?: unknown;
}

/** Build a structured MCP error response: { status: "error", error: { type, message, retryable, findings? } } */
export function toolError(message: string, opts: ToolErrorOptions): CallToolResult {
  const error: Record<string, unknown> = {
    type: ERROR_TYPE_MAP[opts.type],
    message: opts.message,
    retryable: opts.retryable ?? false,
  };
  if (opts.findings !== undefined) {
    error.findings = opts.findings;
  }
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ status: 'error', error }),
      },
    ],
  };
}

/** Build a structured MCP success response: { status: "ok", data: { ...data, message } } */
export function toolOk(message: string, data?: Record<string, unknown>): CallToolResult {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ status: 'ok', data: { ...data, message } }),
      },
    ],
  };
}

/** Build an MCP success envelope: { status: "ok", data } */
export function toolData(data: unknown): CallToolResult {
  let text: string;
  try {
    text = JSON.stringify({ status: 'ok', data });
  } catch (error) {
    return toolError('Failed to serialise tool response payload', {
      type: 'internal',
      message: extractErrorMessage(error),
    });
  }

  return { content: [{ type: 'text' as const, text }] };
}

/**
 * Build an MCP response that JSON-serialises arbitrary data.
 * @deprecated Use toolData() for the standard envelope.
 */
export function toolJson(data: unknown): CallToolResult {
  let text: string;
  try {
    text = JSON.stringify(data);
  } catch (error) {
    return toolError('Failed to serialise tool response payload', {
      type: 'internal',
      message: extractErrorMessage(error),
    });
  }

  return { content: [{ type: 'text' as const, text }] };
}
