# C008 — review record: PR 615's foundational-cluster map

**Slice:** SUB-11 (NEU-951), charter C008, umbrella NEU-945
**Covers:** OUT-3
**Subject file:** `docs/research/C005-dp-map/nodes/cl-1-foundational.yaml`
**Model:** claude-opus-5[1m]
**Date:** 2026-08-03

Review PRs: **649, 650, 651** · **All three resolved files** · All three closed unmerged · 7 findings · 4 upheld-and-fixed · 3 rejected · 3 routed

---

## Why this record exists

Merged **PR [615](https://github.com/pavel-rp/second-memory-mcp/pull/615)** added `cl-1-foundational.yaml` — **2,244 added lines in a single file** — and attached a reviewer that reported *"Copilot wasn't able to review any files in this pull request."*

That is **0 findings because zero files resolved, not because the content is clean.** Per the standing rule recorded in `04_probe-record.md`, **a review that resolves zero files is a failure signal, never a clean bill.** The file's content had therefore never been reviewed by anything, and PR 615 is merged — the reviewer only reviews open pull requests, so 615 itself can no longer be reviewed.

This record documents the re-presentation that obtained the review, and adjudicates every finding it produced.

---

## Method

`04_probe-record.md` (SUB-10 / NEU-949) recorded, by direct observation:

- The per-file diff size cap is **confirmed**; the boundary lies between **~1,893 added lines (resolves)** and **~2,185 (resolves zero)**.
- **~1,200 added lines per file** is observed to resolve, and is the recommended re-presentation unit.

The subject file is **3,368 lines** on `develop` at `ea5910c` — larger than the 2,244 PR 615 added, because NEU-940 (#628) and NEU-941 (#631) enriched it afterwards. **The whole current file was re-presented**, in **three chunks**, each at or below the ~1,200-line unit, each cut at a node boundary (a `  - id:` line) so every chunk is a set of whole node records.

**Mechanism.** For each part *N* a scratch base branch `review-base/neu-951-part{N}` was cut from `develop` with part *N* **removed from the file**, and a head branch `review/neu-951-part{N}` was cut from that base **restoring** it. Each pull request's diff is therefore **that chunk alone, at the file's real path** — no synthetic path, no altered content, no reformatting.

**Reviewer registration.** Requested by a direct `gh api` POST to `/repos/pavel-rp/second-memory-mcp/pulls/{n}/requested_reviewers` naming `copilot-pull-request-reviewer[bot]`. `gh pr edit --add-reviewer` was **not used** — it is known to report success while silently failing to register. Registration was confirmed from each POST's response body, which listed `Copilot` under `requested_reviewers`, for **all three** pull requests.

---

## Review-only pull requests

| Part | PR | File lines re-presented | Added lines | Registration API-confirmed | Files resolved? |
| ---- | -- | ----------------------- | ----------- | -------------------------- | --------------- |
| 1 of 3 | [649](https://github.com/pavel-rp/second-memory-mcp/pull/649) | 1–1146 (header, frozen root block → `cl-1.best-ending-at-index-state-pattern`) | **1146** | yes | **YES** |
| 2 of 3 | [650](https://github.com/pavel-rp/second-memory-mcp/pull/650) | 1147–2237 (`cl-1.linear-sequence-dp-1d` → `cl-1.handle-grid-boundaries-and-obstacles`) | **1091** | yes | **YES** |
| 3 of 3 | [651](https://github.com/pavel-rp/second-memory-mcp/pull/651) | 2238–3368 (`cl-1.counting-dp-over-linear-domain` → end, incl. `EXC-*`) | **1131** | yes | **YES** |

1146 + 1091 + 1131 = **3368** — the whole file, with no gap and no overlap.

**Evidence that files resolved.** Each of the three reviews produced a **pull-request overview naming the real path** and describing the specific node content in that chunk — PR 649 named the header, the frozen root block and the nodes through `cl-1.best-ending-at-index-state-pattern`; PR 650 named the 1D/2D linear, prefix-aggregate and grid-path nodes; PR 651 named the counting/LIS/edit-distance/Kadane nodes and the `residual_exclusions` block. Each also anchored at least one finding to a specific line of `docs/research/C005-dp-map/nodes/cl-1-foundational.yaml`, which is only possible if the file resolved. **The "wasn't able to review any files" failure did not recur on any chunk.**

**Bisect path: NOT TRIGGERED.** All three chunks resolved on first presentation, so nothing was bisected and the ~200-line floor was never approached.

All three pull requests are **instruments and were closed unmerged**. No scratch branch content lands on `develop`.

---

## Findings

Seven findings landed (three on 649, one on 650, three on 651), plus one suppressed duplicate on 650 that shares a thread with finding 4. **Findings are hypotheses** — each was verified against the merged tree, and where it cited a schema clause, against that clause's current disposition in the adjudication ledger. **Every one of the seven carries a reply on its own thread, routed ones included.**

| # | PR | Comment id | Line | Claim | Verdict | Reason (merged-tree evidence) | Disposition |
| - | -- | ---------- | ---- | ----- | ------- | ----------------------------- | ----------- |
| 1 | 649 | `3706727556` | 67 | Stale `# Dimension SET is unresolved` marker | **UPHELD** | Ledger `01_schema-decision-ledger.md:175` records `INC-S3` **DISCHARGED** by NEU-940's `dimension_set_version 1.0.0` (179/179). The marker's claim is stale; roots keeping `{}` is now by design. | **ROUTED** — line 67 is inside the **frozen root block** (`:31` `DO NOT EDIT`, `frozen: true` at `:78`); a root changes only via a ledger challenge against D-S2. Owner: **NEU-947 / NEU-950**. Re-scoping flag raised on the thread. |
| 2 | 649 | `3706727596` | 440 | Content does not match #615's (`difficulty_dimensions` populated, `assessed: true`) | **REJECTED** | The PR re-presents `develop`'s **current** content by design, not a byte-replay of #615. The enrichments are NEU-940 (#628) and NEU-941 (#631). Replaying #615 would review a superseded revision and leave the current one unread. | **Instrument-only** — no file edited anywhere. |
| 3 | 649 | `3706727629` | 818 | `mapper_note` "Foreseen, NOT assessed" beside `assessed: true` | **UPHELD** | `mapper_note` at `:817` contradicts its sibling verdict at `:799-816`. Genuine internal inconsistency. | **FIXED HERE** — `a785251`. |
| 4 | 650 | `3706724508` | 1269 | Same contradiction (cites `:1621`; suppressed dup at `:1625`) | **UPHELD** | Same class; `mapper_note` blocks at `:1264` and `:1621`. A grep established the class is **exactly four** occurrences — `:817`, `:1264`, `:1621`, `:2292`. | **FIXED HERE** — `a785251`, all four together. The suppressed `:1625` duplicate is the same thread and is closed by the same reply. |
| 5 | 651 | `3706725087` | 2273 | `difficulty_dimensions` populated, but §5.2 says mappers write `{}` | **REJECTED (on the map)** | The populated values **are** NEU-940's discharge of `INC-S3` landing; collapsing them to `{}` would delete owner-delivered work. The stale artifact is the **schema row** `01_node-and-edge-schema.md:208`, which still cites `INC-S3` as live. | **ROUTED** — schema doc owned by **NEU-947 / NEU-950**; the specific values (`prerequisite_depth`/`progression_stage`/`entry_gate`) are **NEU-954**'s (`F-943-1`), which runs after. Re-scoping flag raised on the thread. |
| 6 | 651 | `3706725128` | 2298 | `javascript_materiality` block shape is non-conforming and should stay `assessed: false` | **SPLIT — REJECTED / UPHELD** | **Rejected:** the extended shape is **OUT-5's own audit output** (NEU-941 / #631), documented in `docs/research/C005-dp-js-materiality/` and applied package-wide across `cl-2`/`cl-3`/`cl-4`. §5.2's "mapper writes `false`" is the pre-adjudication default, not a ceiling. **Upheld:** the co-located `mapper_note` at `:2292` did contradict the verdict. | Block shape **unchanged**; §5.2 staleness **ROUTED** with finding 5; `mapper_note` **FIXED HERE** — `a785251`. |
| 7 | 651 | `3706725158` | 3202 | `residual_exclusions` is an undefined additive top-level key with no warning | **UPHELD** | `cl-2-combinatorial.yaml:53-59` carries an explicit `# ADDITIVE TOP-LEVEL KEY` header naming the `INC-S2` validator risk; `cl-1-foundational.yaml` had none. Real asymmetry. | **FIXED HERE** — `a785251`; mirrored header added. The key and its `EXC-*` entries are unchanged. |

**Reply confirmation.** All seven replies posted via `gh api --method POST /repos/pavel-rp/second-memory-mcp/pulls/{n}/comments/{id}/replies`, returning ids `3706828211`, `3706828617`, `3706828978`, `3706829451`, `3706829744`, `3706830560`, `3706830999` respectively.

---

## Disposition

**Changed in `cl-1-foundational.yaml`** (commit `a785251`, comment and block-scalar prose only — no node, id, value, or ordering change; the frozen root block untouched):

1. All **four** stale `mapper_note` blocks (`:817`, `:1264`, `:1621`, `:2292`) rewritten to record that SUB-8 (OUT-5) **has since delivered** the verdict, retaining each observation's substance as a pre-verdict note. Findings 3, 4, and the upheld half of 6.
2. An **`ADDITIVE TOP-LEVEL KEY` header** added above `residual_exclusions`, mirroring CL-2's, naming the `INC-S2` validator risk and its owner and recording the independent CL-1/CL-2 convergence on the key name. Finding 7.

**Routed, not applied** (thread replied to here with verdict, named owner, and re-scoping flag — routing the fix never routes the reply):

- **Finding 1** — the stale dimension-set marker at `:67` is a real defect but sits in the **frozen root block**, changeable only via a ledger challenge against D-S2. Owner: **NEU-947 / NEU-950**.
- **Findings 5 and 6 (schema half)** — `01_node-and-edge-schema.md:208` still cites the discharged `INC-S3` as live authority. Owner: **NEU-947 / NEU-950**. The dimension **values** are **NEU-954**'s (`F-943-1`).

**Rejected outright:** finding 2 — an artifact of the review instrument, not a repository defect; no file edited anywhere.

**Instruments closed:** PRs **649**, **650**, **651** closed unmerged. No scratch branch content lands on `develop`.

**Volume judgement (explicit, not by omission):** 7 findings across 3 pull requests fit comfortably in one pull request and one session. **No re-scoping flag is raised on volume.**

**Outcome against OUT-3's measure:** `cl-1-foundational.yaml`'s content obtained a review that **actually resolved files**, and every finding it produced has a verdict and a reply on its thread. The content that PR 615 merged as "reviewed" with 0 findings has now, for the first time, actually been read.

---

**Recorded by:** claude-opus-5[1m]
**Slice:** SUB-11 (NEU-951), charter C008, umbrella NEU-945
