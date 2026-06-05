import { describe, it, expect } from 'vitest';
import { aggregateVerdictSamples } from '../../../../src/domain/algorithms/aggregate-verdict-samples.js';
import type { VerdictField } from '../../../../src/domain/types/classifier.js';

function vf(score: number, applicable: boolean, rationale: string): VerdictField {
  return { score, rationale, applicable };
}

describe('aggregateVerdictSamples', () => {
  it('returns null for an empty sample list', () => {
    expect(aggregateVerdictSamples([])).toBeNull();
  });

  it('returns the single sample unchanged when given one sample', () => {
    const only = vf(2, true, 'only sample');
    expect(aggregateVerdictSamples([only])).toEqual(only);
  });

  it('takes the median score for odd N and the median sample rationale', () => {
    const samples = [vf(5, true, 'high'), vf(1, true, 'low'), vf(3, true, 'mid')];
    expect(aggregateVerdictSamples(samples)).toEqual({
      score: 3,
      rationale: 'mid',
      applicable: true,
    });
  });

  it('uses the lower median (sorted index floor((n-1)/2)) for even N', () => {
    // Sorted scores [2, 4] → index floor(1/2)=0 → representative is the score-2 sample.
    const result = aggregateVerdictSamples([vf(4, true, 'four'), vf(2, true, 'two')]);
    expect(result).toEqual({ score: 2, rationale: 'two', applicable: true });
  });

  it('biases an even-N split toward the lower (more cautious) score', () => {
    // Sorted [2, 3] → lower median 2.
    const result = aggregateVerdictSamples([vf(3, true, 'three'), vf(2, true, 'two')]);
    expect(result?.score).toBe(2);
    expect(result?.rationale).toBe('two');
  });

  it('resolves applicable by majority vote', () => {
    const trueMajority = aggregateVerdictSamples([
      vf(3, true, 'a'),
      vf(3, true, 'b'),
      vf(3, false, 'c'),
    ]);
    expect(trueMajority?.applicable).toBe(true);

    const falseMajority = aggregateVerdictSamples([
      vf(3, false, 'a'),
      vf(3, false, 'b'),
      vf(3, true, 'c'),
    ]);
    expect(falseMajority?.applicable).toBe(false);
  });

  it('breaks an applicable tie with the representative (median) sample', () => {
    // 1 true / 1 false tie → representative is the lower-median (score-2) sample.
    const repTrue = aggregateVerdictSamples([vf(2, true, 'two'), vf(4, false, 'four')]);
    expect(repTrue?.applicable).toBe(true);

    const repFalse = aggregateVerdictSamples([vf(2, false, 'two'), vf(4, true, 'four')]);
    expect(repFalse?.applicable).toBe(false);
  });

  it('is deterministic — identical input yields identical output across calls', () => {
    const samples = [vf(2, true, 'x'), vf(4, false, 'y'), vf(2, false, 'z')];
    const first = aggregateVerdictSamples(samples);
    const second = aggregateVerdictSamples(samples);
    expect(first).toEqual(second);
    // Re-running on a fresh copy of the same values is also identical.
    const copy = samples.map(s => vf(s.score, s.applicable, s.rationale));
    expect(aggregateVerdictSamples(copy)).toEqual(first);
  });

  it('does not mutate the caller’s sample array', () => {
    const samples = [vf(5, true, 'high'), vf(1, true, 'low'), vf(3, true, 'mid')];
    const snapshot = samples.map(s => vf(s.score, s.applicable, s.rationale));
    aggregateVerdictSamples(samples);
    expect(samples).toEqual(snapshot);
  });
});
