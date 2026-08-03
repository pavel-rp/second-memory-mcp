# C008 — intake

**Date:** 2026-07-17
**Input source:** feature description (free text)
**Captured by:** claude-opus-4-8[1m]

## Original idea (verbatim)

> now gather all the copilot reviews from the fleet you ran, irganize them into a charter epic

## Host context

"The fleet" = the `/fleet NEU-889` run on 2026-07-16 that shipped 13 sub-tasks (NEU-932…NEU-944) to merged PRs, producing the C005 DP knowledge-and-skill map under `docs/research/C005-*`. PRs: **610, 612, 614, 615, 616, 617, 618, 624, 625, 628, 630, 631, 634**.

## Gathered evidence — the Copilot review audit (2026-07-17)

Fetched from the GitHub API across all 13 PRs. **This contradicts what the orchestrator reported during the run, and what several shipper agents reported in their own final messages.**

### Attach/resolve outcomes

| Outcome | Count | PRs |
| --- | --- | --- |
| Never attached | **0** | — |
| Attached but **could not resolve any files** ("wasn't able to review any files") | **3** | 615, 617 (posted this twice), 618 |
| Attached and actually reviewed files | **10** | 610, 612, 614*, 616, 624*, 625, 628, 630, 631, 634 |

\* 614 and 624 use an anomalous review-body shape: a "Pull request overview" narrative that **omits** the standard "Copilot reviewed N out of M … generated K comments" line and per-file table that the other 9 carry. 624 still had 3 inline comments posted despite the missing summary line.

### Findings

- **25 total inline findings** across the 13 PRs — 610: 5 · 612: 2 · 624: 3 · 625: 5 · 630: 4 · 631: 4 · 634: 2 · (614, 615, 616, 617, 618, 628: 0)
- **Only 2 have any reply** (both on 634, both confirmed fixed in `bb091e7`).
- **23 have no reply at all.**

### Reported-vs-actual (the reason this charter exists)

| PR | Shipper/orchestrator reported | Actual |
| --- | --- | --- |
| 610 | "Copilot review never attached despite two differently-shaped requests" | **5 findings posted** |
| 612 | "Copilot never attached … requested_reviewers then cleared with no review" | **2 findings posted** |
| 625 | no Copilot review mentioned in the final report | **5 findings posted** |
| 631 | "Copilot review requested but never landed … no review posted within the capped polls" | **4 findings posted** |
| 624 | "3 valid findings — all fixed in `4a93c14`" | 3 findings, fixed in code, **thread never replied to** |
| 630 | "4 findings, all valid, all fixed" | 4 findings, fixed in code, **thread never replied to** |

So there are two distinct populations, and they must not be conflated:
- **Likely genuinely unread/unfixed (~16):** 610 (5), 612 (2), 625 (5), 631 (4) — the shippers reported no review had landed, so they never saw these.
- **Likely fixed in code but never replied to (7):** 624 (3), 630 (4) — the shippers explicitly claim these were fixed. **Unverified against the merged tree.**

### Substantive findings spot-checked by the host

- **625 / `03_residual-exclusion-consolidation.md` §8 — VERIFIED REAL (narrower than Copilot stated).** Line 144 reports `Total consolidated: 52` while the bucket counts sum to **55** (19+21+10+3+2). The file *does* carry a parenthetical ("some entries resolve to a shared verdict; `E3` splits into two"), so the arithmetic is not simply broken — it is **unreconciled**: a reader cannot verify 55 → 52. Pointed, because line 146 immediately claims *"verified, not assumed."*
- **631 / `frontier.yaml` — 4 findings, 2 pairs, substantive.** Copilot argues two nodes are misclassified against the package's **own** severity vocabulary in `00_method-and-scope.md`: an accumulator exceeding `Number.MAX_SAFE_INTEGER` and silently rounding is marked `idiom-shift` where it meets `correctness-risk`; a post-order traversal that exceeds the recursion cap and "must be an explicit stack" is marked `idiom-shift` where it meets `blocking`. Each has a paired finding on the rationale prose that contradicts the severity. If upheld, these change shipped OUT-5 verdicts.
- **612 — a live contradiction between two sources.** `index/00_technique-index.md` header says the index is generated and must never be hand-edited; the same file later says the generator does not exist and it is hand-maintained. `manifest.yaml:161` asserts `sole_writer: "generator only"`, `hand_edited: false`. Two sources of truth disagree about the same artifact. (Note: NEU-944 later shipped a real generator, so current state must be re-checked before acting.)
- **630 — 4 defensive-coding findings in the checked-in validator** (`audit-graph-integrity.mjs`): hard-coded `yaml@2.8.1` pnpm store path; unguarded `Object.keys(n.difficulty_dimensions)`; `parseInt` → `NaN` silently excluded from the inversion check; `members[0]` assumed non-empty. Claimed fixed by NEU-943 — needs verification.
- **610 — 5 findings** on the representation dry-run: the specimen manifest doesn't actually map file → sole writer (so the dry-run's Q8 isn't answerable from it), a Result row that mis-states CL-4's one-cluster/many-files shape, and two YAML enum-quoting consistency nits.

### Why the reviews were missed (root causes, evidence-backed)

1. **The deliverable was gitignored** (`/docs/research/`, `.gitignore:75`) → Copilot resolved zero files on 3 PRs. **Fixed by PR #636 (2026-07-17), not yet merged at capture time.**
2. **`gh pr edit --add-reviewer` reports success while silently not registering** — observed first-hand by NEU-941; a direct `gh api` call did register.
3. **The capped-review rule** (poll twice, then merge) raced the review: shippers merged before findings posted, then reported "no review landed" as fact.
4. **No thread replies were required**, so a landed finding left no trace of being seen — 23 of 25 threads are silent.

## Clarifications

* 2026-07-17 — The host asked 4 scoping questions. **The user did not answer.** Per the skill's no-interactive-user rule, each material ambiguity is recorded below as an `[unconfirmed]` assumption with the host's default. The reviewer's assumption-hygiene check must route any material one back to the user rather than let it ship silently.
* 2026-07-17 Q: The decomposer flagged a product choice — OUT-5's process fixes edit user-global files (`C:/Users/recky/.claude/skills/{fleet,ship}/SKILL.md`) that sit outside any repo, so SUB-7 has no branch, PR, or CI and cannot run through `/wf:tc` → `/wf:tf` or `/ship`. How should that work be delivered and tracked? — **A: The skills are being ported to the wf plugin. OUT-5 is CUT from this charter and filed there instead: [WF-313](https://linear.app/neurasphere/issue/WF-313) "Harden the review gate: a shipper must not merge while claiming no review landed" (team WF Plugin, High).** This **CONFIRMS** deferred question #2 in the opposite direction to the host's default: the process fix is real and is being done, but **not here**. (affects: OUT-5 removed, SUB-7 removed, the "process fixes never land" risk is discharged — it now has a ticket in the codebase that will own the code)

**Consequence for the decomposition:** every remaining sub-task is repo-local and `/ship`-able, restoring the charter's own contract. C008 is now **content-only**: verify the 25 findings, fix what is live, restore the audit trail. WF-313 carries the four root causes and the related `/fleet` lessons from the same run (shipper sub-fan-out, data-dependency blindness in Step 0, the `TaskOutput` liveness check, and `git status` blindness under a gitignored path).

## Deferred — unanswered interview questions, host defaults applied `[unconfirmed]`

| # | Question | Host default `[unconfirmed]` | Why this default | If wrong |
| -- | -- | -- | -- | -- |
| 1 | **Scope:** all 25 findings, or only the ~16 the shippers never saw? | **Verify all 25 against the merged tree, fix what is still live.** | The 7 "already fixed" (624, 630) rest on shipper self-reports — the exact claim class that proved wrong four times in this fleet (610/612/625/631 all reported "no review landed" while findings existed). Trusting them re-runs the failure. A triage pass is cheap relative to shipping a second false "all clear". | Scope shrinks to ~3–4 sub-tasks; drop the triage sub-task. |
| 2 | ~~**Process fix in scope?**~~ | **✅ ANSWERED 2026-07-17 — NO. Cut from C008; filed as [WF-313](https://linear.app/neurasphere/issue/WF-313) in the WF Plugin team.** | The host's default was "yes, include it". **Overruled by the user, correctly:** the skills are being ported into the wf plugin, so the fix belongs in that codebase where it will have a real branch/PR/CI — not hand-edited from a Neurasphere charter with no delivery path. The concern behind the default (that the fix never lands) is discharged by the ticket, not by scope. | n/a — settled. |
| 3 | **PR 631's OUT-5 severity findings** — re-adjudicate or flag? | **Re-adjudicate against the package's own documented criteria.** | The severity vocabulary in `00_method-and-scope.md` is written down and testable, so this is rule-application, not new judgment. Copilot's reading looks correct on both nodes (2^53 silent rounding → `correctness-risk`; recursion-cap requiring an explicit stack → `blocking`). | Downgrade to "flag only, owner = creator", mirroring INC-C1/INC-C2. |
| 4 | **Relationship to F-943-1 / INC-C1 / INC-C2** | **Keep separate.** | Those are already known, owned, and recorded in the package's own open-items register with revision triggers. C008 is strictly about findings **nobody saw**. Absorbing them makes the epic unbounded and duplicates an existing decision trail. | Fold F-943-1 in (it is High, live, and has no ticket). |

**Host note on #1:** the two populations must not be conflated in the decomposition — "never seen" (610, 612, 625, 631 ≈ 16) and "claimed fixed, thread silent" (624, 630 = 7) need different treatment. Only the first needs fixing from scratch; the second needs verification and, if fixed, a reply.

---

## Clarifications — round 2 (2026-07-17), answering the reviewer's routed questions

The Round-1 reviewer routed the three unconfirmed assumptions to the user (finding F1.5). All three are now **answered**. Two overrule the host's default.

* **Q1.1 — Scope: all 25 findings, or only the ~16 never seen?** → **A: only the ~16 never-seen.** (610 ×5, 612 ×2, 625 ×5, 631 ×4.) The user **overruled** the host's "verify all 25" default: **trust NEU-624's and NEU-630's "already fixed in code" reports** and drop the verification of that population. **Assumption 1 → confirmed as "only the ~16".** (affects: the population-B verification slice is cut)
  * ⚠️ **Does not touch 615/617/618.** Those are a *third* population — zero findings because the review resolved **no files at all**. Their content has never been reviewed by anything. That is a separate outcome and stays in scope.
* **Q1.2 — PR 631's two severity findings: re-adjudicate or flag?** → **A: re-adjudicate against the written test.** The user **overruled** the host's revised recommendation (which, after finding F1.11, was "flag only"). **Assumption 3 → confirmed as "re-adjudicate".**
  * ⚠️ **F1.11 still binds.** The charter's "pure rule-application, not new judgment" justification is too strong: both nodes carry **multiple** effects (`frontier.yaml:506` → `["JS-E8","JS-E2"]`; `:619` → `["JS-E8","JS-E1"]`), and the severity table in `00_method-and-scope.md:119-124` gives one test per severity but **no rule for which effect governs when several apply**. `frontier.yaml:636` already records a deliberate judgment ("idiom-shift rather than blocking because both obstacles are surmountable") using a criterion the table does not contain. Since the user chose to re-adjudicate, **the charter must state the multi-effect aggregation rule C008 applies** and acknowledge it is filling a gap in the vocabulary — not pretend the table decides it.
* **Q1.3 — Fold `F-943-1` into C008?** → **A: yes, fold it in.** The user **overruled** the host's "keep separate" default. **Assumption 4 → REVERSED.** `F-943-1` is HIGH and live (26 of 179 `prerequisite_depth`/`progression_stage` values computed against the pre-NEU-939 graph; 6 dependencies sequence backwards), its fix is known (re-run the depth/stage computation over the edge-complete graph), and unlike the review-gate fix — now owned by WF-313 — it has **no ticket anywhere**. C008 now owns it. (affects: a new outcome + sub-task; the charter is no longer strictly "findings nobody saw")

## Clarifications — round 3 (2026-07-17), the decomposer's final flagged product choice

* 2026-07-17 Q: OUT-7 asserted "`F-943-3` is resolved with it". The decomposer flagged that finding F3.3's required substance re-check can only close its **inheritance** limb: SUB-14 re-derives `entry_gate` **as** a deterministic function of stage, so the redundancy `F-943-3` actually reports ("carries no independent information"; "Gates B and D instantiated by no node") is **unchanged and its text stays true**. Is OUT-7 met with `F-943-3` surviving as an **open Low**? — **A: Yes. Close the inheritance limb, record it, and leave `F-943-3` open; route the surviving limb to its owner (NEU-940/NEU-888).**
  **Rationale:** the repair *preserves* the determinism `F-943-3` describes, so its text remains accurate. The redundancy is a map-design observation, not a defect C008 created or can repair — resolving it would mean editing NEU-888's progression model, not NEU-940's values. **Marking it closed would file a false present-tense claim — precisely the failure this epic exists to correct.** (affects: OUT-7's measure admits `F-943-3` open; SUB-15 closes what the evidence closes and records the surviving limb honestly against its owner)

## Correction — root cause 1 is RETRACTED (Round-1 finding F1.1, CRITICAL; host-verified)

**The charter's claim that a gitignored `/docs/research/` caused the zero-file reviews is FALSE.** The reviewer falsified it; the host then verified the falsification independently:

* **PR 610 merged 2026-07-16T17:19:31Z** with **all 13 changed files under `docs/research/`** and received a **full Copilot review with 5 findings** — while `/docs/research/` was still in `.gitignore`.
* The ignore rule was not removed until commit `2215786`, **2026-07-17T00:09:45+03:00 (= 2026-07-16T21:09Z)** — roughly **four hours after** 610 was reviewed.
* Mechanically: `git add -f` makes a file **tracked**; `.gitignore` only governs **untracked** files. The deliverable was always tracked, always in the diff, always reviewable. (The host had already recorded this exact fact — "`git check-ignore` is index-aware… tracked only because they were force-added" — and still drew the opposite conclusion.)

**Replacement (strong inference from the PR record — explicitly NOT proven):** a **per-file diff size cap**.

| PR | Largest single-file diff | Copilot outcome |
| -- | -- | -- |
| 610 | 13 files, max **147** lines | reviewed, 5 findings |
| 616 | **1,747** lines (`cl-3-state-compression.yaml`) | reviewed, 2/2 files |
| 618 | **2,185** lines (`frontier.yaml`) | **zero files** |
| 615 | **2,244** lines (`cl-1-foundational.yaml`) | **zero files** |
| 617 | **2,931** lines (`cl-2-combinatorial.yaml`) | **zero files** |

Boundary sits between **~1,750 and ~2,185** added lines in a single file. Corroborating: `frontier.yaml` reviewed fine on PR **631** (a smaller modification) but not on PR **618** (its 2,185-line creation) — same file, different diff size, different outcome. This is a *hypothesis with a clean threshold*, not a fact; it must be labelled as such wherever the charter relies on it, and it is directly testable (open a throwaway PR with one ~2,500-line file).

**Downstream corrections already made outside this charter:** [WF-313](https://linear.app/neurasphere/issue/WF-313) had this false root cause and has been corrected; PR #636's description made the same false claim and has been corrected. PR #636's *action* still stands on its real merits (the `add -f` footgun, 11 stranded untracked docs, `check-ignore` mis-diagnosis).
