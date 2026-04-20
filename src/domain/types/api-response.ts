/**
 * Unified MCP API response envelope.
 *
 * Every MCP tool response uses one of these shapes:
 * - Success: { status: "ok", data: T }  (data may be any type: object, array, etc.)
 * - Error:   { status: "error", error: { type, message, retryable } }
 */

export type ApiErrorType = 'validation' | 'not_found' | 'conflict' | 'internal' | 'content_quality';

export type ApiSuccess<T> = {
  status: 'ok';
  data: T;
};

export type ApiError = {
  status: 'error';
  error: {
    type: ApiErrorType;
    message: string;
    retryable: boolean;
    findings?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
