# C008 — review record: PR 615's foundational-cluster map

**Slice:** SUB-11 (NEU-951), charter C008, umbrella NEU-945
**Covers:** OUT-3
**Subject file:** `docs/research/C005-dp-map/nodes/cl-1-foundational.yaml`
**Model:** claude-opus-5[1m]
**Date:** 2026-08-03

---

## Why this record exists

Merged **PR [615](https://github.com/pavel-rp/second-memory-mcp/pull/615)** added `cl-1-foundational.yaml` — **2,244 added lines in a single file** — and attached a reviewer that reported *"Copilot wasn't able to review any files in this pull request."*

That is **0 findings because zero files resolved, not because the content is clean.** Per the standing rule recorded in `04_probe-record.md`, **a review that resolves zero files is a failure signal, never a clean bill.** The file's content had therefore never been reviewed by anything, and PR 615 is merged — the reviewer only reviews open pull requests, so 615 itself can no longer be reviewed.

This record documents the re-presentation that obtained the review, and adjudicates every finding it produced.

---

## Method

`04_probe-record.md` (SUB-10 / NEU-949) recorded, by direct observation:

- The per-file diff size cap is **confirmed**; the boundary lies between **~1,893 added lines (resolves)** and **~2,185 (resolves zero)**.
- **~1,200 added lines per file** is observed to resolve and is the recommended re-presentation unit.

The subject file is **3,368 lines** on `develop` at commit `ea5910c` (larger than the 2,244 PR 615 added, because later slices appended to it). The whole current file was re-presented, in **three chunks**, each **at or below ~1,200 added lines**, each cut at a node boundary (a `  - id:` line) so every chunk is a set of whole node records.

**Mechanism.** For each part *N* a scratch base branch `review-base/neu-951-part{N}` was cut from `develop` with part *N* **removed from the file**, and a head branch `review/neu-951-part{N}` was cut from that base **restoring** it. The pull request's diff is therefore **that chunk alone, at the file's real path** — no synthetic path, no altered content.

**Reviewer registration.** Requested by a direct `gh api` POST to `/repos/pavel-rp/second-memory-mcp/pulls/{n}/requested_reviewers` naming `copilot-pull-request-reviewer[bot]`. `gh pr edit --add-reviewer` was **not used** — it is known to report success while silently failing to register. Registration was confirmed from the POST response body, which listed `Copilot` under `requested_reviewers`, for **all three** pull requests.

---

## Review-only pull requests

| Part | PR | File lines re-presented | Added lines | Registration API-confirmed | Files resolved? |
| ---- | -- | ----------------------- | ----------- | -------------------------- | --------------- |
| 1 of 3 | [649](https://github.com/pavel-rp/second-memory-mcp/pull/649) | 1–1146 (header, frozen root block → `cl-1.best-ending-at-index-state-pattern`) | **1146** | yes | _pending_ |
| 2 of 3 | [650](https://github.com/pavel-rp/second-memory-mcp/pull/650) | 1147–2237 (`cl-1.linear-sequence-dp-1d` → `cl-1.handle-grid-boundaries-and-obstacles`) | **1091** | yes | _pending_ |
| 3 of 3 | [651](https://github.com/pavel-rp/second-memory-mcp/pull/651) | 2238–3368 (`cl-1.counting-dp-over-linear-domain` → end, incl. `EXC-*`) | **1131** | yes | _pending_ |

1146 + 1091 + 1131 = **3368** — the whole file, with no gap and no overlap.

All three pull requests are **instruments and are closed unmerged**. No scratch branch content lands on `develop`.

---

## Findings

_pending — populated once the reviews land._

---

## Disposition

_pending._
