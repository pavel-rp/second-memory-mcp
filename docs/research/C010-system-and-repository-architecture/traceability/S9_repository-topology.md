# `S9` — Traceability: the repository topology decision

**Written by:** NEU-983 (SUB-9), for its own coverage · **Charter:** C010 (umbrella NEU-895)
**Written:** 2026-08-22
**Model:** claude-opus-5[1m]
**Covers:** `OUT-7`, and `OUT-10`'s spike-execution share for this sub-task — see `../01_outcome-register.md`.

The audit rows over every outcome are `NEU-985 (SUB-11)`'s; this file documents **SUB-9's own** coverage
and nobody else's. Every row below resolves into `docs/research/` or a real repository path with a
command or a line. **Zero rows resolve into `_local/` or `docs/wf-plans/`.**

Evidence classes are those of `../00_method-and-provenance.md` §1.1; statuses are the three labels of
§1.2 (`confirmed` / `[unconfirmed]` / `consumed`). **A green type-check or lint line is not evidence
about this package's content** and appears in no row below.

Two counting conventions, stated once. **(i)** Repository figures in the `Evidence` column were measured
at **`0962279`** in a dedicated worktree on 2026-08-22; where a measured value differs from a charter
assumption's, the row cites the finding that reconciles them rather than silently preferring either.
**(ii)** A row marked `consumed` asserts only that this sub-task adopted the upstream decision without
re-deciding it; it makes no claim about that decision's own support, which lives in the owner's record.

---

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| `OUT-7` | The criteria set covers build, ownership, versioning, compatibility, testing, deployment, observability, local development and release, and its nine weights were fixed before any alternative was scored. | `../14_…md` §5 criteria table; `DR-C10-S9-1` § "The criteria, and their weights, fixed before any topology was scored" | Published artifact, internally ordered — the table precedes every score and the §5.10 tie-break changes no weight | `confirmed` | The tie-break resolves a two-decisive-criteria conflict by reference to `K2`'s eliminator/discriminator split; a reader who rejects that split would score the comparison differently. Recorded in the open, not hidden. |
| `OUT-7` | Input (a), the single maintainer and operator, is a criterion input with weight **decisive** and a cited source. | `../14_…md` §3.1; `DR-C10-S9-1` criterion-input table | Direct measurement — `git rev-list --count`, `git shortlog -sn`, `git log --format='%ae'` at `0962279` | `confirmed` | Measured 720 / 468 / 252 against charter assumption 11's 648 / 431 / 217; reconciled at `F-S9-1`. Author identity is a proxy for maintainership and does not establish who reviewed or operated. |
| `OUT-7` | Input (b), the intended public MIT distribution, is a criterion input with weight **high** and a cited source. | `../14_…md` §3.2 | Citation — charter assumption 12, NEU-850's `OUT-6`; corroborated by `package.json` and a zero-match search over all four files in `.github/workflows/` at `0962279` | `confirmed` | Second Memory is **not** distributed today; the general-purpose claim is architectural, not distributional, and no row here treats intent as distribution. |
| `OUT-7` | Input (c), the DP course application's private/closed status against a public MIT core, appears as a **confirmed** criterion input with weight **decisive** — never as an `[unconfirmed]` assumption. | `../14_…md` §3 input table, §3.3; `DR-C10-S9-1` criterion-input table | Citation — charter assumption 32, status `confirmed` | `confirmed` | None. `../93_…md` is **closed** and takes no entry from this sub-task; assumptions 11, 12, 16, 24 and 32 are all confirmed and cited at the decision. |
| `OUT-7` | Input (d), the web tier's decided TypeScript/Node runtime, is a criterion input with weight **decisive**, consumed from SUB-15 rather than scored around. | `../14_…md` §3.4; `DR-C10-S15-2`; `../13_…md` §6.2, §6.5 | Citation of an upstream decision record at its published cutoff `229e8f4` | `consumed` | `CAP-S15-2` — all three SUB-15 decisions rest on `A-27`, `[unconfirmed]`, and go stale together. `K1`, `K5`, `K8`, `K9` inherit it; `DR-C10-S9-1` revision trigger 1. |
| `OUT-7` | Each of the build, testing, local-development and release scores names the web-tier runtime it was scored under, cites `DR-C10-S15-2`, and is **not** conditional. | `../14_…md` §5.1, §5.5, §5.8, §5.9 — each opens by naming TypeScript-on-Node and citing the record | Published artifact, checkable by inspection of four opening sentences | `confirmed` | `CAP-S15-2`, as above. The scores are unconditional **and** dependency-carrying; those are different properties and the distinction is stated at §9.3. |
| `OUT-7` | A single fully-public monorepo appears as an **eliminated** option with a recorded rationale, not a silent omission. | `../14_…md` §4.1, §5.10 matrix row `T0`; `DR-C10-S9-1` rejected alternative 1 | Published artifact — marked eliminated in the matrix with the rationale stated at the point of elimination | `confirmed` | The elimination rests on input (c). It is explicitly **not** made on the ports-and-adapters boundary or MCP tool compatibility, which §1 records as facts to evaluate against rather than reasons to preselect. |
| `OUT-7` | The live alternatives — a separate repository and a split-visibility arrangement — are each scored against the same nine criteria. | `../14_…md` §4.2, §5.1–§5.10 | Published artifact — one matrix, four columns, nine rows | `confirmed` | A third live shape (`T3`, public repository with a private overlay) was carried and scored rather than dropped; the set is not claimed to be exhaustive of every conceivable arrangement. |
| `OUT-7` | Every rejected alternative carries the consequence that decided it. | `../14_…md` §5.10 rejection table; `DR-C10-S9-1` § Rejected alternatives (four rows) | Published artifact — one deciding consequence per rejected option | `confirmed` | The separate-repository alternative **won** `K2` and `K3` on the merits; both wins are carried forward as `OI-S9-2` and `OI-S9-1` rather than dismissed. |
| `OUT-7` | The decisive criterion is compatibility — detection reach over the 43 gated tool schemas — argued as a contract property rather than developer convenience. | `../14_…md` §5.4; `DR-C10-S9-1` § "The decisive criterion" | Execution evidence — `SPK-S9-1` variants D and E, TypeScript 5.9.3 under the repository's own `Node16` settings | `confirmed` | Covers the **shape** class only; `CC-S8-2`'s meaning-narrowing is caught by neither topology, per `../13_…md` §6.3. `CAP-S8-1` — no `RD-S8-*` method is assumed to run. Spike expiry **2027-04-30** is inherited by this row per `../00_…md` §2.6. |
| `OUT-7` | The migration path is walked step by step against real repository facts. | `../14_…md` §8, `M1`–`M10`, preceded by a six-row measured-fact table | Direct measurement at `0962279` — `pnpm-workspace.yaml`, root directory listing, `find`/`wc` over `src/`, `tests/`, `drizzle/` | `confirmed` | Three of six facts differ from charter assumption 16 and are filed at `F-S9-2`; the workspace `packages:` key and the migration count match. No step is claimed executed — nothing was created and no `package.json` was changed. |
| `OUT-7` | NEU-850's `OUT-6` and `OUT-7` are recorded as consumed, with the `OUT-7` overlap stated as **partial** and the amendment disposition recorded. | `../14_…md` §7, §7.1, §7.2; `DR-C10-S9-1` consequence 7 | Citation — charter assumption 24; `../01_outcome-register.md` `OUT-7` | `consumed` | **No amendment routed** — this sub-task's evidence contradicts neither constraint. One mechanical ambiguity is filed as `OI-S9-3`, owner NEU-850: which manifest `OUT-6` means once there are two. |
| `OUT-7` | SUB-8's application-versus-reusable-core rule, including its distribution-line finding, is consumed as the criterion for what may live alongside the core. | `../14_…md` §3.5 | Citation of `../12_…md` at its published cutoff | `consumed` | Not restated and not re-derived here. Tool-surface figures follow `F-S8-1` (46 / 43 / 3, 49 audit entries); the charter's 45 / 42 / 40 are a miscount. |
| `OUT-7` | Accepted warning `F5.8` is declared: the deployment-shape assumption the three coupled scores rest on is stated, and the shape outcome that would reverse the selection is named. | `../14_…md` §6.1–§6.4 — assumption `DS-1` at §6.3, the reversal condition at §6.4 | Published artifact, plus direct reading of `.github/workflows/cd-prod.yml` at `0962279` for the current substrate | `confirmed` | `K6`, `K7`, `K9` are stated **unconditionally**; the coupling is declared rather than hedged. The conclusion that **no realistic shape reverses the selection** is argued structurally (`K4` is a source-resolution property) and is not a probability estimate. `OI-S9-4` hands SUB-10 the check, since SUB-10 carries no obligation to check back. |
| `OUT-10` | An uncertain-and-material topology claim was settled by a spike filed under SUB-1's template, cited **by id** at the criteria it decided. | `SPK-S9-1` (`../92_spike-register.md` § SUB-9), cited at `../14_…md` §5.3, §5.4, §5.8 and §8 `M5`/`M7` | Execution evidence — five variants, exit statuses and diagnostic codes recorded in full | `confirmed` | Run against a **stand-in** core reproducing the repository's resolution-relevant configuration, not the 169-file core itself; runtime resolution was not tested separately from type resolution. Quarantined to `_local/scratch/SPK-S9-1/` — nothing under `src/`, `tests/` or `drizzle/`, nothing merged as product code. Expiry **2027-04-30**. |
| `OUT-10` | Candidates failing the "could this have been read instead?" test were withdrawn with their reasons disclosed rather than silently dropped. | `../92_spike-register.md` § SUB-9, closing paragraphs — two candidates withdrawn, one sub-result disclosed | Published artifact naming what was read and what it answered | `confirmed` | Coverage stated as: one spike run, two candidates withdrawn, one sub-result disclosed, none omitted. |
| `OUT-10` | An uncertain-and-material claim that no spike could settle was recorded as a **cap with a named owner**, not asserted. | `CAP-S9-1` (`../91_caps-and-incomplete-scope.md` § SUB-9), owner **NEU-896** | Register entry with its full field set | `confirmed` | The cap covers `K9`'s **margin**, not its direction, and `DR-C10-S9-1` does not rest on it. Settling it would require the CI pipeline design `../14_…md` §1 is scoped out of, which is why it is capped rather than spiked. |

---

## What this file does not establish

- **It is not the outcome-coverage audit.** `NEU-985 (SUB-11)` owns those rows in its own file; nothing
  here edits a sibling's traceability file, and this file makes no claim about any outcome other than
  `OUT-7` and `OUT-10`'s spike share for this sub-task.
- **It is not a completeness judgement.** `94_package-completeness-gate.md` is `NEU-986 (SUB-12)`'s
  alone and is untouched by this sub-task.
- **No row is evidenced by a build, type-check or lint result.** Per `../00_method-and-provenance.md`
  §5, this is a documentation deliverable and those are no-regression checks, not evidence about
  content. The single exception is `SPK-S9-1`, whose `tsc` exit statuses **are** the measurement — and it
  is labelled `Execution evidence` in its rows for exactly that reason.
- **`qa-execution:engine` is unconfigured** in this project, so **no QA pass is claimed** in any row
  above or in any artifact this sub-task produced.
