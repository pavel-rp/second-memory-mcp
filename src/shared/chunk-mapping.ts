import type { LearningChunk } from '../domain/types/entities.js';
import type { LearningItem, LearningItemWithContent } from '../domain/types/recommendations.js';

type ChunkListRowWithContent = LearningChunk & {
  contentEmbedding?: number[] | null;
  topicTitle?: string | null;
  content?: string | null;
  contentVersion?: number | null;
  contentUpdatedAt?: number | null;
};

function toIsoDate(epochMs: number): string {
  const d = new Date(epochMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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
    nextReviewDate: toIsoDate(row.nextReviewAt),
    easeFactor: row.easeFactor,
    repetitions: row.repetitions,
    lastReviewed: row.lastReviewedAt ? toIsoDate(row.lastReviewedAt) : undefined,
    estimatedDuration: row.estimatedDuration,
    chunkType,
    prerequisites: row.prerequisitesJson ?? [],
    tags: row.tagsJson ?? [],
    topicId: topicTitle !== null ? row.topicId : undefined,
    topicTitle: topicTitle ?? undefined,
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
