import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningChunks } from '../../../src/infrastructure/db/schema.js';
import { DrizzleChunkRepository } from '../../../src/adapters/drizzle/chunk-repository.js';
import { DrizzleTopicRepository } from '../../../src/adapters/drizzle/topic-repository.js';
import { DrizzleUnitOfWorkAdapter } from '../../../src/adapters/drizzle/unit-of-work-adapter.js';
import {
  createTopicWithChunks,
  type TopicCreationInput,
  type TopicDeps,
} from '../../../src/orchestration/topic-workflows.js';
import type { LinterRule } from '../../../src/domain/services/chunk-linter.js';
import type { ValidatorReport } from '../../../src/domain/types/validator-report.js';

function buildDeps(linterRules: LinterRule[] = []): TopicDeps {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    embedding: undefined,
    linterRules,
  };
}

function makeInput(chunkIds: string[]): TopicCreationInput {
  return {
    topicTitle: 'Validator Report Topic',
    topicDescription: 'Topic for validator_report tests',
    subject: 'CS',
    topicSummary: 'Summary used by validator_report integration tests',
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

async function readValidatorReport(chunkId: string): Promise<ValidatorReport | null> {
  const db = getSql();
  const [row] = await db
    .select({ validatorReport: learningChunks.validatorReport })
    .from(learningChunks)
    .where(eq(learningChunks.id, chunkId));
  return row?.validatorReport ?? null;
}

describe('validator_report persistence (NEU-629)', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('writes canonical empty validator_report for every chunk when no rules are registered', async () => {
    const ids = [crypto.randomUUID(), crypto.randomUUID()];
    const result = await createTopicWithChunks(makeInput(ids), buildDeps());
    expect(result.success).toBe(true);

    for (const id of ids) {
      const report = await readValidatorReport(id);
      expect(report).not.toBeNull();
      expect(report?.updated_at).toEqual(expect.any(String));
      expect(report?.tier1a).toBeUndefined();
      expect(report?.tier1b).toBeUndefined();
      expect(report?.tier2).toBeUndefined();
    }
  });

  it('routes tier1a rule findings into the tier1a section only', async () => {
    const ids = [crypto.randomUUID(), crypto.randomUUID()];
    const tier1aRule: LinterRule = {
      name: 'flag-first-chunk',
      scope: 'chunk',
      tier: 'tier1a',
      run: chunk =>
        chunk.chunkId === ids[0]
          ? [
              {
                chunkId: chunk.chunkId,
                rule: 'flag-first-chunk',
                severity: 'warning',
                category: 'structural',
                detail: 'flagged for test',
              },
            ]
          : [],
    };

    const result = await createTopicWithChunks(makeInput(ids), buildDeps([tier1aRule]));
    expect(result.success).toBe(true);

    const first = await readValidatorReport(ids[0]);
    expect(first).not.toBeNull();
    expect(Array.isArray(first?.tier1a)).toBe(true);
    expect((first?.tier1a as unknown[]).length).toBe(1);
    expect(first?.tier1b).toBeUndefined();
    expect(first?.tier2).toBeUndefined();

    const second = await readValidatorReport(ids[1]);
    expect(second).not.toBeNull();
    expect(second?.tier1a).toBeUndefined();
    expect(second?.tier1b).toBeUndefined();
  });

  it('routes tier1b rule findings into the tier1b section only', async () => {
    const ids = [crypto.randomUUID()];
    const tier1bRule: LinterRule = {
      name: 'tier1b-warn',
      scope: 'chunk',
      tier: 'tier1b',
      run: chunk => [
        {
          chunkId: chunk.chunkId,
          rule: 'tier1b-warn',
          severity: 'warning',
          category: 'heuristic',
          detail: 'heuristic warning',
        },
      ],
    };

    const result = await createTopicWithChunks(makeInput(ids), buildDeps([tier1bRule]));
    expect(result.success).toBe(true);

    const report = await readValidatorReport(ids[0]);
    expect(report).not.toBeNull();
    expect(Array.isArray(report?.tier1b)).toBe(true);
    expect((report?.tier1b as unknown[]).length).toBe(1);
    expect(report?.tier1a).toBeUndefined();
    expect(report?.tier2).toBeUndefined();
  });

  it('drops findings whose rule name is not in the registered linter rules', async () => {
    const ids = [crypto.randomUUID()];
    // Defensive branch: a rule whose `run()` emits a finding tagged with a
    // different rule name than its own registration. The orchestration layer
    // must drop the finding rather than persist it without a tier.
    const misnamedRule: LinterRule = {
      name: 'real-rule-name',
      scope: 'chunk',
      tier: 'tier1a',
      run: chunk => [
        {
          chunkId: chunk.chunkId,
          rule: 'ghost-rule-name',
          severity: 'warning',
          category: 'structural',
          detail: 'finding from a rule name not in the registry',
        },
      ],
    };

    const result = await createTopicWithChunks(makeInput(ids), buildDeps([misnamedRule]));
    expect(result.success).toBe(true);

    const report = await readValidatorReport(ids[0]);
    expect(report).not.toBeNull();
    // Finding was dropped — report stays canonical empty for this chunk.
    expect(report?.tier1a).toBeUndefined();
    expect(report?.tier1b).toBeUndefined();
  });

  it('mergeValidatorReport returns 0 for an unknown chunk id', async () => {
    const repo = new DrizzleChunkRepository(getSql());
    const rowCount = await repo.mergeValidatorReport(
      'no-such-chunk-id',
      { tier2: { score: 1 } },
      new Date().toISOString()
    );
    expect(rowCount).toBe(0);
  });

  it('mergeValidatorReport replaces tier sections without disturbing untouched ones', async () => {
    const ids = [crypto.randomUUID()];
    const tier1aRule: LinterRule = {
      name: 'tier1a-warn',
      scope: 'chunk',
      tier: 'tier1a',
      run: chunk => [
        {
          chunkId: chunk.chunkId,
          rule: 'tier1a-warn',
          severity: 'warning',
          category: 'structural',
          detail: 'tier1a finding',
        },
      ],
    };

    const result = await createTopicWithChunks(makeInput(ids), buildDeps([tier1aRule]));
    expect(result.success).toBe(true);

    const before = await readValidatorReport(ids[0]);
    expect(Array.isArray(before?.tier1a)).toBe(true);
    const beforeUpdatedAt = before?.updated_at ?? '';

    // Wait one ms so the merge produces a strictly newer timestamp.
    await new Promise(resolve => setTimeout(resolve, 5));

    const repo = new DrizzleChunkRepository(getSql());
    const newIso = new Date().toISOString();
    const rowCount = await repo.mergeValidatorReport(ids[0], { tier2: { score: 0.42 } }, newIso);
    expect(rowCount).toBe(1);

    const after = await readValidatorReport(ids[0]);
    expect(after).not.toBeNull();
    expect(Array.isArray(after?.tier1a)).toBe(true);
    expect((after?.tier1a as unknown[]).length).toBe(1);
    expect(after?.tier2).toEqual({ score: 0.42 });
    expect(after?.updated_at).toBe(newIso);
    expect(after?.updated_at).not.toBe(beforeUpdatedAt);
  });
});
