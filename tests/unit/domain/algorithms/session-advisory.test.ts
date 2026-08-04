import { describe, it, expect } from 'vitest';
import {
  resolveSessionAdvisory,
  type SessionAdvisoryInput,
} from '../../../../src/domain/algorithms/session-advisory.js';
import type { FatigueAttempt } from '../../../../src/domain/algorithms/fatigue-trend.js';

const T0 = 1_700_000_000_000;
const HOUR = 3_600_000;

function attempt(index: number, latencyMs: number, quality: number | null): FatigueAttempt {
  return { timestamp: T0 + index * HOUR, quality, latencyMs };
}

/** 8 attempts: earlier fast+high-quality, later slow+low-quality — fires fatigue. */
function deterioratingFixture(): FatigueAttempt[] {
  return [
    attempt(0, 1000, 4),
    attempt(1, 1000, 4),
    attempt(2, 1000, 4),
    attempt(3, 1000, 4),
    attempt(4, 2000, 2),
    attempt(5, 2000, 2),
    attempt(6, 2000, 2),
    attempt(7, 2000, 2),
  ];
}

/** Too short to ever clear MINIMUM_ATTEMPTS — the trend is always silent. */
function shortHealthyFixture(): FatigueAttempt[] {
  return [attempt(0, 1000, 4), attempt(1, 1000, 4)];
}

const baseInput: SessionAdvisoryInput = {
  attempts: shortHealthyFixture(),
  elapsedMs: 10 * 60 * 1000,
  maxTimeMs: 2 * 60 * 60 * 1000,
};

describe('resolveSessionAdvisory', () => {
  it('fires fatigue on the deteriorating fixture', () => {
    const result = resolveSessionAdvisory({
      ...baseInput,
      attempts: deterioratingFixture(),
    });

    expect(result).not.toBeNull();
    expect(result?.kind).toBe('fatigue');
    expect(typeof result?.reason).toBe('string');
    expect(result?.reason.length).toBeGreaterThan(0);
  });

  it('fires the time ceiling past maxTimeMs while the trend is silent', () => {
    const result = resolveSessionAdvisory({
      attempts: shortHealthyFixture(),
      elapsedMs: 2 * 60 * 60 * 1000,
      maxTimeMs: 2 * 60 * 60 * 1000,
    });

    expect(result).not.toBeNull();
    expect(result?.kind).toBe('time_ceiling');
  });

  it('fatigue wins when both fatigue and the time ceiling apply', () => {
    const result = resolveSessionAdvisory({
      attempts: deterioratingFixture(),
      elapsedMs: 3 * 60 * 60 * 1000,
      maxTimeMs: 2 * 60 * 60 * 1000,
    });

    expect(result).not.toBeNull();
    expect(result?.kind).toBe('fatigue');
  });

  it('nothing fires on a healthy short session under the ceiling', () => {
    const result = resolveSessionAdvisory(baseInput);

    expect(result).toBeNull();
  });

  describe('guards — never throws', () => {
    it('non-finite elapsedMs never fires the ceiling', () => {
      const result = resolveSessionAdvisory({
        attempts: shortHealthyFixture(),
        elapsedMs: Number.NaN,
        maxTimeMs: 2 * 60 * 60 * 1000,
      });

      expect(result).toBeNull();
    });

    it('non-finite maxTimeMs never fires the ceiling', () => {
      const result = resolveSessionAdvisory({
        attempts: shortHealthyFixture(),
        elapsedMs: 10 * 60 * 1000,
        maxTimeMs: Number.POSITIVE_INFINITY,
      });

      expect(result).toBeNull();
    });

    it('absent (undefined) elapsedMs and maxTimeMs never fires the ceiling', () => {
      const result = resolveSessionAdvisory({
        attempts: shortHealthyFixture(),
        elapsedMs: undefined,
        maxTimeMs: undefined,
      });

      expect(result).toBeNull();
    });

    it('absent (null) elapsedMs and maxTimeMs never fires the ceiling', () => {
      const result = resolveSessionAdvisory({
        attempts: shortHealthyFixture(),
        elapsedMs: null,
        maxTimeMs: null,
      });

      expect(result).toBeNull();
    });

    it('malformed attempts input never throws and yields no fatigue advisory', () => {
      expect(() =>
        resolveSessionAdvisory({
          attempts: 'not an array',
          elapsedMs: 10 * 60 * 1000,
          maxTimeMs: 2 * 60 * 60 * 1000,
        })
      ).not.toThrow();

      const result = resolveSessionAdvisory({
        attempts: 'not an array',
        elapsedMs: 10 * 60 * 1000,
        maxTimeMs: 2 * 60 * 60 * 1000,
      });

      expect(result).toBeNull();
    });
  });
});
