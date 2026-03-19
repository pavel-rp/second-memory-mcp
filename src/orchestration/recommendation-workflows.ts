import type { ChunkRepository } from '../ports/chunk-repository.js';
import type {
  RecommendationInput,
  TopicRecommendationOutput,
} from '../domain/types/recommendations.js';
import {
  aggregateTopicRecommendations,
  type DueChunkInfo,
} from '../domain/services/recommendation-engine.js';

export type RecommendationDeps = {
  chunks: ChunkRepository;
};

const DEFAULT_TOPIC_LIMIT = 10;

/** Upper bound on due chunks fetched per recommendation call. */
const MAX_DUE_CHUNKS = 200;

export async function generateRecommendations(
  input: RecommendationInput,
  deps: RecommendationDeps,
  now: Date
): Promise<TopicRecommendationOutput> {
  // 1. Fetch due chunks (exclude drafts, exclude leeches, apply subject filter)
  const dueRows = await deps.chunks.list({
    dueOnly: true,
    isLeech: false,
    excludeDraft: true,
    subjectFilter: input.subjectFilter,
    limit: MAX_DUE_CHUNKS,
  });

  if (dueRows.length === 0) {
    return { recommendations: [], totalDueTopics: 0, totalDueChunks: 0 };
  }

  // 2. Map to DueChunkInfo
  const dueChunks: DueChunkInfo[] = dueRows
    .filter(r => r.topicId) // skip orphan chunks without a topic
    .map(r => ({
      id: r.id,
      topicId: r.topicId,
      topicTitle: r.topicTitle ?? r.title,
      nextReviewAt: r.nextReviewAt,
      easeFactor: r.easeFactor,
      estimatedDuration: r.estimatedDuration,
      createdAt: r.createdAt,
    }));

  if (dueChunks.length === 0) {
    return { recommendations: [], totalDueTopics: 0, totalDueChunks: 0 };
  }

  // 3. Fetch total chunk counts per topic (all non-draft chunks)
  const topicIdSet = new Set(dueChunks.map(c => c.topicId));
  const topicIds = [...topicIdSet];
  const topicChunkCounts = await deps.chunks.countByTopicIds(topicIds, { excludeDraft: true });

  // 4. Count totals before limiting
  const totalDueTopics = topicIdSet.size;
  const totalDueChunks = dueChunks.length;

  // 5. Aggregate into topic-level recommendations
  const limit = input.limit ?? DEFAULT_TOPIC_LIMIT;
  const recommendations = aggregateTopicRecommendations({
    dueChunks,
    topicChunkCounts,
    limit,
    now,
  });

  return {
    recommendations,
    totalDueTopics,
    totalDueChunks,
  };
}
