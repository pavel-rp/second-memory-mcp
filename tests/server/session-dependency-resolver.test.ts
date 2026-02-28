import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { resolveSessionChunkDependencies } from '../../src/server/session-dependency-resolver.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';
import { getSql } from '../../src/db/operations.js';
import { learningTopics, learningChunks } from '../../src/db/schema.js';

describe('session-dependency-resolver', () => {
  beforeAll(setupTestDb);
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  const now = Date.now();

  async function seedTopicAndChunks(chunks: Array<{ id: string; prerequisites?: string[] }>) {
    const db = getSql();
    await db.insert(learningTopics).values({
      id: 'topic-dep',
      title: 'Dep Test',
      subject: 'Test',
      createdAt: now,
      updatedAt: now,
    });
    for (const chunk of chunks) {
      await db.insert(learningChunks).values({
        id: chunk.id,
        topicId: 'topic-dep',
        title: `Chunk ${chunk.id}`,
        subject: 'Test',
        difficulty: 3,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        prerequisitesJson: chunk.prerequisites || null,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  it('returns empty arrays for empty input', async () => {
    const result = await resolveSessionChunkDependencies([]);
    expect(result.resolvedChunkIds).toEqual([]);
    expect(result.addedPrerequisites).toEqual([]);
    expect(result.message).toBe('');
  });

  it('returns original chunks when no prerequisites', async () => {
    await seedTopicAndChunks([{ id: 'a' }, { id: 'b' }]);
    const result = await resolveSessionChunkDependencies(['a', 'b']);
    expect(result.resolvedChunkIds).toContain('a');
    expect(result.resolvedChunkIds).toContain('b');
    expect(result.addedPrerequisites).toEqual([]);
  });

  it('automatically includes prerequisites', async () => {
    await seedTopicAndChunks([{ id: 'prereq' }, { id: 'main', prerequisites: ['prereq'] }]);
    const result = await resolveSessionChunkDependencies(['main']);
    expect(result.resolvedChunkIds).toContain('prereq');
    expect(result.resolvedChunkIds).toContain('main');
    expect(result.addedPrerequisites).toContain('prereq');
    expect(result.message).toContain('prerequisite');
  });

  it('returns original IDs when requested chunks are missing', async () => {
    const result = await resolveSessionChunkDependencies(['nonexistent']);
    expect(result.resolvedChunkIds).toEqual(['nonexistent']);
    expect(result.addedPrerequisites).toEqual([]);
  });

  it('handles missing prerequisite chunks gracefully', async () => {
    await seedTopicAndChunks([{ id: 'main', prerequisites: ['missing-prereq'] }]);
    const result = await resolveSessionChunkDependencies(['main']);
    // Should still return something valid
    expect(result.resolvedChunkIds).toBeDefined();
  });

  it('resolves transitive prerequisites', async () => {
    await seedTopicAndChunks([
      { id: 'base' },
      { id: 'mid', prerequisites: ['base'] },
      { id: 'top', prerequisites: ['mid'] },
    ]);
    const result = await resolveSessionChunkDependencies(['top']);
    expect(result.resolvedChunkIds).toContain('base');
    expect(result.resolvedChunkIds).toContain('mid');
    expect(result.resolvedChunkIds).toContain('top');
  });
});
