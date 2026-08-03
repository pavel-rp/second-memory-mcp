# C008 — review record: PR 617 (`cl-2-combinatorial.yaml`)

Review-only PRs: 4 · **All four resolved their file** · All closed unmerged · 8 findings · 7 upheld, 1 rejected, 0 routed.

This is SUB-12's deliverable (NEU-952). Merged **PR 617** added `docs/research/C005-dp-map/nodes/cl-2-combinatorial.yaml` with **2,931 added lines** and attached a reviewer that reported *"wasn't able to review any files"* — **twice**. Its "0 findings" meant zero files resolved, not clean content, and PR 617 is merged, so it cannot be reviewed directly. This record is the review that content finally received.

The review-only PRs named below are **instruments, not deliverables**. They were never merged. This committed record, plus the fix commit it cites, is what this slice ships.

---

## Method

`cl-2-combinatorial.yaml` was re-presented in **four node-boundary chunks**, each at or below the ~1,200-added-line unit that NEU-949's probe record (`04_probe-record.md`, Verdict 2) observed to resolve. Each chunk was cut at a `  - id:` line so it remains a coherent excerpt, and each was added as a single brand-new file under `review/neu-952/` on a branch off `develop` — so each PR's added-line count equals its chunk's line count exactly.

The file measured **4,068 lines** at the time of re-presentation (it is larger than PR 617's 2,931-line addition because later PRs added to it). All 4,068 lines were presented; the four chunks are contiguous and exhaustive, with no gap and no overlap.

**Chunk sizing was deliberately conservative.** NEU-949 recorded the non-resolving boundary as lying between ~1,893 (resolves) and ~2,185 (resolves zero) added lines, and named ~1,200 as the recommended unit. Every chunk here is at or below 1,221 — the largest carries roughly 960 lines of margin below the lowest observed non-resolving measurement.

### Reviewer registration

The reviewer was requested on each PR by a **direct `gh api` POST** to `/repos/pavel-rp/second-memory-mcp/pulls/{n}/requested_reviewers`, naming `copilot-pull-request-reviewer[bot]`.

`gh pr edit --add-reviewer` was **not used and not trusted** — it is known to report success while silently failing to register a reviewer. Registration was **API-confirmed for all four PRs**: the POST response body listed the reviewer under `requested_reviewers`, and a review subsequently landed on every one. No registration claim in this record rests on a command exit code.

**Two logins, one reviewer — expected, not an inconsistency.** The request is POSTed naming `copilot-pull-request-reviewer[bot]`, and the response's `.requested_reviewers[].login` reads back as **`Copilot`**; the review that later lands is authored by **`copilot-pull-request-reviewer[bot]`**. Both were observed on all four PRs. GitHub surfaces the requested-reviewer entry under the short user login and the authored review under the bot app account, so anyone reproducing this check should expect the two strings to differ and should not read the difference as a failed registration.

---

## Review-only PRs

| Chunk | PR | Source lines | Added lines | Files | Registration API-confirmed | **Files resolved** |
| ----- | -- | ------------ | ----------- | ----- | -------------------------- | ------------------ |
| 1/4 | [652](https://github.com/pavel-rp/second-memory-mcp/pull/652) | 1–1215 | **1215** | 1 | yes | **yes** — 1/1 |
| 2/4 | [653](https://github.com/pavel-rp/second-memory-mcp/pull/653) | 1216–2436 | **1221** | 1 | yes | **yes** |
| 3/4 | [654](https://github.com/pavel-rp/second-memory-mcp/pull/654) | 2437–3591 | **1155** | 1 | yes | **yes** |
| 4/4 | [655](https://github.com/pavel-rp/second-memory-mcp/pull/655) | 3592–4068 | **477** | 1 | yes | **yes** — 1/1 |

**No chunk had to be bisected.** NEU-949's recorded size held on the first attempt for all four; the ~200-line floor branch was never reached.

### Files-resolved evidence rule, and how each chunk meets it

A chunk counts as resolved only when **all three** hold: (a) the review's overview names the chunk file, (b) at least one line-anchored comment is attached to that path, and (c) the body contains no *"wasn't able to review any files"*. Criterion (b) is decisive — a comment cannot be anchored to a line of a file the reviewer did not read.

- **652** — review `4847420407`, `2026-08-03T18:31:32Z`. Explicit counter: **`Files reviewed: 1/1 changed files`**. Overview names `review/neu-952/cl-2-combinatorial.part1.yaml`; one line-anchored comment at `:646`. (a)+(b)+(c) plus the counter.
- **653** — review `4847428601`, `2026-08-03T18:32:30Z`. Overview names the file and describes its actual content ("witness reconstruction, interval/range DP, and the beginning of tree DP"); one line-anchored comment at `:433`; two further findings in a `Suppressed comments (2)` block quoting the file's own text verbatim at `:1096` and `:496`. This review omits the `Review details` counter, so the verdict rests on (a)+(b)+(c) — which it satisfies, and the verbatim quotation of interior lines is independent corroboration.
- **654** — review `4847423858`, `2026-08-03T18:31:55Z`. Overview names the file; one line-anchored comment at `:51`; one `Suppressed comments (1)` finding quoting the file verbatim at `:118`. Counter omitted; (a)+(b)+(c) satisfied.
- **655** — review `4847435921`, `2026-08-03T18:33:31Z`. Explicit counter: **`Files reviewed: 1/1 changed files`**. Overview names the file; two line-anchored comments at `:1` and `:274`.

**The string "wasn't able to review any files" does not appear as an observed outcome for any of the four.** The failure that PR 617 emitted twice did not recur.

---

## Findings ledger

Eight distinct findings. Five became posted threads; three arrived inside `Suppressed comments` blocks and never became threads at all. **All eight are adjudicated here, and all eight have a verdict visible on GitHub** — the five threads carry inline replies, the three suppressed ones are answered in a PR-level comment on their PR, because there is no thread to reply to.

Chunk→merged offsets: part1 `N`, part2 `N`+1215, part3 `N`+2436, part4 `N`+3591.

| Id | PR | Comment | Chunk anchor | Merged line | Node | Verdict | Fix |
| -- | -- | ------- | ------------ | ----------- | ---- | ------- | --- |
| F-952-1 | 652 | `3706728570` | part1:646 | 640–646 | `cl-2.unbounded-knapsack-recurrence` | **UPHELD** | `42e0bef` |
| F-952-2 | 653 | `3706734978` | part2:433 | 1643–1649 | `cl-2.implement-interval-dp-length-loop` | **UPHELD** | `42e0bef` |
| F-952-3 | 653 | suppressed | part2:1096 | 2309–2310 | `cl-2.root-an-unrooted-tree` | **UPHELD** | `42e0bef` |
| F-952-4 | 653 | suppressed | part2:496 | 1709–1711 | `cl-2.debug-interval-order-violation` | **UPHELD** | `42e0bef` |
| F-952-5 | 654 | `3706731363` | part3:51 | 2486–2487 | `cl-2.implement-tree-dp-post-order-dfs` | **UPHELD** | `42e0bef` |
| F-952-6 | 654 | suppressed | part3:118 | 2553–2554 | `cl-2.debug-tree-dp-recursion-depth` | **UPHELD** | `42e0bef` |
| F-952-7 | 655 | `3706741347` | part4:1 | n/a | (whole-file YAML validity) | **REJECTED** | — |
| F-952-8 | 655 | `3706741387` | part4:274 | 3864–3865 | `residual_exclusions` header comment | **UPHELD** | `42e0bef` |

**Count reconciliation.** The posted comments on 653 and 654 each carried "this issue also appears" pointers — 653 at chunk lines 493 and 1094, 654 at chunk line 116. Those point at the same regions as F-952-4, F-952-3 and F-952-6 respectively. They are **not** additional findings; they are the reviewer's own cross-references to the suppressed ones. Five posted threads plus three suppressed equals eight distinct sites, and the pointers add none.

### Verdict detail

**F-952-1 — UPHELD.** The summary read "the item axis stops being a prefix of decisions and becomes a choice of 'which item to use next', **which is why the state loses a dimension**." Reproduced at merged 640–646. The finding is correct: unbounded knapsack is still expressible as a 2D DP over `(i, w)`; the same-item read *licenses* the 1D collapse but does not force it. The text stated an implementation optimization as a property of the state definition. Now reads "which is what LICENSES the collapse to one dimension — an available optimization, not a forced one."

**F-952-2 — UPHELD.** The rationale claimed "C++'s `vector<vector<int>>` gives unboxed contiguous rows for free". Reproduced at merged 1643–1649. `vector<vector<int>>` is itself a row-of-rows, not one contiguous table, so the pointer chase is not a JavaScript-only cost; the genuine C++ property is that the rows hold unboxed ints. Now states exactly that, and says the JavaScript translation "can additionally box the elements" rather than that it always does. The actionable JavaScript guidance (flat `Int32Array`, `i * n + j`) and `severity: "performance"` are unchanged.

**F-952-3 — UPHELD.** "the default 8 MB process stack absorbs [2e5 frames] and ... judges routinely raise further", at merged 2309–2310. Correct objection: depth 2e5 is a stack-overflow risk in C++ too and judge limits vary. Now "a typical 8 MB process stack absorbs and ... some judges raise further — platform-dependent, not guaranteed."

**F-952-4 — UPHELD.** "has no C++ counterpart" and "one signature, always", at merged 1709–1711. Both were absolute claims that do not hold generally — the failure signature depends on table initialization and sentinels in either language. Now "with no routine C++ counterpart", "is typically a zero-initialized vector", "usually one signature". The `Array` vs `TypedArray` differential the finding itself credits is retained; `severity: "idiom-shift"` unchanged.

**F-952-5 — UPHELD.** "the default 8 MB stack absorbs it, and judges raise the limit for the cases that need more", at merged 2486–2487. Platform-dependent, stated as fact. Now "a typical 8 MB stack absorbs it and some judges raise the limit further, platform-dependent."

**F-952-6 — UPHELD.** C++ segfault "at a depth on the order of 1e5-1e6, and the standard fix is to raise the stack limit — an option that exists", at merged 2553–2554. Depth limits and stack adjustability vary; some environments require an iterative rewrite in C++ as well. Now "platform-dependent (often ~1e5-1e6)" and "an option that may exist". The JavaScript side — the named catchable `RangeError` at ~1e4 frames, the unavailable knob, the explicit-stack rewrite as the only remedy — is untouched.

**F-952-7 — REJECTED, with the reproduction as the reason.** The finding said the chunk file "is not valid YAML: it starts with an indented sequence item ... add the missing top-level `nodes:` key." This is an **artifact of the instrument, not a defect in the reviewed content**. `review/neu-952/cl-2-combinatorial.part4.yaml` is a verbatim excerpt of source lines 3592–4068, cut at a node boundary. In the merged file `nodes:` is present at **line 99**, and the top-level keys are `schema_version`, `cluster`, `map_version`, `nodes`, `residual_exclusions`, `exclusion_count`. Adding `nodes:` to the excerpt would make the instrument diverge from the content it exists to present. No edit.

**F-952-8 — UPHELD.** The `residual_exclusions` header comment documented `disposition` as `"owned-elsewhere" | "not-dp"` — and **neither value appears anywhere in the file**. The 12 entries use exactly two values: `"owned-by-sibling-cluster"` (10 entries) and `"scoped-out-with-rationale"` (2). In the **reviewed** tree they sat at 3897, 3915, 3925, 3948, 3962, 3977, 3990, 4002, 4041, 4057 and 3871, 4018; the comment fix added one line at 3864, so in the **shipped** tree each is one line lower (3898 … 4058, and 3872, 4019). The values themselves are byte-identical — only the comment above them changed. The finding's own disjunction ("either the comment is outdated or the enum values are") resolves to the comment: the values are adjudicated data, and changing them would be a content change rather than a documentation fix. Comment corrected; the `disposition` values are byte-identical.

---

## Cross-file routing

**No finding landed on a file this slice does not own.** All eight target `cl-2-combinatorial.yaml` or the chunk instruments themselves, so the routing rule was provisioned but not triggered — no thread required a named external owner, and none was left for a downstream receiver that does not exist.

**One adjacency was handled explicitly rather than silently.** F-952-3, F-952-5 and F-952-6 all sit inside nodes carrying `effects: ["JS-E1"]` and `severity: "blocking"` (merged lines 2304, 2481, 2548). A discrimination line was drawn and stated on every one of those threads:

- A claim about the **factual accuracy of the C++-side prose** inside `rationale:` is this slice's to fix. That is what all three were, and what was fixed.
- A claim about **JS-E1's per-effect score, or the `severity` that follows from it**, is **NEU-950's** ruling, made through the schema decision ledger — `docs/research/C005-dp-map/manifest.yaml` requires severity to move through a ledger entry, never a local edit.

`docs/research/C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` was checked and carries **no `JS-E1` entry**, so no ruling had merged when this adjudication was made. Nothing here pre-empts it. Every reply states that if the finding is read as an attack on the severity rather than the prose, it is **ROUTED to NEU-950** and flagged as outside this slice's decomposed scope.

**What the fix commit does not touch, verified in the diff:** `material`, `effects`, `severity`, `uncertainty`, node `status`, and every `prerequisite_depth` / `progression_stage` / `entry_gate` value (NEU-954's, under `F-943-1`). The three `severity: "blocking"` lines remain byte-identical at their original line numbers 2304, 2481 and 2548 — every edit was made line-count-neutral so this is mechanically checkable.

---

## Replies posted

| Target | Kind | Reply id |
| ------ | ---- | -------- |
| 652 thread `3706728570` | inline reply | `3706887659` |
| 653 thread `3706734978` | inline reply | `3706888161` |
| 654 thread `3706731363` | inline reply | `3706888576` |
| 655 thread `3706741347` | inline reply | `3706889025` |
| 655 thread `3706741387` | inline reply | `3706889438` |
| 653 suppressed F-952-3, F-952-4 | PR-level comment | `5170501604` |
| 654 suppressed F-952-6 | PR-level comment | `5170502200` |

Every posted thread on all four PRs carries a reply whose `in_reply_to_id` matches it. No finding this review produced is unanswered.

---

## Volume verdict

**No re-scoping needed.** 8 findings across 4 PRs fit one PR and one session. This was the largest re-presentation of the three sibling slices (SUB-11 / SUB-12 / SUB-13) and it did not overrun. Recorded explicitly because the charter names review volume as a re-scoping trigger, and a silent absorption would be indistinguishable from an overrun.

---

## Corrections this record makes to upstream artifacts

- **`triage.md` open item 1 is superseded.** It recorded "PR 655 has no review at all yet". 655's review landed at `2026-08-03T18:33:31Z` and resolved 1/1 files.
- **The spec's context table conflated two nodes.** It described merged lines 2553–2555 as "the same node's rationale continuation" as the 2486–2487 finding. They are different nodes: 2486–2487 is inside `cl-2.implement-tree-dp-post-order-dfs` (node at 2437, `severity` at 2481); 2553–2554 is inside `cl-2.debug-tree-dp-recursion-depth` (node at 2505, `severity` at **2548**). A **third** untouchable `severity: "blocking"` line therefore exists beyond the two originally named, and F-952-5 and F-952-6 are two separate prose sites rather than one.

---

## Standing rule, restated

**A review that resolves zero files is a failure signal, never a clean bill.** PR 617's "0 findings" meant its content was never read. Read at a size the reviewer could resolve, the same content produced **eight** findings, seven of which were upheld. That is the measure of what the original silence concealed.

---

## Closure

All four review-only PRs were closed unmerged and their remote branches deleted. No chunk content lands on `develop`.

```
$ gh pr view 652 --json number,state,mergedAt,changedFiles,additions
{"additions":1215,"changedFiles":1,"mergedAt":null,"number":652,"state":"CLOSED"}

$ gh pr view 653 --json number,state,mergedAt,changedFiles,additions
{"additions":1221,"changedFiles":1,"mergedAt":null,"number":653,"state":"CLOSED"}

$ gh pr view 654 --json number,state,mergedAt,changedFiles,additions
{"additions":1155,"changedFiles":1,"mergedAt":null,"number":654,"state":"CLOSED"}

$ gh pr view 655 --json number,state,mergedAt,changedFiles,additions
{"additions":477,"changedFiles":1,"mergedAt":null,"number":655,"state":"CLOSED"}
```

Branches `neu-952/review-chunk-1` … `neu-952/review-chunk-4` were deleted with `gh pr close --delete-branch`, confirmed in each command's output.

---

**Known erratum, not amended:** commit `42e0bef`'s message body opens "Six findings upheld" while its own bullets enumerate seven. The count in this record — **seven upheld, one rejected** — is the correct one. The commit is deliberately not amended: its sha is cited on seven live review threads and in this record, and rewriting it to fix a word would invalidate every one of those citations.

**Recorded by:** claude-opus-5[1m]
**Date:** 2026-08-03
**Slice:** SUB-12 (NEU-952), charter C008, umbrella NEU-945
**Fix commit:** `42e0bef` — `fix(NEU-952): correct upheld prose findings in cl-2-combinatorial`
