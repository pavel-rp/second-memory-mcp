import { describe, it, expect, vi, beforeEach } from 'vitest';

const warnMock = vi.fn();

vi.mock('../../../src/shared/logger.js', () => {
  return {
    getRequestLogger: vi.fn(() => ({
      warn: warnMock,
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    })),
    logEvent: vi.fn(),
  };
});

import {
  runTier1Audit,
  runTier2AuditPostCommit,
  buildSingleChunkValidatorReport,
  TIER2_LOW_SCORE_THRESHOLD,
  type RuleMeta,
  type Tier2CircuitBreakerHandle,
} from '../../../src/orchestration/audit-pipeline.js';
import type {
  LinterFinding,
  LinterRule,
  TopicLintInput,
} from '../../../src/domain/services/chunk-linter.js';
import type { ContentClassifierPort } from '../../../src/ports/content-classifier-port.js';
import type { ChunkRepository } from '../../../src/ports/chunk-repository.js';
import type {
  ChunkClassifierVerdict,
  VerdictFieldName,
} from '../../../src/domain/types/classifier.js';
import type { LearningChunk } from '../../../src/domain/types/entities.js';
import { logEvent } from '../../../src/shared/logger.js';
import { stubChunkRepository } from '../../helpers/stub-ports.js';

// ──────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────

function lintInput(): TopicLintInput {
  return {
    topicId: '',
    topicTitle: 'Binary Search',
    subject: 'CS',
    topicSummary: 'A short summary.',
    chunks: [
      {
        chunkId: 'chunk-a',
        title: 'Invariant',
        content: 'lo, hi pointer invariant',
        chunkType: 'concept',
        condensedSummary: null,
        prerequisites: [],
        tags: [],
        difficulty: 3,
        estimatedDuration: 10,
        knowledgeType: null,
      },
    ],
  };
}

function chunkRow(overrides: Partial<LearningChunk> = {}): LearningChunk {
  return {
    id: 'chunk-a',
    topicId: 'topic-1',
    title: 'Invariant',
    subject: 'CS',
    difficulty: 3,
    nextReviewAt: 0,
    easeFactor: 2.5,
    repetitions: 0,
    lastReviewedAt: null,
    estimatedDuration: 10,
    intervalDays: null,
    chunkType: 'concept',
    prerequisitesJson: [],
    tagsJson: [],
    content: 'lo, hi pointer invariant',
    contentVersion: 1,
    contentUpdatedAt: 0,
    contentStatus: 'final',
    condensedSummary: null,
    knowledgeType: null,
    validatorReport: null,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function cleanVerdict(): ChunkClassifierVerdict {
  return {
    renderingClarity: { score: 5, rationale: 'clean', applicable: true },
    vocabularyAppropriate: { score: 5, rationale: 'clear', applicable: true },
    mathNotationRenderingRisk: { score: 5, rationale: 'no math', applicable: false },
    definitionConstructive: { score: 4, rationale: 'constructive', applicable: true },
    epistemicConsistency: { score: 5, rationale: 'consistent', applicable: true },
    overallFit: { score: 5, rationale: 'good atom', applicable: true },
  };
}

function lowOnRenderingClarity(): ChunkClassifierVerdict {
  return {
    renderingClarity: { score: 1, rationale: 'broken fences', applicable: true },
    vocabularyAppropriate: { score: 5, rationale: 'clear', applicable: true },
    mathNotationRenderingRisk: { score: 5, rationale: 'no math', applicable: false },
    definitionConstructive: { score: 4, rationale: 'constructive', applicable: true },
    epistemicConsistency: { score: 5, rationale: 'consistent', applicable: true },
    overallFit: { score: 5, rationale: 'good atom', applicable: true },
  };
}

function allNullVerdict(): ChunkClassifierVerdict {
  return {
    renderingClarity: null,
    vocabularyAppropriate: null,
    mathNotationRenderingRisk: null,
    definitionConstructive: null,
    epistemicConsistency: null,
    overallFit: null,
  };
}

function makeChunkRule(opts: {
  name: string;
  tier: 'tier1a' | 'tier1b';
  blockingEligible: boolean;
  finding?: LinterFinding;
}): LinterRule {
  return {
    name: opts.name,
    scope: 'chunk',
    tier: opts.tier,
    blockingEligible: opts.blockingEligible,
    run: () => (opts.finding ? [opts.finding] : []),
  };
}

function makeThrowingRule(name: string): LinterRule {
  return {
    name,
    scope: 'chunk',
    tier: 'tier1a',
    blockingEligible: true,
    run: () => {
      throw new Error('rule blew up');
    },
  };
}

// ──────────────────────────────────────────────────────────────
// runTier1Audit
// ──────────────────────────────────────────────────────────────

describe('runTier1Audit', () => {
  beforeEach(() => {
    warnMock.mockClear();
  });

  it('returns empty findings, non-blocking, empty meta map for zero rules', () => {
    const result = runTier1Audit(lintInput(), []);
    expect(result.findings).toEqual([]);
    expect(result.blocking).toBe(false);
    expect(result.ruleMetaByName.size).toBe(0);
  });

  it('flags blocking when a tier1a-blocking rule fires and records meta', () => {
    const finding: LinterFinding = {
      chunkId: 'chunk-a',
      rule: 'tier1a.broken-fence',
      severity: 'blocking',
      category: 'structural',
      detail: 'Unbalanced fence',
    };
    const rule = makeChunkRule({
      name: 'tier1a.broken-fence',
      tier: 'tier1a',
      blockingEligible: true,
      finding,
    });
    const result = runTier1Audit(lintInput(), [rule]);
    expect(result.blocking).toBe(true);
    expect(result.findings).toEqual([finding]);
    expect(result.ruleMetaByName.get('tier1a.broken-fence')).toEqual({
      tier: 'tier1a',
      blockingEligible: true,
    });
  });

  it('emits a warning finding for a tier1b non-blocking rule and stays non-blocking', () => {
    const finding: LinterFinding = {
      chunkId: 'chunk-a',
      rule: 'tier1b.short-content',
      severity: 'warning',
      category: 'heuristic',
      detail: 'Below 300 words',
    };
    const rule = makeChunkRule({
      name: 'tier1b.short-content',
      tier: 'tier1b',
      blockingEligible: false,
      finding,
    });
    const result = runTier1Audit(lintInput(), [rule]);
    expect(result.blocking).toBe(false);
    expect(result.findings).toEqual([finding]);
    expect(result.ruleMetaByName.get('tier1b.short-content')).toEqual({
      tier: 'tier1b',
      blockingEligible: false,
    });
  });

  it('absorbs rule throws and warns via the onRuleError callback', () => {
    const result = runTier1Audit(lintInput(), [makeThrowingRule('tier1a.boom')]);
    expect(result.findings).toEqual([]);
    expect(result.blocking).toBe(false);
    expect(warnMock).toHaveBeenCalledWith(
      'Linter rule "tier1a.boom" threw — treating as zero findings:',
      expect.any(Error)
    );
  });
});

// ──────────────────────────────────────────────────────────────
// buildSingleChunkValidatorReport
// ──────────────────────────────────────────────────────────────

describe('buildSingleChunkValidatorReport', () => {
  beforeEach(() => {
    warnMock.mockClear();
  });

  const updatedAt = '2026-05-02T00:00:00.000Z';

  it('returns the canonical empty report when no findings exist', () => {
    const report = buildSingleChunkValidatorReport('chunk-a', [], new Map(), updatedAt);
    expect(report).toEqual({ updated_at: updatedAt });
  });

  it('filters out findings for other chunks and omits empty buckets', () => {
    const map = new Map<string, RuleMeta>([
      ['tier1a.x', { tier: 'tier1a', blockingEligible: true }],
    ]);
    const finding: LinterFinding = {
      chunkId: 'chunk-other',
      rule: 'tier1a.x',
      severity: 'blocking',
      category: 'structural',
      detail: 'd',
    };
    const report = buildSingleChunkValidatorReport('chunk-a', [finding], map, updatedAt);
    expect(report).toEqual({ updated_at: updatedAt });
  });

  it('routes findings into tier1a/tier1b and tags tier1b entries with blocking_eligible', () => {
    const map = new Map<string, RuleMeta>([
      ['tier1a.s', { tier: 'tier1a', blockingEligible: true }],
      ['tier1b.h', { tier: 'tier1b', blockingEligible: false }],
    ]);
    const tier1aFinding: LinterFinding = {
      chunkId: 'chunk-a',
      rule: 'tier1a.s',
      severity: 'blocking',
      category: 'structural',
      detail: 's',
    };
    const tier1bFinding: LinterFinding = {
      chunkId: 'chunk-a',
      rule: 'tier1b.h',
      severity: 'warning',
      category: 'heuristic',
      detail: 'h',
    };
    const report = buildSingleChunkValidatorReport(
      'chunk-a',
      [tier1aFinding, tier1bFinding],
      map,
      updatedAt
    );
    expect(report.tier1a).toEqual([tier1aFinding]);
    expect(report.tier1b).toEqual([{ ...tier1bFinding, blocking_eligible: false }]);
    expect(report.updated_at).toBe(updatedAt);
  });

  it('drops findings whose rule is absent from the meta map and warns', () => {
    const finding: LinterFinding = {
      chunkId: 'chunk-a',
      rule: 'tier1a.unknown',
      severity: 'blocking',
      category: 'structural',
      detail: 'd',
    };
    const report = buildSingleChunkValidatorReport('chunk-a', [finding], new Map(), updatedAt);
    expect(report).toEqual({ updated_at: updatedAt });
    expect(warnMock).toHaveBeenCalledWith(
      'Validator finding from unknown rule "tier1a.unknown" — dropped from validator_report for chunk chunk-a'
    );
  });
});

// ──────────────────────────────────────────────────────────────
// runTier2AuditPostCommit
// ──────────────────────────────────────────────────────────────

type Tier2DepsBuilder = {
  classifier: ContentClassifierPort;
  chunksRepo: ChunkRepository;
  mergeValidatorReport: ReturnType<typeof vi.fn>;
};

function buildTier2Deps(opts: {
  classify?: ContentClassifierPort['classify'];
  mergeValidatorReport?: ReturnType<typeof vi.fn>;
}): Tier2DepsBuilder {
  const classify = opts.classify ?? vi.fn().mockResolvedValue(cleanVerdict());
  const mergeValidatorReport = opts.mergeValidatorReport ?? vi.fn().mockResolvedValue(1);
  const chunksRepo = stubChunkRepository({
    mergeValidatorReport: mergeValidatorReport as ChunkRepository['mergeValidatorReport'],
  });
  return { classifier: { classify }, chunksRepo, mergeValidatorReport };
}

describe('runTier2AuditPostCommit', () => {
  beforeEach(() => {
    warnMock.mockClear();
    vi.mocked(logEvent).mockClear();
  });

  it('returns no findings or blocking hits and persists once when the verdict is clean', async () => {
    const { classifier, chunksRepo, mergeValidatorReport } = buildTier2Deps({});
    const result = await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow()],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
    });
    expect(result.findings).toEqual([]);
    expect(result.blockingHits).toEqual([]);
    expect(mergeValidatorReport).toHaveBeenCalledTimes(1);
  });

  it('emits a warning finding for a low-scoring non-blocking field', async () => {
    const { classifier, chunksRepo, mergeValidatorReport } = buildTier2Deps({
      classify: vi.fn().mockResolvedValue(lowOnRenderingClarity()),
    });
    const result = await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow()],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
    });
    expect(result.blockingHits).toEqual([]);
    expect(result.findings).toEqual([
      {
        chunkId: 'chunk-a',
        rule: 'classifier.rendering_clarity',
        severity: 'warning',
        category: 'tier2',
        detail: 'broken fences',
      },
    ]);
    expect(mergeValidatorReport).toHaveBeenCalledTimes(1);
  });

  it('routes a low-scoring blocking field to blockingHits, not findings', async () => {
    const { classifier, chunksRepo } = buildTier2Deps({
      classify: vi.fn().mockResolvedValue(lowOnRenderingClarity()),
    });
    const result = await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow()],
      classifier,
      chunksRepo,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
    });
    expect(result.findings).toEqual([]);
    expect(result.blockingHits).toEqual([
      {
        chunkId: 'chunk-a',
        field: 'rendering_clarity',
        score: 1,
        rationale: 'broken fences',
      },
    ]);
  });

  it('uses the shrunk set returned by the circuit-breaker', async () => {
    const { classifier, chunksRepo } = buildTier2Deps({
      classify: vi.fn().mockResolvedValue(lowOnRenderingClarity()),
    });
    const breaker: Tier2CircuitBreakerHandle = {
      applyTo: vi.fn().mockResolvedValue(new Set<VerdictFieldName>()),
    };
    const result = await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow()],
      classifier,
      chunksRepo,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      tier2CircuitBreaker: breaker,
    });
    expect(breaker.applyTo).toHaveBeenCalledTimes(1);
    expect(result.blockingHits).toEqual([]);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].rule).toBe('classifier.rendering_clarity');
  });

  it('falls back to the input blockingFields set when the circuit-breaker throws and warns', async () => {
    const { classifier, chunksRepo } = buildTier2Deps({
      classify: vi.fn().mockResolvedValue(lowOnRenderingClarity()),
    });
    const breaker: Tier2CircuitBreakerHandle = {
      applyTo: vi.fn().mockRejectedValue(new Error('breaker boom')),
    };
    const result = await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow()],
      classifier,
      chunksRepo,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      tier2CircuitBreaker: breaker,
    });
    expect(warnMock).toHaveBeenCalledWith(
      'Tier 2 circuit-breaker raised while applying — leaving blockingFields unchanged:',
      expect.any(Error)
    );
    expect(result.blockingHits).toHaveLength(1);
    expect(result.findings).toEqual([]);
  });

  it('does not invoke the circuit-breaker when blockingFields is empty', async () => {
    const { classifier, chunksRepo } = buildTier2Deps({});
    const breaker: Tier2CircuitBreakerHandle = {
      applyTo: vi.fn(),
    };
    await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow()],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
      tier2CircuitBreaker: breaker,
    });
    expect(breaker.applyTo).not.toHaveBeenCalled();
  });

  it('returns empty results, skips persistence, and warns on an all-null verdict', async () => {
    const { classifier, chunksRepo, mergeValidatorReport } = buildTier2Deps({
      classify: vi.fn().mockResolvedValue(allNullVerdict()),
    });
    const result = await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow()],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
    });
    expect(result.findings).toEqual([]);
    expect(result.blockingHits).toEqual([]);
    expect(mergeValidatorReport).not.toHaveBeenCalled();
    expect(warnMock).toHaveBeenCalledWith('Classifier returned all-null verdict for chunk chunk-a');
  });

  it('absorbs a classifier throw, emits classifier.classify_threw, and returns empty', async () => {
    const err = new Error('classifier exploded');
    const { classifier, chunksRepo, mergeValidatorReport } = buildTier2Deps({
      classify: vi.fn().mockRejectedValue(err),
    });
    const result = await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow()],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
    });
    expect(result.findings).toEqual([]);
    expect(result.blockingHits).toEqual([]);
    expect(mergeValidatorReport).not.toHaveBeenCalled();
    expect(warnMock).toHaveBeenCalledWith('Classifier threw for chunk chunk-a:', err);
    expect(logEvent).toHaveBeenCalledWith(
      'classifyChunk',
      'classifier.classify_threw',
      expect.objectContaining({
        chunk_id: 'chunk-a',
        error_class: 'Error',
        error_message: 'classifier exploded',
      }),
      expect.any(Number)
    );
  });

  it('returns empty results and never calls the classifier for an empty chunks array', async () => {
    const classify = vi.fn().mockResolvedValue(cleanVerdict());
    const { classifier, chunksRepo } = buildTier2Deps({ classify });
    const result = await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
    });
    expect(result.findings).toEqual([]);
    expect(result.blockingHits).toEqual([]);
    expect(classify).not.toHaveBeenCalled();
  });

  it('skips chunks with null content but classifies the rest', async () => {
    const classify = vi.fn().mockResolvedValue(cleanVerdict());
    const { classifier, chunksRepo } = buildTier2Deps({ classify });
    await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow({ id: 'empty', content: null }), chunkRow({ id: 'real' })],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
    });
    expect(classify).toHaveBeenCalledTimes(1);
    expect(classify.mock.calls[0][0].chunkId).toBe('real');
  });

  it('warns when mergeValidatorReport returns 0 rows and still surfaces the finding', async () => {
    const mergeValidatorReport = vi.fn().mockResolvedValue(0);
    const { classifier, chunksRepo } = buildTier2Deps({
      classify: vi.fn().mockResolvedValue(lowOnRenderingClarity()),
      mergeValidatorReport,
    });
    const result = await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow()],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
    });
    expect(warnMock).toHaveBeenCalledWith(
      'mergeValidatorReport affected 0 rows for chunk chunk-a (chunk missing?)'
    );
    expect(result.findings).toHaveLength(1);
  });

  it('warns when mergeValidatorReport throws and still surfaces the finding', async () => {
    const persistErr = new Error('db down');
    const mergeValidatorReport = vi.fn().mockRejectedValue(persistErr);
    const { classifier, chunksRepo } = buildTier2Deps({
      classify: vi.fn().mockResolvedValue(lowOnRenderingClarity()),
      mergeValidatorReport,
    });
    const result = await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow()],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
    });
    expect(warnMock).toHaveBeenCalledWith(
      'Persisting tier2 verdict failed for chunk chunk-a:',
      persistErr
    );
    expect(result.findings).toHaveLength(1);
  });

  it('logs a warning on the Promise.allSettled rejection branch and preserves sibling findings', async () => {
    // Force the classifyChunk async function to reject by making a property
    // access throw synchronously BEFORE any internal try/catch — `chunk.title`
    // is accessed by `toClassifierInput`, which is called outside the inner
    // try/catch around `classifier.classify`. A getter that throws bypasses
    // every defensive guard inside classifyChunk.
    const badChunk = chunkRow({ id: 'bad' });
    Object.defineProperty(badChunk, 'title', {
      get: () => {
        throw new Error('title access boom');
      },
    });
    const goodChunk = chunkRow({ id: 'good' });
    const classify = vi.fn().mockResolvedValue(lowOnRenderingClarity());
    const { classifier, chunksRepo } = buildTier2Deps({ classify });
    const result = await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [badChunk, goodChunk],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
    });
    expect(warnMock).toHaveBeenCalledWith(
      'Tier 2 classifier pass rejected for chunk bad:',
      expect.any(Error)
    );
    // The good chunk's finding still surfaces.
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].chunkId).toBe('good');
  });

  it('records non-Error throws as their typeof in the classifier.classify_threw event', async () => {
    const classify = vi.fn().mockImplementation(() => {
      throw 'string-shaped failure';
    });
    const { classifier, chunksRepo } = buildTier2Deps({ classify });
    await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow()],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
    });
    expect(logEvent).toHaveBeenCalledWith(
      'classifyChunk',
      'classifier.classify_threw',
      expect.objectContaining({
        error_class: 'string',
        error_message: 'string-shaped failure',
      }),
      expect.any(Number)
    );
  });

  it('handles chunks with null tagsJson and prerequisitesJson without throwing', async () => {
    const classify = vi.fn().mockResolvedValue(cleanVerdict());
    const { classifier, chunksRepo } = buildTier2Deps({ classify });
    await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow({ tagsJson: null, prerequisitesJson: null })],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
    });
    expect(classify).toHaveBeenCalledTimes(1);
    expect(classify.mock.calls[0][0].tags).toEqual([]);
    expect(classify.mock.calls[0][0].prerequisites).toEqual([]);
  });

  it('skips null verdict fields and only emits findings for the populated low-scoring ones', async () => {
    const partialVerdict: ChunkClassifierVerdict = {
      renderingClarity: { score: 1, rationale: 'unbalanced fences', applicable: true },
      vocabularyAppropriate: null,
      mathNotationRenderingRisk: null,
      definitionConstructive: { score: 4, rationale: 'constructive', applicable: true },
      epistemicConsistency: { score: 4, rationale: 'consistent', applicable: true },
      overallFit: { score: 5, rationale: 'good atom', applicable: true },
    };
    const { classifier, chunksRepo } = buildTier2Deps({
      classify: vi.fn().mockResolvedValue(partialVerdict),
    });
    const result = await runTier2AuditPostCommit({
      topicId: 'topic-1',
      chunks: [chunkRow()],
      classifier,
      chunksRepo,
      blockingFields: new Set(),
    });
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].rule).toBe('classifier.rendering_clarity');
  });
});

// ──────────────────────────────────────────────────────────────
// Re-exports
// ──────────────────────────────────────────────────────────────

describe('module re-exports', () => {
  it('re-exports TIER2_LOW_SCORE_THRESHOLD from domain config', () => {
    expect(typeof TIER2_LOW_SCORE_THRESHOLD).toBe('number');
    expect(TIER2_LOW_SCORE_THRESHOLD).toBe(2);
  });
});
