/**
 * Unified MCP API response envelope.
 *
 * Every MCP tool response uses one of these shapes:
 * - Success: { status: "ok", data: T }  (data may be any type: object, array, etc.)
 * - Error:   { status: "error", error: { type, message, retryable, findings? } }
 *
 * `findings` is populated only on `content_quality` errors and carries the
 * snake-cased form of `LinterFinding[]` from `src/domain/services/chunk-linter.ts`.
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
    /**
     * Structured diagnostics attached to `content_quality` errors.
     * Typed as `unknown` because serialization snake-cases the payload; the
     * pre-serialization shape is `LinterFinding[]` from chunk-linter.
     */
    findings?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
