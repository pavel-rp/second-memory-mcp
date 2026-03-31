/**
 * Topic-level staleness aggregation.
 * Aggregates chunk-level tier decisions (from classifyChunk) into a
 * topic-level staleness profile. Pure computation — zero I/O.
 */

import {
  classifyChunk,
  CUED_RECALL_THRESHOLD,
  type ClassifyChunkInput,
  type TeachingApproach,
  type TeachingDecision,
} from './classify-chunk.js';

// ── Types ──────────────────────────────────────────────────────────────────

export type TopicChunkInput = {
  id: string;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: number; // epoch ms
  intervalDays: number | null;
};

export type TopicStalenessProfile = {
  topicId: string;
  totalChunks: number;
  tierDistribution: Record<TeachingApproach, number>;
  medianRetrievability: number;
  dominantTier: TeachingApproach;
  needsTopicOrientation: boolean;
  prerequisiteChainBroken: boolean;
};

// ── Tier severity order (most severe first) ────────────────────────────────

const TIER_SEVERITY: readonly TeachingApproach[] = ['scaffold', 'reteach', 'cued_recall', 'recall'];

// ── Core function ──────────────────────────────────────────────────────────

/**
 * Aggregate chunk-level tier decisions into a topic-level staleness profile.
 * Assumes chunk IDs are unique — duplicates cause the last entry to win and
 * totalChunks to reflect de-duplicated count.
 */
export function computeTopicProfile(
  topicId: string,
  chunks: TopicChunkInput[],
  prerequisites: Map<string, string[]>,
  now: Date
): TopicStalenessProfile {
  if (chunks.length === 0) {
    return {
      topicId,
      totalChunks: 0,
      tierDistribution: { recall: 0, cued_recall: 0, reteach: 0, scaffold: 0 },
      medianRetrievability: 0,
      dominantTier: 'recall',
      needsTopicOrientation: false,
      prerequisiteChainBroken: false,
    };
  }

  const decisions = new Map<string, TeachingDecision>();

  for (const chunk of chunks) {
    const input: ClassifyChunkInput = {
      easeFactor: chunk.easeFactor,
      repetitions: chunk.repetitions,
      nextReviewAt: chunk.nextReviewAt,
      intervalDays: chunk.intervalDays,
    };
    decisions.set(chunk.id, classifyChunk(input, now));
  }

  const tierDistribution: Record<TeachingApproach, number> = {
    recall: 0,
    cued_recall: 0,
    reteach: 0,
    scaffold: 0,
  };

  const retrievabilities: number[] = [];

  for (const decision of decisions.values()) {
    tierDistribution[decision.teachingApproach]++;
    retrievabilities.push(decision.estimatedRetrievability);
  }

  const medianRetrievability = median(retrievabilities);
  const dominantTier = findDominantTier(tierDistribution);
  const needsTopicOrientation = computeNeedsOrientation(retrievabilities);
  const prerequisiteChainBroken = checkPrerequisiteChain(decisions, prerequisites);

  return {
    topicId,
    totalChunks: decisions.size,
    tierDistribution,
    medianRetrievability,
    dominantTier,
    needsTopicOrientation,
    prerequisiteChainBroken,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function median(values: number[]): number {
  // Caller guards empty — computeTopicProfile returns early when chunks.length === 0
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function findDominantTier(distribution: Record<TeachingApproach, number>): TeachingApproach {
  let maxCount = -1;
  let dominant: TeachingApproach = 'recall';

  for (const tier of TIER_SEVERITY) {
    if (distribution[tier] > maxCount) {
      maxCount = distribution[tier];
      dominant = tier;
    }
  }

  return dominant;
}

function computeNeedsOrientation(retrievabilities: number[]): boolean {
  // Caller guards empty — computeTopicProfile returns early when chunks.length === 0
  const lowCount = retrievabilities.filter(r => r < CUED_RECALL_THRESHOLD).length;
  return lowCount / retrievabilities.length >= 0.5;
}

/**
 * Check if any prerequisite chunk is stale.
 * @param prerequisites Map of dependent chunk ID → prerequisite chunk IDs.
 *   Should be scoped to chunks within this topic.
 */
function checkPrerequisiteChain(
  decisions: Map<string, TeachingDecision>,
  prerequisites: Map<string, string[]>
): boolean {
  for (const [, prereqIds] of prerequisites) {
    for (const prereqId of prereqIds) {
      const prereqDecision = decisions.get(prereqId);
      if (prereqDecision && prereqDecision.estimatedRetrievability < CUED_RECALL_THRESHOLD) {
        return true;
      }
    }
  }
  return false;
}
