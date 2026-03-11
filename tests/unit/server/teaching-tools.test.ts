import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerTeachingTools } from '../../../src/server/teaching-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

describe('teaching-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
  });

  it('registers teach_next tool', () => {
    registerTeachingTools(server as any, ctx);
    expect(server.tools.has('teach_next')).toBe(true);
  });

  it('returns orchestration result as JSON on success', async () => {
    const teachResult = {
      status: 'teach',
      chunk_id: 'c1',
      chunk_index: 1,
      total_chunks: 3,
      mode: 'learning',
      instruction: 'Teach this concept...',
      drill_format: 'explanation',
    };
    ctx.getNextTeachingStep = vi.fn().mockResolvedValue(teachResult);
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.status).toBe('teach');
    expect(parsed.chunk_id).toBe('c1');
    expect(parsed.instruction).toBe('Teach this concept...');
  });

  it('returns structured error when orchestration throws', async () => {
    ctx.getNextTeachingStep = vi.fn().mockRejectedValue(new Error('DB connection lost'));
    registerTeachingTools(server as any, ctx);
    const handler = server.tools.get('teach_next')!.handler;

    const result = await handler({});
    const parsed = parseResult(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('session');
    expect(parsed.error.message).toContain('DB connection lost');
    expect(parsed.error.retryable).toBe(true);
  });
});
