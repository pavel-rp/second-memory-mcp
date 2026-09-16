import { describe, it, expect } from 'vitest';
import {
  resolveSessionAdvisory,
  type SessionAdvisoryInput,
} from '../../../../src/domain/algorithms/session-advisory.js';
import type { FatigueAttempt } from '../../../../src/domain/algorithms/fatigue-trend.js';

const T0 = 1_700_000_000_000;
const HOUR = 3_600_000;
const MIN = 60_000;
const DEFAULT_WINDOW = 6;

function attempt(index: number, quality: number | null): FatigueAttempt {
  return { timestamp: T0 + index * HOUR, quality };
}

/** 6 attempts: earlier high-quality, later low-quality — fires fatigue. */
function deterioratingFixture(): FatigueAttempt[] {
  return [attempt(0, 4), attempt(1, 4), attempt(2, 4), attempt(3, 2), attempt(4, 2), attempt(5, 2)];
}

/** Too short to ever clear the fatigue window — the trend is always silent. */
function shortHealthyFixture(): FatigueAttempt[] {
  return [attempt(0, 4), attempt(1, 4)];
}

const baseInput: SessionAdvisoryInput = {
  attempts: shortHealthyFixture(),
  activeTimeMs: 10 * MIN,
  activeTimeCeilingMs: 45 * MIN,
  fatigueWindowSize: DEFAULT_WINDOW,
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

  it('fires the active-time ceiling past activeTimeCeilingMs while the trend is silent', () => {
    const result = resolveSessionAdvisory({
      attempts: shortHealthyFixture(),
      activeTimeMs: 45 * MIN,
      activeTimeCeilingMs: 45 * MIN,
      fatigueWindowSize: DEFAULT_WINDOW,
    });

    expect(result).not.toBeNull();
    expect(result?.kind).toBe('active_time_ceiling');
    expect(result?.reason).toContain('active learning time');
    expect(result?.reason).toContain('45 min');
  });

  it('fatigue wins when both fatigue and the active-time ceiling apply', () => {
    const result = resolveSessionAdvisory({
      attempts: deterioratingFixture(),
      activeTimeMs: 60 * MIN,
      activeTimeCeilingMs: 45 * MIN,
      fatigueWindowSize: DEFAULT_WINDOW,
    });

    expect(result).not.toBeNull();
    expect(result?.kind).toBe('fatigue');
  });

  it('nothing fires on a healthy short session under the ceiling', () => {
    const result = resolveSessionAdvisory(baseInput);

    expect(result).toBeNull();
  });

  describe("NEU-1020: sitting-scoping is the caller's responsibility", () => {
    it('an earlier-sitting-only quality dip does not fire when the caller only supplies current-sitting attempts', () => {
      // The caller is responsible for pre-scoping `attempts` to the current
      // sitting (active-time.ts's boundary) — this resolver does no
      // scoping of its own. A quality dip that happened in an EARLIER
      // sitting, and was correctly excluded by the caller, must not fire
      // just because it once existed.
      const currentSittingHealthyAttempts = stableCurrentSittingFixture();

      const result = resolveSessionAdvisory({
        attempts: currentSittingHealthyAttempts,
        activeTimeMs: 10 * MIN,
        activeTimeCeilingMs: 45 * MIN,
        fatigueWindowSize: DEFAULT_WINDOW,
      });

      expect(result).toBeNull();
    });
  });

  describe('guards — never throws', () => {
    it('non-finite activeTimeMs never fires the ceiling', () => {
      const result = resolveSessionAdvisory({
        attempts: shortHealthyFixture(),
        activeTimeMs: Number.NaN,
        activeTimeCeilingMs: 45 * MIN,
        fatigueWindowSize: DEFAULT_WINDOW,
      });

      expect(result).toBeNull();
    });

    it('non-finite activeTimeCeilingMs never fires the ceiling', () => {
      const result = resolveSessionAdvisory({
        attempts: shortHealthyFixture(),
        activeTimeMs: 10 * MIN,
        activeTimeCeilingMs: Number.POSITIVE_INFINITY,
        fatigueWindowSize: DEFAULT_WINDOW,
      });

      expect(result).toBeNull();
    });

    it('absent (undefined) activeTimeMs and activeTimeCeilingMs never fires the ceiling', () => {
      const result = resolveSessionAdvisory({
        attempts: shortHealthyFixture(),
        activeTimeMs: undefined,
        activeTimeCeilingMs: undefined,
        fatigueWindowSize: DEFAULT_WINDOW,
      });

      expect(result).toBeNull();
    });

    it('absent (null) activeTimeMs and activeTimeCeilingMs never fires the ceiling', () => {
      const result = resolveSessionAdvisory({
        attempts: shortHealthyFixture(),
        activeTimeMs: null,
        activeTimeCeilingMs: null,
        fatigueWindowSize: DEFAULT_WINDOW,
      });

      expect(result).toBeNull();
    });

    it('malformed attempts input never throws and yields no fatigue advisory', () => {
      expect(() =>
        resolveSessionAdvisory({
          attempts: 'not an array',
          activeTimeMs: 10 * MIN,
          activeTimeCeilingMs: 45 * MIN,
          fatigueWindowSize: DEFAULT_WINDOW,
        })
      ).not.toThrow();

      const result = resolveSessionAdvisory({
        attempts: 'not an array',
        activeTimeMs: 10 * MIN,
        activeTimeCeilingMs: 45 * MIN,
        fatigueWindowSize: DEFAULT_WINDOW,
      });

      expect(result).toBeNull();
    });
  });
});

/**
 * 6 stable-quality attempts, standing in for "the current sitting's own
 * attempts" once a caller has already excluded an earlier sitting's dip.
 */
function stableCurrentSittingFixture(): FatigueAttempt[] {
  return [attempt(0, 4), attempt(1, 4), attempt(2, 4), attempt(3, 4), attempt(4, 4), attempt(5, 4)];
}
