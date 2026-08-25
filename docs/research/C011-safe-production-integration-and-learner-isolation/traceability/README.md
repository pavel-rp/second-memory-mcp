# C011 traceability

**Charter:** C011 (umbrella NEU-893) · **Seeded:** 2026-08-25 by SUB-1 (NEU-993)
**Model:** claude-opus-5[1m]

One file per sub-task, mapping each outcome it covers to the specific claims that discharge it and
the evidence behind each.

## Naming

`S<n>_<slug>.md`, where `S<n>` is the authoring sub-task's number — `S1_production-evidence.md`.

## Required columns

| Column | What it records |
| --- | --- |
| **Outcome** | `OUT-<n>`, resolving into `../90_outcome-register.md`. |
| **Claim** | The specific thing asserted to discharge it — not the topic, the assertion. |
| **Discharged by** | The document, decision record (`DR-C11-S<n>-<k>`) or register entry that carries it. |
| **Evidence class** | Which signal type backs it. **A green type-check or lint line is not evidence about this package's content.** |
| **Status** | `confirmed`, `[unconfirmed]`, or `consumed`. |
| **Residual** | What the row does **not** establish, cited by id where it is an open item (`OI-S<n>-<k>`), a cap (`CAP-S<n>-<k>`) or a stand-in (`A-<n>`). |

Every row resolves into `docs/research/`, never into `_local/`.

Each file closes with a `## What this file does not establish` section.

## Citation rule inside this folder

A file here cites a **package-root sibling with one `../`** and a file in **another package with
two**. Source and non-research paths (`src/…`, `drizzle/…`) are written **bare from any depth**.

## Index

| File | Author | Outcomes |
| --- | --- | --- |
| `S1_production-evidence.md` | SUB-1 (NEU-993) | OUT-18 |
| `S2_identity-and-the-learner-key.md` | SUB-2 (NEU-994) | OUT-1, OUT-5, OUT-6 |
| `S3_learner-data-inventory.md` | SUB-3 (NEU-995) | OUT-9 |
| `S15_operational-objectives.md` | SUB-15 (NEU-998) | OUT-14 |
| `S4_stdio-gate-and-bound-context-token.md` | SUB-4 (NEU-996) | OUT-7, OUT-13 |
| `S16_attribution-and-detection.md` | SUB-16 (NEU-999) | OUT-15 |
| `S8_consent-export-and-erasure.md` | SUB-8 (NEU-1002) | OUT-10, OUT-11 |
| `S5_the-enforcement-point.md` | SUB-5 (NEU-997) | OUT-8 |
| `S11_the-client-compatibility-contract.md` | SUB-11 (NEU-1004) | OUT-16 |
