import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/shared/logger.js', () => ({
  getRequestLogger: vi.fn(() => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() })),
  logEvent: vi.fn(),
}));

import {
  updateChunkContent,
  updateChunkContentWithAutoReset,
  updateChunkWithProgressReset,
  createChunkWithTopic,
  type ChunkDeps,
} from '../../../src/orchestration/chunk-workflows.js';
import { logEvent } from '../../../src/shared/logger.js';
import type { EmbeddingPort } from '../../../src/ports/embedding-port.js';
import type { ContentClassifierPort } from '../../../src/ports/content-classifier-port.js';
import type { LearningChunk, NewLearningChunk } from '../../../src/domain/types/entities.js';
import type { LinterFinding, LinterRule } from '../../../src/domain/services/chunk-linter.js';
import type {
  ChunkClassifierVerdict,
  VerdictFieldName,
} from '../../../src/domain/types/classifier.js';
import {
  stubChunkRepository,
  stubTopicRepository,
  stubSessionRepository,
  stubUnitOfWork,
  stubEmbeddingPort,
} from '../../helpers/stub-ports.js';

// ── Fixtures ────────────────────────────────────────────────────

const NOW = 1_700_000_000_000;

function stubChunk(overrides?: Partial<LearningChunk>): LearningChunk {
  return {
    id: 'chunk-1',
    topicId: 'topic-1',
    title: 'Original Title',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW,
    easeFactor: 2.5,
    repetitions: 3,
    consecutiveFailures: 0,
    lastReviewedAt: NOW - 86_400_000,
    estimatedDuration: 15,
    intervalDays: 7,
    chunkType: 'review',
    contentStatus: 'final',
    condensedSummary: 'old summary',
    knowledgeType: null,
    validatorReport: null,
    prerequisitesJson: ['prereq-1'],
    tagsJson: ['math'],
    content: 'Original content here for testing.',
    contentVersion: 2,
    contentUpdatedAt: NOW - 100_000,
    createdAt: NOW - 1_000_000,
    updatedAt: NOW - 100_000,
    ...overrides,
  };
}

function blockingTier1aRule(): LinterRule {
  return {
    name: 'test.tier1a.always-block',
    scope: 'chunk',
    tier: 'tier1a',
    blockingEligible: true,
    run: input => [
      {
        chunkId: input.chunkId,
        rule: 'test.tier1a.always-block',
        severity: 'blocking',
        category: 'tier1a',
        detail: 'test block',
      },
    ],
  };
}

function warningTier1bRule(): LinterRule {
  return {
    name: 'test.tier1b.warn',
    scope: 'chunk',
    tier: 'tier1b',
    blockingEligible: false,
    run: input => [
      {
        chunkId: input.chunkId,
        rule: 'test.tier1b.warn',
        severity: 'warning',
        category: 'tier1b',
        detail: 'test warn',
      },
    ],
  };
}

function highScoreVerdict(): ChunkClassifierVerdict {
  return {
    renderingClarity: { score: 5, rationale: 'ok', applicable: true },
    vocabularyAppropriate: { score: 5, rationale: 'ok', applicable: true },
    mathNotationRenderingRisk: { score: 5, rationale: 'ok', applicable: true },
    definitionConstructive: { score: 5, rationale: 'ok', applicable: true },
    epistemicConsistency: { score: 5, rationale: 'ok', applicable: true },
    overallFit: { score: 5, rationale: 'ok', applicable: true },
  };
}

function lowScoreVerdict(field: VerdictFieldName, score = 1): ChunkClassifierVerdict {
  const verdict = highScoreVerdict();
  verdict[field] = { score, rationale: 'low score reason', applicable: true };
  return verdict;
}

function classifierStub(verdict: ChunkClassifierVerdict): ContentClassifierPort {
  return { classify: vi.fn().mockResolvedValue(verdict) };
}

type StubDepsOptions = {
  embedding?: EmbeddingPort;
  classifier?: ContentClassifierPort;
  enableClassifier?: boolean;
  blockingFields?: ReadonlySet<VerdictFieldName>;
  linterRules?: LinterRule[];
  topic?: { id: string; title: string; subject: string; summary?: string | null };
};

function stubDeps(options: StubDepsOptions = {}): ChunkDeps {
  const txChunks = stubChunkRepository({
    update: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(1),
  });
  const txPorts = {
    chunks: txChunks,
    topics: stubTopicRepository(),
    sessions: stubSessionRepository(),
  };
  const topic = options.topic ?? {
    id: 'topic-1',
    title: 'Topic 1',
    subject: 'CS',
    summary: 'topic summary',
  };
  return {
    chunks: stubChunkRepository({
      getById: vi.fn().mockResolvedValue(stubChunk()),
      update: vi.fn().mockResolvedValue(1),
      delete: vi.fn().mockResolvedValue(1),
      create: vi.fn().mockResolvedValue(undefined),
      saveContentEmbedding: vi.fn().mockResolvedValue(1),
      mergeValidatorReport: vi.fn().mockResolvedValue(1),
      findDependents: vi.fn().mockResolvedValue([]),
    }),
    topics: stubTopicRepository({
      getById: vi.fn().mockResolvedValue({
        id: topic.id,
        title: topic.title,
        subject: topic.subject,
        summary: topic.summary ?? null,
        summaryVersion: 1,
        summaryUpdatedAt: NOW,
        dependencyGraphType: null,
        createdAt: NOW,
        updatedAt: NOW,
      }),
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ success: true, data: undefined }),
      delete: vi.fn().mockResolvedValue({ success: true, data: { deleted: true } }),
    }),
    unitOfWork: stubUnitOfWork(undefined, txPorts),
    maxDependencyDepth: 5,
    ...(options.embedding ? { embedding: options.embedding } : {}),
    ...(options.classifier ? { classifier: options.classifier } : {}),
    ...(options.enableClassifier !== undefined
      ? { enableClassifier: options.enableClassifier }
      : {}),
    ...(options.blockingFields ? { blockingFields: options.blockingFields } : {}),
    ...(options.linterRules ? { linterRules: options.linterRules } : {}),
  };
}

// Helpers shared by every entry point describe block.

function chunkWithContent(
  content: string | null = 'Original content here for testing.'
): LearningChunk {
  return stubChunk({ content });
}

beforeEach(() => {
  vi.mocked(logEvent).mockClear();
});

// ── updateChunkContent — Tier 1 + Tier 2 audit chain ────────────

describe('updateChunkContent — Tier 1 + Tier 2 audit chain', () => {
  it('skips audit when linterRules is empty (no Tier 1, no Tier 2, no merge)', async () => {
    const deps = stubDeps({});
    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);
    expect(result.success).toBe(true);
    expect(deps.chunks.mergeValidatorReport).not.toHaveBeenCalled();
  });

  it('Tier 1a block — returns content_quality, no DB mutation, no embedding clear', async () => {
    const deps = stubDeps({ linterRules: [blockingTier1aRule()] });
    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    expect(result.error?.message).toContain('chunk-1');
    expect((result.error?.findings as LinterFinding[]).length).toBeGreaterThan(0);
    expect(deps.chunks.update).not.toHaveBeenCalled();
    expect(deps.chunks.saveContentEmbedding).not.toHaveBeenCalled();
    expect(deps.chunks.mergeValidatorReport).not.toHaveBeenCalled();
  });

  it('Tier 1b warn — succeeds, mergeValidatorReport called with tier1b array carrying blocking_eligible', async () => {
    const deps = stubDeps({ linterRules: [warningTier1bRule()] });
    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);
    expect(result.success).toBe(true);
    expect(deps.chunks.mergeValidatorReport).toHaveBeenCalledOnce();
    const [, partial] = (deps.chunks.mergeValidatorReport as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(partial.tier1a).toBeUndefined();
    expect(Array.isArray(partial.tier1b)).toBe(true);
    expect(partial.tier1b[0]).toMatchObject({
      rule: 'test.tier1b.warn',
      blocking_eligible: false,
    });
  });

  it('Tier 2 soft-warn (blockingFields empty) — succeeds with tier2Findings populated', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      linterRules: [],
    });
    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);
    expect(result.success).toBe(true);
    expect(result.tier2Findings).toBeDefined();
    expect(result.tier2Findings?.[0]?.severity).toBe('warning');
    expect(result.tier2Findings?.[0]?.rule).toBe('classifier.rendering_clarity');
  });

  it('Tier 2 block + reverse-UPDATE success — restores snapshot, content_quality returned, audit_path emitted', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    const before = chunkWithContent('Original content here for testing.');
    const after = stubChunk({ content: 'New content here' });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(before) // initial load
      .mockResolvedValueOnce(after); // post-update reload
    (deps.chunks.update as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(1) // initial update
      .mockResolvedValueOnce(1); // reverse-update

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    const findings = result.error?.findings as LinterFinding[];
    expect(findings[0].severity).toBe('blocking');
    expect(findings[0].rule).toBe('classifier.rendering_clarity');

    // Reverse-update: second `update` call carrying every snapshot field
    expect(deps.chunks.update).toHaveBeenCalledTimes(2);
    const reverseCall = (deps.chunks.update as ReturnType<typeof vi.fn>).mock.calls[1];
    expect(reverseCall[0]).toBe('chunk-1');
    expect(reverseCall[1]).toMatchObject({
      content: before.content,
      contentVersion: before.contentVersion,
      contentUpdatedAt: before.contentUpdatedAt,
      contentStatus: before.contentStatus,
      condensedSummary: before.condensedSummary,
      repetitions: before.repetitions,
      easeFactor: before.easeFactor,
      nextReviewAt: before.nextReviewAt,
      lastReviewedAt: before.lastReviewedAt,
      title: before.title,
      difficulty: before.difficulty,
      estimatedDuration: before.estimatedDuration,
      prerequisitesJson: before.prerequisitesJson,
      tagsJson: before.tagsJson,
    });
    // No `updatedAt` in the reverse-update — that field always advances.
    expect(reverseCall[1].updatedAt).toBeUndefined();

    // tier2_blocked event emitted with the right audit_path
    const blockEvents = vi
      .mocked(logEvent)
      .mock.calls.filter(c => c[1] === 'classifier.tier2_blocked');
    expect(blockEvents).toHaveLength(1);
    expect((blockEvents[0][2] as { audit_path: string }).audit_path).toBe('update_chunk_content');
  });

  it('Tier 2 block + reverse-UPDATE rowCount=0 — returns database retryable with chunk_id in message', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    (deps.chunks.update as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(1) // initial update
      .mockResolvedValueOnce(0); // reverse-update — chunk gone

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('database');
    expect(result.error?.retryable).toBe(true);
    expect(result.error?.message).toContain('chunk-1');
    expect(result.error?.message).toContain('rollback failed');
  });

  it('Tier 2 block + reverse-UPDATE throws — returns database retryable with chunk_id in message', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    (deps.chunks.update as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(1)
      .mockRejectedValueOnce(new Error('connection lost'));

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('database');
    expect(result.error?.retryable).toBe(true);
    expect(result.error?.message).toContain('chunk-1');
    expect(result.error?.message).toContain('connection lost');
  });

  it('Tier 2 block — re-embeds restored content best-effort', async () => {
    const embedding = stubEmbeddingPort({
      embedText: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    });
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      embedding,
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    const before = chunkWithContent('Original content here for testing.');
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(before)
      .mockResolvedValueOnce(stubChunk({ content: 'New content here' }));

    await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    // First embedText call: with NEW content (re-embed after update).
    // Second embedText call: with OLD content (re-embed after rollback).
    expect(embedding.embedText).toHaveBeenCalledWith('New content here');
    expect(embedding.embedText).toHaveBeenCalledWith(before.content);
  });

  it('Tier 2 block — clears stale embedding when snapshot.content is null but original update wrote a string', async () => {
    const embedding = stubEmbeddingPort({
      embedText: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    });
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      embedding,
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    const beforeNullContent = chunkWithContent(null);
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(beforeNullContent)
      .mockResolvedValueOnce(stubChunk({ content: 'New content here' }));

    await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    // saveContentEmbedding sequence:
    //   1) initial pre-update clear (null)
    //   2) post-update re-embed with NEW vector
    //   3) post-rollback clear (null) — the new vector is stale because content rolled back to null
    const calls = (deps.chunks.saveContentEmbedding as ReturnType<typeof vi.fn>).mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toBe('chunk-1');
    expect(lastCall[1]).toBeNull();
  });

  it('circuit-breaker shrinks blockingFields to empty — no block fires, success', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const tier2CircuitBreaker = {
      applyTo: vi.fn().mockResolvedValue(new Set<VerdictFieldName>()),
    };
    const deps: ChunkDeps = {
      ...stubDeps({
        classifier,
        enableClassifier: true,
        blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
        linterRules: [],
      }),
      tier2CircuitBreaker,
    };

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(true);
    // Only one update call (no reverse-UPDATE)
    expect(deps.chunks.update).toHaveBeenCalledTimes(1);
    // The score=1 routes to warning findings instead of blocking hits
    expect(result.tier2Findings).toBeDefined();
  });

  it('chunk-workflows mergeValidatorReport call carries only tier1 sections', async () => {
    // Tier 2 classifier (`runTier2AuditPostCommit`) ALSO calls
    // `mergeValidatorReport` internally to persist its `tier2` verdict, so this
    // test runs without a classifier wired in — that isolates the call made by
    // chunk-workflows itself, which must only carry `tier1a`/`tier1b` keys and
    // never `tier2` (the post-commit Tier 2 path owns the `tier2` section).
    const deps = stubDeps({
      linterRules: [warningTier1bRule()],
    });
    await updateChunkContent('chunk-1', { content: 'New content here' }, deps);
    expect(deps.chunks.mergeValidatorReport).toHaveBeenCalledOnce();
    const [, partial] = (deps.chunks.mergeValidatorReport as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(partial.tier2).toBeUndefined();
  });

  it('returns database retryable when chunk disappears between update and reload', async () => {
    const deps = stubDeps({});
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk()) // initial load
      .mockResolvedValueOnce(undefined); // post-update reload — concurrent delete

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('database');
    expect(result.error?.retryable).toBe(true);
    expect(result.error?.message).toContain('chunk-1');
  });

  it('mergeValidatorReport throw — chunk update still succeeds (fail-open)', async () => {
    const deps = stubDeps({ linterRules: [warningTier1bRule()] });
    (deps.chunks.mergeValidatorReport as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('jsonb merge crashed')
    );

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(true);
  });

  it('Tier 1 audit when topics.getById throws — falls back to safe defaults, audit still runs', async () => {
    const deps = stubDeps({ linterRules: [warningTier1bRule()] });
    (deps.topics.getById as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('topic load crashed')
    );

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    // Topic load failure does not block the audit — Tier 1 runs against a
    // synthetic empty topic context and the row update proceeds.
    expect(result.success).toBe(true);
    expect(deps.chunks.mergeValidatorReport).toHaveBeenCalledOnce();
  });

  it('passes current.topicId in TopicLintInput on update path (NEU-686 PR feedback)', async () => {
    const customRule: LinterRule = {
      name: 'test.tier1a.captures-topic-id',
      scope: 'topic',
      tier: 'tier1a',
      blockingEligible: true,
      run: input => {
        if (input.topicId !== 'topic-1') {
          // Surface as a finding so the assertion below can read the value.
          return [
            {
              chunkId: input.chunks[0]?.chunkId ?? '',
              rule: 'test.tier1a.captures-topic-id',
              severity: 'blocking',
              category: 'tier1a',
              detail: `expected topic-1, got "${input.topicId}"`,
            },
          ];
        }
        return [];
      },
    };
    const deps = stubDeps({ linterRules: [customRule] });

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    // The topic-scoped rule receives `current.topicId` (not '').
    expect(result.success).toBe(true);
  });

  it('Tier 2 runs when blockingFields omitted — high-score path produces no findings, no snapshot capture', async () => {
    const classifier = classifierStub(highScoreVerdict());
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      // No blockingFields — Tier 2 fans out for warnings only, snapshot gate skipped.
      linterRules: [],
    });

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(true);
    expect(classifier.classify).toHaveBeenCalled();
    // No reverse-UPDATE because no blocking hits.
    expect(deps.chunks.update).toHaveBeenCalledTimes(1);
  });
});

// ── createChunkWithTopic — topicId forwarding regression guard ─────

describe('createChunkWithTopic — Tier 1 topicId forwarding (NEU-686 PR feedback)', () => {
  it('passes input.topicId in TopicLintInput when caller supplies an existing topicId', async () => {
    const customRule: LinterRule = {
      name: 'test.tier1a.captures-topic-id-create',
      scope: 'topic',
      tier: 'tier1a',
      blockingEligible: true,
      run: input => {
        if (input.topicId !== 'existing-topic') {
          return [
            {
              chunkId: input.chunks[0]?.chunkId ?? '',
              rule: 'test.tier1a.captures-topic-id-create',
              severity: 'blocking',
              category: 'tier1a',
              detail: `expected existing-topic, got "${input.topicId}"`,
            },
          ];
        }
        return [];
      },
    };
    const deps = stubDeps({ linterRules: [customRule] });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk', topicId: 'existing-topic' })
    );

    const result = await createChunkWithTopic(
      {
        id: 'new-chunk',
        topicId: 'existing-topic',
        title: 'New Chunk',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: NOW,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        content: 'Some valid content for the chunk.',
        createdAt: NOW,
        updatedAt: NOW,
      },
      deps
    );

    // Lint rule passes because it received the real topicId, not ''.
    expect(result.success).toBe(true);
  });

  it('topic load returns undefined — falls back to safe defaults, audit still runs', async () => {
    const seenContext: Array<{ topicId: string; topicTitle: string; topicSummary: string }> = [];
    const captureRule: LinterRule = {
      name: 'test.tier1a.records-context',
      scope: 'topic',
      tier: 'tier1a',
      blockingEligible: true,
      run: input => {
        seenContext.push({
          topicId: input.topicId,
          topicTitle: input.topicTitle,
          topicSummary: input.topicSummary,
        });
        return [];
      },
    };
    const deps = stubDeps({ linterRules: [captureRule] });
    (deps.topics.getById as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(true);
    expect(seenContext).toHaveLength(1);
    expect(seenContext[0].topicTitle).toBe('');
    expect(seenContext[0].topicSummary).toBe('');
    // current.topicId is still passed (the topic load failure doesn't change that).
    expect(seenContext[0].topicId).toBe('topic-1');
  });

  it('topic.summary is null — defaults to empty string in lint input', async () => {
    const seenSummaries: string[] = [];
    const captureRule: LinterRule = {
      name: 'test.tier1a.records-summary',
      scope: 'topic',
      tier: 'tier1a',
      blockingEligible: true,
      run: input => {
        seenSummaries.push(input.topicSummary);
        return [];
      },
    };
    const deps = stubDeps({
      linterRules: [captureRule],
      topic: { id: 'topic-1', title: 'T', subject: 'CS', summary: null },
    });

    await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(seenSummaries).toEqual(['']);
  });

  it('updateChunkWithProgressReset with no content — audit still runs, no clear-stale-embedding step', async () => {
    const deps = stubDeps({ linterRules: [warningTier1bRule()] });

    const result = await updateChunkWithProgressReset('chunk-1', { title: 'New Title Only' }, deps);

    expect(result.success).toBe(true);
    // No content field → no embedding clear, no re-embed.
    expect(deps.chunks.saveContentEmbedding).not.toHaveBeenCalled();
    expect(deps.chunks.mergeValidatorReport).toHaveBeenCalledOnce();
  });

  it('updateChunkContent with condensedSummary in input — lint sees proposed condensed summary', async () => {
    const seenSummaries: Array<string | null> = [];
    const captureRule: LinterRule = {
      name: 'test.tier1a.records-condensed',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: input => {
        seenSummaries.push(input.condensedSummary);
        return [];
      },
    };
    const deps = stubDeps({ linterRules: [captureRule] });

    await updateChunkContent(
      'chunk-1',
      { content: 'New content here', condensedSummary: 'Updated summary.' },
      deps
    );

    // hasCondensedSummaryField=true branch: lint receives the proposed value.
    expect(seenSummaries[0]).toBe('Updated summary.');
  });

  it('updateChunkContent with chunk having null prerequisites/tags — buildUpdateLintInput uses [] fallback', async () => {
    const seenInputs: Array<{ prerequisites: readonly string[]; tags: readonly string[] }> = [];
    const captureRule: LinterRule = {
      name: 'test.tier1a.records-arrays',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: input => {
        seenInputs.push({ prerequisites: input.prerequisites, tags: input.tags });
        return [];
      },
    };
    const deps = stubDeps({ linterRules: [captureRule] });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk({ prerequisitesJson: null, tagsJson: null }))
      .mockResolvedValueOnce(stubChunk());

    await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(seenInputs[0].prerequisites).toEqual([]);
    expect(seenInputs[0].tags).toEqual([]);
  });

  it('multiple Tier 1a blocking findings — plural "findings" in error message', async () => {
    const multiBlockRule: LinterRule = {
      name: 'test.tier1a.multi-block',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: input => [
        {
          chunkId: input.chunkId,
          rule: 'test.tier1a.multi-block',
          severity: 'blocking',
          category: 'tier1a',
          detail: 'first',
        },
        {
          chunkId: input.chunkId,
          rule: 'test.tier1a.multi-block',
          severity: 'blocking',
          category: 'tier1a',
          detail: 'second',
        },
      ],
    };
    const deps = stubDeps({ linterRules: [multiBlockRule] });

    const result = await updateChunkContent('chunk-1', { content: 'x' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('2 content-quality findings');
  });

  it('Tier 1a non-blocking-eligible rule produces warning finding — merged into tier1a section', async () => {
    const tier1aWarnRule: LinterRule = {
      name: 'test.tier1a.warn-only',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true, // blocking-eligible but rule itself emits warning severity
      run: input => [
        {
          chunkId: input.chunkId,
          rule: 'test.tier1a.warn-only',
          severity: 'warning',
          category: 'tier1a',
          detail: 'tier1a warning',
        },
      ],
    };
    const deps = stubDeps({ linterRules: [tier1aWarnRule] });

    await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(deps.chunks.mergeValidatorReport).toHaveBeenCalledOnce();
    const [, partial] = (deps.chunks.mergeValidatorReport as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(partial.tier1a).toBeDefined();
    expect(Array.isArray(partial.tier1a)).toBe(true);
  });

  it('Tier 2 block — saveContentEmbedding rowCount=0 on rollback re-embed (string content)', async () => {
    const embedding = stubEmbeddingPort({
      embedText: vi.fn().mockResolvedValue([0.1, 0.2]),
    });
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      embedding,
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    // Initial pre-update clear (1), post-update re-embed (1), rollback re-embed → 0 rows
    (deps.chunks.saveContentEmbedding as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
  });

  it('Tier 2 block — re-embed throws on rollback (string content) — fail-open warn', async () => {
    let embedCallCount = 0;
    const embedding = stubEmbeddingPort({
      embedText: vi.fn().mockImplementation(async () => {
        embedCallCount += 1;
        // 1st call: post-update re-embed succeeds. 2nd call: rollback re-embed throws.
        if (embedCallCount === 2) throw new Error('embed crashed');
        return [0.1, 0.2];
      }),
    });
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      embedding,
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    // Workflow still returns content_quality (rollback re-embed is best-effort).
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
  });

  it('Tier 2 block — saveContentEmbedding rowCount=0 on rollback clear (null content)', async () => {
    const embedding = stubEmbeddingPort({
      embedText: vi.fn().mockResolvedValue([0.1, 0.2]),
    });
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      embedding,
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(chunkWithContent(null))
      .mockResolvedValueOnce(stubChunk({ content: 'New content here' }));
    // Pre-update clear (1), post-update re-embed (1), rollback clear → 0 rows
    (deps.chunks.saveContentEmbedding as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(false);
  });

  it('Tier 2 block — saveContentEmbedding throws on rollback clear (null content) — fail-open', async () => {
    let saveCallCount = 0;
    const embedding = stubEmbeddingPort({
      embedText: vi.fn().mockResolvedValue([0.1, 0.2]),
    });
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      embedding,
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(chunkWithContent(null))
      .mockResolvedValueOnce(stubChunk({ content: 'New content here' }));
    (deps.chunks.saveContentEmbedding as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      saveCallCount += 1;
      // 1st: pre-clear OK. 2nd: post-update embed OK. 3rd: rollback clear THROWS.
      if (saveCallCount === 3) throw new Error('embedding write crashed');
      return 1;
    });

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    // Workflow still returns content_quality.
    expect(result.success).toBe(false);
  });

  it('passes empty topicId on auto-create branch (topicId not yet allocated)', async () => {
    const seenTopicIds: string[] = [];
    const customRule: LinterRule = {
      name: 'test.tier1a.records-topic-id',
      scope: 'topic',
      tier: 'tier1a',
      blockingEligible: true,
      run: input => {
        seenTopicIds.push(input.topicId);
        return [];
      },
    };
    const deps = stubDeps({ linterRules: [customRule] });
    (deps.topics.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );

    await createChunkWithTopic(
      {
        id: 'new-chunk',
        topicId: '',
        title: 'New Chunk',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: NOW,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        content: 'Some valid content for the chunk.',
        createdAt: NOW,
        updatedAt: NOW,
        topicTitle: 'Auto Created',
      },
      deps
    );

    // Empty topicId is correct here — caller did not supply one and the
    // topic UUID is allocated downstream of the lint.
    expect(seenTopicIds).toEqual(['']);
  });

  it('topics.getById throws — falls back to empty topic context, audit still runs', async () => {
    const deps = stubDeps({ linterRules: [warningTier1bRule()] });
    (deps.topics.getById as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('topic load crashed in create path')
    );
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );

    const result = await createChunkWithTopic(
      {
        id: 'new-chunk',
        topicId: 'existing-topic',
        title: 'New Chunk',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: NOW,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        content: 'Some valid content for the chunk.',
        createdAt: NOW,
        updatedAt: NOW,
      },
      deps
    );

    // Topic load failure does not block creation.
    expect(result.success).toBe(true);
  });

  it('topic.summary is null on existing topic — defaults to empty string in lint input', async () => {
    const seenSummaries: string[] = [];
    const captureRule: LinterRule = {
      name: 'test.tier1a.create-records-summary',
      scope: 'topic',
      tier: 'tier1a',
      blockingEligible: true,
      run: input => {
        seenSummaries.push(input.topicSummary);
        return [];
      },
    };
    const deps = stubDeps({
      linterRules: [captureRule],
      topic: { id: 'topic-1', title: 'T', subject: 'CS', summary: null },
    });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );

    await createChunkWithTopic(
      {
        id: 'new-chunk',
        topicId: 'topic-1',
        title: 'New Chunk',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: NOW,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        content: 'Some valid content for the chunk.',
        createdAt: NOW,
        updatedAt: NOW,
      },
      deps
    );

    expect(seenSummaries).toEqual(['']);
  });

  it('Tier 2 classifier throws — chunk creation still succeeds (fail-open)', async () => {
    const classifier: ContentClassifierPort = {
      classify: vi.fn().mockRejectedValue(new Error('classifier crashed')),
    };
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      linterRules: [],
    });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );

    const result = await createChunkWithTopic(
      {
        id: 'new-chunk',
        topicId: 'existing-topic',
        title: 'New Chunk',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: NOW,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        content: 'Some valid content for the chunk.',
        createdAt: NOW,
        updatedAt: NOW,
      },
      deps
    );

    expect(result.success).toBe(true);
  });

  it('Tier 2 block — chunk delete throws: returns database retryable with chunk_id', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );
    (deps.chunks.delete as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('chunk delete crashed')
    );

    const result = await createChunkWithTopic(
      {
        id: 'new-chunk',
        topicId: 'existing-topic',
        title: 'New Chunk',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: NOW,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        content: 'Some valid content for the chunk.',
        createdAt: NOW,
        updatedAt: NOW,
      },
      deps
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
      expect(result.error.retryable).toBe(true);
      expect(result.error.message).toContain('new-chunk');
      expect(result.error.message).toContain('chunk delete crashed');
    }
  });

  it('Tier 2 block — auto-topic delete returns success:false: returns database retryable', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    (deps.topics.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );
    (deps.topics.delete as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: { type: 'database', message: 'foreign-key constraint' },
    });

    const result = await createChunkWithTopic(
      {
        id: 'new-chunk',
        topicId: '',
        title: 'New Chunk',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: NOW,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        content: 'Some valid content for the chunk.',
        createdAt: NOW,
        updatedAt: NOW,
        topicTitle: 'Auto Created Topic',
      },
      deps
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
      expect(result.error.retryable).toBe(true);
      expect(result.error.message).toContain('foreign-key constraint');
    }
  });

  it('Tier 2 block — auto-topic delete returns success:false with no error message: still rollback failed', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    (deps.topics.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );
    (deps.topics.delete as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
    });

    const result = await createChunkWithTopic(
      {
        id: 'new-chunk',
        topicId: '',
        title: 'New Chunk',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: NOW,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        content: 'Some valid content for the chunk.',
        createdAt: NOW,
        updatedAt: NOW,
        topicTitle: 'Auto Created Topic',
      },
      deps
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
      expect(result.error.message).toContain('unknown');
    }
  });

  it('multiple Tier 2 blocking hits on update — message includes "and N other field(s)"', async () => {
    const verdict = highScoreVerdict();
    verdict.renderingClarity = { score: 1, rationale: 'low rc', applicable: true };
    verdict.overallFit = { score: 1, rationale: 'low fit', applicable: true };
    const classifier: ContentClassifierPort = {
      classify: vi.fn().mockResolvedValue(verdict),
    };
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity', 'overallFit']),
      linterRules: [],
    });

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    expect(result.error?.message).toContain('and 1 other field(s)');
  });

  it('chunk with contentVersion=null — `|| 1` fallback fires on updateChunkContent', async () => {
    const deps = stubDeps({});
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk({ contentVersion: null }))
      .mockResolvedValueOnce(stubChunk({ contentVersion: 2 }));

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(true);
    // `|| 1` fallback yields contentVersion=2
    expect(deps.chunks.update).toHaveBeenCalledWith(
      'chunk-1',
      expect.objectContaining({ contentVersion: 2 })
    );
  });

  it('chunk with contentVersion=null — `|| 1` fallback fires on updateChunkContentWithAutoReset', async () => {
    const deps = stubDeps({});
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk({ contentVersion: null, content: null }))
      .mockResolvedValueOnce(stubChunk({ contentVersion: 2 }));

    const result = await updateChunkContentWithAutoReset(
      'chunk-1',
      { content: 'Brand new content' },
      deps
    );

    expect(result.success).toBe(true);
    expect(deps.chunks.update).toHaveBeenCalledWith(
      'chunk-1',
      expect.objectContaining({ contentVersion: 2 })
    );
  });

  it('chunk with contentVersion=null — `|| 1` fallback fires on updateChunkWithProgressReset', async () => {
    const deps = stubDeps({});
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubChunk({ contentVersion: null }))
      .mockResolvedValueOnce(stubChunk({ contentVersion: 2 }));

    const result = await updateChunkWithProgressReset(
      'chunk-1',
      { content: 'Brand new content' },
      deps
    );

    expect(result.success).toBe(true);
    expect(deps.chunks.update).toHaveBeenCalledWith(
      'chunk-1',
      expect.objectContaining({ contentVersion: 2 })
    );
  });

  it('Tier 2 soft-warn merges into final findings on success', async () => {
    // Test that on success the tier2Findings array is populated AND merged into result.
    const lowField: VerdictFieldName = 'vocabularyAppropriate';
    const verdict = highScoreVerdict();
    verdict[lowField] = { score: 2, rationale: 'borderline', applicable: true };
    const classifier: ContentClassifierPort = {
      classify: vi.fn().mockResolvedValue(verdict),
    };
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      // No blockingFields — this routes the field to warning findings.
      linterRules: [],
    });

    const result = await updateChunkContent('chunk-1', { content: 'New content here' }, deps);

    expect(result.success).toBe(true);
    expect(result.tier2Findings).toBeDefined();
    expect(result.tier2Findings?.length).toBeGreaterThan(0);
    expect(result.tier2Findings?.[0]?.severity).toBe('warning');
  });

  it('Tier 2 rationale > 256 chars — truncated with marker in event payload', async () => {
    const longRationale = 'r'.repeat(500);
    const verdict = highScoreVerdict();
    verdict.renderingClarity = { score: 1, rationale: longRationale, applicable: true };
    const classifier: ContentClassifierPort = {
      classify: vi.fn().mockResolvedValue(verdict),
    };
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );

    await createChunkWithTopic(
      {
        id: 'new-chunk',
        topicId: 'existing-topic',
        title: 'New Chunk',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: NOW,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        content: 'Some valid content for the chunk.',
        createdAt: NOW,
        updatedAt: NOW,
      },
      deps
    );

    const blockEvents = vi
      .mocked(logEvent)
      .mock.calls.filter(c => c[1] === 'classifier.tier2_blocked');
    expect(blockEvents).toHaveLength(1);
    const data = blockEvents[0][2] as { rationale: string };
    expect(data.rationale.endsWith('…[truncated]')).toBe(true);
    expect(data.rationale.length).toBeLessThanOrEqual(256 + '…[truncated]'.length);
  });
});

// ── updateChunkContentWithAutoReset — branch coverage ──────────

describe('updateChunkContentWithAutoReset — Tier 1 + Tier 2 audit chain', () => {
  it('Tier 2 block on auto-reset path emits audit_path = update_chunk_content_with_auto_reset', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    await updateChunkContentWithAutoReset(
      'chunk-1',
      { content: 'Brand new totally rewritten content here' },
      deps
    );
    const blockEvents = vi
      .mocked(logEvent)
      .mock.calls.filter(c => c[1] === 'classifier.tier2_blocked');
    expect(blockEvents).toHaveLength(1);
    expect((blockEvents[0][2] as { audit_path: string }).audit_path).toBe(
      'update_chunk_content_with_auto_reset'
    );
  });

  it('Tier 1a block returns content_quality without DB mutation', async () => {
    const deps = stubDeps({ linterRules: [blockingTier1aRule()] });
    const result = await updateChunkContentWithAutoReset('chunk-1', { content: 'x' }, deps);
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    expect(deps.chunks.update).not.toHaveBeenCalled();
  });
});

// ── updateChunkWithProgressReset — branch coverage ─────────────

describe('updateChunkWithProgressReset — Tier 1 + Tier 2 audit chain', () => {
  it('Tier 2 block restores metadata fields written by this entry point', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    const before = chunkWithContent('Original content here for testing.');
    (deps.chunks.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(before)
      .mockResolvedValueOnce(stubChunk({ title: 'New Title' }));

    await updateChunkWithProgressReset(
      'chunk-1',
      {
        content: 'Brand new totally rewritten content here',
        title: 'New Title',
        difficulty: 9,
        prerequisites: ['new-prereq'],
        tags: ['new-tag'],
        estimatedDuration: 30,
      },
      deps
    );

    // Reverse-UPDATE must restore metadata fields the buildFields callback wrote.
    expect(deps.chunks.update).toHaveBeenCalledTimes(2);
    const reverseCall = (deps.chunks.update as ReturnType<typeof vi.fn>).mock.calls[1];
    expect(reverseCall[1]).toMatchObject({
      title: before.title,
      difficulty: before.difficulty,
      estimatedDuration: before.estimatedDuration,
      prerequisitesJson: before.prerequisitesJson,
      tagsJson: before.tagsJson,
    });
  });

  it('Tier 2 block on this path emits audit_path = update_chunk_with_progress_reset', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    await updateChunkWithProgressReset(
      'chunk-1',
      { content: 'Brand new totally rewritten content here', forceReset: true },
      deps
    );
    const blockEvents = vi
      .mocked(logEvent)
      .mock.calls.filter(c => c[1] === 'classifier.tier2_blocked');
    expect(blockEvents).toHaveLength(1);
    expect((blockEvents[0][2] as { audit_path: string }).audit_path).toBe(
      'update_chunk_with_progress_reset'
    );
  });
});

// ── createChunkWithTopic — Tier 1 + Tier 2 audit chain ─────────

describe('createChunkWithTopic — Tier 1 + Tier 2 audit chain', () => {
  const baseInput: NewLearningChunk & { topicTitle?: string } = {
    id: 'new-chunk',
    topicId: 'existing-topic',
    title: 'New Chunk',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW,
    easeFactor: 2.5,
    repetitions: 0,
    estimatedDuration: 10,
    chunkType: 'new',
    content: 'Some valid content for the chunk.',
    createdAt: NOW,
    updatedAt: NOW,
  };

  it('Tier 1a block — no DB writes, returns content_quality', async () => {
    const deps = stubDeps({ linterRules: [blockingTier1aRule()] });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const input = { ...baseInput, id: 'new-chunk' };

    const result = await createChunkWithTopic(input, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('content_quality');
      expect(result.error.message).toContain('new-chunk');
    }
    expect(deps.chunks.create).not.toHaveBeenCalled();
    expect(deps.topics.create).not.toHaveBeenCalled();
  });

  it('persists with inlined validatorReport when linterRules supplied (success path)', async () => {
    const deps = stubDeps({ linterRules: [warningTier1bRule()] });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );

    const result = await createChunkWithTopic(baseInput, deps);

    expect(result.success).toBe(true);
    const createCall = (deps.chunks.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.validatorReport).toBeDefined();
    expect(createCall.validatorReport.tier1b).toBeDefined();
  });

  it('Tier 2 block — auto-created topic: chunk + topic both deleted', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    (deps.topics.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );
    const input = { ...baseInput, topicId: '', topicTitle: 'Brand New Topic' };

    const result = await createChunkWithTopic(input, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('content_quality');
    }
    expect(deps.chunks.delete).toHaveBeenCalledWith('new-chunk');
    expect(deps.topics.delete).toHaveBeenCalledOnce();

    // audit_path on the emission
    const blockEvents = vi
      .mocked(logEvent)
      .mock.calls.filter(c => c[1] === 'classifier.tier2_blocked');
    expect(blockEvents).toHaveLength(1);
    expect((blockEvents[0][2] as { audit_path: string }).audit_path).toBe(
      'create_chunk_with_topic'
    );
  });

  it('Tier 2 block — existing topic reused: only chunk deleted, topic preserved', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    (deps.topics.list as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'found-topic', title: 'Existing Topic', subject: 'CS' },
    ]);
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk', topicId: 'found-topic' })
    );
    const input = { ...baseInput, topicId: '', topicTitle: 'Existing Topic' };

    const result = await createChunkWithTopic(input, deps);

    expect(result.success).toBe(false);
    expect(deps.chunks.delete).toHaveBeenCalledOnce();
    expect(deps.topics.delete).not.toHaveBeenCalled();
  });

  it('Tier 2 block — chunk delete fails (rowCount=0): returns database retryable with chunk_id', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );
    (deps.chunks.delete as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const result = await createChunkWithTopic(baseInput, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
      expect(result.error.retryable).toBe(true);
      expect(result.error.message).toContain('new-chunk');
    }
  });

  it('Tier 2 block — auto-created topic delete throws: returns database retryable', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      blockingFields: new Set<VerdictFieldName>(['renderingClarity']),
      linterRules: [],
    });
    (deps.topics.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );
    (deps.topics.delete as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('topic delete boom')
    );
    const input = { ...baseInput, topicId: '', topicTitle: 'Brand New Topic' };

    const result = await createChunkWithTopic(input, deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('database');
      expect(result.error.retryable).toBe(true);
      expect(result.error.message).toContain('new-chunk');
    }
  });

  it('Tier 2 soft-warn (no blocking) — success carries tier2Findings on the result', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 2));
    const deps = stubDeps({
      classifier,
      enableClassifier: true,
      linterRules: [],
    });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );

    const result = await createChunkWithTopic(baseInput, deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.chunk.id).toBe('new-chunk');
      expect(result.data.tier2Findings).toBeDefined();
      expect(result.data.tier2Findings?.[0]?.severity).toBe('warning');
    }
  });

  it('classifier disabled — no Tier 2 call, no tier2Findings on success', async () => {
    const classifier = classifierStub(lowScoreVerdict('renderingClarity', 1));
    const deps = stubDeps({
      classifier,
      enableClassifier: false,
      linterRules: [],
    });
    (deps.chunks.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      stubChunk({ id: 'new-chunk' })
    );

    const result = await createChunkWithTopic(baseInput, deps);

    expect(result.success).toBe(true);
    expect(classifier.classify).not.toHaveBeenCalled();
    if (result.success) {
      expect(result.data.tier2Findings).toBeUndefined();
    }
  });
});
