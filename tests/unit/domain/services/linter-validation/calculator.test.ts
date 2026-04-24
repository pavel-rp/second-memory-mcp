import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ELIGIBILITY_THRESHOLDS,
  computeMetrics,
  evaluateEligibility,
  explainEligibilityMiss,
  type EligibilityMetrics,
  type EligibilityCounts,
} from '../../../../../src/domain/services/linter-validation/calculator.js';

describe('computeMetrics', () => {
  it('returns 0/0/0 for empty inputs', () => {
    expect(computeMetrics([], [])).toEqual({ precision: 0, recall: 0, f1: 0 });
  });

  it('returns 1/1/1 when every prediction is correct', () => {
    const expected = [true, true, false, false];
    const observed = [true, true, false, false];
    expect(computeMetrics(expected, observed)).toEqual({ precision: 1, recall: 1, f1: 1 });
  });

  it('returns 0/0/0 when all predictions miss positives and produce no positives', () => {
    const expected = [true, true, true];
    const observed = [false, false, false];
    expect(computeMetrics(expected, observed)).toEqual({ precision: 0, recall: 0, f1: 0 });
  });

  it('handles all-negative expected (precision denominator zero when no positive predicted)', () => {
    expect(computeMetrics([false, false], [false, false])).toEqual({
      precision: 0,
      recall: 0,
      f1: 0,
    });
  });

  it('returns precision=0 when every positive prediction is a false positive', () => {
    const expected = [false, false, false];
    const observed = [true, true, true];
    expect(computeMetrics(expected, observed)).toEqual({ precision: 0, recall: 0, f1: 0 });
  });

  it('computes a representative case correctly', () => {
    // TP=2, FP=1, FN=1 → precision=2/3, recall=2/3, F1=2/3
    const expected = [true, true, true, false];
    const observed = [true, true, false, true];
    const m = computeMetrics(expected, observed);
    expect(m.precision).toBeCloseTo(2 / 3, 6);
    expect(m.recall).toBeCloseTo(2 / 3, 6);
    expect(m.f1).toBeCloseTo(2 / 3, 6);
  });

  it('walks only the shorter prefix on length mismatch — caller bug becomes silent undercount, not a crash', () => {
    // expected = [true], observed = [true, false] → only the first index counts: TP=1.
    const m = computeMetrics([true], [true, false]);
    expect(m.precision).toBe(1);
    expect(m.recall).toBe(1);
    expect(m.f1).toBe(1);
  });
});

describe('evaluateEligibility', () => {
  const passing: EligibilityMetrics = {
    precisionHeldOut: 0.95,
    recallHeldOut: 0.75,
    precisionAdversarial: 0.85,
  };
  const counts: EligibilityCounts = { heldOutCount: 60, adversarialCount: 25 };

  it('returns true when every threshold is met', () => {
    expect(evaluateEligibility(passing, counts)).toBe(true);
  });

  it('returns true at exact threshold values', () => {
    expect(
      evaluateEligibility(
        { precisionHeldOut: 0.9, recallHeldOut: 0.7, precisionAdversarial: 0.8 },
        { heldOutCount: 50, adversarialCount: 20 }
      )
    ).toBe(true);
  });

  it('returns false when any single metric is null', () => {
    expect(evaluateEligibility({ ...passing, precisionHeldOut: null }, counts)).toBe(false);
    expect(evaluateEligibility({ ...passing, recallHeldOut: null }, counts)).toBe(false);
    expect(evaluateEligibility({ ...passing, precisionAdversarial: null }, counts)).toBe(false);
  });

  it('returns false when any single metric falls below threshold', () => {
    expect(evaluateEligibility({ ...passing, precisionHeldOut: 0.89 }, counts)).toBe(false);
    expect(evaluateEligibility({ ...passing, recallHeldOut: 0.69 }, counts)).toBe(false);
    expect(evaluateEligibility({ ...passing, precisionAdversarial: 0.79 }, counts)).toBe(false);
  });

  it('returns false when corpus counts fall short', () => {
    expect(evaluateEligibility(passing, { heldOutCount: 49, adversarialCount: 25 })).toBe(false);
    expect(evaluateEligibility(passing, { heldOutCount: 60, adversarialCount: 19 })).toBe(false);
  });

  it('honors a custom thresholds object', () => {
    const stricter = { ...DEFAULT_ELIGIBILITY_THRESHOLDS, precisionHeldOut: 0.99 };
    expect(evaluateEligibility(passing, counts, stricter)).toBe(false);
    expect(evaluateEligibility({ ...passing, precisionHeldOut: 0.999 }, counts, stricter)).toBe(
      true
    );
  });
});

describe('explainEligibilityMiss', () => {
  const counts: EligibilityCounts = { heldOutCount: 60, adversarialCount: 25 };

  it('returns an empty array when every threshold passes', () => {
    expect(
      explainEligibilityMiss(
        { precisionHeldOut: 0.95, recallHeldOut: 0.8, precisionAdversarial: 0.85 },
        counts
      )
    ).toEqual([]);
  });

  it('lists every threshold that failed when none of them clear', () => {
    const reasons = explainEligibilityMiss(
      { precisionHeldOut: 0.5, recallHeldOut: 0.5, precisionAdversarial: 0.5 },
      { heldOutCount: 0, adversarialCount: 0 }
    );
    expect(reasons).toHaveLength(5);
    expect(reasons.find(r => r.startsWith('precision_held_out:'))).toContain('< 0.9');
    expect(reasons.find(r => r.startsWith('recall_held_out:'))).toContain('< 0.7');
    expect(reasons.find(r => r.startsWith('precision_adversarial:'))).toContain('< 0.8');
    expect(reasons.find(r => r.startsWith('held_out_count:'))).toContain('< 50');
    expect(reasons.find(r => r.startsWith('adversarial_count:'))).toContain('< 20');
  });

  it('reports null metrics distinctly from below-threshold metrics', () => {
    const reasons = explainEligibilityMiss(
      { precisionHeldOut: null, recallHeldOut: null, precisionAdversarial: null },
      counts
    );
    expect(reasons.filter(r => r.includes('not measured'))).toHaveLength(3);
  });
});
