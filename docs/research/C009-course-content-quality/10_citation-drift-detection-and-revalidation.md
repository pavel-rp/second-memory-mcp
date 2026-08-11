# Citation Drift — Detecting a Moved or Changed Problem, and Taking Its Placement Away

**Task:** NEU-966 (SUB-10) · **Charter:** C009 (umbrella NEU-890) · **Covers:** OUT-10, plus the OUT-9 self-classification of this sub-task's own quality requirements (SUB-9 remains OUT-9's residual owner) · **Compiled:** 2026-08-11 · **Verification cutoff:** 2026-08-11 (upstream inputs read at their own 2026-08-10 / 2026-08-11 cutoffs) · **Status:** **deferred — this document SETS no status.** Status lives in a ledger: this package's `adjudication/`, or the owning package's ledger for an inherited decision (`A1`–`A5`: a producing task may not promote its own artifact)
**Model:** claude-opus-5[1m]

---

## 0. The result, stated first

**A revalidation policy ships. It defines drift as five enumerated signals plus a residual, inherits its access path per source from SUB-3 rather than choosing one, bounds re-check frequency with a stated staleness window and a derived per-source budget, and defines what a detected drift does to a placement, to accumulated evidence, and to the learner. It classifies its own 23 quality requirements into SUB-9's scheme and introduces no new gate.**

**And the fact that governs every sentence below: there is nothing to detect drift in.**

| | At this cutoff |
| --- | --- |
| Verified citations in this package | **zero** (`03_…` §5, §9) |
| Cluster citation coverage | **0 of 4** |
| Sources whose access disposition permits a request | **0 of 12** — all `Restricted` (`01_…` §3) |
| Requests issued, ever, by any C009 sub-task | **zero** |
| Gates in this package that are implemented | **zero** (`OI-S9-16`) |
| Serve surface that would host the serve-time trigger | **does not exist** (`CAP-S9-6`, NEU-891 / NEU-892) |
| Verdict cache, scheduler or monitor | **does not exist** — out of scope by charter |

> **The honest summary a reader should carry away:** this document specifies a detector for a corpus that is empty. **The staleness window is specifiable today and the request budget is not**, and neither is spendable today, for two independent reasons stated in §5.4. Every simulation below is **desk-executed against constructed specimens**, in the `03_requirement-decision-mapping-gate.md` §4 shape SUB-9 used — **not one request was issued to any source, and none could lawfully have been.** That is a cap with a named owner (`CAP-S10-2`), not a gap that was smoothed.

**What this document refuses to do.** It does not manufacture enforceability by declaring a judgement to be a check. SUB-6 refused that by name, SUB-8 refused it by name, SUB-4 refused it most explicitly, and SUB-9's entire deliverable is the residual list that refusal produces. **§7 is this sub-task's share of that price**: two of its 23 requirements are `AI`, and both carry an enforcement-gap entry rather than a mechanical costume.

**It also does not treat capability as authority.** Outbound network capability was confirmed by SUB-3 against a **neutral, non-source endpoint** (`03_…` §4.3), which fires `CAP-S1-1`'s revision trigger and is recorded as `OI-S3-2`. **The gate stays shut.** Only SUB-1's dated rights re-verification reopens it, and this sub-task performing that pass would be the same category error SUB-3 declined to commit.

---

## 1. What this document is, and what it is not

**It is** the OUT-10 deliverable: the definition of citation drift, its detection signals, the access path a re-check runs on, the frequency bound that keeps a serve-time trigger from becoming a fetch loop, the degradation rule on detection, the learner-visible consequence, and this sub-task's self-classification into SUB-9's published scheme.

**It is not** an implementation. **No `src/`, `tests/`, schema or migration file is changed by this sub-task.** No scheduler, crawler, monitor or verdict cache is built — those are a later implementation charter's, and §11 says so.

**It is not** a re-decision of anything upstream. SUB-1's rights rows, SUB-2's form 4, SUB-3's procedure and access-path record, SUB-6's evidence record and swap procedure, and SUB-9's scheme, gates and quarantine sets are consumed **verbatim and untranslated**.

**It is not** a second definition of "verified." SUB-3 §5 is the only one. A re-check is **SUB-3's procedure re-executed**, not a lighter variant of it — and §3.2 states what that means step by step.

**It is not** a resolution of `CH-F5-1`. §4 specifies the policy for **both** dispositions and enforces the narrow one.

---

## 2. Drift, defined

> **A citation has drifted when the problem it resolves to today is not the problem it resolved to at its last dated verification — or no longer resolves at all.**

The definition is deliberately about **the resolution**, not about the source. A source may redesign its site, renumber its archive, or restate every problem in new words; none of that is drift unless the *cited* problem's resolution changed. And the converse matters more: a problem may keep its id, its URL and its title and still have drifted, because its **constraints** moved.

### 2.1 The five signals

Each signal is a comparison between a **live re-check** and a **recorded baseline**. §4 states which baseline, under each `CH-F5-1` disposition.

| # | Signal | PASS | FAILURE — the drift | Verdict |
| --- | --- | --- | --- | --- |
| **`D1`** | **id unresolvable** | The stored `stable_id` resolves live, on the source's recorded sanctioned path, to a real problem at that source (SUB-3 `V3`). | The id is unknown to the source; the response is an error, an empty result, or a redirect to a listing rather than a problem. | **drifted — retired** |
| **`D2`** | **URL moved / pair disagrees** | The stored `canonical_url` resolves live to the **same** problem the `stable_id` resolves to, and the two agree (SUB-3 `V4`). | The URL 404s; the URL resolves to a different problem than the id; the pair disagrees. | **drifted — moved.** SUB-3's rule is inherited verbatim: *"a disagreeing pair is worse than a missing one."* |
| **`D3`** | **title changed** | The live title matches the title in SUB-3's dated `V5` observation for this citation. | It does not match. | **drifted — restated** |
| **`D4`** | **constraints changed** | The live stated constraints match the constraints in SUB-3's dated `V5` observation. | They do not match. | **drifted — respecified.** This is the signal the whole document exists for: it is the one that changes what the learner is being asked to do while every identifier stays valid. |
| **`D5`** | **difficulty signal changed** | The source's own difficulty marker matches SUB-3's dated `V6` observation. | It does not match. | **rating moved** — a recorded finding, not a retirement (§6.3). |

**`D1` and `D2` are disposition-invariant** — they compare against the two fields the interim set actually stores. **`D3`, `D4` and `D5` are the three that `CH-F5-1` reaches**, and §4 is how they work anyway without storing a single additional field.

### 2.2 The residual clause — owned, not assumed

> **…and any observed difference at the source that none of `D1`–`D5` matches.**

**Such a difference defaults to `suspected drift`. It never defaults to "unchanged", and it never defaults to a warning.**

A `suspected drift` unit **quarantines** — not because suspected drift is worse than drift, but because it is **undecided**, which is SUB-9 §8.1's discriminating question applied literally: *could a competent author change this unit today and have the rule evaluate to a pass?* No — the rule has no enumerated signal to evaluate. The author cannot supply one by revising the unit.

| Slot | Value | Drawn from |
| --- | --- | --- |
| `reason` | **`retracted-input`** | SUB-9 §8.2 — *"an input the unit was authored against has since changed or been withdrawn."* An unenumerated change **is** a changed input. |
| `owner` | **SUB-10 (NEU-966)** — the party who can enumerate a sixth signal, which is an amendment to this document | SUB-9 §8.2's "a named work-item id" limb |
| `exit_condition` | **`register:OI-S10-5 closes`** | SUB-9 §8.2 shape 2 |

**Why this inverts the usual reflex.** The tempting default for an unmatched difference is to pass it — the signals are the specification, and a difference outside them is by construction not one of the failures we named. That reasoning is exactly how an enumeration becomes a licence. **A signal set that has never been run against a real source has an unknown miss rate**, and defaulting its misses to "unchanged" would convert that unknown into a silent pass on the learner's path. Defaulting them to `suspected drift` converts it into a visible queue entry with an owner.

**A sixth signal is added by amending this section — never by a re-check deciding at runtime that a difference is benign.** That is `EQ-S10-6`, and it is the same discipline SUB-6 §3.3 applies to an unenumerated evidence signal (*"becomes gate-bearing only by amendment … never by being used"*).

---

## 3. The re-check — SUB-3's procedure, re-executed

### 3.1 The access path is inherited per source, never re-chosen

> **A re-check runs on the same sanctioned path SUB-3 recorded for that source, in `traceability/03_access-path-and-verification-record.md`. It does not re-descend the hierarchy.**

| Situation | What a re-check does |
| --- | --- |
| SUB-3 recorded the source resolving through a **documented public API** | The re-check runs on that API, for that one problem. |
| SUB-3 recorded the source resolving through a **single targeted fetch by id** | The re-check is that single targeted fetch, for that one problem. |
| The recorded path **now fails** | **The failure is recorded as an access outcome and re-checked as one.** It does **not** silently drop to a second method. A change of path is **SUB-3's procedure being re-executed**, recorded per source with its date — it is not a decision this sub-task may make. |
| SUB-3 recorded the source's **whole hierarchy** as unusable | The drift check **inherits that cap with its named owner** and cites SUB-3's register entry by id. It does not fall back to a prohibited method. |

**At this cutoff every one of the twelve sources is in the last row.** `03_…` §5 `V0` halts every source before any path is reached, so **no source has a recorded resolving path at all**, and the first three rows are specified against a record that is empty. That is not a defect in the rule; it is the state of the corpus, and `CAP-S10-2` carries it.

### 3.2 The shape of a re-check, stated so a sweep cannot become a walk

**A re-check is one request for the one cited problem being re-checked.** Never an enumeration of a source's problem list to compare many citations at once — and the serve-time trigger fires **per served citation**, never as a corpus-wide walk.

This is stated explicitly because a revalidation sweep's *natural* implementation is the prohibited one. The efficient way to re-check a thousand citations against one source is to fetch the source's problem list once and diff locally. **That is a corpus walk, it is prohibited under every branch, and its efficiency is exactly why the prohibition has to be written where the sweep is designed rather than left to be inherited.**

**Which SUB-3 steps a re-check re-executes.** A re-check is not a lighter "verified":

| Step | In a re-check |
| --- | --- |
| `V0` access gate | **Re-evaluated, first, every time.** A source whose disposition changed to `Restricted` since the last check stops the re-check. Freshness is never a licence. |
| `V1` pre-selection | **Not re-run** — the candidate was selected once, before the original request, and re-checking does not re-select. Re-selecting at re-check time would import the source's current ranking, which is `X1`. |
| `V2` transport | **Re-run** — exactly one sanctioned request on the recorded path. |
| `V3`, `V4` | **Re-run** — they *are* `D1` and `D2`. |
| `V5`, `V6` | **Re-run as comparisons** against the dated observations — they *are* `D3`, `D4`, `D5`. Read **only to confirm or refute the match**; nothing from the page is stored, mirrored or paraphrased. |
| `V7` rights re-check | **Re-run** — the disposition is re-read after resolution and independently of it. A successful re-check is never a rights argument. |

**All-or-nothing is inherited.** A re-check that cannot complete every step it re-runs does not produce a partial verdict. It produces **`verdict stale`** (§5.3), which is a recorded state, not a pass.

### 3.3 The retention bound on a whole-list response

**Where the recorded path is an API that answers with the source's whole problem set, SUB-1's retention disposition binds the re-check exactly as it binds SUB-3's resolution.**

> The response is read **only** to re-check that one cited problem. It is **never** stored, cached as a list, transcribed, mirrored, re-published, or mined.

**The only artifact a re-check retains is that citation's dated verdict** — `{ citation_id, checked_at, path, verdict, signals_fired, window_admitted_under, budget_admitted_under }` — and **no part of the source's enumeration.** A verdict cache that held the list it was derived from would be `G-ENUM-SCAN`'s exact failure with a cache's name on it.

**RETENTION, NOT REQUEST COUNT** is the axis, inherited from SUB-1 §6 verbatim. A re-check that made exactly one sanctioned request and kept the list it returned **fails**, and its compliant request count is not raised in its defence.

---

## 4. Both `CH-F5-1` dispositions, specified in advance

`CH-F5-1` is **unresolved and open** at this cutoff. Three of the five signals compare against values that the interim stored set does not hold. The policy is therefore written for both dispositions and **enforces the narrow one**.

| | **Interim disposition — in force now** | **Wider disposition — if `CH-F5-1` resolves in favour** |
| --- | --- | --- |
| Stored citation fields | `stable_id` + `canonical_url` **only** | the four `NOT-YET-STORABLE` fields become storable |
| `D1`, `D2` baseline | The two stored fields | Unchanged |
| **`D3`, `D4`, `D5` baseline** | **SUB-3's dated verification observations** in `traceability/03_…` — the `V5` and `V6` records, which exist precisely so that none of these values needs a stored field | The stored fields, **with no change to the signals, the thresholds, or the degradation rule** |
| Signals | Five, unchanged | Five, unchanged |
| Degradation rule | Unchanged | Unchanged |
| If `CH-F5-1` resolves **against** the wider set | **Nothing changes at all** — the observation-based baseline is already the produced shape | — |

**No field is added to storage to make detection easier, under any branch.** This is the constraint that shaped the design rather than a promise appended to it: the baseline was taken from SUB-3's dated observations *because* they already exist and are already outside the stored record, exactly as SUB-3 §7.2 designed them to be. **This sub-task's need for a wider set — there is none — is not offered as an argument for widening it.** The dependency is carried as `CAP-S10-6`, citing `CH-F5-1`, `DR-C09-01` and `CAP-S1-2` by id.

> **One consequence, stated rather than left to be discovered.** The interim baseline is only as good as the dated observation it compares against, and **zero such observations exist**, because zero citations were ever resolved. The mechanism is specified and its input set is empty. That is `CAP-S10-2`, and it is the same sentence as §0's.

---

## 5. Frequency — the window, the budget, and the cached verdict

The serve-time trigger is what makes a frequency bound necessary. SUB-3's *"one request per cited problem"* bounds a **single resolution**; it says nothing about the same citation re-checked on every serve. Without an explicit bound, one popular citation generates unbounded repeat traffic to its source — the **volume** half of the charter's HIGH *"single-fetch fallback is scaled up"* risk, which the prohibition on enumeration does not reach.

### 5.1 The cached-verdict rule — the bound that does the actual work

> **Each citation carries a dated verdict from its last re-check. The serve-time trigger reads that cached verdict while it is inside the staleness window and issues NO request at all. A request is issued only when the verdict is older than the window.**

**A served citation therefore costs at most one request per window, however many learners are served.** The repeat-traffic volume is bounded by a stated rule rather than by the number of serves — which is the property that makes a serve-time gate admissible at all.

This is also why `G-DRIFT` is admitted at serve time only in the **cached, asynchronous** form SUB-9 §7.2 specified: the serve path **reads a verdict**, it does not **compute** one. A serve path that computed a verdict would be an execution on the learner's latency path, which SUB-9 §3.3 bars.

### 5.2 `per_citation_staleness_window` — stated, and declared-not-measured

> **`per_citation_staleness_window` = 90 days.**

**Its derivation, stated so it can be argued with.** The window is bounded from two sides:

- **From below** by the traffic bound: a shorter window multiplies requests to a source whose rate limits nobody has read. Below roughly a month, a moderately-used citation's re-check rate starts to look like a poll rather than a scheduled re-check.
- **From above** by the exposure it accepts: the window *is* the maximum time a drifted citation can keep its placement undetected. A year would make the detector decorative.

**90 days is a choice inside that band, and it is declared, not measured.** No drift-rate observation exists for any of the twelve sources — because zero citations exist to observe drifting. **Nothing in this package establishes that 90 days is the right number**, and this document does not claim it does. Carried as `OI-S10-2` (`AI`, `none — cap`) and `CAP-S10-1`, owner **the creator**.

> **On SUB-9's figure.** `09_…` §6.3 used `90 days` as a **declared placeholder** that explicitly bound nothing and appeared in no artifact. This document adopts the same figure **as a value**, for the reasons above. The agreement is not corroboration — the placeholder was chosen to demonstrate that a conjunction discriminates, not to estimate a cadence, and citing it as support would be laundering an illustration into evidence.

### 5.3 `per_source_revalidation_budget` — derived, not chosen

SUB-9 §6.3 assigned this parameter's source, not its value: it is read from **the source's own stated rate limits, recorded in `01_…` §3.** Those rows read **`unestablished at cutoff ⇒ restricted` for all twelve sources.**

> **Therefore: `per_source_revalidation_budget(s) = 0` for all twelve sources at this cutoff.**

**This is a derivation, not a choice, and the distinction is the whole point.** The available alternative was to pick a polite-looking number — one request per source per day — and call it conservative. That would be **this package inventing a rate limit for a source whose terms nobody has read**, which is a `01_…` §7.3 invented-authority failure in the retention direction. Under the restricted-by-default rule (`00_…` §4.4), an unestablished rate limit is not a permissive one; it is **no permission at all**, and the number that expresses no permission is zero.

**The rule for setting it once terms are read**, stated now so the pass that reads them does not have to invent one either:

> `per_source_revalidation_budget(s)` ≤ the source's own stated rate limit for the revalidation interval, read and dated by **SUB-1's rights re-verification pass**, and recorded per source in `01_…` §3. It is never set by this document, by a scheduler's default, or by a re-check's own judgement.

### 5.4 Spendability — stated plainly, because it is the question a reader will actually have

| Parameter | Specifiable today? | **Spendable today?** | Why |
| --- | --- | --- | --- |
| `per_citation_staleness_window` = 90 d | **Yes** — it is a policy number, not a rights fact | **No** | There is no citation whose verdict could age. Zero citations exist. |
| `per_source_revalidation_budget` = 0 | **Yes, and it is already derived** | **No — and it is zero, so there is nothing to spend** | All twelve sources' rate limits are unestablished ⇒ restricted. |

**Both are unspendable today, for two independent reasons**, and either alone would suffice:

1. **The corpus is empty.** Zero verified citations, cluster coverage 0/4. A re-check needs something to re-check.
2. **The gate is shut.** `G-ACCESS-GATE` condition 2 (`03_…` `V0`) stops every one of the twelve sources before `G-BUDGET` is ever reached. Even a citation would not license a request.

**No schedule pressure converts either into a licence**, and the availability of outbound network capability (`03_…` §4.3) is not an argument on this axis — capability is not authority.

### 5.5 The audit record, and its reconciliation with `G-BUDGET`

**Every re-check is recorded with:** its citation id, its date, the path it ran on, and **the window and budget it was admitted under**. SUB-9's `G-BUDGET` (`09_…` §6.3) reads exactly these fields, and the two are reconciled here so that no legitimate re-check is flagged as a scaled-up fetch and no unbounded loop is waved through as a legitimate one.

| Re-check shape | `G-BUDGET` verdict | Agreed here |
| --- | --- | --- |
| Past the window **and** inside the budget | **PASS** — a sanctioned scheduled re-check | Yes |
| Inside the window | **BLOCK** — a scaled-up fetch, regardless of remaining budget | Yes. §5.1 means a compliant implementation never issues one: it reads the cache. |
| Over the budget | **BLOCK** | Yes — and §5.6's queue-and-degrade is what happens instead. |
| **No such record at all** | **BLOCK** — a violation on the same terms as an enumeration | Yes |

**The conjunction is inherited exactly.** An unused budget is never an argument for an early re-check, because the harm the rule bounds is request **pattern**, not request **count**.

### 5.6 Budget exhausted — queue and degrade, never widen

When a source's budget is exhausted, re-checks for that source **queue**. Their citations are marked **`verdict stale`** and handled by §6's degradation rule.

> **The budget is never exceeded to clear a backlog.** Clearing a backlog by widening the request rate is precisely the scaled-up loop this bound exists to prevent, and a backlog is the exact circumstance in which widening it feels justified.

**`verdict stale` is not `fresh`.** A unit whose verdict has aged past the window and could not be re-checked does not serve as though it had passed — SUB-9 §7.2 fixes this: a stale-or-absent verdict **quarantines** the unit with `reason: retracted-input`, rather than blocking the learner's request. That rule is consumed here verbatim, and at a budget of zero **it is the state every citation would be in**, which is another way of saying §5.4.

---

## 6. What happens on detection

### 6.1 The unit and its placement

| Signal | Unit state | Placement |
| --- | --- | --- |
| `D1` retired, `D2` moved, `D3` restated, `D4` respecified | **`blocked`** | **Suspended.** The node stops offering that problem. |
| Residual — `suspected drift` | **`quarantined`** (`retracted-input`, §2.2) | **Suspended.** |
| `verdict stale` (window passed, re-check not issuable) | **`quarantined`** (`retracted-input`, SUB-9 §7.2) | **Suspended.** |
| `D5` rating moved | Advances, carrying a recorded finding | **Retained** — §6.3. |

**Why `blocked` and not `quarantined` for `D1`–`D4`.** SUB-9 §8.1's question decides it: *could a competent author change this unit today and have the rule evaluate to a pass?* **Yes** — the author runs SUB-6's swap procedure (§6.3), replacing the citation, and the re-check passes against the replacement. A drifted citation is a **decided failure with an available repair**, which is `blocks`' limb exactly. Routing it to quarantine would put a repairable unit in the state reserved for what nobody can decide.

**Why the placement is suspended and not merely re-derived.** Re-derivation requires the normal citation route to produce a replacement, and **that route is shut** (§3.1). A placement that were "re-derived" against an empty corpus would be an empty placement wearing a fresh timestamp. Suspension is the honest state, and it is visible.

### 6.2 What happens to evidence already collected — and the answer to `OI-S6-4`

**SUB-6 filed `OI-S6-4` with owner SUB-10 and a revision trigger naming this sub-task by id.** This section discharges it.

> **The rule: a detected drift suspends placement-level facts and retains node-level mastery history, unrecomputed.**

This is not a new design. It is the property SUB-6 built into the record shape and **executed once** in `dry-run/06_corpus-swap-verification.md` — **4/4 PASS**, with exactly two subfields changed and every accumulated gate result standing. **This sub-task cites that result and does not re-run it**, per SUB-6's own instruction: running it twice against two shapes would produce two results and no answer about which shape the package actually has.

| Fact | On detected drift |
| --- | --- |
| `node_id`, `skill_type`, `learner_id`, `session_ref`, `observed_at` — the whole key | **Retained**, untouched |
| `derived_quality`, `rubric_payload`, counted successes (`MM-T1`), session separation (`MM-T2`), quality floor (`MM-T3`) | **Retained, unrecomputed** |
| Gate **A** (`MM-T9`), Gate **B**, the Gate **C** composite (`MM-T8`), Gate **D** pool membership (`MM-T11`, `MM-T12`) | **Retained** |
| Remediation counters `MM-T13`, `MM-T14` | **Retained** |
| `citation.stable_id`, `citation.canonical_url` | **Replaced together**, or left in place while the unit is blocked |
| **The placement** that offered the retired problem at that node | **Suspended** — the one thing that does not survive, and SUB-6 §6.4 already lists it in the "does not survive" column |

**The residual `OI-S6-4` asked about, answered honestly.** SUB-6's trigger anticipated that this sub-task *"may require this design to state what a detected-drift event does to an **already-counted** success."* It does, and the answer is not uniformly reassuring:

- **A success counted from `pasted_solution` or `assessment_item_result` stands.** Those are graded against **our** rubric criteria — properties of the learner's method, not of the source's current constraint text. SUB-6 §7.2 establishes this and it holds.
- **A success counted from a `retrieval_item_result` may be wrong, and the swap does not fix it.** A `retrieval` item authored against the old constraints can carry a stale `expected_response`; a learner reasoning correctly about the *current* problem is marked incorrect, and a learner reasoning about the *old* one is marked correct. **Replacing the citation does not re-grade that item, and this policy does not claim it does.** The item is authoring-time content that drifted with its citation, and correcting it is a re-authoring pass, not a swap.

**That residual is filed as `OI-S10-3`**, owner **the correctness-reviewer role**, exit condition `gate:G-DRIFT becomes evaluable` — because until a drift verdict can actually be computed, no one can identify *which* items were authored against a since-changed constraint.

### 6.3 `D5` — a rating moved is a finding, not a retirement

A changed difficulty signal does not mean the citation resolves to a different problem. It means the source re-rated **the same** problem. SUB-7 §5.4 already fixes what happens to a difficulty disagreement: it is **recorded as a finding with both values and both dates**, and the external rating *"is a cross-check on the ordering, never a summand."*

**So `D5` warns**: the unit advances, carrying a recorded finding on the transition's review record. It does not block, because the problem is the same problem and the learner is not being misled about what they are solving; and it does not quarantine, because the verdict is decidable now.

**The cost of that choice, stated rather than omitted.** `OI-S9-12` records the standing residual that **a `warns` verdict may never be acted on** — *"a warning nobody reads is an unenforced requirement wearing an enforcement's clothes."* `D5` inherits that residual in full, bounded by the same compensating gate, `G-WARN-COUNT`. **This document declines to escalate `D5` to `blocks` to make its table look stronger**, for the same reason SUB-9 declined to escalate its two: the assignment rule produced `warns`, and overriding it for appearance is the laundering the scheme exists to prevent. Filed as `OI-S10-4`.

### 6.4 Who owns the resolution

| Outcome | Owner |
| --- | --- |
| `D1`–`D4` — blocked unit, suspended placement | **The creator**, as the author who runs the swap and re-authors any drifted item |
| Residual `suspected drift` | **SUB-10 (NEU-966)** — enumerating a sixth signal is an amendment to §2.1 |
| `verdict stale` at a zero budget | **SUB-1 (NEU-957)** — only the rights re-verification pass can make a budget non-zero |
| A `D5` finding | **The creator**, via `OI-S7-1` — SUB-7's provisional calibration values are the creator's to review |

**No owner here is the party who recorded the outcome**, per SUB-9 §8.2's prohibition.

### 6.5 What the learner sees

> **A defined, visible degradation. Never a silent pass, and never a dead link.**

| State | What the learner is shown |
| --- | --- |
| Placement suspended (`D1`–`D4`, `suspected drift`, `verdict stale`) | The node's practice slot shows that **the linked problem is unavailable pending re-verification**, dated. The learner's progress at that node, and every gate they have cleared, are shown unchanged. |
| `D5` rating moved | Nothing changes for the learner. The finding is a reviewer-facing record. |

**Three properties are load-bearing.**

1. **The learner is never routed to a dead link.** A `D1`/`D2` citation is not rendered as a working reference.
2. **The learner's history is visibly intact.** The degradation is scoped to the placement, and the interface says so — otherwise a suspended placement reads to the learner as lost progress, which is the one thing §6.2 guarantees did not happen.
3. **The degradation is not a silent omission.** A node that quietly stopped offering a problem is indistinguishable from a node that never had one, and that is a silent pass in the only place it actually matters.

**This is a requirement on a surface that does not exist.** NEU-892 consumes it; **no learner-facing surface is built by this package** (`CAP-S9-6`). Carried as `CAP-S10-4`.

---

## 7. Self-classification against SUB-9's scheme

**This section discharges SUB-9 §3.5's residual clause for this sub-task.** SUB-9's classification pass was complete when it shipped and **cannot reach a requirement written here**, so these 23 requirements are classified against SUB-9's published scheme, in SUB-9 §3.6's row shape, using SUB-9's closed vocabularies on all three axes, ids namespaced `EQ-S10-k`.

### 7.1 The table

| Id | Requirement, in this document's own words | Mech. | Blocking | Placement | Gate | `AI`-only? |
| --- | --- | --- | --- | --- | --- | :-: |
| `EQ-S10-1` | **`D1`** — the stored `stable_id` resolves live, on the source's recorded sanctioned path, to a real problem at that source (§2.1) | `automated` | `blocks` | **both** | `G-DRIFT` | no |
| `EQ-S10-2` | **`D2`** — `canonical_url` resolves to the same problem the id resolves to, and the pair agrees; *"a disagreeing pair is worse than a missing one"* (§2.1) | `automated` | `blocks` | **both** | `G-DRIFT` | no |
| `EQ-S10-3` | **`D3`** — the live title matches SUB-3's dated `V5` observation (§2.1, §4) | `automated` | `blocks` | **both** | `G-DRIFT` | no |
| `EQ-S10-4` | **`D4`** — the live stated constraints match SUB-3's dated `V5` observation (§2.1, §4) | `automated` | `blocks` | **both** | `G-DRIFT` | no |
| `EQ-S10-5` | **`D5`** — the source's difficulty marker matches SUB-3's dated `V6` observation; a disagreement is a recorded finding with both values and both dates (§2.1, §6.3) | `automated` | **`warns`** | **both** | `G-DRIFT` | no |
| `EQ-S10-6` | **The residual clause** — an observed difference matching no enumerated signal defaults to `suspected drift`, never to unchanged; a sixth signal is added by amendment, never by a re-check deciding at runtime (§2.2) | `deterministic` | `quarantines` | **both** | `G-DRIFT` | no |
| `EQ-S10-7` | **Serve-time narrowness** — the serve-time check evaluates only `D1`–`D5` and performs no semantic re-evaluation; no reviewer, model call or execution sits on the learner's latency path (§5.1) | `deterministic` | `blocks` | **both** | `G-DRIFT` | no |
| `EQ-S10-8` | **The cached-verdict rule** — inside the window the serve-time trigger reads the cached dated verdict and issues **no request at all** (§5.1) | `deterministic` | `blocks` | **both** | `G-DRIFT` | no |
| `EQ-S10-9` | **A stale-or-absent verdict quarantines** the unit with `reason: retracted-input` rather than blocking the learner's request (§5.6; consumed from `09_…` §7.2) | `server-side` | `quarantines` | **both** | `G-DRIFT` | no |
| `EQ-S10-10` | **The staleness window** — a re-check is issued only when `now − last_verified_at ≥ 90 days` (§5.2) | `deterministic` | `blocks` | authoring-time | `G-BUDGET` | no |
| `EQ-S10-11` | **The per-source budget** — `= 0` while a source's stated rate limits are unestablished; a re-check against a zero budget is not issued (§5.3) | `deterministic` | `blocks` | authoring-time | `G-BUDGET` | no |
| `EQ-S10-12` | **Queue and degrade** — an exhausted budget queues re-checks and marks their citations `verdict stale`; **the budget is never widened to clear a backlog** (§5.6) | `deterministic` | `quarantines` | authoring-time | `G-BUDGET` | no |
| `EQ-S10-13` | **The inherited access path** — a re-check runs on the same sanctioned path SUB-3 recorded for that source; no re-descent of the hierarchy, and a failed recorded path does not drop to a second method (§3.1) | `server-side` | `blocks` | authoring-time | `G-ACCESS-GATE` | no |
| `EQ-S10-14` | **One request per cited problem per re-check**; no enumeration, crawl or corpus walk on either the authoring-time or the serve-time run (§3.2) | `automated` | `blocks` | authoring-time | `G-TRANSPORT` | no |
| `EQ-S10-15` | **The re-check retention bound** — a whole-list response is read only to re-check that one citation; the only artifact retained is that citation's dated verdict (§3.3) | `automated` | `blocks` | authoring-time | `G-ENUM-SCAN` | no |
| `EQ-S10-16` | **The audit record** — every re-check records its citation id, date, path, and the window and budget it was admitted under (§5.5) | `schema` | `blocks` | authoring-time | `G-BUDGET` | no |
| `EQ-S10-17` | **Detection produces an observable signal**, not a log line only (§6.1, §6.5) | `schema` | `blocks` | **both** | `G-DRIFT` | no |
| `EQ-S10-18` | **The degradation rule** — a detected drift suspends the placement and retains node-level mastery evidence unrecomputed (§6.2) | `server-side` | `blocks` | **both** | `G-DRIFT` | no |
| `EQ-S10-19` | **The learner-visible degradation** — a defined visible degradation, never a silent pass and never a dead link (§6.5) | `schema` | `blocks` | **both** | `G-DRIFT` | no |
| `EQ-S10-20` | **No field is added to storage** to make detection easier; while `CH-F5-1` is open the `D3`–`D5` baseline is SUB-3's dated observations (§4) | `schema` | `blocks` | authoring-time | `G-FIELDSET` | no |
| `EQ-S10-21` | **Whether an observed difference is a *material* change to the problem**, or an editorial rewording that leaves the problem the same (§7.3) | **`AI`** | `quarantines` | authoring-time | `G-DRIFT` · `OI-S10-1` | **yes** |
| `EQ-S10-22` | **Whether 90 days is the right window** — declared, not measured; no drift-rate observation exists for any source (§5.2) | **`AI`** | `quarantines` | authoring-time | `none — cap` · `OI-S10-2` | **yes** |
| `EQ-S10-23` | **This sub-task's residual clause** — a quality requirement of this sub-task missing from this table defaults to **blocked until classified** (§7.4) | `deterministic` | `blocks` | authoring-time | `G-RESIDUAL` | no |

### 7.2 The roll-up

| Axis | Distribution | Total |
| --- | --- | --: |
| **Mechanism** | `deterministic` 7 · `schema` 4 · `server-side` 3 · `automated` 7 · `AI` 2 | **23** |
| **Blocking** | `blocks` 17 · `warns` 1 · `quarantines` 5 | **23** |
| **Placement** | `both` 12 · authoring-time 11 · **serve-time-only 0** | **23** |

**Zero rows are unclassified.** Every row carries a mechanism, a blocking behaviour and a placement.

**Three properties SUB-12's audit can check mechanically:**

1. **No new gate id is introduced.** Every row resolves to a gate SUB-9 already named — `G-DRIFT`, `G-BUDGET`, `G-ACCESS-GATE`, `G-TRANSPORT`, `G-ENUM-SCAN`, `G-FIELDSET`, `G-RESIDUAL` — so **SUB-9's count of 59 distinct named gates is unchanged.**
2. **No row is placed `serve-time` alone.** Every requirement constituting the served drift check is recorded `both` **under `G-DRIFT`**, so **SUB-12's placement audit still counts exactly one serve-time gate**, not several.
3. **Both `AI` rows carry an enforcement-gap entry** (§7.3). Neither is classified and left ungated.

**Package totals after this merge**, stated so the seam is countable rather than asserted:

| | SUB-1 … SUB-8 (SUB-9's pass) | SUB-10 | **Total** |
| --- | --: | --: | --: |
| Rows | 89 | 23 | **112** |
| `deterministic` | 28 | 7 | **35** |
| `schema` | 20 | 4 | **24** |
| `server-side` | 15 | 3 | **18** |
| `automated` | 11 | 7 | **18** |
| `AI` | 15 | 2 | **17** |
| `blocks` | 72 | 17 | **89** |
| `warns` | 2 | 1 | **3** |
| `quarantines` | 15 | 5 | **20** |

### 7.3 The enforcement-gap entries — SUB-9 §3.4's four-field shape

**Both `AI` rows carry one. Neither leaves the "what the gate does not catch" cell empty** — a compensating gate that is not stated to be partial is a gate presented as a discharge.

| Id | Residual — the obligation whose verdict is judgement | Rows | Compensating observable gate | Mech. | Gate owner | **What the gate does NOT catch** |
| --- | --- | --- | --- | --- | --- | --- |
| **`OI-S10-1`** | **Materiality of an observed difference** — whether a change at the source makes the cited problem a *different problem*, or is an editorial rewording that leaves the obligation on the learner identical | `EQ-S10-21` | **`G-DRIFT`** — the mechanical `D1`–`D5` comparison against the dated baseline; any difference fires a signal and the unit does not advance silently | `automated` | **the correctness-reviewer role**; build owner **the creator** | **Materiality, in both directions.** A typo fix, a re-worded preamble or a re-formatted constraint block fires `D3`/`D4` and blocks a citation that is fine — the gate produces a **queue**, not a verdict. And in the direction that costs more: **a semantically material change that leaves the compared strings byte-identical is invisible to it** — a source that tightens a time limit stated only in an attached judge configuration, or narrows the input domain in a table the comparison does not read, passes `D1`–`D5` cleanly. The comparison bounds the judgement; it does not make it. |
| **`OI-S10-2`** | **Whether 90 days is the right staleness window** — the exposure the window accepts, and the traffic it avoids, are both unmeasured | `EQ-S10-22` | **`none — cap`** | — | **the creator** — the only party who can authorise the rights re-verification whose output would make a measurement possible | **Everything.** No gate is proposed and none is possible from this side: validating a window requires observing drift, observing drift requires re-checking real citations, and there are none. The number is a declared policy value inside a stated band, and **its error is unbounded and unknown**. `CAP-S10-1`. |

### 7.4 This sub-task's residual clause

> **…and any quality requirement produced by this sub-task that §7.1 does not enumerate.**

**Such a requirement defaults to `blocked until classified`**, mirroring SUB-9 §3.5 exactly. It never defaults to unenforced and never to `warns`. **The residual is SUB-10's** — §7.1 is the floor, not the boundary. A requirement discovered later in this document is a gap this sub-task records, not one that disappears because a table looks complete. Filed as `OI-S10-6`.

---

## 8. The drift simulations — desk-executed, against constructed specimens

**Full records in `traceability/10_drift-detection-and-revalidation-register.md`.** The pass condition for every case was fixed **before** the result, in the `03_requirement-decision-mapping-gate.md` §4 shape SUB-9 used.

> **These are not runs against a live source. No request was issued to any of the twelve sources, by this sub-task or any other, at any time.** Each case is a constructed specimen citation exercised against §2's signal table and §6's degradation rule by inspection. `CAP-S10-5`.

| Case | Constructed drift | Signal fired | Degradation | Silent pass? |
| --- | --- | --- | --- | :-: |
| **DS-1** | Problem deleted at source; id unknown | **`D1`** | Unit `blocked`; placement suspended; mastery retained | **No** |
| **DS-2** | Problem moved; URL 404s, id still resolves | **`D2`** | Unit `blocked`; placement suspended | **No** |
| **DS-3** | Id and URL resolve to **different** problems | **`D2`** | Unit `blocked` — *"a disagreeing pair is worse than a missing one"* | **No** |
| **DS-4** | Title restated, id/URL/constraints unchanged | **`D3`** | Unit `blocked`; placement suspended | **No** |
| **DS-5** | **Constraints changed**, every identifier unchanged | **`D4`** | Unit `blocked`; placement suspended; the `retrieval` item's stale `expected_response` recorded as `OI-S10-3` | **No** |
| **DS-6** | Source re-rated the problem | **`D5`** | `warns` — finding recorded with both values and both dates; placement retained | **No** |
| **DS-7** | Licence footer changed; nothing else | **residual** | `suspected drift` → `quarantined` (`retracted-input`) | **No** |
| **DS-8** | Restricted-stored-set run of DS-4/DS-5/DS-6 against **dated observations only** | `D3`/`D4`/`D5` | Same as above, **with no field added to storage** | **No** |
| **DS-9** | One citation served 500 times inside the window | **none** — cache read | **0 requests issued** | n/a |
| **DS-10** | Citation past the window, source budget = 0 | **none** — not issuable | `verdict stale` → `quarantined`; **budget not widened** | **No** |

**8 of 8 drift cases produced a detection signal and a defined degradation. Zero silent passes.** DS-9 and DS-10 are the frequency cases and are recorded separately because neither is a drift case.

**What the simulations do not establish.** They exercise **the specification against specimens the same pass constructed**. They do not establish that a real source's real change would fire the signal the specimen's did — that is `OI-S10-1`'s residual and `CAP-S10-5`'s cap, and no simulation run by the authoring pass can close it.

---

## 9. The audits

| Audit | Result | Where |
| --- | --- | --- |
| **Request-pattern** | **Zero requests issued** to any of the twelve sources. No enumeration, crawl or corpus walk on either the authoring-time or the serve-time specimen run. | `traceability/10_…` §4 |
| **Frequency** | DS-9: one citation, 500 serves, **0 requests** — the cache answered every one. DS-10: budget-exhausted source degraded to `verdict stale` rather than widening its rate. | `traceability/10_…` §5 |
| **Retention** | No whole-list response was received (none was requested), so the retention check is **vacuous, not demonstrated** — stated in the same shape SUB-3 §8 stated its own. | `traceability/10_…` §6 |
| **Non-mutation** | No file outside `docs/research/C009-course-content-quality/` changed. No other sub-task's document or `###` section changed. Both shared registers are pure appends. | `traceability/10_…` §7 |

**The retention audit's vacuity is load-bearing and is not glossed.** Nothing here establishes that the retention discipline holds under a real whole-list response, because no such response was ever obtained. **A future pass that actually calls an enumerating endpoint must run this check for real and must not cite this section as precedent that it passes.** `CAP-S10-3`, in the same shape as `CAP-S3-4`.

---

## 10. Evidence and records

| Artifact | What it carries |
| --- | --- |
| `traceability/10_drift-detection-and-revalidation-register.md` | The ten drift simulations with pass conditions fixed in advance; the request-pattern, frequency, retention and non-mutation audits; the per-requirement classification anchors. |
| `90_open-items-and-provisional-register.md` § `SUB-10` | `OI-S10-1` … `OI-S10-6`, each with an owner and a revision trigger. |
| `91_caps-and-incomplete-scope.md` § `SUB-10` | `CAP-S10-1` … `CAP-S10-6`, each with an owner and a closure condition. |

**Evidence classes carried by this document.** The drift definition, the signals, the frequency rules, the degradation rule and the classification are **specification**, not measurement, and are claimed as such. The desk simulations are **class 2 `[code-evidence]`** — an operational fact about committed documents, with §8's limitations stated. **No class 3 `[dogfooding]` evidence was collected by this sub-task**, and **no class 7 `[future-real-user]` claim appears anywhere.**

---

## 11. Scope — what this document does not decide

- **It builds nothing.** No detector, scheduler, crawler, monitor or verdict cache is implemented. Every rule here is specified; **none has ever run against a real citation, because none exists.** `CAP-S10-2`.
- **It issues no request, and licenses none.** The access gate is shut for all twelve sources and this document does not open it. Reopening it is **SUB-1's dated rights re-verification pass** and nobody else's.
- **It does not re-decide `G-DRIFT`'s placement.** SUB-9 decided it; this document consumes it as a real trigger and supplies the detection SUB-9 named it the owner of.
- **It does not widen the serve-time set.** The full semantic battery stays at authoring time. A proposal to move any of it to serve time is an open item, not a local extension.
- **It does not close `CH-F5-1`, widen the field set, or argue for widening it.** §4 specifies both dispositions and enforces the narrow one. `CAP-S1-2` is cited by id and not re-owned.
- **It does not re-run SUB-6's corpus-swap check.** SUB-6's single execution is cited; a second run against a second shape would produce two results and no answer.
- **It does not re-decide SUB-3's procedure, seed set, or access-path record.** It re-executes them.
- **It does not write `92_package-completeness-gate.md`**, which is **SUB-12's (NEU-969)** alone.
- **It sets no status.** Status lives in a ledger, and a producing task may not promote its own artifact (`A4`).
- **It claims no QA pass.** See §12.

---

## 12. Verification note — `qa-execution:engine` is unconfigured

The repository's capability registry resolves **`git` and `linear` only**. **No capability owns the `qa-execution:engine` surface**, so the QA-execution phase over this deliverable is a genuine **Core Article 8 no-op** — the phase runs inert by design.

**What was refused: reporting a QA pass.** No engine ran, so no engine's verdict is claimed, implied or summarised, and **no `07_qa-report.md` was written**. The checks that were executed are real and are recorded for what they are: shell-level `git diff --numstat` and grep checks over the working tree, and a structural read of every file this change touches. **Mechanical, hand-run, and narrow.**

**A type check would be vacuous here and is reported as such.** This change touches no TypeScript. A linked worktree carries no `node_modules`, so a `tsc` run would either fail to start or pass vacuously against the shared checkout's toolchain; **neither outcome would be evidence about this change**, and no green type check is claimed on its behalf.
