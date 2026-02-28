import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningChunks, learningTopics } from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('searchLearningContent service', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext();
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  it('finds matching topics and chunks with relevance ordering', async () => {
    const db = getSql();
    const now = Date.now();

    await db.insert(learningTopics).values([
      {
        id: 'topic-segment-tree',
        title: 'Segment Tree Basics',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'topic-binary-tree',
        title: 'Binary Tree Traversals',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await db.insert(learningChunks).values([
      {
        id: 'chunk-build-segment-tree',
        topicId: 'topic-segment-tree',
        title: 'Building a Segment Tree',
        subject: 'CS',
        difficulty: 6,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 25,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: ['data-structures'],
        content: 'Learn how to construct segment trees efficiently.',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'chunk-lazy-propagation',
        topicId: 'topic-segment-tree',
        title: 'Lazy Propagation Techniques',
        subject: 'CS',
        difficulty: 7,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 30,
        chunkType: 'new',
        prerequisitesJson: [],
        tagsJson: ['data-structures'],
        content: 'Optimize segment tree updates with lazy propagation.',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await ctx.searchLearningContent({ query: 'segment tree' });
    expect(result.query).toBe('segment tree');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.counts.total).toBe(result.results.length);
    expect(result.counts.topics + result.counts.chunks).toBe(result.results.length);

    const topicMatch = result.results.find(item => item.resultType === 'topic');
    expect(topicMatch).toBeDefined();
    expect(topicMatch?.title).toContain('Segment Tree');
    expect(topicMatch?.matchScore).toBeGreaterThan(0.5);
    expect(topicMatch?.highlightTerms).toContain('segment');

    const chunkMatch = result.results.find(item => item.resultType === 'chunk');
    expect(chunkMatch).toBeDefined();
    expect(chunkMatch?.topicId).toBe('topic-segment-tree');
    expect(chunkMatch?.topicTitle).toBe('Segment Tree Basics');
  });

  it('applies subject filters and respects limits', async () => {
    const db = getSql();
    const now = Date.now();

    await db.insert(learningTopics).values([
      {
        id: 'topic-segment-tree',
        title: 'Segment Tree Applications',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'topic-economics',
        title: 'Segmentation in Economics',
        subject: 'Economics',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await ctx.searchLearningContent({
      query: 'segment',
      subject: 'CS',
      limit: 1,
    });

    expect(result.results.length).toBe(1);
    expect(result.filters.subject).toBe('CS');
    expect(result.results[0].subject).toBe('CS');
    expect(result.counts.topics).toBe(1);
    expect(result.counts.chunks).toBe(0);
    expect(result.limit).toBe(1);
  });
});
