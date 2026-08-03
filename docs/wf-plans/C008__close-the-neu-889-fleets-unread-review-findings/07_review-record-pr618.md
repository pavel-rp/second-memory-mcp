# C008 — review record: PR 618's frontier map

**Slice:** SUB-13 (NEU-953), charter C008, umbrella NEU-945
**Covers:** OUT-3
**Subject file:** `docs/research/C005-dp-map/nodes/cl-4-optimization/frontier.yaml`
**Model:** claude-opus-5[1m]
**Date:** 2026-08-03

Review PRs: **664, 665, 666** · WORK IN PROGRESS — adjudication pending

---

## Why this record exists

Merged **PR [618](https://github.com/pavel-rp/second-memory-mcp/pull/618)** created `frontier.yaml` — **2,185 added lines in a single file** — and attached a reviewer that reported *"Copilot wasn't able to review any files in this pull request."*

That is **0 findings because zero files resolved, not because the content is clean.** Per the standing rule recorded in `04_probe-record.md`, **a review that resolves zero files is a failure signal, never a clean bill.** The corroboration is this very file: `frontier.yaml` reviewed *fine* on PR **631** (a small modification, 4 findings) but not on PR **618** (its 2,185-line creation) — same file, different diff size, different outcome, which no property of the file itself explains.

PR 618 is merged, and the reviewer only reviews open pull requests, so 618 itself can never be reviewed. This record documents the re-presentation that obtained the review, and adjudicates every finding it produced.

---

## Method

`04_probe-record.md` (SUB-10 / NEU-949) recorded, by direct observation:

- The per-file diff size cap is **confirmed**; the boundary lies between **~1,893 added lines (resolves)** and **~2,185 (resolves zero)**.
- **~1,200 added lines per file** is observed to resolve, and is the recommended re-presentation unit. The floor for bisection is ~200 lines.

The subject file is **2,732 lines** on `develop` at `7741989` — larger than the 2,185 PR 618 added, because NEU-938's follow-ups and NEU-950 (#661) amended it afterwards. **The file was re-presented as it stands after NEU-950, not as PR 618 left it** — NEU-950 changed both adjudicated nodes' severities, and replaying 618's revision would review superseded content.

The whole current file was re-presented in **three chunks**, each well under the ~1,200-line unit, each cut at a structural boundary so no chunk orphans a header from its body:

- **:1075** opens the `FAMILY 3 — KINETIC SEGMENT TREE <-> DP INTERPLAY` banner (`:1074` is the blank line closing `cl-4.debug-aliens-trick-failure`).
- **:1866** opens the `# AR-1 ANCHOR REQUESTS IN FLIGHT` banner (`:1865` is the blank line closing the preceding record).

**Mechanism.** For each part *N* a scratch base branch `review-base/neu-953-part{N}` was cut from `develop` with part *N* **removed** from the file, and a head branch `review/neu-953-part{N}` was cut from that base **restoring** it. Each pull request's diff is therefore **that chunk alone, at the file's real path** — no synthetic path, no altered content, no reformatting. This is NEU-951's method verbatim (`05_review-record-pr615.md` §Method), which resolved 3/3.

**Reviewer registration.** Requested by a direct `gh api --method POST /repos/pavel-rp/second-memory-mcp/pulls/{n}/requested_reviewers` naming `copilot-pull-request-reviewer[bot]`. `gh pr edit --add-reviewer` was **not used** — it is known to report success while silently failing to register. Registration was confirmed from each POST's response body, which listed `Copilot` under `requested_reviewers`, for **all three** pull requests.

---

## Review-only pull requests

| Part | PR | File lines re-presented | Added lines | Registration API-confirmed | Files resolved? |
| ---- | -- | ----------------------- | ----------- | -------------------------- | --------------- |
| 1 of 3 | [664](https://github.com/pavel-rp/second-memory-mcp/pull/664) | 1–1074 (header, `nodes:` → `cl-4.debug-aliens-trick-failure`) | **1074** | yes | **NOT PROVEN — bisected** (see below) |
| 1a (bisect) | [667](https://github.com/pavel-rp/second-memory-mcp/pull/667) | 1–554 (header → `cl-4.slope-trick-heap-implementation`) | **554** | yes | _pending_ |
| 1b (bisect) | [668](https://github.com/pavel-rp/second-memory-mcp/pull/668) | 555–1074 (`cl-4.slope-trick-on-trees` → `cl-4.debug-aliens-trick-failure`) | **520** | yes | _pending_ |
| 2 of 3 | [665](https://github.com/pavel-rp/second-memory-mcp/pull/665) | 1075–1865 (`FAMILY 3` banner → coverage/`techniques_mapped` block) | **791** | yes | **YES** |
| 3 of 3 | [666](https://github.com/pavel-rp/second-memory-mcp/pull/666) | 1866–2732 (`ar1_requests` → `self_check` → EOF) | **867** | yes | _pending_ |

1074 + 791 + 867 = **2732** — the whole file, with no gap and no overlap. The 1a/1b bisect re-covers part 1 only: 554 + 520 = 1074.

Each pull request's `gh pr view --json` confirms **exactly one changed file, zero deletions**, at `docs/research/C005-dp-map/nodes/cl-4-optimization/frontier.yaml`.

---

## Findings

_Adjudication in progress._

---

**Recorded by:** claude-opus-5[1m]
**Slice:** SUB-13 (NEU-953), charter C008, umbrella NEU-945
