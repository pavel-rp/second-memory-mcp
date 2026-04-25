// Tier 2 content-classifier types and Zod schemas (NEU-619).
//
// Domain layer: Zod schema + TypeScript types only. No I/O, no process.env,
// no imports from adapters or infrastructure.
//
// `VerdictSchema` is the stable contract between this ticket's adapter and
// NEU-620's consumer/persistence layer. Each verdict field is independently
// nullable so a single LangChain call failure does not invalidate the other
// five — the adapter fans out six parallel `withStructuredOutput` calls and
// resolves each field separately.

import { z } from 'zod';

/** A single scored aspect of the classifier verdict. */
export const VerdictFieldSchema = z.object({
  score: z.number().int().min(1).max(5),
  rationale: z
    .string()
    .min(1)
    .max(240)
    .regex(/^[^\n]+$/, 'rationale must be a single line'),
  // `false` when the model used the "not applicable" escape hatch (typically a
  // score=5 with a "not applicable: <reason>" rationale). Persisted alongside
  // score/rationale so dashboards can filter NA out of genuine score-5 counts
  // without parsing rationale prefixes. Legacy 1.0.0 rows lack this field;
  // read paths should treat absence as `applicable: true`.
  applicable: z.boolean(),
});
export type VerdictField = z.infer<typeof VerdictFieldSchema>;

/** Same shape, nullable — runtime failures resolve to null in their slot. */
export const NullableVerdictFieldSchema = VerdictFieldSchema.nullable();
export type NullableVerdictField = z.infer<typeof NullableVerdictFieldSchema>;

/**
 * Six-aspect chunk verdict. Internal casing is camelCase (domain convention);
 * NEU-620's JSONB persistence converts to snake_case at the boundary.
 */
export const VerdictSchema = z.object({
  renderingClarity: NullableVerdictFieldSchema,
  vocabularyAppropriate: NullableVerdictFieldSchema,
  mathNotationRenderingRisk: NullableVerdictFieldSchema,
  definitionConstructive: NullableVerdictFieldSchema,
  epistemicConsistency: NullableVerdictFieldSchema,
  overallFit: NullableVerdictFieldSchema,
});
export type ChunkClassifierVerdict = z.infer<typeof VerdictSchema>;

/** Ordered tuple of verdict field names. The adapter iterates over this to fan out calls. */
export const VERDICT_FIELDS = [
  'renderingClarity',
  'vocabularyAppropriate',
  'mathNotationRenderingRisk',
  'definitionConstructive',
  'epistemicConsistency',
  'overallFit',
] as const;
export type VerdictFieldName = (typeof VERDICT_FIELDS)[number];

/** Returns an all-null verdict — used when the adapter is unavailable or every field fails. */
export function emptyVerdict(): ChunkClassifierVerdict {
  const out: Record<VerdictFieldName, NullableVerdictField> = {
    renderingClarity: null,
    vocabularyAppropriate: null,
    mathNotationRenderingRisk: null,
    definitionConstructive: null,
    epistemicConsistency: null,
    overallFit: null,
  };
  return out;
}

/**
 * Pared-down chunk snapshot the classifier operates on. Kept minimal so
 * callers need not reshape internal `LearningChunk` entities. NEU-620
 * supplies these from `create_chunk` / `createTopicWithChunks` input.
 */
export type ChunkClassifierInput = {
  chunkId: string;
  title: string;
  content: string;
  chunkType: string;
  tags: readonly string[];
  prerequisites: readonly string[];
};

/**
 * Prompt material supplied by the caller. NEU-620 owns `classifier-prompts.ts`
 * which builds these strings from `CLASSIFIER_RUBRIC` + few-shots; the adapter
 * stays content-agnostic and only wires them into SystemMessage/HumanMessage.
 */
export type ClassifierPrompt = {
  systemPrompt: string;
  userPrompt: string;
};

/**
 * Per-field prompt map. NEU-660 broke the "build once, reuse across fan-out"
 * contract because under `gpt-5.4-mini` + `reasoning_effort: low` the model
 * was scoring against a generic prompt with the field identity smuggled only
 * via the structured-output schema name. Each entry now carries that field's
 * rubric line, exemplars, grounding clause, and edge-case clause.
 */
export type PerFieldClassifierPrompts = Record<VerdictFieldName, ClassifierPrompt>;
