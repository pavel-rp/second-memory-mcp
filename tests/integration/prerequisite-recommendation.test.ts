import { describe, it, expect } from 'vitest';
import { registerServerTools } from '../../src/server/tools.js';
import type { LearningItem } from '../../src/domain/types/recommendations.js';

class CaptureServer {
  public tools = new Map<string, { spec: any; handler: Function }>();
  registerTool(name: string, spec: any, handler: Function) {
    this.tools.set(name, { spec, handler });
  }
}

function createTestItem(id: string, overrides: Partial<LearningItem> = {}): LearningItem {
  return {
    id,
    title: overrides.title ?? `Test Item ${id}`,
    subject: overrides.subject ?? 'CS',
    difficulty: overrides.difficulty ?? 5,
    nextReviewDate: overrides.nextReviewDate ?? new Date().toISOString().slice(0, 10),
    easeFactor: overrides.easeFactor ?? 2.5,
    repetitions: overrides.repetitions ?? 2,
    estimatedDuration: overrides.estimatedDuration ?? 10,
    chunkType: overrides.chunkType ?? 'review',
    prerequisites: overrides.prerequisites ?? [],
    tags: overrides.tags ?? [],
  };
}

function parseToolResult(out: any): any {
  const text = out?.content?.[0]?.text;
  try {
    return JSON.parse(text);
  } catch {
    return out;
  }
}

describe('Integration: Prerequisite Recommendation Workflow', () => {
  it('should handle items without prerequisites in recommendations', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server);
    const tool = server.tools.get('what_to_learn_today');
    expect(tool).toBeDefined();

    const items = [
      createTestItem('basics', {
        chunkType: 'review',
        prerequisites: [], // No prerequisites
        nextReviewDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // Overdue
      }),
      createTestItem('advanced', {
        chunkType: 'review',
        prerequisites: [],
        nextReviewDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      }),
    ];

    const out = await tool.handler({
      mode: 'explicit',
      timeAvailable: 30,
      subjectPreference: 'Any',
      learningItems: items,
      constraints: { maxDuration: 30, maxCognitiveLoad: 40 },
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
    registerServerTools(server);
    const tool = server.tools.get('what_to_learn_today');

    const items = [
      createTestItem('basics', {
        chunkType: 'review',
        prerequisites: [],
        nextReviewDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      }),
      createTestItem('advanced', {
        chunkType: 'review',
        prerequisites: ['basics'], // Has prerequisite
        nextReviewDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      }),
    ];

    const out = await tool.handler({
      mode: 'explicit',
      timeAvailable: 30,
      subjectPreference: 'Any',
      learningItems: items,
      constraints: { maxDuration: 30, maxCognitiveLoad: 40 },
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
    registerServerTools(server);
    const tool = server.tools.get('what_to_learn_today');

    expect(tool).toBeDefined();
    expect(tool.spec).toBeDefined();
    expect(tool.handler).toBeDefined();
    expect(typeof tool.handler).toBe('function');
  });

  it('should handle prerequisite processing without database', async () => {
    const server = new CaptureServer() as any;
    registerServerTools(server);
    const tool = server.tools.get('what_to_learn_today');

    const items = [
      createTestItem('item-with-prereq', {
        chunkType: 'review',
        prerequisites: ['some-prereq'],
        nextReviewDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      }),
    ];

    const out = await tool.handler({
      mode: 'explicit',
      timeAvailable: 30,
      subjectPreference: 'Any',
      learningItems: items,
      constraints: { maxDuration: 30, maxCognitiveLoad: 40 },
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
