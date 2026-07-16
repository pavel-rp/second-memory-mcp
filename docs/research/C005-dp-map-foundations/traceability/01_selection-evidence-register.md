# Selection Evidence Register

**Task:** NEU-932 · **Compiled:** 2026-07-16 · **Extends (references, never rebuilds):** `../../C005-product-foundation/traceability/` (NEU-899 trace-record schema, relation vocabulary, orphan checks) and `../../C005-product-foundation/01_evidence-taxonomy.md` (NEU-897 seven-class taxonomy), following NEU-888's extension pattern (`../../C005-instructional-model/traceability/00_trace-extension-schema.md`).

**What is tracked:** one row per **labeled finding** this package produced, keyed by the finding's own id verbatim (`F-T-*`, `F-C-*`) — no second numbering, per NEU-899's convention. It defines no new taxonomy and no new lattice. **It adjudicates no status** — that is `../adjudication/01_selection-decision-ledger.md`.

**Relation vocabulary** is NEU-899's, unchanged. Exercised here: `REL:evidences` (finding → decision) and `REL:provisional-on` (finding → carried conflict).

---

## The register

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation | Evidences (→ decision) | Carried conflict / cap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **F-T-1** | 1 `[literature]` | source-fact (verified) | 2026-07-16 | `../01_taxonomy-selection.md` §5; `cp-algorithms.com` fetched 2026-07-16 | A table of contents is not a technique space; thin at the frontier; not authoritative over what "is DP." | `D-F1` | — |
| **F-T-2** | 1 `[literature]` | source-fact (verified) | 2026-07-16 | `../01_…` §5; `usaco.guide` fetched 2026-07-16 | Tiering is USACO-contest-shaped, not this audience's — a difficulty *signal*, never a progression authority. | `D-F1`, `D-F5` | — |
| **F-T-3** | 1 `[literature]` | survey-argument | 2026-07-16 | `../01_…` §3 comparison | An argument from the surveyed candidate set, **not a proof of non-existence**. A single frontier-reaching reference may exist outside the sweep. | `D-F1` | `CAP-1` |
| **F-T-4** | 1 `[literature]` | practitioner-observation | 2026-07-16 | `../01_…` §5 | Practitioner naming, not a formal synonymy claim. | `D-F1` | `X-D2` |
| **F-T-5** | 1 `[literature]` | negative-result (fetch failure) | 2026-07-16 | `../01_…` §5; fetch attempt returned HTTP 403 | T4's **specific entry ids are unverified at this cutoff** and are not asserted as verified. | `D-F1` | `CAP-2`, `INC-D4` |
| **F-C-1** | 1 `[literature]` | source-fact (verified) | 2026-07-16 | `../02_corpus-selection.md` §5; `cses.fi/problemset` fetched 2026-07-16 | A problem count is not technique coverage; counts drift as the set is maintained. | `D-F2` | — |
| **F-C-2** | 1 `[literature]` | source-fact | 2026-07-16 | `../02_…` §5; `../05_provenance-and-rights.md` | Dispositions rest on terms as read at this cutoff; terms change. | `D-F2`, `D-F5` | — |
| **F-C-3** | 1 `[literature]` | source-fact | 2026-07-16 | `../02_…` §5 | Ratings measure **contest performance under time pressure**, not *learning* difficulty. The only quantitative input available, and it is a proxy. | `D-F2` | `X-D3` |
| **F-C-4** | 1 `[literature]` | survey-observation | 2026-07-16 | `../02_…` §5 | Survey-level, **not a measured frequency**. | `D-F2` | `INC-D3` |
| **F-C-5** | 1 `[literature]` | source-fact | 2026-07-16 | `../02_…` §5 | An authored ramp is one expert's design judgment — class-1 evidence about *a design*, not about learning. | `D-F2` | `X-D3` (inherited NEU-887 R1) |

## Orphan / completeness checks (`SOC-#`)

Mirrors NEU-899's `OC-*`, namespaced `-S`. An item failing any check cannot silently count toward register completeness.

| Id | Check | Passing condition | Result |
| --- | --- | --- | --- |
| **SOC-1** | Finding-completeness | Every finding in `../01_…` and `../02_…` (F-T-1…5, F-C-1…5) has exactly one row. | **Pass** — 10/10. |
| **SOC-2** | Class fidelity | Every row carries the finding's own NEU-887 class, unchanged; no class-1–6 finding is presented as class 7. | **Pass** — all class 1; no external-user/expert/market claim exists in this package. |
| **SOC-3** | Provenance + cutoff present | Every row carries a source pointer and a cutoff; no cutoff silently upgraded. | **Pass** — 10/10, all 2026-07-16. |
| **SOC-4** | Limitation present | Every row carries a structural limitation. | **Pass** — 10/10. |
| **SOC-5** | Forward walk | Every finding names the decision it evidences; every settled decision (D-F1, D-F2, D-F5) is reachable from ≥1 finding. | **Pass.** **Noted honestly:** `D-F3` and `D-F4` are reachable from **no** `F-*` finding — see SOC-7. |
| **SOC-6** | No invented value | No row asserts a value for a gap or cap. | **Pass** — F-T-5 records a *failure to verify* rather than asserting the unverified id. |
| **SOC-7** | Reasoned-decision disclosure | Decisions resting on **reasoning rather than external evidence** are declared, not disguised as evidenced. | **Pass, and material:** `D-F3` (representation) and `D-F4` (partition) are **design decisions, not empirical findings**. They rest on argued constraints (parallel file ownership; disjointness-and-exhaustiveness) plus the dry-run's desk-check — not on class-1 evidence about the world. Manufacturing `F-*` rows for them would launder a design choice as a finding. `D-F4` is *justify-not-derive* **by the spec's own instruction**, so this is correct, not a gap. Their justification lives in `../04_…` §5 (PC-1…7) and `../dry-run/00_…` §4, and is auditable there. |
| **SOC-8** | No re-derivation | No row re-defines a taxonomy class, materiality clause, or relation type; each references the product-foundation file. | **Pass** — only `-S`/`-D`-namespaced ids added. |
