import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { VALIDATION_CONSTANTS } from '../../../src/shared/constants/validation.js';

describe('Validation Error Messages', () => {
  it('should provide clear error messages for title validation', () => {
    const titleSchema = z
      .string()
      .min(1, 'Title cannot be empty')
      .max(
        VALIDATION_CONSTANTS.MAX_TITLE_LENGTH,
        `Title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`
      );

    // Test empty title
    const emptyResult = titleSchema.safeParse('');
    expect(emptyResult.success).toBe(false);
    if (!emptyResult.success) {
      expect(emptyResult.error.errors[0].message).toBe('Title cannot be empty');
    }

    // Test title too long
    const longTitle = 'a'.repeat(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH + 1);
    const longResult = titleSchema.safeParse(longTitle);
    expect(longResult.success).toBe(false);
    if (!longResult.success) {
      expect(longResult.error.errors[0].message).toBe(
        `Title cannot exceed ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`
      );
    }
  });

  it('should provide clear error messages for difficulty validation', () => {
    const difficultySchema = z
      .number()
      .int('Difficulty must be an integer')
      .min(
        VALIDATION_CONSTANTS.MIN_DIFFICULTY,
        `Difficulty must be at least ${VALIDATION_CONSTANTS.MIN_DIFFICULTY}`
      )
      .max(
        VALIDATION_CONSTANTS.MAX_DIFFICULTY,
        `Difficulty cannot exceed ${VALIDATION_CONSTANTS.MAX_DIFFICULTY}`
      );

    // Test non-integer
    const floatResult = difficultySchema.safeParse(5.5);
    expect(floatResult.success).toBe(false);
    if (!floatResult.success) {
      expect(floatResult.error.errors[0].message).toBe('Difficulty must be an integer');
    }

    // Test too low
    const lowResult = difficultySchema.safeParse(0);
    expect(lowResult.success).toBe(false);
    if (!lowResult.success) {
      expect(lowResult.error.errors[0].message).toBe(
        `Difficulty must be at least ${VALIDATION_CONSTANTS.MIN_DIFFICULTY}`
      );
    }

    // Test too high
    const highResult = difficultySchema.safeParse(11);
    expect(highResult.success).toBe(false);
    if (!highResult.success) {
      expect(highResult.error.errors[0].message).toBe(
        `Difficulty cannot exceed ${VALIDATION_CONSTANTS.MAX_DIFFICULTY}`
      );
    }
  });

  it('should provide clear error messages for quality score validation', () => {
    const qualitySchema = z
      .number()
      .min(
        VALIDATION_CONSTANTS.MIN_QUALITY_SCORE,
        `Quality score must be at least ${VALIDATION_CONSTANTS.MIN_QUALITY_SCORE}`
      )
      .max(
        VALIDATION_CONSTANTS.MAX_QUALITY_SCORE,
        `Quality score cannot exceed ${VALIDATION_CONSTANTS.MAX_QUALITY_SCORE}`
      );

    // Test too low
    const lowResult = qualitySchema.safeParse(-1);
    expect(lowResult.success).toBe(false);
    if (!lowResult.success) {
      expect(lowResult.error.errors[0].message).toBe(
        `Quality score must be at least ${VALIDATION_CONSTANTS.MIN_QUALITY_SCORE}`
      );
    }

    // Test too high
    const highResult = qualitySchema.safeParse(6);
    expect(highResult.success).toBe(false);
    if (!highResult.success) {
      expect(highResult.error.errors[0].message).toBe(
        `Quality score cannot exceed ${VALIDATION_CONSTANTS.MAX_QUALITY_SCORE}`
      );
    }
  });

  it('should provide clear error messages for chunk type validation', () => {
    const chunkTypeSchema = z.enum(['new', 'review', 'remediation'], {
      errorMap: () => ({ message: 'Chunk type must be one of: new, review, remediation' }),
    });

    // Test invalid chunk type
    const invalidResult = chunkTypeSchema.safeParse('invalid');
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(invalidResult.error.errors[0].message).toBe(
        'Chunk type must be one of: new, review, remediation'
      );
    }
  });
});
