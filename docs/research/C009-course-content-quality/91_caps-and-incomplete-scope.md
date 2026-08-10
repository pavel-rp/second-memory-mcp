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

