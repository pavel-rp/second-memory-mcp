import type { LearningChunk } from '../domain/types/entities.js';
import type { LearningItem, LearningItemWithContent } from '../domain/types/recommendations.js';
import { toIsoTimestamp } from './date-helpers.js';

type ChunkListRowWithContent = LearningChunk & {
  contentEmbedding?: number[] | null;
  topicTitle?: string | null;
};

export function mapChunkRowToLearningItem(
  row: ChunkListRowWithContent,
  options?: { includeContent?: boolean }
): LearningItem | LearningItemWithContent {
  const rawChunkType = row.chunkType;
  const chunkType: LearningItem['chunkType'] =
    rawChunkType === 'review' || rawChunkType === 'remediation' ? rawChunkType : 'new';
  const topicTitle = row.topicTitle ?? null;

  const learningItem: LearningItem = {
    id: row.id,
    title: row.title,
    subject: row.subject,
    difficulty: row.difficulty,
    nextReviewDate: toIsoTimestamp(row.nextReviewAt),
    easeFactor: row.easeFactor,
    repetitions: row.repetitions,
    lastReviewed: row.lastReviewedAt ? toIsoTimestamp(row.lastReviewedAt) : undefined,
    estimatedDuration: row.estimatedDuration,
    chunkType,
    prerequisites: row.prerequisitesJson ?? [],
    tags: row.tagsJson ?? [],
    topicId: topicTitle !== null ? row.topicId : undefined,
    topicTitle: topicTitle ?? undefined,
    contentStatus: row.contentStatus,
  };

  if (options?.includeContent) {
    return {
      ...learningItem,
      content: row.content ?? undefined,
      contentVersion: row.contentVersion ?? undefined,
      contentUpdatedAt: row.contentUpdatedAt ?? undefined,
    } satisfies LearningItemWithContent;
  }

  return learningItem;
}
