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
| 3a (bisect of 666) | [669](https://github.com/pavel-rp/second-memory-mcp/pull/669) | 1866–2374 (`ar1_requests` → `residual_exclusions` RX-1 … RX-13 → `residual_exclusion_count`) | **509** | yes (× 2 — requested, then re-requested) | **YES** — 3 anchored findings (`:1882`, `:2017`, `:2034`) + 3 suppressed duplicates (`:1898`, `:1952`, `:2078`) |
| 3b (bisect of 666) | [670](https://github.com/pavel-rp/second-memory-mcp/pull/670) | 2375–2732 (`scope_boundary` → `carried_conflicts` → `prototype_disposition` → `self_check` → EOF) | **358** | yes (× 2 — requested, then re-requested) | **YES** — 1 anchored finding (`:2671`) + 1 suppressed duplicate (`:2673`) |

1074 + 791 + 867 = **2732** — the whole file, with no gap and no overlap. Each bisect re-covers its parent exactly: 554 + 520 = 1074 (part 1), and 509 + 358 = 867 (part 3).

Each pull request's `gh pr view --json` confirms **exactly one changed file, zero deletions**, at `docs/research/C005-dp-map/nodes/cl-4-optimization/frontier.yaml`.

**Coverage: 2,732 of 2,732 lines — 100%, with no unreviewed remainder.** Every one of the file's three chunks obtained a review that provably resolved the file, two of them only after a bisect. The five pull requests that carry the proof are **665, 667, 668, 669, 670**; their ranges are 1075–1865, 1–554, 555–1074, 1866–2374 and 2375–2732, which tile the file exactly. **No part of `frontier.yaml` is recorded here as reviewed on the strength of a parent pull request that did not resolve it** — 664 and 666 contribute no coverage and are retained in the table only as the failed attempts that triggered the bisects.

**Line anchors are quoted against `develop`'s copy of the file, which is what each pull request presented.** They do not match the current line numbers in this branch, because this slice's own fixes inserted lines above them. That is expected and is stated rather than silently reconciled.

---

## Evidence that files resolved

**The decisive evidence is line anchoring.** A reviewer cannot anchor a comment to a `path`-and-`line` it did not resolve. An overview that describes the chunk's content is **corroboration, not proof** — stated precisely here, because overstating resolution evidence is the exact failure mode this charter exists to end.

- **PR 665 — PROVEN.** Two findings anchored to `path: docs/research/C005-dp-map/nodes/cl-4-optimization/frontier.yaml`, at lines **1440** and **1720**. Its overview additionally named the kinetic-segment-tree and SMAWK/LARSCH families and the `node_count` / `out6_endpoints` blocks — the chunk's actual content.
- **PR 667 — PROVEN.** One finding anchored at line **196**, plus a suppressed duplicate the reviewer itself recorded at **545** — two distinct resolved positions 349 lines apart.
- **PR 668 — PROVEN.** Two findings anchored at lines **606** and **981**, plus a suppressed duplicate at **1064**.
- **PR 664 — NOT PROVEN, therefore bisected.** Its review landed a **content-specific overview** (it correctly enumerated Family 1's representation / recognition / application / proof-licence / heap-implementation / tree-variant split and Family 2's Lagrangian-relaxation nodes) and **zero line-anchored comments**. That is *not* the `"wasn't able to review any files"` failure string — but it is also not path-anchored proof. Under this slice's own rule the chunk was therefore recorded as **not proven** and **bisected**, never as clean. **The bisect vindicated the call:** both halves then resolved and between them produced 3 findings, all upheld. Had 664 been recorded as clean, those three defects would have been missed.
- **PR 669 — PROVEN.** Three findings anchored at lines **1882**, **2017** and **2034**, plus three suppressed duplicates at **1898**, **1952** and **2078** — six resolved positions spanning the chunk end to end.
- **PR 670 — PROVEN.** One finding anchored at line **2671**, plus a suppressed duplicate at **2673**.
- **PR 666 — NO REVIEW DELIVERED, therefore bisected.** Distinct from 664's failure and from 618's: no overview, no comment, and **not** the `"wasn't able to review any files"` string either. The `Copilot` request was API-confirmed present, then silently cleared with `reviews: []` and zero review comments — twice, across an initial request and a re-request. Nothing about the chunk was reviewed, so it contributes no coverage.

## Bisect path

**TRIGGERED TWICE — on part 1 and on part 3. Both bisects succeeded, and each answered a different failure.**

**Part 1 (PR 664, 1,074 added lines) — no path-anchored finding.** Split at the `cl-4.slope-trick-on-trees` node boundary (`:555`) into **PR 667** (1–554, **554 lines**) and **PR 668** (555–1074, **520 lines**). 554 + 520 = 1074. **Both then resolved**, together yielding findings 3, 4 and 5 — all upheld and fixed. This vindicates treating "content-specific overview, zero anchors" as *not proven* rather than clean: recorded as clean, those three defects would have been missed.

**Part 3 (PR 666, 867 added lines) — no review delivered at all.** Split at the `SCOPE BOUNDARY` banner (`:2375`) into **PR 669** (1866–2374, **509 lines**) and **PR 670** (2375–2732, **358 lines**). 509 + 358 = 867. **Both then resolved**, together yielding findings 6, 7, 8 and 9 — all four upheld and fixed. This half of the file had produced nothing across two API-confirmed requests on 666; after the bisect it produced the **largest** finding cluster of the whole exercise.

**The ~200-line floor was never approached.** The smallest chunk that resolved was **358 lines** (PR 670), comfortably above NEU-949's floor, and every chunk from 358 to 791 lines resolved. **The bisect was needed twice, and worked both times.**

**One observation, recorded but not upgraded into a finding.** Both parent failures needed a **re-request** as well as a bisect before their halves produced anything, and PR 669's and 670's reviews arrived only after their second API-confirmed registration. So the operative remedy was plausibly *request again*, with the bisect confounded alongside it — this exercise cannot separate the two, and does not claim to. What it does establish, against `04_probe-record.md`'s model, is that **a silent non-delivery is a distinct failure mode from the per-file diff-size cap**: a 358-line chunk went unreviewed under 666's framing and reviewed fine under 670's, at a size the cap cannot explain. Re-requesting is cheap and should be tried before bisecting further. **Flagged for NEU-955's remainder rather than absorbed here** — characterising it properly is a probe, and probes are NEU-949's remit, not this slice's.

Every attempt — successful and not — is recorded in the pull-request table above with its added-line count and outcome.

---

## Findings

**Findings are hypotheses.** Each was verified against the merged tree before any edit, and where it cited a schema clause or a settled decision, against that clause's current disposition in the adjudication ledger. **Every finding carries a reply on its own thread**, rejected and routed ones included.

| # | PR | Comment id | Line | Claim | Verdict | Reason (merged-tree evidence) | Disposition |
| - | -- | ---------- | ---- | ----- | ------- | ----------------------------- | ----------- |
| 1 | 665 | `3707194420` | 1720 | The rationale cites `JS-U5` while the node's `uncertainty:` field is `JS-U2`; the file "otherwise only uses `JS-U2` at the per-node level" | **REJECTED** | `JS-U5` is a **registered** code whose subject is this exact node — `C005-dp-js-materiality/03_caps-and-uncertainties.md:102` is titled *"`JS-U5` — LARSCH's recursion depth is not established"*, and `C005-dp-map-package/03_open-items-and-provisional-register.md:318` carries it as `provisional`/NEU-941. The supporting claim is **false on this file**: `frontier.yaml:733` already cites `JS-U4` in prose beside a different `uncertainty:` value. The two codes scope different subjects — `JS-U2` the directional `JS-E6` performance verdict (`00_method-and-scope.md:75`), `JS-U5` the unestablished recursion depth. | **File unchanged.** |
| 2 | 665 | `3707194455` | 1440 | `cl-4.total-monotonicity`'s summary defines the property in terms of row minima and reads circular; proposes a comparison-based definition | **SPLIT — UPHELD / REJECTED** | **Upheld:** the summary defined total monotonicity *by* the row-minima ordering and then derived that same ordering from it. Circular, and the derivation is load-bearing — SMAWK's INTERPOLATE step at `:1541-1542` consumes it. **Rejected:** the *proposed* formula (`C[i1][j1] <= C[i1][j2] ⇒ C[i2][j1] <= C[i2][j2]`) is the **opposite convention** — its consequence is row-minima indices **non-increasing** down the rows, contradicting this node's stated consequence and `cl-4.smawk-application`. Adopting it verbatim would have swapped a circular definition for a contradictory one. | **FIXED HERE** — `9090880`, with the correct-direction standard definition (`C[i1][j1] > C[i1][j2] ⇒ C[i2][j1] > C[i2][j2]`), the row-minima consequence stated **as** a consequence. `summary` prose only. |

| 3 | 667 | `3707240558` | 196 (+ suppressed dup at 545) | 10 `mapper_note` blocks disclaim a verdict (*"Observation only, not a verdict"* / *"Recorded for SUB-8, which owns any verdict"*) while their own sibling fields carry `assessed: true` and a delivered verdict | **UPHELD** | The class was **enumerated by grep, not assumed** — exactly **10** blocks carried the disclaiming phrasing, against the 2 the reviewer anchored. All 18 nodes now carry `assessed: true` with a delivered `javascript_materiality` verdict directly above the note, so every one of the 10 contradicted its own siblings. The cause is datable: SUB-8 (NEU-941, #631) delivered the verdicts these notes were written to await, and NEU-950 (#661) re-adjudicated two of them under `D-R2`. The notes were **accurate when authored** and went stale when their owner reported back. | **FIXED HERE** — `2f2957c`. Each note becomes a *retained pre-verdict observation that supports* the verdict, with every observation's substance preserved verbatim (multiset/heap gap, accumulator overflow, mergeable-heap absence, lambda-integrality discipline, certificate ratios, typed-array mitigation, LARSCH recursion depth). Only the withholding was removed. Mirrors SUB-11's disposition for the identical class in `cl-1-foundational.yaml`. **Follow-on applied in the same commit:** `self_check` item 8 asserted *"every js note … explicitly labelled 'not a verdict'"*, which this fix would have falsified — it now records its Pass as true-when-made and names what superseded it. |
| 4 | 668 | `3707235250` | 606 | In a folded (`>-`) scalar the node id is split across two lines — `cl-2.formulate-subtree-` + `recurrence` — which YAML folds to `cl-2.formulate-subtree- recurrence` | **UPHELD** | Reproduced against the merged tree. The break sits inside the one paragraph in the block that asserts **THE TARGET IS EXACT** — the defect is exactly where it does most damage. The reference is load-bearing beyond prose: this is a `cross_cluster_attachments` entry with `status: "declared"`, explicitly *declared, never drawn*, so a consumer reading the id out of the rendered rationale would carry the space through. | **FIXED HERE** — `367961f`. Reflowed so the id sits unbroken on one line; no wording changed beyond the break. `to_name` / `to_cluster` / `rationale` / `status` untouched. |
| 5 | 668 | `3707235301` | 981 (+ suppressed dup at 1064) | Two rationales say JavaScript has "no 128-bit integer"; BigInt is arbitrary-precision and can carry the comparison | **UPHELD, at both sites** | Correct, and the file **already contradicted itself** on it: `cl-4.kinetic-segment-tree-implementation` reads *"Correct JavaScript requires BigInt or split multiplication for the certificate comparison."* So the flat form was not merely imprecise but inconsistent with this file's own treatment two families later. The distinction that matters is the reviewer's: JS has no **fixed-width** 128-bit *primitive*; it does have exact arbitrary-precision integers. | **FIXED HERE** — `367961f`, at `cl-4.aliens-trick-tie-breaking-implementation` and `cl-4.debug-aliens-trick-failure`. Both now name BigInt explicitly while **keeping the point the passage exists to make**: it is a boxed, heap-allocated value rather than register-width, so a real but **costly** substitute in an inner-loop comparison — the C++ escape hatch is unavailable *in the one-token form the C++ taxonomy assumes*, not unavailable outright. The `long double` half stands: JS genuinely has no wider float. |
| 6 | 670 | `3707301523` | 2671 (+ suppressed dup at 2673) | `self_check` counts say 19 nodes / 15 skills; the file has 18 (14 skills, 4 knowledge) | **UPHELD** | Counted mechanically: `node_kind:` appears **18** times; **4** are `knowledge`, **14** are `skill` and each carries a `skill_type`. By family — slope trick 6, Lagrangian/Aliens 5, kinetic segment tree 4, SMAWK/LARSCH **3** — 6+5+4+3 = 18, ratio **4.5**. The file was contradicting itself in three directions: `node_count: 18`, `techniques_mapped`'s own note (*"4 technique families -> 18 nodes … The ratio (4.5)"*), and `self_check` items 8 and 9 (*"18/18"*) all carried the correct figure while the header banner and items 1–2 carried the stale one. **Cause:** `cl-4.verify-monge-condition` was retired when `mainstream.yaml` merged (#614) as a duplicate of SUB-6's `cl-4.quadrangle-inequality-proof` — recorded already in `carried_conflicts` `X-938-2` (*"Node count 19 -> 18"*). | **FIXED HERE** — `72260eb`, at **three** sites (the class, not the two anchored): the `WHAT IS MAPPED HERE` banner (`19 nodes` → `18`, family 4 `(4 nodes)` → `(3)`, which was the stale figure's actual source, plus a note naming the retirement and pointing at `node_count` as authoritative); `self_check` item 1 (`19/19`→`18/18`, `15/15`→`14/14`); item 2 (`19 nodes (ratio 4.75)` → `18 nodes (ratio 4.5)`). Both checks keep their **Pass** and state why it survives — 4.5 clears the schema §1.1 anti-topic-list bar by the same margin. A self-audit that is arithmetically false is worse than none. |
| 7 | 669 | `3707311516` | 1882 (+ suppressed dups at 1898, 1952, 2078) | `../../C005-dp-map-schema/…` does not resolve from `nodes/cl-4-optimization/`; it needs three levels up to `docs/research/` | **UPHELD** | Resolved on disk rather than eyeballed. This file sits at `…/C005-dp-map/nodes/cl-4-optimization/`, so `../../` reaches only `C005-dp-map/`, and `C005-dp-map-schema/` is a **sibling of `C005-dp-map`** under `docs/research/`. **The convention was settled, not assumed:** `manifest.yaml` — the package-root file — writes `../C005-dp-map-schema/…` from `C005-dp-map/`, which resolves correctly, so the authoritative file is right under the ordinary *file-relative* reading and this file's depth is simply short. **Cause:** this is the only cluster node file nested in its own subdirectory, so prefixes copied from a sibling are short by exactly one level. | **FIXED HERE** — `9a1b1d6`, at **nine** sites (the class, not the four anchored — the same error appears in the header and the tail, outside this chunk): 2 header refs, the AR-1 nomination comment (short by *two*), **2 `ledger:` field values** on AR-1-a/AR-1-b, the `residual_exclusions` banner, 2 foundations-ledger refs (RX-2, `X-938-1`), and `X-938-3`'s route. All nine now resolve to files verified present. The two `ledger:` values matter most — they are the machine-readable filing target the AR-1 requests hand to their owner. |
| 8 | 669 | `3707311538` | 2017 | `../../…/04_register-extension.md` does not resolve from this directory | **UPHELD** | Same defect and same fix as finding 7; recorded separately because it was anchored on a distinct reference. Load-bearing beyond tidiness: the `residual_exclusions` banner cites this file as the source of the materiality rule that **bounds the whole register**, *"referenced, never re-derived"* in the banner's own words — so a reader who cannot reach it is pushed toward re-deriving the bound locally, the exact failure the sentence prevents. | **FIXED HERE** — `9a1b1d6`, included in the nine-site class fix above. |
| 9 | 669 | `3707311561` | 2034 | `residual_exclusions` is an additive top-level key; siblings label it and flag the validator risk, this file does not | **UPHELD** | Both cited files carry the warning — `cl-1-foundational.yaml:3208` and `cl-2-combinatorial.yaml:53` (*"NOT part of D-S1's ratified shape: the schema fixes `nodes`, and a validator (INC-S2) may reject an unknown key"*). `frontier.yaml` carried **none**; the only pre-existing "additive" match was an unrelated use about lazy offsets in `cl-4.slope-trick-heap-implementation`. A real omission, not a deliberate difference. | **FIXED HERE** — `9a1b1d6`, **deliberately wider than requested**. `cl-2-combinatorial.yaml` has 6 top-level keys; this file has **fourteen** outside `nodes:`. Naming only `residual_exclusions` would have implied by omission that the other thirteen are ratified — **replacing a missing warning with a misleading one**. The note therefore lists all fourteen, carries the siblings' reasoning intact (INC-S2 validator risk; the NEU-935/NEU-887 acceptance bar; CL-1 and CL-2 converging on the same key name independently as evidence it belongs in D-S1), **claims no key as ratified** (SUB-2's and OUT-7's call), and **adds or removes no key**. Placed in the file header with a one-line pointer on the `RESIDUAL EXCLUSIONS` banner, mirroring `cl-2-combinatorial.yaml`'s own structure. |

**Reply confirmation.** Every finding carries a reply posted via `gh api --method POST /repos/pavel-rp/second-memory-mcp/pulls/{pr}/comments/{id}/replies`:

| Finding | PR | Comment id | Reply id |
| ------- | -- | ---------- | -------- |
| 1 | 665 | `3707194420` | `3707207584` |
| 2 | 665 | `3707194455` | `3707207988` |
| 3 | 667 | `3707240558` | `3707255068` |
| 4 | 668 | `3707235250` | `3707254359` |
| 5 | 668 | `3707235301` | `3707254696` |
| 6 | 670 | `3707301523` | `3707313076` |
| 7 | 669 | `3707311516` | `3707332368` |
| 8 | 669 | `3707311538` | `3707333534` |
| 9 | 669 | `3707311561` | `3707336081` |

**Zero unreplied threads**, reconciled mechanically on every pull request: each PR's `/comments` listing was fetched and its set of top-level comment ids differenced against the set of `in_reply_to_id` values. 665, 667, 668, 669 and 670 each returned an empty difference; 664 and 666 carry no review comments at all. The three suppressed duplicates were closed by their parent thread's reply, which says so explicitly in each case.

---

## Routed, not fixed here

**One cross-file observation, surfaced by this slice and closed by this slice.**

While verifying finding 7 it emerged that the **sibling cluster node files carry the same relative-path defect in the opposite direction**: `cl-1-foundational.yaml` and `cl-2-combinatorial.yaml` write `../C005-dp-map-schema/…` from `nodes/`, which resolves to `C005-dp-map/C005-dp-map-schema/` and does not exist — they need `../../`. `cl-3-state-compression.yaml` is internally inconsistent, using `../` in its header (`:37`, `:38`) and the correct `../../` further down (`:89`, `:2144`, `:2429`).

- **Not edited here.** `cl-1-foundational.yaml` is NEU-951's, `cl-2-combinatorial.yaml` is NEU-952's, `cl-3-state-compression.yaml` is NEU-934's. This slice's write targets are `frontier.yaml` and this record, and nothing else was touched.
- **The thread was still closed here**, in the reply to finding 7 — verdict, named owners, and the re-scoping flag — because the routing rule holds that routing the *fix* elsewhere never routes the *reply* elsewhere, and no downstream receiver exists.
- **Recorded here** so the routing is auditable, and flagged for NEU-955's itemized remainder.

Note that the reviewer did **not** raise this; it was found while checking the reviewer's claim. It is reported rather than dropped because a verification that turns up an adjacent defect and says nothing is a worse outcome than the defect.

---

## What this slice deferred to, and did not re-open

**NEU-950's ledger row `D-R2` (§3.7, `settled`) binds this slice wholesale.** The file was re-presented **as it stands after NEU-950**, so the reviewer saw the post-adjudication severities (`cl-4.slope-trick-heap-implementation` `correctness-risk` at `:507`; `cl-4.slope-trick-on-trees` `blocking` at `:629`) and the rewritten rationales that cite `D-R2` by name.

Had the review re-raised any of the following, the standing reply was prepared and the file would have been left unchanged:

- **The aggregation rule** (*a node's severity is the most severe of the severities its individual effects earn under the written tests*; `blocking` > `correctness-risk` > `idiom-shift` > `performance`, a pure maximum with **no downgrade step**) — a package-level decision owned by **NEU-950**, contestable only through a ledger challenge, not here.
- **The `:636` surmountability ruling** — *"RULED: NO. The `:636` criterion is OVERRIDDEN"*, sited at per-effect scoring. What `:636` was right about is preserved: the obstacles *are* surmountable; that simply does not set the severity.
- **The per-effect scores** — `JS-E8` → `idiom-shift`, `JS-E2` → `correctness-risk`, `JS-E1` → `blocking`.
- **The `JS-E1` single-effect census** — §3.7.1 already discharges the routing obligation and explicitly distinguishes the apparent outlier `cl-2-combinatorial.yaml:3735` as a *diagnosis* node scored on the `idiom-shift` "failure signature" clause, not the blocking test.

**No such finding was raised across any of the five resolving pull requests**, so no rule-attacking reply was needed. This is recorded as a result, not an omission: the reviewer read both adjudicated nodes — PR 667 covers `cl-4.slope-trick-heap-implementation` and PR 668 covers `cl-4.slope-trick-on-trees`, and both chunks produced anchored findings elsewhere in their range — and did not contest either severity or the rule behind them.

**No ledger entry was written, and none was required.** `manifest.yaml:38-40` makes the adjudication ledger the only channel for a `severity:` or `status:` flip, and NEU-953 is **not** a scheduled ledger writer — `D-R3`+ is reserved for NEU-954. Every fix applied here changes comment text, block-scalar prose, `self_check` `result:` strings, or a broken relative path, and touches no `severity`, `status`, `assessed`, `material`, `effects`, node, id, key, ordering, or dimension value — so none needs a row. Verified mechanically: the branch diff against `develop` contains **no changed line matching `severity:` or `status:`** in `frontier.yaml`.

---

## Disposition

**Changed in `frontier.yaml` — five commits, no node, id, key, value, severity, status, ordering, or dimension change in any of them:**

| Commit | What changed | Finding |
| ------ | ------------ | ------- |
| `9090880` | `cl-4.total-monotonicity`'s summary now states total monotonicity as a **comparison between two entries** (`for i1 < i2, j1 < j2: C[i1][j1] > C[i1][j2] ⇒ C[i2][j1] > C[i2][j2]`) and presents the non-decreasing row-minima ordering **as its consequence**, in that order and for a stated reason. `summary` block-scalar prose. | 2 (upheld half) |
| `367961f` | The folded node id `cl-2.formulate-subtree-recurrence` reflowed onto one line; both 128-bit sites rewritten to name BigInt while keeping the boxed-vs-register-width cost. `rationale` block-scalar prose. | 4, 5 |
| `2f2957c` | All **10** `mapper_note` blocks converted from verdict-withholding to retained pre-verdict observations that support the delivered verdict; `self_check` item 8's follow-on staleness recorded. Block-scalar prose. | 3 |
| `72260eb` | The stale 19-node arithmetic corrected at **3** sites — header banner (total and family 4), `self_check` items 1 and 2. Comment text and `result:` strings. | 6 |
| `9a1b1d6` | Sibling-package relative paths corrected at **9** sites (7 schema, 2 foundations), including 2 `ledger:` field values; the additive-top-level-key warning added, naming all 14 keys. Comment text and 2 path values. | 7, 8, 9 |

**Upheld and fixed: 7 of 9 findings** — and in five of the seven the fix was applied to the **whole defect class** (10 `mapper_note` blocks, 3 count sites, 9 path sites, 2 BigInt sites, 14 listed keys) rather than only to the lines the reviewer anchored. In each case the class was **enumerated by grep or by resolving paths on disk**, never assumed from the anchors.

**Rejected, file unchanged:** finding 1 (`JS-U5` is a registered code naming exactly this node's open question, and the file already cites a second registered code in prose at `:733`); and finding 2's *proposed formula*, which carried the opposite convention and would have contradicted `cl-4.smawk-application`.

**Routed, not applied:** **one** — the sibling node files' mirror-image relative-path defect (`cl-1-foundational.yaml`, `cl-2-combinatorial.yaml`, `cl-3-state-compression.yaml`), surfaced while verifying finding 7, replied to on finding 7's own thread with verdict, named owners and re-scoping flag, and left unedited. See §"Routed, not fixed here". **No finding landed** on the ledger or manifest, on the coverage package, on the dry-run, or on `prerequisite_depth` / `progression_stage` / `entry_gate` (NEU-954's `F-943-1`).

**Instruments closed:** every review-only pull request in the table above was closed **unmerged**, and every `review-base/neu-953-*` and `review/neu-953-*` branch was deleted locally and from the remote. No scratch content lands on `develop`.

**Volume judgement (explicit, not by omission):** the review produced **9 findings across 7 pull requests**, 7 upheld, all fixed in one branch. That is a larger result than the 2 findings the mid-run state suggested, and larger than any sibling slice's, but it fit **one pull request and one session** with no compromise on class-wide fixes or per-thread replies. **No re-scoping flag is raised on volume.** The one item flagged for re-scoping is the silent-non-delivery observation in §"Bisect path", which is a probe question rather than a review finding.

**Local verification, reported honestly:** the configured verify command `pnpm run type-check` is **UNVERIFIABLE in this worktree** — neither `pnpm` nor `node_modules` is present — and the same holds for the YAML graph-integrity validator. Neither was faked as a local pass; both are deferred to CI's `build-test-lint` on the deliverable pull request. The gates that *did* run locally are the diff-scope audit, the chunk line-count arithmetic, and the unreplied-thread reconciliation.

---

## Outcome against OUT-3's measure

`frontier.yaml`'s content obtained a review that **actually resolved files**, proven by line-anchored findings rather than asserted, across **100% of the file's 2,732 lines**, and every finding it produced carries a verdict and a reply on its own thread. The 2,185 lines PR 618 merged as "reviewed" with 0 findings have now, for the first time, actually been read.

**The charter's Assumption 5 is confirmed on the strongest possible evidence.** PR 618's "0 findings" was an artifact of zero files resolving — not a clean bill. Re-presenting the same file's content at a reviewable size produced **9 findings, 7 of them upheld and fixed**, including a folded-scalar corruption of a cross-cluster node id, two rationales that contradicted the file's own treatment of BigInt two families later, arithmetic in the self-audit that was false against the file it audits, nine relative paths that resolved to directories that do not exist — two of them machine-readable `ledger:` filing targets — and an entire class of ten notes that withheld a verdict their own sibling fields had already delivered. **None of that was visible to PR 618's reviewer, because it read nothing.**

**The size-cap model held, with one qualification.** Every chunk from 358 to 791 lines resolved, and the ~200-line floor was never approached. But two chunks — 1,074 and 867 lines — failed in **two different ways that are both distinct from the `"wasn't able to review any files"` string** the charter was built around: one returned a content-specific overview with zero anchors, the other returned nothing at all. Both were recovered by re-requesting and bisecting. The operative lesson for the remaining slices: **treat "no line-anchored comment" as the failure signal, not the failure string** — and re-request before bisecting, since it is cheaper and was plausibly sufficient here.

---

**Recorded by:** claude-opus-5[1m]
**Slice:** SUB-13 (NEU-953), charter C008, umbrella NEU-945
