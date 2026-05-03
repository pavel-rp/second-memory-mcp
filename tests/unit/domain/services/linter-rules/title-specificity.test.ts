import { describe, it, expect } from 'vitest';
import {
  titleSpecificityRule,
  TITLE_SPECIFICITY_RULE_NAME,
} from '../../../../../src/domain/services/linter-rules/title-specificity.js';
import { TITLE_MIN_WORD_COUNT } from '../../../../../src/shared/linter/section-thresholds.js';
import type {
  ChunkLintInput,
  TopicLintInput,
} from '../../../../../src/domain/services/chunk-linter.js';

function makeChunk(overrides: Partial<ChunkLintInput> = {}): ChunkLintInput {
  return {
    chunkId: 'c1',
    title: 'A sufficiently long chunk title here',
    content: 'Some content',
    chunkType: 'concept',
    condensedSummary: null,
    prerequisites: [],
    tags: [],
    difficulty: 3,
    estimatedDuration: 10,
    knowledgeType: null,
    ...overrides,
  };
}

function makeInput(overrides: Partial<TopicLintInput> = {}): TopicLintInput {
  return {
    topicId: '',
    topicTitle: 'A sufficiently long topic title here',
    subject: 'Subject',
    topicSummary: 'Topic summary text',
    chunks: [makeChunk({ chunkId: 'c1' }), makeChunk({ chunkId: 'c2' })],
    ...overrides,
  };
}

describe('tier1b.title-specificity', () => {
  describe('rule metadata', () => {
    it('is a topic-scope, tier1b, non-blocking-eligible rule', () => {
      expect(titleSpecificityRule.name).toBe(TITLE_SPECIFICITY_RULE_NAME);
      expect(titleSpecificityRule.scope).toBe('topic');
      expect(titleSpecificityRule.tier).toBe('tier1b');
      expect(titleSpecificityRule.blockingEligible).toBe(false);
    });
  });

  describe('short/vague title check', () => {
    it('fires on a single-word topic title without specificity signal', () => {
      const findings = titleSpecificityRule.run(makeInput({ topicTitle: 'Foundations' }));
      const topicFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('Foundations')
      );
      expect(topicFindings).toHaveLength(1);
      expect(topicFindings[0]).toMatchObject({
        chunkId: '',
        rule: TITLE_SPECIFICITY_RULE_NAME,
        severity: 'warning',
        category: 'title_specificity',
      });
    });

    it('does not fire on a short title with a colon (specificity signal)', () => {
      const findings = titleSpecificityRule.run(makeInput({ topicTitle: 'Parsing: intro' }));
      const shortFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('specificity')
      );
      expect(shortFindings).toHaveLength(0);
    });

    it('does not fire on a short title with a digit', () => {
      const findings = titleSpecificityRule.run(makeInput({ topicTitle: '5-Queens' }));
      const shortFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('specificity')
      );
      expect(shortFindings).toHaveLength(0);
    });

    it('does not fire on a short title with a verb', () => {
      const findings = titleSpecificityRule.run(makeInput({ topicTitle: 'Building graphs' }));
      const shortFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('specificity')
      );
      expect(shortFindings).toHaveLength(0);
    });

    it('does not fire on a short title with a math symbol', () => {
      const findings = titleSpecificityRule.run(makeInput({ topicTitle: 'Sum ∑' }));
      const shortFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('specificity')
      );
      expect(shortFindings).toHaveLength(0);
    });

    it(`does not fire on a title with ${TITLE_MIN_WORD_COUNT} or more words`, () => {
      const longTitle = Array.from({ length: TITLE_MIN_WORD_COUNT }, (_, i) => `word${i}`).join(
        ' '
      );
      const findings = titleSpecificityRule.run(makeInput({ topicTitle: longTitle }));
      const shortFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('specificity')
      );
      expect(shortFindings).toHaveLength(0);
    });

    it(`fires at ${TITLE_MIN_WORD_COUNT - 1} words without signal`, () => {
      const findings = titleSpecificityRule.run(
        makeInput({ topicTitle: 'Algorithms Topics Concepts Basics' })
      );
      const shortFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('specificity')
      );
      expect(shortFindings).toHaveLength(1);
    });

    it('does not fire on an empty topic title', () => {
      const findings = titleSpecificityRule.run(makeInput({ topicTitle: '' }));
      const topicFindings = findings.filter(f => f.chunkId === '');
      expect(topicFindings).toHaveLength(0);
    });
  });

  describe('coordinator check', () => {
    it('fires on word-boundary "and"', () => {
      const findings = titleSpecificityRule.run(
        makeInput({ topicTitle: 'Fenwick Trees and LSB Arithmetic' })
      );
      const coordFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('coordinator')
      );
      expect(coordFindings).toHaveLength(1);
      expect(coordFindings[0].detail).toContain('"and"');
    });

    it('fires on word-boundary "vs"', () => {
      const findings = titleSpecificityRule.run(
        makeInput({ topicTitle: 'Arrays vs Linked Lists comparison' })
      );
      const coordFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('coordinator')
      );
      expect(coordFindings).toHaveLength(1);
      expect(coordFindings[0].detail).toContain('"vs"');
    });

    it('fires on word-boundary "or"', () => {
      const findings = titleSpecificityRule.run(
        makeInput({ topicTitle: 'Stacks or Queues data structures' })
      );
      const coordFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('coordinator')
      );
      expect(coordFindings).toHaveLength(1);
      expect(coordFindings[0].detail).toContain('"or"');
    });

    it('does not fire on embedded slash (tin/tout)', () => {
      const findings = titleSpecificityRule.run(
        makeInput({ topicTitle: 'Building tin/tout via DFS' })
      );
      const coordFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('coordinator')
      );
      expect(coordFindings).toHaveLength(0);
    });

    it('fires on space-delimited slash', () => {
      const findings = titleSpecificityRule.run(
        makeInput({ topicTitle: 'Trees / Graphs comparison guide' })
      );
      const coordFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('coordinator')
      );
      expect(coordFindings).toHaveLength(1);
      expect(coordFindings[0].detail).toContain('"/"');
    });

    it('fires on comma-space', () => {
      const findings = titleSpecificityRule.run(
        makeInput({ topicTitle: 'Trees, Graphs, Heaps overview' })
      );
      const coordFindings = findings.filter(
        f => f.chunkId === '' && f.detail.includes('coordinator')
      );
      expect(coordFindings).toHaveLength(1);
      expect(coordFindings[0].detail).toContain('","');
    });
  });

  describe('chunk titles', () => {
    it('produces findings for chunk titles with the chunk chunkId', () => {
      const findings = titleSpecificityRule.run(
        makeInput({
          topicTitle: 'A sufficiently long topic title here',
          chunks: [
            makeChunk({ chunkId: 'c1', title: 'Basics' }),
            makeChunk({ chunkId: 'c2', title: 'A good detailed chunk title here' }),
          ],
        })
      );
      const c1Findings = findings.filter(f => f.chunkId === 'c1');
      expect(c1Findings).toHaveLength(1);
      expect(c1Findings[0].detail).toContain('Basics');
      const c2Findings = findings.filter(f => f.chunkId === 'c2');
      expect(c2Findings).toHaveLength(0);
    });
  });

  describe('combined findings', () => {
    it('can produce both short-title and coordinator findings for the same title', () => {
      const findings = titleSpecificityRule.run(makeInput({ topicTitle: 'X and Y' }));
      const topicFindings = findings.filter(f => f.chunkId === '');
      expect(topicFindings).toHaveLength(2);
      expect(topicFindings.some(f => f.detail.includes('specificity'))).toBe(true);
      expect(topicFindings.some(f => f.detail.includes('coordinator'))).toBe(true);
    });
  });

  describe('fixture: "Building tin/tout via DFS" passes', () => {
    it('produces zero findings', () => {
      const findings = titleSpecificityRule.run(
        makeInput({ topicTitle: 'Building tin/tout via DFS' })
      );
      const topicFindings = findings.filter(f => f.chunkId === '');
      expect(topicFindings).toHaveLength(0);
    });
  });
});
