import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RecommendationEngine } from '../../src/tools/recommendation-engine.js';

function makeItem(overrides: Partial<any> = {}): any {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    title: overrides.title ?? 'Item',
    subject: overrides.subject ?? 'CS',
    difficulty: overrides.difficulty ?? 5,
    nextReviewDate: overrides.nextReviewDate ?? new Date().toISOString().slice(0, 10),
    easeFactor: overrides.easeFactor ?? 2.5,
    repetitions: overrides.repetitions ?? 2,
    estimatedDuration: overrides.estimatedDuration ?? 10,
    chunkType: overrides.chunkType ?? 'review',
    prerequisites: overrides.prerequisites,
    tags: overrides.tags,
  };
}

describe('RecommendationEngine', () => {
  const originalEnv = { ...process.env };
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns empty when no items match constraints', async () => {
    const engine = new RecommendationEngine();
    const out = await engine.generateRecommendations({
      mode: 'explicit',
      learningItems: [makeItem({ id: 'a', subject: 'Math' })],
      constraints: { subjectFilter: 'CS', maxDuration: 5 },
      timeAvailable: 5,
    } as any);

    expect(out.recommendations.length).toBe(0);
    expect(out.estimatedDuration).toBe(0);
  });

  it('guided mode applies intelligent defaults (fills timeAvailable and constraints)', async () => {
    const engine = new RecommendationEngine();
    const items = [
      makeItem({
        id: 'r1',
        chunkType: 'review',
        estimatedDuration: 10,
        nextReviewDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      }),
      makeItem({ id: 'n1', chunkType: 'new', estimatedDuration: 10 }),
    ];

    const out = await engine.generateRecommendations({
      mode: 'guided',
      learningItems: items,
      userHistory: {
        recentSessions: [],
        patterns: {
          averageSessionDuration: 25,
          preferredDifficulty: 5,
          successRate: 0.75,
          fatigueThreshold: 18,
          subjectPreferences: { CS: 1 },
        },
      },
    } as any);

    expect(out.recommendations.length).toBeGreaterThan(0);
    expect(out.sessionSummary.totalItems).toBe(out.recommendations.length);
    expect(out.conversationGuidance).toBeDefined();
    expect(out.rationale).toMatch(/spaced repetition/i);
  });

  it('respects maxNewItems constraint and session duration/cognitive load limits', async () => {
    const engine = new RecommendationEngine();
    const items = [
      // Overdue review items
      makeItem({
        id: 'o1',
        chunkType: 'review',
        nextReviewDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
        estimatedDuration: 10,
        difficulty: 6,
        easeFactor: 1.8,
      }),
      makeItem({
        id: 'o2',
        chunkType: 'review',
        nextReviewDate: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
        estimatedDuration: 10,
        difficulty: 6,
      }),
      // New items
      makeItem({
        id: 'n1',
        chunkType: 'new',
        estimatedDuration: 10,
        difficulty: 7,
        easeFactor: 1.9,
      }),
      makeItem({ id: 'n2', chunkType: 'new', estimatedDuration: 10, difficulty: 7 }),
      makeItem({ id: 'n3', chunkType: 'new', estimatedDuration: 10, difficulty: 7 }),
    ];

    const out = await engine.generateRecommendations({
      mode: 'explicit',
      learningItems: items,
      timeAvailable: 30,
      constraints: { maxDuration: 30, maxCognitiveLoad: 25, maxNewItems: 2 },
    } as any);

    const newCount = out.recommendations.filter(r => r.item.chunkType === 'new').length;
    expect(newCount).toBeLessThanOrEqual(2);
    expect(out.sessionSummary.totalDuration).toBeLessThanOrEqual(30);
    expect(out.sessionSummary.totalCognitiveLoad).toBeGreaterThan(0);
  });

  it('interleaves recommendations by difficulty buckets', async () => {
    const engine = new RecommendationEngine();
    const items = [
      makeItem({ id: 'e1', difficulty: 3, estimatedDuration: 5 }),
      makeItem({ id: 'm1', difficulty: 6, estimatedDuration: 5 }),
      makeItem({ id: 'h1', difficulty: 9, estimatedDuration: 5, easeFactor: 1.6 }),
      makeItem({ id: 'e2', difficulty: 3, estimatedDuration: 5 }),
      makeItem({ id: 'm2', difficulty: 6, estimatedDuration: 5 }),
      makeItem({ id: 'h2', difficulty: 9, estimatedDuration: 5, easeFactor: 1.6 }),
    ];

    const out = await engine.generateRecommendations({
      mode: 'explicit',
      learningItems: items,
      timeAvailable: 40,
      constraints: { maxDuration: 40, maxCognitiveLoad: 100, maxNewItems: 6 },
    } as any);

    expect(out.recommendations.length).toBeGreaterThanOrEqual(4);
    // Orders should be strictly increasing starting at 1
    const orders = out.recommendations.map(r => r.order);
    expect(orders[0]).toBe(1);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBe(orders[i - 1] + 1);
    }
  });

  it('produces alternatives distinct from selected items', async () => {
    const engine = new RecommendationEngine();
    const items = Array.from({ length: 8 }).map((_, i) =>
      makeItem({ id: `id-${i}`, estimatedDuration: 5 + (i % 3), difficulty: 4 + (i % 5) })
    );

    const out = await engine.generateRecommendations({
      mode: 'explicit',
      learningItems: items,
      timeAvailable: 20,
      constraints: { maxDuration: 20, maxCognitiveLoad: 40, maxNewItems: 2 },
    } as any);

    if (out.alternatives && out.alternatives.length > 0) {
      const selectedIds = new Set(out.recommendations.map(r => r.item.id));
      for (const alt of out.alternatives) {
        expect(selectedIds.has(alt.item.id)).toBe(false);
      }
    }
  });

  it('returns orchestrationHint when learningItems array is empty', async () => {
    const engine = new RecommendationEngine();
    const result = await engine.generateRecommendations({
      mode: 'guided',
      learningItems: [],
      timeAvailable: 30,
    });

    expect(result.orchestrationHint).toBeDefined();
    expect(result.orchestrationHint).toContain('No learning items provided');
    expect(result.orchestrationHint).toContain('fetchFromDatabase: true');
    expect(result.orchestrationHint).toContain('automatically fetch');
  });

  it('does not return orchestrationHint when learningItems are provided', async () => {
    const engine = new RecommendationEngine();
    const items = [makeItem({ id: 'test-item', estimatedDuration: 10 })];

    const result = await engine.generateRecommendations({
      mode: 'guided',
      learningItems: items,
      timeAvailable: 30,
    });

    expect(result.orchestrationHint).toBeUndefined();
  });

  it('handles empty learningItems in explicit mode', async () => {
    const engine = new RecommendationEngine();
    const result = await engine.generateRecommendations({
      mode: 'explicit',
      learningItems: [],
      timeAvailable: 30,
    });

    expect(result.orchestrationHint).toBeDefined();
    expect(result.recommendations).toHaveLength(0);
    expect(result.sessionSummary.totalItems).toBe(0);
  });

  it('maintains backward compatibility - orchestrationHint is optional', async () => {
    const engine = new RecommendationEngine();
    const items = [makeItem({ id: 'test-item', estimatedDuration: 10 })];

    const result = await engine.generateRecommendations({
      mode: 'guided',
      learningItems: items,
      timeAvailable: 30,
    });

    // Should have all required fields
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('sessionSummary');
    expect(result).toHaveProperty('estimatedDuration');
    expect(result).toHaveProperty('rationale');
    expect(result).toHaveProperty('nextActions');

    // orchestrationHint should be undefined when not needed
    expect(result.orchestrationHint).toBeUndefined();
  });
});
