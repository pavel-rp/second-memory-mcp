import { describe, it, expect } from 'vitest';
import {
  resolveStalePrerequisites,
  type PrerequisiteChunkMeta,
  type ResolveStalePrerequisitesInput,
} from '../../../../src/domain/algorithms/resolve-stale-prerequisites.js';

const MS_PER_DAY = 86_400_000;
const NOW = new Date('2025-06-15T12:00:00.000Z');

/**
 * Build chunk metadata with a given retrievability profile.
 * stale = true: 200 days overdue on a 10-day interval → R ≈ 0.42 (below 0.50)
 * stale = false: 0 days overdue → R ≈ 1.0
 */
function makeMeta(
  opts: { stale: boolean; prerequisiteIds?: string[] } = { stale: false }
): PrerequisiteChunkMeta {
  const daysOverdue = opts.stale ? 200 : 0;
  return {
    easeFactor: 2.5,
    repetitions: 3,
    nextReviewAt: NOW.getTime() - daysOverdue * MS_PER_DAY,
    intervalDays: 10,
    prerequisiteIds: opts.prerequisiteIds ?? [],
  };
}

function makeInput(
  overrides: Partial<ResolveStalePrerequisitesInput> = {}
): ResolveStalePrerequisitesInput {
  return {
    chunkMetadata: new Map(),
    targetPrerequisiteIds: [],
    sessionChunkIds: new Set(),
    maxDepth: 5,
    now: NOW,
    ...overrides,
  };
}

describe('resolveStalePrerequisites', () => {
  it('returns empty when there are no prerequisites', () => {
    const result = resolveStalePrerequisites(makeInput());
    expect(result.stalePrereqIds).toEqual([]);
    expect(result.circularDetected).toBe(false);
    expect(result.depthCapReached).toBe(false);
  });

  it('returns empty when all prerequisites are fresh (R >= 0.50)', () => {
    const metadata = new Map<string, PrerequisiteChunkMeta>([
      ['prereq-1', makeMeta({ stale: false })],
      ['prereq-2', makeMeta({ stale: false })],
    ]);

    const result = resolveStalePrerequisites(
      makeInput({
        chunkMetadata: metadata,
        targetPrerequisiteIds: ['prereq-1', 'prereq-2'],
      })
    );

    expect(result.stalePrereqIds).toEqual([]);
  });

  it('returns single stale prerequisite', () => {
    const metadata = new Map<string, PrerequisiteChunkMeta>([
      ['prereq-1', makeMeta({ stale: true })],
    ]);

    const result = resolveStalePrerequisites(
      makeInput({
        chunkMetadata: metadata,
        targetPrerequisiteIds: ['prereq-1'],
      })
    );

    expect(result.stalePrereqIds).toEqual(['prereq-1']);
    expect(result.circularDetected).toBe(false);
  });

  it('returns chain of stale prereqs in topological order (deepest first)', () => {
    // C is prereq of B, B is prereq of target
    const metadata = new Map<string, PrerequisiteChunkMeta>([
      ['B', makeMeta({ stale: true, prerequisiteIds: ['C'] })],
      ['C', makeMeta({ stale: true })],
    ]);

    const result = resolveStalePrerequisites(
      makeInput({
        chunkMetadata: metadata,
        targetPrerequisiteIds: ['B'],
      })
    );

    // C should come before B (deepest first)
    expect(result.stalePrereqIds).toEqual(['C', 'B']);
  });

  it('includes only stale prereqs when mix of fresh and stale', () => {
    const metadata = new Map<string, PrerequisiteChunkMeta>([
      ['fresh-1', makeMeta({ stale: false })],
      ['stale-1', makeMeta({ stale: true })],
      ['fresh-2', makeMeta({ stale: false })],
    ]);

    const result = resolveStalePrerequisites(
      makeInput({
        chunkMetadata: metadata,
        targetPrerequisiteIds: ['fresh-1', 'stale-1', 'fresh-2'],
      })
    );

    expect(result.stalePrereqIds).toEqual(['stale-1']);
  });

  it('skips prerequisite already in session', () => {
    const metadata = new Map<string, PrerequisiteChunkMeta>([
      ['prereq-1', makeMeta({ stale: true })],
      ['prereq-2', makeMeta({ stale: true })],
    ]);

    const result = resolveStalePrerequisites(
      makeInput({
        chunkMetadata: metadata,
        targetPrerequisiteIds: ['prereq-1', 'prereq-2'],
        sessionChunkIds: new Set(['prereq-1']),
      })
    );

    expect(result.stalePrereqIds).toEqual(['prereq-2']);
  });

  it('detects circular prerequisite and sets circularDetected', () => {
    // A → B → A (circular)
    const metadata = new Map<string, PrerequisiteChunkMeta>([
      ['A', makeMeta({ stale: true, prerequisiteIds: ['B'] })],
      ['B', makeMeta({ stale: true, prerequisiteIds: ['A'] })],
    ]);

    const result = resolveStalePrerequisites(
      makeInput({
        chunkMetadata: metadata,
        targetPrerequisiteIds: ['A'],
      })
    );

    expect(result.circularDetected).toBe(true);
    // Should still return what it can without infinite loop
    expect(result.stalePrereqIds).toContain('B');
    expect(result.stalePrereqIds).toContain('A');
  });

  it('sets depthCapReached when recursion exceeds maxDepth', () => {
    // Chain: D3 → D2 → D1 → D0, maxDepth = 2
    const metadata = new Map<string, PrerequisiteChunkMeta>([
      ['D3', makeMeta({ stale: true, prerequisiteIds: ['D2'] })],
      ['D2', makeMeta({ stale: true, prerequisiteIds: ['D1'] })],
      ['D1', makeMeta({ stale: true, prerequisiteIds: ['D0'] })],
      ['D0', makeMeta({ stale: true })],
    ]);

    const result = resolveStalePrerequisites(
      makeInput({
        chunkMetadata: metadata,
        targetPrerequisiteIds: ['D3'],
        maxDepth: 2,
      })
    );

    expect(result.depthCapReached).toBe(true);
    // Should have D2, D3 at minimum (D1 starts at depth 3 which triggers cap)
    expect(result.stalePrereqIds.length).toBeGreaterThanOrEqual(2);
    expect(result.stalePrereqIds).toContain('D3');
    expect(result.stalePrereqIds).toContain('D2');
  });

  it('handles cross-topic prerequisite identically', () => {
    // prereq from a different topic (same data shape, just different ID pattern)
    const metadata = new Map<string, PrerequisiteChunkMeta>([
      ['other-topic-chunk-1', makeMeta({ stale: true })],
    ]);

    const result = resolveStalePrerequisites(
      makeInput({
        chunkMetadata: metadata,
        targetPrerequisiteIds: ['other-topic-chunk-1'],
      })
    );

    expect(result.stalePrereqIds).toEqual(['other-topic-chunk-1']);
  });

  it('skips prereq with no metadata in map gracefully', () => {
    // prereq-unknown has no entry in the metadata map
    const metadata = new Map<string, PrerequisiteChunkMeta>([
      ['prereq-known', makeMeta({ stale: true })],
    ]);

    const result = resolveStalePrerequisites(
      makeInput({
        chunkMetadata: metadata,
        targetPrerequisiteIds: ['prereq-unknown', 'prereq-known'],
      })
    );

    expect(result.stalePrereqIds).toEqual(['prereq-known']);
    expect(result.circularDetected).toBe(false);
  });

  it('does not revisit already-visited prereqs in diamond dependency', () => {
    // Diamond: target → [A, B], A → C, B → C (C should appear once)
    const metadata = new Map<string, PrerequisiteChunkMeta>([
      ['A', makeMeta({ stale: true, prerequisiteIds: ['C'] })],
      ['B', makeMeta({ stale: true, prerequisiteIds: ['C'] })],
      ['C', makeMeta({ stale: true })],
    ]);

    const result = resolveStalePrerequisites(
      makeInput({
        chunkMetadata: metadata,
        targetPrerequisiteIds: ['A', 'B'],
      })
    );

    // C should appear exactly once
    const cCount = result.stalePrereqIds.filter(id => id === 'C').length;
    expect(cCount).toBe(1);
    // C should be before A and B (topological)
    const cIdx = result.stalePrereqIds.indexOf('C');
    const aIdx = result.stalePrereqIds.indexOf('A');
    expect(cIdx).toBeLessThan(aIdx);
  });
});
