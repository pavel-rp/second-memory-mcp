# DR-C09-04 — The Authoring Languages: TypeScript on Node as Standard, C++17 as the Escape Hatch

**Task:** NEU-960 (SUB-4) · **Charter:** C009 (umbrella NEU-890) · **Decision id:** `DR-C09-04` · **Owner:** **the creator** (default), as the party who authors and maintains every artifact this record governs — surfaced here for reassignment rather than assumed permanent · **Status:** deferred — **this record sets no status of its own.** A producing task may not promote its own artifact (A1–A5); status lives in a ledger, not in the record that argues for it · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10
**Model:** claude-opus-5[1m]

Follows the house decision-record shape of `DR-C09-01_permitted-field-set.md` (Decision · Rationale · Rejected alternatives · Consequences · Evidence · Revision trigger), **referenced rather than re-derived**. NEU-941's audit is likewise **consumed by id, never re-derived**: this record re-assesses no technique's JavaScript materiality and recomputes none of its counts.

---

## Decision

**Two languages, and a rule that decides between them mechanically.**

### 1. TypeScript on a Node runtime is the standard authoring language — settled

Every explanation, solution, proof and test the course authors is written in **TypeScript on a Node runtime**, unless the selection rule in §3 sends it to the escape hatch. This is a **settled charter decision**. This record **records** it, with its rationale and its rejected alternatives, so a later reader can see it was chosen rather than defaulted into; **it does not reopen it.**

### 2. C++17 is the escape-hatch language

Where the selection rule fires, the artifact is authored in **C++17**. There is exactly one escape hatch and exactly one language in it. A third language is not admitted by this record and would need its own.

### 3. The selection rule

> **A technique is authored in the escape-hatch language if and only if its node id is one of NEU-941's 19 blocking node ids at `rule_version: 1.0.0`.**

The 19 ids, reproduced verbatim from `../../C005-dp-js-materiality/02_audit-register.md` §2 with the effects that audit recorded on each:

| # | Node id | Effects recorded by NEU-941 |
| ---: | --- | --- |
| 1 | `cl-1.formulate-1d-sequence-dp` | `JS-E1` |
| 2 | `cl-1.counting-dp-over-linear-domain` | `JS-E2`, `JS-E3` |
| 3 | `cl-2.implement-counting-dp-under-a-modulus` | `JS-E2`, `JS-E3` |
| 4 | `cl-2.root-an-unrooted-tree` | `JS-E1` |
| 5 | `cl-2.implement-tree-dp-post-order-dfs` | `JS-E1` |
| 6 | `cl-2.debug-tree-dp-recursion-depth` | `JS-E1` |
| 7 | `cl-2.implement-rerooting-two-pass-dfs` | `JS-E1` |
| 8 | `cl-2.impose-topological-evaluation-order` | `JS-E1` |
| 9 | `cl-2.condense-sccs-to-recover-a-dag` | `JS-E1` |
| 10 | `cl-3.implement-digit-dp` | `JS-E2`, `JS-E3` |
| 11 | `cl-3.resolve-expectation-dp-self-loops` | `JS-E2`, `JS-E3`, `JS-E9` |
| 12 | `cl-3.plug-dp-connectivity-encoding` | `JS-E4`, `JS-E3` |
| 13 | `cl-3.implement-plug-dp` | `JS-E4`, `JS-E7`, `JS-E3` |
| 14 | `cl-4.convex-hull-trick-monotonic` | `JS-E2` |
| 15 | `cl-4.li-chao-tree-dp-application` | `JS-E2` |
| 16 | `cl-4.implement-cht-deque-and-li-chao` | `JS-E2`, `JS-E8`, `JS-E5` |
| 17 | `cl-4.matrix-exponentiation-dp` | `JS-E2`, `JS-E3` |
| 18 | `cl-4.implement-modular-matrix-power` | `JS-E2`, `JS-E3`, `JS-E5` |
| 19 | `cl-4.kinetic-segment-tree-implementation` | `JS-E2`, `JS-E5` |

Four things follow from the rule's *form*, and they are the point of stating it as an identity rather than as a guideline:

- **Membership is by id. An effect-based argument does not admit a technique.** *"This technique also carries `JS-E2`"* is **explicitly not grounds for the hatch.** Fifteen nodes in the map carry `JS-E2` and only some of them are in the 19; NEU-941 decided which, on evidence, and recorded the verdict as a **severity**, not as an effect list. Reading the effect column back into an admission decision would silently substitute this package's judgment for the audit's. Not by effect, not by resemblance, not by an author's sense that a technique is "similar enough".
- **Anything outside the 19 is authored in TypeScript.** There is no third category, no "borderline", and no per-artifact discretion.
- **The hatch cannot widen by precedent.** One artifact authored in C++17 creates **no entitlement** for a neighbouring technique, for the rest of its cluster, or for the technique it is most often taught beside. Nineteen artifacts in the hatch produce a set of exactly nineteen, not a trend.
- **Pressure to widen is filed, never absorbed.** An author who believes a twentieth technique belongs in the hatch **files it as an open item (`OI-S4-k`) in `../90_open-items-and-provisional-register.md`, addressed to NEU-941's owner**, and authors the artifact in TypeScript in the meantime. Absorbing the pressure locally — writing one artifact in C++17 "because it obviously belongs" — is the exact failure this rule exists to make visible, because it is the only failure mode that leaves no trace.

**When an author may reach for it, concretely.** The author is writing a `solution`, a `test`, or `example` code for a node whose `node_id` string appears in the table above. That is the whole precondition. Not "the technique feels blocked", not "the recursion looks deep" — the id is in the set or it is not.

**What catches misuse, concretely.** The check is **mechanical**: an artifact declaring the escape-hatch language carries its `node_id`, and that id is compared against the frozen 19-id set. A hatch-authored artifact whose `node_id` is not in the set fails on a **membership test, not on taste** — a reviewer does not have to argue about whether the technique is really blocked, because the artifact does not raise that question. In SUB-9's mechanism vocabulary (`deterministic`, `schema`, `server-side`, `automated`, `AI`), this is a **`schema`** check: set membership over a frozen enumeration. **SUB-9 (NEU-965) owns the gate's blocking behaviour and its placement — this record assigns neither**, and names the mechanism only so SUB-9 inherits a check that is already stated in its own vocabulary.

## Rationale

- **TypeScript on Node matches this repository, so NEU-941's audit binds directly rather than by analogy.** The audit's reference language is JavaScript, and the runtime this project ships on is Node; every one of the nine effects is a statement about the language and engine the creator already writes in. That is not a convenience — it is what makes 179 recorded verdicts *usable* instead of merely instructive. A standard language the audit did not assess would leave every verdict needing translation, and a translated verdict is a re-derivation this record is not entitled to make.
- **The creator learns in the stack they ship in.** The course's reader is the creator; the artifacts are exercised in the same language as the product. That collapses the gap between "I can write this technique" and "I can write this technique here."
- **C++17 answers all nine effects natively, and it answers them by *having the feature*, not by working around its absence.** Mapped onto `../../C005-dp-js-materiality/01_effect-catalogue.md`:
  - `JS-E2` / `JS-E3` — `long long` is exact where `Number` stops at 2^53, and `__int128` extends it again; the modular multiplication that silently rounds in JavaScript is a one-liner with no ceremony, and a count that needs `BigInt` in JavaScript needs nothing at all.
  - `JS-E4` — `unsigned long long` gives 64 bits of mask against JavaScript's 31, so a multi-bit-per-position encoding fits in the operators instead of moving to a bignum, a digit array, or a string key.
  - `JS-E1` — recursion runs on the process stack, which is **raisable**, against JavaScript's hard ~10^4-frame cap that a submitted program cannot lift. This is the sharpest contrast in the set: the JavaScript limit is not a tuning knob, and the C++ one is.
  - `JS-E5` — `std::vector` **is** the contiguous unboxed buffer, so the container decision a JavaScript author must make consciously does not arise.
  - `JS-E7` — a struct or `pair`/`tuple` key is keyed by value, so composite-state memoization has a cheap standard form.
  - `JS-E8` — `priority_queue`, `set`, `multiset` and `deque` are stdlib, so a technique defined in terms of one of them can be written in terms of it.
  - `JS-E9a` — `long double` exists and is defined, and its **absence** in JavaScript is a fact the audit records explicitly rather than one this record supplies.
- **C++ is the reference frame the audit itself judges blocking against.** NEU-941's whole frame is *"the direct C++ translation is silently wrong or crashes in JavaScript."* So for every one of the 19, C++17 is not a hopeful choice — it is **the language in which the blocked technique is already known to be expressible**, by the same document that recorded the block. Choosing anything else would mean re-establishing expressibility from scratch, for nineteen techniques, on this package's own authority.
- **It is also the corpus idiom.** The published reference implementations a learner will meet for these nineteen techniques are written in C++. A learner reading our artifact and then a published one is reading the same form twice, not translating between two.
- **Why a second language is admitted at all, rather than teaching the workaround.** A JavaScript rendition of a technique JavaScript cannot express is an **inaccurate teaching artifact** — it teaches a rewriting of the technique while claiming to teach the technique. That is the entire justification for the hatch, and it is also its boundary: it reaches exactly as far as the inaccuracy is real, which is exactly the 19 ids where NEU-941 found the direct translation silently wrong or crashing. Outside those, there is no inaccuracy to fix, so there is nothing for a second language to buy.

## Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| **(standard language) JavaScript rather than TypeScript** — the audit's own reference language, so the mapping from verdict to artifact would be exact with nothing left over. | Genuinely attractive: every effect in the catalogue is stated about JavaScript, and an untyped artifact is the *literal* subject of the audit. Rejected because the repository is TypeScript, and because an untyped artifact loses the **structural checkability** every standard in `../04_correctness-standards-and-authoring-languages.md` leans on — a payload slot that cannot be checked is a payload slot enforced by prose. The loss is real and one-directional: TypeScript retains every JavaScript semantic the audit describes, including all nine effects, because it compiles to it. Nothing about the audit's applicability is given up by adding types; something about checkability is given up by removing them. |
| **(standard language) C++ everywhere** — one language, no hatch, no selection rule, no membership test to police. | The simplicity is not fake — a single language removes this entire record's machinery, and the 19 hardest techniques become the easy case rather than the exception. Rejected on two grounds, either sufficient. It abandons the stack the creator ships in, so the course stops teaching in the language the product is written in. And it makes **NEU-941's audit irrelevant rather than binding**: 179 recorded verdicts about JavaScript feasibility would describe a language no artifact is written in, and the single most expensive input this package has would become background reading. |
| **(hatch) Rust** — covers every effect in the catalogue: exact sized integers, 64-bit and wider masks, a raisable stack, contiguous `Vec`, value-keyed maps, `BinaryHeap` and `BTreeSet`, and no missing container. | On effect coverage alone it is a *better* answer than C++17 on several axes, and it would produce artifacts that fail loudly where C++ fails silently. Rejected because the artifact would **teach ownership and borrow discipline rather than the technique**. In a DP solution the borrow checker is not incidental: mutable table access across a recursive call is exactly where it demands restructuring, so the restructuring becomes the visible content of the artifact. The cognitive surface a learner pays for would not be the surface being taught — which is the same objection this record makes to teaching a JavaScript workaround, pointed the other way. It is also not the corpus idiom, so the cross-reading benefit is lost too. |
| **(hatch) Python 3** — arbitrary-precision integers by default, so `JS-E2` and `JS-E3` simply do not exist; tuple keys are native, so `JS-E7` does not either; and bitwise operators are unbounded, so `JS-E4` does not. | **The most tempting of the four on paper**, because it dissolves the largest effect group in the set — every `JS-E2`/`JS-E3` id — without the author writing a single line about it, and it is the language most likely to be readable to a learner who is not fluent in C++. It fails on the group it does *not* dissolve: Python's own default recursion limit sits **below** JavaScript's practical ceiling, so `JS-E1` is not merely unfixed but arguably worse, and `JS-E1` is the forcing effect on **seven of the 19** — the largest single forcing group in the set (ids 1, 4, 5, 6, 7, 8, 9). A hatch that leaves seven of nineteen failing in precisely the way that put them on the list is not a hatch; it is a second standard language with a coverage gap, and the gap would have to be papered over with the explicit-stack rewrite the hatch exists to avoid. Its `JS-E8` coverage is also partial rather than clean — a heap and a deque are stdlib, an ordered multiset is not. |
| **(hatch) Java** — covers the effects: `long` is exact to the same range as `long long`, `BigInteger` is available, masks are 64-bit, the stack is raisable, `PriorityQueue`/`TreeMap`/`TreeSet`/`ArrayDeque` are stdlib, and arrays are contiguous primitives. | Workable, and honestly so — there is no effect in the catalogue it fails outright, and it is a mainstream contest language, so this is a rejection on quality of artifact rather than on capability. It is **verbose enough to bury the recurrence in ceremony**: the declaration, boxing and container syntax around a DP transition is a substantial fraction of the artifact's visible surface, and an artifact whose recurrence is three lines in twenty is teaching Java as much as it is teaching the technique. And it is **not the corpus idiom**, so a learner cannot cross-read a published reference implementation against ours — which is one of the two concrete benefits C++17 buys. |
| **(hatch) No hatch at all — TypeScript with `BigInt`, explicit stacks and typed arrays** | **The most serious alternative in this table, and it must be argued honestly.** It is technically sufficient: every one of the 19 *can* be written correctly this way, and NEU-941 says so — its blocking verdicts are about the **direct** C++ translation, not about JavaScript's expressive power. It also has the single strongest advantage available: one language, one toolchain, and a learner who never leaves the stack they ship in. It is rejected on **what the artifact would then be about**. An explicit-stack rewrite of a tree DP teaches stack-conversion; a `BigInt` modmul or a split multiply around 2^26 teaches the 2^53 boundary; a `>>> 0` discipline teaches int32 coercion. Each is a real skill and none is the technique on the node. The artifact's subject silently becomes **the language's limitation instead of the algorithm**, and the learner cannot tell which of the two they are being taught — which is the same inaccuracy the hatch exists to prevent, arrived at by a more defensible-looking route. Any claim that this alternative is slower is **directional only under `JS-U2` and is not asserted as fact here**: NEU-941 implemented nothing and selected no runtime, so the speed of a `BigInt` rewrite is not a thing this record knows. The rejection stands entirely on pedagogical accuracy, and needs no performance claim at all. |

## Consequences

- **Which artifacts take the hatch, and which do not.** For a node in the 19: `solution`, `test`, and any `example` code are authored in C++17. `lesson` and `proof` **prose stays language-neutral** — a recurrence, an optimal-substructure argument and an exchange argument are statements about the algorithm, and putting a language in them would make the technique look like a property of the language.
- **Every hatch-authored artifact carries a stated JavaScript-failure note citing the forcing `JS-E*` id(s).** The note is what makes the hatch legible to the reader instead of arbitrary: it says *why this one artifact is in a different language*, in the audit's own vocabulary. It also gives the membership check something to attach to.
- **A second toolchain is now implied for authoring.** That is a consequence, not a deliverable. **Selecting or building an exercise runner, an editor or a judge is explicitly out of scope here.** This record **chooses and justifies two languages; it implements neither**, and it selects no runtime, no compiler, no sandbox and no execution environment. A later charter that does select one inherits this record as an input, not as a constraint it may reinterpret.
- **SUB-9 (NEU-965) inherits the gate.** The membership check is stated here as a `schema`-mechanism check; **its blocking behaviour and its placement are SUB-9's, on both axes.** Nothing in this record says the gate blocks, warns, quarantines, or runs at any particular point.
- **Every later exercise-runner, authoring-tooling or curriculum-production charter inherits this record**, including the selection rule and its refusal to widen. A charter that wants a wider hatch does not get one by scope; it gets one by NEU-941 publishing a new `rule_version`.
- **The 19-id set is a frozen enumeration for the whole package.** It is reproduced here and audited row-by-row in `../traceability/04_standards-evidence-and-scope-audit.md`. Two of its rows carry NEU-941's own recorded uncertainties — `JS-U1` (the recursion verdict sits on the nearest unfrozen nodes because the node that owns the realization choice is a frozen root) and `JS-U4` (`cl-2.condense-sccs-to-recover-a-dag`'s verdict sits on the DP-side act, with the anchor-side question open). **Both are consumed as recorded and neither is resolved here.**

## Evidence

This is a **technical judgment resting on recorded language-specification facts plus reasoning — not an empirical finding**, and it is declared as such rather than dressed in manufactured evidence rows (following `DR-C09-01`'s Evidence section, which does exactly this). Nothing below was executed, timed, or run.

| What it rests on | Class | Provenance |
| --- | --- | --- |
| **NEU-941 as the binding input, by task id** — the JavaScript-materiality audit of the DP map at `rule_version: 1.0.0`, map version `0.1.0`, compiled `2026-07-16`: **179/179 nodes assessed, 47 material, 132 explicitly JavaScript-neutral, 19 blocking.** Consumed by id; no verdict re-derived. | 2 `[code-evidence]` | `../../C005-dp-js-materiality/README.md`; `../../C005-dp-js-materiality/02_audit-register.md` §1 |
| **The 19 blocking node ids**, each matching a `blocking`-severity row of the audit register by exact string | 2 `[code-evidence]` | `../../C005-dp-js-materiality/02_audit-register.md` §2; row-by-row audit at `../traceability/04_standards-evidence-and-scope-audit.md` |
| **The nine effects `JS-E1`…`JS-E9` (and `JS-E9a`)**, each stated by NEU-941 as a language-specification or engine-architecture fact against the C++ default it departs from — the basis for the C++17 coverage mapping in the Rationale | 1 `[literature]` | `../../C005-dp-js-materiality/01_effect-catalogue.md` |
| **The four feasibility-changing findings** (`JS-E2` modular multiplication, `JS-E1` the recursion cap, `JS-E4` 32-bit bitwise, `JS-E8` the missing containers) — the reason the hatch exists at all | 2 `[code-evidence]` | `../../C005-dp-js-materiality/02_audit-register.md` §3; `../../C005-dp-js-materiality/README.md` |
| **`JS-U2`** — NEU-941 implemented nothing, timed nothing, and selected no runtime or sandbox; every performance verdict in it is **directional, never quantified** | 2 `[code-evidence]` | `../../C005-dp-js-materiality/03_caps-and-uncertainties.md` `JS-U2` |
| **`JS-U1` and `JS-U4`** — the recorded placement and anchor uncertainties riding on rows of the 19-id set, consumed as recorded | 2 `[code-evidence]` | `../../C005-dp-js-materiality/03_caps-and-uncertainties.md` `JS-U1`, `JS-U4` |
| **The C++17 effect-coverage mapping itself** — that `long long`/`__int128`, `unsigned long long`, a raisable process stack, `std::vector`, value-keyed containers, `priority_queue`/`set`/`multiset`/`deque` and `long double` answer the nine effects | — **this record's own reasoning over recorded language-specification facts**, declared as reasoning and not as a finding | this document, Rationale |
| **The pedagogical grounds for rejecting Rust, Python 3, Java and the no-hatch option** | — **this record's own judgment**, recorded as judgment | this document, Rejected alternatives |

**Every performance verdict anywhere in this record is directional under `JS-U2`, and no statement in it is a measurement.** That applies in both directions and to both languages: this record does **not** claim that the no-hatch TypeScript rewrite is too slow, that C++17 is fast enough, or that any technique clears any threshold in any runtime. Those are quantitative questions about a real runtime on a real workload, NEU-941 declined them by scope, and this record inherits the decline rather than quietly resolving it. The cap is carried in `../91_caps-and-incomplete-scope.md`.

**No class-7 `[future-real-user]` evidence supports any part of this record, and none could:** no learner has used an artifact in either language, because no artifact exists yet. Class 7 does not exist for this package.

## Revision trigger

- **NEU-941 publishes a new `rule_version`.** This is the **primary and expected trigger**. The 19-id set is revised **there**, never here: this record's selection rule names the set at `rule_version: 1.0.0` precisely so that a change to the set is a version bump upstream rather than a local judgment call. A new `rule_version` supersedes the table in §3 wholesale; it is not amended row by row.
- **A technique outside the 19 is found to be genuinely blocked.** It is **filed as an open item against NEU-941** (`OI-S4-k` in `../90_open-items-and-provisional-register.md`) and resolved by the audit's owner. It is **not** resolved locally, and the artifact is authored in TypeScript until it is. A widening that arrives through this route revises this record; a widening that arrives any other way is the failure the rule exists to catch.
- **The standard authoring language changes charter-wide.** The hatch's rationale is stated relative to what the standard language cannot express, so a different standard language invalidates both the rule's premise and the effect mapping, and this record is rewritten rather than patched.
- **C++17's effect coverage is invalidated** — a coverage claim in the Rationale turns out to be wrong for some effect, or the hatch language's own version is moved. Either way the hatch language is re-argued against the same nine effects, in a new record.
- **SUB-9 (NEU-965) re-expresses the membership check** in its own mechanism and enforcement vocabulary. That does not revise the rule, which is this record's; it may revise the `schema` mechanism value named for it, which is SUB-9's.
