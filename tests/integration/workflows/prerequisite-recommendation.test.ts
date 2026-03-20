import { describe, it, expect } from 'vitest';
import { registerServerTools } from '../../../src/server/tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { CaptureServer, parseToolResult } from '../../helpers/capture-server.js';

describe('Integration: Topic Recommendation Workflow', () => {
  it('should return topic-level recommendations without crashing', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');
    expect(tool).toBeDefined();

    const out = await tool.handler({});
    const result = parseToolResult(out);

    // Should get a result with topic-level shape (may be empty without DB data)
    expect(result).toBeDefined();
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('total_due_topics');
    expect(result).toHaveProperty('total_due_chunks');
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it('should accept subject_filter parameter', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');
    expect(tool).toBeDefined();

    const out = await tool.handler({ subject_filter: 'CS' });
    const result = parseToolResult(out);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('total_due_topics');
    expect(result).toHaveProperty('total_due_chunks');
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it('should process tool registration successfully', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');

    expect(tool).toBeDefined();
    expect(tool.spec).toBeDefined();
    expect(tool.handler).toBeDefined();
    expect(typeof tool.handler).toBe('function');
  });

  it('should accept limit parameter', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');
    expect(tool).toBeDefined();

    const out = await tool.handler({ limit: 5 });
    const result = parseToolResult(out);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('recommendations');
    expect(result.recommendations.length).toBeLessThanOrEqual(5);
  });
});
