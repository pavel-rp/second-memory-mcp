# 94 — Package Completeness Gate

**Location reserved by:** NEU-971 (SUB-1) · **Charter:** C010 (umbrella NEU-895) · **Opened:** 2026-08-21
**Answered by:** NEU-986 (SUB-12) · **Answered:** 2026-08-22 · **Cutoff:** `3352c00` (`origin/develop`)
**Model:** claude-opus-5[1m]
**Owner:** **NEU-986 (SUB-12)** — sole. No other sub-task writes here.
**Companion:** `17_package-closure-and-neu-896-handoff.md` — the closure chapter this gate cites throughout.

---

## Status: answered — **55 of 61 items pass, 6 do not**

**5 items fail. 1 item is capped. 5 caps are filed, each with one named owner.**

A gate answering every item *pass* over a package whose own citation audit returned **FAIL**, whose
traceability audit returned **PARTIAL**, and whose independent cold reader answered *"No. I could not
start implementing from this package without asking a question"* would be the single most damaging
artifact this programme could produce, because it is the document NEU-896 will trust. It does not.

Equally, **severity is not manufactured here.** The package's largest defect by count — 161
unresolvable citations — is **159 occurrences of one mechanical error in two directions**, and that is
genuinely less serious than 161 independent ones. This gate says so where the evidence says so.

---

## 1. How the item set was derived

The item set is **derived from published sources, not invented**, so that a reader can check the item
set itself before checking the answers. Three groups, **61 items** in total:

| Group | Source | Items |
| --- | --- | --- |
| **A** | The **"Verified by"** clause of each of `OUT-1` … `OUT-12` in `01_outcome-register.md`, one item per named verification. | **42** — `G-1` … `G-42` |
| **B** | `OUT-12`'s success measure, which enumerates the C005 house-style artifact set and the standalone property. Two of its thirteen elements (the gate itself; the citation audit) are already `G-40` and `G-42` in Group A and are not duplicated. | **10** — `G-43` … `G-52` |
| **C** | The eight reads this file's own reservation stub (§"The gate reads, at minimum") enumerates, plus the QA no-op the stub requires be recorded. | **9** — `G-53` … `G-61` |

**A derived set contains overlaps, and they are stated rather than deduped.** `G-41` (the cold-read
review) and `G-52` (the standalone property) fail for the same reason; `G-53`, `G-54` and `G-56`–`G-58`
re-check registers Group A already touches from a different angle. Silently merging them would make the
count smaller and the derivation uncheckable.

### 1.1 The four dispositions

| Disposition | Meaning |
| --- | --- |
| **pass** | The item is answered, with a citation resolving into `docs/research/`. |
| **pass-with-qualification** | The item is answered with a citation, **and the evidence is thinner than the item's own wording**. The shortfall is stated in the row. It is never silently upgraded to a plain pass. |
| **fail** | The item is answered with cited evidence, **and the answer is negative**. Routed to a named owner. A negative answer to a performed check is a failure, not a cap. |
| **capped** | The item **cannot be answered with cited evidence at all** from inside this charter. Recorded as a `CAP-S12-*` entry in `91_caps-and-incomplete-scope.md` with **one** named owner. |

### 1.2 The self-graded marker `†`

This file's own reservation stub forbids SUB-12 from promoting its own work to passing. Ten items are
nonetheless discharged by artifacts SUB-12 itself wrote — a gate cannot decline to answer whether the
handoff list exists merely because it wrote the handoff list. Every such item is marked **`†`** and
counted, and **`†` is the weakest evidence class in this package**: it is one party grading its own
artifact. A reader converging this package should check the ten `†` rows directly rather than take
them. The one item where self-grading was categorically barred — the cold read — was **not** self-graded:
it was performed by an independent reader, and it **failed**.

**`†` count: 10 of 61** — `G-38`, `G-39`, `G-40`, `G-49`, `G-50`, `G-51`, `G-53` (in part), `G-59`,
`G-60`, `G-61`.

### 1.3 Binding figures used

The compatibility surface is **46 tools / 43 gated / 3 exempt / 49 audit entries** (`F-S8-1`); the
charter's "45 tools and 3 prompts" is a **miscount**, not staleness. Repository facts are **169
TypeScript source files, 26,816 lines, 202 test files, 25 migrations, 720 commits (468 human, 252
automated)** (SUB-9's re-measurement); the 165 / ~25,200 / 197 figures are **stale**. The matrix is cited
at revision **`post-validation`** (`08_…md` + `10_…md`, SUB-16 / NEU-979).

---

## 2. Group A — the twelve outcomes' "Verified by" clauses (42 items)

### `OUT-1` — System-context and responsibility-boundary model

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-1` | Boundary-to-requirement traceability audit | **pass** | `traceability/S4_component-and-boundary-coverage.md`; `16_…md` §4.1 — boundary rows with a populated "Forced by" cell **17 / 17**, and **0** rows resolving outside `docs/research/` across all 259 rows. |
| `G-2` | A walkthrough of **the three C005 benchmark journey shapes** across the diagram showing each hop's authority | **pass-with-qualification** | `05_…md` §7.3 walks a content request across the serve path hop by hop with each hop's authority named, and §7.1 places the three content components. **Qualification:** the phrase "the three C005 benchmark journey shapes" is undefined and uncitable, and the only source it can name records **five** journeys, not three — the charter's accepted review warning `F5.5`, restated in full at `17_…md` §7.6. The walkthrough exists; the number in the criterion does not. |
| `G-3` | A cold read by an independent implementation agent who must **name each boundary's owner without asking** | **fail** | Performed, not skipped — `17_…md` §2. The reader named **15 of 17** boundaries' owners without inference and **could not** name two: `BND-S4-17`, whose owner cell reads `nobody` (`05_…md` §4), and `BND-S4-16`, whose class still reads `undecided` in the file that defines it. It asked **seven** blocking questions. → **`CAP-S12-1`**, owner **`NEU-896`**. |
| `G-4` | Presence check — the authoring pipeline, the quality-gate battery and the content serve path each appear as a **placed component with an owner** | **pass** | `05_…md` §7.1 names `CMP-S4-13` (authoring pipeline), `CMP-S4-14` (quality-gate battery) and `CMP-S4-16` (content serve path); §3's component table carries an owner for each. None is implied by the model. |

### `OUT-2` — Complete state-category inventory

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-5` | Schema-and-code walk asserting every table, column group and in-memory structure appears **exactly once** | **pass** | `04_…md` §7.1 sweeps 1–2 over `src/infrastructure/db/schema.ts` and the raw-SQL tables under `drizzle/`, plus every module-level mutable structure; `DR-C10-S3-1` is the individuation rule that makes "exactly once" decidable. 45 categories. |
| `G-6` | Cross-check that every state category named by NEU-887, NEU-888, NEU-889 and NEU-890 has an entry | **pass** | `04_…md` §7.1 sweep 3; §3.6's status distribution — **30 `existing` / 11 `required-by-upstream` / 4 `assumed`** — is the cross-check's own output, carried unchanged into both matrix revisions. |
| `G-7` | An **omission probe** in which an independent reader is asked to name a state category the inventory misses | **pass** | `04_…md` §7.2. The probe was run by an independent read-only walk working **only** from the charter's five-item list, **found six missing structures** (`SC-S3-23` … `SC-S3-27`), and forced a published revision of the method: *"Sweep 2 is run against the source tree, never against any prose enumeration of it — including this document's own."* One of the six loses data on restart. A probe that found something is the strongest single piece of evidence in this group. |

### `OUT-3` — Per-state authority matrix

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-8` | Mechanical **exactly-one-authority** audit over the matrix, reported as counts | **pass-with-qualification** | `10_…md` §8.1 — 45 rows, exactly one authority each, 0 shared, 0 unassigned, reported as counts; independently re-derived by `09_…md` §4. **Qualification:** three of the 45 assignments are contested by merged artifacts the audit does not reconcile — `SC-S3-33` and `SC-S3-34` (`F-S10-6`, `17_…md` §7.3) and `SC-S3-17` (`F-S14-8`, where one merged artifact contradicts **itself**). The count is a true count of the document; it is not a demonstration that all 45 assignments are settled. |
| `G-9` | Scenario evidence for **divergence, conflicting concurrent writes, mid-operation interruption and recovery**, each producing a **defined** outcome | **pass-with-qualification** | `10_…md` §7 walks all four scenario classes against the matrix. **Qualification:** two categories return an **undefined** outcome — `SC-S3-42` (`F-S14-4`) and `SC-S3-31` (`F-S14-5` / `F-S10-4`), both filed and both unrepaired. Routed to `SUB-14 (NEU-978)` and `SUB-16 (NEU-979)` as residuals (both merged) and co-named **`NEU-896`**. |
| `G-10` | Audit that every `OUT-2` row appears in the matrix and every matrix row appears in `OUT-2` | **pass** | `16_…md` §4.3 — *"`OUT-3` and `OUT-5` carry two same-shaped cross-checks — **PASS**"*; unmatched counts **0** in both directions, 45 ↔ 45. Graded by a sibling sub-task, not by the matrix's author. |

### `OUT-4` — The isolation invariant, the consumed placement, and the NEU-893 split

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-11` | Application of the isolation invariant to **every** row of the `OUT-3` matrix, any row that cannot satisfy it reported as a finding | **pass** | `06_…md` §3.3–§3.4 and §4 — the invariant applied to all 45 rows under **two** named target states, **90 row-evaluations**, every failure reported. The criterion asks for application and reporting, and both happened. **The residual is severe and is not hidden:** the result is **zero `holds`**, `fails-principal: 0` means *unreached* rather than *passed* (`F-S14-2`), and `CAP-S5-1` stands. `17_…md` §6.3. |
| `G-12` | A **disjointness audit** over the two question lists — no overlap, no gap | **pass-with-qualification** | `06_…md` §5.5 — universe **18**, List A **10**, List B **8**, on both **0**, on neither **0**; seven further questions named with the owners they were routed to. **Qualification:** the chapter's own caveat, carried forward at `17_…md` §6.2 — the "0 on neither" is **definitional, not empirical**. What was genuinely checked is that no question sits on two lists and that every question the five checks generate was assigned. |
| `G-13` | A C003-reconciliation record for **NEU-850's `OUT-2`** — named as consumed, source cited, and either no amendment or a routed amendment with the contradicting evidence named | **pass** | `06_…md` §1 (consumed, source: intake Q6 + the 2026-08-19 tracker read) and §2 (**"No amendment is routed"**, with two rejected candidates and the bar each failed recorded). Restated in full, gitignore-independent, at `17_…md` §5. |
| `G-14` | A threat walk of the **`sub`-versus-`azp`** and **STDIO-unauthenticated** cases against the invariant | **pass** | `06_…md` §4.1 (`I5` and the `fails-principal` verdict) and §4.3 (the STDIO sequencing consequence — closing STDIO **surfaces** the `sub`/`azp` defect rather than resolving it). Both carried forward as `H5`–`H7` on the NEU-893 handover, `17_…md` §6.2. |

### `OUT-5` — The web API's scope, its negative boundary, and the resource inventory

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-15` | Bidirectional cross-check between the resource inventory and the authority matrix, **unmatched counts in both directions** | **pass** | `11_…md`; graded independently at `16_…md` §4.3 — **PASS**, both directions reported. |
| `G-16` | Negative-boundary review — for **every** state category the API does not own, the inventory says so | **pass** | `11_…md`; `DR-C10-S7-1`. The web tier holds **0 of 45** authority rows, and the inventory states the negative for each. |
| `G-17` | Scope audit confirming **zero** endpoint paths, payload schemas or error catalogues are specified | **pass** | `11_…md:611` (`\| Endpoint paths specified \| **0** \|`), `:619`, `:628`; also stated at `01_…md:64`. **This is the one item in the gate with independent corroboration**: the cold reader searched for all three and reported *"Zero"*, recording the stop as *"a deliberate scope boundary, not a gap"* (`17_…md` §2.4). |

### `OUT-6` — The application-versus-core rule, the compatibility contract, the regression boundary

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-18` | Application of the rule to **each** implied core change, with the classification recorded | **pass** | `12_…md`; `DR-C10-S8-1` states the rule as `R8-1` … `R8-5` with a demonstrated case each way, and each implied core change carries its classification. |
| `G-19` | Regression-boundary audit naming, for **each of the 45 tools and 3 prompts**, whether the architecture changes its contract and **how a break would be caught** | **pass-with-qualification** | `12_…md`; the boundary is fixed as **seven published surface properties**, per-item, over both transports. **Two qualifications.** (a) The criterion's own figure is the charter's **miscount**: the audited surface is **46 tools / 43 gated / 3 exempt / 49 audit entries** (`F-S8-1`), and the audit was correctly run over the corrected surface, not the stated one. (b) The "how a break would be caught" half specifies **five** detection methods and **`CAP-S8-1` records that not one is run.** |
| `G-20` | A stated cost for any per-call identity argument that (i) separates a **semantic** change to the already-declared `context_token` from a genuine schema addition, (ii) reports the tool count in each class against the verified gated/exempt split, and (iii) **names the STDIO gate that does not exist** | **pass-with-qualification** | `12_…md`; `DR-C10-S8-2`. All three sub-clauses are discharged: the semantic-versus-schema separation is stated, per-class counts are reported, and the non-existent STDIO gate is named as `CC-S8-3` with boundary `BND-S4-17` (owner `nobody`). **Qualification:** the criterion's "verified 42-gated / 3-exempt split" is itself the miscount corrected to **43 / 3** by `F-S8-1`; the answer uses the corrected figure. |
| `G-21` | A recorded assessment of the **token-bound** alternative against the per-call one | **pass** | `DR-C10-S8-2` — decision: token-bound identity over per-call identity, with rejected alternatives and the evidence that decided it. Its obligation (a principal column plus a **refusing** mint path) is carried as `OI-S8-1` and evolution path `EP-5`, `17_…md` §10. |
| `G-22` | Confirmation that **no DP-specific concept** appears in any proposed core surface | **pass** | `12_…md`, applying `DR-C10-S8-1`'s classification rule to every proposed core surface. Residual risk `R3` is assessed at `17_…md` §8. |

### `OUT-7` — The repository topology decision

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-23` | Side-by-side alternative-comparison matrix over the traceable criteria, **each score's evidence cited**, with the DP application's private/closed status appearing as a cited criterion input | **pass** | `14_…md` §4 (the scored comparison over `K1` … `K9`, decisive criterion `K4`) and §3.2 (the private/closed status as criterion input (b), alongside `NEU-850`'s `OUT-6`). Selected: `T2`, the split-visibility workspace. |
| `G-24` | A migration-path walk for the selected topology from today's single-package repository | **pass** | `14_…md` §6 — steps `M1` … `M10`, including `M5` (which makes `NEU-850`'s `OUT-6` executable, since the core is not consumable as a dependency today — `F-S9-3`) and `M10` (the cloud business layer's own repository). |
| `G-25` | A rejected-alternatives record with the **consequence that decided each**, including the eliminated fully-public monorepo | **pass** | `DR-C10-S9-1` — all six required sections, each rejected alternative carrying the consequence that eliminated it, the fully-public monorepo included. Revision trigger 2 was subsequently **answered `No`** by `SUB-10 (NEU-984)` at `03efe1d` (`17_…md` §10, `EP-4`). |
| `G-26` | A C003-reconciliation record for **NEU-850's `OUT-6` and `OUT-7`** — consumed, **overlap stated as partial**, no amendment or a routed amendment with contradicting evidence named | **pass** | `14_…md` §7 (both consumed with their sources), **§7.1 "The overlap is partial"** — `NEU-850`'s `OUT-7` binds the cloud business layer and does not name the DP course application, whose placement is this charter's own `OUT-7` — and §7.2 **"No amendment routed"**, with one mechanical note filed as `OI-S9-3` (owner `NEU-850`) rather than as an amendment. Restated gitignore-independently at `17_…md` §5, §5.1. |

### `OUT-8` — Architecture-material technology selections

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-27` | A decision record per in-scope choice with rejected alternatives and the evidence that decided it, **including one build-versus-reuse-versus-adopt record per architecture-material capability** | **fail** | The first half passes: **24 / 24** decision records carry all six required sections (`16_…md` §4.1). The second half does **not**. The make-or-reuse list stays **closed at four** while `DR-C10-S2-2` keeps a **fifth** architecture-material capability — the authoring-time execution environment, whose isolation boundary the host can terminate. `15_…md` §8.6 states the disposition verbatim: *"`OUT-8`'s make-or-reuse requirement is left undischarged for the authoring-time execution environment. This is declared, not absorbed."* This is the charter's accepted warning `F5.9`. → **`CAP-S12-2`**, owner **`NEU-896`**. `17_…md` §7.2. |
| `G-28` | Application of the classification rule to a sample of choices, **including at least one the charter did not enumerate** | **pass** | `13_…md`; `DR-C10-S15-1` states the architecture-material rule and applies it to a sample including choices outside the charter's enumeration, with the non-material ones explicitly declined. `13_…md:691` records **zero** frameworks or libraries selected — the correct outcome of the rule, not an omission. |
| `G-29` | A **production-compatibility assessment** of the deployment-shape choice against the single-instance and in-memory-state facts | **pass-with-qualification** | `15_…md` §9, bound to verified facts — single self-hosted VPS, unversioned off-repo compose stack, no Dockerfile, no IaC, no rollback, auto-deploy from `develop`, auto-migrate on boot, process-local in-memory state, no metrics, non-probing health endpoint; `DR-C10-S10-2`. **Qualification:** three facts in the assessment return **"cannot be determined"** against `CAP-S10-1` (the operator facts are not discoverable in the repository and no interactive channel existed); `CAP-S10-2`, `CAP-S10-3` and `CAP-S10-4` bound the rest of the operational envelope. The cold reader's summary is the honest one: *"I could stand up the process; I could not operate it."* |

### `OUT-9` — The execution-environment question is closed, not inherited

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-30` | A reconciliation record citing the **specific NEU-890 decisions** relied on for each of the three conclusions | **pass** | `03_…md` §1 and §4 — each of the three conclusions cites the NEU-890 decision it rests on, with the inference explicitly barred in the one direction that would smuggle a learner-facing runner back in (`03_…md:45`). |
| `G-31` | Confirmation that **no requirement anywhere** in the package assumes an in-app judge or captured keystrokes | **pass** | `03_…md` §2's absolute statement, and — graded independently by a sibling sub-task — `16_…md` §7, Audit D, **PASS**: **120** candidate hits swept across five forbidden classes (*in-app judge* 7, *captured keystrokes* 7, *keystroke- or timing-based authorship inference* 6, plus the remainder), **every one dispositioned** at §7.2, zero surviving as a requirement. |
| `G-32` | Placement of the **drift-verdict component** in the `OUT-1` component model and its **verdict store** in the `OUT-3` authority matrix | **pass-with-qualification** | `CMP-S4-17` is placed in `05_…md` §3 with an out-of-band trust boundary `BND-S4-3` and an explicit prohibition on the corpus walk; `SC-S3-33` and `SC-S3-34` are placed in the matrix at `10_…md`. **Qualification:** the store's **authority** is exactly what `F-S10-6` contests — `DR-C10-S6-1` says the MCP core is the exclusive writer of all 45 categories, and `10_…md:227` calls `CMP-S4-17` the cache's "only writer", *"and neither artifact acknowledges the other on this point."* The placement holds; the authority is unsettled. `17_…md` §7.3. |

### `OUT-10` — A spike register in which every spike is first-class, quarantined and expiring

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-33` | A repository audit proving **no spike artifact** landed in `src/` or in any tracked path other than the package | **pass** | `16_…md` §6.3 — **PASS, zero escapes**; §6.4 — distribution-line leakage **PASS, zero**. Graded by a sibling sub-task over the repository, not asserted by the spikes' authors. |
| `G-34` | A justification review of each spike against the **"could this have been read instead?"** test | **pass** | `16_…md` §6.1 — **PASS**: **4** spike records, **4 / 4** carrying all 13 required fields including a mandatory expiry, **0** expired, **136** spike citations with **0** dangling. §6.2 records that SUB-10 disclosed four candidates, **withdrew three under the read test** and capped the fourth — the test working as designed. |
| `G-35` | An audit that **every uncertain-and-material claim** resolves to a spike record or a caps-register entry, **with the count of each reported** | **capped** | Not answerable with cited evidence from inside this charter. SUB-11 self-disclosed the limit: the claim is evidenced **qualitatively** — 121 `[unconfirmed]` markers, 4 spike records, 136 spike citations with 0 dangling, and (at closure) 28 owned caps — but **never as a per-marker matched/unmatched count**, and no published artifact carries one. Producing it now would mean re-running an audit this sub-task is barred from re-running, over 121 markers in sixteen merged chapters. → **`CAP-S12-3`**, owner **`NEU-896`**. |

### `OUT-11` — Numbered, tolerance-bounded stand-in assumptions handed to NEU-896

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-36` | A completeness audit that every stand-in assumption carries a **package reference, a re-validation trigger and a tolerance envelope** | **pass** | `16_…md` §4.1 — stand-in entries with package ref + envelope + trigger + status: **5 / 5**, **4 packages**, expected 5 / 5, **PASS**. `93_…md` is closed at five and is absent from this sub-task's change set entirely. |
| `G-37` | A decision-level check that **every decision resting on a stand-in names it in place** | **pass** | Each of the five stand-ins is cited **outside** the register — in **22, 9, 39, 26 and 21** package files respectively — so none is appendix-only. `SC-S3-43`, `SC-S3-44` and `SC-S3-45` carry `assumed — A-27 / A-29 / A-28` in the matrix itself; `CAP-S15-2` names `A-27` as the sole support for all three of SUB-15's decisions. |
| `G-38` `†` | The **NEU-896 handoff list** reviewed for coverage against the assumptions table | **pass `†`** | `17_…md` §3 — **exactly five entries**, `A-25` … `A-29`, each with its tolerance envelope, invalidating outcome and re-validation trigger; **zero** non-stand-in items on it. Non-stand-ins are on the separately headed list at §4. **Self-graded:** SUB-12 wrote the handoff list and is here grading its coverage. |
| `G-39` `†` | Presence of **both** the circularity and the C003-collision findings as **named records** | **pass `†`** | The NEU-893 circularity is `F-S1-1`, filed by `SUB-1 (NEU-971)` — independently graded — and updated at closure with which inputs were **assumed rather than derived** (`17_…md` §6.1). The C003/NEU-850 decision-ownership collision is **`F-S12-1`**, deliberately left to this sub-task by `02_…md` § SUB-1's preamble and filed here (`17_…md` §5). **Self-graded** on the second half. |

### `OUT-12` — The package ships in the C005 house style, standalone and cold-readable

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-40` `†` | Package-completeness gate **answered item by item with cited evidence** | **pass `†`** | This file. 61 items, one row each, each carrying a citation resolving into `docs/research/` or a `CAP-S12-*` id with one named owner. **Items marked passing without a citation: 0.** **Self-graded** by construction — no other party can grade a gate this sub-task solely owns. |
| `G-41` | A cold-read review by an independent implementation agent working only from the published package, who must **reach the boundaries, authorities and topology without asking a question** | **fail** | Performed and recorded at `17_…md` §2, with the isolation enforced stated (§2.2) and the reader's own disclosure about that isolation's limit quoted verbatim (§2.3). Verdict, verbatim: *"**No. I could not start implementing from this package without asking a question.** … I would be blocked by contradictions about who writes state, which is the one thing an architecture package exists to settle."* Seven blocking questions, recorded verbatim at §2.6. → **`CAP-S12-1`**, owner **`NEU-896`**. `CAP-S11-1` is **lifted** — the test was run — and lifting it does not mean the package passed it. |
| `G-42` | A citation audit that **every codebase claim resolves to a real path** and **every upstream claim carries a version or date** | **fail**, plus one capped sub-clause | First half — `16_…md` §5.1, **FAIL**: 1,420 citations extracted, 1,248 resolve, 11 are by-design non-claims, **161 genuine non-resolvers**, of which **159 are one mechanism** in two opposite directions (129 spurious `../`, 30 one `../` short, 2 bare upstream filenames). Twelve of sixteen sub-tasks represented; 0 overruns; 7/7 commit refs resolve. Decided rather than repaired in **`DR-C10-S12-2`**; enforcement is **`OI-S12-1`**, owner `NEU-896`. Second half — `16_…md` §5.7 and §10 item 7: **30 undated upstream references**, and whether they were intended to rely on `00_…md` §7's provenance table or were simply undated is **undeterminable, with no author nameable** → **`CAP-S12-4`**, owner **`NEU-896`**. |

---

## 3. Group B — `OUT-12`'s house-style artifact set (10 items)

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-43` | A **README** | **pass** | `README.md`, with the numbering convention and the generic `03_`–`89_` per-document range row. |
| `G-44` | **Per-topic documents** | **pass** | `03_…md` … `17_…md` — fifteen topic chapters, one topic each, plus `00_…md` (method and provenance) and `01_…md` / `02_…md` (the outcome and findings registers). |
| `G-45` | **Decision records with rejected alternatives** | **pass** | `decision-records/` — **24 / 24** carrying all six required sections including rejected alternatives (`16_…md` §4.1, graded independently), plus `DR-C10-S12-1` and `DR-C10-S12-2` added here, both carrying all six. 26 at close. |
| `G-46` | A **traceability set** | **pass-with-qualification** | `traceability/` — 14 files at SUB-11's cutoff, **15** with `S12_package-closure-coverage.md`; **259** rows audited, **0** resolving outside `docs/research/`. Outcome coverage moves from **10 / 12** to **12 / 12** as `S12_` carries the `OUT-11` and `OUT-12` rows. **Qualification:** there is still **no `S1` file**, and `F-S11-3` explicitly forbids writing one — *"the answer is not 'write the two missing rows'"* — because SUB-1's coverage cannot be authored by another party. The structural cause (`traceability/README.md:7` declares the folder's shape without writing a file for it) is unrepaired. |
| `G-47` | An **open-items / provisional register** | **pass-with-qualification** | `90_…md` — **27** distinct ids, **14 open / 13 closed**, every open one naming an owner (`17_…md` §4.1). **Two qualifications.** (a) `OI-S3-1`'s closure condition was **unsatisfiable as written** — it required the matrix to resolve a column `04_…md` §2 defines as recording a question, and `04_…md` §6 proves no ownership column exists; it is restated at `17_…md` §4.3 **without editing SUB-3's entry**, and its owner moves to `NEU-896`. (b) Five open items name an owning sub-task that is **merged and closed**, so "owner" there means the sub-task as residual **co-named `NEU-896`**, never a live assignee. |
| `G-48` | A **caps-and-incomplete-scope register with a single named owner** per cap | **pass-with-qualification** | `91_…md` — **28** caps at close (23 existing + `CAP-S12-1` … `CAP-S12-5`), **every one with exactly one named owner**. Duplicates reconciled without renumbering: `OI-S1-3` → `CAP-S10-1` and `OI-S2-1` → `CAP-S10-2` are recorded as conversions, not as new ids. **Qualification:** `CAP-S4-1`'s **sighting count is inconsistent across merged files** — `16_…md` §6.2 places it at its **seventh** (`91_…md:297`) and deliberately adds no eighth, while `15_…md` §5.4 and `90_…md` § SUB-10 each call it an **eighth**. This gate records the divergence, records the cap as **not lifted on either reading**, and **does not adjudicate the count** — adjudicating would mean editing a merged file's claim. |
| `G-49` `†` | A **risk register with severity and mitigation status** | **pass `†`** | `17_…md` §8 — the charter's ten risks restated in full (the charter is gitignored), each with severity and a mitigation status drawn from a stated three-value scale, and each non-mitigated status naming its residual and that residual's owner. Totals: 2 Critical, 3 High, 4 Medium, 1 Low; **mitigated 5, partially mitigated 3, open 1, split 1**. **Self-graded.** |
| `G-50` `†` | **Success measures** | **pass `†`** | `17_…md` §9 — eight measures `SM-1` … `SM-8`, each observable and each calibrated against **where it stands today** rather than stated aspirationally (e.g. `SM-2` is **0 of 26**; `SM-7` is **161 failing**). **Self-graded.** |
| `G-51` `†` | **Evolution paths** for the selected architecture | **pass `†`** | `17_…md` §10 — six paths `EP-1` … `EP-6`, each naming its trigger, its precondition and its cost, including the two that are **breaking** (`EP-3`) or currently **blocked** (`EP-2`, by `CAP-S10-3`). **Self-graded.** |
| `G-52` | **Standalone** — a reader with access to nothing but this repository's tracked tree can reconstruct every decision, its evidence and its rejected alternatives from the package alone | **fail** | The property was tested rather than asserted, and the test is `G-41`'s cold read. It **failed**: the reader reconstructed the topology cleanly and the boundaries almost cleanly, and was blocked on **who writes state**. Three concrete durability defects are named: 161 citations that do not resolve, ~60 legitimately-outward `../C005-*` / `../C009-*` references a cold reader **cannot distinguish** from the broken ones, and citations into the gitignored charter review log — *"`F5.5` cited twice and never restated"*. The third is **closed here** (`17_…md` §7.6 restates all ten review warnings in full); the first two are not. → **`CAP-S12-1`** and **`OI-S12-1`**, owner **`NEU-896`**. |

---

## 4. Group C — the eight reads this file's stub enumerates, plus the QA no-op (9 items)

| # | Item | Disposition | Evidence / cap |
| --- | --- | --- | --- |
| `G-53` `†` | `01_outcome-register.md` **and** the `traceability/` set — every one of `OUT-1` … `OUT-12` covered, every row's evidence resolving into `docs/research/` and **never** into `_local/` or `docs/wf-plans/` | **pass-with-qualification `†`** | Coverage **12 / 12** at close; **0** of 259 rows resolve outside `docs/research/` (`16_…md` §4.1). Package-wide, **54** lines name a gitignored tree and **every one is an assertion about those trees' unreadability**, which `00_…md` §3 expressly permits — *"naming `_local/` … in order to state that they are unreadable … is not a violation"*. **Qualification:** `01_…md` itself publishes the **superseded** figures in **11 places with no forward pointer** (`F-S11-5`) — `OUT-6`'s 45/42, a **miscount**; `OUT-7`'s 165 / ~25,200 / 197, **stale**. The register is merged and SUB-1's two permitted restatement edits are spent, so the correction is a **forward pointer** (`17_…md` §7.1 and §13), not an edit. **Self-graded** on the 10 / 12 → 12 / 12 half, which this sub-task's own `S12_` file closes. |
| `G-54` | `decision-records/` — **every record carrying all six required sections**, rejected alternatives included | **pass** | **24 / 24** graded independently (`16_…md` §4.1); `DR-C10-S12-1` and `DR-C10-S12-2` added here, both carrying all six. |
| `G-55` | `93_stand-in-assumption-register.md` — **exactly five** entries, four packages, zero entries missing a required field; **closed**, a sixth entry itself a gate failure | **pass** | **5 / 5**, 4 packages, 0 missing fields (`16_…md` §4.1). The cold reader checked it unprompted and called it *"exemplary … I checked all five; the claim is true"*. **No sixth entry exists, and this sub-task did not append one — `93_…md` is absent from this change set entirely.** |
| `G-56` | `90_…md` — **every entry with an owner and an observable resolving event** | **pass-with-qualification** | As `G-47`. Every one of the 27 entries carries an owner; the 14 open ones are tabulated with theirs at `17_…md` §4.1. **Qualification:** `OI-S3-1`'s resolving event was **not observable as written** — half of it is an implementation act, not a documentation act — which is why no C010 sub-task could discharge it; restated at `17_…md` §4.3. |
| `G-57` | `91_…md` — every cap with a named owner; **duplicates reconciled by SUB-12, without renumbering** | **pass** | 28 caps, one named owner each. Reconciliation performed and recorded (`17_…md` §7.5, §12): the `CAP-S4-1` sighting divergence recorded without adjudication, `CAP-S10-1` / `CAP-S10-2` recorded as conversions of `OI-S1-3` / `OI-S2-1`, `CAP-S11-1` lifted with its record, and `CAP-S16-1` explicitly **not** lifted. **Entries renumbered: 0. Entries reflowed or amended: 0. Deletions: 0.** |
| `G-58` | `92_…md` — every record with a **mandatory expiry**, a justification against the read test, an **observable-event** exit condition, and **no artifact under `src/`**; every uncertain-and-material claim resolving to a spike record or a cap, with the count of each reported | **pass-with-qualification** | First half **pass**: `16_…md` §6.1 (4 / 4, all 13 fields, 0 expired) and §6.3 (**zero escapes**). **Two qualifications.** (a) The final clause is `G-35` and is **capped** as `CAP-S12-3`. (b) `F-S6-5` records that `92_…md:7` and `:134` **claim the register is empty of results while it holds four spike records** — a self-contradiction inside the register, filed and unrepaired; the cold reader hit it independently. **This sub-task files no `SPK-S12-*` record and adds no section**: not one of its questions fails the read test, and the cold read is a review, not a spike — no code written, no artifact quarantined, no expiry (`17_…md` §12). |
| `G-59` `†` | `02_…md` — **both named findings present**: the NEU-893 circularity (`F-S1-1`, SUB-1) and the C003/NEU-850 decision-ownership collision with its settled disposition and any routed amendment (**SUB-12's own to file**) | **pass `†`** | `F-S1-1` present and independently authored. **`F-S12-1`** filed here, carrying all three constraints as **consumed** with their sources, **three "no amendment routed"** dispositions with the two rejected candidates and the bar each failed, `OUT-7`'s overlap stated as **partial**, and `NEU-35` noted as the pre-existing duplicate (`17_…md` §5). **Self-graded** on the second finding. |
| `G-60` `†` | `NEU-985 (SUB-11)`'s mechanical audit results, **consumed rather than re-run** | **pass-with-qualification `†`** | All four verdicts consumed unchanged and none re-run: traceability **PARTIAL**, citations **FAIL**, spike register and quarantine **PASS**, no-in-app-judge sweep **PASS**; the label↔id sub-audit's **38** genuine mis-pairings consumed with its per-owner tally intact (`17_…md` §7.1, §13). **Qualification:** one predecessor's own verification record cannot be consumed at all — `NEU-983 (SUB-9)` merged with an unidentified `PARTIAL`, and verification records live in the gitignored `_local/` tree, so **the criterion it attaches to is unrecoverable from the published package**. This gate does not invent one → **`CAP-S12-5`**, owner **`NEU-896`**. **Self-graded** on the consumption discipline. |
| `G-61` `†` | The **QA no-op** recorded honestly, claiming no QA pass | **pass `†`** | **`qa-execution:engine` is unconfigured** in this repository — the active capability registry is `git, linear`, and no registered capability owns the `qa-execution` surface. Under Core Article 8 (core never requires a capability) that is a **genuine no-op**, not a skipped gate: it is recorded as `CAP-S1-3`, and **no QA pass is claimed by this gate, by `17_…md`, or anywhere in this package.** No QA report artifact was produced, because none could honestly be. **Self-graded.** |

---

## 5. The tally

| Disposition | Count | Share |
| --- | --- | --- |
| **pass** | **40** | 65.6 % |
| **pass-with-qualification** | **15** | 24.6 % |
| **fail** | **5** | 8.2 % |
| **capped** | **1** | 1.6 % |
| **Total** | **61** | |

**Items answered with a citation resolving into `docs/research/`: 55** (40 + 15).
**Items marked passing without a citation: 0.**
**Items not passing: 6** — five fails and one cap.
**Self-graded (`†`): 10 of 61.**

### 5.1 The six items that do not pass, and who owns each

| Item | Why | Cap | Owner |
| --- | --- | --- | --- |
| `G-3` | The cold reader could not name two of seventeen boundaries' owners, and asked seven questions. | `CAP-S12-1` | **`NEU-896`** |
| `G-27` | `OUT-8`'s make-or-reuse record is undischarged for the fifth architecture-material capability (`F5.9`). | `CAP-S12-2` | **`NEU-896`** |
| `G-35` | No per-marker matched/unmatched count of uncertain-and-material claims exists, and producing one means re-running an audit this sub-task is barred from re-running. | `CAP-S12-3` | **`NEU-896`** |
| `G-41` | The cold read returned **negative** — verbatim, *"No. I could not start implementing from this package without asking a question."* | `CAP-S12-1` | **`NEU-896`** |
| `G-42` | 161 citations do not resolve; and whether the 30 undated upstream references are convention or omission is undeterminable with no author nameable. | `CAP-S12-4`; enforcement `OI-S12-1` | **`NEU-896`** |
| `G-52` | The standalone property was tested by the cold read and failed on the "reach without asking" half. | `CAP-S12-1`, `OI-S12-1` | **`NEU-896`** |

**Five caps, `CAP-S12-1` … `CAP-S12-5`, each with exactly one named owner, all `NEU-896`.** They converge
on one owner not by default but because each is discharged by a decision or a pass that **no party
inside C010 holds**: five of the cold read's seven questions name merged-and-closed owners, the registers
are append-only, the make-or-reuse decision belongs to no sub-task in this charter, and two of the five
require reading a tree that is not published.

### 5.2 What the shape of this result means

The gate's failures cluster in one place, and the cluster is the finding. `G-3`, `G-41` and `G-52` are
**one** result seen three times — the independent reader was blocked. `G-42` and `G-27` are documented,
long-standing, already-filed defects that no pass repaired. Not one failure is an analytical error in a
decision: every architecture decision this package makes survives its own gate item.

The cold reader put it better than this gate can, and it is quoted rather than paraphrased:

> The failure is not analytical, it is **integrative**: sixteen sub-tasks each did careful work, recorded
> their conflicts faithfully in `02_findings-register.md`, and **no pass reconciled them**. … **It is a
> package that has been audited but not edited.**

Filed as **`F-S12-4`**. The remedy it names is small and specific, and it is `NEU-896`'s: *"a single
reconciliation pass over the seven questions above, and one correction to `01_outcome-register.md` adding
a forward pointer to `F-S8-1`."*

---

## 6. What this gate did not do

Stated plainly, because a gate's boundary is part of its result.

- **It made and revised no architecture decision.** Every failing item routes to a named owner or becomes
  a cap. Not one finding was closed by editing it away.
- **It re-ran none of `NEU-985 (SUB-11)`'s four audits**, and re-measured none of their figures.
- **It re-decided no `NEU-850` consumed constraint** — `OUT-2`, `OUT-6` and `OUT-7` are reported with the
  dispositions their owning sub-tasks settled, and nothing more.
- **It edited no merged sibling chapter, and renumbered, reflowed or amended no register entry.** The
  three shared registers received an appended `### SUB-12` section below every existing one; `93_…md`
  received nothing and is absent from the change set.
- **It performed exactly one repair**, and it is outside the package: four rows added to
  `docs/GLOSSARY.md` for `state category`, `read-projection`, `write-intent` and
  `split-visibility workspace`, discharging `F-S11-6` by action because all four coining sub-tasks are
  merged and closed and the glossary's own `isolation invariant` row pointed at a term it did not define.
  The reasoning, and why the other citation and label defects were **decided rather than repaired**, is
  `DR-C10-S12-2`.
- **It claims no QA pass**, and it claims no external-user or expert validation for anything in this
  package. Every signal here, the cold read included, is a **proxy signal** under `00_…md` §1.1.

---

## Preserved: the reservation this gate was answered against

The three paragraphs below are SUB-1's original reservation, kept verbatim so a reader can check the
answer against the instruction rather than against this sub-task's paraphrase of it.

### Why the location was reserved rather than created later

So that **no sub-task invents another one.** Fifteen sibling sub-tasks read this directory off `origin/develop`; if the gate had no declared home, two of them could each create a plausible one — `95_completeness.md`, `gate.md`, `traceability/gate.md` — and the package would ship with two partial gates and no single answer. The filename is part of SUB-1's deliverable for the same reason the package path is.

`95`–`99` remain free for further package-level registers. See the README's numbering convention.

### What SUB-12 must do here

**Answer the charter's completeness checklist item by item, each with cited evidence.** Not a summary, not a percentage, not a pass mark — one answer per item, each pointing at the document, decision record or register entry that discharges it.

**An item that cannot be so answered is recorded as a cap in `91_caps-and-incomplete-scope.md` with a named owner — never marked passing.** That routing is the gate's whole point: the alternative to a cited answer is an owned admission, not a benefit of the doubt.

The gate reads, at minimum:

- `01_outcome-register.md` and the `traceability/` set — every one of `OUT-1` … `OUT-12` covered, every row's evidence resolving into `docs/research/` and **never** into `_local/` or `docs/wf-plans/`.
- `decision-records/` — every record carrying all six required sections, rejected alternatives included.
- `93_stand-in-assumption-register.md` — exactly five entries, four packages covered, zero entries missing a required field. **Closed**; a sixth entry is itself a gate failure.
- `90_open-items-and-provisional-register.md` — every entry with an owner and an **observable** resolving event.
- `91_caps-and-incomplete-scope.md` — every cap with a named owner; duplicates reconciled by SUB-12, **without renumbering**.
- `92_spike-register.md` — every record with a mandatory expiry, a justification against the "could this have been read instead?" test, an **observable-event** exit condition, and no artifact under `src/`; every uncertain-and-material claim resolving to a spike record or a cap, with the count of each reported.
- `02_findings-register.md` — both named findings present: the NEU-893 circularity (`F-S1-1`, filed by SUB-1) and the C003/NEU-850 decision-ownership collision with its settled disposition and any routed amendment (**SUB-12's own to file**).
- `NEU-985 (SUB-11)`'s mechanical audit results, consumed rather than re-run.

**`qa-execution:engine` is unconfigured** in this repository (`git, linear`). The gate records that as a genuine no-op — see `CAP-S1-3` — and **claims no QA pass**.

### What SUB-12 must not do here

- **Not** promote its own work to passing. A producing task does not grade its own artifact; the cold-read review `OUT-12` requires is by an independent reader working only from the published package.
- **Not** answer an item by citing `_local/` or `docs/wf-plans/`. A cold reader cannot open either.
- **Not** renumber anything while reconciling. Merging duplicates is reconciliation; renumbering breaks every citation written against the namespaced ids.

---

## 7. Independent re-grade of the ten self-graded rows — NEU-990

**Appended by:** NEU-990 · **Appended:** 2026-08-23 · **Model:** claude-opus-5[1m]
**Cutoff:** `0425633` (`origin/develop`) — **not** SUB-12's `3352c00`. See §7.5.
**Reasoning:** `decision-records/DR-C10-N990-1_independent-regrade-of-the-self-graded-rows.md`
**Findings filed:** `F-N990-1` … `F-N990-4` (`02_findings-register.md` § NEU-990)

§1.2 named the ten `†` rows the weakest evidence class in this package and instructed a converging
reader to check them directly. SUB-12 named that re-grade as an open next action rather than
performing it — correct handling, and not a substitute for the re-grade. **This section performs it.**

**Nothing above this line is edited.** Every original disposition, every `†` marker and the
`† count: 10 of 61` line stand exactly as SUB-12 wrote them. The delta between a self-grade and an
independent grade is the evidence this section exists to produce, and overwriting the self-grade
would destroy it.

### 7.1 The isolation actually enforced — stated so it can be judged, not so it looks strong

The reader was a **freshly-spawned agent inheriting none of this run's context** — deliberately not a
context-inheriting fork, which would not be an independent reader at all. It was given the ten items'
**wording** and §1.1's four-disposition rubric, and told to locate the evidence itself. It was
**barred** from the repository source tree, `_local/`, `docs/wf-plans/`, `docs/GLOSSARY.md`, every
`docs/` path outside this package, `git` in any form, the tracker, the web, and from spawning
subagents of its own.

**Blinding.** Because `94_…md` carries the very grades under review, the reader was barred from it for
**Stage 1** — the nine rows gradable without it. `G-40` is a claim *about* this file and cannot be
graded otherwise, so it was graded **last**, in a **Stage 2** with the nine Stage-1 verdicts already
written and frozen.

**Three leaks, all of them real:**

1. **A staging slip, self-disclosed by the reader unprompted.** While probing `G-61` it ran a
   corpus-wide case-insensitive grep for `qa` **without excluding `94_…md`**, and two lines of this
   file came back — including `G-61`'s own row with its original disposition `pass †`. The reader
   states its `G-61` reasoning was already assembled from some eighteen independent citations before
   that grep ran, and that its verdict matched what it already held, but that it *cannot prove the
   verdict was unanchored*. **`G-61` therefore carries a disclosed contamination risk; the other
   eight Stage-1 rows do not.** It is recorded here rather than quietly re-run, because a re-grade
   that concealed its own contamination would refute itself.
2. **A structural leak the task design did not anticipate: this package cannot be used to blind-grade
   itself.** `traceability/S12_package-closure-coverage.md` is a legitimate corpus file and it
   republishes this gate's aggregate tally — 61 items, 40 / 15 / 5 / 1, *"Items marked passing
   without a citation: 0"* — and names `G-3`, `G-41`, `G-52` as failing and four of the ten rows as
   carrying `†`. Any reader given the published package therefore learns the shape of the answer
   before grading a single row. Filed as **`F-N990-3`**.
3. **Harness injection, not chosen and not preventable.** The reader's context received the
   repository's own instruction files, an environment block naming a *different* working directory
   with its git status and recent commit subjects, a tool listing of roughly 130 entries, an agent
   listing and a skill listing. The reader reports that none of it carried C010 package content or
   any gate disposition. This is the same class of leak SUB-12 disclosed at `17_…md` §2.3.

**Weaker than SUB-12's pattern on one axis, stronger on another — stated rather than glossed.**
`F-S12-2` records that SUB-12's cold reader was pointed at *"a filesystem copy holding only the 63
published package files"*. **This reader was pointed at the package in place**, inside a live
worktree, so the repository tree sat two directory levels away and every bar was **honoured rather
than enforced**. Against that, this reader was **blinded to the dispositions under review**, which
SUB-12's design had no need of. Isolation here is **by instruction over an unrestricted tool
surface**. It is **strong but not hermetic**, exactly as SUB-12 said of its own, and the result is a
**proxy signal** under `00_…md` §1.1 — not external validation.

### 7.2 The ten rows: self-grade beside independent verdict

| # | Self-grade (SUB-12) | Independent verdict | Delta | Re-disposition |
| --- | --- | --- | --- | --- |
| `G-38` `†` | **pass** | **pass-with-qualification** | **differs — harsher** | **Re-dispositioned to `pass-with-qualification`.** See §7.3. |
| `G-39` `†` | **pass** | **pass** | confirmed | none |
| `G-40` `†` | **pass** | **pass** | confirmed | none — see §7.4 for a post-hoc weakening |
| `G-49` `†` | **pass** | **pass** | confirmed | none — but see `F-N990-4` |
| `G-50` `†` | **pass** | **pass** | confirmed | none |
| `G-51` `†` | **pass** | **pass** | confirmed | none |
| `G-53` `†` | **pass-with-qualification** | **pass-with-qualification** | confirmed | none |
| `G-59` `†` | **pass** | **pass** | confirmed | none |
| `G-60` `†` | **pass-with-qualification** | **pass** | **differs — more lenient** | **None. The self-grade stands.** See §7.3. |
| `G-61` `†` | **pass** | **pass** | confirmed (contaminated — §7.1) | none |

**Delta: 2 of 10.** Eight rows confirmed at the self-graded disposition. One row is **downgraded**.
One row the independent reader graded **more generously than SUB-12 graded itself**, and the
self-grade is deliberately kept.

**The calibration answer, since that is what this re-grade was commissioned to settle:** on this
evidence SUB-12 was **not** systematically generous to itself. Eight of ten hold; the single
divergence in the generous direction is one row, and the only other divergence runs the *other* way —
SUB-12 graded itself more harshly than an independent reader would. The `†` disclosure was
proportionate to the risk, and the risk was real but small. Filed as **`F-N990-1`**.

### 7.3 The two divergences, and what was done about each

**`G-38` — downgraded from `pass` to `pass-with-qualification`.** The item asks for *"the NEU-896
handoff list reviewed for coverage against the assumptions table."* A review exists and is cited
(`17_…md` §3), so the row is **not** capped — it is answered, and the shortfall is stated:

- **An independently-authored artifact records that the check was never run.**
  `traceability/S11_outcome-coverage-audit.md:65` states verbatim that this clause's third limb *"is
  **not** run here; it is a review, not a mechanical check, and **no C010 sub-task performs it.**"*
  SUB-12 then performed it — as the author of the list under review — and passed it.
- **The tally it leans on audits the wrong artifact.** `16_…md` §4.1 audited `93_…md`'s **own fields**
  (5/5 entries, 4 packages, 0 missing fields). That is not a review of the handoff list *against* the
  register, which is what the item names.
- **The restatement is lossy, and lossy in the narrowing direction.** Diffing `17_…md` §3 against
  `93_…md` — the check the item actually asks for — two of five envelopes do not survive.
  `A-25`'s envelope in `93_…md:66` tolerates the AI call *"**synchronous on a read path**, asynchronous
  anywhere, or batched ahead of time"*; `17_…md` §3 restates it as *"asynchronously or once per
  escalation"*, **dropping two of the three tolerated modes**. `A-26`'s envelope and invalidating
  outcome are restated circularly — *"Any budget the stated envelope contains"* and *"A budget the
  AI-placement decision's envelope cannot contain"* — where `93_…md:81` and `:83` state three concrete
  limbs and a concrete invalidating outcome.

**No cap is filed for this**, and the reason is the gate's own rule: the item is answered with a
citation, so the correct disposition is the qualified pass, not an owned admission. **`93_…md`
remains the authoritative register and is unharmed** — it is untouched by this task and by SUB-12's.
What is defective is a *restatement* on the surface NEU-896 reconciles against, and that is a finding,
not a scope limit. Filed as **`F-N990-2`**, handed to **`NEU-896`**. Repairing `17_…md` §3 in place is
not open to this task for the reason `F-N987-1` states: routing a cross-chapter defect worked in this
package and closing one never existed.

**`G-60` — the independent verdict is `pass`; the self-grade `pass-with-qualification` is kept.** The
reader's point is substantive rather than generous: `G-60`'s item names *"`NEU-985 (SUB-11)`'s
mechanical audit results, consumed rather than re-run"*, and the qualification SUB-12 attached —
`CAP-S12-5`, `NEU-983 (SUB-9)`'s unidentified verification `PARTIAL` — attaches to a **verification
record in a gitignored tree**, which is not one of SUB-11's four mechanical audits. The reader found
no re-run and no re-derived figure, and named `17_…md` §7.5's refusal to adjudicate `CAP-S4-1`'s
sighting count as the strongest positive sign of consumption rather than re-measurement.

**The disposition is nonetheless not upgraded.** Upgrading a row because an independent reader was
*kinder* than its author is the one direction in which this exercise could manufacture an unevidenced
pass, and `CAP-S12-5` is undisturbed either way — the reader disputes which row the cap attaches to,
not that it stands. The lower of the two dispositions is kept and the divergence is recorded here.

### 7.4 Where the evidence moved after this gate was written

The re-grade reads the package at `0425633`, after three amendments SUB-12 could not have seen. Two
bear on a `†` row and are recorded rather than absorbed:

- **`G-40` is weakened after the fact by `F-N988-1`.** This row's passing claim rests in part on every
  cap carrying *"one named owner"*. `NEU-988` established that `NEU-896` was marked `Done` at
  `2026-08-22T09:11:58.531Z`, two milliseconds behind a *different* item, by an automated sweep — so
  at the moment this gate published, **all five `CAP-S12-*` caps named an owner already in a terminal
  state.** `F-N988-2` adds that only 16 of the register's 28 caps ever named `NEU-896`. The owner was
  *named*; it was not *live*. Both states were restored by `NEU-988` without editing an owner line.
  The row's structural property still holds as written, and the independent count confirms it — but a
  reader converging this gate should read `G-40` together with `F-N988-1`.
- **`G-53`'s independent confirmation is unaffected by `NEU-987` and `NEU-991`.** Neither the
  state-writer adjudication nor `18_neu-982-ceremony-reverification.md` touches `01_…md`'s coverage or
  the traceability set's resolution property.

### 7.5 What the independent count actually reproduced, and what it could not

Reproduced independently, from source rather than from this file's claims: **61 rows, `G-1` … `G-61`,
no gaps and no duplicates**; Group A re-derived from `01_outcome-register.md`'s twelve "Verified by"
clauses as **4, 3, 3, 4, 3, 5, 4, 3, 3, 3, 4, 3 = 42**, matching; dispositions counted at **40 / 15 /
5 / 1 = 61**, matching §5 exactly; **every one of the 61 Evidence cells carries either a citation
resolving in-package or a `CAP-S12-*` id with one named owner**; **rows marked passing with no
citation: 0**, matching §5's claim; five caps, one owner each. For `G-53`, the reader independently
resolved every `_local/` and `docs/wf-plans/` occurrence inside `traceability/` table rows — four of
them, at `S2`, `S9`, `S10` and `S15` — and confirmed each is an **assertion that the tree is
unreadable**, never a citation a reader must follow, reconciling with `16_…md` §4.1.

Four things it could **not** determine, stated rather than smoothed over:

1. Whether any `traceability/` row's citation is among `F-S11-1`'s 161 non-resolvers. The audit
   publishes a per-owner tally only — which the reader summed to exactly 161 — and no per-file one.
2. Whether §1's *"thirteen elements"* in the Group B derivation is right; the reader counts **twelve**
   enumerated elements in `OUT-12`'s success measure. **This affects no row** and no count: Group B
   still delivers ten items after the two documented de-duplications. Recorded as an observation, not
   filed as a defect.
3. Whether `16_…md` §4.1's package-wide *"54 lines name a gitignored tree"* is reproducible. A
   present-day grep returns far more, and SUB-11's match pattern is not published, so the reader
   verified the **property** rather than the count.
4. Whether `18_neu-982-ceremony-reverification.md`'s primary source says what that chapter says it
   says — its evidence root is a file inside a barred, gitignored tree. The chapter restates its
   content in full and declares the durability rule it is written under, which is the correct
   mitigation, but the claim is not verifiable from inside the published package.

### 7.6 QA, and what this section did not do

**`qa-execution:engine` and `qa-execution:host` are unconfigured in this repository.** The active
capability registry was read mechanically during this task and holds exactly **`git`** and
**`linear`**; neither owns the `qa-execution` surface. Under Core Article 8 that is a **genuine
no-op**, not a skipped gate. **QA is NOT RUN, no QA report artifact exists, and no QA pass is claimed
by this section, by this file, or anywhere in this package.** The audit capability is likewise
unregistered, so the five verify lenses have no dispatch target and correctly did not run. Given that
this section's entire subject is grading integrity, a fabricated gate result here would refute the
section that contained it.

Also stated plainly, because a re-grade's boundary is part of its result:

- **It edited no original disposition, no `†` marker, and no merged sibling chapter.** Deletions from
  this file: **0**.
- **It re-graded only the ten `†` rows.** The other 51 are untouched and unreviewed by this task.
- **It filed no cap**, because no divergence required one — the one downgrade is answered with a
  citation, which is the gate's own evidence-backed form. `91_caps-and-incomplete-scope.md` is
  therefore **absent from this change set**, stated rather than omitted.
- **It added no stand-in assumption.** `93_…md` stays closed at five, `A-25` … `A-29`, and is absent
  from this change set.
- **It performed no package-wide citation sweep** — that is `NEU-989`'s, and a partial sweep here
  would collide with it. Every citation *this section* writes resolves from this file's own directory.
- **It renumbered, reflowed and re-sequenced nothing**, and introduced no global counter. New ids are
  in the `N990` namespace, following the `N988` / `N987` precedent for a non-sub-task amender.

### 7.7 The tally after the re-grade

The original tally at §5 is **not** rewritten. This is the second tally, and the two are meant to be
read together.

| Disposition | §5 (SUB-12) | After re-grade | Change |
| --- | --- | --- | --- |
| **pass** | 40 | **39** | −1 (`G-38`) |
| **pass-with-qualification** | 15 | **16** | +1 (`G-38`) |
| **fail** | 5 | **5** | — |
| **capped** | 1 | **1** | — |
| **Total** | 61 | **61** | — |

**Items answered with a citation resolving into `docs/research/`: 55** — unchanged; a downgrade from
`pass` to `pass-with-qualification` moves a row between two *answered* classes and does not change how
many items are answered. **Items marked passing without a citation: 0** — re-checked independently and
confirmed. **Items not passing: 6** — unchanged; §5.1's table and its five caps stand exactly as
written. **Independently re-graded: 10 of 61. Confirmed 8, downgraded 1, self-grade kept over a more
lenient independent read 1.**
