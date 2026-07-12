# JNY-F2 / BM-3 + BM-4 — Independent AI-Review Records (`AIR-*`)

**Task:** NEU-905 · **Journey:** JNY-F2 → BM-3 + BM-4 (revised vehicle v1.1) · **Protocol:** `../benchmark-suite/04_ai-review-independence-protocol.md`.
Class-4 `[ai-critique]` evidence. Records are **append-only**; a committed `AIR-verdict` is never edited. Reviews are **input to** adjudication (NEU-906), **never** a settled finding; RA5 applies.

**Reviewed package:** the class-3 `OBS-JNY-F2#RETRO` and class-6 `OPLOG-JNY-F2` records in `04_JNY-F2-runs.md`, committed at `e123f9a`.

---

## Independence conditions (this journey)

Both reviewers received the **identical** context package: the journey id + H-F2 hypothesis (a conjunction: BM-4 decay/relapse **and** BM-3 hierarchical-scheduling uncertainty), the cells and FM/X (FM1/FM3/X1), the vehicle + fidelity boundary (class-3 retrospective n=1, not pre-registered, pooled across chunks, no per-pattern decay curve, BM-3 optimum not computable), the **raw aggregates and verbatim testimony as neutral facts**, and the closed verdict set {`supports`,`contradicts`,`insufficient-evidence`}. Each reviewer was **separately initialized in a fresh, isolated foreground subagent context** (distinct model families spawned as independent NEU-905 foreground `Agent` calls, no shared state) and committed its initial verdict **without** seeing the operator's conclusion (none — `04_…` Record 1), the other reviewer's verdict, any raw operational-log payload, any orchestrator interpretation, or any validation framing.

### `AIR-JNY-F2/R1`

| Field | Value |
| --- | --- |
| **`AIR-review-id`** | `JNY-F2/R1` |
| **`AIR-reviewer-identity`** | Independent AI reviewer R1, initialized by the NEU-905 agent as operator; fresh isolated foreground subagent; no tools used. |
| **`AIR-provider`** | Anthropic. |
| **`AIR-model-version`** | Dispatched as the `opus` model; **self-reported** "Claude Opus 4.8, model id `claude-opus-4-8[1m]`". |
| **`AIR-prompt`** | Verbatim: the fixed context package above (journey/cells/FM-X, H-F2 conjunction hypothesis, vehicle + fidelity boundary, the raw monthly-activity/review-debt/interval-ladder aggregates + verbatim testimony + the explicit fact that no optimal hierarchical schedule is derivable) + the closed verdict set + required output {VERDICT / RATIONALE / FIDELITY-CAVEAT / MODEL-IDENTITY}. Instructed to reason only from the material, use no tools, and not assume agreement. |
| **`AIR-context-exposure`** | The raw monthly session-mode activity (incl. the Dec-2025/Jan-2026 zero gap), the 266/271 overdue-debt aggregate, the repetition/interval ladder, n=1/DSA facts, and verbatim testimony — all neutral. **Did NOT see:** operator conclusion/interpretation, R2's verdict pre-commit, raw log payloads, or validation framing. |
| **`AIR-run-date`** | 2026-07-12. |
| **`AIR-conditions`** | Fresh context; default sampling; no tool access; single-turn verdict. |
| **`AIR-verdict`** | **`insufficient-evidence`.** Rationale (verbatim): "The hypothesis is a conjunction requiring (a) evidence of per-pattern decay-and-relearning after a gap and (b) evidence that hierarchical multi-month scheduling is uncertain, but the substituted class-3 retrospective (n=1, not pre-registered, pooled across chunks) measures neither directly. A real multi-month gap and 98% overdue debt are visible, yet the data is not a per-pattern decay curve and shows near-zero consecutive failures (avg 0.03, max 1), so relapse/re-learning (FM1) is unmeasured rather than demonstrated. BM-3 is effectively unexecutable here because, as stated, no optimal hierarchical schedule is derivable from any aggregate — so the uncertainty conjunct cannot be tested at this fidelity." |
| **`AIR-post-commit-note`** | (labeled, post-commit) Caveat (verbatim): "Load-bearing limits: n=1 retrospective dogfooding, not pre-registered, no per-pattern decay curve and no effect size (pooled chunks confound the FM1 claim); the BM-3 optimal-schedule cell is not computable from the aggregate; and creator declined the simulated-week protocol, so the intended decay-timeline vehicle was never run at spec fidelity." |

### `AIR-JNY-F2/R2`

| Field | Value |
| --- | --- |
| **`AIR-review-id`** | `JNY-F2/R2` |
| **`AIR-reviewer-identity`** | Independent AI reviewer R2, initialized by the NEU-905 agent as operator; fresh isolated foreground subagent; a **different model family** from R1. |
| **`AIR-provider`** | Anthropic. |
| **`AIR-model-version`** | Dispatched as the `sonnet` model; **self-reported** "Claude Sonnet 5 (`claude-sonnet-5`, per system context; no more specific build id known to me)". |
| **`AIR-prompt`** | Verbatim: **identical** context package and closed verdict set as `R1` (byte-for-byte; only the reviewer model differs). |
| **`AIR-context-exposure`** | Identical to `R1`. **Did NOT see:** operator conclusion/interpretation, R1's verdict pre-commit, raw log payloads, or validation framing. |
| **`AIR-run-date`** | 2026-07-12 (run in parallel with R1; neither exposed to the other pre-commit). |
| **`AIR-conditions`** | Fresh context; default sampling; no tool access; single-turn verdict. |
| **`AIR-verdict`** | **`insufficient-evidence`.** Rationale (verbatim): "H-F2 is a conjunction of two claims, and the material explicitly states the BM-3 half (an optimal hierarchical, multi-month dependency schedule) 'is not computable from any aggregate' — so that cell is unexecutable by the evidence presented, regardless of fidelity. For BM-4, the data is pooled across chunks with no per-pattern decay curve or effect size, n=1, retrospective, not pre-registered, so it cannot isolate whether a DP pattern specifically decayed and required re-learning versus simply going unreviewed; the very low consecutive-failure rate (0.03, max 1) is compatible with either 'mastery held' or 'the 98% overdue backlog hasn't been re-tested yet,' which cuts against rather than for a relapse/re-learning reading. Testimony ('learnt dozens of dsa problems') is informal and non-diagnostic of decay or scheduling correctness." |
| **`AIR-post-commit-note`** | (labeled, post-commit) Caveat (verbatim): "Originally-specified vehicle (constructed decay timeline / WoZ) was replaced by a lower-fidelity class-3 retrospective aggregate; n=1, pooled not per-pattern, no effect size, not pre-registered, and the BM-3 optimal-schedule question is stated as not derivable from any such aggregate — meaning the evidence class structurally cannot execute half the hypothesis." |

**Independence-record audit (`04_…` §5 checklist):** ✅ ≥2 reviewers, separately initialized in fresh contexts (distinct model families); ✅ each initial verdict committed in isolation; ✅ identical context package; ✅ every reproduction condition recorded.

## Raw agreement/disagreement (JNY-F2) — NO adjudication

| Reviewer | Model (self-report) | Verdict |
| --- | --- | --- |
| R1 | Claude Opus 4.8 `[1m]` | `insufficient-evidence` |
| R2 | Claude Sonnet 5 | `insufficient-evidence` |

**Raw result:** **unanimous `insufficient-evidence`** (both reviewers, distinct models) — therefore **not `conflicted`**. Per `04_…` §4, "**both/all reviewers returned `insufficient-evidence`**" ⇒ the journey is carried **`incomplete`**, **never counted toward coverage**. Both reviewers independently made the **same two observations**: (a) BM-3's optimal hierarchical schedule is structurally not derivable from any aggregate (the cell is unexecutable at this vehicle), and (b) BM-4's decay/relapse cannot be isolated from "backlog not yet re-tested" at pooled n=1 with near-zero observed consecutive failures — the caveats are preserved, not smoothed. **Notably, R2 observed the low consecutive-failure rate *cuts against* a naive relapse reading** — a substantive nuance recorded raw, not averaged away.

**Settled-result discipline (`04_…` §4).** BM-4 maps to marker **`INC-1`** (decay effect size, adjudicated NEU-906); BM-3 is **cap-bound INCOMPLETE** (G1.2, `COLLECTION-GAP`). The settled result is **UNRESOLVED / INCOMPLETE**; R7 and R1 (High) untouched, non-downgradable (`OC-7`). No threshold or interval rule invented (SUB-4/`INC-2` authority). Adjudication is NEU-906's via `LINK-4`.
