import { describe, it, expect } from 'vitest';
import { computePacing } from '../../../../src/domain/algorithms/compute-pacing.js';

describe('computePacing', () => {
  it('returns full delivery_mode for difficulty 1', () => {
    const result = computePacing(1);
    expect(result.delivery_mode).toBe('full');
    expect(result.checkpoint_cadence).toBe('end_of_chunk');
  });

  it('returns full delivery_mode for difficulty 3 (boundary)', () => {
    const result = computePacing(3);
    expect(result.delivery_mode).toBe('full');
    expect(result.checkpoint_cadence).toBe('end_of_chunk');
  });

  it('returns incremental delivery_mode for difficulty 4 (boundary)', () => {
    const result = computePacing(4);
    expect(result.delivery_mode).toBe('incremental');
    expect(result.checkpoint_cadence).toBe('after_each_concept');
  });

  it('returns incremental delivery_mode for difficulty 7', () => {
    const result = computePacing(7);
    expect(result.delivery_mode).toBe('incremental');
    expect(result.checkpoint_cadence).toBe('after_each_concept');
  });

  it('returns incremental delivery_mode for difficulty 10', () => {
    const result = computePacing(10);
    expect(result.delivery_mode).toBe('incremental');
    expect(result.checkpoint_cadence).toBe('after_each_concept');
  });

  it('always includes a non-empty directive string', () => {
    for (let d = 1; d <= 10; d++) {
      const result = computePacing(d);
      expect(result.directive).toBeTruthy();
      expect(typeof result.directive).toBe('string');
    }
  });
});
