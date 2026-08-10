# Standards Evidence and Scope Audit (SUB-4)

**Task:** NEU-960 (SUB-4) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Subject:** `../04_correctness-standards-and-authoring-languages.md` and `../decision-records/DR-C09-04_authoring-languages.md` · **Status:** **deferred — this register SETS no status.** Status lives in a ledger; a producing task may not promote its own artifact (`A1`–`A5`)
**Model:** claude-opus-5[1m]

The auditable half of SUB-4's two documents: the row-by-row scope audit of the escape hatch, the `JS-U2` directional-statement audit across all three of this sub-task's new files, the register half of the three-artifact violation-detection walkthrough, and the recorded — not corrected — upstream subtotal discrepancy. Each sub-task writes the register rows for its own claims; these are SUB-4's, and **no row here edits, reclassifies or removes another sub-task's**.

**No class-7 `[future-real-user]` claim appears in this register**, and none could: no artifact has been authored in either language and no learner has met one. Every row below is checkable against a file that exists at this cutoff.

**Two words are load-bearing and are disambiguated once, here.**

- **`blocking`** in §1 is **NEU-941's severity literal** on a `javascript_materiality` verdict — *the direct C++ translation is silently wrong or crashes*. It is **not** a gate behaviour. **This register assigns no blocking behaviour and no gate placement to anything; SUB-9 (NEU-965) owns both axes** and nothing below may be read as pre-empting either.
- **`directional`** in §2 is **`JS-U2`'s** term: a statement that says **that** an effect exists and **which direction** it runs, and never **how much**.

---

## 1. The scope audit — the escape hatch reaches exactly 19 node ids and no others

**Claim under audit.** `../decision-records/DR-C09-04_authoring-languages.md` §Decision.3 states the selection rule as an identity: *a technique is authored in the escape-hatch language **iff** its node id is one of NEU-941's 19 blocking node ids at `rule_version: 1.0.0`.* This section is the row-by-row proof that the set the two SUB-4 documents actually carry **is** that set — no id added, no id dropped, no id re-derived.

**Evidence for `RG-S4-01` … `RG-S4-19`:** class 2 `[code-evidence]` — exact-string match of each id against a `**blocking**`-severity row of the §2 per-node table of `../../C005-dp-js-materiality/02_audit-register.md`, in this branch · **evidence type:** mechanical lexical match, recorded by the task that ran it (`CK-S4-1` … `CK-S4-7`, §5) · **cutoff:** 2026-08-10 · **provenance:** NEU-941 (SUB-8), `rule_version: 1.0.0`, map version `0.1.0`, compiled 2026-07-16 · **structural limitation:** **consumed, never re-derived** — this register verifies that the ids match the source register by string, and verifies nothing about whether any verdict is correct.

| Row | Node id | Cluster | Type | Effects recorded by NEU-941 | Source line |
| --- | --- | --- | --- | --- | ---: |
| `RG-S4-01` | `cl-1.formulate-1d-sequence-dp` | CL-1 | strategic | `JS-E1` | 62 |
| `RG-S4-02` | `cl-1.counting-dp-over-linear-domain` | CL-1 | knowledge | `JS-E2`, `JS-E3` | 66 |
| `RG-S4-03` | `cl-2.implement-counting-dp-under-a-modulus` | CL-2 | implementation | `JS-E2`, `JS-E3` | 70 |
| `RG-S4-04` | `cl-2.root-an-unrooted-tree` | CL-2 | procedural | `JS-E1` | 73 |
| `RG-S4-05` | `cl-2.implement-tree-dp-post-order-dfs` | CL-2 | implementation | `JS-E1` | 74 |
| `RG-S4-06` | `cl-2.debug-tree-dp-recursion-depth` | CL-2 | debugging | `JS-E1` | 75 |
| `RG-S4-07` | `cl-2.implement-rerooting-two-pass-dfs` | CL-2 | implementation | `JS-E1` | 76 |
| `RG-S4-08` | `cl-2.impose-topological-evaluation-order` | CL-2 | procedural | `JS-E1` | 77 |
| `RG-S4-09` | `cl-2.condense-sccs-to-recover-a-dag` | CL-2 | strategic | `JS-E1` | 78 |
| `RG-S4-10` | `cl-3.implement-digit-dp` | CL-3 | implementation | `JS-E2`, `JS-E3` | 84 |
| `RG-S4-11` | `cl-3.resolve-expectation-dp-self-loops` | CL-3 | implementation | `JS-E2`, `JS-E3`, `JS-E9` | 85 |
| `RG-S4-12` | `cl-3.plug-dp-connectivity-encoding` | CL-3 | knowledge | `JS-E4`, `JS-E3` | 87 |
| `RG-S4-13` | `cl-3.implement-plug-dp` | CL-3 | implementation | `JS-E4`, `JS-E7`, `JS-E3` | 88 |
| `RG-S4-14` | `cl-4.convex-hull-trick-monotonic` | CL-4 m | optimization | `JS-E2` | 91 |
| `RG-S4-15` | `cl-4.li-chao-tree-dp-application` | CL-4 m | optimization | `JS-E2` | 92 |
| `RG-S4-16` | `cl-4.implement-cht-deque-and-li-chao` | CL-4 m | implementation | `JS-E2`, `JS-E8`, `JS-E5` | 93 |
| `RG-S4-17` | `cl-4.matrix-exponentiation-dp` | CL-4 m | optimization | `JS-E2`, `JS-E3` | 97 |
| `RG-S4-18` | `cl-4.implement-modular-matrix-power` | CL-4 m | procedural | `JS-E2`, `JS-E3`, `JS-E5` | 98 |
| `RG-S4-19` | `cl-4.kinetic-segment-tree-implementation` | CL-4 f | implementation | `JS-E2`, `JS-E5` | 104 |

### 1.1 The count identity

**19 = 19.**

| Side of the identity | Count | How it was established |
| --- | ---: | --- |
| `**blocking**`-severity rows in `../../C005-dp-js-materiality/02_audit-register.md` §2 | **19** | `CK-S4-1` |
| Data rows in the table above | **19** | `RG-S4-01` … `RG-S4-19`, contiguous, no gap, no repeat |
| Rows in `DR-C09-04` §Decision.3's reproduction of the set | **19** | numbered 1–19 in that record, same order, same ids |
| NEU-941's own headline severity tally for `blocking` | **19** | `../../C005-dp-js-materiality/02_audit-register.md` §1 |

**Zero ids outside the set are admitted to the escape hatch.** The identity is stated in both directions and both directions were checked:

- **No id in the hatch is outside the 19.** Every id appearing in `DR-C09-04` §Decision.3 and in `../04_correctness-standards-and-authoring-languages.md` §4.2–§4.3 appears in the table above, and every id in the table above matches a `**blocking**` row of the source register by exact string.
- **No id in the 19 is missing from the hatch.** All 19 source rows are present as `RG-S4-01` … `RG-S4-19`.
- **The 28 other material nodes are not admitted.** The source register records **47** material nodes; **28** of them carry `idiom-shift`, `performance` or `correctness-risk` and **none** of those is in the hatch. Neither is any of the **132** explicitly JavaScript-neutral nodes, nor any of the **8** frozen roots (out of scope, `JS-U1`).
- **An effect-based argument admits nothing.** `JS-E2` is recorded on **15** nodes in the map and on **10** of the 19 rows above; the difference is exactly the set of nodes that carry the effect **without** the severity, and they stay in TypeScript. `DR-C09-04` §Decision.3 states this as a rule; §1 of this register is the arithmetic behind it.

**Two recorded riders ride on rows of this table and are consumed as recorded, not resolved here.**

| Rider | Rides on | What it says | Disposition |
| --- | --- | --- | --- |
| `JS-U1` | `RG-S4-01` `cl-1.formulate-1d-sequence-dp` | The recursion verdict sits on the nearest unfrozen node because the node that owns the realization choice is one of the 8 frozen roots. | Consumed as recorded. **Not re-placed here.** |
| `JS-U4` | `RG-S4-09` `cl-2.condense-sccs-to-recover-a-dag` | The verdict sits on the DP-side act; the anchor-side question stays open under `DR-S03`. | Consumed as recorded. **Not resolved here.** |

**Structural limitation of the whole of §1, stated plainly.** This audit proves **membership and string identity**. It does **not** prove that NEU-941's severity assignment is right for any node, that the 19 is the correct boundary of "blocked in JavaScript", or that no twentieth technique belongs in the set. Those are NEU-941's questions at its own `rule_version`, and **SUB-4 consumes the 19 as binding and re-derives nothing.** Pressure to widen is filed as `OI-S4-6` in `../90_open-items-and-provisional-register.md` and is never absorbed locally.

---

## 2. The directional-performance audit (`JS-U2`)

**What this section is.** `JS-U2` records that implementing or benchmarking actual JavaScript solutions, and selecting a runtime or execution sandbox, were **out of scope** of NEU-941's spec — so every performance verdict in the audit says **that** an effect exists and **which direction** it runs, and **none says how much**. SUB-4 inherits that cap. This section enumerates **every** statement in this sub-task's three new files that touches the speed, cost, constant-factor behaviour, or feasibility-under-a-constant of JavaScript, TypeScript or C++17, and attaches the label to each one individually rather than relying on a single blanket sentence.

**Inclusion rule, stated so the boundary is auditable.** A statement earns a row if it compares — or declines to compare — the **speed, cost, constant factor, or feasibility under a fixed constant** of JavaScript, TypeScript or C++17. Statements about **semantics**, **precision**, **availability of a language feature**, **counts in the upstream audit**, or the **learner-facing cost of a rejected third language** do not earn a row; the near-misses are enumerated in §2.4 rather than left as a silent judgment call.

**Evidence for `RG-S4-20` … `RG-S4-36`:** class 2 `[code-evidence]` — full read-through of the three new files in this branch, plus the lexical checks `CK-S4-8` and `CK-S4-9` · **evidence type:** manual enumeration by the task that authored the files, mechanically bounded by the greps in §5 · **cutoff:** 2026-08-10 · **structural limitation:** the enumeration is **judgment applied to a read-through**. The greps in §5 can prove the absence of a measurement *lexeme*; **no grep can prove that a sentence somewhere is not a quantitative claim in disguise** (inherited from `CAP-S1-5` / `CAP-S2-6`). §2.4 exists so a reviewer can see the boundary was drawn deliberately rather than skipped.

### 2.1 `../04_correctness-standards-and-authoring-languages.md`

| Row | Location | Statement, in brief | Form | Label |
| --- | --- | --- | --- | --- |
| `RG-S4-20` | §4.3, closing paragraph ("One directional note, labelled as such") | Any statement in this package about the relative speed, cost or constant-factor behaviour of JavaScript, TypeScript or C++17 is directional only. | blanket self-label; asserts no comparison of its own | **directional** · `JS-U2` |
| `RG-S4-21` | §5, "Evidence inherited, not re-derived" table, `JS-U2` row | Nothing implemented, nothing quantified; the reason every performance verdict here is directional; never converted into a quantity. | consumed by id from NEU-941 | **directional** · `JS-U2` |
| `RG-S4-22` | §4.2, the JavaScript-failure-note requirement ("which enumerated effect made the standard realization wrong or unreachable here?") | That the standard-language realization is wrong or unreachable for a hatch node — a feasibility statement, carried by citing the forcing `JS-E*` id. | consumed by id from NEU-941's severity; no quantity | **directional** · `JS-U2` |

**No other statement in this file compares the speed, cost or constant-factor behaviour of any language.** §§1, 2, 3, 6, 7, 8 and 9 contain none: the four standards, the mechanism pre-classification, the server-side surface description, the three-artifact walkthrough and the scope disclaimers are all language-neutral.

### 2.2 `../decision-records/DR-C09-04_authoring-languages.md`

| Row | Location | Statement, in brief | Form | Label |
| --- | --- | --- | --- | --- |
| `RG-S4-23` | Rationale, `JS-E2`/`JS-E3` bullet | `long long` is exact where `Number` stops at 2^53; `__int128` extends it; the modular multiplication is a one-liner with no ceremony, and a count needing `BigInt` needs nothing at all. | exactness contrast + authoring-cost contrast | **directional** · `JS-U2` |
| `RG-S4-24` | Rationale, `JS-E4` bullet | 64 bits of mask against JavaScript's 31, so a multi-bit-per-position encoding fits in the operators instead of moving to a bignum, a digit array or a string key. | feasibility-under-a-constant | **directional** · `JS-U2` |
| `RG-S4-25` | Rationale, `JS-E1` bullet | Recursion runs on a raisable process stack, against a hard frame cap a submitted program cannot lift. | feasibility-under-a-constant | **directional** · `JS-U2` |
| `RG-S4-26` | Rationale, `JS-E5` bullet | `std::vector` **is** the contiguous unboxed buffer, so a container decision does not arise. | constant-factor-adjacent | **directional** · `JS-U2` |
| `RG-S4-27` | Rationale, `JS-E7` bullet | A value-keyed composite state has a **cheap** standard form. | cost word | **directional** · `JS-U2` |
| `RG-S4-28` | Rationale, `JS-E8` bullet | The four containers are stdlib, so a technique defined in terms of one can be written in terms of it. | feasibility / idiom | **directional** · `JS-U2` |
| `RG-S4-29` | Rationale, "C++ is the reference frame the audit itself judges blocking against" | For each of the 19, C++17 is the language the blocked technique is already known to be expressible in. | consumed by id from NEU-941's frame | **directional** · `JS-U2` |
| `RG-S4-30` | Rejected alternatives, **Python 3** row | Python's own default recursion limit sits **below** JavaScript's practical ceiling, so `JS-E1` is not merely unfixed but arguably worse. | feasibility-under-a-constant, about JavaScript | **directional** · `JS-U2` |
| `RG-S4-31` | Rejected alternatives, **no hatch at all** row | *"Any claim that this alternative is slower is directional only under `JS-U2` and is not asserted as fact here… the rejection stands entirely on pedagogical accuracy, and needs no performance claim at all."* | **declined claim** — the comparison is explicitly refused, not made | **directional** · `JS-U2` |
| `RG-S4-32` | Evidence table, "four feasibility-changing findings" row | `JS-E2`, `JS-E1`, `JS-E4`, `JS-E8` are the reason the hatch exists at all. | consumed by id from NEU-941 | **directional** · `JS-U2` |
| `RG-S4-33` | Evidence table, `JS-U2` row | NEU-941 implemented nothing, timed nothing, selected no runtime or sandbox; every performance verdict is directional, never quantified. | consumed by id; the cap itself | **directional** · `JS-U2` |
| `RG-S4-34` | Evidence, closing paragraph | No statement in the record is a measurement; it does not claim the no-hatch rewrite is too slow, that C++17 is fast enough, or that any technique clears any threshold in any runtime. | **declined claim**, stated in both directions and for both languages | **directional** · `JS-U2` |
| `RG-S4-35` | Consequences, second-toolchain bullet | *"it selects no runtime, no compiler, no sandbox and no execution environment."* | **declined selection** | **directional** · `JS-U2` |

### 2.3 This file (`04_standards-evidence-and-scope-audit.md`)

| Row | Location | Statement, in brief | Form | Label |
| --- | --- | --- | --- | --- |
| `RG-S4-36` | §2.1–§2.2, the "Statement, in brief" cells | This register **restates** the statements above in brief, by reference, in order to locate them. | **no independent claim** — every brief is a pointer to a row already labelled in this same table, and inherits that row's label and citation | **directional** · `JS-U2` |

**Outside §2 this file makes no performance, speed, cost or feasibility-by-constant statement at all.** §1 reproduces node ids, clusters, types and effect ids and no quantity; §3 names standards, fields, payload slots and mechanism values; §4 records counts of table rows in an upstream document; §5 records grep commands and their outcomes.

### 2.4 Near-misses deliberately excluded, with the reason

Recorded so the inclusion rule is auditable rather than convenient.

| Statement | File / location | Why it earns no row |
| --- | --- | --- |
| "TypeScript retains every JavaScript semantic the audit describes… because it compiles to it" | `DR-C09-04`, Rejected alternatives, JavaScript row | A **semantics** statement about applicability of the audit. No speed, cost or constant is asserted in any direction. |
| "`long double` exists and is defined" (`JS-E9a`) | `DR-C09-04`, Rationale | A **precision and availability** statement about a language feature. |
| Rust's ownership/borrow burden; Java's verbosity; Python's readability | `DR-C09-04`, Rejected alternatives | Judgments about the **artifact a learner reads** in a third language. Not about JavaScript, TypeScript or C++17, and not about runtime cost. |
| "A second toolchain is now implied for authoring" | `DR-C09-04`, Consequences | An **authoring-process** consequence. The same bullet's non-selection sentence **does** earn a row (`RG-S4-35`). |
| "Failing at slot presence is the correct and cheapest outcome" | `../04_…`, §7.1 | "Cheapest" is about **check ordering**, not about a language. |
| "179 assessed", "47 material", "`JS-E2` on 15 nodes" | both files, throughout | **Counts in the upstream audit.** Quantities about the audit's own tallies are not quantities about runtime behaviour. |

### 2.5 The zero-count statements

**Across all three new files, of the seventeen rows enumerated above:**

| Assertion | Count |
| --- | ---: |
| Statements presenting a **measurement** | **0** |
| Statements presenting a **benchmark** | **0** |
| Statements making a **runtime selection** | **0** |
| Statements making a **sandbox selection** | **0** |
| Statements presenting a **threshold, ratio or quantity** of any kind about either language's speed | **0** |
| Rows **not** carrying the word `directional` and the string `JS-U2` | **0** |

**NEU-941 implemented nothing and ran no benchmark.** Its spec put implementing or timing actual JavaScript solutions, and selecting a runtime or execution sandbox, out of scope; that is what `JS-U2` records, and SUB-4 inherits the decline rather than quietly resolving it. Three of the rows above (`RG-S4-31`, `RG-S4-34`, `RG-S4-35`) are **explicit refusals to claim** rather than claims, and they are listed as rows precisely so the refusal is auditable instead of invisible.

> **A note on how this section is worded.** The verification sweep for this sub-task greps the three new files for a fixed set of measurement lexemes — a past-tense measurement verb, a past-tense benchmarking verb, two multiplier-comparison spellings, and a digits-plus-`ms` quantity pattern, as enumerated in `_local/NEU-960/02_plan.md` STEP-004. **That pattern is deliberately not reproduced literally anywhere in this file**, and the sentences above are phrased around it on purpose, so that the same grep run over all three new files still returns the intended result of **zero hits** (`CK-S4-8`). Naming the lexemes verbatim here would have made the register the only thing the grep found.

---

## 3. The three-artifact violation-detection walkthrough trace

**The register half of `../04_correctness-standards-and-authoring-languages.md` §7.** Three non-conforming artifacts are constructed there and walked to a failure; the rows below record, per artifact, **the standard**, **the exact field or payload slot that fails**, **the mechanism value that catches it**, and **what the check cannot prove**. The field and slot names are SUB-2's and the mechanism literals are SUB-9's five, both used verbatim.

**Evidence for `RG-S4-37` … `RG-S4-39`:** class 2 `[code-evidence]` — the three constructed artifacts and their walks in `../04_…` §7.1–§7.3, in this branch · **evidence type:** structural walk over constructed artifacts, recorded by the task that constructed them · **cutoff:** 2026-08-10 · **provenance:** field names from `../02_content-and-exercise-forms.md` §3, §4; mechanism literals from `../04_…` §3.1.

**No blocking behaviour and no placement is recorded in any row below.** A row names the mechanism that **detects** the failure and stops there; what happens to a failed artifact, and where the check runs, are **SUB-9's (NEU-965)** on both axes.

| Row | Artifact | Standard | Exact failure site — field / payload slot | Mechanism that catches it | Structural limitation — what the check **cannot** prove |
| --- | --- | --- | --- | --- | --- |
| `RG-S4-37` | **A** — a `solution` with no stated invariant (`../04_…` §7.1) | Solution (§2.2) | `reasoning` → the **`invariant` named slot** is absent. `reasoning` itself is present and non-empty, so **SUB-2's form definition is satisfied and does not reject the artifact**; the standard's constrained payload is what fails. | `schema` — slot presence inside a constrained payload | Presence proves a slot bearing that name exists and is non-empty. It **cannot** prove the named property is an invariant of the approach, that it is falsifiable, or that it is the *right* invariant for `approach_class` (`../04_…` §3.2 residue, owned by SUB-9). Because the artifact fails at presence, the stronger **boundary confrontation** check (`automated`) is **never reached** — this walk demonstrates the cheap check firing, not the strong one working. And boundary confrontation, when reached, only reaches failures the node's **already-authored** `separating_distractor_or_boundary_input` set happens to contain: a hidden failing case outside that set is caught by no check in this standard. |
| `RG-S4-38` | **B** — a `proof` skipping optimal substructure (`../04_…` §7.2) | Proof (§2.3) | `argument` → the **`optimal_substructure` slot** is absent. **Second, independent failure:** `separating_distractor_or_boundary_input` names no case label appearing in `recurrence_justification` (the closure link). | `schema` — slot presence inside the three-slot payload; **and** `deterministic` — the closure-link cross-reference | Slot presence proves three slot names are present and non-empty. It **cannot** prove the exchange step inside `optimal_substructure` is *sound* (`../04_…` §3.2 residue, owned by SUB-9), nor that the labelled case disjunction is genuinely **total** — the closure link is a **label-string cross-reference between two REQUIRED fields**, so an author who supplies a matching label satisfies it without closing the case set. Two independent checks failing here is **designed redundancy, not corroboration**: they fail on the same artifact for different reasons and neither strengthens the other's verdict. |
| `RG-S4-39` | **C** — a `test` with no edge case (`../04_…` §7.3) | Test (§2.4) | The node's **`test` set** → the **`kind:` label payload inside `misconception_or_edge_case`** yields `{misconception}` and not `{edge, misconception}`. The artifact is **individually valid** against both SUB-2's form and the test standard; it fails at set level. | `deterministic` — a count of distinct labels across the node's `test` instances | The count proves the set **spans both senses**. It **cannot** prove either instance is a good one: whether the named misconception is one a learner actually holds is judgment and is **SUB-6's (NEU-962)** design question (`../04_…` §3.2), and whether the edge case sits at the boundary that matters is judgment too. **Refusal accounting excludes only** tests whose `expected_behavior` reads the refusal literal — a test with a stated but wrong expectation still counts toward coverage. The self-oracle check is likewise structural: it detects an expectation derived from the artifact named in `subject`, not an expectation that is simply incorrect. |

**Three of three walks completed with no exemplar, no citation, no node id and no external reference** — the property `../04_…` §7 exists to demonstrate, and the reason SUB-4 does not wait on **SUB-11 (NEU-967)**, whose standards-conformance review over the package's exemplars is **cited, never produced, and never waited on** here.

**The structural limitation of §3 as a whole, and it is the important one.** The three artifacts were **constructed by SUB-4 to fail checks SUB-4 wrote**. A constructed non-example proves a rule has a **decidable failure mode** and that the failure lands on a nameable field or slot. It does **not** prove the rule catches non-examples it was not constructed against, and it does not establish any rate, coverage or effectiveness. That is an independent pass's finding to make, not this register's — inherited from `CAP-S2-3`'s framing of a single recorded run as an observation rather than a distribution.

**Anti-fabrication check on the constructed artifacts (`RG-S4-40a`).** Under `C2` / `EXC-1`: all three carry **zero invented identifiers, addresses or citations**; every `problem_ref` reads exactly `REFUSED — not verifiable`; every node id is a withheld angle-bracket placeholder. Verified lexically by `CK-S4-9` and `CK-S4-10`. **Structural limitation:** lexical, per `CAP-S1-5` / `CAP-S2-6` — the greps prove the structural absence of the obvious shapes and **cannot** prove no placeholder reads, to some future author, as data.

---

## 4. The `JS-E2` blocking-subtotal discrepancy — recorded here, filed as `OI-S4-8`, **not corrected upstream**

**`RG-S4-40`.** `../../C005-dp-js-materiality/02_audit-register.md` is internally inconsistent about how many of its 19 `blocking` verdicts carry `JS-E2`. **This register records the discrepancy and corrects nothing.** It is filed as **`OI-S4-8`** in `../90_open-items-and-provisional-register.md` § `SUB-4`, addressed to **NEU-941 / the creator**, who own the resolution.

**Evidence for `RG-S4-40`:** class 2 `[code-evidence]` — counting greps over `../../C005-dp-js-materiality/02_audit-register.md` in this branch (`CK-S4-3` … `CK-S4-7`) · **evidence type:** mechanical count · **cutoff:** 2026-08-10.

| Where the register speaks | What it says | Count |
| --- | --- | ---: |
| §1, effect-frequency table, `JS-E2` row (source line 36) | *"9 of the 19 blocking verdicts."* | **9** |
| §3.1 heading (source line 113) | *"`JS-E2` — modular multiplication is silently wrong (**9 blocking nodes**)"* | **9** |
| §2, per-node table — `**blocking**` rows carrying `JS-E2` | `RG-S4-02`, `-03`, `-10`, `-11`, `-14`, `-15`, `-16`, `-17`, `-18`, `-19` | **10** |
| §3.1 **body** (source lines 120–130) — the ids the section itself enumerates | 5 modular-multiplication ids + 4 cross-multiplication ids + 1 digit-DP id | **10** |

**The discrepancy is between §3.1's own heading and §3.1's own body**, and between the §2 headline and the §2 table — the same off-by-one, stated twice. The **10** ids §3.1 enumerates in prose are exactly the **10** `JS-E2`-carrying `**blocking**` rows of the §2 table; no id is in one and not the other. **Neither figure of 9 is supported by any enumeration in the document.**

**What is internally consistent, checked and recorded so the discrepancy is not read as wider than it is:**

| Fact | Table-derived | Stated upstream | Agree? |
| --- | ---: | ---: | --- |
| Total `blocking` nodes | **19** | **19** (§1 severity table) | **yes** |
| `JS-E1` blocking subtotal | **7** | **7** (§1 effect table, §3.2 heading, and the 7 ids §3.2 enumerates) | **yes** |
| `JS-E4` blocking subtotal | **2** | **2** (§3.3 heading, and the 2 ids §3.3 enumerates) | **yes** |
| `JS-E2` blocking subtotal | **10** | **9** (§1 effect table, §3.2… §3.1 heading) | **no — `OI-S4-8`** |

**Why it is recorded and not fixed.**

- **SUB-4 may not write under `docs/research/C005-*`.** The prohibition is absolute for this sub-task, and three sibling tasks are serialized on files in that package; an in-place edit here would be both out of scope and a merge hazard.
- **SUB-4 consumes the 19 ids as binding and re-derives nothing.** The **set** is what the selection rule depends on, and the set is unaffected: whichever figure is right, the same 19 node ids are in the hatch, and none of §1's rows changes. The discrepancy is in a **descriptive subtotal**, not in a membership decision.
- **Correcting a subtotal in another package's register would be exactly the substitution the selection rule forbids** — this package's arithmetic replacing the audit's recorded verdict summary. Recording it leaves a trace for the owner; correcting it would leave none.
- **Precedent.** `CAP-S1-6` handles the C005 baseline's own summary-line arithmetic slip the same way — *recorded, never corrected* — and files it as an open item. `OI-S4-8` follows that precedent exactly.

**Structural limitation.** This register establishes that **two figures in the upstream document disagree**. It does **not** establish which one NEU-941 intended, and it does not adjudicate the boundary between "carries `JS-E2`" and "is blocked *by* `JS-E2`" — a plausible reading under which one of the ten rows is blocked by a different effect in its list and the headline of 9 is the intended one. **That reading is available and is not adopted here**, because adopting it would be re-deriving a verdict. **The resolution is NEU-941's.**

---

## 5. Self-check honesty, reproducible checks, and structural limitations

**`CAP-S4` precedent: `CAP-S1-4` and `CAP-S2-5`.** **Every check in this register was run by the task that produced the artifact it checks.** An author checking its own completeness shares the author's blind spots by construction, and saying so is a condition of the register being worth anything.

**The split, stated the way `CAP-S1-4` states it.**

- **The mechanical half is reproducible by anyone.** Each check below records its **command**, its **outcome**, and the **file it ran against**, so a reviewer can re-run all of them against the same commit base and compare. A reviewer who gets a different number has found a defect in this register, not a difference of opinion.
- **The judgment half is unvalidated by an independent reader.** Is the §2 inclusion rule drawn in the right place? Is the §3 structural-limitation column honest about what each check misses? Is the §4 non-adoption of the alternative reading correct? None of those is settled by a grep, and **none is claimed to be.**
- **The intended occasion for the independent pass is NEU-969 (SUB-12)'s completeness gate**, `../92_package-completeness-gate.md`, and any reviewer of this change. This is a **mitigation, not a fix**, and it is not closable here.

### 5.1 The checks, their commands and their outcomes

Run at the verification cutoff **2026-08-10**, from the repository root of this branch's worktree, with paths written repo-relative in house style. `<C005>` abbreviates `docs/research/C005-dp-js-materiality/02_audit-register.md`; `<three new files>` abbreviates `docs/research/C009-course-content-quality/04_correctness-standards-and-authoring-languages.md`, `docs/research/C009-course-content-quality/decision-records/DR-C09-04_authoring-languages.md` and `docs/research/C009-course-content-quality/traceability/04_standards-evidence-and-scope-audit.md`.

| Check | Command | Outcome | What it establishes — and what it does not |
| --- | --- | --- | --- |
| `CK-S4-1` | ``grep -cE '^\| `cl-[0-9]\.[a-z0-9-]+` \| CL-[0-9]( [mf])? \| [a-z]+ \| .* \| \*\*blocking\*\* \|$' <C005>`` | **19** | The §2 per-node table has exactly 19 `**blocking**` rows. Says nothing about whether any verdict is right. |
| `CK-S4-2` | ``grep -n '\*\*blocking\*\*' <C005>`` | **22** lines — 19 at source lines 62–104 (the §2 table) and 3 at 188–190 (the §4 "where the mappers overturned this audit" table, which re-states three of the same nodes) | The literal `**blocking**` occurs 22 times but the **per-node table** carries 19. **Recorded because a naive count of the literal returns 22 and would be wrong**; the three extras are re-statements of `RG-S4-11`, `RG-S4-01` and `RG-S4-09`, not additional nodes. |
| `CK-S4-3` | ``grep -cE '^\| `cl-.*`JS-E2`.*\*\*blocking\*\* \|$' <C005>`` | **10** | The table-derived `JS-E2` blocking subtotal. Column-order-dependent (Effects precedes Severity), which is why `CK-S4-7` independently corroborates it by id enumeration. |
| `CK-S4-4` | ``grep -cE '^\| `cl-.*`JS-E1`.*\*\*blocking\*\* \|$' <C005>`` | **7** | Matches the upstream `JS-E1` subtotal. |
| `CK-S4-5` | ``grep -cE '^\| `cl-.*`JS-E4`.*\*\*blocking\*\* \|$' <C005>`` | **2** | Matches the upstream `JS-E4` subtotal. |
| `CK-S4-6` | ``grep -nE '9 of the 19 blocking\|9 blocking nodes\|7 blocking nodes\|2 blocking nodes' <C005>`` | lines **36**, **113**, **132**, **150** | Locates the four stated subtotals. Establishes what the document *says*, against what `CK-S4-3`…`CK-S4-5` count. |
| `CK-S4-7` | ``grep -noE 'cl-[0-9]\.[a-z0-9-]+' <C005>`` | §3.1 body (lines 120–130) enumerates **10** distinct ids; §3.2 body (138–141) enumerates **7**; §3.3 body (157) enumerates **2** | Corroborates `CK-S4-3`…`CK-S4-5` by a **different method** — id enumeration rather than row matching — and is what makes `RG-S4-40` a discrepancy rather than a regex artefact. |
| `CK-S4-8` | The measurement-lexeme grep of `_local/NEU-960/02_plan.md` STEP-004, over `<three new files>`. **The pattern is not reproduced literally in this file** (see §2.5) so that the check stays meaningful. | **0 hits** | No measurement lexeme appears in any of the three new files. **Lexical only**: it cannot prove no sentence is a quantitative claim in other words (`CAP-S1-5` / `CAP-S2-6`). |
| `CK-S4-9` | A URL-scheme grep over `<three new files>`. **Pattern not reproduced literally**, same reason. | **0 hits** | No address appears in any of the three new files. |
| `CK-S4-10` | ``grep -c 'REFUSED — not verifiable' docs/research/C009-course-content-quality/04_correctness-standards-and-authoring-languages.md`` | **≥1**, and every `problem_ref` in the three constructed artifacts of §7 carries it | The refusal literal is used where a value could not be verified. It **cannot** prove no placeholder reads as data. |
| `CK-S4-11` | ``grep -c '^\*\*Model:\*\* claude-opus-5\[1m\]' <three new files>`` | **1** in each of the three | SC-16 attribution present on every new file. |
| `CK-S4-12` | ``git diff --name-only origin/develop`` | lists **zero** paths under `docs/research/C005-*` | The cross-package prohibition held: **no file under `docs/research/C005-*` was written by this sub-task**, including the register audited in §1 and §4. |

### 5.2 The limitations these checks cannot lift

| Limitation | Inherited from | Statement |
| --- | --- | --- |
| **Lexical greps cannot prove semantic properties.** | `CAP-S1-5`, `CAP-S2-6` | `CK-S4-8`, `CK-S4-9` and `CK-S4-10` prove the **structural absence of the obvious shapes** — a measurement lexeme, an address, an unrefused reference. **They cannot prove that no sentence anywhere is a quantitative claim in disguise, and no grep can.** §2's enumeration is judgment applied to a read-through, bounded but not established by the greps. |
| **Self-checked by the producing task.** | `CAP-S1-4`, `CAP-S2-5` | Every row and every check in this register was written and run by SUB-4 over SUB-4's own artifacts. The mechanical half is re-runnable; the judgment half is not validated here. **`../92_package-completeness-gate.md` (NEU-969, SUB-12) is the intended occasion.** |
| **Constructed non-examples are not a coverage claim.** | `CAP-S2-3`'s one-run framing | §3's three walks prove three rules have decidable failure modes. They establish **no rate and no coverage**, and the artifacts were built to fail the checks that catch them. |
| **The 19 are consumed, not validated.** | `DR-C09-04` §Decision.3 | §1 proves string identity and membership arithmetic. It does **not** validate NEU-941's severity assignment for any node, and `JS-U1` / `JS-U4` ride unresolved on two of its rows. |
| **Restricted-by-default, not verified-restricted.** | `CAP-S1-1`, `CAP-S1-2`, `OI-S4-7` | Anything in the audited documents that depends on SUB-1's twelve source access-permission rows inherits that they are `restricted` **by the restricted-default rule** — no network access, zero requests issued — and are **not** verified-restricted. The interim `stable_id` + `canonical_url` field set is **consumed** under `CH-F5-1` and never widened. |
| **No QA-engine run is claimed.** | `CAP-S1-3`, `CAP-S2-2` | `qa-execution:engine` is **unconfigured** in this project's capability registry, which resolves to **`git, linear`** only. The QA-execution phase is a genuine **Core Article 8 no-op** — not a skipped step, not a deferred one. **No QA pass, scenario, verdict or report is asserted or implied anywhere in this register.** Verification here is **file inspection and `git diff`**, and nothing more. |

---

## 6. What this register does not do

- It **sets no status.** Status lives in a ledger — this package's `../adjudication/`, or the owning package's ledger for an inherited decision (`A1`–`A5`).
- It assigns **no blocking behaviour** (blocks / warns / quarantines) and **no gate placement** to any standard, mechanism or check. **SUB-9 (NEU-965) owns both axes.**
- It **corrects nothing upstream.** No file under `docs/research/C005-*` was written; the `JS-E2` subtotal discrepancy is recorded as `RG-S4-40` and filed as `OI-S4-8`, and its resolution is NEU-941's.
- It **re-derives no NEU-941 verdict** and re-assesses no node's JavaScript materiality. The 19 ids are consumed as binding at `rule_version: 1.0.0`.
- It **edits, reclassifies and removes no other sub-task's register rows.** A disputed classification is raised in `../adjudication/`, not corrected in place.
- It does **not** run SUB-11's (NEU-967) standards-conformance review over the package's exemplars, and does not wait on it.
