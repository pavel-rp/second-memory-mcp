import {
  VERDICT_FIELDS,
  type ChunkClassifierVerdict,
  type NullableVerdictField,
  type PerFieldClassifierPrompts,
  type VerdictFieldName,
} from '../../domain/types/classifier.js';

/**
 * Prompt / rubric / few-shot material for the Tier 2 chunk classifier (NEU-620).
 *
 * This module is pure: it only authors strings and exposes a couple of small
 * helpers that the orchestration layer uses to build per-field
 * `ClassifierPrompt` payloads and convert verdicts into the snake-cased JSONB
 * shape persisted to `validator_report.tier2`. No I/O, no `process.env`,
 * no `Date.now`.
 *
 * **NEU-660 changes (1.1.0):** the previous "build once, reuse" contract was
 * deliberately broken. `gpt-5.4-mini` under `reasoning_effort: low` was
 * receiving a generic system + user payload broadcast to all six fan-out
 * calls; the only per-call differentiator was the structured-output schema
 * name. Each fan-out call now receives a field-specific prompt that names the
 * aspect, leads with that aspect's rubric line, renders only that aspect's
 * exemplars, and includes explicit grounding + edge-case clauses.
 */

/**
 * Semver-tagged version of the prompt body; stored with every verdict.
 *
 * **NEU-757 changes (1.2.0):** the `math_notation_rendering_risk` rubric line
 * now states that inline `backtick code spans` count as fenced (notation inside
 * them renders literally and must not be flagged) — only notation in unfenced
 * running prose scores low. The high-score exemplar (`mn-backtick-fenced`) was
 * retargeted to demonstrate this. Bumped so verdicts produced under the old
 * rubric remain distinguishable.
 */
export const CLASSIFIER_PROMPT_VERSION = '1.2.0';

/** A single per-field few-shot exemplar. */
export type FewShotExample = {
  label: string;
  field: VerdictFieldName;
  chunkTitle: string;
  chunkContent: string;
  expectedScore: 1 | 2 | 3 | 4 | 5;
  /** ≤240 chars, single line — matches `VerdictFieldSchema.rationale`. */
  expectedRationale: string;
  expectedApplicable: boolean;
};

/** Per-field rubric. Each entry carries the snake_cased label and the rubric line shown to the model. */
export type RubricEntry = { label: string; line: string };
export const CLASSIFIER_RUBRIC: Record<VerdictFieldName, RubricEntry> = {
  renderingClarity: {
    label: 'rendering_clarity',
    line: 'Does the chunk display cleanly in a standard Markdown client? Score 1 when fenced code is unbalanced, tables are malformed, or `<details>` is nested past 3 levels. Score 5 when every block parses without ambiguity.',
  },
  vocabularyAppropriate: {
    label: 'vocabulary_appropriate',
    line: 'Are technical terms either introduced in-chunk, linked via declared prerequisites, or part of the presumed background? Score low when the learner would need to jump elsewhere to decode undefined jargon (Wozniak Rule 4 — each chunk should be self-sufficient).',
  },
  mathNotationRenderingRisk: {
    label: 'math_notation_rendering_risk',
    line: "Will the math notation render unambiguously in prose? Notation is FENCED — and therefore safe — when it sits inside $...$/$$...$$ math fences OR inline `backtick code spans`, both of which render literally in any Markdown client. Score low ONLY when prime marks, subscripts, or superscripts appear in UNFENCED running text (e.g. A(n') typed as bare prose). Never flag notation that is wrapped in backticks or math fences. Score 5 with applicable=false when the chunk contains no math notation.",
  },
  definitionConstructive: {
    label: 'definition_constructive',
    line: 'If the chunk defines a term, does it use a constructive definition (procedure, schema, mapping) rather than a list of examples or adjacent properties? Score 5 with applicable=false when the chunk does not define any term.',
  },
  epistemicConsistency: {
    label: 'epistemic_consistency',
    line: 'Is the teaching frame internally consistent? Score low when a chunk frames itself as a concept but is actually a phantom chapter (multiple H2 sections, generic summary blocks, exercise lists) — Sweller CLT violation: forces the learner to process multiple unrelated atoms simultaneously.',
  },
  overallFit: {
    label: 'overall_fit',
    line: 'Does this belong in a spaced-repetition corpus as a single chunk? Score low for table-of-contents chunks, meta-summaries, or content that bundles multiple Merrill CDT component types (fact + concept + procedure together).',
  },
};

/**
 * Grounding block — applies to every per-field prompt. Per the GPT-5.4 guide,
 * `gpt-5.4-mini` is literal and benefits from explicit grounding rules
 * leading the prompt. Keeps the model from fabricating concerns the rubric
 * primes for (e.g. notation issues on a chunk with no notation).
 */
export const GROUNDING_BLOCK = [
  'Ground every score and rationale in the provided chunk content.',
  '- If an aspect does not apply (e.g. no math notation present), score 5 with rationale "not applicable: <one-line reason>" and applicable=false.',
  '- Do not infer issues that are not present in the chunk text.',
  '- Do not reference content outside the chunk except declared prerequisites and tags.',
].join('\n');

/**
 * Edge-case block — applies to every per-field prompt. Defines abstention
 * behavior for empty / unintelligible / stub chunks since the schema requires
 * a 1–5 score and `null` already means "model call failed".
 */
export const EDGE_CASE_BLOCK = [
  'If the chunk content is empty, whitespace-only, or in a language you cannot evaluate, return score=3 with rationale "insufficient content to grade" and applicable=true.',
  'If the chunk is a placeholder or stub, return score=3 with rationale "stub content; defer scoring" and applicable=true.',
].join('\n');

/**
 * Exactly 18 per-field exemplars: 3 per field (one high-score, one low-score,
 * one score-3 boundary). The score-3 boundary mitigates the score-distribution
 * drift risk that per-field anchoring introduces. Pedagogy citations
 * (Wozniak Rule 4, Sweller CLT, Merrill CDT) are preserved across rubric
 * lines and exemplars for traceability.
 */
export const CLASSIFIER_FEW_SHOTS: Record<VerdictFieldName, readonly FewShotExample[]> = {
  renderingClarity: [
    {
      label: 'rc-balanced-fences',
      field: 'renderingClarity',
      chunkTitle: 'Euler tour: tin/tout construction',
      chunkContent:
        'A DFS records `tin[v]` on first visit and `tout[v]` on return. Code:\n\n```python\ndef dfs(v):\n    tin[v] = timer; timer += 1\n    for u in adj[v]:\n        if u != parent[v]: dfs(u)\n    tout[v] = timer; timer += 1\n```',
      expectedScore: 5,
      expectedRationale:
        'Balanced fenced code, prose flows cleanly, no nested details — every block parses without ambiguity.',
      expectedApplicable: true,
    },
    {
      label: 'rc-unbalanced-fence',
      field: 'renderingClarity',
      chunkTitle: 'Quicksort partition step',
      chunkContent:
        'Pick a pivot, then move all smaller elements to the left:\n\n```python\ndef partition(arr, lo, hi):\n    pivot = arr[hi]\nThe partition then returns the pivot index for recursion.',
      expectedScore: 1,
      expectedRationale:
        'Opening triple-backtick code fence is never closed — downstream Markdown clients will swallow the rest of the chunk into a code block.',
      expectedApplicable: true,
    },
    {
      label: 'rc-borderline-table',
      field: 'renderingClarity',
      chunkTitle: 'Sorting algorithm complexity',
      chunkContent:
        '| Algorithm | Time |\n| --- | --- |\n| Quicksort | O(n log n) |\n| Mergesort | O(n log n)\n\nNote: worst-case quicksort is O(n²).',
      expectedScore: 3,
      expectedRationale:
        'Table is mostly well-formed but the second data row is missing its trailing pipe — strict Markdown parsers may render the cell oddly.',
      expectedApplicable: true,
    },
  ],
  vocabularyAppropriate: [
    {
      label: 'va-self-sufficient',
      field: 'vocabularyAppropriate',
      chunkTitle: 'Light-edge bound in HLD',
      chunkContent:
        "An edge (parent, child) is light when the child's subtree size is at most half the parent's. Any root-to-leaf path contains at most log2(n) light edges, since each light edge halves the subtree.",
      expectedScore: 5,
      expectedRationale:
        'Defines "light edge" inline before using it; subtree size and log2 are presumed background — chunk is self-sufficient (Wozniak Rule 4).',
      expectedApplicable: true,
    },
    {
      label: 'va-undefined-jargon',
      field: 'vocabularyAppropriate',
      chunkTitle: 'Persistent segment tree memory',
      chunkContent:
        'A persistent segtree relies on path copying. The amortized cost is O(log n) per update via fat node compression. Use it when version queries dominate.',
      expectedScore: 1,
      expectedRationale:
        '"Path copying", "fat node compression", and "version queries" appear without definition or declared prerequisite — the learner cannot decode this chunk in isolation.',
      expectedApplicable: true,
    },
    {
      label: 'va-borderline-prereq',
      field: 'vocabularyAppropriate',
      chunkTitle: 'Modular inverse via Fermat',
      chunkContent:
        "When p is prime, the modular inverse of a is a^(p-2) mod p. This is a direct corollary of Fermat's little theorem.",
      expectedScore: 3,
      expectedRationale:
        '"Modular inverse" is named clearly but "Fermat\'s little theorem" is invoked without statement and may not be in declared prerequisites — depends on tags.',
      expectedApplicable: true,
    },
  ],
  mathNotationRenderingRisk: [
    {
      label: 'mn-backtick-fenced',
      field: 'mathNotationRenderingRisk',
      chunkTitle: 'Prime-marked notation in inline code',
      chunkContent:
        "The derivative `p'(x)` and the count `A(n')` are written as inline backtick code spans, so their prime marks render literally. Display math is fenced too: $O(\\log_2 n)$.",
      expectedScore: 5,
      expectedRationale:
        'Prime marks appear only inside inline backtick code spans and $...$ math fences — nothing leaks into unfenced prose, so notation renders unambiguously.',
      expectedApplicable: true,
    },
    {
      label: 'mn-bare-prime',
      field: 'mathNotationRenderingRisk',
      chunkTitle: 'Derivative of a polynomial',
      chunkContent:
        "For a polynomial p(x), the derivative p'(x) gives the slope at each point. We then write A(n') for the count of n' that satisfy the predicate.",
      expectedScore: 1,
      expectedRationale:
        "Prime marks p'(x) and A(n') appear in unfenced prose — many Markdown clients render the apostrophe as text and may break adjacent emphasis.",
      expectedApplicable: true,
    },
    {
      label: 'mn-borderline-mixed',
      field: 'mathNotationRenderingRisk',
      chunkTitle: 'Probability of independent events',
      chunkContent:
        'For independent events A and B, $P(A \\cap B) = P(A) \\cdot P(B)$. As a corollary, P(A^c) = 1 - P(A) (the complement law).',
      expectedScore: 3,
      expectedRationale:
        'Display math is fenced cleanly but the complement notation P(A^c) appears in unfenced prose — the caret may render as text in some clients.',
      expectedApplicable: true,
    },
  ],
  definitionConstructive: [
    {
      label: 'dc-procedural',
      field: 'definitionConstructive',
      chunkTitle: 'Definition: heap',
      chunkContent:
        'A heap is built as follows: start with an empty array. To insert x, append it to the end and sift it up by repeatedly swapping with its parent while it is smaller. To extract the min, swap the root with the last element, pop, and sift the new root down.',
      expectedScore: 5,
      expectedRationale:
        'Defines "heap" by giving the construction procedure (insert + extract-min steps) — constructive route from first principles, no example list.',
      expectedApplicable: true,
    },
    {
      label: 'dc-property-list',
      field: 'definitionConstructive',
      chunkTitle: 'Definition: monad',
      chunkContent:
        'A monad is something that has a unit, has a bind operation, has a Kleisli composition, and satisfies the three monad laws. Examples include Maybe, List, and IO.',
      expectedScore: 1,
      expectedRationale:
        'Defines "monad" as a list of properties and examples without giving a constructive route — learner cannot build a monad from this definition.',
      expectedApplicable: true,
    },
    {
      label: 'dc-borderline-stub-then-procedure',
      field: 'definitionConstructive',
      chunkTitle: 'Definition: union-find',
      chunkContent:
        "A union-find is a data structure that tracks disjoint sets. It supports two operations: `find(x)` returns the representative of x's set, and `union(a, b)` merges the two sets. Path compression and union by rank give amortized near-constant time per operation.",
      expectedScore: 3,
      expectedRationale:
        'Names operations and gives complexity but defines "disjoint sets" by appeal rather than from first principles — borderline constructive.',
      expectedApplicable: true,
    },
  ],
  epistemicConsistency: [
    {
      label: 'ec-single-concept',
      field: 'epistemicConsistency',
      chunkTitle: 'Why Euler-tour ancestry fails for non-tree graphs',
      chunkContent:
        'Euler-tour ancestry depends on the invariant that each DFS edge is traversed exactly twice. In a graph with cycles a node may be reached by multiple paths; the second visit does not record a fresh tin, so the ancestor check yields false negatives.',
      expectedScore: 5,
      expectedRationale:
        'Single concept (failure mode of one technique on cyclic graphs) — frame is internally consistent, no exercise/summary scaffolding.',
      expectedApplicable: true,
    },
    {
      label: 'ec-phantom-chapter',
      field: 'epistemicConsistency',
      chunkTitle: 'RSA Foundations',
      chunkContent:
        "## Introduction\nRSA is a public-key cryptosystem.\n\n## Number Theory Prerequisites\n- Primes\n- Euler's totient\n\n## Key Generation\nSteps to generate keys.\n\n## Practice Problems\n1. Compute phi(15).",
      expectedScore: 1,
      expectedRationale:
        'Multiple H2 sections (intro, prerequisites, generation, exercises) bundled as one chunk — classic phantom chapter, violates Sweller CLT.',
      expectedApplicable: true,
    },
    {
      label: 'ec-mixed-frame',
      field: 'epistemicConsistency',
      chunkTitle: 'Heap operations',
      chunkContent:
        'A heap supports insert in O(log n) and extract-min in O(log n). Insert appends and sifts up; extract-min swaps root with last and sifts down.\n\nSummary: heaps give logarithmic priority-queue ops.',
      expectedScore: 3,
      expectedRationale:
        'Mostly one concept (heap ops) but the trailing summary line drifts toward chapter framing — borderline phantom-chapter signal.',
      expectedApplicable: true,
    },
  ],
  overallFit: [
    {
      label: 'of-single-atom',
      field: 'overallFit',
      chunkTitle: 'Heavy-light: light-edge path bound',
      chunkContent:
        "An edge (parent, child) is light when the child's subtree size is at most half the parent's. Any root-to-leaf path contains at most log2(n) light edges, because each light edge halves the subtree size.",
      expectedScore: 5,
      expectedRationale:
        'One lemma plus its one-line proof — a single Merrill CDT principle, ideal spaced-repetition atom.',
      expectedApplicable: true,
    },
    {
      label: 'of-toc-summary',
      field: 'overallFit',
      chunkTitle: 'Approximate Nearest Neighbors: IVFFlat',
      chunkContent:
        '## Overview\nIVFFlat is an ANN method.\n\n## How It Works\n- Cluster vectors with k-means\n- Query nearest clusters\n\n## Parameters\n- nlist\n- nprobe\n\n## Tradeoffs\nRecall vs speed.\n\n## Summary\nUse IVFFlat when exact search is too slow.',
      expectedScore: 1,
      expectedRationale:
        'Overview + parameters + tradeoffs + summary sections bundled as one chunk — table of contents, multiple Merrill CDT types mixed.',
      expectedApplicable: true,
    },
    {
      label: 'of-borderline-mix',
      field: 'overallFit',
      chunkTitle: 'Bloom filters basics',
      chunkContent:
        'A Bloom filter is a probabilistic set with false positives but no false negatives. Insert: hash to k positions and set them. Query: check all k positions are set. Tradeoff: tighter false-positive rate needs more bits per element.',
      expectedScore: 3,
      expectedRationale:
        'Bundles definition + insert + query + tradeoff — three small concepts that could each stand alone, borderline atom for spaced repetition.',
      expectedApplicable: true,
    },
  ],
};

function formatExemplar(ex: FewShotExample): string {
  // `JSON.stringify` so rationales containing double quotes (e.g. the
  // vocabulary_appropriate exemplars that quote `"Path copying"` /
  // `"Modular inverse"`) render as syntactically valid JSON. Under
  // `reasoning_effort: low` `gpt-5.4-mini` is literal — malformed reference
  // JSON degrades the few-shot signal exactly when this prompt is meant to
  // sharpen it.
  const expectedOutput = JSON.stringify({
    score: ex.expectedScore,
    rationale: ex.expectedRationale,
    applicable: ex.expectedApplicable,
  });
  return [
    `<EXAMPLE label="${ex.label}" expected_score="${ex.expectedScore}" expected_applicable="${ex.expectedApplicable}">`,
    `Title: ${ex.chunkTitle}`,
    '',
    ex.chunkContent,
    '',
    `Expected output: ${expectedOutput}`,
    '</EXAMPLE>',
  ].join('\n');
}

/**
 * Build the per-field `ClassifierPrompt` map. Each entry's system prompt
 * leads with the field's rubric line, then renders the grounding + edge-case
 * blocks, then that field's three exemplars, then the schema-output
 * instruction. Each user prompt names the field being scored.
 *
 * Returns one prompt per `VerdictFieldName`. The adapter selects the right
 * entry per fan-out call instead of broadcasting one shared payload.
 */
export function buildClassifierPrompt(
  rubric: Record<VerdictFieldName, RubricEntry> = CLASSIFIER_RUBRIC,
  fewShots: Record<VerdictFieldName, readonly FewShotExample[]> = CLASSIFIER_FEW_SHOTS
): PerFieldClassifierPrompts {
  const result = {} as PerFieldClassifierPrompts;
  for (const field of VERDICT_FIELDS) {
    const entry = rubric[field];
    const examples = fewShots[field];
    const exemplarBody = examples.map(formatExemplar).join('\n\n');
    const systemPrompt = [
      `You are a rubric-anchored grader scoring chunk content for the "${entry.label}" aspect only.`,
      '',
      `Aspect: ${entry.label}`,
      entry.line,
      '',
      '--- GROUNDING ---',
      GROUNDING_BLOCK,
      '',
      '--- EDGE CASES ---',
      EDGE_CASE_BLOCK,
      '',
      '--- EXEMPLARS ---',
      exemplarBody,
      '',
      `Return a JSON object with { score, rationale, applicable } for ${entry.label}. score is an integer in [1, 5]. rationale is a single sentence under 240 chars with no newlines. applicable is false only when you used the "not applicable" escape.`,
    ].join('\n');
    const userPrompt = `Score the chunk below for ${entry.label}. Return only the { score, rationale, applicable } object for this aspect.`;
    result[field] = { systemPrompt, userPrompt };
  }
  return result;
}

/** Camel → snake conversion for verdict field names, with a compile-time exhaustive map. */
export const PERSISTED_TIER2_FIELD_NAMES = {
  renderingClarity: 'rendering_clarity',
  vocabularyAppropriate: 'vocabulary_appropriate',
  mathNotationRenderingRisk: 'math_notation_rendering_risk',
  definitionConstructive: 'definition_constructive',
  epistemicConsistency: 'epistemic_consistency',
  overallFit: 'overall_fit',
} as const satisfies Record<VerdictFieldName, string>;

/**
 * NEU-672: snake-case verdict field name as a literal union. Used by the
 * Tier 2 blocking-stats port and circuit-breaker so `field` is type-narrowed
 * end-to-end (no `string` widening, no defensive runtime guards).
 */
export type PersistedTier2FieldName = (typeof PERSISTED_TIER2_FIELD_NAMES)[VerdictFieldName];

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
 * shape persisted under `validator_report.tier2`. Preserves per-field nulls
 * and the `applicable` flag introduced in 1.1.0.
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
 * Upper bound on the combined system + user prompt length for **each** per-field
 * prompt. ~4 KB input tokens maps to roughly 16 000 UTF-8 chars for English
 * text. Each per-field prompt only carries its field's three exemplars, so
 * the budget applies per field, not across the whole map. Enforced by the
 * `buildClassifierPrompt respects the char budget` unit test.
 */
export const CLASSIFIER_PROMPT_CHAR_BUDGET = 16_000;

// Keep `VERDICT_FIELDS` re-exported here too — consumers that only want the
// prompt module should not also need to import the domain types module just
// to iterate field names.
export { VERDICT_FIELDS };
