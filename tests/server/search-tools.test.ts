import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { registerSearchTools } from '../../src/server/search-tools.js';
import { resetDatabase } from '../../src/db/client.js';
import { ensureSchema } from '../../src/db/migrate.js';
import { getSql } from '../../src/db/operations.js';
import { learningTopics, learningChunks } from '../../src/db/schema.js';

function tmpDbPath() {
  return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

class CaptureServer {
  public tools = new Map<string, { spec: any; handler: Function }>();
  registerTool(name: string, spec: any, handler: Function) {
    this.tools.set(name, { spec, handler });
  }
}

function parseToolResult(out: any): any {
  const text = out?.content?.[0]?.text;
  if (!text) {
    return out;
  }
  try {
    return JSON.parse(text);
  } catch {
    return out;
  }
}

describe('search_learning_content tool', () => {
  let server: CaptureServer;
  let tool: { spec: any; handler: Function };
  let dbFile: string;

  beforeEach(async () => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
    await resetDatabase();
    ensureSchema();

    server = new CaptureServer();
    registerSearchTools(server as any);
    tool = server.tools.get('search_learning_content')!;
    expect(tool).toBeDefined();
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

  it('returns matching results and metadata', async () => {
    const db = getSql();
    const now = Date.now();

    db.insert(learningTopics)
      .values({
        id: 'topic-segment-tree',
        title: 'Segment Tree Overview',
        subject: 'CS',
        summary: null,
        summaryVersion: null,
        summaryUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    db.insert(learningChunks)
      .values({
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
        prerequisitesJson: JSON.stringify([]),
        tagsJson: JSON.stringify(['data-structures']),
        content: 'Guide to building segment trees.',
        contentVersion: 1,
        contentUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .run();

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
