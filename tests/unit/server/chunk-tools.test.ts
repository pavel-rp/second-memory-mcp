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

  it('registers all 6 chunk tools', () => {
    registerChunkTools(server as any, ctx);
    expect(server.tools.has('create_learning_item')).toBe(true);
    expect(server.tools.has('update_chunk_content')).toBe(true);
    expect(server.tools.has('update_chunk_metadata')).toBe(true);
    expect(server.tools.has('update_chunk')).toBe(true);
    expect(server.tools.has('delete_chunk')).toBe(true);
    expect(server.tools.has('reorder_chunks')).toBe(true);
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
        condensedSummary: null,
        knowledgeType: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        topicTitle: 'Topic: CS - Arrays',
      };
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: { chunk: mockChunkRow },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.chunk_id).toBe('c1');
      expect(parsed.data.topic_id).toBe('t1');
      expect(parsed.data.created_at).toBeDefined();
      expect(parsed.data.message).toContain('Arrays');
    });

    it('forwards the order preference and returns the resolved order (NEU-758)', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: { chunk: { id: 'c1', topicId: 't1', createdAt: Date.now(), orderIndex: 2 } },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler({ ...validInput, order: 2 });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.order).toBe(2);
      expect((ctx.createChunkWithTopic as any).mock.calls[0][0].order).toBe(2);
    });

    it('includes consistency_reminder in success response', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: { chunk: { id: 'c1', topicId: 't1', createdAt: Date.now() } },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.consistency_reminder).toBeDefined();
      expect(parsed.data.consistency_reminder.topic_id).toBe('t1');
      expect(parsed.data.consistency_reminder.action).toBe('CONSISTENCY_CHECK');
      expect(parsed.data.consistency_reminder.instruction).toContain('new chunk was added');
      expect(parsed.data.consistency_reminder.checklist).toBeInstanceOf(Array);
      expect(parsed.data.consistency_reminder.checklist.length).toBe(5);
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

      expect(parsed.status).toBe('error');
      expect(parsed.error).toBeDefined();
    });

    it('surfaces snake-cased findings on content_quality error (NEU-686)', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: false,
        error: {
          type: 'content_quality',
          message: 'Tier 1 rejected the chunk',
          // NEU-752: orchestration marks content_quality rejections retryable.
          retryable: true,
          findings: [
            {
              chunkId: 'c1',
              rule: 'tier1a.code-fence-balance',
              severity: 'blocking',
              category: 'tier1a',
              detail: 'unbalanced fences',
            },
          ],
        },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('content_quality');
      expect(parsed.error.findings[0].chunk_id).toBe('c1');
      expect(parsed.error.findings[0].rule).toBe('tier1a.code-fence-balance');
    });

    it('surfaces tier2_findings on success (NEU-686)', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: {
          chunk: { id: 'c1', topicId: 't1', createdAt: Date.now() },
          tier2Findings: [
            {
              chunkId: 'c1',
              rule: 'classifier.overall_fit',
              severity: 'warning',
              category: 'tier2',
              detail: 'borderline',
            },
          ],
        },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.tier2_findings).toBeInstanceOf(Array);
      expect(parsed.data.tier2_findings[0].rule).toBe('classifier.overall_fit');
    });

    it('content_quality error with no findings key — empty array fallback (NEU-686)', async () => {
      // Exercises the `result.error.findings ?? []` fallback in chunk-tools.
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: false,
        error: {
          type: 'content_quality',
          message: 'Tier 1 rejected',
          // NEU-752: orchestration marks content_quality rejections retryable.
          retryable: true,
          // findings intentionally omitted
        },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.error.findings).toEqual([]);
    });

    it('passes prerequisites and tags when provided', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: {
          chunk: {
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

      expect(parsed.status).toBe('ok');
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.message).toBe('duplicate chunk');
    });

    it('returns database error when ctx throws', async () => {
      ctx.createChunkWithTopic = vi.fn().mockRejectedValue(new Error('pool exhausted'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.retryable).toBe(true);
      expect(parsed.error.message).toContain('pool exhausted');
    });

    it('defaults contentStatus to final when not provided', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: { chunk: { id: 'c1', topicId: 't1', createdAt: Date.now() } },
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
        data: { chunk: { id: 'c1', topicId: 't1', createdAt: Date.now() } },
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

    it('passes knowledge_type through to ctx', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: { chunk: { id: 'c1', topicId: 't1', createdAt: Date.now() } },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      await handler({ ...validInput, knowledge_type: 'fact' });

      const call = (ctx.createChunkWithTopic as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.knowledgeType).toBe('fact');
    });

    it('defaults knowledgeType to null when not provided', async () => {
      ctx.createChunkWithTopic = vi.fn().mockResolvedValue({
        success: true,
        data: { chunk: { id: 'c1', topicId: 't1', createdAt: Date.now() } },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      await handler(validInput);

      const call = (ctx.createChunkWithTopic as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.knowledgeType).toBeNull();
    });

    it('throws ZodError for invalid knowledge_type', async () => {
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('create_learning_item')!.handler;

      await expect(handler({ ...validInput, knowledge_type: 'banana' })).rejects.toThrow(
        'Knowledge type must be one of: fact, concept, procedure, principle'
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

      expect(parsed.status).toBe('ok');
      expect(parsed.data.progress_reset).toBe(true);
      expect(parsed.data.chunk_id).toBe('c1');
      expect(parsed.data.content_version).toBe(2);
      expect(parsed.data.updated_at).toBeDefined();
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('not_found');
    });

    it('content_quality error with no findings key — empty array fallback (NEU-686)', async () => {
      ctx.updateChunkContent = vi.fn().mockResolvedValue({
        success: false,
        error: {
          type: 'content_quality',
          message: 'Tier 2 rejected the update',
          // NEU-752: orchestration marks content_quality rejections retryable.
          retryable: true,
          // findings intentionally omitted
        },
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

      expect(parsed.error.findings).toEqual([]);
    });

    it('surfaces snake-cased findings on content_quality error (NEU-686)', async () => {
      ctx.updateChunkContent = vi.fn().mockResolvedValue({
        success: false,
        error: {
          type: 'content_quality',
          message: 'Tier 2 rejected the update',
          // NEU-752: orchestration marks content_quality rejections retryable.
          retryable: true,
          findings: [
            {
              chunkId: 'c1',
              rule: 'classifier.rendering_clarity',
              severity: 'blocking',
              category: 'tier2',
              detail: 'low score',
            },
          ],
        },
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('content_quality');
      expect(parsed.error.findings).toBeInstanceOf(Array);
      expect(parsed.error.findings[0].chunk_id).toBe('c1');
      expect(parsed.error.findings[0].rule).toBe('classifier.rendering_clarity');
    });

    it('does not include findings on non-content_quality errors (NEU-686)', async () => {
      ctx.updateChunkContent = vi.fn().mockResolvedValue({
        success: false,
        error: {
          type: 'database',
          message: 'rollback failed',
          retryable: true,
          // Even if findings were attached, they should NOT surface on non-content-quality errors.
          findings: [
            { chunkId: 'c1', rule: 'x', severity: 'warning', category: 'tier2', detail: 'x' },
          ],
        },
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

      expect(parsed.status).toBe('error');
      // `toolError`'s ERROR_TYPE_MAP normalizes `'database'` → `'internal'`;
      // the gate is on the original `errorType` value, not the normalized one.
      expect(parsed.error.findings).toBeUndefined();
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
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

      expect(parsed.status).toBe('ok');
      expect(parsed.data.consistency_reminder).toBeDefined();
      expect(parsed.data.consistency_reminder.topic_id).toBe('t1');
      expect(parsed.data.consistency_reminder.action).toBe('CONSISTENCY_CHECK');
      expect(parsed.data.consistency_reminder.instruction).toContain('was just modified');
      expect(parsed.data.consistency_reminder.checklist).toBeInstanceOf(Array);
      expect(parsed.data.consistency_reminder.checklist.length).toBe(5);
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

      expect(parsed.status).toBe('error');
    });

    it('throws ZodError for missing chunk_id', async () => {
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_content')!.handler;

      await expect(handler({ content: 'x' })).rejects.toThrow();
    });

    it('throws ZodError for content shorter than minimum length', async () => {
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_content')!.handler;

      await expect(
        handler({
          chunk_id: 'c1',
          content: 'Too short',
          condensed_summary: 'Summary.',
          context_token: 'ctx-test',
        })
      ).rejects.toThrow('Chunk content must be at least');
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

      expect(parsed.status).toBe('ok');
      expect(parsed.data.chunk_id).toBe('c1');
      expect(parsed.data.updated_at).toBeDefined();
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.updateChunkMetadata = vi.fn().mockRejectedValue(new Error('deadlock'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk_metadata')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
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

      expect(parsed.status).toBe('ok');
      expect(parsed.data.consistency_reminder).toBeDefined();
      expect(parsed.data.consistency_reminder.topic_id).toBe('t1');
      expect(parsed.data.consistency_reminder.action).toBe('CONSISTENCY_CHECK');
      expect(parsed.data.consistency_reminder.checklist).toBeInstanceOf(Array);
      expect(parsed.data.consistency_reminder.checklist.length).toBe(5);
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

      expect(parsed.status).toBe('error');
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

      expect(parsed.status).toBe('ok');
      expect(parsed.data.progress_reset).toBe(true);
      expect(parsed.data.content_version).toBe(2);
      expect(parsed.data.updated_at).toBeDefined();
      expect(parsed.data.message).toContain('progress reset');
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

      expect(parsed.status).toBe('ok');
      expect(parsed.data.progress_reset).toBe(false);
      expect(parsed.data.content_version).toBe(1);
      expect(parsed.data.updated_at).toBeDefined();
      expect(parsed.data.message).not.toContain('progress reset');
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.message).toBe('Unknown error');
    });

    it('content_quality error with no findings key — empty array fallback (NEU-686)', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: false,
        error: {
          type: 'content_quality',
          message: 'Tier 2 rejected the update',
          // NEU-752: orchestration marks content_quality rejections retryable.
          retryable: true,
          // findings intentionally omitted
        },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.error.findings).toEqual([]);
    });

    it('surfaces snake-cased findings on content_quality error (NEU-686)', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: false,
        error: {
          type: 'content_quality',
          message: 'Tier 2 rejected the update',
          // NEU-752: orchestration marks content_quality rejections retryable.
          retryable: true,
          findings: [
            {
              chunkId: 'c1',
              rule: 'classifier.overall_fit',
              severity: 'blocking',
              category: 'tier2',
              detail: 'low score',
            },
          ],
        },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('content_quality');
      expect(parsed.error.findings[0].chunk_id).toBe('c1');
      expect(parsed.error.findings[0].rule).toBe('classifier.overall_fit');
    });

    it('does not include findings on non-content_quality errors (NEU-686)', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'database', message: 'rollback failed', retryable: true },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.error.findings).toBeUndefined();
    });

    it('surfaces tier2_findings array (empty) on success (NEU-686)', async () => {
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

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.tier2_findings).toEqual([]);
    });

    it('uses fallback defaults when error object is entirely absent', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockResolvedValue({
        success: false,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.updateChunkWithProgressReset = vi.fn().mockRejectedValue(new Error('io error'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('update_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
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

      expect(parsed.status).toBe('ok');
      expect(parsed.data.consistency_reminder).toBeDefined();
      expect(parsed.data.consistency_reminder.topic_id).toBe('t1');
      expect(parsed.data.consistency_reminder.action).toBe('CONSISTENCY_CHECK');
      expect(parsed.data.consistency_reminder.checklist).toBeInstanceOf(Array);
      expect(parsed.data.consistency_reminder.checklist.length).toBe(5);
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

      expect(parsed.status).toBe('error');
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

      expect(parsed.status).toBe('ok');
      expect(parsed.data.chunk_id).toBe('c1');
      expect(parsed.data.removed_dependency_count).toBe(2);
      expect(parsed.data.message).toContain('2 dependent chunks');
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

      expect(parsed.status).toBe('ok');
      expect(parsed.data.chunk_id).toBe('c1');
      expect(parsed.data.removed_dependency_count).toBe(1);
      expect(parsed.data.message).toContain('1 dependent chunk');
      expect(parsed.data.message).not.toContain('chunks.');
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

      expect(parsed.status).toBe('ok');
      expect(parsed.data.chunk_id).toBe('c1');
      expect(parsed.data.removed_dependency_count).toBe(0);
      expect(parsed.data.message).toContain('Arrays');
    });

    it('uses chunk_id in message when chunk title is not available', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: true,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c-orphan', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.chunk_id).toBe('c-orphan');
      expect(parsed.data.removed_dependency_count).toBe(0);
      expect(parsed.data.message).toContain('c-orphan');
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
    });

    it('uses fallback defaults when error object is entirely absent', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: false,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
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

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns system error when ctx throws', async () => {
      ctx.deleteChunk = vi.fn().mockRejectedValue(new Error('FK violation'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
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

      expect(parsed.status).toBe('ok');
      expect(parsed.data.consistency_reminder).toBeDefined();
      expect(parsed.data.consistency_reminder.topic_id).toBe('t1');
      expect(parsed.data.consistency_reminder.action).toBe('CONSISTENCY_CHECK');
      expect(parsed.data.consistency_reminder.checklist).toBeInstanceOf(Array);
      expect(parsed.data.consistency_reminder.checklist.length).toBe(5);
    });

    it('does not include consistency_reminder when chunk is not available', async () => {
      ctx.deleteChunk = vi.fn().mockResolvedValue({
        success: true,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('delete_chunk')!.handler;

      const result = await handler({ chunk_id: 'c-orphan', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.consistency_reminder).toBeUndefined();
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

      expect(parsed.status).toBe('error');
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

  // ---------------------------------------------------------------
  // reorder_chunks (NEU-758)
  // ---------------------------------------------------------------
  describe('reorder_chunks', () => {
    const validInput = {
      topic_id: 'topic-1',
      ordered_chunk_ids: ['c', 'a', 'b'],
      context_token: 'ctx-test',
    };

    it('returns success with the persisted order and forwards args', async () => {
      ctx.reorderChunks = vi.fn().mockResolvedValue({
        success: true,
        topicId: 'topic-1',
        orderedChunkIds: ['c', 'a', 'b'],
        count: 3,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('reorder_chunks')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.topic_id).toBe('topic-1');
      expect(parsed.data.ordered_chunk_ids).toEqual(['c', 'a', 'b']);
      expect(parsed.data.count).toBe(3);
      expect(parsed.data.consistency_reminder).toBeDefined();
      expect((ctx.reorderChunks as any).mock.calls[0]).toEqual(['topic-1', ['c', 'a', 'b']]);
    });

    it('surfaces snake-cased findings on content_quality rejection', async () => {
      ctx.reorderChunks = vi.fn().mockResolvedValue({
        success: false,
        error: {
          type: 'content_quality',
          message: 'invalid order',
          retryable: true,
          findings: [
            {
              chunkId: 'b',
              rule: 'order.prerequisite_violation',
              severity: 'blocking',
              category: 'order',
              detail: 'b before a',
            },
          ],
        },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('reorder_chunks')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('content_quality');
      expect(parsed.error.findings[0].chunk_id).toBe('b');
      expect(parsed.error.findings[0].rule).toBe('order.prerequisite_violation');
    });

    it('maps a not_found error without a findings key', async () => {
      ctx.reorderChunks = vi.fn().mockResolvedValue({
        success: false,
        error: { type: 'not_found', message: 'no chunks', retryable: false },
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('reorder_chunks')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('not_found');
      expect(parsed.error.findings).toBeUndefined();
    });

    it('uses singular wording when a single chunk is reordered', async () => {
      ctx.reorderChunks = vi.fn().mockResolvedValue({
        success: true,
        topicId: 'topic-1',
        orderedChunkIds: ['only'],
        count: 1,
      });
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('reorder_chunks')!.handler;

      const result = await handler({ ...validInput, ordered_chunk_ids: ['only'] });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.message).toContain('1 chunk in');
    });

    it('returns a system error when the workflow throws', async () => {
      ctx.reorderChunks = vi.fn().mockRejectedValue(new Error('boom'));
      registerChunkTools(server as any, ctx);
      const handler = server.tools.get('reorder_chunks')!.handler;

      const result = await handler(validInput);
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.message).toContain('boom');
    });
  });
});
