import { describe, it, expect } from 'vitest';
import { registerServerTools } from '../../../src/server/tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { CaptureServer, parseToolResult } from '../../helpers/capture-server.js';

function makeItem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    title: overrides.title ?? 'Item',
    subject: overrides.subject ?? 'CS',
    difficulty: overrides.difficulty ?? 5,
    next_review_date: overrides.next_review_date ?? new Date().toISOString().slice(0, 10),
    ease_factor: overrides.ease_factor ?? 2.5,
    repetitions: overrides.repetitions ?? 2,
    estimated_duration: overrides.estimated_duration ?? 10,
    chunk_type: overrides.chunk_type ?? 'review',
    prerequisites: overrides.prerequisites,
    tags: overrides.tags,
  };
}

describe('Integration: what_to_learn_today', () => {
  it('generates explicit recommendations honoring constraints', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');
    expect(tool).toBeDefined();

    const items = [
      makeItem({
        id: 'o1',
        chunk_type: 'review',
        next_review_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        estimated_duration: 10,
      }),
      makeItem({ id: 'n1', chunk_type: 'new', estimated_duration: 15 }),
      makeItem({ id: 'r1', chunk_type: 'review', estimated_duration: 10 }),
    ];

    const out = await tool.handler({
      time_available: 30,
      learning_items: items,
      constraints: { max_duration: 30, max_cognitive_load: 40, max_new_items: 1 },
    });
    const result = parseToolResult(out);
    expect(result.recommendations.length).toBeGreaterThan(0);
    const newCount = result.recommendations.filter((r: any) => r.item.chunk_type === 'new').length;
    expect(newCount).toBeLessThanOrEqual(1);
    expect(result.estimated_duration).toBeLessThanOrEqual(30);
  });

  it('guided mode works with minimal inputs and omits dead fields', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');
    expect(tool).toBeDefined();

    const items = [
      makeItem({ id: 'a', chunk_type: 'review', estimated_duration: 10 }),
      makeItem({ id: 'b', chunk_type: 'new', estimated_duration: 10 }),
    ];

    const out = await tool.handler({
      learning_items: items,
    });
    const result = parseToolResult(out);
    expect(result.recommendations.length).toBeGreaterThan(0);

    // Dead fields must be absent (NEU-175)
    expect(result).not.toHaveProperty('conversation_guidance');
    expect(result).not.toHaveProperty('next_actions');
    expect(result).not.toHaveProperty('alternatives');
    expect(result.session_summary).not.toHaveProperty('total_cognitive_load');
    for (const rec of result.recommendations) {
      expect(rec).not.toHaveProperty('cognitive_load');
    }
  });
});
