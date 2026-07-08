import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { createRateLimiter } from '../../../src/transport/rate-limit-middleware.js';
import type { RateLimitConfig } from '../../../src/config/resolve-rate-limit-config.js';

const CONFIG: RateLimitConfig = { maxRequests: 2, windowMs: 1_000 };

function makeReq(method = 'POST'): Request {
  return { method } as unknown as Request;
}

interface ResCapture {
  status?: number;
  body?: unknown;
  headers: Record<string, string>;
}

function makeRes(sub?: string): { res: Response; cap: ResCapture } {
  const cap: ResCapture = { headers: {} };
  const res = {
    locals: sub ? { auth: { sub } } : {},
    setHeader(name: string, value: string) {
      cap.headers[name] = value;
    },
    status(code: number) {
      cap.status = code;
      return this;
    },
    json(payload: unknown) {
      cap.body = payload;
      return this;
    },
  } as unknown as Response;
  return { res, cap };
}

describe('createRateLimiter', () => {
  let next: ReturnType<typeof vi.fn<(err?: unknown) => void>>;

  beforeEach(() => {
    next = vi.fn<(err?: unknown) => void>();
  });

  it('allows requests up to the configured limit', () => {
    const limiter = createRateLimiter(CONFIG, () => 1_000);
    for (let i = 0; i < CONFIG.maxRequests; i++) {
      const { res, cap } = makeRes('subject-a');
      limiter.middleware(makeReq(), res, next);
      expect(cap.status).toBeUndefined();
    }
    expect(next).toHaveBeenCalledTimes(CONFIG.maxRequests);
  });

  it('rejects the first request past the limit with 429 and Retry-After', () => {
    const limiter = createRateLimiter(CONFIG, () => 1_000);
    limiter.middleware(makeReq(), makeRes('subject-a').res, next);
    limiter.middleware(makeReq(), makeRes('subject-a').res, next);

    const { res, cap } = makeRes('subject-a');
    limiter.middleware(makeReq(), res, next);

    expect(cap.status).toBe(429);
    expect(cap.body).toMatchObject({
      jsonrpc: '2.0',
      error: { code: -32000, message: expect.stringContaining('Too Many Requests') },
      id: null,
    });
    expect(cap.headers['Retry-After']).toBeDefined();
    expect(Number(cap.headers['Retry-After'])).toBeGreaterThanOrEqual(1);
    // next() was called for the two allowed requests only.
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('tracks each subject independently — one over-limit does not affect another', () => {
    const limiter = createRateLimiter(CONFIG, () => 1_000);
    // Drive subject-a over the limit.
    limiter.middleware(makeReq(), makeRes('subject-a').res, next);
    limiter.middleware(makeReq(), makeRes('subject-a').res, next);
    const aOver = makeRes('subject-a');
    limiter.middleware(makeReq(), aOver.res, next);
    expect(aOver.cap.status).toBe(429);

    // subject-b, on its first request, is unaffected.
    const b = makeRes('subject-b');
    limiter.middleware(makeReq(), b.res, next);
    expect(b.cap.status).toBeUndefined();
  });

  it('resets the window after windowMs elapses', () => {
    let now = 1_000;
    const limiter = createRateLimiter(CONFIG, () => now);
    limiter.middleware(makeReq(), makeRes('subject-a').res, next);
    limiter.middleware(makeReq(), makeRes('subject-a').res, next);
    const over = makeRes('subject-a');
    limiter.middleware(makeReq(), over.res, next);
    expect(over.cap.status).toBe(429);

    // Advance past the window — the subject's counter resets.
    now += CONFIG.windowMs;
    const afterReset = makeRes('subject-a');
    limiter.middleware(makeReq(), afterReset.res, next);
    expect(afterReset.cap.status).toBeUndefined();
  });

  it('does not count non-POST methods (GET/DELETE pass through)', () => {
    const limiter = createRateLimiter(CONFIG, () => 1_000);
    for (let i = 0; i < 10; i++) {
      const { res, cap } = makeRes('subject-a');
      limiter.middleware(makeReq('GET'), res, next);
      expect(cap.status).toBeUndefined();
    }
    // A POST afterward still starts from a fresh count.
    const { res, cap } = makeRes('subject-a');
    limiter.middleware(makeReq('POST'), res, next);
    expect(cap.status).toBeUndefined();
  });

  it('fails open when no authenticated subject is present', () => {
    const limiter = createRateLimiter(CONFIG, () => 1_000);
    for (let i = 0; i < 10; i++) {
      const { res, cap } = makeRes(undefined);
      limiter.middleware(makeReq(), res, next);
      expect(cap.status).toBeUndefined();
    }
    expect(next).toHaveBeenCalledTimes(10);
    // No subject was ever tracked.
    expect(limiter.size()).toBe(0);
  });

  it('sweeps expired windows so the store does not grow unbounded', () => {
    let now = 1_000;
    const limiter = createRateLimiter(CONFIG, () => now);
    limiter.middleware(makeReq(), makeRes('subject-a').res, next);
    expect(limiter.size()).toBe(1);

    // Advance past the window; a request from a new subject triggers a sweep
    // that drops the now-expired subject-a entry.
    now += CONFIG.windowMs;
    limiter.middleware(makeReq(), makeRes('subject-b').res, next);
    expect(limiter.size()).toBe(1);
  });
});
