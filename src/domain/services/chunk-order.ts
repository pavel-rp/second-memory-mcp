import type { LinterFinding } from './chunk-linter.js';

/**
 * Minimal chunk shape needed to validate a proposed ordering (NEU-758).
 * `prerequisites` are the chunk ids (within the same topic) that must be taught
 * before this chunk.
 */
export type ChunkOrderInput = {
  id: string;
  prerequisites: string[];
};

export type ChunkOrderValidation = {
  valid: boolean;
  findings: LinterFinding[];
};

const CATEGORY = 'order';

/**
 * Validate a proposed chunk ordering for a topic. Pure — no I/O, never throws.
 *
 * Two failure classes, each surfaced as a blocking `LinterFinding`:
 *
 * 1. `order.set_mismatch` — `orderedIds` is not exactly the topic's chunk set:
 *    a duplicate, an id not in the topic, or a topic chunk left out. Returned
 *    on its own (prerequisite positions are meaningless on a malformed set).
 * 2. `order.prerequisite_violation` — a chunk is positioned at or before one of
 *    its prerequisites. Only prerequisites that belong to the topic set are
 *    considered (external/phantom prerequisites are out of scope here).
 *
 * Returns `{ valid: true, findings: [] }` when the ordering is complete and
 * prerequisite-respecting.
 */
export function validateChunkOrder(
  orderedIds: string[],
  chunks: ChunkOrderInput[]
): ChunkOrderValidation {
  const findings: LinterFinding[] = [];
  const topicIds = new Set(chunks.map(c => c.id));

  // ── 1. Set-completeness ────────────────────────────────────────
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of orderedIds) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  for (const id of duplicates) {
    findings.push({
      chunkId: id,
      rule: 'order.set_mismatch',
      severity: 'blocking',
      category: CATEGORY,
      detail: `Chunk "${id}" appears more than once in the requested order.`,
    });
  }
  for (const id of orderedIds) {
    if (!topicIds.has(id)) {
      findings.push({
        chunkId: id,
        rule: 'order.set_mismatch',
        severity: 'blocking',
        category: CATEGORY,
        detail: `Chunk "${id}" is not part of this topic.`,
      });
    }
  }
  for (const c of chunks) {
    if (!seen.has(c.id)) {
      findings.push({
        chunkId: c.id,
        rule: 'order.set_mismatch',
        severity: 'blocking',
        category: CATEGORY,
        detail: `Chunk "${c.id}" is missing from the requested order — every topic chunk must be listed exactly once.`,
      });
    }
  }

  // A malformed set makes positional prerequisite checks meaningless.
  if (findings.length > 0) {
    return { valid: false, findings };
  }

  // ── 2. Prerequisite consistency ────────────────────────────────
  const position = new Map<string, number>();
  orderedIds.forEach((id, idx) => position.set(id, idx));

  for (const c of chunks) {
    const chunkPos = position.get(c.id);
    /* c8 ignore next -- set-completeness above guarantees every chunk has a position */
    if (chunkPos === undefined) continue;
    for (const prereqId of c.prerequisites) {
      const prereqPos = position.get(prereqId);
      // Prerequisites outside the topic set are not an ordering concern here.
      if (prereqPos === undefined) continue;
      if (prereqPos >= chunkPos) {
        findings.push({
          chunkId: c.id,
          rule: 'order.prerequisite_violation',
          severity: 'blocking',
          category: CATEGORY,
          detail: `Chunk "${c.id}" (position ${chunkPos + 1}) is ordered at or before its prerequisite "${prereqId}" (position ${prereqPos + 1}). A chunk must come after all of its prerequisites.`,
        });
      }
    }
  }

  return { valid: findings.length === 0, findings };
}
