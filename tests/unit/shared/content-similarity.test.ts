import { describe, it, expect } from 'vitest';
import {
  calculateLevenshteinDistance,
  calculateSimilarityRatio,
  hasSignificantContentChange,
} from '../../../src/shared/content-similarity.js';

describe('content-similarity', () => {
  describe('calculateLevenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(calculateLevenshteinDistance('hello', 'hello')).toBe(0);
      expect(calculateLevenshteinDistance('', '')).toBe(0);
      expect(calculateLevenshteinDistance('test123', 'test123')).toBe(0);
    });

    it('should return string length for empty string comparison', () => {
      expect(calculateLevenshteinDistance('', 'hello')).toBe(5);
      expect(calculateLevenshteinDistance('hello', '')).toBe(5);
    });

    it('should calculate single character changes', () => {
      expect(calculateLevenshteinDistance('cat', 'bat')).toBe(1); // substitution
      expect(calculateLevenshteinDistance('cat', 'cats')).toBe(1); // insertion
      expect(calculateLevenshteinDistance('cats', 'cat')).toBe(1); // deletion
    });

    it('should calculate multiple character changes', () => {
      expect(calculateLevenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(calculateLevenshteinDistance('saturday', 'sunday')).toBe(3);
    });

    it('should handle completely different strings', () => {
      const distance = calculateLevenshteinDistance('abc', 'xyz');
      expect(distance).toBe(3);
    });

    it('should be symmetric', () => {
      const str1 = 'hello';
      const str2 = 'world';
      expect(calculateLevenshteinDistance(str1, str2)).toBe(
        calculateLevenshteinDistance(str2, str1)
      );
    });
  });

  describe('calculateSimilarityRatio', () => {
    it('should return 1 for identical strings', () => {
      expect(calculateSimilarityRatio('hello', 'hello')).toBe(1.0);
      expect(calculateSimilarityRatio('', '')).toBe(1.0);
      expect(calculateSimilarityRatio('test content', 'test content')).toBe(1.0);
    });

    it('should return 0 for empty string compared to non-empty', () => {
      expect(calculateSimilarityRatio('', 'hello')).toBe(0.0);
      expect(calculateSimilarityRatio('hello', '')).toBe(0.0);
    });

    it('should return values between 0 and 1', () => {
      const ratio = calculateSimilarityRatio('hello', 'hallo');
      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThan(1);
    });

    it('should show high similarity for minor changes', () => {
      const ratio = calculateSimilarityRatio('hello world', 'hello world!');
      expect(ratio).toBeGreaterThan(0.9);
    });

    it('should show low similarity for major changes', () => {
      const ratio = calculateSimilarityRatio(
        'This is the original text',
        'Completely different content'
      );
      expect(ratio).toBeLessThan(0.5);
    });

    it('should handle same-length strings with different content', () => {
      // This is the key test case from the issue
      const original = 'abcdefghij';
      const replaced = 'zyxwvutsrq';
      const ratio = calculateSimilarityRatio(original, replaced);
      expect(ratio).toBe(0); // Completely different despite same length
    });

    it('should detect when content is mostly changed despite similar length', () => {
      const original = 'Learn about TypeScript basics';
      const replaced = 'Study Python advanced concepts';
      const ratio = calculateSimilarityRatio(original, replaced);
      // Same length (30 chars), but very different content
      expect(ratio).toBeLessThan(0.5);
    });
  });

  describe('hasSignificantContentChange', () => {
    it('should return false for identical content', () => {
      expect(hasSignificantContentChange('test', 'test')).toBe(false);
    });

    it('should return false for minor changes (above threshold)', () => {
      const original = 'This is a test content for learning';
      const modified = 'This is a test content for teaching';
      // Very similar, only one word changed
      expect(hasSignificantContentChange(original, modified)).toBe(false);
    });

    it('should return true for major changes (below threshold)', () => {
      const original = 'Learn TypeScript programming fundamentals';
      const modified = 'Study Python data science libraries';
      // Completely different content
      expect(hasSignificantContentChange(original, modified)).toBe(true);
    });

    it('should return true for same-length completely different content', () => {
      // This addresses the core issue: same length, different content
      const original = 'aaaaaaaaaa';
      const replaced = 'bbbbbbbbbb';
      expect(hasSignificantContentChange(original, replaced)).toBe(true);
    });

    it('should respect custom threshold', () => {
      const original = 'hello world';
      const modified = 'hello earth';

      // With stricter threshold (0.8), should be significant
      const strictResult = hasSignificantContentChange(original, modified, 0.8);

      // Strict threshold should be more likely to detect changes
      expect(strictResult).toBe(true);
    });

    it('should handle empty strings', () => {
      expect(hasSignificantContentChange('', '')).toBe(false);
      expect(hasSignificantContentChange('content', '')).toBe(true);
      expect(hasSignificantContentChange('', 'content')).toBe(true);
    });

    it('should detect significant changes in learning content scenarios', () => {
      // Scenario: User replaces learning material with completely different topic
      const pythonContent = 'Python is a high-level programming language';
      const javaContent = 'Java requires explicit type declarations always';

      expect(hasSignificantContentChange(pythonContent, javaContent)).toBe(true);
    });

    it('should not detect minor edits as significant', () => {
      // Scenario: User fixes typos or adds minor clarifications
      const original = 'The function returns a value of type number';
      const fixedTypo = 'The function returns a value of type number.';

      expect(hasSignificantContentChange(original, fixedTypo)).toBe(false);
    });

    it('should handle large content changes', () => {
      const original = 'Short content';
      const expanded =
        'This is a much longer content that has been significantly expanded with many new details and explanations about the topic.';

      expect(hasSignificantContentChange(original, expanded)).toBe(true);
    });

    it('should handle very large strings efficiently with fallback', () => {
      // Create strings larger than MAX_LEVENSHTEIN_LENGTH (10000 chars)
      const largeStr1 = 'a'.repeat(15000);
      const largeStr2 = 'b'.repeat(15000);

      // Should still work without excessive memory usage
      const result = hasSignificantContentChange(largeStr1, largeStr2);

      // Should detect as significant change since they're completely different
      expect(result).toBe(true);
    });

    it('should handle large similar strings with fallback', () => {
      // Create large similar strings
      const largeStr1 = 'a'.repeat(15000);
      const largeStr2 = 'a'.repeat(15000);

      // Should detect as not significantly changed
      const result = hasSignificantContentChange(largeStr1, largeStr2);
      expect(result).toBe(false);
    });
  });

  describe('Memory efficiency', () => {
    it('should use space-efficient algorithm for normal strings', () => {
      // Test with moderately sized strings that would use the optimized algorithm
      const str1 = 'a'.repeat(1000);
      const str2 = 'b'.repeat(1000);

      // Should complete without memory issues
      const distance = calculateLevenshteinDistance(str1, str2);
      expect(distance).toBe(1000);
    });

    it('should swap strings to use shorter length for optimization', () => {
      // Longer string first, shorter second
      const long = 'a'.repeat(500);
      const short = 'b'.repeat(100);

      const distance = calculateLevenshteinDistance(long, short);

      // Should still calculate correctly
      expect(distance).toBeGreaterThan(0);
    });
  });
});
