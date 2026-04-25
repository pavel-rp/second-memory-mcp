import crypto from 'node:crypto';
import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
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
import { createTier1bRules } from '../../../src/domain/services/linter-rules/index.js';
import { applyEligibilityToRules } from '../../../src/shared/linter/rule-intent.js';
import type { ValidatorReport } from '../../../src/domain/types/validator-report.js';

const PHANTOM_RULE_ID = 'tier1b.phantom-prerequisite';

function buildDeps(): TopicDeps {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    embedding: undefined,
    // Tier 1a omitted to keep the test focused on the new rule's findings;
    // mirrors the existing `tier1b-downgrade.test.ts` pattern. Eligibility is
    // resolved through the same helper composition-root uses at startup.
    linterRules: applyEligibilityToRules(createTier1bRules(), []),
  };
}

function makeInput(
  chunks: Array<{ id: string; content: string; prerequisites: string[] }>
): TopicCreationInput {
  return {
    topicTitle: 'Phantom-Prerequisite Integration Topic',
    topicDescription: 'Integration test for NEU-616 phantom-prerequisite detection',
    subject: 'CS',
    topicSummary: 'Verifies tier1b.phantom-prerequisite findings persist as warnings',
    chunks: chunks.map((c, i) => ({
      id: c.id,
      title: `Chunk ${i + 1}`,
      content: c.content,
      difficulty: 3,
      estimatedDuration: 10,
      prerequisites: c.prerequisites,
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

type Tier1bEntry = {
  rule: string;
  severity: string;
  category: string;
  detail: string;
  blocking_eligible: boolean;
};

// Scope note: the linter suite is invoked from `topic-workflows`'s topic
// creation path. `chunk-workflows` (`updateChunkContent`,
// `updateChunkMetadata`) does not re-run the linter, so this file
// intentionally covers only the create path. Adding update-path coverage
// here would assert behavior that does not exist; if update-path linting is
// introduced later, add a new describe block alongside this one.
describe('tier1b.phantom-prerequisite — create path persistence (NEU-616)', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('persists a warning finding when content references a term not in prerequisites', async () => {
    const chunkId = crypto.randomUUID();
    const result = await createTopicWithChunks(
      makeInput([
        {
          id: chunkId,
          // "The Euler Tour is the technique." is the canonical reproducer;
          // compromise emits two atomic noun phrases here.
          content: 'The Euler Tour is the technique.',
          prerequisites: ['recursion', 'tree'],
        },
      ]),
      buildDeps()
    );

    expect(result.success).toBe(true);

    const report = await readValidatorReport(chunkId);
    const tier1b = report?.tier1b as Tier1bEntry[] | undefined;
    expect(tier1b).toBeDefined();
    expect(tier1b!.length).toBeGreaterThanOrEqual(1);
    const phantomEntries = tier1b!.filter(e => e.rule === PHANTOM_RULE_ID);
    expect(phantomEntries.length).toBeGreaterThanOrEqual(1);
    for (const entry of phantomEntries) {
      expect(entry.severity).toBe('warning');
      expect(entry.category).toBe('phantom_prerequisite');
      expect(entry.blocking_eligible).toBe(false);
    }
    expect(phantomEntries.some(e => e.detail.includes('Euler'))).toBe(true);
  });

  it('persists no tier1b entries when every noun phrase is in prerequisites', async () => {
    const chunkId = crypto.randomUUID();
    const result = await createTopicWithChunks(
      makeInput([
        {
          id: chunkId,
          content: 'Use recursion. Walk the binary tree.',
          prerequisites: ['recursion', 'binary tree'],
        },
      ]),
      buildDeps()
    );

    expect(result.success).toBe(true);

    const report = await readValidatorReport(chunkId);
    expect(report).toBeDefined();
    // Canonical empty report: only `updated_at`. No `tier1a` or `tier1b` keys.
    expect(report?.tier1b).toBeUndefined();
  });

  it('persists one entry per distinct phantom term', async () => {
    const chunkId = crypto.randomUUID();
    const result = await createTopicWithChunks(
      makeInput([
        {
          id: chunkId,
          content:
            'The Euler Tour is the technique. Graphs are useful structures. The vertex carries the label.',
          prerequisites: [],
        },
      ]),
      buildDeps()
    );

    expect(result.success).toBe(true);

    const report = await readValidatorReport(chunkId);
    const tier1b = report?.tier1b as Tier1bEntry[] | undefined;
    expect(tier1b).toBeDefined();
    const phantomEntries = tier1b!.filter(e => e.rule === PHANTOM_RULE_ID);
    expect(phantomEntries.length).toBeGreaterThanOrEqual(3);
    for (const entry of phantomEntries) {
      expect(entry.severity).toBe('warning');
      expect(entry.blocking_eligible).toBe(false);
    }
  });
});
