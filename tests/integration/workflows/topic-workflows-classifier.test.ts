import { describe, it, beforeAll, beforeEach, afterAll, expect, vi } from 'vitest';
import crypto from 'node:crypto';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { DrizzleChunkRepository } from '../../../src/adapters/drizzle/chunk-repository.js';
import { DrizzleTopicRepository } from '../../../src/adapters/drizzle/topic-repository.js';
import { DrizzleUnitOfWorkAdapter } from '../../../src/adapters/drizzle/unit-of-work-adapter.js';
import {
  createTopicWithChunks,
  type TopicCreationInput,
  type TopicDeps,
} from '../../../src/orchestration/topic-workflows.js';
import type { ContentClassifierPort } from '../../../src/ports/content-classifier-port.js';
import type { ChunkClassifierVerdict } from '../../../src/domain/types/classifier.js';

function makeInput(chunkIds: string[]): TopicCreationInput {
  return {
    topicTitle: 'Tier 2 Classifier Integration Topic',
    topicDescription: 'Topic for NEU-620 integration tests',
    subject: 'CS',
    topicSummary: 'Summary used by NEU-620 tier2 integration tests.',
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

function lowScoreVerdict(): ChunkClassifierVerdict {
  return {
    renderingClarity: { score: 2, rationale: 'fence balance risk' },
    vocabularyAppropriate: { score: 4, rationale: 'ok' },
    mathNotationRenderingRisk: { score: 5, rationale: 'no math' },
    definitionConstructive: { score: 4, rationale: 'constructive' },
    epistemicConsistency: { score: 4, rationale: 'consistent' },
    overallFit: { score: 2, rationale: 'smells like TOC' },
  };
}

function buildDeps(options: {
  classifier?: ContentClassifierPort;
  enableClassifierAtCreate?: boolean;
}): TopicDeps {
  const db = getSql();
  return {
    chunks: new DrizzleChunkRepository(db),
    topics: new DrizzleTopicRepository(db),
    unitOfWork: new DrizzleUnitOfWorkAdapter(),
    embedding: undefined,
    linterRules: [],
    ...(options.classifier ? { classifier: options.classifier } : {}),
    ...(options.enableClassifierAtCreate !== undefined
      ? { enableClassifierAtCreate: options.enableClassifierAtCreate }
      : {}),
  };
}

describe('createTopicWithChunks — Tier 2 classifier integration (NEU-620)', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('persists snake_cased tier2 verdict and surfaces low-score warnings', async () => {
    const ids = [crypto.randomUUID(), crypto.randomUUID()];
    const classify = vi.fn().mockResolvedValue(lowScoreVerdict());
    const classifier: ContentClassifierPort = { classify };

    const result = await createTopicWithChunks(
      makeInput(ids),
      buildDeps({ classifier, enableClassifierAtCreate: true })
    );
    expect(result.success).toBe(true);
    expect(classify).toHaveBeenCalledTimes(2);

    const db = getSql();
    const repo = new DrizzleChunkRepository(db);

    for (const id of ids) {
      const report = await repo.getValidatorReport(id);
      expect(report).not.toBeNull();
      const tier2 = report?.tier2 as Record<string, unknown> | undefined;
      expect(tier2).toBeDefined();
      expect(tier2?.rendering_clarity).toEqual({ score: 2, rationale: 'fence balance risk' });
      expect(tier2?.overall_fit).toEqual({ score: 2, rationale: 'smells like TOC' });
      expect(tier2?.vocabulary_appropriate).toEqual({ score: 4, rationale: 'ok' });
      expect(tier2?.prompt_version).toBe('1.0.0');
      expect(typeof tier2?.classified_at).toBe('string');
    }

    // Each chunk should contribute 2 warnings (rendering_clarity, overall_fit).
    expect(result.topic?.tier2Findings).toHaveLength(4);
    const rules = (result.topic?.tier2Findings ?? []).map(f => f.rule).sort();
    expect(rules).toEqual([
      'classifier.overall_fit',
      'classifier.overall_fit',
      'classifier.rendering_clarity',
      'classifier.rendering_clarity',
    ]);
    for (const finding of result.topic?.tier2Findings ?? []) {
      expect(finding.severity).toBe('warning');
      expect(finding.category).toBe('tier2');
    }
  });

  it('produces no tier2 key and no findings when classifier is absent', async () => {
    const ids = [crypto.randomUUID()];
    const result = await createTopicWithChunks(
      makeInput(ids),
      buildDeps({ enableClassifierAtCreate: true })
    );
    expect(result.success).toBe(true);
    expect(result.topic?.tier2Findings).toBeUndefined();

    const db = getSql();
    const repo = new DrizzleChunkRepository(db);
    const report = await repo.getValidatorReport(ids[0]);
    expect(report).not.toBeNull();
    expect(report?.tier2).toBeUndefined();
  });

  it('produces no tier2 key when enableClassifierAtCreate is false', async () => {
    const ids = [crypto.randomUUID()];
    const classify = vi.fn().mockResolvedValue(lowScoreVerdict());
    const classifier: ContentClassifierPort = { classify };

    const result = await createTopicWithChunks(
      makeInput(ids),
      buildDeps({ classifier, enableClassifierAtCreate: false })
    );
    expect(result.success).toBe(true);
    expect(classify).not.toHaveBeenCalled();
    expect(result.topic?.tier2Findings).toBeUndefined();

    const db = getSql();
    const repo = new DrizzleChunkRepository(db);
    const report = await repo.getValidatorReport(ids[0]);
    expect(report).not.toBeNull();
    expect(report?.tier2).toBeUndefined();
  });

  it('getValidatorReport returns null for an unknown chunk id', async () => {
    const repo = new DrizzleChunkRepository(getSql());
    const report = await repo.getValidatorReport('no-such-chunk-id');
    expect(report).toBeNull();
  });
});
