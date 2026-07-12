# Hypothesis Reformulations (routed from adjudication)

**Task:** NEU-907 · **Compiled:** 2026-07-12
**Scope:** records reformulated hypotheses **routed** here by NEU-906 for later chapters. This file **creates no evidence, flips no status, and re-adjudicates nothing.** It versions a new provisional hypothesis against a contradicted original and hands it forward. The mutable-status authority remains the LINK-4 ledger (`adjudication/`); nothing here overrides it.

**Why this exists.** NEU-906 adjudicated H-F3 as **contradicted (as literally worded)** while recording that the MC-4 v1.0 BOUNDING rule fired correctly and found a *real* over-validation on a valid adversarial archetype. It explicitly declined to rewrite the hypothesis (out of NEU-906 scope) and **routed the reformulation to NEU-907**:

> "NEU-906 **records** that H-F3 should be reformulated/split to name the INCOMPLETE archetype and **routes** it to NEU-907; it does **not** rewrite the hypothesis (out of scope)." — `adjudication/03_decision-status-register.md` §1

This file discharges that routed item.

---

## H-F3 — the contradicted original (v1.0, for reference; not changed here)

- **Owner / defining file:** NEU-900 `benchmark-suite/01_journey-vehicles-and-fidelity.md`; protocol `automated-evaluation/02_automatable-evaluation-definitions.md` (AEP-1).
- **Literal wording (quoted):** *"AI grading over-validates a shallow/wrong DP answer → false confidence."* AEP-1 operative clause: *"the server-derived grading over-validates a deliberately **shallow or wrong** DP answer, producing false confidence (FM4, X4)."*
- **Adjudicated status:** **contradicted (as literally worded)** — `adjudication/03_…` §1. Two isolated AI reviewers (Opus + Sonnet) were unanimous `contradicts`: the SHALLOW cases (`ACS-1-01/-05/-09`) and WRONG cases (`ACS-1-02/-06/-10`) were **correctly failed** by the grader, so "shallow/wrong over-validated" is not matched.
- **Evidence:** `autoeval-batch/03_per-case-results.md`, `04_repeat-comparison-and-integrity.md` (12/12 reproducible across RUN-1/2/3); `failure-batch/06_JNY-F3-binding.md`, `07_JNY-F3-ai-reviews.md`.
- **This reformulation does not rescore, reopen, or overturn that `contradicted` status.** H-F3-as-worded stays contradicted.

---

## H-F3.1 — reformulated provisional hypothesis (new; for later chapters)

- **Version:** v1.1, **supersedes-by-pointer** the contradicted H-F3 v1.0 (append-only; the original is retained above, not overwritten).
- **Status:** **provisional (present-bounded on the INCOMPLETE archetype).** This is a hypothesis carried forward for later measurement, **not** an adjudicated result and **not** a rate, reliability, prevalence, or effect-size claim.

**Reformulated statement:**

> AI grading over-validation is **bounded to the INCOMPLETE archetype** — DP answers with a **correct core idea but missing rigor** (absent base case, complexity argument, or correctness argument) are over-validated (graded pass, `quality ≥ 3`), **while shallow and wrong answers are correctly failed.** The product-critical false-confidence risk (FM4) therefore lands specifically on *correct-core-but-omitted-rigor* answers, not on shallow or wrong ones.

**Basis (recorded evidence, not re-adjudicated):** under the frozen **MC-4 v1.0 BOUNDING** rule, the three INCOMPLETE cases `ACS-1-03`, `ACS-1-07`, `ACS-1-11` (oracle NOT-pass) were graded `quality 3` PASS, **stable 3/3 across the isolated repeats** RUN-1/2/3, with the over-validation flag set `{ACS-1-03, ACS-1-07, ACS-1-11}` identical every run (`autoeval-batch/04_…`; `adjudication/01_…` §5, `03_…` §2.2).

**Bindings (inherited, unchanged):**

| Binds to | Relationship |
| --- | --- |
| FM4 (false confidence from AI grading) | the failure mode this hypothesis sharpens; stays **unresolved (present-bounded)**, INC-3, non-downgradable |
| BM-5 (over-validated wrong/shallow answer) | the benchmark cell; stays **unresolved (present-bounded on INCOMPLETE archetype)**, INC-3 |
| R3 (AI grading unreliable → false confidence) | **reinforced** (High, non-downgradable); no downgrade, no rate inferred |
| RA5 (trust AI grading as the signal of record) | **reaffirmed** as rejected |
| MC-4 v1.0 (BOUNDING) | the frozen contract; **not invalidated, no rerun or new version required by this task** |
| ACS-1-03 / -07 / -11 | the INCOMPLETE cases evidencing the bound |
| INC-3 (DP-domain AI-grading reliability bound) | **still owed** — owner NEU-902 (OUT-7); no reliability rate/threshold is asserted (G5.1/G5.2) |

**What H-F3.1 is NOT:**
- Not a claim that over-validation occurs at any *rate* or with any *reliability* — bounded to the specific probed items under grader model/version `claude-opus-4-8` only.
- Not an external-user, expert, or market claim (class-7 absent).
- Not a status change to any element — FM4/BM-5/R3 remain exactly as the LINK-4 ledger records them.

**Handoff.** A later automated-evaluation / reliability chapter (owner NEU-902, OUT-7; discharging INC-3) should carry H-F3.1 as the sharpened, testable form: does over-validation on the *correct-core-omitted-rigor* archetype persist across graders, model versions, and DP patterns, and at what bound/rate? Until then it stays provisional and present-bounded.
