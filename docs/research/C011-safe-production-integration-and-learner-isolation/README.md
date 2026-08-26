# C011 — Safe production integration and learner isolation

**Charter:** C011 (umbrella `NEU-893`) · **Assembled by:** SUB-14 (`NEU-1007`), OUT-20
**Verification cutoff:** `d526ffe` (`origin/develop`), 2026-08-26
**Status:** assembled and published. The audit set (SUB-17 / `NEU-1008`) follows at position 16.
**Model:** claude-opus-5[1m]

This file supersedes SUB-1's seed index, which named this pass as the party that would replace it.
The assembly record — what was reconciled, what was changed, and what was deliberately left alone —
is `00_method-and-provenance.md`.

---

## What this package is

A **decision package**: how the product can integrate safely with the existing production deployment,
and how one learner's data is isolated from another's. Sixteen sub-tasks, twenty outcomes
(OUT-1 … OUT-20), fifteen chapters, 37 decision records, 14 traceability files and an eight-register
band.

## What this package establishes

Read this list as the package's actual claim surface.

- **A learner identity rule** — which token claim becomes the persisted learner key, and how a
  principal's *kind* is determined without trusting the audience shape.
- **An enforcement point** that confines every read and write, placed at or below the port boundary,
  with a per-port table and the database as an independent second layer.
- **A disposition for every row already in production**, table by table, and for the pre-cutover
  population that no per-learner predicate can select.
- **A GDPR-shaped lifecycle** — inventory and classification, consent, export, erasure, and a
  propagation matrix with a completion proof per copy class.
- **A ten-stage rollout** in one total order, each stage carrying what it cannot undo and a disable
  path independent of deploy.
- **A threat model** over every ingress surface, with each critical gap turned into a gate with a
  named owner.
- **Executable-shaped artifacts** — DDL, a migration plan and a runbook — authored and reviewed.
- **A compatibility contract** over a tool surface re-counted at this package's own cutoff.

## What this package does **not** establish

This section is load-bearing. A reader who takes the list above without this one will overread the
package.

- **It is not an implementation.** No file under `src/` or `drizzle/` is changed by any sub-task.
  Nothing here has run, and nothing reaches production. The single change outside `docs/` in the
  whole charter is one entry added to the citation checker's gated list.
- **Nothing here is observed in production.** **33 spikes are designed and zero have been
  executed**, because no production credential exists in the authoring environment — `SMOKE_PROD_*`,
  `DATABASE_URL`, `AUTH_*` and `VPS_*` were probed and are unset. The label
  `observed-in-production` is applied to **zero** claims package-wide.
- **Every number is one of three things, and the package keeps them apart:** a derivation cited to a
  real path at a stated cutoff; a **stand-in** carrying an owner and a re-validation trigger; or a
  **deferred spike** with an expiry. None of them is a measurement.
- **No stage is priced.** `CAP-S7-1`: no rollout stage is shown to fit `OBJ-8`, because the two
  data-moving stages scale with row counts nobody has taken.
- **No client population is known.** `CAP-S11-1`: the compatibility contract is written for a client
  set of unknown size and composition; no existing client's behaviour was observed.
- **Count-based gates are *undefined* on STDIO, not zero.** Under STDIO no audit or event row exists
  at all — the constructing path is unreachable from `src/transport/main.ts:55`–`:59`, and only
  `src/transport/http.ts:176`–`:182` builds either pg transport. A gate reading zero there is reading
  the absence of a writer.
- **It states no legal conclusion.** Controller/processor role, lawful basis and cross-border
  transfer are product and engineering requirements here, routed to named open items — not advice.
- **It is not the completeness gate.** Whether the package is complete is SUB-17's judgement at
  position 16. This assembly makes no such claim.

## ▶ Reading order

| # | File | What it gives you | Author | Outcomes |
| --- | --- | --- | --- | --- |
| 1 | `00_method-and-provenance.md` | How the package was assembled, every count re-derived, the six adjudications, the `NEU-896` boundary and the `A-28` handover | SUB-14 | OUT-20 |
| 2 | `01_production-evidence-and-the-access-audit.md` | What is actually known about the production deployment, and what is not | SUB-1 | OUT-18 |
| 3 | `02_identity-the-learner-key-and-principal-kind.md` | Which claim is the learner key, and whether it identifies a human | SUB-2 | OUT-1, OUT-5, OUT-6 |
| 4 | `03_learner-data-inventory-and-classification.md` | Every category of learner data the system holds | SUB-3 | OUT-9 |
| 5 | `04_the-stdio-identity-gate-and-the-bound-context-token.md` | Closing the identity gate on STDIO; what the token row carries | SUB-4 | OUT-7, OUT-13 |
| 6 | `05_the-enforcement-point-that-confines-every-read-and-write.md` | The confinement mechanism, per port | SUB-5 | OUT-8 |
| 7 | `06_the-disposition-of-every-unowned-row.md` | What happens to every row already in production | SUB-6 | OUT-2 |
| 8 | `07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` | The ten stages, their irreversibility and their disable paths | SUB-7 | OUT-3, OUT-4 |
| 9 | `08_consent-and-what-a-learner-can-export-and-erase.md` | Consent scope, export, erasure and the retention exceptions | SUB-8 | OUT-10, OUT-11 |
| 10 | `09_proving-a-data-right-reaches-every-copy.md` | The copy set, the propagation matrix and the completion proof | SUB-9 | OUT-12 |
| 11 | `11_the-client-compatibility-contract.md` | What an existing MCP client is guaranteed | SUB-11 | OUT-16 |
| 12 | `12_threat-model-and-the-gates-that-authorize-implementation.md` | Every threat path, and the gates that authorize implementation | SUB-12 | OUT-17 |
| 13 | `13_the-ddl-the-migration-plan-and-the-runbook.md` | The DDL, the migration plan and the runbook | SUB-13 | OUT-19 |
| 14 | `15_operational-objectives-for-the-real-platform.md` | Numeric objectives against the platform that actually exists | SUB-15 | OUT-14 |
| 15 | `16_attribution-and-detection.md` | Making a request attributable and a failure detectable | SUB-16 | OUT-15 |

`decision-records/` holds 37 records, each with its rejected alternatives. `traceability/` resolves
each outcome to its evidence, one file per producing sub-task.

**There is no `10_` and no `14_`.** SUB-10 was retired and produced nothing; SUB-14's chapter is
`00_`, the position the package's numbering reserves for the method-and-provenance chapter.

## The eight-register band

Counts re-derived mechanically at `d526ffe`, not inherited.

| File | Register | Id family | Entries |
| --- | --- | --- | --- |
| `90_outcome-register.md` | Outcomes | `OUT-<n>` | **19** — OUT-1…OUT-19; OUT-20 is a reserved slot |
| `91_findings-register.md` | Findings | `F-S<n>-<k>` | **88** |
| `92_risk-register.md` | Risks | `R<n>`, `R-S<n>-<k>` | **49** — 11 charter-row + 38 scoped; 4 reserved |
| `93_open-items-and-provisional-register.md` | Open items | `OI-S<n>-<k>` | **34** |
| `94_caps-and-incomplete-scope.md` | Caps | `CAP-S<n>-<k>` | **12 minted** + 1 C010 disposition |
| `95_stand-in-assumption-register.md` | Stand-in assumptions | `A-<n>`, `A-S<n>-<k>` | **22** |
| `96_spike-register.md` | Spikes | `SPK-S<n>-<k>` | **33 designed, 0 executed** |
| `97_package-completeness-gate.md` | Completeness gate | `G-<n>`, `G-S<n>-<k>` | **149 rows** — content is SUB-17's |

**All eight are present**; no divergence note is owed. **406 minted ids, and none appears as an entry
in more than one register** — checked mechanically.

**`97_`'s content is SUB-17's, not this pass's.** So are OUT-20's outcome row and the four
OUT-20-owned risk entries (`R5`, `R6`, `R7`, `R15`), which sit as reserved slots. Assembly aggregates
and checks; it authors no register entry.

## Id conventions

- **`S<n>` in an id is always the sub-task number**, never a position in the dependency order.
- **`R<n>` is the row's position in the charter's § Risks table** (15 rows). A risk with no charter
  row takes the scoped `R-S<n>-<k>`.
- **`A-<n>` continues the charter's own assumption numbering; `A-S<n>-<k>` is scoped.** Both forms
  are live and the correspondence is published in `00_method-and-provenance.md` §4.1 — the flat form
  was found unsafe under concurrent authoring, so the scoped form is canonical and `A-33`/`A-34` are
  grandfathered.
- **`G-<n>` is flat for SUB-1's and SUB-3's blocks; `G-S<n>-<k>` is scoped thereafter**, for the same
  concurrency reason.

### Citing across packages — the rule, stated here for the first time

**124 id strings are defined as an entry in *both* C010 and C011**, including every one of
`OUT-1`…`OUT-12` and `G-1`…`G-25`. A bare id is therefore ambiguous unless a rule fixes it.

> **A bare id always means *this* package's own. A C010 id is always written qualified** — either in
> the form *C010's* `CAP-S4-1`, or with its full package-relative path. This holds for every family:
> `OUT-<n>`, `F-`, `R-`, `OI-`, `CAP-`, `A-`, `SPK-`, `G-` and sub-task references
> (`SUB-10 of C010 (NEU-984)`).

Prior statements of this rule covered only sub-task references and open items; extending it to every
family — and to the two flat families nobody had brought under it — was routed here by `F-S2-2` and
is discharged by this paragraph. `00_method-and-provenance.md` §6 carries the full disclosure,
including the three historical bare uses that are correct as written and are preserved.

## Citation rules — now enforced

Every relative citation resolves from **the directory of the file that contains it**.

- A package-root file cites a package-root sibling by **bare filename**.
- A file in `decision-records/` or `traceability/` cites a package-root sibling with **one** `../`,
  and a file in another package with **two**.
- A package-root file cites another package with **one** `../`.
- Source and non-research paths (`src/…`, `drizzle/…`, `docs/GLOSSARY.md`) are written repo-root-
  relative from any depth and are an **excluded class**, not a gated one.

**C011 is now in the checker's gated list** (`scripts/check-citation-paths.ts`), which discharges
`CAP-S1-2`. The gate reports the package clean across its 77 markdown files: **0 non-resolving**, 0
exemptions claimed, exit 0.

**A green run is not by itself proof, and the package says so.** The checker has three blind spots —
the `…` shorthand is silently exempt, the `MISSING-target` bucket can never fail the gate, and
hyphenated line ranges are mis-bucketed. All three were tested by hand and the results are in
`00_method-and-provenance.md` §4.5 and §5. That evidence, not the green run, is what supports the
claim that the package's citations resolve.

## Verification note — `qa-execution:engine` is unconfigured

The capability registry is `git, linear`. No capability owns the `qa-execution` surface, so the
autonomous QA phase is a genuine no-op under Core Article 8 (*core never requires a capability*)
rather than a skipped gate. **No QA pass is claimed for any sub-task in this package.** This is a
package-level condition; the id `CAP-S1-3`, cited by four merged records as though it carried this,
was never defined and is void — see `F-S11-5` and `00_method-and-provenance.md` §5.4.

## What this package hands on

- **`NEU-896`** owns cross-package convergence and the go / conditional-go decision. The boundary
  between what is handed over finished and what `NEU-896` still converges is stated as a seam in
  `00_method-and-provenance.md` §8.2.
- **C010's `A-28` re-validation trigger — *"NEU-893 lands"* — fires on this publication.** What the
  C010-side re-check is handed is stated in `00_method-and-provenance.md` §8.1: the envelope held,
  its invalidating outcome was not reached, and one contradiction (`DR-C11-S12-2`) is routed as an
  amendment to `DR-C10-S5-1`.
- Amendments and mechanisms routed to `NEU-895`, `NEU-984` and `NEU-986` are collected in
  `00_method-and-provenance.md` §8.

## Provenance

Every codebase claim in this package cites a real path at a stated cutoff, on a branch containing
C010's package. The settled tool-surface figure is **46 registered / 43 gated / 3 exempt**,
re-derived independently at this cutoff.

**On `42`.** It is C010's corrected miscount, which reached this charter's intake through
`NEU-975`'s tracker description. It is **not asserted as a tool-surface fact anywhere in this
package** — every occurrence names it as the figure that was superseded. That is a claim about `42`
as a *count*, and it is deliberately **not** the claim that no citation resolves to line 42: 62 such
references occur across 27 of the merged files, benignly, and an earlier revision of two chapters
certified their absence falsely before catching itself. **No absence claim about line numbers is made
here** — it was tested, the answer was "many", and the figure is published rather than denied. See
`00_method-and-provenance.md` §4.3.
