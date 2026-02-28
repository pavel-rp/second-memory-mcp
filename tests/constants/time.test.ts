import { describe, it, expect } from 'vitest';
import { MS_PER_DAY } from '../../src/constants/time.js';

describe('MS_PER_DAY', () => {
  it('equals 24 * 60 * 60 * 1000', () => {
    expect(MS_PER_DAY).toBe(24 * 60 * 60 * 1000);
  });

  it('equals 86400000', () => {
    expect(MS_PER_DAY).toBe(86_400_000);
  });
});
