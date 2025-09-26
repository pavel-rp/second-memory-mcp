import { eq, inArray } from "drizzle-orm";
import { getSql } from "../db/operations.js";
import { learningChunks } from "../db/schema.js";
import type { PrerequisiteReferenceValidationResult } from "../types/prerequisite-validation.js";

/**
 * Validates that prerequisite references point to existing chunk IDs in the database
 * Addresses the issue of inconsistent client-provided prerequisite references
 */
export class PrerequisiteReferenceValidator {
  private chunkIdCache: Set<string> | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Validate that all prerequisite IDs exist as actual chunks in the database
   * @param prerequisiteIds Array of prerequisite chunk IDs to validate
   * @returns Validation result with valid/invalid references
   */
  async validatePrerequisiteReferences(prerequisiteIds: string[]): Promise<PrerequisiteReferenceValidationResult> {
    if (!prerequisiteIds || prerequisiteIds.length === 0) {
      return {
        isValid: true,
        validReferences: [],
        invalidReferences: [],
        errors: [],
      };
    }

    // Remove duplicates and filter out empty strings
    const uniqueIds = [...new Set(prerequisiteIds.filter(id => id && id.trim()))];

    if (uniqueIds.length === 0) {
      return {
        isValid: true,
        validReferences: [],
        invalidReferences: [],
        errors: [],
      };
    }

    try {
      const existingChunkIds = await this.getExistingChunkIds(uniqueIds);
      const validReferences = uniqueIds.filter(id => existingChunkIds.has(id));
      const invalidReferences = uniqueIds.filter(id => !existingChunkIds.has(id));

      const errors = invalidReferences.map(id =>
        `Prerequisite reference '${id}' does not exist as a chunk ID in the database`
      );

      return {
        isValid: invalidReferences.length === 0,
        validReferences,
        invalidReferences,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      return {
        isValid: false,
        validReferences: [],
        invalidReferences: uniqueIds,
        errors: [`Database validation failed: ${errorMessage}`],
      };
    }
  }

  /**
   * Validate prerequisite references for a single chunk
   * @param chunkId The chunk ID (for context in error messages)
   * @param prerequisites Array of prerequisite chunk IDs
   * @returns Validation result
   */
  async validateChunkPrerequisites(chunkId: string, prerequisites: string[]): Promise<PrerequisiteReferenceValidationResult> {
    const result = await this.validatePrerequisiteReferences(prerequisites);

    // Add context about which chunk has invalid prerequisites
    if (!result.isValid) {
      result.errors = result.errors.map(error =>
        `Chunk '${chunkId}': ${error}`
      );
    }

    return result;
  }

  /**
   * Get all existing chunk IDs that match the provided list
   * Uses caching to improve performance for repeated calls
   * @param idsToCheck List of chunk IDs to validate
   * @returns Set of existing chunk IDs
   */
  private async getExistingChunkIds(idsToCheck: string[]): Promise<Set<string>> {
    // Check if we have a fresh cache with all needed IDs
    if (this.chunkIdCache && Date.now() < this.cacheExpiry) {
      const cachedResults = idsToCheck.filter(id => this.chunkIdCache!.has(id));
      if (cachedResults.length === idsToCheck.length) {
        return new Set(cachedResults);
      }
    }

    // Query database for existing chunk IDs
    const db = getSql();
    const existingChunks = db
      .select({ id: learningChunks.id })
      .from(learningChunks)
      .where(inArray(learningChunks.id, idsToCheck))
      .all();

    const existingIds = new Set(existingChunks.map(chunk => chunk.id));

    // Update cache if we're checking a reasonable number of IDs
    if (idsToCheck.length <= 100) {
      this.updateCache(existingIds);
    }

    return existingIds;
  }

  /**
   * Update the chunk ID cache
   * @param newIds New chunk IDs to add to cache
   */
  private updateCache(newIds: Set<string>): void {
    if (!this.chunkIdCache) {
      this.chunkIdCache = new Set();
    }

    // Add new IDs to cache
    newIds.forEach(id => this.chunkIdCache!.add(id));

    // Set cache expiry
    this.cacheExpiry = Date.now() + this.CACHE_DURATION_MS;
  }

  /**
   * Clear the chunk ID cache
   * Useful when chunks are added/removed from the database
   */
  public clearCache(): void {
    this.chunkIdCache = null;
    this.cacheExpiry = 0;
  }

  /**
   * Get all chunk IDs from the database
   * Useful for comprehensive validation scenarios
   * @returns Set of all existing chunk IDs
   */
  async getAllChunkIds(): Promise<Set<string>> {
    const db = getSql();
    const allChunks = db
      .select({ id: learningChunks.id })
      .from(learningChunks)
      .all();

    const allIds = new Set(allChunks.map(chunk => chunk.id));

    // Update cache with all IDs
    this.chunkIdCache = allIds;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION_MS;

    return allIds;
  }
}

// Export singleton instance for consistent caching across the application
export const prerequisiteReferenceValidator = new PrerequisiteReferenceValidator();