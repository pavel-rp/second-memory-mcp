import { describe, it, expect } from 'vitest';
import { VALIDATION_CONSTANTS } from '../../src/shared/constants/validation.js';

describe('VALIDATION_CONSTANTS', () => {
  it('exports expected constant keys', () => {
    expect(VALIDATION_CONSTANTS).toHaveProperty('MAX_TITLE_LENGTH');
    expect(VALIDATION_CONSTANTS).toHaveProperty('MAX_SUBJECT_LENGTH');
    expect(VALIDATION_CONSTANTS).toHaveProperty('LEECH_THRESHOLD');
    expect(VALIDATION_CONSTANTS).toHaveProperty('MIN_DIFFICULTY');
    expect(VALIDATION_CONSTANTS).toHaveProperty('MAX_DIFFICULTY');
    expect(VALIDATION_CONSTANTS).toHaveProperty('MIN_QUALITY_SCORE');
    expect(VALIDATION_CONSTANTS).toHaveProperty('MAX_QUALITY_SCORE');
    expect(VALIDATION_CONSTANTS).toHaveProperty('DEFAULT_ESTIMATED_DURATION');
    expect(VALIDATION_CONSTANTS).toHaveProperty('MAX_CONTENT_SIZE');
    expect(VALIDATION_CONSTANTS).toHaveProperty('MAX_SUMMARY_SIZE');
    expect(VALIDATION_CONSTANTS).toHaveProperty('MIN_CONTENT_LENGTH');
  });

  it('has sensible difficulty range', () => {
    expect(VALIDATION_CONSTANTS.MIN_DIFFICULTY).toBeLessThan(VALIDATION_CONSTANTS.MAX_DIFFICULTY);
    expect(VALIDATION_CONSTANTS.MIN_DIFFICULTY).toBeGreaterThanOrEqual(1);
  });

  it('has sensible quality score range', () => {
    expect(VALIDATION_CONSTANTS.MIN_QUALITY_SCORE).toBeLessThan(
      VALIDATION_CONSTANTS.MAX_QUALITY_SCORE
    );
    expect(VALIDATION_CONSTANTS.MIN_QUALITY_SCORE).toBeGreaterThanOrEqual(0);
    expect(VALIDATION_CONSTANTS.MAX_QUALITY_SCORE).toBeLessThanOrEqual(5);
  });

  it('has positive content size limits', () => {
    expect(VALIDATION_CONSTANTS.MAX_CONTENT_SIZE).toBeGreaterThan(0);
    expect(VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE).toBeGreaterThan(0);
    expect(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH).toBeGreaterThan(0);
    expect(VALIDATION_CONSTANTS.MAX_CONTENT_SIZE).toBeGreaterThan(
      VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE
    );
  });

  it('values are readonly (frozen at type level)', () => {
    // TypeScript enforces 'as const' — verify values are numbers
    expect(typeof VALIDATION_CONSTANTS.MAX_TITLE_LENGTH).toBe('number');
    expect(typeof VALIDATION_CONSTANTS.LEECH_THRESHOLD).toBe('number');
    expect(typeof VALIDATION_CONSTANTS.DEFAULT_ESTIMATED_DURATION).toBe('number');
  });
});
