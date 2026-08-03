# C008 — closing sweep: the independent unreplied-thread audit

**Slice:** SUB-9 (NEU-955), charter C008, umbrella NEU-945
**Covers:** enabling — the charter's High-risk mitigation ("the closing check is a fresh API sweep for unreplied Copilot threads … run by something other than the agent that did the work")
**Model:** claude-opus-5[1m]
**Date:** 2026-08-03

**Verdict in one line: the epic's all-clear HOLDS on the population it was defined over — 37 in-scope Copilot threads, 37 replied, 0 unreplied — and does NOT hold as an unqualified "C008 is clean" claim, because C008's own merged output carries 3 unreplied Copilot threads that no slice ever answered.**

---

## 1. Who ran this, and why that is written down

**Acting agent.** An isolated fleet-shipper agent, model `claude-opus-5[1m]`, running under activation-intent token `fleet-neu-945-001:NEU-955:R5`, in the dedicated git worktree `.claude/worktrees/neu-955` on branch `docs/NEU-955-closing-sweep`, cut from `origin/develop` at `ddf145a`.

**Independence, stated as a checkable claim.** This agent performed none of SUB-1 … SUB-4's or SUB-11 … SUB-13's work. It holds none of those sessions' context: it was dispatched fresh into an empty worktree, and everything it knows about those slices it read out of their committed artifacts or out of the GitHub API. It did not speak to any sibling slice, and no sibling slice's hand-off narrative was accepted as evidence anywhere in this document.

SUB-9's own brief records why this cannot be an acceptance scenario: *"who ran a slice is unobservable from any artifact the slice produces"*, so the dispatch constraint binds the dispatcher. What the artifact can carry is the acting agent's identity, and that is the paragraph above. A reader who wants to falsify the independence claim has a name, a token, a branch and a worktree to check it against.

**This slice fixes nothing.** Every defect below is recorded with its owner and left unrepaired. By construction this slice writes exactly one file — this one. An auditor that fixes becomes an agent reporting on its own work, which is the failure C008 exists to remediate.

---

## 2. Method

**Every claim below rests on the GitHub API record.** No sub-task's report was taken as evidence of its own completion.

**PR numbers came from the committed review records, not from any narrative.** This is the constraint that makes the audit independent, so it is spelled out:

| Record | Slice | Review PR numbers it names | Read at |
| --- | --- | --- | --- |
| `05_review-record-pr615.md` | SUB-11 / NEU-951 | **649, 650, 651** | line 9, table at 42–44 |
| `06_review-record-pr617.md` | SUB-12 / NEU-952 | **652, 653, 654, 655** | line 3, table at 33–36 |
| `07_review-record-pr618.md` | SUB-13 / NEU-953 | **664, 665, 666, 667, 668, 669, 670** | line 9, table at 47–53 |
| `04_probe-record.md` | SUB-10 / NEU-949 | **640, 641, 642** (probes) | lines 31–33 |

All four records exist, all four are committed, and every one names its PR numbers explicitly. **No record was absent, and none named zero PRs** — the failure mode SUB-9's brief told this sweep to treat as a finding did not occur. `07_review-record-pr618.md:9` states outright that its list "is the sweep input NEU-955 (SUB-9) reads from this file", which is the handshake working as designed.

**Queries used.** Per PR: `gh api --paginate repos/pavel-rp/second-memory-mcp/pulls/{N}/comments` for inline threads, `…/pulls/{N}/reviews` for review-level bodies and states, `…/pulls/{N}` for merge state, `…/issues/{N}/timeline` for registration/delivery events, and `…/issues/comments/{id}` for PR-level replies. A **thread** is a root comment (no `in_reply_to_id`) plus everything chaining to it; a thread is **replied** iff at least one non-root comment exists on it. Raw JSON for all 22 swept PRs is retained under `_local/scratch/sweep/`.

**Bulk collection was delegated; the load-bearing claims were re-verified first-hand.** The per-PR fetch was run by a subagent to keep the raw JSON out of this record's authoring context. Every claim this sweep's verdict turns on was then re-issued directly by the acting agent: PR 666's empty `reviews`, PR 664's empty `comments`, and the unreplied roots on PRs 645 and 656 were each confirmed by a fresh first-hand API call, not accepted on the subagent's word.

**Why the failure *string* was not used as the test.** The charter was built on the observable string `"wasn't able to review any files"`. NEU-953 established two further failure modes that emit no such string, and this sweep adopts its rule: **the failure signal is the absence of a line-anchored comment, not the presence of a string.** A grep-only sweep would have returned a false all-clear here.

---

## 3. Population A — the original finding-bearing PRs

| PR | Slice that closed it | Copilot threads | Replied | Unreplied |
| --- | --- | --- | --- | --- |
| 610 | SUB-1 / NEU-946 | 5 | **5** | 0 |
| 612 | SUB-2 / NEU-947 | 2 | **2** | 0 |
| 625 | SUB-3 / NEU-948 | 5 | **5** | 0 |
| 631 | SUB-4 / NEU-950 | 4 | **4** | 0 |
| **Total** | | **16** | **16** | **0** |

**The charter's count of 16 is re-established, not assumed.** 5 + 2 + 5 + 4 = 16, independently observed. Every reply is authored by `pavel-rp` and every one is dated `2026-08-03` — i.e. they are C008's remediation replies, not pre-existing ones.

**Result: PASS.** Zero unreplied threads on population A.

---

## 4. The baseline — PR 634

| PR | Copilot threads | Replied | Unreplied |
| --- | --- | --- | --- |
| 634 | 2 | **2** | 0 |

**Reported as replied, which is what SUB-9 required.** Both threads (`3598722105`, `3598722150`) carry replies from `pavel-rp` dated `2026-07-16T20:35Z` — contemporaneous with the PR, months before C008 ran, and fixed in `bb091e7`.

**This is the discriminator, and it discriminates on two axes.** The query returns *replied* for 634 while returning *unreplied* for the three threads in §7.1 — so a zero-unreplied result elsewhere is a real observation rather than a query that returns nothing for the wrong reason. And 634's reply timestamps are 18 days older than population A's, so the query is not merely detecting "any reply on any recent PR".

**Result: PASS.**

---

## 5. The review-only PRs

### 5.1 SUB-11 / NEU-951 — `cl-1-foundational.yaml`

| PR | Threads | Replied | Unreplied | Files resolved |
| --- | --- | --- | --- | --- |
| 649 | 3 | **3** | 0 | yes — anchored at `:67`, `:440`, `:818` |
| 650 | 1 | **1** | 0 | yes — anchored at `:1269` |
| 651 | 3 | **3** | 0 | yes — anchored at `:2273`, `:2298`, `:3202` |
| **Total** | **7** | **7** | **0** | 3 of 3 |

`05_…` claims 7 findings across three PRs (3 + 1 + 3). **The API returns exactly 7 threads in exactly that distribution.** The record's claim reconciles with the record of record.

### 5.2 SUB-12 / NEU-952 — `cl-2-combinatorial.yaml`

| PR | Threads | Replied | Unreplied | Files resolved |
| --- | --- | --- | --- | --- |
| 652 | 1 | **1** | 0 | yes — anchored at `part1:646` |
| 653 | 1 | **1** | 0 | yes — anchored at `part2:433` |
| 654 | 1 | **1** | 0 | yes — anchored at `part3:51` |
| 655 | 2 | **2** | 0 | yes — anchored at `part4:1`, `:274` |
| **Total** | **5** | **5** | **0** | 4 of 4 |

**An apparent discrepancy that resolves, and the sweep records how.** `06_…:3` claims **8** findings; the inline-thread API returns **5**. This is not a shortfall. `06_…:55` states that three findings arrived inside `Suppressed comments` blocks and *never became threads at all*, and were therefore answered by PR-level comments instead. A thread-only sweep is structurally blind to them, so this sweep verified the two claimed PR-level comments directly:

| Claimed id | Claimed on | API result | Author | Created |
| --- | --- | --- | --- | --- |
| `5170501604` | PR 653 | **EXISTS**, `issue_url` → `/issues/653` ✔ | `pavel-rp` | 2026-08-03T18:56:33Z |
| `5170502200` | PR 654 | **EXISTS**, `issue_url` → `/issues/654` ✔ | `pavel-rp` | 2026-08-03T18:56:37Z |

Both exist, both land on the PR claimed, and both open with an explicit verdict on the suppressed findings. **8 = 5 replied threads + 3 suppressed answered at PR level. Nothing is unanswered.**

**Methodological note for any future sweep.** A suppressed finding is invisible to `/pulls/{N}/comments`. A sweep that reports only inline threads will silently under-count findings on any PR whose reviewer collapsed some into a suppressed block. This one caught it only because the record disclosed it — which is an argument for the records, not for the query.

### 5.3 SUB-13 / NEU-953 — `frontier.yaml`

| PR | Range | Threads | Replied | Unreplied | Resolution |
| --- | --- | --- | --- | --- | --- |
| 664 | 1–1074 | **0** | 0 | 0 | **ZERO-ANCHOR OVERVIEW — failure** |
| 667 | 1–554 | 1 | **1** | 0 | yes — `:196` |
| 668 | 555–1074 | 2 | **2** | 0 | yes — `:606`, `:981` |
| 665 | 1075–1865 | 2 | **2** | 0 | yes — `:1440`, `:1720` |
| 666 | 1866–2732 | **0** | 0 | 0 | **TOTAL NON-DELIVERY — failure** |
| 669 | 1866–2374 | 3 | **3** | 0 | yes — `:1882`, `:2017`, `:2034` |
| 670 | 2375–2732 | 1 | **1** | 0 | yes — `:2671` |
| **Total** | | **9** | **9** | **0** | 5 of 7 resolved |

`07_…` claims 9 instrument findings. **The API returns exactly 9 threads**, distributed exactly as the record's table predicts. Plus finding 10 on the deliverable PR 671 — API-confirmed: 1 thread, replied.

**The two failures are confirmed first-hand, and are NOT read as clean results.**

- **PR 664 — zero-anchor overview.** `gh api …/pulls/664/comments` returns `[]`, issued directly by this agent. Its single Copilot review (`2026-08-03T19:46:51Z`) carries a substantive, content-specific overview — it is not the `"wasn't able to review any files"` string, and it renders fine. It anchored nothing. **Recorded as a failure, per SUB-9's constraint that a review resolving zero files is never a clean bill.**
- **PR 666 — total non-delivery.** `gh api …/pulls/666/reviews` returns `[]`, issued directly by this agent. No review of any kind exists — not even a placeholder. The timeline proves registration did happen and then produced nothing: `review_requested` (actor `pavel-rp`, reviewer `Copilot`) at `19:42:16Z`, `copilot_work_started` at `19:42:48Z`, **no `reviewed` event ever**, PR closed at `20:15:23Z`, and `review_request_removed` firing only *after* the close at `20:16:24Z` — i.e. the request was still outstanding when the PR was closed. **A registration that is confirmed and then silently yields nothing.**

**Coverage is nevertheless complete, and rests on the bisects rather than on the failed parents.** 667 + 668 tile 664's range exactly (554 + 520 = 1074); 669 + 670 tile 666's exactly (509 + 358 = 867). With 665's 791, the five resolving PRs cover 1074 + 791 + 867 = **2,732 of 2,732 lines**. No part of `frontier.yaml` is recorded as reviewed on the strength of a PR that did not resolve it.

**One arithmetic check a cold reader will want.** `frontier.yaml` measures **2,809** lines on `develop` today, not the 2,732 the record tiles. That is not a coverage gap: NEU-953's own six fix commits, merged as PR 671, added 77 lines *after* the instruments were cut. 2,732 + 77 = 2,809. Checked, because an unexplained 77-line delta between a coverage claim and the live file is exactly what a sweep exists to catch.

### 5.4 In-scope roll-up

| Group | Threads | Replied | Unreplied |
| --- | --- | --- | --- |
| Population A (610, 612, 625, 631) | 16 | 16 | 0 |
| SUB-11 review PRs (649–651) | 7 | 7 | 0 |
| SUB-12 review PRs (652–655) | 5 | 5 | 0 |
| SUB-13 review PRs (664–670) | 9 | 9 | 0 |
| **In-scope total** | **37** | **37** | **0** |
| Baseline (634) | 2 | 2 | 0 |

**Reconciliation.** SUB-9's brief anticipated that the fresh reviews would add findings beyond population A's 16 and required the total to account for them. It does: 16 in-scope originals + 21 review-PR findings = 37 threads, every one replied. Counting the two SUB-12 suppressed sites and one further suppressed site answered at PR level, the adjudicated finding count is higher than the thread count — and §5.2 shows where each of those went.

**Result: PASS on the defined pass condition. Zero unreplied Copilot threads across 610, 612, 625, 631 and every review-only PR the records name.**

---

## 6. The authorized residue — PRs 624 and 630

**Not swept. Not queried. Not flagged.** The charter cut that population by confirmed user answer and records the 7 permanently-unreplied threads as accepted, authorized residue (charter census; Assumption 1), with the Risks row stating the closing check runs "explicitly excluding 624 and 630".

They are named here descriptively, exactly as SUB-9's brief permits, and they are **not counted against the pass condition**. Re-flagging them would be a defect of this slice rather than a finding, so this sweep never issued an API call against either PR.

---

## 7. Findings of this sweep

The point of this slice is served by finding something. It found four things.

### 7.1 F-955-1 (MATERIAL) — C008's own merged output carries 3 unreplied Copilot threads

**The epic convened to close unread review findings left unread review findings on its own merged PRs.**

| PR | Slice | Thread | Anchor | State |
| --- | --- | --- | --- | --- |
| 645 | SUB-10 / NEU-949 | `3706635477` | `…/C008…/04_probe-record.md:33` | **UNREPLIED** |
| 656 | SUB-3 / NEU-948 | `3706790818` | `…/C005-dp-map-coverage/03_residual-exclusion-consolidation.md:180` | **UNREPLIED** |
| 656 | SUB-3 / NEU-948 | `3706790848` | `…/C005-dp-map-coverage/03_residual-exclusion-consolidation.md:188` | **UNREPLIED** |

**Verified first-hand.** `gh api …/pulls/645/comments` returns exactly one record, a `Copilot` root with no `in_reply_to_id` and no sibling — so no reply exists. `…/pulls/656/comments` returns exactly two records, both `Copilot` roots, neither with any reply. Both PRs are **merged**.

Substance, from the root bodies: 645's thread objects to thousands-separator formatting in `04_probe-record.md`'s results table (cosmetic). 656's two threads object to a citation using "§17/§23" against a lettered-section document, and to a §8.6 heading claiming "each to exactly one bucket" where the ledger and §8.5 record otherwise — **both substantive claims about the very consolidation-count reconstructability SUB-3 was convened to fix.**

**Scope, stated honestly in both directions.** These PRs are **not** in SUB-9's defined in-scope set, so they do **not** falsify the §5.4 pass condition, and this sweep does not claim they do. But they are C008's own merged deliverables, the defect is the identical class C008 exists to remediate, and a closing sweep that reported "zero unreplied threads" without mentioning them would be the second false all-clear the charter names as its High risk. **Recorded, not fixed.**

**Owner: none live.** NEU-948 merged as PR 656 and NEU-949 merged as PR 645; both slices are complete. See §8.

### 7.2 F-955-2 — the probe PRs carry 3 unreplied threads

| PR | Threads | Unreplied | Detail |
| --- | --- | --- | --- |
| 640 | 0 | 0 | `"Copilot wasn't able to review any files in this pull request."` — **twice**. This is the probe's intended result, not a defect. |
| 641 | 1 | **1** | `3706443912` at `probe/neu-949/chunk.yaml:15` |
| 642 | 2 | **2** | `3706437783` at `:99`; `3706437814` at `:15` |

Out of the defined in-scope set — SUB-9 explicitly does not gate on SUB-10 — and the PRs are throwaway instruments, closed unmerged, whose branches carry no content to `develop`. **Recorded as residue, not counted against the pass condition.** Distinguished from 624/630 residue in one way that matters: 624/630's silence is *authorized* by a confirmed user answer, whereas these three were simply never answered. Owner NEU-949, merged and closed.

### 7.3 F-955-3 — six scratch branches from SUB-11 survive on the remote

`git ls-remote --heads origin` returns, confirmed by this agent:

```
refs/heads/review-base/neu-951-part1   refs/heads/review/neu-951-part1
refs/heads/review-base/neu-951-part2   refs/heads/review/neu-951-part2
refs/heads/review-base/neu-951-part3   refs/heads/review/neu-951-part3
```

This is the remainder NEU-953 routed here (`07_…:204`), and it is **confirmed live**. NEU-952's and NEU-953's own instrument branches were deleted; NEU-951's were not. No content from them is on `develop` — the PRs were closed unmerged — so this is repository hygiene, not a correctness defect. Owner NEU-951, merged and closed.

### 7.4 F-955-4 (observation) — PR 644's review anchored nothing and declared nothing

Applying NEU-953's rule (*treat "no line-anchored comment" as the failure signal, not the failure string*) to C008's own merged PRs separates them cleanly:

| PR | Inline anchors | Self-declared resolution | Reading |
| --- | --- | --- | --- |
| 643 | 0 | `"reviewed 2 out of 2 changed files … generated no comments"` | genuine clean review |
| 658 | 0 | `"reviewed 2 out of 2 changed files … generated no comments"` | genuine clean review |
| 661 | 0 | `"reviewed 3 out of 3 changed files … generated no comments"` | genuine clean review |
| **644** | **0** | **none — no counter, no `"wasn't able"` string** | **resolution not proven** |

PR 644 (SUB-1 / NEU-946) carries a substantive Copilot overview, zero inline anchors, and — unlike its three siblings — no files-reviewed counter. That is the exact shape of PR 664's zero-anchor overview.

**Hedged deliberately, because overstating a finding is its own failure.** 644's diff is 1 file, +17/−13 — three orders of magnitude below any observed size cap, so "genuinely nothing to comment on" is the more likely explanation, and the absent counter may simply be reviewer output variance. This is recorded as an **observation, not a defect**: it is the one place in C008's own merged output where the resolution evidence is weaker than the standard the epic itself set, and a reader deciding how much the SUB-1 closure is worth should know that its deliverable PR's review proved nothing about file resolution.

---

## 8. Routed remainders with no live receiver

The fleet register routed six remainders into this record. **This sweep records them; it repairs none.** What it adds is the ownership check, because an all-clear that lists an owner without checking the owner still exists is the paper-over this slice exists to prevent.

| Id | From | Substance | Routed owner | Owner state |
| --- | --- | --- | --- | --- |
| **RR-1** | NEU-951 | `cl-1-foundational.yaml:67` — stale dimension marker inside the frozen root block (`DO NOT EDIT`, `frozen: true`); changeable only by a ledger challenge against `D-S2`. Upheld, not silently overridden. | NEU-947 / NEU-950 | **both merged and closed** (PRs 643, 661) — **no live receiver** |
| **RR-2** | NEU-951 | `01_node-and-edge-schema.md:208` still cites the discharged `INC-S3` as live authority. | NEU-947 / NEU-950 | **both merged and closed** — **no live receiver** |
| **RR-4** | NEU-948 | Verdict-identity question: `02_disagreement-adjudication.md:87` labels six rows "GAP ×5" while its own `:100` says "all six". | SUB-11 / NEU-944 | NEU-951 merged without it; NEU-944 is outside this fleet — **no live receiver** |
| **RR-5** | NEU-948 | Mainstream `RX-1`/`RX-2` are register entries §3's table never rows; CL-2's `E-header` block, counted in the old "2 discharged", is not one of the 52. | none assigned | **no owner was ever named** |
| **RR-6** | NEU-953 | Cross-file mirror-image relative-path defect in siblings `cl-1`/`cl-2`/`cl-3`. Replied on-thread with verdict, owners named, re-scoping flagged; files deliberately left unedited (outside NEU-953's write fence). | none live | **no live in-fleet owner for the fix** |
| **RR-7** | NEU-953 | On PRs 664 and 666 the bisect and the reviewer re-request are confounded — which produced the resolving review is unestablished. | NEU-949 (probe remit) | **merged and closed** — **no live receiver** |
| **RR-8** | NEU-953 | Six `review*/neu-951-part{1,2,3}` branches still on the remote. Confirmed live in §7.3. | NEU-951 | **merged and closed** — **no live receiver** |

**This is the finding behind the findings.** Seven routed remainders name an owner; in six cases that owner has already merged and closed, and in the seventh no owner was ever assigned. **Not one of them has a live in-fleet receiver.** They were correctly refused by the slices that surfaced them — each was outside that slice's write fence, and a slice that reaches outside its fence is a worse failure than one that routes — but the routing terminates nowhere. Recorded here so that C008's completion report cannot present "routed to owner" as equivalent to "will be fixed".

### 8.1 A narrowing on RR-7, offered without upgrading it

RR-7 asks whether the bisect or the re-request produced the resolving reviews on 664 and 666. This sweep did not set out to answer it and does not claim to, but its timeline pulls narrow it, and leaving that unstated would waste evidence already in hand:

- **PR 664's timeline carries exactly one `review_requested` event** (`19:42:01Z`) and exactly one `reviewed` event (`19:46:51Z` — the zero-anchor overview). There is a single `committed` event and **no force-push or re-commit** afterwards. **No re-request ever occurred on 664 itself.**
- **PR 666's timeline carries exactly one `review_requested` event** (`19:42:16Z`), `copilot_work_started` at `19:42:48Z`, and **no `reviewed` event at any point**. The only later reviewer event is `review_request_removed` at `20:16:24Z`, *after* the close.

So on the two failing PRs the resolving reviews did not arrive on those PRs at all — they arrived on **new** PRs (667/668, 669/670). **The confound is therefore not eliminated, and is arguably tighter than stated:** a new PR is necessarily both smaller *and* freshly registered, so size and registration-freshness remain inseparable by this evidence.

**Not upgraded into a verdict.** Characterising this properly is a probe, probes are NEU-949's remit, and NEU-949 is merged and closed. NEU-953 was right to decline it, and so is this slice. Recorded as a narrowing for whoever eventually owns it.

---

## 9. Against SUB-9's acceptance scenarios

| # | Scenario | Result |
| --- | --- | --- |
| 1 | Zero unreplied Copilot threads across 610, 612, 625, 631 and the review-only PRs | **PASS** — 37 threads, 37 replied, 0 unreplied (§5.4) |
| 2 | PR 634's 2 findings reported as **replied**, proving the query detects a replied thread | **PASS** — both replied `2026-07-16`, and the same query returns *unreplied* for §7.1's three threads (§4) |
| 3 | 624 and 630 not flagged, not affecting the pass condition | **PASS** — never queried; named only as authorized residue (§6) |
| 4 | Findings beyond population A's 16 accounted for; no in-scope thread unaccounted | **PASS** — 16 + 21 = 37, plus 3 suppressed sites traced to verified PR-level replies (§5.2, §5.4) |
| 5 | The record names the agent or session that produced it | **PASS** — §1 |
| — | 615/617/618's content obtained a review that **resolved files** | **PASS with two recorded failures** — the failures on 664 and 666 were recovered by bisect; coverage is 2,732/2,732 and rests only on resolving PRs (§5.3) |

---

## 10. Verdict

**The all-clear holds on what it was defined over, and it is not a clean bill for the epic.**

**What holds.** Every Copilot thread on every PR in SUB-9's defined in-scope set carries a reply — 37 of 37. The three review records exist, name their PRs, and their claimed finding counts reconcile exactly against the API (7 = 7; 8 = 5 threads + 3 verified PR-level answers; 9 = 9, plus a tenth on the deliverable). All three of 615's, 617's and 618's contents obtained reviews that provably resolved files, proven by line anchors rather than asserted. The 634 baseline discriminates, so the zero is falsifiable and did not come back zero for the wrong reason. **OUT-1's, OUT-3's and OUT-4's success measures are met on this evidence.**

**What does not.** Three unreplied Copilot threads sit on C008's own merged PRs 645 and 656 — two of them substantive objections to the very document SUB-3 was convened to make reconstructable (§7.1). Three more sit on the probe PRs (§7.2). Six scratch branches survive on the remote (§7.3). One of C008's own merged PRs anchored nothing and declared nothing (§7.4). And **seven routed remainders have no live receiver** (§8) — every named owner has already merged and closed.

**Two failure modes that emit no observable string were confirmed live**, on PRs 664 and 666. Any future sweep that greps for `"wasn't able to review any files"` will report a false all-clear on exactly this population. The signal is the missing anchor, not the string.

**The honest reading.** C008 did what it set out to do on the population it scoped. It did not achieve a state in which nothing is unread — it achieved a state in which nothing *in the scoped set* is unread, while generating a small quantity of the same defect on its own output and accumulating seven remainders that point at closed doors. **That distinction is the entire product of this slice.** A closing report that collapses it into "all clear" would be the second false all-clear the charter names as its High risk, arrived at more carefully than the first.

**Routing of this sweep's own findings.** F-955-1, F-955-2, F-955-3, F-955-4 and RR-1/2/4/5/6/7/8 all lack a live in-fleet owner. They are recorded here and belong to whoever picks up C008's completion — **none is repaired by this slice, and none should be read as scheduled.**

---

## 11. Limitations, stated rather than omitted

- **Suppressed findings are structurally invisible** to `/pulls/{N}/comments`. This sweep caught SUB-12's three only because `06_…` disclosed them. If any other slice's reviewer suppressed a finding without the record saying so, this sweep would not see it. The API offers no query that would.
- **The sweep observes replies, not their quality.** A thread carrying a reply counts as replied regardless of whether the reply is a competent adjudication. Verdict quality was out of scope; the review records carry it.
- **`pnpm run type-check` is UNVERIFIABLE in this worktree** — neither `pnpm` nor `node_modules` is present. It was **not** faked as a local pass and is deferred to CI's `build-test-lint` on this slice's PR. This deliverable is a single Markdown file that no build consumes.
- **Bulk API collection was delegated to a subagent.** Every claim the verdict turns on was re-issued first-hand (§2), but the per-thread body excerpts for PRs not named in §7 were not individually re-fetched by the acting agent.
- **Linear issue states were not queried.** "Merged and closed" in §8 is asserted from merged PRs (643, 645, 656, 661) and the slices' shipped records, not from the tracker's own state field.

---

**Recorded by:** an independent fleet-shipper agent, `claude-opus-5[1m]`, activation-intent token `fleet-neu-945-001:NEU-955:R5`, worktree `.claude/worktrees/neu-955`, branch `docs/NEU-955-closing-sweep`
**Slice:** SUB-9 (NEU-955), charter C008, umbrella NEU-945
**Date:** 2026-08-03
