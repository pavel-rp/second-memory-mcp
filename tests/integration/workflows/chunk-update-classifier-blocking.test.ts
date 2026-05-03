import { describe, it, beforeAll, beforeEach, afterAll, afterEach, expect, vi } from 'vitest';
import crypto from 'node:crypto';
import type pino from 'pino';
import { sql } from 'drizzle-orm';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { DrizzleChunkRepository } from '../../../src/adapters/drizzle/chunk-repository.js';
import { DrizzleTopicRepository } from '../../../src/adapters/drizzle/topic-repository.js';
import { DrizzleUnitOfWorkAdapter } from '../../../src/adapters/drizzle/unit-of-work-adapter.js';
import {
  updateChunkContent,
  updateChunkContentWithAutoReset,
  updateChunkWithProgressReset,
  createChunkWithTopic,
  type ChunkDeps,
} from '../../../src/orchestration/chunk-workflows.js';
import type { ContentClassifierPort } from '../../../src/ports/content-classifier-port.js';
import type {
  ChunkClassifierVerdict,
  VerdictFieldName,
} from '../../../src/domain/types/classifier.js';
import type { LearningChunk, NewLearningChunk } from '../../../src/domain/types/entities.js';
import { setEventLogger } from '../../../src/shared/logger.js';

// ── Fixtures ──────────────────────────────────────────────────

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
  const v = highScoreVerdict();
  v[field] = { score, rationale: 'low score reason for integration test', applicable: true };
  return v;
}

function buildDeps(
  classifier: ContentClassifierPort | undefined,
  blockingFields: ReadonlySet<VerdictFieldName> = new Set()
): ChunkDeps {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    embedding: undefined,
    maxDependencyDepth: 5,
    linterRules: [],
    enableClassifier: classifier !== undefined,
    blockingFields,
    ...(classifier ? { classifier } : {}),
  };
}

async function seedTopicAndChunk(
  topicId: string,
  chunkId: string
): Promise<{ topic: { id: string }; chunk: LearningChunk }> {
  const db = getSql();
  const now = Date.now();
  const topicRepo = new DrizzleTopicRepository(db);
  const chunkRepo = new DrizzleChunkRepository(db);

  await topicRepo.create({
    id: topicId,
    title: 'Integration Topic',
    subject: 'CS',
    summary: 'Topic for chunk-update classifier integration tests.',
    summaryVersion: 1,
    summaryUpdatedAt: now,
    dependencyGraphType: null,
    createdAt: now,
    updatedAt: now,
  });

  const chunkRow: NewLearningChunk = {
    id: chunkId,
    topicId,
    title: 'Original Title',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: now,
    easeFactor: 2.5,
    repetitions: 3,
    lastReviewedAt: now - 86_400_000,
    estimatedDuration: 15,
    intervalDays: 7,
    chunkType: 'review',
    contentStatus: 'final',
    condensedSummary: 'original summary',
    knowledgeType: null,
    prerequisitesJson: ['prereq-1'],
    tagsJson: ['math'],
    content: 'Original content here for the integration test scenario.',
    contentVersion: 2,
    contentUpdatedAt: now - 100_000,
    createdAt: now,
    updatedAt: now,
  };
  await chunkRepo.create(chunkRow);
  const chunk = await chunkRepo.getById(chunkId);
  if (!chunk) throw new Error('Test seed failed');
  return { topic: { id: topicId }, chunk };
}

const SNAPSHOT_FIELDS: ReadonlyArray<keyof LearningChunk> = [
  'content',
  'contentVersion',
  'contentUpdatedAt',
  'contentStatus',
  'condensedSummary',
  'repetitions',
  'easeFactor',
  'nextReviewAt',
  'lastReviewedAt',
  'title',
  'difficulty',
  'estimatedDuration',
  'prerequisitesJson',
  'tagsJson',
];

function pickSnapshotFields(chunk: LearningChunk): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of SNAPSHOT_FIELDS) out[k] = chunk[k];
  return out;
}

// ── Tests ─────────────────────────────────────────────────────

describe('chunk-update — Tier 2 classifier blocking + reverse-UPDATE (NEU-686)', () => {
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

  it('updateChunkContent — Tier 2 block restores byte-identical state for all 14 captured fields', async () => {
    const topicId = crypto.randomUUID();
    const chunkId = crypto.randomUUID();
    const { chunk: before } = await seedTopicAndChunk(topicId, chunkId);

    const classify = vi.fn().mockResolvedValue(lowScoreVerdict('renderingClarity', 1));
    const deps = buildDeps({ classify }, new Set(['renderingClarity']));

    const result = await updateChunkContent(
      chunkId,
      { content: 'Brand new completely different content for Tier 2 to reject.' },
      deps
    );

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');

    const after = await new DrizzleChunkRepository(getSql()).getById(chunkId);
    expect(after).toBeDefined();

    expect(pickSnapshotFields(after!)).toEqual(pickSnapshotFields(before));

    // `updatedAt` advances on every write — the snapshot intentionally excludes it.
    expect(after!.updatedAt).toBeGreaterThanOrEqual(before.updatedAt);

    const blockEvents = eventsByName('classifier.tier2_blocked');
    expect(blockEvents).toHaveLength(1);
    expect((blockEvents[0].data as { audit_path: string }).audit_path).toBe('update_chunk_content');
  });

  it('updateChunkContentWithAutoReset — Tier 2 block restores byte-identical state', async () => {
    const topicId = crypto.randomUUID();
    const chunkId = crypto.randomUUID();
    const { chunk: before } = await seedTopicAndChunk(topicId, chunkId);

    const classify = vi.fn().mockResolvedValue(lowScoreVerdict('overallFit', 1));
    const deps = buildDeps({ classify }, new Set(['overallFit']));

    const result = await updateChunkContentWithAutoReset(
      chunkId,
      { content: 'Brand new completely different content for Tier 2 auto-reset path.' },
      deps
    );

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');

    const after = await new DrizzleChunkRepository(getSql()).getById(chunkId);
    expect(after).toBeDefined();
    expect(pickSnapshotFields(after!)).toEqual(pickSnapshotFields(before));

    const blockEvents = eventsByName('classifier.tier2_blocked');
    expect(blockEvents).toHaveLength(1);
    expect((blockEvents[0].data as { audit_path: string }).audit_path).toBe(
      'update_chunk_content_with_auto_reset'
    );
  });

  it('updateChunkWithProgressReset — Tier 2 block restores both content AND metadata fields', async () => {
    const topicId = crypto.randomUUID();
    const chunkId = crypto.randomUUID();
    const { chunk: before } = await seedTopicAndChunk(topicId, chunkId);

    const classify = vi.fn().mockResolvedValue(lowScoreVerdict('definitionConstructive', 2));
    const deps = buildDeps({ classify }, new Set(['definitionConstructive']));

    const result = await updateChunkWithProgressReset(
      chunkId,
      {
        content: 'Brand new completely different content with metadata changes too.',
        title: 'Mutated Title',
        difficulty: 9,
        prerequisites: ['mutated-prereq'],
        tags: ['mutated-tag'],
        estimatedDuration: 99,
        forceReset: true,
      },
      deps
    );

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');

    const after = await new DrizzleChunkRepository(getSql()).getById(chunkId);
    expect(after).toBeDefined();

    // Both content + SR-state fields AND metadata fields are restored.
    expect(pickSnapshotFields(after!)).toEqual(pickSnapshotFields(before));

    const blockEvents = eventsByName('classifier.tier2_blocked');
    expect(blockEvents).toHaveLength(1);
    expect((blockEvents[0].data as { audit_path: string }).audit_path).toBe(
      'update_chunk_with_progress_reset'
    );
  });

  it('validator_report.tier2 set by a prior write persists across reverse-UPDATE', async () => {
    const topicId = crypto.randomUUID();
    const chunkId = crypto.randomUUID();
    await seedTopicAndChunk(topicId, chunkId);
    const repo = new DrizzleChunkRepository(getSql());

    // Seed a `tier2` section via mergeValidatorReport directly.
    await repo.mergeValidatorReport(
      chunkId,
      {
        tier2: {
          rendering_clarity: { score: 5, rationale: 'pre-existing', applicable: true },
          classified_at: new Date().toISOString(),
          prompt_version: '1.1.0',
        } as unknown,
      },
      new Date().toISOString()
    );

    const classify = vi.fn().mockResolvedValue(lowScoreVerdict('renderingClarity', 1));
    const deps = buildDeps({ classify }, new Set(['renderingClarity']));

    await updateChunkContent(
      chunkId,
      { content: 'Brand new completely different content for tier2 preservation test.' },
      deps
    );

    const report = await repo.getValidatorReport(chunkId);
    expect(report).not.toBeNull();
    // tier2 was overwritten by the post-commit Tier 2 fan-out (which is the
    // intended behavior — the verdict that just rejected the change is what
    // gets persisted). Confirm it's still present (not wiped by rollback) and
    // reflects the rejecting verdict.
    const tier2 = report?.tier2 as Record<string, unknown> | undefined;
    expect(tier2).toBeDefined();
    expect((tier2?.rendering_clarity as { score: number } | undefined)?.score).toBe(1);
  });

  it('createChunkWithTopic + auto-created topic — Tier 2 block deletes both rows', async () => {
    const classify = vi.fn().mockResolvedValue(lowScoreVerdict('renderingClarity', 1));
    const deps = buildDeps({ classify }, new Set(['renderingClarity']));
    const newChunkId = crypto.randomUUID();
    const now = Date.now();

    const result = await createChunkWithTopic(
      {
        id: newChunkId,
        topicId: '',
        title: 'New Chunk via create_learning_item',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        content: 'A new chunk that the classifier will reject and roll back.',
        contentVersion: 1,
        contentUpdatedAt: now,
        contentStatus: 'final',
        topicTitle: 'Auto Created Topic ' + crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      },
      deps
    );

    expect(result.success).toBe(false);

    const db = getSql();
    const chunkRows = await db.execute<{ count: number }>(
      sql`SELECT COUNT(*)::int AS count FROM learning_chunks WHERE id = ${newChunkId}`
    );
    const chunkCount = (Array.isArray(chunkRows) ? chunkRows[0] : chunkRows.rows?.[0]) as {
      count: number;
    };
    expect(chunkCount.count).toBe(0);

    // The auto-created topic is identified by the unique title we supplied.
    const topicRows = await db.execute<{ count: number }>(
      sql`SELECT COUNT(*)::int AS count FROM learning_topics WHERE title LIKE 'Auto Created Topic %'`
    );
    const topicCount = (Array.isArray(topicRows) ? topicRows[0] : topicRows.rows?.[0]) as {
      count: number;
    };
    expect(topicCount.count).toBe(0);

    const blockEvents = eventsByName('classifier.tier2_blocked');
    expect(blockEvents).toHaveLength(1);
    expect((blockEvents[0].data as { audit_path: string }).audit_path).toBe(
      'create_chunk_with_topic'
    );
  });

  it('createChunkWithTopic + reused existing topic — Tier 2 block deletes only the chunk', async () => {
    const existingTopicId = crypto.randomUUID();
    const existingTopicTitle = 'Reuse Topic ' + crypto.randomUUID();
    const db = getSql();
    const now = Date.now();
    const topicRepo = new DrizzleTopicRepository(db);
    await topicRepo.create({
      id: existingTopicId,
      title: existingTopicTitle,
      subject: 'CS',
      summary: 'Pre-existing topic that must not be deleted on chunk rollback.',
      summaryVersion: 1,
      summaryUpdatedAt: now,
      dependencyGraphType: null,
      createdAt: now,
      updatedAt: now,
    });

    const classify = vi.fn().mockResolvedValue(lowScoreVerdict('renderingClarity', 1));
    const deps = buildDeps({ classify }, new Set(['renderingClarity']));
    const newChunkId = crypto.randomUUID();

    const result = await createChunkWithTopic(
      {
        id: newChunkId,
        topicId: '',
        title: 'New Chunk in Reused Topic',
        subject: 'CS',
        difficulty: 5,
        nextReviewAt: now,
        easeFactor: 2.5,
        repetitions: 0,
        estimatedDuration: 10,
        chunkType: 'new',
        content: 'Content that will trigger Tier 2 rejection of the chunk.',
        contentVersion: 1,
        contentUpdatedAt: now,
        contentStatus: 'final',
        topicTitle: existingTopicTitle,
        createdAt: now,
        updatedAt: now,
      },
      deps
    );

    expect(result.success).toBe(false);

    // Chunk gone
    const chunkRows = await db.execute<{ count: number }>(
      sql`SELECT COUNT(*)::int AS count FROM learning_chunks WHERE id = ${newChunkId}`
    );
    const chunkCount = (Array.isArray(chunkRows) ? chunkRows[0] : chunkRows.rows?.[0]) as {
      count: number;
    };
    expect(chunkCount.count).toBe(0);

    // Existing topic preserved
    const topicRows = await db.execute<{ count: number }>(
      sql`SELECT COUNT(*)::int AS count FROM learning_topics WHERE id = ${existingTopicId}`
    );
    const topicCount = (Array.isArray(topicRows) ? topicRows[0] : topicRows.rows?.[0]) as {
      count: number;
    };
    expect(topicCount.count).toBe(1);
  });
});
