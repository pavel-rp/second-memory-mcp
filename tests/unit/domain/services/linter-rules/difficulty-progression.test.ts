import { describe, it, expect } from 'vitest';
import {
  difficultyProgressionRule,
  DIFFICULTY_PROGRESSION_RULE_NAME,
} from '../../../../../src/domain/services/linter-rules/difficulty-progression.js';
import { DIFFICULTY_RETROGRADE_THRESHOLD } from '../../../../../src/shared/linter/section-thresholds.js';
import type {
  ChunkLintInput,
  TopicLintInput,
} from '../../../../../src/domain/services/chunk-linter.js';

function makeChunk(
  chunkId: string,
  difficulty: number,
  overrides: Partial<ChunkLintInput> = {}
): ChunkLintInput {
  return {
    chunkId,
    title: `Chunk ${chunkId}`,
    content: 'Some content',
    chunkType: 'concept',
    condensedSummary: null,
    prerequisites: [],
    tags: [],
    difficulty,
    estimatedDuration: 10,
    knowledgeType: null,
    ...overrides,
  };
}

function makeInput(difficulties: number[]): TopicLintInput {
  return {
    topicId: '',
    topicTitle: 'Test Topic',
    subject: 'Subject',
    topicSummary: 'Summary',
    chunks: difficulties.map((d, i) => makeChunk(`c${i}`, d)),
  };
}

describe('tier1b.difficulty-progression', () => {
  describe('rule metadata', () => {
    it('is a topic-scope, tier1b, non-blocking-eligible rule', () => {
      expect(difficultyProgressionRule.name).toBe(DIFFICULTY_PROGRESSION_RULE_NAME);
      expect(difficultyProgressionRule.scope).toBe('topic');
      expect(difficultyProgressionRule.tier).toBe('tier1b');
      expect(difficultyProgressionRule.blockingEligible).toBe(false);
    });
  });

  describe('single-chunk exemption', () => {
    it('returns no findings for a single-chunk topic', () => {
      expect(difficultyProgressionRule.run(makeInput([5]))).toEqual([]);
    });
  });

  describe('retrograde detection', () => {
    it('fires when adjacent-pair drop equals the threshold', () => {
      const findings = difficultyProgressionRule.run(makeInput([5, 2]));
      const retroFindings = findings.filter(f => f.detail.includes('drops'));
      expect(retroFindings).toHaveLength(1);
      expect(retroFindings[0]).toMatchObject({
        chunkId: 'c1',
        rule: DIFFICULTY_PROGRESSION_RULE_NAME,
        severity: 'warning',
        category: 'difficulty_progression',
      });
      expect(retroFindings[0].detail).toBe(
        `Difficulty drops from 5 to 2 (threshold: ${DIFFICULTY_RETROGRADE_THRESHOLD})`
      );
    });

    it('does not fire when drop is below the threshold', () => {
      const findings = difficultyProgressionRule.run(makeInput([5, 3]));
      const retroFindings = findings.filter(f => f.detail.includes('drops'));
      expect(retroFindings).toHaveLength(0);
    });

    it('fires on the 7→3 fixture', () => {
      const findings = difficultyProgressionRule.run(makeInput([2, 7, 3, 5, 8]));
      const retroFindings = findings.filter(f => f.detail.includes('drops'));
      expect(retroFindings).toHaveLength(1);
      expect(retroFindings[0].chunkId).toBe('c2');
      expect(retroFindings[0].detail).toContain('7 to 3');
    });

    it('fires on multiple retrograde pairs', () => {
      const findings = difficultyProgressionRule.run(makeInput([8, 2, 7, 1]));
      const retroFindings = findings.filter(f => f.detail.includes('drops'));
      expect(retroFindings).toHaveLength(2);
    });

    it('does not fire on equal adjacent values', () => {
      const findings = difficultyProgressionRule.run(makeInput([5, 5, 5]));
      const retroFindings = findings.filter(f => f.detail.includes('drops'));
      expect(retroFindings).toHaveLength(0);
    });
  });

  describe('max-difficulty placement', () => {
    it('does not fire when max is in the second half (last position)', () => {
      const findings = difficultyProgressionRule.run(makeInput([2, 4, 5, 6, 8]));
      const placementFindings = findings.filter(f => f.detail.includes('position'));
      expect(placementFindings).toHaveLength(0);
    });

    it('fires when max is in the first half', () => {
      const findings = difficultyProgressionRule.run(makeInput([8, 2, 3, 4, 5]));
      const placementFindings = findings.filter(f => f.detail.includes('position'));
      expect(placementFindings).toHaveLength(1);
      expect(placementFindings[0].chunkId).toBe('c0');
      expect(placementFindings[0].detail).toBe(
        'Max difficulty chunk at position 1/5 — expected in second half'
      );
    });

    it('2-chunk topic: max at index 0 fires (second half starts at index 1)', () => {
      const findings = difficultyProgressionRule.run(makeInput([8, 3]));
      const placementFindings = findings.filter(f => f.detail.includes('position'));
      expect(placementFindings).toHaveLength(1);
    });

    it('2-chunk topic: max at index 1 passes', () => {
      const findings = difficultyProgressionRule.run(makeInput([3, 8]));
      const placementFindings = findings.filter(f => f.detail.includes('position'));
      expect(placementFindings).toHaveLength(0);
    });

    it('3-chunk topic: max at index 1 fires (second half starts at index 2)', () => {
      const findings = difficultyProgressionRule.run(makeInput([3, 8, 4]));
      const placementFindings = findings.filter(f => f.detail.includes('position'));
      expect(placementFindings).toHaveLength(1);
    });

    it('3-chunk topic: max at index 2 passes', () => {
      const findings = difficultyProgressionRule.run(makeInput([3, 4, 8]));
      const placementFindings = findings.filter(f => f.detail.includes('position'));
      expect(placementFindings).toHaveLength(0);
    });

    it('does not fire when max appears in both halves (tie)', () => {
      const findings = difficultyProgressionRule.run(makeInput([8, 3, 8]));
      const placementFindings = findings.filter(f => f.detail.includes('position'));
      expect(placementFindings).toHaveLength(0);
    });

    it('does not fire when all chunks have equal difficulty', () => {
      const findings = difficultyProgressionRule.run(makeInput([5, 5, 5]));
      const placementFindings = findings.filter(f => f.detail.includes('position'));
      expect(placementFindings).toHaveLength(0);
    });
  });

  describe('fixture: euler-tour [2, 4, 5, 6, 8] passes entirely', () => {
    it('produces zero findings', () => {
      expect(difficultyProgressionRule.run(makeInput([2, 4, 5, 6, 8]))).toEqual([]);
    });
  });
});
