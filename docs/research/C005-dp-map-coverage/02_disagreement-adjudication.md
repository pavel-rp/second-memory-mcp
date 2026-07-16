# Coverage Disagreements — Adjudicated

**Task:** NEU-942 (SUB-10) · **Compiled:** 2026-07-16 · **Map version:** `0.1.0`

Every coverage disagreement surfaced by `01_coverage-matrix.md` and `03_residual-exclusion-consolidation.md`, with exactly one verdict each. **A silently smoothed difference fails the audit** (NEU-942 constraint), so there is no "no action" row and no row without a verdict.

Verdict types: **IE** intentional exclusion · **ME** mapped equivalence · **UU** unresolved uncertainty · **GAP** genuine gap with a named owner.

**Verdicts are recorded in `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` §3.2 (`D-C1`…`D-C4`).** This file argues them; the ledger records them. This file sets no status.

---

## Tally

| Verdict | Count |
| --- | --- |
| **GAP** — genuine gap with a named owner | **10** |
| **ME** — mapped equivalence | **11** |
| **IE** — intentional exclusion | **6** |
| **UU** — unresolved uncertainty | **3** |
| **Total disagreements adjudicated** | **30** |

All 10 GAPs carry a named owner. **Nine of the ten are one gap class** (`04_work-split-seam.md`); the tenth (`CV-19`) is an intra-cluster edge omission routed to SUB-9/SUB-12.

---

## A. The gap class — CL-4-by-cascade, enumerated by neither CL-4 half

The full argument is `04_work-split-seam.md`. The verdicts:

### `CV-1` — SOS DP (sum-over-subsets / zeta–Möbius transform) · **GAP**

**The disagreement.** T4, T5, T6 and C3/C4/C5/C6 all carry SOS DP substantively. The mapped graph contains **no SOS DP node in any cluster**.

**How it happened — all four mappers were correct.** CL-3 declined (`E1`): `D-F4` §4.2 assigns it to CL-4 and U4 says *"the existing assignment stands; you may LINK, not own. Do not resolve this locally."* CL-4-mainstream declined (`RX-1`): not among SUB-6's five enumerated areas, and *"mapping it would silently claim a live dispute; asserting it away would smooth it."* CL-4-frontier declined (`RX-3`): it is canon-adjacent, not research-tier, so it is the mainstream half's if CL-4 holds. CL-2 declined (`E8`): no claim on either reading. **Four correct local decisions composed into a hole.** This is a decomposition defect, not a mapper defect.

**Verdict: GENUINE GAP.** SOS DP is material (four taxonomies, four corpora, a real Div1 technique), it is inside the partition's domain, `D-F4` assigns it an owning *cluster*, and it is mapped by nobody. `RX-3`'s own revision trigger — *"OUT-7 finds SOS DP mapped in NEITHER cl-4-optimization file NOR cl-3"* — **fires here, exactly as SUB-13 predicted.** So does `RX-1`'s `action_if_unresolved`.

**Consequence beyond the missing node, recorded because it is load-bearing:** `cl-3.bitmask-state-encoding` declares `xc.cl-3.bitmask-state-encoding->cl-4.sos-dp` — **an attachment to a target that does not exist.** SUB-12 (NEU-939) will correctly report it unresolvable. The unresolvable attachment is a *symptom*; this gap is the cause. Fixing the attachment without minting the node would smooth the cause.

**Named owner:** blocked on `CV-1a`. Once `D-F4a` is adjudicated: **NEU-937's cluster half (CL-4 mainstream) if CL-4 holds; NEU-936 (CL-3) if CL-3's U4 claim succeeds.** Because both mapping sub-tasks are merged, discharging it requires a **new follow-up task in the winning cluster** — a creator decision. See `INC-C1`.

### `CV-1a` — The `D-F4a` cluster assignment of SOS DP · **UU**

**The disagreement.** `D-F4` §4.2 adjudicates SOS DP to CL-4 by cascade order (T1 before T2), logged `D-F4a` **provisional** with CL-3's counter-claim **live**: the mask encoding, not the speedup, is its defining contribution. Carried as `X-D1`. Both readings are genuinely strong — T1 fires (it accelerates an already-correct subset-indexed transition from 3ⁿ to 2ⁿ·n) *and* T2 fires (it is inseparable from the subset-mask encoding).

**This audit's reasoned position, recorded as a recommendation and not as a decision:** `D-F4` §3.1's ordering argument is that T1 goes first because *"an optimization is parasitic on a base DP"* — it presupposes a correct recurrence existing elsewhere, owned by another cluster. **That test is where SOS DP is genuinely awkward:** the "already-correct naive 3ⁿ transition" that SOS DP accelerates is not owned by any cluster and is mapped nowhere, because nobody teaches or uses it as a technique in its own right. T1's ordering rationale presupposes a base node that, for SOS DP uniquely among CL-4's members, does not exist. Every other T1 member (CHT, Knuth, D&C, matrix exponentiation, slope trick) accelerates a base that *is* mapped in a sibling cluster. That asymmetry is real evidence for CL-3's claim, and it is offered to `D-F4a`'s owner as such.

**Verdict: UNRESOLVED UNCERTAINTY.** This audit does **not** flip it, for a reason of standing rather than of confidence: **`D-F4a` lives in NEU-932's selection-decision ledger, which this sub-task does not own** (`../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md`). NEU-942's remit is coverage, and its ledger is SUB-2's. A coverage audit that silently re-decided a partition entry it has no writing rights over would be committing the exact category error — a local re-decision against a settled-with-live-dispute entry — that U4 exists to prevent, and it would be a worse defect than the gap it closes. **The coverage verdict (`CV-1`: it is a gap) does not depend on which way `D-F4a` goes**, so the gap is fully adjudicated regardless.

**Named owner:** **`D-F4`/`D-F4a`'s owner (NEU-932) — a creator decision**, routable by SUB-11 (NEU-944) during final ledger reconciliation, or by NEU-936 filing the U4 challenge that `X-D1` has kept live and unfiled. **Revision trigger:** `D-F4a` is adjudicated either way. Until then `D-F4`'s assignment to CL-4 stands, per U4.

### `CV-2` — LIS in O(n log n) · **GAP**

**The disagreement.** Carried by all three canonical taxonomies plus T4, and by C1/C2/C4. `D-F4` §3.2 row 70 uses it as the **worked demonstration of the partition rule itself** — *"LIS in O(n²) is CL-1; LIS in O(n log n) is CL-4. Same problem, different node."* CL-1 correctly excluded it (`EXC-5`). CL-4-mainstream correctly excluded it (`RX-2`): *"assigned to CL-4 but not enumerated for SUB-6 … equally absent from SUB-13's frontier list."* Nobody mapped it.

**Verdict: GENUINE GAP.** The technique the partition uses to *demonstrate that it works* is unmapped. This is the cleanest possible instance of the class in `04_…`: the cluster assignment is settled and uncontested; only the work split has no owner for it. `RX-2` flagged it for this audit by name and is upheld in full.

**Named owner:** **CL-4 mainstream (NEU-937's cluster half)** — uncontested, so no `D-F4a` blocker. Requires a follow-up task (`INC-C1`).

### `CV-3` — Bounded-knapsack binary / powers-of-two splitting · **GAP**

**The disagreement.** SUB-4's spec grants CL-2 "bounded variants," and CL-2 mapped the *recurrence* (`cl-2.bounded-knapsack-multiplicity`). `E3` excluded both standard *accelerations* to CL-4 under T1, flagging the risk that they *"are knapsack-flavoured and may read as CL-2's from CL-4's side — they fall through the fan-out."*

**Verdict on the splitting half: GENUINE GAP.** `E3`'s cascade reasoning is correct — binary splitting reduces the cost of an already-correct recurrence without changing what a state means, so T1 fires and it is CL-4's. It appears in none of SUB-6's five areas nor SUB-13's list. **`E3`'s predicted fall-through happened.**

**Named owner:** **CL-4 mainstream (NEU-937's cluster half)**, via `INC-C1`.

### `CV-4` — Bounded-knapsack monotonic-deque evaluation · **ME**

**The disagreement.** `E3` bundles the monotonic-deque acceleration with binary splitting and excludes both, predicting both may fall through.

**Verdict: MAPPED EQUIVALENCE — `E3` is half-right, and this audit splits it.** The deque acceleration **is mapped**: `cl-4.monotonic-queue-optimization` is one of SUB-6's five enumerated areas, and mainstream.yaml declares a cross-cluster attachment `to_name: "Bounded knapsack DP" → CL-2` from that exact node. So the sliding-window evaluation of the bounded-knapsack recurrence is mapped as the general technique with its base declared. **`E3`'s residual risk fired for the splitting half and did not fire for the deque half.** Recorded as a split verdict rather than upholding `E3` wholesale, because reporting a mapped technique as a gap would be as much a defect as missing one.

**No owner required** — nothing is missing.

### `CV-5` — Bitset / word-parallel optimization · **GAP**

**The disagreement.** Excluded from CL-2 (`E4`, bitset-accelerated subset sum → T1 → CL-4) and from CL-3 (`E4`, bitset acceleration of a bitmask DP → T1 → CL-4). CL-3 **declares an attachment to it**: `→ CL-4 "Bitset / word-parallel optimization" (required-by)`. Neither CL-4 half enumerates it. Nobody mapped it.

**Verdict: GENUINE GAP.** Two clusters independently routed it to CL-4; CL-4 has no enumerated slot for it. As with `CV-1`, **a declared attachment now points at a non-existent target**, which SUB-12 will report unresolvable — symptom, not cause.

**Named owner:** **CL-4 mainstream (NEU-937's cluster half)**, via `INC-C1`. Carries a JavaScript-materiality question (no native fixed-width bitset) which is **SUB-8's (NEU-941), not this audit's** — noted so it is not lost, not adjudicated here.

### `CV-11` · `CV-12` · `CV-13` · `CV-14` · `CV-15` · `CV-16` — the sweep's five further instances · **GAP** ×5 (six rows, five owners)

Found by sweeping the class rather than by taking the three named instances as the whole. Each is: T1 fires → CL-4 → in neither half's enumeration → mapped by nobody. Each was correctly excluded by the cluster that hosts its base.

| Id | Technique | Excluded by | Why it is the same class |
| --- | --- | --- | --- |
| `CV-11` | **Prefix-sum acceleration of a DP transition** | CL-1 `EXC-2` | SUB-3's spec says "prefix-sum DP"; `EXC-2` reads that as the *recurrence* (mapped, `cl-1.prefix-aggregate-recurrence`) and not the *acceleration* (T1 → CL-4). The reading is right — and it lands the acceleration in the seam. `EXC-2` says outright: *"If SUB-6 does not map the acceleration, that is a coverage finding for OUT-7."* **It did not; this is that finding.** |
| `CV-12` | **Rolling-array / memory compression** | CL-1 `EXC-3` | Canon-level (all three canonical taxonomies carry it) and unmapped. `EXC-3`'s T1 reasoning is exactly right — *"the recurrence is correct before the compression and correct after it"* — and its contrast with `cl-1.order-2d-table-evaluation` (wrong order makes the DP **wrong**, not slow → T4 → CL-1, mapped) is a model application of the cascade. The technique still has no owner. |
| `CV-13` | **Hirschberg linear-space alignment; bit-parallel edit distance** | CL-1 `EXC-6` | `EXC-6` correctly notes it is *"an application of the rule rather than a citation of it"* and asks SUB-6 to rule on whether bit-parallel edit distance is in the technique space at all. **Ruled: it is** — T4/T5/T6 carry it, C4/C5 exercise it, and it reduces the cost of an already-correct recurrence. It is CL-4's and unowned. |
| `CV-14` | **Small-to-large merging / DSU on tree** | CL-2 `E5` | `E5`'s distinction is sound and worth preserving: *proving* the natural merge's bound is an argument about an unchanged recurrence (S1/CL-2, mapped as `cl-2.prove-tree-knapsack-quadratic-bound`); *reorganizing* the merge to beat that bound is a cost reduction (T1/CL-4, unmapped). |
| `CV-15` | **Segment-tree-accelerated digit / automaton transitions** | CL-3 `E6` | T1 → CL-4, in neither enumeration. Note the non-DP prerequisite is already registered (`anchor.segment-tree@1.0.0`), so this gap needs **no AR-1** — only a mapper. |
| `CV-16` | **Broken-profile DP accelerated by profile hashing** | CL-3 `E7` | `E7` maps the encoding (`cl-3.broken-profile-state-encoding`) and correctly excludes the acceleration to CL-4. Same seam. |

**Named owner for all six:** **CL-4 mainstream (NEU-937's cluster half)** — none is contested and none is research-tier. All discharge through `INC-C1`.

## B. Ownerless exclusions — settled

### `CV-7` — Centroid-decomposition path counting · **IE** · *settles CL-2's `E9`*

**The disagreement, and why it reached this audit.** `E9` is the **one exclusion in the entire map with no named owning cluster**, excluded by SUB-4 as not-DP, with a rival T3 reading recorded and **escalated to OUT-7**: *"SUB-4 has no route to settle this alone — it is a D-F4 scope question."* OUT-7 forbids shipping a gap without an owner, so this audit must settle it or name the owner.

**Settled: SUB-4's reading is upheld. Centroid-decomposition path counting is outside the partition's domain.**

The rival T3 reading — take the per-centroid-level subproblems as states over a tree structure — fails on a ground that is decisive and is not a matter of taste: **centroid decomposition's subproblems are disjoint.** Each component below a centroid is solved independently and no subproblem is ever recomputed. That is the *definition* of divide-and-conquer and the *negation* of **overlapping subproblems**, which is one of the four DP first principles frozen as roots by `D-S2`. A technique that fails a frozen root principle is not a DP technique the map owns; the rival reading would have the map's own floor contradict its membership test.

Two independent confirmations:
- **The register's own boundary test** (`boundary-register.yaml` §boundary, quoted by `D-F4` §1): it *"computes no recurrence and makes no optimal-substructure claim."* Centroid decomposition computes a recursive *scheme*, not a recurrence over a state space, and the counting through a centroid is a combinatorial merge, not a fold over subproblem optima.
- **The `RX-5` precedent, decided the same way by a different mapper.** SUB-13 excluded **segment tree beats** on exactly this ground — outside the partition, not-DP, *"anchor-shaped, not node-shaped"* — and named OUT-7 its adjudicator. Deciding `E9` the same way is consistency, not convenience; deciding it differently would require explaining why a D&C scheme over a tree is DP while a D&C data structure is not.

**Why nothing is lost, which is the part that matters.** Centroid decomposition appears in corpora almost exclusively **composed with DP** (`F-C-4`). That composition decomposes cleanly: centroid decomposition (not DP, outside the partition) **+** tree DP (CL-2, mapped, 61 nodes). `RX-11` already rules compositions are not nodes and this audit upholds that (`CV-10`). **The learner path is intact; only the name is absent, and the name is not a DP technique.**

**Named owner — `E9` is no longer ownerless.** No owning cluster is required, because it is not in the partition's domain. Its residual route is `RX-5`'s: **any mapper that acquires a real DP dependent needing centroid-decomposition semantics files AR-1** for it as an anchor — with a dependent, as AR-1 requires. **Revision trigger:** such a dependent appears, **or** a corpus instance is found in which the centroid recursion itself carries overlapping subproblems.

### `CV-9` — Segment tree beats · **IE** · *upholds `RX-5`*

**Verdict: upheld, on the reasoning `RX-5` gives.** It is a general-algorithms data structure for range chmin/chmax; the cascade fires nothing; its genuine DP interplay **is** the kinetic case, which **is** mapped (`cl-4.kinetic-segment-tree-*`). SUB-13's refusal to file a speculative AR-1 for an anchor no node depends on is correct and matches `D-S3`'s recorded rejected alternative (*"pre-emptively registering anchors the spec does not name (would invent scope)"*).

**Named owner:** as `RX-5` states — the alias pointer is SUB-13's; any mapper acquiring a real dependent routes AR-1.

### `CV-8` — Partizan / surreal-number combinatorial game theory · **IE** · *upholds CL-3's `E9`*

**Verdict: upheld.** The selected references reach impartial games and Sprague–Grundy (mapped, 7 nodes); partizan game values sit outside the competitive-DP canon the charter's audience line fixes. Material, so it carries a rationale rather than being silent. **Trigger:** a corpus instance is found. **Owner:** NEU-936 (CL-3) if the trigger fires.

*Note: CL-3's `E9` cites the reference set as "T1-T5"; the set is **T1–T6** (`D-F1` §2). The omission does not change the verdict — T6 is primary literature for the CL-4 optimizations and carries no partizan-game claim bearing on this — but it is recorded rather than silently corrected. See `CV-31`.*

### `CV-10` — Composed frontier techniques · **IE** · *upholds `RX-11`*

**Verdict: upheld, and it is the best-evidenced exclusion in the map.** `RX-11` is grounded directly in `F-C-4` (*"frontier techniques appear in corpora predominantly as compositions"*) and in that finding's own stated consequence for SUB-6/SUB-13 (*"expect to decompose compositions rather than find clean instances"*). SUB-13 decomposed them and mapped the components. Minting a node per observed composition would make the node set grow with the corpus rather than with the technique space — topic volume, the charter's #1 anti-goal. **Trigger:** a composition with genuinely emergent content a learner cannot acquire from its components. **Owner:** SUB-13's scope if the trigger fires; this audit found none either.

### `CV-29` — The exotic tail (`RX-7`, `RX-8`, `RX-9`, `RX-12`) · **IE**

**Verdict: upheld as a group, on materiality.** L♮-/M-convex discrete convex analysis, multi-parameter Lagrangian relaxation, sub-quadratic non-convex (min,+) convolution, and quantum/parallel/streaming/approximate speedups each have T1 firing in the abstract and **no instance in any D-F2 corpus**. Each is literature-real and learner-unreal at this charter's audience line. NEU-887's materiality rule (referenced, not re-derived) bounds the map to what the audience line makes material, and `RX-7` is right that this is *"the single most defensible place to draw the maximalist line."* This audit independently checked the corpus claim for each and found no counter-instance. **Owners and triggers:** as recorded per entry.

### `CV-30` — Ranked zeta / fast subset convolution beyond SOS · **IE** · *upholds `RX-10`*

**Verdict: upheld on materiality**, with `RX-10`'s second ground noted as correct and now partly discharged: it is downstream of `CV-1`/`CV-1a`. **Trigger sharpened:** `RX-10`'s trigger requires *both* `D-F4a` adjudication *and* a corpus instance. `CV-1a` will discharge the first; the second remains unmet. The exclusion stands either way.

## C. Mapped equivalences — differences that are presentation, not content

`F-T-4` and `X-D2` make this the expected verdict class, and it is the class where a careless audit manufactures false gaps.

| Id | Disagreement | Verdict |
| --- | --- | --- |
| **`CV-6`** | **Plug DP / broken-profile DP — a charter-wording vs. `D-F4` conflict.** The NEU-938 spec **names** "broken-profile / connection-profile DP" in SUB-13's scope; `D-F4` §3.2 (**settled**) assigns plug/broken-profile DP to **CL-3** on T2. SUB-13 followed `D-F4`, did not map it, and recorded the conflict (`RX-1`, `X-938-1`), judging the spec wording loose because it groups by *rarity* — which `D-F4` §2.1 argues is not a partition criterion (*"popularity and recency, which drift, not structure, which doesn't"*). **Verdict: MAPPED EQUIVALENCE — verified, and the map has no hole.** NEU-936 mapped it in CL-3 as **3 nodes** (`cl-3.broken-profile-state-encoding` and kin). Coverage confirmed present against T1 (which carries "DP on broken profile"), T4, T5, and C3/C4/C5. **`RX-1` correctly predicted its own resolution** (*"THE MAP HAS NO HOLE: the technique is mapped, by SUB-5, in CL-3"*). SUB-13's substantive reading is also endorsed: the profile *encoding* is the contribution and without it there is no tractable recurrence to accelerate, so T1 does not fire and T2 does. **Not re-litigated; the `U4` challenge route SUB-13 left open in NEU-932's ledger needs no exercise.** No owner required. |
| **`CV-4`** | Bounded-knapsack monotonic-deque evaluation — see §A. |
| **`CV-20`** | **"State-machine DP" alias collision.** `cl-1.state-machine-over-sequence` carries the community alias "state-machine DP", which collides conceptually with CL-3's automaton DP. **Verdict: ME — two different techniques, not a duplicate and not a gap.** CL-1's is a small fixed mode set read off the statement; CL-3's is a state space built from the input by an automaton construction. Both mapped, in their correct clusters. `EXC-9` carried the alias per `X-D2` precisely so this audit would read it as naming instability. **It worked as designed** — this is `X-D2`'s mitigation paying off. |
| **`CV-21`** | Automaton DP (incl. Aho–Corasick) — excluded from CL-4-frontier (`RX-2`), **mapped in CL-3 as 3 nodes**. ME. Assigned by `D-F4` §3.2 on T2; T1 never fires. |
| **`CV-22`** | Steiner-tree DP — excluded from CL-2 (`E6`) and CL-4-frontier (`RX-4`), **mapped in CL-3 as 2 nodes**. ME. A genuine multi-match (T2 vs T3) resolved by cascade order and logged, not smoothed — `PC-4` working. |
| **`CV-23`** | **Monotone minima.** `RX-6` excludes it from the frontier as SUB-6's, with the trigger *"OUT-7 finds D&C optimization / monotone minima unmapped in mainstream.yaml."* **Verdict: ME — the trigger does NOT fire.** `cl-4.divide-and-conquer-optimization` is mapped in mainstream.yaml, and `cl-4.smawk-application` records the relationship as an intra-cluster prerequisite on that exact id. Monotone minima *is* the mechanism of D&C optimization; mapping it separately would duplicate. Checked explicitly because `RX-6` asked this audit to check it. |
| **`CV-24`** | Matrix-exponentiation applied to an expectation DP (`E5`) — ME. Matrix-exponentiation DP **is** one of SUB-6's five enumerated areas and is mapped; the expectation-DP application is an instance of the mapped technique, not a separate technique. **Distinguishes this row from the `04_…` class**: here the technique *is* enumerated, so no seam. The base it accelerates (expectation DP) is mapped in CL-3. Nothing missing. |
| **`CV-25`** | Slope trick — excluded from CL-3 (`E2`), **mapped in CL-4-frontier as 6 nodes**. ME. |
| **`CV-26`** | Lagrangian relaxation / "Aliens trick" — the same technique under two names (`F-T-4` names this case explicitly), **mapped as 5 nodes**. ME, and a direct vindication of `X-D2`'s alias discipline. |
| **`CV-27`** | Kinetic segment tree ↔ DP interplay — excluded from CL-3 (`E3`), **mapped in CL-4-frontier**. ME. |
| **`CV-28`** | **SMAWK / LARSCH — the map ahead of its references.** Carried substantively only by T6 (primary literature); essentially absent from the taxonomies. **Verdict: ME, not a gap and not an over-reach.** `D-F1` §6 permits the map to include a technique no reference lists, and Convention U1 makes its absence *"irrelevant to ownership … a coverage question for the audit sub-task, not a partition question."* **The coverage question, answered:** it is legitimately mapped — T6 grounds it in primary sources with real correctness conditions, which is exactly what T6 was selected for, and it gives the frontier a research-tier endpoint whose chain reaches the roots (OUT-6's requirement, verified by SUB-9). |
| **`CV-31`** | CL-3's `E9` cites the reference set as "T1-T5"; the selected set is **T1–T6**. **Verdict: ME — a citation slip, not a coverage difference.** T6 carries no partizan-game claim, so the verdict in `E9` is unaffected. Recorded rather than silently corrected, per the no-smoothing rule. No owner required; SUB-11 may tidy the citation during final reconciliation. |

## D. Unresolved uncertainties

| Id | Uncertainty | Owner | Trigger |
| --- | --- | --- | --- |
| **`CV-1a`** | The `D-F4a` cluster assignment of SOS DP — see §A. | **`D-F4`/`D-F4a`'s owner (NEU-932) — creator decision**; routable by SUB-11 (NEU-944) or by NEU-936's unfiled U4 challenge. | `D-F4a` adjudicated either way. |
| **`CV-17`** | **Problem-level corpus references cannot be resolved by this audit.** CL-1's `EXC-1` and CL-2's `E0` both withdrew problem-level refs to corpus-level ones and both assigned resolution to OUT-7 (*"OUT-7 resolves refs to problems when it audits coverage"*). **This audit cannot discharge that.** `CAP-2` stands unchanged — Codeforces still 403s automated fetching, so C4 ids remain unverified — and `F-C-1` verified only the CSES section counts. **Both mappers were right to withdraw**, and their convergence is real evidence: two sub-tasks independently reached the same withdrawal without coordinating, which localizes the cause to the schema template's own `"C1:1635"` illustration inviting a claim the evidence base cannot support. **This audit refuses to reintroduce from memory what they correctly retracted** — an invented citation is worse than a corpus-level ref precisely because it looks checkable. Verdict: **UU, not a gap** — corpus-level refs are the strongest claim the evidence supports, so the map is correct as it stands; what is unresolved is the *template's* invitation. | **`D-F2`/`D-S1`'s owners** for the template illustration (flagged for their attention per `EXC-1`/`E0`'s convergence note); a **later curriculum-production charter** for actual per-problem citation, which needs manual verification under `CAP-2`. | `CAP-2` is lifted (a verifiable Codeforces route exists) **or** a manual verification pass is commissioned. |
| **`CV-18`** | **The completeness of the exclusion registers is not asserted, and this audit cannot assert it either.** `RX-13` states the honest bottom line — *"an assertion that this file's exclusion list is COMPLETE would be unfalsifiable and false"* — grounded in `INC-D3` (the technique space does not exist as an enumerated object) and Convention U (techniques invented after the cutoff). **Verdict: UU, and `RX-13` is upheld as correct rather than treated as a defect.** This audit swept the class in `04_…` and found **seven instances beyond the three previously named**, which is direct evidence that `RX-13`'s refusal to claim completeness was warranted. **What this audit claims, precisely:** it surveyed the five mappers' 52 exclusions, the six taxonomies, and the six corpora at the 2026-07-16 cutoff, and adjudicated every disagreement it found. **Not claimed:** that no further technique exists in the seam. `RX-13`'s own trigger names this audit as the discharging party for what it *does* find — discharged in `04_…` — and Convention U1 guarantees any newly surfaced T1 technique is CL-4's without a partition change. | **SUB-11 (NEU-944)** for the residual at package assembly; **Convention U1** for anything surfacing later. | A material technique the cascade assigns to CL-4 is found that is neither mapped nor listed in `04_…`. |

## E. Routed elsewhere — recorded so they are not lost

Not coverage disagreements. Recorded because this audit found them and dropping them would be smoothing.

| Id | Finding | Routed to |
| --- | --- | --- |
| **`CV-19`** · **GAP** | **Intra-cluster edges from `cl-4.select-mainstream-optimization` into frontier.yaml's nodes are absent** (`RX-6`, mainstream). SUB-6 correctly omitted rather than guessed ids while SUB-13 wrote concurrently. **Both CL-4 files now exist**, so the blocker is gone. This is a genuine gap with an owner — an *edge* gap, so it is not this audit's to fill. | **SUB-9 (NEU-943)** dependency audit / **SUB-12 (NEU-939)**, as `RX-6` names. |
| **`CV-32`** | **`AR-1` id collision — two mappers minted the same request ids.** NEU-936 filed **`AR-1/a`** (Aho–Corasick) and **`AR-1/b`** (shortest-path relaxation); NEU-938 filed **`AR-1-a`** (Lagrangian duality) and **`AR-1-b`** ((min,+) convolution). **Four distinct requests under two colliding label pairs**, differing only by `/` vs `-`. Neither mapper erred — `AR-1` names no id-minting convention. Disambiguated in the ledger union by filer. | **`D-S3`'s owner (NEU-933)** to adjudicate the four requests; **SUB-11 (NEU-944)** to fix the id convention at reconciliation. |
| **`CV-33`** | **The AR-1 register was provably incomplete before this audit.** Seven AR-1/`D-S1a`-class claims exist across the map; **only two were in the ledger.** NEU-935's two anchor requests, NEU-938's two, and NEU-934's `D-S1a` were recorded **in-file only** — each because *the ledger was not that mapper's file to write*, which is sole-writer ownership working correctly and producing an incomplete register anyway. **Nodes reference these by id in `notes`, so dropping a row turns other nodes' notes into false claims.** Unioned into the ledger by this audit (which does own it). | Discharged here for the register; **`D-S3`'s owner** still adjudicates each request on its merits. |
| **`CV-34`** | **`D-S3`'s revision trigger fires harder than recorded.** The ledger states *"two now are"* filed. **Four are.** `D-S3` remains **settled** at `register_version 1.0.0` — a filed request is not an amendment and no mapper drew an unregistered anchor — but the count is corrected in the union. Adjudicating any of the four MINOR-bumps the register; none changes an existing anchor's scope, so no MAJOR bump is implied. NEU-938's `AR-1-b` explicitly warns that folding (min,+) convolution into `anchor.convex-hull-envelope-geometry` **would** be a scope change and therefore a MAJOR bump — a decision reserved to `D-S3`'s owner. | **`D-S3`'s owner (NEU-933)**. |
| **`CV-35`** | **NEU-934's `EXC-11` `D-S1a` entry was warranted but unfiled** — the S7/S5 skill-type boundary at `cl-1.derive-recurrence-routine`. `EXC-11` recorded the consequence precisely: *"if SUB-9 counts `D-S1a` entries against D-S1's '>10 triggers cascade revision' threshold by reading the ledger alone, this one will not be counted."* **This audit owns the ledger and discharges it**: the entry is unioned in with SUB-3's stated trigger verbatim. `D-S1a` count is now **1**, far below D-S1's `>10` cascade-revision threshold — so the threshold does **not** fire, and SUB-9 can now count from the ledger alone. `EXC-11` is **resolved**. | Discharged here. **SUB-9 (NEU-943)** consumes the corrected count. |

## F. What this adjudication asserts, and what it does not

**Asserts:** every coverage disagreement this audit found between the mapped graph and the six taxonomies / six corpora at the 2026-07-16 cutoff carries exactly one of the four verdicts; every intentional exclusion carries a documented rationale; every genuine gap carries a named owner; no difference was smoothed.

**Does not assert:** that the technique space is enumerated (`INC-D3`); that the exclusion registers are complete (`CV-18`, `RX-13`); that any C4 problem id is verified (`CAP-2`); that any node's prerequisite chain is sound (SUB-9's); that any corpus ordering is a learning claim (`X-D3`, carried undiminished).
