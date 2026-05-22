import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerRemediationTools } from '../../../src/server/remediation-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

describe('remediation-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  describe('recommend_remediation', () => {
    it('registers recommend_remediation tool', () => {
      registerRemediationTools(server as any, ctx);
      expect(server.tools.has('recommend_remediation')).toBe(true);
    });

    it('returns snake_case result on success', async () => {
      ctx.recommendRemediation = vi.fn().mockResolvedValue({
        success: true,
        data: {
          weakChunks: [
            {
              chunkId: 'c1',
              topicId: 'topic-1',
              easeFactor: 2.0,
              leech: false,
              reasonCode: 'WEAK_AFTER_ASSESSMENT',
            },
          ],
          prerequisiteChunksToRevisit: [],
          recommendedNextSession: {
            mode: 'review',
            topicId: 'topic-1',
            chunkIds: ['c1'],
            estimatedDurationMinutes: 15,
            reasonCode: 'WEAK_AFTER_ASSESSMENT',
          },
          srScheduleDelta: { chunksDemoted: 1, chunksRescheduledSooner: 1 },
          gapNotesWritten: [{ chunkId: 'c1', noteId: 'note-1' }],
        },
      });
      registerRemediationTools(server as any, ctx);
      const handler = server.tools.get('recommend_remediation')!.handler;

      const result = await handler({
        session_id: 'sess-1',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.weak_chunks).toHaveLength(1);
      expect(parsed.data.weak_chunks[0].chunk_id).toBe('c1');
      expect(parsed.data.weak_chunks[0].reason_code).toBe('WEAK_AFTER_ASSESSMENT');
      expect(parsed.data.recommended_next_session.mode).toBe('review');
      expect(parsed.data.sr_schedule_delta.chunks_demoted).toBe(1);
      expect(parsed.data.gap_notes_written[0].note_id).toBe('note-1');
    });

    it('returns error on service failure', async () => {
      ctx.recommendRemediation = vi.fn().mockResolvedValue({
        success: false,
        error: {
          type: 'not_found',
          message: 'Session not found: bad-id',
          retryable: false,
        },
      });
      registerRemediationTools(server as any, ctx);
      const handler = server.tools.get('recommend_remediation')!.handler;

      const result = await handler({
        session_id: 'bad-id',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('not_found');
    });

    it('returns validation error on invalid input', async () => {
      registerRemediationTools(server as any, ctx);
      const handler = server.tools.get('recommend_remediation')!.handler;

      const result = await handler({
        session_id: '',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('validation');
    });

    it('returns database error on unexpected throw', async () => {
      ctx.recommendRemediation = vi.fn().mockRejectedValue(new Error('DB connection lost'));
      registerRemediationTools(server as any, ctx);
      const handler = server.tools.get('recommend_remediation')!.handler;

      const result = await handler({
        session_id: 'sess-1',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error).toBeDefined();
    });
  });
});
