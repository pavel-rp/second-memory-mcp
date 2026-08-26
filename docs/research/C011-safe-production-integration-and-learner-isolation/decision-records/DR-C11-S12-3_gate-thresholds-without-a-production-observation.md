# `DR-C11-S12-3` — What "measurable" may mean for a gate set with no production observation

**Sub-task:** SUB-12 (NEU-1005) · **Covers:** OUT-17 · **Written:** 2026-08-26
**Model:** claude-opus-5[1m] · **Codebase cutoff:** `origin/develop` @ `57aeba3`
**Carried in:** `../12_threat-model-and-the-gates-that-authorize-implementation.md` §8

---

## Decision

**A gate threshold in this package is admissible under exactly three provenances, and a fourth label
is available and used zero times.**

| Label | Means | Admissible because |
| --- | --- | --- |
| **`D` — derived** | Computed from a cited non-production source: a repository constant at a stated cutoff, an upstream `OBJ-*` or `SIG-*`, or arithmetic over them, with the derivation shown | The inputs are re-readable and the arithmetic is reproducible |
| **`S` — stand-in** | A registered assumption in `../95_stand-in-assumption-register.md` carrying a named owner and a re-validation trigger | The charter requires exactly this rather than an assumed value |
| **`K` — deferred spike** | An entry in `../96_spike-register.md` with a question, a method and a mandatory expiry, recorded `not executed` | The uncertainty is owned and dated rather than resolved by invention |
| **`observed-in-production`** | A measurement of the running deployment | **Not available. Used zero times.** No production credential exists |

**A gate whose threshold fits none of the three is not written as a gate with an unsettable number.
It is recorded as a blocking finding with an owner**, per OUT-17's own rule that *"a gap without a
measurable control is recorded as a blocking finding rather than accepted"*.

## Rationale

OUT-17 requires *"a measurable control with a named owner and a threshold that gates implementation
authorization"*. In an environment with zero production observations, that requirement can be
discharged in three ways and faked in one.

**The way it is faked is a number with no provenance.** SUB-15 met the same problem and answered it
by publishing a band of 2–200 learners rather than a midpoint, stating that *"a single number here
would be the exact failure mode charter assumption 49 and this sub-task's brief forbid"*
(`../15_operational-objectives-for-the-real-platform.md:161`–`:163`). SUB-9 met it by pairing an
argument with a falsifier and a deferred spike. This record generalises both into a labelling rule
that applies to every row of the gate register, so a reader can tell at a glance which kind of claim
each threshold is.

**Why the fourth label is named even though it is empty.** SUB-15 states the reason better than a
paraphrase would: the emptiness *"is the honest headline of the whole chapter, and it is stated here
rather than left to be inferred from the absence of the word"*
(`../15_operational-objectives-for-the-real-platform.md:67`–`:69`). A register whose provenance
column simply never contains `observed-in-production` is indistinguishable from one whose author
never considered the distinction.

## The shape most thresholds take, and why

**Most count-based thresholds in the register are zero-tolerance rather than rates**, and that is a
derived consequence rather than a stylistic choice.

`OBJ-10` bounds audit-log loss per circuit-open window, and `F-S16-2` establishes that the bound is a
**lower bound** on total loss — a second loss path drops up to five pre-open batches before the
breaker opens at all (`../16_attribution-and-detection.md:366`–`:376`). So **every count read from
`infrastructure.mcp_request_log` is a lower bound on the true count, not the count.**

A dropped entry can therefore **hide** a gate breach but cannot **manufacture** one. Under a
zero-tolerance threshold that degrades to a false negative and never a false positive; under a *rate*
threshold, a systematically under-counted numerator quietly moves the rate toward compliance. SUB-16
reaches the same conclusion for its signals (`../16_attribution-and-detection.md:135`–`:139`) and
carries the residual as `R-S16-3`, which is **cited here and not re-raised**.

**A confinement failure is also not a load phenomenon.** One admitted ungated call on a gated tool is
the whole failure, and there is no volume at which it becomes acceptable.

## Alternatives rejected

**A1 — Set numeric thresholds from plausible industry defaults.** Rejected as the invention the
charter's § Constraints forbids. A threshold with no source is worse than an absent one, because it
gates authorization on a number nobody can check.

**A2 — Defer every threshold until production evidence exists.** Rejected: it would empty the gate
register entirely, since no credential exists and none is promised. OUT-17 would be discharged with
zero gates, which is the outcome the outcome exists to prevent.

**A3 — Use a single label, "unverified", across the register.** Rejected: it collapses three
materially different epistemic positions. A count derived from a repository constant, an assumption
with an owner and a re-validation trigger, and an unexecuted spike with an expiry are different
promises to a reader, and flattening them removes exactly the information the reader needs to weight
each gate.

**A4 — Report gates as pass/fail against the current deployment.** Rejected: it would require the
production observation that does not exist, and a "fail" asserted without one is as unfounded as a
"pass". The register states what would be measured and by whom, and asserts no verdict about the
running system.

## Consequences

1. **Every row of the gate register carries a provenance label**, and the totals are reported: at
   this cutoff, fifteen `D`, three `S`, four `K`, and **zero** production observations.
2. **Four spikes are registered by this sub-task** (`SPK-S12-2` … `SPK-S12-6` minus those shared with
   other rows), each with a question, a method and an expiry, each recorded `not executed`. Each
   first fails the *"could this have been read from the repository instead?"* test, which is why the
   register's many readable constants became `D` rows rather than spikes.
3. **Two gaps produce blocking findings rather than gates** (`F-S12-5`, `F-S12-6`), because no
   admissible provenance could produce a threshold for either.
4. **A `Transport` column is required on the register.** §6.1 of the chapter establishes that under
   STDIO the database log transports are structurally unreachable, so a count-based threshold there
   is not zero — it is **undefined**. Recording it as zero would be the single most misleading number
   the register could publish, and SUB-16 makes the same refusal for `SIG-S16-2`
   (`../16_attribution-and-detection.md:192`–`:196`).

## Revision trigger

- A production credential becomes available, at which point every `K` row acquires a method that can
  actually run and the fourth label becomes usable.
- Any spike registered by this sub-task passes its expiry without executing.
- `F-S16-2`'s lower-bound position is revised, which would change the argument for zero-tolerance
  thresholds.
- OUT-17's rule is re-read at package assembly and found to require something these three provenances
  do not supply.
