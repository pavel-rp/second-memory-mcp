import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import crypto from 'node:crypto';

import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { DrizzleChunkRepository } from '../../../src/adapters/drizzle/chunk-repository.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('chunk reorder (NEU-758)', () => {
  let ctx: AppContext;
  let chunkRepo: DrizzleChunkRepository;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
    chunkRepo = new DrizzleChunkRepository(getSql());
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  type SeedChunk = {
    id: string;
    orderIndex: number;
    prerequisites?: string[];
    easeFactor: number;
    repetitions: number;
    nextReviewAt: number;
    lastReviewedAt: number | null;
  };

  async function seedTopic(topicId: string, chunks: SeedChunk[]): Promise<void> {
    const db = getSql();
    const now = Date.now();
    await db
      .insert(learningTopics)
      .values({ id: topicId, title: 'Topic', subject: 'CS', createdAt: now, updatedAt: now });
    for (const c of chunks) {
      await db.insert(learningChunks).values({
        id: c.id,
        topicId,
        title: c.id,
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: c.nextReviewAt,
        easeFactor: c.easeFactor,
        repetitions: c.repetitions,
        lastReviewedAt: c.lastReviewedAt,
        estimatedDuration: 10,
        chunkType: 'new',
        prerequisitesJson: c.prerequisites ?? null,
        content: 'seed content',
        contentVersion: 1,
        contentUpdatedAt: now,
        orderIndex: c.orderIndex,
        // Stagger createdAt so any createdAt fallback would DISagree with the
        // requested reorder — proving order_index is what drives the result.
        createdAt: now + c.orderIndex,
        updatedAt: now,
      });
    }
  }

  it('persists a new order 1..N and leaves spaced-repetition state untouched', async () => {
    const topicId = crypto.randomUUID();
    await seedTopic(topicId, [
      {
        id: 'a',
        orderIndex: 1,
        easeFactor: 2.1,
        repetitions: 3,
        nextReviewAt: 111,
        lastReviewedAt: 100,
      },
      {
        id: 'b',
        orderIndex: 2,
        easeFactor: 1.8,
        repetitions: 5,
        nextReviewAt: 222,
        lastReviewedAt: 200,
      },
      {
        id: 'c',
        orderIndex: 3,
        easeFactor: 2.6,
        repetitions: 1,
        nextReviewAt: 333,
        lastReviewedAt: null,
      },
    ]);

    const before = {
      a: await chunkRepo.getById('a'),
      b: await chunkRepo.getById('b'),
      c: await chunkRepo.getById('c'),
    };

    const result = await ctx.reorderChunks(topicId, ['c', 'a', 'b']);
    expect(result.success).toBe(true);
    expect(result.count).toBe(3);

    const after = {
      a: await chunkRepo.getById('a'),
      b: await chunkRepo.getById('b'),
      c: await chunkRepo.getById('c'),
    };

    expect(after.c?.orderIndex).toBe(1);
    expect(after.a?.orderIndex).toBe(2);
    expect(after.b?.orderIndex).toBe(3);

    // SR state preserved for every chunk.
    for (const id of ['a', 'b', 'c'] as const) {
      expect(after[id]?.easeFactor).toBe(before[id]?.easeFactor);
      expect(after[id]?.repetitions).toBe(before[id]?.repetitions);
      expect(after[id]?.nextReviewAt).toBe(before[id]?.nextReviewAt);
      expect(after[id]?.lastReviewedAt).toBe(before[id]?.lastReviewedAt);
    }
  });

  it('rejects an incomplete set with content_quality and mutates no rows', async () => {
    const topicId = crypto.randomUUID();
    await seedTopic(topicId, [
      {
        id: 'a',
        orderIndex: 1,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: 1,
        lastReviewedAt: null,
      },
      {
        id: 'b',
        orderIndex: 2,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: 1,
        lastReviewedAt: null,
      },
      {
        id: 'c',
        orderIndex: 3,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: 1,
        lastReviewedAt: null,
      },
    ]);

    const result = await ctx.reorderChunks(topicId, ['a', 'b']); // missing 'c'
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    expect((result.error?.findings as unknown[]).length).toBeGreaterThan(0);

    // No rows mutated.
    expect((await chunkRepo.getById('a'))?.orderIndex).toBe(1);
    expect((await chunkRepo.getById('b'))?.orderIndex).toBe(2);
    expect((await chunkRepo.getById('c'))?.orderIndex).toBe(3);
  });

  it('rejects an order that places a chunk before its prerequisite and mutates no rows', async () => {
    const topicId = crypto.randomUUID();
    await seedTopic(topicId, [
      {
        id: 'a',
        orderIndex: 1,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: 1,
        lastReviewedAt: null,
      },
      {
        id: 'b',
        orderIndex: 2,
        prerequisites: ['a'],
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: 1,
        lastReviewedAt: null,
      },
    ]);

    const result = await ctx.reorderChunks(topicId, ['b', 'a']); // b before its prereq a
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    expect(
      (result.error?.findings as Array<{ rule: string }>).some(
        f => f.rule === 'order.prerequisite_violation'
      )
    ).toBe(true);

    expect((await chunkRepo.getById('a'))?.orderIndex).toBe(1);
    expect((await chunkRepo.getById('b'))?.orderIndex).toBe(2);
  });

  it('repository order helpers: getMaxOrderIndex, shiftOrderIndexesAtOrAbove, getPrerequisiteContext', async () => {
    const topicId = crypto.randomUUID();
    await seedTopic(topicId, [
      {
        id: 'a',
        orderIndex: 1,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: 1,
        lastReviewedAt: null,
      },
      {
        id: 'b',
        orderIndex: 2,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: 1,
        lastReviewedAt: null,
      },
      {
        id: 'c',
        orderIndex: 3,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: 1,
        lastReviewedAt: null,
      },
    ]);

    expect(await chunkRepo.getMaxOrderIndex(topicId)).toBe(3);
    expect(await chunkRepo.getMaxOrderIndex(crypto.randomUUID())).toBe(0);

    // Open a slot at position 2 — b and c shift up by one.
    const now = Date.now();
    const shifted = await chunkRepo.shiftOrderIndexesAtOrAbove(topicId, 2, now);
    expect(shifted).toBe(2);
    expect((await chunkRepo.getById('a'))?.orderIndex).toBe(1);
    expect((await chunkRepo.getById('b'))?.orderIndex).toBe(3);
    expect((await chunkRepo.getById('c'))?.orderIndex).toBe(4);

    // Prerequisite context: chunks earlier than order_index 3 are 'a' (order 1).
    const ctxRows = await chunkRepo.getPrerequisiteContext(topicId, 3);
    expect(ctxRows.map(r => r.id)).toEqual(['a']);
  });
});
