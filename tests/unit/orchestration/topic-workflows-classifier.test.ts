import { describe, it, expect, vi } from 'vitest';
import {
  createTopicWithChunks,
  type TopicCreationInput,
  type TopicDeps,
} from '../../../src/orchestration/topic-workflows.js';
import type { ContentClassifierPort } from '../../../src/ports/content-classifier-port.js';
import type { ChunkClassifierVerdict } from '../../../src/domain/types/classifier.js';
import {
  stubChunkRepository,
  stubTopicRepository,
  stubSessionRepository,
  stubUnitOfWork,
} from '../../helpers/stub-ports.js';

// ──────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────

function cleanVerdict(): ChunkClassifierVerdict {
  return {
    renderingClarity: { score: 5, rationale: 'clean' },
    vocabularyAppropriate: { score: 5, rationale: 'clear' },
    mathNotationRenderingRisk: { score: 5, rationale: 'no math' },
    definitionConstructive: { score: 4, rationale: 'constructive' },
    epistemicConsistency: { score: 5, rationale: 'consistent' },
    overallFit: { score: 5, rationale: 'good atom' },
  };
}

function twoLowVerdict(): ChunkClassifierVerdict {
  return {
    renderingClarity: { score: 1, rationale: 'unbalanced fences' },
    vocabularyAppropriate: { score: 4, rationale: 'ok' },
    mathNotationRenderingRisk: { score: 5, rationale: 'no math' },
    definitionConstructive: { score: 4, rationale: 'constructive' },
    epistemicConsistency: { score: 3, rationale: 'middling' },
    overallFit: { score: 2, rationale: 'smells like TOC' },
  };
}

function allNullVerdict(): ChunkClassifierVerdict {
  return {
    renderingClarity: null,
    vocabularyAppropriate: null,
    mathNotationRenderingRisk: null,
    definitionConstructive: null,
    epistemicConsistency: null,
    overallFit: null,
  };
}

function partialNullVerdict(): ChunkClassifierVerdict {
  return {
    renderingClarity: { score: 1, rationale: 'unbalanced fences' },
    vocabularyAppropriate: null,
    mathNotationRenderingRisk: null,
    definitionConstructive: { score: 4, rationale: 'constructive' },
    epistemicConsistency: { score: 4, rationale: 'consistent' },
    overallFit: { score: 3, rationale: 'ok' },
  };
}

type BuiltDeps = {
  deps: TopicDeps;
  mergeValidatorReport: ReturnType<typeof vi.fn>;
};

function buildDeps(options: {
  classifier?: ContentClassifierPort;
  enableClassifierAtCreate?: boolean;
}): BuiltDeps {
  const mergeValidatorReport = vi.fn().mockResolvedValue(1);

  const txPorts = {
    topics: stubTopicRepository({
      create: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    }),
    chunks: stubChunkRepository({
      create: vi.fn().mockResolvedValue(undefined),
    }),
    sessions: stubSessionRepository(),
  };

  const deps: TopicDeps = {
    topics: stubTopicRepository(),
    chunks: stubChunkRepository({
      mergeValidatorReport,
    }),
    unitOfWork: stubUnitOfWork(undefined, txPorts),
    ...(options.classifier ? { classifier: options.classifier } : {}),
    ...(options.enableClassifierAtCreate !== undefined
      ? { enableClassifierAtCreate: options.enableClassifierAtCreate }
      : {}),
  };

  return { deps, mergeValidatorReport };
}

function input(): TopicCreationInput {
  return {
    topicTitle: 'Binary Search',
    subject: 'CS',
    topicSummary: 'One chunk that teaches binary search.',
    chunks: [
      {
        id: 'chunk-a',
        title: 'Binary search invariant',
        content: 'Classic lo/hi loop invariant.',
        difficulty: 3,
        estimatedDuration: 10,
        chunkType: 'concept',
      },
    ],
  };
}

function inputNoContent(): TopicCreationInput {
  return {
    topicTitle: 'Placeholder',
    subject: 'CS',
    topicSummary: 'Placeholder chunk.',
    chunks: [
      {
        id: 'chunk-placeholder',
        title: 'TBD',
        difficulty: 2,
        estimatedDuration: 5,
        chunkType: 'concept',
      },
    ],
  };
}

// ──────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────

describe('createTopicWithChunks — Tier 2 classifier wiring (NEU-620)', () => {
  it('does nothing when the classifier port is absent', async () => {
    const { deps, mergeValidatorReport } = buildDeps({ enableClassifierAtCreate: true });
    const result = await createTopicWithChunks(input(), deps);
    expect(result.success).toBe(true);
    expect(result.topic?.tier2Findings).toBeUndefined();
    expect(mergeValidatorReport).not.toHaveBeenCalled();
  });

  it('does nothing when enableClassifierAtCreate is false', async () => {
    const classify = vi.fn().mockResolvedValue(cleanVerdict());
    const { deps, mergeValidatorReport } = buildDeps({
      classifier: { classify },
      enableClassifierAtCreate: false,
    });
    const result = await createTopicWithChunks(input(), deps);
    expect(result.success).toBe(true);
    expect(classify).not.toHaveBeenCalled();
    expect(mergeValidatorReport).not.toHaveBeenCalled();
    expect(result.topic?.tier2Findings).toBeUndefined();
  });

  it('emits one warning finding per low-scoring field and persists snake_cased tier2', async () => {
    const classify = vi.fn().mockResolvedValue(twoLowVerdict());
    const { deps, mergeValidatorReport } = buildDeps({
      classifier: { classify },
      enableClassifierAtCreate: true,
    });
    const result = await createTopicWithChunks(input(), deps);

    expect(result.success).toBe(true);
    expect(classify).toHaveBeenCalledOnce();

    // Persistence shape
    expect(mergeValidatorReport).toHaveBeenCalledOnce();
    const [chunkId, partial, updatedAt] = mergeValidatorReport.mock.calls[0];
    expect(chunkId).toBe('chunk-a');
    expect(updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    const tier2 = (partial as { tier2: Record<string, unknown> }).tier2;
    expect(tier2.rendering_clarity).toEqual({ score: 1, rationale: 'unbalanced fences' });
    expect(tier2.overall_fit).toEqual({ score: 2, rationale: 'smells like TOC' });
    expect(tier2.prompt_version).toBe('1.0.0');
    expect(tier2.classified_at).toBe(updatedAt);

    // Findings surfaced on the response
    expect(result.topic?.tier2Findings).toHaveLength(2);
    const rules = (result.topic?.tier2Findings ?? []).map(f => f.rule).sort();
    expect(rules).toEqual(['classifier.overall_fit', 'classifier.rendering_clarity']);
    for (const finding of result.topic?.tier2Findings ?? []) {
      expect(finding.severity).toBe('warning');
      expect(finding.category).toBe('tier2');
      expect(finding.chunkId).toBe('chunk-a');
    }
  });

  it('treats a thrown classifier as fail-open — creation succeeds, no findings, no persistence', async () => {
    const classify = vi.fn().mockRejectedValue(new Error('OpenAI 503'));
    const { deps, mergeValidatorReport } = buildDeps({
      classifier: { classify },
      enableClassifierAtCreate: true,
    });
    const result = await createTopicWithChunks(input(), deps);
    expect(result.success).toBe(true);
    expect(result.topic?.tier2Findings).toBeUndefined();
    expect(mergeValidatorReport).not.toHaveBeenCalled();
  });

  it('treats an all-null verdict as no-op — no persistence, no findings', async () => {
    const classify = vi.fn().mockResolvedValue(allNullVerdict());
    const { deps, mergeValidatorReport } = buildDeps({
      classifier: { classify },
      enableClassifierAtCreate: true,
    });
    const result = await createTopicWithChunks(input(), deps);
    expect(result.success).toBe(true);
    expect(classify).toHaveBeenCalledOnce();
    expect(mergeValidatorReport).not.toHaveBeenCalled();
    expect(result.topic?.tier2Findings).toBeUndefined();
  });

  it('persists partial-null verdict and only emits findings for scored low fields', async () => {
    const classify = vi.fn().mockResolvedValue(partialNullVerdict());
    const { deps, mergeValidatorReport } = buildDeps({
      classifier: { classify },
      enableClassifierAtCreate: true,
    });
    const result = await createTopicWithChunks(input(), deps);
    expect(result.success).toBe(true);

    expect(mergeValidatorReport).toHaveBeenCalledOnce();
    const tier2 = (mergeValidatorReport.mock.calls[0][1] as { tier2: Record<string, unknown> })
      .tier2;
    expect(tier2.rendering_clarity).toEqual({ score: 1, rationale: 'unbalanced fences' });
    expect(tier2.vocabulary_appropriate).toBeNull();
    expect(tier2.math_notation_rendering_risk).toBeNull();

    // Only `rendering_clarity` (score 1) hit the ≤ 2 threshold.
    expect(result.topic?.tier2Findings).toHaveLength(1);
    expect(result.topic?.tier2Findings?.[0].rule).toBe('classifier.rendering_clarity');
  });

  it('skips classification for chunks with no content', async () => {
    const classify = vi.fn().mockResolvedValue(cleanVerdict());
    const { deps, mergeValidatorReport } = buildDeps({
      classifier: { classify },
      enableClassifierAtCreate: true,
    });
    const result = await createTopicWithChunks(inputNoContent(), deps);
    expect(result.success).toBe(true);
    expect(classify).not.toHaveBeenCalled();
    expect(mergeValidatorReport).not.toHaveBeenCalled();
    expect(result.topic?.tier2Findings).toBeUndefined();
  });

  it('ignores blockingMode — soft-warn never escalates to blocking in this ticket', async () => {
    // Regression pin: NEU-621 owns the blocking flip. Even if a future code
    // path reads a flag, this test ensures it does not short-circuit creation.
    const classify = vi.fn().mockResolvedValue(twoLowVerdict());
    const { deps } = buildDeps({
      classifier: { classify },
      enableClassifierAtCreate: true,
    });
    const result = await createTopicWithChunks(input(), deps);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    const severities = (result.topic?.tier2Findings ?? []).map(f => f.severity);
    expect(severities.every(s => s === 'warning')).toBe(true);
  });

  it('still surfaces findings when mergeValidatorReport throws (persistence failure)', async () => {
    const classify = vi.fn().mockResolvedValue(twoLowVerdict());
    const { deps, mergeValidatorReport } = buildDeps({
      classifier: { classify },
      enableClassifierAtCreate: true,
    });
    // Simulate a transient DB failure during the post-commit merge.
    mergeValidatorReport.mockRejectedValueOnce(new Error('conn reset'));

    const result = await createTopicWithChunks(input(), deps);
    // Creation still succeeds; only persistence was degraded, not the response.
    expect(result.success).toBe(true);
    // Findings are built from the verdict even when persistence fails.
    expect(result.topic?.tier2Findings).toHaveLength(2);
  });

  it('still surfaces findings when mergeValidatorReport affects zero rows (chunk deleted race)', async () => {
    const classify = vi.fn().mockResolvedValue(twoLowVerdict());
    const { deps, mergeValidatorReport } = buildDeps({
      classifier: { classify },
      enableClassifierAtCreate: true,
    });
    // Simulate the "chunk was deleted between commit and classification" race.
    mergeValidatorReport.mockResolvedValueOnce(0);

    const result = await createTopicWithChunks(input(), deps);
    expect(result.success).toBe(true);
    // Findings still surface to the caller even though persistence was a no-op.
    expect(result.topic?.tier2Findings).toHaveLength(2);
  });

  it('fans out classification in parallel across multiple chunks', async () => {
    const classify = vi.fn().mockResolvedValue(cleanVerdict());
    const { deps } = buildDeps({
      classifier: { classify },
      enableClassifierAtCreate: true,
    });
    const multi: TopicCreationInput = {
      topicTitle: 'Multi-chunk topic',
      subject: 'CS',
      topicSummary: 'Three chunks.',
      chunks: [
        {
          id: 'c1',
          title: 'One',
          content: 'First chunk content.',
          difficulty: 3,
          estimatedDuration: 5,
          chunkType: 'concept',
        },
        {
          id: 'c2',
          title: 'Two',
          content: 'Second chunk content.',
          difficulty: 3,
          estimatedDuration: 5,
          chunkType: 'concept',
        },
        {
          id: 'c3',
          title: 'Three',
          content: 'Third chunk content.',
          difficulty: 3,
          estimatedDuration: 5,
          chunkType: 'concept',
        },
      ],
    };
    const result = await createTopicWithChunks(multi, deps);
    expect(result.success).toBe(true);
    expect(classify).toHaveBeenCalledTimes(3);
    expect(result.topic?.tier2Findings).toBeUndefined();
  });
});
