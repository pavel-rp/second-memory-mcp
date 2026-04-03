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
      context_token: 'ctx-test',
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
        contentStatus: 'final',
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
      expect(parsed.chunk_id).toBe('c1');
      expect(parsed.topic_id).toBe('t1');
      expect(parsed.created_at).toBeDefined();
      expect(parsed.message).toContain('Arrays');
    });

    it('includes consistency_reminder in success response', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: { id: 'c1', topicId: 't1', createdAt: Date.now() },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeDefined();
      expect(parsed.consistency_reminder.topic_id).toBe('t1');
      expect(parsed.consistency_reminder.action).toBe('CONSISTENCY_CHECK');
      expect(parsed.consistency_reminder.instruction).toContain('new chunk was added');
      expect(parsed.consistency_reminder.checklist).toBeInstanceOf(Array);
      expect(parsed.consistency_reminder.checklist.length).toBe(5);
    });

    it('does not include consistency_reminder in error response', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'database', message: 'duplicate chunk' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeUndefined();
    });

    it('passes prerequisites and tags when provided', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: 'c2',
          topicId: 't1',
          title: 'Linked Lists',
          subject: 'CS',
          difficulty: 5,
          nextReviewAt: Date.now(),
          easeFactor: 2.5,
          repetitions: 0,
          lastReviewedAt: null,
          estimatedDuration: 10,
          intervalDays: null,
          chunkType: 'new',
          prerequisitesJson: ['c1'],
          tagsJson: ['data-structures'],
          content: null,
          contentVersion: null,
          contentUpdatedAt: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          topicTitle: 'DS',
        },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler({
        ...validInput,
        title: 'Linked Lists',
        prerequisites: ['c1'],
        tags: ['data-structures'],
        topic_title: 'DS',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      const call = (ctx.createChunkWithTopic as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.prerequisitesJson).toEqual(['c1']);
      expect(call.tagsJson).toEqual(['data-structures']);
      expect(call.topicTitle).toBe('DS');
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

    it('defaults contentStatus to final when not provided', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: { id: 'c1', topicId: 't1', createdAt: Date.now() },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      await handler(validInput);

      const call = (ctx.createChunkWithTopic as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.contentStatus).toBe('final');
    });

    it('passes explicit content_status draft through', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: { id: 'c1', topicId: 't1', createdAt: Date.now() },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      await handler({ ...validInput, content_status: 'draft' });

      const call = (ctx.createChunkWithTopic as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.contentStatus).toBe('draft');
    });

    it('throws ZodError for invalid content_status', async () => {
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      await expect(handler({ ...validInput, content_status: 'invalid' })).rejects.toThrow(
        'Content status must be one of: draft, final'
      );
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
        chunk: {
          id: 'c1',
          topicId: 't1',
          title: 'Arrays',
          contentVersion: 2,
          updatedAt: Date.now(),
        },
        progressReset: true,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_content')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        content:
          'Updated content for arrays that covers the fundamentals of contiguous memory allocation, constant-time element access by index, and the trade-offs between arrays and other data structures. Arrays are foundational to computer science and algorithm design.',
        condensed_summary: 'Updated arrays summary.',
        reset_progress: true,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.progress_reset).toBe(true);
      expect(parsed.chunk_id).toBe('c1');
      expect(parsed.content_version).toBe(2);
      expect(parsed.updated_at).toBeDefined();
    });

    it('uses fallback defaults when error object has no fields', async () => {
      ctx.updateChunkContent = vi.fn().mockResolvedValue({
        success: false,
        error: {},
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_content')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        content:
          'Updated content for arrays that covers the fundamentals of contiguous memory allocation, constant-time element access by index, and the trade-offs between arrays and other data structures. Arrays are foundational to computer science and algorithm design.',
        condensed_summary: 'Updated arrays summary.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
    });

    it('uses fallback defaults when error object is entirely absent', async () => {
      ctx.updateChunkContent = vi.fn().mockResolvedValue({
        success: false,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_content')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        content:
          'Updated content for arrays that covers the fundamentals of contiguous memory allocation, constant-time element access by index, and the trade-offs between arrays and other data structures. Arrays are foundational to computer science and algorithm design.',
        condensed_summary: 'Updated arrays summary.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
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
        content:
          'Updated content for arrays that covers the fundamentals of contiguous memory allocation, constant-time element access by index, and the trade-offs between arrays and other data structures. Arrays are foundational to computer science and algorithm design.',
        condensed_summary: 'Updated arrays summary.',
        context_token: 'ctx-test',
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
        content:
          'Updated content for arrays that covers the fundamentals of contiguous memory allocation, constant-time element access by index, and the trade-offs between arrays and other data structures. Arrays are foundational to computer science and algorithm design.',
        condensed_summary: 'Updated arrays summary.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('system');
      expect(parsed.error.retryable).toBe(true);
    });

    it('includes consistency_reminder in success response', async () => {
      ctx.updateChunkContent = vi.fn().mockResolvedValue({
        success: true,
        chunk: {
          id: 'c1',
          topicId: 't1',
          title: 'Arrays',
          contentVersion: 2,
          updatedAt: Date.now(),
        },
        progressReset: false,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_content')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        content:
          'Updated content for arrays that covers the fundamentals of contiguous memory allocation, constant-time element access by index, and the trade-offs between arrays and other data structures. Arrays are foundational to computer science and algorithm design.',
        condensed_summary: 'Updated arrays summary.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeDefined();
      expect(parsed.consistency_reminder.topic_id).toBe('t1');
      expect(parsed.consistency_reminder.action).toBe('CONSISTENCY_CHECK');
      expect(parsed.consistency_reminder.instruction).toContain('was just modified');
      expect(parsed.consistency_reminder.checklist).toBeInstanceOf(Array);
      expect(parsed.consistency_reminder.checklist.length).toBe(5);
    });

    it('does not include consistency_reminder in error response', async () => {
      ctx.updateChunkContent = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_content')!.handler;

      const result = await handler({
        chunk_id: 'c-missing',
        content:
          'Updated content for arrays that covers the fundamentals of contiguous memory allocation, constant-time element access by index, and the trade-offs between arrays and other data structures. Arrays are foundational to computer science and algorithm design.',
        condensed_summary: 'Updated arrays summary.',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeUndefined();
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
        chunk: { id: 'c1', topicId: 't1', title: 'Updated Arrays', updatedAt: Date.now() },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_metadata')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        title: 'Updated Arrays',
        difficulty: 7,
        estimated_duration: 20,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.chunk_id).toBe('c1');
      expect(parsed.updated_at).toBeDefined();
    });

    it('uses fallback defaults when error object has no fields', async () => {
      ctx.updateChunkMetadata = vi.fn().mockResolvedValue({
        success: false,
        error: {},
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_metadata')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
    });

    it('uses fallback defaults when error object is entirely absent', async () => {
      ctx.updateChunkMetadata = vi.fn().mockResolvedValue({
        success: false,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_metadata')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
    });

    it('returns toolError when ctx returns failure result', async () => {
      ctx.updateChunkMetadata = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_metadata')!.handler;

      const result = await handler({ chunk_id: 'c-missing', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.updateChunkMetadata = vi.fn().mockRejectedValue(new Error('deadlock'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_metadata')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('system');
      expect(parsed.error.retryable).toBe(true);
    });

    it('includes consistency_reminder in success response', async () => {
      ctx.updateChunkMetadata = vi.fn().mockResolvedValue({
        success: true,
        chunk: { id: 'c1', topicId: 't1', title: 'Arrays', updatedAt: Date.now() },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_metadata')!.handler;

      const result = await handler({ chunk_id: 'c1', difficulty: 7, context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeDefined();
      expect(parsed.consistency_reminder.topic_id).toBe('t1');
      expect(parsed.consistency_reminder.action).toBe('CONSISTENCY_CHECK');
      expect(parsed.consistency_reminder.checklist).toBeInstanceOf(Array);
      expect(parsed.consistency_reminder.checklist.length).toBe(5);
    });

    it('does not include consistency_reminder in error response', async () => {
      ctx.updateChunkMetadata = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_metadata')!.handler;

      const result = await handler({ chunk_id: 'c-missing', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeUndefined();
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
        chunk: {
          id: 'c1',
          topicId: 't1',
          title: 'Arrays',
          contentVersion: 2,
          updatedAt: Date.now(),
        },
        progressReset: true,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        content:
          'New content for arrays covering contiguous memory allocation, constant-time element access by index, and the important trade-offs between arrays and linked lists. Arrays remain the most fundamental data structure in modern computer science and algorithm design.',
        force_reset: true,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.progress_reset).toBe(true);
      expect(parsed.content_version).toBe(2);
      expect(parsed.updated_at).toBeDefined();
      expect(parsed.message).toContain('progress reset');
    });

    it('returns success without progress_reset', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: true,
        chunk: {
          id: 'c1',
          topicId: 't1',
          title: 'Arrays',
          contentVersion: 1,
          updatedAt: Date.now(),
        },
        progressReset: false,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        title: 'Arrays v2',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.progress_reset).toBe(false);
      expect(parsed.content_version).toBe(1);
      expect(parsed.updated_at).toBeDefined();
      expect(parsed.message).not.toContain('progress reset');
    });

    it('uses fallback defaults when error object has no fields', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: false,
        error: {},
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
    });

    it('uses fallback defaults when error object is entirely absent', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: false,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('Unknown error');
    });

    it('returns toolError when ctx returns failure result', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c-missing', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockRejectedValue(new Error('io error'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('system');
      expect(parsed.error.retryable).toBe(true);
    });

    it('includes consistency_reminder in success response', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: true,
        chunk: {
          id: 'c1',
          topicId: 't1',
          title: 'Arrays',
          contentVersion: 1,
          updatedAt: Date.now(),
        },
        progressReset: false,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({
        chunk_id: 'c1',
        title: 'Arrays v2',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeDefined();
      expect(parsed.consistency_reminder.topic_id).toBe('t1');
      expect(parsed.consistency_reminder.action).toBe('CONSISTENCY_CHECK');
      expect(parsed.consistency_reminder.checklist).toBeInstanceOf(Array);
      expect(parsed.consistency_reminder.checklist.length).toBe(5);
    });

    it('does not include consistency_reminder in error response', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c-missing', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeUndefined();
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
        chunk: { id: 'c1', topicId: 't1', title: 'Arrays' },
        removedDependencies: ['c2', 'c3'],
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.chunk_id).toBe('c1');
      expect(parsed.removed_dependency_count).toBe(2);
      expect(parsed.message).toContain('2 dependent chunks');
    });

    it('returns success with singular dependency message for exactly 1 removed', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: true,
        chunk: { id: 'c1', topicId: 't1', title: 'Arrays' },
        removedDependencies: ['c2'],
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.chunk_id).toBe('c1');
      expect(parsed.removed_dependency_count).toBe(1);
      expect(parsed.message).toContain('1 dependent chunk');
      expect(parsed.message).not.toContain('chunks.');
    });

    it('returns success without removed dependencies', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: true,
        chunk: { id: 'c1', topicId: 't1', title: 'Arrays' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.chunk_id).toBe('c1');
      expect(parsed.removed_dependency_count).toBe(0);
      expect(parsed.message).toContain('Arrays');
    });

    it('uses chunk_id in message when chunk title is not available', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: true,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c-orphan', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.chunk_id).toBe('c-orphan');
      expect(parsed.removed_dependency_count).toBe(0);
      expect(parsed.message).toContain('c-orphan');
    });

    it('uses fallback defaults when error object has no fields', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: false,
        error: {},
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
    });

    it('uses fallback defaults when error object is entirely absent', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: false,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
    });

    it('returns toolError when ctx returns failure result', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found', retryable: false },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c-missing', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.deleteChunk = vi.fn().mockRejectedValue(new Error('FK violation'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('system');
      expect(parsed.error.retryable).toBe(true);
    });

    it('includes consistency_reminder when chunk has topicId', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: true,
        chunk: { id: 'c1', topicId: 't1', title: 'Arrays' },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeDefined();
      expect(parsed.consistency_reminder.topic_id).toBe('t1');
      expect(parsed.consistency_reminder.action).toBe('CONSISTENCY_CHECK');
      expect(parsed.consistency_reminder.checklist).toBeInstanceOf(Array);
      expect(parsed.consistency_reminder.checklist.length).toBe(5);
    });

    it('does not include consistency_reminder when chunk is not available', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: true,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c-orphan', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeUndefined();
    });

    it('does not include consistency_reminder in error response', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'Chunk not found', retryable: false },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c-missing', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.consistency_reminder).toBeUndefined();
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
