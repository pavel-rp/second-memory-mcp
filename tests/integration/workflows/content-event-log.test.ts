import { describe, it, beforeAll, beforeEach, afterAll, afterEach, expect } from 'vitest';
import crypto from 'node:crypto';
import type pino from 'pino';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { DrizzleChunkRepository } from '../../../src/adapters/drizzle/chunk-repository.js';
import { DrizzleTopicRepository } from '../../../src/adapters/drizzle/topic-repository.js';
import { DrizzleUnitOfWorkAdapter } from '../../../src/adapters/drizzle/unit-of-work-adapter.js';
import {
  createTopicWithChunks,
  type TopicCreationInput,
  type TopicDeps,
} from '../../../src/orchestration/topic-workflows.js';
import {
  createChunkWithTopic,
  deleteChunk,
  updateChunkContent,
  type ChunkDeps,
} from '../../../src/orchestration/chunk-workflows.js';
import { setEventLogger } from '../../../src/shared/logger.js';

function topicDeps(): TopicDeps {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    linterRules: [],
  };
}

function chunkDeps(): ChunkDeps {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    maxDependencyDepth: 5,
  };
}

function makeTopicInput(chunkId: string): TopicCreationInput {
  return {
    topicTitle: 'NEU-362 Integration Topic',
    topicDescription: 'Topic for NEU-362 event-log integration',
    subject: 'CS',
    topicSummary: 'Summary for NEU-362 integration tests.',
    chunks: [
      {
        id: chunkId,
        title: 'Integration Chunk',
        content: 'Integration chunk content body.',
        difficulty: 3,
        estimatedDuration: 10,
        prerequisites: [],
        tags: [],
        chunkType: 'new',
      },
    ],
  };
}

describe('Content CRUD event logging (NEU-362)', () => {
  let captured: Array<Record<string, unknown>>;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
    captured = [];
    const fakeLogger = {
      info: (obj: Record<string, unknown>) => {
        captured.push(obj);
      },
    } as unknown as pino.Logger;
    setEventLogger(fakeLogger);
  });

  afterEach(() => {
    setEventLogger(null);
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  function eventsByName(name: string): Array<Record<string, unknown>> {
    return captured.filter(e => e.event === name);
  }

  it('emits topic_created with correct payload and module tag when creating a topic', async () => {
    const chunkId = crypto.randomUUID();
    const result = await createTopicWithChunks(makeTopicInput(chunkId), topicDeps());
    expect(result.success).toBe(true);

    const topicEvents = eventsByName('topic_created');
    expect(topicEvents).toHaveLength(1);
    const entry = topicEvents[0];
    expect(entry.module).toBe('mcp-event');
    expect(entry.operation).toBe('createTopic');
    const data = entry.data as { topicId: string; title: string; chunkCount: number };
    expect(data.title).toBe('NEU-362 Integration Topic');
    expect(data.chunkCount).toBe(1);
    expect(typeof data.topicId).toBe('string');
    expect(data.topicId).toBe(result.topic?.topicId);
  });

  it('emits chunk_created with correct payload when creating a chunk with an existing topic', async () => {
    // Create a topic first via the topic workflow (also emits topic_created — filtered out).
    const seedChunkId = crypto.randomUUID();
    const seed = await createTopicWithChunks(makeTopicInput(seedChunkId), topicDeps());
    expect(seed.success).toBe(true);
    const topicId = seed.topic!.topicId;

    const newChunkId = crypto.randomUUID();
    const now = Date.now();
    const create = await createChunkWithTopic(
      {
        id: newChunkId,
        topicId,
        title: 'Second Chunk',
        subject: 'CS',
        difficulty: 4,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 5,
        chunkType: 'new',
        content: 'Second chunk content.',
        createdAt: now,
        updatedAt: now,
      },
      chunkDeps()
    );
    expect(create.success).toBe(true);

    const chunkEvents = eventsByName('chunk_created');
    expect(chunkEvents).toHaveLength(1);
    const entry = chunkEvents[0];
    expect(entry.module).toBe('mcp-event');
    expect(entry.operation).toBe('createChunk');
    expect(entry.data).toEqual({
      chunkId: newChunkId,
      topicId,
      title: 'Second Chunk',
    });
  });

  it('emits chunk_updated with a fieldsChanged array when updating chunk content', async () => {
    const chunkId = crypto.randomUUID();
    const seed = await createTopicWithChunks(makeTopicInput(chunkId), topicDeps());
    expect(seed.success).toBe(true);

    const updated = await updateChunkContent(
      chunkId,
      { content: 'Brand new content body for the chunk after edit.' },
      chunkDeps()
    );
    expect(updated.success).toBe(true);

    const updateEvents = eventsByName('chunk_updated');
    expect(updateEvents).toHaveLength(1);
    const entry = updateEvents[0];
    expect(entry.module).toBe('mcp-event');
    expect(entry.operation).toBe('updateChunk');
    const data = entry.data as { chunkId: string; fieldsChanged: string[] };
    expect(data.chunkId).toBe(chunkId);
    expect(Array.isArray(data.fieldsChanged)).toBe(true);
    expect(data.fieldsChanged).toContain('content');
    // Plumbing fields must NOT appear in the payload
    for (const pf of ['updatedAt', 'contentVersion', 'contentUpdatedAt', 'contentStatus']) {
      expect(data.fieldsChanged).not.toContain(pf);
    }
  });

  it('emits chunk_deleted preserving topicId and title after deletion', async () => {
    const chunkId = crypto.randomUUID();
    const seed = await createTopicWithChunks(makeTopicInput(chunkId), topicDeps());
    expect(seed.success).toBe(true);
    const topicId = seed.topic!.topicId;

    const del = await deleteChunk(chunkId, chunkDeps());
    expect(del.success).toBe(true);

    const deletedEvents = eventsByName('chunk_deleted');
    expect(deletedEvents).toHaveLength(1);
    const entry = deletedEvents[0];
    expect(entry.module).toBe('mcp-event');
    expect(entry.operation).toBe('deleteChunk');
    expect(entry.data).toEqual({
      chunkId,
      topicId,
      title: 'Integration Chunk',
    });
  });
});
