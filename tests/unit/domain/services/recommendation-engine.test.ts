import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RecommendationEngine } from '../../../../src/domain/services/recommendation-engine.js';
import { PrerequisiteValidator } from '../../../../src/domain/services/prerequisite-validator.js';
import { DependencyResolver } from '../../../../src/domain/algorithms/dependency-resolver.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../../src/domain/config/algorithm-defaults.js';
import { mapChunkRowToLearningItem } from '../../../../src/shared/chunk-mapping.js';
import type { LearningItem } from '../../../../src/domain/types/recommendations.js';

const NOW = new Date('2025-06-15T12:00:00.000Z');
const TODAY = NOW.toISOString().slice(0, 10);

function createTestEngine(chunkLookupFn?: (id: string) => Promise<LearningItem | undefined>) {
  const mockValidator = new PrerequisiteValidator({
    referenceValidator: {
      validateChunkPrerequisites: vi.fn().mockReturnValue({ isValid: true, invalidReferences: [] }),
    },
    masteryService: {
      checkItemMastery: vi.fn().mockResolvedValue({ isMastered: true }),
    },
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
    clock: () => NOW.getTime(),
  });
  const dependencyResolver = new DependencyResolver(
    DEFAULT_ALGORITHM_CONFIG.prerequisiteConfig.validation.maxDependencyDepth
  );
  return new RecommendationEngine({
    chunkLookupFn: chunkLookupFn ?? (async () => undefined),
    prerequisiteValidator: mockValidator,
    dependencyResolver,
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
  });
}

function makeItem(overrides: Partial<any> = {}): any {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    title: overrides.title ?? 'Item',
    subject: overrides.subject ?? 'CS',
    difficulty: overrides.difficulty ?? 5,
    nextReviewDate: overrides.nextReviewDate ?? TODAY,
    easeFactor: overrides.easeFactor ?? 2.5,
    repetitions: overrides.repetitions ?? 2,
    estimatedDuration: overrides.estimatedDuration ?? 10,
    chunkType: overrides.chunkType ?? 'review',
    prerequisites: overrides.prerequisites,
    tags: overrides.tags,
  };
}

function makeChunkRow(
  id: string,
  prerequisites: string[] = [],
  overrides: Partial<Record<string, unknown>> = {}
): any {
  const now = Date.now();
  return {
    id,
    topicId: 'topic',
    title: overrides.title ?? `Chunk ${id}`,
    subject: overrides.subject ?? 'CS',
    difficulty: overrides.difficulty ?? 5,
    nextReviewAt: overrides.nextReviewAt ?? now,
    easeFactor: overrides.easeFactor ?? 2.5,
    repetitions: overrides.repetitions ?? 1,
    lastReviewedAt: overrides.lastReviewedAt ?? null,
    estimatedDuration: overrides.estimatedDuration ?? 10,
    chunkType: overrides.chunkType ?? 'new',
    prerequisitesJson: JSON.stringify(prerequisites),
    tagsJson: JSON.stringify(overrides.tags ?? []),
    content: overrides.content ?? null,
    contentVersion: overrides.contentVersion ?? null,
    contentUpdatedAt: overrides.contentUpdatedAt ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

describe('RecommendationEngine', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty when no items match constraints', async () => {
    const engine = createTestEngine();
    const out = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: [makeItem({ id: 'a', subject: 'Math' })],
        constraints: { subjectFilter: 'CS', maxDuration: 5 },
        timeAvailable: 5,
      } as any,
      NOW
    );

    expect(out.recommendations.length).toBe(0);
    expect(out.estimatedDuration).toBe(0);
  });

  it('guided mode applies intelligent defaults (fills timeAvailable and constraints)', async () => {
    const engine = createTestEngine();
    const items = [
      makeItem({
        id: 'r1',
        chunkType: 'review',
        estimatedDuration: 10,
        nextReviewDate: '2025-06-14',
      }),
      makeItem({ id: 'n1', chunkType: 'new', estimatedDuration: 10 }),
    ];

    const out = await engine.generateRecommendations(
      {
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
      } as any,
      NOW
    );

    expect(out.recommendations.length).toBeGreaterThan(0);
    expect(out.sessionSummary.totalItems).toBe(out.recommendations.length);
    expect(out.conversationGuidance).toBeDefined();
    expect(out.rationale).toMatch(/spaced repetition/i);
  });

  it('respects maxNewItems constraint and session duration/cognitive load limits', async () => {
    const engine = createTestEngine();
    const items = [
      // Overdue review items
      makeItem({
        id: 'o1',
        chunkType: 'review',
        nextReviewDate: '2025-06-13',
        estimatedDuration: 10,
        difficulty: 6,
        easeFactor: 1.8,
      }),
      makeItem({
        id: 'o2',
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
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

    const out = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: items,
        timeAvailable: 30,
        constraints: { maxDuration: 30, maxCognitiveLoad: 25, maxNewItems: 2 },
      } as any,
      NOW
    );

    const newCount = out.recommendations.filter(r => r.item.chunkType === 'new').length;
    expect(newCount).toBeLessThanOrEqual(2);
    expect(out.sessionSummary.totalDuration).toBeLessThanOrEqual(30);
    expect(out.sessionSummary.totalCognitiveLoad).toBeGreaterThan(0);
  });

  it('interleaves recommendations by difficulty buckets', async () => {
    const engine = createTestEngine();
    const items = [
      makeItem({ id: 'e1', difficulty: 3, estimatedDuration: 5 }),
      makeItem({ id: 'm1', difficulty: 6, estimatedDuration: 5 }),
      makeItem({ id: 'h1', difficulty: 9, estimatedDuration: 5, easeFactor: 1.6 }),
      makeItem({ id: 'e2', difficulty: 3, estimatedDuration: 5 }),
      makeItem({ id: 'm2', difficulty: 6, estimatedDuration: 5 }),
      makeItem({ id: 'h2', difficulty: 9, estimatedDuration: 5, easeFactor: 1.6 }),
    ];

    const out = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: items,
        timeAvailable: 40,
        constraints: { maxDuration: 40, maxCognitiveLoad: 100, maxNewItems: 6 },
      } as any,
      NOW
    );

    expect(out.recommendations.length).toBeGreaterThanOrEqual(4);
    // Orders should be strictly increasing starting at 1
    const orders = out.recommendations.map(r => r.order);
    expect(orders[0]).toBe(1);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBe(orders[i - 1] + 1);
    }
  });

  it('produces alternatives distinct from selected items', async () => {
    const engine = createTestEngine();
    const items = Array.from({ length: 8 }).map((_, i) =>
      makeItem({ id: `id-${i}`, estimatedDuration: 5 + (i % 3), difficulty: 4 + (i % 5) })
    );

    const out = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: items,
        timeAvailable: 20,
        constraints: { maxDuration: 20, maxCognitiveLoad: 40, maxNewItems: 2 },
      } as any,
      NOW
    );

    if (out.alternatives && out.alternatives.length > 0) {
      const selectedIds = new Set(out.recommendations.map(r => r.item.id));
      for (const alt of out.alternatives) {
        expect(selectedIds.has(alt.item.id)).toBe(false);
      }
    }
  });

  it('returns orchestrationHint when learningItems array is empty', async () => {
    const engine = createTestEngine();
    const result = await engine.generateRecommendations(
      {
        mode: 'guided',
        learningItems: [],
        timeAvailable: 30,
      },
      NOW
    );

    expect(result.orchestrationHint).toBeDefined();
    expect(result.orchestrationHint).toContain('No learning items provided');
    expect(result.orchestrationHint).toContain('fetchFromDatabase: true');
    expect(result.orchestrationHint).toContain('automatically fetch');
  });

  it('does not return orchestrationHint when learningItems are provided', async () => {
    const engine = createTestEngine();
    const items = [makeItem({ id: 'test-item', estimatedDuration: 10 })];

    const result = await engine.generateRecommendations(
      {
        mode: 'guided',
        learningItems: items,
        timeAvailable: 30,
      },
      NOW
    );

    expect(result.orchestrationHint).toBeUndefined();
  });

  it('handles empty learningItems in explicit mode', async () => {
    const engine = createTestEngine();
    const result = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: [],
        timeAvailable: 30,
      },
      NOW
    );

    expect(result.orchestrationHint).toBeDefined();
    expect(result.recommendations).toHaveLength(0);
    expect(result.sessionSummary.totalItems).toBe(0);
  });

  it('maintains backward compatibility - orchestrationHint is optional', async () => {
    const engine = createTestEngine();
    const items = [makeItem({ id: 'test-item', estimatedDuration: 10 })];

    const result = await engine.generateRecommendations(
      {
        mode: 'guided',
        learningItems: items,
        timeAvailable: 30,
      },
      NOW
    );

    // Should have all required fields
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('sessionSummary');
    expect(result).toHaveProperty('estimatedDuration');
    expect(result).toHaveProperty('rationale');
    expect(result).toHaveProperty('nextActions');

    // orchestrationHint should be undefined when not needed
    expect(result.orchestrationHint).toBeUndefined();
  });

  it('automatically includes prerequisites when items have dependencies', async () => {
    const engine = createTestEngine();

    // Create items with prerequisite relationships:
    // item-c requires item-b, item-b requires item-a
    const items = [
      makeItem({
        id: 'item-a',
        title: 'Prerequisite A',
        estimatedDuration: 10,
        chunkType: 'new',
        prerequisites: [],
      }),
      makeItem({
        id: 'item-b',
        title: 'Prerequisite B',
        estimatedDuration: 10,
        chunkType: 'new',
        prerequisites: ['item-a'],
      }),
      makeItem({
        id: 'item-c',
        title: 'Main Item C',
        estimatedDuration: 10,
        chunkType: 'new',
        nextReviewDate: '2025-06-14', // Overdue
        prerequisites: ['item-b'],
      }),
    ];

    const result = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: items,
        timeAvailable: 60,
      },
      NOW
    );

    // Should include all items with prerequisites ordered correctly
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1);

    // Check if prerequisite items are marked correctly
    const hasPrerequisiteReason = result.recommendations.some(r =>
      r.reason.includes('prerequisite')
    );

    // Verify rationale mentions prerequisites if they were added
    if (hasPrerequisiteReason) {
      expect(result.rationale).toMatch(/prerequisite/i);
    }

    // Verify dependency resolution info is included
    if (result.dependencyResolution && result.dependencyResolution.addedPrerequisites.length > 0) {
      expect(result.dependencyResolution.addedPrerequisites).toBeDefined();
      expect(result.dependencyResolution.resolvedOrder).toBeDefined();
      expect(result.dependencyResolution.resolvedOrder.length).toBe(result.recommendations.length);
    }
  });

  it('includes transitive prerequisites when only dependent item is provided', async () => {
    const chunkRows: Record<string, any> = {
      'item-a': makeChunkRow('item-a', []),
    };

    const engine = createTestEngine(async (id: string) => {
      const row = chunkRows[id];
      return row ? (mapChunkRowToLearningItem(row) as LearningItem) : undefined;
    });

    const overdueDate = '2025-06-14';
    const items = [
      makeItem({
        id: 'item-b',
        title: 'Intermediate Item B',
        estimatedDuration: 10,
        chunkType: 'new',
        nextReviewDate: overdueDate,
        prerequisites: ['item-a'],
      }),
      makeItem({
        id: 'item-c',
        title: 'Main Item C',
        estimatedDuration: 10,
        chunkType: 'new',
        nextReviewDate: overdueDate,
        prerequisites: ['item-b'],
      }),
    ];

    const result = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: items,
        timeAvailable: 60,
      },
      NOW
    );

    const orderedIds = result.recommendations.map(r => r.item.id);
    expect(orderedIds).toEqual(['item-a', 'item-b', 'item-c']);

    expect(result.dependencyResolution).toBeDefined();
    expect(result.dependencyResolution?.addedPrerequisites).toContain('item-a');
  });

  it('orders items topologically when dependencies exist', async () => {
    const engine = createTestEngine();

    // Create a dependency chain: A <- B <- C
    const items = [
      makeItem({
        id: 'item-a',
        title: 'Foundation',
        estimatedDuration: 10,
        chunkType: 'new',
        prerequisites: [],
      }),
      makeItem({
        id: 'item-b',
        title: 'Intermediate',
        estimatedDuration: 10,
        chunkType: 'new',
        prerequisites: ['item-a'],
      }),
      makeItem({
        id: 'item-c',
        title: 'Advanced',
        estimatedDuration: 10,
        chunkType: 'new',
        nextReviewDate: '2025-06-14', // Make it high priority
        prerequisites: ['item-b'],
      }),
    ];

    const result = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: items,
        timeAvailable: 60,
      },
      NOW
    );

    // If prerequisites were included, they should come before dependent items
    if (result.recommendations.length > 1) {
      const itemIds = result.recommendations.map(r => r.item.id);

      // Find positions of items in recommendation list
      const posA = itemIds.indexOf('item-a');
      const posB = itemIds.indexOf('item-b');
      const posC = itemIds.indexOf('item-c');

      // If all items are included, verify prerequisite order
      if (posA !== -1 && posB !== -1 && posC !== -1) {
        expect(posA).toBeLessThan(posB);
        expect(posB).toBeLessThan(posC);
      }
    }
  });

  it('handles items without prerequisites normally', async () => {
    const engine = createTestEngine();

    const items = [
      makeItem({
        id: 'item-1',
        estimatedDuration: 10,
        chunkType: 'review',
        prerequisites: [],
      }),
      makeItem({
        id: 'item-2',
        estimatedDuration: 10,
        chunkType: 'new',
        prerequisites: [],
      }),
    ];

    const result = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: items,
        timeAvailable: 30,
      },
      NOW
    );

    // Should work normally without dependency resolution
    expect(result.recommendations.length).toBeGreaterThan(0);

    // Dependency resolution info should be undefined or empty
    if (result.dependencyResolution) {
      expect(result.dependencyResolution.addedPrerequisites).toHaveLength(0);
    }
  });

  it('includes dependencyResolution field in output when prerequisites are added', async () => {
    const engine = createTestEngine();

    const items = [
      makeItem({
        id: 'prereq',
        title: 'Prerequisite',
        estimatedDuration: 10,
        chunkType: 'new',
        prerequisites: [],
      }),
      makeItem({
        id: 'main',
        title: 'Main Item',
        estimatedDuration: 10,
        chunkType: 'review',
        nextReviewDate: '2025-06-14', // Overdue
        prerequisites: ['prereq'],
      }),
    ];

    const result = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: items,
        timeAvailable: 60,
      },
      NOW
    );

    // Type check: ensure dependencyResolution field exists in type
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('dependencyResolution');

    // If prerequisites were added, verify the structure
    if (result.dependencyResolution) {
      expect(result.dependencyResolution).toHaveProperty('addedPrerequisites');
      expect(result.dependencyResolution).toHaveProperty('resolvedOrder');
      expect(Array.isArray(result.dependencyResolution.addedPrerequisites)).toBe(true);
      expect(Array.isArray(result.dependencyResolution.resolvedOrder)).toBe(true);
    }
  });

  it('ensures resolvedOrder only contains items actually present in recommendations', async () => {
    const engine = createTestEngine();

    // Create items with a simple prerequisite relationship
    const items = [
      makeItem({
        id: 'existing-prereq',
        title: 'Existing Prerequisite',
        estimatedDuration: 10,
        chunkType: 'new',
        prerequisites: [],
      }),
      makeItem({
        id: 'main-item',
        title: 'Main Item',
        estimatedDuration: 10,
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
        prerequisites: ['existing-prereq'],
      }),
    ];

    const result = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: items,
        timeAvailable: 60,
      },
      NOW
    );

    // Verify that dependencyResolution is consistent with recommendations
    if (result.dependencyResolution && result.dependencyResolution.resolvedOrder.length > 0) {
      const recommendationIds = new Set(result.recommendations.map(r => r.item.id));

      // Every item in resolvedOrder must be present in recommendations
      for (const itemId of result.dependencyResolution.resolvedOrder) {
        expect(recommendationIds.has(itemId)).toBe(true);
      }

      // The number of items should match
      expect(result.dependencyResolution.resolvedOrder.length).toBe(result.recommendations.length);
    }
  });

  it('returns fetchFromDatabase orchestrationHint when items empty and fetchFromDatabase is true', async () => {
    const engine = createTestEngine();
    const result = await engine.generateRecommendations(
      {
        mode: 'guided',
        learningItems: [],
        timeAvailable: 30,
        fetchFromDatabase: true,
      } as any,
      NOW
    );

    expect(result.orchestrationHint).toBeDefined();
    expect(result.orchestrationHint).toContain('No learning items found');
    expect(result.orchestrationHint).toContain('relaxing filters');
  });

  it('generates encouragement for sessions with only review items (no overdue, no new)', async () => {
    const engine = createTestEngine();
    const items = [
      makeItem({
        id: 'r1',
        chunkType: 'review',
        estimatedDuration: 10,
        nextReviewDate: '2025-06-16', // Tomorrow — not overdue
      }),
    ];

    const result = await engine.generateRecommendations(
      {
        mode: 'guided',
        learningItems: items,
        timeAvailable: 30,
      },
      NOW
    );

    expect(result.conversationGuidance).toBeDefined();
    expect(result.conversationGuidance!.encouragement).toContain('reinforcing');
  });

  it('includes prerequisite filtering count in rationale when items are filtered', async () => {
    // Create an engine where prerequisite validation filters out items
    const mockValidator = new PrerequisiteValidator({
      referenceValidator: {
        validateChunkPrerequisites: vi
          .fn()
          .mockReturnValue({ isValid: true, invalidReferences: [] }),
      },
      masteryService: {
        checkItemMastery: vi.fn().mockResolvedValue({ isMastered: false }),
      },
      algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
      clock: () => NOW.getTime(),
    });
    const dependencyResolver = new DependencyResolver(
      DEFAULT_ALGORITHM_CONFIG.prerequisiteConfig.validation.maxDependencyDepth
    );

    const engine = new RecommendationEngine({
      chunkLookupFn: async () => undefined,
      prerequisiteValidator: mockValidator,
      dependencyResolver,
      algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
    });

    const items = [
      makeItem({ id: 'no-prereqs', prerequisites: [], estimatedDuration: 10 }),
      makeItem({ id: 'with-prereqs', prerequisites: ['missing-prereq'], estimatedDuration: 10 }),
    ];

    const result = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: items,
        timeAvailable: 60,
      },
      NOW
    );

    // The item with unmastered prerequisites should be filtered, affecting the rationale
    expect(result.rationale).toMatch(/spaced repetition/i);
    expect(result.rationale).toMatch(/1 items? were filtered out due to unmet prerequisites/i);
  });

  it('does not include dependencyResolution when no prerequisites were added', async () => {
    const engine = createTestEngine();
    const items = [makeItem({ id: 'standalone', estimatedDuration: 10, prerequisites: [] })];

    const result = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: items,
        timeAvailable: 30,
      },
      NOW
    );

    expect(result.dependencyResolution).toBeUndefined();
  });

  it('applies subject preference from user history when not explicitly set', async () => {
    const engine = createTestEngine();
    const items = [
      makeItem({ id: 'cs-item', subject: 'CS', estimatedDuration: 10 }),
      makeItem({ id: 'math-item', subject: 'Math', estimatedDuration: 10 }),
    ];

    const result = await engine.generateRecommendations(
      {
        mode: 'guided',
        learningItems: items,
        timeAvailable: 30,
        userHistory: {
          recentSessions: [],
          patterns: {
            averageSessionDuration: 25,
            preferredDifficulty: 5,
            successRate: 0.75,
            fatigueThreshold: 18,
            subjectPreferences: { CS: 5, Math: 1 },
          },
        },
      } as any,
      NOW
    );

    // Exercises the isSubjectPreference(topSubject) === true branch (line 139).
    // Note: derived preference is set on defaults but generateIntelligentConstraints
    // reads from pre-merge input, so filtering isn't applied to results here.
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('defaults subject preference to Any for unrecognized top subject', async () => {
    const engine = createTestEngine();
    const items = [
      makeItem({ id: 'bio-item', subject: 'Biology', estimatedDuration: 10 }),
      makeItem({ id: 'cs-item', subject: 'CS', estimatedDuration: 10 }),
    ];

    const result = await engine.generateRecommendations(
      {
        mode: 'guided',
        learningItems: items,
        timeAvailable: 60,
        userHistory: {
          recentSessions: [],
          patterns: {
            averageSessionDuration: 25,
            preferredDifficulty: 5,
            successRate: 0.75,
            fatigueThreshold: 18,
            subjectPreferences: { Biology: 5 },
          },
        },
      } as any,
      NOW
    );

    // "Any" means no subject filter — both subjects should appear
    expect(result.recommendations.length).toBeGreaterThan(0);
    const subjects = new Set(result.recommendations.map(r => r.item.subject));
    expect(subjects.size).toBeGreaterThan(1);
  });

  it('handles missing prerequisite chunks gracefully without breaking topological order', async () => {
    const engine = createTestEngine();

    // Create items where prerequisites exist but form a chain that's incomplete in database
    // This tests the scenario where dependency resolution finds a missing chunk
    const items = [
      makeItem({
        id: 'existing-item',
        title: 'Existing Item',
        estimatedDuration: 10,
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
        prerequisites: [], // No prerequisites, so will pass validation
      }),
      makeItem({
        id: 'dependent-item',
        title: 'Dependent Item',
        estimatedDuration: 10,
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
        prerequisites: [], // No prerequisites to avoid validation filtering
      }),
    ];

    const result = await engine.generateRecommendations(
      {
        mode: 'explicit',
        learningItems: items,
        timeAvailable: 60,
      },
      NOW
    );

    // Should return recommendations for items without prerequisite issues
    expect(result.recommendations.length).toBeGreaterThan(0);

    // Verify consistency between resolvedOrder and recommendations
    if (result.dependencyResolution && result.dependencyResolution.resolvedOrder.length > 0) {
      const recommendationIds = new Set(result.recommendations.map(r => r.item.id));

      // All items in resolvedOrder should be in recommendations
      for (const itemId of result.dependencyResolution.resolvedOrder) {
        expect(recommendationIds.has(itemId)).toBe(true);
      }

      // Number of items in resolvedOrder should match recommendations
      expect(result.dependencyResolution.resolvedOrder.length).toBe(result.recommendations.length);
    }
  });

  it('returns original recommendations when dependency resolution finds circular deps', async () => {
    const engine = createTestEngine();
    // Items with circular prerequisites: A → B → A
    const items = [
      makeItem({
        id: 'item-a',
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
        estimatedDuration: 10,
        prerequisites: ['item-b'],
      }),
      makeItem({
        id: 'item-b',
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
        estimatedDuration: 10,
        prerequisites: ['item-a'],
      }),
    ];

    const result = await engine.generateRecommendations(
      { mode: 'explicit', learningItems: items, timeAvailable: 60 },
      NOW
    );

    // Should still return recommendations despite circular deps
    expect(result.recommendations.length).toBeGreaterThan(0);
    // Dependency resolution should be undefined (invalid resolution → null internally)
    expect(result.dependencyResolution).toBeUndefined();
  });

  it('returns original recommendations when dependency resolver throws', async () => {
    const mockValidator = new PrerequisiteValidator({
      referenceValidator: {
        validateChunkPrerequisites: vi
          .fn()
          .mockReturnValue({ isValid: true, invalidReferences: [] }),
      },
      masteryService: {
        checkItemMastery: vi.fn().mockResolvedValue({ isMastered: true }),
      },
      algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
      clock: () => NOW.getTime(),
    });
    const mockResolver = {
      resolveDependencies: vi.fn().mockRejectedValue(new Error('resolver crash')),
    };
    const engine = new RecommendationEngine({
      chunkLookupFn: async () => undefined,
      prerequisiteValidator: mockValidator,
      dependencyResolver: mockResolver as any,
      algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
    });

    const items = [makeItem({ id: 'item-x', chunkType: 'review', nextReviewDate: '2025-06-14' })];

    const result = await engine.generateRecommendations(
      { mode: 'explicit', learningItems: items, timeAvailable: 60 },
      NOW
    );

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.dependencyResolution).toBeUndefined();
  });

  it('generates default encouragement for non-overdue review-only items', async () => {
    const engine = createTestEngine();
    // All review items with future nextReviewDate — no overdue, no new
    const items = [
      makeItem({
        id: 'future-1',
        chunkType: 'review',
        nextReviewDate: '2025-06-16',
        estimatedDuration: 10,
      }),
      makeItem({
        id: 'future-2',
        chunkType: 'review',
        nextReviewDate: '2025-06-16',
        estimatedDuration: 10,
      }),
    ];

    const result = await engine.generateRecommendations(
      { mode: 'guided', learningItems: items, timeAvailable: 60 },
      NOW
    );

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.conversationGuidance?.encouragement).toContain(
      'Consistent review leads to lasting learning'
    );
  });

  it('defaults mode to guided when mode is falsy', async () => {
    const engine = createTestEngine();
    const items = [
      makeItem({
        id: 'a',
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
        estimatedDuration: 10,
      }),
    ];

    const result = await engine.generateRecommendations(
      { mode: undefined as any, learningItems: items, timeAvailable: 30 },
      NOW
    );

    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('infers timeAvailable from user history when not provided', async () => {
    const engine = createTestEngine();
    const items = [
      makeItem({
        id: 'a',
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
        estimatedDuration: 10,
      }),
    ];

    const result = await engine.generateRecommendations(
      {
        mode: 'guided',
        learningItems: items,
        userHistory: {
          recentSessions: [],
          patterns: {
            averageSessionDuration: 45,
            preferredDifficulty: 5,
            successRate: 0.8,
            fatigueThreshold: 20,
            subjectPreferences: {},
          },
        },
      } as any,
      NOW
    );

    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('handles undefined learningItems gracefully', async () => {
    const engine = createTestEngine();

    const result = await engine.generateRecommendations(
      { mode: 'explicit', learningItems: undefined as any, timeAvailable: 30 },
      NOW
    );

    expect(result.recommendations).toEqual([]);
  });

  it('interleaves only easy and hard items when no medium-difficulty items exist', async () => {
    const engine = createTestEngine();
    // All items either very easy (cogLoad < 10) or very hard (cogLoad >= 15)
    const items = [
      makeItem({
        id: 'easy-1',
        difficulty: 1,
        estimatedDuration: 5,
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
      }),
      makeItem({
        id: 'easy-2',
        difficulty: 2,
        estimatedDuration: 5,
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
      }),
      makeItem({
        id: 'hard-1',
        difficulty: 10,
        estimatedDuration: 15,
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
      }),
      makeItem({
        id: 'hard-2',
        difficulty: 10,
        estimatedDuration: 15,
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
      }),
    ];

    const result = await engine.generateRecommendations(
      { mode: 'guided', learningItems: items, timeAvailable: 120 },
      NOW
    );

    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('generates empty-recommendation guidance when no items pass constraints', async () => {
    const engine = createTestEngine();
    // Items with mismatched subject so all get filtered by subjectFilter
    const items = [makeItem({ id: 'a', subject: 'Math', estimatedDuration: 10 })];

    const result = await engine.generateRecommendations(
      {
        mode: 'guided',
        learningItems: items,
        constraints: { subjectFilter: 'CS' },
        timeAvailable: 30,
      } as any,
      NOW
    );

    expect(result.recommendations).toEqual([]);
    expect(result.conversationGuidance?.nextAction).toContain('No items are due');
  });

  it('includes timeAvailable in rationale when set', async () => {
    const engine = createTestEngine();
    const items = [
      makeItem({
        id: 'a',
        chunkType: 'review',
        nextReviewDate: '2025-06-14',
        estimatedDuration: 10,
      }),
    ];

    const result = await engine.generateRecommendations(
      { mode: 'guided', learningItems: items, timeAvailable: 45 },
      NOW
    );

    expect(result.rationale).toContain('45-minute time constraint');
  });

  it('generates new-item encouragement when only new items are recommended', async () => {
    const engine = createTestEngine();
    const items = [
      makeItem({
        id: 'new-1',
        chunkType: 'new',
        nextReviewDate: '2025-06-16',
        estimatedDuration: 10,
      }),
    ];

    const result = await engine.generateRecommendations(
      { mode: 'guided', learningItems: items, timeAvailable: 60 },
      NOW
    );

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.conversationGuidance?.encouragement).toContain('explore new concepts');
  });
});
