import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { registerSearchTools } from '../../../src/server/search-tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

import { CaptureServer, parseToolResult } from '../../helpers/capture-server.js';

describe('search_learning_content tool', () => {
  let server: CaptureServer;
  let tool: { spec: any; handler: Function };

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerSearchTools(server as any, createAppContext());
    tool = server.tools.get('search_learning_content')!;
    expect(tool).toBeDefined();
  });
  afterAll(teardownTestDb);

  it('returns matching results and metadata', async () => {
    const db = getSql();
    const now = Date.now();

    await db.insert(learningTopics).values({
      id: 'topic-segment-tree',
      title: 'Segment Tree Overview',
      subject: 'CS',
      summary: null,
      summaryVersion: null,
      summaryUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(learningChunks).values({
      id: 'chunk-segment-tree-build',
      topicId: 'topic-segment-tree',
      title: 'Segment Tree Build Routine',
      subject: 'CS',
      difficulty: 6,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: null,
      estimatedDuration: 20,
      chunkType: 'new',
      prerequisitesJson: [],
      tagsJson: ['data-structures'],
      content: 'Guide to building segment trees.',
      contentVersion: 1,
      contentUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const result = await tool.handler({
      query: 'segment tree',
      limit: 5,
    });

    const parsed = parseToolResult(result);
    expect(parsed.success).toBe(true);
    expect(parsed.results.length).toBeGreaterThan(0);
    expect(parsed.counts.total).toBeGreaterThan(0);
    expect(parsed.counts.total).toBe(parsed.results.length);
    expect(parsed.counts.topics + parsed.counts.chunks).toBe(parsed.results.length);
    expect(parsed.results[0].title.toLowerCase()).toContain('segment');
    expect(parsed.results.some((item: any) => item.resultType === 'chunk')).toBe(true);
  });

  it('handles no matches gracefully', async () => {
    const result = await tool.handler({
      query: 'nonexistent topic',
      limit: 3,
    });

    const parsed = parseToolResult(result);
    expect(parsed.success).toBe(true);
    expect(parsed.results.length).toBe(0);
    expect(parsed.message).toContain('No matching topics or chunks');
  });
});
