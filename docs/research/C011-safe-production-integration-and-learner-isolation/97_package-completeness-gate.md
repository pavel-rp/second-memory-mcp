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
| `G-23` | The `OI-S5-1` stand-in states the assumption, the adopted reading, a named owner and a re-validation trigger — never a blank field. | **met** | `95_stand-in-assumption-register.md` § `A-36`. Owner `NEU-850`; trigger is `OI-S5-1` closing; tolerance envelope and invalidating outcome both stated. The id is 36 because `A-<n>` continues the charter's numbering, which the entry explains. |
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
