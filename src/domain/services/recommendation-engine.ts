import { calculateUrgencyScore } from '../algorithms/urgency-calculator.js';
import type { TopicRecommendation } from '../types/recommendations.js';

/** A due chunk with the fields needed for topic-level aggregation. */
export type DueChunkInfo = {
  id: string;
  topicId: string;
  topicTitle: string;
  nextReviewAt: number;
  easeFactor: number;
  estimatedDuration: number;
  createdAt: number;
};

export type TopicAggregationInput = {
  dueChunks: DueChunkInfo[];
  topicChunkCounts: Map<string, number>;
  limit: number;
  now: Date;
};

/**
 * Aggregate due chunks into topic-level recommendations with urgency scores.
 * Pure function — no I/O.
 */
export function aggregateTopicRecommendations(input: TopicAggregationInput): TopicRecommendation[] {
  const { dueChunks, topicChunkCounts, limit, now } = input;

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

  const recommendations: TopicRecommendation[] = [];

  for (const [topicId, { title, chunks }] of byTopic) {
    // Compute per-topic aggregates
    let maxOverdueDays = 0;
    let minEaseFactor = Infinity;
    let hasNewChunks = false;
    let totalMinutes = 0;

    for (const c of chunks) {
      const overdueDays = Math.max(0, (nowMs - c.nextReviewAt) / msPerDay);
      if (overdueDays > maxOverdueDays) maxOverdueDays = overdueDays;
      if (c.easeFactor < minEaseFactor) minEaseFactor = c.easeFactor;
      // Never reviewed = nextReviewAt was set at creation, repetitions = 0
      // We detect "new" by checking if the chunk has never been reviewed:
      // nextReviewAt <= createdAt + 1s means it was never rescheduled
      if (c.nextReviewAt <= c.createdAt + 1000) hasNewChunks = true;
      totalMinutes += c.estimatedDuration;
    }

    const { score, reason } = calculateUrgencyScore({
      maxOverdueDays: Math.round(maxOverdueDays),
      dueCount: chunks.length,
      minEaseFactor,
    });

    // Order due chunk IDs by createdAt (topic creation order)
    const orderedChunks = [...chunks].sort((a, b) => a.createdAt - b.createdAt);

    recommendations.push({
      topicId,
      topicTitle: title,
      urgencyScore: score,
      urgencyReason: reason,
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
