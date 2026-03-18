import { describe, it, expect } from 'vitest';
import { registerServerTools } from '../../../src/server/tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { CaptureServer, parseToolResult } from '../../helpers/capture-server.js';

function createTestItem(
  id: string,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    id,
    title: overrides.title ?? `Test Item ${id}`,
    subject: overrides.subject ?? 'CS',
    difficulty: overrides.difficulty ?? 5,
    next_review_date: overrides.next_review_date ?? new Date().toISOString().slice(0, 10),
    ease_factor: overrides.ease_factor ?? 2.5,
    repetitions: overrides.repetitions ?? 2,
    estimated_duration: overrides.estimated_duration ?? 10,
    chunk_type: overrides.chunk_type ?? 'review',
    prerequisites: overrides.prerequisites ?? [],
    tags: overrides.tags ?? [],
  };
}

describe('Integration: Prerequisite Recommendation Workflow', () => {
  it('should handle items without prerequisites in recommendations', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');
    expect(tool).toBeDefined();

    const items = [
      createTestItem('basics', {
        chunk_type: 'review',
        prerequisites: [], // No prerequisites
        next_review_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // Overdue
      }),
      createTestItem('advanced', {
        chunk_type: 'review',
        prerequisites: [],
        next_review_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      }),
    ];

    const out = await tool.handler({
      time_available: 30,
      learning_items: items,
      constraints: { max_duration: 30, max_cognitive_load: 40 },
    });

    const result = parseToolResult(out);

    // Should get a result object (may be empty due to no database setup, but shouldn't crash)
    expect(result).toBeDefined();
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('rationale');
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it('should handle items with prerequisites gracefully', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');

    const items = [
      createTestItem('basics', {
        chunk_type: 'review',
        prerequisites: [],
        next_review_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      }),
      createTestItem('advanced', {
        chunk_type: 'review',
        prerequisites: ['basics'], // Has prerequisite
        next_review_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      }),
    ];

    const out = await tool.handler({
      time_available: 30,
      learning_items: items,
      constraints: { max_duration: 30, max_cognitive_load: 40 },
    });

    const result = parseToolResult(out);

    // Should get a result without crashing, regardless of prerequisite validation
    expect(result).toBeDefined();
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('rationale');
    expect(Array.isArray(result.recommendations)).toBe(true);

    // Should include rationale about prerequisite processing
    expect(typeof result.rationale).toBe('string');
    expect(result.rationale.length).toBeGreaterThan(0);
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

  it('should handle prerequisite processing without database', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');

    const items = [
      createTestItem('item-with-prereq', {
        chunk_type: 'review',
        prerequisites: ['some-prereq'],
        next_review_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      }),
    ];

    const out = await tool.handler({
      time_available: 30,
      learning_items: items,
      constraints: { max_duration: 30, max_cognitive_load: 40 },
    });

    const result = parseToolResult(out);

    // Should handle prerequisite checking gracefully even without database
    expect(result).toBeDefined();
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('rationale');

    // Should not crash due to prerequisite validation
    expect(typeof result.rationale).toBe('string');
  });
});
