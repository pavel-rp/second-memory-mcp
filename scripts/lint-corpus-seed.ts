#!/usr/bin/env tsx
/**
 * `pnpm lint:corpus:seed` (NEU-627, extended NEU-664).
 *
 * Idempotently writes labelled corpus rows into
 * `infrastructure.linter_validation_corpus`. Three splits are seeded today:
 *
 *   - `derivation` — chunks the rule was tuned on (NEU-616 / NEU-617 spec
 *     material). Smoke-test only; not used by the OOD threshold gate.
 *   - `held_out` (NEU-664) — chunks the rule should fire on, drawn from
 *     outside the rule's derivation set. Counts feed the precision / recall
 *     numbers in `linter_rule_validation_report`.
 *   - `adversarial_negative` (NEU-664) — chunks that match the rule's
 *     surface feature but were judged correct on inspection. `clean` verdict.
 *
 * Counts intentionally stay below `DEFAULT_ELIGIBILITY_THRESHOLDS.minHeldOutCount`
 * (50) and `minAdversarialCount` (20). Reaching those minimums requires the
 * full hand-labelling pass against `mcp_request_log` (deferred follow-up).
 *
 * The script tolerates missing chunk rows (skipped with a stderr warning,
 * not a fatal error) so it can be re-run safely after a local DB reset
 * without the chunks present.
 */

import 'dotenv/config';
import { inArray } from 'drizzle-orm';
import { getSql } from '../src/infrastructure/db/operations.js';
import { getPool } from '../src/infrastructure/db/client.js';
import { learningChunks } from '../src/infrastructure/db/schema.js';
import { DrizzleLinterValidationRepository } from '../src/adapters/drizzle/linter-validation-repository.js';
import type { CorpusEntryInput } from '../src/ports/linter-validation-repository.js';
import { logger } from '../src/shared/logger.js';

// ───────────────────────────────────────────────────────────────────────────
// Derivation-split chunk IDs (NEU-616 / NEU-617 spec material). These are the
// chunks the rules were originally tuned against.
// ───────────────────────────────────────────────────────────────────────────

const PHANTOM_PREREQUISITE_CHUNKS = ['neu-537-hld-euler-tour'];
const PHANTOM_CHAPTER_CHUNKS = [
  'rsa-foundations',
  'hld-complexity-and-composition',
  'ml-foundations-attention-qkv',
  'ann-ivfflat',
  'emb-matryoshka',
];
const SCAFFOLDING_SECTION_PRACTICE_CHUNKS = [
  'e5-practice-001',
  'e5-practice-002',
  'e5-practice-003',
  'e5-practice-004',
  'e5-practice-005',
  'e5-practice-006',
  'e5-practice-007',
  'e5-practice-008',
  'e5-practice-009',
  'e5-practice-010',
  'e5-practice-011',
  'e5-practice-012',
  'e5-practice-013',
  'e5-practice-014',
  'e5-practice-015',
  'e5-practice-016',
  'e5-practice-017',
  'e5-practice-018',
  'e5-practice-019',
  'e5-practice-020',
  'e5-practice-021',
  'e5-practice-022',
  'e5-practice-023',
  'e5-practice-024',
  'e5-practice-025',
  'e5-practice-026',
  'e5-practice-027',
  'e5-practice-028',
  'e5-practice-029',
  'e5-practice-030',
  'e5-practice-031',
  'e5-practice-032',
  'e5-practice-033',
  'e5-practice-034',
  'e5-practice-035',
  'e5-practice-036',
  'e5-practice-037',
  'e5-practice-038',
];

// ───────────────────────────────────────────────────────────────────────────
// Held-out positives (NEU-664). Chunks that *should* trigger the rule but
// are drawn from sessions / retros outside each rule's derivation set
// (NEU-446 / NEU-465 / NEU-534 / NEU-537 are excluded per NEU-627). Counts
// stay well below the 50-row eligibility minimum — full hand-labelling is
// deferred to a follow-up ticket.
// ───────────────────────────────────────────────────────────────────────────

const PHANTOM_PREREQUISITE_HELD_OUT = [
  'pareto-frontier-decision-card',
  'bias-variance-tradeoff-card',
  'hld-distributed-consensus',
];
const PHANTOM_CHAPTER_HELD_OUT = [
  'systems-design-overview-chapter',
  'attention-mechanisms-survey-chapter',
  'transformer-architecture-deep-dive',
  'kubernetes-control-plane-tour',
];
const SCAFFOLDING_SECTION_HELD_OUT = [
  'classifier-eval-walkthrough',
  'retrieval-pipeline-summary',
  'embeddings-evaluation-summary',
];
const BULLET_DOMINANT_HELD_OUT = [
  'decision-tree-bullets-explainer',
  'feature-flag-checklist-explainer',
  'sre-on-call-runbook',
];
const WORD_COUNT_FLOOR_HELD_OUT = [
  'cap-theorem-stub',
  'loss-functions-stub',
  'vector-quantization-stub',
];
const WORD_COUNT_CEILING_HELD_OUT = [
  'distributed-systems-treatise',
  'attention-is-everything-essay',
  'systems-architecture-grand-tour',
];

// ───────────────────────────────────────────────────────────────────────────
// Adversarial negatives (NEU-664). Chunks that match each rule's surface
// feature (regex hit, threshold crossed) but were judged correct on
// inspection — `expectedVerdict: 'clean'`. These guard the rule against
// false positives. Same caveat: counts well below the 20-row minimum.
// ───────────────────────────────────────────────────────────────────────────

const PHANTOM_PREREQUISITE_ADVERSARIAL = [
  'glossary-cross-reference-card',
  'algorithm-comparison-card',
];
const PHANTOM_CHAPTER_ADVERSARIAL = [
  'reference-card-data-structures',
  'reference-card-design-patterns',
];
const SCAFFOLDING_SECTION_ADVERSARIAL = [
  'practice-problems-standalone-page',
  'exercises-companion-card',
];
const BULLET_DOMINANT_ADVERSARIAL = [
  'enumerated-error-codes-card',
  'config-flags-reference-card',
];
const WORD_COUNT_FLOOR_ADVERSARIAL = [
  'definition-card-eigenvalue',
  'definition-card-monad',
];
const WORD_COUNT_CEILING_ADVERSARIAL = [
  'reference-textbook-chapter-vectors',
  'reference-textbook-chapter-graphs',
];

function makeEntry(
  ruleId: string,
  chunkId: string,
  split: CorpusEntryInput['split'],
  expectedVerdict: CorpusEntryInput['expectedVerdict'],
  notes: string
): CorpusEntryInput {
  return { ruleId, chunkId, split, expectedVerdict, notes };
}

const SEED_ENTRIES: CorpusEntryInput[] = [
  // Derivation positives — NEU-616 / NEU-617 spec material.
  ...PHANTOM_PREREQUISITE_CHUNKS.map(chunkId =>
    makeEntry(
      'tier1b.phantom-prerequisite',
      chunkId,
      'derivation',
      'should_flag',
      'NEU-616/NEU-617 derivation seed'
    )
  ),
  ...PHANTOM_CHAPTER_CHUNKS.map(chunkId =>
    makeEntry(
      'tier1b.phantom-chapter',
      chunkId,
      'derivation',
      'should_flag',
      'NEU-616/NEU-617 derivation seed'
    )
  ),
  ...SCAFFOLDING_SECTION_PRACTICE_CHUNKS.map(chunkId =>
    makeEntry(
      'tier1b.scaffolding-section',
      chunkId,
      'derivation',
      'should_flag',
      'NEU-616/NEU-617 derivation seed (E5 ## Practice Problems chunk)'
    )
  ),

  // Held-out positives — NEU-664.
  ...PHANTOM_PREREQUISITE_HELD_OUT.map(chunkId =>
    makeEntry(
      'tier1b.phantom-prerequisite',
      chunkId,
      'held_out',
      'should_flag',
      'NEU-664 held-out positive — chunk surfaces a noun phrase missing from prerequisites'
    )
  ),
  ...PHANTOM_CHAPTER_HELD_OUT.map(chunkId =>
    makeEntry(
      'tier1b.phantom-chapter',
      chunkId,
      'held_out',
      'should_flag',
      'NEU-664 held-out positive — multi-section chapter outside derivation set'
    )
  ),
  ...SCAFFOLDING_SECTION_HELD_OUT.map(chunkId =>
    makeEntry(
      'tier1b.scaffolding-section',
      chunkId,
      'held_out',
      'should_flag',
      'NEU-664 held-out positive — scaffolding heading outside E5-practice derivation set'
    )
  ),
  ...BULLET_DOMINANT_HELD_OUT.map(chunkId =>
    makeEntry(
      'tier1b.bullet-dominant',
      chunkId,
      'held_out',
      'should_flag',
      'NEU-664 held-out positive — bullet ratio above 0.7 in a teaching chunk'
    )
  ),
  ...WORD_COUNT_FLOOR_HELD_OUT.map(chunkId =>
    makeEntry(
      'tier1b.word-count-floor',
      chunkId,
      'held_out',
      'should_flag',
      'NEU-664 held-out positive — under-developed teaching chunk (<300 words, knowledge_type≠fact)'
    )
  ),
  ...WORD_COUNT_CEILING_HELD_OUT.map(chunkId =>
    makeEntry(
      'tier1b.word-count-ceiling',
      chunkId,
      'held_out',
      'should_flag',
      'NEU-664 held-out positive — over-stuffed chunk (>1500 words)'
    )
  ),

  // Adversarial negatives — NEU-664. Surface feature present, content correct.
  ...PHANTOM_PREREQUISITE_ADVERSARIAL.map(chunkId =>
    makeEntry(
      'tier1b.phantom-prerequisite',
      chunkId,
      'adversarial_negative',
      'clean',
      'NEU-664 adversarial negative — noun phrase reads as cross-reference, not phantom prereq'
    )
  ),
  ...PHANTOM_CHAPTER_ADVERSARIAL.map(chunkId =>
    makeEntry(
      'tier1b.phantom-chapter',
      chunkId,
      'adversarial_negative',
      'clean',
      'NEU-664 adversarial negative — legitimate multi-section reference card, not phantom chapter'
    )
  ),
  ...SCAFFOLDING_SECTION_ADVERSARIAL.map(chunkId =>
    makeEntry(
      'tier1b.scaffolding-section',
      chunkId,
      'adversarial_negative',
      'clean',
      'NEU-664 adversarial negative — practice/exercises heading is the chunk topic, not a scaffolded sub-section'
    )
  ),
  ...BULLET_DOMINANT_ADVERSARIAL.map(chunkId =>
    makeEntry(
      'tier1b.bullet-dominant',
      chunkId,
      'adversarial_negative',
      'clean',
      'NEU-664 adversarial negative — bullet-heavy by genre (reference card), not by neglect'
    )
  ),
  ...WORD_COUNT_FLOOR_ADVERSARIAL.map(chunkId =>
    makeEntry(
      'tier1b.word-count-floor',
      chunkId,
      'adversarial_negative',
      'clean',
      'NEU-664 adversarial negative — short by design (definition card with knowledge_type≠fact carve-out)'
    )
  ),
  ...WORD_COUNT_CEILING_ADVERSARIAL.map(chunkId =>
    makeEntry(
      'tier1b.word-count-ceiling',
      chunkId,
      'adversarial_negative',
      'clean',
      'NEU-664 adversarial negative — long-form reference content, legitimately above ceiling'
    )
  ),
];

export async function seed(): Promise<{ inserted: number; skipped: number }> {
  const db = getSql();
  const repo = new DrizzleLinterValidationRepository(db);

  // Pre-fetch which chunk IDs actually exist so we can warn on misses without
  // letting an FK violation poison the whole batch.
  const allChunkIds = Array.from(new Set(SEED_ENTRIES.map(e => e.chunkId)));
  const existingRows = await db
    .select({ id: learningChunks.id })
    .from(learningChunks)
    .where(inArray(learningChunks.id, allChunkIds));
  const existing = new Set(existingRows.map(r => r.id));

  let inserted = 0;
  let skipped = 0;
  for (const entry of SEED_ENTRIES) {
    if (!existing.has(entry.chunkId)) {
      logger.warn(
        `lint-corpus-seed: chunk "${entry.chunkId}" not present — skipping (rule="${entry.ruleId}")`
      );
      skipped++;
      continue;
    }
    await repo.upsertCorpusEntry(entry);
    inserted++;
  }
  return { inserted, skipped };
}

/* v8 ignore start */
const currentFile = new URL(import.meta.url).pathname;
const argFile = process.argv[1];
const isMainModule =
  Boolean(argFile) &&
  (currentFile === argFile || currentFile.endsWith(argFile.replace(/\\/g, '/')));

if (isMainModule) {
  (async () => {
    let pool: ReturnType<typeof getPool> | undefined;
    try {
      pool = getPool();
      const { inserted, skipped } = await seed();
      logger.info(
        `lint-corpus-seed: inserted/refreshed ${inserted} entries, skipped ${skipped} (chunk missing)`
      );
    } catch (err) {
      logger.error('lint-corpus-seed: failed:', err);
      process.exitCode = 1;
    } finally {
      try {
        await pool?.end();
      } catch (err) {
        logger.error('lint-corpus-seed: failed to close pool:', err);
        process.exitCode ||= 1;
      }
    }
  })();
}
/* v8 ignore stop */
