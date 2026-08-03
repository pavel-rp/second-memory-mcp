# 04 — Package-Completeness Gate

**Task:** NEU-944 (SUB-11) · **Package version:** `1.0.0` · **Run:** 2026-07-16

**The gate is a script, not this prose.** `generator/package-completeness-gate.mjs` produces every
number below. **Prose that disagrees with the script is wrong; the script is the artifact.**

```
node docs/research/C005-dp-map-package/generator/package-completeness-gate.mjs
```

**Result: `38/38 PASS`** · exit 0.

---

## 1. The gate CONFIRMS NEU-943 — it does not re-derive it

**This is the design decision that matters most in this file, so it is stated first.**

NEU-944's spec says the gate **confirms — does NOT re-derive —** NEU-943's eight-type union result and
the floor-termination result, and says to **reuse its validator**. So the gate does exactly that: it
**spawns `../C005-dp-map-integrity/validator/audit-graph-integrity.mjs` as a child process** and
asserts on **its** exit code and **its own printed verdicts**.

**Why not write an independent check?** Because **a second implementation proves only that two scripts
agree.** It would not confirm NEU-943's result — it would *replace* it with NEU-944's, quietly making
an assembly task the author of an integrity claim it does not own. **NEU-943 remains the author of
every structural claim below. This gate is a consumer of them.**

| Check | Confirms | Result |
| --- | --- | --- |
| **`PG-0`** | NEU-943's validator is present and reusable | ✅ |
| **`PG-1`** | The validator **exits 0** — structural invariants hold | ✅ exit 0 |
| **`PG-2`** | **Eight-skill-type UNION-COMPLETENESS holds** — all 8 instantiated | ✅ |
| **`PG-3`** | **Every prerequisite chain terminates on a DP root or a REGISTERED ANCHOR** | ✅ |
| **`PG-4`** | Graph **ACYCLIC** and **`len(clusters)` = 4** | ✅ |
| **`PG-4b`** | **Every one of NEU-943's structural checks still passes against the final tree** | ✅ **28/28** |

**`PG-4b` is the regression guard.** It re-runs NEU-943's full audit against the tree **as shipped**,
so if this package had disturbed the map in any way, the gate fails. **28/28 — nothing was disturbed.**

**The inherited facts, re-confirmed as shipped:** 187 nodes · 572 edges · **0 cycles** · **179/179**
chains reach the floor, **0 unexplained jumps** · **0 of 223** faked root edges · **0 of 31** invented
anchors · **8/8** skill types (112 skill nodes) · **OUT-6 5/5** against `len(clusters)` = **4**.

---

## 2. Package assembly

| Check | Passing condition | Result |
| --- | --- | --- |
| **`PG-5a`** | The cross-reference view exists | ✅ |
| **`PG-5`** | **The checked-in view is REGENERATION-FRESH** — regeneration is a fixed point (no index drift) | ✅ |
| **`PG-6a`** | **Every node in the map has a block in the view** | ✅ **187/187** |
| **`PG-6b`** | Every node is reachable from the alphabetical lookup table | ✅ **187/187** |
| **`PG-6c`** | **Every mapped technique recovers ALL SEVEN OUT-9 facets in ONE hop** | ✅ **179 × 7 = 1253 facet checks, 0 gaps** |
| **`PG-6d`** | Every **realized cross-cluster prerequisite** appears on its dependent's block | ✅ **25/25** |
| **`PG-6e`** | Every **registered boundary-anchor terminal** appears on its dependent's block | ✅ **31/31** |

**`PG-5` is why the one-hop claim is worth making.** `D-F3` §3 records index-drift as an open cost, and
the map's own `index/00_technique-index.md` is **stale evidence that the cost is real** — it still
reads *"scaffold — no DP family node exists yet"* over a map with 187 nodes. **A hand-maintained
187-node view would be drift on day one.** The view is generated, and the gate fails if the checked-in
copy and a fresh generation diverge.

**`PG-6c` is the acceptance criterion, mechanised.** The dry-run (`05`) exercises one-hop recovery on
6 scenarios; `PG-6c` proves it **for every technique in the map**, so the dry-run is a demonstration,
**not a sample**.

---

## 3. The defect was surfaced, not buried — and its closure is EVIDENCED, not announced

**`F-943-1` is closed** (ledger `D-R4`), so `PG-7` is reworked to its post-closure purpose. **The
block is not deleted and no assertion is left that cannot fail**: each check below still fails on a
register that merely *claims* the closure without evidencing it, or on a map that quietly regains the
defect.

| Check | Passing condition | Result |
| --- | --- | --- |
| **`PG-7a`** | **No node carries the per-node `F-943-1` warning marker** — `PG-7a`'s inverse, holding because nothing computes it | ✅ **0** |
| **`PG-7a2`** | **No block names a stage inversion** — `PG-7a2`'s inverse | ✅ **0** |
| **`PG-7b0`** | The register has a **dedicated `F-943-1` section, stated FIRST** — retained after closing, so the closure can be read against the record it closed | ✅ |
| **`PG-7b`** | `F-943-1` is recorded as **closed** — asserted **inside that section** | ✅ |
| **`PG-7c`** | The closure **names its discharging ledger entry** — inside that section | ✅ `D-R4` |
| **`PG-7d`** | The section records **what discharged it** — the re-run over the edge-complete graph, and its counts | ✅ NEU-954: 26 depth corrections, 16 stage changes, 1 `entry_gate` change |
| **`PG-7f`** | **NEW.** The discharging ledger entry the register names **actually RESOLVES as a ledger row** — the strongest anti-false-pass check in the block, because a register can *name* any id it likes. Keyed on the row shape `\| **\`D-R#\`** \|`, so the ledger's *reservation prose* cannot satisfy it — only a landed entry can | ✅ `D-R4` |
| **`PG-7e`** | **RETIRED — no closed-state analogue.** It asserted the *repair* was out of SUB-11's scope, which was a fact about the package's shipping state and cannot be restated about a closed finding. Its retirement is recorded in the gate's own comment rather than silently dropped | — |

**`PG-7` caught the same class of defect in this gate TWICE. Both are recorded rather than quietly
fixed, because the pattern is the point.**

**First (`PG-7a`, caught in authoring).** Its first version matched a bare `F-943-1` substring and
reported **179 flagged** — because most blocks mention the finding in passing (`F-943-3` inherits it;
the stage caveats cite it). **A check that matches everything proves nothing**, and it would have
"passed" a package where the marker was on **zero** nodes. It now keys on the **per-node warning
marker**, emitted only where the finding lands, and reports **26**.

**Second (`PG-7b`/`c`/`d`, caught in review — Copilot, PR #634).** These searched **the whole
open-items register** for `unresolved`, `NEU-940` and `revision trigger`. **All three strings appear in
many other rows**, so **the F-943-1 section could have been deleted outright and the gate would still
have gone green** — the check guarding *"the defect is not buried"* would have passed **with the defect
buried**. They now **slice `## 1. F-943-1` and assert inside that section only**, plus `PG-7b0`
(the section exists and is first) and `PG-7e` (the repair is recorded out-of-scope). **The finding was
valid and is not waived.**

**This is the same failure mode NEU-943 guarded against with its `isFinite` stage check** — and worth
stating as a rule: **a check whose passing condition is satisfied by unrelated text is not a check.**
**Scope every assertion to the thing it claims to be asserting.**

---

## 4. Open items are owned

| Check | Passing condition | Result |
| --- | --- | --- |
| **`PG-8a`** | **Every inherited open item is BOUND in the register** | ✅ **27/27** |
| **`PG-8b`** | The **deferred creator review** is listed among the decisions that ship provisional | ✅ |

**Bound and asserted by the gate:** `F-943-1`, `F-943-2`, `F-943-3`, `F-939-1`, `F-939-A`, `F-939-B`,
`INC-C1`, `INC-C2`, `INC-S1`, `CAP-2`, `JS-U1`, `JS-U2`, `JS-U3`, `JS-U5`, `AR-1-a/936`, `AR-1-b/936`,
`AR-1-a/938`, `AR-1-b/938`, `AR-1-c/935`, `AR-1-d/935`, `D-S1a-1`, `X-S1`, `X-D1`, `X-D2`, `R1`,
`PS-2/3/4`, `creator_review`.

**`PG-8a` is a list the gate enforces, not a list this file asserts.** Drop one and the gate fails.

---

## 5. Ledger discipline

| Check | Passing condition | Result |
| --- | --- | --- |
| **`PG-9`** | **`D-S1a` count = 1** ⇒ `D-S1`'s `>10` cascade-revision threshold does **NOT** fire; **`EXC-11` stays RESOLVED** | ✅ **1 row** |
| **`PG-10`** | **Ledger UNIONED, never replaced** — every pre-existing id survives | ✅ **29/29** |
| **`PG-10b`** | **Every ledger id CITED BY A NODE's `notes` still resolves** | ✅ **zero false claims** |
| **`PG-11a`** | **Every node carries a legal adjudicated status — no element unlabelled** | ✅ **187/187** (8 `settled`, 179 `provisional`) |
| **`PG-11b`** | Every node records `adjudicated_at_map_version` | ✅ **187/187** |
| **`PG-11c`** | NEU-944 bound the package through the **ONE** adjudication ledger | ✅ `D-P1`…`D-P4` |
| **`PG-11d`** | Node-level coverage is `unaudited` map-wide and **RECORDED as `INC-C7`**, not invented | ✅ **179/179** |

**`PG-10b` is the check that makes "union, never replace" enforceable rather than aspirational.** Map
nodes cite ledger ids **verbatim in their `notes`** — `AR-1/a`, `AR-1/b`, `AR-1-a`, `AR-1-b`,
`INC-S1`, `D-S1a`. **A ledger that dropped or renamed a row would turn those notes into false claims.**
The gate resolves every node-cited id against the ledger. **All resolve.**

**`PG-9` verifies `EXC-11` was not re-broken.** It counts `D-S1a` rows **in the ledger alone** — which
is precisely the capability NEU-942's discharge restored. **Count = 1, threshold is `>10`, so `D-S1`'s
cascade revision does not fire.**

---

## 6. Scope — nothing forbidden was built

| Check | Passing condition | Result |
| --- | --- | --- |
| **`PG-12a`** | **No lesson/problem/editor/runner directory** exists in the package | ✅ |
| **`PG-12b`** | The **only executables** are the view generator and this gate — **both projections** | ✅ |
| **`PG-12c`** | **The package contains NO YAML** — it mints no node, edge, or register entry | ✅ |

**`PG-12c` is the strongest available mechanical proof of the out-of-scope constraint.** Every node,
edge, boundary anchor and register entry in this charter is YAML. **The package contains none.** It
therefore **cannot** have produced a new node, edge, progression stage, difficulty value,
JS-materiality finding, integrity finding, or coverage verdict — there is nowhere for one to live.

---

## 7. OUT-8 — the authoring-requirements spec is complete

| Check | Passing condition | Result |
| --- | --- | --- |
| **`PG-13a`** | The spec exists | ✅ |
| **`PG-13b`** | States **required coverage** | ✅ |
| **`PG-13c`** | States **sequencing / prerequisite constraints** | ✅ |
| **`PG-13d`** | States **difficulty-calibration inputs** | ✅ |
| **`PG-13e`** | Routes `INC-C1`'s root cause into a binding rule — ***one half must be the residual owner*** | ✅ |
| **`PG-13f`** | Routes `F-943-1`'s root cause into a binding rule — ***file-disjointness is not data-disjointness*** | ✅ |

---

## 8. Verdict

**✅ `38/38 PASS`**

> **GATE VERDICT: PASS — package complete, one-hop recovery mechanical, every element labelled by the
> ledger, NEU-943 confirmed by reuse, nothing forbidden built.**

**What this gate does NOT certify — stated so the PASS is not over-read:**

- **It does not certify the map is free of defects.** It certified the **known** defect (`F-943-1`) as
  **bound, owned, and surfaced on all 26 affected nodes**, and now certifies that **the closure is
  evidenced** — the marker is gone from every node and the register names the discharging ledger entry
  (`D-R4`). **The map shipped with an open HIGH finding and the gate passed anyway** — because binding
  a defect you do not own **is** the correct ship. Other findings remain open, `F-943-3` among them,
  and the gate binds rather than closes them.
- **It does not certify the map teaches DP well.** Nothing in C005 measures DP learning (`R1`).
- **It does not certify coverage completeness.** **10 techniques are missing** (`INC-C1`), known and
  owned. `INC-S1` means the boundary register is **not asserted complete**.
- **It does not re-derive NEU-943's structural claims.** It **confirms** them by reuse. If NEU-943 is
  wrong, this gate is wrong with it — **and that is the correct coupling** for a task whose spec says
  confirm, not re-derive.
