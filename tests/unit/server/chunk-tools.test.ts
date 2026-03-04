import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerChunkTools } from '../../../src/server/chunk-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

describe('chunk-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  it('registers all 5 chunk tools', () => {
    registerChunkTools(server as any, ctx);
    expect(server.tools.has('create_learning_item')).toBe(true);
    expect(server.tools.has('update_chunk_content')).toBe(true);
    expect(server.tools.has('update_chunk_metadata')).toBe(true);
    expect(server.tools.has('update_chunk')).toBe(true);
    expect(server.tools.has('delete_chunk')).toBe(true);
  });

  // ---------------------------------------------------------------
  // create_learning_item
  // ---------------------------------------------------------------
  describe('create_learning_item', () => {
    const validInput = {
      title: 'Arrays',
      content: 'Arrays are contiguous memory blocks used for storing elements.',
      subject: 'CS',
      difficulty: 5,
      estimated_duration: 10,
    };

    it('returns success with learning item', async () => {
      const mockChunkRow = {
        id: 'c1',
        topicId: 't1',
        title: 'Arrays',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: Date.now(),
        easeFactor: 2.5,
        repetitions: 0,
        lastReviewedAt: null,
        estimatedDuration: 10,
        intervalDays: null,
        chunkType: 'new',
        prerequisitesJson: null,
        tagsJson: null,
        content: null,
        contentVersion: null,
        contentUpdatedAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        topicTitle: 'Topic: CS - Arrays',
      };
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: mockChunkRow,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.item).toBeDefined();
      expect(parsed.message).toContain('Arrays');
    });

    it('returns toolError when ctx returns failure result', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'database', message: 'duplicate chunk' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('duplicate chunk');
    });

    it('returns database error when ctx throws', async () => {
      ctx.createChunkWithTopic = vi.fn().mockRejectedValue(new Error('pool exhausted'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
      expect(parsed.error.message).toContain('pool exhausted');
    });

    it('throws ZodError for missing required fields', async () => {
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      await expect(handler({})).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------------
  // update_chunk_content
  // ---------------------------------------------------------------
  describe('update_chunk_content', () => {
    it('returns success with progress_reset flag', async () => {
      ctx.updateChunkContent = vi.fn().mockResolvedValue({
        success: true,
        chunk: { id: 'c1', title: 'Arrays' },
        progressReset: true,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_content')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        content: 'Updated content for arrays that is long enough to pass validation.',
        reset_progress: true,
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.progress_reset).toBe(true);
      expect(parsed.chunk.id).toBe('c1');
    });

    it('returns toolError when ctx returns failure result', async () => {
      ctx.updateChunkContent = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_content')!.handler;

      const result = await handler({
        chunk_id: 'c-missing',
        content: 'Updated content for arrays that is long enough to pass validation.',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.updateChunkContent = vi.fn().mockRejectedValue(new Error('timeout'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_content')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        content: 'Updated content for arrays that is long enough to pass validation.',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('system');
      expect(parsed.error.retryable).toBe(true);
    });

    it('throws ZodError for missing chunk_id', async () => {
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_content')!.handler;

      await expect(handler({ content: 'x' })).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------------
  // update_chunk_metadata
  // ---------------------------------------------------------------
  describe('update_chunk_metadata', () => {
    it('returns success on update', async () => {
      ctx.updateChunkMetadata = vi.fn().mockResolvedValue({
        success: true,
        chunk: { id: 'c1', title: 'Updated Arrays' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_metadata')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        title: 'Updated Arrays',
        difficulty: 7,
        estimated_duration: 20,
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.chunk.title).toBe('Updated Arrays');
    });

    it('returns toolError when ctx returns failure result', async () => {
      ctx.updateChunkMetadata = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_metadata')!.handler;

      const result = await handler({ chunk_id: 'c-missing' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.updateChunkMetadata = vi.fn().mockRejectedValue(new Error('deadlock'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_metadata')!.handler;

      const result = await handler({ chunk_id: 'c1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('system');
      expect(parsed.error.retryable).toBe(true);
    });

    it('throws ZodError for missing chunk_id', async () => {
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_metadata')!.handler;

      await expect(handler({})).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------------
  // update_chunk
  // ---------------------------------------------------------------
  describe('update_chunk', () => {
    it('returns success with progress_reset', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: true,
        chunk: { id: 'c1', title: 'Arrays' },
        progressReset: true,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        content: 'New content for arrays that is long enough to pass validation check.',
        force_reset: true,
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.progress_reset).toBe(true);
      expect(parsed.message).toContain('progress reset');
    });

    it('returns success without progress_reset', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: true,
        chunk: { id: 'c1', title: 'Arrays' },
        progressReset: false,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', title: 'Arrays v2' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.progress_reset).toBe(false);
      expect(parsed.message).not.toContain('progress reset');
    });

    it('returns toolError when ctx returns failure result', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c-missing' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockRejectedValue(new Error('io error'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('system');
      expect(parsed.error.retryable).toBe(true);
    });

    it('throws ZodError for missing chunk_id', async () => {
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      await expect(handler({})).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------------
  // delete_chunk
  // ---------------------------------------------------------------
  describe('delete_chunk', () => {
    it('returns success with removed dependencies', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: true,
        chunk: { id: 'c1', title: 'Arrays' },
        removedDependencies: ['c2', 'c3'],
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.removed_dependencies).toEqual(['c2', 'c3']);
      expect(parsed.message).toContain('2 dependent chunks');
    });

    it('returns success without removed dependencies', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: true,
        chunk: { id: 'c1', title: 'Arrays' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.removed_dependencies).toEqual([]);
      expect(parsed.message).toContain('Arrays');
    });

    it('returns toolError when ctx returns failure result', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found', retryable: false },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c-missing' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.deleteChunk = vi.fn().mockRejectedValue(new Error('FK violation'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('system');
      expect(parsed.error.retryable).toBe(true);
    });

    it('throws ZodError for missing chunk_id', async () => {
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      await expect(handler({})).rejects.toThrow();
    });

    it('throws ZodError for empty chunk_id', async () => {
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      await expect(handler({ chunk_id: '' })).rejects.toThrow();
    });
  });
});
