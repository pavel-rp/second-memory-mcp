import { describe, it, expect, beforeEach } from 'vitest';
import { PrerequisiteReferenceValidator } from '../../../../src/domain/services/prerequisite-reference-validator.js';

const NOW_MS = new Date('2025-06-15T12:00:00Z').getTime();

describe('PrerequisiteReferenceValidator', () => {
  let validator: PrerequisiteReferenceValidator;
  const existingIds = new Set(['chunk-1', 'chunk-2', 'chunk-3']);

  const lookupFn = async (ids: string[]) => new Set(ids.filter(id => existingIds.has(id)));
  const lookupAllFn = async () => new Set(existingIds);

  beforeEach(() => {
    validator = new PrerequisiteReferenceValidator(lookupFn, lookupAllFn, () => NOW_MS);
  });

  describe('validatePrerequisiteReferences', () => {
    it('returns valid for empty array', async () => {
      const result = await validator.validatePrerequisiteReferences([]);
      expect(result.isValid).toBe(true);
      expect(result.validReferences).toEqual([]);
      expect(result.invalidReferences).toEqual([]);
    });

    it('returns valid for null-ish input', async () => {
      const result = await validator.validatePrerequisiteReferences(null as unknown as string[]);
      expect(result.isValid).toBe(true);
    });

    it('validates existing references as valid', async () => {
      const result = await validator.validatePrerequisiteReferences(['chunk-1', 'chunk-2']);
      expect(result.isValid).toBe(true);
      expect(result.validReferences).toEqual(['chunk-1', 'chunk-2']);
      expect(result.invalidReferences).toEqual([]);
    });

    it('detects invalid references', async () => {
      const result = await validator.validatePrerequisiteReferences(['chunk-1', 'nonexistent']);
      expect(result.isValid).toBe(false);
      expect(result.validReferences).toEqual(['chunk-1']);
      expect(result.invalidReferences).toEqual(['nonexistent']);
      expect(result.errors.length).toBe(1);
    });

    it('deduplicates input IDs', async () => {
      const result = await validator.validatePrerequisiteReferences([
        'chunk-1',
        'chunk-1',
        'chunk-1',
      ]);
      expect(result.validReferences).toEqual(['chunk-1']);
    });

    it('filters out empty strings', async () => {
      const result = await validator.validatePrerequisiteReferences(['', '  ', 'chunk-1']);
      expect(result.isValid).toBe(true);
      expect(result.validReferences).toEqual(['chunk-1']);
    });

    it('handles lookup function errors gracefully', async () => {
      const failValidator = new PrerequisiteReferenceValidator(
        async () => {
          throw new Error('DB down');
        },
        async () => new Set<string>(),
        () => NOW_MS
      );
      const result = await failValidator.validatePrerequisiteReferences(['chunk-1']);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Database validation failed');
    });
  });

  describe('validateChunkPrerequisites', () => {
    it('adds chunk context to error messages', async () => {
      const result = await validator.validateChunkPrerequisites('my-chunk', ['nonexistent']);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("Chunk 'my-chunk'");
    });

    it('passes valid prerequisites through', async () => {
      const result = await validator.validateChunkPrerequisites('my-chunk', ['chunk-1']);
      expect(result.isValid).toBe(true);
    });
  });

  describe('caching', () => {
    it('clearCache resets cache state', async () => {
      // Warm cache
      await validator.validatePrerequisiteReferences(['chunk-1']);
      validator.clearCache();
      // Should still work after clearing
      const result = await validator.validatePrerequisiteReferences(['chunk-1']);
      expect(result.isValid).toBe(true);
    });
  });

  describe('getAllChunkIds', () => {
    it('returns all chunk IDs from lookup function', async () => {
      const allIds = await validator.getAllChunkIds();
      expect(allIds).toEqual(existingIds);
    });
  });
});
