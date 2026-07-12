# Domain Glossary

A single, greppable lookup for the project-local vocabulary of Second Memory MCP.
Grep a term, land on one row, and reach its defining file in **one hop** — without a
second search and without reverting to a pretrained or generic-programming meaning.

Scope note: this file **seeds** the charter-named core terms (NEU-911). Full domain
coverage is a later sweep (NEU-912); a write-time maintenance hook (NEU-913) and a
PR-time audit backstop (NEU-914) build on the shape and inclusion bar defined here.

## How to read a row

Each row resolves a term in one hop:

`Term` — **one-line definition** | **owning module** | **defining file** (repo-relative
path) | **cross-refs** (sibling glossary terms and/or owning ledgers).

- **Owning module** is the hexagonal layer that owns the concept: `transport`, `server`,
  `orchestration`, `domain`, `ports`, `adapters`, `infrastructure`, or `shared`
  (see `CLAUDE.md` → File Organization).
- **Defining file** is the single most authoritative file that defines or centrally uses
  the term. It is where you go to read the real thing; the row only summarizes it.
- **Cross-refs** point at related terms in this file (in `backticks`) and, where a term's
  authority lives elsewhere, at that owning file/ledger.

## Authority discipline

**The glossary re-states; it never re-decides.** A row is a signpost, not a source of
truth.

- The **single source of truth** for any term is its defining file. If a definition here
  and the code disagree, the code wins and the row is stale — fix the row.
- **Mutable statuses and decisions stay in their owning ledgers** (the code, config,
  migrations, Linear issues, research registers) and are **cross-linked, never
  duplicated**. This file records _what a term means_, not _what its current value or
  status is_. Example: `tier` names the audit stages; the blocking thresholds that decide
  outcomes live in `src/domain/config/classifier.ts` and are cited, not copied.
- **Research id-families** from the C005 product-foundation register (`F*` / `MC-*` /
  `BM-*` / `RQ*`) are **linked, not copied in**. The C005 vocabulary exemplar this file is
  modeled on lives at `docs/research/C005-product-foundation/00_vocabulary.md`, which is
  **worktree-only and not yet on `develop`** (charter Assumption 1, [unconfirmed]); C005
  id-family cross-refs are therefore marked **[pending: C005 not on develop]** until that
  file lands. `docs/research/` and `docs/specs/` are gitignored in this repo, so any
  cross-ref into them is **non-durable / local-only** and is marked as such.

## Inclusion predicate — what earns a row

A token earns a row when it names a concept in the project's **domain or system model**
whose meaning is either:

1. **Project-specific / coined** — a term the project invented or gave a bespoke meaning
   (e.g. `chunk`, `leech`, `roadblock`, `context token`, `classifier`, `tier`,
   `remediation`); **or**
2. **Familiar-but-redefined** — an everyday or generic-programming word the project
   narrows or redefines such that an agent could **misresolve it from pretrained or
   generic defaults** (e.g. `port` / `adapter` in the hexagonal sense, `session`,
   `mastery`, `audit pipeline`).

**Excluded** — _not_ every exported symbol earns a row: generic programming identifiers,
framework/library symbols (Zod, Drizzle, LangChain, MCP SDK names), and
implementation-only helpers do **not** get rows. The read path and the maintaining
hook/audit apply this one shared "what counts as a domain term" bar.

---

## Learning & product terms

| Term                | Definition (project-local meaning)                                                                                                                                                                                                                                               | Owning module   | Defining file                                                                                   | Cross-refs                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `chunk`             | The atomic unit of learning content — one teachable idea carrying its own spaced-repetition state (`easeFactor`, `repetitions`, `consecutiveFailures`, `nextReviewAt`) and a 1-based `orderIndex` within its topic. **Not** a generic text/byte "chunk".                         | `domain`        | `src/domain/types/entities.ts` (`LearningChunk`)                                                | `topic`, `session`, `ease-factor`, `leech`; port `src/ports/chunk-repository.ts`                          |
| `topic`             | A named grouping of ordered `chunk`s on one subject, carrying a dependency-graph shape (`dependencyGraphType`) and an optional versioned summary.                                                                                                                                | `domain`        | `src/domain/types/entities.ts` (`LearningTopic`)                                                | `chunk`; port `src/ports/topic-repository.ts`                                                             |
| `session`           | A bounded learning/review run over a set of `chunk`s in one of five **modes** (`scaffolding` / `learning` / `retrieval` / `review` / `assessment`), tracking per-chunk attempts and questions. **Not** an HTTP/auth session.                                                     | `domain`        | `src/domain/types/session.ts` (`SessionMode`)                                                   | `chunk`, `roadblock`, `mastery`; entity `LearningSession` in `src/domain/types/entities.ts`               |
| `spaced-repetition` | The SM-2-derived scheduling scheme that sets each `chunk`'s next review date from recall quality; `intervalDays` is always read from the calculator's output, never hardcoded.                                                                                                   | `domain`        | `src/domain/algorithms/sr-calculator.ts` (`calculateNextReview`, `calculateNextReviewAdvanced`) | `ease-factor`, `leech`; I/O types `src/domain/types/sr.ts`                                                |
| `ease-factor`       | The per-`chunk` SM-2 multiplier that stretches or compresses the next review interval as recall quality rises or falls; floored at the configured `minimumEaseFactor`.                                                                                                           | `domain`        | `src/domain/algorithms/sr-calculator.ts`                                                        | `spaced-repetition`, `leech`; tunables `src/domain/config/algorithm.ts` (`clampEaseFactor`)               |
| `mastery`           | A **derived** progression state, not a stored flag: the server decides when a `chunk` is mastered by gating chunk completion on its mapped questions passing (a `repetitions`-derived `masteryLevel`). Authority: computed at runtime; never persisted as a standalone decision. | `orchestration` | `src/orchestration/teaching-workflows.ts`                                                       | `session`, `roadblock`; prompt context in `src/shared/prompts/prompt-pack.ts`                             |
| `leech`             | A `chunk` repeatedly failed — flagged by `calculateNextReviewAdvanced` when lifetime `totalAttempts >= leechFailureThreshold` **and** `consecutiveFailures >= leechConsecutiveFailures`; incurs an extra ease penalty and routes to `remediation`. **Not** a resource leak.      | `domain`        | `src/domain/algorithms/sr-calculator.ts` (`leech` flag)                                         | `ease-factor`, `remediation`; `LEECH_CHUNK_TYPE = 'remediation'` in `src/domain/types/recommendations.ts` |
| `roadblock`         | A gate that requires N follow-up questions (per the trigger answer's quality) before a learner may progress past a `chunk`, so a low-scored answer cannot be skipped. **Not** a build/CI blocker.                                                                                | `domain`        | `src/domain/algorithms/roadblock-gate.ts` (`computeRoadblockState`, `getRequiredFollowups`)     | `session`, `mastery`; response type `RoadblockDetail` in `src/domain/types/teaching.ts`                   |
| `remediation`       | A recommended recovery plan built after a `session` for weak/`leech` chunks, tagging each with a `ReasonCode` (`WEAK_AFTER_ASSESSMENT` / `LEECH_THRESHOLD` / `PREREQ_LOW_EASE` / `NEW_MATERIAL`).                                                                                | `domain`        | `src/domain/types/remediation.ts` (`RemediationPlan`, `WeakChunk`, `ReasonCode`)                | `leech`, `session`; workflow `recommendRemediation` in `src/orchestration/remediation-workflows.ts`       |

## System & machinery terms

| Term             | Definition (project-local meaning)                                                                                                                                                                                               | Owning module   | Defining file                                                                   | Cross-refs                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `tier`           | A **stage of the content-audit pipeline**, not a subscription/pricing tier: Tier 1 is the deterministic linter (`tier1a` structural-blocking vs `tier1b` heuristic-warning rules), Tier 2 is the post-commit LLM `classifier`.   | `domain`        | `src/domain/services/chunk-linter.ts` (`LinterRuleTier = 'tier1a' \| 'tier1b'`) | `audit pipeline`, `classifier`; Tier 2 threshold in `src/domain/config/classifier.ts` (`BLOCKING_THRESHOLD`)                          |
| `classifier`     | The Tier 2 LLM content-quality judge returning a six-aspect verdict (`renderingClarity`, `vocabularyAppropriate`, `mathNotationRenderingRisk`, `definitionConstructive`, `epistemicConsistency`, `overallFit`), each scored 1–5. | `domain`        | `src/domain/types/classifier.ts` (`VerdictSchema`, `ChunkClassifierVerdict`)    | `tier`, `audit pipeline`; port `src/ports/content-classifier-port.ts`, adapter `src/adapters/langchain/content-classifier-adapter.ts` |
| `port`           | Hexagonal sense: an **interface** the domain/orchestration depends on, decoupling use-cases from I/O. **Not** a network port. Each port has a concrete `adapter`.                                                                | `ports`         | `src/ports/` (e.g. `src/ports/chunk-repository.ts`)                             | `adapter`; wiring in `src/composition-root.ts`                                                                                        |
| `adapter`        | Hexagonal sense: the **concrete implementation** of a `port` — a Postgres/Drizzle repository (`src/adapters/drizzle/`) or an external-service client (e.g. LangChain). Swapped in at composition time.                           | `adapters`      | `src/adapters/drizzle/` (e.g. `src/adapters/drizzle/chunk-repository.ts`)       | `port`; wiring in `src/composition-root.ts`                                                                                           |
| `audit pipeline` | The shared content-audit flow run on chunk create/update: Tier 1 linter suite then Tier 2 `classifier` (post-commit), guarded by a Tier 2 circuit breaker.                                                                       | `orchestration` | `src/orchestration/audit-pipeline.ts`                                           | `tier`, `classifier`; breaker `src/orchestration/tier2-circuit-breaker.ts`                                                            |
| `context token`  | An opaque, TTL-bounded token issued by `init_agent_context` that every stateful tool call must present; created/validated/deleted through the repository and enforced at the transport boundary. **Not** an LLM "token".         | `ports`         | `src/ports/context-token-repository.ts` (`ContextTokenRepository`)              | `session`; enforced in `src/transport/context-token-middleware.ts`, payload built in `src/orchestration/learner-context-workflows.ts` |
