import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerPersistenceTools } from '../../src/server/persistence-tools.js';
import { resetDatabase } from '../../src/db/client.js';
import { ensureSchema } from '../../src/db/migrate.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function tmpDbPath() {
  return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

class CaptureServer {
  public tools = new Map<string, { spec: any; handler: Function }>();
  registerTool(name: string, spec: any, handler: Function) {
    this.tools.set(name, { spec, handler });
  }
}

function parseResult(out: any): any {
  return JSON.parse(out?.content?.[0]?.text);
}

describe('persistence-tools', () => {
  let server: CaptureServer;
  let dbFile: string;

  beforeEach(async () => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
    await resetDatabase();
    ensureSchema();

    server = new CaptureServer();
    registerPersistenceTools(server as any);
  });

  afterEach(async () => {
    await resetDatabase();
    for (const suffix of ['', '-shm', '-wal']) {
      const f = `${dbFile}${suffix}`;
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  });

  it('registers all persistence tools', () => {
    expect(server.tools.has('list_learning_items')).toBe(true);
    expect(server.tools.has('create_topic_with_chunks')).toBe(true);
    expect(server.tools.has('create_learning_item')).toBe(true);
    expect(server.tools.has('update_chunk_content')).toBe(true);
    expect(server.tools.has('update_chunk_metadata')).toBe(true);
    expect(server.tools.has('update_chunk')).toBe(true);
    expect(server.tools.has('delete_chunk')).toBe(true);
    expect(server.tools.has('update_topic')).toBe(true);
    expect(server.tools.has('update_topic_summary')).toBe(true);
    expect(server.tools.has('batch_fetch_topics_minimal')).toBe(true);
    expect(server.tools.has('batch_fetch_chunks_minimal')).toBe(true);
  });

  describe('list_learning_items', () => {
    it('returns empty list when no items exist', async () => {
      const handler = server.tools.get('list_learning_items')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(0);
    });
  });

  describe('create_learning_item', () => {
    it('creates a learning item successfully', async () => {
      const handler = server.tools.get('create_learning_item')!.handler;
      const result = await handler({
        title: 'Test Item',
        subject: 'Math',
        difficulty: 5,
        estimatedDuration: 15,
        content: 'Test content here',
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.item).toBeDefined();
      expect(parsed.item.title).toBe('Test Item');
    });
  });

  describe('create_topic_with_chunks', () => {
    it('creates a topic with chunks', async () => {
      const handler = server.tools.get('create_topic_with_chunks')!.handler;
      const result = await handler({
        topicTitle: 'Test Topic',
        topicDescription: 'A test topic',
        subject: 'Science',
        chunks: [
          {
            id: crypto.randomUUID(),
            title: 'Chunk 1',
            content: 'Content for chunk 1',
            difficulty: 3,
            estimatedDuration: 10,
            order: 1,
          },
        ],
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.topic).toBeDefined();
    });
  });

  describe('batch_fetch_topics_minimal', () => {
    it('returns empty array when no topics exist', async () => {
      const handler = server.tools.get('batch_fetch_topics_minimal')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.topics).toEqual([]);
    });
  });

  describe('batch_fetch_chunks_minimal', () => {
    it('returns empty array when no chunks exist', async () => {
      const handler = server.tools.get('batch_fetch_chunks_minimal')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.chunks).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('update_chunk_content returns toolError for nonexistent chunk', async () => {
      const handler = server.tools.get('update_chunk_content')!.handler;
      const result = await handler({
        chunkId: 'nonexistent',
        content: 'New content',
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });

    it('delete_chunk returns toolError for nonexistent chunk', async () => {
      const handler = server.tools.get('delete_chunk')!.handler;
      const result = await handler({ chunkId: 'nonexistent' });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });
  });
});
