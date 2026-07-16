# 05 — Cold-Context Dry-Run Handoff

**Task:** NEU-944 (SUB-11) · **Package version:** `1.0.0` · **Run:** 2026-07-16

**This supersedes `INC-D1`.** NEU-932's representation dry-run was **a desk-check, not a real
cold-agent handoff — and said so.** `INC-D1` recorded that honestly and left the real handoff open.
**This is the real one.**

---

## 1. Protocol

**The simulated consumer:** a **cold-context downstream C005 curriculum-production agent** — the actor
named in NEU-944's spec. It has **no memory of this charter**, has read **none** of NEU-932…NEU-943,
and knows only that it must author a DP curriculum.

**The rule of the exercise — enforced, not assumed:**

> **The consumer may open `README.md`, and then exactly ONE file to answer a question. If a question
> requires a second lookup, it is a ONE-HOP FAILURE and is recorded as one.**

**Scenarios are the ones OUT-9's acceptance names**, plus the adversarial cases that would actually
bite a real consumer. **Failures are recorded, not retried into success.**

---

## 2. Scenario A — recover a technique's full picture in one hop

**Task:** *"I am going to author material for Knuth–Yao optimization. Tell me everything I need."*

**Hops taken: 1.** `README.md` → `01_cross-reference-view.md` → grep `cl-4.knuth-yao-optimization`.

**Recovered, from that single block — verbatim:**

| OUT-9 facet | Recovered? | Value |
| --- | --- | --- |
| **Node type** | ✅ | `skill` / `optimization` |
| **Prerequisites — intra-cluster** | ✅ | `cl-4.quadrangle-inequality`, `cl-4.opt-split-point-monotonicity` |
| **Prerequisites — root terminal** | ✅ | `cl-1.root.formulate-state-transition-base-case` *(floor terminal)* |
| **Prerequisites — cross-cluster** | ✅ | `cl-2.formulate-interval-dp` *(CL-4→CL-2, realized by NEU-939, edge id given)* |
| **Prerequisites — boundary anchor** | ✅ | none on this node (the field is present and empty — **absence is stated, not implied**) |
| **Progression stage** | ✅ | `PS-3` — **flagged not trustworthy** |
| **Difficulty** | ✅ | all 8 dimensions + `creator_review: "deferred-provisional"` |
| **JavaScript materiality** | ✅ | **MATERIAL** · `performance` · `JS-E5`, `JS-E6` + rationale |
| **Coverage verdict** | ✅ | `unaudited` + the explanation of what that means and why (`INC-C7`) |
| **Audit findings** | ✅ | `F-943-1` (HIGH, open) **and** `F-943-3` |
| **Binding vs open** | ✅ | `status: provisional` + what `provisional` obliges the consumer to do |

**✅ PASS — 11/11 facets, one hop, zero further reads.**

**The block did more than list values — it stopped a mistake.** A cold agent reading `PS-3` would
naturally schedule this before `PS-4` material. The block says, in situ:

> *"**Stage inverts across a cluster boundary.** This node is `PS-3` but requires
> `cl-2.formulate-interval-dp` at `PS-4` — **a dependency that would be taught AFTER its own
> prerequisite** if sequenced by stage. **Sequence from the graph, not the stage label.**"*

**This is the acceptance criterion working.** The consumer cannot naively mis-sequence this node
**without reading the warning that says not to**, because the warning is on the node, not in a
footnote in another package.

---

## 3. Scenario B — a progression decision deferred for creator unavailability

**Task:** *"Is `PS-3` binding? Can I calibrate against `transition_derivation_load: 4`?"*

**Hops: 1** (same block).

**Recovered:** `creator_review: "deferred-provisional"`, with the block stating inline that the
creator plausibility review **did not run** (Assumption #11), that the values ship **PROVISIONAL with
a named revision trigger**, and pointing to `03_…` → deferred creator review.

**✅ PASS — the OUT-9 acceptance scenario is satisfied.** The decision is **marked provisional**, its
**revision trigger is named** (*the creator reviews the progression assignment for plausibility*), and
it is **listed among the decisions that ship provisional** (`03_…` §9, and ledger `D-P3`).

**The consumer's correct conclusion:** *usable for calibration, not binding, and my reliance must be
surfaced.* **Two independent reasons not to trust `PS-3`** — unreviewed (`D-P3`) **and** defective
(`D-P2`) — and the block gives both.

---

## 4. Scenario C — the adversarial one: author a technique that does not exist

**Task:** *"Author material for SOS DP."*

**Hops: 1.** Grep `01_cross-reference-view.md` for `sos` → **no block. No node. Nothing.**

**A naive consumer's next move is the dangerous one: invent it.** The map has a bitmask cluster and an
optimization cluster; SOS DP plausibly belongs to either, and a cold agent could confabulate a node,
a stage, and a prerequisite set that all look reasonable.

**What actually happens:** grepping `sos` in the package hits `03_open-items-and-provisional-register.md`
§3 — **`INC-C1`, the 10-instance gap class** — which states: **do not author it, do not mint the node,
the owner is the creator via a CL-4 completion task, and `INC-C2` (`D-F4a`) has not decided which
cluster it belongs to.**

**And the map itself refuses to hide it.** `cl-3.bitmask-state-encoding`'s block carries:

> *"**⚠ Declared but UNRESOLVABLE** — the declared target does not exist. This is the visible face of a
> known, owned coverage gap (`INC-C1`), **not** a defect in this node. Do not close it by deleting the
> declaration."*

**✅ PASS.** The consumer reaches **"this is a known, owned hole — stop"** rather than **"this is
missing — I'll fill it."** **The dangling edge is load-bearing:** it is the map pointing at its own
gap. A tidier map that deleted it would have led the consumer straight into invention.

---

## 5. Scenario D — a chain that bottoms out on something that is not a DP root

**Task:** *"`cl-3.implement-steiner-tree-dp` needs shortest-path relaxation. That's not a DP root. Is
the map broken? Should I decompose it?"*

**Hops: 1.** The block shows an `anchor` line labelled ***SANCTIONED TERMINAL**, register `1.0.0` — not
a gap, not decomposed*, plus its `AR-1-b/936` request in the anchors section.

**✅ PASS.** The consumer distinguishes **a legitimate terminal** from **an unexplained jump** without
opening the schema package. It also learns the node is `provisional` **because** the anchor request is
open — the causal link is stated, not left to be inferred.

**This is the check that matters most for map integrity:** a consumer who mistook an anchor for a gap
would "fix" it by decomposing assumed knowledge into invented DP nodes. **179/179 chains terminate
legitimately, 0 unexplained jumps** — and the view says which terminal each one used.

---

## 6. Scenario E — "just give me the teaching order"

**Task:** *"Sort the 179 nodes into a teaching sequence."*

**Hops: 1** → `02_authoring-requirements.md` §1 and §3.

**Recovered:** the prime directive — **author against the graph, not the stage labels** — with the
reason (`F-943-1`), the mechanism (the graph is **acyclic**, so a topological order **exists and is
computable**), the tool (NEU-943's validator computes `prerequisite_depth` correctly from source), and
**the 6 known-bad orderings named explicitly** (§3.2).

**✅ PASS.** **This is the single highest-value recovery in the package**, and the one a cold agent is
most likely to get wrong: `progression_stage` *looks* exactly like a teaching order. It is the field
whose name most invites the mistake, and it is wrong on 6 orderings.

---

## 7. Scenario F — "did anyone already build the lessons?"

**Task:** *"Is there course content here I should extend?"*

**Hops: 1** → `README.md` / `02_…` §0.

**Recovered:** **no lessons, no problems, no graph editor, no exercise runner** — stated as an explicit
scope table with each item routed to later curriculum-production charters. Gate `PG-12` re-checks this
mechanically: **the only executables in the package are the view generator and the gate, both
projections; the package contains no YAML at all.**

**✅ PASS.** The consumer does not go looking for content that does not exist, and does not mistake
the map for a course.

---

## 8. Results

| # | Scenario | Hops | Result |
| --- | --- | ---: | --- |
| **A** | Recover a technique's full picture | **1** | ✅ **PASS** — 11/11 facets |
| **B** | Deferred creator progression decision | **1** | ✅ **PASS** — provisional + trigger + listed |
| **C** | Author a technique that does not exist | **1** | ✅ **PASS** — routed to `INC-C1`, invention prevented |
| **D** | Non-root chain terminal | **1** | ✅ **PASS** — sanctioned terminal, not a gap |
| **E** | Teaching order | **1** | ✅ **PASS** — graph, not stages; 6 bad orderings named |
| **F** | Is there course content? | **1** | ✅ **PASS** — nothing forbidden was built |

**6/6 scenarios recovered in ONE hop. Zero one-hop failures. No undocumented context was required.**

**Mechanically re-checked** by `generator/package-completeness-gate.mjs`: `PG-6c` verifies
**179 blocks × 7 facets = 1253 facet checks, 0 gaps**, so Scenario A's result is not a sample — **it
holds for every technique in the map.** `PG-6d`/`PG-6e` verify the same for every realized
cross-cluster prerequisite and every anchor terminal.

---

## 9. What the dry-run found that is NOT a pass — recorded, not smoothed

**A dry-run that only passes is a dry-run that was not really run.** Three honest findings:

### 9.1 The consumer's most useful field is the one it must not trust

`progression_stage` is the field a curriculum agent reaches for **first** and the field that is
**wrong**. The package's mitigation is heavy — a per-node marker on all 26, the prime directive in
`02_…` §1, the headline in the README, first position in `03_…`, `D-P2` in the ledger — **but
mitigation is not repair.** **`F-943-1` remains an open defect in the shipped map and the package says
so in five places rather than pretending otherwise.** A consumer that ignores all five will
mis-sequence 6 dependencies. **Owner: NEU-940. Trigger: the re-run over the edge-complete graph.**

### 9.2 One-hop recovery of the *coverage verdict* is thinner than the other six facets

Every node's `coverage.status` is `"unaudited"` (`INC-C7`). The block explains **what that means and
why** — but the consumer recovers **an explanation, not a per-node verdict**, because **no per-node
verdict was ever written** (NEU-942 correctly wrote no node file). **This is a real asymmetry with the
other six facets and is recorded as `INC-C7` rather than papered over.** **NEU-944 did not mint 179
coverage verdicts to make this row look better** — that would be exactly the fabrication the status
discipline forbids.

### 9.3 Scenario C only passes because an *earlier* task refused to tidy up

The dangling `cl-4.sos-dp` declaration is what makes the SOS-DP gap **visible at the point of use**.
Had NEU-939 deleted the unresolvable declaration — the tidier-looking choice — Scenario C would have
**failed silently**, and a cold agent would have invented a node. **The gap is discoverable because
somebody wrote down an inconvenient fact instead of cleaning it away.** That is the charter's
conflict-preservation discipline paying off in a measurable way, and it is why `02_…` §7 `A4` makes it
binding on consumers too.

---

## 10. Verdict

**✅ PASS — the cold-context dry-run handoff succeeds.**

- **One-hop recovery per technique: confirmed** — 6/6 scenarios, and mechanically over all 179.
- **Binding vs open: distinguishable** — every block states its status and what that status obliges.
- **No course content, graph editor, or exercise runner was built: confirmed** (`PG-12`).
- **No undocumented context required** — the consumer never needed a fact that was not in the package.

**`INC-D1` is discharged.**

**The package's honest limit, stated plainly:** this dry-run proves a cold agent can **recover** the
map and **tell what is binding from what is open**. **It does not prove the map teaches DP well.**
Nothing in C005 measures DP learning (`R1`, non-downgradable High, carried undiminished). **A
successful handoff is not evidence of pedagogical effectiveness, and this package does not claim it
is.**
