import crypto from 'node:crypto';
import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { DrizzleLinterValidationRepository } from '../../../src/adapters/drizzle/linter-validation-repository.js';
import { runValidate } from '../../../scripts/lint-validate.js';
import type { LinterRule } from '../../../src/domain/services/chunk-linter.js';
import { THRESHOLDS_VERSION } from '../../../src/domain/services/linter-validation/calculator.js';
import {
  createTier1aRules,
  createTier1bRules,
} from '../../../src/domain/services/linter-rules/index.js';

async function seedChunk(chunkId: string, content: string): Promise<void> {
  const db = getSql();
  const topicId = `topic-${crypto.randomUUID()}`;
  const now = Date.now();
  await db.insert(learningTopics).values({
    id: topicId,
    title: 'lint-validate harness topic',
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
    content,
    createdAt: now,
    updatedAt: now,
  });
}

const ALWAYS_FLAG_RULE: LinterRule = {
  name: 'tier1b.phantom-chapter',
  scope: 'chunk',
  tier: 'tier1b',
  blockingEligible: false,
  // Always emits a finding — perfect classifier on a corpus where every chunk
  // is `should_flag`.
  run: chunk => [
    {
      chunkId: chunk.chunkId,
      rule: 'tier1b.phantom-chapter',
      severity: 'blocking',
      category: 'heuristic',
      detail: 'always flag',
    },
  ],
};

/**
 * Synthetic rule that piggybacks on a Tier 1a rule name so RULE_INTENT marks
 * it `intendedBlocking: true`, while keeping `tier: 'tier1b'` so the script
 * actually runs the OOD threshold gate (Tier 1a rules skip the gate, being
 * eligible by construction). This is the cleanest way to exercise the
 * "intent-to-block but not eligible" branch of `runValidate` without
 * mutating `RULE_INTENT`.
 */
const NEVER_FLAG_PROMOTED_RULE: LinterRule = {
  name: 'tier1a.code-fence-balance',
  scope: 'chunk',
  tier: 'tier1b',
  blockingEligible: false,
  // Never emits — no corpus → counts remain zero so eligibility is false.
  run: () => [],
};

describe('scripts/lint-validate (integration)', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('exits 0 when an intendedBlocking:false rule has corpus but does not meet thresholds', async () => {
    const repo = new DrizzleLinterValidationRepository(getSql());
    const chunkId = `chunk-${crypto.randomUUID()}`;
    await seedChunk(chunkId, 'irrelevant content');
    await repo.upsertCorpusEntry({
      ruleId: ALWAYS_FLAG_RULE.name,
      chunkId,
      split: 'derivation',
      expectedVerdict: 'should_flag',
    });

    const { exitCode, evaluations } = await runValidate([ALWAYS_FLAG_RULE], repo);
    // Tier 1b rule with derivation-only corpus: held_out and adversarial counts
    // are both zero, so eligibility is false. RULE_INTENT marks it
    // intendedBlocking:false, so the CLI does not raise the exit code.
    expect(exitCode).toBe(0);
    expect(evaluations).toHaveLength(1);
    expect(evaluations[0].blockingEligible).toBe(false);

    const persisted = await repo.getReport(ALWAYS_FLAG_RULE.name);
    expect(persisted).not.toBeNull();
    expect(persisted?.heldOutCount).toBe(0);
    expect(persisted?.blockingEligible).toBe(false);
    expect(persisted?.thresholdsVersion).toBe(THRESHOLDS_VERSION);
  });

  it('exits 1 when an intendedBlocking:true rule has no corpus → ineligible', async () => {
    const repo = new DrizzleLinterValidationRepository(getSql());
    const { exitCode, evaluations } = await runValidate([NEVER_FLAG_PROMOTED_RULE], repo);
    expect(exitCode).toBe(1);
    expect(evaluations[0].blockingEligible).toBe(false);
  });

  it('treats Tier 1a rules as eligible by construction even with no corpus', async () => {
    const repo = new DrizzleLinterValidationRepository(getSql());
    const tier1aRule: LinterRule = {
      name: 'tier1a.code-fence-balance',
      scope: 'chunk',
      tier: 'tier1a',
      blockingEligible: true,
      run: () => [],
    };
    const { exitCode, evaluations } = await runValidate([tier1aRule], repo);
    expect(exitCode).toBe(0);
    expect(evaluations[0].blockingEligible).toBe(true);
  });

  it('exits 1 with explanation when held_out precision is too low', async () => {
    const repo = new DrizzleLinterValidationRepository(getSql());
    // Promote the synthetic rule to intendedBlocking by lying about its ID —
    // use a Tier 1a ID so RULE_INTENT marks it intendedBlocking:true, but
    // keep tier:'tier1b' so the OOD threshold gate actually runs.
    const promotedRule: LinterRule = {
      ...ALWAYS_FLAG_RULE,
      name: 'tier1a.code-fence-balance',
      tier: 'tier1b',
      blockingEligible: false,
    };
    // Seed two chunks: one positive (should_flag) and one negative (clean) on
    // the held_out split. The "always flag" rule will produce TP=1, FP=1 →
    // precision = 0.5 < 0.9 threshold.
    const positive = `chunk-${crypto.randomUUID()}`;
    const negative = `chunk-${crypto.randomUUID()}`;
    await seedChunk(positive, 'positive content');
    await seedChunk(negative, 'negative content');
    await repo.upsertCorpusEntry({
      ruleId: promotedRule.name,
      chunkId: positive,
      split: 'held_out',
      expectedVerdict: 'should_flag',
    });
    await repo.upsertCorpusEntry({
      ruleId: promotedRule.name,
      chunkId: negative,
      split: 'held_out',
      expectedVerdict: 'clean',
    });

    const { exitCode, evaluations } = await runValidate([promotedRule], repo);
    expect(exitCode).toBe(1);
    expect(evaluations[0].metrics.precisionHeldOut).toBeCloseTo(0.5, 6);
    expect(evaluations[0].blockingEligible).toBe(false);
    // F1 is exposed on the evaluation (not recomputed at display time) and
    // persisted onto the report so the CLI summary and the DB row cannot
    // diverge.
    expect(evaluations[0].f1HeldOut).toBeCloseTo((2 * 0.5 * 1) / (0.5 + 1), 6);
    const persisted = await repo.getReport(promotedRule.name);
    expect(persisted?.f1HeldOut).toBeCloseTo(evaluations[0].f1HeldOut ?? Number.NaN, 6);
  });

  it('default rule set covers every registered Tier 1a + Tier 1b rule', async () => {
    // Regression guard for NEU-664. The harness's default rule list must mirror
    // the composition root's `[...createTier1aRules(), ...createTier1bRules()]`
    // wiring — otherwise `pnpm lint:validate` silently skips Tier 1b rules.
    const repo = new DrizzleLinterValidationRepository(getSql());
    const expectedRuleNames = new Set([
      ...createTier1aRules().map(r => r.name),
      ...createTier1bRules().map(r => r.name),
    ]);

    const { exitCode, evaluations } = await runValidate(undefined, repo);

    expect(exitCode).toBe(0);
    expect(evaluations).toHaveLength(expectedRuleNames.size);
    expect(new Set(evaluations.map(ev => ev.ruleId))).toEqual(expectedRuleNames);

    const tier1aNames = new Set(createTier1aRules().map(r => r.name));
    for (const ev of evaluations) {
      if (tier1aNames.has(ev.ruleId)) {
        // Tier 1a rules are eligible-by-construction even without a corpus.
        expect(ev.blockingEligible).toBe(true);
      } else {
        // Tier 1b rules with no corpus stay ineligible — the only path to
        // `true` is hitting the precision/recall thresholds via real data.
        expect(ev.blockingEligible).toBe(false);
      }
    }
  });
});
