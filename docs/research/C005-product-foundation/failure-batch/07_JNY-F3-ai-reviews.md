# JNY-F3 / BM-5 — Independent AI-Review Records (`AIR-*`)

**Task:** NEU-905 · **Journey:** JNY-F3 → BM-5 (over-validation evidence bound from NEU-903) · **Protocol:** `../benchmark-suite/04_ai-review-independence-protocol.md`.
Class-4 `[ai-critique]` evidence — the review layer NEU-905 adds **on top of** NEU-903's class-5 grading runs. Records are **append-only**; a committed `AIR-verdict` is never edited. Reviews are **input to** adjudication (NEU-906), **never** a settled finding; RA5 applies (AI judgment is not the signal of record — and this includes the reviewers).

**Reviewed package:** the JNY-F3 over-validation evidence bound in `06_JNY-F3-binding.md` (source of record: NEU-903 `../autoeval-batch/03_per-case-results.md`, executed at develop `2aaa7d5`), as re-presented in the JNY-F3 journey-record layer, committed at `e123f9a`.

---

## Independence conditions (this journey)

Both reviewers received the **identical** context package: the journey id + H-F3 hypothesis ("over-validates a deliberately **shallow or wrong** DP answer → false confidence, FM4 + X4"), cell BM-5, the vehicle + fidelity boundary (class-5 automated-eval, minimal grading-harness, one grader model/version, bounds-not-reliability), and the **raw archetype × verdict breakdown as neutral facts** — including the explicit neutral note that H-F3 targets "shallow or wrong" whereas in the data the SHALLOW/WRONG archetypes were correctly failed and the milder INCOMPLETE archetype was the one over-validated — plus the closed verdict set {`supports`,`contradicts`,`insufficient-evidence`}. Each reviewer was **separately initialized in a fresh, isolated foreground subagent context** (distinct model families spawned as independent NEU-905 foreground `Agent` calls, no shared state) and committed its initial verdict **without** seeing the operator's conclusion (none set — `06_…` `OBS-creator-conclusion` = `—`), the other reviewer's verdict, or any orchestrator adjudication of whether the archetype mismatch satisfies H-F3.

### `AIR-JNY-F3/R1`

| Field | Value |
| --- | --- |
| **`AIR-review-id`** | `JNY-F3/R1` |
| **`AIR-reviewer-identity`** | Independent AI reviewer R1, initialized by the NEU-905 agent as operator; fresh isolated foreground subagent; no tools used. |
| **`AIR-provider`** | Anthropic. |
| **`AIR-model-version`** | Dispatched as the `opus` model; **self-reported** "Claude Opus 4.8, model ID `claude-opus-4-8[1m]`". |
| **`AIR-prompt`** | Verbatim: the fixed context package above (journey/cell/FM-X, H-F3 hypothesis, vehicle + fidelity boundary, the SHALLOW→FAIL / WRONG→FAIL / INCOMPLETE→PASS(over-validated) / CONTROL→PASS breakdown across 3 isolated runs, and the neutral wording-mismatch note) + the closed verdict set + required output {VERDICT / RATIONALE / FIDELITY-CAVEAT / MODEL-IDENTITY}. Instructed to reason only from the material, use no tools, and not assume agreement. |
| **`AIR-context-exposure`** | The raw per-archetype verdicts across 3 runs and the oracle table, as neutral facts. **Did NOT see:** operator conclusion/interpretation, R2's verdict pre-commit, or any framing of whether the mismatch "counts". |
| **`AIR-run-date`** | 2026-07-12. |
| **`AIR-conditions`** | Fresh context; default sampling; no tool access; single-turn verdict. |
| **`AIR-verdict`** | **`contradicts`.** Rationale (verbatim): "H-F3 specifically asserts that SHALLOW or WRONG DP answers are over-validated into false confidence, but the evidence shows both the SHALLOW (quality 1) and WRONG (quality 0-1) archetypes were correctly graded FAIL against the NOT-pass oracle in all 3 isolated runs. The over-validation that did occur (stable PASS at quality 3) fell entirely on the INCOMPLETE archetype — correct core recurrence with omitted rigor — which is not the target class named in the hypothesis, and the CONTROL correct answers passed as expected. So while an FM4-style over-validation phenomenon is real in this harness, it is inconsistent with the precise mechanism H-F3 claims, since the answer classes the hypothesis predicts would be over-validated were in fact correctly failed." |
| **`AIR-post-commit-note`** | (labeled, post-commit) Caveat (verbatim): "Class-5 automated eval bound to a single grader model/version and only 12 authored synthetic items (3 patterns x 4 archetypes); it bounds the probed items but establishes no DP-grading reliability rate, and the contradiction rests on reading H-F3's 'shallow or wrong' wording strictly rather than as a loose stand-in for 'any deficient answer.'" |

### `AIR-JNY-F3/R2`

| Field | Value |
| --- | --- |
| **`AIR-review-id`** | `JNY-F3/R2` |
| **`AIR-reviewer-identity`** | Independent AI reviewer R2, initialized by the NEU-905 agent as operator; fresh isolated foreground subagent; a **different model family** from R1. |
| **`AIR-provider`** | Anthropic. |
| **`AIR-model-version`** | Dispatched as the `sonnet` model; **self-reported** "Claude Sonnet 5 (`claude-sonnet-5`, per system context; no further build/version id available to me)". |
| **`AIR-prompt`** | Verbatim: **identical** context package and closed verdict set as `R1` (byte-for-byte; only the reviewer model differs). |
| **`AIR-context-exposure`** | Identical to `R1`. **Did NOT see:** operator conclusion/interpretation, R1's verdict pre-commit, or any "does the mismatch count" framing. |
| **`AIR-run-date`** | 2026-07-12 (run in parallel with R1; neither exposed to the other pre-commit). |
| **`AIR-conditions`** | Fresh context; default sampling; no tool access; single-turn verdict. |
| **`AIR-verdict`** | **`contradicts`.** Rationale (verbatim): "H-F3 specifically claims the grader over-validates SHALLOW or WRONG DP answers, but the data show SHALLOW (quality 1) and WRONG (quality 0-1) answers were correctly graded FAIL in all 3 independent runs each — the oracle-alignment for exactly the archetypes H-F3 names is stable and correct, not over-validating. The over-validation that does occur (FM4-consistent) lands on the INCOMPLETE archetype, which the evidence note explicitly distinguishes from 'shallow or wrong' (correct core recurrence, omitted rigor) — a materially milder failure mode than what H-F3 describes. Since the named cells (SHALLOW/WRONG) directly and stably falsify the hypothesized behavior, and the observed over-validation occurs on an un-hypothesized archetype, the evidence is inconsistent with H-F3 as stated." |
| **`AIR-post-commit-note`** | (labeled, post-commit) Caveat (verbatim): "Evidence is class-5 automated-eval bound to one grader model/version, using only 3 authored synthetic DP patterns per archetype — it bounds these specific probed items and cannot establish a general DP-grading reliability/error rate; a different grader version or broader answer sampling could shift where over-validation lands, including potentially onto true SHALLOW/WRONG answers not covered here." |

**Independence-record audit (`04_…` §5 checklist):** ✅ ≥2 reviewers, separately initialized in fresh contexts (distinct model families); ✅ each initial verdict committed in isolation (no operator conclusion existed to leak; no cross-reviewer exposure pre-commit); ✅ identical context package; ✅ every reproduction condition recorded.

## Raw agreement/disagreement (JNY-F3) — NO adjudication

| Reviewer | Model (self-report) | Verdict |
| --- | --- | --- |
| R1 | Claude Opus 4.8 `[1m]` | `contradicts` |
| R2 | Claude Sonnet 5 | `contradicts` |

**Raw result:** **unanimous `contradicts`** (both reviewers, distinct models) — therefore **not `conflicted`**. This is a **substantive raw signal for NEU-906**, recorded without adjudication: **H-F3 as literally worded ("shallow or wrong") is contradicted** by the bound evidence — the SHALLOW and WRONG archetypes were **correctly failed** in all 3 isolated runs. **Both reviewers independently and explicitly preserved the load-bearing nuance:** an FM4-style over-validation phenomenon **is real** in this harness, but it lands on the **INCOMPLETE** archetype (correct core, omitted rigor), an *un-hypothesized* answer class — a materially milder failure than H-F3 describes. Both also flagged that the verdict turns on reading "shallow or wrong" **strictly** vs. as a loose stand-in for "any deficient answer." This disagreement-with-the-hypothesis (not between reviewers) is carried raw and routed to NEU-906.

**Settled-result discipline (`04_…` §4).** BM-5 maps to marker **`INC-3`** (DP-domain AI-grading reliability, owned by OUT-7/NEU-902, adjudicated by NEU-906). Therefore, **regardless of the unanimous `contradicts` on H-F3-as-worded**, the **settled result is `UNRESOLVED`** — the reviews characterize the *shape* (over-validation present on the INCOMPLETE archetype under one grader/version; shallow/wrong correctly failed) but **cannot** settle BM-5/FM4/R3, establish an over-validation *rate*, or invent any reliability bound. R3 (High) non-downgradable (`OC-7`). Whether the raw evidence and this `contradicts`-of-H-F3 revise the hypothesis wording, split BM-5 by archetype, or feed a reformulated FM4 statement is **NEU-906's** exclusive authority via `LINK-4`. NEU-905 records raw only.
