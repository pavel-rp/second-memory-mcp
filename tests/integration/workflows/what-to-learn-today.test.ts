import { describe, it, expect } from 'vitest';
import { registerServerTools } from '../../../src/server/tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { CaptureServer, parseToolResult } from '../../helpers/capture-server.js';

function makeItem(overrides: Partial<any> = {}): any {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    title: overrides.title ?? 'Item',
    subject: overrides.subject ?? 'CS',
    difficulty: overrides.difficulty ?? 5,
    next_review_date: overrides.nextReviewDate ?? new Date().toISOString().slice(0, 10),
    ease_factor: overrides.easeFactor ?? 2.5,
    repetitions: overrides.repetitions ?? 2,
    estimated_duration: overrides.estimatedDuration ?? 10,
    chunk_type: overrides.chunkType ?? 'review',
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
        chunkType: 'review',
        nextReviewDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        estimatedDuration: 10,
      }),
      makeItem({ id: 'n1', chunkType: 'new', estimatedDuration: 15 }),
      makeItem({ id: 'r1', chunkType: 'review', estimatedDuration: 10 }),
    ];

    const out = await tool.handler({
      mode: 'explicit',
      time_available: 30,
      subject_preference: 'Any',
      learning_items: items,
      constraints: { max_duration: 30, max_cognitive_load: 40, max_new_items: 1 },
    });
    const result = parseToolResult(out);
    expect(result.recommendations.length).toBeGreaterThan(0);
    const newCount = result.recommendations.filter((r: any) => r.item.chunkType === 'new').length;
    expect(newCount).toBeLessThanOrEqual(1);
    expect(result.estimatedDuration).toBeLessThanOrEqual(30);
  });

  it('guided mode works with minimal inputs and produces guidance', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('what_to_learn_today');
    expect(tool).toBeDefined();

    const items = [
      makeItem({ id: 'a', chunkType: 'review', estimatedDuration: 10 }),
      makeItem({ id: 'b', chunkType: 'new', estimatedDuration: 10 }),
    ];

    const out = await tool.handler({
      mode: 'guided',
      learning_items: items,
      user_history: {
        recent_sessions: [],
        patterns: {
          average_session_duration: 20,
          preferred_difficulty: 5,
          success_rate: 0.7,
          fatigue_threshold: 15,
          subject_preferences: { CS: 1 },
        },
      },
    });
    const result = parseToolResult(out);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.conversationGuidance).toBeDefined();
    expect(Array.isArray(result.nextActions)).toBe(true);
  });
});

describe('Integration: guided_learning_conversation', () => {
  it('starts a session and returns user-facing guidance', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server, createAppContext({ embedding: undefined }));
    const tool = server.tools.get('guided_learning_conversation');
    expect(tool).toBeDefined();

    // Context is an opaque record consumed by internal code expecting camelCase LearningItem objects
    const out = await tool.handler({
      intent: 'start_learning',
      context: {
        learningItems: [
          {
            id: 'a',
            title: 'Item',
            subject: 'CS',
            difficulty: 5,
            nextReviewDate: new Date().toISOString().slice(0, 10),
            easeFactor: 2.5,
            repetitions: 2,
            estimatedDuration: 10,
            chunkType: 'review',
          },
        ],
      },
    });
    const result = parseToolResult(out);
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.needsInput).toBe(false);
  });
});
