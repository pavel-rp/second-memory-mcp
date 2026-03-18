import { describe, it, expect } from 'vitest';
import { RecommendationInputSchema } from '../../../../src/domain/types/recommendations.js';

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

  it('strips unknown fields like user_history and session_context', () => {
    const input = {
      learning_items: [],
      fetch_from_database: true,
      user_history: { recent_sessions: [], patterns: {} },
      session_context: { current_session_id: 'sess-1' },
      mode: 'guided',
      subject_preference: 'CS',
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.fetchFromDatabase).toBe(true);
    expect(result).not.toHaveProperty('userHistory');
    expect(result).not.toHaveProperty('user_history');
    expect(result).not.toHaveProperty('sessionContext');
    expect(result).not.toHaveProperty('session_context');
    expect(result).not.toHaveProperty('mode');
    expect(result).not.toHaveProperty('subjectPreference');
    expect(result).not.toHaveProperty('subject_preference');
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
