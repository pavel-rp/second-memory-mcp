import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerNotesTools } from '../../../src/server/notes-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

describe('notes-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  // ── add_note ────────────────────────────────────────────────────

  describe('add_note', () => {
    it('registers add_note tool', () => {
      registerNotesTools(server as any, ctx);
      expect(server.tools.has('add_note')).toBe(true);
    });

    it('returns snake_case result on success', async () => {
      ctx.createNote = vi
        .fn()
        .mockResolvedValue({ id: 'note-1', createdAt: '2023-11-14T22:13:20.000Z' });
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('add_note')!.handler;

      const result = await handler({
        target_type: 'chunk',
        target_id: 'chunk-1',
        note_type: 'insight',
        content: 'User derived the proof independently',
        author: 'agent',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.id).toBe('note-1');
      expect(parsed.created_at).toBe('2023-11-14T22:13:20.000Z');
      expect(ctx.createNote).toHaveBeenCalledWith(
        expect.objectContaining({
          targetType: 'chunk',
          targetId: 'chunk-1',
          noteType: 'insight',
          content: 'User derived the proof independently',
          author: 'agent',
        })
      );
    });

    it('returns validation error for invalid target_type', async () => {
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('add_note')!.handler;

      const result = await handler({
        target_type: 'invalid',
        target_id: 'chunk-1',
        note_type: 'insight',
        content: 'content',
        author: 'agent',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
      expect(parsed.error.retryable).toBe(false);
    });

    it('returns validation error for invalid note_type', async () => {
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('add_note')!.handler;

      const result = await handler({
        target_type: 'chunk',
        target_id: 'chunk-1',
        note_type: 'bad_type',
        content: 'content',
        author: 'agent',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
    });

    it('returns validation error for invalid author', async () => {
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('add_note')!.handler;

      const result = await handler({
        target_type: 'chunk',
        target_id: 'chunk-1',
        note_type: 'insight',
        content: 'content',
        author: 'system',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
    });

    it('returns validation error for empty content', async () => {
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('add_note')!.handler;

      const result = await handler({
        target_type: 'chunk',
        target_id: 'chunk-1',
        note_type: 'insight',
        content: '',
        author: 'agent',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
    });

    it('returns database error when orchestration throws', async () => {
      ctx.createNote = vi.fn().mockRejectedValue(new Error('DB timeout'));
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('add_note')!.handler;

      const result = await handler({
        target_type: 'chunk',
        target_id: 'chunk-1',
        note_type: 'insight',
        content: 'content',
        author: 'agent',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
    });
  });

  // ── list_notes ──────────────────────────────────────────────────

  describe('list_notes', () => {
    it('registers list_notes tool', () => {
      registerNotesTools(server as any, ctx);
      expect(server.tools.has('list_notes')).toBe(true);
    });

    it('returns snake_case notes on success', async () => {
      ctx.listNotes = vi.fn().mockResolvedValue({
        notes: [
          {
            id: 'n1',
            noteType: 'insight',
            content: 'Note 1',
            author: 'agent',
            createdAt: '1970-01-01T00:00:01.000Z',
          },
        ],
      });
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('list_notes')!.handler;

      const result = await handler({
        target_type: 'chunk',
        target_id: 'chunk-1',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.notes).toHaveLength(1);
      expect(parsed.notes[0].note_type).toBe('insight');
      expect(parsed.notes[0].created_at).toBe('1970-01-01T00:00:01.000Z');
    });

    it('returns validation error for invalid target_type', async () => {
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('list_notes')!.handler;

      const result = await handler({ target_type: 'bad', target_id: 'chunk-1' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
    });

    it('returns validation error for empty target_id', async () => {
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('list_notes')!.handler;

      const result = await handler({ target_type: 'chunk', target_id: '' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
    });

    it('returns database error when orchestration throws', async () => {
      ctx.listNotes = vi.fn().mockRejectedValue(new Error('connection lost'));
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('list_notes')!.handler;

      const result = await handler({
        target_type: 'chunk',
        target_id: 'chunk-1',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
    });
  });

  // ── delete_note ─────────────────────────────────────────────────

  describe('delete_note', () => {
    it('registers delete_note tool', () => {
      registerNotesTools(server as any, ctx);
      expect(server.tools.has('delete_note')).toBe(true);
    });

    it('returns success result on deletion', async () => {
      ctx.deleteNote = vi.fn().mockResolvedValue({ success: true });
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('delete_note')!.handler;

      const result = await handler({ note_id: 'note-1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
    });

    it('returns false when note not found', async () => {
      ctx.deleteNote = vi.fn().mockResolvedValue({ success: false });
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('delete_note')!.handler;

      const result = await handler({ note_id: 'nonexistent', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
    });

    it('returns validation error for empty note_id', async () => {
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('delete_note')!.handler;

      const result = await handler({ note_id: '' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('validation');
    });

    it('returns database error when orchestration throws', async () => {
      ctx.deleteNote = vi.fn().mockRejectedValue(new Error('DB error'));
      registerNotesTools(server as any, ctx);
      const handler = server.tools.get('delete_note')!.handler;

      const result = await handler({ note_id: 'note-1', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.retryable).toBe(true);
    });
  });
});
