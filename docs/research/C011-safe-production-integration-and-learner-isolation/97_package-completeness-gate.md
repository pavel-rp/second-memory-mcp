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
| `G-S4-3` | `BND-S4-17` is recorded **resolved here** with the naming party cited from `OI-S8-2`'s resolving event, not as a consumed constraint and not left with owner `nobody` — and the citation names `OI-S8-2`, never `OI-S8-1`. | **met** | §11 and `93_open-items-and-provisional-register.md` § *Disposition of `BND-S4-17`*. Cites `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:429`; names limb **one** as the limb that fired; owner named as `SUB-10 of C010 (NEU-984)` co-named `NEU-896`. `OI-S8-1` appears only at `:418`, where it is correctly the different item. Classified `resolved here`, **not** "owned and resolved here". |
| `G-S4-4` | A token-lifecycle walk covers mint, use, expiry, purge and cutover on both transports, every step with a defined behaviour, and expired rows have a wired purge path or a stated reason there is none. | **met** | §6 — **15 of 15** cells defined, including the unconfigured-STDIO column; none reads "unchanged". §7 and `decision-records/DR-C11-S4-3_expiry-purge-and-the-cutover-rejection-rule.md` — `deleteExpired()` wired at the mint path with a named call site, chosen for being transport-agnostic. |
| `G-S4-5` | Every class of token rejected at cutover is named, the deploy pipeline's `client_credentials` smoke principal included. | **met** | §8 — **4 of 4** classes. C2 is the smoke principal, named with its evidence (`.github/workflows/cd-prod.yml:145`–`:174`; `tests/smoke/smoke.test.ts:192`, `:207`, `:239`) and distinguished from the one-time unbound class as a **recurring** rejection. |
| `G-S4-6` | The design is audited against `DR-C10-S8-2`, adds no per-call identity argument, and satisfies checks `I2` and `I5`. | **met** | §10.4 — **7 of 7** clauses audited in a table. Zero tool input schemas change; zero per-call identity arguments added, with the apparent counterexample disclosed as `F-S4-5` rather than left for a reader to find. §10.2 — `I2` satisfied for `context_tokens` itself, consumed unchanged elsewhere. §10.3 — `I5` satisfied on both transports. |
| `G-S4-7` | OUT-7 and OUT-13 each carry an outcome-register row **authored here**, with resolving evidence and a **success measure**. | **met** | `90_outcome-register.md` § SUB-4. Both rows carry Outcome, Success measure (four clauses each), Verified by, Measured result at revision 1, an explicit does-not-claim paragraph, and Authored by. Neither measure is authored at assembly. |
| `G-S4-8` | Every residual exposure this sub-task states carries a risk-register entry with a severity, a mitigation, a named owner and an escalation route — and **zero** charter `R<n>` rows are authored. | **met** | `92_risk-register.md` § SUB-4 — `R-S4-1` (High), `R-S4-2` (High), `R-S4-3` (Medium), `R-S4-4` (Medium). All four carry every required field plus a mitigation status; two open, two partially mitigated, each naming its residual and that residual's owner. **Zero** charter rows, correctly: no § Risks row names OUT-7 or OUT-13 (charter assumption 48). |
| `G-S4-9` | No production quantity is recorded as observed; every unobtainable fact resolves to a stand-in with an owner and a re-validation trigger, or to a spike with a method and an expiry. | **met** | **`observed-in-production` is used zero times by SUB-4.** The cutover population is `A-S4-1`; STDIO reachability is `A-S4-2`; both carry owner, tolerance envelope and re-validation trigger. `SPK-S4-1` and `SPK-S4-2` each carry a read-only method, a quarantine path and a **2026-11-25** expiry, and both report **not executed**. No count, estimate or bound of any production quantity appears anywhere in this sub-task's output. |
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
