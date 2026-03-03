import type {
  ChunkRepository,
  ListChunksFilter,
  ChunkContentResult,
  ChunkWithTopicTitle,
} from '../ports/chunk-repository.js';
import type { TopicRepository } from '../ports/topic-repository.js';
import type {
  LearningItem,
  PaginatedLearningItemsResponse,
} from '../domain/types/recommendations.js';
import { mapChunkRowToLearningItem } from '../shared/chunk-mapping.js';

export type QueryDeps = {
  chunks: ChunkRepository;
  topics: TopicRepository;
};

export async function listChunksAsLearningItems(
  filter: ListChunksFilter | undefined,
  deps: QueryDeps
): Promise<LearningItem[]> {
  const rows = await deps.chunks.list(filter);
  return rows.map(row => mapChunkRowToLearningItem(row) as LearningItem);
}

export async function listChunksWithContent(
  filter:
    | {
        subjectFilter?: string;
        dueOnly?: boolean;
        includeContent?: boolean;
        limit?: number;
        offset?: number;
      }
    | undefined,
  deps: QueryDeps
): Promise<PaginatedLearningItemsResponse> {
  return deps.chunks.listWithContent(filter);
}

export async function getChunkContent(
  id: string,
  deps: QueryDeps
): Promise<ChunkContentResult | null> {
  return deps.chunks.getContent(id);
}

export async function getChunkWithContent(
  id: string,
  deps: QueryDeps
): Promise<ChunkWithTopicTitle | null> {
  return deps.chunks.getWithContent(id);
}

export async function batchFetchChunksMinimal(
  options: { topicId?: string; subject?: string; dueOnly?: boolean; limit?: number } | undefined,
  deps: QueryDeps
): Promise<Awaited<ReturnType<ChunkRepository['batchFetchMinimal']>>> {
  return deps.chunks.batchFetchMinimal(options);
}

export async function batchFetchTopicsMinimal(
  options: { subject?: string; limit?: number } | undefined,
  deps: QueryDeps
): Promise<Awaited<ReturnType<TopicRepository['batchFetchMinimal']>>> {
  return deps.topics.batchFetchMinimal(options);
}

export async function getTopicSummary(
  topicId: string,
  deps: QueryDeps
): Promise<Awaited<ReturnType<TopicRepository['getSummaryById']>>> {
  return deps.topics.getSummaryById(topicId);
}
