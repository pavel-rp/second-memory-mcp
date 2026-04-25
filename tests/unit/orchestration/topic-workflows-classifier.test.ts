import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/shared/logger.js', () => ({
  getRequestLogger: vi.fn(() => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() })),
  logEvent: vi.fn(),
}));

import {
  createTopicWithChunks,
  type TopicCreationInput,
  type TopicDeps,
} from '../../../src/orchestration/topic-workflows.js';
import type { ContentClassifierPort } from '../../../src/ports/content-classifier-port.js';
import type { ChunkClassifierVerdict } from '../../../src/domain/types/classifier.js';
import { logEvent } from '../../../src/shared/logger.js';
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
    renderingClarity: { score: 5, rationale: 'clean', applicable: true },
    vocabularyAppropriate: { score: 5, rationale: 'clear', applicable: true },
    mathNotationRenderingRisk: { score: 5, rationale: 'no math', applicable: false },
    definitionConstructive: { score: 4, rationale: 'constructive', applicable: true },
    epistemicConsistency: { score: 5, rationale: 'consistent', applicable: true },
    overallFit: { score: 5, rationale: 'good atom', applicable: true },
  };
}

function twoLowVerdict(): ChunkClassifierVerdict {
  return {
    renderingClarity: { score: 1, rationale: 'unbalanced fences', applicable: true },
    vocabularyAppropriate: { score: 4, rationale: 'ok', applicable: true },
    mathNotationRenderingRisk: { score: 5, rationale: 'no math', applicable: false },
    definitionConstructive: { score: 4, rationale: 'constructive', applicable: true },
    epistemicConsistency: { score: 3, rationale: 'middling', applicable: true },
    overallFit: { score: 2, rationale: 'smells like TOC', applicable: true },
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
    renderingClarity: { score: 1, rationale: 'unbalanced fences', applicable: true },
    vocabularyAppropriate: null,
    mathNotationRenderingRisk: null,
    definitionConstructive: { score: 4, rationale: 'constructive', applicable: true },
    epistemicConsistency: { score: 4, rationale: 'consistent', applicable: true },
    overallFit: { score: 3, rationale: 'ok', applicable: true },
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
  beforeEach(() => {
    vi.mocked(logEvent).mockClear();
  });

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
    expect(tier2.rendering_clarity).toEqual({
      score: 1,
      rationale: 'unbalanced fences',
      applicable: true,
    });
    expect(tier2.overall_fit).toEqual({
      score: 2,
      rationale: 'smells like TOC',
      applicable: true,
    });
    expect(tier2.prompt_version).toBe('1.1.0');
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
    expect(tier2.rendering_clarity).toEqual({
      score: 1,
      rationale: 'unbalanced fences',
      applicable: true,
    });
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

  // ── NEU-639: classifier event logging ────────────────────────────
  describe('classifier event logging (NEU-639)', () => {
    it('emits one classifier.chunk_verdict per chunk with snake_case scores and persisted:true', async () => {
      const classify = vi.fn().mockResolvedValue(cleanVerdict());
      const { deps } = buildDeps({
        classifier: { classify },
        enableClassifierAtCreate: true,
      });

      const result = await createTopicWithChunks(input(), deps);
      expect(result.success).toBe(true);

      const verdictCalls = vi
        .mocked(logEvent)
        .mock.calls.filter(c => c[1] === 'classifier.chunk_verdict');
      expect(verdictCalls).toHaveLength(1);

      const [operation, event, data, durationArg] = verdictCalls[0];
      expect(operation).toBe('classifyChunk');
      expect(event).toBe('classifier.chunk_verdict');
      expect(data).toEqual({
        chunk_id: 'chunk-a',
        topic_id: expect.any(String),
        prompt_version: '1.1.0',
        duration_ms: expect.any(Number),
        scores: {
          rendering_clarity: 5,
          vocabulary_appropriate: 5,
          math_notation_rendering_risk: 5,
          definition_constructive: 4,
          epistemic_consistency: 5,
          overall_fit: 5,
        },
        failed_fields: [],
        persisted: true,
        rendered_user_prompt: {
          rendering_clarity: expect.stringContaining('Binary search invariant'),
          vocabulary_appropriate: expect.stringContaining('Binary search invariant'),
          math_notation_rendering_risk: expect.stringContaining('Binary search invariant'),
          definition_constructive: expect.stringContaining('Binary search invariant'),
          epistemic_consistency: expect.stringContaining('Binary search invariant'),
          overall_fit: expect.stringContaining('Binary search invariant'),
        },
      });
      // Duration is also passed as the 4th positional arg so pg-event-transport
      // populates the dedicated `duration_ms` SQL column (not just JSONB data).
      expect(durationArg).toEqual((data as { duration_ms: number }).duration_ms);
      expect(typeof durationArg).toBe('number');
    });

    it('emits classifier.classify_threw when classifier throws', async () => {
      const classify = vi.fn().mockRejectedValue(new TypeError('rate-limit'));
      const { deps } = buildDeps({
        classifier: { classify },
        enableClassifierAtCreate: true,
      });

      await createTopicWithChunks(input(), deps);

      const threwCalls = vi
        .mocked(logEvent)
        .mock.calls.filter(c => c[1] === 'classifier.classify_threw');
      expect(threwCalls).toHaveLength(1);

      const [operation, event, data, durationArg] = threwCalls[0];
      expect(operation).toBe('classifyChunk');
      expect(event).toBe('classifier.classify_threw');
      expect(data).toEqual({
        chunk_id: 'chunk-a',
        error_class: 'TypeError',
        error_message: 'rate-limit',
        duration_ms: expect.any(Number),
        rendered_user_prompt: {
          rendering_clarity: expect.stringContaining('Binary search invariant'),
          vocabulary_appropriate: expect.stringContaining('Binary search invariant'),
          math_notation_rendering_risk: expect.stringContaining('Binary search invariant'),
          definition_constructive: expect.stringContaining('Binary search invariant'),
          epistemic_consistency: expect.stringContaining('Binary search invariant'),
          overall_fit: expect.stringContaining('Binary search invariant'),
        },
      });
      expect(durationArg).toEqual((data as { duration_ms: number }).duration_ms);

      // No verdict event when classify throws.
      const verdictCalls = vi
        .mocked(logEvent)
        .mock.calls.filter(c => c[1] === 'classifier.chunk_verdict');
      expect(verdictCalls).toHaveLength(0);
    });

    it('handles non-Error throw values from classifier (string rejection)', async () => {
      // Covers the `: typeof err` and `: String(err)` branches of the ternaries
      // in classify_threw — exercised when the adapter rejects with a non-Error.
      const classify = vi.fn().mockRejectedValue('rate-limit string');
      const { deps } = buildDeps({
        classifier: { classify },
        enableClassifierAtCreate: true,
      });

      await createTopicWithChunks(input(), deps);

      const threwCalls = vi
        .mocked(logEvent)
        .mock.calls.filter(c => c[1] === 'classifier.classify_threw');
      expect(threwCalls).toHaveLength(1);
      expect(threwCalls[0][2]).toEqual({
        chunk_id: 'chunk-a',
        error_class: 'string',
        error_message: 'rate-limit string',
        duration_ms: expect.any(Number),
        rendered_user_prompt: {
          rendering_clarity: expect.stringContaining('Binary search invariant'),
          vocabulary_appropriate: expect.stringContaining('Binary search invariant'),
          math_notation_rendering_risk: expect.stringContaining('Binary search invariant'),
          definition_constructive: expect.stringContaining('Binary search invariant'),
          epistemic_consistency: expect.stringContaining('Binary search invariant'),
          overall_fit: expect.stringContaining('Binary search invariant'),
        },
      });
    });

    it('swallows event-logger throws so the post-commit phase is not poisoned', async () => {
      // Covers the `try { logEvent(...) } catch {}` envelopes around both the
      // chunk_verdict and classify_threw emissions. logEvent is documented to
      // never throw in production (stderr fallback) but the envelope defends
      // against composition-root misconfiguration.
      const cleanClassify = vi.fn().mockResolvedValue(cleanVerdict());
      const { deps } = buildDeps({
        classifier: { classify: cleanClassify },
        enableClassifierAtCreate: true,
      });
      vi.mocked(logEvent).mockImplementationOnce(() => {
        throw new Error('event logger broken');
      });

      const result = await createTopicWithChunks(input(), deps);
      expect(result.success).toBe(true);
      // Confirm the throwing logEvent was actually invoked (i.e. the envelope
      // around classifier.chunk_verdict was the catch site).
      expect(vi.mocked(logEvent).mock.calls.some(c => c[1] === 'classifier.chunk_verdict')).toBe(
        true
      );

      // The throwing classify catch envelope: classify rejects, logEvent throws.
      const throwingClassify = vi.fn().mockRejectedValue(new Error('boom'));
      const { deps: deps2 } = buildDeps({
        classifier: { classify: throwingClassify },
        enableClassifierAtCreate: true,
      });
      vi.mocked(logEvent).mockImplementationOnce(() => {
        throw new Error('event logger broken');
      });

      const result2 = await createTopicWithChunks(input(), deps2);
      // Topic creation still succeeds even when both classify and logEvent fail.
      expect(result2.success).toBe(true);
      expect(vi.mocked(logEvent).mock.calls.some(c => c[1] === 'classifier.classify_threw')).toBe(
        true
      );
    });

    it('reports persisted:false when mergeValidatorReport returns zero rows', async () => {
      const classify = vi.fn().mockResolvedValue(twoLowVerdict());
      const { deps, mergeValidatorReport } = buildDeps({
        classifier: { classify },
        enableClassifierAtCreate: true,
      });
      mergeValidatorReport.mockResolvedValueOnce(0);

      await createTopicWithChunks(input(), deps);

      const verdictCalls = vi
        .mocked(logEvent)
        .mock.calls.filter(c => c[1] === 'classifier.chunk_verdict');
      expect(verdictCalls).toHaveLength(1);
      expect((verdictCalls[0][2] as { persisted: boolean }).persisted).toBe(false);
    });

    it('reports persisted:false when mergeValidatorReport throws', async () => {
      const classify = vi.fn().mockResolvedValue(twoLowVerdict());
      const { deps, mergeValidatorReport } = buildDeps({
        classifier: { classify },
        enableClassifierAtCreate: true,
      });
      mergeValidatorReport.mockRejectedValueOnce(new Error('conn reset'));

      await createTopicWithChunks(input(), deps);

      const verdictCalls = vi
        .mocked(logEvent)
        .mock.calls.filter(c => c[1] === 'classifier.chunk_verdict');
      expect(verdictCalls).toHaveLength(1);
      expect((verdictCalls[0][2] as { persisted: boolean }).persisted).toBe(false);
    });

    it('emits verdict event with persisted:false for all-null verdicts', async () => {
      const classify = vi.fn().mockResolvedValue(allNullVerdict());
      const { deps } = buildDeps({
        classifier: { classify },
        enableClassifierAtCreate: true,
      });

      await createTopicWithChunks(input(), deps);

      const verdictCalls = vi
        .mocked(logEvent)
        .mock.calls.filter(c => c[1] === 'classifier.chunk_verdict');
      expect(verdictCalls).toHaveLength(1);
      const data = verdictCalls[0][2] as {
        persisted: boolean;
        scores: Record<string, number | null>;
        failed_fields: string[];
      };
      expect(data.persisted).toBe(false);
      expect(Object.values(data.scores).every(s => s === null)).toBe(true);
      expect(data.failed_fields).toHaveLength(6);
    });

    it('emits zero classifier events when enableClassifierAtCreate is false', async () => {
      const classify = vi.fn().mockResolvedValue(cleanVerdict());
      const { deps } = buildDeps({
        classifier: { classify },
        enableClassifierAtCreate: false,
      });

      await createTopicWithChunks(input(), deps);

      const classifierCalls = vi
        .mocked(logEvent)
        .mock.calls.filter(c => typeof c[1] === 'string' && c[1].startsWith('classifier.'));
      expect(classifierCalls).toHaveLength(0);
    });
  });
});
