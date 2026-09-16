import { describe, it, expect } from 'vitest';
import {
  computeActiveTime,
  findSittingBoundaryTimestamp,
} from '../../../../src/domain/algorithms/active-time.js';

const T0 = 1_700_000_000_000;
const MIN = 60_000;
const IDLE_CUTOFF_MS = 10 * MIN;

describe('computeActiveTime', () => {
  it('sums consecutive sub-cutoff gaps in full', () => {
    const timestamps = [T0, T0 + 5 * MIN, T0 + 8 * MIN, T0 + 10 * MIN];
    const result = computeActiveTime({ timestamps, idleCutoffMs: IDLE_CUTOFF_MS });

    expect(result.activeTimeMs).toBe(10 * MIN);
    expect(result.sampledCount).toBe(4);
  });

  it('zeroes and restarts the sitting on a gap exactly at the idle cutoff', () => {
    const timestamps = [
      T0,
      T0 + 5 * MIN,
      T0 + 5 * MIN + IDLE_CUTOFF_MS,
      T0 + 5 * MIN + IDLE_CUTOFF_MS + 3 * MIN,
    ];
    const result = computeActiveTime({ timestamps, idleCutoffMs: IDLE_CUTOFF_MS });

    // gap1 = 5min (sub-cutoff, counts) -> 5min; gap2 = exactly the cutoff -> resets to 0;
    // gap3 = 3min (sub-cutoff, counts) -> 3min. Earlier active time does not carry over.
    expect(result.activeTimeMs).toBe(3 * MIN);
    expect(result.sampledCount).toBe(4);
  });

  it('credits zero active time for a new sitting after a multi-day gap following a long sitting', () => {
    const longSitting = [T0, T0 + 5 * MIN, T0 + 10 * MIN, T0 + 15 * MIN]; // 15 min sitting
    const multiDayGap = 3 * 24 * 60 * MIN;
    const lastEvent = longSitting[longSitting.length - 1] as number;
    const timestamps = [...longSitting, lastEvent + multiDayGap];

    const result = computeActiveTime({ timestamps, idleCutoffMs: IDLE_CUTOFF_MS });

    expect(result.activeTimeMs).toBe(0);
    expect(result.sampledCount).toBe(5);
  });

  it('returns zero active time for empty input', () => {
    expect(computeActiveTime({ timestamps: [], idleCutoffMs: IDLE_CUTOFF_MS })).toEqual({
      activeTimeMs: 0,
      sampledCount: 0,
    });
  });

  it('returns zero active time for a single timestamp', () => {
    expect(computeActiveTime({ timestamps: [T0], idleCutoffMs: IDLE_CUTOFF_MS })).toEqual({
      activeTimeMs: 0,
      sampledCount: 1,
    });
  });

  it('sorts unordered timestamps before computing gaps', () => {
    const timestamps = [T0 + 5 * MIN, T0, T0 + 8 * MIN];
    const result = computeActiveTime({ timestamps, idleCutoffMs: IDLE_CUTOFF_MS });

    expect(result.activeTimeMs).toBe(8 * MIN);
    expect(result.sampledCount).toBe(3);
  });

  describe('guards — never throws', () => {
    it('non-array timestamps input never throws and yields zero', () => {
      expect(() =>
        computeActiveTime({ timestamps: 'not an array', idleCutoffMs: IDLE_CUTOFF_MS })
      ).not.toThrow();
      expect(
        computeActiveTime({ timestamps: 'not an array', idleCutoffMs: IDLE_CUTOFF_MS })
      ).toEqual({ activeTimeMs: 0, sampledCount: 0 });
    });

    it('null/undefined timestamps input never fires', () => {
      expect(computeActiveTime({ timestamps: null, idleCutoffMs: IDLE_CUTOFF_MS })).toEqual({
        activeTimeMs: 0,
        sampledCount: 0,
      });
      expect(computeActiveTime({ timestamps: undefined, idleCutoffMs: IDLE_CUTOFF_MS })).toEqual({
        activeTimeMs: 0,
        sampledCount: 0,
      });
    });

    it('non-finite entries in the timestamp array are filtered out, not fatal', () => {
      const result = computeActiveTime({
        timestamps: [T0, Number.NaN, T0 + MIN, 'bogus', null],
        idleCutoffMs: IDLE_CUTOFF_MS,
      });

      expect(result.sampledCount).toBe(2);
      expect(result.activeTimeMs).toBe(MIN);
    });

    it('non-finite idleCutoffMs never fires (silent result)', () => {
      expect(computeActiveTime({ timestamps: [T0, T0 + MIN], idleCutoffMs: Number.NaN })).toEqual({
        activeTimeMs: 0,
        sampledCount: 0,
      });
    });

    it('a non-positive idleCutoffMs never fires (silent result)', () => {
      expect(computeActiveTime({ timestamps: [T0, T0 + MIN], idleCutoffMs: 0 })).toEqual({
        activeTimeMs: 0,
        sampledCount: 0,
      });
      expect(computeActiveTime({ timestamps: [T0, T0 + MIN], idleCutoffMs: -1 })).toEqual({
        activeTimeMs: 0,
        sampledCount: 0,
      });
    });
  });
});

describe('findSittingBoundaryTimestamp (NEU-1020)', () => {
  it('returns the first timestamp of a single unbroken sitting', () => {
    const timestamps = [T0, T0 + 5 * MIN, T0 + 8 * MIN, T0 + 10 * MIN];

    expect(findSittingBoundaryTimestamp({ timestamps, idleCutoffMs: IDLE_CUTOFF_MS })).toBe(T0);
  });

  it('returns the timestamp right after the last gap at/above the idle cutoff', () => {
    const timestamps = [
      T0,
      T0 + 5 * MIN,
      T0 + 5 * MIN + IDLE_CUTOFF_MS,
      T0 + 5 * MIN + IDLE_CUTOFF_MS + 3 * MIN,
    ];

    expect(findSittingBoundaryTimestamp({ timestamps, idleCutoffMs: IDLE_CUTOFF_MS })).toBe(
      T0 + 5 * MIN + IDLE_CUTOFF_MS
    );
  });

  it('returns the single most-recent timestamp after a multi-day gap following a long sitting', () => {
    const longSitting = [T0, T0 + 5 * MIN, T0 + 10 * MIN, T0 + 15 * MIN];
    const multiDayGap = 3 * 24 * 60 * MIN;
    const lastEvent = longSitting[longSitting.length - 1] as number;
    const boundaryTimestamp = lastEvent + multiDayGap;
    const timestamps = [...longSitting, boundaryTimestamp];

    expect(findSittingBoundaryTimestamp({ timestamps, idleCutoffMs: IDLE_CUTOFF_MS })).toBe(
      boundaryTimestamp
    );
  });

  it('returns the single timestamp for a single-event population', () => {
    expect(findSittingBoundaryTimestamp({ timestamps: [T0], idleCutoffMs: IDLE_CUTOFF_MS })).toBe(
      T0
    );
  });

  it('returns null for zero valid timestamps', () => {
    expect(
      findSittingBoundaryTimestamp({ timestamps: [], idleCutoffMs: IDLE_CUTOFF_MS })
    ).toBeNull();
    expect(
      findSittingBoundaryTimestamp({ timestamps: 'not an array', idleCutoffMs: IDLE_CUTOFF_MS })
    ).toBeNull();
    expect(
      findSittingBoundaryTimestamp({ timestamps: null, idleCutoffMs: IDLE_CUTOFF_MS })
    ).toBeNull();
    expect(
      findSittingBoundaryTimestamp({
        timestamps: [Number.NaN, 'bogus'],
        idleCutoffMs: IDLE_CUTOFF_MS,
      })
    ).toBeNull();
  });

  it('never throws and returns null for a non-finite or non-positive idleCutoffMs', () => {
    expect(() =>
      findSittingBoundaryTimestamp({ timestamps: [T0, T0 + MIN], idleCutoffMs: Number.NaN })
    ).not.toThrow();
    expect(
      findSittingBoundaryTimestamp({ timestamps: [T0, T0 + MIN], idleCutoffMs: Number.NaN })
    ).toBeNull();
    expect(
      findSittingBoundaryTimestamp({ timestamps: [T0, T0 + MIN], idleCutoffMs: 0 })
    ).toBeNull();
  });

  it('sorts unordered timestamps before finding the boundary', () => {
    const timestamps = [T0 + 5 * MIN, T0, T0 + 8 * MIN];

    expect(findSittingBoundaryTimestamp({ timestamps, idleCutoffMs: IDLE_CUTOFF_MS })).toBe(T0);
  });

  it('agrees with computeActiveTime: activeTimeMs equals the span from the boundary to the last timestamp', () => {
    const timestamps = [
      T0,
      T0 + 5 * MIN,
      T0 + 5 * MIN + IDLE_CUTOFF_MS,
      T0 + 5 * MIN + IDLE_CUTOFF_MS + 3 * MIN,
      T0 + 5 * MIN + IDLE_CUTOFF_MS + 7 * MIN,
    ];

    const boundary = findSittingBoundaryTimestamp({ timestamps, idleCutoffMs: IDLE_CUTOFF_MS });
    const { activeTimeMs } = computeActiveTime({ timestamps, idleCutoffMs: IDLE_CUTOFF_MS });
    const lastTimestamp = Math.max(...timestamps);

    expect(boundary).not.toBeNull();
    expect(activeTimeMs).toBe(lastTimestamp - (boundary as number));
  });
});
