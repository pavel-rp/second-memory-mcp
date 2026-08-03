# C008 — review log

Reviews: 5 · Revisions used: 4 of 4 — **cap extended from 3 to 4 by explicit user authorization, 2026-07-17** ("fix it with one more round"). Round-4 terminal status Blocked superseded by that authorization; Revision 4 cleared the full Round-4 residue (F4.1–F4.7). **Round 5: CLEAN — Converged.**

---

## Round 1 — 2026-07-17

**Audited by:** claude-opus-4-8[1m]

```
REVIEWER — Round 1: FINDINGS
Model: claude-opus-4-8[1m]
Coverage: 5/5 outcomes
Findings: 14 (1 critical, 4 high, 8 medium, 1 low)
- F1.1 | CRITICAL | confidence high | route charter-writer | check 13 | 01_charter.md § "Why the findings went unread — context, not C008's work" | quote: "**The deliverable was gitignored — already remediated.** `/docs/research/` was ignored, so Copilot resolved zero files on 3 PRs. … it is *why the false-clean population exists* (615, 617, 618 → OUT-3), and its regression guard (OUT-6) is `.gitignore` content in this repo." | issue: The PR record falsifies this causal claim — PR 610 changed 13 files *all* under `docs/research/` and received a full Copilot review with 5 findings (merged 2026-07-16T17:19Z), and PR 631 likewise, while `/docs/research/` was still in `.gitignore` (removed only at 2026-07-16T21:09Z by `2215786`, whose own message states the C005 packages were "force-added" — git ignores only *untracked* files, so the deliverable was always tracked and diffable); PR 615's review ("Copilot wasn't able to review any files in this pull request", 2026-07-16T18:05Z) landed the same day under the identical ignore state, so gitignore cannot be the differentiator, and the actual differentiator is more likely that 615/617/618 are each a single 2185–2931-line YAML diff (615 → `cl-1-foundational.yaml` +2244, 617 → `cl-2-combinatorial.yaml` +2931, 618 → `frontier.yaml` +2185) — an inference, unlike the falsification. | fix: Retract root cause 1 and Assumptions 5 and 7's causal half, establish the real cause of the zero-file resolution from the PR record before OUT-3 and OUT-6 are decomposed, since both rest on the retracted premise.
- F1.2 | HIGH | confidence medium | route decomposer | check 11 | 02_subtasks.md § SUB-6 | issue: No mechanism named for obtaining a Copilot review of an already-merged PR, and per F1.1 the stated enabler is not the cause. | fix: Name a concrete mechanism (e.g. a fresh PR re-presenting the files, split below whatever cap actually blocked them); make acceptance conditional on the real cause being identified first.
- F1.3 | HIGH | confidence high | route decomposer | check 3 | 02_subtasks.md § SUB-6 § Out of scope | issue: PR 618's only changed file is `frontier.yaml`, which is SUB-4's sole write target — 100% of SUB-6's 618 work is forbidden to SUB-6; the disjoint-file basis for running SUB-6 [P] alongside SUB-4 is false, and SUB-4 has no dependency on SUB-6 to receive routed findings. | fix: Move 618's review into SUB-4, or serialize SUB-6 ahead of SUB-4.
- F1.4 | HIGH | confidence high | route charter-writer | check 11 | 02_subtasks.md § SUB-8 § Acceptance scenarios | issue: Per F1.1 the scenario's consequence is falsified — `docs/research/` was in `.gitignore` when 610 and 631 were fully reviewed, so re-adding it would not reproduce the false clean; the guard's real (smaller) value is preventing silently-skipped untracked NEW files. | fix: Re-justify OUT-6 on the untracked-new-file failure it actually prevents and drop the false-clean claim, or cut it.
- F1.5 | HIGH | confidence high | route user | check 13 | 01_charter.md § Open questions | issue: The decomposer ran on three unconfirmed defaults; the intake explicitly requires routing material ones to the user. | fix: Route Assumptions 1, 3, 4 to the user before the decomposition is accepted.
- F1.6 | MEDIUM | confidence medium | route decomposer | check 9 | 02_subtasks.md § SUB-6 | issue: SUB-6 bundles adversarial review + adjudication of ~7,360 added YAML lines across three PRs into one L slice with an unknown finding count. | fix: Split SUB-6 per PR (615, 617, 618).
- F1.7 | MEDIUM | confidence high | route decomposer | check 4 | 02_subtasks.md § SUB-6 § Out of scope | issue: "22 findings already known" is off by one — SUB-1…SUB-5 cover 23 (5+2+5+4+3+4), matching the charter's own 16+7. In an epic whose subject is an unreconciled count. | fix: Correct 22 → 23.
- F1.8 | MEDIUM | confidence medium | route decomposer | check 11 | 02_subtasks.md § SUB-3 | issue: "the three discrepancies" pre-decides the reconciliation's shape; 55−52=3 is a NET difference and the file's own parenthetical names a split (`E3`→two) that increases the count. | fix: Reword to "every merge and split is itemized so 55 → 52 is reconstructable".
- F1.9 | MEDIUM | confidence medium | route charter-writer | check 5 | 01_charter.md § Problem & why now | issue: The index file reconciles itself in text the charter doesn't quote (`index/00_technique-index.md:57-62` — maintained by hand by SUB-2 only, a deliberate temporary exception logged as `INC-S2`), so an agent CAN determine it may not edit; the residue is narrower (the exception is absent from `manifest.yaml`). The charter applied this "unreconciled, not broken" nuance to 625 but not here. | fix: Restate 612's finding as "the logged `INC-S2` exception is absent from `manifest.yaml`".
- F1.10 | MEDIUM | confidence medium | route decomposer | check 7 | 02_subtasks.md § SUB-2 | issue: Re-decides material owned elsewhere — `INC-S2` has owner "Coverage-audit sub-task (OUT-7)", and NEU-944 explicitly DECLINED this edit ("`sole_writer: generator only`; its staleness is `INC-S2`'s. Superseded for consumers, not seized." — `INC-P2`) — the same ground on which Assumption 4 excluded INC-C1/INC-C2. | fix: Honor the standing restraint and limit the slice to the manifest's missing exception record, or state why C008 has standing to overturn it.
- F1.11 | MEDIUM | confidence medium | route charter-writer | check 6 | 01_charter.md § Constraints & principles | issue: The written vocabulary gives one test per severity but no rule for a node carrying MULTIPLE effects — and both nodes under adjudication do (`:506` → ["JS-E8","JS-E2"]; `:619` → ["JS-E8","JS-E1"]). `frontier.yaml:636` already records a judgment ("both obstacles are surmountable") using a criterion absent from the test. OUT-4's measure is not decidable from the doc alone; an implementer treating it as mechanical may overwrite a deliberate judgment. | fix: Acknowledge the multi-effect aggregation gap and either state the rule C008 applies or downgrade OUT-4 to flagging.
- F1.12 | MEDIUM | confidence medium | route decomposer | check 10 | 02_subtasks.md § Dependency order | issue: SUB-6 routes findings to owning siblings but runs [P] with them and SUB-9 gates on all — a finding routed to a completed sibling has no receiver and no edge expresses the hand-back. | fix: Sequence SUB-6 before its routees, or give the routed-finding path an explicit owner.
- F1.13 | MEDIUM | confidence medium | route decomposer | check 11 | 02_subtasks.md § SUB-8 | issue: SUB-8's PR touches `.gitignore`, not `docs/research/`, so its acceptance criterion cannot be observed at completion — it depends on a future third-party PR and on Copilot's behavior. | fix: Drop, or restate as a post-hoc observation owned by SUB-9.
- F1.14 | LOW | confidence high | route decomposer | check 6 | 02_subtasks.md § SUB-9 | issue: SUB-9 is typed `fix` but fixes nothing by construction ("an auditor that fixes becomes an agent reporting on its own work"). | fix: Retype as audit/chore.
Questions for user:
- Q1.1 | all 25 vs only the ~16 | Q1.2 | re-adjudicate vs flag | Q1.3 | fold F-943-1 or not
```

### Host disposition — Round 1

**F1.1 (CRITICAL) — UPHELD, and independently verified by the host before acting.**
The host confirmed via `gh pr view 610 --json mergedAt,files` (merged `2026-07-16T17:19:31Z`, 13/13 files under `docs/research/`, full review with 5 findings) and `git log -1 2215786` (ignore rule removed `2026-07-17T00:09:45+03:00` = `21:09Z`) — the review predates the fix by ~4h. Mechanism confirmed: force-add ⇒ tracked ⇒ `.gitignore` inapplicable.
The host also verified the reviewer's replacement inference by measuring diffs: 616 = 1,747 lines → reviewed; 615 = 2,244 / 618 = 2,185 / 617 = 2,931 → zero files. Threshold ≈ 1,750–2,185 lines per file. **Recorded as an inference, not a fact.**
**Blast radius beyond the charter, corrected at once:** [WF-313](https://linear.app/neurasphere/issue/WF-313) (filed with the false root cause) and PR #636's description (same false claim) were both amended.

**Q1.1 / Q1.2 / Q1.3 (F1.5, route: user) — ASKED AND ANSWERED.** See `00_intake.md` § "Clarifications — round 2". Two of the three overruled the host. Recorded before the revision dispatch.

**Routing for Revision 1:**
- → **charter-writer:** F1.1 (retract + replace), F1.4 (re-justify OUT-6), F1.9 (restate 612 accurately), F1.11 (state the multi-effect aggregation rule — mandatory now that the user chose re-adjudication), plus all three user answers.
- → **decomposer** (after the writer, since `Scope changed` is expected): F1.2, F1.3, F1.6, F1.7, F1.8, F1.10, F1.12, F1.13, F1.14.

**No findings were waived.**

---

## Round 2 — 2026-07-17

**Audited by:** claude-opus-4-8[1m]

```
REVIEWER — Round 2: FINDINGS
Model: claude-opus-4-8[1m]
Coverage: 5/5 outcomes
Findings: 12 (0 critical, 4 high, 7 medium, 1 low)
- F2.1 | MEDIUM | route charter-writer | 01_charter.md § Constraints | The Round-1 F1.11 fix introduces a NEW gap: the charter states "a node's severity is the most severe of the severities its individual effects earn" but never says at which level `:636`'s surmountability ruling operates. The two readings give opposite results — inside a per-effect test (`00_method-and-scope.md:122`: "A JavaScript-specific technique is *required*, not preferred") the current `idiom-shift` survives; as an aggregate downgrade it is excluded by the stated rule's own wording. OUT-4 is not decidable from the charter as written. | fix: State whether surmountability applies when scoring an individual effect or when aggregating.
- F2.2 | HIGH | route charter-writer | 01_charter.md § OUT-7 | The measure names three binding sites but `F-943-1` is also bound open in sites neither the charter nor SUB-14 lists: a SECOND register (`C005-dp-map-integrity/05_findings-register.md:12` F-943-1 open, `:14` F-943-3 open); `D-P2` (`C005-dp-map-package/06_caps-and-incomplete-scope.md:45`, "unresolved, owner NEU-940"); and the ledger's own pass record `AC-6-P` (`01_schema-decision-ledger.md:221`), which becomes FALSE on closure. The charter's own warning — "a repaired map with a register still calling it open is a new inconsistency" — is exactly what the measure permits. | fix: Enumerate the binding sites in OUT-7's measure and SUB-14's in-scope.
- F2.3 | HIGH | route decomposer | 02_subtasks.md § SUB-14 | The per-node warning markers are GENERATED, not hand-written: `build-cross-reference.mjs:324` emits them from a computed `depthBad`/`invByNode` set, so a correct recomputation drops them automatically — while the generator's hard-coded prose at `:193` and `:202` survives. SUB-14 never names the generator as a write target, so an implementer hand-edits generated output — the same discipline SUB-2 is told to honor. | fix: Name `build-cross-reference.mjs` as SUB-14's write target; regenerate, don't hand-remove.
- F2.4 | HIGH | route decomposer | 02_subtasks.md § SUB-11/12/13 | No acceptance requires the routing slice to POST A REPLY on a routed thread; SUB-9 cannot fix, and every owning sibling completes before it runs — so a routed finding leaves a permanently unreplied thread and OUT-3's measure ("every resulting finding has a verdict and a reply") is unsatisfiable for it. | fix: Require the routing slice to reply with verdict, named owner, and re-scoping flag.
- F2.5 | HIGH | route user | 01_charter.md § Assumption 10 | OUT-6 is a scope-shaping [unconfirmed] assumption created in Revision 1 whose own text argues both sides and names cutting an outcome as the consequence. Never asked. | fix: Route to the user as Q2.1.
- F2.6 | MEDIUM | route decomposer | 02_subtasks.md § SUB-11/12/13 | On the "cap falsified" branch all three OUT-3 slices complete without any review being obtained, so OUT-3's measure is realized by no SUB — coverage contingent on an inference the charter labels unproven. | fix: Give OUT-3 a cause-independent fallback (bisect to an empirically reviewable chunk size), or mark it explicitly conditional.
- F2.7 | MEDIUM | route decomposer | 02_subtasks.md § SUB-9 | "The sweep must take the review-PR numbers from those slices' records" — no such record exists; SUB-9's only input would be the slice's own report, the exact class it exists to distrust ("Every claim rests on the API record, never on a sub-task's report"). | fix: Require SUB-11/12/13 to commit a review record naming each PR number, chunk size, and whether files resolved.
- F2.8 | MEDIUM | route decomposer | 02_subtasks.md § Coverage map | The "do not confuse the two OUT-5s" note has no OUT-7 twin — C008's OUT-7 is F-943-1/SUB-14, but the sources SUB-2 must honor use OUT-7 for NEU-889's coverage audit (`manifest.yaml:161`; `05_caps-and-incomplete-scope.md:19`) — the very restraint SUB-2 must not overturn. | fix: Add a "do not confuse the two OUT-7s" note; disambiguate at each citation.
- F2.9 | MEDIUM | route decomposer | 02_subtasks.md § SUB-8 | Every scenario is conditioned on "when the guard runs" and nothing names what runs it — a guard that ships unwired satisfies all three scenarios while never firing. | fix: Name the CI trigger; make acceptance a failing check on a branch that re-adds the rule.
- F2.11 | MEDIUM | route decomposer | 02_subtasks.md § SUB-14 | PG-7's assertion inventory is incomplete — `PG-7a2` (5 inversion-bearing nodes / 6 inversions) and `PG-7e` (asserts the repair is OUT of scope) both fail on the closed state and neither is named. | fix: Enumerate PG-7a…PG-7e.
- F2.13 | MEDIUM | route decomposer | 02_subtasks.md § SUB-14 | Complexity L and growing (F2.2/F2.3/F2.11): recompute 26 nodes across 4 files, two registers, a ledger entry superseding AC-6-P, five PG-7 assertions, the generator + its prose, D-P2 — plausibly beyond one PR/session. | fix: Split recomputation from record closure, serialized.
- F2.12 | LOW | route decomposer | 02_subtasks.md § SUB-9 | "performed by an agent that did none of the content slices' work" is a dispatch property, unobservable from any artifact. | fix: Move to a dispatch constraint, or record the dispatching agent id.
Questions for user:
- Q2.1 | Keep or cut OUT-6/SUB-8 now that its justification is retracted?
```

### Host disposition — Round 2

**Progress confirmed — the no-progress guard does not fire.** Round 1's blocking set (F1.1 CRITICAL gitignore causality, F1.3 file-ownership collision, F1.5 unrouted assumptions) is **entirely gone**. Round 2's set is new and finer-grained: verification against generator source (F2.3, F2.11), unreachable acceptance (F2.4, F2.6), and a gap the Round-1 fix itself introduced (F2.1). **CRITICAL count 1 → 0.**

**Q2.1 (F2.5, route: user) — ASKED AND ANSWERED: CUT OUT-6.** The user took the charter's own "If wrong: cut OUT-6" clause. Rationale: the real cause is already fixed by `2215786`; the residual value is speculative (nobody has proposed re-adding the rule); and F2.9 showed SUB-8's guard had no named execution trigger, so it could have shipped unwired and satisfied every scenario while never firing. **Assumption 10 → confirmed as "cut". OUT-6 retired; SUB-8 retired.** C008 drops to **four outcomes: OUT-1, OUT-3, OUT-4, OUT-7** — each with a live, evidenced cause.

**Routing for Revision 2:**
- → **charter-writer:** F2.1 (state where surmountability applies), F2.2 (enumerate OUT-7's binding sites), plus the Q2.1 answer (retire OUT-6).
- → **decomposer** (after the writer): F2.3, F2.4, F2.6, F2.7, F2.8, F2.11, F2.13, F2.12. F2.9 is mooted by cutting SUB-8.

**No findings were waived.** This is the **final** revision available — `Revisions used: 2 of 3`. If Round 3 still carries blocking findings, the run ends `CHARTER — Blocked` with the residue listed, per the round cap. Convergence will not be claimed because retries ran out.

---

## Round 3 — 2026-07-17

**Audited by:** claude-opus-4-8[1m]

```
REVIEWER — Round 3: FINDINGS
Model: claude-opus-4-8[1m]
Coverage: 4/4 outcomes
Findings: 10 (1 critical, 4 high, 4 medium, 1 low)
- F3.1 | CRITICAL | route decomposer | SUB-14 | `entry_gate` is a documented function of `progression_stage` (`C005-dp-progression/01_progression-stages.md:81-84`: PS-1→Gate A, PS-2/3/4→Gate C) and the recomputation moves a node across that boundary — `cl-3-state-compression.yaml:273-276` has `PS-1`/`gate-a`/depth 1 while the validator reports its rubric depth as 4 (→PS-4, Gate C). No slice writes `entry_gate`, so SUB-14 ships a PS-4 node carrying `gate-a` and NOTHING catches it: the validator checks only depth agreement + stage monotonicity, and `grep entry_gate` across both `.mjs` files returns one prose emitter and ZERO assertions. OUT-7's measure passes; SUB-15 then files the defect closed over a map C008 just made newly inconsistent — the "second false all-clear" the charter's own High risk names. | fix: Give SUB-14 `entry_gate` as a write target (re-derive from the recomputed stage) and add its consistency to OUT-7's measure.
- F3.2 | HIGH | route decomposer | SUB-15 | The hard-coded-literal inventory is incomplete: `build-cross-reference.mjs:385` emits "`F-943-3` (Low, open) — `entry_gate` is a deterministic function of `progression_stage` … inherits `F-943-1`" as a literal gated only on `n.role !== 'root' && dd(n).entry_gate`, so it re-emits on all 179 blocks after regeneration, contradicting the slice's own acceptance. "This is the one place" is false — same class as Round-2's F2.11. | fix: Name `:385` alongside `:193`/`:202`; enumerate the emitter's literals as a whole.
- F3.3 | HIGH | route decomposer | SUB-15 | Nothing verifies `F-943-3`'s substance, and it is false on BOTH branches of F3.1: its text is "`entry_gate` is a deterministic function … zero exceptions … Gates B and D instantiated by no node" — leave `entry_gate` untouched and the determinism acquires an exception (false in a NEW way, not closed); update it and the redundancy + uninstantiated gates B/D are exactly as before. "Closed" is a false present-tense claim either way. | fix: Re-check determinism and gates-B/D instantiation against the post-SUB-14 map; let the check decide, not the register's forecast.
- F3.4 | HIGH | route charter-writer | OUT-4 § Verified by | Both disjuncts are unsatisfiable on the uphold branch the charter itself declares valid: Constraints say upholding `:619` leaves `cl-2-combinatorial.yaml:2481` "at odds with the rule" (still conflicting), that "C008 does not correct them" (not distinguished), and that the honest path "runs through the surmountability ruling itself rather than through distinguishing their facts". The actual outcome — "records the conflict as a routed finding" — is omitted, so OUT-4 is verifiable only on the override branch, re-introducing the one-sidedness F2.1 was raised to remove. SUB-4's acceptance already handles it correctly; the drift is the charter's. | fix: Add the routed-conflict disjunct.
- F3.5 | HIGH | route decomposer | SUB-15 | **Third recurrence of the missed-binding-site pattern (F2.2, F2.11).** The enumeration misses NEU-940's OWN package: `C005-dp-progression/01_progression-stages.md:108-110` carries present-tense claims about the exact values SUB-14 rewrites — "Observed distribution: PS-1 20 · PS-2 32 · PS-3 36 · PS-4 91. PS-4 holds 51% of the graph … depth range is 1–9" — all of which change (PS-1 drops to ≤19 on the bitmask node alone). "The list is the floor" is the same escape clause F2.2 already found insufficient. | fix: Extend the enumeration and classify, rather than delegating the miss to a catch-all.
- F3.6 | MEDIUM | route decomposer | SUB-14 § Note on the split | The validator is ALREADY green — it prints "28/28 passed / VERDICT: PASS / exit 0" today while reporting "26 depth mismatches, 6 stage inversions", because those are `console.log`ged and never passed to `check()` (`:18`: "findings (F-943-1) are REPORTED, not fatal"). "Turn the validator green" is satisfied by doing nothing. SUB-14's acceptance uses the right signal ("reports zero"); the seam justification and SUB-15's precondition use the one that proves nothing. | fix: Use the ANNOTATION FINDINGS line reading 0/0.
- F3.7 | MEDIUM | route decomposer | SUB-15 (PG-7) | At least two of seven have no closed-state analogue: `PG-7d` asserts the item names a revision trigger (a closed item has none) and `PG-7e` asserts the repair is out of SUB-11 scope (which C008 just made false). "Assert the closed state" is under-defined; an implementer could delete PG-7 and satisfy "the gate passes". | fix: State what PG-7 asserts POST-closure rather than negating seven assertions.
- F3.8 | MEDIUM | route charter-writer | OUT-7 | The "so" overstates causality against the package's own evidence: `D-P2` records "counterfactual reproduces declared depth on 20/26", and the validator confirms 6 nodes (the `cl-4.matrix-exponentiation-dp` family: declared 4 | rubric 5 | pre-939 2) match NEITHER graph. The stated root cause explains 20, not 26. In a charter convened over a total a reader cannot reconstruct from its parts, this is the same unreconciled-arithmetic shape as the 625 finding. | fix: State that pre-939 reproduces 20 of 26 and 6 are wrong for a further, unestablished reason.
- F3.9 | MEDIUM | route decomposer | instrument/deliverable table | "the same review record" reads as one shared artifact across SUB-11/12/13, but SUB-11/SUB-12 are `[P]` justified "only because 615's and 617's diffs are each a single, mutually disjoint node file" — a disjointness test applied to the node files but never to the record itself. The decomposition's own rule (invoked to serialize the ledger) is that a shared write target defeats parallel work. | fix: Name the per-slice artifact; state the disjointness that makes the record safe too.
- F3.10 | LOW | route decomposer | SUB-11/12/13 | Four out-of-scope items are nested under the "Routing a cross-file finding" sub-heading rather than under Out of scope, so they read as routing steps. Repeats in all three slices. | fix: Move them back under Out of scope.
Questions for user:
- (none — every finding is an author-fixable defect, not a product choice)
```

### Host disposition — Round 3

**No-progress guard: does NOT fire.** Round 2's blocking set is entirely resolved; Round 3's is new and deeper — the reviewer is now *executing* the validator and grepping the emitters rather than reading prose. Trend: **14 → 12 → 10** findings; MEDIUM 8 → 7 → 4. Zero user questions this round (all author-fixable), versus one in each prior round.

**But one signal outweighs the counts.** F3.5 names itself *"the third recurrence of the missed-binding-site pattern (F2.2, F2.11)"* — three rounds, three different missed sites (a second register + `D-P2` + `AC-6-P`; then `PG-7a2`/`PG-7e`; now `C005-dp-progression`'s distribution claims). **The specific instances differ every time, so the guard cannot fire — but the class is stable.** The correct read is not "enumerate harder a fourth time": it is that **a hand-written binding-site list cannot be completed at charter time**, and the charter's own escape clause ("the list is the floor, not the ceiling") is what keeps letting the miss through. Revision 3 therefore attacks the class — converting the enumeration into a **required discovery step** the sub-task performs — rather than appending the newest three sites and inviting a fourth.

**Routing for Revision 3 (FINAL — `Revisions used: 3 of 3`):**
- → **charter-writer:** F3.4 (add OUT-4's routed-conflict disjunct), F3.8 (20-of-26 causality), F3.5-charter-half (OUT-7's enumeration → discovery requirement), F3.1's measure half (`entry_gate` consistency in OUT-7's measure).
- → **decomposer:** F3.1 (`entry_gate` write target), F3.2, F3.3, F3.6, F3.7, F3.9, F3.10.

**No findings waived.** If Round 4 carries blocking findings, the run ends **`CHARTER — Blocked`** with the residue listed. Convergence will not be claimed because retries ran out.

---

## Round 4 — 2026-07-17 — **TERMINAL: round cap reached**

**Audited by:** claude-opus-4-8[1m]

```
REVIEWER — Round 4: FINDINGS
Model: claude-opus-4-8[1m]
Coverage: 4/4 outcomes
Findings: 7 (1 critical, 2 high, 3 medium, 1 low)
- F4.1 | CRITICAL | route charter-writer | OUT-7 § Success measure | "`F-943-3`, which inherits from it, is resolved with it." — the PRE-round-3 claim. Directly contradicts the user's confirmed answer and SUB-15's acceptance ("only the limbs the evidence closes are closed"), so OUT-7's measure — the bar a verifier reads — demands exactly the false present-tense claim the user forbade, and no SUB realizes it. | fix: Restate OUT-7's measure to admit `F-943-3` open.
- F4.2 | HIGH | route charter-writer | "OUT-7's binding sites" § class 1 | The class-1 rule ("OUT-7 is not met until every one reports the item closed") sweeps in `F-943-3`'s OWN sites — `05_findings-register.md:14` and `03_open-items-and-provisional-register.md:106` — and the row's own sentence declares leaving `:14` open "a false one", which the round-3 answer inverts: leaving it open is the TRUE claim. | fix: Split the rows by finding id; scope the rule to `F-943-1`'s sites.
- F4.3 | HIGH | route decomposer | SUB-15 § class 1 | Same contradiction inside SUB-15: the seed rows instruct flipping `:14` and `:106` to closed, while SUB-15's own `F-943-3` bullet 20 lines later rules the opposite. The seed rows are what an implementer works first, so the slice can close `F-943-3` and still believe it complied. | fix: Exempt `F-943-3`'s sites from the class-1 rule; route them to the substance-re-check bullet.
- F4.4 | MEDIUM | route charter-writer | Clarification log / Assumptions | Round 3's only user decision appears NOWHERE in the charter — no log entry, no assumption row, no open-questions item, though every prior answer got all three. A cold reader cannot learn the decision exists — which is HOW F4.1's stale measure survived. | fix: Add the log entry and an assumption row.
- F4.5 | MEDIUM | route decomposer | SUB-15 § class 2 buckets | `:330-332` appears in bucket a ("Regenerate; touch nothing") AND bucket b ("Edit the source"). Bucket b's justification is false for them: `:323` gates the whole block on `if (depthBad.has(n.id) || invByNode.has(n.id))`, which SUB-14's recomputation empties — so regeneration re-emits nothing, while editing risks destroying the machinery that surfaces any FUTURE mismatch, which SUB-15's own PG-7 rework depends on. | fix: Move `:330-332` into bucket a; keep the warning block intact.
- F4.6 | MEDIUM | confidence low | route decomposer | SUB-15 | Complexity M but carries a three-limb discovery + per-hit classification over 18 files, ≥8 live sites across six packages, a PG-7 redesign inside an executable, six generator literal sites + regeneration, a three-limb `F-943-3` adjudication, an `AC-6-P` supersession, and a ledger entry — visibly larger than SUB-14, typed the same. | fix: Re-estimate to L, or split again.
- F4.7 | LOW | route decomposer | SUB-15 § bucket b | `build-cross-reference.mjs:204` ("See `../03_open-items-and-provisional-register.md` for owner and revision trigger.") is an unguarded literal that goes stale on closure and is absent from the bucket and the enumerating scenario — re-creating in miniature the closed-list shape the prose above it retires. | fix: Add `:204`, or rest the scenario on "every finding-bearing literal".
Questions for user: (none — all author-fixable)
```

### Host disposition — Round 4: **BLOCKED (round cap)**

**`Revisions used: 3 of 3`. Per Phase 5's round cap the run stops here.** Convergence is **not** claimed. The residue above is real and unfixed.

**Trend across the run:** findings **14 → 12 → 10 → 7**; MEDIUM **8 → 7 → 4 → 3**; user questions **1 → 1 → 0 → 0**. The charter converged substantially — the reviewer moved from prose contradictions to *executing* the validator and grepping the emitters — but did not reach clean.

**Root cause of the terminal CRITICAL — a host sequencing error, not a charter defect.** F4.1, F4.2 and F4.4 are one fault: the round-3 product choice (`F-943-3` stays open) was answered **after** the writer's final revision. The host folded it into `00_intake.md` and re-dispatched **only the decomposer** — following Phase 3's flag rule, which says re-dispatch the decomposer. But this answer changed an **outcome's success measure**, which lives in the charter, so the **writer needed to run too**. `02_subtasks.md` reflects the decision; `01_charter.md` does not. F4.4 names the mechanism precisely: the decision "appears nowhere in the charter … which is how F4.1's stale measure survived."

**Lesson for the skill:** Phase 3's flag path re-dispatches the decomposer only. When a flagged product choice changes an **outcome**, the writer must run first — the same rule Phase 5 already applies to user answers ("if an answer changes the charter … dispatch the writer"). The flag path lacks that clause.

**What one more revision would take:** a single writer pass — restate OUT-7's measure to admit `F-943-3` open (F4.1), split the class-1 binding-site rows by finding id (F4.2), add the clarification-log entry and assumption row (F4.4) — plus a decomposer pass for F4.3 (exempt `F-943-3`'s sites), F4.5 (`:330-332` → bucket a), F4.6 (re-estimate SUB-15), F4.7 (`:204`).

**Nothing is published.** Phase 6 runs at convergence only; no Linear umbrella or sub-tasks were created for C008. All artifacts are preserved on disk. **`WF-313` is unaffected** — it was published independently, is corrected, and stands on its own.

### Addendum — user-authorized extension (2026-07-17)

The user reviewed the Blocked state and its root-cause analysis and **authorized one additional revision round** ("fix it with one more round"). The cap is extended 3 → 4 for this run only; the header reflects it. The Blocked status above is superseded.

**Routing for Revision 4 (user-authorized):**
- → **charter-writer:** F4.1 (restate OUT-7's measure to admit `F-943-3` open), F4.2 (split the class-1 binding-site rows by finding id; scope the flip rule to `F-943-1`'s sites), F4.4 (add the round-3 decision to the clarification log and an assumption row) — plus the round-3 user answer **verbatim** from `00_intake.md:97-98`, which the writer never received (the sequencing fault named above).
- → **decomposer** (after the writer): F4.3 (exempt `F-943-3`'s sites from SUB-15's class-1 seed rows; route them to the substance-re-check bullet), F4.5 (`:330-332` → bucket a; keep the warning machinery intact), F4.6 (re-estimate SUB-15 or split), F4.7 (`:204` unguarded literal).
- Then a full-set Round 5 review.

**No findings waived.**

---

## Round 5 — 2026-07-17 — **CLEAN**

**Audited by:** claude-opus-4-8[1m]

```
REVIEWER — Round 5: CLEAN
Model: claude-opus-4-8[1m]
Coverage: 4/4 outcomes
Findings: 0 (0 critical, 0 high, 0 medium, 0 low)
```

### Host disposition — Round 5: **CONVERGED**

Zero findings; per Phase 5 rule 2 the charter is marked `Converged` and proceeds to publish. What the reviewer verified before returning clean, in its own summary:

- **All 7 Round-4 findings fixed and grounded** — F4.1 (OUT-7's measure admits `F-943-3` open), F4.2 (class-1 rows split by finding id), F4.3 (SUB-15 exempts `F-943-3`'s sites from flip-to-closed), F4.4 (Assumption 13 + clarification-log entry), F4.5 (`:330-332` in bucket a only), F4.6 (SUB-15 M→L), F4.7 (`:204` covered).
- **The terminal contradiction is gone**: OUT-7's measure and SUB-15's acceptance now agree on `F-943-3`'s disposition — stays open (Low), inheritance limb discharged, surviving limb routed to NEU-940/NEU-888; a grep confirms no stale "closes/resolved with it" claim survives outside historical records and the register's own forecast text, both correctly identified as forecasts the substance re-check overrides.
- **Every load-bearing static citation re-verified against the actual files**, and the one runtime claim re-executed: `audit-graph-integrity.mjs` prints `28/28 passed` / exit 0 while its ANNOTATION FINDINGS line reports `26 depth mismatches, 6 stage inversions` — corroborating the SUB-14/SUB-15 seam and the 20/6 causality split.
- One candidate flag ("six packages" in SUB-15's complexity aside) was dropped by the reviewer itself on grounding ambiguity, not waived by the host.

**Trend across the run:** findings **14 → 12 → 10 → 7 → 0**. No accepted warnings; final status is plain **Converged**.

