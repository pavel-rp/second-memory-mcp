import { describe, it, expect } from 'vitest';
import { computeQualityCap } from '../../../../src/domain/algorithms/quality-cap.js';

describe('computeQualityCap', () => {
  it('returns incoming quality unchanged when no prior attempts', () => {
    const result = computeQualityCap(undefined, 5);
    expect(result).toEqual({ quality: 5, wasCapped: false });
  });

  it('returns incoming quality unchanged when min prior quality >= 3', () => {
    expect(computeQualityCap(3, 5)).toEqual({ quality: 5, wasCapped: false });
    expect(computeQualityCap(4, 5)).toEqual({ quality: 5, wasCapped: false });
    expect(computeQualityCap(5, 5)).toEqual({ quality: 5, wasCapped: false });
  });

  it('caps at 3 when min prior quality is 1 and incoming exceeds cap', () => {
    expect(computeQualityCap(1, 5)).toEqual({ quality: 3, wasCapped: true });
    expect(computeQualityCap(1, 4)).toEqual({ quality: 3, wasCapped: true });
  });

  it('caps at 3 when min prior quality is 0 and incoming exceeds cap', () => {
    expect(computeQualityCap(0, 5)).toEqual({ quality: 3, wasCapped: true });
    expect(computeQualityCap(0, 4)).toEqual({ quality: 3, wasCapped: true });
  });

  it('does not cap when incoming is at or below cap for min prior 1', () => {
    expect(computeQualityCap(1, 3)).toEqual({ quality: 3, wasCapped: false });
    expect(computeQualityCap(1, 2)).toEqual({ quality: 2, wasCapped: false });
    expect(computeQualityCap(1, 1)).toEqual({ quality: 1, wasCapped: false });
  });

  it('caps at 4 when min prior quality is 2 and incoming exceeds cap', () => {
    expect(computeQualityCap(2, 5)).toEqual({ quality: 4, wasCapped: true });
  });

  it('does not cap when incoming is at or below cap for min prior 2', () => {
    expect(computeQualityCap(2, 4)).toEqual({ quality: 4, wasCapped: false });
    expect(computeQualityCap(2, 3)).toEqual({ quality: 3, wasCapped: false });
    expect(computeQualityCap(2, 2)).toEqual({ quality: 2, wasCapped: false });
  });
});
