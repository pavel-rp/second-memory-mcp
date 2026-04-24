#!/usr/bin/env tsx
/**
 * `pnpm lint:corpus:seed` (NEU-627).
 *
 * Idempotently writes the derivation-split labels into
 * `infrastructure.linter_validation_corpus`. The chunk IDs below come from
 * the NEU-616 / NEU-617 spec material — they are the chunks the rule was
 * derived from and serve as the smoke-test corpus until proper held-out
 * labelling lands.
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

const SEED_ENTRIES: CorpusEntryInput[] = [
  ...PHANTOM_PREREQUISITE_CHUNKS.map(chunkId => ({
    ruleId: 'tier1b.phantom-prerequisite',
    chunkId,
    split: 'derivation' as const,
    expectedVerdict: 'should_flag' as const,
    notes: 'NEU-616/NEU-617 derivation seed',
  })),
  ...PHANTOM_CHAPTER_CHUNKS.map(chunkId => ({
    ruleId: 'tier1b.phantom-chapter',
    chunkId,
    split: 'derivation' as const,
    expectedVerdict: 'should_flag' as const,
    notes: 'NEU-616/NEU-617 derivation seed',
  })),
  ...SCAFFOLDING_SECTION_PRACTICE_CHUNKS.map(chunkId => ({
    ruleId: 'tier1b.scaffolding-section',
    chunkId,
    split: 'derivation' as const,
    expectedVerdict: 'should_flag' as const,
    notes: 'NEU-616/NEU-617 derivation seed (E5 ## Practice Problems chunk)',
  })),
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
