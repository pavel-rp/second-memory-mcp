import { describe, it, expect } from 'vitest';
import {
  computeFatigueTrend,
  DEFAULT_FATIGUE_WINDOW_SIZE,
  type FatigueAttempt,
} from '../../../../src/domain/algorithms/fatigue-trend.js';

const T0 = 1_700_000_000_000;
const HOUR = 3_600_000;

/** Attempt `index` places `T0 + index * HOUR` as its timestamp. */
function attempt(index: number, quality: number | null): FatigueAttempt {
  return { timestamp: T0 + index * HOUR, quality };
}

/** 6 attempts: earlier 3 high-quality, later 3 low-quality, in chronological order. */
function deterioratingFixture(): FatigueAttempt[] {
  return [attempt(0, 4), attempt(1, 4), attempt(2, 4), attempt(3, 2), attempt(4, 2), attempt(5, 2)];
}

/** 6 attempts, constant quality throughout. */
function stableFixture(): FatigueAttempt[] {
  return [attempt(0, 4), attempt(1, 4), attempt(2, 4), attempt(3, 4), attempt(4, 4), attempt(5, 4)];
}

describe('computeFatigueTrend', () => {
  it('exports the shipped default window size of 6', () => {
    expect(DEFAULT_FATIGUE_WINDOW_SIZE).toBe(6);
  });

  it('fires on a falling-quality fixture at the default window size', () => {
    const result = computeFatigueTrend(deterioratingFixture());

    expect(result.fatigued).toBe(true);
    expect(result.sampledCount).toBe(6);
    expect(result.qualityDelta).toBeLessThan(0);
  });

  it('is silent on a stable population', () => {
    const result = computeFatigueTrend(stableFixture());

    expect(result.fatigued).toBe(false);
    expect(result.qualityDelta).toBe(0);
  });

  it('is silent on a population below the window size', () => {
    const short = deterioratingFixture().slice(0, 5);

    const result = computeFatigueTrend(short);

    expect(result).toEqual({
      fatigued: false,
      sampledCount: 0,
      qualityDelta: null,
    });
  });

  it('rising quality does not fire', () => {
    const attempts: FatigueAttempt[] = [
      attempt(0, 2),
      attempt(1, 2),
      attempt(2, 2),
      attempt(3, 4),
      attempt(4, 4),
      attempt(5, 4),
    ];

    const result = computeFatigueTrend(attempts);

    expect(result.fatigued).toBe(false);
  });

  describe('windowSize (NEU-1020)', () => {
    it('takes only the last windowSize entries, dropping older ones outside the window', () => {
      // 9 attempts: a falling-quality shape in the OLDEST 6, but the most
      // recent 6 (indices 3-8) are stable — the window must exclude the
      // stale decline.
      const attempts: FatigueAttempt[] = [
        attempt(0, 4),
        attempt(1, 4),
        attempt(2, 4),
        attempt(3, 2),
        attempt(4, 2),
        attempt(5, 2),
        attempt(6, 3),
        attempt(7, 3),
        attempt(8, 3),
      ];

      const result = computeFatigueTrend(attempts, 6);

      // Last 6 (indices 3-8): earlier half [2,2,2] mean 2, later half
      // [3,3,3] mean 3 — quality RISES within the window, so no fatigue.
      expect(result.sampledCount).toBe(6);
      expect(result.fatigued).toBe(false);
      expect(result.qualityDelta).toBe(1);
    });

    it('a smaller configured window fires on fewer attempts than the shipped default', () => {
      const attempts: FatigueAttempt[] = [
        attempt(0, 4),
        attempt(1, 4),
        attempt(2, 2),
        attempt(3, 2),
      ];

      const result = computeFatigueTrend(attempts, 4);

      expect(result.sampledCount).toBe(4);
      expect(result.fatigued).toBe(true);
    });

    it('a population below the configured window size is silent even above the shipped default', () => {
      // 7 attempts, but windowSize configured to 8 — below the window.
      const attempts = Array.from({ length: 7 }, (_, i) => attempt(i, 4));

      const result = computeFatigueTrend(attempts, 8);

      expect(result).toEqual({ fatigued: false, sampledCount: 0, qualityDelta: null });
    });

    it('omitting windowSize uses the shipped default of 6', () => {
      const withDefault = computeFatigueTrend(deterioratingFixture());
      const withExplicitSix = computeFatigueTrend(deterioratingFixture(), 6);

      expect(withDefault).toEqual(withExplicitSix);
    });

    it('a non-finite or non-positive windowSize never fires (silent result)', () => {
      const attempts = deterioratingFixture();

      expect(computeFatigueTrend(attempts, Number.NaN)).toEqual({
        fatigued: false,
        sampledCount: 0,
        qualityDelta: null,
      });
      expect(computeFatigueTrend(attempts, 0)).toEqual({
        fatigued: false,
        sampledCount: 0,
        qualityDelta: null,
      });
      expect(computeFatigueTrend(attempts, -1)).toEqual({
        fatigued: false,
        sampledCount: 0,
        qualityDelta: null,
      });
    });

    it('a fractional windowSize never fires (silent result, NEU-1043)', () => {
      const attempts = deterioratingFixture();

      expect(computeFatigueTrend(attempts, 6.5)).toEqual({
        fatigued: false,
        sampledCount: 0,
        qualityDelta: null,
      });
    });

    it('a windowSize of 1 never fires and never produces a NaN qualityDelta (NEU-1043)', () => {
      // windowSize: 1 would otherwise split into an empty earlier half and a
      // single-entry later half — `mean([])` divides 0 by 0 into NaN, which
      // would silently corrupt qualityDelta instead of resolving cleanly.
      const attempts = deterioratingFixture();

      const result = computeFatigueTrend(attempts, 1);

      expect(result).toEqual({ fatigued: false, sampledCount: 0, qualityDelta: null });
      expect(Number.isNaN(result.qualityDelta)).toBe(false);
    });
  });

  describe('ordering is self-sorted, not caller-supplied', () => {
    it('reverse-chronological input produces the same verdict as chronological', () => {
      const chronological = computeFatigueTrend(deterioratingFixture());
      const reversed = computeFatigueTrend([...deterioratingFixture()].reverse());

      expect(reversed).toEqual(chronological);
    });

    it('interleaved input produces the same verdict as chronological', () => {
      const fixture = deterioratingFixture();
      const interleaved = [fixture[0], fixture[3], fixture[1], fixture[4], fixture[2], fixture[5]];

      const chronological = computeFatigueTrend(fixture);
      const result = computeFatigueTrend(interleaved);

      expect(result).toEqual(chronological);
    });
  });

  describe('total guards — never throws, always the silent result', () => {
    it('empty array', () => {
      const result = computeFatigueTrend([]);

      expect(result).toEqual({ fatigued: false, sampledCount: 0, qualityDelta: null });
    });

    it('single attempt', () => {
      const result = computeFatigueTrend([attempt(0, 4)]);

      expect(result.fatigued).toBe(false);
      expect(result.sampledCount).toBe(0);
    });

    it('null quality on enough attempts to otherwise clear the window', () => {
      const attempts: Array<Partial<FatigueAttempt>> = [
        attempt(0, 4),
        attempt(1, 4),
        attempt(2, 4),
        attempt(3, 4),
        attempt(4, null),
        attempt(5, 4),
      ];

      const result = computeFatigueTrend(attempts);

      // The null-quality attempt is filtered out, dropping the survivor
      // count below the window size.
      expect(result.fatigued).toBe(false);
      expect(result.sampledCount).toBe(0);
    });

    it('undefined quality on enough attempts to otherwise clear the window', () => {
      const withUndefinedQuality: Partial<FatigueAttempt> = {
        timestamp: attempt(4, 4).timestamp,
      };
      const attempts: Array<Partial<FatigueAttempt>> = [
        attempt(0, 4),
        attempt(1, 4),
        attempt(2, 4),
        attempt(3, 4),
        withUndefinedQuality,
        attempt(5, 4),
      ];

      const result = computeFatigueTrend(attempts);

      expect(result.fatigued).toBe(false);
      expect(result.sampledCount).toBe(0);
    });

    it('non-object elements inside the array are filtered out, not thrown on', () => {
      const attempts: unknown[] = [
        attempt(0, 4),
        null,
        attempt(1, 4),
        'not an attempt',
        attempt(2, 4),
        42,
        attempt(3, 4),
        undefined,
      ];

      const result = computeFatigueTrend(attempts);

      // Four valid attempts survive — below the shipped default window (6).
      expect(result).toEqual({ fatigued: false, sampledCount: 0, qualityDelta: null });
    });

    it('malformed or absent input never throws', () => {
      const expected = { fatigued: false, sampledCount: 0, qualityDelta: null };

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
