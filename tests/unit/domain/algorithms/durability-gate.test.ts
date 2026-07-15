import { describe, it, expect } from 'vitest';
import {
  computeRetrievabilityPosterior,
  isPrerequisiteSatisfied,
  evaluatePrerequisiteGate,
} from '../../../../src/domain/algorithms/durability-gate.js';

const BAR = 0.9;

describe('computeRetrievabilityPosterior', () => {
  it('returns the uninformative prior mean (0.5) for an empty history', () => {
    expect(computeRetrievabilityPosterior({ successes: 0, failures: 0 })).toBe(0.5);
  });

  it('returns 2/3 for a single success (below any real durability bar)', () => {
    expect(computeRetrievabilityPosterior({ successes: 1, failures: 0 })).toBeCloseTo(2 / 3, 10);
  });

  it('increases monotonically with each additional success', () => {
    const p1 = computeRetrievabilityPosterior({ successes: 1, failures: 0 });
    const p2 = computeRetrievabilityPosterior({ successes: 2, failures: 0 });
    const p3 = computeRetrievabilityPosterior({ successes: 3, failures: 0 });
    expect(p2).toBeGreaterThan(p1);
    expect(p3).toBeGreaterThan(p2);
  });

  it('decreases when failures are added', () => {
    const clean = computeRetrievabilityPosterior({ successes: 8, failures: 0 });
    const withFailures = computeRetrievabilityPosterior({ successes: 8, failures: 3 });
    expect(withFailures).toBeLessThan(clean);
  });

  it('clamps negative counts to zero', () => {
    expect(computeRetrievabilityPosterior({ successes: -5, failures: -2 })).toBe(0.5);
  });
});

describe('isPrerequisiteSatisfied', () => {
  it('locks an empty history (fail-closed cold start)', () => {
    expect(isPrerequisiteSatisfied({ successes: 0, failures: 0 }, BAR)).toBe(false);
  });

  it('locks a single-success prerequisite', () => {
    expect(isPrerequisiteSatisfied({ successes: 1, failures: 0 }, BAR)).toBe(false);
  });

  it('locks a thin multi-success history that has not yet cleared the bar', () => {
    // 7 successes → posterior 8/9 ≈ 0.889 < 0.90
    expect(isPrerequisiteSatisfied({ successes: 7, failures: 0 }, BAR)).toBe(false);
  });

  it('unlocks once the monotonic signal reaches the bar across many observations', () => {
    // 8 successes → posterior 9/10 = 0.90 >= 0.90
    expect(isPrerequisiteSatisfied({ successes: 8, failures: 0 }, BAR)).toBe(true);
  });

  it('keeps a prerequisite locked when failures drag the posterior below the bar', () => {
    expect(isPrerequisiteSatisfied({ successes: 8, failures: 2 }, BAR)).toBe(false);
  });
});

describe('evaluatePrerequisiteGate', () => {
  it('produces an auditable fail-closed decision record on the lock path', () => {
    const decision = evaluatePrerequisiteGate('prereq-a', { successes: 1, failures: 0 }, BAR);
    expect(decision).toMatchObject({
      prerequisiteId: 'prereq-a',
      bar: BAR,
      passed: false,
      successes: 1,
      failures: 0,
    });
    expect(decision.signal).toBeCloseTo(2 / 3, 10);
  });

  it('produces an auditable pass decision record on the unlock path', () => {
    const decision = evaluatePrerequisiteGate('prereq-b', { successes: 20, failures: 0 }, BAR);
    expect(decision).toMatchObject({
      prerequisiteId: 'prereq-b',
      bar: BAR,
      passed: true,
      successes: 20,
      failures: 0,
    });
    expect(decision.signal).toBeGreaterThanOrEqual(BAR);
  });
});
