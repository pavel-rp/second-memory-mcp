import { calculateUrgencyScore } from '../algorithms/urgency-calculator.js';
import type { RecommendationType, TopicRecommendation } from '../types/recommendations.js';

/** A due chunk with the fields needed for topic-level aggregation. */
export type DueChunkInfo = {
  id: string;
  topicId: string;
  topicTitle: string;
  nextReviewAt: number;
  easeFactor: number;
  estimatedDuration: number;
  createdAt: number;
  lastReviewedAt: number | null;
};

export type TopicAggregationInput = {
  dueChunks: DueChunkInfo[];
  topicChunkCounts: Map<string, number>;
  limit: number;
  now: Date;
  recencyWindowMs: number;
};

/** Additive boost for continue_learning topics. Enough to beat ~10 overdue days but not 150+. */
const RECENCY_BOOST = 0.3;

/**
 * Classify a topic based on recency and chunk state.
 * Priority: continue_learning > overdue_review > new_material.
 *
 * Note: `continue_learning` requires new (unreviewed) chunks. A topic where
 * all chunks have been reviewed recently but are already due again will be
 * classified as `overdue_review` — the recency boost only applies when there
 * is genuinely new material left to learn.
 */
export function classifyRecommendation(
  hasRecentActivity: boolean,
  hasNewChunks: boolean,
  hasReviewedChunks: boolean
): RecommendationType {
  if (hasRecentActivity && hasNewChunks) return 'continue_learning';
  if (hasReviewedChunks) return 'overdue_review';
  return 'new_material';
}

/**
 * Aggregate due chunks into topic-level recommendations with urgency scores.
 * Pure function — no I/O.
 */
export function aggregateTopicRecommendations(input: TopicAggregationInput): TopicRecommendation[] {
  const { dueChunks, topicChunkCounts, limit, now, recencyWindowMs } = input;

  if (dueChunks.length === 0) return [];

  // Group due chunks by topicId
  const byTopic = new Map<string, { title: string; chunks: DueChunkInfo[] }>();
  for (const chunk of dueChunks) {
    let group = byTopic.get(chunk.topicId);
    if (!group) {
      group = { title: chunk.topicTitle, chunks: [] };
      byTopic.set(chunk.topicId, group);
    }
    group.chunks.push(chunk);
  }

  const nowMs = now.getTime();
  const msPerDay = 86_400_000;
  const recencyCutoff = nowMs - recencyWindowMs;

  const recommendations: TopicRecommendation[] = [];

  for (const [topicId, { title, chunks }] of byTopic) {
    // Compute per-topic aggregates
    let maxOverdueDays = 0;
    let minEaseFactor = Infinity;
    let hasNewChunks = false;
    let hasReviewedChunks = false;
    let hasRecentActivity = false;
    let totalMinutes = 0;

    for (const c of chunks) {
      const overdueDays = Math.max(0, (nowMs - c.nextReviewAt) / msPerDay);
      if (overdueDays > maxOverdueDays) maxOverdueDays = overdueDays;
      if (c.easeFactor < minEaseFactor) minEaseFactor = c.easeFactor;
      // Never reviewed = lastReviewedAt is null (no review recorded yet)
      if (c.lastReviewedAt == null) {
        hasNewChunks = true;
      } else {
        hasReviewedChunks = true;
      }
      if (c.lastReviewedAt != null && c.lastReviewedAt >= recencyCutoff) {
        hasRecentActivity = true;
      }
      totalMinutes += c.estimatedDuration;
    }

    const { score, reason } = calculateUrgencyScore({
      maxOverdueDays: Math.round(maxOverdueDays),
      dueCount: chunks.length,
      minEaseFactor,
    });

    const recommendationType = classifyRecommendation(
      hasRecentActivity,
      hasNewChunks,
      hasReviewedChunks
    );

    // Apply recency boost for continue_learning topics
    const boostedScore =
      recommendationType === 'continue_learning'
        ? Math.min(1, Math.round((score + RECENCY_BOOST) * 100) / 100)
        : score;

    // Order due chunk IDs by createdAt (topic creation order)
    const orderedChunks = [...chunks].sort((a, b) => a.createdAt - b.createdAt);

    recommendations.push({
      topicId,
      topicTitle: title,
      urgencyScore: boostedScore,
      urgencyReason: reason,
      recommendationType,
      dueChunkIds: orderedChunks.map(c => c.id),
      dueChunkCount: chunks.length,
      totalChunkCount: topicChunkCounts.get(topicId) ?? chunks.length,
      estimatedDuration: totalMinutes,
      hasNewChunks,
    });
  }

  // Sort by urgencyScore desc, then by topic title for stable ordering
  recommendations.sort((a, b) => {
    const scoreDiff = b.urgencyScore - a.urgencyScore;
    if (scoreDiff !== 0) return scoreDiff;
    return a.topicTitle.localeCompare(b.topicTitle);
  });

  return recommendations.slice(0, limit);
}
