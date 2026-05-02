import { describe, it, beforeAll, beforeEach, afterAll, afterEach, expect, vi } from 'vitest';
import crypto from 'node:crypto';
import type pino from 'pino';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { DrizzleChunkRepository } from '../../../src/adapters/drizzle/chunk-repository.js';
import { DrizzleTopicRepository } from '../../../src/adapters/drizzle/topic-repository.js';
import { DrizzleUnitOfWorkAdapter } from '../../../src/adapters/drizzle/unit-of-work-adapter.js';
import {
  createTopicWithChunks,
  type TopicCreationInput,
  type TopicDeps,
} from '../../../src/orchestration/topic-workflows.js';
import type { ContentClassifierPort } from '../../../src/ports/content-classifier-port.js';
import type { ChunkClassifierVerdict } from '../../../src/domain/types/classifier.js';
import { setEventLogger } from '../../../src/shared/logger.js';
import { sql } from 'drizzle-orm';
import { createTier2CircuitBreaker } from '../../../src/orchestration/tier2-circuit-breaker.js';
import { DrizzleTier2BlockingStatsRepository } from '../../../src/adapters/drizzle/tier2-blocking-stats-repository.js';

function makeInput(chunkIds: string[]): TopicCreationInput {
  return {
    topicTitle: 'Tier 2 Classifier Integration Topic',
    topicDescription: 'Topic for NEU-620 integration tests',
    subject: 'CS',
    topicSummary: 'Summary used by NEU-620 tier2 integration tests.',
    chunks: chunkIds.map((id, i) => ({
      id,
      title: `Chunk ${i + 1}`,
      content: `Content for chunk ${i + 1}.`,
      difficulty: 3,
      estimatedDuration: 10,
      prerequisites: [],
      tags: [],
      chunkType: 'new',
    })),
  };
}

function lowScoreVerdict(): ChunkClassifierVerdict {
  return {
    renderingClarity: { score: 2, rationale: 'fence balance risk', applicable: true },
    vocabularyAppropriate: { score: 4, rationale: 'ok', applicable: true },
    mathNotationRenderingRisk: { score: 5, rationale: 'no math', applicable: false },
    definitionConstructive: { score: 4, rationale: 'constructive', applicable: true },
    epistemicConsistency: { score: 4, rationale: 'consistent', applicable: true },
    overallFit: { score: 2, rationale: 'smells like TOC', applicable: true },
  };
}

function buildDeps(options: {
  classifier?: ContentClassifierPort;
  enableClassifier?: boolean;
}): TopicDeps {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    embedding: undefined,
    linterRules: [],
    ...(options.classifier ? { classifier: options.classifier } : {}),
    ...(options.enableClassifier !== undefined
      ? { enableClassifier: options.enableClassifier }
      : {}),
  };
}

describe('createTopicWithChunks — Tier 2 classifier integration (NEU-620)', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('persists snake_cased tier2 verdict and surfaces low-score warnings', async () => {
    const ids = [crypto.randomUUID(), crypto.randomUUID()];
    const classify = vi.fn().mockResolvedValue(lowScoreVerdict());
    const classifier: ContentClassifierPort = { classify };

    const result = await createTopicWithChunks(
      makeInput(ids),
      buildDeps({ classifier, enableClassifier: true })
    );
    expect(result.success).toBe(true);
    expect(classify).toHaveBeenCalledTimes(2);

    const db = getSql();
    const repo = new DrizzleChunkRepository(db);

    for (const id of ids) {
      const report = await repo.getValidatorReport(id);
      expect(report).not.toBeNull();
      const tier2 = report?.tier2 as Record<string, unknown> | undefined;
      expect(tier2).toBeDefined();
      expect(tier2?.rendering_clarity).toEqual({
        score: 2,
        rationale: 'fence balance risk',
        applicable: true,
      });
      expect(tier2?.overall_fit).toEqual({
        score: 2,
        rationale: 'smells like TOC',
        applicable: true,
      });
      expect(tier2?.vocabulary_appropriate).toEqual({
        score: 4,
        rationale: 'ok',
        applicable: true,
      });
      expect(tier2?.prompt_version).toBe('1.1.0');
      expect(typeof tier2?.classified_at).toBe('string');
    }

    // Each chunk should contribute 2 warnings (rendering_clarity, overall_fit).
    expect(result.topic?.tier2Findings).toHaveLength(4);
    const rules = (result.topic?.tier2Findings ?? []).map(f => f.rule).sort();
    expect(rules).toEqual([
      'classifier.overall_fit',
      'classifier.overall_fit',
      'classifier.rendering_clarity',
      'classifier.rendering_clarity',
    ]);
    for (const finding of result.topic?.tier2Findings ?? []) {
      expect(finding.severity).toBe('warning');
      expect(finding.category).toBe('tier2');
    }
  });

  it('produces no tier2 key and no findings when classifier is absent', async () => {
    const ids = [crypto.randomUUID()];
    const result = await createTopicWithChunks(
      makeInput(ids),
      buildDeps({ enableClassifier: true })
    );
    expect(result.success).toBe(true);
    expect(result.topic?.tier2Findings).toBeUndefined();

    const db = getSql();
    const repo = new DrizzleChunkRepository(db);
    const report = await repo.getValidatorReport(ids[0]);
    expect(report).not.toBeNull();
    expect(report?.tier2).toBeUndefined();
  });

  it('produces no tier2 key when enableClassifier is false', async () => {
    const ids = [crypto.randomUUID()];
    const classify = vi.fn().mockResolvedValue(lowScoreVerdict());
    const classifier: ContentClassifierPort = { classify };

    const result = await createTopicWithChunks(
      makeInput(ids),
      buildDeps({ classifier, enableClassifier: false })
    );
    expect(result.success).toBe(true);
    expect(classify).not.toHaveBeenCalled();
    expect(result.topic?.tier2Findings).toBeUndefined();

    const db = getSql();
    const repo = new DrizzleChunkRepository(db);
    const report = await repo.getValidatorReport(ids[0]);
    expect(report).not.toBeNull();
    expect(report?.tier2).toBeUndefined();
  });

  it('getValidatorReport returns null for an unknown chunk id', async () => {
    const repo = new DrizzleChunkRepository(getSql());
    const report = await repo.getValidatorReport('no-such-chunk-id');
    expect(report).toBeNull();
  });
});

// ── NEU-639: event logging via setEventLogger ──────────────────────
describe('Tier 2 classifier event logging (NEU-639)', () => {
  let captured: Array<Record<string, unknown>>;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
    captured = [];
    const fakeLogger = {
      info: (obj: Record<string, unknown>) => {
        captured.push(obj);
      },
    } as unknown as pino.Logger;
    setEventLogger(fakeLogger);
  });

  afterEach(() => {
    setEventLogger(null);
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  function eventsByName(name: string): Array<Record<string, unknown>> {
    return captured.filter(e => e.event === name);
  }

  it('captures classifier.chunk_verdict with snake_case data when classify succeeds', async () => {
    const ids = [crypto.randomUUID()];
    const classify = vi.fn().mockResolvedValue(lowScoreVerdict());
    const classifier: ContentClassifierPort = { classify };

    const result = await createTopicWithChunks(
      makeInput(ids),
      buildDeps({ classifier, enableClassifier: true })
    );
    expect(result.success).toBe(true);

    const verdictEvents = eventsByName('classifier.chunk_verdict');
    expect(verdictEvents).toHaveLength(1);

    const entry = verdictEvents[0];
    expect(entry.module).toBe('mcp-event');
    expect(entry.operation).toBe('classifyChunk');
    const data = entry.data as {
      chunk_id: string;
      topic_id: string;
      prompt_version: string;
      duration_ms: number;
      scores: Record<string, number | null>;
      failed_fields: string[];
      persisted: boolean;
      rendered_chunk_payload: string;
      rendered_user_prompt_prefixes: Record<string, string>;
    };
    expect(data.chunk_id).toBe(ids[0]);
    expect(typeof data.topic_id).toBe('string');
    expect(data.prompt_version).toBe('1.1.0');
    expect(typeof data.duration_ms).toBe('number');
    expect(data.scores.rendering_clarity).toBe(2);
    expect(data.scores.overall_fit).toBe(2);
    expect(data.failed_fields).toEqual([]);
    expect(data.persisted).toBe(true);
    // NEU-660 (post-review): chunk payload stored once + per-field user-prompt prefixes.
    expect(typeof data.rendered_chunk_payload).toBe('string');
    expect(data.rendered_chunk_payload).toContain('Content for chunk 1');
    expect(typeof data.rendered_user_prompt_prefixes).toBe('object');
    expect(data.rendered_user_prompt_prefixes.rendering_clarity).toContain('rendering_clarity');
    expect(data.rendered_user_prompt_prefixes.overall_fit).toContain('overall_fit');
    // Top-level durationMs populates the dedicated `duration_ms` SQL column
    // via pg-event-transport so duration-based queries don't have to extract
    // from JSONB.
    expect(entry.durationMs).toBe(data.duration_ms);
  });

  it('captures classifier.classify_threw when the adapter throws', async () => {
    const ids = [crypto.randomUUID()];
    const classify = vi.fn().mockRejectedValue(new Error('network down'));
    const classifier: ContentClassifierPort = { classify };

    const result = await createTopicWithChunks(
      makeInput(ids),
      buildDeps({ classifier, enableClassifier: true })
    );
    expect(result.success).toBe(true);

    const threwEvents = eventsByName('classifier.classify_threw');
    expect(threwEvents).toHaveLength(1);
    const entry = threwEvents[0];
    expect(entry.module).toBe('mcp-event');
    expect(entry.operation).toBe('classifyChunk');
    const data = entry.data as {
      chunk_id: string;
      error_class: string;
      error_message: string;
      duration_ms: number;
      rendered_chunk_payload: string;
      rendered_user_prompt_prefixes: Record<string, string>;
    };
    expect(data.chunk_id).toBe(ids[0]);
    expect(data.error_class).toBe('Error');
    expect(data.error_message).toBe('network down');
    expect(typeof data.duration_ms).toBe('number');
    expect(entry.durationMs).toBe(data.duration_ms);
    // NEU-660 (post-review): the chunk payload the model would have seen is
    // stored once; per-field user-prompt prefixes are stored separately so
    // debugging "why did this chunk's classify throw?" has the same surface
    // as a successful run without 6× JSONB write volume.
    expect(typeof data.rendered_chunk_payload).toBe('string');
    expect(data.rendered_chunk_payload).toContain('Content for chunk 1');
    expect(typeof data.rendered_user_prompt_prefixes).toBe('object');
    expect(data.rendered_user_prompt_prefixes.rendering_clarity).toContain('rendering_clarity');

    // Verdict event is NOT emitted when classify throws.
    expect(eventsByName('classifier.chunk_verdict')).toHaveLength(0);
  });

  it('emits zero classifier events when classifier is absent', async () => {
    const ids = [crypto.randomUUID()];
    const result = await createTopicWithChunks(
      makeInput(ids),
      buildDeps({ enableClassifier: true })
    );
    expect(result.success).toBe(true);

    const classifierEvents = captured.filter(
      e => typeof e.event === 'string' && (e.event as string).startsWith('classifier.')
    );
    expect(classifierEvents).toHaveLength(0);
  });

  it('emits zero classifier events when enableClassifier is false', async () => {
    const ids = [crypto.randomUUID()];
    const classify = vi.fn().mockResolvedValue(lowScoreVerdict());
    const classifier: ContentClassifierPort = { classify };

    const result = await createTopicWithChunks(
      makeInput(ids),
      buildDeps({ classifier, enableClassifier: false })
    );
    expect(result.success).toBe(true);
    expect(classify).not.toHaveBeenCalled();

    const classifierEvents = captured.filter(
      e => typeof e.event === 'string' && (e.event as string).startsWith('classifier.')
    );
    expect(classifierEvents).toHaveLength(0);
  });
});

// ── NEU-672: blocking + rollback + circuit-breaker integration ─────────
describe('createTopicWithChunks — Tier 2 blocking + breaker (NEU-672)', () => {
  let captured: Array<Record<string, unknown>>;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
    captured = [];
    const fakeLogger = {
      info: (obj: Record<string, unknown>) => {
        captured.push(obj);
      },
    } as unknown as pino.Logger;
    setEventLogger(fakeLogger);
  });

  afterEach(() => {
    setEventLogger(null);
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  function eventsByName(name: string): Array<Record<string, unknown>> {
    return captured.filter(e => e.event === name);
  }

  it('rejects + rolls back the topic and emits a truncated classifier.tier2_blocked event', async () => {
    const ids = [crypto.randomUUID()];
    const longRationale = 'r'.repeat(1000);
    const classify = vi.fn().mockResolvedValue({
      renderingClarity: { score: 1, rationale: longRationale, applicable: true },
      vocabularyAppropriate: { score: 4, rationale: 'ok', applicable: true },
      mathNotationRenderingRisk: { score: 5, rationale: 'no math', applicable: false },
      definitionConstructive: { score: 4, rationale: 'constructive', applicable: true },
      epistemicConsistency: { score: 4, rationale: 'consistent', applicable: true },
      overallFit: { score: 4, rationale: 'fits', applicable: true },
    });

    const deps = buildDeps({ classifier: { classify }, enableClassifier: true });
    deps.blockingFields = new Set(['renderingClarity']);

    const result = await createTopicWithChunks(makeInput(ids), deps);

    // 1. Result is a content_quality rejection with non-empty findings.
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    expect((result.error?.findings ?? []).length).toBeGreaterThan(0);
    expect(
      (result.error?.findings ?? []).some(
        f => f.severity === 'blocking' && f.rule === 'classifier.rendering_clarity'
      )
    ).toBe(true);

    // 2. The topic row was rolled back from learning_topics.
    const db = getSql();
    const topicRows = await db.execute<{ count: number }>(
      sql`SELECT COUNT(*)::int AS count FROM learning_topics WHERE title = 'Tier 2 Classifier Integration Topic'`
    );
    const topicCount = (Array.isArray(topicRows) ? topicRows[0] : topicRows.rows?.[0]) as {
      count: number;
    };
    expect(topicCount.count).toBe(0);

    // 3. Exactly one classifier.tier2_blocked event captured, with truncated rationale.
    const blockedEvents = eventsByName('classifier.tier2_blocked');
    expect(blockedEvents).toHaveLength(1);
    const data = blockedEvents[0].data as {
      topic_id: string;
      chunk_id: string;
      field: string;
      score: number;
      rationale: string;
    };
    expect(data.field).toBe('rendering_clarity');
    expect(data.score).toBe(1);
    expect(data.chunk_id).toBe(ids[0]);
    expect(data.rationale.length).toBeLessThanOrEqual(256 + '…[truncated]'.length);
    expect(data.rationale.endsWith('…[truncated]')).toBe(true);
  });

  it('circuit-breaker trips once on synthetic 2σ rows; subsequent call within TTL stays one-shot', async () => {
    const db = getSql();
    // Seed `infrastructure.operation_event_log` with synthetic
    // `classifier.tier2_blocked` rows so the current week's count exceeds
    // rolling-mean + 2σ for `rendering_clarity`. priors all-zero except one
    // small prior so the threshold is computable but still trippable.
    // priors = [0, 0, 0, 1] → mean=0.25, σ≈0.43, threshold≈1.11; current=50 trips.
    const insertEvent = async (timestampOffsetDays: number) => {
      await db.execute(sql`
        INSERT INTO infrastructure.operation_event_log
          (timestamp, level, operation, event, data)
        VALUES
          (NOW() - (${timestampOffsetDays} || ' days')::interval,
           'info',
           'createTopicWithChunks',
           'classifier.tier2_blocked',
           ${JSON.stringify({
             topic_id: crypto.randomUUID(),
             chunk_id: crypto.randomUUID(),
             field: 'rendering_clarity',
             score: 1,
             rationale: 'seed',
           })}::jsonb)
      `);
    };
    // 50 rows in the last 7 days (offset 0 = current week).
    for (let i = 0; i < 50; i++) await insertEvent(0);
    // 1 row in the 7-14 day prior bucket (offset 1).
    await insertEvent(8);
    // 0 rows for the older 3 prior buckets.

    const breaker = createTier2CircuitBreaker({
      stats: new DrizzleTier2BlockingStatsRepository(db),
    });

    // Build deps with breaker + low-score classifier.
    const lowScore = vi.fn().mockResolvedValue({
      renderingClarity: { score: 1, rationale: 'low', applicable: true },
      vocabularyAppropriate: { score: 4, rationale: 'ok', applicable: true },
      mathNotationRenderingRisk: { score: 5, rationale: 'no math', applicable: false },
      definitionConstructive: { score: 4, rationale: 'ok', applicable: true },
      epistemicConsistency: { score: 4, rationale: 'ok', applicable: true },
      overallFit: { score: 4, rationale: 'fits', applicable: true },
    });
    const deps = buildDeps({ classifier: { classify: lowScore }, enableClassifier: true });
    deps.blockingFields = new Set(['renderingClarity']);
    deps.tier2CircuitBreaker = breaker;

    // First call: breaker shrinks the blocking set (rendering_clarity tripped),
    // creation proceeds (success). Trip event fires exactly once.
    const result1 = await createTopicWithChunks(makeInput([crypto.randomUUID()]), deps);
    expect(result1.success).toBe(true);
    const tripEvents1 = eventsByName('tier2.circuit_breaker_tripped');
    expect(tripEvents1).toHaveLength(1);
    expect((tripEvents1[0].data as { field: string }).field).toBe('rendering_clarity');

    // Second call within the 60 s cache TTL: same outcome, no new trip event.
    const result2 = await createTopicWithChunks(makeInput([crypto.randomUUID()]), deps);
    expect(result2.success).toBe(true);
    const tripEvents2 = eventsByName('tier2.circuit_breaker_tripped');
    expect(tripEvents2).toHaveLength(1); // still one
  });
});
