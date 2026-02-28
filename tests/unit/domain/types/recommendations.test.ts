import { describe, it, expect } from 'vitest';
import { RecommendationInputSchema } from '../../../../src/domain/types/recommendations.js';

describe('RecommendationInputSchema - self-fetch parameters', () => {
  it('validates fetchFromDatabase defaults to false when omitted', () => {
    const input = {
      learningItems: [],
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.fetchFromDatabase).toBe(false);
  });

  it('validates fetchFromDatabase: true with filters', () => {
    const input = {
      learningItems: [],
      fetchFromDatabase: true,
      subjectFilter: 'Math',
      dueOnly: true,
      limit: 10,
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.fetchFromDatabase).toBe(true);
    expect(result.subjectFilter).toBe('Math');
    expect(result.dueOnly).toBe(true);
    expect(result.limit).toBe(10);
  });

  it('validates fetchFromDatabase: false (legacy mode)', () => {
    const input = {
      learningItems: [],
      fetchFromDatabase: false,
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.fetchFromDatabase).toBe(false);
  });

  it('validates subject filter is optional', () => {
    const input = {
      learningItems: [],
      subjectFilter: 'CS',
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.subjectFilter).toBe('CS');
  });

  it('validates dueOnly filter is optional', () => {
    const input = {
      learningItems: [],
      dueOnly: true,
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.dueOnly).toBe(true);
  });

  it('validates limit filter is optional and must be positive integer', () => {
    const input = {
      learningItems: [],
      limit: 5,
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.limit).toBe(5);
  });

  it('rejects limit as zero', () => {
    const input = {
      learningItems: [],
      limit: 0,
    };

    expect(() => RecommendationInputSchema.parse(input)).toThrow();
  });

  it('rejects limit as negative', () => {
    const input = {
      learningItems: [],
      limit: -5,
    };

    expect(() => RecommendationInputSchema.parse(input)).toThrow();
  });

  it('rejects limit as non-integer', () => {
    const input = {
      learningItems: [],
      limit: 5.5,
    };

    expect(() => RecommendationInputSchema.parse(input)).toThrow();
  });

  it('validates all filters can be combined', () => {
    const input = {
      learningItems: [],
      fetchFromDatabase: true,
      subjectFilter: 'SWE',
      dueOnly: false,
      limit: 20,
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.fetchFromDatabase).toBe(true);
    expect(result.subjectFilter).toBe('SWE');
    expect(result.dueOnly).toBe(false);
    expect(result.limit).toBe(20);
  });

  it('validates filters can be omitted when fetchFromDatabase is true', () => {
    const input = {
      learningItems: [],
      fetchFromDatabase: true,
    };

    const result = RecommendationInputSchema.parse(input);
    expect(result.fetchFromDatabase).toBe(true);
    expect(result.subjectFilter).toBeUndefined();
    expect(result.dueOnly).toBeUndefined();
    expect(result.limit).toBeUndefined();
  });

  it('validates backward compatibility - filters can be provided without fetchFromDatabase', () => {
    const input = {
      learningItems: [],
      subjectFilter: 'Math',
      dueOnly: true,
      limit: 10,
    };

    const result = RecommendationInputSchema.parse(input);
    // fetchFromDatabase should default to false
    expect(result.fetchFromDatabase).toBe(false);
    // But filters should still be present in the parsed result
    expect(result.subjectFilter).toBe('Math');
    expect(result.dueOnly).toBe(true);
    expect(result.limit).toBe(10);
  });
});
