import { inArray } from 'drizzle-orm';
import { getSql, type SqlDb } from '../db/operations.js';
import { learningChunks } from '../db/schema.js';
import { PrerequisiteReferenceValidator } from '../algorithms/prerequisite-reference-validator.js';

/**
 * Get existing chunk IDs that match a provided list.
 * Used for prerequisite reference validation.
 */
export function getExistingChunkIdsByIds(ids: string[], db: SqlDb = getSql()): Set<string> {
  const rows = db
    .select({ id: learningChunks.id })
    .from(learningChunks)
    .where(inArray(learningChunks.id, ids))
    .all();
  return new Set(rows.map(r => r.id));
}

/**
 * Get all chunk IDs from the database.
 * Used for comprehensive prerequisite validation.
 */
export function getAllChunkIds(db: SqlDb = getSql()): Set<string> {
  const rows = db.select({ id: learningChunks.id }).from(learningChunks).all();
  return new Set(rows.map(r => r.id));
}

// Wired singleton — lookup functions are defined above but
// referenced lazily (only called when validation methods run, not at import time).
export const prerequisiteReferenceValidator = new PrerequisiteReferenceValidator(
  (ids: string[]) => getExistingChunkIdsByIds(ids),
  () => getAllChunkIds()
);
