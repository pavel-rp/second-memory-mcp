import { describe, it, expect } from 'vitest';
import {
  RecommendationInputSchema,
  SessionHistorySchema,
} from '../../../../src/domain/types/recommendations.js';

describe('SessionHistorySchema - nested z.record() protection', () => {
  it('preserves multi-word user-data keys in subject_preferences', () => {
    const input = {
      recent_sessions: [],
      patterns: {
        average_session_duration: 30,
        preferred_difficulty: 5,
        success_rate: 0.8,
        fatigue_threshold: 10,
        subject_preferences: { machine_learning: 5, data_science: 3 },
      },
    };

    const result = SessionHistorySchema.parse(input);
    expect(result.patterns.subjectPreferences).toEqual({
      machine_learning: 5,
      data_science: 3,
    });
  });
});

describe('RecommendationInputSchema - self-fetch parameters', () => {
  it('validates fetch_from_database defaults to false when omitted', () => {
    const input = {
      learning_items: [],
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.fetchFromDatabase).toBe(false);
  });

  it('validates fetch_from_database: true with filters', () => {
    const input = {
      learning_items: [],
      fetch_from_database: true,
      subject_filter: 'Math',
      due_only: true,
      limit: 10,
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.fetchFromDatabase).toBe(true);
    expect(result.subjectFilter).toBe('Math');
    expect(result.dueOnly).toBe(true);
    expect(result.limit).toBe(10);
  });

  it('validates fetch_from_database: false (legacy mode)', () => {
    const input = {
      learning_items: [],
      fetch_from_database: false,
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.fetchFromDatabase).toBe(false);
  });

  it('validates subject filter is optional', () => {
    const input = {
      learning_items: [],
      subject_filter: 'CS',
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.subjectFilter).toBe('CS');
  });

  it('validates due_only filter is optional', () => {
    const input = {
      learning_items: [],
      due_only: true,
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.dueOnly).toBe(true);
  });

  it('validates limit filter is optional and must be positive integer', () => {
    const input = {
      learning_items: [],
      limit: 5,
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.limit).toBe(5);
  });

  it('rejects limit as zero', () => {
    const input = {
      learning_items: [],
      limit: 0,
    };

    expect(() => RecommendationInputSchema.parse(input)).toThrow();
  });

  it('rejects limit as negative', () => {
    const input = {
      learning_items: [],
      limit: -5,
    };

    expect(() => RecommendationInputSchema.parse(input)).toThrow();
  });

  it('rejects limit as non-integer', () => {
    const input = {
      learning_items: [],
      limit: 5.5,
    };

    expect(() => RecommendationInputSchema.parse(input)).toThrow();
  });

  it('validates all filters can be combined', () => {
    const input = {
      learning_items: [],
      fetch_from_database: true,
      subject_filter: 'SWE',
      due_only: false,
      limit: 20,
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.fetchFromDatabase).toBe(true);
    expect(result.subjectFilter).toBe('SWE');
    expect(result.dueOnly).toBe(false);
    expect(result.limit).toBe(20);
  });

  it('validates filters can be omitted when fetch_from_database is true', () => {
    const input = {
      learning_items: [],
      fetch_from_database: true,
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.fetchFromDatabase).toBe(true);
    expect(result.subjectFilter).toBeUndefined();
    expect(result.dueOnly).toBeUndefined();
    expect(result.limit).toBeUndefined();
  });

  it('preserves multi-word user-data keys in nested z.record() fields', () => {
    const input = {
      learning_items: [],
      user_history: {
        recent_sessions: [],
        patterns: {
          average_session_duration: 30,
          preferred_difficulty: 5,
          success_rate: 0.8,
          fatigue_threshold: 10,
          subject_preferences: { machine_learning: 5, data_science: 3 },
        },
      },
      session_context: {
        user_preferences: { dark_mode: true, auto_advance: false },
      },
    };

    const result = RecommendationInputSchema.parse(input);
    // user-data keys must NOT be camelCased
    expect(result.userHistory!.patterns.subjectPreferences).toEqual({
      machine_learning: 5,
      data_science: 3,
    });
    expect(result.sessionContext!.userPreferences).toEqual({
      dark_mode: true,
      auto_advance: false,
    });
  });

  it('validates backward compatibility - filters can be provided without fetch_from_database', () => {
    const input = {
      learning_items: [],
      subject_filter: 'Math',
      due_only: true,
      limit: 10,
    };

    const result = RecommendationInputSchema.parse(input);
    // fetch_from_database should default to false
    expect(result.fetchFromDatabase).toBe(false);
    // But filters should still be present in the parsed result
    expect(result.subjectFilter).toBe('Math');
    expect(result.dueOnly).toBe(true);
    expect(result.limit).toBe(10);
  });
});
