import crypto from 'node:crypto';
import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { getSql } from '../../../../src/infrastructure/db/operations.js';
import { learningChunks, learningTopics } from '../../../../src/infrastructure/db/schema.js';
import { DrizzleLinterValidationRepository } from '../../../../src/adapters/drizzle/linter-validation-repository.js';
import type {
  CorpusEntryInput,
  RuleValidationReport,
} from '../../../../src/ports/linter-validation-repository.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../../helpers/db-setup.js';

async function seedChunk(chunkId: string): Promise<void> {
  const db = getSql();
  const topicId = `topic-${crypto.randomUUID()}`;
  const now = Date.now();
  await db.insert(learningTopics).values({
    id: topicId,
    title: 'Linter Validation Topic',
    subject: 'Test',
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(learningChunks).values({
    id: chunkId,
    topicId,
    title: 'Chunk',
    subject: 'Test',
    difficulty: 3,
    nextReviewAt: now,
    easeFactor: 2.5,
    repetitions: 0,
    estimatedDuration: 10,
    chunkType: 'new',
    contentStatus: 'final',
    createdAt: now,
    updatedAt: now,
  });
}

function makeCorpusEntry(overrides: Partial<CorpusEntryInput> = {}): CorpusEntryInput {
  return {
    ruleId: 'tier1b.phantom-chapter',
    chunkId: 'chunk-a',
    split: 'derivation',
    expectedVerdict: 'should_flag',
    notes: null,
    ...overrides,
  };
}

function makeReport(overrides: Partial<RuleValidationReport> = {}): RuleValidationReport {
  return {
    ruleId: 'tier1b.phantom-chapter',
    computedAt: new Date('2026-04-24T00:00:00.000Z'),
    precisionHeldOut: 0.95,
    recallHeldOut: 0.8,
    f1HeldOut: 0.87,
    precisionAdversarial: 0.85,
    heldOutCount: 60,
    adversarialCount: 25,
    blockingEligible: true,
    thresholdsVersion: 1,
    ...overrides,
  };
}

describe('DrizzleLinterValidationRepository (integration)', () => {
  let repo: DrizzleLinterValidationRepository;

  beforeAll(async () => {
    await setupTestDb();
    repo = new DrizzleLinterValidationRepository(getSql());
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('upserts, lists, updates, and deletes corpus entries', async () => {
    const chunkId = `chunk-${crypto.randomUUID()}`;
    await seedChunk(chunkId);

    await repo.upsertCorpusEntry(
      makeCorpusEntry({ chunkId, notes: 'initial', expectedVerdict: 'should_flag' })
    );

    const [first] = await repo.listCorpusByRule('tier1b.phantom-chapter');
    expect(first.chunkId).toBe(chunkId);
    expect(first.split).toBe('derivation');
    expect(first.expectedVerdict).toBe('should_flag');
    expect(first.notes).toBe('initial');
    expect(first.id).toEqual(expect.any(Number));

    // Upsert again — same (ruleId, chunkId) flips the label and refreshes notes.
    await repo.upsertCorpusEntry(
      makeCorpusEntry({ chunkId, expectedVerdict: 'clean', notes: 'updated' })
    );
    const [updated] = await repo.listCorpusByRule('tier1b.phantom-chapter');
    expect(updated.id).toBe(first.id);
    expect(updated.expectedVerdict).toBe('clean');
    expect(updated.notes).toBe('updated');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(first.updatedAt.getTime());

    const deleted = await repo.deleteCorpusEntry('tier1b.phantom-chapter', chunkId);
    expect(deleted).toBe(1);
    expect(await repo.listCorpusByRule('tier1b.phantom-chapter')).toEqual([]);
  });

  it('deleteCorpusEntry returns 0 when the row does not exist', async () => {
    const deleted = await repo.deleteCorpusEntry('tier1b.phantom-chapter', 'no-such-chunk');
    expect(deleted).toBe(0);
  });

  it('treats omitted notes as SQL NULL on upsert', async () => {
    // Covers the `entry.notes ?? null` fallback when the input has no `notes`
    // key at all (TS-optional vs explicitly `null`). Without this, the `??`
    // branch on the undefined side stays uncovered.
    const chunkId = `chunk-${crypto.randomUUID()}`;
    await seedChunk(chunkId);
    await repo.upsertCorpusEntry({
      ruleId: 'tier1b.bullet-dominant',
      chunkId,
      split: 'derivation',
      expectedVerdict: 'should_flag',
    });
    const [row] = await repo.listCorpusByRule('tier1b.bullet-dominant');
    expect(row.notes).toBeNull();

    // Upsert path also touches `?? null` on conflict — re-upsert with notes
    // undefined to cover the update branch.
    await repo.upsertCorpusEntry({
      ruleId: 'tier1b.bullet-dominant',
      chunkId,
      split: 'held_out',
      expectedVerdict: 'clean',
    });
    const [refreshed] = await repo.listCorpusByRule('tier1b.bullet-dominant');
    expect(refreshed.notes).toBeNull();
    expect(refreshed.split).toBe('held_out');
  });

  it('FK cascades corpus rows away when the referenced chunk is deleted', async () => {
    const chunkId = `chunk-${crypto.randomUUID()}`;
    await seedChunk(chunkId);
    await repo.upsertCorpusEntry(makeCorpusEntry({ chunkId }));

    await getSql().delete(learningChunks).where(eq(learningChunks.id, chunkId));

    const rows = await repo.listCorpusByRule('tier1b.phantom-chapter');
    expect(rows).toEqual([]);
  });

  it('rejects bad split values via the CHECK constraint', async () => {
    const chunkId = `chunk-${crypto.randomUUID()}`;
    await seedChunk(chunkId);
    await expect(
      repo.upsertCorpusEntry(
        makeCorpusEntry({ chunkId, split: 'nope' as never, expectedVerdict: 'clean' })
      )
    ).rejects.toThrow();
  });

  it('rejects bad expected_verdict values via the CHECK constraint', async () => {
    const chunkId = `chunk-${crypto.randomUUID()}`;
    await seedChunk(chunkId);
    await expect(
      repo.upsertCorpusEntry(makeCorpusEntry({ chunkId, expectedVerdict: 'maybe' as never }))
    ).rejects.toThrow();
  });

  it('upserts, reads, and lists rule validation reports', async () => {
    await repo.upsertReport(makeReport({ blockingEligible: false, heldOutCount: 10 }));
    const first = await repo.getReport('tier1b.phantom-chapter');
    expect(first).not.toBeNull();
    expect(first?.blockingEligible).toBe(false);
    expect(first?.heldOutCount).toBe(10);

    await repo.upsertReport(makeReport({ blockingEligible: true, heldOutCount: 60 }));
    const second = await repo.getReport('tier1b.phantom-chapter');
    expect(second?.blockingEligible).toBe(true);
    expect(second?.heldOutCount).toBe(60);

    // Unknown rule reads as null.
    expect(await repo.getReport('tier1b.unknown')).toBeNull();

    await repo.upsertReport(
      makeReport({ ruleId: 'tier1b.bullet-dominant', blockingEligible: false })
    );
    const reports = await repo.listReports();
    expect(reports.map(r => r.ruleId)).toEqual([
      'tier1b.bullet-dominant',
      'tier1b.phantom-chapter',
    ]);
  });
});
