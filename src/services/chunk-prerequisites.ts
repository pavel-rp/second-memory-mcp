import { inArray } from 'drizzle-orm';
import { getSql, type SqlDb } from '../db/operations.js';
import { learningChunks } from '../db/schema.js';
import { PrerequisiteReferenceValidator } from '../domain/services/prerequisite-reference-validator.js';

/**
 * Get existing chunk IDs that match a provided list.
 * Used for prerequisite reference validation.
 */
export async function getExistingChunkIdsByIds(
  ids: string[],
  db: SqlDb = getSql()
): Promise<Set<string>> {
  const rows = await db
    .select({ id: learningChunks.id })
    .from(learningChunks)
    .where(inArray(learningChunks.id, ids));
  return new Set(rows.map(r => r.id));
}

/**
 * Get all chunk IDs from the database.
 * Used for comprehensive prerequisite validation.
 */
export async function getAllChunkIds(db: SqlDb = getSql()): Promise<Set<string>> {
  const rows = await db.select({ id: learningChunks.id }).from(learningChunks);
  return new Set(rows.map(r => r.id));
}

// Wired singleton — lookup functions are defined above but
// referenced lazily (only called when validation methods run, not at import time).
export const prerequisiteReferenceValidator = new PrerequisiteReferenceValidator(
  (ids: string[]) => getExistingChunkIdsByIds(ids),
  () => getAllChunkIds()
);
