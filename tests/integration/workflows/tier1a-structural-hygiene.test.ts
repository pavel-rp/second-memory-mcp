import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningChunks, learningTopics } from '../../../src/infrastructure/db/schema.js';
import { DrizzleChunkRepository } from '../../../src/adapters/drizzle/chunk-repository.js';
import { DrizzleTopicRepository } from '../../../src/adapters/drizzle/topic-repository.js';
import { DrizzleUnitOfWorkAdapter } from '../../../src/adapters/drizzle/unit-of-work-adapter.js';
import {
  createTopicWithChunks,
  type TopicCreationInput,
  type TopicDeps,
} from '../../../src/orchestration/topic-workflows.js';
import { createTier1aRules } from '../../../src/domain/services/linter-rules/index.js';
import type { ValidatorReport } from '../../../src/domain/types/validator-report.js';

function buildDeps(): TopicDeps {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    embedding: undefined,
    linterRules: createTier1aRules(),
  };
}

function makeInput(
  chunkContents: Array<string | null>,
  titlePrefix = 'Tier1a Chunk'
): TopicCreationInput {
  return {
    topicTitle: 'Tier1a Structural Hygiene Topic',
    topicDescription: 'Integration coverage for NEU-628',
    subject: 'CS',
    topicSummary: 'Summary used by Tier 1a structural-hygiene integration tests',
    chunks: chunkContents.map((content, i) => ({
      id: crypto.randomUUID(),
      title: `${titlePrefix} ${i + 1}`,
      content: content ?? undefined,
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

async function countChunksById(id: string): Promise<number> {
  const db = getSql();
  const rows = await db
    .select({ id: learningChunks.id })
    .from(learningChunks)
    .where(eq(learningChunks.id, id));
  return rows.length;
}

async function countTopicsByTitle(title: string): Promise<number> {
  const db = getSql();
  const rows = await db
    .select({ id: learningTopics.id })
    .from(learningTopics)
    .where(eq(learningTopics.title, title));
  return rows.length;
}

describe('Tier 1a structural hygiene (NEU-628) — create path', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('rejects topic creation when a chunk has an unbalanced code fence', async () => {
    const input = makeInput(['```typescript\nconst x = 1;\n']);
    const firstChunkId = input.chunks[0].id;

    const result = await createTopicWithChunks(input, buildDeps());

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    expect(result.error?.retryable).toBe(false);
    const findings = result.error?.findings ?? [];
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some(f => f.rule === 'tier1a.code-fence-balance')).toBe(true);
    for (const f of findings) {
      expect(f.severity).toBe('blocking');
    }

    // DB must be untouched
    expect(await countChunksById(firstChunkId)).toBe(0);
    expect(await countTopicsByTitle(input.topicTitle)).toBe(0);
  });

  it('persists a clean chunk with an empty tier1a validator_report', async () => {
    const cleanContent = [
      '# Title',
      '',
      '## Section',
      '',
      '```typescript',
      'const x = 1;',
      '```',
      '',
      '| A | B |',
      '| - | - |',
      '| 1 | 2 |',
      '',
      '<details><summary>more</summary>body</details>',
    ].join('\n');
    const input = makeInput([cleanContent]);
    const firstChunkId = input.chunks[0].id;

    const result = await createTopicWithChunks(input, buildDeps());

    expect(result.success).toBe(true);
    const report = await readValidatorReport(firstChunkId);
    expect(report).not.toBeNull();
    expect(report?.updated_at).toEqual(expect.any(String));
    expect(report?.tier1a).toBeUndefined();
    expect(report?.tier1b).toBeUndefined();
    expect(report?.tier2).toBeUndefined();
  });

  it('surfaces findings from multiple Tier 1a rules on a single violating chunk', async () => {
    // Unbalanced fence AND duplicate H1
    const content = '# First\n\n# Second\n\n```typescript\nconst x = 1;\n';
    const input = makeInput([content]);

    const result = await createTopicWithChunks(input, buildDeps());

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    const findings = result.error?.findings ?? [];
    const ruleNames = new Set(findings.map(f => f.rule));
    expect(ruleNames.has('tier1a.code-fence-balance')).toBe(true);
    expect(ruleNames.has('tier1a.duplicate-h1')).toBe(true);
    for (const f of findings) {
      expect(f.severity).toBe('blocking');
    }
  });

  it('rejects on a table-structure violation (missing separator row)', async () => {
    const content = '# Title\n\n| A | B |\n| 1 | 2 |\n';
    const input = makeInput([content]);
    const chunkId = input.chunks[0].id;

    const result = await createTopicWithChunks(input, buildDeps());

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    const findings = result.error?.findings ?? [];
    expect(findings.some(f => f.rule === 'tier1a.table-structure')).toBe(true);
    expect(await countChunksById(chunkId)).toBe(0);
    expect(await countTopicsByTitle(input.topicTitle)).toBe(0);
  });

  it('rejects on a heading-hierarchy skip (H1 → H3)', async () => {
    const content = '# A\n\n### C\n';
    const input = makeInput([content]);
    const chunkId = input.chunks[0].id;

    const result = await createTopicWithChunks(input, buildDeps());

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    const findings = result.error?.findings ?? [];
    expect(findings.some(f => f.rule === 'tier1a.heading-hierarchy')).toBe(true);
    expect(await countChunksById(chunkId)).toBe(0);
  });

  it('rejects on <details> nested past the depth limit', async () => {
    const content =
      '<details><details><details><details>deep</details></details></details></details>';
    const input = makeInput([content]);
    const chunkId = input.chunks[0].id;

    const result = await createTopicWithChunks(input, buildDeps());

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    const findings = result.error?.findings ?? [];
    expect(findings.some(f => f.rule === 'tier1a.details-nesting')).toBe(true);
    expect(await countChunksById(chunkId)).toBe(0);
  });

  it('rejects on a duplicate H1', async () => {
    const content = '# First\n\n# Second\n';
    const input = makeInput([content]);
    const chunkId = input.chunks[0].id;

    const result = await createTopicWithChunks(input, buildDeps());

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    const findings = result.error?.findings ?? [];
    expect(findings.some(f => f.rule === 'tier1a.duplicate-h1')).toBe(true);
    expect(await countChunksById(chunkId)).toBe(0);
  });

  it('exposes five rules via createTier1aRules()', () => {
    const rules = createTier1aRules();
    expect(rules.length).toBe(5);
    const names = rules.map(r => r.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'tier1a.code-fence-balance',
        'tier1a.table-structure',
        'tier1a.heading-hierarchy',
        'tier1a.details-nesting',
        'tier1a.duplicate-h1',
      ])
    );
    for (const rule of rules) {
      expect(rule.tier).toBe('tier1a');
      expect(rule.scope).toBe('chunk');
    }
  });
});
