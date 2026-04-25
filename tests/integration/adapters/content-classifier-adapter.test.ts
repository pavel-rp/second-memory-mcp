import { describe, it, expect } from 'vitest';
import { LangChainContentClassifierAdapter } from '../../../src/adapters/langchain/content-classifier-adapter.js';
import { resolveClassifierConfig } from '../../../src/config/resolve-classifier-config.js';
import {
  VerdictSchema,
  VERDICT_FIELDS,
  type ChunkClassifierInput,
  type PerFieldClassifierPrompts,
} from '../../../src/domain/types/classifier.js';

// Real-API schema-conformance test for NEU-619 / NEU-660.
//
// The production rubric + few-shots live in NEU-620's `classifier-prompts.ts`.
// This test deliberately uses minimal hand-crafted per-field prompts scoped to
// verifying that the adapter pipeline (ChatOpenAI -> withStructuredOutput ->
// VerdictSchema) produces parseable output for every field. It is NOT a
// substitute for the production prompt and must not be imported from outside
// this file.
const INLINE_TEST_PROMPTS: PerFieldClassifierPrompts = Object.fromEntries(
  VERDICT_FIELDS.map(field => [
    field,
    {
      systemPrompt: `You are a strict content-quality grader for educational chunks. You are scoring the "${field}" aspect only. You MUST return an integer score between 1 (worst) and 5 (best), a short single-line rationale (<= 200 chars, no newlines), and applicable=true unless the aspect does not apply (then score 5, rationale starting "not applicable:", applicable=false). Respond ONLY via the provided structured output tool.`,
      userPrompt: `Grade the following chunk on the "${field}" aspect. Anchor: 1 = severely deficient, 3 = adequate, 5 = excellent.`,
    },
  ])
) as PerFieldClassifierPrompts;

const SAMPLE_INPUT: ChunkClassifierInput = {
  chunkId: 'test-chunk-01',
  title: "Kruskal's algorithm for minimum spanning trees",
  content:
    "Kruskal's algorithm builds a minimum spanning tree (MST) by repeatedly taking the lowest-weight edge that does not form a cycle with the edges already chosen. Correctness follows from the cut property: for any cut of the graph, the minimum-weight edge crossing it belongs to some MST.",
  chunkType: 'E5',
  tags: ['graphs', 'mst', 'algorithms'],
  prerequisites: ['graph-basics', 'disjoint-set'],
};

describe.skipIf(!process.env.CLASSIFIER_PROVIDER)(
  'LangChainContentClassifierAdapter [real OpenAI API]',
  () => {
    it('returns a VerdictSchema-conformant verdict', async () => {
      const { classifier } = resolveClassifierConfig();
      expect(classifier.provider).toBe('openai');
      expect(classifier.openaiApiKey).not.toBeNull();

      const adapter = new LangChainContentClassifierAdapter(classifier);
      const verdict = await adapter.classify(SAMPLE_INPUT, INLINE_TEST_PROMPTS);

      const parsed = VerdictSchema.safeParse(verdict);
      expect(parsed.success).toBe(true);

      // At least one field should come back non-null when hitting the real API
      // with a valid key; if every field is null, configuration is likely broken.
      const nonNullFields = VERDICT_FIELDS.filter(f => verdict[f] !== null);
      expect(nonNullFields.length).toBeGreaterThan(0);

      for (const field of VERDICT_FIELDS) {
        const value = verdict[field];
        if (value === null) continue;
        expect(value.score).toBeGreaterThanOrEqual(1);
        expect(value.score).toBeLessThanOrEqual(5);
        expect(Number.isInteger(value.score)).toBe(true);
        expect(value.rationale.length).toBeGreaterThan(0);
      }
    }, 30_000);
  }
);
