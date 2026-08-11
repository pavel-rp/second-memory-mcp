# 91 — Caps and Incomplete Scope (shared, package-level)

**Package:** C009 course content quality · **Charter:** C009 (umbrella NEU-890) · **Opened:** 2026-08-10 by **NEU-957 (SUB-1)** · **Writers:** all thirteen sub-tasks, by append · **Reconciled at the end by:** **NEU-969 (SUB-12)** · **Status:** **this file SETS no status.** Status lives in a ledger
**Model:** claude-opus-5[1m]

**What each sub-task did not do, could not do, and deliberately declined to do.** Each entry names a **missing artifact or a bounded limitation with an owner** — reported, never invented (NEU-899 rule 4, inherited). A cap recorded here is not a failure; **a cap that was not recorded is.**

---

## Append convention — read this before writing a single line

> Each sub-task appends its own `### <SUB-id>` section. No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Why it is stated this bluntly.** Up to **three of the thirteen sibling sub-tasks are in flight concurrently**, none of them able to see another's working tree, and **all thirteen** write into this file and into `90_open-items-and-provisional-register.md`. That makes both files **merge-conflict magnets**, and the default resolution — pick one side — silently deletes a sibling's cap. **A cap that is silently deleted is the worst outcome this register has:** the package then reads as more complete than it is, which is exactly the impression the register exists to prevent. Keeping both sides converts that failure into a **visible duplicate** — noisy, harmless, and fixable by one declared owner at the end.

**Duplicates are expected and are not cleaned up in flight.** **NEU-969 (SUB-12) is the declared single owner that reconciles the caps register at the end** — it merges duplicate entries across both shared registers, resolves cross-references, ranks the package's residual weaknesses, and publishes the reconciled result alongside the completeness gate (`92_package-completeness-gate.md`). Until SUB-12 runs, a duplicate entry is correct-by-convention, and any other sub-task that "tidies" one is destroying evidence rather than helping.

**Id namespacing.** Each sub-task ids its own entries `CAP-S<n>-k` (SUB-1's are `CAP-S1-1` … `CAP-S1-6`), so two sections appended concurrently can never collide on an id and no sub-task ever needs to renumber another's.

---

## Entries

### SUB-1 — NEU-957, provenance and rights (OUT-7)

#### `CAP-S1-1` — **no network re-fetch was available or permitted; the re-verification is documentary** · not closable here

| | |
| --- | --- |
| **Cap** | **No network access was available to this sub-task and none was permitted. Zero HTTP requests were issued.** No licence page, terms-of-service document, `robots.txt`, API endpoint or rate-limit header was read on 2026-08-10 for **any** of the twelve sources. **There is therefore no live terms, robots or rate-limit reading for any source at this cutoff.** |
| **What the pass actually is** | A **documentary re-verification**: each of the twelve dispositions was re-read from the recorded C005 files and their recorded evidence, checked for internal consistency against the stricter bar C009 operates under, and re-dated at the 2026-08-10 cutoff. Every "what was checked" cell in `01_provenance-and-rights.md` §1 says so in its own words, so **no row can be mistaken for a live fetch**. |
| **What it costs** | The pass **cannot detect a change made at any source since 2026-07-16**. Its claim is not "nothing changed"; it is "no evidence of change was read, and none could have been". |
| **What it does not cost** | The failure direction is the safe one. Under the restricted-by-default rule (`00_method-and-provenance.md` §4.4) all twelve access rows are recorded **restricted**, so the package is **more** restrictive than the baseline, never less. **An inability to read a source's terms is never read as permission.** |
| **What was refused** | **Fabricating a live fetch result was an absolute prohibition and no such result appears anywhere.** No cell reads "verified 2026-08-10" against a source that was not contacted. Writing one would have made the package look finished and would have planted a false rights record that SUB-3 would consume as a precondition and act on. |
| **Owner** | **the creator** (default, consistent with `CAP-2`'s owner precedent) — surfaced for reassignment |
| **Closes when** | **Network access becomes available to a re-verification pass** and each source's terms are read and dated with a new cutoff. The twelve per-source gaps are filed individually as `OI-S1-1` … `OI-S1-12` in `90_open-items-and-provisional-register.md`. **No fetch outcome, absent `robots.txt`, or unenforced rate limit closes it.** |

#### `CAP-S1-2` — **the permitted-field question is FILED, not decided** · unresolved by design

| | |
| --- | --- |
| **Cap** | Four of the six candidate problem-reference fields — `title`, numeric `constraints`, difficulty signal, curriculum placement — are recorded **NOT ADMITTED on this package's judgment** and are **routed to ledger challenge `CH-F5-1`** against `D-F5`. **This sub-task files that challenge; it does not resolve it**, and `decision-records/DR-C09-01_permitted-field-set.md` sets no status of its own. |
| **Why it is a cap and not a decision** | **A producing task may not promote its own artifact** (`A1`–`A5`). SUB-1 produced the argument, so SUB-1 may not also ratify it. The alternative — admitting the fields locally on charter assumption 19 — would have produced a field set that *looks* adjudicated and that twelve sibling sub-tasks would build citations against, on an assumption that is still **`[unconfirmed]`**. |
| **What binds in the meantime** | **The interim stored set is `stable id` + `canonical URL` only**, binding every C009 sub-task from the moment `01_provenance-and-rights.md` landed. A sub-task needing a wider set cites `CH-F5-1` by id, records its position for **both** dispositions, and carries the unresolved field set as its own cap here. **It never widens locally.** |
| **What is not blocked** | Nothing else in the package depends on the outcome: the dispositions, the access-permission record, the no-text rule and the retention rule are all independent of the field set. That independence is deliberate — it is what makes filing the challenge cheap enough to be the honest option. |
| **Owner** | **NEU-932 (`D-F5`'s owner) / the creator** (default) — surfaced for reassignment |
| **Closes when** | **The foundations ledger records a disposition for `CH-F5-1`** (`OI-S1-13`). |

#### `CAP-S1-3` — **`qa-execution:engine` is unconfigured; the QA-execution phase is a genuine no-op** · not closable here

| | |
| --- | --- |
| **Cap** | This repository's capability registry resolves to **`git, linear`** only. **No `qa-execution:engine` provider is registered.** The automated QA-execution phase is therefore a genuine **Core Article 8 no-op** for this package — **a phase with no provider, not a phase that was skipped, deferred, or waived.** |
| **What is claimed** | **Nothing. No QA pass is claimed, fabricated, or implied anywhere in this package**, and no scenario, run, verdict or report is written as though an engine had executed one. **A QA report for a run that did not happen would be a fabricated result of exactly the kind `CAP-S1-1` refuses for fetches** — the same failure, in a different register. |
| **Why it is the correct outcome here** | This package is a documentation deliverable. It changes no source, no schema, no migration and no runtime behaviour, so there is **nothing a browser or execution engine could exercise**. A QA plan generated for it would be a build/static and document-inspection plan only. |
| **What verification actually is** | **File inspection and `git diff`**, resolved against the task's numbered success criteria: the package file set exists and is non-empty, every file carries its `**Model:**` attribution, the protected C005 files show no diff, and the one cross-package ledger edit is **additions-only**. The repository's own gates (`pnpm run type-check`, `pnpm run lint`) are recorded as **no-regression checks only** — `lint`'s scope is literally `src tests` and it never sees `docs/`, so a green line there is not evidence about anything in this package. |
| **Owner** | **the creator** — registering a QA-execution provider is a repository-configuration decision, not a sub-task's |
| **Closes when** | A `qa-execution:engine` provider is registered in the capability registry **and** this package acquires runtime behaviour worth exercising. Neither is expected within C009. |

#### `CAP-S1-4` — **the self-check and the scans were run by the task that produced the artifact** · mitigated, not closed

| | |
| --- | --- |
| **Cap** | `01_provenance-and-rights.md` §9's rights checks — including the two **new** ones, `RC-7` (the completed per-source access-permission record) and `RC-8` (the stated retention disposition) — and §10's repository scan were **run by SUB-1 against SUB-1's own package**. An author checking its own completeness shares the author's blind spots by construction. |
| **Mitigation, not a fix** | The **mechanical** half is reproducible by anyone: §10 records each scan's command, date, commit base and outcome, so a reviewer can re-run all five and compare. The **judgment** half — is the disposition set complete? is a rule stated tightly enough to bind? — remains unvalidated by an independent reader. |
| **Owner** | **NEU-969 (SUB-12)** at reconciliation, and any reviewer of the C009 package |
| **Closes when** | An independent reader re-runs the checks and reviews the judgment calls. **`92_package-completeness-gate.md`'s run is the intended occasion.** |

#### `CAP-S1-5` — **the no-text and retention scans are lexical; semantic paraphrase is beyond them** · non-closable by any scan

| | |
| --- | --- |
| **Cap** | The detection methods of `01_provenance-and-rights.md` §5.1 and §6 are **lexical greps**. They prove the **structural absence** of stored statements, problem-level URLs, enumerated id lists and fenced example or response blocks. **They cannot prove that no sentence anywhere is a disguised paraphrase of a protected statement** — and no grep can. |
| **Why it is named rather than papered over** | *Paraphrased into storage* is listed as its own mode in §5 precisely because it is the mode the scan cannot reach. Presenting a lexical pass as mechanical completeness would be the strongest and least honest claim in the package. |
| **Residual** | A **review obligation on every C009 sub-task**, inherited from here rather than discovered later. |
| **Owner** | **SUB-1 (NEU-957)** as residual owner of OUT-7; enforced at review by every sub-task |
| **Closes when** | It does not. It is bounded, not closable — the honest statement of what a scan can and cannot establish. |

#### `CAP-S1-6` — **caps inherited from C005 that this pass does not close**

**Listed so this package's limits are not mistaken for the sources' limits.** None is closable by a documentary re-verification.

| Inherited cap | Why it does not close here | Owner |
| --- | --- | --- |
| **`CAP-2`** — problem-level citations unverified; an entry-level automated fetch returned **HTTP 403** at the prior cutoff. | **No fetch was attempted at this cutoff, so no new information about the 403 exists.** A refusal is evidence of refusal, never of permission. Closing it requires corpus access and per-problem verification — **SUB-3's (NEU-959) work, not SUB-1's.** **This package asserts no problem id.** | the creator / SUB-3 |
| **T2's licence has never been machine-verified** — asserted from the work's stated terms at **two consecutive cutoffs** now. | A documentary re-read cannot verify what was never observed. The disposition (INFORM-ONLY, NC clause disqualifying) is carried forward **undiminished, not downgraded by age**; `OI-S1-2` carries the gap. | the creator (default) |
| **T4's specific catalogue entry ids remain unverified** (`INC-D4`). | Same ground as `CAP-2`: unverifiable without access. **No entry is cited until SUB-3 has resolved it.** | SUB-3 / the coverage-audit owner |
| **`D-F3a` is `unresolved — by design`** — the node schema that will govern stored fields does not yet exist. | Bound when SUB-2 lands in the C005 schema package. This package quotes `D-F3a`'s **inherited field constraint** as the admission rationale for two fields; it does not and may not bind the schema. | SUB-2 (C005 schema package) |
| **The C005 baseline's summary-line arithmetic slip** (`RC-2` and the `D-F5` ledger row summarise 13 dispositions against a 12-source set). | **Recorded, never corrected — this package edits neither the baseline file nor any ledger row in place.** It bears on no per-source disposition. Filed as `OI-S1-14`. | NEU-932 / the creator (default) |

### SUB-2 — NEU-958, content and exercise forms (OUT-1)

**Disambiguation, because the token collides.** `CAP-S1-6` above refers to a **`SUB-2` of the C005 *schema* package** as the owner of `D-F3a`. That is **not this sub-task.** This section is **SUB-2 of charter C009 (NEU-958)**, the form catalogue. The two are unrelated and no entry here binds the C005 schema.

#### `CAP-S2-1` — **the problem-reference field set is CONSUMED, not decided** · unresolved by design

| | |
| --- | --- |
| **Cap** | `02_content-and-exercise-forms.md` §5 specifies the problem-reference form for **both** `D-F5` dispositions, with the **restricted** shape — `stable_id` + `canonical_url` only — as the sole fillable one. It **decides nothing**: the field set is SUB-1's cap, cited by id (`CH-F5-1`, `DR-C09-01`, `CAP-S1-2`) and **never restated or re-derived**. |
| **What this sub-task did not do** | It did not widen the set, did not argue for widening it, and did not treat its own need for richer fields as grounds to widen it. The wider fields appear **only** as `NOT-YET-STORABLE`, offered by no template as fillable and never presented as the current form. |
| **Owner** | **NEU-932 (`D-F5`'s owner) — the creator by default.** A producing task may not promote its own artifact (`A1`–`A5`). |
| **Closes when** | **The foundations ledger records a disposition for `CH-F5-1`.** Not by this catalogue needing the fields, and not by a downstream sub-task deciding it does. |

#### `CAP-S2-2` — **`qa-execution:engine` is unconfigured; the QA-execution phase is a genuine no-op** · not closable here

| | |
| --- | --- |
| **Cap** | This project's capability registry resolves to **`git, linear`** only. **No capability owns the `qa-execution:engine` surface**, so the QA-execution phase is a genuine **Core Article 8 no-op** — core ships a lean default and runs inert when no capability is registered. |
| **What that means, stated plainly** | **No QA pass, scenario, verdict, report or coverage claim is asserted or implied anywhere in SUB-2's output.** The fabrication probe (`dry-run/02_…`) is a **hand-run structural check recorded by the task that ran it** — it is not a QA run and is not presented as one. Fabricating a QA pass to fill the gap would be the same failure class as fabricating a citation. |
| **Owner** | the creator / whoever registers a `qa-execution` capability |
| **Closes when** | A capability owning `qa-execution:engine` is registered **and** a run is actually performed and recorded. Not before. |

#### `CAP-S2-3` — **the fabrication probe is one run by one agent** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | The probe (`dry-run/02_…`) passed **10/10** at its stated condition, with the problem-reference template — the exact `EXC-1` site — returning an explicit refusal in **both** fields, unprompted. That is **one observation, not a distribution.** A single cold-agent run cannot establish that no template can ever induce fabrication. |
| **What this run deliberately could not admit** | A **verified** citation. The charter's OUT-1 wording admits one; this run satisfies that wording **only in its refusal branch**, because "verified" is defined by **SUB-3's** procedure and that procedure does not exist at this cutoff. A produced citation of any kind was therefore scored a failure here. |
| **Owner** | **SUB-3 (NEU-959)** — owner of the second, admitting probe run. |
| **Closes when** | SUB-3 re-runs the probe against a real verification procedure and its result is cited back into this package. |

#### `CAP-S2-4` — **the catalogue defines fields; it sets no bar and no gate** · out of scope by design

| | |
| --- | --- |
| **Cap** | This sub-task defines **what a form is** — its fields and their obligations. It does **not** define how good an instance must be. The correctness standards for `solution`, `proof` and `test` are **SUB-4's**; which gate validates a form, and any severity tier or lint rule, is **SUB-9's (NEU-965)**; the discriminating design of gate-bearing items is **SUB-6's**; exemplars are **SUB-11's**. |
| **The consequence, named rather than left implicit** | The REQUIRED misconception/edge-case pair is a **structural obligation of the form definition** — a submission omitting it is not a valid instance. **Nothing in this package enforces that at runtime**, because no enforcement surface exists yet. A form definition that rejects is not the same as a gate that blocks. |
| **Owner** | SUB-4, SUB-6, SUB-9, SUB-11 respectively |
| **Closes when** | Each named sub-task lands its half. This entry is the seam, not a defect. |

#### `CAP-S2-5` — **the structural checks were run by the task that produced the artifact** · mitigated, not closed

| | |
| --- | --- |
| **Cap** | The traceability audit, the misconception/edge-case structural check and the anti-fabrication greps in `traceability/02_…` were **run by SUB-2 over SUB-2's own document**. Inherited from `CAP-S1-4`: a producing task self-checking its own artifact is weaker evidence than an independent pass. |
| **Mitigation actually applied** | The fabrication probe was delegated to a **cold agent with no prior context and no priming toward refusal** — the one check that could be made genuinely independent was. The remaining checks are mechanical (presence, count, grep) rather than judgemental, which bounds how much the self-check can flatter itself. |
| **Owner** | **NEU-969 (SUB-12)** at the completeness gate; reviewers of this change |
| **Closes when** | An independent pass re-runs the checks — the completeness gate (`92_package-completeness-gate.md`) is the natural site. |

#### `CAP-S2-6` — **the anti-fabrication greps are lexical; a disguised plausible value is beyond them** · non-closable by any scan

| | |
| --- | --- |
| **Cap** | Inherited directly from **`CAP-S1-5`** and re-stated here because this sub-task's central constraint depends on it. The checks that no template contains a copyable identifier or address are **lexical**. They prove structural absence of the obvious shapes. **They cannot prove that no placeholder anywhere reads, to some future author, as data.** No grep can. |
| **What was done instead of pretending otherwise** | Every placeholder is angle-bracketed instruction text in the imperative, and **every one of the ten templates carries its own refuse-rather-than-invent line** rather than relying on one global statement — a redundancy chosen precisely because the lexical check cannot certify the property. |
| **Owner** | **SUB-1 (NEU-957)** as residual owner of OUT-7; a **review obligation on every C009 sub-task**, this one included |
| **Closes when** | It does not. It is bounded, not closable. |

### SUB-4 — NEU-960, correctness standards and authoring languages (OUT-2)

**What this section is.** SUB-4 publishes four correctness standards, two authoring-language decisions and a membership-by-id selection rule. **Everything it deliberately did not do — the gates it did not assign, the review it did not run, the numbers it did not measure and the field set it did not widen — is below.** A cap recorded is not a failure; a cap not recorded is.

#### `CAP-S4-1` — **`qa-execution:engine` is unconfigured; the QA-execution phase is a genuine Core Article 8 no-op** · not closable here

| | |
| --- | --- |
| **Cap** | This project's capability registry resolves to **`git, linear`** only. **No capability owns the `qa-execution:engine` surface**, so the QA-execution phase is a genuine **Core Article 8 no-op** — core ships a lean default and runs inert when no capability is registered. **Not a skipped phase, not a deferred one, not a waived one.** |
| **What is claimed** | **Nothing. No QA pass, scenario, verdict, report or coverage claim is asserted or implied anywhere in SUB-4's output.** Fabricating one to fill the gap would be **the same failure class as fabricating a citation** — a result presented for a run that did not happen. |
| **What verification actually is** | **File inspection and `git diff`**, resolved against the task's numbered success criteria: the three new files exist at exactly their stated paths and carry their `**Model:**` attribution, the two shared registers show **zero deletions**, the change set is exactly the five package paths, and **zero paths under `docs/research/C005-*` are touched**. The repo's own gates are **no-regression checks only** — `lint`'s scope is literally `src tests` and **never sees `docs/`**, so a green line there is **not evidence about anything in this package**. |
| **Consistency** | Explicitly consistent with **`CAP-S1-3`** and **`CAP-S2-2`**, which record the same no-op for the same registry. This is the third independent statement of it, not a new finding. |
| **Owner** | **the creator** — registering a QA-execution provider is a repository-configuration decision, not a sub-task's. |
| **Closes when** | A provider owning **`qa-execution:engine`** is registered **and** this package acquires runtime behaviour worth exercising. **Neither is expected within C009.** |

#### `CAP-S4-2` — **no blocking behaviour and no placement is assigned; SUB-4 assigns the mechanism axis only** · out of scope by design

| | |
| --- | --- |
| **Cap** | The pre-classification in `04_…` §3.1 assigns **the mechanism axis and nothing else**, from SUB-9's five published values — `deterministic`, `schema`, `server-side`, `automated`, `AI`. **It asserts no gate, no severity, no behaviour on failure, and no placement.** SUB-9 (NEU-965) owns **both** of those axes and SUB-4 assigns **neither**. |
| **How binding it is** | **PROVISIONAL and NON-BINDING.** **SUB-9 re-expresses the table in the published scheme, may reassign any mechanism with a recorded reason, and SUB-9's assignment is the one that governs.** SUB-4 runs in `[P1]`, **seven positions before SUB-9**, and asserts no enforcement rule it does not own. |
| **The consequence, named rather than left implicit** | A standard that fails an artifact is a **rule a reviewer applies**, not a gate that blocks. **Nothing in SUB-4's output enforces anything at runtime**, because no enforcement surface exists yet. The generic validation surface described in `04_…` §6 is **described, not decided** — SUB-9 decides what is implemented. |
| **Owner** | **SUB-9 (NEU-965).** |
| **Closes when** | **SUB-9 publishes the enforcement scheme and re-expresses the pre-classification table in it.** Not by review of this document, and not by a later sub-task treating a mechanism value as settled. |

#### `CAP-S4-3` — **the standards-conformance review of the package's exemplars is SUB-11's — cited, never produced, never waited on** · seam, not defect

| | |
| --- | --- |
| **Cap** | The standards-conformance review of the package's exemplars is **OUT-2's primary verification signal**, and it is **owned and run by SUB-11 (NEU-967)**. **SUB-4 does not produce it and does not claim its result.** SUB-4 runs **seven positions earlier in `[P1]`**, and **the exemplars do not exist at this cutoff** — so **SUB-4's completion never waits on that review.** |
| **What SUB-4 produced instead** | Its own **exemplar-free end-to-end check**: the three-artifact violation-detection walkthrough (`04_…` §7). Three non-conforming artifacts are constructed inline and walked to a failure naming the standard, the exact field or payload slot, and the mechanism value that catches it — **with no authored content, no node id, no citation and no external reference.** A standard that could only be checked by first authoring an exemplar would be a standard nobody could apply until the exemplars existed; that coupling is what the walkthrough removes. |
| **What the walkthrough is not** | **It is not a substitute for SUB-11's review and is never presented as one.** It exercises the standards against artifacts SUB-4 constructed to fail; it says nothing about whether real exemplars pass. |
| **Owner** | **SUB-11 (NEU-967).** |
| **Closes when** | **SUB-11 runs the standards-conformance review against these four standards and its result is cited back into this package.** |

#### `CAP-S4-4` — **every NEU-941 performance verdict is directional, never quantified (`JS-U2`)** · non-closable within C009

| | |
| --- | --- |
| **Cap** | **NEU-941 implemented nothing, benchmarked nothing, timed nothing, and selected no runtime, compiler or sandbox** — that was **out of scope by its own spec**, and it is recorded as **`JS-U2`**. Every performance, speed, cost or constant-factor statement inherited from it is therefore **directional only**. |
| **What that binds here** | **No performance statement anywhere in SUB-4's output is presented as a measurement.** It applies in **both** directions and to **both** languages: SUB-4 does **not** claim the no-hatch TypeScript rewrite is too slow, that C++17 is fast enough, or that any technique clears any threshold in any runtime. `DR-C09-04`'s rejection of the no-hatch alternative **stands entirely on pedagogical accuracy and needs no performance claim at all.** Every such statement across the three new files is listed and labelled in `traceability/04_standards-evidence-and-scope-audit.md`. |
| **What a reader must not do** | **A reader needing a threshold will not find one here and MUST NOT INFER ONE.** Converting a directional verdict into a quantity would manufacture a measurement out of a declined scope — the same failure class as a fabricated fetch result. |
| **Owner** | **NEU-941 / the creator** — the audit's owner declined the scope; this package inherits the decline rather than quietly resolving it. |
| **Closes when** | **An implementation-and-measurement pass is actually run**, against a selected runtime and a real workload. **Out of scope for C009.** |

#### `CAP-S4-5` — **the interim `stable_id` + `canonical_url` field set is CONSUMED, not re-decided** · unresolved by design

| | |
| --- | --- |
| **Cap** | The solution standard's `problem_ref` carries **`stable_id` and `canonical_url` only** — the interim set governed by open ledger challenge **`CH-F5-1`**. It is **cited by id — `CH-F5-1`, `DR-C09-01`, `CAP-S1-2` — and never restated, re-derived or re-argued.** The wider set (`title`, numeric `constraints`, difficulty signal, curriculum placement) appears nowhere as fillable and remains **NOT-YET-STORABLE**. |
| **What this sub-task did not do** | **It did not widen the set, did not argue for widening it, and did not treat its own needs as grounds to widen it.** A producing task may not promote its own artifact (`A1`–`A5`), and needing a field is not an adjudication. **An unverifiable value is REFUSED, NEVER INVENTED** — every `problem_ref` in `04_…` §7's constructed artifacts reads exactly `REFUSED — not verifiable`, and every node id in them is a withheld placeholder, under `C2` / `EXC-1`. |
| **What is not blocked** | Nothing in the four standards depends on the outcome. The standards attach to SUB-2's fields and to node-level structure; the field-set question touches one field of one form. That independence is what makes consuming the cap cheap enough to be the honest option. |
| **Owner** | **NEU-932 (`D-F5`'s owner) / the creator** (default) — surfaced for reassignment. |
| **Closes when** | **The foundations ledger records a disposition for `CH-F5-1`** (`OI-S1-13`). Not by this package needing the fields, and not by a downstream sub-task deciding it does. |

#### `CAP-S4-6` — **SUB-4's structural checks were run by the task that produced the artifact** · mitigated, not closed

| | |
| --- | --- |
| **Cap** | The scope audit over the 19 ids, the `JS-U2` directional-statement audit, the field-name and skill-type conformance greps, and the three-artifact walkthrough in `04_…` §7 were **run by SUB-4 over SUB-4's own documents**. Inherited directly from **`CAP-S1-4`** and **`CAP-S2-5`**: an author checking its own completeness shares the author's blind spots by construction. |
| **Mitigation, not a fix** | The **mechanical** half is **reproducible by anyone**: each of the 19 node ids is matched by exact string against the upstream audit register, the directional-statement audit records each statement's file and location, and every field name and skill-type literal is grep-checkable in both directions against `02_content-and-exercise-forms.md`. The **judgment** half — is a standard's correctness obligation the right bar? is the walkthrough's failure the failure a real reviewer would hit first? — **remains unvalidated by an independent reader.** |
| **Owner** | **NEU-969 (SUB-12)** at the completeness gate; and any reviewer of this change. |
| **Closes when** | **An independent pass re-runs the mechanical checks and reviews the judgment calls** — **`92_package-completeness-gate.md`'s run is the intended occasion.** |

### SUB-3 — NEU-959, problem-level citation verification and access paths (OUT-3, OUT-1 probe run 2)

**The headline, stated before the entries.** This sub-task was commissioned to produce a seed set of verified problem-level citations and to close `CAP-2` by evidence. **It shipped the procedure, the criteria, the record shapes and the probe. It shipped zero citations and it did not close `CAP-2`.** The cause is a single rights precondition that SUB-3 is expressly forbidden to re-decide, and it is recorded here rather than absorbed. **A cap recorded here is not a failure; a cap that was not recorded is.**

#### `CAP-S3-1` — **cluster coverage is 0/4; the seed citation set is empty** · not closable here

| | |
| --- | --- |
| **Cap** | **No verified problem-level citation was produced for any of CL-1, CL-2, CL-3 or CL-4.** The seed set has **zero entries**. All four clusters are capped **under this single entry with one named owner and one shared closure condition**, because they share **one** cause — the access gate — and four separately-worded caps would misrepresent one blocker as four independent problems. |
| **The cause** | All twelve sources carry access disposition `Restricted` in `01_provenance-and-rights.md` §3. Under the charter's Branch C rule a source SUB-1 recorded as restricted **is not fetched**, and §3.1 clause 1 binds SUB-3 to consume that record rather than form its own view. **The sanctioned hierarchy has no reachable leaf**, so `C1` (which carries the CL-1/CL-2 foundational material) and every other corpus were gate-blocked before any path was reached. **Zero requests were issued.** |
| **What was refused** | **Admitting a single unverified id to make the coverage row read better.** The acceptance criterion is explicit — a candidate that cannot be verified is dropped or capped, **never admitted with a caveat** — and `C1`'s constraint (*invent no problem-level citation, under any pressure, including schedule*) is not weakened by the fact that a blocked gate makes the deliverable look thin. **A cluster row reading 0 with a named owner is worth more than a row reading 1 that nobody can resolve.** |
| **Owner** | **SUB-1 (NEU-957)** for the re-verification half (residual owner of OUT-7); **SUB-3's successor** for the execution half — **the creator by default** |
| **Closes when** | A SUB-1-owned dated re-verification pass re-dates the §3 access rows, **and then** `03_…` §5's procedure is executed against the sources whose rows permit it, producing at least one seven-step PASS per cluster. `OI-S3-1`. |

#### `CAP-S3-2` — **`CAP-2` closure DECLINED — not closed, not partially closed** · not closable here

| | |
| --- | --- |
| **Cap** | `CAP-2` records that problem-level citations are unverified because an entry-level automated fetch of the Codeforces corpus returned **HTTP 403** on 2026-07-16. **This sub-task declines to close it, and declines to partially close it.** Filed as **`D-R5`** in `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` §3.10, **by union** — a new appended subsection and row, no prior row replaced, **not self-promoted to `settled`** (`A4`). |
| **Why declined rather than partially closed** | A partial closure needs at least one verified citation — some evidence that the hierarchy resolves *something*. **There is none.** **No fetch was attempted at this cutoff, so no new information about the 403 exists**, and a cap cannot be partially closed by a procedure never executed against a live source. **Declaring a partial closure on the strength of a shipped procedure would be closing a finding on a prediction** — precisely the defect `D-R4` was written to prevent in this same ledger. |
| **What did change** | `CAP-2` previously had **no operational definition of "verified"** to close against and **no selection rule**; it now has both (`03_…` §5, §6). Its blocker moves from diffuse ("corpus access", unowned) to **exactly one named, dated, currently-actionable pass**. And `OI-S3-2` records that outbound network capability now exists, **firing `CAP-S1-1`'s named trigger.** |
| **Owner** | **the creator / SUB-1 (NEU-957)** for the re-verification half; **SUB-3's successor** for the execution half |
| **Closes when** | Both halves complete and at least one citation returns PASS on all seven steps of `03_…` §5. **No fetch outcome, absent `robots.txt`, or unenforced rate limit closes it** — inherited verbatim from `CAP-S1-1` and not weakened here. |

#### `CAP-S3-3` — **the field set is CONSUMED, not decided; Branch A discharged** · unresolved by design

| | |
| --- | --- |
| **Cap** | `CH-F5-1` is **unresolved and open**. Branch A fires as pre-specified: `03_…` §7 specifies the citation record for **both** dispositions, the produced shape is **`stable_id` + `canonical_url` only**, and title, constraints and difficulty signal are carried as **dated verification observations** in `traceability/03_…` §2 rather than as stored fields. |
| **What this sub-task did not do** | It did not widen the set, did not argue for widening it, and **did not treat its own empty seed set as grounds to widen it.** The wider set is never admitted on this package's judgment under either branch. |
| **Migration property, recorded because it is what makes the narrow set cheap** | If `CH-F5-1` resolves **for** the wider set, the four fields become admissible with **no change to the procedure** — §5's V5 and V6 already produce every one of those values as dated observations, so it is a **promotion of existing observations**, not a re-verification. **No citation would need re-resolving.** If it resolves **against**, nothing changes at all. |
| **Owner** | **NEU-932 (`D-F5`'s owner) — the creator by default.** A producing task may not promote its own artifact (`A1`–`A5`). |
| **Closes when** | **The foundations ledger records a disposition for `CH-F5-1`.** Not by this sub-task needing the fields, and not by a blocked seed set making the narrow record inconvenient. |

#### `CAP-S3-4` — **the retention check passed VACUOUSLY and proves nothing about a live response** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | `01_provenance-and-rights.md` §6's retention disposition was confirmed in force **before** the first request on path (1) — but **C4 failed the access gate**, `problemset.problems` was never called, and **no enumerating response was ever received**. There was nothing to retain, so the check passes **vacuously**. |
| **Why it is named rather than reported as a clean pass** | In a summary table a vacuous pass is indistinguishable from a demonstrated one. **Nothing here establishes that the retention discipline holds under a real enumerating response**, and `03_…` §8 must not be cited by a future pass as precedent that it does. The failure this disposition exists to prevent — retaining or mining a whole-problem-list response — **has not yet been given the opportunity to occur.** |
| **Owner** | **SUB-3's successor** — whoever first executes path (1) against a live API — **the creator by default** |
| **Closes when** | The first sanctioned call that actually returns an enumerating response has its retention check run for real. `OI-S3-5`. |

#### `CAP-S3-5` — **probe run 2 never exercised its admitting branch** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | Run 2 (`dry-run/03_…`) is the **admitting** run — the one whose pass condition allows a *verified* citation. **It passed 10/10 entirely on the refusal branch.** Because §5's step V0 halts every source at the access gate, **no citation could resolve under the procedure**, so the admitting branch was **available in principle and unreachable in fact**. **Whether a real resolution produces a real PASS remains untested.** |
| **What the run did establish, and it is not nothing** | That supplying a verification procedure to an authoring agent **did not create a laundering vocabulary** — the live risk this run existed to test, and the one thing run 1 could not test. The cold agent used the procedure as a **gate**, cited V0 by name, and declined; it did not dress a guess as "verified under §5". |
| **Disposition of `CAP-S2-3`** | Its closure condition — *"SUB-3 re-runs the probe against a real verification procedure and its result is cited back into this package"* — is **discharged as to the re-run and the citing**. The underlying limitation it names (two runs are two observations, not a distribution) **stands, undiminished.** `CAP-S2-3` is SUB-2's row and is **not edited here.** |
| **Owner** | **SUB-3 (NEU-959)** for the run; **SUB-3's successor** for the admitting branch — **the creator by default** |
| **Closes when** | The probe is re-run at a cutoff where at least one source is reachable, so a produced citation can actually be checked against the procedure. |

#### `CAP-S3-6` — **`qa-execution:engine` is unconfigured; the QA-execution phase is a genuine no-op** · not closable here

| | |
| --- | --- |
| **Cap** | This repository's capability registry resolves to **`git, linear`** only. **No capability owns the `qa-execution:engine` surface**, so the QA-execution phase is a genuine **Core Article 8 no-op** — a phase with no provider, not one skipped, deferred or waived. |
| **What is claimed** | **Nothing. No QA pass, scenario, verdict, report or coverage claim is asserted or implied anywhere in SUB-3's output.** The fabrication probe is a **hand-run structural check recorded by the task that ran it**, not a QA run. **Fabricating a QA pass would be the same failure class as fabricating a citation** — which is the failure this entire sub-task exists to prevent, so committing it in the verification register would be self-refuting. |
| **What verification actually is** | File inspection, `git diff` against the named success criteria, and the re-run lexical scans of `traceability/03_…` §4. The repository's own gates never see `docs/`, so a green line there is **not evidence about anything in this package**. |
| **Owner** | **the creator** — registering a QA-execution provider is a repository-configuration decision, not a sub-task's |
| **Closes when** | A `qa-execution:engine` provider is registered **and** this package acquires runtime behaviour worth exercising. Neither is expected within C009. |

#### `CAP-S3-7` — **the self-checks and scans were run by the task that produced the artifact** · mitigated, not closed

| | |
| --- | --- |
| **Cap** | `traceability/03_…` §3's rights checks — including the two **new** ones, `RC-9` (no access outcome promotes a restricted source) and `RC-10` (every asserted problem id has a dated resolution record) — and §4's scan re-run were **run by SUB-3 against SUB-3's own output**. Inherited from `CAP-S1-4` and `CAP-S2-5`: an author checking its own completeness shares the author's blind spots by construction. |
| **Mitigation actually applied** | The **mechanical** half is reproducible by anyone: §4 records each scan's command, date and outcome. **`RC-10` is trivially checkable** — SUB-3 asserts zero problem ids, and scans B and C both return 0. And the one check that could be made genuinely independent **was**: the fabrication probe ran on a **cold agent with no prior context and no priming toward refusal**. The **judgment** half — chiefly `03_…` §4.2's standing argument — remains unvalidated by an independent reader, which is why it is also filed as `OI-S3-3` for challenge. |
| **Owner** | **NEU-969 (SUB-12)** at reconciliation, and any reviewer of this change |
| **Closes when** | An independent reader re-runs the scans and reviews the judgment call in `03_…` §4.2. **`92_package-completeness-gate.md`'s run is the intended occasion.** |

### SUB-6 — NEU-962, assessment evidence out of band (OUT-5)

#### `CAP-S6-1` — **this design specifies evidence and enforces nothing** · out of scope by design

| | |
| --- | --- |
| **Cap** | `06_assessment-evidence-out-of-band.md` states which signals may and may not feed each mastery gate and threshold, and states the rule that **a happy-path-only item may not carry a gate**. **Nothing enforces any of it at runtime.** No gate reads this mapping, no validator rejects an item with an empty `separating_distractor_or_boundary_input`, and no code path consults a signal's reliability class. |
| **The consequence, named rather than left implicit** | Inherited directly from **`CAP-S2-4`**, which already names "the discriminating design of gate-bearing items" as SUB-6's and the gates themselves as **SUB-9's (NEU-965)**. A mapping that is not enforced is a **specification with a seam**, and the seam is exactly where an item with a plausible-looking but non-separating distractor would get through. The mapping is written in SUB-2's exact field vocabulary precisely so SUB-9 can enforce it **without a translation layer**. |
| **What was done instead of pretending otherwise** | Every rule that SUB-9 must enforce is stated with a **decision procedure**, not a sentiment — §5.2's four-condition happy-path check is decidable by inspection, and §4's may-feed / may-not-feed lists are exhaustive over A–E and `MM-T1`…`MM-T15` rather than eliding a remainder. |
| **Owner** | **SUB-9 (NEU-965)** — the quality-system owner that builds the enforcing gates. |
| **Closes when** | SUB-9 lands the gates that consume this mapping. This entry is the seam, not a defect. |

#### `CAP-S6-2` — **no in-app signal closes the authorship gap** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | Whether the learner wrote the solution they pasted back is **not observable**, and **no signal this design defines closes that gap.** The full residual and its bound are filed as `OI-S6-3` in `90_open-items-and-provisional-register.md`; this entry records the *incompleteness* rather than the open question. |
| **What the design achieves instead** | It **bounds** the exposure rather than eliminating it: at most **one** counted success toward `MM-T1` is obtainable by copying, because Gate A is not opened by the paste alone, Gate B requires **K = 3** across **≥ 2 separated sessions ≥ 1 day apart**, Gate C is server-evaluated from multi-session history, and Gates D and E are unreachable on out-of-band evidence at all. |
| **What was refused** | **A stylometric, timing-based, or similarity-based authorship inference.** Any of them would have closed this cap on paper by manufacturing a confident signal from evidence that does not support one. `RA5` already forbids the closest analogue, and **a cap honestly recorded is worth more than a control that does not work.** |
| **Owner** | **SUB-9 (NEU-965)** for any narrower bound at the gate; **the creator by default** for the product question of whether the exposure is acceptable. |
| **Closes when** | **A genuinely observable authorship or unaidedness signal exists** — an in-app editor with captured attempts, or a source-platform integration — falsifying charter assumption 5. **No inference closes it.** |

#### `CAP-S6-3` — **the corpus-swap run is specification-level; no store implements the record shape** · mitigated, not closed

| | |
| --- | --- |
| **Cap** | `dry-run/06_corpus-swap-verification.md` verifies that the **specified** record shape has the corpus-neutrality property. It does **not** verify that an implementation of it does — because **there is no implementation**: no schema, table, query or migration exists for this record shape, and this sub-task builds none by scope. No code was written, no database was touched, and no fetch was performed. |
| **What it costs** | An implementation that put the citation **in the key** would fail the property, and nothing in this run would catch it. The run's claim is *"this shape has the property"*, never *"the system has the property"*. |
| **Mitigation actually applied** | The pass condition (`PC-1`…`PC-4`) was **fixed before the run**, the comparison is field-by-field and mechanical, and the specimen was chosen to be maximally unfavourable — three records across two separated sessions with Gate A and Gate B already cleared, i.e. the state with the **most** to strand. A trivially-passing single ungraded record would have proved nothing. |
| **Owner** | **SUB-9 (NEU-965)** and whoever implements the evidence store; **NEU-969 (SUB-12)** at the completeness gate. |
| **Closes when** | The record shape is implemented and the swap is re-run against the real store, with the citation demonstrably outside the key. |

#### `CAP-S6-4` — **the checks in this change were run by the task that produced the artifacts** · mitigated, not closed

| | |
| --- | --- |
| **Cap** | The signal → gate mapping audit, the misconception-discrimination check, the control-by-control no-weakening demonstration, the composition-invariant check and the corpus-swap run were **all performed by SUB-6 over SUB-6's own documents**. Inherited from **`CAP-S1-4`** / **`CAP-S2-5`**: a producing task self-checking its own artifact is weaker evidence than an independent pass. |
| **Mitigation actually applied** | The checks were kept **mechanical wherever a mechanical form existed** — the greedy-misconception demonstration is arithmetic against the shipped mapper's real weights and its fail-closed span rule (`2 < 3`); the swap comparison is field-by-field against a pre-fixed pass condition; the field-name conformance check is lexical; the append-only property is proved by a **deletion count of `0`**, not asserted in prose. What remains judgemental is the **control-by-control table**: six controls argued, none executed or measured. |
| **Owner** | **NEU-969 (SUB-12)** at the completeness gate; reviewers of this change. |
| **Closes when** | An independent pass re-runs the checks — `92_package-completeness-gate.md` is the natural site. |

#### `CAP-S6-5` — **`qa-execution:engine` is unconfigured; the automated QA phase is a genuine no-op** · environmental, not closable here

| | |
| --- | --- |
| **Cap** | The capability registry for this project resolves to **`git, linear` only**. **No capability owns the `qa-execution:engine` surface**, so the automated QA phase runs **inert** — a genuine **Core Article 8** no-op ("core never requires a capability; every extension point ships a lean default and runs inert when none is registered"). **No QA run was executed for this change, and none could be.** |
| **What was refused** | **No QA pass is claimed, fabricated, or implied anywhere in this change.** No scenario table, no pass rate, no report artifact. Writing one would have been the single most damaging thing available here: a fabricated QA result in a package whose entire subject is *not laundering weak evidence into a strong claim* would falsify the package by example. |
| **What verification actually was** | **File inspection plus `git diff`** against the spec's numbered criteria. The repository's own gates (`tsc --noEmit`, `eslint --max-warnings 0`) were run and are **no-regression checks only** — neither reads `docs/**`, so a green result is **not evidence about anything in this change**, and is not presented as any. |
| **Owner** | **the creator** (default) — registering a `qa-execution` capability is a project-configuration decision, not a sub-task's. |
| **Closes when** | A capability owning the `qa-execution:engine` surface is registered **and** the QA phase has something in this package it can meaningfully execute. For a documentation deliverable that second condition may never hold, in which case this stays open as an accurate description rather than a defect. |

#### `CAP-S6-6` — **every `MM-T*` value the mapping is stated against is provisional in value** · inherited, non-closable here

| | |
| --- | --- |
| **Cap** | The mapping names `MM-T1` (K = 3), `MM-T2` (S ≥ 2, ≥ 1 day apart), `MM-T3` (q ≥ 3), `MM-T5` (≤ 0.10), `MM-T7` (≥ 0.90), `MM-T8` (posterior ≥ 0.90), `MM-T11` (N = 3), `MM-T15` (≤ 1.5×) and the rest with their recorded values. **Those values are provisional.** NEU-888's mechanisms are **binding in shape, open in value**, each with a stated calibration band. |
| **What that means for this design, precisely** | The mapping's content is **which signal may feed which threshold**, and that is a statement about *shape* — it survives any value inside the band. A value change moves how much evidence a gate needs; it does not move which evidence may supply it. **This design may cite a provisional value; it may never lower one**, and it lowers none. |
| **What would actually invalidate the mapping** | Not a value change, but a **shape** change — a threshold being redefined over a different quantity (e.g. `MM-T15` redefined over something other than solve latency would reopen §8.1's refusal). |
| **Owner** | **NEU-888** as the owner of the instructional and mastery model; **the creator by default.** |
| **Closes when** | It does not close here. It closes if and when the mastery model's values are calibrated and frozen — which is that package's decision, not this one's. |

### SUB-5 — NEU-961, per-cluster non-root conceptual obligation (OUT-6)

**The headline, stated before the entries.** This sub-task was commissioned to specify the per-cluster non-root `conceptual` obligation and route its map-side half. **It specified 4 of 4 and routed 3 of 4. It covered none of the 3, and it closed no finding.** The cause is not a shortfall of effort or of content quality: **three clusters contain no node a conceptual form set could attach to**, and creating one is out of scope charter-wide. **A cap recorded here is not a failure; a cap that was not recorded is.**

#### `CAP-S5-1` — **non-root `conceptual` coverage is 0/3 for CL-2, CL-3 and CL-4** · not closable here

| | |
| --- | --- |
| **Cap** | **No cluster's conceptual coverage is achieved by this package beyond CL-1's.** Non-root `conceptual` stands at **1/4 clusters** — CL-1 only, on a single node — and at **0/3** across CL-2, CL-3 and CL-4. All three are capped **under this single entry with one named owner and one shared closure condition**, because they share **one** cause and **one** decision surface; three separately-worded caps would misrepresent one adjudication as three independent problems. |
| **The cause** | SUB-2's placement matrix keys the REQUIRED form set off **the node's `skill_type`**, and all ten templates require `node_id` to be *"the exact node id from the map — copy it; if you cannot locate it, refuse."* CL-2, CL-3 and CL-4 instantiate `conceptual` **zero** times, so there is **no attachment point**. The absence is itself structural: the `S1→S8` cascade (`D-S1`, `settled`) reaches `conceptual` only as a **confident residual**, and the audit already records that it *"structurally suppresses `conceptual` outside the first-principles layer."* |
| **What was refused** | **Authoring conceptual-flavoured content against the existing `strategic` and `transfer` nodes and reporting the clusters covered.** Those artifacts would be individually valid — `reflection`, `retrieval` and `assessment` are **R** for those types too — but the matrix reads the *node's* type, so the coverage produced is of that type. The package would then read green on all four clusters while the map still instantiates `conceptual` exactly once, **hiding the very fragility `F-943-2` was filed to keep visible, behind our own output.** Also refused: **retyping a near-candidate**, which contradicts a committed `skill_type_rationale` under a `settled` decision. |
| **Owner** | **The map's owner — the creator, and whichever task next writes `nodes/*.yaml`** — for the map-side half. **The creator by default.** |
| **Closes when** | The map's owner adjudicates among `D-R6`'s three routes and the chosen route is executed, so that each of CL-2, CL-3 and CL-4 carries at least one **non-root** node typed `conceptual` — **and then** SUB-2's six REQUIRED forms are authored against it. **No content authored under C009 closes it.** `OI-S5-1`. |

#### `CAP-S5-2` — **whether each stated obligation clears the `S1→S8` cascade is UNADJUDICATED** · unresolved by design

| | |
| --- | --- |
| **Cap** | The four obligations in `05_…` §4 are written deliberately as **property judgments** rather than as selections or as recognitions-under-an-unfamiliar-surface, so that a cascade adjudication is *possible*. **Whether each actually reaches S8 as a confident residual is not decided here and is not presumed.** A node minted on a mis-assessed cascade would carry a false type, which is the same defect as a retype, arrived at by a longer route. |
| **Why this package cannot close it** | Assigning a `skill_type` is a map-authoring act, and **authoring, minting or reclassifying a map node is out of scope charter-wide.** `D-S1` is `settled` and its cascade is NEU-933's; forming a view on where it stops for a node that does not exist yet would be re-deciding it on the map's behalf. |
| **What is nevertheless supplied** | Each obligation states its **failure directions** — the two ways the judgment goes wrong — which is precisely the evidence a cascade adjudication needs to distinguish an S8 residual from an S5 selection or an S4 transfer. **The adjudication is made cheap, not made.** |
| **Owner** | **The map's owner / `D-S1`'s owner (NEU-933)** — **the creator by default.** |
| **Closes when** | The map's owner records a cascade disposition for each minted node in `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md`, or files a `D-S1` challenge if the cascade cannot express the obligation — the route `D-S1`'s own second revision limb names. |

#### `CAP-S5-3` — **`qa-execution:engine` is unconfigured; the QA-execution phase is a genuine no-op** · not closable here

| | |
| --- | --- |
| **Cap** | This repository's capability registry resolves to **`git, linear`** only. **No capability owns the `qa-execution:engine` surface**, so the QA-execution phase is a genuine **Core Article 8 no-op** — a phase with no provider, not one skipped, deferred or waived. Consistent with `CAP-S1-3`, `CAP-S2-2` and `CAP-S3-6`. |
| **What is claimed** | **Nothing. No QA pass, scenario, verdict, report or coverage claim is asserted or implied anywhere in SUB-5's output.** |
| **What verification actually is** | File inspection and `git diff` against the named success criteria — in particular the **append-only** check (`0` deletions on the schema ledger and on both shared registers) and the **non-mutation** check (`docs/research/C005-dp-map/` shows zero changed files). The repository's own type-check and lint gates never see `docs/`, so a green line there is **not evidence about anything in this package.** |
| **Owner** | **the creator** — registering a QA-execution provider is a repository-configuration decision, not a sub-task's |
| **Closes when** | A `qa-execution:engine` provider is registered **and** this package acquires runtime behaviour worth exercising. Neither is expected within C009. |

#### `CAP-S5-4` — **zero verified citations; the obligation's citation-independence is not evidence of coverage** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | **Cluster citation coverage is `0/4`** (`CAP-S3-1`) and `CAP-2`'s closure was **declined** (`D-R5`). The per-cluster conceptual obligation is nevertheless statable in full, because for a `conceptual` node `problem-reference` and `solution` are both **O** and none of the six REQUIRED forms carries a required citation-bearing field. |
| **Why that is capped rather than reported as a clean result** | Citation-independence is a real property of SUB-2's matrix, and it would be easy to read it as *"this obligation is unaffected by the rights gate, therefore it is in good shape."* **It is not.** Three clusters remain blocked on the map, which no citation would unblock, and the independence says nothing about that. **Stating the property without this cap would let a reader convert an unrelated absence of a blocker into evidence of progress.** |
| **What was refused** | Asserting, constructing or illustrating **any** problem id, URL or identifier-shaped string. Where a citation is eventually used the interim field set is **`stable_id` + `canonical_url` only** (`CH-F5-1`, `DR-C09-01`, `CAP-S1-2`), and an unverifiable value is **refused, never invented**. `OI-S3-2`'s network-capability observation is **capability, not authority**; the rights gate stays shut and nothing in SUB-5's output licenses a fetch. |
| **Owner** | **SUB-1 (NEU-957)** for the re-verification half, as residual owner of OUT-7 — **the creator by default** |
| **Closes when** | It does not close by anything SUB-5 owns. It is retired when `CAP-S3-1` closes, at which point the independence becomes an ordinary fact rather than a claim needing a guard. |

#### `CAP-S5-5` — **the per-cluster check was run by the task that produced the artifact** · mitigated, not closed

| | |
| --- | --- |
| **Cap** | The 4/4 per-cluster check, the discharge split and the non-mutation check in `traceability/05_conceptual-obligation-and-routing-matrix.md` were **run by SUB-5 against SUB-5's own output.** Inherited from `CAP-S1-4`, `CAP-S2-5` and `CAP-S3-7`: an author checking its own completeness shares the author's blind spots by construction. |
| **Mitigation actually applied** | The **mechanical** half is reproducible by anyone and is stated as commands rather than as claims: the append-only check is `git diff --numstat` on three named files (expect `0` deletions each), and the non-mutation check is `git diff --stat` restricted to `docs/research/C005-dp-map/` (expect empty). The **counts** are not this task's — they are consumed from `../C005-dp-map-integrity/02_skill-type-union-completeness.md`, which measured them independently, so a reader checking the baseline is checking a **different** task's arithmetic. |
| **What remains unvalidated** | The **judgment** half: whether each stated obligation is genuinely the conceptual acquisition its cluster needs, and whether the reclassification bar in `05_…` §6 is correctly drawn. Both are recorded so they can be challenged rather than reverse-engineered from an absence. |
| **Owner** | **NEU-969 (SUB-12)** at reconciliation, and any reviewer of this change |
| **Closes when** | An independent reader re-runs the two mechanical checks and reviews `05_…` §4 and §6. **`92_package-completeness-gate.md`'s run is the intended occasion.** |

### SUB-7 — NEU-964, difficulty calibration and its provisional inputs (OUT-4)

**The headline, stated before the entries.** This sub-task was commissioned to calibrate difficulty **honestly about the provisional data it rests on**. **It shipped the standard. It shipped it with no external cross-check for any of the 179 nodes, and with its dimension set escalated rather than settled.** Both are recorded below with named owners. **A cap recorded here is not a failure; a cap that was not recorded is.**

**No field-set cap is filed here.** The unresolved stored-field set is **SUB-3's entry**, inherited and cited by id — `CAP-S3-3`, and behind it `CH-F5-1`, `DR-C09-01`, `CAP-S1-2` / `OI-S1-13`. **SUB-12 (NEU-969) is the single owner of every cap**, so this sub-task restates none of them and incurs no duplicate.

#### `CAP-S7-1` — **the external difficulty anchor is absent for all 179 nodes; there is no cross-check** · not closable here

| | |
| --- | --- |
| **Cap** | **No calibrated value in this standard has an independent external cross-check.** C4's numeric rating is the only quantitative difficulty signal in the corpus selection (charter assumptions 16 and 24), and **zero ratings exist**: SUB-3's seed set is empty and cluster citation coverage is **0/4** (`CAP-S3-1`). The anchor-unavailable branch of OUT-4 therefore fires **universally — for all 179 nodes, not for some.** |
| **The cause** | All twelve sources fail SUB-3's step **V0**: every one carries access disposition `Restricted` in `01_provenance-and-rights.md` §3, so **no request was issued on either sanctioned path** — not C4's documented API, not the single targeted fetch. `problemset.problems` was never called. **This sub-task issued no request either**, on any path: reaching a source is expressly out of its scope, and a rating SUB-3 did not capture is this branch, never a fetch made here. Network **capability** exists (`OI-S3-2`) and the rights gate is shut regardless — **capability is not authority.** |
| **What was refused** | **Inventing, estimating or recalling a rating.** `CH-F5-1`'s governing rule — an unverifiable value is **refused, never invented** — applies directly to any difficulty datum this sub-task could not source. Equally refused: **promoting a second provisional value into the anchor's place.** By name — `entry_gate` was **not** pressed into service as a pseudo-anchor (it carries no independent information at all, `F-943-3`), and `progression_stage` was **not** re-classed as an independent check on load dimensions drawn from the same unreviewed pass. |
| **What it costs** | The calibration proceeds — the triple is fully computable from the map — but **nothing corroborates it.** Every calibrated output carries the verbatim *no external cross-check* label of `07_…` §9.4. **The result is labelled, never presented as grounded.** |
| **Owner** | **SUB-1 (NEU-957)** for the re-verification half (residual owner of OUT-7); **SUB-3's successor** for the execution half — **the creator by default** |
| **Closes when** | A SUB-1-owned dated re-verification pass re-dates the §3 access rows, **and then** `03_…` §5's procedure resolves at least one externally-rated C4 citation, at which point `07_…` §5.4's cross-check executes for real. `OI-S3-1`, `CAP-S3-1`, `CAP-S3-2`. |

#### `CAP-S7-2` — **the observation-read path passed VACUOUSLY and proves nothing about a real rating** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | While `CH-F5-1` is open, the standard reads its external signal from **SUB-3's dated verification observations** rather than from a stored field. The restricted-stored-set run's first two assertions — *every rating is read from a dated observation* and *every dependent output carries the observation date* — **pass vacuously**: `traceability/03_…` §2 holds **zero** observations, so nothing was read and no output consumed one. |
| **Why it is named rather than reported as a clean pass** | In a summary table a vacuous pass is indistinguishable from a demonstrated one — the same defect `CAP-S3-4` names for the retention check, in a different register. **Nothing in SUB-7's output establishes that the observation-read path works under a real observation**, and no future pass may cite `traceability/07_…` §5.1 as precedent that it does. |
| **What did pass non-vacuously** | Three of the five: the inherited field-set cap is **cited by id** and never restated; **storage gains no field** (this change adds no schema, no field, no stored citation record); and the standard is **specified for both `CH-F5-1` dispositions**, with the rating staying **class X** either way and the dimensions, combination rule, classification and labelling unchanged. |
| **Owner** | **SUB-7's successor** — whoever first calibrates against a real dated observation — **the creator by default** |
| **Closes when** | At least one external rating exists as a dated verification observation and is actually consumed by the standard, so the date-labelling path is exercised rather than asserted. Depends on `CAP-S7-1`. |

#### `CAP-S7-3` — **the standard ships UNEXERCISED: no calibrated value was computed for any node** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | The combination rule has **never been run end-to-end over real values.** No `calibrated_difficulty` triple was computed, published or compared for any of the 179 nodes. What ships is the **rule**, its input classification, its labels and its branch behaviour — deliberately (`OI-S7-8`), because circulating 179 provisional triples with no cross-check would present them as results. |
| **What that leaves untested** | The rule's **behaviour at scale**: how many nodes fall into equal-triple **incomparability** (`OI-S7-4`), whether the lexicographic order produces bands a curriculum can use, and what the actual numeric range of `PLI` is. **`07_…` §3.3 asserts no per-dimension range precisely because none was measured** — the validator reports key-set uniformity, not value ranges. |
| **What was refused** | **Asserting a range, a distribution or a band this sub-task did not compute.** That would be the same defect as asserting a rating it did not capture, at smaller scale and with better camouflage. |
| **Owner** | **SUB-9 (NEU-965)** as the first consumer that must instantiate the rule — **the creator by default** |
| **Closes when** | The rule is executed over the real node set and its output characteristics are recorded — ideally at the same pass that resolves `OI-S7-1`, since the dimension set is what the execution would be testing. |

#### `CAP-S7-4` — **`qa-execution:engine` is unconfigured; the QA-execution phase is a genuine no-op** · not closable here

| | |
| --- | --- |
| **Cap** | This repository's capability registry resolves to **`git, linear`** only. **No capability owns the `qa-execution:engine` surface**, so the QA-execution phase is a genuine **Core Article 8 no-op** — a phase with no provider, **not** one skipped, deferred or waived. |
| **What is claimed** | **Nothing. No QA pass, scenario, verdict, report or coverage claim is asserted or implied anywhere in SUB-7's output.** **Fabricating a QA pass would be the same failure class as fabricating the external rating this sub-task spends `CAP-S7-1` refusing to invent** — committing it here would refute the deliverable in its own verification register. |
| **What verification actually is** | File inspection, `git diff` against the task's numbered success criteria, and **the re-run of the C005 integrity validator** recorded verbatim at `traceability/07_…` §3 — the one genuinely mechanical, third-party-reproducible check this sub-task has. The repository's own gates never see `docs/`, so a green line there is **not evidence about anything in this package**. |
| **Owner** | **the creator** — registering a QA-execution provider is a repository-configuration decision, not a sub-task's |
| **Closes when** | A `qa-execution:engine` provider is registered **and** this package acquires runtime behaviour worth exercising. Neither is expected within C009. |

#### `CAP-S7-5` — **the audit and the branch runs were performed by the task that produced the artifact** · mitigated, not closed

| | |
| --- | --- |
| **Cap** | The §9 provisional-reliance audit, the input-traceability table and both pre-specified branch runs (`traceability/07_…` §2, §4, §5) were **run by SUB-7 against SUB-7's own output**. Inherited from `CAP-S1-4`, `CAP-S2-5` and `CAP-S3-7`: an author checking its own completeness shares the author's blind spots by construction. |
| **Mitigation actually applied, and its limit** | The one genuinely independent check **was** made independent: `traceability/07_…` §3's **validator run** executes a program this sub-task did not write and could not modify, and its output is recorded **verbatim**, including the parts that bear on nothing here. It is what makes `prerequisite_depth` class **MD** rather than an assertion. The **judgment** half — is escalating the dimension set right rather than settling it? is each `NOT APPLICABLE` disposition in the §9 audit correct? — **remains unvalidated by an independent reader.** |
| **Owner** | **NEU-969 (SUB-12)** at reconciliation, and any reviewer of this change |
| **Closes when** | An independent reader re-runs the validator and reviews the judgment calls in `07_…` §3.1 and `traceability/07_…` §2. **`92_package-completeness-gate.md`'s run is the intended occasion.** |

#### `CAP-S7-6` — **caps inherited and consumed, not re-owned**

**Listed so this sub-task's limits are not mistaken for new ones, and so SUB-12 sees no duplicate.**

| Inherited entry | How SUB-7 consumes it | Owner (unchanged) |
| --- | --- | --- |
| **`CAP-S3-3`** — the stored field set is consumed, not decided; Branch A discharged | **Cited by id.** `07_…` §8 specifies the calibration for **both** `CH-F5-1` dispositions and stores **no** field. **No new field-set cap is incurred**, and the wider set is never admitted on this package's judgment. | NEU-932 (`D-F5`'s owner) / the creator |
| **`CAP-S3-1`** / **`CAP-S3-2`** — empty seed set, coverage 0/4, `CAP-2` closure declined | **Consumed as the factual input** to the anchor-unavailable branch. SUB-7 neither closes nor partially closes `CAP-2`, and **does not re-decide SUB-3's standing judgment** (`OI-S3-3`). | SUB-1 / SUB-3's successor / the creator |
| **`CAP-S1-1`** — twelve rows are **restricted by default**, not verified-restricted | **Carried verbatim.** No statement in SUB-7's output may be read as evidence that any source's terms were checked, and none treats a restricted row as an observed refusal. | the creator |
| **`CAP-S1-5`** / **`CAP-S2-6`** — the anti-fabrication scans are lexical | **Inherited as a review obligation**, this sub-task included. No grep proves that no sentence here is a disguised unsourced difficulty claim. | SUB-1 (NEU-957), enforced at review |
| **`INC-C7`**, **`INC-C1`**, **`R1` / `X-D3`**, **`PS-2/3/4` granularity** (C005 §9) | **Surfaced as `PR-9`, `PR-10`, `PR-8`, `PR-6`** in `07_…` §7 with owners and revision triggers. **Not re-owned** — C005's register keeps them. | per `../C005-dp-map-package/03_…` §9 |


### SUB-8 — NEU-963, the authoring workflow and the in-situ creator-review loop (OUT-8)

**Model:** claude-opus-5[1m]

#### `CAP-S8-1` — **zero class 3 `[dogfooding]` evidence was collected; the loop is specified, never exercised on real evidence** · not closable here

| | |
| --- | --- |
| **Cap** | **The in-situ creator-review loop names class 3 `[dogfooding]` as the class every creator judgement carries — and this sub-task collected none of it.** No protocol run, no date and no journey id exists for any judgement about any node. The dry run in `08_…` §10.3 is labelled a **specification instrument** on its face and carries **no evidential weight**. |
| **The cause** | Class 3's own definition is *"the creator running benchmark journeys as a first-class learner."* **Only the creator can produce it**, and it is produced **while learning** — over time, not on the schedule of an authoring pass. A sub-task that manufactured one would be inventing the creator's judgement, which is worse than having none. |
| **What was refused** | **Simulating a plausible creator judgement and filing it as real.** The dry-run entry exists, and it is labelled `dry-run` in the ledger itself, precisely so it can never be mistaken for a class 3 datum by a cold reader who finds it later. |
| **What it costs** | The loop is **specified and route-tested, never validated**. Nothing demonstrates that a real while-learning judgement fits the `CR-1` entry shape without loss, or that the class 3 provenance triple is capturable in practice mid-learning. |
| **Owner** | **The creator** — the only party who can produce class 3 evidence |
| **Closes when** | **The creator files the first real `CR-1` candidate entry** carrying a genuine protocol run, date and journey id, and it is adjudicated. |

#### `CAP-S8-2` — **the flag flip is specified end to end and executed by nobody; 179/179 remain deferred** · not closable here

| | |
| --- | --- |
| **Cap** | **`creator_review` is `"deferred-provisional"` on 179/179 non-root nodes before this sub-task and on 179/179 after it.** `08_…` §7.5 enumerates the five artifacts that change on a flip and the party authorised to change each — and **steps 3, 4 and 5 (adjudication, the `nodes/*.yaml` write, the `notes` citation) are performed by nobody today.** |
| **Why that is correct rather than a shortfall** | Reviewing the 179 nodes is **explicitly out of scope**; this sub-task specifies the loop and dry-runs it once. And `A4` forbids the filing task from adjudicating its own candidate, so even a real entry could not have been carried to a flip here. |
| **What it costs** | The path is **observable, not demonstrated**. No flip has occurred, so no step of the flip has ever been executed by a real party, and a friction that only appears at step 4 — say, that the authorised writer of `nodes/*.yaml` is not the same party as the adjudicator — would not yet have surfaced. |
| **Owner** | **The ledger's owner** for the adjudication half; **the map's owner — the creator, and whichever task next writes `nodes/*.yaml`** for the write-back half (the routing `INC-C7` and `INC-S2` already carry) |
| **Closes when** | **At least one node's `creator_review` is adjudicated away from `"deferred-provisional"` and its `notes` cite the adjudicated ledger id verbatim.** The count `179` is the honest denominator until then. |

#### `CAP-S8-3` — **no automated conformance check exists for this workflow, and `qa-execution:engine` is unconfigured** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | **Nothing mechanically verifies that a real `RR-QUARANTINE` record carries three empty slots, that a `CR-1` entry is correctly classed, or that a review record carries exactly one evidence class.** The repository's capability registry resolves `git` and `linear` only; **no capability owns the `qa-execution:engine` surface**, so an automated QA pass over this deliverable is a genuine **Core Article 8 no-op** — the phase runs inert by design. |
| **What was refused** | **Reporting a QA pass.** No engine ran, so no engine's verdict is claimed. The checks that were executed are real shell commands over the working tree (`git diff --numstat`, `git diff`, targeted scans) and are recorded as such in `traceability/08_…` §4 — mechanical, but hand-run and narrow. |
| **What it costs** | Conformance to the record schema rests on review, not on a check. **A non-conforming record — one with a filled `reason`, or two evidence classes — would be caught by a reader or not at all.** |
| **Owner** | **SUB-9 (NEU-965)** — building that check is a **gate**, and both the gate's blocking behaviour and its placement are SUB-9's on both axes; **or the creator by default** |
| **Closes when** | **SUB-9 specifies the gate and a `qa-execution` capability is registered**, at which point the record-schema checks become executable rather than reviewable. |

#### `CAP-S8-4` — **the workflow has never been run on a real content unit; the state graph is unexercised** · not closable here

| | |
| --- | --- |
| **Cap** | **Zero real content units exist to move through this workflow.** The `08_…` §10.1 walkthrough uses a constructed unit `U-DR-1` against a real node, and is a desk walk — not an execution. **No transition has ever been taken by a real reviewer on a real unit**, and no review record has ever been persisted anywhere. |
| **The cause** | C009 specifies the content system; **authoring the content is not this charter's work**, and no authoring pass has run. The workflow is therefore correct-by-construction and untested-by-construction at the same time. |
| **What it costs** | Friction that only appears in use — a role that turns out to be held by nobody, a record field that turns out to be uncapturable, a transition that turns out to need splitting — is invisible today. **A desk walk cannot find it**, and this cap is the honest statement that one was not attempted. |
| **Owner** | **The creator**, as the party who authors the first real unit |
| **Closes when** | **At least one real content unit reaches a terminal state through an enumerated transition**, leaving a persisted review record chain that an auditor can read without consulting the unit's author. |


### SUB-9 — NEU-965, the enforceable quality system and the AI-judgment residuals (OUT-9, + the OUT-7 contamination carve-out)

**Model:** claude-opus-5[1m]

> **The shape of this sub-task's incompleteness, stated once so it is not re-derived from seven entries:** SUB-9 **specifies** a quality system — 89 classified requirements, 59 named gates, a quarantine definition, an escalation rule and a contamination control — and **builds none of it**. Every cap below is a consequence of that one boundary, and none of them is a reason to read the specification as weaker than it is or as stronger than it is.

#### `CAP-S9-1` — **59 gates are specified and zero are implemented; `qa-execution:engine` is unconfigured** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | **No gate named in `09_…` §4 or §7 exists as code, and none has ever run against a content unit.** The repository's capability registry resolves `git` and `linear` only; **no capability owns the `qa-execution:engine` surface**, so the QA-execution phase over this deliverable is a genuine **Core Article 8 no-op** — the extension point runs inert by design. |
| **What was refused** | **Reporting a QA pass.** No engine ran, so no engine verdict is claimed, implied or summarised. The checks that were executed are real and are recorded for what they are in `traceability/09_…` §5 and §6: one `vitest` run of a committed adversarial batch, a direct `tsc --noEmit` whose green is **vacuous** here because this change touches no TypeScript, and shell-level `git diff --numstat` and grep checks. **Mechanical, hand-run, narrow.** |
| **What it costs** | A specification never compiled against a real artifact has an **unknown defect rate**. The five gate-failure tests in `traceability/09_…` §3 are **desk-executed reasoning traces over rules**, not execution traces from a runner, and they inherit `CAP-S8-4`'s cause: no real content unit exists to run against. |
| **Relationship to `CAP-S8-3`** | SUB-8 assigned the record-schema conformance check here, on both axes. **This entry discharges the specification half** — the check is `G-RECORD-SHAPE`, `schema`, `blocks`, authoring-time (`EQ-S8-1`) — **and carries the execution half open.** |
| **Owner** | **The creator**, and whichever task first implements a gate |
| **Closes when** | **The first gate is implemented and run against a real content unit**, and a `qa-execution` capability is registered. `CAP-S8-3` closes with it. |

#### `CAP-S9-2` — **the one executed measurement bounds `MC-4`'s deterministic half only; the AI-grading stage is stubbed** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | The bounded prototype run on 2026-08-10 measured a **0/10 = 0.000** false-accept rate against a configured `overValidationCeiling` of `0.1`, with **non-zero collection** (2 files, 10 tests, all passed) and 0/5 false rejections on the valid-but-unusual fixtures. **The fixture feeds hand-encoded rubric payloads to the deterministic mapper `mapRubricToQuality`, and the AI-grading stage is stubbed.** |
| **What that means precisely** | It bounds **only `MC-4 v1.0`'s downstream deterministic half** — the half `RA5` already designates as the signal of record — and says **nothing** about whether a live AI grader would emit over-validating rubric payloads. **It is a bounded prototype, not a harness, and not an end-to-end `MC-4` measurement.** |
| **What was refused** | **Quoting `0.000` as evidence about the `AI` residual.** The measurement never reached the `AI` stage, and a false-accept rate from a stubbed grader is a fact about a mapper, not about a judgement. |
| **Why it was run early** | Whether the `AI` residual over-validates beyond `MC-4`'s ceiling is an **input** to the enforcement-gap analysis, not a footnote to it. The honest answer turned out to be that the available measurement does not reach the `AI` stage at all — **which is itself the finding**, and it is why `OI-S9-14` reads as it does. |
| **Execution note** | Executed in the shared checkout rather than the worktree, after `git diff --stat` proved the five target files byte-identical to `origin/develop`. **Disclosed rather than presented as a worktree run.** |
| **Owner** | **The creator** |
| **Closes when** | **The adversarial batch runs with the AI-grading stage live**, producing an end-to-end `MC-4 v1.0` observation. |

#### `CAP-S9-3` — **two of sixteen residuals carry no compensating gate at all** · not closable here

| | |
| --- | --- |
| **Cap** | `09_…` §3.4 requires every requirement classified `AI` to carry a compensating observable gate **or** the literal `none — cap` with a named owner. **Two carry `none — cap`:** `OI-S9-9` (whether a candidate node is a genuine S8 residual) and `OI-S9-16` (whether a specified gate is buildable as specified). |
| **Why no gate is proposed for `OI-S9-9`** | The judgement is about whether SUB-5's `D-S1` cascade genuinely declines, which requires the **map owner's** view of the cascade. No gate on the content side can produce it, and inventing one would be this package deciding a map question. `G-NO-RETYPE` blocks the *wrong* answer without producing the right one. |
| **What it costs** | Two obligations are held entirely by judgement with no mechanical bound whatsoever — not even a partial one. **They are the weakest points of the system, and they are named as such rather than given a decorative gate.** |
| **What was refused** | **Attaching a plausible-sounding gate to make the table read complete.** A gate that does not bound the obligation it is listed against is worse than `none — cap`, because it removes the row from a reader's attention. |
| **Owner** | **The map's owner** for `OI-S9-9`; **the creator** for `OI-S9-16` |
| **Closes when** | The map owner adjudicates `05_…` §6's routes (`OI-S9-9`), and the first gate is implemented (`OI-S9-16`). |

#### `CAP-S9-4` — **the contamination probe's only available instance is a single-model package, and the designed probe was not executed** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | `09_…` §10.3 designs a tautological-invariant probe for a cold reviewing agent. **It was not executed.** Running it here would require the reviewing agent to be the authoring model — precisely the `C-3` violation the probe exists to detect — and a probe whose subject is its own author produces a result of **zero evidential value**. |
| **What was refused** | **Running it anyway and reporting a pass.** |
| **What was produced instead — a real, checkable, negative finding** | The `C-3` check applied to the one recorded AI correctness review in the package (`08_…` §10.1 row 4, `evidence_class: 4 [ai-critique]`) **FAILS**: author model and reviewer model are the same id, and all C009 documents carry `**Model:** claude-opus-5[1m]`. **No independent AI confirmation exists anywhere in C009.** |
| **What it costs** | The contamination control's **accounting half is specified and its detection half is unexercised.** `C-5` states in the policy body — not in a footnote — that contamination is not detectable in general, so `C-1`–`C-4` are never read as a detection capability. Model attribution is also **self-declared**: the check compares declared identity, not training-corpus overlap. |
| **Available method, unused** | `dry-run/02_…` and `dry-run/03_…` each ran a **`claude-sonnet` cold agent** as probe subject. **The cross-model method exists in this package; it has never been pointed at a correctness review.** |
| **Owner** | **The creator** |
| **Closes when** | The probe is executed by a model that authored nothing under review, or a `C-3`-conforming cross-model correctness review is recorded. |

#### `CAP-S9-5` — **the request-budget rule has never been exercised, because the access gate shuts every source first** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | `09_…` §6.3's rule — a re-check is sanctioned iff `now − last_verified_at ≥ per_citation_staleness_window` **and** the source's re-check count in the current budget period `< per_source_revalidation_budget` — **has never been evaluated against a real citation.** `G-ACCESS-GATE` condition 2 shuts all twelve sources before `G-BUDGET` is reached (`CAP-S3-1`), and **zero requests have been made to any source.** |
| **The two parameters are read, not chosen** | `per_citation_staleness_window` is **SUB-10's (NEU-966)** — choosing it would decide drift's cadence on SUB-10's behalf, and cadence is most of drift detection. `per_source_revalidation_budget` is **the source's own stated rate limit, recorded in `01_…` §3**, which reads `unestablished at cutoff ⇒ restricted` for all twelve today; choosing it would be this package inventing a rate limit for a source whose terms nobody has read — a §7.3 invented-authority failure in the retention direction. |
| **The placeholder pair is declared, not chosen** | `W = 90 days`, `B = 1 per source per day`, used **only** to demonstrate that the rule discriminates (one PASS case, one BLOCK case in `09_…` §6.3). **They bind nothing, and no artifact anywhere in this package carries them.** |
| **What it costs** | A rule that has never fired is a rule whose failure modes are unknown. **The demonstration is a desk evaluation of two constructed cases, not two observed re-checks.** |
| **Owner** | **SUB-10 (NEU-966)** for the staleness window; **SUB-1 (NEU-957)** for the per-source limits |
| **Closes when** | **`CAP-S3-1` closes** — at least one source's access gate opens and one citation is verified, making a second look at it a real event. |

#### `CAP-S9-6` — **no serve-time surface exists to place a gate on, and the attribution obligation's render half is not gated here** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | `09_…` §7 places **exactly one** gate at serve-time — `G-DRIFT`, the citation-drift re-check, the single legitimate `both`. **No learner-facing serve surface exists**, so the placement is specified against a surface that has not been built. |
| **What is deliberately not gated** | SUB-1 §7.2 item 1 requires attribution *"visible without interaction"* on every artifact reaching a learner. That is a **surface obligation** owned by the learner-facing surfaces (**NEU-891**, **NEU-892**), and **this sub-task declines to place a gate on a surface that does not exist and whose owner is another charter's.** The record-side half is gated at authoring time by `G-ATTRIB-RECORD` (`EQ-S1-8`); **the render-side half is this cap** — recorded rather than quietly counted as covered. |
| **What is not designed here** | **Drift detection itself is SUB-10's (NEU-966).** `09_…` decides `G-DRIFT`'s *placement* and its cached-asynchronous form; it designs no detection, and SUB-10 is named as the gate's owner. |
| **What it costs** | The one serve-time placement is untestable, and the attribution obligation's most learner-visible half has no gate in this package at all. |
| **Owner** | **NEU-891 / NEU-892** for the surfaces; **SUB-10 (NEU-966)** for drift detection |
| **Closes when** | A learner-facing serve surface exists and the two placements are realised on it. |

#### `CAP-S9-7` — **the classification inherits the interim field set and does not test the wider one** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | Every citation gate is written against `stable_id` + `canonical_url` — the interim stored set in force while **`CH-F5-1`** is open (`DR-C09-01`, `CAP-S1-2`). **The wider disposition is specified in `09_…` §6.4 and has never been exercised.** |
| **What was refused** | **Widening the set, arguing for widening it, or designing a gate that needs a field the interim set does not store.** No gate in `09_…` §4 requires such a field — that is a design constraint honoured deliberately, not a coincidence — and **this sub-task's need for a wider set is nil**, which is stated so it cannot be cited as pressure in either direction. |
| **What it costs** | The both-dispositions clause is **desk-verified**: it states what changes under each resolution (`G-FIELDSET` widens by declaration, no citation is re-resolved, no gate is rewritten) without any of it having been run. **`CH-F5-1` is cited by id and is neither restated nor re-owned here.** |
| **Owner** | **The ledger's owner (C005 schema)** for `CH-F5-1`; **SUB-1 (NEU-957)** for `CAP-S1-2` |
| **Closes when** | **`CH-F5-1` resolves in either direction.** If it resolves against the wider set, nothing changes at all — the narrow record is already the produced shape (`03_…` §7.3). |

### SUB-10 — NEU-966, citation drift detection and revalidation (OUT-10, + the OUT-9 self-classification of its own requirements)

#### `CAP-S10-1` — **the staleness window is declared, not measured** · not closable here

| | |
| --- | --- |
| **Cap** | `10_…` §5.2 sets **`per_citation_staleness_window` = 90 days**. The figure is derived as a **band** — bounded below by the repeat traffic a shorter window generates against sources whose rate limits nobody has read, bounded above by the exposure a longer one accepts — and then **chosen inside that band with no measurement of any kind**. |
| **The cause** | Validating a window requires observing drift; observing drift requires re-checking real citations over time; **there are no citations** (`CAP-S10-2`) and no source may be requested (`CAP-S3-1`). The measurement is not merely unfunded, it is currently unperformable. |
| **What was refused** | **Presenting the number as calibrated.** `09_…` §6.3 used `90 days` as a declared placeholder that bound nothing; this document adopts the same figure **as a value** and explicitly declines to cite the agreement as corroboration — an illustration re-read as evidence is the laundering this package exists to prevent. |
| **What it costs** | **The window's error is unbounded and unknown.** Too long and a drifted citation keeps its placement for up to 90 days; too short and the re-check rate approaches a poll against sources whose limits are unread. Neither cost is quantified. |
| **Owner** | **The creator** |
| **Closes when** | A drift-rate observation exists for **any** source over **any** verified citation. **The passage of time closes nothing.** |

#### `CAP-S10-2` — **the corpus is empty; the detector has never run against a real citation** · not closable here

| | |
| --- | --- |
| **Cap** | **This sub-task specifies drift detection for a citation corpus that does not exist.** Verified citations in this package: **zero**. Cluster citation coverage: **0 of 4**. Dated `V5`/`V6` verification observations — the baseline three of the five signals compare against: **zero**. Requests issued by any C009 sub-task, ever: **zero**. |
| **The cause** | **All twelve sources carry access disposition `Restricted`** (`01_…` §3, restricted-by-default) and the sanctioned access hierarchy **halts at `V0`** (`03_…` §5). `CAP-2` was declined. SUB-3 produced no seed set, not because its procedure is incomplete but because the gate beneath it is shut. |
| **What was refused** | **Assuming citations exist to drift.** No specimen in `traceability/10_…` is presented as a real citation; every identifier is an explicit placeholder (`C2`, incident `EXC-1`). **And treating outbound network capability as authority** — capability was confirmed against a neutral, non-source endpoint (`03_…` §4.3), which fires `CAP-S1-1`'s revision trigger (`OI-S3-2`) and **does not open the gate**. Only SUB-1's dated rights re-verification does. |
| **What it costs** | Every rule in `10_…` is **specified and unexercised**. The signal set's miss rate, the window's fitness and the retention discipline under a real response are all unknown, and `OI-S10-1`, `OI-S10-2` and `CAP-S10-3` carry those three separately. |
| **Owner** | **SUB-1 (NEU-957)** for the rights re-verification that would reopen the gate; **SUB-3 (NEU-959)** for the seed set thereafter |
| **Closes when** | At least one citation is verified under `03_…` §5 and carries a dated verification observation a re-check could compare against. |

#### `CAP-S10-3` — **the retention audit is vacuous, not demonstrated** · not closable here

| | |
| --- | --- |
| **Cap** | `10_…` §3.3 binds a whole-list API response with SUB-1's retention disposition and specifies that **only the per-citation dated verdict** is retained. **No whole-list response was ever received**, because none was requested and none could be. The audit therefore passes **vacuously**. |
| **What was refused** | **Reporting the vacuous pass as a demonstrated one.** Recorded in the same shape SUB-3 §8 recorded its own, deliberately, so the two read alike to a cold reader. |
| **What it costs** | **Nothing here establishes that the retention discipline holds under a real enumerating response** — in particular that a verdict cache does not become a list cache under implementation pressure, which is `G-ENUM-SCAN`'s exact failure with a cache's name on it. |
| **Owner** | **The creator**, and whichever task first issues a re-check on a recorded API path |
| **Closes when** | A re-check runs against a real whole-list response and the retention check is executed for real. **A future pass must not cite `10_…` §9 as precedent that it passes.** |

#### `CAP-S10-4` — **no serve surface, no verdict cache, no scheduler exists** · not closable here

| | |
| --- | --- |
| **Cap** | `10_…` places the drift check at serve time as the package's single legitimate `both` — **on a learner-facing surface that has not been built** (`CAP-S9-6`; NEU-891 / NEU-892). The cached-verdict rule (§5.1), the queue-and-degrade rule (§5.6) and the learner-visible degradation (§6.5) are likewise specified against **machinery that does not exist**: no verdict cache, no scheduler, no monitor. |
| **What is NOT designed here** | **Implementing any of it**, which is out of scope by charter and belongs to a later implementation charter. This sub-task states the requirements the machinery must satisfy and stops. |
| **What it costs** | An implementation that computed the drift verdict **on the serve path** rather than reading a cached one would violate `09_…` §3.3's bar on executions in a learner's latency path — and **the desk runs in `traceability/10_…` would not catch it**, because they exercise the specification, not an implementation. |
| **Owner** | **NEU-891 / NEU-892** for the surfaces; **a later implementation charter** for the cache and scheduler |
| **Closes when** | A serve surface and a verdict cache exist and the placement is realised on them. |

#### `CAP-S10-5` — **the drift simulations are desk-executed by the producing task** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | The ten cases in `traceability/10_…` are **manual construction and inspection against constructed specimens**, in the `03_requirement-decision-mapping-gate.md` §4 shape. **No code was written, no store was touched, no fetch was performed**, and **every baseline observation the specimens compare against is itself constructed.** |
| **What it is evidence of** | That **the specified policy has the property** — every enumerated change fires a signal, every unmatched change routes to `suspected drift`, and no case passes silently. **Not** that an implementation of it does, and **not** that a real source's real change would fire the signal the specimen's did. |
| **The mitigation, and its limit** | Each case was made **mechanical** — a fixed specimen, a fixed baseline, and a pass condition written **before** the result — which bounds how much a self-check can flatter itself. **It does not eliminate it.** One pass, by the producing task, inherited from `CAP-S1-4` / `CAP-S2-5`. |
| **Owner** | **SUB-11** at standards-conformance review; **SUB-12 (NEU-969)** at package reconciliation |
| **Closes when** | The simulations are re-run by a party other than the producing task, against a real citation. |

#### `CAP-S10-6` — **the interim field set is inherited; the wider disposition is desk-verified only** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | Three of the five drift signals (`D3` title, `D4` constraints, `D5` difficulty) compare against values the **interim stored set does not hold**. `10_…` §4 specifies both `CH-F5-1` dispositions and enforces the narrow one, taking the baseline from **SUB-3's dated verification observations**. **The wider disposition has never been exercised.** |
| **What was refused** | **Storing any additional field to make detection easier**, under any branch. The observation-based baseline was chosen *because* those observations already exist outside the stored record, exactly as `03_…` §7.2 designed them. **This sub-task's need for a wider set is nil**, stated so it cannot be cited as pressure in either direction. |
| **What it costs** | The both-dispositions clause is **desk-verified**: `10_…` §4 states that the signals, thresholds and degradation rule are unchanged under either resolution without any of it having been run — and, since zero dated observations exist (`CAP-S10-2`), **the interim baseline has never been read either**. |
| **Owner** | **The ledger's owner (C005 schema)** for `CH-F5-1`; **SUB-1 (NEU-957)** for `CAP-S1-2` |
| **Closes when** | **`CH-F5-1` resolves in either direction.** If it resolves against the wider set, nothing changes at all — the observation-based baseline is already the produced shape. |

### SUB-11 — NEU-967, the package end-to-end proof, four cluster exemplars and both acceptance scenarios (OUT-11, + the OUT-2 standards-conformance review and the OUT-9 self-classification of its own requirements)

#### `CAP-S11-1` — **the seven observable elements could not be verified against the charter's own enumeration** · not closable here

| | |
| --- | --- |
| **Cap** | `11_…` §2.3 fixes the rubric's **seven observable elements** as `E1`–`E7`, derived from what the two acceptance scenarios demand, because the charter's requirement for "seven observable elements" is not enumerated in a form this sub-task could copy verbatim. **No gate is possible from this side**: a gate checking `E1`–`E7` would check this document's own list against itself. The `EQ-S11-22` row therefore carries the literal **`none — cap`**, per SUB-9 §3.4. |
| **What was refused** | **Inventing a plausible seven and presenting them as quoted.** `11_…` §2.3 states in its own words that the list is fixed here and not quoted, and files `OI-S11-1` for the reconciliation. |
| **What it costs** | If the two lists differ, **every rubric row in `11_…` §5 is mislabelled** — though each observation beneath the labels stands on its own, having been recorded independently. That bound is the reason this is a cap and not a defect. |
| **Owner** | **SUB-12 (NEU-969)** at package reconciliation — the only party positioned to read the charter's enumeration against `11_…` §2.3 |
| **Closes when** | A reader holding the charter's own enumeration compares the two lists. |

#### `CAP-S11-2` — **the standards-conformance review is run by the party that authored the artifacts it reviews** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | `11_…` §4 is the standards-conformance review `CAP-S4-3` assigns to SUB-11 — and it is run **against four exemplars SUB-11 wrote, to satisfy the standards it then applied.** Of 16 standard × exemplar cells, **8 produced a verdict, and all 8 are the two mechanical layers of a single standard.** `CAP-S1-4`'s lineage applies in full: an author checking its own completeness shares the author's blind spots by construction. |
| **The mitigation, and its limit** | The 8 ran checks are **mechanical** — field presence, node-id resolution, string non-equality modulo a negation token — and every one is **re-runnable by a third party** from `traceability/11_…` §2–§4 at a stated commit base. That bounds how much a self-check can flatter itself. **It does not eliminate it, and it is not independence.** |
| **What was refused** | **Reporting "0 violations detected" as a pass.** `11_…` §4.5 states the zero alongside what produced it, in the same breath, rather than in a summary row. |
| **What is NOT claimed** | That the four exemplars conform to SUB-4's standards. Only that the mechanical layers that ran, ran clean — and that **two of the standards' twelve checks are structurally unable to run at all** (`OI-S11-3`, `OI-S11-4`). |
| **Owner** | **The correctness-reviewer role** for an independent re-run; **SUB-12 (NEU-969)** at package reconciliation |
| **Closes when** | The review is re-run against these four exemplars by a party other than the producing task. |

#### `CAP-S11-3` — **the end-to-end proof is desk-executed; nothing passed through any pipeline** · not closable here

| | |
| --- | --- |
| **Cap** | The charter's word is *prove*, and **there is nothing to run.** `CAP-S9-1` and `OI-S9-16` record 59 gates specified and **zero built**; `CAP-S8-4` records that the workflow has never run on a real content unit; `CAP-S3-1` records **zero verified citations**; `CAP-S8-2` records `creator_review: "deferred-provisional"` on **179/179** nodes. **No exemplar was passed through a pipeline, because no pipeline exists**, and `11_…` never says one was. Every `blocks` / `quarantines` verdict in `11_…` §6 is a **specification** verdict. |
| **What it IS evidence of** | That the package's specifications **compose**: a node record, a placement matrix, ten form templates, four correctness standards, a difficulty rule, an evidence-signal map, a workflow and a 59-gate scheme were pointed at four real nodes **together**, and the seams they produce are enumerable. Three seams were found this way — `OI-S11-2`, `OI-S11-3`, `OI-S11-4` — none of which was visible to any sub-task alone. |
| **What it is NOT evidence of** | **That any of it works in use.** No gate ran, no unit moved, no creator confirmed anything, and no learner saw anything. |
| **Evidence class, stated honestly** | The four exemplars and both scenario walks are **3 `[dogfooding]`, n = 1, producing task** — the same class and the same n as `dry-run/06_corpus-swap-verification.md` §6, and **never** class 4, 5, 6 or 7. The node-record reads, id resolutions, triple computations and reference scans are **2 `[code-evidence]`** and are genuinely exercised. **Class 7 `[future-real-user]` does not exist for this package and no claim here is class 7.** |
| **What was refused** | **Manufacturing a pass.** The charter asks for a proof; the honest deliverable was a per-limb class-labelled account of which limbs are exercised, which are simulated and which are unreachable — and the **finding**, not a pass, is what `11_…` reports. |
| **Owner** | **The creator** for the build; **a later implementation charter** for the gates and the workflow machinery |
| **Closes when** | At least one gate is implemented and at least one real content unit is passed through it end to end. |

---

### SUB-13 — NEU-968, the package's decision, risk, metric and prototype records (OUT-11, the four C005-shape records only, + the OUT-9 self-classification of its own requirements)

**Model:** claude-opus-5[1m]

**One cap is filed by this sub-task.** Every other limitation it encountered is either an existing cap **cited by id and not re-owned** (`13_…` §3.2, §3.3, §6), or an open item with a named owner in `90_…` § `SUB-13`.

#### `CAP-S13-1` — **the four records' completeness is a judgment over prose, and no mechanism can prove an unenumerated item is absent** · not closable by any scan

| | |
| --- | --- |
| **Cap** | `13_…` publishes four records — decisions, risks, metrics, prototypes — assembled by reading twelve merged topic documents, three `decision-records/`, three `dry-run/` specimens and the published `NEU-890` umbrella. **Completeness is asserted by a lexical-plus-judgment read, by the party that produced the read.** `CAP-S1-4`'s lineage applies in full: an author checking its own completeness shares the author's blind spots by construction. |
| **The mitigation, and its limit** | Every row cites the artifact and section it was built from, so **any single row is checkable by a third party without re-reading the package**, and every figure the records publish was **re-derived mechanically** rather than copied from a predecessor's summary line — which is how `OI-S13-1` was found at all. That bounds how much a self-assembled register can flatter itself. **It does not make the set complete, and it is not independence.** |
| **The specific residual it carries** | `13_…` §7.3 records **`EQ-S13-7`** — *"no metric is defined locally and no frozen contract is redefined"* — as an `AI`-judgment row with **no compensating observable gate that can be named today**. The boundary between reporting a derived number (`MET-11`, `MET-12`) and defining a metric is a reading judgment, and it is where an unnoticed local definition would sit. Recorded as an uncompensated residual rather than assigned to a gate that would not detect it, in the same shape as `CAP-S9-3`'s two uncompensated residuals. |
| **What was refused** | **Reporting the four records as complete.** `13_…` §0 states what it found rather than that it found everything, §7.4 carries a standing residual clause, and `OI-S13-3` files the completeness question with an owner instead of closing it. **Also refused: correcting `11_…` §10.2 in place** — a unilateral edit of another sub-task's published table, even a correct one, is what the append-only convention exists to prevent, so the discrepancy is routed at `OI-S13-1`. |
| **What is NOT claimed** | That every material decision, risk, metric and prototype this package produced appears in `13_…`. Only that everything that does appear is cited to a retrievable source, and that the charter's own 14-row risk set is carried **complete and inline** against a source (`NEU-890`, taken 2026-08-11) a later reader can retrieve without `_local/`. |
| **Owner** | **SUB-12 (NEU-969)** at package reconciliation, as the only party that reads all thirteen sub-tasks against the charter's outcome list; **the correctness-reviewer role** for an independent re-read of the four records |
| **Closes when** | A party other than the producing task reads the twelve predecessor documents against `13_…` §2, §3, §5 and §6 and finds no unenumerated material item — **or** finds one, which closes it in the other direction. |
