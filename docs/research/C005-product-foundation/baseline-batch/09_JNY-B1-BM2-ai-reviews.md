# JNY-B1 / BM-2 — Independent AI-Review Records (`AIR-*`)

**Task:** NEU-904 · **Journey:** JNY-B1 → BM-2 (revised vehicle v1.1) · **Protocol:** `../benchmark-suite/04_ai-review-independence-protocol.md`.
Class-4 `[ai-critique]` evidence. Records are **append-only**; a committed `AIR-verdict` is never edited. Reviews are **input to** adjudication (NEU-906), **never** a settled finding; RA5 applies (AI judgment is not the signal of record).

**Reviewed package:** the class-3 `OBS-JNY-B1#RETRO-BM2` and class-6 `OPLOG-JNY-B1#BM2` records in `07_JNY-B1-BM2-retrospective-evidence.md`, committed at `ecd6ef0`.

---

## Independence conditions (this journey)

Both reviewers received the **identical** context package: the journey id + BM-2 hypothesis (H-B1, BM-2 half), the cell + FM/X, the vehicle + fidelity boundary (class-3 retrospective n=1, not pre-registered, ladder pooled-across-chunks; class-6 observed-behavior-only, later window), the **raw aggregates and verbatim testimony as evidence**, and the closed verdict set {`supports`,`contradicts`,`insufficient-evidence`}. Each reviewer was **separately initialized in a fresh, isolated subagent context** (distinct model families spawned as independent NEU-904 foreground subagent calls, no shared conversation/memory/state) and committed its initial verdict **without** seeing the operator's conclusion (none — no sealed creator conclusion exists; `07_…` Record 1), the other reviewer's verdict, any raw operational-log payload, any orchestrator *interpretation* of the aggregates, or any instruction to treat the evidence as user/market validation.

### `AIR-JNY-B1-BM2/R1`

| Field | Value |
| --- | --- |
| **`AIR-review-id`** | `JNY-B1-BM2/R1` |
| **`AIR-reviewer-identity`** | Independent AI reviewer R1, initialized by the NEU-904 agent as operator; fresh isolated foreground subagent; no tools used (verdict-only). |
| **`AIR-provider`** | Anthropic. |
| **`AIR-model-version`** | Dispatched as the `opus` model; **self-reported** "Anthropic Claude, Opus 4.8 (1M-token context variant); model id `claude-opus-4-8[1m]`". |
| **`AIR-prompt`** | Verbatim: the fixed context package above (journey/cell/FM-X, H-B1 BM-2-half hypothesis, vehicle + fidelity boundary, the raw aggregates + SM-2 mechanics note + verbatim testimony) + the closed verdict set + required output {VERDICT / RATIONALE / FIDELITY-CAVEAT / MODEL-IDENTITY}. Instructed to reason only from the material, use no tools, and not assume agreement with the other reviewer. |
| **`AIR-context-exposure`** | The raw Q1/Q2a-c/Q3a/Q4a-b aggregates, the SM-2 "repetition advances only on a passed re-review" mechanics note, and the verbatim testimony — all as neutral facts. **Did NOT see:** any operator conclusion/interpretation, reviewer R2's verdict (pre-commit), raw operational-log payloads, or validation framing. |
| **`AIR-run-date`** | 2026-07-12. |
| **`AIR-conditions`** | Fresh context (no prior state); default sampling (not operator-exposed); no tool access used; single-turn verdict. |
| **`AIR-verdict`** | **`supports`.** Rationale (grounded only in exposed context): the learner is in-audience (Algorithms/DSA; testimony); under SM-2 a repetition count advances only on a passed re-review and resets on failure, so the ladder's growing intervals evidence held retention — 42 chunks reached repetition 2 and 11 reached repetition 3 (at/beyond the "≥2 spaced re-reviews" bar) with lengthening intervals (1.0→5.8→45.1 days) and stable-to-rising ease; high pass rate (259/320) and non-zero review/retrieval modes are consistent with practice+spacing sustaining recall. |
| **`AIR-post-commit-note`** | (labeled, post-commit) Reviewer's own fidelity caveat: because the ladder is **pooled across chunks** (not a single tracked pattern's own trajectory) and the data is retrospective, non-pre-registered, n=1, it cannot establish a causal/generalizable effect, isolate spacing from retrieval, or prove any specific pattern survived its own re-reviews — consistency at dogfooding fidelity only, no population/prevalence/market claim. |

### `AIR-JNY-B1-BM2/R2`

| Field | Value |
| --- | --- |
| **`AIR-review-id`** | `JNY-B1-BM2/R2` |
| **`AIR-reviewer-identity`** | Independent AI reviewer R2, initialized by the NEU-904 agent as operator; fresh isolated foreground subagent; a **different model family** from R1 (so verdict differences are attributable to reviewer/model). |
| **`AIR-provider`** | Anthropic. |
| **`AIR-model-version`** | Dispatched as the `sonnet` model; **self-reported** "Anthropic Claude, model `claude-sonnet-5` (self-reported as 'Sonnet 5'); exact build id not accessible at runtime". |
| **`AIR-prompt`** | Verbatim: **identical** context package and closed verdict set as `R1` (byte-for-byte the same package; only the reviewer model differs). |
| **`AIR-context-exposure`** | Identical to `R1`. **Did NOT see:** any operator conclusion/interpretation, R1's verdict pre-commit, raw log payloads, or validation framing. |
| **`AIR-run-date`** | 2026-07-12 (run in parallel with R1; neither exposed to the other pre-commit). |
| **`AIR-conditions`** | Fresh context; default sampling; no tool access used; single-turn verdict. |
| **`AIR-verdict`** | **`supports`.** Rationale: under the stated SM-2 mechanics the ladder's cross-sectional counts (61 of 118 repeated chunks at repetition ≥2, 18 at ≥3) directly instantiate the core claim — patterns surviving ≥2 spaced re-reviews — for a substantial share of the corpus; ease does not degrade across levels (2.58→3.40) and overall pass rate is high (259/320, 81%), consistent with retention holding; the 5603-request operational log corroborates sustained low-error use over 101 days; informal testimony affirms accumulated DSA learning. Coherent, on-topic evidence that plausibly instantiates the hypothesis at low fidelity. |
| **`AIR-post-commit-note`** | (labeled, post-commit) Caveat: n=1, retrospective, non-pre-registered; cannot rule out confounds (selective re-attempts, non-DP-specific content, ladder survivorship), cannot show a single tracked pattern's full end-to-end trajectory, and warrants no generalization to other learners or specifically DP patterns. |

**Independence-record audit (`04_…` §5 checklist):** ✅ ≥2 reviewers, separately initialized in fresh contexts (distinct model families); ✅ each initial verdict committed in isolation (no operator conclusion existed to leak; no cross-reviewer exposure pre-commit); ✅ identical context package; ✅ every reproduction condition recorded (identity, provider, model self-report, verbatim-scope prompt, context exposure, run date, conditions).

## Raw agreement/disagreement (BM-2) — NO adjudication

| Reviewer | Model (self-report) | Verdict |
| --- | --- | --- |
| R1 | Claude Opus 4.8 `[1m]` | `supports` |
| R2 | Claude Sonnet 5 | `supports` |

**Raw result:** **unanimous `supports`** (both reviewers, distinct models) — therefore **not `conflicted`**. Recorded raw; NEU-904 **does not** promote it to coverage or to a BM-cell status. **Both reviewers independently flagged the same load-bearing limitation** (pooled-across-chunks, retrospective, n=1) — the caveat is preserved, not smoothed.

**Settled-result discipline (`04_…` §4).** BM-2 maps to marker **`INC-1`** (DP-domain retention/transfer benchmark evidence, owned by the NEU-900 suite, adjudicated by NEU-906). Therefore, even with unanimous `supports`, the **settled result is `UNRESOLVED`** — the reviews characterize the *shape* ("retrospective aggregates are consistent with spaced re-review-and-pass at scale") but **cannot** settle BM-2, establish an effect size, or invent any threshold (SUB-4/`INC-2` authority; `OC-5`). Adjudication is NEU-906's via `LINK-4`.
