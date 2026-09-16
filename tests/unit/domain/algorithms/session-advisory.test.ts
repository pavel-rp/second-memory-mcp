import { describe, it, expect } from 'vitest';
import {
  resolveSessionAdvisory,
  type SessionAdvisoryInput,
} from '../../../../src/domain/algorithms/session-advisory.js';
import type { FatigueAttempt } from '../../../../src/domain/algorithms/fatigue-trend.js';

const T0 = 1_700_000_000_000;
const HOUR = 3_600_000;
const MIN = 60_000;

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
  activeTimeMs: 10 * MIN,
  activeTimeCeilingMs: 45 * MIN,
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
    });

    expect(result).not.toBeNull();
    expect(result?.kind).toBe('fatigue');
  });

  it('nothing fires on a healthy short session under the ceiling', () => {
    const result = resolveSessionAdvisory(baseInput);

    expect(result).toBeNull();
  });

  describe('guards — never throws', () => {
    it('non-finite activeTimeMs never fires the ceiling', () => {
      const result = resolveSessionAdvisory({
        attempts: shortHealthyFixture(),
        activeTimeMs: Number.NaN,
        activeTimeCeilingMs: 45 * MIN,
      });

      expect(result).toBeNull();
    });

    it('non-finite activeTimeCeilingMs never fires the ceiling', () => {
      const result = resolveSessionAdvisory({
        attempts: shortHealthyFixture(),
        activeTimeMs: 10 * MIN,
        activeTimeCeilingMs: Number.POSITIVE_INFINITY,
      });

      expect(result).toBeNull();
    });

    it('absent (undefined) activeTimeMs and activeTimeCeilingMs never fires the ceiling', () => {
      const result = resolveSessionAdvisory({
        attempts: shortHealthyFixture(),
        activeTimeMs: undefined,
        activeTimeCeilingMs: undefined,
      });

      expect(result).toBeNull();
    });

    it('absent (null) activeTimeMs and activeTimeCeilingMs never fires the ceiling', () => {
      const result = resolveSessionAdvisory({
        attempts: shortHealthyFixture(),
        activeTimeMs: null,
        activeTimeCeilingMs: null,
      });

      expect(result).toBeNull();
    });

    it('malformed attempts input never throws and yields no fatigue advisory', () => {
      expect(() =>
        resolveSessionAdvisory({
          attempts: 'not an array',
          activeTimeMs: 10 * MIN,
          activeTimeCeilingMs: 45 * MIN,
        })
      ).not.toThrow();

      const result = resolveSessionAdvisory({
        attempts: 'not an array',
        activeTimeMs: 10 * MIN,
        activeTimeCeilingMs: 45 * MIN,
      });

      expect(result).toBeNull();
    });
  });
});
