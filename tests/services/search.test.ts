import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { resetDatabase } from '../../src/db/client.js';
import { ensureSchema } from '../../src/db/migrate.js';
import { getSql } from '../../src/db/operations.js';
import { learningChunks, learningTopics } from '../../src/db/schema.js';
import { searchLearningContent } from '../../src/services/search.js';

function tmpDbPath() {
  return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

describe('searchLearningContent service', () => {
  let dbFile: string;

  beforeEach(async () => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
    await resetDatabase();
    ensureSchema();
  });

  afterEach(async () => {
    await resetDatabase();
    if (fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
    }
    if (fs.existsSync(`${dbFile}-shm`)) {
      fs.unlinkSync(`${dbFile}-shm`);
    }
    if (fs.existsSync(`${dbFile}-wal`)) {
      fs.unlinkSync(`${dbFile}-wal`);
    }
  });

  it('finds matching topics and chunks with relevance ordering', async () => {
    const db = getSql();
    const now = Date.now();

    db.insert(learningTopics)
      .values([
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
      ])
      .run();

    db.insert(learningChunks)
      .values([
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
          prerequisitesJson: JSON.stringify([]),
          tagsJson: JSON.stringify(['data-structures']),
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
          prerequisitesJson: JSON.stringify([]),
          tagsJson: JSON.stringify(['data-structures']),
          content: 'Optimize segment tree updates with lazy propagation.',
          contentVersion: 1,
          contentUpdatedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .run();

    const result = await searchLearningContent({ query: 'segment tree' });
    expect(result.query).toBe('segment tree');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.counts.total).toBe(result.results.length);
    expect(result.counts.topics + result.counts.chunks).toBe(result.results.length);

    // Ensure topic appears with high relevance
    const topicMatch = result.results.find(item => item.resultType === 'topic');
    expect(topicMatch).toBeDefined();
    expect(topicMatch?.title).toContain('Segment Tree');
    expect(topicMatch?.matchScore).toBeGreaterThan(0.5);
    expect(topicMatch?.highlightTerms).toContain('segment');

    // Ensure chunk results include topic metadata
    const chunkMatch = result.results.find(item => item.resultType === 'chunk');
    expect(chunkMatch).toBeDefined();
    expect(chunkMatch?.topicId).toBe('topic-segment-tree');
    expect(chunkMatch?.topicTitle).toBe('Segment Tree Basics');
  });

  it('applies subject filters and respects limits', async () => {
    const db = getSql();
    const now = Date.now();

    db.insert(learningTopics)
      .values([
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
      ])
      .run();

    const result = await searchLearningContent({
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
