// Composition root layer: reads process.env and returns rate-limit configuration.
// NEU-835 / OUT-9: in-app, per-authenticated-subject rate limiting for POST /mcp.
//
// Returns null (limiter disabled) for STDIO — STDIO is inherently trusted and
// has no HTTP surface — and whenever RATE_LIMIT_MAX resolves to a non-positive
// value, which is the explicit opt-out. Otherwise HTTP mode defaults to an
// enabled limiter so the MCP-spec rate-limit MUST is satisfied out of the box;
// operators tune it via RATE_LIMIT_MAX / RATE_LIMIT_WINDOW_MS or disable it
// with RATE_LIMIT_MAX=0.

import { parseNumber } from '../shared/env-parsing.js';
import type { TransportMode } from './resolve-transport-config.js';

export type RateLimitConfig = {
  /** Max POST /mcp requests per rolling window, per authenticated subject. */
  maxRequests: number;
  /** Fixed-window length in milliseconds. */
  windowMs: number;
};

// 120 requests/minute per subject: generous for interactive learning traffic
// (each teach/submit tool call is one POST) while still throttling a runaway or
// abusive subject. Operators raise/lower it via env.
const DEFAULT_MAX_REQUESTS = 120;
const DEFAULT_WINDOW_MS = 60_000;

export function resolveRateLimitConfig(
  transportMode: TransportMode,
  env: Record<string, string | undefined> = process.env
): RateLimitConfig | null {
  if (transportMode === 'stdio') return null;

  // parseNumber always yields a finite number (its fallback is finite), so a
  // non-positive value is the only disable path — the explicit opt-out.
  const maxRequests = parseNumber(env.RATE_LIMIT_MAX, DEFAULT_MAX_REQUESTS);
  if (maxRequests <= 0) return null;

  // Guard against a zero/negative window that would make every window expire
  // instantly; fall back to the default in that case.
  const windowMs = parseNumber(env.RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS);
  const safeWindowMs = windowMs > 0 ? windowMs : DEFAULT_WINDOW_MS;

  return {
    maxRequests: Math.trunc(maxRequests),
    windowMs: Math.trunc(safeWindowMs),
  };
}
