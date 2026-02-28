import type { LearningChunkRow, LearningTopicRow } from '../../../src/infrastructure/db/schema.js';

let counter = 0;
function nextId(prefix = 'test'): string {
  counter++;
  return `${prefix}-${String(counter).padStart(4, '0')}`;
}

export function resetFactoryCounter(): void {
  counter = 0;
}

export function buildTopic(overrides?: Partial<LearningTopicRow>): LearningTopicRow {
  const now = Date.now();
  return {
    id: nextId('topic'),
    title: 'Test Topic',
    subject: 'CS',
    summary: null,
    summaryVersion: null,
    summaryUpdatedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function buildChunk(
  topicId: string,
  overrides?: Partial<LearningChunkRow>
): LearningChunkRow {
  const now = Date.now();
  return {
    id: nextId('chunk'),
    topicId,
    title: 'Test Chunk',
    subject: 'CS',
    difficulty: 3,
    nextReviewAt: now,
    easeFactor: 2.5,
    repetitions: 0,
    lastReviewedAt: null,
    estimatedDuration: 10,
    intervalDays: null,
    chunkType: 'new',
    prerequisitesJson: null,
    tagsJson: null,
    content: 'Test content',
    contentVersion: 1,
    contentUpdatedAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/** Create a topic with N chunks, all seeded in the provided repos. */
export function buildTopicWithChunks(
  chunkCount: number,
  topicOverrides?: Partial<LearningTopicRow>,
  chunkOverrides?: Partial<LearningChunkRow>
): { topic: LearningTopicRow; chunks: LearningChunkRow[] } {
  const topic = buildTopic(topicOverrides);
  const chunks = Array.from({ length: chunkCount }, (_, i) =>
    buildChunk(topic.id, {
      title: `Chunk ${i + 1}`,
      subject: topic.subject,
      ...chunkOverrides,
    })
  );
  return { topic, chunks };
}
