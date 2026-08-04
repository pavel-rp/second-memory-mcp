import { describe, it, expect } from 'vitest';
import {
  computeFatigueTrend,
  type FatigueAttempt,
} from '../../../../src/domain/algorithms/fatigue-trend.js';

const T0 = 1_700_000_000_000;
const HOUR = 3_600_000;

/** Attempt `index` places `T0 + index * HOUR` as its timestamp. */
function attempt(index: number, latencyMs: number, quality: number | null): FatigueAttempt {
  return { timestamp: T0 + index * HOUR, quality, latencyMs };
}

/** 8 attempts: earlier 4 fast+high-quality, later 4 slow+low-quality, in chronological order. */
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

/** 8 attempts, constant latency and quality throughout. */
function stableFixture(): FatigueAttempt[] {
  return [
    attempt(0, 1000, 4),
    attempt(1, 1000, 4),
    attempt(2, 1000, 4),
    attempt(3, 1000, 4),
    attempt(4, 1000, 4),
    attempt(5, 1000, 4),
    attempt(6, 1000, 4),
    attempt(7, 1000, 4),
  ];
}

describe('computeFatigueTrend', () => {
  it('fires on a rising-latency + falling-quality fixture', () => {
    const result = computeFatigueTrend(deterioratingFixture());

    expect(result.fatigued).toBe(true);
    expect(result.sampledCount).toBe(8);
    expect(result.latencyDeltaRatio).toBeGreaterThan(0);
    expect(result.qualityDelta).toBeLessThan(0);
  });

  it('is silent on a stable session', () => {
    const result = computeFatigueTrend(stableFixture());

    expect(result.fatigued).toBe(false);
    expect(result.latencyDeltaRatio).toBe(0);
    expect(result.qualityDelta).toBe(0);
  });

  it('is silent on a too-short session, even with a deteriorating shape', () => {
    // Below MINIMUM_ATTEMPTS (6): only 5 attempts survive.
    const short = deterioratingFixture().slice(0, 5);

    const result = computeFatigueTrend(short);

    expect(result).toEqual({
      fatigued: false,
      sampledCount: 0,
      latencyDeltaRatio: null,
      qualityDelta: null,
    });
  });

  it('rising latency with rising quality does not fire', () => {
    const attempts: FatigueAttempt[] = [
      attempt(0, 1000, 2),
      attempt(1, 1000, 2),
      attempt(2, 1000, 2),
      attempt(3, 1000, 2),
      attempt(4, 2000, 4),
      attempt(5, 2000, 4),
      attempt(6, 2000, 4),
      attempt(7, 2000, 4),
    ];

    const result = computeFatigueTrend(attempts);

    expect(result.fatigued).toBe(false);
  });

  it('falling quality with falling latency does not fire', () => {
    const attempts: FatigueAttempt[] = [
      attempt(0, 2000, 4),
      attempt(1, 2000, 4),
      attempt(2, 2000, 4),
      attempt(3, 2000, 4),
      attempt(4, 1000, 2),
      attempt(5, 1000, 2),
      attempt(6, 1000, 2),
      attempt(7, 1000, 2),
    ];

    const result = computeFatigueTrend(attempts);

    expect(result.fatigued).toBe(false);
  });

  describe('ordering is self-sorted, not caller-supplied', () => {
    it('reverse-chronological input produces the same verdict as chronological', () => {
      const chronological = computeFatigueTrend(deterioratingFixture());
      const reversed = computeFatigueTrend([...deterioratingFixture()].reverse());

      expect(reversed).toEqual(chronological);
    });

    it('interleaved input produces the same verdict as chronological', () => {
      const fixture = deterioratingFixture();
      const interleaved = [
        fixture[0],
        fixture[4],
        fixture[1],
        fixture[5],
        fixture[2],
        fixture[6],
        fixture[3],
        fixture[7],
      ];

      const chronological = computeFatigueTrend(fixture);
      const result = computeFatigueTrend(interleaved);

      expect(result).toEqual(chronological);
    });
  });

  describe('total guards — never throws, always the silent result', () => {
    it('empty array', () => {
      const result = computeFatigueTrend([]);

      expect(result).toEqual({
        fatigued: false,
        sampledCount: 0,
        latencyDeltaRatio: null,
        qualityDelta: null,
      });
    });

    it('single attempt', () => {
      const result = computeFatigueTrend([attempt(0, 1000, 4)]);

      expect(result.fatigued).toBe(false);
      expect(result.sampledCount).toBe(0);
    });

    it('null quality on enough attempts to otherwise clear the minimum', () => {
      const attempts: Array<Partial<FatigueAttempt>> = [
        attempt(0, 1000, 4),
        attempt(1, 1000, 4),
        attempt(2, 1000, 4),
        attempt(3, 1000, 4),
        attempt(4, 1000, null),
        attempt(5, 1000, 4),
      ];

      const result = computeFatigueTrend(attempts);

      // The null-quality attempt is filtered out, dropping the survivor
      // count below MINIMUM_ATTEMPTS.
      expect(result.fatigued).toBe(false);
      expect(result.sampledCount).toBe(0);
    });

    it('undefined quality on enough attempts to otherwise clear the minimum', () => {
      const withUndefinedQuality: Partial<FatigueAttempt> = {
        timestamp: attempt(4, 1000, 4).timestamp,
        latencyMs: 1000,
      };
      const attempts: Array<Partial<FatigueAttempt>> = [
        attempt(0, 1000, 4),
        attempt(1, 1000, 4),
        attempt(2, 1000, 4),
        attempt(3, 1000, 4),
        withUndefinedQuality,
        attempt(5, 1000, 4),
      ];

      const result = computeFatigueTrend(attempts);

      expect(result.fatigued).toBe(false);
      expect(result.sampledCount).toBe(0);
    });

    it('non-finite latency (NaN) on enough attempts to otherwise clear the minimum', () => {
      const attempts: FatigueAttempt[] = [
        attempt(0, 1000, 4),
        attempt(1, 1000, 4),
        attempt(2, 1000, 4),
        attempt(3, 1000, 4),
        attempt(4, Number.NaN, 4),
        attempt(5, 1000, 4),
      ];

      const result = computeFatigueTrend(attempts);

      expect(result.fatigued).toBe(false);
      expect(result.sampledCount).toBe(0);
    });

    it('negative latency on enough attempts to otherwise clear the minimum', () => {
      const attempts: FatigueAttempt[] = [
        attempt(0, 1000, 4),
        attempt(1, 1000, 4),
        attempt(2, 1000, 4),
        attempt(3, 1000, 4),
        attempt(4, -1, 4),
        attempt(5, 1000, 4),
      ];

      const result = computeFatigueTrend(attempts);

      expect(result.fatigued).toBe(false);
      expect(result.sampledCount).toBe(0);
    });

    it('non-object elements inside the array are filtered out, not thrown on', () => {
      const attempts: unknown[] = [
        attempt(0, 1000, 4),
        null,
        attempt(1, 1000, 4),
        'not an attempt',
        attempt(2, 1000, 4),
        42,
        attempt(3, 1000, 4),
        undefined,
      ];

      const result = computeFatigueTrend(attempts);

      // Four valid attempts survive — below MINIMUM_ATTEMPTS (6).
      expect(result).toEqual({
        fatigued: false,
        sampledCount: 0,
        latencyDeltaRatio: null,
        qualityDelta: null,
      });
    });

    it('a zero-latency earlier window yields a null ratio and cannot fire', () => {
      const attempts: FatigueAttempt[] = [
        attempt(0, 0, 4),
        attempt(1, 0, 4),
        attempt(2, 0, 4),
        attempt(3, 0, 4),
        attempt(4, 2000, 1),
        attempt(5, 2000, 1),
        attempt(6, 2000, 1),
        attempt(7, 2000, 1),
      ];

      const result = computeFatigueTrend(attempts);

      // Quality fell hard, but a relative rise is undefined against a zero
      // baseline — the advisory stays silent rather than dividing by zero.
      expect(result.sampledCount).toBe(8);
      expect(result.latencyDeltaRatio).toBeNull();
      expect(result.qualityDelta).toBe(-3);
      expect(result.fatigued).toBe(false);
    });

    it('malformed or absent input never throws', () => {
      const expected = {
        fatigued: false,
        sampledCount: 0,
        latencyDeltaRatio: null,
        qualityDelta: null,
      };

      expect(() => computeFatigueTrend(undefined)).not.toThrow();
      expect(() => computeFatigueTrend(null)).not.toThrow();
      expect(() => computeFatigueTrend('not an array')).not.toThrow();
      expect(() => computeFatigueTrend({})).not.toThrow();
      expect(() => computeFatigueTrend(42)).not.toThrow();

      expect(computeFatigueTrend(undefined)).toEqual(expected);
      expect(computeFatigueTrend(null)).toEqual(expected);
      expect(computeFatigueTrend('not an array')).toEqual(expected);
      expect(computeFatigueTrend({})).toEqual(expected);
      expect(computeFatigueTrend(42)).toEqual(expected);
    });
  });
});
