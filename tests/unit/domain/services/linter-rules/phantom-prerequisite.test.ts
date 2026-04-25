import { describe, it, expect } from 'vitest';
import {
  phantomPrerequisiteRule,
  PHANTOM_PREREQUISITE_RULE_NAME,
} from '../../../../../src/domain/services/linter-rules/phantom-prerequisite.js';
import type { ChunkLintInput } from '../../../../../src/domain/services/chunk-linter.js';

function makeChunk(content: string | null, prerequisites: string[] = []): ChunkLintInput {
  return {
    chunkId: 'chunk-1',
    title: 'Test',
    content,
    chunkType: 'concept',
    condensedSummary: null,
    prerequisites,
    tags: [],
    difficulty: 3,
    estimatedDuration: 10,
  };
}

describe('tier1b.phantom-prerequisite', () => {
  describe('rule metadata', () => {
    it('is a chunk-scope, tier1b, non-blocking-eligible rule', () => {
      expect(phantomPrerequisiteRule.name).toBe(PHANTOM_PREREQUISITE_RULE_NAME);
      expect(phantomPrerequisiteRule.scope).toBe('chunk');
      expect(phantomPrerequisiteRule.tier).toBe('tier1b');
      expect(phantomPrerequisiteRule.blockingEligible).toBe(false);
    });
  });

  describe('null/empty content', () => {
    it('returns no findings for null content', () => {
      expect(phantomPrerequisiteRule.run(makeChunk(null, ['anything']))).toEqual([]);
    });

    it('returns no findings for empty content', () => {
      expect(phantomPrerequisiteRule.run(makeChunk('', ['anything']))).toEqual([]);
    });

    it('returns no findings for whitespace-only content', () => {
      expect(phantomPrerequisiteRule.run(makeChunk('   ', ['anything']))).toEqual([]);
    });
  });

  describe('declared prerequisites', () => {
    it('emits zero findings when every noun phrase is in prerequisites', () => {
      // Sentences are kept short and atomic so compromise emits one noun
      // phrase per concept rather than joining them via prepositions.
      const content = 'Use recursion. Walk the binary tree.';
      const findings = phantomPrerequisiteRule.run(
        makeChunk(content, ['recursion', 'binary tree'])
      );
      expect(findings).toEqual([]);
    });

    it('matches case-insensitively (Euler Tour ↔ euler tour)', () => {
      const content = 'The Euler Tour is the technique.';
      const findings = phantomPrerequisiteRule.run(makeChunk(content, ['euler tour', 'technique']));
      expect(findings).toEqual([]);
    });

    it('matches plural ↔ singular via lemmatization (graphs ↔ graph)', () => {
      const content = 'Graphs are useful structures.';
      const findings = phantomPrerequisiteRule.run(makeChunk(content, ['graph', 'structure']));
      expect(findings).toEqual([]);
    });

    it('matches when content uses singular and prereq uses plural (vertex ↔ vertices)', () => {
      const content = 'A vertex carries a label.';
      const findings = phantomPrerequisiteRule.run(makeChunk(content, ['vertices', 'label']));
      expect(findings).toEqual([]);
    });
  });

  describe('phantom prerequisites', () => {
    it('flags a single phantom term', () => {
      const content = 'Compute the Euler tour of the tree.';
      const findings = phantomPrerequisiteRule.run(
        makeChunk(content, ['tree traversal', 'recursion'])
      );
      expect(findings).toHaveLength(1);
      expect(findings[0].rule).toBe(PHANTOM_PREREQUISITE_RULE_NAME);
      expect(findings[0].severity).toBe('warning');
      expect(findings[0].category).toBe('phantom_prerequisite');
      expect(findings[0].chunkId).toBe('chunk-1');
      expect(findings[0].detail).toContain('Euler tour');
    });

    it('flags every distinct phantom term when prerequisites is empty', () => {
      const content = 'Use recursion to traverse the binary tree.';
      const findings = phantomPrerequisiteRule.run(makeChunk(content, []));
      expect(findings.length).toBeGreaterThan(0);
      for (const f of findings) {
        expect(f.severity).toBe('warning');
        expect(f.category).toBe('phantom_prerequisite');
      }
    });

    it('emits one finding per distinct phantom term, in source order', () => {
      const content = 'The Euler tour visits every vertex of the binary tree.';
      const findings = phantomPrerequisiteRule.run(makeChunk(content, []));
      const details = findings.map(f => f.detail);
      const eulerIdx = details.findIndex(d => d.includes('Euler'));
      const treeIdx = details.findIndex(d => d.includes('binary tree'));
      expect(eulerIdx).toBeGreaterThanOrEqual(0);
      expect(treeIdx).toBeGreaterThanOrEqual(0);
      expect(eulerIdx).toBeLessThan(treeIdx);
    });

    it('deduplicates the same phantom term across multiple occurrences', () => {
      const content =
        'The Euler tour is constructed. The Euler tour is unique. ' +
        'After computing the Euler tour, we proceed.';
      const findings = phantomPrerequisiteRule.run(makeChunk(content, []));
      const eulerFindings = findings.filter(f => f.detail.includes('Euler'));
      expect(eulerFindings).toHaveLength(1);
    });
  });

  describe('prerequisite normalization edge cases', () => {
    it('ignores empty-string entries in prerequisites', () => {
      // Exercises the `!prereq` short-circuit in buildPrerequisiteSet so an
      // empty prereq does not poison the set with `""`.
      const content = 'Use recursion. Walk the binary tree.';
      const findings = phantomPrerequisiteRule.run(
        makeChunk(content, ['', 'recursion', 'binary tree'])
      );
      expect(findings).toEqual([]);
    });

    it('honors a prereq that compromise rejects via the normalized fallback', () => {
      // `'xyzzy'` is not in compromise's lexicon, so `extractNounPhrases`
      // returns `[]` and `buildPrerequisiteSet` takes the fallback branch,
      // adding the lowercased + de-articled + punct-stripped form to the
      // set. The content phrase `"xyzzy"` is then matched against that
      // fallback entry and produces no finding.
      const content = 'Run xyzzy to advance.';
      const findings = phantomPrerequisiteRule.run(makeChunk(content, ['xyzzy']));
      expect(findings).toEqual([]);
    });

    it('discards a prereq whose fallback normalizes to empty', () => {
      // The bare article `'the'` is rejected by compromise AND is stripped
      // to `''` by the fallback's de-article step, so it must not be added
      // to the prereq set. The content term `"foundation"` is therefore
      // flagged because the only declared prereq contributed nothing.
      const content = 'The foundation matters.';
      const findings = phantomPrerequisiteRule.run(makeChunk(content, ['the']));
      expect(findings.some(f => f.detail.includes('foundation'))).toBe(true);
    });

    it('ignores whitespace-only entries in prerequisites', () => {
      // Per CLAUDE.md: every nullish/empty/whitespace guard branch needs
      // its own fixture. The `if (!prereq)` guard in `buildPrerequisiteSet`
      // does not catch `'   '` — it falls through to `extractNounPhrases`
      // (returns `[]`), then to the fallback whose stripped form is `''`,
      // which is rejected by `if (fallback)`. Net effect: no poisoning.
      const content = 'Use recursion. Walk the binary tree.';
      const findings = phantomPrerequisiteRule.run(
        makeChunk(content, ['   ', 'recursion', 'binary tree'])
      );
      expect(findings).toEqual([]);
    });
  });

  describe('skip rules', () => {
    it('skips pure numerals', () => {
      const content = '42 and 1024 are the targets.';
      const findings = phantomPrerequisiteRule.run(makeChunk(content, []));
      for (const f of findings) {
        expect(f.detail).not.toMatch(/"\d+"/);
      }
    });

    it('skips noun phrases whose surface or normal strips to empty', () => {
      // Compromise emits `'!!!'` as a single noun whose `text` and `normal`
      // both reduce to `''` after `stripDeterminerSurface` /
      // `stripDeterminerLower`. The `if (!surface || !normal) continue;`
      // guard in `extractNounPhrases` discards it, so no findings emerge.
      const content = '!!!';
      const findings = phantomPrerequisiteRule.run(makeChunk(content, []));
      expect(findings).toEqual([]);
    });

    it('skips short surface forms (< 3 chars)', () => {
      // "AI is useful." emits a single noun-phrase whose surface form is
      // exactly "AI" (length 2). With `prerequisites: []` and the < 3 char
      // guard removed, this fixture would produce one finding for "AI". The
      // assertion that the array stays empty therefore exercises the guard
      // — flipping it to `>=` would fail this test.
      const content = 'AI is useful.';
      const findings = phantomPrerequisiteRule.run(makeChunk(content, []));
      expect(findings.filter(f => f.detail.includes('"AI"'))).toEqual([]);
      expect(findings.filter(f => f.detail.toLowerCase().includes('"ai"'))).toEqual([]);
    });
  });

  describe('determinism', () => {
    it('returns identical findings across repeated calls on identical input', () => {
      const content = 'The Euler tour visits every vertex of the binary tree.';
      const first = phantomPrerequisiteRule.run(makeChunk(content, []));
      const second = phantomPrerequisiteRule.run(makeChunk(content, []));
      expect(first).toEqual(second);
    });
  });

  describe('NEU-537 reproducer', () => {
    it('flags "Euler tour" in an HLD motivation chunk where it is undeclared', () => {
      const content =
        '## Why this matters\n\n' +
        'In some tree-DP problems, the natural recursive structure is ' +
        'replaced by the Euler tour, which linearizes the traversal. ' +
        'This is unfamiliar territory for learners who only know recursion.\n';
      const findings = phantomPrerequisiteRule.run(
        makeChunk(content, ['recursion', 'tree', 'dynamic programming'])
      );
      const eulerFinding = findings.find(f => f.detail.includes('Euler'));
      expect(eulerFinding).toBeDefined();
      expect(eulerFinding?.severity).toBe('warning');
      expect(eulerFinding?.category).toBe('phantom_prerequisite');
    });
  });
});
