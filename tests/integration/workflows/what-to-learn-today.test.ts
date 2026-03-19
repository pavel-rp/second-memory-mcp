import { describe, it, expect } from 'vitest';
import { registerServerTools } from '../../../src/server/tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { CaptureServer, parseToolResult } from '../../helpers/capture-server.js';

describe('Integration: what_to_learn_today', () => {
  it('returns topic-level recommendations from DB', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');
    expect(tool).toBeDefined();

    const out = await tool.handler({});
    const result = parseToolResult(out);

    // Result has topic-level shape
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('total_due_topics');
    expect(result).toHaveProperty('total_due_chunks');
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it('accepts subject_filter and limit parameters', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');
    expect(tool).toBeDefined();

    const out = await tool.handler({
      subject_filter: 'CS',
      limit: 5,
    });
    const result = parseToolResult(out);

    expect(result).toHaveProperty('recommendations');
    expect(result.recommendations.length).toBeLessThanOrEqual(5);
  });
});
