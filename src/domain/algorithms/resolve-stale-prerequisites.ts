/**
 * Pure function for recursive stale prerequisite detection and topological ordering.
 * No I/O — takes pre-fetched metadata, returns ordered list of stale prerequisite IDs.
 */

import { classifyChunk, CUED_RECALL_THRESHOLD } from './classify-chunk.js';

// ── Types ──────────────────────────────────────────────────────────────────

export type PrerequisiteChunkMeta = {
  easeFactor: number;
  repetitions: number;
  nextReviewAt: number;
  intervalDays: number | null;
  prerequisiteIds: string[];
};

export type ResolveStalePrerequisitesInput = {
  chunkMetadata: Map<string, PrerequisiteChunkMeta>;
  targetPrerequisiteIds: string[];
  sessionChunkIds: Set<string>;
  maxDepth: number;
  now: Date;
};

export type ResolveStalePrerequisitesResult = {
  stalePrereqIds: string[];
  circularDetected: boolean;
  depthCapReached: boolean;
};

// ── Core function ──────────────────────────────────────────────────────────

export function resolveStalePrerequisites(
  input: ResolveStalePrerequisitesInput
): ResolveStalePrerequisitesResult {
  const { chunkMetadata, targetPrerequisiteIds, sessionChunkIds, maxDepth, now } = input;

  const staleIds: string[] = [];
  const visited = new Set<string>();
  let circularDetected = false;
  let depthCapReached = false;

  function walk(prereqIds: string[], depth: number, ancestors: Set<string>): void {
    if (depth > maxDepth) {
      depthCapReached = true;
      return;
    }

    for (const id of prereqIds) {
      // Circular detection
      if (ancestors.has(id)) {
        circularDetected = true;
        continue;
      }

      // Already processed or already in session — skip
      if (visited.has(id) || sessionChunkIds.has(id)) {
        continue;
      }

      visited.add(id);

      const meta = chunkMetadata.get(id);
      if (!meta) continue; // no metadata available — skip gracefully

      const decision = classifyChunk(
        {
          easeFactor: meta.easeFactor,
          repetitions: meta.repetitions,
          nextReviewAt: meta.nextReviewAt,
          intervalDays: meta.intervalDays,
        },
        now
      );

      if (decision.estimatedRetrievability >= CUED_RECALL_THRESHOLD) {
        continue; // fresh — no reteaching needed
      }

      // Stale — recurse into this prereq's own prerequisites first (deepest-first ordering)
      const childAncestors = new Set(ancestors);
      childAncestors.add(id);
      walk(meta.prerequisiteIds, depth + 1, childAncestors);

      // After recursing children, add this prereq (topological: deepest first)
      staleIds.push(id);
    }
  }

  walk(targetPrerequisiteIds, 1, new Set());

  return { stalePrereqIds: staleIds, circularDetected, depthCapReached };
}
