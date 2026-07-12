# Glossary Coverage Pass — NEU-912

**Charter:** NEU-910 / C006. **Depends on:** NEU-911 (seed + row shape).

This record makes the completeness claim of `docs/GLOSSARY.md` **falsifiable**. It fixes the
exact source set that was swept, the rationale for what was in vs. out of the sweep, and the
whole-set pass showing that every predicate-satisfying term appearing in that source set has a
resolving row — or is listed here as a deliberate exclusion with a one-line rationale.

The inclusion predicate, row shape, and authority discipline are **owned by NEU-911** and are
not restated here; this pass only _applies_ them. See `docs/GLOSSARY.md` → "Inclusion predicate".

## Method — multi-agent fan-out (one PR, one session)

A single coordinating session dispatched five per-category worker agents (synchronous), each
reading one slice of the enumerated source set and emitting candidate rows in the NEU-911 shape
with a per-candidate exclusion list. The coordinator then applied the inclusion predicate,
deduped across workers (heavy overlap on `session mode`, `quality`, `content_quality`,
`chunk_type`, `reason code`, `gap`), verified defining files/symbols, and assembled the rows
into the two seeded sections plus five new same-shape sections. This whole-set pass is the gate
that closes any gap a per-category worker left.

Result: **15 seeded rows (NEU-911) + 52 rows added by this sweep = 67 resolving rows.**

## Enumerated source set (the charter-fixed categories)

Categories are fixed by the C006 charter. This sub-task owns the **exact file list** within them.
Enumeration captured from the repo tree on branch `neu-912-glossary-full-coverage-sweep`
(cut from `origin/develop`).

### 1. MCP tool schemas — `src/domain/types/*-tools.ts` (6 files)

`content-tools.ts`, `notes-tools.ts`, `persistence-tools.ts`, `search-tools.ts`,
`session-management-tools.ts`, `spaced-repetition-tools.ts`.

Rationale: snake_case Zod tool-input schemas are the agent-facing surface; their enum fields
(`knowledge_type`, `chunk_type`, `dependency_graph_type`, `note_type`, session `mode`, search
`mode`, `quality`) are prime misresolution candidates.

### 2. Hand-written domain types — `src/domain/types/*.ts` (non-`*-tools`, 12 files)

`analytics.ts`, `api-response.ts`, `classifier.ts`, `entities.ts`, `prompts.ts` (swept under
category 4), `recommendations.ts`, `remediation.ts`, `service-result.ts`, `session.ts`, `sr.ts`,
`teaching.ts`, `validator-report.ts`.

Rationale: the richest source of coined types (`KnowledgeType`, `DependencyGraphType`,
`QuestionType`, `Pacing`, `ReasonCode`, `ContentStatus`, `content_quality`, `findings`,
`ValidatorReportSchema`, `RankedItem.cognitiveLoad`).

### 3. Orchestration workflows — `src/orchestration/*.ts` (14 files)

`analytics-workflows.ts`, `audit-pipeline.ts`, `chunk-workflows.ts`, `learner-context-workflows.ts`,
`notes-workflows.ts`, `query-workflows.ts`, `recommendation-workflows.ts`, `remediation-workflows.ts`,
`review-workflows.ts`, `search-workflows.ts`, `session-workflows.ts`, `teaching-workflows.ts`,
`tier2-circuit-breaker.ts`, `topic-workflows.ts`.

Rationale: named mechanisms live here (`Tier 2 circuit-breaker`, `blocking fields`, `soft-warn`,
`retry pivot`, `revise grade`, `stale-prerequisite reteach`, `learner context`, `gap notes`).
Pure CRUD delegators (`query-workflows.ts`, `notes-workflows.ts`, `analytics-workflows.ts`) coin
no terms — analytics computation is domain-owned.

### 4. Prompts — `src/shared/**` and `src/domain/types/prompts.ts`

Term-bearing: `prompts.ts`, `prompts/prompt-pack.ts`, `prompts/classifier-prompts.ts`,
`constants/prompts.ts`, `domain-rules.ts`, `linter/rule-intent.ts`, `linter/section-thresholds.ts`,
`instructions.ts`, `constants/validation.ts`, `content-similarity.ts`, `chunk-mapping.ts`.
Skimmed and confirmed to hold no coined domain terms (pure cross-cutting utilities):
`case-convert.ts`, `date-helpers.ts`, `env-parsing.ts`, `errors.ts`, `logger.ts`, `math.ts`,
`redact-params.ts`, `version.ts`, `constants/time.ts`.

Rationale: prompt/authoring rules and the linter-validation vocabulary
(`prompt-pack`, `drill`, `quality cap`, `probe-first scaffolding`, `just-in-time content fill`,
`domain rules`, `minimum information principle`, `structural dependency`, `phantom chapter`,
`epistemic consistency`, `rule intent`, `blocking-eligible`, `OOD validation harness`,
`significant content change`) live here.

### 5. Specs — `docs/specs/` and `docs/wf-plans/**/00_spec.md`

**EMPTY — 0 members.** `docs/specs/` contains no tracked or on-disk files. No `docs/wf-plans/**`
folder contains a `00_spec.md` (the only populated plan folder, `C001__phase-0-hardening-trivial-wins/`,
holds `00_intake.md` / `01_charter.md` / `02_subtasks.md` / `03_review-log.md`). Nothing to sweep;
recorded here so the empty category is not mistaken for an omission (accepted warning **F4.1**:
`docs/specs/` is gitignored, so even if populated, spec-derived rows would be non-durable/local-only).

### 6. Domain-defining research docs (bounded per charter)

In scope (introduce/define domain or system terms):
`docs/research/C005-product-foundation/00_vocabulary.md`,
`product-model/00_learner-and-prerequisite-model.md`,
`product-model/01_principles-differentiators-exclusions.md`,
`product-model/02_materiality-rule-and-candidate-inventory.md`.
Skimmed and found process-only (defines the evidence-class taxonomy, i.e. research method, not
domain terms): `01_evidence-taxonomy.md`.

Excluded per charter bound (pure process / method / batch-run / traceability): everything under
`adjudication/`, `autoeval-batch/`, `automated-evaluation/`, `baseline-batch/`, `failure-batch/`,
`benchmark-suite/`, `measurement-contracts/`, `traceability/`, `questions/`, plus
`00_method-and-provenance.md`, `00_gates-report.md`, `00_dry-run-handoff.md`,
`00_hypothesis-reformulations.md`, `03_synthesis.md`, `04_caps-and-incomplete-scope.md`, and the
top-level `docs/research/*.md` run/audit docs.

**Durability note (correction to a prior assumption):** contrary to charter Assumption 1 as read
by the NEU-911 shipper, `docs/research/C005-product-foundation/00_vocabulary.md` and the
`product-model/*` docs **are tracked on `origin/develop`** (verified via `git ls-files`), so the
four C005-sourced rows are durable. The tree is still matched by the `/docs/research/` gitignore
rule for _new_ files. Per NEU-912 scope the C005 **id-family cross-refs** (`F*`/`J*`/`P*`/`DEC*`/`EX*`)
still ship **[pending: C005 not on develop]** and are not re-activated in this release (out of scope);
the NEU-911 header text was left unchanged.

### Defining files cited outside the swept categories

Several rows cite a defining file in `src/domain/algorithms/` (`classify-chunk.ts`,
`quality-cap.ts`, `compute-pacing.ts`, `resolve-stale-prerequisites.ts`) or `src/server/topic-tools.ts`.
These directories were **not** swept as first-class categories (not in the charter set); the citations
follow the NEU-911 "defining file = single most authoritative file" rule — the term _surfaced_ in a
swept category (orchestration/prompts/types) and its authority simply lives there. This is not a
category expansion.

## Coverage result — added rows by section

All rows below were added by this sweep (defining file + symbol spot-checked). Section names match
`docs/GLOSSARY.md`.

- **Content authoring & structure (14):** `knowledge_type`, `chunk_type`, `dependency_graph_type`,
  `prerequisites`, `orderIndex`, `structural dependency`, `condensed_summary`, `topic_summary`,
  `subject`, `difficulty`, `content_status`, `note`, `minimum information principle`, `domain rules`.
- **Scheduling & review (7):** `quality`, `quality cap`, `priority score`, `cognitive load`,
  `learning item`, `retrievability`, `search mode`.
- **Teaching-flow (15):** `session mode`, `question type`, `teaching approach`, `pacing`,
  `retry pivot`, `drill`, `revise grade`, `rolling session`, `probe-first scaffolding`,
  `just-in-time content fill`, `stale-prerequisite reteach`, `historical feedback`, `gap`,
  `prompt-pack`, `learner context`.
- **Content-audit & quality machinery (12):** `Tier 2 circuit-breaker`, `blocking fields`,
  `soft-warn`, `validator report`, `content_quality`, `findings`, `blocking-eligible`,
  `rule intent`, `OOD validation harness`, `phantom chapter`, `epistemic consistency`,
  `significant content change`.
- **Research-model / C005 (4):** `schema`, `transfer`, `durable mastery`, `prerequisite boundary`.

## Predicate-satisfying terms covered without a standalone row

These satisfy the predicate but are **already resolved** inside an existing row (seeded or added),
so they are "present" for coverage purposes rather than missing:

- `note_type` (insight/confusion/connection/deeper_exploration/gap) — enumerated in `note`.
- `assessment mode` semantics (single attempt, SR fan-out) — enumerated in `session mode`.
- `ReasonCode` (WEAK_AFTER_ASSESSMENT/LEECH_THRESHOLD/PREREQ_LOW_EASE/NEW_MATERIAL) — enumerated in
  the seeded `remediation` row.
- `ReviseGradeReason` — enumerated in `revise grade`.
- `gap note` / `writeGapNotes` — resolved by `gap` + `note`.
- `agentQuality` (raw agent self-grade vs. capped `quality`) — resolved within `quality`.
- The five remaining `classifier` verdict aspects — `renderingClarity`, `vocabularyAppropriate`,
  `mathNotationRenderingRisk`, `definitionConstructive`, `overallFit` — enumerated in the seeded
  `classifier` row (six-aspect verdict); `epistemicConsistency` was promoted to its own row because
  it is also a `tier1b` linter concept.
- `teaching approach` values (`recall`/`cued_recall`/`reteach`/`scaffold`) — in `teaching approach`.
- `storageStrengthEstimate` / `reteachCompression` / `daysOverdue` — enumerated in `retrievability`.
- `progress reset` (SR reset on significant edit) — resolved within `significant content change`.
- `DrillFormat` values and the two-attempt policy — enumerated in `drill`.

## Deliberate exclusions (predicate NOT satisfied)

Each considered token that was rejected, with a one-line rationale:

- `RecommendationType` (continue_learning/overdue_review/new_material): self-descriptive
  recommendation labels; the underlying concepts resolve via `spaced-repetition` / `chunk_type`.
- `learning_style` (visual/auditory/kinesthetic/reading): standard generic pedagogy taxonomy,
  not project-coined.
- `estimated_duration`, `timebox` / `timeboxMinutes`: generic time-budget parameters.
- `late submission`, `re-queued failure` / `fresh pending`: implementation flags / `teach_next`
  ordering details; behavior is self-evident and covered by `session` + `session mode`.
- `SrScheduleDelta` / `chunksDemoted` ("demote"), `WeakChunk`, `PrerequisiteChunk`, `ReviewEntry`,
  `ChunkAttempt`: compositional DTOs whose meaning follows from their words; the coined part is
  `ReasonCode` (already covered).
- `urgencyScore` / `urgencyReason`: scored fields, obvious from name (cross-ref `priority score`).
- `DailyKpis`, `WindowSpec`, `AnalyticsOutput`, `breakdowns`, `streak_days`: generic analytics
  aggregation shapes (`streakDays` is surfaced within `learner context`).
- `ServiceResult` / `serviceOk` / `serviceFail`, `ApiResponse` / `ApiError` / `retryable`: generic
  Result/Either and MCP-envelope plumbing; only their coined facets (`content_quality`, `findings`)
  earn rows.
- `matchScore` / `similarityScore` / `highlightTerms` / `normalizedQuery` / `tokens`: search-result
  output internals.
- `NoteTargetType` / `NoteAuthor`: enum plumbing subordinate to `note`.
- Framework/library symbols (Zod, Drizzle, LangChain, MCP SDK), `UnitOfWorkPort`, optimistic-lock /
  TOCTOU guards, `mapChunkRowToLearningItem`, Levenshtein helpers, `redactParams`, `MS_PER_DAY`:
  generic programming / infra helpers (NEU-911 predicate explicitly excludes these).
- `materiality rule`, evidence classes, completeness lattice (SETTLED/PROVISIONAL/INCOMPLETE),
  and C005 id-families (`F*`/`MC-*`/`BM-*`/`RQ*`/`JNY-*`/`DEC*`): research-process machinery or
  linked id-families — **linked, not absorbed** per charter.
- `worked example`, `subgoal`, `expertise reversal`, `retention`, `dynamic programming`: standard
  learning-science / CS terms used as-is, not project-redefined.

## Known naming collision (noted, not a row)

`SessionChunk` names two different shapes: `src/domain/types/entities.ts` (a persisted DB row) vs.
`src/domain/types/session.ts` (an in-flight per-chunk progress DTO). Flagged for maintainers; neither
is a coined domain term, so neither earns a row.

## Spot-checks (row ⇄ defining file)

Verified that the named file exists at the given repo-relative path and defines/uses the term:

- `knowledge_type` → `src/domain/types/entities.ts:5` `export type KnowledgeType = 'fact' | 'concept' | 'procedure' | 'principle'`. ✓
- `dependency_graph_type` → `src/domain/types/entities.ts:6` `export type DependencyGraphType = 'linear_chain' | 'convergent' | 'divergent' | 'single_root'`. ✓
- `chunk_type` → `src/domain/types/recommendations.ts:5` `export type ChunkType = 'new' | 'review' | 'remediation'`. ✓
- `content_status` → `src/domain/types/recommendations.ts:9` `export type ContentStatus = 'draft' | 'final'`. ✓
- `teaching approach` / `retrievability` → `src/domain/algorithms/classify-chunk.ts` `TeachingApproach`, `classifyChunk`, `mapTier` (thresholds 0.7 / 0.5 / 0.3). ✓
- `quality cap` → `src/domain/algorithms/quality-cap.ts` `computeQualityCap` (min-prior 0–1 → 3, =2 → 4). ✓
- `rule intent` → `src/shared/linter/rule-intent.ts` `RULE_INTENT`, `validateRuleIntentParity`. ✓
- `significant content change` → `src/shared/content-similarity.ts` `hasSignificantContentChange`. ✓
- `Tier 2 circuit-breaker` → `src/orchestration/tier2-circuit-breaker.ts` `createTier2CircuitBreaker`. ✓
- `validator report` → `src/domain/types/validator-report.ts` `mergeReportSections`. ✓
- `schema` (C005) → `docs/research/C005-product-foundation/product-model/00_learner-and-prerequisite-model.md` (tracked). ✓

## Falsifiability statement

The completeness claim is: **over the enumerated source set above, every predicate-satisfying term
has a resolving row (seeded counted as present) or appears in the "deliberate exclusions" list with
a rationale — zero unaccounted terms.** To falsify, name a token in one of the six enumerated
categories that (a) satisfies the NEU-911 inclusion predicate and (b) has neither a row nor an
exclusion entry here.
