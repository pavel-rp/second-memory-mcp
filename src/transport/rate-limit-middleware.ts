import type { RequestHandler, Request, Response } from 'express';
import type { RateLimitConfig } from '../config/resolve-rate-limit-config.js';

/** JSON-RPC server-error code, matching the other transport-level rejections. */
const JSON_RPC_SERVER_ERROR = -32000;

interface WindowState {
  /** Requests observed in the current window. */
  count: number;
  /** Epoch ms at which the current window expires and the count resets. */
  resetAt: number;
}

/** Shape of the JWT-derived identity the JWT middleware stores on res.locals. */
interface AuthLocals {
  sub: string;
}

export interface RateLimiter {
  /** Express middleware enforcing the per-subject limit. */
  middleware: RequestHandler;
  /** Number of tracked subjects — exposed for tests / introspection. */
  size: () => number;
}

/**
 * Fixed-window, per-authenticated-subject rate limiter for POST /mcp
 * (NEU-835 / OUT-9).
 *
 * Keys on the JWT subject the JWT middleware resolves (`res.locals.auth.sub`) —
 * the `sub`/`azp` identity — NOT the MCP session (the 2026-07 spec RC removes
 * protocol sessions). It MUST be mounted AFTER the JWT middleware so every
 * request reaching it already carries a verified subject.
 *
 * Only POST is counted: GET (the SSE stream) and DELETE (session teardown) are
 * session-lifecycle follow-ups, not tool invocations, and throttling a
 * long-lived SSE stream would be counter-productive.
 *
 * A subject over its limit gets HTTP 429 with a `Retry-After` header. All other
 * subjects are unaffected — each has its own independent window.
 *
 * State is per-instance and in-memory: the deployment assumption is a single
 * server instance. Multiple replicas would each keep their own counters,
 * multiplying the effective limit by the replica count (documented tradeoff).
 *
 * Pre-auth traffic is intentionally NOT throttled here: unauthenticated floods
 * are rejected with 401 by the JWT middleware upstream before ever reaching
 * this limiter. The residual cost of JWKS/JWT-verify work on such floods is an
 * accepted risk for the single-instance deployment (charter assumption #9); a
 * per-IP pre-auth limiter is explicitly out of this slice.
 *
 * Fail-open: a request without a resolved subject passes through untouched.
 */
export function createRateLimiter(
  config: RateLimitConfig,
  now: () => number = Date.now
): RateLimiter {
  const windows = new Map<string, WindowState>();
  let lastSweep = now();

  // Amortized cleanup: drop expired windows so the map cannot grow without
  // bound as distinct subjects come and go. Runs at most once per window.
  function sweep(current: number): void {
    for (const [key, state] of windows) {
      if (state.resetAt <= current) windows.delete(key);
    }
    lastSweep = current;
  }

  const middleware: RequestHandler = (req: Request, res: Response, next) => {
    if (req.method !== 'POST') {
      next();
      return;
    }

    const auth = res.locals.auth as AuthLocals | undefined;
    const subject = auth?.sub;
    if (!subject) {
      // No authenticated subject to key on — fail open.
      next();
      return;
    }

    const current = now();
    if (current - lastSweep >= config.windowMs) sweep(current);

    let state = windows.get(subject);
    if (!state || state.resetAt <= current) {
      state = { count: 0, resetAt: current + config.windowMs };
      windows.set(subject, state);
    }

    state.count += 1;

    if (state.count > config.maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((state.resetAt - current) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        jsonrpc: '2.0',
        error: {
          code: JSON_RPC_SERVER_ERROR,
          message: 'Too Many Requests: rate limit exceeded',
        },
        id: null,
      });
      return;
    }

    next();
  };

  return { middleware, size: () => windows.size };
}
