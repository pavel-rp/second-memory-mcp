import { describe, it, expect } from 'vitest';
import {
  toSnakeCase,
  toCamelCaseKeys,
  toCamelCaseKeysExcept,
} from '../../../src/shared/case-convert.js';

describe('toSnakeCase', () => {
  it('converts flat camelCase keys to snake_case', () => {
    const input = { easeFactor: 2.5, nextReviewDate: '2026-01-01', repetitions: 3 };
    expect(toSnakeCase(input)).toEqual({
      ease_factor: 2.5,
      next_review_date: '2026-01-01',
      repetitions: 3,
    });
  });

  it('converts nested objects recursively', () => {
    const input = {
      sessionSummary: {
        totalItems: 5,
        totalDuration: 30,
        newItems: 2,
      },
    };
    expect(toSnakeCase(input)).toEqual({
      session_summary: {
        total_items: 5,
        total_duration: 30,
        new_items: 2,
      },
    });
  });

  it('converts arrays of objects', () => {
    const input = [
      { chunkType: 'new', estimatedDuration: 10 },
      { chunkType: 'review', estimatedDuration: 5 },
    ];
    expect(toSnakeCase(input)).toEqual([
      { chunk_type: 'new', estimated_duration: 10 },
      { chunk_type: 'review', estimated_duration: 5 },
    ]);
  });

  it('handles arrays nested inside objects', () => {
    const input = {
      recommendations: [{ cognitiveLoad: 3, item: { nextReviewDate: '2026-01-01' } }],
    };
    expect(toSnakeCase(input)).toEqual({
      recommendations: [{ cognitive_load: 3, item: { next_review_date: '2026-01-01' } }],
    });
  });

  it('passes through null and undefined', () => {
    expect(toSnakeCase(null)).toBeNull();
    expect(toSnakeCase(undefined)).toBeUndefined();
  });

  it('passes through primitives', () => {
    expect(toSnakeCase(42)).toBe(42);
    expect(toSnakeCase('hello')).toBe('hello');
    expect(toSnakeCase(true)).toBe(true);
  });

  it('leaves already-snake_case keys unchanged', () => {
    const input = { ease_factor: 2.5, next_review_date: '2026-01-01' };
    expect(toSnakeCase(input)).toEqual({
      ease_factor: 2.5,
      next_review_date: '2026-01-01',
    });
  });

  it('leaves single-word keys unchanged', () => {
    const input = { quality: 4, repetitions: 3, difficulty: 7 };
    expect(toSnakeCase(input)).toEqual({ quality: 4, repetitions: 3, difficulty: 7 });
  });

  it('passes through Date instances without converting', () => {
    const date = new Date('2026-01-01');
    expect(toSnakeCase(date)).toBe(date);
  });

  it('handles empty objects and arrays', () => {
    expect(toSnakeCase({})).toEqual({});
    expect(toSnakeCase([])).toEqual([]);
  });

  it('handles mixed arrays with primitives and objects', () => {
    const input = [1, 'two', { threeValue: 3 }, null];
    expect(toSnakeCase(input)).toEqual([1, 'two', { three_value: 3 }, null]);
  });

  it('handles deeply nested structures', () => {
    const input = {
      levelOne: {
        levelTwo: {
          levelThree: {
            deepValue: 'found',
          },
        },
      },
    };
    expect(toSnakeCase(input)).toEqual({
      level_one: {
        level_two: {
          level_three: {
            deep_value: 'found',
          },
        },
      },
    });
  });

  it('does not produce leading underscores for PascalCase keys', () => {
    const input = { FooBar: 1, Math: 2, CS: 3 };
    expect(toSnakeCase(input)).toEqual({ foo_bar: 1, math: 2, c_s: 3 });
  });

  it('skips recursion into rawKeys values', () => {
    const input = {
      subjectPreferences: { machine_learning: 3, CS: 5 },
      averageDuration: 30,
    };
    expect(toSnakeCase(input, new Set(['subjectPreferences']))).toEqual({
      subject_preferences: { machine_learning: 3, CS: 5 },
      average_duration: 30,
    });
  });
});

describe('toCamelCaseKeys', () => {
  it('converts flat snake_case keys to camelCase', () => {
    const input = { ease_factor: 2.5, next_review_date: '2026-01-01', repetitions: 3 };
    expect(toCamelCaseKeys(input)).toEqual({
      easeFactor: 2.5,
      nextReviewDate: '2026-01-01',
      repetitions: 3,
    });
  });

  it('converts nested objects recursively', () => {
    const input = {
      session_summary: {
        total_items: 5,
        total_duration: 30,
        new_items: 2,
      },
    };
    expect(toCamelCaseKeys(input)).toEqual({
      sessionSummary: {
        totalItems: 5,
        totalDuration: 30,
        newItems: 2,
      },
    });
  });

  it('converts arrays of objects', () => {
    const input = [
      { chunk_type: 'new', estimated_duration: 10 },
      { chunk_type: 'review', estimated_duration: 5 },
    ];
    expect(toCamelCaseKeys(input)).toEqual([
      { chunkType: 'new', estimatedDuration: 10 },
      { chunkType: 'review', estimatedDuration: 5 },
    ]);
  });

  it('handles arrays nested inside objects', () => {
    const input = {
      learning_items: [{ ease_factor: 2.5, next_review_date: '2026-01-01' }],
    };
    expect(toCamelCaseKeys(input)).toEqual({
      learningItems: [{ easeFactor: 2.5, nextReviewDate: '2026-01-01' }],
    });
  });

  it('passes through null and undefined', () => {
    expect(toCamelCaseKeys(null)).toBeNull();
    expect(toCamelCaseKeys(undefined)).toBeUndefined();
  });

  it('passes through primitives', () => {
    expect(toCamelCaseKeys(42)).toBe(42);
    expect(toCamelCaseKeys('hello')).toBe('hello');
    expect(toCamelCaseKeys(true)).toBe(true);
  });

  it('leaves already-camelCase keys unchanged', () => {
    const input = { easeFactor: 2.5, nextReviewDate: '2026-01-01' };
    expect(toCamelCaseKeys(input)).toEqual({
      easeFactor: 2.5,
      nextReviewDate: '2026-01-01',
    });
  });

  it('leaves single-word keys unchanged', () => {
    const input = { quality: 4, repetitions: 3, difficulty: 7 };
    expect(toCamelCaseKeys(input)).toEqual({ quality: 4, repetitions: 3, difficulty: 7 });
  });

  it('passes through Date instances without converting', () => {
    const date = new Date('2026-01-01');
    expect(toCamelCaseKeys(date)).toBe(date);
  });

  it('handles empty objects and arrays', () => {
    expect(toCamelCaseKeys({})).toEqual({});
    expect(toCamelCaseKeys([])).toEqual([]);
  });

  it('is the inverse of toSnakeCase for object keys', () => {
    const camelCase = { easeFactor: 2.5, nextReviewDate: '2026-01-01', estimatedDuration: 10 };
    const snakeCase = toSnakeCase(camelCase);
    expect(toCamelCaseKeys(snakeCase)).toEqual(camelCase);
  });

  it('handles deeply nested structures', () => {
    const input = {
      user_history: {
        recent_sessions: [{ items_completed: 5, average_quality: 3.5, cognitive_load: 7 }],
        patterns: {
          average_session_duration: 30,
          preferred_difficulty: 5,
        },
      },
    };
    expect(toCamelCaseKeys(input)).toEqual({
      userHistory: {
        recentSessions: [{ itemsCompleted: 5, averageQuality: 3.5, cognitiveLoad: 7 }],
        patterns: {
          averageSessionDuration: 30,
          preferredDifficulty: 5,
        },
      },
    });
  });

  it('toCamelCaseKeysExcept skips recursion into rawKeys values', () => {
    const transform = toCamelCaseKeysExcept(new Set(['subject_preferences']));
    const input = {
      subject_preferences: { machine_learning: 3, data_science: 5 },
      average_session_duration: 30,
    };
    expect(transform(input)).toEqual({
      subjectPreferences: { machine_learning: 3, data_science: 5 },
      averageSessionDuration: 30,
    });
  });

  it('toCamelCaseKeysExcept propagates through nested levels', () => {
    const transform = toCamelCaseKeysExcept(new Set(['user_preferences']));
    const input = {
      outer: {
        user_preferences: { dark_mode: true, font_size: 14 },
        some_field: 'hello',
      },
    };
    expect(transform(input)).toEqual({
      outer: {
        userPreferences: { dark_mode: true, font_size: 14 },
        someField: 'hello',
      },
    });
  });
});
