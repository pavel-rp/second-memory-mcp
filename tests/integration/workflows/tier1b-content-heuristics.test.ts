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
import {
  createTier1bRules,
  phantomChapterRule,
  bulletDominantRule,
  scaffoldingSectionRule,
  wordCountFloorRule,
  wordCountCeilingRule,
} from '../../../src/domain/services/linter-rules/index.js';
import { applyEligibilityToRules } from '../../../src/shared/linter/rule-intent.js';
import type { ValidatorReport } from '../../../src/domain/types/validator-report.js';

type Tier1bEntry = {
  rule: string;
  severity: string;
  category: string;
  detail: string;
  blocking_eligible: boolean;
};

function buildDeps(): TopicDeps {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    embedding: undefined,
    // Only Tier 1b registered — Tier 1a is omitted to keep the assertion
    // focused on the new heuristic findings (matches the convention of the
    // sibling phantom-prerequisite integration test).
    linterRules: applyEligibilityToRules(createTier1bRules(), []),
  };
}

async function readValidatorReport(chunkId: string): Promise<ValidatorReport | null> {
  const [row] = await getSql()
    .select({ validatorReport: learningChunks.validatorReport })
    .from(learningChunks)
    .where(eq(learningChunks.id, chunkId));
  return row?.validatorReport ?? null;
}

/**
 * Builds an `rsa-foundations`-style chunk body: enough H2/H3/bold to fire
 * phantom-chapter, enough bullets relative to prose to fire bullet-dominant,
 * enough words to skip both word-count rules. A `## Summary` heading at the
 * tail also triggers scaffolding-section to verify the rule fires through
 * the full pipeline.
 */
function buildPhantomChapterContent(): string {
  const sections: string[] = [];
  for (let i = 1; i <= 9; i++) {
    sections.push(
      [
        `## Section ${i}`,
        '',
        `This section explores topic number ${i} with sufficient prose to keep total word count between the floor and ceiling thresholds. Each paragraph is deliberately verbose so the chunk does not over-fire other heuristics during this integration test run.`,
        '',
        `- **Bullet point ${i}.1** describing one detail`,
        `- **Bullet point ${i}.2** describing another detail`,
        `- **Bullet point ${i}.3** describing a third detail`,
        `- **Bullet point ${i}.4** describing a fourth detail`,
        `- **Bullet point ${i}.5** describing a fifth detail`,
        '',
      ].join('\n')
    );
  }
  for (let i = 1; i <= 4; i++) {
    sections.push(`### Subsection ${i}\n\nOne supporting paragraph.\n`);
  }
  sections.push('## Summary\n\nWrap-up paragraph.');
  return sections.join('\n');
}

describe('tier1b content-pattern heuristics — create path persistence (NEU-617)', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('persists phantom-chapter, bullet-dominant, and scaffolding-section findings without blocking creation', async () => {
    const chunkId = crypto.randomUUID();
    const input: TopicCreationInput = {
      topicTitle: 'Tier 1b Content Heuristics Topic',
      topicDescription: 'Integration test for NEU-617 phantom-chapter + bullet-dominant signals',
      subject: 'CS',
      topicSummary: 'Confirms tier1b content-pattern heuristics persist as warnings',
      chunks: [
        {
          id: chunkId,
          title: 'Phantom Chapter Chunk',
          content: buildPhantomChapterContent(),
          difficulty: 3,
          estimatedDuration: 10,
          prerequisites: [],
          tags: [],
          chunkType: 'new',
        },
      ],
    };

    const result = await createTopicWithChunks(input, buildDeps());
    expect(result.success).toBe(true);

    const report = await readValidatorReport(chunkId);
    const tier1b = report?.tier1b as Tier1bEntry[] | undefined;
    expect(tier1b).toBeDefined();

    const targetRuleNames = new Set([
      phantomChapterRule.name,
      bulletDominantRule.name,
      scaffoldingSectionRule.name,
    ]);
    const targetEntries = tier1b!.filter(e => targetRuleNames.has(e.rule));

    // All three target rules fired.
    const firedRuleNames = new Set(targetEntries.map(e => e.rule));
    expect(firedRuleNames.has(phantomChapterRule.name)).toBe(true);
    expect(firedRuleNames.has(bulletDominantRule.name)).toBe(true);
    expect(firedRuleNames.has(scaffoldingSectionRule.name)).toBe(true);

    // Every persisted entry across the new heuristics is a non-blocking warning.
    for (const entry of targetEntries) {
      expect(entry.severity).toBe('warning');
      expect(entry.blocking_eligible).toBe(false);
    }

    // No tier1a section persisted — the test registered only Tier 1b rules.
    expect(report?.tier1a).toBeUndefined();

    // The word-count rules must not fire on this fixture (300+ words, <1500).
    const wordCountFindings = tier1b!.filter(
      e => e.rule === wordCountFloorRule.name || e.rule === wordCountCeilingRule.name
    );
    expect(wordCountFindings).toEqual([]);
  });

  it('does not fire any tier1b heuristics on a clean prose chunk above the word floor', async () => {
    const chunkId = crypto.randomUUID();
    const cleanContent = Array.from(
      { length: 35 },
      (_, i) =>
        `Sentence ${i + 1} of body prose conveys a single straightforward idea about the topic.`
    ).join(' ');
    const input: TopicCreationInput = {
      topicTitle: 'Clean Prose Topic',
      topicDescription: 'No heuristic should fire here',
      subject: 'CS',
      topicSummary: 'Baseline confirming clean prose passes through tier1b rules with no findings',
      chunks: [
        {
          id: chunkId,
          title: 'Clean Prose Chunk',
          content: cleanContent,
          difficulty: 3,
          estimatedDuration: 10,
          prerequisites: ['topic', 'idea', 'body', 'prose'],
          tags: [],
          chunkType: 'new',
        },
      ],
    };

    const result = await createTopicWithChunks(input, buildDeps());
    expect(result.success).toBe(true);

    const report = await readValidatorReport(chunkId);
    // Acceptable for `phantom-prerequisite` to still emit findings (it inspects
    // every noun phrase). Assert specifically that the five new heuristics
    // produced zero entries.
    const tier1b = (report?.tier1b as Tier1bEntry[] | undefined) ?? [];
    const newRuleNames = new Set([
      phantomChapterRule.name,
      scaffoldingSectionRule.name,
      bulletDominantRule.name,
      wordCountFloorRule.name,
      wordCountCeilingRule.name,
    ]);
    expect(tier1b.filter(e => newRuleNames.has(e.rule))).toEqual([]);
  });
});
