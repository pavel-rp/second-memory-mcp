import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  runLinterSuite,
  type ChunkLintInput,
  type LinterFinding,
  type LinterRule,
  type TopicLintInput,
} from '../../../../src/domain/services/chunk-linter.js';

function makeChunk(overrides: Partial<ChunkLintInput> = {}): ChunkLintInput {
  return {
    chunkId: 'c1',
    title: 'Chunk 1',
    content: 'Some content',
    chunkType: 'concept',
    condensedSummary: null,
    prerequisites: [],
    tags: [],
    difficulty: 3,
    estimatedDuration: 10,
    ...overrides,
  };
}

function makeInput(overrides: Partial<TopicLintInput> = {}): TopicLintInput {
  return {
    topicId: '',
    topicTitle: 'Topic Title',
    subject: 'Subject',
    topicSummary: 'Topic summary text',
    chunks: [makeChunk({ chunkId: 'c1' }), makeChunk({ chunkId: 'c2' })],
    ...overrides,
  };
}

function makeFinding(overrides: Partial<LinterFinding> = {}): LinterFinding {
  return {
    chunkId: 'c1',
    rule: 'test-rule',
    severity: 'warning',
    category: 'test',
    detail: 'detail',
    ...overrides,
  };
}

describe('runLinterSuite', () => {
  let onRuleError: ReturnType<typeof vi.fn<(ruleName: string, error: unknown) => void>>;

  beforeEach(() => {
    onRuleError = vi.fn<(ruleName: string, error: unknown) => void>();
  });

  it('returns empty result for an empty rule set', () => {
    const result = runLinterSuite([], makeInput());
    expect(result).toEqual({ findings: [], blocking: false });
  });

  it('dispatches chunk-scope rules once per chunk in chunk-array order', () => {
    const seen: string[] = [];
    const rule: LinterRule = {
      name: 'chunk-order-rule',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: chunk => {
        seen.push(chunk.chunkId);
        return [makeFinding({ chunkId: chunk.chunkId, rule: 'chunk-order-rule' })];
      },
    };
    const input = makeInput({
      chunks: [
        makeChunk({ chunkId: 'c-alpha' }),
        makeChunk({ chunkId: 'c-beta' }),
        makeChunk({ chunkId: 'c-gamma' }),
      ],
    });

    const result = runLinterSuite([rule], input);

    expect(seen).toEqual(['c-alpha', 'c-beta', 'c-gamma']);
    expect(result.findings.map(f => f.chunkId)).toEqual(['c-alpha', 'c-beta', 'c-gamma']);
    expect(result.blocking).toBe(false);
  });

  it('dispatches topic-scope rules exactly once with the full topic input', () => {
    const received: TopicLintInput[] = [];
    const rule: LinterRule = {
      name: 'topic-rule',
      scope: 'topic',
      tier: 'tier1a',
      blockingEligible: true,
      run: topic => {
        received.push(topic);
        return [makeFinding({ chunkId: topic.topicId || '<topic>', rule: 'topic-rule' })];
      },
    };
    const input = makeInput();

    const result = runLinterSuite([rule], input);

    expect(received).toHaveLength(1);
    expect(received[0]).toBe(input);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].rule).toBe('topic-rule');
  });

  it('aggregates findings in (registration order) × (chunk order for chunk-scope)', () => {
    const chunkRuleA: LinterRule = {
      name: 'rule-A',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: chunk => [makeFinding({ chunkId: chunk.chunkId, rule: 'rule-A' })],
    };
    const topicRule: LinterRule = {
      name: 'rule-T',
      scope: 'topic',
      tier: 'tier1a',
      blockingEligible: true,
      run: topic => [makeFinding({ chunkId: topic.topicId || '<topic>', rule: 'rule-T' })],
    };
    const chunkRuleB: LinterRule = {
      name: 'rule-B',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: chunk => [makeFinding({ chunkId: chunk.chunkId, rule: 'rule-B' })],
    };
    const input = makeInput({
      chunks: [makeChunk({ chunkId: 'c1' }), makeChunk({ chunkId: 'c2' })],
    });

    const result = runLinterSuite([chunkRuleA, topicRule, chunkRuleB], input);

    expect(result.findings.map(f => `${f.rule}:${f.chunkId}`)).toEqual([
      'rule-A:c1',
      'rule-A:c2',
      'rule-T:<topic>',
      'rule-B:c1',
      'rule-B:c2',
    ]);
  });

  it('sets blocking=true when any finding has severity blocking', () => {
    const rule: LinterRule = {
      name: 'blocking-rule',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: chunk => [
        makeFinding({
          chunkId: chunk.chunkId,
          rule: 'blocking-rule',
          severity: chunk.chunkId === 'c2' ? 'blocking' : 'warning',
        }),
      ],
    };

    const result = runLinterSuite([rule], makeInput());

    expect(result.blocking).toBe(true);
    expect(result.findings).toHaveLength(2);
  });

  it('sets blocking=false when all findings are warnings', () => {
    const rule: LinterRule = {
      name: 'warn-rule',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: chunk => [makeFinding({ chunkId: chunk.chunkId, severity: 'warning' })],
    };

    const result = runLinterSuite([rule], makeInput());

    expect(result.blocking).toBe(false);
    expect(result.findings).toHaveLength(2);
  });

  it('fails open on rule throw: invokes onRuleError, contributes zero findings, continues suite', () => {
    const goodRule: LinterRule = {
      name: 'good-rule',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: chunk => [makeFinding({ chunkId: chunk.chunkId, rule: 'good-rule' })],
    };
    const throwingRule: LinterRule = {
      name: 'throwing-rule',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: () => {
        throw new Error('boom');
      },
    };
    const input = makeInput({
      chunks: [makeChunk({ chunkId: 'c1' }), makeChunk({ chunkId: 'c2' })],
    });

    const result = runLinterSuite([throwingRule, goodRule], input, { onRuleError });

    expect(result.findings.map(f => f.rule)).toEqual(['good-rule', 'good-rule']);
    expect(result.blocking).toBe(false);
    expect(onRuleError).toHaveBeenCalledTimes(2);
    expect(onRuleError.mock.calls[0][0]).toBe('throwing-rule');
    expect(onRuleError.mock.calls[0][1]).toBeInstanceOf(Error);
  });

  it('fails open on topic-scope rule throw: single onRuleError call, zero findings, suite continues', () => {
    const throwingTopic: LinterRule = {
      name: 'topic-boom',
      scope: 'topic',
      tier: 'tier1a',
      blockingEligible: true,
      run: () => {
        throw new Error('topic boom');
      },
    };
    const followUp: LinterRule = {
      name: 'follow-up',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: chunk => [makeFinding({ chunkId: chunk.chunkId, rule: 'follow-up' })],
    };

    const result = runLinterSuite([throwingTopic, followUp], makeInput(), { onRuleError });

    expect(onRuleError).toHaveBeenCalledTimes(1);
    expect(onRuleError.mock.calls[0][0]).toBe('topic-boom');
    expect(result.findings.map(f => f.rule)).toEqual(['follow-up', 'follow-up']);
  });

  it('preserves fail-open contract when onRuleError itself throws', () => {
    const explodingCallback = vi
      .fn<(ruleName: string, error: unknown) => void>()
      .mockImplementation(() => {
        throw new Error('callback exploded');
      });
    const throwingRule: LinterRule = {
      name: 'rule-x',
      scope: 'topic',
      tier: 'tier1a',
      blockingEligible: true,
      run: () => {
        throw new Error('boom');
      },
    };
    const goodRule: LinterRule = {
      name: 'rule-y',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: chunk => [makeFinding({ chunkId: chunk.chunkId, rule: 'rule-y' })],
    };

    const result = runLinterSuite([throwingRule, goodRule], makeInput(), {
      onRuleError: explodingCallback,
    });

    expect(result.findings.map(f => f.rule)).toEqual(['rule-y', 'rule-y']);
  });

  it('swallows rule throws silently when no onRuleError is provided', () => {
    const throwingRule: LinterRule = {
      name: 'rule-silent',
      scope: 'topic',
      tier: 'tier1a',
      blockingEligible: true,
      run: () => {
        throw new Error('quiet boom');
      },
    };

    expect(() => runLinterSuite([throwingRule], makeInput())).not.toThrow();
  });

  it('downgrades blocking findings to warning when rule is not blockingEligible', () => {
    const rule: LinterRule = {
      name: 'tier1b.ineligible',
      scope: 'chunk',
      tier: 'tier1b',
      blockingEligible: false,
      run: chunk => [
        makeFinding({
          chunkId: chunk.chunkId,
          rule: 'tier1b.ineligible',
          severity: 'blocking',
          detail: 'would be blocking if eligible',
        }),
      ],
    };

    const result = runLinterSuite([rule], makeInput());

    expect(result.findings.every(f => f.severity === 'warning')).toBe(true);
    expect(result.findings.map(f => f.detail)).toEqual([
      'would be blocking if eligible',
      'would be blocking if eligible',
    ]);
    expect(result.blocking).toBe(false);
  });

  it('keeps blocking severity when rule is blockingEligible', () => {
    const rule: LinterRule = {
      name: 'tier1b.eligible',
      scope: 'chunk',
      tier: 'tier1b',
      blockingEligible: true,
      run: chunk => [
        makeFinding({
          chunkId: chunk.chunkId,
          rule: 'tier1b.eligible',
          severity: 'blocking',
        }),
      ],
    };

    const result = runLinterSuite([rule], makeInput());

    expect(result.findings.every(f => f.severity === 'blocking')).toBe(true);
    expect(result.blocking).toBe(true);
  });

  it('blocks on eligible Tier 1a finding even when a Tier 1b ineligible rule also emits blocking', () => {
    const tier1a: LinterRule = {
      name: 'tier1a.structural',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: chunk =>
        chunk.chunkId === 'c1'
          ? [
              makeFinding({
                chunkId: chunk.chunkId,
                rule: 'tier1a.structural',
                severity: 'blocking',
              }),
            ]
          : [],
    };
    const tier1bIneligible: LinterRule = {
      name: 'tier1b.heuristic',
      scope: 'chunk',
      tier: 'tier1b',
      blockingEligible: false,
      run: chunk => [
        makeFinding({
          chunkId: chunk.chunkId,
          rule: 'tier1b.heuristic',
          severity: 'blocking',
        }),
      ],
    };

    const result = runLinterSuite([tier1a, tier1bIneligible], makeInput());

    const blockingFindings = result.findings.filter(f => f.severity === 'blocking');
    expect(blockingFindings.map(f => f.rule)).toEqual(['tier1a.structural']);
    expect(result.blocking).toBe(true);
  });

  it('preserves rule-order × chunk-order under downgrade', () => {
    const ineligible: LinterRule = {
      name: 'rule-ineligible',
      scope: 'chunk',
      tier: 'tier1b',
      blockingEligible: false,
      run: chunk => [
        makeFinding({
          chunkId: chunk.chunkId,
          rule: 'rule-ineligible',
          severity: 'blocking',
        }),
      ],
    };
    const eligible: LinterRule = {
      name: 'rule-eligible',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: chunk => [
        makeFinding({
          chunkId: chunk.chunkId,
          rule: 'rule-eligible',
          severity: 'warning',
        }),
      ],
    };

    const result = runLinterSuite([ineligible, eligible], makeInput());

    expect(result.findings.map(f => `${f.rule}:${f.chunkId}:${f.severity}`)).toEqual([
      'rule-ineligible:c1:warning',
      'rule-ineligible:c2:warning',
      'rule-eligible:c1:warning',
      'rule-eligible:c2:warning',
    ]);
  });
});
