import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveContextTokenConfig } from '../../../src/config/resolve-context-token-config.js';

vi.mock('../../../src/shared/logger.js', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { logger } from '../../../src/shared/logger.js';

describe('resolveContextTokenConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns default 2-hour TTL (7,200,000 ms) with empty env', () => {
    expect(resolveContextTokenConfig({})).toEqual({ ttlMs: 7_200_000 });
  });

  it('reads custom CONTEXT_TOKEN_TTL_HOURS and converts to ms', () => {
    expect(resolveContextTokenConfig({ CONTEXT_TOKEN_TTL_HOURS: '4' })).toEqual({
      ttlMs: 14_400_000,
    });
  });

  it('handles fractional hours', () => {
    expect(resolveContextTokenConfig({ CONTEXT_TOKEN_TTL_HOURS: '0.5' })).toEqual({
      ttlMs: 1_800_000,
    });
  });

  it('clamps below-floor values to 5-minute minimum (300,000 ms)', () => {
    const result = resolveContextTokenConfig({ CONTEXT_TOKEN_TTL_HOURS: '0.01' });
    expect(result).toEqual({ ttlMs: 300_000 });
  });

  it('clamps zero to 5-minute minimum', () => {
    const result = resolveContextTokenConfig({ CONTEXT_TOKEN_TTL_HOURS: '0' });
    expect(result).toEqual({ ttlMs: 300_000 });
  });

  it('logs a warning when clamping below floor', () => {
    resolveContextTokenConfig({ CONTEXT_TOKEN_TTL_HOURS: '0.001' });
    expect(logger.warn).toHaveBeenCalledOnce();
    expect(vi.mocked(logger.warn).mock.calls[0][0]).toContain('below minimum');
  });

  it('does not log a warning for values at or above floor', () => {
    resolveContextTokenConfig({ CONTEXT_TOKEN_TTL_HOURS: '1' });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('falls back to default for non-numeric env value', () => {
    expect(resolveContextTokenConfig({ CONTEXT_TOKEN_TTL_HOURS: 'abc' })).toEqual({
      ttlMs: 7_200_000,
    });
  });

  it('falls back to default for empty env value', () => {
    expect(resolveContextTokenConfig({ CONTEXT_TOKEN_TTL_HOURS: '' })).toEqual({
      ttlMs: 7_200_000,
    });
  });

  it('falls back to default for whitespace-only env value', () => {
    expect(resolveContextTokenConfig({ CONTEXT_TOKEN_TTL_HOURS: '   ' })).toEqual({
      ttlMs: 7_200_000,
    });
  });

  it('handles negative values by clamping to floor', () => {
    const result = resolveContextTokenConfig({ CONTEXT_TOKEN_TTL_HOURS: '-1' });
    expect(result).toEqual({ ttlMs: 300_000 });
    expect(logger.warn).toHaveBeenCalledOnce();
  });
});
