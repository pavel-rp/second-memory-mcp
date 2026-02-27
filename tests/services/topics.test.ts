import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';
import {
  createTopic,
  getTopicById,
  listTopics,
  updateTopic,
  deleteTopic,
  batchFetchTopicsMinimal,
} from '../../src/services/topics.js';

describe('topics service', () => {
  beforeAll(async () => {
    await setupTestDb();
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

    await createTopic(topic);
    const fetched = await getTopicById('t1');
    expect(fetched?.id).toBe('t1');

    const list = await listTopics();
    expect(list.length).toBe(1);

    const changeResult = await updateTopic('t1', { title: 'Linear Algebra', updatedAt: now + 1 });
    expect(changeResult.success).toBe(true);

    const removeResult = await deleteTopic('t1');
    expect(removeResult.success).toBe(true);

    const empty = await listTopics();
    expect(empty.length).toBe(0);
  });

  it('updateTopic succeeds for no-op updates on existing topics', async () => {
    const now = Date.now();
    const setup = await createTopic({
      id: 't1',
      title: 'Algebra',
      subject: 'Math',
      createdAt: now,
      updatedAt: now,
    });
    expect(setup.success).toBe(true);

    // Update with the same values — should succeed regardless of whether
    // the DB reports 0 or 1 changes (behavior varies by engine)
    const result = await updateTopic('t1', { title: 'Algebra' });
    expect(result.success).toBe(true);
  });

  it('updateTopic returns not_found for non-existent topic', async () => {
    const result = await updateTopic('nonexistent', { title: 'New Title' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('not_found');
    }
  });

  it('updateTopic returns validation error for empty changes', async () => {
    const result = await updateTopic('t1', {});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('validation');
    }
  });

  it('deleteTopic returns not_found for non-existent topic', async () => {
    const result = await deleteTopic('nonexistent');
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
      await createTopic(topic);
    }

    // Test: fetch all topics
    const allTopics = await batchFetchTopicsMinimal();
    expect(allTopics.length).toBe(3);
    expect(allTopics[0]).toHaveProperty('id');
    expect(allTopics[0]).toHaveProperty('title');
    expect(allTopics[0]).toHaveProperty('subject');
    expect(allTopics[0]).toHaveProperty('createdAt');
    expect(allTopics[0]).toHaveProperty('updatedAt');
    // Ensure no heavy fields are included
    expect(allTopics[0]).not.toHaveProperty('summary');

    // Test: filter by subject
    const mathTopics = await batchFetchTopicsMinimal({ subject: 'Math' });
    expect(mathTopics.length).toBe(2);
    expect(mathTopics.every(t => t.subject === 'Math')).toBe(true);

    // Test: limit results
    const limitedTopics = await batchFetchTopicsMinimal({ limit: 2 });
    expect(limitedTopics.length).toBe(2);

    // Test: combined filter and limit
    const filteredLimited = await batchFetchTopicsMinimal({ subject: 'Math', limit: 1 });
    expect(filteredLimited.length).toBe(1);
    expect(filteredLimited[0].subject).toBe('Math');
  });
});
