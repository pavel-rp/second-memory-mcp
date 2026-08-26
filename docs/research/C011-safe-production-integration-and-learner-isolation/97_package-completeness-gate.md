# `97` — Package completeness gate

**Charter:** C011 (umbrella NEU-893) · **Opened:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]

**This file is a seed, and its owner is not SUB-1.** The gate is filled by **SUB-17 (NEU-1008)** at
position 16, after **SUB-14 (NEU-1007)** assembles the package at position 15. SUB-1 creates the file
so the eighth register in the reserved band exists from the package's first commit, and records only
**its own rows** below.

Append-only. Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or
rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

## Entry shape

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |

Dispositions: **met** · **met with cap** · **not met** · **not applicable**. A `not met` row names
what is missing, why, and its owner.

---

### SUB-1

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-1` | The package root exists under tracked `docs/research/`, with `decision-records/` and `traceability/` folders and the reserved `90`–`99` band. | **met** | This directory. All eight band files exist: `90_outcome-register.md`, `91_findings-register.md`, `92_risk-register.md`, `93_open-items-and-provisional-register.md`, `94_caps-and-incomplete-scope.md`, `95_stand-in-assumption-register.md`, `96_spike-register.md`, and this file. |
| `G-2` | Every uncertain-and-material production claim resolves to a spike record or an owned open item, with **both counts reported**. | **met** | `96_spike-register.md`: 9 entries. `93_open-items-and-provisional-register.md`: 9 owned open items. Counts reported at `01_production-evidence-and-the-access-audit.md` §4 — **0 closed by observation + 9 routed = 9**. |
| `G-3` | All three principal shapes are represented, each by a named and distinct acquisition method, with **no shape represented by a capture from a different flow**. | **met with cap** | `01_production-evidence-and-the-access-audit.md` §2. Three distinct methods named; all three routed as open items rather than captured. Capped by `CAP-S1-1`. |
| `G-4` | The access audit reports zero mutating operations against the production database, the MCP server and the deployment, and enumerates the single registered exception with its residue. | **met** | `01_production-evidence-and-the-access-audit.md` §3. Zero production operations of any kind; the IdP-token-issuance exception is registered and **not exercised**. |
| `G-5` | Any unregistered mutation is reported as a blocking finding with a named owner in the findings register. | **met** | `91_findings-register.md` § "The standing rule OUT-18 owns". Rule declared; fired **zero** times, because zero operations were performed. |
| `G-6` | The redaction audit reports zero published captures containing token material, a signature, or any secret value. | **met** | `01_production-evidence-and-the-access-audit.md` §5. Zero captures published; satisfied **vacuously**, and stated as vacuous. |
| `G-7` | The backups fact carries exactly one register record with a stable id. | **met** | `OI-S1-8` in `93_open-items-and-provisional-register.md`. Its paired stand-in `A-33` records the assumption resting on it, not a second record of the fact. |
| `G-8` | OUT-18's outcome-register row carries its resolving evidence and its **success measure**. | **met** | `90_outcome-register.md` § OUT-18, with a four-part measure and its measured result. |
| `G-9` | Every residual exposure SUB-1 states carries a risk-register entry with severity, mitigation, named owner and escalation route — including all **three** OUT-18-owned charter § Risks rows. | **met** | `92_risk-register.md`: `R8`, `R13`, `R14`. |
| `G-10` | Every capture carries a named owner, a retention bound and a destruction condition tied to the package's publication. | **met** | `01_production-evidence-and-the-access-audit.md` §6. The sixth copy class's terms are **set** at position 1; its current membership is **empty**, which is recorded as a membership fact and not as an absence of terms. |
| `G-11` | Stand-in entries for charter assumptions 33 and 34 each state the assumption, a named owner and a re-validation trigger. | **met** | `95_stand-in-assumption-register.md`: `A-33`, `A-34`. Neither carries a blank owner or trigger. |
| `G-12` | No file under `src/`, `drizzle/` or any deployment configuration is modified. | **met** | `01_production-evidence-and-the-access-audit.md` §7 — `git diff` against `origin/develop` lists files only under this package directory. |
| `G-13` | The settled tool-surface figure **46 registered / 43 gated / 3 exempt** is used, and the superseded miscount appears nowhere in this package as a codebase fact. | **met** | `01_production-evidence-and-the-access-audit.md` §8, re-derived at cutoff `546ee90` against `src/transport/context-token-middleware.ts`. The superseded figure is referred to by description rather than by numeral, so a grep for it over this package returns zero hits. |
| `G-14` | C010 decisions are consumed with the source cited, and any contradiction is routed to `NEU-895` rather than silently resolved. | **met** | `91_findings-register.md` closing note: the check ran and returned empty. **No amendment routed.** C010 citations appear at `SPK-S1-4`, `SPK-S1-8`, `SPK-S1-9`, `OI-S1-4`, `OI-S1-8`, `OI-S1-9`. |
| `G-15` | The package is registered in the citation-path CI gate. | **not met** | Capped as `CAP-S1-2`; owner **SUB-14 (NEU-1007)**. Deliberately deferred to package closure — gating an incomplete package fails CI for every sub-task landing a partially cross-referenced chapter. |

**SUB-1 rows: 15. Met 13; met with cap 1; not met 1** — the single `not met` naming what is missing,
why, and its owner.

**What SUB-1 does not assert here.** Nothing about band placement, cross-register consistency across
all eight registers, the nineteen-or-twenty-row outcome-register count, the fifteen-row risk-register
count, or the findings register's both-directions enumeration over eleven outcomes. Those are
**SUB-14's** at position 15 and **SUB-17's** at position 16, and every one of them ranges over
artifacts that do not exist yet.

---

### SUB-2

**Id family.** SUB-1 took `G-1` … `G-15` as a flat run. A flat next-free-number scheme cannot be
computed by an author who cannot see the other sub-tasks' entries — the failure
`DR-C11-S1-3` rejected alternative 4 for — and sibling sub-tasks are authoring against this file
concurrently. SUB-2's rows are therefore **`G-S2-<k>`**, scoped to the authoring sub-task exactly as
the other per-sub-task id families are. Fixed in
`decision-records/DR-C11-S2-3_provenance-persistence-and-parallel-safe-id-families.md`; SUB-14
(NEU-1007) may renumber.

**SUB-15 took the opposite view, and the disagreement is recorded rather than glossed.**
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md` consequence 6 declines to write any
gate row at all, on the grounds that this register names SUB-17 as its owner and that SUB-1's rows
are a seed-author exception. SUB-2 writes them because this file carries the shared-register append
convention verbatim — *"Each sub-task appends its own `### SUB-<n>` section"* — and, decisively,
because SUB-2 has an acceptance condition it **cannot meet** (`G-S2-6`). A register row is the
difference between a gap that is reported and one a later audit has to rediscover. **SUB-14
adjudicates**; both sections stand until it does.

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-S2-1` | A mapping from token shape to learner key covers all three principal shapes, and every token yields exactly one defined learner key or one defined rejection, with **no case falling through to the raw `sub \|\| azp` expression**. | **met** | `02_identity-the-learner-key-and-principal-kind.md` §3 — three mutually exclusive, jointly exhaustive conditions over the `(sub, azp)` product; **0** fall-throughs. All three shapes placed in the second table with an explicit evidence status. |
| `G-S2-2` | The **absent**, **changed** and **re-used** claim cases each produce a stated, distinct outcome. | **met** | `02_identity-the-learner-key-and-principal-kind.md` §4 — three cases, three distinct outcomes: no key; no automatic merge; undetectable and carried as `R-S2-1`. |
| `G-S2-3` | Check `I5` is applied to the proposed mechanism and shown to be **evaluable**, with every consumer of the identity value able to distinguish principal kinds or documented as unable to with a named residual owner. | **met** | `02_identity-the-learner-key-and-principal-kind.md` §7 — both limbs have an input; **0** consumers documented as unable, so **0** residual owners named on that clause. Stated as *evaluable, not passing* — `I4` still fails first and masks it. |
| `G-S2-4` | `OI-S5-2` carries an explicit disposition, discharged against its own resolving event. | **met** | `02_identity-the-learner-key-and-principal-kind.md` §8 and `93_open-items-and-provisional-register.md` — **closed**, all four clauses of `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:221` discharged individually. |
| `G-S2-5` | C010's `OI-S1-2` carries an explicit disposition citing the gate reassignment at `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:615`; the unedited `Owner:` line at `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:81` is noted **once** as a convention artefact; **no ownership finding is routed against it**. | **met** | `02_identity-the-learner-key-and-principal-kind.md` §9 and `93_open-items-and-provisional-register.md`. Reassignment cited; `:81` noted as a convention artefact; **zero** ownership findings routed — `91_findings-register.md` contains none. |
| `G-S2-6` | C010's `OI-S1-2` is recorded as **closed with the observed value**. | **not met** | **No token was observed, for any shape**, so there is no observed value to close it with. Registered as `F-S2-3` in `91_findings-register.md`, with consequence, owner and escalation route. Owner: **the creator, as sole maintainer and sole operator**, escalating to **`NEU-896`** at convergence. Closable by `OI-S2-2`, `OI-S1-1` or `OI-S1-3`. |
| `G-S2-7` | The residual human-`sub` question is confined to the named shapes SUB-1 could not obtain, cites its open items, and carries a stand-in entry with a **named owner** and a **re-validation trigger**. | **met** | `95_stand-in-assumption-register.md` § `A-S2-1` — owner and observable trigger both present, neither blank. **Zero** shapes were obtained, so the residual correctly spans **all three**; that it is not narrower is stated in `02_identity-the-learner-key-and-principal-kind.md` §10 rather than presented as a tidier result. |
| `G-S2-8` | Outcome-register rows for **OUT-1, OUT-5 and OUT-6** are authored here, each carrying the outcome, its resolving evidence and its **success measure**. | **met** | `90_outcome-register.md` § SUB-2 — three rows, three success measures, three measured results. **OUT-5's measured result is reported as NOT MET**; the row and its measure exist, which is what this item asks. |
| `G-S2-9` | Every residual exposure SUB-2 states carries a risk-register entry with a severity, a mitigation, a named owner and an escalation route. | **met** | `92_risk-register.md` § SUB-2 — `R-S2-1` (High), `R-S2-2` (Medium), `R-S2-3` (Medium), all four fields present on each. **Zero charter `R<n>` rows**, correctly: no § Risks row names OUT-1, OUT-5 or OUT-6 (charter assumption 48). |
| `G-S2-10` | A review against ADR-0001's stated expiry conditions is recorded. | **met** | `02_identity-the-learner-key-and-principal-kind.md` §11 — all four of ADR-0001's named conditions reviewed; none invalidates the kind rule, two would widen the key, and the widening is pre-argued at `decision-records/DR-C11-S2-1_the-persisted-learner-key.md` rejected alternative 5. |
| `G-S2-11` | No file under `src/`, `drizzle/` or any deployment configuration is modified. | **met** | `02_identity-the-learner-key-and-principal-kind.md` §13 — `git diff --name-only origin/develop` lists files only under this package directory and `docs/GLOSSARY.md`. |
| `G-S2-12` | Every relative citation SUB-2 writes resolves. | **met** | `node_modules/.bin/tsx scripts/check-citation-paths.ts` run locally at cutoff `86fb38a`: C011 reports **0 non-resolving**, unchanged from SUB-1's baseline. Enforcement remains voluntary — C011 is not in the checker's gated list, capped as `CAP-S1-2` and owned by SUB-14. |
| `G-S2-13` | The settled tool-surface figure **46 registered / 43 gated / 3 exempt** is used, and the superseded miscount appears nowhere as a codebase fact. | **met** | `02_identity-the-learner-key-and-principal-kind.md` §3 refers to *"the three gate-exempt tools"* only, consistent with the settled figure. The superseded numeral appears in no SUB-2 file. |
| `G-S2-14` | C010 decisions are consumed with the source cited, and any contradiction is routed to `NEU-895` rather than silently resolved. | **met** | `02_identity-the-learner-key-and-principal-kind.md` §12 — four checks run (`DR-C10-S8-2`, `I5`, `NEU-850`'s `OUT-2`, `A-28`'s envelope), all returned empty. **No amendment routed.** Recorded so SUB-17 can see the check ran rather than infer it from an absence. |
| `G-S2-15` | Any new domain term gets a `docs/GLOSSARY.md` row in the same change, and `subject` is never used in a sense ambiguous with a chunk's academic subject. | **met** | `docs/GLOSSARY.md` — `learner key` and `principal kind` appended. Every occurrence of `subject` in a SUB-2 file is **qualified** — *JWT subject*, *subject identifier*, *target subject*, *resolved subject*, or the quoted `const subject` expression from `src/transport/jwt-middleware.ts:127`. **An earlier revision of this row claimed the word appeared "never bare", which was false**: `DR-C11-S2-1` and `DR-C11-S2-2` each used it once meaning *topic*, and `DR-C11-S2-3` used it twice for a `sub` claim value. All four were reworded and the claim was narrowed to the one that is actually checkable. Corrected rather than quietly restated. |

**SUB-2 rows: 15. Met 14; not met 1** — `G-S2-6`, which names what is missing, why, and its owner.

**What SUB-2 does not assert here.** Nothing about band placement, cross-register consistency across
all eight registers, the outcome register's total row count, the risk register's total count, or the
findings register's both-directions enumeration. Those are **SUB-14's** at position 15 and
**SUB-17's** at position 16. In particular SUB-2 asserts only that **its own** rows are present and
correctly disposed — not that the gate as a whole is satisfiable.

---

### SUB-3

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-16` | The enumeration is re-derived at this sub-task's own cutoff and reports ten `public` tables, two Drizzle-defined `infrastructure` tables, two raw-SQL log tables and the process-local in-memory set — with `context_tokens` the **tenth** `public` table, appearing exactly once. | **met** | `03_learner-data-inventory-and-classification.md` §3. `pgTable(` occurs 10 times in `src/infrastructure/db/schema.ts`; `context_tokens` at `:312`, inventoried once as `LD-S3-13`; the two Drizzle `infrastructure` tables at `:333` and `:364`; the raw-SQL pair in `drizzle/`. |
| `G-17` | Every table, column group and in-memory structure appears exactly once — no duplicates, no omissions. | **met** | §4–§8. Thirty-two entries, `LD-S3-1` … `LD-S3-32`, each once. Thirteen `public` categories over ten tables under C010's individuation rule, cited at §3. |
| `G-18` | Completeness is **argued** with a stated method and a stated falsifier, not asserted. | **met** | §11. Three independent enumerations that must agree, and a published falsifier. The falsifier **fired once** and is discharged by admission — recorded as `F-S3-2`, not absorbed. |
| `G-19` | The bidirectional cross-check against C010's state inventory reports unmatched counts in **both** directions, with every unmatched entry explained. | **met** | §10. C010 → here: 30 matched + 15 unmatched-and-explained = **45**. Here → C010: 30 matched + 2 unmatched-and-explained = **32**. All fifteen and both twos are named individually. |
| `G-20` | Each of the two port-less log tables carries **both** classifications, the condition that selects between them, and an explicit pointer to SUB-16 — recorded as complete, not awaiting revision. | **met** | §5, and `decision-records/DR-C11-S3-2_conditional-log-table-classification.md` with its three rejected alternatives. Zero revisions of this chapter are produced, requested or owed. |
| `G-21` | Every copy of real learner-derived data this package's own activity produces appears with an owner and a retention bound, the terms being **SUB-1's as recorded**; the aggregate result set appears as counts and probe results; the dry-run dataset appears **only as a recorded exclusion** with its derivation test. | **met** | §8. `LD-S3-31` quotes SUB-1's seven terms from `01_production-evidence-and-the-access-audit.md` §6 and sets none of its own — a class with **zero known members and terms that exist anyway**. `LD-S3-32` is counts and probe results. The dry-run dataset is an exclusion, not an entry, with SUB-6 named as the party that evidences it. |
| `G-22` | The consent category OUT-10 creates appears as a **recorded seam**, not an entry: named as created downstream, SUB-8 named as its classifying author, this inventory's entry shape published, and the union OUT-11/OUT-12 read stated. | **met** | §9, with the entry shape published at §1. **Zero revisions of this inventory produced or owed** — the no-back-edge rule is stated and held. |
| `G-23` | The `OI-S5-1` stand-in states the assumption, the adopted reading, a named owner and a re-validation trigger — never a blank field. | **met** | `95_stand-in-assumption-register.md` § `A-S3-1`. Owner `NEU-850`; trigger is `OI-S5-1` closing; tolerance envelope and invalidating outcome both stated. The id is **sub-task-scoped**, matching `DR-C11-S15-3`'s scheme, because a charter-continued number is not collision-safe while sub-tasks run concurrently; what it stands in for (charter assumption 36) is stated in the entry's prose instead. |
| `G-24` | The controller/processor and lawful-basis question carries **exactly one** register record with a stable id and a named owner, and that owner is the one the overstated-legal-authority risk escalates to. | **met** | `93_open-items-and-provisional-register.md` § `OI-S3-1`, owner *the creator as sole maintainer and sole operator*; `92_risk-register.md` § `R10` escalates to that same named owner. Zero second records raised here — the four questions owned elsewhere (`OI-S1-4`, `OI-S1-5`/`OI-S1-6`, `OI-S5-1`, `OI-S8-1`) are consumed by citation. |
| `G-25` | OUT-9's outcome-register row carries its resolving evidence and its **success measure**; both OUT-9-owned charter § Risks rows carry a register entry with severity, mitigation, named owner and escalation route; both required findings are routed rather than absorbed. | **met with cap** | `90_outcome-register.md` § OUT-9, six-part measure with its measured result. `92_risk-register.md`: `R10`, `R12`. `91_findings-register.md`: `F-S3-1` (minimization) and `F-S3-2` (omission probe), plus `F-S3-3` and `F-S3-4`. **Capped by `F-S3-3`**: the two risk ids are computed from the charter's own row order and **conflict with SUB-1's forward-allocation table at rows 10–12**, which SUB-14 must reconcile. |

**SUB-3 rows: 10. Met 9; met with cap 1; not met 0.** The single capped row names what is
unreconciled, why, and who reconciles it.

**What SUB-3 does not assert here.** Nothing about band placement, cross-register consistency across
all eight registers, the outcome-register's final row count, the fifteen-row risk-register count, or
the findings register's both-directions enumeration — those are **SUB-14's** at position 15 and
**SUB-17's** at position 16. Nothing about whether SUB-8's consent entry in fact matches the entry
shape published at §1, or whether SUB-9 in fact propagates through `LD-S3-31`: both are those
sub-tasks' own acceptance at their own positions, and this chapter asserts only what it publishes.
`G-15` remains SUB-1's row and SUB-3 does not re-assert it; the citation gate still does not cover
C011, which is `CAP-S1-2`, owner SUB-14.

---

### SUB-4

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-S4-1` | Check `I4` is applied to **both** transports under the proposed gate and resolves to a stated verdict, with every residual named and owned. | **met** | `04_the-stdio-identity-gate-and-the-bound-context-token.md` §10.1. Verdict: `I4` no longer fails under the proposed gate. Three non-claims stated, and the one residual on the verdict — the per-process-singleton limit — is `R-S4-3`, owner `SUB-10 of C010 (NEU-984)` co-named `NEU-896`. |
| `G-S4-2` | Every existing STDIO client path is classified `unaffected` / `degraded` / `broken`, with a stated breaking-change position and its staging, and "leave STDIO ungated" appears **only** as an argued-and-rejected alternative. | **met** | §9 — **7 of 7** paths: 3 unaffected, 1 degraded, 2 broken, 1 counted elsewhere. §9.1 — breaking and unavoidably so, four-stage set, two ordering constraints, no permissive mode. §3.1 and `decision-records/DR-C11-S4-1_the-stdio-identity-gate.md` rejected alternative 1 — argued against the invariant's unconditional verdict, never offered as the answer. |
| `G-S4-3` | `BND-S4-17` is recorded **resolved here** with the naming party cited from `OI-S8-2`'s resolving event, not as a consumed constraint and not left with owner `nobody` — and the citation names `OI-S8-2`, never `OI-S8-1`. | **met** | §11 and `93_open-items-and-provisional-register.md` § *Disposition of `BND-S4-17`*. Cites `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:429`; names limb **one** as the limb that fired; owner named as `SUB-10 of C010 (NEU-984)` co-named `NEU-896`. `OI-S8-1` appears only where it is correctly the different item — `:417` (its Owner line) and `:418` (its own resolving event) — and never as the source of `:429`. Classified `resolved here`, **not** "owned and resolved here". |
| `G-S4-4` | A token-lifecycle walk covers mint, use, expiry, purge and cutover on both transports, every step with a defined behaviour, and expired rows have a wired purge path or a stated reason there is none. | **met** | §6 — **15 of 15** cells carry a stated disposition: **14** a defined behaviour and **one** an explicit `n/a` where the step cannot arise (an unconfigured STDIO process mints nothing, so it has nothing to expire). Two cells state that an existing behaviour is **unchanged**, which is a defined behaviour rather than an omission — §6's closing line draws the distinction (*"none of them is 'unchanged, and therefore fine'"*). §7 and `decision-records/DR-C11-S4-3_expiry-purge-and-the-cutover-rejection-rule.md` — `deleteExpired()` wired at the mint path with a named call site, chosen for being transport-agnostic. |
| `G-S4-5` | Every class of token rejected at cutover is named, the deploy pipeline's `client_credentials` smoke principal included. | **met** | §8 — **4 of 4** classes. C2 is the smoke principal, named with its evidence (`.github/workflows/cd-prod.yml:145`–`:174`; `tests/smoke/smoke.test.ts:195`, `:206`, `:237`) and distinguished from the one-time unbound class as a **recurring** rejection. |
| `G-S4-6` | The design is audited against `DR-C10-S8-2`, adds no per-call identity argument, and satisfies checks `I2` and `I5`. | **met** | §10.4 — **7 of 7** clauses audited in a table. Zero tool input schemas change; zero per-call identity arguments added, with the apparent counterexample disclosed as `F-S4-5` rather than left for a reader to find. §10.2 — `I2` satisfied for `context_tokens` itself, consumed unchanged elsewhere. §10.3 — `I5` satisfied on both transports. |
| `G-S4-7` | OUT-7 and OUT-13 each carry an outcome-register row **authored here**, with resolving evidence and a **success measure**. | **met** | `90_outcome-register.md` § SUB-4. Both rows carry Outcome, Success measure (four clauses each), Verified by, Measured result at revision 1, an explicit does-not-claim paragraph, and Authored by. Neither measure is authored at assembly. |
| `G-S4-8` | Every residual exposure this sub-task states carries a risk-register entry with a severity, a mitigation, a named owner and an escalation route — and **zero** charter `R<n>` rows are authored. | **met** | `92_risk-register.md` § SUB-4 — `R-S4-1` (High), `R-S4-2` (High), `R-S4-3` (Medium), `R-S4-4` (Medium). All four carry every required field plus a mitigation status; two open, two partially mitigated, each naming its residual and that residual's owner. **Zero** charter rows, correctly: no § Risks row names OUT-7 or OUT-13 (charter assumption 48). |
| `G-S4-9` | No production quantity is recorded as observed; every unobtainable fact resolves to a stand-in with an owner and a re-validation trigger, or to a spike with a method and an expiry. | **met** | **The `observed-in-production` evidence label is applied to zero claims by SUB-4** — the label is named here and in two other places to record its emptiness, and attached to nothing. The cutover population is `A-S4-1`; STDIO reachability is `A-S4-2`; both carry owner, tolerance envelope and re-validation trigger. `SPK-S4-1` and `SPK-S4-2` each carry a read-only method, a quarantine path and a **2026-11-25** expiry, and both report **not executed**. No count, estimate or bound of any production quantity appears anywhere in this sub-task's output. |
| `G-S4-10` | Every codebase claim resolves to a real path at a stated cutoff, and the settled tool-surface figure is used rather than the corrected miscount. | **met with cap** | §1.6 re-counts independently at `5111841`: `registerTool(` occurs **46** times across `src/server/`, `EXCLUDED_TOOLS` at `src/transport/context-token-middleware.ts:5`–`:9` holds exactly three — **46 / 43 / 3**, matching `F-S5-3` and `F-S8-1`. The corrected miscount is **not repeated as a codebase fact anywhere**. §14 records zero changes to `src/` or `drizzle/`. **Capped by `CAP-S1-2`**: C011 is still not in `scripts/check-citation-paths.ts`'s gated list, so this sub-task's citations were verified by a **local** run only and CI does not yet enforce them. Owner SUB-14. |

**SUB-4 rows: 10. Met 9; met with cap 1; not met 0.** The single capped row names what is
unenforced, why, and who owns lifting it — and the cap is on the **enforcement** of the citation
convention, not on this sub-task's conformance to it, which was verified locally at **0
non-resolving** for the whole C011 package after the final edit.

**SUB-4 writes gate rows rather than deferring them, following SUB-2 and SUB-3 rather than SUB-15.**
`DR-C11-S15-3` recorded SUB-15's deliberate choice to write none, on the ground that this register
names SUB-17 as owner; SUB-2 diverged and wrote `G-S2-<k>` rows anyway. SUB-4 takes the same view for
the same reason: the rows above assert only what **this sub-task** published, which SUB-17 cannot
reconstruct as cheaply as the author can, and asserting them here costs SUB-17 nothing it would
otherwise have. The divergence is stated so SUB-14 sees a choice and not an accident.

**What SUB-4 does not assert here.** Nothing about band placement, cross-register consistency across
all eight registers, the outcome register's final row count, the fifteen-row risk-register count, or
the findings register's both-directions enumeration — **SUB-14's** at position 15 and **SUB-17's** at
position 16. Nothing about whether any state category reaches `holds`, which needs `I3` and is
**SUB-5's** at its own position. Nothing about the rollout order (**SUB-7's**) or the whole-surface
compatibility contract (**SUB-11's**). Nothing about whether `OI-S8-2` closes — this sub-task fires
limb one of its resolving event and routes it; recording the closure is
`SUB-10 of C010 (NEU-984)`'s. And **no QA pass is claimed**: no capability owns the `qa-execution`
surface, so the autonomous QA phase is a genuine Core Article 8 no-op rather than a skipped gate,
exactly as `README.md` § "Verification note" records for the package.

---

### SUB-8

**Id family.** SUB-8's rows are **`G-S8-<k>`**, scoped to the authoring sub-task on the scheme SUB-2
fixed in `decision-records/DR-C11-S2-3_provenance-persistence-and-parallel-safe-id-families.md`. The
flat `G-<n>` run SUB-1 and SUB-3 used cannot be computed by an author who cannot see a concurrently
authoring sibling's entries, and a sibling **was** authoring against this file concurrently with this
sub-task — SUB-4 (NEU-996), whose section immediately above landed on `develop` while this one was
being written and which **independently chose the same scoped form**, `G-S4-<k>`. Three sub-tasks now use the
scoped scheme (SUB-2, SUB-4, SUB-8), two used the flat run (SUB-1, SUB-3), and two wrote no gate rows
at all (SUB-15, SUB-16). **SUB-14 adjudicates**; the disagreement is already recorded in SUB-2's
section above and nothing above this line is touched.

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-S8-1` | Consent state is placed against C010's authority matrix with **exactly one** authority, consistent with the `08_…md`-as-revised-by-`10_…md` revision. | **met** | `08_consent-and-what-a-learner-can-export-and-erase.md` §2. **1 of 1** authority — `CMP-S4-7`, under **clause 2** of the ordered first-match-wins rule; **0** split. The revision is cited in the form `10_…md` itself fixes. `DR-C11-S8-1` records clause 5 as rejected alternative 3 and a split authority as rejected alternative 4. Neither C010 matrix is edited. |
| `G-S8-2` | The withdrawal walk enumerates **every** affected category of SUB-3's inventory with its resulting behaviour. | **met** | §6 — **33 of 33** rows (SUB-3's 32 plus `LD-S8-1`); **0** omitted. **3** affected, and the smallness of that number is reported as the result rather than smoothed. |
| `G-S8-3` | For every processing purpose the package states whether consent governs it, so the negative boundary is as explicit as the positive one. | **met** | §3 and §4 — **14 of 14** purposes carry an explicit yes/no; **3** yes, **11** no; every `no` names the basis that carries it instead. **0** unstated. |
| `G-S8-4` | The two log tables carry the classification SUB-16 determined, with their own obligation, deadline and any named retention exception — never the unattributed reading silently retained. | **met** | §7.3 (export: in scope for `user` rows, labelled partial), §8 and §8.2 (erasure: `delete` post-cutover, **`unreachable`** pre-cutover), §9 (retention: exception #4 for `LD-S3-16`; a stated 30-day position for `LD-S3-17`, discharging what `R-S16-4` named SUB-8 for). `DR-C11-S16-2` is consumed, not re-decided. |
| `G-S8-5` | A purpose resting on consent that could not actually be withdrawn is **reported as an OUT-10 finding with a named owner**, not reconciled in prose. | **met** | §4.1 and `91_findings-register.md` § `F-S8-1` — operational logging, failing withdrawability in **three** independent ways, with a named owner and `NEU-986` co-named. **0** absorbed into prose. |
| `G-S8-6` | The consent category's classification entry carries **every field of SUB-3's published shape, checked field for field**, plus its retention/erasure position after withdrawal, and is consumable by this sub-task's export-completeness check and SUB-9's unowned-copy audit — with **zero** back-edge edits to SUB-3's inventory. | **met** | §5 — `LD-S8-1`, **7 of 7** fields in SUB-3's own order (`03_learner-data-inventory-and-classification.md` §1) plus field 7. Consumed by §7.2's union as the *"plus the consent category"* term. **0** back-edge edits: `03_…md` is unmodified by this sub-task, and `git diff --numstat` shows it untouched. The id is `LD-S8-1`, deliberately not `LD-S3-33`. |
| `G-S8-7` | A table-top export produces a **learner-readable** artifact, complete against every category SUB-3 marks as the learner's plus the consent category — **zero** unaccounted for. | **met with cap** | §7.1 (seven stated properties, five of them readability), §7.2 (**32 − 8 = 24; 24 + 1 = 25**, subtrahend named by id), §7.3 (the table-top, sub-counts 9 + 5 + 3 + 2 + 5 + 1 = 25 ✓). **0** categories unaccounted for. **Capped by `CAP-S8-1`:** the table-top is a **paper exercise over the declared schema** — no database was read and no artifact was rendered — and it is reported as one rather than as a produced export. |
| `G-S8-8` | Every retention exception carries a justification, a time bound, an owner and a stated basis; **zero** are indefinite; the consent record's own position is audited **as one of them**; and one that cannot be given all four is an **OUT-11 blocking finding**. | **met** | §9 — **6** audited, **5 pass**, **1 fails**. **0** indefinite exceptions accepted. The consent record is **exception #1**, audited and **not exempted for being the package's own**. The failure is `91_findings-register.md` § `F-S8-2`, recorded **blocking** with an owner and a resolving event. |
| `G-S8-9` | The controller/processor and lawful-basis question carries **no** open item, finding or register entry restating it here — only the citation to SUB-3's single record by its stable id — while this sub-task's **own** cross-border-transfer determination appears as a separate named open item with its own id and owner. | **met** | `93_open-items-and-provisional-register.md` § SUB-8 — **zero** second records; `OI-S3-1` cited in `08_…md` §0, §5, §9 and §15 and in both decision records. **`OI-S8-1`** is raised with its own id, its own owner and its own resolving event, and carries an explicit three-way why-this-is-not-a-second-record-of `OI-S1-9` / `OI-S3-1` / `OI-S16-1`. Its **shape collision with C010's `OI-S8-1` is disclosed**, not renumbered. |
| `G-S8-10` | The codebase purge audit states which mechanisms exist, which are wired and what each requires, with `deleteExpired()`'s unwired status recorded **explicitly**. | **met** | §10.1 (nine-row table), §10.2, §10.3. `deleteExpired()` — **zero call sites in `src/`** — recorded explicitly, and **three further** unwired deletion methods surfaced, reported as `F-S8-3` rather than absorbed. Charter assumption 16's *"only purge path"* is confirmed for a **bulk/sweep** purge and shown narrower than the deletion surface. §10.3 confirms **two** log-flush timers and **no** purge timer. |
| `G-S8-11` | OUT-10's and OUT-11's outcome-register rows are authored here, each carrying the outcome, its resolving evidence and its **success measure**; and every residual exposure this sub-task states carries a risk-register entry with a severity, a mitigation, a named owner and an escalation route. | **met** | `90_outcome-register.md` § SUB-8 — two rows, two success measures, two measured results. `92_risk-register.md` § SUB-8 — `R-S8-1` (High), `R-S8-2` (Medium), `R-S8-3` (Medium), `R-S8-4` (High), all four fields present on each. **Zero charter `R<n>` rows**, correctly: **no § Risks row names OUT-10 or OUT-11** (charter assumption 48). |
| `G-S8-12` | No file under `src/`, `drizzle/` or any deployment configuration is modified, and every relative citation this sub-task writes resolves. | **met** | `08_…md` §13 — `git diff --name-only origin/develop` lists files only under this package directory and `docs/GLOSSARY.md`; **zero** under `src/`, **zero** under `drizzle/`. `node_modules/.bin/tsx scripts/check-citation-paths.ts` run locally at cutoff `d2e2b55`: C011 reports **0 non-resolving**, unchanged from the baseline. Enforcement remains voluntary — C011 is not in the checker's gated list, capped as `CAP-S1-2`, owner SUB-14. |

**SUB-8 rows: 12. Met 11; met with cap 1; not met 0.** The single capped row names what is limited,
why, and its owner.

**What SUB-8 does not assert here.** Nothing about band placement, cross-register consistency across
all eight registers, the outcome register's final row count, the fifteen-row risk-register count, or
the findings register's both-directions enumeration — those are **SUB-14's** at position 15 and
**SUB-17's** at position 16. In particular SUB-8 asserts only that **its own** rows are present and
correctly disposed, not that the gate as a whole is satisfiable. Nothing is asserted about whether
SUB-9 in fact consumes `LD-S8-1` or disposes of the pre-cutover population `F-S8-2` hands it — both
are SUB-9's own acceptance at position 11. `G-15` remains SUB-1's row and SUB-8 does not re-assert
it; the citation gate still does not cover C011, which is `CAP-S1-2`, owner SUB-14.
### SUB-5

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-S5-1` | All **13** ports in `src/ports/` are addressed: every in-blast-radius port names a concrete enforcement point and every exclusion carries a written justification, with **zero** unaddressed. | **met** | `05_the-enforcement-point-that-confines-every-read-and-write.md` §3 — 13 rows. 11 in the blast radius · 2 excluded with justification (`EmbeddingPort`, `ContentClassifierPort`) · 1 named as not confinable and routed (`Tier2BlockingStatsRepository`) · 1 confined by a different mechanism (`ContextTokenRepository`) · 1 excluded as not learner-scoped (`LinterValidationRepository`). |
| `G-S5-2` | The port composition is re-verified at this cutoff rather than inherited, and any divergence from the charter is reported as a finding. | **met** | §1.1 — **7** row-owning, not the charter's 9. `Tier2BlockingStatsRepository` owns no rows; `ReviewPersistencePort` owns no table and is a second write path into `learning_chunks`. Registered as `F-S5-1`; the *pure-compute* mischaracterization as `F-S5-2`. |
| `G-S5-3` | Each of the two named write-path invariants is demonstrably **removed**, not shadowed by a predicate layered above it. | **met** | §4.1 (`getActiveSession()` — the owner predicate is conjoined inside the adapter method, so the unscoped statement ceases to exist) and §4.2 (`createSession`'s guard — **deleted** from orchestration and re-expressed as a partial unique index, which also moves it from outside `A-28`'s envelope to inside). The test applied is *does the global statement still exist anywhere in `src/`*, not *was a predicate added*. |
| `G-S5-4` | Any further unscoped path found while enumerating is reported rather than silently folded in. | **met** | §4.3 — `listSessions()` (`src/adapters/drizzle/session-repository.ts:105`–`:118`) is a third unscoped session path the charter does not name and which returns every session row when called with no options. Registered as `F-S5-4` and named inside charter risk `R1`. |
| `G-S5-5` | Every subject-less `AppContext` member has a stated mechanism for obtaining a principal or is classified as not needing one, with all non-closures absorbed **by name** and none asked a closure question, and the arithmetic reported. | **met** | §5.1 (the closures, answered structurally by clause 4 of `DR-C11-S5-1`, with the reason an individual answer would fail `I5`) and §5.2 (the four non-closures classified by name: the `contextTokens` port handle `:603`, the `contextTokenTtlMs` scalar `:604`, and the two shorthand references `:608` and `:627`). Arithmetic reported. |
| `G-S5-6` | The arithmetic reported is **`52 + 4 = 56`**. | **not met** | **The true figure is `53 + 4 = 57`.** `src/composition-root.ts:518`–`:636` carries 57 members, re-read member by member at cutoff `cc38cc9`; the charter's line range `:516`–`:631` is off by two at both ends and its shorthand-reference lines by two and five. `git log` shows the file last changed 2026-08-04 at `aa56c05`, before the charter was written — **a miscount, not drift**. Registered as `F-S5-3`. The condition's *intent* — every member accounted for, checkably — is met in full; its literal figure is unsatisfiable because it is wrong about the file. Owner of the reconciliation: **SUB-14 (NEU-1007)** under OUT-20. |
| `G-S5-7` | The integration-test design demonstrates that subject A cannot **read, mutate or delete** subject B's rows through any tool path, and **names the paths it covers**. | **met** | §7 — a two-principal fixture over the existing `tests/helpers/db-setup.ts` harness, and a T1–T7 matrix covering read (T1), mutate (T2), delete (T3), enumerate (T4), a positive control so a predicate that refuses everyone cannot pass (T5), the `client`-kind refusal (T6) and aggregates (T7). Covered paths named as the 43 gated MCP tools driven through the tool layer; **four uncovered paths named with reasons** — STDIO, operator/maintenance, the two external-service ports, and concurrency. No test file is written. |
| `G-S5-8` | One named `SC-S3-*` category is carried to verdict `holds` with all five checks answered **in order**, the design as evidence for each, no check skipped, and the derivation published as the invariant's first positive instance. | **met** | §8 — `SC-S3-12` (Notes). `I1` in domain (`question — open` is in domain by C010's own rule) · `I2` attributed under **C1** · `I3` confined on all four enumerated paths at the adapter · `I4` identical on both transports under **C3** · `I5` server-derived, kind determined and used as an indivisible pair under **C4**. `decision-records/DR-C11-S5-2_the-first-holds-derivation.md`. |
| `G-S5-9` | The `holds` verdict states its **target state**, and a composed state enumerates every assumed change. | **met** | §8.1 — form (c), with exactly four enumerated changes (**C1**–**C4**) and an explicit *not assumed* list. Required because `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:158` voids an unenumerated composed evaluation outright. Which of the two published `OUT-2` scopings **C1** takes is stated, and the narrower one is used. |
| `G-S5-10` | `I3` is answered from a published **enumerated access-path set** and not from a failed search for a counter-example. | **met** | §8.3 — four SQL statements (`src/adapters/drizzle/notes-repository.ts:15`–`:25`, `:38`–`:40`, `:54`–`:56`, `:61`), closed by four separately checkable facts: one import site (`:4`), zero raw SQL naming the table, no composition by `UnitOfWorkPort`, one test-only truncate. This is the artifact `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:242`–`:246` records that nobody owed. Its cutoff-boundedness is carried as `A-S5-1` and `R-S5-3`. |
| `G-S5-11` | `CAP-S5-1`'s three preconditions each trace to a settled decision or an already-supplied outcome, with **zero** traced to an artifact that does not yet exist, SUB-13's OUT-19 DDL named only as later re-verification, the lifting condition stated, and the cap recorded co-owned and **not** claimed lifted. | **met** | §9 and `94_caps-and-incomplete-scope.md` § SUB-5. Ownership key → `NEU-850`'s `OUT-2` via SUB-2's rule; port-boundary scoping → OUT-8, here; STDIO gate → OUT-7 / SUB-4 at position 4. Zero forward traces. Lifting condition stated in four parts against target state (a); owner unchanged at `NEU-986`, co-named `NEU-893`; **not lifted**. |
| `G-S5-12` | The `A-28` envelope check runs and its result is stated; a breach is reported as a finding with a named owner and routes a recorded amendment to C010 / `NEU-895`. | **met** | §10 — **inside** the envelope, under two of the three forms `../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:111` names. The invalidating outcome at `:113` did not fire. **No amendment routed.** The finding OUT-8 would require on a breach is recorded as *checked and not filed* rather than omitted, so a reader can distinguish a check that passed from a check never run. |
| `G-S5-13` | OUT-8's outcome-register row carries its resolving evidence and its **success measure**, and the Critical charter § Risks row it owns is authored here with severity, mitigation, named owner and escalation route. | **met** | `90_outcome-register.md` § SUB-5 (a six-limb measure with its measured result, including limb 2 reported **NOT MET** on its literal figure) and `92_risk-register.md` § SUB-5 (**`R1`**, Critical, plus `R-S5-1`, `R-S5-2`, `R-S5-3`). Both authored here in the shape SUB-14 aggregates without authoring. |
| `G-S5-14` | Every residual exposure this sub-task states carries a risk-register entry with all four fields. | **met** | `92_risk-register.md` § SUB-5 — four entries, each with severity, mitigation, named owner and escalation route; every non-mitigated status names its residual and that residual's owner. |
| `G-S5-15` | C010 decisions are consumed with the source cited, and any contradiction routes an amendment to `NEU-895` rather than being resolved here. | **met** | §13 — a twelve-row consistency table plus §13.1's two SUB-16 obligations. **The check ran and returned empty; no amendment routed.** The one mechanism C010 does not describe — adapter-level refusal of `client`-kind principals — is recorded as an **addition** to a C010 pricing, which the charter's own rule distinguishes from a contradiction. |
| `G-S5-16` | The settled tool-surface figure **46 registered / 43 gated / 3 exempt** is used, and the superseded miscount appears nowhere as a codebase fact. | **met** | §1.5 — re-derived at this cutoff: 46 `server.registerTool(` sites across 16 files in `src/server/`, and exactly three names in `EXCLUDED_TOOLS` (`src/transport/context-token-middleware.ts:5`–`:9`). Reproduces `F-S5-3` and `F-S8-1` of C010 with no divergence. The superseded numeral appears nowhere in this chapter as a codebase fact; the one `file:line` citation landing on line 42 — the pool's `max: 4` at `src/infrastructure/db/client.ts:42` — is **disclosed as a line number** in §1.5 so it meets the explanation rather than the anomaly. |
| `G-S5-17` | No file under `src/`, `drizzle/`, `tests/` or any deployment configuration is modified. | **met** | §14 — `git diff --name-only origin/develop` lists files only under this package directory and `docs/GLOSSARY.md`. The integration-test design creates no test file. |
| `G-S5-18` | Every relative citation SUB-5 writes resolves, and the register appends remove zero lines. | **met** | `node_modules/.bin/tsx scripts/check-citation-paths.ts` run locally at cutoff `cc38cc9`: C011 reports **0 non-resolving**. `git diff --numstat` reports a deletions count of **0** on all eight register files. |
| `G-S5-19` | The citation result is evidence, not merely green — the `…md` shorthand invisible to the checker is grepped for explicitly. | **met with cap** | §1.3's note and `F-S5-7`. `scripts/citation-paths/checker.ts:121` discards any candidate containing `…` or `...` **before it is counted**, and `:123` does the same for any candidate containing a space. This chapter writes every path reference as a full filename with its line and was grepped explicitly; the remaining ellipses in it are prose and SQL elisions. **Capped by `CAP-S1-2`** (owner SUB-14): C011 is not in the checker's `GATED` list (`scripts/check-citation-paths.ts:20`–`:21`), so CI does not enforce this and the local run is the only gate. The package-wide `0 non-resolving` is **true but incomplete**, because it never ranged over the predecessors' shorthand references at all. |
| `G-S5-20` | A QA pass exists for this sub-task. | **not applicable** | The `qa-execution:engine` surface is unconfigured and the capability registry resolves to `git, linear`, so scenario execution is a genuine **Core Article 8 no-op**. **No QA pass exists and none is claimed.** Carried at package level by `CAP-S1-3`; not re-filed, per the disposition `94_caps-and-incomplete-scope.md` § SUB-5 records. |
| `G-S5-21` | The 67 DB-backed integration test files are run. | **not applicable** | They cannot run in this environment — `vitest.setup.ts:6`–`:11` throws without `DATABASE_URL`, and no database is provisioned here. Recorded as **not run locally**, which is neither a claim that they pass nor a claim that they are unverifiable: they run in CI against a Postgres container. This sub-task changes no file they cover. |

**SUB-5 rows: 21. Met 17; met with cap 1; not met 1; not applicable 2.**

**SUB-5 uses the sub-task-scoped `G-S5-<k>` form**, following SUB-2's `G-S2-*` and SUB-4's `G-S4-*`
rather than SUB-1's and SUB-3's continuation of the bare global `G-<n>` sequence. Two conventions are
live in this register and the divergence is stated rather than silently chosen, exactly as SUB-4
stated its own. The reason is the collision one `decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`
gives: `G-<n>` is a bare global sequence, and two sub-tasks computing "the next free number" against
the same register arrive at the same integer. `G-S5-<k>` cannot collide.

**The one `not met` row is the honest one, and it is not deferred.** `G-S5-6` asks for the arithmetic
`52 + 4 = 56`. The walk reports `53 + 4 = 57`, because that is what the file says and the file has not
changed since before the charter was written. The condition is recorded **as written** and marked not
met rather than restated to match the result, because a measure edited to fit its outcome measures
nothing. Everything the condition was protecting — that every member is accounted for, that no
non-closure is asked a closure question, and that the walk is checkable by arithmetic — is delivered
in full at `G-S5-5`.

**What SUB-5 does not assert here.** Nothing about whether the enforcement point works, which needs
applied code and a test run, neither of which exists. Nothing about whether any category `holds` on
the deployment — under target state (a) `SC-S3-12` is `not-evaluable`, and C010's `F-S5-4` is
unchanged. Nothing about whether `CAP-S5-1` lifts, which is `OI-S5-2`'s unnamed observer and a
landing condition on applied work. And nothing about the fourteen other Census-B
`fails-confinement` categories, each of which needs its own enumerated access-path set before its
verdict can move.

---

### SUB-6

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-S6-1` | Every table in `src/infrastructure/db/schema.ts` and both raw-SQL log tables carries a stated disposition; zero unaddressed | **met** | `06_the-disposition-of-every-unowned-row.md` §3 — 14 rows. Inventory re-counted from the files at §1.1, not inherited |
| `G-S6-2` | Each disposition carries a per-table justification rather than a uniform rule | **met** | §3's justification column; the evidence-based partition in `decision-records/DR-C11-S6-1_the-migration-disposition-scheme.md`. Three tables take a different disposition from their apparent neighbours for stated structural reasons — rows 3, 9 and 12 |
| `G-S6-3` | A table for which no disposition can be justified is reported as a finding with a named owner | **met** | Checked against all 14; **none found**; recorded as *checked and not filed* at §3, on SUB-5's precedent rather than filed as an empty entry |
| `G-S6-4` | Cross-checked against C010's 45-category state inventory, unmatched reported in both directions | **met** | §8 — 0 unmatched both ways, reconciled by 14 + 2 + 1 = 17. Method stated; both zeros inherit C010's own six falsifiers |
| `G-S6-5` | The backfill target subject is confirmed against a real production token with recorded evidence | **not met** | §5.2. **No credential exists.** Procedure V1–V7 published and made a hard entry condition on the backfill stage; `SPK-S6-1`. No target value is proposed anywhere |
| `G-S6-6` | Per-disposition row counts are reported as counts taken from production | **not met** | §6.4. `Q1`–`Q5` published, **not executed**; `SPK-S6-2`. **No cell reads `0`** |
| `G-S6-7` | The query set includes an explicit probe for each named dirty-data pathology, per table | **met with cap** | §6.2 — twelve probes across all five classes: **8 carry executable SQL, 4 are structural foreclosures** with nothing to run. **The cap is the literal "per table" reading:** §6.3 resolves every pathology for every table to probed / foreclosed / not-probed and names the **seven** tables in the third state, of which `operation_event_log` is the consequential one. Registered as `F-S6-6`, owner SUB-13 (NEU-1006). Publication is the condition; execution is `G-S6-6` |
| `G-S6-8` | A pathology class with no writable probe is reported as a finding | **met** | `F-S6-2` — mis-ownership is undetectable by aggregate, because no column distinguishes principals |
| `G-S6-9` | Each pathology found is reproduced in the synthetic dataset; the dry-run claims every row or surfaces it as a finding | **not met** | §7.1, §7.4. The dataset was not generated — three of its five inputs are the unexecuted aggregates — so no unclaimed-row count exists. `OI-S6-2` |
| `G-S6-10` | A generation record ties every synthetic distribution to its aggregate; a no-copied-rows audit confirms no row was copied out of production; the dataset is recorded as excluded from the sixth copy class citing SUB-3's derivation test at position 3 | **met** | §7.1 (five inputs enumerated exhaustively) and §7.2 (input-closure argument with its falsifier stated); `decision-records/DR-C11-S6-3_aggregate-then-generate-and-the-exclusion-evidence.md`. No owner, retention bound or destruction condition is set |
| `G-S6-11` | Each migration stage states what is lost on reversal and what cannot be recovered at all | **met** | §9.2 — five stages; four fully reversible, S2 the only irreversible one, and its loss entailed by `DR-C10-S8-2` rather than caused here |
| `G-S6-12` | The unprobed-pathology residual is recorded in the risk register with an owner, a pre-flight probe re-run and an abort condition | **met** | `R9` in `92_risk-register.md`, with severity, mitigation, named owner and escalation to `NEU-896` |

**SUB-6 rows: 12. Met 8; met with cap 1; not met 3; not applicable 0.**

**SUB-6 uses the sub-task-scoped `G-S6-<k>` form**, following SUB-2's `G-S2-*`, SUB-4's `G-S4-*`,
SUB-5's `G-S5-*` and SUB-8's `G-S8-*` rather than SUB-1's and SUB-3's continuation of the bare global
`G-<n>` sequence. Two conventions are live in this register and the divergence is stated rather than
silently chosen, exactly as SUB-4 and SUB-5 each stated their own. The reason is the collision
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md` names: `G-<n>` is a bare global
sequence, and two sub-tasks computing "the next free number" against the same register arrive at the
same integer. `G-S6-<k>` cannot collide — which matters more than usual here, because a sibling
sub-task is in flight against this same register concurrently.

**The three `not met` rows are one failure, and it is not deferred or disguised.** `G-S6-5`,
`G-S6-6` and `G-S6-9` all fail because **no production credential exists in this environment**, and
they fail in a chain: without a credential the aggregates cannot run, without the aggregates the
dataset cannot be generated, and without the dataset the dry-run cannot report. Each is recorded as
its own row rather than folded into one, because they close at different moments — a credential alone
closes `G-S6-5` and `G-S6-6`, but `G-S6-9` needs the generation and the run as well. Every one names
its spike or open item and its owner. **None is restated to match what was achievable**, which is the
failure mode SUB-5 recorded against its own `G-S5-6`.

**What SUB-6 does not assert here.** Nothing about how many unowned rows exist — no count, no
population size, no probe result, and `observed-in-production` used zero times. Nothing about whether
the target subject is correct; only that the backfill cannot proceed without confirming it. Nothing
about what a data right does to the pre-cutover population — that is SUB-9's under `F-S8-2`, which
remains blocking and whose owner is unchanged. Nothing about whether `A-S6-1`, the single-principal
premise ten dispositions rest on, is true; `F-S6-2` records that no aggregate can settle it. Nothing
about applied behaviour: no file under `src/` or `drizzle/` changes, no DDL is authored, no migration
is executed, and no test is written. And **no QA pass** — the `qa-execution:engine` surface is
unconfigured, so the automated QA phase is a genuine Core Article 8 no-op, carried at package level
as `CAP-S1-3`.
### SUB-11

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-S11-1` | The tool surface is re-counted at this sub-task's own cutoff, on a branch containing C010, with the cutoff, the branch and the date recorded alongside the count. | **met** | `11_the-client-compatibility-contract.md` front matter and §1 — cutoff `35f92ba`, 2026-08-25, branch `feat/NEU-1004-client-compatibility-contract` cut from `origin/develop` at `35f92ba`, which contains C010's package and both PRs #686/#689 the charter's own checkout lacks. |
| `G-S11-2` | The count is **never inherited** — not from the charter, the intake, a tracker description or a sibling chapter's assertion about the artefact. | **met** | §1.1–§1.3. Each of the three figures is derived from `src/` by a published command with a per-module table. The charter's figure is read only in §1.4, *after* the derivation, and solely to compare. |
| `G-S11-3` | The gated figure is derived as a **mapping**, not as `46 − 3`. | **met** | §1.3 — a thirteen-row table mapping 43 `context_token:` schema declarations onto the non-exempt registrations module by module, balancing in both directions, with the three non-declaration occurrences (two `.transform()` destructures, one response field) excluded by name. A subtraction would have reproduced the charter's own arithmetic error. |
| `G-S11-4` | The exempt set is derived by **two independent means** and their agreement reported. | **met** | §1.2 — empty input schema (`z.object({}).shape`, three sites) and the middleware's `EXCLUDED_TOOLS` literal (`src/transport/context-token-middleware.ts:5`–`:9`). Same three tools. The absence of any structural coupling between them is reported as `OI-S11-1` rather than left implicit. |
| `G-S11-5` | The result is reconciled against C010's `F-S5-3`, with the verdict stated either way. | **met** | §1.4 — a five-row reconciliation table. Agreement holds at the 41 / 1 / 1 granularity of *where* the declarations live, not merely on 46 / 43 / 3. **No finding routed to `NEU-895`;** `R11`'s escalation condition did not arise. |
| `G-S11-6` | **`42` appears nowhere in this sub-task's output as a codebase fact**, and every occurrence that is not the named superseded miscount is disclosed. | **met, after a correction** | §1.6, which now carries **two** disclosures rather than one. **(a)** One citation resolves to a line 42 — `src/infrastructure/db/client.ts:42`, the pool's `max: 4`, cited in **§4 (the `CH-7` row)** and **§8**. **(b)** One genuine re-derived quantity totals 42 — the named `*InputShape` declarations — so §1.4's reconciliation row is written as **`41 + 1`** and its total is deliberately not stated. **The row's first draft was a false green:** §1.4 originally carried a bare `42` in a column headed *"Re-derived here"*, and the claim *"42 appears nowhere as a codebase fact"* was certified `met` over it. An adversarial pass caught it; the numeral is gone and the near-miss is disclosed rather than removed silently, because a rule this specific fails by being asserted rather than by being checked. |
| `G-S11-7` | Every change this package's mechanism implies carries **all three** of a compatibility obligation, a breaking verdict and a detection method; zero carry two of three. | **met** | §3 enumerates seven (`CH-1` … `CH-7`) with their sources; §4 gives all seven three columns. 7/7. |
| `G-S11-8` | A change that alters **semantics without altering schema shape** is named, and its detection method is something other than a schema diff. | **met** | §4.1 — three such changes (`CH-2`, `CH-5`, `CH-6`), with the reason a tool-manifest diff returns **empty** stated rather than asserted: all 46 names unchanged, all 43 gated schemas unchanged, because `context_token` was already required on every gated tool. Four behavioural probes `P1`–`P4` specified, two in the negative form the failure mode requires. |
| `G-S11-9` | Every implied core change carries a two-transport verdict, or the divergence is named with an owner. | **met** | §5 — seven rows plus audit parity. Six hold on both unconditionally; `CH-1` converges in outcome and diverges in cost, owner `SUB-10 of C010 (NEU-984)`. **One genuine divergence — audit parity — named with SUB-16 (`NEU-999`) as owner**, and explicitly recorded as *not* one of the seven changes. |
| `G-S11-10` | A DP-specificity review runs over the re-counted surface and returns a stated verdict. | **met, and it did not return clean** | §9 — **clean on this package's seven changes** (zero course-specific concepts introduced). Run over the surface those changes land on, it found a **pre-existing** breach: `GradingPayloadShape` (`src/domain/types/teaching.ts:275`–`:287`) hard-codes four dynamic-programming criterion keys, reaching 3 of the 46 tools. Reported as `F-S11-2` with `R-S11-1`, escalating to `NEU-896`, **not absorbed into prose**. |
| `G-S11-11` | The 3 gate-exempt empty-schema tools remain a **separately stated decision**, not a silent inclusion. | **met** | §4.2 — why each stays exempt, what the exemption costs, and what is not claimed (that three is the right number forever). The drift risk carries its own detection method and open item, `OI-S11-1`. |
| `G-S11-12` | `F-S4-4`'s unpriced cost is priced, in units re-derived from the tree. | **met** | §6 — seven pipeline layers with their mount sites and conditionals; four Express-typed factories over 480 lines, stated as *file totals* rather than passed off as body totals; three inline blocks; the five-line STDIO limb; `createPrmHandler` excluded with a reason. §6.2 names the **option A / option B** fork that actually sizes the work; §6.3 tabulates three delivery tiers against all seven of SUB-4's paths. **No effort estimate is asserted**, and §6 says so. |
| `G-S11-13` | OUT-16's outcome-register row is authored here with its resolving evidence **and** its success measure. | **met** | `90_outcome-register.md` § SUB-11 — a seven-limb measure with its measured result (7/7 met) and four explicit non-claims. Authored here, in the shape SUB-14 aggregates without authoring. |
| `G-S11-14` | The charter § Risks row the charter owns to OUT-16 is authored here with severity, mitigation, named owner and escalation route; every further residual exposure carries an entry with the same four fields. | **met** | `92_risk-register.md` § SUB-11 — **`R11`** (High) plus `R-S11-1` (Medium) and `R-S11-2` (Medium). Each carries all four fields; each non-mitigated status names its residual and that residual's owner. |
| `G-S11-15` | The `R<n>` id is computed **from the charter alone**, and the `F-S3-3` allocation conflict is cited rather than silently re-allocated. | **met** | §10 — the OUT-16 row is at charter § Risks position **11**, cross-checked against seven already-authored ids (`R1`, `R8`, `R9`, `R10`, `R12`, `R13`, `R14`), all seven of which agree with charter position rather than with the forward-allocation table at `92_risk-register.md:33`–`:35`. `R11` was unclaimed; `R10` would have collided with SUB-3. **`F-S3-3` is cited and explicitly left to SUB-14 to resolve.** The untestable premise is registered as `A-S11-1`. |
| `G-S11-16` | C010 decisions are consumed with the source cited, and any contradiction routes an amendment to `NEU-895` rather than being resolved here. | **met** | §11 — a six-row consistency table. **The check ran and returned empty; no amendment routed.** The two candidates did not fire: the re-count agrees with `F-S5-3`, and `F-S11-2`'s breach is measured against `DR-C10-S8-1`'s `R8-4` **rule** rather than disputing a C010 record, so it routes to `NEU-896`. §6's pricing is an **addition** to `CC-S8-3`, as `F-S4-4` already established. |
| `G-S11-17` | No file under `src/`, `drizzle/`, `tests/` or any deployment configuration is modified. | **met** | §13 — `git diff --name-only origin/develop` lists files under this package directory, `docs/GLOSSARY.md`, **and `.current-task`** (a one-line status breadcrumb at the repository root, written per `CLAUDE.md` § Status Breadcrumb; it is the only path in the change set outside `docs/` and the only line carrying a deletion). **Zero** under `src/`, **zero** under `drizzle/`, **zero** under `tests/`, zero deployment configuration. No test file is written; the four probes of §4.1 are specified and none is implemented. |
| `G-S11-18` | Every relative citation this sub-task writes resolves, the register appends remove zero lines, and the `…md` shorthand invisible to the checker is grepped for explicitly. | **met with cap** | `node_modules/.bin/tsx scripts/check-citation-paths.ts` run locally at this cutoff: C011 reports **0 non-resolving**. `git diff --numstat` reports a deletions count of **0** on all eight register files, re-checked after **every** edit pass. Every path reference in this sub-task's files is now written as a full filename. **The grep found two real shorthand references and both were repaired**, which is the point of running it: one in the chapter (a `12_…md` reference to C010's compatibility chapter, replaced with the full path) and one in `F-S11-1`'s Evidence line (a `_local/…/02_subtasks.md` reference, likewise). `scripts/citation-paths/checker.ts:121` discards any candidate containing `…` **before it is counted**, so both would have been silently exempted and the green result would have been true but not evidence (`F-S5-7`, `G-S5-19`). The remaining `…` occurrences in this sub-task's files are prose or are the shorthand being **discussed as a term**, not path citations. **Capped by `CAP-S1-2`** (owner SUB-14): C011 is not in the checker's `GATED` list (`scripts/check-citation-paths.ts:20`–`:21`), so CI does not enforce it and the local run is the only gate. |
| `G-S11-19` | A QA pass exists for this sub-task. | **not applicable** | The `qa-execution:engine` surface is unconfigured and the capability registry resolves to `git, linear`, so scenario execution is a genuine **Core Article 8 no-op**. **No QA pass exists and none is claimed.** Carried at package level by `README.md` § *"Verification note"* — **not** by `CAP-S1-3`, which is cited four times in this package and is not filed in `94_caps-and-incomplete-scope.md`; registered as `F-S11-5` and routed to SUB-14. No duplicate cap is filed here. |
| `G-S11-20` | The 67 DB-backed integration test files are run. | **not applicable** | They cannot run in this environment — `vitest.setup.ts:6`–`:11` throws without `DATABASE_URL`, and no database is provisioned here. Recorded as **not run locally**, which is neither a claim that they pass nor a claim that they are unverifiable: they run in CI against a Postgres container. This sub-task changes no file they cover. |
| `G-S11-21` | Any claim this sub-task cannot observe resolves to a stand-in, an owned open item, or a spike with a method and an expiry. | **met, after a correction** | Four unobservables, each routed. The **client population's existence and composition** → **`CAP-S11-1`** plus **`SPK-S11-1`** (bounded, read-only, designed and **not executed**, stated method, 2027-02-25 expiry plus three event clauses). The **`R11` id premise** (that the charter's § Risks table has not been reordered) → **`A-S11-1`**. The **smoke principal's `sub`-absence**, on which the whole of §7 rests → **`A-S11-2`**, citing `OI-S1-1` / `SPK-S1-1` / `R-S2-2` rather than re-raising them. The **C005 `:61` authority**, which resolves to no file → **`OI-S11-3`**. **`A-S11-2` and `OI-S11-3` were added after an adversarial pass**: §7's premise was originally stated as flat fact while two sibling records carry it as an explicitly unobserved belief, and the constraint's citation was used without checking that it resolved. Both are recorded as corrections rather than repaired silently. **No claim in this sub-task carries the `observed-in-production` label**, and no client count is asserted in either direction. |

**SUB-11 rows: 21. Met 18; met with cap 1; not met 0; not applicable 2.** (`G-S11-10` is counted as
**met**: the condition asks that the review run and return a stated verdict, and it did — the verdict
simply was not clean, which is the finding `F-S11-2` and not a failure of the condition.)

**SUB-11 uses the sub-task-scoped `G-S11-<k>` form**, following `G-S2-*`, `G-S4-*`, `G-S8-*` and
`G-S5-*` rather than SUB-1's and SUB-3's continuation of the bare global `G-<n>` sequence. Two
conventions remain live in this register and the divergence is stated rather than silently chosen,
for the reason `decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md` gives: `G-<n>` is a
bare global sequence, and two sub-tasks computing "the next free number" against the same register
arrive at the same integer — which is exactly the hazard this sub-task ran under, with a sibling
authoring concurrently. Reconciling the two conventions is **SUB-14's** under OUT-20; nothing here
renumbers another sub-task's rows.

**No row is `not met`, and that is a weaker statement than it looks.** Two of the twenty-one are
`not applicable` and one is `met with cap`, and each of those three names the thing it cannot deliver
rather than scoring it as a pass — the QA no-op, the unrunnable integration tests, and a citation
gate that does not cover this package in CI. The two conditions most at risk of a false green were
`G-S11-6` and `G-S11-18`: the first because *"42 appears nowhere"* is easy to assert and was
falsified by this chapter's own citation, which is disclosed instead; the second because the
citation checker cannot see the `…md` shorthand at all, so `0 non-resolving` is **true but not
evidence** unless the shorthand is grepped for separately.

**What SUB-11 does not assert here.** Nothing about whether any existing client exists — the
population is unobserved and no count is claimed in either direction (`CAP-S11-1`). Nothing about
what the gate extraction costs in effort; §6 prices what the cost is a cost *of* and which fork
sizes it, and offers no hours. Nothing about whether the behavioural conformance suite of §4.1
works, since none of its four probes is written. Nothing about a remedy for the DP rubric, which is
a `src/` change out of scope by constraint. And nothing about the resolution of `F-S3-3`, which is
SUB-14's — §10 states a position and its derivation, and resolves nothing.

---

### SUB-9

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-S9-1` | Six-column × three-duty matrix; every cell carries an action, a deadline, a retention exception, a learner-visible result and an auditable proof | **met** | `09_proving-a-data-right-reaches-every-copy.md` §7.1–§7.3 — **18 (class, duty) pairs presented as 17 rows**, all five elements each. C4 and C5 share one row under withdrawal; the merge is presentational and each class still emits its own proof. The row count is stated so a recount agrees |
| `G-S9-2` | Zero cells read "unknown" without a named owner and a date | **met** | §7. Three C3 cells read *not determinable at this cutoff* **with** the owner and resolving event carried from `OI-S1-8` (`93_…md:124`, `:125`) — the state OUT-12 permits. No cell is blank |
| `G-S9-3` | Every column heading resolves to a defined class rather than an inherited label | **met** | §3 — six definitions with their SUB-3 inventory mappings; §3.1 resolves `web-owned state` to browser-side device state, server-side recorded empty-by-decision under `M-A` cited to `DR-C10-S6-1` |
| `G-S9-4` | The sixth column carries SUB-1's recorded owner, retention bound and destruction condition with that origin named; any "destroy on schedule" is reasoned | **met** | §7.4 — all five terms read from `01_production-evidence-and-the-access-audit.md:151`–`:159`; the action is reasoned from the retention bound's unconditional expiry, and is explicitly **not** claimed to replace erase-on-request pre-publication |
| `G-S9-5` | Each candidate package-internal copy is admitted or excluded on its derivation, with the answer written down | **met** | §5 — five candidates tested. §5.1 states the dry-run exclusion, sets no term, and adds the exclusion's **own falsifier**, which SUB-6 did not state |
| `G-S9-6` | The backups column is resolved by citation to the package's single record, with its owner carried; **zero second records** of the backups fact raised here | **met** | §10 cites `OI-S1-8` by id and carries its owner. **The claim is "no second record", not "no mention"** — an earlier wording said no backups statement *appears* in this sub-task's output, which is false and is corrected: `F-S9-4` states that C3 has no established contents or restore path, and `R2` carries two backups clauses in its escalation route and mitigation status. Both **cite** `OI-S1-8`; neither mints an id, asserts a backups fact of its own, or gives SUB-14's cross-register check a second id to reconcile — which is what the constraint actually forbids |
| `G-S9-7` | The unowned-copy audit runs mechanically over SUB-3's inventory ∪ `LD-S8-1`, reports a count, includes the package's own copies | **met** | §8 — 33 categories (`08_…md:258`), 0 with no propagation owner, package's own copies included as C6. Zero revisions raised against SUB-3's inventory |
| `G-S9-8` | Every unowned copy and every unresolvable cell is reported as a finding with a named owner | **met** | **Two** copy locations no class claims: `F-S9-1` (external-provider egress) and `F-S9-5` (the stderr sink mirroring both log tables), each with owner and escalation route. C3 was tested against the trigger and **deliberately not filed**, recorded as *checked and not filed* in `91_findings-register.md` § SUB-9, because filing would raise a forbidden second backups record |
| `G-S9-14` | The copy-set enumeration was re-attacked after it first returned green, and any channel found is reported rather than silently repaired | **met** | `09_…md` §4.2 and §4.5; `F-S9-5`. The first enumeration asserted seven channels and *"there is no eighth"* on four passing greps; `W-8` (process stderr) was found on re-attack and is recorded **with the reason the green check missed it** |
| `G-S9-9` | The completion-proof design conforms to SUB-16's published signal contract field by field | **met** | `decision-records/DR-C11-S9-3` — 9/9 fields, 3/3 location properties, the timing rule, 6/6 negative clauses, each walked individually. The match is asserted here because `16_attribution-and-detection.md:338`–`:341` declines to assert it |
| `G-S9-10` | `CAP-S3-3`, `CAP-S4-1`, `CAP-S7-1`, `CAP-S5-1` and `OI-S5-1` each carry an explicit disposition with its actual owner | **met** | `94_caps-and-incomplete-scope.md` § SUB-9 — five rows. `CAP-S7-1` **discharged**; two supplied-to; one owned-here-discharged-elsewhere; one consumed. C010's `CAP-S4-1` is written qualified throughout (`F-S9-3`) |
| `G-S9-11` | OUT-12's outcome row and the Critical OUT-12-owned charter § Risks row are both authored here | **met** | `90_outcome-register.md` § SUB-9 (row, resolving evidence, eight-clause success measure); `92_risk-register.md` § `R2` with severity, mitigation, named owner and escalation route |
| `G-S9-12` | The copy set is closed by an argument with a stated falsifier, rather than assumed complete | **met, after three corrections** | §4 — `W-1a` … `W-8` enumerated statically at `ee0a750`; the argument at §4.2; the falsifier at §4.3, re-runnable with no production access. **The enumeration was wrong three times before it held** — a missing stderr channel, a missing raw-SQL write path, and two missing outbound call sites — each recorded at §4.2.1 with the reason the green grep missed it. The falsifier is deliberately **not** stated as a fixed number of greps, because that phrasing is what failed |
| `G-S9-13` | The propagation is demonstrated against a real copy | **not met** | **No production credential exists** — `SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*`, `VPS_*` all unset, verified 2026-08-26. Zero designed spikes have executed package-wide — twenty-four at this branch's HEAD, twenty-two at cutoff `ee0a750` (`F-S9-2`). `SPK-S9-1` carries the one deferred observation with a method and an expiry; the argument at §4 is what stands in its place, and it is **not** restated as a demonstration |

**SUB-9 rows: 14. Met 13; met with cap 0; not met 1; not applicable 0.**

**SUB-9 uses the sub-task-scoped `G-S9-<k>` form**, following SUB-2, SUB-4, SUB-5, SUB-6 and SUB-8
rather than SUB-1's and SUB-3's continuation of the bare global `G-<n>` sequence. Two conventions are
live in this register and the divergence is stated rather than silently chosen, exactly as each of
those sub-tasks stated its own. The reason is the collision
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md` names, and it is live right now:
**two sibling sub-tasks are in flight against this same register concurrently**, and `G-S9-<k>`
cannot collide with what either of them computes.

**The one `not met` row is the package's standing condition, not a defect discovered here.**
`G-S9-13` fails for the single reason every unmet row in this register fails: no production
credential exists in this environment. It is recorded as its own row rather than folded into the met
ones, and **it is not restated to match what was achievable** — the honest form is *"the propagation
was not demonstrated against a real copy"*, not *"the propagation was proved by argument"*, which is
a different and weaker claim already credited at `G-S9-12`. Collapsing the two would be the failure
mode SUB-5 recorded against its own `G-S5-6` and SUB-6 against its three.

**What SUB-9 does not assert here.** Nothing about production: no row count, no population size, no
backup fact, no provider identity, and `observed-in-production` used **zero** times. Nothing about
whether the disposal in `DR-C11-S9-1` has been executed — it has not, and `R-S9-1` carries that with
a named owner. Nothing about what the external providers retain — `F-S9-1` names the exposure and
`SPK-S9-1` records that its terms are unknown. Nothing about confinement, which is SUB-5's under
OUT-8. Nothing about the tool surface: the settled **46 / 43 / 3** figure is neither re-counted nor
restated in this sub-task's output. **`42` appears nowhere in it as a codebase fact**, and the scope
of that claim is stated precisely because an earlier revision said *"appears nowhere in it"*
unqualified and **was false** — the same near-miss `G-S11-6` records against itself one section
above. Two occurrences exist and both are disclosed: `42` appears **twice in this sub-task's own
`R-S9-3`** (`92_risk-register.md` § SUB-9), each time naming *the miscount itself* as the precedent
for a figure travelling without its qualification, which is what that entry is about; and once as a
substring of the line range `` `03_…md:134`–`:142` ``. **Neither is a tool-surface assertion.**
Separately checked and disclosed: **no `file:line` citation in this sub-task's output lands on line
42**, established by extracting every `:NN` token mechanically rather than by assertion. And **no QA
pass** — the
`qa-execution` surface is unconfigured, so the automated QA phase is a genuine Core Article 8 no-op,
carried at package level as `CAP-S1-3`. No file under `src/` or `drizzle/` changes, no DDL is
authored, no migration is executed, and no test is written.

---

### SUB-13

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-S13-1` | The DDL is **complete text** for every schema object the package requires, and represents **all three principal states** without folding any two together. | **met** | `13_the-ddl-the-migration-plan-and-the-runbook.md` §2 — the ownership key on ten tables with ten indexes; the log carrier (two columns, three-valued kind); the token carrier (three columns, two-valued kind, plus a generated `learner_key`); the partial unique index; the consent table; the RLS appendix. Eight `CHECK` constraints on the two carriers, and ten in the chapter counting the consent table's two. `user`, `client` and `none` stay distinct on the log carrier per `DR-C11-S16-1` decision 4; the token carrier takes two because `none` is unreachable there by construction, and the two `CHECK`s are consistent rather than contradictory on SUB-5's own reconciliation. `F-S5-6` discharged. |
| `G-S13-2` | `NEU-850`'s `OUT-2` is **cited by the DDL** at a resolving path, and SUB-5's `holds` derivation is re-verified against the DDL **as written**, with any divergence routed to SUB-5 rather than fixed here. | **met** | §2.1 quotes `OUT-2` from `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53`, with its *"converged but unimplemented"* status at `:65`–`:66`. §2.6 walks `DR-C11-S5-2`'s `C1` and `C5` requirement by requirement: **no divergence on `notes`**, the category the derivation is about. **Four** divergences found **elsewhere** — `session_chunks` and the three `session_questions` children — routed together as **`F-S13-1`** to SUB-5 (NEU-997), with the choice and its three reasons recorded in `DR-C11-S13-1` rejected alternative 6. `CAP-S5-1` is **not** claimed lifted. |
| `G-S13-3` | The sweeps are **batched, idempotent and resumable**, and the batch bound is derivable **without** the row counts `OI-S6-1` records as never taken. | **met** | `DR-C11-S13-2`; §3.2–§3.6. Idempotent at the statement level (`WHERE user_id IS NULL`, `WHERE "timestamp" < :cutover`); resumable with **no progress ledger**, because the resume cursor is the target predicate itself; batched by a **wall clock** with a row ceiling as a secondary guard, which needs no throughput estimate to be safe; `FOR UPDATE … SKIP LOCKED` on every batch against `R-S15-3`'s overlap. The archive move is one atomic `DELETE … RETURNING … INSERT` so a row is never in both tables or neither. |
| `G-S13-4` | Every **pre-flight predicate limb** is independently re-verified against the codebase at this chapter's own cutoff, with `file:line` evidence, and any correction is routed rather than applied silently. | **met** | §3.7 — five limbs, re-read at `fd05ca1`, **every one of SUB-7's forwarded line numbers found exact**: difficulty `1–10` over-determined at five sites; the `ease_factor` floor unlowerable via `Math.max` at `src/config/resolve-algorithm-config.ts:12`–`:14`; three non-negativity limbs. **The predicate is forwarded unchanged and no correction is routed** to SUB-6 or SUB-7. The `operation_event_log` probe `F-S6-6` names as missing is **written** (`P-ENC-3`); the other **six** unprobed tables are named so the residual stays visible rather than being read as closed. |
| `G-S13-5` | Every stage `T0`–`T9` carries a containment section with SUB-7's disable path — control surface, operator, observable state, behaviour per position — or SUB-7's **named exception with its owner**, presented as separately executable from the reversal. **Zero blanks.** | **met** | §4.1 (ten stage sections, each with Entry / Apply / Verify / Contain / Reverse) and §5 (the control surface). **Six control variables** — four behaviour toggles plus two numeric sweep parameters, serving `T1`, `T2`'s in-flight move, `T3`, `T4`, `T6`, `T7` and `T8`; the six-rows/six-stages match is a coincidence and **not** a one-to-one mapping — `SM_ISOLATION_CARRIER_WRITE`, `SM_MIGRATION_SWEEP`, `SM_MIGRATION_SLICE_MS`, `SM_MIGRATION_SLICE_ROWS`, `SM_IDENTITY_GATE`, `SM_ADAPTER_CONFINEMENT`, with defaults and a **per-control** safe position, since the safe direction is opposite for a sweep and for the enforcement predicate. **Four named exceptions** with reasons and owners: `T0`, `T2`'s completed move, `T5`, `T9`. `DR-C11-S7-2`'s revision trigger fires. **None of the six exists** — every position is a specification, stated at each use. |
| `G-S13-6` | The repository audit proves **zero** changes to `src/`, `drizzle/` and every deployment configuration file. | **met** | `git diff --name-only origin/develop`, read path by path: zero under `src/`, zero under `drizzle/` (no file added, `drizzle/meta/_journal.json` untouched, no migration created), zero under `.github/`, `docker-compose.yml` unmodified, `pnpm-workspace.yaml` unmodified. The chapter's SQL is document text. |
| `G-S13-7` | Every number is a cited derivation, a registered stand-in with an owner and a re-validation trigger, or a deferred spike with a method and an expiry — and the **citation check** covers the checker's two blind spots rather than trusting its summary. | **met** | Two numbers are introduced and both are `A-S13-1`, argued for **shape** and not value, re-validated by `SPK-S6-2` or `SPK-S15-1`. Zero duplicate spikes: the counts are `SPK-S6-2`, the restart duration `SPK-S15-1`, both cited by id; the one new entry, `SPK-S13-1`, asks a question neither `SPK-S1-4` nor `SPK-S1-9` asks. The running spike total is **not** re-counted — `F-S9-2` owns it. On citations: the checker was run by hand (C011 is not in the gated list — `scripts/check-citation-paths.ts:21`, `CAP-S1-2`, SUB-14's), **plus** a direct grep for `…`/`...` shorthand targets in the new files (`scripts/citation-paths/checker.ts:121`) returning zero, **plus** an entry-by-entry read of the `MISSING-target` bucket (`:247`–`:266`), which the summary does not show. |

---

**SUB-13 gate totals at revision 1:** seven items, **seven met, zero met-with-cap, zero unmet.** The
absence of a met-with-cap row is not a claim of completeness — `CAP-S13-1` bounds the whole set from
outside it: **every artifact above is unexecuted**, so each row certifies that the artifact *says*
what it must, never that what it says is *true of a running system*. The four repository gates this
sub-task ran are evidence that the repository still builds, and the chapter changes no code, so they
were never capable of saying anything about the SQL; no row above cites them.

**What this gate does not establish.** Nothing about applied behaviour: no `CREATE`, `ALTER`,
`UPDATE` or `DELETE` has been executed, no stage walked, no reversal exercised and no control built.
Nothing about `OBJ-8`: `CAP-S7-1` is inherited, re-shaped and **not lifted**, and `G-S13-3` certifies
that the batch bound is *derivable*, not that any stage fits. Nothing about the RLS appendix's
efficacy, which rests on `OI-S13-2`. Nothing about the retention conflict: the chapter writes **no**
retention statement, so `F-S9-6` is untouched by design rather than by omission. Nothing about where
the consent table lands (`F-S13-3`, `OI-S13-1`). And **no QA pass** — the `qa-execution:engine`
surface is unconfigured, so the automated QA phase is a genuine Core Article 8 no-op, carried at
package level as `CAP-S1-3`; the five `wf-audit` verify-phase lenses likewise did not fire, which is
why an independent adversarial pass was run by hand and its findings folded in before publication.
