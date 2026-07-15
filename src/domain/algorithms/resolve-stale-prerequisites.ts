/**
 * Pure function for recursive stale prerequisite detection and topological ordering.
 * No I/O — takes pre-fetched metadata, returns ordered list of stale prerequisite IDs.
 */

import {
  evaluatePrerequisiteGate,
  type GateDecision,
  type ReviewObservationCounts,
} from './durability-gate.js';

// ── Types ──────────────────────────────────────────────────────────────────

export type PrerequisiteChunkMeta = {
  easeFactor: number;
  repetitions: number;
  nextReviewAt: number;
  intervalDays: number | null;
  prerequisiteIds: string[];
  /**
   * Prerequisite's persisted multi-observation review history (graded pass/fail
   * counts). Feeds the durability gate's retrievability-posterior. An empty
   * history ({ successes: 0, failures: 0 }) fails closed.
   */
  observations: ReviewObservationCounts;
};

export type ResolveStalePrerequisitesInput = {
  chunkMetadata: Map<string, PrerequisiteChunkMeta>;
  targetPrerequisiteIds: string[];
  sessionChunkIds: Set<string>;
  maxDepth: number;
  now: Date;
  /**
   * Durability bar (retrievability-posterior) a prerequisite must clear to
   * unlock its dependent. Below the bar the prerequisite stays stale/locked
   * (NEU-931 / MM-T8 Gate C posterior sub-gate).
   */
  durabilityBar: number;
};

export type ResolveStalePrerequisitesResult = {
  stalePrereqIds: string[];
  circularDetected: boolean;
  depthCapReached: boolean;
  /**
   * Auditable gate-decision records (OUT-7), one per evaluated prerequisite,
   * on BOTH the unlock (`passed: true`) and lock/fail-closed (`passed: false`)
   * paths. The orchestration boundary emits/persists them.
   */
  gateDecisions: GateDecision[];
};

// ── Core function ──────────────────────────────────────────────────────────

export function resolveStalePrerequisites(
  input: ResolveStalePrerequisitesInput
): ResolveStalePrerequisitesResult {
  const { chunkMetadata, targetPrerequisiteIds, sessionChunkIds, maxDepth, durabilityBar } = input;

  const staleIds: string[] = [];
  const gateDecisions: GateDecision[] = [];
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

      // Durability gate (NEU-931): a dependent unlocks past this prerequisite
      // only when its retrievability-posterior clears the bar. A thin/single-
      // success history fails closed and keeps the prerequisite stale (locked).
      const decision = evaluatePrerequisiteGate(id, meta.observations, durabilityBar);
      gateDecisions.push(decision);

      if (decision.passed) {
        continue; // durable — dependent may proceed past this prerequisite
      }

      // Below the bar — recurse into this prereq's own prerequisites first
      // (deepest-first ordering), then enqueue it for reteaching.
      const childAncestors = new Set(ancestors);
      childAncestors.add(id);
      walk(meta.prerequisiteIds, depth + 1, childAncestors);

      // After recursing children, add this prereq (topological: deepest first)
      staleIds.push(id);
    }
  }

  // Start at depth 1: direct prerequisites are one level deep; caps at depth > maxDepth
  walk(targetPrerequisiteIds, 1, new Set());

  return {
    stalePrereqIds: staleIds,
    circularDetected,
    depthCapReached,
    gateDecisions,
  };
}
