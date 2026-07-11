# RQ4 — Learner-state signals actually collectible from the existing Second Memory codebase

**Declared:** 2026-07-11 (see `../02_research-questions.md`) · **Search cutoff:** repo state at `origin/develop` commit `e96a6c4` (2026-07-11)
**Status:** Answered within caps (5 candidates reviewed, 3 included).

## Search record

| Field | Value |
| --- | --- |
| Interface | Repository source tree via Read/Grep (Claude Code tools); no external search. |
| Exact queries | Grep `averageQuality` in `src/orchestration/learner-context-workflows.ts`; Grep `time_spent_ms\|timeSpentMs` and `sessionQuestionAttempts\|session_question_attempts` in `src/infrastructure/`; Read `src/shared/logger.ts`, `src/infrastructure/db/schema.ts` (lines 190–228), `src/orchestration/learner-context-workflows.ts`. |
| Selection method | Candidate *code surfaces* (files/modules) treated as sources; selected for direct declaration of learner-state signals over transitive references. |
| Privacy gate | **No operational-log payloads were read.** All evidence is from source code declarations. See method §5. |

## Candidate ledger (5 reviewed / cap 5)

| # | Candidate code surface | Decision | Rationale |
| - | --- | --- | --- |
| C1 | `src/infrastructure/db/schema.ts` (attempt/session tables) | **INCLUDED** (S1) | The authoritative declaration of what is persisted per learner interaction. |
| C2 | `src/orchestration/learner-context-workflows.ts` | **INCLUDED** (S2) | The learner-context surface consumed by agents; declares computed vs. uncomputed signals. |
| C3 | `src/shared/logger.ts` | **INCLUDED** (S3) | Declares the redaction boundary that governs all future log-derived evidence. |
| C4 | `src/transport/audit-middleware.ts` + pg transports | EXCLUDED | Confirms log *existence* only; adds no learner-signal declaration beyond S3's boundary; 3-inclusion cap. |
| C5 | `docs/research/results/03-pedagogy-evidence-audit.md` §Q13 (measurement-gap analysis) | EXCLUDED | Valuable corroboration but derivative of S1/S2 code facts; cap forces primary code surfaces. |

## Included sources & findings

All claims below: **[code-evidence]** — they state what the code declares at commit `e96a6c4`; they do not establish that any signal is pedagogically valid or that learners behave as assumed.

- **F4.1** Per-attempt learner data **is** persisted: `session_question_attempts` stores `attempt_number` (1 or 2), `response` (free text), `passed`, `feedback`, `quality` (nullable 0–5), `agent_quality` (nullable 0–5), `question_type` (`recall` | `explain_apply` | `analyze_create`), `time_spent_ms`, `created_at`. `src/infrastructure/db/schema.ts` lines 197–228. *(S1)*
- **F4.2** A learner-context surface already aggregates: totals, due/overdue counts, overdue topics, recent subjects, weak areas, streak days, leech count, active session. `src/orchestration/learner-context-workflows.ts` lines 16–34. *(S2)*
- **F4.3** At least one exposed metric is declared but **not computed**: `averageQuality: 0, // TODO: not yet computed — quality lives in sessionQuestionAttempts, not sessionChunks` (`src/orchestration/learner-context-workflows.ts` line 170). A field's presence in an API shape is not evidence of its availability — metric feasibility must be checked per signal. *(S2)*
- **F4.4** The logging redaction boundary censors only credential/secret fields; learner `response` text is intentionally left unredacted in logs ("Learner `response` text is intentionally NOT redacted — it is useful diagnostic data", `src/shared/logger.ts` lines 24–56). Therefore any future operational-log evidence is payload-bearing by default and must pass the OUT-4 privacy gate; this package used none. *(S3)*
- **F4.5** Nullable-for-historical-data columns (`quality`, `agent_quality`, `question_type` — S1, lines 208–210) mean longitudinal analyses over old data will have missing fields; any proxy metric built on them must declare its valid time range. *(S1)*

## Conflicts

- None between code surfaces. A tension exists with *desired* product metrics (e.g., true retention rate, calibration): the raw ingredients exist per F4.1, but no aggregation computes them today (F4.3 pattern) — collectible-in-principle ≠ collected.

## Unresolved gaps

- **G4.1** Whether `time_spent_ms` values are reliably populated by real clients (vs. defaulted) cannot be established without operational-log evidence, which is out of scope here. [requires privacy-gated class-6 evidence later]
- **G4.2** Signal coverage for a *DP-specific* learner model (e.g., per-pattern mastery: knapsack vs. interval DP) does not exist in the schema; would require content-model tagging — a later-chapter design question, recorded as a gap, not a requirement.
