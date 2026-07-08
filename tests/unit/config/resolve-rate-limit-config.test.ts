import { describe, it, expect } from 'vitest';
import { resolveRateLimitConfig } from '../../../src/config/resolve-rate-limit-config.js';

describe('resolveRateLimitConfig', () => {
  it('returns null for STDIO transport (no HTTP surface)', () => {
    expect(resolveRateLimitConfig('stdio', {})).toBeNull();
    // STDIO ignores any rate-limit env entirely.
    expect(resolveRateLimitConfig('stdio', { RATE_LIMIT_MAX: '10' })).toBeNull();
  });

  it('defaults to an enabled limiter in HTTP mode when unset', () => {
    expect(resolveRateLimitConfig('http', {})).toEqual({ maxRequests: 120, windowMs: 60_000 });
  });

  it('honors explicit RATE_LIMIT_MAX and RATE_LIMIT_WINDOW_MS', () => {
    const config = resolveRateLimitConfig('http', {
      RATE_LIMIT_MAX: '5',
      RATE_LIMIT_WINDOW_MS: '1000',
    });
    expect(config).toEqual({ maxRequests: 5, windowMs: 1000 });
  });

  it('disables the limiter when RATE_LIMIT_MAX is 0 (explicit opt-out)', () => {
    expect(resolveRateLimitConfig('http', { RATE_LIMIT_MAX: '0' })).toBeNull();
  });

  it('disables the limiter when RATE_LIMIT_MAX is negative', () => {
    expect(resolveRateLimitConfig('http', { RATE_LIMIT_MAX: '-3' })).toBeNull();
  });

  it('falls back to the default max when RATE_LIMIT_MAX is non-numeric', () => {
    const config = resolveRateLimitConfig('http', { RATE_LIMIT_MAX: 'abc' });
    expect(config).toEqual({ maxRequests: 120, windowMs: 60_000 });
  });

  it('truncates a fractional RATE_LIMIT_MAX toward zero', () => {
    const config = resolveRateLimitConfig('http', { RATE_LIMIT_MAX: '2.9' });
    expect(config?.maxRequests).toBe(2);
  });

  it('falls back to the default window when RATE_LIMIT_WINDOW_MS is 0', () => {
    const config = resolveRateLimitConfig('http', {
      RATE_LIMIT_MAX: '10',
      RATE_LIMIT_WINDOW_MS: '0',
    });
    expect(config).toEqual({ maxRequests: 10, windowMs: 60_000 });
  });

  it('falls back to the default window when RATE_LIMIT_WINDOW_MS is negative', () => {
    const config = resolveRateLimitConfig('http', {
      RATE_LIMIT_MAX: '10',
      RATE_LIMIT_WINDOW_MS: '-1000',
    });
    expect(config?.windowMs).toBe(60_000);
  });
});
