import { describe, it, expect } from 'vitest';
import { RecommendationInputSchema } from '../../../../src/domain/types/recommendations.js';

describe('RecommendationInputSchema - topic-level', () => {
  it('accepts empty input (all optional)', () => {
    const result = RecommendationInputSchema.parse({});
    expect(result.subjectFilter).toBeUndefined();
    expect(result.limit).toBeUndefined();
  });

  it('accepts subject_filter', () => {
    const result = RecommendationInputSchema.parse({ subject_filter: 'Math' });
    expect(result.subjectFilter).toBe('Math');
  });

  it('accepts limit as positive integer', () => {
    const result = RecommendationInputSchema.parse({ limit: 5 });
    expect(result.limit).toBe(5);
  });

  it('rejects limit as zero', () => {
    expect(() => RecommendationInputSchema.parse({ limit: 0 })).toThrow();
  });

  it('rejects limit as negative', () => {
    expect(() => RecommendationInputSchema.parse({ limit: -5 })).toThrow();
  });

  it('rejects limit as non-integer', () => {
    expect(() => RecommendationInputSchema.parse({ limit: 5.5 })).toThrow();
  });

  it('strips unknown fields', () => {
    const result = RecommendationInputSchema.parse({
      subject_filter: 'CS',
      limit: 10,
      fetch_from_database: true,
      learning_items: [],
      mode: 'guided',
    });
    expect(result.subjectFilter).toBe('CS');
    expect(result.limit).toBe(10);
    expect(result).not.toHaveProperty('fetchFromDatabase');
    expect(result).not.toHaveProperty('learningItems');
    expect(result).not.toHaveProperty('mode');
  });

  it('transforms snake_case to camelCase', () => {
    const result = RecommendationInputSchema.parse({ subject_filter: 'Math', limit: 3 });
    expect(result.subjectFilter).toBe('Math');
    expect(result).not.toHaveProperty('subject_filter');
  });
});
