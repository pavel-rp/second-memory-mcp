# `90` — Outcome register

**Charter:** C011 (umbrella NEU-893) · **Opened:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]

Append-only. **Each producing sub-task records its own `OUT-n` row — the outcome, its resolving
evidence, and the success measure by which that outcome was judged done — inside this register, in
the shape SUB-14 aggregates.** A success measure is authored content, not a derivation, so it has a
named author upstream of assembly. SUB-14 (NEU-1007) aggregates the rows and checks the set for
completeness and **authors none of them**; a row or a measure that does not arrive is a routed gap
against its named author, never content invented at assembly.

These per-row success measures **are** the package's success metrics (charter assumption 47). There
is no separate deliverable and no separate author.

Twenty rows are expected in the assembled package: OUT-1 … OUT-19 from their producing sub-tasks,
plus the reserved **OUT-20 row slot** SUB-17 fills at position 16.

No sub-task reflows, renumbers, or rewrites another sub-task's row. On a merge conflict in this file,
keep **both** sides.

## Entry shape

```
## OUT-<n> — <title>

**Outcome.** <statement>
**Success measure.** <the measurable clause by which this outcome was judged done>
**Verified by.** <the evidence that discharges it>
**Authored by.** SUB-<n> (NEU-<id>)
```

---

### SUB-1

## OUT-18 — Production evidence obtained read-only, registered, bounded and redacted

**Outcome.** Every claim about production that cannot be settled from the repository is closed by
read-only observation or explicitly carried as an owned open item — never assumed. Access is
read-only and non-mutating with respect to the production database, the running MCP server and the
deployment, with exactly one registered exception: obtaining a token from the production Rauthy IdP.
Captured evidence is redacted of token material before publication, and each spike is a first-class
register entry carrying its question, why the repository could not answer it, its method, date,
result, confidence and an expiry after which the conclusion is stale.

**Success measure.** OUT-18 is judged done when **all four** of the following hold, each reported as
a number rather than an assertion:

1. **Total resolution, with both counts reported.** Every uncertain-and-material production claim
   resolves either to a spike-register entry carrying all of question, justification, method, date,
   result, confidence and expiry, or to an open item with a stable id and a named owner — and the
   two counts are reported and **sum to the total**, so no claim is silently absent.
2. **Three shapes, three distinct methods.** All three principal shapes are represented, each by a
   named acquisition method distinct from the other two, or by an owned open item stating what could
   not be obtained and why. **Zero shapes are represented by a capture taken from a different flow.**
3. **Zero mutations.** The access audit reports zero mutating operations against the production
   database, the running MCP server and the deployment, and enumerates the single registered
   exception with its residue stated. Any mutation outside that exception is reported as a blocking
   finding with a named owner in `91_findings-register.md`.
4. **Zero leaked captures.** The redaction audit reports zero published captures containing token
   material, a signature, or any secret value.

**Verified by.** `96_spike-register.md` (nine entries, every field populated);
`93_open-items-and-provisional-register.md` (nine owned open items);
`01_production-evidence-and-the-access-audit.md` §2 (the per-principal-shape acquisition table), §3
(the access audit), §4 (the counts), §5 (the redaction audit) and §6 (the per-capture terms record);
`95_stand-in-assumption-register.md` (`A-33`, `A-34`);
`92_risk-register.md` (`R8`, `R13`, `R14`).

**Measured result at revision 1.** (1) Nine claims, **0 closed by observation + 9 routed as owned
open items = 9**, sum matches. (2) Three shapes, three distinct designed methods, **0 substitutions**.
(3) **Zero** mutating operations — in fact zero production operations of any kind, since the single
registered exception was registered and **not exercised**; **zero** unregistered mutations, therefore
zero blocking findings on that trigger. (4) **Zero** published captures, therefore zero containing
token material — satisfied vacuously, and stated as vacuous rather than as a clean audit of a
non-empty set.

**The measure is met, and the evidence base it produced is empty of live observation.** Those are
both true, and OUT-18 is the outcome that requires them to be reported together: the discipline held,
and it produced routing rather than closure. The consequence for the package is carried as `F-S1-2`
in `91_findings-register.md` and as `R13` in `92_risk-register.md`, not smoothed over here.

**Authored by.** SUB-1 (NEU-993).

---

### SUB-3

## OUT-9 — Every category of learner data the system holds, inventoried once and classified

**Outcome.** Every state category carrying learner data appears exactly once in a published
inventory, each with its data class, personal-data status, lawful basis, purpose, minimization
position and derivation — cross-checked bidirectionally against C010's 45-category state inventory so
that nothing is invented and nothing is dropped. The two port-less log tables are classified
conditionally with the condition stated, the copies this package's own activity creates are
inventoried on their derivation, and the consent category OUT-10 creates is recorded as a seam rather
than pre-empted.

**Success measure.** OUT-9 is judged done when **all six** of the following hold, each reported as a
number or an explicit disposition rather than an assertion:

1. **Enumeration re-derived, not inherited.** The enumeration reports **ten** `public` tables with
   `context_tokens` as the **tenth**, **two** Drizzle-defined `infrastructure` tables in the same
   file, **two** raw-SQL log tables, and the process-local in-memory set — with `context_tokens`
   appearing **exactly once** and never as an eleventh item.
2. **Exactly once, no duplicates and no omissions.** Every table, column group and in-memory
   structure appears exactly once, and the completeness method's **stated falsifier** is published
   and applied rather than the completeness being asserted.
3. **Both directions reported.** The cross-check against C010's 45 categories reports unmatched
   counts in **both** directions, with **every** unmatched entry explained rather than dropped, and
   the two arithmetic identities stated.
4. **The log tables carry both readings.** Each of the two port-less log tables carries the
   unattributed *and* the attributed classification, the condition that selects between them, and an
   explicit pointer to **SUB-16**, and is recorded as **complete** rather than awaiting revision.
5. **The package's own copies are inventoried on derivation.** The sixth copy class appears once,
   carrying the owner, retention bound and destruction condition **SUB-1 recorded**, as a class with
   **zero known members and terms that exist anyway**; the aggregate result set appears once as counts
   and probe results rather than rows; and the synthetic dry-run dataset appears **only as a recorded
   exclusion** with its derivation test and reason. No entry sets a term for an artifact that does not
   exist.
6. **Findings routed, not absorbed.** Every purpose not traceable to a real use, and every category
   the independent omission probe surfaces, is reported as a finding **with a named recipient** in
   `91_findings-register.md` rather than reconciled in the chapter's prose.

**Verified by.** `03_learner-data-inventory-and-classification.md` §3 (the re-derived enumeration),
§4–§8 (the 32 entries), §5 (the conditional log-table classification), §8 (the copy classes and the
recorded exclusion), §9 (the consent seam), §10 (the bidirectional cross-check), §11 (the completeness
method and its falsifier), §12 (the purpose-limitation review);
`91_findings-register.md` (`F-S3-1` … `F-S3-4`); `92_risk-register.md` (`R10`, `R12`);
`93_open-items-and-provisional-register.md` (`OI-S3-1`); `94_caps-and-incomplete-scope.md`
(`CAP-S3-1`); `95_stand-in-assumption-register.md` (`A-S3-1`);
`decision-records/DR-C11-S3-1_learner-data-classification-scheme.md`,
`decision-records/DR-C11-S3-2_conditional-log-table-classification.md`,
`decision-records/DR-C11-S3-3_package-own-copies-and-the-derivation-test.md`;
`traceability/S3_learner-data-inventory.md`.

**Measured result at revision 1.** (1) **10 + 2 + 2 + 10**, `context_tokens` the tenth `public` table
at `src/infrastructure/db/schema.ts:312`, appearing exactly once as `LD-S3-13`. (2) **32 entries**,
each once; falsifier published in §11 and **fired once** — six process-local structures beyond the
four the scope named were surfaced by the omission probe and **admitted** as `LD-S3-22` … `LD-S3-27`.
(3) C010 → here: **30 matched + 15 unmatched-and-explained = 45**; here → C010: **30 matched + 2
unmatched-and-explained = 32**. Both identities hold. (4) Both log tables carry both readings, one
shared stated condition, and a SUB-16 pointer; both recorded complete, **zero revisions owed**.
(5) Sixth copy class present with **zero known members** and SUB-1's terms quoted as recorded;
aggregate result set present as counts and probe results; dry-run dataset present **only as an
exclusion** with its derivation test. **Zero terms set for a non-existent artifact.** (6) **Four**
findings routed with named recipients; **zero** absorbed into prose.

**The measure is met, and the surface it classified is one where no ownership column exists on any
table.** Both are true and OUT-9 requires them reported together: the inventory is complete against
the declared schema, and what it inventories is a system in which attribution is a property of the
deployment rather than of the data. The consequence is carried as `F-S3-1` and `R12`, not smoothed
over here.

**Authored by.** SUB-3 (NEU-995).
### SUB-15

## OUT-14 — Numeric capacity, availability, latency, failure, backup and recovery objectives for the real deployment

**Outcome.** Capacity, availability, latency, failure, backup and recovery objectives are set
numerically against the platform the product actually runs on — a single self-hosted VPS with an
unversioned off-repo compose stack, no Dockerfile, no IaC, auto-deploy from `develop` on green CI,
auto-migration on boot and process-local in-memory state — rather than against an idealized one.
Every input to the capacity model carries an explicit evidence label; the first break point of the
single-instance assumption is named with its threshold; and the RPO/RTO position is either stated
with its evidence or recorded as a blocking finding rather than given an assumed number.

**Success measure.** OUT-14 is judged done when **all five** of the following hold, each reported as
a number rather than an assertion:

1. **Total labelling, with the counts reported.** Every capacity-model input carries exactly one of
   four labels — `observed-in-repository` with a `file:line`, `derived` with its derivation shown,
   `cited` with an upstream id, or `[unconfirmed]` with a named owner and a routing id — and the
   per-label counts are reported and **sum to the total**, so no input is silently absent.
   **Zero inputs are unlabelled**, and the count of inputs labelled *observed in production* is
   reported explicitly rather than left to be inferred.
2. **One named structure, one stated threshold.** The first-break analysis names exactly one
   structure as breaking first and states its threshold. Where the threshold depends on an
   unobserved term, it is published as a **formula plus a bounded band with the unobserved term
   named and routed** — and the count of fabricated point values is **zero**.
3. **Every objective numeric or a recorded finding — never blank.** Each stated objective either
   carries a number or is recorded as `[unconfirmed]` with an owner or as a blocking finding. The
   two counts are reported and sum to the total. **Zero objectives are blank, and zero were given an
   invented number to avoid being blank.**
4. **Zero objectives assume an absent capability.** Each objective is checked against the four
   capabilities the platform does not have — an image registry, a replica set, an IaC revert, a
   managed database — and the count assuming any of them is **zero**.
5. **Exactly one record for the backups fact, and it is not this sub-task's.** A search of SUB-15's
   artifacts returns **zero** open items, findings or register entries restating whether backups
   exist, and **exactly one** blocking finding about the RPO/RTO objective that cannot be set,
   carrying its own id, a named owner and a citation to `OI-S1-8`.

**Verified by.** `15_operational-objectives-for-the-real-platform.md` §2 (the 27-input labelled
capacity model and its label vocabulary), §3 (the first-break analysis and ranking), §4 (the
14-objective set with its platform-reality-check column), §5 (the recovery tabletop, the `OI-S1-8`
citation and the two conditional positions), §6 (the audit and its counts), §7 (the constraint
checks) and §8 (what it does not establish);
`91_findings-register.md` (`F-S15-1` … `F-S15-3`); `92_risk-register.md` (`R-S15-1` … `R-S15-3`);
`93_open-items-and-provisional-register.md` (`OI-S15-1` … `OI-S15-4`);
`94_caps-and-incomplete-scope.md` (`CAP-S15-1`);
`95_stand-in-assumption-register.md` (`A-S15-1`, `A-S15-2`);
`96_spike-register.md` (`SPK-S15-1` … `SPK-S15-4`);
`decision-records/DR-C11-S15-1_objective-basis-and-evidence-labels.md`,
`decision-records/DR-C11-S15-2_first-break-ranking.md`,
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`;
`traceability/S15_operational-objectives.md`.

**Measured result at revision 1.** (1) Twenty-seven inputs: **16 `observed-in-repository` + 2
`derived` + 1 `cited` + 8 `[unconfirmed]` = 27**, sum matches; **0 unlabelled**; **0 observed in
production**. (2) One structure named — the Postgres connection pool at `max: 4` — with threshold
`N ≥ 2 / t_db` and a published band of **2–200** concurrently active learners; **0 fabricated point
values**. (3) Fourteen objectives: **9 numeric + 5 recorded (2 `[unconfirmed]` with owners, 1 gap
with a named absent mechanism, 2 carried by the blocking finding) = 14**; **0 blank**. (4) **0**
objectives assume an image registry, a replica set, an IaC revert or a managed database. (5) **0**
restatements of the backups fact; **1** blocking finding about the unsettable objective, `F-S15-1`,
citing `OI-S1-8`.

**The measure is met, and every number it certifies rests on zero production observations.** Both
are true, and stating them together is the point: the labelling discipline held completely, and what
it labelled was a model built from repository constants and this repository's own git history over
eight owned unknowns. The consequence is carried as `CAP-S15-1` in `94_caps-and-incomplete-scope.md`
and as `R-S15-1` in `92_risk-register.md`, not smoothed over here. It is the same shape SUB-1
reported for OUT-18 and it is reported the same way.

**Authored by.** SUB-15 (NEU-998).
