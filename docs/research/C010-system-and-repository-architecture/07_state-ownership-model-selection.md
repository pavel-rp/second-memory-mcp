# 07 — The state-ownership model: all-MCP against hybrid, scored on one weighted criteria set

**Written by:** NEU-976 (SUB-6) · **Charter:** C010 (umbrella NEU-895) · **Covers:** `OUT-3`, `OUT-10`
**Written:** 2026-08-21 · **Cutoff for every `src/` fact below:** 2026-08-21, on `origin/develop`
**Model:** claude-opus-5[1m]

**Depends on:** `04_state-category-inventory.md` (SUB-3, the 45 categories an ownership model
must assign), `05_system-context-and-responsibility-boundaries.md` (SUB-4, the components that
could own them and the boundaries between them), and
`06_isolation-invariant-and-the-neu-893-split.md` (SUB-5, the invariant a model must not
break). All three merged.

---

## 0. What this chapter is, and the order it is written in

C010's Critical risk is that MCP-owned and web-owned state diverge or permit conflicting
writes. SUB-3 inventoried the state, SUB-4 inventoried the components, SUB-5 stated the
invariant. None of them chose **who writes what**. This chapter does, once, against one
criteria set — so that `SUB-13 (NEU-977)`'s 45-row authority matrix is a mechanical
application of a decided model rather than 45 independent judgement calls.

It does **not** build that matrix (`SUB-13`), apply the invariant per row (`SUB-14`,
NEU-978), inventory the web API (`SUB-7`, NEU-980), or **decide** data-store topology
(`SUB-10`, NEU-984). On the last of those it does something narrower and deliberate: it makes
its own dependence on the store choice explicit, scores every model under **both** store
assumptions, and hands SUB-10 a reversal check.

**This chapter is written in a fixed order, and the order is the evidence.** §1 — the criteria
set, its weights and their sources — is committed to the repository **before any model has
been scored**, in a commit that contains no score at all. The scoring lands in a strictly
later commit. `OUT-3` requires each criterion's weight and source to be stated *before* the
scoring, and an acceptance criterion that a reader cannot check is not a criterion, so the
ordering is recorded as commit history rather than asserted in prose. §1.4 states the exact
command a reader runs to verify it.

The criteria set in §1 was committed alone, with no score, as **`f08339f`**. Everything from
§2 down landed afterwards. §1.4 states the command that checks it.

**Vocabulary.** Per `00_method-and-provenance.md` §4, *session* is written throughout as either
**learning session** (`SC-S3-5`) or **web session** (`SC-S3-43`) and never bare; *schema* is
written as **database schema** or **tool input schema**. No `docs/GLOSSARY.md` row is added for
`M-A`/`M-B`/`M-C`, *authority*, *assignment rule* or *exception set*: these are
package-governance vocabulary scoped to this charter, which §4.1 places outside the glossary.

---

## 1. The criteria set — weights and sources, fixed before any scoring

### 1.1 The eight criteria

`OUT-3` names the criteria this comparison must cover: *consistency, recovery, isolation,
compatibility, latency, operability, product delivery, deployment and testing*
(`01_outcome-register.md`, `OUT-3`). They are carried one-for-one, with no criterion added
and none dropped, so that the set cannot be accused of having been shaped around a
preferred answer.

| Id | Criterion | What it asks | Weight | Source of the weight |
| --- | --- | --- | ---: | --- |
| `C1` | **Consistency and conflict-freedom** | How much *additional* conflicting-write surface does this model create over the state the categories already have? | **22** | The program's Critical risk — divergence or conflicting writes between MCP-owned and web-owned state — restated at `01_outcome-register.md` `OUT-3`; sharpened by `05_…md` §4.4, which states that `BND-S4-16` creates a second writer and that OUT-3's exactly-one-authority audit then fails unless the written categories are disjoint. This is the risk the charter calls Critical and no other; it therefore carries the largest single weight. |
| `C2` | **Isolation** | How many new I3/I5 failure modes does the model introduce for the isolation invariant, once the transport gap is closed? | **18** | `01_outcome-register.md` `OUT-4`; `06_…md` §3 (the five checks) and `F-S5-4`. Second-largest because `OUT-4` is the only other outcome in the package with a stated invariant, and because a model that forecloses isolation cannot be migrated out of. |
| `C3` | **Recovery** | After a partial or failed write, can the affected state be reconstructed or repaired without loss? | **10** | `OUT-3`'s named criterion, evaluated against `04_…md` `SC-S3-9`/`SC-S3-10` — the review-attempt row and the write-once NEU-844 quad, the one state group in this system with a database-level write-once guard. |
| `C4` | **Compatibility with the existing deployment** | What must change in what already runs, and is there a backward-compatible path? | **14** | `A-28` (`93_stand-in-assumption-register.md`) — *the existing production deployment continues and a backward-compatible migration path exists*. Weighted third because `A-28` is a **constraint on the answer**, not a preference: a model that requires the deployment to stop is outside the envelope the package is allowed to select from. |
| `C5` | **Latency on the learner path** | Does the model put a boundary crossing on a read that has a sub-second budget? | **8** | `A-25` — per-learner, per-node tutoring interaction state **with sub-second read latency on the learner's path**. Weighted at 8 rather than higher because `A-25` is a stand-in, not a measured requirement, and `93_` records its invalidating outcome rather than a number. |
| `C6` | **Operability** | How many independently operated surfaces does the model create, and does it worsen a known operational gap? | **8** | `CAP-S4-1` (no component can be the deletion owner for `SC-S3-16`/`SC-S3-17`; the obstruction is structural) and `F-S3-3` (both log tables hold learner payload with no retention window, no deletion owner, no principal field); `05_…md` `CMP-S4-19` (the logging sinks). |
| `C7` | **Product delivery** | Can the rich authenticated web surface actually be built on this model — and at what cost to the MCP contract? | **12** | `A-27` (a rich authenticated web surface whose state is **not** gate-bearing), together with the charter's own framing that existing MCP session state fitting a rich web application is a **capability to evaluate**, not evidence that it fits. Weighted fourth because a model that scores perfectly on risk and cannot deliver the product is not a candidate — but the charter's Critical risk still outranks it. |
| `C8` | **Deployment and testing** | How many deployables and how much test infrastructure does the model require to be exercised honestly? | **8** | `A-28` (the existing deployment continues) and `05_…md` §4.2 `BND-S4-17` / `F-S4-5` — the STDIO edge is a trust boundary nothing enforces, and all three journeys were dogfooded across it, so "the journey ran fine" is not evidence about the gated path. A model whose correctness can only be observed with infrastructure that does not exist is penalised here rather than silently credited. |
|  | **Total** |  | **100** |  |

**Weights are relative, not absolute.** They express only the ordering and spacing above:
`C1 > C2 > C4 > C7 > C3 > C5 = C6 = C8`. Every source is a package artifact or a register
entry, cited by id — no weight is justified by "judgement" or by an unattributed preference.

### 1.2 The scoring anchors

Each criterion is scored `0`–`5` on the anchor set below, multiplied by its weight; a model's
total is out of **500**. The same anchors apply to every criterion and every model, so a
score is a claim about the anchor, not about the model's general merit.

| Score | Anchor |
| ---: | --- |
| **5** | The model introduces **no** new exposure on this criterion, and the property holds by construction — there is nothing to enforce because there is nothing that could violate it. |
| **4** | The model introduces no new exposure, but the property holds only while a stated structural condition is maintained. The condition is nameable and checkable. |
| **3** | The model introduces new exposure that is bounded and mitigable, but the mitigation is not established by any artifact in this package at this cutoff. |
| **2** | The model introduces new exposure that is material and whose mitigation requires work no charter currently owns. |
| **1** | The model introduces new exposure that directly contradicts a stated premise of the existing system, or that a named finding shows is already unhandled. |
| **0** | The model makes the criterion unsatisfiable. |

### 1.3 Two rules that govern how three of these criteria are scored

Stated here, before the scoring, because each one changes what a score *means* — and
discovering them after the fact would be indistinguishable from a re-weight.

1. **`C1` scores the *additional* conflict surface, not the absolute one.** Every category in
   this system today is written by code with a concurrency posture the codebase itself
   describes as premised on a single writer. That baseline is common to all three models and
   therefore cannot discriminate between them; scoring it would inflate every model equally
   and change no ordering. The baseline is recorded separately as a finding (§8) rather than
   folded into a score.

2. **`C2` scores *reachability*, never present-tense compliance.** `F-S5-4` records that at
   this cutoff **no** state category reaches `holds`, and that the binding constraint is the
   **transport**, not the database schema. Present-tense isolation is therefore identically
   `fails-transport` for all three models, which makes it non-discriminating. `C2` instead
   asks how many **new** I3 (confinement) and I5 (principal-integrity) failure modes a model
   introduces, evaluated against the state the invariant would reach once the transport gap
   is closed. Per `06_…md` §3.4.1, no `C2` score above 4 may rest on failing to find a
   counter-example; a 5 requires that no counter-example is *constructible*.

### 1.4 How a reader verifies that these weights preceded the scoring

The weights above are published in a commit that contains no score. The scoring in §3 and §4
lands in a later commit. To check it:

```
git log --follow --format='%h %ad %s' --date=short \
  -- docs/research/C010-system-and-repository-architecture/07_state-ownership-model-selection.md
git show <the-earliest-sha>:docs/research/C010-system-and-repository-architecture/07_state-ownership-model-selection.md
```

The earliest commit for this path must contain §1 in full and no score table. The scoring
commit records that SHA in §3's opening line.

**If a weight is ever revised after scoring**, it is recorded in §1.5 as a numbered revision
with the reason and the score set it invalidated — never by editing the table above in place.
A silent re-weight is the specific failure `OUT-3` exists to prevent.

### 1.5 Weight revisions

None. The table in §1.1 is the table the scoring in §3 and §4 was run against.

---

## 2. The candidate models

A model here is **a write-authority rule over classes of `04_…md` §3 rows** — not an
architecture sketch. Each is stated so that, given a row, it names one component.

### `M-A` — All-MCP

The MCP core is the **exclusive writer of every one of the 45 categories**. The web tier
(`CMP-S4-3`) holds no write authority over any row and no database credential; every web
mutation is an MCP tool call across `CMP-S4-4` (the HTTP transport edge), and every web read
is an MCP tool call or a projection the core produced. `BND-S4-16` — the undecided web tier ↔
persistence edge — is resolved as **the write edge does not exist**.

### `M-B` — Shared-store hybrid (co-authority by convention)

The web tier and the MCP core **both hold write authority**, partitioned by category, and both
write the same production store directly. The partition is a convention recorded in a
document; nothing in the store or the transport enforces it. This is the "hybrid" the charter
names, taken at its strongest plausible reading: the partition is drawn deliberately and in
good faith, and the model is scored on what happens when it is.

### `M-C` — Namespace-disjoint delegated surface *(the third model this comparison surfaced)*

The MCP core is the **exclusive writer of every category the isolation invariant's domain
touches** and of every gate-bearing category. The web tier is the exclusive writer of a
**closed, enumerated set** of categories, in a **namespace the MCP core never writes** —
a separate database schema, or a separate store entirely. The web tier reads learning state
only through MCP tools; it never reads core tables directly.

`M-C` is not a variant of `M-B`: its disjointness is **structural** (the two writers address
disjoint namespaces, so a mis-drawn partition is a deployment error that fails loudly rather
than a silent overlap), where `M-B`'s is **conventional**. That distinction is exactly the one
`05_…md` §4.4 forces this sub-task to confront — *"disjointness is the condition SUB-6 must
demonstrate, not assume"* — and it is why the comparison could not honestly be run as a
two-way.

---

## 3. Scored comparison — under a shared production Postgres

*Criteria set and weights from §1, committed as `f08339f` before any score below existed.*

Store assumption for this section: the web tier's state, if it has any, lives in **the same
Postgres instance the MCP core already uses**. `A-28`'s envelope explicitly tolerates this —
it records that the production Postgres being shared with, or fronted by, a new web tier is
inside the envelope, because `OUT-8` decides store topology.

### 3.1 The codebase facts every `C1`/`C3` score below rests on

Read at the 2026-08-21 cutoff on `origin/develop`. These were **read, not spiked** —
`92_…md` §3's justification test is satisfied by reading, so no spike was filed for them.

| # | Fact | Citation |
| --- | --- | --- |
| 1 | The SM-2 scheduling write is read-modify-write: the row is read, the new `easeFactor`/`repetitions`/`intervalDays`/`nextReviewAt`/`consecutiveFailures` are computed in application code, and the computed object is written back by a blind `UPDATE … WHERE id = ?`. | `src/orchestration/review-workflows.ts:35`, `:60`–`:89`, `:99`; `src/adapters/drizzle/review-persistence-adapter.ts:78`–`:83` |
| 2 | The codebase **states its own concurrency premise**: *"Note: TOCTOU — getChunk → validate → persist has a small race window. Acceptable for single-user MCP; the rowCount === 0 guard below catches concurrent deletes."* | `src/orchestration/review-workflows.ts:190`–`:191` |
| 3 | No optimistic concurrency control exists anywhere in `src/`: zero `FOR UPDATE`, zero `pg_advisory`, zero `xmin`, and no compare-and-set predicate. `contentVersion` (`src/infrastructure/db/schema.ts:70`) is written unconditionally and never appears in a `WHERE`. | `src/infrastructure/db/schema.ts:70`; repository `update()` calls filter on `eq(table.id, id)` alone |
| 4 | No transaction sets an isolation level. `withTx` is a bare `db.transaction(async tx => fn(tx))` with no options object, so Postgres's default **READ COMMITTED** applies everywhere. | `src/infrastructure/db/operations.ts:21`–`:24`; `src/adapters/drizzle/unit-of-work-adapter.ts:9`–`:24` |
| 5 | `UnitOfWorkPort`'s `TransactionPorts` exposes only `chunks`, `topics`, `sessions`. `reviewPersistence` is **absent**, so the SM-2 read-compute-write is never wrapped in the unit of work at all. | `src/ports/unit-of-work-port.ts:26`–`:28` |
| 6 | The "one active **learning session** per learner" invariant is enforced only in application code, across two round trips, and `learning_sessions` carries **no** partial unique index on `status = 'active'` — only two CHECK constraints. | `src/orchestration/session-workflows.ts:39`–`:46`, `:68`–`:78`; `src/adapters/drizzle/session-repository.ts:50`–`:65`; `src/infrastructure/db/schema.ts:99`–`:124`, CHECKs at `:118`–`:122` |
| 7 | The **one** database-level write-once guard in the whole database schema covers review attempts: `uniqueIndex('uq_session_question_attempts_question_number')` on `(sessionQuestionId, attemptNumber)` plus `check('chk_attempt_number', … IN (1,2))`. `attemptNumber` is nonetheless computed in application code as `existingAttempts.length + 1`. | `src/infrastructure/db/schema.ts:225`–`:229`; `src/orchestration/teaching-workflows.ts:1190`, `:1198` |
| 8 | Atomic, computed-in-SQL writers **do** exist in the same adapter directory — `mergeValidatorReport` (JSONB `||` merge, with a comment saying it exists to avoid the RMW race), `shiftOrderIndexesAtOrAbove` (`sql\`… + 1\``), and two `ON CONFLICT DO UPDATE` upserts — so the pattern is available and simply not applied to learner state. | `src/adapters/drizzle/chunk-repository.ts:149`–`:160`, `:347`; `src/adapters/drizzle/linter-validation-repository.ts:41`–`:49`, `:84`–`:97` |

Facts 1–6 together mean: **nothing in the code or the database schema prevents a second
writer from silently overwriting learner scheduling state, and the codebase's own comment
says so.** Fact 7 is the single exception — and fact 8 shows the mitigation is a pattern this
codebase already knows, which is what makes `C1` a difference in *exposure* rather than in
*achievability*.

### 3.2 The scores

| Criterion (weight) | `M-A` | `M-B` | `M-C` |
| --- | :---: | :---: | :---: |
| `C1` Consistency and conflict-freedom (22) | **5** | **1** | **3** |
| `C2` Isolation (18) | **5** | **1** | **3** |
| `C3` Recovery (10) | **4** | **2** | **4** |
| `C4` Compatibility (14) | **5** | **2** | **4** |
| `C5` Latency (8) | **4** | **4** | **4** |
| `C6` Operability (8) | **4** | **2** | **3** |
| `C7` Product delivery (12) | **2** | **5** | **5** |
| `C8` Deployment and testing (8) | **5** | **2** | **4** |
| **Weighted total / 500** | **438** | **212** | **364** |

### 3.3 The evidence behind each cell

**`C1` — `M-A` 5 · `M-B` 1 · `M-C` 3.**
`M-A` introduces no second writer at all, so the additional conflict surface is empty by
construction — anchor 5. `M-B` scores **1** under the anchor "directly contradicts a stated
premise of the existing system": fact 2 is that premise, in the repository's own words, and
`M-B` is the model that falsifies it. Facts 3, 4 and 6 give the concrete mechanism — a second
writer racing `session-workflows.ts:39`–`:46`'s check-then-insert produces two concurrently
active **learning sessions** with nothing in the database rejecting it. `M-B` is not scored
**0** because `A-29` bounds the damage: there is no continuous bidirectional sync, so no model
must solve two-way convergence, and a conflicting write is a lost update rather than a
divergence that compounds. (`A-29`'s invalidating outcome — an external client holding write
authority over any state category — would remove that bound; under `M-B` that outcome is
closer than under either alternative, which is worth stating at the score it decided.)
`M-C` scores **3**, not 4: its disjointness is structural, but *under a shared Postgres* the
web tier still holds a credential to the same instance, and **no artifact in this package
establishes that table- or schema-level grants confine it**. Anchor 3 is exactly "new exposure
that is bounded and mitigable, but the mitigation is not established by any artifact in this
package at this cutoff". Scoring it 4 here would be an assertion, which `92_…md` §2 forbids.

**`C2` — `M-A` 5 · `M-B` 1 · `M-C` 3.** Scored as reachability per §1.3 rule 2.
`M-A` introduces no new I3 (confinement) or I5 (principal-integrity) failure mode: there
remains exactly one enforcement point, at or below the port boundary, and no counter-example
is *constructible*, which §1.3 requires for a 5 rather than merely "none found" (`06_…md`
§3.4.1). `M-B` fails I3 by construction for every category the web tier writes — the web tier
reaches the store without passing the port boundary — and doubles the I5 surface, since two
components independently resolve a principal. `M-C` scores **3** for the same grant reason as
`C1`: the invariant's domain is untouched by construction, but the confinement claim under a
shared instance rests on enforcement no artifact establishes.

**`C3` — `M-A` 4 · `M-B` 2 · `M-C` 4.**
Fact 7 is the whole criterion: review attempts are the one state group with a database-level
write-once guard, so a duplicate concurrent insert fails loudly rather than diverging. That
guard protects under every model, which is why no model scores 1. `M-A` and `M-C` score **4**
rather than 5 because fact 5 — `reviewPersistence` absent from `TransactionPorts` — means
`SC-S3-3` has no transactional envelope under *any* model; the property holds only while the
single-writer condition is maintained, which is anchor 4 precisely. `M-B` scores **2**: with
two writers, `attemptNumber` computed as `existingAttempts.length + 1` (fact 7) turns into a
user-visible unique-constraint violation on a legitimate concurrent attempt, and repairing it
requires work no charter owns.

**`C4` — `M-A` 5 · `M-B` 2 · `M-C` 4.** `A-28` is the source: *the existing production
deployment continues and a backward-compatible migration path exists*; its invalidating
outcome is that safe isolation requires a separate deployment or separate datastore.
`M-A` changes nothing that already runs — the web tier is a client of an interface that
exists. `M-C` adds a namespace and leaves every existing table untouched — anchor 4, the
structural condition being that the namespace stays disjoint. `M-B` scores **2**: the web tier
must replicate the core's write semantics for its partition and adopt the OCC discipline fact
3 says the core does not have, which is work no charter currently owns.

**`C5` — `M-A` 4 · `M-B` 4 · `M-C` 4 — and it does not discriminate. See `SPK-S6-1`.**
The intuitive case against `M-A` is that routing every read through an MCP tool call is too
slow for `A-25`'s sub-second budget. That claim could not be settled by reading — the
codebase and the SDK state no latency figure — so it was **spiked**, not asserted.
`SPK-S6-1` measured the MCP tool boundary's protocol, schema-validation and envelope overhead
against a direct in-process baseline at two payload sizes, over 2000 iterations each, on Node
v22.23.1 with `@modelcontextprotocol/sdk` 1.27.1: **p95 overhead 0.19 ms** for a 714-byte
tutoring-state read and **0.06 ms** for a 29,715-byte `LearnerContext` aggregate — at most
**0.02% of a 1000 ms budget**. The boundary is not the cost. All three models therefore score
4, and `C5` contributes 32 points to every model and changes no ordering.
Two residuals are stated rather than absorbed: the measurement excludes any **network hop**
(it is a floor, not a prediction), and it is **per call**, so a web view needing *k* reads pays
*k* crossings. Both residuals are properties of deployment topology, which is `SUB-10
(NEU-984)`'s; neither is a property of the ownership model, which is why neither moves a score
here. `A-25`'s invalidating outcome — synchronous multi-turn AI orchestration inside a
gate-bearing write path — is untouched by this result and remains open.

**`C6` — `M-A` 4 · `M-B` 2 · `M-C` 3.** `CAP-S4-1` records that **no component** can be the
deletion owner for `SC-S3-16`/`SC-S3-17`, and that the obstruction is structural; `F-S3-3`
records that both log tables hold learner payload with no retention window and no principal
field. Every model inherits that gap; the criterion asks which model *worsens* it. `M-A` adds
no new log producer — anchor 4, the condition being that the gap stays exactly as `CAP-S4-1`
describes it. `M-B` adds a second producer writing learner payload into tables that already
have no deletion owner — anchor 2. `M-C` adds a second operated surface but in its own
namespace, so its retention question is at least *separable* — anchor 3.

**`C7` — `M-A` 2 · `M-B` 5 · `M-C` 5. This is `M-A`'s real cost and it is not minimised.**
`A-27` posits a rich authenticated web surface whose state is **not** gate-bearing.
Under `M-A`, every write of that state becomes an MCP tool call — which means the tool surface
(46 registered tools, 43 gated, 3 exempt at `06_…md` §6.2's re-count) must grow
presentation-shaped tools, and non-gate-bearing state acquires the gating of the tool that
carries it. That is a real cost to the MCP contract, and anchor 2 — material new work no
charter currently owns — is the honest score, not a grudging 3. `M-B` and `M-C` both score 5:
the web tier owns its own presentation state outright and the MCP contract is untouched.
Whether `M-A`'s cost is merely awkward or actually blocking is **not settled here** — it is
`SUB-7 (NEU-980)`'s resource inventory that settles it, and §5.3 makes that a named clause of
the reversal condition rather than leaving it as ambient doubt.

**`C8` — `M-A` 5 · `M-B` 2 · `M-C` 4.** One deployable and one test harness for `M-A`. `M-C`
has two deployables with disjoint write sets, each testable alone — anchor 4. `M-B` scores
**2** because its correctness claim is *two writers do not conflict*, and observing that
requires a live database and a two-process harness; `CAP-S6-1` records that no Postgres was
reachable at this cutoff, so under `M-B` the model's central claim would ship unobserved.
`F-S4-5` is the cautionary precedent: all three journey walks were dogfooded across the
**unenforced** STDIO edge (`BND-S4-17`, owner `nobody`), so "it ran fine" is not evidence about
the gated path — and it would not be evidence about the two-writer path either.

---

## 4. Scored comparison — under a separate web store

Store assumption for this section: the web tier's state lives in **its own store**, with no
shared credential path into the MCP core's tables.

### 4.1 The scores

| Criterion (weight) | `M-A` | `M-B` | `M-C` |
| --- | :---: | :---: | :---: |
| `C1` Consistency and conflict-freedom (22) | **5** | **1** | **4** |
| `C2` Isolation (18) | **5** | **1** | **4** |
| `C3` Recovery (10) | **4** | **1** | **4** |
| `C4` Compatibility (14) | **5** | **1** | **4** |
| `C5` Latency (8) | **4** | **4** | **4** |
| `C6` Operability (8) | **4** | **1** | **2** |
| `C7` Product delivery (12) | **2** | **5** | **5** |
| `C8` Deployment and testing (8) | **5** | **1** | **3** |
| **Weighted total / 500** | **438** | **172** | **388** |

### 4.2 What moved, and why

**`M-A` is store-invariant, and that invariance is itself a property.** Its scores are
identical in §3.2 and §4.1 because under `M-A` the web tier holds no state, so there is no
"web store" for the assumption to be about. No cell moved. A model whose score cannot be moved
by a decision another sub-task has not yet made is, all else equal, the safer thing to build
a matrix on — and `SUB-13 (NEU-977)` is about to build one.

**`M-C` improves on `C1` (3 → 4) and `C2` (3 → 4).** The §3.3 reservation was that under a
shared instance the confinement rests on grants no artifact establishes. A separate store with
no shared credential path removes the reservation structurally rather than by policy: the web
tier cannot address core tables. It reaches **4**, not 5, because anchor 5 requires that
nothing *could* violate the property, and `M-C` still has two principals resolving
independently — a real I5 surface, and one §1.3 forbids scoring away by not finding a
counter-example.

**`M-C` degrades on `C6` (3 → 2) and `C8` (4 → 3).** A second store is a second backup,
retention, migration and monitoring surface — and `CAP-S4-1`'s deletion-owner gap now has to
be answered twice, in two places, still with no owner. `C8` drops because integration coverage
now needs two stores stood up in CI, against the `CAP-S6-1` finding that not even one was
reachable at this cutoff.

**`M-B` degrades on `C3`, `C4`, `C6` and `C8` (each to 1).** A separate store makes `M-B` its
worst self: the partition now spans two databases with no cross-store transaction available at
all, so a write touching both sides has no atomicity of any kind, and reconciliation after a
partial failure has no owner and no mechanism. `C1`/`C2` were already at 1 and cannot fall
further under this anchor set.

---

## 5. The selection, the store-assumption statement, and the reversal check handed to SUB-10

### 5.1 The selection

**`M-A` — all-MCP — is selected, and the selection is stable across both store assumptions.**

| Store assumption | `M-A` | `M-C` | `M-B` | Margin, `M-A` over runner-up |
| --- | ---: | ---: | ---: | ---: |
| Shared production Postgres | **438** | 364 | 212 | **74 / 500 (14.8 pp)** |
| Separate web store | **438** | 388 | 172 | **50 / 500 (10.0 pp)** |

`M-A` wins under both, `M-C` is runner-up under both, `M-B` is last under both. The margin
**narrows** as the store separates — from 74 to 50 — because separation is the thing that
makes `M-C`'s structural disjointness enforceable. That direction is the whole reason §5.3
exists: the store decision cannot flip the selection on its own, but it moves it, and it moves
it one way.

**`M-B` is additionally disqualified**, independently of its score, by the durability property
in §7. A model that cannot *show* NEU-890's property fails the selection outright; §7 records
that `M-B` can only promise it.

**What the selection decides about `BND-S4-16`.** `05_…md` §4.2 leaves the web tier ↔
persistence edge undecided with its class already fixed as *process, not trust*, and §4.4
makes disjointness a condition SUB-6 must demonstrate rather than assume. Selecting `M-A`
resolves it the other way: **the write edge does not exist**, so there is no second writer and
no disjointness obligation to discharge. No demonstration is owed because no hybrid was
selected. Had `M-C` been selected, §6's clause 3 enumeration would have been that
demonstration — which is why the rule is written to hold that set explicitly rather than
implicitly. This disposition is recorded here and routed to `SUB-13 (NEU-977)` and
`SUB-14 (NEU-978)`; `05_…md` is another sub-task's chapter and is not edited.

### 5.2 The store-assumption statement, in the form SUB-10 checks against

**Route taken: Route A** — every model was scored under **both** store assumptions, both score
sets are published (§3.2, §4.1), and the stability statement is §5.1. This chapter therefore
does **not** rest on a single undeclared store assumption; no score above is silent about which
store it assumes.

`SUB-10 (NEU-984)` looks its selected topology up here:

| If `OUT-8` selects… | Effect on this selection | Action for SUB-10 |
| --- | --- | --- |
| Shared production Postgres, MCP core the only credential holder | None. §3.2 applies; `M-A` by 74. | None. Record the match. |
| Shared production Postgres, a second credential holder exists | None to the *selection*, but `M-A` forbids the second holder from writing. A second **writer** contradicts `M-A` itself. | Raise a finding to SUB-6 — this is not a store outcome, it is an ownership-model change. |
| Separate web store | None to the selection. §4.1 applies; `M-A` by 50. **Clause R1 of §5.3 is satisfied.** | Check the remaining two clauses of §5.3. |
| Separate store *for MCP core state* (i.e. core data moves) | Outside every score set above. Not evaluated. | Raise a finding to SUB-6; the comparison must be re-run. |

### 5.3 The reversal condition — precise, and a conjunction

**No single store outcome reverses this selection.** The selection reverses only if **all
three** of the following hold. Each is stated with the cell it moves and the arithmetic, so
SUB-10 can evaluate it mechanically rather than by judgement.

| Clause | Condition | Cell moved | Δ |
| --- | --- | --- | ---: |
| **R1** | `OUT-8` selects a **separate web store with no shared credential path** into the MCP core's tables. | `M-C` `C1` 3 → 4 | +22 |
| **R2** | NEU-893's isolation mechanism resolves the **same authenticated subject at a single enforcement point spanning both tiers**, removing `M-C`'s second independent principal resolution. | `M-C` `C2` 3 → 4 | +18 |
| **R3** | `SUB-7 (NEU-980)`'s resource inventory establishes **at least one required web-surface state item that cannot be expressed as an MCP tool without making non-gate-bearing state gate-bearing**. | `M-A` `C7` 2 → 1 | −12 |

Arithmetic from the §4.1 baseline (`M-A` 438, `M-C` 388):

| Clauses satisfied | `M-C` | `M-A` | Outcome |
| --- | ---: | ---: | --- |
| R1 + R2 | 428 | 438 | `M-A` holds by 10 |
| R1 + R3 | 410 | 426 | `M-A` holds by 16 |
| R2 + R3 | 406 | 426 | `M-A` holds by 20 |
| **R1 + R2 + R3** | **428** | **426** | **`M-C` overtakes by 2 — selection reverses** |

Two things about that last row are stated rather than glossed. First, **all three clauses are
required**; any two leave `M-A` ahead. Second, the reversing margin is **2 points out of 500** —
the reversal is real but fragile, and a reader who reaches it should treat the two models as
effectively tied on this criteria set rather than as a decisive win for `M-C`.

### 5.4 The obligation handed to SUB-10, with SUB-6 named as the finding's owner

`SUB-10 (NEU-984)` runs the §5.3 check against its selected topology and, if all three clauses
are satisfied — **or** if it selects a topology §5.2's table marks as raising a finding —
files a finding **routed to `SUB-6 (NEU-976)`, which is named here as that finding's owner**.
The reversal is thereby detected rather than absorbed into residual uncertainty. Tracked as
`OI-S6-1` in `90_open-items-and-provisional-register.md`.

**The known limit of this handoff, carried honestly.** This chapter has already shipped by the
time SUB-10 runs. The charter's review accepted a warning — **`F5.7`**, cited by id because the
review log is not a published artifact of this package — recording that four sub-tasks route
findings backwards to an already-shipped owner and that **nothing in the package re-dispatches
that owner**: `SUB-11 (NEU-985)` only audits and routes, and `SUB-12 (NEU-986)` out-of-scopes
making or revising any architecture decision. The four routes are SUB-10 → SUB-6 (this one),
SUB-13 → SUB-7, SUB-13 → SUB-8 and SUB-9 → SUB-15. The residual is that a satisfied reversal
condition may be recorded and go unactioned, leaving this chapter and everything `SUB-13`
derives from it stale. That was **accepted as a warning, not fixed**, and it is carried here as
the residual it is, tracked as `OI-S6-2`.

---

## 6. The assignment rule

`SUB-13 (NEU-977)` must be able to take a `04_…md` §3 row the comparison never named and
derive a candidate authority **without re-opening the model choice**. The rule below is
ordered and **first-match-wins**: walk the clauses in order, and the first that matches names
exactly one component. Every clause keys on a field that actually exists in `04_…md` §3 or on
a named `05_…md` lookup — no clause requires a judgement call about the row's "nature".

### 6.1 The clauses

> **Clause 1 — Non-durable.** If the row's persistence cell is `derived-on-read` or
> `process-local`, authority is **the component whose process computes it**, taken from the
> row's own store/producer cell. The row is recorded `n/a — non-durable` and is **out of the
> exactly-one-authority audit's write scope**. (A cell reading `to be defined` is *not*
> `derived-on-read`; it falls through.)
>
> **Clause 2 — Gate-bearing.** If the row's value can change a serve or authoring verdict —
> established by a `05_…md` lookup: the row is read by `CMP-S4-14` (the quality-gate battery)
> or `CMP-S4-15` (the gate runner), or appears in §7's quarantine disposition — authority is
> **the MCP core, caller-side per `BND-S4-4`**: `CMP-S4-7` on the request path, `CMP-S4-14` on
> the authoring path. The web tier **never** holds gate authority (`05_…md`, `CMP-S4-3`).
> **No later clause may override clause 2.**
>
> **Clause 3 — Enumerated presentation exception.** Authority is the web tier `CMP-S4-3`, in a
> namespace the MCP core never writes — but **only** for a row on the closed enumerated list in
> §6.3, and only when all four of these hold: (i) clause 2 did not match; (ii) the row's
> classification is `assumed` and its stand-in is `A-27`; (iii) the row's value cannot change a
> schedule, a mastery record, an assessment-evidence record or a serve verdict; (iv) the row's
> store cell is `none`, so no existing MCP writer is displaced. **All four — two or three of
> four is not an exception.**
>
> **Clause 4 — Identity mapping.** A `SC-S3-45`-class row — the binding of an authenticated
> subject to the rows it owns — is **authored in `Z-IDP` (`CMP-S4-2`)** and *projected*, never
> authored, by every other zone.
>
> **Clause 5 — In the isolation invariant's domain.** If I1 of `06_…md` §3.3 places the row in
> domain — its `Learner-scoped` cell is `yes` **or** `question — open` — authority is the **MCP
> core's persistence adapters (`CMP-S4-9`), written through `CMP-S4-7`**. An unanswered scoping
> question does **not** create an exception; only an explicit `no` leaves the domain.
>
> **Clause 6 — Default.** **MCP core (`CMP-S4-7`).** The core is the default authority. The web
> tier's authority exists only through clause 3's closed enumeration; leaving the invariant's
> domain is never by itself a route to the web tier.

**Tie-break — when two components both plausibly own a row.** In order: **(a)** if the row is
in the isolation invariant's domain, the core wins — an isolation failure outranks a
presentation stall; **(b)** if it is out of domain but read on a gate path, the core wins;
**(c)** if neither, the component that **produces** the row wins; **(d)** if two components
both produce it, that is **not a tie — it is a defect in the inventory**. Route it back as a
finding against `04_…md` rather than splitting authority, because split authority is precisely
the outcome `OUT-3`'s exactly-one-authority audit exists to reject.

**What makes a row an exception.** Exactly and only a clause-3 match. The exception set is
**closed and enumerated by id** (§6.3) — it is a list, not a rule `SUB-13` may extend. A row
that looks like a new candidate for it is a **finding routed to SUB-6**, not a judgement call
at matrix-assembly time.

### 6.2 Two demonstrations, on rows that exit the clause list at different points

**`SC-S3-3` — per-chunk SM-2 scheduling state — classification `existing`.**
Row fields (`04_…md` §3): store `public.learning_chunks` (`:59`–`:65`), persistence `durable`,
derived `no`, **`Learner-scoped: question — open`**.
Walk: clause 1 no — persistence is `durable`, not `derived-on-read`/`process-local`.
Clause 2 no — no `05_…md` lookup places SM-2 scheduling fields in `CMP-S4-14`/`CMP-S4-15`'s
read set or in §7's quarantine disposition. Clause 3 no — classification is `existing`, failing
test (ii) at the first hurdle. Clause 4 no. **Clause 5 matches**: `question — open` is in domain
per `06_…md` §3.3. → **Authority: MCP core `CMP-S4-9`, written through `CMP-S4-7`.**
*What the demonstration is for:* `SC-S3-3` is the row most likely to be argued into the web
tier, because a scheduling widget is a UI concern and its scoping question is **unanswered**.
The rule refuses that argument mechanically — an open question is in domain, and being
in domain reaches clause 5 before any exception is available. Under `M-A` the answer would be
the same by clause 6 in any case; the point is that it is the same *for a stated reason*.

**`SC-S3-37` — DP-map node and prerequisite-edge records — classification
`required-by-upstream`.**
Row fields: store **`none` in this system** — the graph is a committed artifact in NEU-889's
package, not a table here; persistence `to be defined`; derived `no`; **`Learner-scoped: no` —
the graph is learner-independent by construction**.
Walk: clause 1 no — `to be defined` is not `derived-on-read`. Clause 2 no at this cutoff — the
graph is not yet imported, so no component in this system's gate battery reads it. Clause 3 no
— classification is `required-by-upstream`, failing (ii). Clause 4 no. Clause 5 **no** — an
explicit `no` leaves the domain. **Clause 6 matches.** → **Authority: MCP core `CMP-S4-7`.**
*What the demonstration is for:* two things a matrix-builder would otherwise get wrong.
First, leaving the invariant's domain is **not** a route to the web tier — clause 6 catches the
row and hands it back to the core. Second, the assignment is **robust to `OI-S4-1`**: if the
DP-map import lands and a gate begins reading the graph, clause 2 fires instead of clause 6 and
the answer is *unchanged*. That is why `OI-S4-1` — which names SUB-6 as a consumer — does not
gate this chapter's output; the disposition is recorded at `90_…md` `### SUB-6`.

### 6.3 The exception set under the selected model

**Empty.** `M-A` makes the MCP core the exclusive writer of all 45 categories, so clause 3
matches no row and clause 6 is the terminal clause for everything clauses 1, 2, 4 and 5 do not
claim. Clause 3 is nonetheless **retained in the rule, not deleted**, for a stated reason: if
§5.3's reversal fires and `M-C` is selected, the reversal changes only the *contents* of this
list — the single row `SC-S3-43` (**web session** and UI interaction state; classification
`assumed`, stand-in `A-27`; store `none`) — and changes nothing about the rule's structure,
its ordering, its tie-break or its exception test. A rule that has to be rewritten on reversal
would make the reversal far more expensive than it is.

---

## 7. The durability property NEU-890 requires

**The property.** A retired citation degrades a placement **without stranding mastery
history** — because assessment evidence is corpus-neutral and the cited problem is a
replaceable attribute. A model that cannot **show** this fails the selection.

**The chain it runs over**, from `04_…md` §3:

- `SC-S3-32` — the problem-citation record, **`stable_id` + `canonical_url` only**
  (`CAP-S3-1` fixes the field restriction; it does not widen).
- `SC-S3-31` — the corpus-neutral assessment-evidence record. Identity is
  **`node_id` + `skill_type`**; the citation is an **optional, replaceable, non-key
  attribute**. This is the load-bearing fact of the whole test.
- `SC-S3-38` — per-learner per-node progression. `Learner-scoped: yes`.
- `SC-S3-39` — the durable multi-session mastery composite the durability gate reads,
  persisted rather than recomputed per read. `Learner-scoped: yes`.

**The walk.** A drift verdict (`SC-S3-34`) establishes that a cited `stable_id` no longer
resolves. The retirement must therefore: mark `SC-S3-32` retired; leave every `SC-S3-31` row's
**identity** intact, since the citation was never part of it; and let `SC-S3-38`/`SC-S3-39`
recompute from the surviving evidence — the placement degrades because fewer evidence items
support it, and no mastery history is deleted, re-keyed or orphaned.

| Model | Verdict | Why |
| --- | --- | --- |
| **`M-A`** | **Holds** | All four rows have a single writer, the MCP core. The retirement is a single-authority mutation of a **non-key attribute** on `SC-S3-31`, and nothing else is capable of writing those rows. The property holds *by construction*, not by discipline — which is what "show" requires. |
| **`M-C`** | **Holds** | Identical. None of the four rows is in §6.3's exception set — `SC-S3-43` is the only candidate the reversal would add, and it is not on this chain. The four rows are core-owned under `M-C` exactly as under `M-A`. |
| **`M-B`** | **Fails — cannot be shown** | `M-B`'s partition is a convention, and nothing in the model prevents it being drawn with `SC-S3-32` on the web side: a citation record is a corpus/content concern that a content-administration web surface would naturally claim, while `SC-S3-31` stays with the core as learner evidence. The retirement then spans two authorities with **no shared transaction** (`src/ports/unit-of-work-port.ts:26`–`:28` — the unit of work does not span components at all), under **READ COMMITTED** (`src/infrastructure/db/operations.ts:21`–`:24`), with **no compare-and-set anywhere** (§3.1 fact 3). A partial failure between "mark retired" and "recompute the composite" leaves `SC-S3-39` referencing evidence whose citation is gone, with no owner and no mechanism to repair it. |

**The verdict, stated precisely.** `M-B` is not shown to *violate* the property — a
well-drawn partition satisfies it. `M-B` is shown to be **unable to demonstrate** it, because
the model's own definition leaves the partition line open and supplies nothing that would fail
loudly if it were drawn wrongly. The brief's bar is *show*, not *promise*. **`M-B` therefore
fails the selection on this test independently of its score of 212 / 172.**

`M-A`, the selected model, **passes** — and passes for the strongest available reason: the
property is not enforced, it is unviolatable, because there is exactly one writer.

---

## 8. What this chapter found on the way

Five findings, filed in full at `02_findings-register.md` `### SUB-6`. Summarised here so this
chapter stands alone:

- **`F-S6-1`** — The codebase's concurrency posture is **explicitly premised on a single
  writer**, in its own words (`src/orchestration/review-workflows.ts:190`–`:191`), and no
  optimistic concurrency control or isolation level exists anywhere to back it up. The premise
  is already false for any horizontally-scaled MCP deployment, **before any web tier exists**.
  This is the `C1` baseline §1.3 rule 1 deliberately excludes from the scores.
- **`F-S6-2`** — `reviewPersistence` is absent from `UnitOfWorkPort`'s `TransactionPorts`
  (`src/ports/unit-of-work-port.ts:26`–`:28`), so `SC-S3-3`'s read-compute-write has **no
  transactional envelope under any ownership model**.
- **`F-S6-3`** — The "one active **learning session** per learner" invariant is enforced only
  in application code across two round trips, with no partial unique index behind it. This is
  the concrete mechanism behind `M-B`'s `C1` score of 1.
- **`F-S6-4`** — `SPK-S6-1` shows the MCP tool boundary costs **at most 0.02% of `A-25`'s
  sub-second budget**, so the latency argument for a hybrid does not survive measurement.
  `C5` does not discriminate between the models.
- **`F-S6-5`** — `92_spike-register.md` §10 still announces *"None. This register holds no
  spike results"* while holding two. Corrected by finding, not by edit — the third instance of
  this class in the package, after `F-S4-2` and `F-S5-3`.

One spike (`SPK-S6-1`) and one cap (`CAP-S6-1`) were filed; two open items (`OI-S6-1`,
`OI-S6-2`) were recorded, alongside a recorded **disposition of `OI-S4-1`** — the DP-map
staleness item that names SUB-6 as a consumer — which §6.2 shows cannot change this chapter's
output either way. `93_stand-in-assumption-register.md` is closed and no sixth stand-in was
added; `94_package-completeness-gate.md` was read for `SUB-12`'s scope and **not touched**.

**Deliberately not filed.** The `F-S3-3` / `CAP-S4-1` deletion-owner gap surfaces here for a
**fourth** time, at `C6`. Following the precedent SUB-4 and SUB-5 set, it is recorded as a
consequence in `DR-C10-S6-1` rather than as a fourth register entry — a gap does not become
more owned by being filed again. Likewise `CAP-S1-3` already carries the package-level
statement that `qa-execution:engine` is unconfigured and no QA pass exists for this package;
no second cap is filed for it.
