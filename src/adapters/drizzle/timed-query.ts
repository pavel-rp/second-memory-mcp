import { performance } from 'node:perf_hooks';
import { logEvent } from '../../shared/logger.js';
import { parseNumber } from '../../shared/env-parsing.js';

const DEFAULT_SLOW_QUERY_THRESHOLD_MS = 100;

/**
 * Resolve the slow-query threshold (ms) at call time so deployments and tests
 * can override `SLOW_QUERY_THRESHOLD_MS` without re-importing the module.
 */
function slowQueryThresholdMs(): number {
  return parseNumber(process.env.SLOW_QUERY_THRESHOLD_MS, DEFAULT_SLOW_QUERY_THRESHOLD_MS);
}

/**
 * Emit an operation event, swallowing any logger failure. Diagnostics must
 * never alter query behavior (fail-open) — mirrors the defensive `try/catch`
 * around `logEvent` in `tier2-circuit-breaker.ts`.
 */
function safeLogEvent(
  operation: string,
  event: string,
  data: Record<string, unknown>,
  durationMs: number
): void {
  try {
    logEvent(operation, event, data, durationMs);
  } catch {
    // A broken event logger must never poison a DB call.
  }
}

/**
 * Wrap a Drizzle adapter operation with diagnostics:
 * - times the call and persists a `slow_query` event when it exceeds the
 *   configurable `SLOW_QUERY_THRESHOLD_MS` threshold (default 100ms);
 * - persists a `query_failed` event carrying operation context on error, then
 *   re-throws the original error so existing error handling is unaffected.
 *
 * Event logging is fail-open: a broken logger never changes the call's result.
 */
export async function timedQuery<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const durationMs = Math.round(performance.now() - start);
    const thresholdMs = slowQueryThresholdMs();
    if (durationMs > thresholdMs) {
      // `durationMs` is persisted to the dedicated `duration_ms` column, so the
      // `data` payload carries only the non-redundant threshold that was exceeded.
      safeLogEvent(operation, 'slow_query', { threshold_ms: thresholdMs }, durationMs);
    }
    return result;
  } catch (err) {
    const durationMs = Math.round(performance.now() - start);
    const errorClass = err instanceof Error ? err.constructor.name : typeof err;
    const errorMessage = err instanceof Error ? err.message : String(err);
    // `operation` is persisted to its own column; `data` carries only the error.
    safeLogEvent(
      operation,
      'query_failed',
      { error_class: errorClass, error_message: errorMessage },
      durationMs
    );
    throw err;
  }
}
