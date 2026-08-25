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

### SUB-8

**Id family.** SUB-8's rows are **`G-S8-<k>`**, scoped to the authoring sub-task on the scheme SUB-2
fixed in `decision-records/DR-C11-S2-3_provenance-persistence-and-parallel-safe-id-families.md`. The
flat `G-<n>` run SUB-1 and SUB-3 used cannot be computed by an author who cannot see a concurrently
authoring sibling's entries, and a sibling **is** authoring against this file concurrently. **SUB-14
adjudicates** the two coexisting schemes; SUB-15 and SUB-16 wrote no gate rows at all, and that
disagreement is already recorded in SUB-2's section above. Nothing above this line is touched.

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-S8-1` | Consent state is placed against C010's authority matrix with **exactly one** authority, consistent with the `08_…md`-as-revised-by-`10_…md` revision. | **met** | `08_consent-and-what-a-learner-can-export-and-erase.md` §2. **1 of 1** authority — `CMP-S4-7`, under **clause 2** of the ordered first-match-wins rule; **0** split. The revision is cited in the form `10_…md` itself fixes. `DR-C11-S8-1` records clause 5 as rejected alternative 3 and a split authority as rejected alternative 4. Neither C010 matrix is edited. |
| `G-S8-2` | The withdrawal walk enumerates **every** affected category of SUB-3's inventory with its resulting behaviour. | **met** | §6 — **33 of 33** rows (SUB-3's 32 plus `LD-S8-1`); **0** omitted. **3** affected, and the smallness of that number is reported as the result rather than smoothed. |
| `G-S8-3` | For every processing purpose the package states whether consent governs it, so the negative boundary is as explicit as the positive one. | **met** | §3 and §4 — **13 of 13** purposes carry an explicit yes/no; **3** yes, **10** no; every `no` names the basis that carries it instead. **0** unstated. |
| `G-S8-4` | The two log tables carry the classification SUB-16 determined, with their own obligation, deadline and any named retention exception — never the unattributed reading silently retained. | **met** | §7.3 (export: in scope for `user` rows, labelled partial), §8 and §8.2 (erasure: `delete` post-cutover, **`unreachable`** pre-cutover), §9 (retention: exception #4 for `LD-S3-16`; a stated 30-day position for `LD-S3-17`, discharging what `R-S16-4` named SUB-8 for). `DR-C11-S16-2` is consumed, not re-decided. |
| `G-S8-5` | A purpose resting on consent that could not actually be withdrawn is **reported as an OUT-10 finding with a named owner**, not reconciled in prose. | **met** | §4.1 and `91_findings-register.md` § `F-S8-1` — operational logging, failing withdrawability in **three** independent ways, with a named owner and `NEU-986` co-named. **0** absorbed into prose. |
| `G-S8-6` | The consent category's classification entry carries **every field of SUB-3's published shape, checked field for field**, plus its retention/erasure position after withdrawal, and is consumable by this sub-task's export-completeness check and SUB-9's unowned-copy audit — with **zero** back-edge edits to SUB-3's inventory. | **met** | §5 — `LD-S8-1`, **7 of 7** fields in SUB-3's own order (`03_learner-data-inventory-and-classification.md` §1) plus field 7. Consumed by §7.2's union as the *"plus the consent category"* term. **0** back-edge edits: `03_…md` is unmodified by this sub-task, and `git diff --numstat` shows it untouched. The id is `LD-S8-1`, deliberately not `LD-S3-33`. |
| `G-S8-7` | A table-top export produces a **learner-readable** artifact, complete against every category SUB-3 marks as the learner's plus the consent category — **zero** unaccounted for. | **met with cap** | §7.1 (six readability properties), §7.2 (**32 − 8 = 24; 24 + 1 = 25**, subtrahend named by id), §7.3 (the table-top, sub-counts 9 + 5 + 3 + 2 + 5 + 1 = 25 ✓). **0** categories unaccounted for. **Capped by `CAP-S8-1`:** the table-top is a **paper exercise over the declared schema** — no database was read and no artifact was rendered — and it is reported as one rather than as a produced export. |
| `G-S8-8` | Every retention exception carries a justification, a time bound, an owner and a stated basis; **zero** are indefinite; the consent record's own position is audited **as one of them**; and one that cannot be given all four is an **OUT-11 blocking finding**. | **met** | §9 — **5** audited, **4 pass**, **1 fails**. **0** indefinite exceptions accepted. The consent record is **exception #1**, audited and **not exempted for being the package's own**. The failure is `91_findings-register.md` § `F-S8-2`, recorded **blocking** with an owner and a resolving event. |
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
