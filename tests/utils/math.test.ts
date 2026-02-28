import { describe, it, expect } from 'vitest';
import { clamp, roundTo } from '../../src/utils/math.js';

describe('clamp', () => {
  it('returns min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('works with negative ranges', () => {
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(5, -10, -1)).toBe(-1);
  });

  it('works with floating-point values', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(1.5, 0, 1)).toBe(1);
  });
});

describe('roundTo', () => {
  it('rounds to 0 decimal places', () => {
    expect(roundTo(3.7, 0)).toBe(4);
    expect(roundTo(3.4, 0)).toBe(3);
  });

  it('rounds to 2 decimal places', () => {
    expect(roundTo(3.14159, 2)).toBe(3.14);
  });

  it('rounds to 4 decimal places', () => {
    expect(roundTo(1.23456789, 4)).toBe(1.2346);
  });

  it('handles negative numbers', () => {
    expect(roundTo(-3.456, 1)).toBe(-3.5);
  });

  it('handles zero', () => {
    expect(roundTo(0, 2)).toBe(0);
  });

  it('handles already-rounded values', () => {
    expect(roundTo(3.14, 2)).toBe(3.14);
  });
});
