import {
  VERDICT_FIELDS,
  type ChunkClassifierVerdict,
  type ClassifierPrompt,
  type NullableVerdictField,
  type VerdictFieldName,
} from '../../domain/types/classifier.js';

/**
 * Prompt / rubric / few-shot material for the Tier 2 chunk classifier (NEU-620).
 *
 * This module is pure: it only authors strings and exposes a couple of small
 * helpers that the orchestration layer uses to build `ClassifierPrompt`
 * payloads and convert verdicts into the snake-cased JSONB shape persisted to
 * `validator_report.tier2`. No I/O, no `process.env`, no `Date.now`.
 *
 * **Ownership:** NEU-620 owns the prompt contents. NEU-619 owns the port and
 * the adapter; the adapter stays prompt-agnostic. If you need to adjust scoring
 * behavior, change the rubric here — the adapter does not need edits.
 */

/** Semver-tagged version of the prompt body; stored with every verdict. */
export const CLASSIFIER_PROMPT_VERSION = '1.0.0';

/** A single few-shot exemplar. `label` tags the exemplar for diagnostics and tests. */
export type FewShotExample = {
  label: string;
  verdict: 'clean' | 'phantom_chapter';
  chunkTitle: string;
  chunkContent: string;
  /** Plain-English rationale shown to the model as the target output. */
  rationale: string;
};

/**
 * Rubric for the six-field verdict. Drawn from the broader pedagogy literature
 * (Wozniak Rule 4 — minimum information principle; Sweller Cognitive Load
 * Theory — intrinsic / extraneous / germane load; Merrill Component Display
 * Theory — fact/concept/procedure/principle types). Retro examples from the
 * NEU-591 umbrella illustrate; they do not define.
 */
export const CLASSIFIER_RUBRIC = [
  'You are a rubric-anchored grader for learning-chunk content quality.',
  'For each listed aspect, score the chunk 1 (severe problem) through 5 (excellent) and supply a short rationale.',
  '',
  'rendering_clarity — Does the chunk display cleanly in a standard Markdown client? Score 1 when fenced code is unbalanced, tables are malformed, or `<details>` is nested past 3 levels. Score 5 when every block parses without ambiguity.',
  'vocabulary_appropriate — Are technical terms either introduced in-chunk, linked via declared prerequisites, or part of the presumed background? Score low when the learner would need to jump elsewhere to decode undefined jargon (cf. Wozniak Rule 4 — each chunk should be self-sufficient for its atom of knowledge).',
  "math_notation_rendering_risk — Will the math notation render unambiguously in prose? Score low when prime marks, subscripts, or superscripts appear in running text without math fences (e.g. `A(n')` rendered as text) — these frequently render as literal glyphs or are silently stripped by downstream clients.",
  'definition_constructive — If the chunk defines a term, does it use a constructive definition (procedure, schema, mapping) rather than a list of examples or adjacent properties? Score low when the definition is "X is that which has properties P1, P2, P3" without a route from first principles.',
  'epistemic_consistency — Is the teaching frame internally consistent? Score low when a chunk frames itself as a concept but is actually a phantom chapter (multiple H2 sections, generic summary blocks, exercise lists) — this violates Sweller CLT by forcing the learner to process multiple unrelated atoms simultaneously.',
  'overall_fit — Does this belong in a spaced-repetition corpus as a single chunk? Score low for table-of-contents chunks, meta-summaries, or content that maps onto multiple Merrill CDT component types (fact + concept + procedure bundled together).',
  '',
  'Return a JSON object with `{ score, rationale }` for the requested field. Scores are integers in [1, 5]. Rationale is a single sentence under 240 chars, no newlines.',
].join('\n');

/**
 * Six synthetic exemplars: three clean-pass and three phantom-chapter fails.
 * Labels match the NEU-591 umbrella's named retros for traceability but the
 * chunk bodies are authored from scratch — no verbatim production content.
 */
export const CLASSIFIER_FEW_SHOTS: readonly FewShotExample[] = [
  {
    label: 'et-tin-tout-construction',
    verdict: 'clean',
    chunkTitle: 'Euler tour: tin/tout construction',
    chunkContent:
      'Given a rooted tree, perform a DFS. When you first visit node v, record tin[v] as the current timer value and increment the timer. When DFS returns from v, record tout[v] likewise. The key invariant: u is an ancestor of v iff tin[u] <= tin[v] AND tout[v] <= tout[u]. This replaces tree ancestry queries with a pair of integer comparisons.',
    rationale:
      'Single procedure, self-sufficient definition, no phantom scaffolding — a clean atom.',
  },
  {
    label: 'et-why-fails-for-paths',
    verdict: 'clean',
    chunkTitle: 'Why Euler-tour ancestry fails for non-tree graphs',
    chunkContent:
      'Euler-tour ancestry depends on the invariant that each DFS edge is traversed exactly twice. In a graph with cycles, a node v may be reached by multiple paths; the first DFS visit records tin[v] but the second visit from a different parent does not. The ancestor check then yields false negatives. Use this only for rooted trees (or DFS forests where each component is processed independently).',
    rationale: 'Contrastive frame tied to a declared prerequisite; single concept.',
  },
  {
    label: 'hld-light-edge-lemma',
    verdict: 'clean',
    chunkTitle: 'Heavy-light: light-edge path bound',
    chunkContent:
      "Call an edge (parent, child) light when the child's subtree size is at most half the parent's. Claim: any root-to-leaf path contains at most log2(n) light edges. Proof: each light edge at least halves the subtree size, and the subtree size is bounded by n. This is why HLD queries take O(log^2 n): log depth via light edges times log per heavy-chain segment tree query.",
    rationale: 'Complete statement plus proof of a single lemma; no filler.',
  },
  {
    label: 'rsa-foundations',
    verdict: 'phantom_chapter',
    chunkTitle: 'RSA Foundations',
    chunkContent:
      "## Introduction\nRSA is a public-key cryptosystem.\n\n## Number Theory Prerequisites\n- Primes\n- Euler's totient\n- Modular exponentiation\n\n## Key Generation\nSteps to generate keys.\n\n## Encryption and Decryption\nHow to encrypt and decrypt.\n\n## Security\nSecurity depends on integer factorization.\n\n## Practice Problems\n1. Compute phi(15).\n2. Encrypt 42 with public key (5, 77).",
    rationale:
      'Multiple H2 sections, a Practice Problems block, no single atomic concept — classic phantom chapter.',
  },
  {
    label: 'hld-complexity-and-composition',
    verdict: 'phantom_chapter',
    chunkTitle: 'HLD Complexity and Composition',
    chunkContent:
      '## What is HLD\nHeavy-light decomposition is a technique.\n\n## Why It Works\nIt partitions paths.\n\n## Analysis\n- Time: O(log^2 n)\n- Space: O(n)\n\n## Summary\nHLD is used for tree path queries.\n\n## Exercises\nTry implementing HLD on a test tree.',
    rationale:
      'Four unrelated sections (definition, intuition, analysis, exercises) bundled as one chunk; violates CLT.',
  },
  {
    label: 'ann-ivfflat',
    verdict: 'phantom_chapter',
    chunkTitle: 'Approximate Nearest Neighbors: IVFFlat',
    chunkContent:
      '## Overview\nIVFFlat is an ANN method.\n\n## How It Works\n- Cluster vectors with k-means\n- Query only the nearest clusters\n- Flat scan inside each cluster\n\n## Parameters\n- nlist: number of clusters\n- nprobe: clusters to search\n\n## Tradeoffs\nRecall vs. speed.\n\n## Summary\nUse IVFFlat when exact search is too slow.',
    rationale:
      'Overview + parameters + tradeoffs + summary sections — table of contents, not a chunk.',
  },
];

/**
 * Build the `ClassifierPrompt` shape `ContentClassifierPort.classify` expects.
 * The system prompt carries the rubric and renders the few-shots as labeled
 * blocks. The user prompt is a short instruction — the adapter's
 * `renderUserPayload` handles chunk serialization.
 *
 * The returned prompt does not depend on any per-chunk input, so callers that
 * classify multiple chunks should build once and reuse across the fan-out.
 */
export function buildClassifierPrompt(
  rubric: string = CLASSIFIER_RUBRIC,
  fewShots: readonly FewShotExample[] = CLASSIFIER_FEW_SHOTS
): ClassifierPrompt {
  const fewShotBody = fewShots
    .map(example => {
      return [
        `<EXAMPLE label="${example.label}" expected_verdict="${example.verdict}">`,
        `Title: ${example.chunkTitle}`,
        '',
        example.chunkContent,
        '',
        `Expected grader note: ${example.rationale}`,
        '</EXAMPLE>',
      ].join('\n');
    })
    .join('\n\n');

  const systemPrompt = [rubric, '', '--- EXEMPLARS ---', fewShotBody].join('\n');
  const userPrompt =
    'Score the chunk below against the rubric. Return only the requested field as a JSON object.';

  return { systemPrompt, userPrompt };
}

/** Camel → snake conversion for verdict field names, with a compile-time exhaustive map. */
export const PERSISTED_TIER2_FIELD_NAMES: Record<VerdictFieldName, string> = {
  renderingClarity: 'rendering_clarity',
  vocabularyAppropriate: 'vocabulary_appropriate',
  mathNotationRenderingRisk: 'math_notation_rendering_risk',
  definitionConstructive: 'definition_constructive',
  epistemicConsistency: 'epistemic_consistency',
  overallFit: 'overall_fit',
};

/** Snake-cased JSONB payload stored under `validator_report.tier2`. */
export type Tier2PersistedShape = {
  rendering_clarity: NullableVerdictField;
  vocabulary_appropriate: NullableVerdictField;
  math_notation_rendering_risk: NullableVerdictField;
  definition_constructive: NullableVerdictField;
  epistemic_consistency: NullableVerdictField;
  overall_fit: NullableVerdictField;
  prompt_version: string;
  classified_at: string;
};

/**
 * Convert the in-memory camelCase `ChunkClassifierVerdict` into the snake_cased
 * shape persisted under `validator_report.tier2`. Preserves per-field nulls.
 * `classifiedAtIso` is supplied by the caller — this module stays pure.
 */
export function toPersistedTier2(
  verdict: ChunkClassifierVerdict,
  classifiedAtIso: string
): Tier2PersistedShape {
  return {
    rendering_clarity: verdict.renderingClarity,
    vocabulary_appropriate: verdict.vocabularyAppropriate,
    math_notation_rendering_risk: verdict.mathNotationRenderingRisk,
    definition_constructive: verdict.definitionConstructive,
    epistemic_consistency: verdict.epistemicConsistency,
    overall_fit: verdict.overallFit,
    prompt_version: CLASSIFIER_PROMPT_VERSION,
    classified_at: classifiedAtIso,
  };
}

/**
 * Upper bound on the combined system + user prompt length. ~4 KB input tokens
 * maps to roughly 16 000 UTF-8 chars for English text — a conservative guard
 * that catches accidental drift during future rubric edits. Enforced by the
 * `buildClassifierPrompt respects the char budget` unit test.
 */
export const CLASSIFIER_PROMPT_CHAR_BUDGET = 16_000;

// Keep `VERDICT_FIELDS` re-exported here too — consumers that only want the
// prompt module should not also need to import the domain types module just
// to iterate field names.
export { VERDICT_FIELDS };
