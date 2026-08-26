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

---

### SUB-2

## OUT-1 — Identity mapping to the production Rauthy IdP: which token claim becomes the learner key, and what that key means

**Outcome.** The package names the exact claim that becomes the persisted learner key — **the OIDC
`sub` claim, verbatim; `azp` never** — resolves the `payload.sub || azp` fallback
(`src/transport/jwt-middleware.ts:127`) into a rule rather than inheriting it, and covers all three
principal shapes the deployment produces, with the absent, changed and re-used cases each producing
a defined outcome.

**Success measure.** OUT-1 is judged done when **all four** hold, each reported as a count rather
than an assertion:

1. **Totality with zero fall-through.** The rule's conditions are mutually exclusive and jointly
   exhaustive over the `(sub, azp)` product, and every token yields exactly one learner key or one
   defined rejection. **Zero** cases reach the raw `sub || azp` expression.
2. **Three cases, three distinct outcomes.** Absent, changed and re-used each carry a stated outcome,
   and the three outcomes differ from one another.
3. **Three shapes, each placed.** All three principal shapes appear in the mapping with the branch
   they are expected to take **and** an explicit evidence status, so a reader cannot mistake an
   expectation for an observation.
4. **Four key properties, each disposed.** Stability, uniqueness, re-issue and format are each either
   established from a cited source or routed to a named open item — **never asserted**.

**Verified by.** `02_identity-the-learner-key-and-principal-kind.md` §3 (the mapping), §4 (the three
cases), §5 (the four key properties), §11 (the ADR-0001 expiry review);
`decision-records/DR-C11-S2-1_the-persisted-learner-key.md` (the key, with five rejected
alternatives); `93_open-items-and-provisional-register.md` (`OI-S2-1`, `OI-S2-2`);
`96_spike-register.md` (`SPK-S2-1`, `SPK-S2-2`); `92_risk-register.md` (`R-S2-1`, `R-S2-3`).

**Measured result at revision 1.** (1) **3** exhaustive conditions, **0** fall-throughs. (2) **3 of
3** cases distinct — absent yields no key, changed refuses to merge, re-used cannot be detected and
is carried as a High risk. (3) **3 of 3** shapes placed; **3 of 3** carry `[unconfirmed]` as to which
branch they populate. (4) **4** properties: **1** conditionally sound on ADR-0001's single-issuer
premise, **3** routed to `OI-S2-1`; **0** asserted.

**The measure is met, and it is met over a rule rather than over observations.** The distinction is
load-bearing and is stated rather than smoothed: the rule is total because kind is determined by
`sub`-presence and not by audience shape, so it holds at `n = 0`. What no measure here establishes is
how many real principals land in each branch — that is `CAP-S2-1`.

**Authored by.** SUB-2 (NEU-994).

---

## OUT-5 — Whether the production learner flow yields a human `sub`, closed on observed evidence

**Outcome.** The question is answered per principal shape, and the answer is **mixed**: the
`client_credentials` shape is believed to yield no `sub` at all, the static client `claude-web` is
the production learner path and probably does, and the DCR shape is unknown and may not. A negative
or mixed answer is a valid recorded result.

**Success measure.** The charter's own, quoted rather than restated so it cannot be quietly
weakened: *"The question is answered from a **real token obtained from the production Rauthy IdP**
(OUT-18), not from inference,"* and `OI-S1-2` is recorded as **closed with the observed value**,
citing `SUB-12 of C010 (NEU-986)`'s gate reassignment at
`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:615`.

**Verified by.** `02_identity-the-learner-key-and-principal-kind.md` §9 (the `OI-S1-2` disposition),
§10 (the per-shape answer); `95_stand-in-assumption-register.md` (`A-S2-1`);
`91_findings-register.md` (`F-S2-1`, `F-S2-3`); `93_open-items-and-provisional-register.md`
(`OI-S2-2`, and C011's `OI-S1-1` … `OI-S1-3` inherited from SUB-1).

**Measured result at revision 1: the measure is NOT MET, and it is reported as not met.**

- **Real tokens obtained: 0.** For any shape. `SPK-S1-1` … `SPK-S1-3` all record `Result: not
  executed`; no production credential of any kind exists in the authoring environment (`F-S1-2`,
  `CAP-S1-1`).
- **`OI-S1-2` is therefore not closed.** Its own resolving event requires that *"a live production
  token is inspected and its `sub` claim recorded"*, and none was. The item is recorded as **owned
  here, design half discharged, evidence half not closable at this revision** (§9). The gate
  reassignment at `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:615` is cited and the `Owner:` line at `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:81` is noted once as a
  convention artefact, with **no ownership finding routed** — both as required.
- **The acceptance clause that ranges over shapes SUB-1 obtained is satisfied vacuously**, over an
  empty set, and is reported as vacuous rather than as a clean pass.

**What was delivered instead, and why it is not a substitute.** The question is answered per shape
from ADR-0001 and the codebase at cutoff `86fb38a`, with each answer's basis and confidence stated —
useful, and **not** the observation the measure names. The residual spans **all three** shapes, not
one, and is carried as `A-S2-1` with a named owner and an observable re-validation trigger. The gap
between this outcome's acceptance condition and the evidence base SUB-1 could produce is registered
as **`F-S2-3`**, not absorbed here.

**This row records a not-met measure deliberately.** OUT-5 is the one outcome in this sub-task's set
that the charter defined against evidence rather than against design, and reporting it as met would
require asserting an observation that does not exist.

**Argued deviation — the stand-in's id.** This sub-task's brief named the residual stand-in `A-35`,
continuing the charter's own assumption numbering. It is filed as **`A-S2-1`** instead. The reason is
a real collision, not a preference: `A-<n>` is only uniquely computable if no other sub-task is
standing in for a *different* charter assumption at the same time, two were being authored
concurrently, and a merge conflict in `95_stand-in-assumption-register.md` resolves by **keeping both
sides** — so a collision would have landed two rows sharing one id rather than failing loudly.
**SUB-15 reached the identical conclusion independently** (`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`,
`A-S15-<k>`). The entry still records which charter assumption it stands in for — 35 — in its
`Assumption:` field, so the pointer the charter-continued scheme existed to provide is preserved. The
superseded form is kept as rejected alternative 9 in
`decision-records/DR-C11-S2-3_provenance-persistence-and-parallel-safe-id-families.md`. Recorded here,
in the outcome row, because a deviation from a named identifier belongs where the outcome is judged
and not only inside a decision record. **SUB-14 (NEU-1007) adjudicates** the two coexisting schemes;
SUB-1's `A-33` / `A-34` are not renumbered by this sub-task.

**Authored by.** SUB-2 (NEU-994).

---

## OUT-6 — Whether the resolved identity carries its `sub`/`azp` provenance, so check `I5` is answerable at all

**Outcome.** The resolved identity **does** carry its provenance. The principal's kind — `user` or
`client` — is determined from the presence of `sub`, never inferred from the audience shape, and is
carried as a separate field to every consumer that makes an authorization or ownership decision.
Check `I5` is consequently **evaluable**, and C010's `OI-S5-2` **closes**.

**Success measure.** OUT-6 is judged done when **all four** hold:

1. **`I5` has an input on both limbs.** The check is applied to the proposed mechanism and each limb
   — server-derived, and kind determined rather than assumed — is shown to have something to
   evaluate, where the second previously had nothing.
2. **The provenance decision is complete.** Whether it is carried is stated, and where it is stored,
   who may read it and **what a consumer is entitled to conclude** are each stated. Where it is not
   carried, what `I5` degrades to and who owns the residual are stated instead.
3. **Consumer coverage is total.** Every consumer of the identity value can distinguish principal
   kinds, or is explicitly documented as unable to with a named residual owner. **Zero** consumers
   are left unclassified.
4. **`OI-S5-2` carries an explicit disposition**, discharged clause by clause against its own
   resolving event rather than against a paraphrase of it.

**Verified by.** `02_identity-the-learner-key-and-principal-kind.md` §6 (provenance), §7 (the `I5`
application), §8 (the `OI-S5-2` disposition);
`decision-records/DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md` (kind
determination and the service-principal disposition, six rejected alternatives);
`decision-records/DR-C11-S2-3_provenance-persistence-and-parallel-safe-id-families.md` (provenance
carriage, eight rejected alternatives); `93_open-items-and-provisional-register.md` (the `OI-S5-2`
disposition).

**Measured result at revision 1.** (1) **2 of 2** limbs have an input; the second went from
*unanswerable* to *determined*. (2) **4 of 4** provenance elements stated — carried, storage site,
readership, entitlement — including the explicit negative that kind `user` does **not** certify a
natural person. (3) **All** consumers can distinguish kinds under the proposed mechanism; **0**
documented as unable, so **0** residual owners are named on that clause. (4) `OI-S5-2` disposed as
**closed**, discharged against all four clauses of its own resolving event at
`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:221`.

**Three things this measure does not claim, stated because the over-claim is the failure mode.**
`I5` is **evaluable, not passing** — it is still never reached, because `I4` fails first on ungated
STDIO and masks it. No state category reaches `holds`; C010's `F-S5-4` census is unchanged. And the
determination is about **which claim** the identity came from, not about whether a person is behind
it — that is `OI-S1-2`, still open under OUT-5.

**`OI-S5-2` closed at position 2 with zero production observations, because it was always a design
question** — C010 routed it to `NEU-893` for want of a mechanism owner, not for want of an
observation. That is the exact contrast with OUT-5 above, and it is why one row here reports met and
the other reports not met.

**Authored by.** SUB-2 (NEU-994).

---

### SUB-4

## OUT-7 — An identity gate on the transport that has none, so check `I4` can pass on both

**Outcome.** The STDIO transport is **gated**, on a principal read from server-held deployment
configuration rather than presented by the caller, with the three exempt tools unchanged and every
gated tool refused where no principal is configured. *"Leave STDIO ungated"* is argued and rejected
on the invariant. `BND-S4-17` is dispositioned **resolved here**, naming
`SUB-10 of C010 (NEU-984)` co-named `NEU-896` as its owner, and `OI-S8-2` / `CC-S8-3` are routed to
that same owner as **supplied-to**, never claimed.

**Success measure.** Four clauses, each independently checkable against the published chapter.
**(1)** Check `I4` is applied to *both* transports and resolves to a stated verdict, with every
residual named and owned. **(2)** *Every* existing STDIO client path is enumerated and classified
`unaffected` / `degraded` / `broken` — no path left uncounted — with a stated breaking-change
position and a stage set carrying its ordering constraints. **(3)** `BND-S4-17`'s disposition cites
`OI-S8-2`'s resolving event at
`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:429`, names
which limb of that event fired, and never attributes the citation to `OI-S8-1`. **(4)** The
ungated-STDIO alternative appears **only** as an argued-and-rejected alternative in a decision
record, never as the answer.

**Verified by.** `04_the-stdio-identity-gate-and-the-bound-context-token.md` §1 (the starting
position), §2 (`F-S2-1` applied), §3 and §3.1 (the decision and the rejected default), §9 (the
seven-path compatibility assessment), §9.1 (the breaking-change position and stage set), §9.2 (the
routed hand-off), §10.1 (`I4`), §11 (the `BND-S4-17` disposition), §12 (the reachability answer
planned against); `decision-records/DR-C11-S4-1_the-stdio-identity-gate.md` (six rejected
alternatives); `traceability/S4_stdio-gate-and-bound-context-token.md`.

**Measured result at revision 1.** **(1) Met.** `I4` is applied to both transports and no longer
fails under the proposed gate; three non-claims and one residual — the per-process-singleton limit,
`R-S4-3` — are named, and the residual carries an owner. **(2) Met.** **7 of 7** STDIO client paths
classified: 3 unaffected, 1 degraded, 2 broken, 1 unaffected-here-and-counted-elsewhere. The
breaking-change position is *breaking and unavoidably so*, with a four-stage set and two ordering
constraints. **(3) Met.** The citation resolves to `OI-S8-2`, limb **one** is named as the limb that
fired, and `OI-S8-1` appears only where it is correctly the different item. **(4) Met.** The
ungated alternative is rejected alternative 1 of `DR-C11-S4-1` and is argued in §3.1 against the
invariant's unconditional verdict.

**What this measure does not claim.** That any category reaches `holds` — `I3` is SUB-5's and the
checks are ordered. That the gate exists — nothing is implemented, `CAP-S4-1`. That `OI-S8-2`
closes — firing its event is this sub-task's act; recording the closure is
`SUB-10 of C010 (NEU-984)`'s.

**Authored by.** SUB-4 (NEU-996).

## OUT-13 — Context-token use under C010's token-bound identity decision, including the live tokens already in production

**Outcome.** `context_tokens` carries `principal_id`, `principal_kind` and
`principal_claim_source`, written at mint time, with the identifier a learner key **if and only if**
the kind is `user`. `init_agent_context` obtains a principal from the verified token on HTTP and
from server-held configuration on STDIO, and refuses to mint where there is none. The dead
`deleteExpired()` is wired at the mint path. Every pre-existing row is rejected and deleted rather
than grandfathered, and the four classes of token that will be rejected at cutover are named — the
deploy pipeline's own `client_credentials` smoke principal among them.

**Success measure.** Four clauses. **(1)** A token-lifecycle walk covers **mint, use, expiry, purge
and cutover** on both transports and in the unconfigured case, with **no cell left undefined**.
**(2)** The purge question resolves to a **wired path with a named call site**, or to a stated
reason there is none — and the existing per-row delete is explicitly distinguished from a purge so
it cannot be mistaken for one. **(3)** *Every* class of live token rejected at cutover is named, the
smoke principal included, with any unobserved quantity carried as a stand-in or a spike rather than
estimated. **(4)** An audit against `DR-C10-S8-2` runs **clause by clause**, confirms **zero**
per-call identity arguments added, and records verdicts for checks `I2` and `I5`.

**Verified by.** `04_the-stdio-identity-gate-and-the-bound-context-token.md` §1.4–§1.5 (the row and
the dead purge), §4 (what the row carries), §5 (per-transport principal acquisition), §6 (the
lifecycle walk), §7 (the wired purge), §8 (the cutover classes), §10.2–§10.4 (`I2`, `I5`, and the
clause-by-clause audit); `decision-records/DR-C11-S4-2_what-the-context-token-row-carries.md` and
`decision-records/DR-C11-S4-3_expiry-purge-and-the-cutover-rejection-rule.md` (six rejected
alternatives each); `traceability/S4_stdio-gate-and-bound-context-token.md`.

**Measured result at revision 1.** **(1) Met.** **15 of 15** cells of the five-step × three-column
lifecycle table carry a stated disposition — **14** a defined behaviour and **one** an explicit
`n/a` where the step cannot arise, because an unconfigured STDIO process mints nothing and so has
nothing to expire. Two cells state that an existing behaviour is **unchanged**, which is
a defined behaviour and not an omission; §6's closing line draws that distinction rather than
claiming the word never appears. **(2) Met.** `deleteExpired()` is
wired at `ctx.createContextToken()`, reached from `src/server/server-context-tools.ts:33`, chosen
for being transport-agnostic; the per-row delete inside `validateWithStatus` is recorded as **not** a
purge in both §1.5 and `F-S4-1`. **(3) Met.** **4 of 4** classes named — C1 every pre-existing row,
C2 the recurring deploy-pipeline smoke principal, C3 pre-cutover learner rows, C4 pre-cutover STDIO
rows. **Zero quantities are stated**: the C1 population is `A-S4-1`, resolving through `OI-S1-7` /
`SPK-S1-7`. **(4) Met.** **7 of 7** `DR-C10-S8-2` clauses audited; **zero** tool input schemas
change and **zero** per-call identity arguments are added; `I2` satisfied for `context_tokens`
itself and consumed unchanged elsewhere; `I5` satisfied on both transports.

**The measure's most consequential finding is a negative one, and it is reported rather than
absorbed.** The deploy pipeline's smoke run mints a `client_credentials` token on **every** deploy
(`.github/workflows/cd-prod.yml:145`–`:174`) and calls gated learner-state tools with it
(`tests/smoke/smoke.test.ts:206`, `:237`). Under the service-principal rule those calls are refused,
and `cd-prod.yml` runs the suite as a deploy step — so **this package's identity rule has the
production release pipeline as an unadapted consumer**. `F-S4-3`, `R-S4-2`, `OI-S4-2`.

**What this measure does not claim.** That the binding exists — nothing is implemented and
`OI-S8-1` stays open, because its resolving event is a migration this package may not write. That
the C1 population is non-zero, small, or large. That a retention position for `context_tokens` has
been taken; the purge is wired so the identity decision does not open the question, not so it
answers it.

**Authored by.** SUB-4 (NEU-996).

---

### SUB-16

## OUT-15 — Observability, attribution, alerting and incident evidence sufficient to detect an isolation or privacy failure

**Outcome.** The package states what must be observable to detect **cross-learner access**, **a
failed confinement**, **a stalled data-lifecycle propagation** and **a rollout regression** — each
with a signal, a threshold, an alert route and an owner. It resolves the attribution gap directly and
**per transport**: HTTP writes an audit row in which 0 of 11 columns carry a server-derived
principal, because the two columns that look as though they might — `session_id`
(`src/transport/audit-middleware.ts:94`–`:99`) and `correlation_id`
(`src/transport/http.ts:154`–`:157`) — are both **caller-asserted**; STDIO writes no row at all
(`src/transport/main.ts:55`–`:58`). The resolution is a new **server-derived column pair**,
`principal_kind` (`NOT NULL`, three-valued) plus `learner_key` (the `sub` verbatim), which makes the
**service principal a countable state rather than a silence**. Adding attribution is stated together
with its privacy consequence: **this outcome determines which of OUT-9's two conditional readings
holds** — the attributed one, for both tables — and publishes it as the settled classification OUT-11
and OUT-12 design against.

**Success measure.** OUT-15 is judged done when **all five** hold:

1. **Zero failure modes without a signal.** Each of the four named failure modes maps to a signal, a
   threshold, an alert route and an owner, with no cell blank and no cell filled by an invented value.
2. **The attributability audit is reported per transport, and the worse transport is not hidden by
   the better.** HTTP and STDIO are reported as separate rows, before and after, and any transport
   that remains unattributable after the proposed change is named **with its residual owner** rather
   than reported as improved.
3. **Exactly one privacy reading is determined, per table**, its consequence for export, erasure and
   retention is stated, it is published as SUB-8's and SUB-9's input, and **zero revisions are raised
   against SUB-3's inventory**.
4. **The signal contract is conformable without a question.** A reader holding only chapter `16_` can
   name every required field of a completion proof, where it lives and when it is evaluated.
5. **Zero signals assume an emission the deployment does not make.** Every such emission is named
   with an owner.

**Verified by.** `16_attribution-and-detection.md` §1 (the per-transport audit), §2 (the attribution
model and the third principal state), §3 (the detection matrix), §4 (the missing emissions), §5 (the
determination), §6 (the signal contract), §7 (the `OBJ-10`/`OBJ-11` check), §8 (the tool-surface
disclosure); `decision-records/DR-C11-S16-1_the-attribution-carrier.md` (seven rejected
alternatives); `decision-records/DR-C11-S16-2_the-audit-log-privacy-determination.md` (six rejected
alternatives); `decision-records/DR-C11-S16-3_the-stalled-propagation-signal-contract.md` (seven
rejected alternatives); `traceability/S16_attribution-and-detection.md`.

**Measured result at revision 1.** (1) **4 of 4** failure modes carry a signal, a threshold, a route
and an owner; **0** blank cells. (2) **2 of 2** transports reported separately, before and after;
**STDIO reports no improvement** and its residual is named with two owners, because the record and
the principal are two different missing things. (3) **1 of 1** reading determined **per table**, for
**2 of 2** tables, with export, erasure and retention each addressed; **0** revisions raised against
`03_learner-data-inventory-and-classification.md`. (4) The contract states **9 required fields, 3
location properties, 1 fire condition and 6 negative clauses**. **Two of them name a value another
sub-task supplies, and neither is a deferral of the contract's own shape:** field 4's `copy_class`
enum ranges over the classes SUB-9's matrix enumerates, and the fire condition compares against the
propagation's *declared* cardinality — both are inputs the contract requires a conforming party to
supply, stated as such, in the way a function signature names a parameter without computing it.
`deadline_at`'s value is likewise SUB-8's (`DR-C11-S16-3` §5). **What is complete without reference
to any future artifact is the shape**: no field, property or clause says *"as SUB-9 shall
determine"*. (5) **7 of 7** missing emissions named with an owner; **0** signals assume
an available emission.

**Three things this measure does not claim, stated because the over-claim is the failure mode.**
**No signal has ever fired or been run** — every threshold is derived from repository constants at
`n = 0` observed production events (`94_caps-and-incomplete-scope.md` § `CAP-S16-1`; `R13` cited for
the evidence position). **No alert route is real** — all four are `[unconfirmed]` against `OI-S1-9`,
so a signal that fires today reaches nobody (`R-S16-2`). And **the determination is conditional on
adoption** — it binds every design downstream of it and asserts nothing about the deployment as it
stands, which is deliberate: asserting it would be the overstatement `R10` is registered against.

**One measure limb is satisfied in design and unsatisfiable in evidence, and it is reported rather
than reinterpreted.** Limb 1 requires a *threshold* per failure mode, and four are stated — but a
threshold derived from a constant is not a calibrated threshold, and none of the four has been
exercised against a real population. The condition as written does not require calibration, so it is
recorded **met**; the gap it leaves is carried as `CAP-S16-1` with a landing condition rather than
absorbed into the measure. This is the same disposition SUB-2 took with `F-S2-3`: deliver the design
half, decline the evidence half, and register the gap visibly.

**Authored by.** SUB-16 (NEU-999).

---

### SUB-8

## OUT-10 — What consent covers, what withdrawal does, and what does not rest on consent at all

**Outcome.** The package states what consent is captured, when, in what shape, where the record lives
and how it is versioned; what withdrawal does and how quickly; and — as explicitly as the positive
case — which processing does **not** rest on consent and therefore survives withdrawal, with the
alternative lawful basis named per purpose. Consent state is placed as a state category with
**exactly one authority** under C010's model. The versioned consent record is a new learner-data store
this outcome creates, so this outcome — not OUT-9 — classifies it, in OUT-9's published entry shape
plus a seventh field for its retention position after withdrawal. Withdrawal's downstream effects are
enumerated category by category rather than described in general terms.

**Success measure.** OUT-10 is judged done when **all five** hold, each reported as a number or an
explicit disposition rather than an assertion:

1. **One authority, by the published rule rather than by assertion.** Consent state resolves to
   **exactly one** authority under C010's ordered assignment rule, the matching clause is named, the
   clause that would have matched had the rule not been ordered is recorded as a **rejected
   alternative**, and **zero** authorities are split.
2. **The boundary is stated in both directions, and the negative side is enumerated.** Every
   processing purpose the package names carries an explicit *governed by consent: yes/no*, and every
   `no` names the basis that carries it instead. **Zero purposes are left unstated.**
3. **The withdrawal walk is exhaustive.** Every category of OUT-9's inventory appears with its
   resulting behaviour on withdrawal, plus the consent category this outcome creates. **Zero
   categories omitted**, and the count is reported.
4. **The consent category's entry carries all seven fields, checked field for field** against OUT-9's
   published shape, and is consumable as-is by the OUT-11 export-completeness check and by OUT-12's
   unowned-copy audit — with **zero** back-edge edits to OUT-9's inventory produced, requested or
   owed.
5. **A purpose resting on consent that could not actually be withdrawn is reported as a finding with
   a named owner**, not reconciled in prose.

**Verified by.** `08_consent-and-what-a-learner-can-export-and-erase.md` §2 (the authority
placement), §3 (the severability test and the three consent purposes), §4 (the negative boundary),
§4.1 (the OUT-10 finding), §5 (the classification entry), §6 (the withdrawal walk);
`decision-records/DR-C11-S8-1_the-consent-record-and-the-consent-boundary.md` (seven rejected
alternatives); `91_findings-register.md` (`F-S8-1`, `F-S8-4`); `92_risk-register.md` (`R-S8-1`);
`93_open-items-and-provisional-register.md` (`OI-S8-1`);
`traceability/S8_consent-export-and-erasure.md`.

**Measured result at revision 1.** (1) **1 of 1** authority — `CMP-S4-7`, under **clause 2**, with
clause 5 recorded as rejected alternative 3 and a split authority as rejected alternative 4; **0**
split. (2) **14 of 14** purposes carry an explicit yes/no; **3** yes, **11** no, each `no` naming
contract, legitimate interests, or the demonstrating-consent position; **0** unstated. (3) **33 of
33** rows in the withdrawal walk — SUB-3's 32 plus `LD-S8-1`; **0** omitted; **3** affected.
(4) **7 of 7** fields present; **0** back-edge edits — `03_learner-data-inventory-and-classification.md`
is unmodified by this sub-task. (5) **1** such purpose found — operational logging, failing
withdrawability in three independent ways — reported as `F-S8-1` with a named owner; **0** absorbed
into prose.

**The measure is met, and what it certifies is a boundary this outcome had to create rather than
find.** Both are true and OUT-10 requires them reported together: **zero** of OUT-9's thirty-two
entries carries consent as its lawful-basis position, and `consent` returns **zero** hits across
`src/` and `drizzle/`. The chapter therefore draws a first boundary rather than documenting an
existing one, which is why the severability test is published as a test a reader can re-apply rather
than as a partition they must accept. Carried as `F-S8-4`, not smoothed over here.

**Authored by.** SUB-8 (NEU-1002).

---

## OUT-11 — Learner-readable export and per-category erasure, each with a completion deadline and named retention exceptions

**Outcome.** Export produces a **learner-readable artifact — not a database dump** — covering every
category OUT-9 marks as the learner's plus the consent category OUT-10 creates, with its format,
delivery, authentication and completeness stated. Erasure states, per category, whether the
obligation is deletion or de-identification and why, the consent category included. Both carry an
explicit completion deadline. **Every retention exception carries all four of a justification, a
bound, an owner and a stated basis**, and one that cannot be given all four is recorded as a blocking
finding rather than accepted.

**Success measure.** OUT-11 is judged done when **all five** hold, each reported as a number:

1. **The export is complete against the stated union, with the arithmetic shown.** Every category in
   *"every category OUT-9 marks as the learner's, plus the consent category OUT-10 creates"* carries
   an explicit disposition; the subtrahend is named by id; and **zero categories from either set are
   unaccounted for.**
2. **The artifact is learner-readable rather than a dump**, judged against stated properties, and any
   value that may be truncated is **labelled** as such rather than presented as complete.
3. **Every category carries an erasure disposition with its reason**, the consent category included,
   and a category personal data cannot reach is named `unreachable` rather than recorded as deleted.
4. **Zero retention exceptions of indefinite duration are accepted.** Each exception is audited
   against all four fields; the consent record's own position is audited **as one of them, not
   exempted**; and any exception that cannot be given all four is recorded as a **blocking finding**.
5. **A completion deadline is stated with its provenance**, and it is not presented as an observed or
   calibrated quantity.

**Verified by.** `08_consent-and-what-a-learner-can-export-and-erase.md` §7 (the export design, the
completeness arithmetic and the table-top), §7.4 (`LD-S3-31` and `LD-S3-32`), §8 (the per-category
disposition), §8.2 (what erasure cannot reach), §9 (the four-field audit), §9.1 (the deadline and its
provenance), §10 (the purge audit);
`decision-records/DR-C11-S8-2_export-erasure-and-the-completion-deadline.md` (nine rejected
alternatives); `91_findings-register.md` (`F-S8-2` — **blocking** — and `F-S8-3`);
`92_risk-register.md` (`R-S8-2`, `R-S8-3`, `R-S8-4`); `94_caps-and-incomplete-scope.md` (`CAP-S8-1`);
`95_stand-in-assumption-register.md` (`A-S8-1`); `96_spike-register.md` (`SPK-S8-1`);
`traceability/S8_consent-export-and-erasure.md`.

**Measured result at revision 1.** (1) **25 of 25** categories dispositioned — 32 − 8 = 24, plus
`LD-S8-1`; the eight excluded entries named by id; **0** unaccounted for, and the table-top's own
sub-counts sum to 25. (2) Seven stated properties — five readability, plus completeness and the deadline — all satisfied by the specified artifact;
**1** category (`LD-S3-16`) requires the possibly-truncated label and carries it. (3) **33 of 33**
categories carry an erasure disposition with a reason; **3** are `unreachable` and are named as such
rather than as deleted. (4) **6** exceptions audited; **5 pass**, **1 fails** and is recorded as the
blocking finding `F-S8-2`; **0** indefinite exceptions accepted; the consent record's own position is
**audited as exception #1**, not exempted. (5) Deadline stated — 30 days for export and erasure, next
request plus 7 days for withdrawal — with its provenance named as **derived from the ratified
GDPR-shaped baseline**, and explicitly **not observed and not calibrated**.

**One thing this measure certifies that a reader must not over-read.** The measure ranges over a
**specification**, not a capability. Exactly **two** delete paths are reachable from a user-facing
tool and **no export surface exists at all** (§10.2), so every disposition above is a duty a later
charter must build. That gap is `F-S8-3` and `R-S8-4`, and stating it here is deliberate: an outcome
register that recorded OUT-11 as met without it would read as though the product could do these
things.

**The deadline's second effect, stated because it discharges another sub-task's open term.**
`DR-C11-S16-3` left `deadline_at`'s value here, and `16_attribution-and-detection.md` §6 records
`SIG-S16-3` as *"fully specified and not yet evaluable"* (§3's matrix cell carries the same fact in
different words — *"Fully specified; not yet evaluable"*) in consequence. It is now **evaluable in
principle and still unemitted** — `ME-S16-6`'s gap is untouched by this outcome. `R-S8-3` carries the
difference; nothing here claims the signal works.

**Authored by.** SUB-8 (NEU-1002).
### SUB-5

*`NEU-997`, covering `OUT-8`. One row. The success measure is authored here, not derived at assembly
(charter assumption 47).*

## OUT-8 — Where the confinement is mechanically implemented, at or below the port boundary

**Outcome.** The enforcement point is named: **the Drizzle adapter**, with the principal bound at
construction as an indivisible `(principal_id, principal_kind)` pair, adapter instances constructed
per request, refusal rather than empty-scoping for a non-`user` kind, and the database as an
independent second layer. It is named **per port** across all 13 ports in `src/ports/`, with two
exclusions justified and three ports recorded as taking a different mechanism or none. The two
write-path invariants the charter names are **removed** rather than shadowed, and a third the charter
does not name is found and removed with them. `SC-S3-12` (Notes) is carried to verdict **`holds`** —
the isolation invariant's first published positive instance.

**Success measure.** Six limbs, each independently checkable:

1. **13/13 ports addressed** — every port names an enforcement point or carries a written
   justification for exclusion; zero unaddressed.
2. **`52 + 4` arithmetic reported over the `AppContext` walk**, with every member accounted for and
   no non-closure asked a closure question.
3. **Both named write-path invariants demonstrably removed**, judged by the test *does the global
   statement still exist anywhere in `src/`* rather than by whether a predicate was added above it.
4. **One `SC-S3-*` category at verdict `holds`**, all five checks answered in order, against a
   **stated and enumerated** target state.
5. **`CAP-S5-1`'s three preconditions each traced to a settled decision or an already-supplied
   outcome, with zero traced to an artifact that does not yet exist** when the derivation is written.
6. **The `A-28` envelope check runs and its result is stated** — inside, or a breach reported as a
   finding with an owner and routed as an amendment to `NEU-895`.

**Verified by.** `05_the-enforcement-point-that-confines-every-read-and-write.md` §§1–16;
`decision-records/DR-C11-S5-1_the-enforcement-point.md`;
`decision-records/DR-C11-S5-2_the-first-holds-derivation.md`;
`traceability/S5_the-enforcement-point.md`.

**Measured result at revision 1.** **Five of six limbs MET; limb 2 MET on its intent and NOT MET on
its literal arithmetic, and the divergence is the finding rather than a rounding.**

1. **MET.** 13 addressed · 11 in the blast radius · 2 excluded with justification · 1 further port
   named as not confinable and routed · 1 confined by a different mechanism · 1 excluded as not
   learner-scoped. Zero unaddressed.
2. **MET on intent, NOT MET on the literal figure.** Every member is accounted for and no
   non-closure is asked a closure question — the substance of the limb. But the arithmetic reported
   is **`53 + 4 = 57`**, not `52 + 4 = 56`: re-reading `src/composition-root.ts:518`–`:636` member by
   member at this cutoff yields 57 members, and the file has not changed since 2026-08-04, before
   the charter was written. The measure is recorded as written and the true figure is reported
   against it, because a measure quietly restated to match the result is not a measure.
   Registered as `F-S5-3`.
3. **MET.** `getActiveSession()`'s owner predicate is conjoined inside the adapter method, so the
   unscoped statement ceases to exist; `createSession`'s guard is **deleted** from orchestration and
   the rule re-expressed as a schema constraint, which also moves it inside `A-28`'s envelope and
   closes a time-of-check-to-time-of-use race (`F-S5-8`). A third path, `listSessions()`, is found
   and removed with them (`F-S5-4`).
4. **MET.** `SC-S3-12` reaches `holds` against target state form (c) with exactly five enumerated
   assumed changes, answered from a published **enumerated access-path set** of four SQL statements
   closed by the module boundary — the artifact C010 records that nobody owed.
5. **MET.** Ownership key → `NEU-850`'s `OUT-2` via SUB-2's identity rule; port-boundary scoping →
   this outcome; STDIO gate → OUT-7 / SUB-4. **Zero** traced to SUB-13's DDL or any unauthored
   artifact.
6. **MET.** Inside the envelope, under two of the three forms it names. The invalidating outcome did
   not fire; **no amendment is routed to `NEU-895`**. The finding OUT-8 would require on a breach is
   recorded as *checked and not filed* rather than omitted.

**Three things this measure does not claim.** It does not claim any category `holds` on the
deployment as it stands — C010's `F-S5-4` remains true in full and every verdict here is against a
composed target state. It does not claim `CAP-S5-1` is lifted; the cap is **discharged** and its
landing condition is stated. It does not claim any implementation, test run or production
observation: no file under `src/` or `drizzle/` changes, no test file is written, and no quantity in
the chapter is observed in production.

**Authored by.** SUB-5 (NEU-997).

---

### SUB-6

## OUT-2 — Migration of the existing global rows: what happens to every unowned row currently in production

**Outcome.** Every one of the **14** production tables — 10 `public`, 2 Drizzle-defined
`infrastructure`, and both raw-SQL log tables — carries a stated, individually justified migration
disposition, drawn from a five-value vocabulary and assigned by a three-way partition on *what
evidence can attribute the table's rows*. The pre-cutover log population, which erasure cannot reach
(`F-S8-2`) and confinement hides from everyone
(`05_the-enforcement-point-that-confines-every-read-and-write.md:624`–`:629`), is **archived** —
closed at the cutover instant and moved out of the confined surface, deleted by nothing — which
resolves both failure directions without contradicting SUB-16's finding that attribution can never
be backfilled onto those rows. The migration is **staged**, forced by `F-S5-10` rather than chosen,
in five stages: three fully reversible, one reversible in its rows but not in its effects, and one
irreversible that destroys only rows a consumed C010 decision has already voided.

**Success measure.** OUT-2 is done when: (1) zero of the 14 tables are unaddressed and each
disposition carries a per-table justification, with any unjustifiable table reported as a finding
with a named owner; (2) the C010 45-category cross-check reports unmatched counts in **both**
directions; (3) the backfill target subject is confirmed against a real production token, never
inferred from the `sub || azp` fallback; (4) the aggregate query set is published with an explicit
probe for each of the five named dirty-data pathology classes per table, and a pathology class with
no writable probe is reported as a finding; (5) a generation record ties every synthetic
distribution to its aggregate and a no-copied-rows audit confirms the dataset holds no row copied
out of production, with the dataset recorded as excluded from the sixth copy class on SUB-3's
derivation test at position 3; (6) the dry-run claims every row of the generated dataset or surfaces
it as a finding, with production counts never conflated with generated counts; (7) every stage
states what is lost on reversal and what cannot be recovered at all; and (8) the unprobed-pathology
residual is carried in the risk register with an owner, a pre-flight probe re-run and an abort
condition.

**Verified by.** `06_the-disposition-of-every-unowned-row.md` §§0–16;
`decision-records/DR-C11-S6-1_the-migration-disposition-scheme.md`;
`decision-records/DR-C11-S6-2_archiving-the-pre-cutover-log-population.md`;
`decision-records/DR-C11-S6-3_aggregate-then-generate-and-the-exclusion-evidence.md`;
`traceability/S6_the-disposition-of-unowned-rows.md`.

**Measured result at revision 1.** **Twenty-one of twenty-five traced claims MET; four NOT MET, and
all four fail for one reason.**

1. **MET.** 14 tables addressed, zero unaddressed, each with a justification derived from its own
   schema facts rather than a uniform rule. The conditional finding — a table for which no
   disposition can be justified — was checked against all 14 and **none was found**, so it is
   recorded as *checked and not filed* rather than omitted.
2. **MET.** The C010 cross-check reports **0 unmatched in both directions**: 17 persisted
   `SC-S3-*` categories all map to a disposition, and all 14 tables map to a category, reconciled by
   the arithmetic 14 + 2 + 1 = 17. Both zeros are **derived from a stated walk**, and they inherit
   C010's own six falsifiers, which this sub-task did not re-derive.
3. **NOT MET.** The target-subject verification procedure is published as V1–V7 and made a hard
   entry condition on the backfill stage, but **it was not performed** — no `SMOKE_PROD_*`,
   `AUTH_*` or `DATABASE_URL` exists in this environment. No target-subject value is proposed
   anywhere, because an inferred target is the failure mode rather than a weaker form of success.
   `SPK-S6-1`.
4. **MET on publication, NOT MET on execution, and the two are reported separately.** Twelve probes across all five named pathology classes are published — **8 carrying executable
   SQL, 4 structural foreclosures with nothing to run** — each with a structural-possibility
   analysis per table — including the finding that `notes.target_id` is the
   only orphan surface in the schema and that the SM-2 columns carry no `CHECK` at all. **None was
   executed**; every result cell reads *not executed — no credential* and **no cell reads `0`**.
   `SPK-S6-2`. The pathology class with no writable probe is reported as `F-S6-2`.
5. **MET.** The generation record enumerates the generator's five inputs exhaustively and maps each
   synthetic distribution to the aggregate that drives it. The no-copied-rows audit is performed as
   an **input-closure argument** — no input has row type, therefore no output can contain a copied
   row — which holds over *every* dataset the generator can emit rather than the one an empirical
   diff would sample, and whose falsifier is stated. The exclusion SUB-3 recorded at position 3 is
   thereby **evidenced**, and no owner, retention bound or destruction condition is set.
6. **NOT MET.** The dataset was not generated, because three of its five inputs are the unexecuted
   aggregates, so **no unclaimed-row count is reported.** `OI-S6-2`. The rule that production counts
   and generated counts are never the same number is stated, and both sets are recorded as empty
   for different reasons.
7. **MET.** Five stages, each with its reversal position. S3, S4 and S5 are fully reversible with nothing
   lost; S1 is reversible in its rows but **not** in its effects (the under-reported aggregate
   window and the timestamp-separability of the two populations do not come back); S2 is the only
   irreversible one and destroys only `context_tokens` rows already void under `DR-C10-S8-2`. S4's reversibility is a consequence of the same uniformity that makes
   its premise risky.
8. **MET.** `R9` is authored with its severity, mitigation, named owner, escalation route to
   `NEU-896`, pre-flight probe re-run and abort condition.

**What this measure does not claim.** It does not claim any production quantity: no row count, no
population size, no probe result, and `observed-in-production` is used **zero** times. It does not
claim the target subject is correct — only that the backfill cannot proceed without confirming it.
It does not claim `F-S8-2` is discharged; that finding remains blocking and remains SUB-9's, and
this sub-task decides only where the rows live, never what a data right does to them. It does not
claim `A-S6-1`, the single-principal premise ten of the fourteen dispositions rest on, is true —
`F-S6-2` records that no aggregate can settle it. And it claims no implementation: no file under
`src/` or `drizzle/` changes, no DDL is authored, and nothing is applied.

**Authored by.** SUB-6 (NEU-1000).

---

### SUB-7

## OUT-3 — Staged rollout: the ordered sequence by which isolation reaches production without breaking it

**Outcome.** Four predecessors each hand forward a **partial** order over rollout stages and none
owns the global order. This outcome composes them into **one total order of ten stages, `T0` …
`T9`**, each carrying an entry condition, an exit condition, a measurable isolation signal, a health
signal and a named owner. C010 §4.3's `I4`→`I5` consequence is honoured with margin: the
principal-kind work is at `T4`, position 5 of 10, it is an **observe-only** stage that reveals the
`sub`/`azp` defect without refusing anything, and it sits **before `T5`, the only irreversible stage
in the sequence**. Each stage additionally carries a **deploy-independent disable path** — an
operator-set environment variable on the off-repo compose stack, following the in-repository
`CLASSIFIER_ENABLE` precedent — or an explicit named exception with a reason and an owner.

**Success measure.** OUT-3 is done when: (1) one total order exists and is audited row-by-row against
every partial order its predecessors hand forward, with the audit reported as a count; (2) the
transport gate is not last and the position of the principal-kind work relative to the first
irreversible stage is stated explicitly; (3) every stage carries all five required fields with zero
omissions; (4) every stage carries a disable path with its control surface, operator, observability
resolved against SUB-16's matrix and behaviour in each position, **or** a named exception with a
reason and an owner, with **zero blanks**; (5) each stage's feasibility under auto-deploy and
auto-migrate is assessed, and any stage that cannot be executed as written is reported as a finding
with a named owner; and (6) both of `F-S5-12`'s causes are sequenced around **independently**, with
the scenarios each actually breaks established by reading the suite rather than assumed.

**Verified by.** `07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §§0–13;
`decision-records/DR-C11-S7-1_the-rollout-stage-order.md`;
`decision-records/DR-C11-S7-2_the-deploy-independent-disable-path.md`;
`traceability/S7_the-rollout-sequence.md`.

**Measured result at revision 1.** **Six of six measure clauses MET.**

1. **MET.** Twelve constraints (`K1` … `K12`) are enumerated with their sources at §2 and audited one by
   one at §4. **Twelve of twelve satisfied**, reported as a table rather than asserted. **Two of the
   twelve were added after an independent adversarial pass**, and the measure records that rather
   than presenting the set as complete from the start: `K11` (SUB-2's identity change lands before
   the first stage that reads a determined kind) was **missed entirely** by the first draft, which
   presupposed a determined kind at three stages without staging the change that produces it; and
   `K12` was split out of `K9` because `K9`'s cited source does not contain the irreversibility
   clause that had been attributed to it.
2. **MET.** The transport gate is at `T4` and `T6`, with three substantive stages after it. The
   principal-kind work is at `T4`; the only irreversible stage is `T5`. The relationship is stated as
   a positional fact, not as a reassurance.
3. **MET.** Ten stages, five fields each, zero omissions (§6).
4. **MET.** Six stages carry a real control; four carry a named exception with a reason and an owner
   (`T0`, `T2` in part, `T5`, `T9`). **Zero blanks.** Two qualifications are registered rather than
   buried — every "off" position costs a restart that re-runs the migrator (`F-S7-2`), and `T8`'s
   "off" position is today's unconfined behaviour rather than a safe resting place.
5. **MET.** §7 assesses all ten. The qualification that **no** stage can be executed at a chosen
   moment is reported as `F-S7-5` rather than written around.
6. **MET.** §5 sequences the two causes six and eight stages after `T0` respectively, and establishes
   by reading the suite that **exactly two of its eight scenarios break, and both break twice** —
   `init_agent_context` survives because `ContextTokenRepository` is deliberately unscoped
   (`05_the-enforcement-point-that-confines-every-read-and-write.md:338`).

**What this measure does not claim.** It does not claim any stage fits `OBJ-8` — two of the ten have
unbounded duration because the row counts were never taken (`OI-S6-1`), and that conflict is
`R-S6-2`'s, cited rather than re-raised. It does not claim any signal reaches anybody: every alert
route is `[unconfirmed]` under `A-S16-1`, so every observability cell describes a computation, not a
notification. It does not claim the disable paths exist — they are named with a cited precedent and
built by SUB-13. It does not choose `T0`'s route (`OI-S7-1`). And it claims no implementation: zero
files under `src/` or `drizzle/` change.

**Authored by.** SUB-7 (NEU-1001).

---

## OUT-4 — Rollback: how each stage is reversed, and what is unreversible

**Outcome.** Every one of the ten stages carries a rollback trigger, an action, a time bound, a named
owner and an explicit **data-loss position** stating what cannot be recovered at all. **One stage —
`T5`, the `context_tokens` purge — is named irreversible rather than given a nominal rollback.**
Containment and full reversal are recorded **separately**: for every stage the disable position
states which behaviour stops, which persisted state remains, and whether the next stage can still be
entered from it. Time bounds are expressed in restarts and operator actions rather than seconds,
because no duration on this platform has been measured and inventing one would be the failure mode
`A-S16-1` exists to prevent.

**Success measure.** OUT-4 is done when: (1) every stage carries a trigger, an action, a time bound,
an owner and a data-loss position, **or** is named irreversible; (2) an audit confirms **no** rollback
action depends on a capability the deployment is not established to have — an image registry, an IaC
revert, a schema down-migration or a backup — with the backups question cited to its single record
and no second record raised; (3) containment and reversal are exercised separately per stage, with
the residual state and the next-stage-enterable answer both stated; (4) where a stage's only reversal
is a deploy, that is recorded as the finding it is rather than written as a rollback; and (5) the
availability cost of the sequence is stated against `OBJ-8` rather than left as an unpriced
consequence.

**Verified by.** `07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §§7–10;
`decision-records/DR-C11-S7-2_the-deploy-independent-disable-path.md`;
`traceability/S7_the-rollout-sequence.md`.

**Measured result at revision 1.** **Five of five measure clauses MET.**

1. **MET.** Ten stages in the §9 tabletop. Nine carry a real reversal with all five fields; `T5` is
   named irreversible and its data-loss position states that every `context_tokens` row is destroyed
   and that the loss is *entailed by* `DR-C10-S8-2` rather than caused here — which bounds it without
   softening it.
2. **MET.** **Zero** rollback actions depend on any of the four absent capabilities. This is forced
   rather than achieved: SUB-15's tabletop found four of six recovery rows resolve to a capability the
   platform is not established to have, and `OBJ-13`/`OBJ-14` are unset under `F-S15-1`. The backups
   fact is cited as **`OI-S1-8`** and **no second record is raised anywhere in this sub-task's
   artifacts**.
3. **MET.** §10.1 gives a per-stage containment table. **Three stages cannot be entered from their
   predecessor's disable position** — `T5`, `T8`, `T9` — and each is explained as a designed property
   rather than reported as a gap.
4. **MET.** `T0`, `T3` and `T9` reverse only by shipping something through the pipeline; recorded as
   part of `F-S7-5`.
5. **MET.** §10.2 derives that the per-restart allowance is the daily budget divided by the day's
   *total* restarts, so every stage landing on a given day tightens the allowance for every restart
   that day — ≤ 13.1 s at baseline, ≤ 11.4 s with one stage, ≤ 5.2 s with all ten. The conclusion that
   **at most one stage per day** keeps the allowance near the published figure is a derivation from
   `OBJ-8`'s own arithmetic, independent of `R-S6-2`'s batching argument.

**What this measure does not claim.** It does not claim any reversal has been exercised — none has,
and no production credential exists to exercise one. It does not claim a numeric time bound for any
stage; every bound is in restarts and operator actions. It does not set an RPO or RTO — `OBJ-13` and
`OBJ-14` remain unset under SUB-15's blocking finding. It does not claim the sequence fits inside
`OBJ-8`; it states what the budget allows and names the two stages whose duration is unbounded.

**Authored by.** SUB-7 (NEU-1001).
### SUB-11

*`NEU-1004`, covering `OUT-16`. One row. The success measure is authored here, not derived at
assembly (charter assumption 47).*

## OUT-16 — A backward-compatibility contract for existing standalone MCP clients, over a surface this package re-counts rather than inherits

**Outcome.** The contract is published as
`11_the-client-compatibility-contract.md`. It states, for each of the **seven changes** this
package's mechanism implies (`CH-1` … `CH-7`), a compatibility obligation, a breaking / non-breaking
verdict and a detection method; it separates the **semantics-without-schema-shape** class and gives
it a detection method a schema diff cannot express; it checks every change on **both** transports
and names the one genuine divergence with its owner; it runs a DP-specificity review; it keeps the
3 gate-exempt tools a separately stated decision; and it bounds the guarantee by the four things the
enforcement point does not confine. The surface is **re-counted at this sub-task's own cutoff**
(`35f92ba`, 2026-08-25, on a branch cut from `origin/develop` containing C010) and reconciled
against C010's `F-S5-3`.

**Success measure.** Seven limbs, each independently checkable:

1. **The three surface figures are re-derived from `src/`, not inherited**, by a derivation published
   as commands and per-module tables so a reader can re-run it — and reconciled against `F-S5-3`
   with the result stated either way.
2. **`42` appears nowhere in the chapter as a codebase fact**, and any `file:line` citation resolving
   to a line 42 is disclosed rather than denied.
3. **7/7 implied changes carry all three of** an obligation, a breaking verdict and a detection
   method; zero carry two of three.
4. **At least one semantics-only change is named and given a non-schema-diff detection method**, with
   the reason a schema diff returns empty stated rather than asserted.
5. **7/7 implied changes carry a two-transport verdict**, with every divergence named and owned.
6. **The DP-specificity review runs over the re-counted surface and returns a stated verdict** — a
   clean result reported as clean, a breach reported as a finding rather than absorbed.
7. **`F-S4-4`'s unpriced cost is priced** in units re-derived from the tree, with the consequence for
   each of SUB-4's seven paths stated.

**Verified by.** `11_the-client-compatibility-contract.md` §§1–15;
`decision-records/DR-C11-S11-1_the-client-compatibility-contract.md`;
`traceability/S11_the-client-compatibility-contract.md`.

**Measured result at revision 1.** **Seven of seven limbs MET.**

1. **MET.** 46 registered (§1.1, 16-module table), 3 exempt (§1.2, derived **twice** — by empty
   schema and by the middleware's `EXCLUDED_TOOLS` — with the two derivations agreeing), 43 gated
   (§1.3, derived as a **module-by-module mapping** rather than as `46 − 3`, and balancing in both
   directions). Reconciled against `F-S5-3` at §1.4 and agreeing **to the 41 / 1 / 1 granularity of
   where the declarations live**, not merely on the three headline numbers. No finding routed to
   `NEU-895`.
2. **MET, and it was not met on the first draft.** §1.6 now carries **two** disclosures. One
   citation resolves to a line 42 — `src/infrastructure/db/client.ts:42`, the pool's `max: 4`, cited
   in §4 and §8. And one genuine re-derived quantity *totals* 42 — the named `*InputShape`
   declarations — so §1.4's reconciliation row is written as **`41 + 1`** and the total is
   deliberately not stated. **The first draft failed this limb while certifying it met:** §1.4
   carried a bare `42` in a column headed *"Re-derived here"*. An adversarial pass caught it before
   the PR opened. The limb is recorded as met **with the near-miss disclosed**, because the measure
   is about a numeral not entering the package and the honest report of how close it came is worth
   more than a clean line. The precedent for disclosing rather than asserting an absence is
   `08_consent-and-what-a-learner-can-export-and-erase.md` **§11**, which records the same
   correction against its own earlier revision.
3. **MET.** §4, seven rows, three columns each.
4. **MET.** §4.1. Three of the seven changes (`CH-2`, `CH-5`, `CH-6`) alter semantics with **zero**
   schema-shape delta, and the section states *why* the obvious check returns empty: all 46 names
   and all 43 gated schemas are unchanged, because `context_token` was already required on every
   gated tool. Four behavioural probes (`P1` … `P4`) are specified, two of them in the negative form
   the failure mode requires.
5. **MET.** §5. Six of seven hold on both transports unconditionally; `CH-1` converges in outcome and
   diverges in cost, owned by `SUB-10 of C010 (NEU-984)`. **One genuine divergence — audit parity —
   is named with SUB-16 as its owner** and is explicitly *not* one of the seven changes.
6. **MET, and it did not return clean.** §9. The review over `CH-1` … `CH-7` returns **zero**
   course-specific concepts introduced by this package. Run over the surface those changes land on,
   it found a **pre-existing** breach: `GradingPayloadShape` hard-codes four dynamic-programming
   criterion keys into two core input schemas and one response payload, reaching 3 of the 46 tools.
   Reported as `F-S11-2` with `R-S11-1`, not absorbed into prose.
7. **MET.** §6. Priced in re-derived units (seven pipeline layers, four Express-typed factories over
   480 lines, three inline blocks, a five-line STDIO limb), forked on the **option A / option B**
   question that actually sizes it, and expressed as **three delivery tiers** whose effect on each of
   SUB-4's seven paths is tabulated. The principal result — that an unpaid extraction does not
   preserve the seven paths but silently re-classifies three of them — is `F-S11-4`.

**Four things this measure does not claim.** It does not claim any existing client was observed —
none was, no production credential exists here, and the client population's size and composition are
unknown (`CAP-S11-1`). It does not claim the behavioural conformance suite of §4.1 exists; four
probes are specified and none is written. It does not claim the extraction is affordable — §6 prices
what the cost is a cost *of*, and offers no hours. It does not claim the DP rubric is fixed; §9
finds and scopes it, and the remedy is a `src/` change this sub-task may not make.

**Authored by.** SUB-11 (NEU-1004).

---

### SUB-9

## OUT-12 — Propagation and completion proof across all six copy classes, with no unowned copy

**Outcome.** For consent withdrawal, export and erasure alike, each of the **six** copy classes —
MCP-owned state, web-owned state (browser-side only under `M-A`), backups, operational logs, audit
logs, and this package's own captured production evidence — carries an explicit propagation action,
a completion deadline, a permitted retention exception, a learner-visible result and an auditable
proof. The copy set is closed by an argument with a stated falsifier rather than by a survey, and
the one copy location no class claims is reported as a finding with an owner rather than absorbed.

**Success measure.** OUT-12 is judged done when all eight hold:

1. A six-column × three-duty matrix exists in which **every** cell carries all five elements, and
   **zero** cells read "unknown" without a named owner and a date.
2. Every column heading resolves to a **defined class** rather than an inherited label — in
   particular `web-owned state`, resolved to browser-side device state with the server-side
   sub-class recorded empty-by-decision under `M-A` and cited to `DR-C10-S6-1`.
3. The sixth column carries the owner, retention bound and destruction condition **SUB-1 recorded at
   position 1**, with that origin named, and any *"destroy on schedule"* action is stated with its
   reasoning rather than assumed.
4. Each candidate package-internal copy is admitted or excluded **on its derivation**, with the
   answer written down; SUB-6's synthetic dry-run dataset is recorded as excluded and **no term is
   set for it here**.
5. The backups column is resolved by **citation to `OI-S1-8`** with that item's named owner carried
   across, and **zero** backups records are raised here.
6. The unowned-copy audit runs mechanically over **SUB-3's inventory plus `LD-S8-1`**, reports a
   count, includes the package's own copies, and reports every unowned copy and every unresolvable
   cell as a finding with a named owner.
7. The completion-proof design conforms to SUB-16's published signal contract **field by field**,
   with the match asserted here because SUB-16 declined to assert it.
8. `CAP-S3-3`, `CAP-S4-1`, `CAP-S7-1`, `CAP-S5-1` and `OI-S5-1` each carry an explicit recorded
   disposition with its actual owner named.

**Verified by.** `09_proving-a-data-right-reaches-every-copy.md` §3 (the six defined classes), §4
(the write-path closure argument and its falsifier), §5 (the membership test), §6 (the pre-cutover
disposition), §7 (the matrix), §8 (the audit), §9 (what the proof does not cover), §10 (the
dispositions); `decision-records/DR-C11-S9-1`, `DR-C11-S9-2`, `DR-C11-S9-3`;
`traceability/S9_propagation-and-completion-proof.md`.

**Measured result at revision 1.**

1. **MET.** **18 (class, duty) pairs presented as 17 rows** across three duty tables (§7.1–§7.3),
   each carrying all five elements — C4 and C5 share one row under consent withdrawal, a
   presentational merge only, since each class still emits its own completion-proof row. The row
   count is stated so a reader recounting the tables gets the same number. Zero cells read
   "unknown". Three C3 cells are flagged **unresolved-with-owner-and-date**, which is the state
   OUT-12 explicitly permits — the owner and the resolving event are carried from `OI-S1-8`, not
   invented here.
2. **MET.** §3.1. `web-owned state` resolved to browser-side device state; the server-side sub-class
   recorded empty-by-decision under `M-A`, cited to `DR-C10-S6-1`.
3. **MET.** §7.4. All five terms read from `01_production-evidence-and-the-access-audit.md:151`–`:159`
   with the origin named; "destroy on schedule" reasoned from the retention bound's unconditional
   expiry at publication, and explicitly **not** claimed to replace erase-on-request in the
   pre-publication window.
4. **MET.** §5 — five candidates tested on derivation. §5.1 states the dry-run exclusion and sets no
   term, and **adds the exclusion's own falsifier**, which SUB-6 did not state.
5. **MET.** §10. `OI-S1-8` cited by id with its owner carried; a grep of this chapter confirms zero
   second records of the backups fact.
6. **MET.** §8 — 33 categories audited, 0 with no propagation owner, **2** copy locations surfaced
   that no class claims, reported as `F-S9-1` (external-provider egress) and `F-S9-5` (the stderr
   log sink that mirrors both log tables) with named owners. Zero revisions raised against SUB-3's
   inventory.
7. **MET.** `DR-C11-S9-3` — 9/9 fields, 3/3 location properties, the timing rule and 6/6 negative
   clauses walked individually.
8. **MET.** §10, all five, including the qualification that C010's `CAP-S4-1` and C011's own
   `CAP-S4-1` are different caps sharing an id.

**What this measure does not claim.** It does not claim the copy set is complete over copies that
*exist* — only over copies **this deployment creates**, with two named exceptions: the
external-provider egress (`F-S9-1`) and the stderr log sink (`F-S9-5`). **It specifically does not
claim that executing every action in the matrix erases a learner's free text**, because `F-S9-5`
establishes that a copy survives on stderr that no cell of the matrix addresses. It does not claim any disposal has been executed: `F-S8-2` is downgraded
to resolved on its own stated resolving event, which is the **publication of a disposition**, and
the execution is carried as `R-S9-1` with an owner outside this package. It does not claim any
production fact — no row count, no population size, no backup fact, and `observed-in-production`
used **zero** times. It does not claim a running completion-proof store exists; `propagation_proof`
is a specification. And it claims no implementation: no file under `src/` or `drizzle/` changes, no
DDL is authored, and nothing is applied.

**Authored by.** SUB-9 (NEU-1003).

---

### SUB-12

## OUT-17 — A security, privacy, ownership and data-lifecycle threat model, resolved into measurable production gates with owners

**Outcome.** Threats are enumerated across every MCP and prospective general-web-API read, write,
session, retrieval, context-token, analytics, migration and **operator** path — **56 paths across eleven
classes (A–K)** — and each carries an explicit isolation or lifecycle invariant. **No cross-learner access
is left to convention, and zero paths lack an invariant.** Operator access is **modelled, not
exempted**: twelve operator paths, including direct `psql`, SSH to the single VPS. Every critical
gap resolves to a measurable control with a named owner and a threshold — **26 gates** — and the two
gaps for which no measurable control exists are recorded as **blocking findings with owners** rather
than accepted. The model covers the prospective general web API at the boundary C010's
`../C010-system-and-repository-architecture/11_web-api-scope-and-resource-inventory.md` fixed,
consuming it and re-deciding nothing.

**Resolving evidence.**

| Acceptance condition | Where it is discharged |
| --- | --- |
| Path-by-path invariant matrix, zero paths lacking an invariant | `12_threat-model-and-the-gates-that-authorize-implementation.md` §4–§6; the count is §9.2 — **56 of 56** |
| Adversarial review of the operator path specifically | §5 — twelve paths (`TP-S12-35` … `TP-S12-43`, `TP-S12-54` … `TP-S12-56`), each with an invariant and an owner; §5.1's `F-S12-4`; §5.2's scope statement |
| Gate register: control, threshold, owner and evidence source per critical gap | §8 — 22 rows, four populated columns each, plus a provenance label and a transport column |
| A gap without a measurable control recorded as a blocking finding | §8.1 — `F-S12-5`, `F-S12-6` |
| Cross-check: every gate to a threat and every critical threat to a gate, as counts in both directions | §9.1 (**26 of 26**) and §9.2 (**42 gap paths: 38 + 2 + 1 + 1, zero unrouted**) |
| The amendment to `DR-C10-S5-1`, in a form the inherited-universe risk record consumes, naming SUB-17 | §10; `decision-records/DR-C11-S12-2_the-unconfined-aggregate-as-a-control-input.md` |
| Decision records with rejected alternatives | `DR-C11-S12-1` (5 rejected), `DR-C11-S12-2` (5 rejected), `DR-C11-S12-3` (4 rejected) |
| Traceability | `traceability/S12_threat-model-and-gates.md` |

**Success measure — the measure by which OUT-17 was judged done.** Authored here, not derived, and
stated as four numbers plus one event, each mechanically checkable by a reader holding only the
published package:

1. **Paths lacking an invariant: 0**, out of 56 enumerated. *(Met.)*
2. **Operator paths modelled: 12, exempted: 0.** *(Met.)* Before this chapter the count of modelled
   operator paths was zero, in both packages.
3. **Critical gaps with all four of a control, a threshold, an owner and an evidence source: 26.**
   Gaps with none, recorded as blocking findings with owners: **2**. Gaps resolving to nothing: **0**.
   *(Met.)*
4. **The cross-check closes in both directions**, with the arithmetic shown rather than asserted:
   14 + 42 = 56 and 38 + 2 + 1 + 1 = 42. *(Met.)*
5. **The amendment route fired at least once.** *(Met — once, `DR-C11-S12-2`, under trigger 3.)*
   This is the event rather than a number, and it is the measure that matters most: eleven merged
   chapters each recorded *"no amendment routed"*, which is the kind of unbroken run that begins to
   read as evidence that the check does not fire.

**What the success measure deliberately does not include.** It sets **no threshold on the number of
gaps found**, because a threat model that found fewer gaps would not thereby be better, and a target
would create a reason to under-report. It also **claims no movement on C010's `F-S5-4` census** —
0 of 45 categories reach `holds`, unchanged, and §12 says so.

**What this outcome does not claim.** It claims no production fact: no threshold in the gate register
is a measurement, no gate is implemented, and `observed-in-production` is used **zero** times. It
does not claim the ingress set is closed in fact — `F-S12-5` records the one shape no reading of this
repository can close. It does not claim any modelled threat has occurred, in particular that
`F-S12-1` has ever been exercised (`SPK-S12-3`, not executed) or that the operator has performed any
of §5's twelve paths. It does not claim `NEU-895` will accept the routed amendment. And it claims no
implementation: no file under `src/` or `drizzle/` changes, no DDL is authored, and nothing is
applied.

**Authored by.** SUB-12 (NEU-1005).

### SUB-13

## OUT-19 — The DDL, the migration plan and the rollout/rollback runbook, at executable fidelity, applied nowhere

**Outcome.** Concrete schema DDL, a migration plan for the existing global rows, and a
rollout/rollback runbook exist at a fidelity an implementer executes without asking a question, and
without re-deciding anything SUB-2, SUB-4, SUB-5, SUB-6 or SUB-7 settled. Every consumed constraint
names its source; every divergence found against an upstream decision is a routed finding rather
than a silent edit; and **nothing is applied** — zero files under `src/`, `drizzle/` or any
deployment configuration change.

**Success measure.** OUT-19 is judged done when all seven hold:

1. The DDL is complete `CREATE`/`ALTER` text for every schema object the package requires, and
   **all three principal states** are representable.
2. `NEU-850`'s `OUT-2` is cited by the DDL at a resolving path, and SUB-5's `holds` derivation is
   re-verified against the DDL as written, with any divergence routed to SUB-5.
3. The migration plan's sweeps are **batched, idempotent and resumable**, and their batch bound is
   derivable **without** the row counts `OI-S6-1` records as never taken.
4. Every pre-flight predicate limb is independently re-verified against the codebase at this
   chapter's cutoff, with `file:line` evidence stated.
5. Every stage `T0`–`T9` carries a containment section with SUB-7's disable path — control surface,
   operator, observable state, behaviour per position — or SUB-7's named exception with its owner,
   presented as separately executable from the reversal. **Zero blanks.**
6. Every duration, batch size and threshold is a cited derivation, a registered stand-in with an
   owner and a re-validation trigger, or a deferred spike. **No invented number.**
7. The repository audit proves zero changes to `src/`, `drizzle/` and every deployment configuration
   file.

**Verified by.** `13_the-ddl-the-migration-plan-and-the-runbook.md` §1 (the schema re-read), §2 (the
DDL), §3 (the migration plan), §4 (the runbook), §5 (the control surface), §6 (what it does not
establish); `decision-records/DR-C11-S13-1`, `DR-C11-S13-2`, `DR-C11-S13-3`;
`traceability/S13_the-ddl-the-migration-plan-and-the-runbook.md`;
`97_package-completeness-gate.md` § SUB-13.

**Measured result at revision 1.**

1. **MET.** §2 — the ownership key on ten tables with their indexes, both attribution carriers with
   six `CHECK` constraints, the partial unique index, the consent table and the RLS appendix. The
   three states are `user`, `client` and `none`, kept distinct on the log carrier; the token carrier
   takes two, because `none` is unreachable there by construction, and the two `CHECK`s are
   consistent rather than contradictory. `F-S5-6` discharged.
2. **MET, with one divergence routed.** §2.1 quotes `OUT-2` from
   `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53`;
   §2.6 walks `DR-C11-S5-2`'s `C1` and `C5` requirement by requirement and finds **no divergence on
   `notes`**. Four divergences are found elsewhere — `session_chunks` and the three
   `session_questions` children — and are routed to SUB-5 as `F-S13-1`, not absorbed.
3. **MET.** `DR-C11-S13-2`. The resume cursor is the sweep's own target predicate, so resumability
   needs no ledger; the batch is bounded by a **wall clock**, which is self-limiting whatever the
   table holds. **`CAP-S7-1` is not lifted** — total completion still scales with the unknown count,
   and that residual is carried as `R-S13-1` rather than presented as closed.
4. **MET.** §3.7 — all five limbs re-verified at `fd05ca1`, every one of SUB-7's forwarded line
   numbers found exact, and the predicate forwarded **unchanged**. The `operation_event_log` probe
   `F-S6-6` names as missing is written; the other six unprobed tables are named so the residual is
   visible.
5. **MET.** §4.1 and §5 — ten stages, six control variables (four toggles, two numeric sweep
   parameters) with defaults and per-control safe positions,
   four named exceptions with reasons and owners, zero blanks. `DR-C11-S7-2`'s revision trigger
   fires.
6. **MET.** Two numbers are introduced and both are registered stand-ins (`A-S13-1`), argued for
   their **shape** and not their value, with `SPK-S6-2` or `SPK-S15-1` as the re-validation trigger.
   No new spike duplicates an existing one; the single new spike, `SPK-S13-1`, asks a question no
   existing entry asks.
7. **MET.** `git diff --name-only origin/develop` read path by path: zero under `src/`, zero under
   `drizzle/`, zero under `.github/`, and `docker-compose.yml` unmodified.

**What this measure does not claim.** It does not claim anything in the chapter **works**. No SQL
statement has been executed against any database, no migration applied, no stage walked, no reversal
exercised and no control built — there is no production credential (`F-S1-2`) and the four
repository gates that were run are evidence that the repository still builds, not evidence about any
SQL in the chapter. It does not claim any stage fits `OBJ-8` (`CAP-S7-1`, unchanged; `CAP-S13-1`). It
does not claim the RLS appendix is adoptable — it is published with two unmet preconditions
(`OI-S5-1`, and the role question `F-S13-2` raises). It does not resolve `F-S9-6`: the chapter writes
**no retention statement of any kind**, precisely so it cannot override an audited retention period
by accident. It does not lift `CAP-S5-1`. It claims **no** production fact — no row count, no
population size, no probe result — and `observed-in-production` is used **zero** times.

**Authored by.** SUB-13 (NEU-1006).

---

### SUB-17

## OUT-20 — The package ships in house style, standalone and cold-readable, with its split fidelity and its `NEU-896` boundary both stated

**Outcome.** The package is published under tracked
`docs/research/C011-safe-production-integration-and-learner-isolation/` in the delivered house style —
a README, fifteen numbered topic documents, 37 decision records with rejected alternatives, 14
traceability files, and the reserved `90`–`99` band carrying all eight registers plus this audit set.
Its split fidelity against `DR-C10-S5-2` is stated as counts, its `NEU-896` boundary is stated as a
seam, and a reader with no access to the gitignored `_local/` or `docs/wf-plans/` trees can reconstruct
every decision, its evidence and its rejected alternatives from the package alone.

**OUT-20 is carried by two sub-tasks.** SUB-14 (NEU-1007) assembled and published the body at position
15 and authored no register content. SUB-17 (NEU-1008) audits it at position 16 and authors this row,
the four OUT-20-owned risk entries, and the audit set. **This row is SUB-17's**, which is why the
20/20 count below is reachable here and was not at position 15.

**Success measure.** OUT-20 is judged done when all nine hold:

1. The package is published in house style in the reserved band, with all eight registers present and
   none dropped as decorative.
2. **Band completeness:** every finding, cap, open item, stand-in, outcome and risk appears in exactly
   one register, and any id in more than one carries the same owner and status in each.
3. **The findings-register enumeration** is reported as two counts in both directions over the
   outcomes the charter names as finding producers.
4. **The risk-register audit:** every entry carries a severity, a mitigation, a named owner and an
   escalation route; each names its **authoring** sub-task rather than its aggregator; and all fifteen
   charter § Risks rows are covered by their named authors.
5. **The outcome-register audit:** every `OUT-n` row carries its resolving evidence and its success
   measure, recorded by the producing sub-task, with **zero** measures authored at assembly — reported
   as **20/20**.
6. **The split-fidelity audit:** 8/8 List B answered, 0 List A claimed, and every touched C010 residual
   id in exactly one of four classes with its actual C010 owner named.
7. **The citation audit:** every codebase claim resolves to a real path at a stated cutoff, every
   upstream claim carries a version or date, and **42 appears nowhere as a codebase fact**.
8. **The inherited-universe risk** is published as a risk-register entry with its owner, its escalation
   owner, its amendment route and **whether it fired**, alongside the other three OUT-20-owned entries.
9. **An independent cold read** confirms the package is reconstructable from itself alone, with every
   gap routed to an owning sub-task.

**Verified by.** `98_audit-record.md` (all six audits and the declared exit state);
`97_package-completeness-gate.md` § SUB-17 (21 gate rows); `92_risk-register.md` § SUB-17 (`R5`, `R6`,
`R7`, `R15`); `91_findings-register.md` § SUB-17 (`F-S17-1` … `F-S17-21`);
`94_caps-and-incomplete-scope.md` § SUB-17 (the named residuals);
`00_method-and-provenance.md` (the assembly record this audit ranges over).

**Measured result at revision 1.**

1. **MET.** Eight registers present in the `90`–`99` band plus `98_audit-record.md`. 15 chapters, 37
   decision records, 14 traceability files, a README — one traceability file and at least one decision
   record for **every one of the fourteen** producing sub-tasks.
2. **MET on uniqueness, MET WITH CAP on status.** **406 minted ids, `0` appearing as an entry in more
   than one register** — re-derived mechanically. On owner-and-status: **one divergence**, declared by
   SUB-14 rather than discovered here (`F-S3-3`'s body still reads live; `A-S11-1` carries no discharge
   record) and **confirmed still open**. Carried as `F-S17-13` and as a named residual.
3. **MET. 11 and 11.** Charter assumption 43's eleven outcomes; every named outcome carries the
   requirement in its own text, and every outcome whose text carries it is named.
4. **MET.** **53 entries, `0`** missing any of the four fields, **`0`** authored in a SUB-14 section,
   **15/15** charter rows covered by their named authors, **`0`** routed gaps.
5. **MET. 20/20** — this row is the twentieth. All twenty carry a success measure and a measured
   result; **`0`** authored at assembly. Three outcome rows carry a NOT-MET result, over six limbs in total (OUT-5, OUT-8's limb 2, and
   OUT-2's four), and none was restated to fit its outcome.
6. **MET.** **8/8** List B answered, **0** List A claimed, **26** touched C010 residual ids classified
   — 16 from the charter's enumeration and 10 at assembly under the open-enumeration rule — with **`0`**
   in two classes and **`0`** in none. `DR-C10-S5-2`'s revision trigger did not fire.
7. **MET, with a line-level residual.** The armed gate reports **0 non-resolving** over 78 files, and
   **103 of 103** distinct codebase-path targets resolve. **`42` is asserted as a tool-surface count in
   zero places.** All three checker blind spots were re-derived rather than inherited, and **a fourth
   was found** (`F-S17-17`): the gate resolves paths and never checks line content. Three
   `package.json` line citations are wrong (`F-S17-16`) and four `README.md` line citations are stale
   (`F-S17-17`). **Every codebase *path* resolves, which is the test this measure sets**; the
   line-level defects are registered and named rather than folded in.
8. **MET, and it fired.** `R5` is published with its owner, its escalation owner (`NEU-895`, co-named
   `NEU-896`), its amendment route, and the report that **the route fired** — SUB-12's
   `DR-C11-S12-2`, received here as the named recipient. `R6`, `R7` and `R15` are published alongside
   it with all four fields each.
9. **MET WITH CAP.** The cold read confirms the criterion this measure sets: an implementer **can**
   reconstruct every substantive decision, its evidence and its rejected alternatives from the package
   alone, and all 37 decision records carry a decision, a rationale and reasoned alternatives. Its
   overall verdict is **PARTIAL**, on a different axis — the accuracy of figures the package states
   **about itself**. Seven findings were filed from it (`F-S17-15` … `F-S17-21`); two reconstruction
   gaps it reports were already registered and routed by the package itself (`F-S13-1`, `F-S13-11`).
   **Five of its findings were withdrawn** on re-verification and are recorded as withdrawn rather than
   filed.

**What this measure does not claim.** It does not claim the package is **correct as engineering**. The
audit checks that every claim is supported, registered, routed and reachable — a different and weaker
thing than checking that the DDL is right, the rollout order is safe or the threat set is closed.
It does not claim the package is **complete**: `97_package-completeness-gate.md` § SUB-17 records
**two `not met` rows**, one of which — the absent SUB-7 gate section — no remaining party may fill. It
does not claim the audit's own findings are **resolved**; all twenty-one are routed and none is
repaired, because every predecessor has shipped and this sub-task holds no amend authority. It does not
claim `8/8` proves the split is complete — the universe is C010's and was not re-derived (`R5`). And it
claims **nothing about production**: no credential exists, **33 spikes are designed and zero executed**,
and `observed-in-production` is applied to **zero** claims package-wide.

**Authored by.** SUB-17 (NEU-1008).
