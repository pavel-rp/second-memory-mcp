import type { AlgorithmConfig } from '../domain/config/algorithm.js';
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
  algorithmConfig: AlgorithmConfig;
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
  const dueChunks: DueChunkInfo[] = dueRows.map(r => ({
    id: r.id,
    topicId: r.topicId,
    topicTitle: r.topicTitle ?? r.title,
    nextReviewAt: r.nextReviewAt,
    easeFactor: r.easeFactor,
    estimatedDuration: r.estimatedDuration,
    createdAt: r.createdAt,
    lastReviewedAt: r.lastReviewedAt,
  }));

  // 3. Fetch total chunk counts per topic (all non-draft chunks)
  const topicIdSet = new Set(dueChunks.map(c => c.topicId));
  const topicIds = [...topicIdSet];
  const topicChunkCounts = await deps.chunks.countByTopicIds(topicIds, { excludeDraft: true });

  // 4. Count totals before limiting
  const totalDueTopics = topicIdSet.size;
  const totalDueChunks = dueChunks.length;

  // 5. Aggregate into topic-level recommendations
  const requestedLimit = input.limit ?? DEFAULT_TOPIC_LIMIT;
  const { recencyWindowMs } = deps.algorithmConfig.recommendationConfig;
  // When filtering by type, aggregate all topics so the filter can pick from the full ranked list
  const aggregationLimit = input.recommendationType ? topicIdSet.size : requestedLimit;
  const allRecommendations = aggregateTopicRecommendations({
    dueChunks,
    topicChunkCounts,
    limit: aggregationLimit,
    now,
    recencyWindowMs,
  });

  // 6. Apply recommendation_type filter (post-scoring), then limit
  const filtered = input.recommendationType
    ? allRecommendations.filter(r => r.recommendationType === input.recommendationType)
    : allRecommendations;
  const recommendations = filtered.slice(0, requestedLimit);

  return {
    recommendations,
    totalDueTopics,
    totalDueChunks,
  };
}
