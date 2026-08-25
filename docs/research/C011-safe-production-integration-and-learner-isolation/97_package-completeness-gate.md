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

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-S2-1` | A mapping from token shape to learner key covers all three principal shapes, and every token yields exactly one defined learner key or one defined rejection, with **no case falling through to the raw `sub \|\| azp` expression**. | **met** | `02_identity-the-learner-key-and-principal-kind.md` §3 — three mutually exclusive, jointly exhaustive conditions over the `(sub, azp)` product; **0** fall-throughs. All three shapes placed in the second table with an explicit evidence status. |
| `G-S2-2` | The **absent**, **changed** and **re-used** claim cases each produce a stated, distinct outcome. | **met** | `02_…md` §4 — three cases, three distinct outcomes: no key; no automatic merge; undetectable and carried as `R-S2-1`. |
| `G-S2-3` | Check `I5` is applied to the proposed mechanism and shown to be **evaluable**, with every consumer of the identity value able to distinguish principal kinds or documented as unable to with a named residual owner. | **met** | `02_…md` §7 — both limbs have an input; **0** consumers documented as unable, so **0** residual owners named on that clause. Stated as *evaluable, not passing* — `I4` still fails first and masks it. |
| `G-S2-4` | `OI-S5-2` carries an explicit disposition, discharged against its own resolving event. | **met** | `02_…md` §8 and `93_open-items-and-provisional-register.md` — **closed**, all four clauses of `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:221` discharged individually. |
| `G-S2-5` | C010's `OI-S1-2` carries an explicit disposition citing the gate reassignment at `90_…md:615`; the unedited `Owner:` line at `90_…md:81` is noted **once** as a convention artefact; **no ownership finding is routed against it**. | **met** | `02_…md` §9 and `93_open-items-and-provisional-register.md`. Reassignment cited; `:81` noted as a convention artefact; **zero** ownership findings routed — `91_findings-register.md` contains none. |
| `G-S2-6` | C010's `OI-S1-2` is recorded as **closed with the observed value**. | **not met** | **No token was observed, for any shape**, so there is no observed value to close it with. Registered as `F-S2-3` in `91_findings-register.md`, with consequence, owner and escalation route. Owner: **the creator, as sole maintainer and sole operator**, escalating to **`NEU-896`** at convergence. Closable by `OI-S2-2`, `OI-S1-1` or `OI-S1-3`. |
| `G-S2-7` | The residual human-`sub` question is confined to the named shapes SUB-1 could not obtain, cites its open items, and carries a stand-in entry with a **named owner** and a **re-validation trigger**. | **met** | `95_stand-in-assumption-register.md` § `A-35` — owner and observable trigger both present, neither blank. **Zero** shapes were obtained, so the residual correctly spans **all three**; that it is not narrower is stated in `02_…md` §10 rather than presented as a tidier result. |
| `G-S2-8` | Outcome-register rows for **OUT-1, OUT-5 and OUT-6** are authored here, each carrying the outcome, its resolving evidence and its **success measure**. | **met** | `90_outcome-register.md` § SUB-2 — three rows, three success measures, three measured results. **OUT-5's measured result is reported as NOT MET**; the row and its measure exist, which is what this item asks. |
| `G-S2-9` | Every residual exposure SUB-2 states carries a risk-register entry with a severity, a mitigation, a named owner and an escalation route. | **met** | `92_risk-register.md` § SUB-2 — `R-S2-1` (High), `R-S2-2` (Medium), `R-S2-3` (Medium), all four fields present on each. **Zero charter `R<n>` rows**, correctly: no § Risks row names OUT-1, OUT-5 or OUT-6 (charter assumption 48). |
| `G-S2-10` | A review against ADR-0001's stated expiry conditions is recorded. | **met** | `02_…md` §11 — all four of ADR-0001's named conditions reviewed; none invalidates the kind rule, two would widen the key, and the widening is pre-argued at `decision-records/DR-C11-S2-1_the-persisted-learner-key.md` rejected alternative 5. |
| `G-S2-11` | No file under `src/`, `drizzle/` or any deployment configuration is modified. | **met** | `02_…md` §13 — `git diff --name-only origin/develop` lists files only under this package directory and `docs/GLOSSARY.md`. |
| `G-S2-12` | Every relative citation SUB-2 writes resolves. | **met** | `node_modules/.bin/tsx scripts/check-citation-paths.ts` run locally at cutoff `86fb38a`: C011 reports **0 non-resolving**, unchanged from SUB-1's baseline. Enforcement remains voluntary — C011 is not in the checker's gated list, capped as `CAP-S1-2` and owned by SUB-14. |
| `G-S2-13` | The settled tool-surface figure **46 registered / 43 gated / 3 exempt** is used, and the superseded miscount appears nowhere as a codebase fact. | **met** | `02_…md` §3 refers to *"the three gate-exempt tools"* only, consistent with the settled figure. The superseded numeral appears in no SUB-2 file. |
| `G-S2-14` | C010 decisions are consumed with the source cited, and any contradiction is routed to `NEU-895` rather than silently resolved. | **met** | `02_…md` §12 — four checks run (`DR-C10-S8-2`, `I5`, `NEU-850`'s `OUT-2`, `A-28`'s envelope), all returned empty. **No amendment routed.** Recorded so SUB-17 can see the check ran rather than infer it from an absence. |
| `G-S2-15` | Any new domain term gets a `docs/GLOSSARY.md` row in the same change. | **met** | `docs/GLOSSARY.md` — `learner key` and `principal kind` appended. `subject` is never used bare in any SUB-2 file. |

**SUB-2 rows: 15. Met 14; not met 1** — `G-S2-6`, which names what is missing, why, and its owner.

**What SUB-2 does not assert here.** Nothing about band placement, cross-register consistency across
all eight registers, the outcome register's total row count, the risk register's total count, or the
findings register's both-directions enumeration. Those are **SUB-14's** at position 15 and
**SUB-17's** at position 16. In particular SUB-2 asserts only that **its own** rows are present and
correctly disposed — not that the gate as a whole is satisfiable.
