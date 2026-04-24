import crypto from 'node:crypto';
import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningChunks } from '../../../src/infrastructure/db/schema.js';
import { DrizzleChunkRepository } from '../../../src/adapters/drizzle/chunk-repository.js';
import { DrizzleTopicRepository } from '../../../src/adapters/drizzle/topic-repository.js';
import { DrizzleUnitOfWorkAdapter } from '../../../src/adapters/drizzle/unit-of-work-adapter.js';
import { DrizzleLinterValidationRepository } from '../../../src/adapters/drizzle/linter-validation-repository.js';
import {
  createTopicWithChunks,
  type TopicCreationInput,
  type TopicDeps,
} from '../../../src/orchestration/topic-workflows.js';
import type { LinterRule } from '../../../src/domain/services/chunk-linter.js';
import type { ValidatorReport } from '../../../src/domain/types/validator-report.js';
import { applyEligibilityToRules } from '../../../src/shared/linter/rule-intent.js';

const STUB_TIER1B_RULE_ID = 'tier1b.phantom-chapter';

function makeStubTier1bRule(blockingEligible: boolean): LinterRule {
  return {
    name: STUB_TIER1B_RULE_ID,
    scope: 'chunk',
    tier: 'tier1b',
    blockingEligible,
    run: chunk => [
      {
        chunkId: chunk.chunkId,
        rule: STUB_TIER1B_RULE_ID,
        severity: 'blocking',
        category: 'heuristic',
        detail: 'stub heuristic would block if eligible',
      },
    ],
  };
}

function buildDeps(rules: LinterRule[]): TopicDeps {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    embedding: undefined,
    linterRules: rules,
  };
}

function makeInput(chunkIds: string[]): TopicCreationInput {
  return {
    topicTitle: 'Tier 1b Downgrade Topic',
    topicDescription: 'Integration test for NEU-627 eligibility gate',
    subject: 'CS',
    topicSummary: 'Verifies Tier 1b blocking findings downgrade to warning until eligible',
    chunks: chunkIds.map((id, i) => ({
      id,
      title: `Chunk ${i + 1}`,
      content: `Some content ${i + 1}`,
      difficulty: 3,
      estimatedDuration: 10,
      prerequisites: [],
      tags: [],
      chunkType: 'new',
    })),
  };
}

async function readValidatorReport(chunkId: string): Promise<ValidatorReport | null> {
  const [row] = await getSql()
    .select({ validatorReport: learningChunks.validatorReport })
    .from(learningChunks)
    .where(eq(learningChunks.id, chunkId));
  return row?.validatorReport ?? null;
}

describe('Tier 1b eligibility downgrade on create path (NEU-627)', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('creates the topic and persists the finding as a warning when Tier 1b rule is ineligible', async () => {
    const ids = [crypto.randomUUID()];
    const rule = makeStubTier1bRule(false);

    const result = await createTopicWithChunks(makeInput(ids), buildDeps([rule]));
    expect(result.success).toBe(true);

    const report = await readValidatorReport(ids[0]);
    const tier1b = report?.tier1b as Array<{
      rule: string;
      severity: string;
      blocking_eligible: boolean;
    }>;
    expect(tier1b).toHaveLength(1);
    expect(tier1b[0].severity).toBe('warning');
    expect(tier1b[0].blocking_eligible).toBe(false);
  });

  it('blocks the topic and exposes the blocking finding when Tier 1b rule is eligible', async () => {
    const ids = [crypto.randomUUID()];
    const repo = new DrizzleLinterValidationRepository(getSql());
    await repo.upsertReport({
      ruleId: STUB_TIER1B_RULE_ID,
      computedAt: new Date(),
      precisionHeldOut: 0.95,
      recallHeldOut: 0.8,
      f1HeldOut: 0.87,
      precisionAdversarial: 0.85,
      heldOutCount: 60,
      adversarialCount: 25,
      blockingEligible: true,
      thresholdsVersion: 1,
    });

    // Apply eligibility to the stub rule from the persisted report, mirroring
    // what composition-root does at startup.
    const reports = await repo.listReports();
    const [rule] = applyEligibilityToRules([makeStubTier1bRule(false)], reports);
    expect(rule.blockingEligible).toBe(true);

    const result = await createTopicWithChunks(makeInput(ids), buildDeps([rule]));
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    expect(result.error?.findings?.[0].severity).toBe('blocking');
  });
});
