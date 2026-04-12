import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { createAppContext } from '../../../src/composition-root.js';
import { registerServerTools } from '../../../src/server/tools.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { CaptureServer, parseToolResult } from '../../helpers/capture-server.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('Integration: what_to_learn_today', () => {
  beforeAll(setupTestDb);
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  async function seedDueChunks() {
    const db = getSql();
    const now = Date.now();
    const pastDay = now - 2 * 86_400_000;

    // Create two topics
    await db.insert(learningTopics).values([
      {
        id: 't1',
        title: 'Topic A',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 't2',
        title: 'Topic B',
        subject: 'Math',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Create due chunks (nextReviewAt in the past)
    await db.insert(learningChunks).values([
      {
        id: 'c1',
        topicId: 't1',
        title: 'Chunk 1',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: pastDay,
        easeFactor: 2.5,
        repetitions: 1,
        lastReviewedAt: pastDay - 86_400_000,
        estimatedDuration: 10,
        chunkType: 'review',
        contentStatus: 'final',
        content: 'Content 1',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: pastDay - 86_400_000 * 7,
        updatedAt: now,
      },
      {
        id: 'c2',
        topicId: 't1',
        title: 'Chunk 2',
        subject: 'CS',
        difficulty: 3,
        nextReviewAt: pastDay,
        easeFactor: 2.3,
        repetitions: 2,
        lastReviewedAt: pastDay - 86_400_000,
        estimatedDuration: 5,
        chunkType: 'review',
        contentStatus: 'final',
        content: 'Content 2',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: pastDay - 86_400_000 * 5,
        updatedAt: now,
      },
      {
        id: 'c3',
        topicId: 't2',
        title: 'Chunk 3',
        subject: 'Math',
        difficulty: 4,
        nextReviewAt: pastDay,
        easeFactor: 2.1,
        repetitions: 3,
        lastReviewedAt: pastDay - 86_400_000,
        estimatedDuration: 8,
        chunkType: 'review',
        contentStatus: 'final',
        content: 'Content 3',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: pastDay - 86_400_000 * 3,
        updatedAt: now,
      },
      // Draft chunk — should be excluded
      {
        id: 'c4',
        topicId: 't1',
        title: 'Draft Chunk',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: pastDay,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 10,
        chunkType: 'new',
        contentStatus: 'draft',
        content: null,
        contentVersion: null,
        contentUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  it('returns topic-level recommendations with seeded due chunks', async () => {
    await seedDueChunks();
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');

    const out = await tool!.handler({ context_token: 'ctx-test' });
    const result = parseToolResult(out);

    expect(result.data).toHaveProperty('recommendations');
    expect(result.data).toHaveProperty('total_due_topics');
    expect(result.data).toHaveProperty('total_due_chunks');
    expect(Array.isArray(result.data.recommendations)).toBe(true);
    expect(result.data.recommendations.length).toBeGreaterThanOrEqual(1);
    expect(result.data.total_due_topics).toBeGreaterThanOrEqual(1);
    expect(result.data.total_due_chunks).toBeGreaterThanOrEqual(2);

    // Verify topic-level fields
    const rec = result.data.recommendations[0];
    expect(rec).toHaveProperty('topic_id');
    expect(rec).toHaveProperty('topic_title');
    expect(rec).toHaveProperty('urgency_score');
    expect(rec).toHaveProperty('due_chunk_count');
    expect(rec).toHaveProperty('total_chunk_count');
    expect(rec).toHaveProperty('estimated_duration');

    // Draft chunks should be excluded from due counts
    const csRec = result.data.recommendations.find(
      (r: { topic_id: string }) => r.topic_id === 't1'
    );
    if (csRec) {
      expect(csRec.due_chunk_count).toBe(2); // c1, c2 (not c4 draft)
    }
  });

  it('filters by subject', async () => {
    await seedDueChunks();
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');

    const out = await tool!.handler({ subject_filter: 'Math', context_token: 'ctx-test' });
    const result = parseToolResult(out);

    expect(result.data.recommendations.length).toBe(1);
    expect(result.data.recommendations[0].topic_title).toBe('Topic B');
  });

  it('returns empty recommendations when no due chunks', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');

    const out = await tool!.handler({ context_token: 'ctx-test' });
    const result = parseToolResult(out);

    expect(result.data.recommendations).toEqual([]);
    expect(result.data.total_due_topics).toBe(0);
    expect(result.data.total_due_chunks).toBe(0);
  });

  it('respects limit parameter', async () => {
    await seedDueChunks();
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');

    const out = await tool!.handler({ limit: 1, context_token: 'ctx-test' });
    const result = parseToolResult(out);

    expect(result.data.recommendations.length).toBe(1);
    expect(result.data.total_due_topics).toBe(2); // total still counts all
  });
});
