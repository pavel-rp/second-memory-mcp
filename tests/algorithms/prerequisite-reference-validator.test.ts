import { describe, it, expect, beforeEach } from 'vitest';
import { PrerequisiteReferenceValidator } from '../../src/algorithms/prerequisite-reference-validator.js';

describe('PrerequisiteReferenceValidator', () => {
  let validator: PrerequisiteReferenceValidator;
  const existingIds = new Set(['chunk-1', 'chunk-2', 'chunk-3']);

  const lookupFn = (ids: string[]) => new Set(ids.filter(id => existingIds.has(id)));
  const lookupAllFn = () => new Set(existingIds);

  beforeEach(() => {
    validator = new PrerequisiteReferenceValidator(lookupFn, lookupAllFn);
  });

  describe('validatePrerequisiteReferences', () => {
    it('returns valid for empty array', () => {
      const result = validator.validatePrerequisiteReferences([]);
      expect(result.isValid).toBe(true);
      expect(result.validReferences).toEqual([]);
      expect(result.invalidReferences).toEqual([]);
    });

    it('returns valid for null-ish input', () => {
      const result = validator.validatePrerequisiteReferences(null as unknown as string[]);
      expect(result.isValid).toBe(true);
    });

    it('validates existing references as valid', () => {
      const result = validator.validatePrerequisiteReferences(['chunk-1', 'chunk-2']);
      expect(result.isValid).toBe(true);
      expect(result.validReferences).toEqual(['chunk-1', 'chunk-2']);
      expect(result.invalidReferences).toEqual([]);
    });

    it('detects invalid references', () => {
      const result = validator.validatePrerequisiteReferences(['chunk-1', 'nonexistent']);
      expect(result.isValid).toBe(false);
      expect(result.validReferences).toEqual(['chunk-1']);
      expect(result.invalidReferences).toEqual(['nonexistent']);
      expect(result.errors.length).toBe(1);
    });

    it('deduplicates input IDs', () => {
      const result = validator.validatePrerequisiteReferences(['chunk-1', 'chunk-1', 'chunk-1']);
      expect(result.validReferences).toEqual(['chunk-1']);
    });

    it('filters out empty strings', () => {
      const result = validator.validatePrerequisiteReferences(['', '  ', 'chunk-1']);
      expect(result.isValid).toBe(true);
      expect(result.validReferences).toEqual(['chunk-1']);
    });

    it('handles lookup function errors gracefully', () => {
      const failValidator = new PrerequisiteReferenceValidator(
        () => {
          throw new Error('DB down');
        },
        () => new Set()
      );
      const result = failValidator.validatePrerequisiteReferences(['chunk-1']);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Database validation failed');
    });
  });

  describe('validateChunkPrerequisites', () => {
    it('adds chunk context to error messages', () => {
      const result = validator.validateChunkPrerequisites('my-chunk', ['nonexistent']);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("Chunk 'my-chunk'");
    });

    it('passes valid prerequisites through', () => {
      const result = validator.validateChunkPrerequisites('my-chunk', ['chunk-1']);
      expect(result.isValid).toBe(true);
    });
  });

  describe('caching', () => {
    it('clearCache resets cache state', () => {
      // Warm cache
      validator.validatePrerequisiteReferences(['chunk-1']);
      validator.clearCache();
      // Should still work after clearing
      const result = validator.validatePrerequisiteReferences(['chunk-1']);
      expect(result.isValid).toBe(true);
    });
  });

  describe('getAllChunkIds', () => {
    it('returns all chunk IDs from lookup function', () => {
      const allIds = validator.getAllChunkIds();
      expect(allIds).toEqual(existingIds);
    });
  });
});
