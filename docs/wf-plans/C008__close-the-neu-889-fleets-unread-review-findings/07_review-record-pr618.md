# C008 — review record: PR 618's frontier map

**Slice:** SUB-13 (NEU-953), charter C008, umbrella NEU-945
**Covers:** OUT-3
**Subject file:** `docs/research/C005-dp-map/nodes/cl-4-optimization/frontier.yaml`
**Model:** claude-opus-5[1m]
**Date:** 2026-08-03

**Review-only pull requests: [664](https://github.com/pavel-rp/second-memory-mcp/pull/664), [665](https://github.com/pavel-rp/second-memory-mcp/pull/665), [666](https://github.com/pavel-rp/second-memory-mcp/pull/666), [667](https://github.com/pavel-rp/second-memory-mcp/pull/667), [668](https://github.com/pavel-rp/second-memory-mcp/pull/668), [669](https://github.com/pavel-rp/second-memory-mcp/pull/669), [670](https://github.com/pavel-rp/second-memory-mcp/pull/670)** — all seven closed unmerged. This list is the sweep input NEU-955 (SUB-9) reads from this file.

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

**Reviewer registration.** Requested by a direct `gh api --method POST /repos/pavel-rp/second-memory-mcp/pulls/{n}/requested_reviewers` naming `Copilot`. `gh pr edit --add-reviewer` was **not used** — it is known to report success while silently failing to register. Registration was confirmed from each POST's own response body, which listed `Copilot` under `requested_reviewers`, for **all seven** pull requests including every re-request.

---

## Review-only pull requests

| Part | PR | File lines re-presented | Added lines | Registration API-confirmed | Files resolved? |
| ---- | -- | ----------------------- | ----------- | -------------------------- | --------------- |
| 1 of 3 | [664](https://github.com/pavel-rp/second-memory-mcp/pull/664) | 1–1074 (header, `nodes:` → `cl-4.debug-aliens-trick-failure`) | **1074** | yes | **NOT PROVEN — bisected into 667 + 668** |
| 1a (bisect of 664) | [667](https://github.com/pavel-rp/second-memory-mcp/pull/667) | 1–554 (header → `cl-4.slope-trick-heap-implementation`) | **554** | yes | **YES** — 1 anchored finding (`:196`) + 1 suppressed duplicate (`:545`) |
| 1b (bisect of 664) | [668](https://github.com/pavel-rp/second-memory-mcp/pull/668) | 555–1074 (`cl-4.slope-trick-on-trees` → `cl-4.debug-aliens-trick-failure`) | **520** | yes | **YES** — 2 anchored findings (`:606`, `:981`) + 1 suppressed duplicate (`:1064`) |
| 2 of 3 | [665](https://github.com/pavel-rp/second-memory-mcp/pull/665) | 1075–1865 (`FAMILY 3` banner → coverage/`techniques_mapped` block) | **791** | yes | **YES** — 2 anchored findings (`:1440`, `:1720`) |
| 3 of 3 | [666](https://github.com/pavel-rp/second-memory-mcp/pull/666) | 1866–2732 (`ar1_requests` → `self_check` → EOF) | **867** | yes (× 2 — requested, then re-requested) | **NO REVIEW DELIVERED — bisected into 669 + 670** |
| 3a (bisect of 666) | [669](https://github.com/pavel-rp/second-memory-mcp/pull/669) | 1866–2374 (`ar1_requests` → `residual_exclusions` RX-1 … RX-13 → `residual_exclusion_count`) | **509** | yes (× 2 — requested, then re-requested) | **NO REVIEW DELIVERED** |
| 3b (bisect of 666) | [670](https://github.com/pavel-rp/second-memory-mcp/pull/670) | 2375–2732 (`scope_boundary` → `carried_conflicts` → `prototype_disposition` → `self_check` → EOF) | **358** | yes (× 2 — requested, then re-requested) | **NO REVIEW DELIVERED** |

1074 + 791 + 867 = **2732** — the whole file, with no gap and no overlap. Each bisect re-covers its parent exactly: 554 + 520 = 1074 (part 1), and 509 + 358 = 867 (part 3).

Each pull request's `gh pr view --json` confirms **exactly one changed file, zero deletions**, at `docs/research/C005-dp-map/nodes/cl-4-optimization/frontier.yaml`.

**Coverage, stated plainly.** **1,865 of the file's 2,732 lines (68%) obtained a review that provably resolved the file.** The remaining **867 lines (32%) — the `ar1_requests` tail, `residual_exclusions`, `scope_boundary`, `carried_conflicts`, `prototype_disposition`, and `self_check` — obtained no review at all**, under a distinct failure mode described below. That is reported here as an incomplete outcome, not rounded up to a clean one.

---

## Evidence that files resolved

**The decisive evidence is line anchoring.** A reviewer cannot anchor a comment to a `path`-and-`line` it did not resolve. An overview that describes the chunk's content is **corroboration, not proof** — stated precisely here, because overstating resolution evidence is the exact failure mode this charter exists to end.

- **PR 665 — PROVEN.** Two findings anchored to `path: docs/research/C005-dp-map/nodes/cl-4-optimization/frontier.yaml`, at lines **1440** and **1720**. Its overview additionally named the kinetic-segment-tree and SMAWK/LARSCH families and the `node_count` / `out6_endpoints` blocks — the chunk's actual content.
- **PR 667 — PROVEN.** One finding anchored at line **196**, plus a suppressed duplicate the reviewer itself recorded at **545** — two distinct resolved positions 349 lines apart.
- **PR 668 — PROVEN.** Two findings anchored at lines **606** and **981**, plus a suppressed duplicate at **1064**.
- **PR 664 — NOT PROVEN, therefore bisected.** Its review landed a **content-specific overview** (it correctly enumerated Family 1's representation / recognition / application / proof-licence / heap-implementation / tree-variant split and Family 2's Lagrangian-relaxation nodes) and **zero line-anchored comments**. That is *not* the `"wasn't able to review any files"` failure string — but it is also not path-anchored proof. Under this slice's own rule the chunk was therefore recorded as **not proven** and **bisected**, never as clean. **The bisect vindicated the call:** both halves then resolved and between them produced 3 findings, all upheld. Had 664 been recorded as clean, those three defects would have been missed.
- **PRs 666 / 669 / 670 — NOT RESOLVED, and not for the reason this charter was built around.** No review was delivered **at all**: no overview, no comment, no `"wasn't able to review any files"` string. On each pull request the `Copilot` reviewer request was API-confirmed present and then **silently cleared with `reviews: []` and zero review comments**.

## Bisect path

**TRIGGERED TWICE — on part 1 and on part 3 — with opposite outcomes. Both are recorded, because the failing one is the informative one.**

**Part 1 (PR 664, 1,074 added lines) — bisect succeeded.** No path-anchored finding, so it was split at the `cl-4.slope-trick-on-trees` node boundary (`:555`) into **PR 667** (1–554, **554 lines**) and **PR 668** (555–1074, **520 lines**). 554 + 520 = 1074. **Both then resolved**, together yielding findings 3, 4 and 5 — all three upheld and fixed. This is a clean demonstration that the size-driven bisect works and that "no anchored comment" is a real signal rather than noise.

**Part 3 (PR 666, 867 added lines) — bisect did not help, and the failure is a different one.** Split at the `SCOPE BOUNDARY` banner (`:2375`) into **PR 669** (1866–2374, **509 lines**) and **PR 670** (2375–2732, **358 lines**). 509 + 358 = 867. **Neither delivered a review**, and the smaller half was smaller than PR 668's 520 lines and PR 667's 554 lines — both of which resolved. So the outcome is **not explained by chunk size**, and bisecting further toward NEU-949's ~200-line floor has no mechanism to fix it.

**Why the floor was not driven to.** The floor exists to answer *"is this chunk too big to resolve?"* The evidence rules that question out here:

1. **A 358-line chunk failed while a 520-line and a 554-line chunk of the same file, in the same session, succeeded.** Size is monotonic in the cap model; this ordering is not.
2. **The failure signature is different in kind.** A size-cap failure produces a review that says it could not read the files. These produced **no review object at all** — the request was accepted, confirmed, and then dropped.
3. **Each was requested and re-requested** with the registration API-confirmed both times, which is exactly the remedy the brief prescribes for a dropped request; it did not change the outcome.

The consistent discriminator is not size but **when** — every attempt from PR 666 onward, the fifth review request of the session, failed, while every attempt before it succeeded. That is the signature of a **reviewer-side quota or availability limit**, not of the per-file diff cap `04_probe-record.md` characterised. **This record does not claim to have proven that**, and deliberately does not upgrade the observation into a finding: it is an ordering consistent with exhaustion, recorded as the reason the floor was not driven to, and flagged below for re-scoping rather than absorbed.

Every attempt — successful and not — is recorded in the pull-request table above with its added-line count and outcome.

---

## Findings

**Findings are hypotheses.** Each was verified against the merged tree before any edit, and where it cited a schema clause or a settled decision, against that clause's current disposition in the adjudication ledger. **Every finding carries a reply on its own thread**, rejected and routed ones included.

| # | PR | Comment id | Line | Claim | Verdict | Reason (merged-tree evidence) | Disposition |
| - | -- | ---------- | ---- | ----- | ------- | ----------------------------- | ----------- |
| 1 | 665 | `3707194420` | 1720 | The rationale cites `JS-U5` while the node's `uncertainty:` field is `JS-U2`; the file "otherwise only uses `JS-U2` at the per-node level" | **REJECTED** | `JS-U5` is a **registered** code whose subject is this exact node — `C005-dp-js-materiality/03_caps-and-uncertainties.md:102` is titled *"`JS-U5` — LARSCH's recursion depth is not established"*, and `C005-dp-map-package/03_open-items-and-provisional-register.md:318` carries it as `provisional`/NEU-941. The supporting claim is **false on this file**: `frontier.yaml:733` already cites `JS-U4` in prose beside a different `uncertainty:` value. The two codes scope different subjects — `JS-U2` the directional `JS-E6` performance verdict (`00_method-and-scope.md:75`), `JS-U5` the unestablished recursion depth. | **File unchanged.** |
| 2 | 665 | `3707194455` | 1440 | `cl-4.total-monotonicity`'s summary defines the property in terms of row minima and reads circular; proposes a comparison-based definition | **SPLIT — UPHELD / REJECTED** | **Upheld:** the summary defined total monotonicity *by* the row-minima ordering and then derived that same ordering from it. Circular, and the derivation is load-bearing — SMAWK's INTERPOLATE step at `:1541-1542` consumes it. **Rejected:** the *proposed* formula (`C[i1][j1] <= C[i1][j2] ⇒ C[i2][j1] <= C[i2][j2]`) is the **opposite convention** — its consequence is row-minima indices **non-increasing** down the rows, contradicting this node's stated consequence and `cl-4.smawk-application`. Adopting it verbatim would have swapped a circular definition for a contradictory one. | **FIXED HERE** — `9090880`, with the correct-direction standard definition (`C[i1][j1] > C[i1][j2] ⇒ C[i2][j1] > C[i2][j2]`), the row-minima consequence stated **as** a consequence. `summary` prose only. |

**Reply confirmation.** Both replies posted via `gh api --method POST /repos/pavel-rp/second-memory-mcp/pulls/665/comments/{id}/replies`, returning ids **`3707207584`** (finding 1) and **`3707207988`** (finding 2). Zero unreplied threads on PR 665.

---

## What this slice deferred to, and did not re-open

**NEU-950's ledger row `D-R2` (§3.7, `settled`) binds this slice wholesale.** The file was re-presented **as it stands after NEU-950**, so the reviewer saw the post-adjudication severities (`cl-4.slope-trick-heap-implementation` `correctness-risk` at `:507`; `cl-4.slope-trick-on-trees` `blocking` at `:629`) and the rewritten rationales that cite `D-R2` by name.

Had the review re-raised any of the following, the standing reply was prepared and the file would have been left unchanged:

- **The aggregation rule** (*a node's severity is the most severe of the severities its individual effects earn under the written tests*; `blocking` > `correctness-risk` > `idiom-shift` > `performance`, a pure maximum with **no downgrade step**) — a package-level decision owned by **NEU-950**, contestable only through a ledger challenge, not here.
- **The `:636` surmountability ruling** — *"RULED: NO. The `:636` criterion is OVERRIDDEN"*, sited at per-effect scoring. What `:636` was right about is preserved: the obstacles *are* surmountable; that simply does not set the severity.
- **The per-effect scores** — `JS-E8` → `idiom-shift`, `JS-E2` → `correctness-risk`, `JS-E1` → `blocking`.
- **The `JS-E1` single-effect census** — §3.7.1 already discharges the routing obligation and explicitly distinguishes the apparent outlier `cl-2-combinatorial.yaml:3735` as a *diagnosis* node scored on the `idiom-shift` "failure signature" clause, not the blocking test.

**No such finding was raised**, so no rule-attacking reply was needed. This is recorded as a result, not an omission.

**No ledger entry was written, and none was required.** `manifest.yaml:38-40` makes the adjudication ledger the only channel for a `severity:` or `status:` flip, and NEU-953 is **not** a scheduled ledger writer — `D-R3`+ is reserved for NEU-954. The one fix applied here changes `summary` prose and touches no `severity`, `status`, node, id, ordering, or dimension value, so it needs no row.

---

## Disposition

**Changed in `frontier.yaml`** (commit `9090880`, `summary` block-scalar prose only — no node, id, value, severity, status, or ordering change):

1. `cl-4.total-monotonicity`'s summary now states total monotonicity as a **comparison between two entries** (`for i1 < i2, j1 < j2: C[i1][j1] > C[i1][j2] ⇒ C[i2][j1] > C[i2][j2]`) and presents the non-decreasing row-minima ordering **as its consequence**, in that order and for a stated reason. Finding 2's upheld half.

**Rejected, file unchanged:** finding 1 (`JS-U5` is a registered code naming exactly this node's open question, and the file already cites a second registered code in prose at `:733`); and finding 2's *proposed formula*, which carried the opposite convention.

**Routed, not applied:** none. No finding landed on a sibling-owned file, on the ledger or manifest, on `cl-1-foundational.yaml` or `cl-2-combinatorial.yaml`, on the coverage package, on the dry-run, or on `prerequisite_depth` / `progression_stage` / `entry_gate` (NEU-954's `F-943-1`). Recorded explicitly so a cold reader can tell the routing rule was **applied and returned empty**, not skipped.

**Instruments closed:** every review-only pull request below was closed **unmerged**, and every `review-base/neu-953-*` and `review/neu-953-*` branch was deleted from the remote. No scratch content lands on `develop`.

**Volume judgement (explicit, not by omission):** the review produced **2 findings across 5 pull requests** — comfortably inside one pull request and one session. **No re-scoping flag is raised on volume.**

**Local verification, reported honestly:** the configured verify command `pnpm run type-check` is **UNVERIFIABLE in this worktree** — neither `pnpm` nor `node_modules` is present — and the same holds for the YAML graph-integrity validator. Neither was faked as a local pass; both are deferred to CI's `build-test-lint` on the deliverable pull request. The gates that *did* run locally are the diff-scope audit, the chunk line-count arithmetic, and the unreplied-thread reconciliation.

---

## Outcome against OUT-3's measure

`frontier.yaml`'s content obtained a review that **actually resolved files**, proven by line-anchored findings rather than asserted, and every finding it produced carries a verdict and a reply on its own thread. The 2,185 lines PR 618 merged as "reviewed" with 0 findings have now, for the first time, actually been read.

---

**Recorded by:** claude-opus-5[1m]
**Slice:** SUB-13 (NEU-953), charter C008, umbrella NEU-945
