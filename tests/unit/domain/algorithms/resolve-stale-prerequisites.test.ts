import { describe, it, expect } from 'vitest';
import {
  resolveStalePrerequisites,
  type PrerequisiteChunkMeta,
  type ResolveStalePrerequisitesInput,
} from '../../../../src/domain/algorithms/resolve-stale-prerequisites.js';

const NOW = new Date('2025-06-15T12:00:00.000Z');
const DURABILITY_BAR = 0.9;

/**
 * Build chunk metadata with a given durability profile (NEU-931). The gate now
 * evaluates a retrievability-posterior from the persisted observation counts —
 * FSRS scheduling fields no longer drive the lock decision.
 *   stale = true:  empty history → posterior 0.5 (< 0.90 bar) → locked
 *   stale = false: 20 successes → posterior ≈ 0.955 (>= 0.90 bar) → unlocked
 */
function makeMeta(
  opts: { stale: boolean; prerequisiteIds?: string[] } = { stale: false }
): PrerequisiteChunkMeta {
  return {
    easeFactor: 2.5,
    repetitions: 3,
    nextReviewAt: NOW.getTime(),
    intervalDays: 10,
    prerequisiteIds: opts.prerequisiteIds ?? [],
    observations: opts.stale ? { successes: 0, failures: 0 } : { successes: 20, failures: 0 },
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
    durabilityBar: DURABILITY_BAR,
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

  it('returns empty when all prerequisites clear the durability bar', () => {
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

  it('keeps a single-success prerequisite locked (fail-closed regression)', () => {
    // DR-M10: a single success must NOT unlock a dependent. Posterior with one
    // success under Beta(1,1) is 2/3 ≈ 0.667 — below the 0.90 bar.
    const metadata = new Map<string, PrerequisiteChunkMeta>([
      ['prereq-1', { ...makeMeta({ stale: true }), observations: { successes: 1, failures: 0 } }],
    ]);

    const result = resolveStalePrerequisites(
      makeInput({ chunkMetadata: metadata, targetPrerequisiteIds: ['prereq-1'] })
    );

    expect(result.stalePrereqIds).toEqual(['prereq-1']);
  });

  it('emits a gate-decision record on both the lock and unlock paths', () => {
    const metadata = new Map<string, PrerequisiteChunkMeta>([
      ['locked-1', { ...makeMeta({ stale: true }), observations: { successes: 1, failures: 2 } }],
      ['unlocked-1', makeMeta({ stale: false })],
    ]);

    const result = resolveStalePrerequisites(
      makeInput({
        chunkMetadata: metadata,
        targetPrerequisiteIds: ['locked-1', 'unlocked-1'],
      })
    );

    const locked = result.gateDecisions.find(d => d.prerequisiteId === 'locked-1');
    const unlocked = result.gateDecisions.find(d => d.prerequisiteId === 'unlocked-1');

    expect(locked).toMatchObject({ passed: false, bar: DURABILITY_BAR, successes: 1, failures: 2 });
    expect(locked?.signal).toBeLessThan(DURABILITY_BAR);
    expect(unlocked).toMatchObject({ passed: true, bar: DURABILITY_BAR, successes: 20 });
    expect(unlocked?.signal).toBeGreaterThanOrEqual(DURABILITY_BAR);
  });
});
