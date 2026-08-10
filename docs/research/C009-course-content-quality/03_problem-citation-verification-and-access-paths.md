# Problem-Level Citation Verification, the Sanctioned Access Hierarchy, and the Disposition of `CAP-2`

**Task:** NEU-959 (SUB-3) · **Charter:** C009 (umbrella NEU-890) · **Covers:** OUT-3, and OUT-1's second fabrication-probe run · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Status:** deferred — set only in `adjudication/` (this package) and, for the inherited C005 decisions and this sub-task's `CAP-2` proposal, in `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` and `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md`
**Model:** claude-opus-5[1m]

---

## 0. The result, stated first

This sub-task was commissioned to produce a seed set of verified problem-level citations and to close `CAP-2` by evidence. **It ships the procedure, the selection criteria, the record shapes and the second probe run. It does not ship a verified citation, and it does not close `CAP-2`.**

The reason is neither a method failure nor a schedule failure. It is a **precondition failure, and the precondition is one this sub-task is expressly forbidden to re-decide**:

> **SUB-1's per-source access-permission record (`01_provenance-and-rights.md` §3) records all twelve sources — every one of `T1`–`T6` and `C1`–`C6` — with access disposition `Restricted` at the 2026-08-10 cutoff.** The charter's own Branch C rule states that **a source SUB-1 recorded as restricted is not fetched**, and `01_provenance-and-rights.md` §3.1 binds SUB-3 to **consume that record and never re-decide it**. Twelve restricted rows over a six-corpus selection means **no source has a fetchable row on any branch of the hierarchy**, so the sanctioned hierarchy has no reachable leaf and the seed set is necessarily empty.

**This is the correct outcome, not a degraded one.** The alternative — fetching a source whose access row reads `Restricted` because this sub-task judged the restriction to be merely default rather than observed — is precisely the local re-decision that §3.1 clause 1 forbids, and precisely the "a successful fetch is evidence about reachability, never about rights" laundering that §7.3 lists as a review-stopping defect. **An unverifiable value is refused, never invented, and an unreachable source is capped, never fetched anyway.**

**One material new fact is recorded here and it is the fact that unblocks the cap.** §4.3 records, as a dated class 2 `[code-evidence]` observation against a **neutral non-source endpoint**, that **outbound network capability exists in this execution environment**. `CAP-S1-1`'s and §11.2's named revision trigger is *"network access becomes available to a re-verification pass."* **That trigger has now fired.** What is still missing is not capability — it is the **authority** to use it, which belongs to a SUB-1-owned dated re-verification pass and not to SUB-3.

| Deliverable | State |
| --- | --- |
| The verification procedure, re-executable, identical on both paths (§5) | **Ships.** |
| The selection criteria, graph-node-derived, with a residual clause (§6) | **Ships.** |
| The citation record, specified for **both** `D-F5` dispositions (§7) | **Ships.** Branch A discharged. |
| The access-path record — every path attempted, its outcome, its date (§4, `traceability/03_…`) | **Ships.** |
| The request-pattern audit and the retention audit (§9) | **Ships.** Both vacuously clean — see §9. |
| A seed set of verified citations spanning CL-1…CL-4 | **Does not ship.** Zero entries. Four cluster caps, `CAP-S3-1`. |
| `CAP-2` closed by evidence | **Declined.** `CAP-S3-2`; ledger entry `D-R5`. |
| The second fabrication-probe run (§10, `dry-run/03_…`) | **Ships.** |

---

## 1. What this document is, and what it is not

**It is** the OUT-3 deliverable: a written, re-executable definition of what "verified" means for a problem-level citation, the sanctioned path each source would be resolved through, the criteria by which a problem is tied to a graph node, and the honest record of what happened when that procedure met this repository's actual preconditions.

**It is not** a corpus, a candidate list, or a shortlist. It names **no problem identifier and no problem-level URL of any of the twelve sources**, because §2 of `01_provenance-and-rights.md` forbids recording *which* problems a source has, and because this sub-task has verified none. A document about citation that contained an unverified citation would refute itself in its own body.

**It sets no status.** The `CAP-2` proposal's status lives in `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` (`D-R5`); the field-set question's lives in `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md` (`CH-F5-1`). **A producing task may not promote its own artifact** (`A1`–`A5`), so this document argues and files; it does not adjudicate.

---

## 2. The preconditions this sub-task consumes and does not re-decide

Four inherited dispositions bind before the first request. Each is **consumed** — cited by id, never restated as this sub-task's own finding and never re-derived.

| Precondition | Source | What it binds here |
| --- | --- | --- |
| **The per-source rights disposition** (12 rows, dated 2026-08-10) | `01_provenance-and-rights.md` §1 | 11 of 12 inform-only or cite-only; T1 alone reusable. Nothing is reproduced from any of them. |
| **The per-source access-permission record** (12 rows, dated 2026-08-10) | `01_provenance-and-rights.md` §3 | **All twelve read `Restricted`.** This is the row that governs §4's outcome. |
| **The enumerating-response retention disposition** | `01_provenance-and-rights.md` §6 | Retention, not request count. Checked **before** the first request on path (1) — see §8. |
| **The permitted stored field set** | `01_provenance-and-rights.md` §4.1, `DR-C09-01`, `CH-F5-1`, `CAP-S1-2` | **`stable_id` + `canonical_url` only.** Never widened locally; see §7. |

**The ordering property matters and is preserved.** Every one of the four is dated **at or before** this sub-task's cutoff. None was written after a request went out, because **no request went out** (§9). A precondition produced after the first request is not a precondition, and this sub-task does not create that defect.

**The provisional-data caveat, recorded rather than assumed away.** SUB-1 had no network access, so all twelve access rows resolve to `Restricted` by the **restricted-default rule** (`00_method-and-provenance.md` §4.4), **not by an observed refusal**. `CAP-S1-1` says so in its own words. **This sub-task does not read them as verified-restricted**, and §4.2 states exactly what follows from that distinction — which is *less* than it might appear, and the reason is a question of standing rather than of evidence.

---

## 3. The sanctioned access hierarchy, restated as this sub-task will execute it

Inherited from charter assumptions 23 and 24, both **confirmed**. Restated here only to fix the order of operations; the hierarchy itself is not this sub-task's to design.

| Step | Path | Applies to | Rule |
| --- | --- | --- | --- |
| **Gate** | **The source's SUB-1 access-permission row is read** | every source, always | **Checked before the first request on any path.** A source recorded `Restricted` is **not fetched**; its scope reduction is a **cap with a named owner**, not a judgment call made here. |
| **(1)** | The source's **documented public API**, where one exists | **C4 only** (`api.codeforces.com`) | One call to resolve one already-selected problem. An enumerating response is bound by **retention** (§8), not by request count. |
| **(2)** | A **single targeted fetch of one problem by its id** | every source with no documented API — **C1, C2, C3, C5, C6** and all of `T1`–`T6` | **One request per cited problem.** The same request a learner's browser makes. Robots directives and stated rate limits respected. Each resolution dated and recorded. |
| **✗** | **Bulk enumeration, crawling, corpus walks** | **nobody, on any branch** | **PROHIBITED under every disposition and never the fallback when a sanctioned resolution fails.** This is the activity that produced `CAP-2`'s 403. |

**Two properties of this table are load-bearing and are stated rather than left to inference.**

1. **The gate precedes both paths.** It is not step 0 of path (2) — it is a gate on the whole hierarchy. A source that fails the gate has **no reachable branch**, which is a materially different state from "the API failed, fall to the single fetch."
2. **Failure never widens the method.** Path (1) failing falls to path (2). Path (2) failing ends the source's hierarchy. **Neither failure ever falls to a bulk method**, and no schedule pressure converts a cap into a licence. Scaling the fallback is the specific failure mode Branch C is written against.

---

## 4. The access-path record — what was attempted, what happened, and when

The full per-source record, with one row per source and per attempted path, is `traceability/03_access-path-and-verification-record.md`. This section states its result and the one new observation.

### 4.1 The gate result — twelve of twelve

**Every one of the twelve sources fails the access gate at the 2026-08-10 cutoff.** Each carries access disposition `Restricted` in `01_provenance-and-rights.md` §3. Under the Branch C rule a restricted source is not fetched, so:

- **Path (1) was not exercised for C4.** The one source with a documented public API on record fails the gate before its API is reachable, so `api.codeforces.com` was never called and `problemset.problems` was never requested. **No enumerating response was ever received**, which is why §8's retention check is vacuous rather than passed-by-inspection.
- **Path (2) was not exercised for any source.** No targeted fetch of any problem by any id was issued to any of `C1`, `C2`, `C3`, `C5`, `C6` or any of `T1`–`T6`.
- **No bulk method was exercised, considered as a fallback, or scheduled.** Under the gate's outcome it was not even reachable as a temptation: there was no failed sanctioned attempt for it to be the fallback *to*.

**Total requests issued by this sub-task to any of the twelve sources: zero.** §9 audits that claim.

### 4.2 Why "restricted by default" does not license a fetch here

This is the one judgment in this document that could plausibly have gone the other way, so it is argued rather than asserted.

The tempting reading is: SUB-1's rows read `Restricted` only because SUB-1 could not read a `robots.txt`, not because any source refused anything; a default is not a finding; therefore a source whose restriction is merely default may be fetched once, carefully, by a sub-task that *can* read its `robots.txt` first.

**It fails on standing, not on plausibility** — and it fails three times over:

1. **SUB-3 may not re-decide an access row.** `01_provenance-and-rights.md` §3.1 clause 1 is explicit: SUB-3 *"reads it before it resolves anything … and files a challenge if it believes a row is wrong — it does not overwrite a row, and it does not form its own view of a source's disposition."* Treating `Restricted` as `probably-fine` **is** forming its own view.
2. **Only one route promotes a restricted row, and it is not this one.** §11.2 states it in the singular: *"Network access becomes available to a re-verification pass — every 'unestablished at cutoff ⇒ restricted' row of §3 is re-read against the source's own terms and re-dated. **This is the only route by which a restricted row becomes permissive.**"* That pass is a **rights re-verification**, owned by SUB-1 as OUT-7's residual owner (§11.2's residual clause). Reading a source's `robots.txt` and terms **is** that pass — it is not a preliminary step SUB-3 may perform on its way to a citation, and SUB-3's own charter puts *"deciding … the per-source access permission"* **out of scope** in as many words.
3. **The failure direction is the safe one and the cost of being wrong is asymmetric.** If this reading is over-cautious, the cost is a cap with a named owner and a one-line trigger — recoverable in a single downstream pass. If it is wrong in the permissive direction, the cost is a rights breach committed against a source whose terms nobody has read, recorded in a package whose entire claim is that it does not do that. **Over-restriction that blocks a sub-task is visible and fixable; a rights breach dressed as a verification is neither.**

**What this sub-task does instead of fetching** is exactly what the discipline prescribes: it records the gap, names the owner, states the trigger, and files the cap (`CAP-S3-1`, `CAP-S3-2`) and the open items (`OI-S3-1` … `OI-S3-3`). It does not carry a single unverified id to preserve the appearance of coverage.

### 4.3 The one new observation — network capability exists

**Observation:** at 2026-08-10, an outbound HTTPS request from this execution environment to a **neutral, non-source endpoint** (`example.com`, the IANA-reserved documentation domain, chosen precisely because it is **none of the twelve sources**) succeeded and returned the expected document.

| Field | Value |
| --- | --- |
| **What it establishes** | Outbound network capability exists in the environment a C009 sub-task runs in. `CAP-S1-1`'s premise — *"no network access was available to this sub-task and none was permitted"* — **is no longer true of the environment**, whatever remains true of the authority. |
| **What it does not establish** | **Nothing whatsoever about any of the twelve sources.** No source was contacted. It is not a robots reading, not a rate-limit reading, not a terms reading, and not a permission. It is a fact about this repository's runtime, not about anybody's rights. |
| **Evidence class** | 2 `[code-evidence]` — an operational fact about a tool, which is the highest class this observation can carry. It is emphatically **not** class 1 `[literature]`, and §7.3's prohibition on laundering the two into one another is why that distinction is stated here rather than assumed. |
| **Why it is recorded at all** | Because it **fires a named revision trigger.** `CAP-S1-1` closes when *"network access becomes available to a re-verification pass"*; §11.2 names the same condition. The condition's **capability half is now satisfied and dated.** Recording it converts `CAP-S3-2` from an open-ended block into one waiting on a single, named, currently-actionable pass. |
| **Why it changes nothing here** | Capability is not authority. The re-verification pass is **SUB-1's**, and this sub-task performing it would be the §3.1 category error twice over — re-deciding an access row *and* self-supplying the precondition it consumes. |

---

## 5. The verification procedure — the operational definition of "verified"

**This is the artifact OUT-3 exists to produce, and it ships in full.** It is written to re-execute identically on either transport: **the definition of "verified" does not vary by access method; only the transport does.** Each step names what failure looks like, because a step whose failure mode is unstated is a step that gets waived under pressure.

A citation is **verified** when, and only when, **all seven steps below return PASS in order** against a single dated resolution.

| # | Step | What PASS requires | What FAILURE looks like | On failure |
| --- | --- | --- | --- | --- |
| **V0** | **Access-gate check** | The source's SUB-1 access-permission row is read **before any request**, and its disposition permits the intended path. | The row reads `Restricted`; or the row cannot be located; or the row's cutoff post-dates the intended request. | **Stop. Issue no request.** Record a cap with a named owner. **This is the step that halts every source at this cutoff.** |
| **V1** | **Candidate is pre-selected** | The candidate problem was selected by §6's criteria against a named graph node **before** any request was issued, and the selection record names the node. | The candidate's origin is a response, a list, a ranking, a "recommended set", or a memory of one. | **Reject the candidate outright.** A candidate sourced from a response is not repairable by re-selecting it afterwards. |
| **V2** | **Transport is sanctioned** | The request is exactly one call on path (1), or exactly one targeted fetch by id on path (2), honouring robots directives and stated rate limits. | More than one request for one citation; any enumeration, crawl or corpus walk; a rate limit exceeded; a robots directive contravened. | **Stop, record the attempt with its outcome, and record the source's hierarchy state.** Never widen the method. |
| **V3** | **Stable id resolves** | The source's own opaque handle resolves live, at a stated date, to a real problem at that source. | The id is unknown to the source; the response is an error, an empty result, or a redirect to a listing rather than a problem. | **Exclude the candidate with a recorded reason.** Never admit as "probably correct". |
| **V4** | **Canonical URL resolves** | The source's own address for that problem resolves live to that same problem, and the id and the URL agree with each other. | The URL 404s; the URL resolves to a different problem than the id; id and URL disagree. | **Exclude with a recorded reason.** A disagreeing pair is worse than a missing one. |
| **V5** | **Title and constraints match** | The title and the stated constraints at the source **match** what the selection record expected. Read **only to confirm the match** — nothing from the page is stored, mirrored or paraphrased into storage. | Title mismatch; constraints mismatch; the page cannot be read to confirm either. | **Exclude with a recorded reason.** A title mismatch is the classic signature of a plausible-but-wrong id. |
| **V6** | **Difficulty signal captured, where the source carries one** | The source's own difficulty marker is captured **as a dated verification observation** in `traceability/03_…` — **never as a stored citation field** while `CH-F5-1` is open. | The signal is written into the citation record; or a signal is recorded for a source that carries none. | **Correct the record.** A stored rating is a `CH-F5-1` breach, not a convenience. |
| **V7** | **Rights disposition re-checked** | The source's SUB-1 rights row (§1) is re-read against the intended use, **after** resolution and **independently of** it. | The disposition is inferred from the fetch succeeding, from a 200, from an absent `robots.txt`, or from the response being public. | **Stop.** Every one of those inferences is a §7.3 review-stopping defect. |

### 5.1 Four properties of the procedure, stated so a re-executor cannot mistake them

1. **It is transport-invariant.** V0, V1 and V3–V7 are byte-identical on both paths. **Only V2 differs**, and only in what counts as the one sanctioned request. A procedure that graded an API-sourced citation more leniently than a fetched one would make the access method a rights argument, which §7.3 forbids.
2. **It is all-or-nothing.** Seven PASSes or the candidate is out. There is no partial verification, no "verified except the title", and no caveated admission. **Zero unverified entries are admitted** — a candidate that cannot be verified is dropped or recorded as a cap with an owner.
3. **Its failure record is part of its output.** An excluded candidate produces a recorded reason and a dated attempt, not silence. That is what makes a future block distinguishable from a wrong method.
4. **It is idempotent under re-execution.** Re-running it at a later date against the same seed set must reproduce the same verdicts, or the difference is itself a finding (drift — **SUB-10's**, not this sub-task's).

---

## 6. Selection criteria — tying a problem to a graph node

**The governing rule, stated before the criteria, because it is the one that has teeth:**

> **A candidate is selected from this package's own criteria against a named graph node, before any request is issued. No sanctioned response is ever the origin of a selection.**

This is not a preference about ordering. It is the operative half of §2's selection-and-curation bright line: choosing *from what a source returned* imports the source's selection and its ranking, which is exactly the curation this project may not reproduce — **independently of whether a single byte of statement text is involved.**

### 6.1 Inclusion criteria — all four must hold

| # | Criterion | Why it is required |
| --- | --- | --- |
| **S1** | **The problem exercises the node's technique as its defining difficulty** — not incidentally, and not as one step of a harder composite. | A problem where the node's technique is a minor step teaches the learner that the node is easy or irrelevant. |
| **S2** | **The node is named, and it exists in the map** — a real node id from `../C005-dp-map/`, in one of CL-1 (foundational / linear-sequence), CL-2 (combinatorial / structural), CL-3 (state-encoding and specialized-domain), or CL-4 (DP-optimization). | A citation against an invented or absent node is a fabrication in the other direction, and `EXC-1` shows how readily that direction fires too. |
| **S3** | **The problem's prerequisites are at or below the node's own prerequisite depth**, so the citation is solvable by a learner who has reached the node and no further. | A citation that requires unmapped downstream material is a citation for a different node. |
| **S4** | **The source is one of `C1`–`C6`** as selected by `D-F2`, and its rights and access rows are read before selection is acted on. | Corpora are not re-selected here; a blocked source is a cap, never a reason to substitute an easier corpus. |

### 6.2 Disqualifiers — any one disqualifies

| # | Disqualifier | Why |
| --- | --- | --- |
| **X1** | The candidate's **origin is a returned list, ranking, or "recommended set"** — including one returned by a sanctioned request. | §2 and §6 of `01_provenance-and-rights.md`. **This is the disqualifier the retention rule exists to enforce**, and it cannot be cured after the fact. |
| **X2** | The problem's difficulty is dominated by material the map does not own. | It tests something else. |
| **X3** | The node belongs to the **10 `INC-C1` techniques** — the CL-4-by-cascade seam class. | **They have no nodes**, so there is nothing to source against. Named explicitly because the seam is a known, documented gap and a sourcer who did not know it would burn a request on a node that does not exist. |
| **X4** | The problem's statement would need to be stored, mirrored or paraphrased for the citation to be useful. | The no-text rule. A citation that only works if you copy the statement is not a reference-only citation. |
| **X5** | The candidate cannot be verified under §5. | Zero unverified entries. |

### 6.3 The residual clause

> **These criteria govern any node not enumerated in a seed set.** A seed set is **representative and explicitly not exhaustive**; a node absent from it is sourced later by exactly this rule, with no new criteria invented at that time and no re-derivation of these.

This clause is what makes the criteria the deliverable rather than the seed set. **At this cutoff the residual clause governs the entire node set**, because the seed set is empty — which is an unusual state, not a broken one: the rule is complete and re-executable, and it is the gate below it that is shut.

---

## 7. The citation record — specified for both `D-F5` dispositions (Branch A, discharged)

`CH-F5-1` is **unresolved and open** at this cutoff. Branch A therefore fires as pre-specified: the record is defined for **both** outcomes, the produced shape is the narrow one, and the unresolved field set is carried as a cap with a named owner.

### 7.1 The stored record — the only shape this sub-task may produce

| Field | Type | Source | Status |
| --- | --- | --- | --- |
| `stable_id` | the source's own opaque handle | copied from the source at V3, never constructed | **ADMITTED** — `D-F3a`'s own words |
| `canonical_url` | the source's own address | copied from the source at V4, never constructed | **ADMITTED** — `D-F3a`'s own words |

**And nothing else.** This is exactly SUB-2's form 4 (`problem-reference`), whose template refuses wider fields and which returned a 10/10 refusal under probe run 1. **Storability in that form was a design constraint on this procedure, not a coincidence** — §5 captures the title, the constraints and the difficulty signal as **dated verification observations** in `traceability/03_…` precisely so that none of them needs a stored field.

### 7.2 The record if `CH-F5-1` resolves in favour of the wider set

`title`, numeric `constraints`, `difficulty_signal` and `curriculum_placement` become admissible **with no change to this procedure**. Specifically: V5 and V6 already produce every one of those values as dated observations, so the migration is a **promotion of existing observations into stored fields**, not a re-verification. **No citation would need re-resolving**, and no step of §5 would change. That property is deliberate — it is what makes carrying the narrow set cheap rather than a debt.

### 7.3 The record if `CH-F5-1` resolves against the wider set

**Nothing changes at all.** The narrow record is already the produced shape, the observations already live outside the stored record, and no downstream artifact would have to be withdrawn.

**The wider field set is never admitted on this package's judgment**, under either branch, and this sub-task's inability to produce a seed set is **not** an argument for widening it. Carried as `CAP-S3-3`, owner **NEU-932 (`D-F5`'s owner) / the creator by default**.

---

## 8. The retention bound on path (1) — stated, and vacuously satisfied

The rule is SUB-1's (§6 of `01_provenance-and-rights.md`), consumed here and **not re-decided**. It is restated only to record that it was **in force before the first request on this path**, which is the property that makes it worth anything.

> An enumerating response is **read only to resolve the already-selected cited problem**, and is **never stored, cached, mirrored, transcribed, re-published, or used to enumerate, browse or rank candidate problems.**

**The check performed here, and its honest result:**

| Check | Result |
| --- | --- |
| Was SUB-1's dated retention disposition read **before** the first request on path (1)? | **Yes** — and trivially so: it was read before the access gate was evaluated, and the gate stopped C4 before any request. |
| Was any enumerating endpoint called? | **No.** `problemset.problems` was never requested; C4 failed the access gate. |
| Was any enumerating response received, stored, cached, transcribed, or mined? | **No response was received**, so there was nothing to retain. |
| Does any file in this package carry a serialised response body, a candidate shortlist, or an id/rating table? | **No** — audited in §9.2. |

**The distinction that must not be lost.** This is a **vacuous** pass, not a demonstrated one. **Nothing here establishes that the retention discipline holds under a real enumerating response**, because no such response was ever obtained. A future pass that actually calls `problemset.problems` must run this check for real, and must not cite this section as precedent that it passes. Recorded as `CAP-S3-4`.

---

## 9. The audits — request pattern and retention

### 9.1 Request-pattern audit

| Axis | Finding |
| --- | --- |
| Requests to each of the twelve sources | **Zero.** Accounted for by §4.1: the access gate stopped every source before any path was reached. |
| One-request-per-cited-problem | **Satisfied vacuously** — zero problems cited, zero requests issued. |
| Enumeration, crawl, or corpus walk on any branch | **None.** Not performed, not scheduled, and not reachable as a fallback, since no sanctioned attempt failed in a way that could have tempted one. |
| Every attempted path carries an outcome and a date | **Yes** — `traceability/03_…` carries one row per source per path, each dated 2026-08-10, each with the gate outcome. |
| Every source carries the path it finally resolved through | **Yes, and the recorded value is `none — gate`,** for all twelve. That is a real recorded value, not a blank: it distinguishes *"blocked at the rights gate"* from *"resolved by path (2)"* and from *"attempted and refused"*, which are three different states a future reader must be able to tell apart. |

**One neutral-endpoint request was issued and is disclosed.** §4.3's `example.com` call is recorded rather than omitted, because a request-pattern audit that quietly excluded a request the auditor made would be exactly the kind of self-serving accounting this section exists to prevent. It is **not** a request to any of the twelve sources, and it appears in the record labelled as what it is.

### 9.2 Retention audit — scans re-run over the package

Both of SUB-1's scan families (`01_provenance-and-rights.md` §5.1 and §6) were **re-run over the whole package including this sub-task's new files**, per the standing re-run obligation. Commands, dates and per-file outcomes are recorded in `traceability/03_access-path-and-verification-record.md` §4.

| Scan | Checks for | Outcome over the package **including** `03_…`, `traceability/03_…`, `dry-run/03_…` |
| --- | --- | --- |
| **A** | Statement-section markers at line start | **0 matches.** |
| **B** | Problem-level URLs of the twelve sources | **0 matches.** |
| **C** | Enumerated candidate sets — sibling rows carrying source-native problem identifiers | **0 matches.** |
| **D** | Fenced blocks carrying a sample, example, or serialised response body | The package's fenced blocks are this sub-task's probe-output blocks in `dry-run/03_…`, which carry **refusal strings only** — no identifier, no address, no statement text. |
| **E** | The enumerating endpoint by name | Matches are **policy prose only** — this document's §3, §4.1 and §8, each naming the endpoint as the subject of a prohibition or of a non-event. **No response body, quotation or summary.** |

**Outcome: PASS.** **Stated limitation, unchanged and not weakened:** these are lexical scans (`CAP-S1-5`). They prove structural absence; they cannot prove the absence of semantic paraphrase. The residual is a review obligation, inherited here rather than rediscovered.

---

## 10. The second fabrication-probe run

Full record: `dry-run/03_template-fabrication-probe-run-2.md`. Summarised here because it is one of this sub-task's two headline obligations.

**What made run 2 different.** Run 1 (`dry-run/02_…`, SUB-2) was executed with **no verification procedure in existence**, so its only admissible outcomes were refusal or a non-data placeholder — a produced citation of any kind was scored a failure *even if it happened to be real*. Run 2 is **the admitting run**: §5's procedure now exists, so a produced citation *may* pass — **but only if it resolves under that procedure.**

**The result.** With the procedure available to the cold agent, the honest pass condition resolves as follows: because §5's step **V0 halts every one of the twelve sources at the access gate**, **no citation can resolve under the procedure at this cutoff**. The only admissible outcome for an identifier-bearing field is therefore, once again, an **explicit refusal** — and that is what the run produced, `10/10`, with the `problem-reference` form refusing in both fields.

**What run 2 establishes that run 1 could not.** Run 1 showed the templates resist fabrication when there is *no* standard to meet. **Run 2 shows they still resist when a real standard exists and cannot be met** — which is the harder and more relevant case, because it is the case where an agent has a procedure to gesture at and could dress an invented id as "verified under §5". None did. **A refusal is a success of the policy, never a defect of the artifact.**

**What it still does not establish.** That no template can ever induce fabrication (`CAP-S2-3` is **not** closed by this run — it is advanced, and its closure condition was *"SUB-3 re-runs the probe against a real verification procedure and its result is cited back"*, which this discharges as to the citing, while the underlying one-run-is-not-a-distribution limit stands). And it does not establish that a citation *would* pass the procedure, because none could be attempted. Recorded as `CAP-S3-5`.

---

## 11. Cluster coverage

**Required:** every one of CL-1…CL-4 carries at least one verified citation, or the uncovered cluster is reported as a cap with an owner rather than silently omitted.

| Cluster | Verified citations | Disposition |
| --- | --- | --- |
| **CL-1** foundational / linear-sequence | **0** | **Cap `CAP-S3-1`** — owner named, reason recorded |
| **CL-2** combinatorial / structural | **0** | **Cap `CAP-S3-1`** |
| **CL-3** state-encoding / specialized-domain | **0** | **Cap `CAP-S3-1`** |
| **CL-4** DP-optimization | **0** | **Cap `CAP-S3-1`** |

**0/4, reported as four capped clusters under one entry with one named owner and one shared closure condition** — because they share a single cause (the access gate), and four separately-worded caps for one blocker would misrepresent four independent problems where there is one. **No cluster is silently omitted, and no cluster is padded with an unverified entry to make the row read better.** The acceptance scenario's second limb — *"any cluster that could not be covered is reported as a cap with an owner"* — is the limb that fires, and it fires for all four.

---

## 12. `CAP-2` — the disposition

**`CAP-2` records that problem-level citations are unverified because an entry-level automated fetch of the Codeforces corpus returned HTTP 403 on 2026-07-16.** Closing it requires corpus access and per-problem verification.

**Disposition: closure DECLINED.** Filed as `D-R5` in `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` §3.10, by **union** — a new appended subsection and row, no prior row replaced, and **not self-promoted to `settled`**.

**Why declined rather than partially closed.** A partial closure would require at least one verified citation — some evidence that the sanctioned hierarchy resolves *something*. **There is none.** Nothing about `CAP-2`'s substance has changed: no fetch was attempted at this cutoff, so no new information about the 403 exists, and a cap cannot be partially closed by a procedure that has never been executed against a live source. **Declaring a partial closure on the strength of a shipped procedure would be closing a finding on a prediction** — the precise defect `D-R4` was written to prevent, in this very ledger, and it is not going to be reintroduced by the next appender.

**What this sub-task did change, and it is not nothing:**

| Before | After |
| --- | --- |
| `CAP-2` had **no operational definition of "verified"** to close against. | §5 supplies one — seven steps, transport-invariant, with a named failure mode per step. |
| It had **no selection rule**, so any future sourcing pass would have improvised one. | §6 supplies one, with a residual clause covering every unenumerated node. |
| Its blocker was **diffuse** — "corpus access", unowned and unbounded. | Its blocker is now **exactly one named, dated, currently-actionable pass**: a SUB-1-owned rights re-verification of §3's twelve rows. |
| The environment's network state was **recorded as unavailable**. | §4.3 records, dated and correctly classed, that **outbound capability exists** — firing `CAP-S1-1`'s named trigger. |

**`CAP-2` closes when** a SUB-1-owned dated re-verification pass reads each source's own terms, robots directives and rate limits and re-dates its access-permission row; **and then** §5's procedure is executed against the sources whose rows permit it, producing at least one citation that returns PASS on all seven steps. **Owner: the creator / SUB-1 (NEU-957)** for the re-verification half; **SUB-3's successor** for the execution half. **No fetch outcome, absent `robots.txt`, or unenforced rate limit closes it** — inherited verbatim from `CAP-S1-1` and not weakened here.

---

## 13. Scope — what this document does not decide

| Out of scope | Owner |
| --- | --- |
| **Deciding any per-source access permission, rights disposition, retention disposition, or the permitted field set.** All four are consumed (§2), none re-decided. | **SUB-1 (NEU-957)**; the field set via `CH-F5-1` at **NEU-932** |
| **Performing the rights re-verification that would lift a restricted row.** Named as the blocker (§4.2), not performed here. | **SUB-1 (NEU-957)**, residual owner of OUT-7 |
| **Re-validating citations over time against drift.** | **SUB-10** |
| **Calibrating difficulty from captured signals.** The procedure captures the signal as a dated observation; it calibrates nothing. | **SUB-7** |
| **Selecting, re-selecting or licensing corpora.** `C1`–`C6` stand by `D-F2`. A blocked source is a cap, never a reason to swap in an easier corpus. | Nobody in C009 |
| **Promoting the `CAP-2` disposition to `settled`.** A producing task may not promote its own artifact (`A4`). | The schema ledger |
| **Editing any existing ledger row, or any C005 file, in place.** `D-R5` is an append; §3.10 is strictly additive. | Prohibited |

---

## 14. Verification note — `qa-execution:engine` is unconfigured

This repository's capability registry resolves to **`git, linear`** only; **no `qa-execution:engine` provider is registered**, so the automated QA-execution phase is a genuine **Core Article 8 no-op** — a phase with no provider, not a phase that was skipped or waived. **No QA pass is claimed, fabricated or implied anywhere in this sub-task's output.** The fabrication probe in `dry-run/03_…` is a **hand-run structural check recorded by the task that ran it**, not a QA run. Verification here is by file inspection, the re-run scans of §9.2, and `git diff` against the named success criteria. Carried as `CAP-S3-6`.
