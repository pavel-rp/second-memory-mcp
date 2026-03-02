import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { DrizzleTopicRepository } from '../../../src/adapters/drizzle/topic-repository.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('topics service', () => {
  let ctx: AppContext;
  let topicRepo: DrizzleTopicRepository;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
    topicRepo = new DrizzleTopicRepository(getSql());
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('creates, reads, lists, updates, and deletes a topic', async () => {
    const now = Date.now();
    const topic = {
      id: 't1',
      title: 'Algebra',
      subject: 'Math',
      createdAt: now,
      updatedAt: now,
    };

    await topicRepo.create(topic);
    const fetched = await topicRepo.getById('t1');
    expect(fetched?.id).toBe('t1');

    const list = await topicRepo.list();
    expect(list.length).toBe(1);

    const changeResult = await topicRepo.update('t1', {
      title: 'Linear Algebra',
      updatedAt: now + 1,
    });
    expect(changeResult.success).toBe(true);

    const removeResult = await topicRepo.delete('t1');
    expect(removeResult.success).toBe(true);

    const empty = await topicRepo.list();
    expect(empty.length).toBe(0);
  });

  it('updateTopic succeeds for no-op updates on existing topics', async () => {
    const now = Date.now();
    const setup = await topicRepo.create({
      id: 't1',
      title: 'Algebra',
      subject: 'Math',
      createdAt: now,
      updatedAt: now,
    });
    expect(setup.success).toBe(true);

    // Update with the same values — should succeed regardless of whether
    // the DB reports 0 or 1 changes (behavior varies by engine)
    const result = await topicRepo.update('t1', { title: 'Algebra' });
    expect(result.success).toBe(true);
  });

  it('updateTopic returns not_found for non-existent topic', async () => {
    const result = await topicRepo.update('nonexistent', { title: 'New Title' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('not_found');
    }
  });

  it('updateTopic returns validation error for empty changes', async () => {
    const result = await topicRepo.update('t1', {});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('validation');
    }
  });

  it('deleteTopic returns not_found for non-existent topic', async () => {
    const result = await topicRepo.delete('nonexistent');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('not_found');
    }
  });

  it('batch fetches topics with minimal metadata', async () => {
    const now = Date.now();
    const topics = [
      { id: 't1', title: 'Algebra', subject: 'Math', createdAt: now, updatedAt: now },
      { id: 't2', title: 'Calculus', subject: 'Math', createdAt: now + 1, updatedAt: now + 1 },
      { id: 't3', title: 'Physics', subject: 'Science', createdAt: now + 2, updatedAt: now + 2 },
    ];

    for (const topic of topics) {
      await topicRepo.create(topic);
    }

    // Test: fetch all topics
    const allTopics = await ctx.batchFetchTopicsMinimal();
    expect(allTopics.length).toBe(3);
    expect(allTopics[0]).toHaveProperty('id');
    expect(allTopics[0]).toHaveProperty('title');
    expect(allTopics[0]).toHaveProperty('subject');
    expect(allTopics[0]).toHaveProperty('createdAt');
    expect(allTopics[0]).toHaveProperty('updatedAt');
    // Ensure no heavy fields are included
    expect(allTopics[0]).not.toHaveProperty('summary');

    // Test: filter by subject
    const mathTopics = await ctx.batchFetchTopicsMinimal({ subject: 'Math' });
    expect(mathTopics.length).toBe(2);
    expect(mathTopics.every(t => t.subject === 'Math')).toBe(true);

    // Test: limit results
    const limitedTopics = await ctx.batchFetchTopicsMinimal({ limit: 2 });
    expect(limitedTopics.length).toBe(2);

    // Test: combined filter and limit
    const filteredLimited = await ctx.batchFetchTopicsMinimal({ subject: 'Math', limit: 1 });
    expect(filteredLimited.length).toBe(1);
    expect(filteredLimited[0].subject).toBe('Math');
  });
});
