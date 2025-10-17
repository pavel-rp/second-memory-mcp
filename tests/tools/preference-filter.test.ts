import { describe, it, expect } from 'vitest';
import {
  filterBySubject,
  filterByTimeConstraints,
  filterByCognitiveLoad,
  calculateItemCognitiveLoad,
  estimateSessionDuration,
  filterByPrerequisites,
  prioritizeByUrgency,
  filterByLearningPatterns,
  composeBalancedSession,
  generateIntelligentConstraints,
} from '../../src/tools/preference-filter.js';

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

describe('PreferenceFilter', () => {
  it('filters by subject', () => {
    const items = [makeItem({ subject: 'CS' }), makeItem({ subject: 'Math' })];
    expect(filterBySubject(items, 'Any').length).toBe(2);
    expect(filterBySubject(items, 'CS').every(i => i.subject === 'CS')).toBe(true);
  });

  it('filters by time constraints with buffer', () => {
    const items = [makeItem({ estimatedDuration: 9 }), makeItem({ estimatedDuration: 20 })];
    const out = filterByTimeConstraints(items, 10, true); // effective 9
    expect(out.length).toBe(1);
  });

  it('computes cognitive load and filters by capacity', () => {
    const hard = makeItem({
      chunkType: 'new',
      difficulty: 8,
      easeFactor: 1.7,
      estimatedDuration: 25,
    });
    const easy = makeItem({
      chunkType: 'review',
      difficulty: 3,
      easeFactor: 3.2,
      estimatedDuration: 8,
    });
    expect(calculateItemCognitiveLoad(hard)).toBeGreaterThan(calculateItemCognitiveLoad(easy));
    const out = filterByCognitiveLoad([hard, easy], 10);
    expect(out.some(i => i.id === easy.id)).toBe(true);
  });

  it('estimates session duration with transitions', () => {
    const items = [
      makeItem({ estimatedDuration: 10 }),
      makeItem({ estimatedDuration: 10 }),
      makeItem({ estimatedDuration: 10 }),
    ];
    const out = estimateSessionDuration(items, true);
    expect(out).toBeGreaterThan(30);
  });

  it('respects prerequisites', () => {
    const a = makeItem({ id: 'a' });
    const b = makeItem({ id: 'b', prerequisites: ['a'] });
    expect(filterByPrerequisites([a, b], ['a']).length).toBe(2);
    expect(filterByPrerequisites([a, b], []).length).toBe(1);
  });

  it('prioritizes overdue items first', () => {
    const overdue = makeItem({
      id: 'o',
      nextReviewDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    });
    const future = makeItem({
      id: 'f',
      nextReviewDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    });
    const ordered = prioritizeByUrgency([future, overdue]);
    expect(ordered[0].id).toBe('o');
  });

  it('filters by learning patterns difficulty window and subject preferences ordering', () => {
    const items = [
      makeItem({ id: 'cs', subject: 'CS', difficulty: 5 }),
      makeItem({ id: 'math', subject: 'Math', difficulty: 5 }),
      makeItem({ id: 'hard', subject: 'CS', difficulty: 10 }),
    ];
    const out = filterByLearningPatterns(items, {
      preferredDifficulty: 5,
      subjectPreferences: { CS: 10, Math: 1 },
    } as any);
    expect(out.some(i => i.id === 'hard')).toBe(false);
    expect(out[0].subject).toBe('CS');
  });

  it('composes balanced session respecting constraints and max new items', () => {
    const items = [
      makeItem({
        id: 'o1',
        nextReviewDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        chunkType: 'review',
        estimatedDuration: 10,
      }),
      makeItem({
        id: 'r1',
        nextReviewDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        chunkType: 'review',
        estimatedDuration: 10,
      }),
      makeItem({ id: 'n1', chunkType: 'new', estimatedDuration: 10 }),
      makeItem({ id: 'n2', chunkType: 'new', estimatedDuration: 10 }),
    ];
    const out = composeBalancedSession(items, {
      maxDuration: 25,
      maxCognitiveLoad: 100,
      maxNewItems: 1,
    } as any);
    const newCount = out.filter(i => i.chunkType === 'new').length;
    expect(newCount).toBeLessThanOrEqual(1);
  });

  it('generates intelligent constraints based on time and patterns', () => {
    const out = generateIntelligentConstraints(45, {
      fatigueThreshold: 15,
      preferredDifficulty: 5,
    } as any);
    expect(out.maxDuration).toBe(45);
    expect(out.maxCognitiveLoad).toBeLessThanOrEqual(15);
    expect(out.maxNewItems).toBeGreaterThan(1);
  });
});
