# S3 — Traceability: the learner-data inventory

**Task:** NEU-995 (SUB-3) · **Charter:** C011 (umbrella NEU-893) · **Written:** 2026-08-25 · **Verification cutoff:** `86fb38a`, 2026-08-25
**Model:** claude-opus-5[1m]
**Outcomes covered:** OUT-9

Every row resolves into `docs/research/`, never into `_local/`.

**Evidence classes used below.** `schema-read` — a direct read of a declared schema at the stated
cutoff. `code-read` — a direct read of source that writes or reads the category. `cross-check` — a
reconciliation against another package's independently derived artifact. `consumed` — an upstream
decision or record used with its source cited, not re-derived. `authored-here` — a normative statement
this sub-task itself publishes, wherever it lives: a `90`–`97` register row, a decision record, or a
normative passage of chapter `03_`. **A green type-check or lint line is not evidence about this
package's content**, and none is cited as such.

The distinction the classes draw is **where the claim's warrant comes from** — read out of source
(`schema-read`, `code-read`), reconciled against another artifact (`cross-check`), taken from an
upstream record (`consumed`), or **authored by this sub-task** (`authored-here`). `authored-here` is
deliberately broader than "a register row": several of OUT-9's obligations — publishing the entry
shape, recording the consent seam — are discharged by normative chapter text rather than by a
register entry, and classing those as anything else would misdescribe their warrant.

## OUT-9

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| OUT-9 | The enumeration is **ten** `public` tables, **two** Drizzle-defined `infrastructure` tables, **two** raw-SQL log tables and the process-local in-memory set — re-derived at this cutoff, not inherited. | `../03_learner-data-inventory-and-classification.md` §3 | `schema-read` | confirmed | Declared schema only; whether the live schema matches is `OI-S1-4`. Capped by `CAP-S3-1`. |
| OUT-9 | `context_tokens` is the **tenth** `public` table and appears **exactly once**, never as an eleventh item beside the ten. | `../03_learner-data-inventory-and-classification.md` §3, `LD-S3-13` in §4 | `schema-read` | confirmed | — |
| OUT-9 | Every table, column group and in-memory structure appears exactly once — 32 entries, `LD-S3-1` … `LD-S3-32`. | `../03_learner-data-inventory-and-classification.md` §4–§8 | `schema-read`, `code-read` | confirmed | The process-local group rests on a manual read plus C010's agreement; no mechanical enumeration of module-level state exists. `CAP-S3-1`. |
| OUT-9 | Thirteen `public` categories over ten tables, because individuation is by column group. | `../03_learner-data-inventory-and-classification.md` §3; `../decision-records/DR-C11-S3-1_learner-data-classification-scheme.md` | `consumed` | consumed | The rule is C010's (`DR-C10-S3-1`), cited not re-derived. Its amendment is a revision trigger on `DR-C11-S3-1`. |
| OUT-9 | Each entry carries six classification fields, and that shape is **published** as the form SUB-8's consent entry must match. | `../03_learner-data-inventory-and-classification.md` §1 | `authored-here` | confirmed | Whether SUB-8's entry in fact matches is SUB-8's acceptance at position 10, not asserted here. |
| OUT-9 | The personal-data vocabulary has four values, because **no ownership column exists on any table** at this cutoff. | `../03_learner-data-inventory-and-classification.md` §2; `../decision-records/DR-C11-S3-1_learner-data-classification-scheme.md` | `schema-read` | confirmed | Twenty-five entries change status when OUT-8's column lands — a scheduled transition, named per entry. |
| OUT-9 | The bidirectional cross-check reports **30 matched + 15 unmatched = 45** in one direction and **30 matched + 2 unmatched = 32** in the other, every unmatched entry explained. | `../03_learner-data-inventory-and-classification.md` §10 | `cross-check` | confirmed | The fifteen are categories with no store at this cutoff; several will hold learner data when built. |
| OUT-9 | The two port-less log tables carry **both** classifications, one stated condition, and an explicit pointer to **SUB-16** — recorded complete, not pending. | `../03_learner-data-inventory-and-classification.md` §5; `../decision-records/DR-C11-S3-2_conditional-log-table-classification.md` | `code-read`, `authored-here` | confirmed | The determination itself is SUB-16's (OUT-15). Whether *"every core table"* covers them is `OI-S5-1`, carried as `A-S3-1`. |
| OUT-9 | `response_body` is stored whole and unredacted; the redactor is a credentials-only denylist that never touches it; the only bound is a size cap that truncates. | `../03_learner-data-inventory-and-classification.md` §5 (`LD-S3-16`), §12 | `code-read` | confirmed | A repository fact. Whether production rows contain learner text is `OI-S1-5`. |
| OUT-9 | `operation_event_log` is **indefinitely retained** and its `data` may quote learner content verbatim, capped at 256 chars on two named paths. | `../03_learner-data-inventory-and-classification.md` §5 (`LD-S3-17`) | `code-read` | confirmed | The cap bounds two orchestration paths only; it does not constrain other writers of `data`. |
| OUT-9 | The sixth copy class is inventoried as a class with **zero known members and terms that exist anyway**, carrying SUB-1's owner, retention bound and destruction condition **as recorded**. | `../03_learner-data-inventory-and-classification.md` §8 (`LD-S3-31`); `../decision-records/DR-C11-S3-3_package-own-copies-and-the-derivation-test.md` | `consumed` | consumed | Terms are SUB-1's (`../01_production-evidence-and-the-access-audit.md` §6). The redaction discipline is untested — SUB-1's `R8`. SUB-9 assigns the propagation action. |
| OUT-9 | The aggregate result set is inventoried as counts and pathology-probe results, never rows. | `../03_learner-data-inventory-and-classification.md` §8 (`LD-S3-32`) | `consumed` | `[unconfirmed]` | It does not exist at position 3; its shape is fixed by charter assumption 44. SUB-6 produces it at position 8. |
| OUT-9 | SUB-6's synthetic dry-run dataset is **excluded** by the derivation test, with the test and the reason recorded — no owner, no retention bound, no specification set for it. | `../03_learner-data-inventory-and-classification.md` §8; `../decision-records/DR-C11-S3-3_package-own-copies-and-the-derivation-test.md` | `consumed` | confirmed | The evidence that it contains no copied row is **SUB-6's acceptance at position 8**, not this chapter's. |
| OUT-9 | The consent category appears as a **recorded seam**, not an entry: created downstream, SUB-8 named as its classifying author, entry shape published, union stated — with **zero revisions owed**. | `../03_learner-data-inventory-and-classification.md` §9 | `authored-here` | confirmed | Whether SUB-8's entry matches the published shape is SUB-8's acceptance at position 10. |
| OUT-9 | Completeness is argued through three independent enumerations with a **published falsifier**, and the falsifier **fired once** and is discharged by admission. | `../03_learner-data-inventory-and-classification.md` §11 | `schema-read`, `cross-check` | confirmed | The falsifier remains standing and unretired; an eleventh process-local structure would falsify. Reported as `F-S3-2`. |
| OUT-9 | Every stated purpose is traced to a real use — **31 of 32** traceable; the one that is not is reported as a minimization finding. | `../03_learner-data-inventory-and-classification.md` §12; `../91_findings-register.md` § `F-S3-1` | `code-read` | confirmed | Bounded twice in the finding itself: a repository-level statement, and an operator's manual query is a use this method cannot see. |
| OUT-9 | The `OI-S5-1` stand-in is authored with the assumption, the adopted reading, `NEU-850` as named owner, and a re-validation trigger. | `../95_stand-in-assumption-register.md` § `A-S3-1` | `authored-here` | `[unconfirmed]` | By construction — nothing in this register is confirmed. Owner `NEU-850`; trigger is `OI-S5-1` closing. |
| OUT-9 | The controller/processor and lawful-basis question carries **exactly one** record with a stable id and a named owner, and that owner is `R10`'s escalation route. | `../93_open-items-and-provisional-register.md` § `OI-S3-1`; `../92_risk-register.md` § `R10` | `authored-here` | `[unconfirmed]` | No legal determination is made. Whether SUB-8 cites this id rather than restating the question is SUB-8's acceptance at position 10. |
| OUT-9 | Both OUT-9-owned charter § Risks rows are authored, each with severity, mitigation, named owner and escalation route. | `../92_risk-register.md` § `R10`, § `R12` | `authored-here` | confirmed | Ids computed from the charter's own row order; they **conflict with SUB-1's forward-allocation table** at rows 10–12, reported as `F-S3-3` and handed to SUB-14. |
| OUT-9 | OUT-9's outcome-register row carries its resolving evidence and a six-part **success measure** with its measured result. | `../90_outcome-register.md` § OUT-9 | `authored-here` | confirmed | Authored here, aggregated — never authored — by SUB-14. |
| OUT-9 | No file under `src/` or `drizzle/` is modified. | `../03_learner-data-inventory-and-classification.md` §13 | `code-read` | confirmed | — |

## What this file does not establish

- **It establishes nothing about production.** Every `schema-read` and `code-read` row is a statement
  about the repository at cutoff `86fb38a`. No row was counted and no value sampled; `CAP-S3-1` states
  the limit and `CAP-S1-1` states its package-wide form.
- It does not establish what consent covers, what an export contains, or what erasure does per
  category — OUT-10 and OUT-11, both SUB-8's at position 10.
- It does not establish any propagation action for any copy class, including `LD-S3-31` — OUT-12,
  SUB-9's at position 11.
- It does not establish whether a logged request is attributable to a learner — OUT-15, SUB-16's. Both
  readings and the selecting condition are published; neither is selected.
- It does not establish a legal determination of any kind. Controller/processor role and lawful-basis
  selection are `OI-S3-1`; cross-border transfer is SUB-8's own separate open item and is deliberately
  not raised here.
- It does not establish band placement or cross-register consistency (SUB-14, position 15), nor the
  package's audit set (SUB-17, position 16).
- It does not establish that C010's `../../C010-system-and-repository-architecture/04_state-category-inventory.md`
  heading count of 41 or its
  tabulated count of 45 is the intended one. The discrepancy is recorded as `F-S3-4` and routed to
  `NEU-895`; this cross-check used 45, the count its ids and subsections support.
