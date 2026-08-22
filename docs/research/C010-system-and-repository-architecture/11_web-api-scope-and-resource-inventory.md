# 11 — The general web API: scope, negative boundary, and resource-level inventory

**Task:** NEU-980 (SUB-7) · **Charter:** C010 (umbrella NEU-895) · **Compiled:** 2026-08-22
**Model:** claude-opus-5[1m]
**Covers:** `OUT-5` · **Consumes:** `05_…md` (SUB-4 / NEU-974), `10_…md` (SUB-16 / NEU-979)
**Consumers:** SUB-15 (NEU-982), SUB-10 (NEU-984), SUB-11 (NEU-985), SUB-12 (NEU-986), NEU-896

---

## 1. What this chapter is, and what it is not

**It is** the published definition of the general web API's responsibility: what it is for, what it may
expose, **what it must never own**, where its auth and trust boundary sits, and — as the proof surface
for all of that — a resource-level inventory in which **every exposed capability names exactly one
authority taken from the republished matrix**.

**It is not** a wire contract. It specifies **no endpoint path, no payload schema, no error catalogue,
no versioning scheme and no pagination model**, and §12 audits that stop as three counts and states it
in prose so a downstream charter can tell **open by design** from **accidentally missing**.

**It is not** the authority matrix and it does not amend one. Every authority in §9 is *read off*
`10_…md` §8. Where this chapter's inventory and that matrix disagree, the disagreement is published as
a **routed finding** (§11), never as a correction here.

**Why the negative half is the load-bearing half.** The charter's Critical risk is *"MCP and web-owned
state diverge or permit conflicting writes"*. A document that says only what the API owns leaves the
dangerous half unsaid: a downstream implementation charter, finding no statement about a category,
would reasonably conclude the API may write it. **Silence is therefore a defect in this chapter**, and
§10 enumerates all forty-five categories one at a time rather than covering them with a single
sentence.

---

## 2. The revision this chapter resolved against

This chapter resolves every authority against the **`post-validation`** revision, cited by its own
marker:

> **`08_…md` + `10_…md`, revision `post-validation` (SUB-16 / NEU-979)**

That is the revision produced by SUB-16 (NEU-979) absorbing SUB-14 (NEU-978)'s validation into SUB-13
(NEU-977)'s assignment. **Citing `08_…md` alone would be citing the `pre-validation` state** — the
assignment before eleven routed findings were dispositioned and two rows re-authored — and `10_…md` §2
records that a downstream audit doing so is a finding against that audit. This chapter is a named
consumer in that same consumption statement, alongside SUB-8 (NEU-981) and SUB-10 (NEU-984).

**Read together as `10_…md` §2 directs:** the row's authority, clause, status and revision state come
from `10_…md` §8; the row's nine attributes come from `08_…md` §8, except for `SC-S3-16` and `SC-S3-17`,
whose attributes are re-authored in `10_…md` §6 and supersede. This chapter uses the authority and the
clause, so it reads `10_…md` §8 throughout.

**The state-category ids and their `Learner-scoped` cells** come from `04_state-category-inventory.md`
§3 (SUB-3 / NEU-973), which the republication does not touch (`10_…md` §8.1).

---

## 3. The two audits, named apart before either is run

This package contains **two different bidirectional cross-checks**, over **two different inventories**,
discharging **two different outcomes**. Conflating them is the single largest failure mode available to
this chapter, so they are separated before any number is reported.

| | **Audit A** | **Audit B — this chapter's** |
| --- | --- | --- |
| Name | state-inventory ↔ matrix | **resource-inventory ↔ matrix** |
| Left-hand set | `04_…md` §3's 45 state categories | **§9's resource inventory** — exposed capabilities |
| Owner | SUB-13 (NEU-977), re-run by SUB-16 (NEU-979) | **SUB-7 (NEU-980)** |
| Published at | `10_…md` §7.2 | **§11 of this chapter** |
| Result | `UNMATCHED 0 / 0` | **§11.4** |
| Discharges | **`OUT-3`** | **`OUT-5`** |

**Neither is credited for the other, in either direction.** `10_…md` §7.2 says so from its side — *"This
audit is not SUB-7's"* — and §11 of that chapter states that this chapter's cross-check *"is a different
audit over a different inventory than §7.2's, and is not run or claimed here."* This chapter says so
from its side: **Audit A's `0 / 0` is not evidence for `OUT-5`, and Audit B's result in §11.4 is not
evidence for `OUT-3`.** A reader who takes `10_…md` §7.2's green result as discharging `OUT-5` has read
the wrong audit.

The two also *cannot* substitute for each other structurally. Audit A asks whether the matrix covers the
state inventory — a question about **completeness of assignment**. Audit B asks whether every capability
the API exposes resolves to exactly one already-assigned authority — a question about **exposure without
authority**. A matrix can be complete and still be exposed wrongly, and *that* is the defect class
`OUT-5` exists to catch.

---

## 4. Vocabulary, disambiguated at first use

This package already carries three ambiguous terms; a chapter about a web API adds two more, and both
are load-bearing for §8's security claims.

| Term | As used here | Not to be confused with |
| --- | --- | --- |
| **session** | Two distinct things, always qualified. A **learning session** is `SC-S3-5`, a bounded learning run. A **web session** is what `CMP-S4-3` terminates for a browser. | Each other. A bare "session" appears nowhere in this chapter. |
| **the API** | The **general web API** this chapter scopes: the operator-run HTTP surface `CMP-S4-3` presents to a browser. | The **MCP tool surface** (`CMP-S4-6`), which is a different surface with a different transport and a different admission path. |
| **tier** | The **deployment tier** — browser (`CMP-S4-1`), web tier (`CMP-S4-3`), core (`CMP-S4-4`…`CMP-S4-9`), store (`CMP-S4-9`). Every security claim in §8 names one. | The **gate-battery tiers** `Tier-1` (linter) and `Tier-2` (classifier, post-commit), which are content-quality gates and carry no security meaning. This package uses `Tier-1`/`Tier-2` **only** in that gate sense; where this chapter means a deployment tier it says so by component id. |
| **exposure** | That the API makes a capability reachable from a browser. | **Ownership.** The API exposes; it never owns. §10 is the whole point of keeping these apart. |
| **authority** | The single `CMP-S4-*` component the matrix names as a category's writer. | The component that *serves* a value. `CMP-S4-3` serves; it is authority for nothing. |

---

## 5. The positive scope, and the assumption the decision rests on

### 5.1 What the API is for

**The general web API terminates the learner's web session, serves the learner-facing surface, and
reaches production learning state only by calling the MCP core.** That is `05_…md`'s own scoping of
`CMP-S4-3`, verbatim: *"Terminates the learner's **web session**, serves the learner-facing surface, and
calls the MCP core; holds no gate authority of its own."*

Under the selected ownership model **`M-A` (all-MCP)**, that scoping has a hard consequence which this
chapter states as its central fact:

> **The API holds zero of the forty-five state categories.** `10_…md` §11 records it as a construction
> result rather than an oversight — *"`CMP-S4-3` holds zero of 45 rows, by construction under `M-A`"* —
> and `10_…md` §8's authority distribution confirms it: `CMP-S4-9` 21, `CMP-S4-7` 9, `CMP-S4-4` 5,
> `CMP-S4-14` 4, `CMP-S4-17` 2, `CMP-S4-19` 2, `CMP-S4-8` 1, `CMP-S4-10` 1 — **and `CMP-S4-3` nowhere.**

So the API's positive scope is **projection and intent**, never authorship:

1. **Read-projection.** The API renders a value whose authority is elsewhere. `FL-S4-2` fixes the status
   of every such copy: *"A browser-side copy is a cache, never an authority."* The same holds one tier
   in — a web-tier copy is a cache too.
2. **Write-intent.** The API accepts a learner action and forwards it as an **MCP tool call across
   `CMP-S4-4`** (`FL-S4-5`). The mutation is performed by the core's authority for that category; the API
   performs no write and, under `M-A`, holds **no database credential at all**.

**The two are the only access modes this chapter admits**, and §9 individuates the inventory by them.

### 5.2 The scope decision, and `A-27` cited at it

**The decision:** *the API's scope is bounded to read-projections and write-intents over learner-facing
categories, and it owns none of them* — and that decision rests on stand-in assumption **`A-27`**
(*"The UI is a rich authenticated web surface whose state is not gate-bearing"*), which is
**`[unconfirmed]`**, stands in for the unbuilt NEU-892, and whose **tolerance envelope** is that it
*"tolerates any rendering model — server-rendered, client-rendered, or a mix … arbitrarily rich
client-side interaction state, arbitrary client-side caching of read data, and optimistic UI, **provided
the server re-evaluates every gate from server-held state**"*, and whose **invalidating outcome** is
*"a UI direction requiring **offline-capable or client-authoritative learning state** — because that
makes the browser an authority for a state category under `OUT-3`"*.

Both halves of `A-27` are doing work in that sentence, and it is worth being explicit about which:

- **The envelope is what makes the small positive scope sufficient.** Because arbitrarily rich
  client-side interaction state is tolerated *provided every gate is re-evaluated server-side*, the API
  never needs write authority to support a rich surface. Richness is paid for in the browser; correctness
  is paid for in the core. That is precisely why `07_…md` §6.3's clause-3 presentation exception is
  **empty** under `M-A` — no row needs to move to the web tier to make the surface work.
- **The invalidating outcome is what would break it.** Offline-capable or client-authoritative learning
  state would make browser-held state gate-bearing, at which point the browser becomes an authority for
  a category under `OUT-3` and this chapter's negative boundary would have to be re-derived rather than
  patched. `05_…md` §6.3's rendering constraint **`R-3`** already says the same thing from the other
  side — *"An offline-capable learner surface is outside the envelope."*
- **`A-27`'s re-validation trigger is `NEU-892 lands`** — its package published under `docs/research/`.
  Until then this chapter's scope decision is `[unconfirmed]`-backed and is labelled as such wherever it
  is relied on.

`93_stand-in-assumption-register.md` is **closed**; `A-27` is cited here and never appended to.

### 5.3 What this chapter deliberately does not decide

| Question | Owner |
| --- | --- |
| Protocol style and rendering model | **SUB-15 (NEU-982)**, which decides against this chapter's inventory |
| The authority matrix itself | **SUB-13 (NEU-977)**, republished by **SUB-16 (NEU-979)** |
| The ownership model behind it | **SUB-6 (NEU-976)** |
| Framework and library picks | out of this charter's `OUT-5` entirely |
| Endpoint paths, payload schemas, error catalogues, versioning, pagination | **nobody yet — and §12 says so deliberately** |

---

## 6. The individuation rule — what counts as one entry

**One inventory entry = one (state category, access mode) pair**, where access mode is
**`read-projection`** or **`write-intent`**.

**Why this unit and not a finer one.** The matrix's unit is the **state category**, and exactly-one-
authority is a **per-category** property. Individuating the inventory any finer — per screen, per view,
per operation — would create entries with no matrix counterpart and would **manufacture unmatched items
that are artifacts of the individuation rule rather than facts about the system**. Individuating any
coarser (one entry per category, access mode collapsed) would hide the chapter's most useful
distinction: many categories are legitimately readable and illegitimately writable, and a collapsed
entry cannot say so.

**Why the inventory covers only categories whose status is `existing`.** A category marked
`required-by-upstream` or `assumed` has **no store today** (`04_…md` §3.6, §3.7). An API cannot project
a value that is not held anywhere, and publishing a capability over one would be publishing a resource
that does not exist. Those categories are therefore handled in §10 as **stated deliberate
non-exposures with a named lifting condition**, not as inventory entries. This is recorded as
**`CAP-S7-2`**.

**The rule is stated so SUB-11 (NEU-985) can re-run the audit.** The reproducible filter is:

1. Take the 45 rows of `10_…md` §8.
2. Join each to its `Learner-scoped` cell in `04_…md` §3 and to its `Status` marking.
3. Apply the learner-facing test of §7.1 → the learner-facing set.
4. Restrict to `Status: existing` → the exposable set.
5. For each exposable row, emit a `read-projection` entry, and a `write-intent` entry **iff** a learner
   action determines the value and the category's writer is not exclusive by construction (§9.2 records
   each exclusion by name).

---

## 7. The learner-facing set

### 7.1 The test, stated before it is applied

> **A row is *learner-facing* when, on the surface `A-27` posits, its value would be perceived by the
> learner (rendered to them, directly or as a derived display value) or produced by them (their action
> determines its value). A row is *not* learner-facing when its value exists only for an author, an
> operator, a maintainer, or the machinery itself — even when it contains learner payload.**

The last clause is not a technicality. `SC-S3-16` and `SC-S3-17` **hold learner payload** — `04_…md`
records that `response_body` and `params` carry learner-facing text and learner free-text answers — but
a learner neither perceives nor produces a log record. They are **operator state that contains learner
data**, which is a different thing from learner-facing state, and §11.2's second unmatched item is
exactly about the consequence of that difference.

**Learner-facing is independent of `Learner-scoped`.** `Learner-scoped` records whether the category is
partitioned per learner; learner-facing records whether a learner sees or makes it. Chunk content
(`SC-S3-2`) is learner-facing and not learner-scoped; the rate-limit window (`SC-S3-20`) is
learner-scoped and not learner-facing. **Both dimensions are reported, and neither is derived from the
other.**

### 7.2 The set

**19 of 45 rows are learner-facing**, split by their `Status` marking:

| `Status` | Rows | Count | Disposition |
| --- | --- | --- | --- |
| `existing` | `SC-S3-1`, `-2`, `-3`, `-5`, `-6`, `-7`, `-9`, `-12`, `-28`, `-29`, `-30` | **11** | **Inventory entries** — §9 |
| `required-by-upstream` | `SC-S3-32`, `-37`, `-38`, `-39` | **4** | **Stated deliberate non-exposure** — §10.3 |
| `assumed` | `SC-S3-42`, `-43`, `-44`, `-45` | **4** | **Stated deliberate non-exposure** — §10.3 |
| | | **19** | |

**A coincidence worth defusing.** The count of learner-facing rows (**19**) equals the count of rows
`10_…md` §8.3 places out of the isolation invariant's domain (**19**, the rows whose `Learner-scoped`
cell is an explicit `no`). **They are not the same nineteen** — the two sets share only `SC-S3-32` and
`SC-S3-37` — and neither number is derived from the other. Stated here so a reader comparing the two
chapters does not infer a relationship that does not exist.

**Every one of the nineteen is accounted for**: eleven as inventory entries, eight as stated deliberate
non-exposures. **None is silently absent**, which is the property `OUT-5`'s acceptance criterion asks
for.

---

## 8. The auth and trust boundary

Placed against `05_…md`'s boundary model by id. **Every claim below names the transport it holds for and
the deployment tier it holds at** (§4's `tier` reading); an unqualified security claim would be a defect
in this chapter, so none is made.

### 8.1 The four boundaries this API sits between

| Boundary | Pair | Class | Owner | **Transport** | **Tier** | What it means for the API |
| --- | --- | --- | --- | --- | --- | --- |
| `BND-S4-1` | `CMP-S4-1` ↔ `CMP-S4-3` | trust | **`CMP-S4-3`** | n/a (web tier) | browser ↔ web tier | *"The browser is under the learner's control; any value it returns is an assertion, not a fact."* The API must be correct **while assuming the browser is hostile**, in every rendering model. |
| `BND-S4-2` | `CMP-S4-3` ↔ `CMP-S4-4` | trust | **`CMP-S4-4`** | **HTTP only** | web tier ↔ core | *"The web tier is reachable by anything that can reach the port; the core re-verifies the JWT itself rather than trusting a web-tier assertion."* The API is an **untrusted caller** of the core, not a privileged one. |
| `BND-S4-16` | `CMP-S4-3` ↔ `CMP-S4-9` | recorded **undecided** in `05_…md` §4.4 | would be `CMP-S4-9`'s schema | n/a | web tier ↔ store | **Resolved by `M-A`: this edge does not exist.** `05_…md` §4.4 states the consequence — *"`CMP-S4-3` holds no durable learning state and every learning-state write goes through `CMP-S4-4` → `CMP-S4-7`. `BND-S4-2` then carries the entire authority contract."* |
| `BND-S4-17` | `CMP-S4-5` ↔ `CMP-S4-6` | **trust — unenforced** | **nobody** | **STDIO only** | local MCP client ↔ tool surface | **Does not apply to this API**, and is named so its non-application is explicit rather than assumed. |

### 8.2 The claims, each qualified

1. **The API authenticates nothing on the core's behalf.** *(Transport: HTTP. Tier: web tier,
   `CMP-S4-3`.)* `BND-S4-2` places JWT verification at `CMP-S4-4` (`jwt-middleware.ts:114`), which
   re-verifies rather than trusting a web-tier assertion. `FL-S4-3` states the same from the flow side:
   *"Neither `CMP-S4-1` nor `CMP-S4-3` is authoritative for identity."* The API therefore **presents** a
   bearer token; it never **adjudicates** one.
2. **Identity is issued outside the system entirely.** *(Transport: HTTP. Tier: external,
   `CMP-S4-10`.)* `SC-S3-45`'s authority is `CMP-S4-10` under clause 4, `projected, never authored`. The
   API re-presents an identity it cannot author, and `CAP-S16-1` records that this row's isolation
   verdict is permanently unimprovable from inside this package.
3. **Every protection the system currently mounts is mounted on the HTTP path, and only there.**
   *(Transport: HTTP for all of it; STDIO for none of it. Tier: core edge, `CMP-S4-4`.)* Origin
   allowlist, JWT verification, per-JWT-subject rate limiting, MCP-session-to-subject binding, the
   context-token gate, correlation id and audit capture are all `CMP-S4-4`'s, mounted at
   `src/transport/main.ts:46` and `http.ts:99`–`:111`. `BND-S4-17` records the counterpart: on STDIO,
   *"no auth, no origin check, no rate limit and no context-token gate"*, with **owner `nobody`**. **This
   chapter does not present that as a complete security design and does not have a merged source that
   calls it one** — the substantiation is `05_…md`'s own evidence: protections HTTP-only, `BND-S4-17`
   unenforced, and `redactParams` (`src/shared/redact-params.ts:1`, `:13`) matching only
   credential-shaped keys so **learner free-text reaches `params` unredacted** with the response body
   captured raw (`audit-middleware.ts:88`, `:109`). Those are integration facts about what is mounted
   where. They are not a threat model, and this chapter does not upgrade them into one.
4. **The API is a rate-limited party, not the rate limiter.** *(Transport: HTTP. Tier: core edge,
   `CMP-S4-4`.)* `SC-S3-20`'s authority is `CMP-S4-4`; the windows are keyed on the **JWT subject**, so
   a web tier forwarding many learners' calls shares whatever keying the token presents.
5. **The web session's own identity binding has no home in the model.** *(Transport: HTTP. Tier: web
   tier, `CMP-S4-3`.)* `SC-S3-19` is *"the only server-side learner-identity binding that exists anywhere
   in the system"*, and it binds a JWT subject to an **MCP session** in `CMP-S4-4`'s process memory —
   not to a **web session** in `CMP-S4-3`. No category covers the latter. This is **`F-S7-1`**, and
   §11.2 carries it as an unmatched item rather than papering over it.
6. **The context token the API's forwarded calls carry names no learner.** *(Transport: HTTP. Tier: core
   edge, `CMP-S4-4`, gating the core's tool surface `CMP-S4-6`.)* `SC-S3-13`'s entry records that *"the
   table carries **no** authenticated subject"*. Under `M-A` every web mutation is a tool call across
   `CMP-S4-4` (`FL-S4-5`), so a web-originated mutation arrives gated but **not attributed** — the
   context token proves a bootstrap happened, not which learner is acting. This is **`F-S7-4`**, routed
   to SUB-8 (NEU-981), which owns the access-path enumeration this bears on.
7. **No claim in this chapter holds on STDIO.** *(Transport: STDIO. Tier: any.)* The API does not exist
   on STDIO; `BND-S4-17`'s unenforced boundary is a property of the local MCP client path and is named
   in §8.1 only so that its exclusion is stated rather than assumed. STDIO-mode facts are **not**
   evidence for or against anything in §§5–12.

---

## 9. The resource inventory

**16 entries.** Each names exactly one authority, **read off `10_…md` §8 and originated nowhere here**.

### 9.1 Read-projections — 11

| # | Capability (the API serves a projection of…) | Category | **Authority** | Clause | Basis for exposure |
| --- | --- | --- | --- | --- | --- |
| R1 | the authored topic, its summary and its classification | `SC-S3-1` | `CMP-S4-9` | 5 | Perceived: the learner browses topics. |
| R2 | teachable chunk text, its version and its ordering | `SC-S3-2` | `CMP-S4-9` | 5 | Perceived: it is the material the learner reads. |
| R3 | per-chunk scheduling state — due-ness, interval, ease | `SC-S3-3` | `CMP-S4-9` | 5 | Perceived: "what is due" is the product's core display. |
| R4 | the learner's own learning-session records | `SC-S3-5` | `CMP-S4-9` | 5 | Perceived and produced: the learner starts and ends runs. |
| R5 | per-chunk teaching state within a run | `SC-S3-6` | `CMP-S4-9` | 5 | Perceived: progress through the current run. |
| R6 | the questions posed in a run | `SC-S3-7` | `CMP-S4-9` | 5 | Perceived: the drill itself. |
| R7 | the learner's attempts, grades and feedback | `SC-S3-9` | `CMP-S4-9` | 5 | Perceived and produced. The **derived quality** shown is `CMP-S4-8`'s (`grade-mapper.ts:71`); the record is `CMP-S4-9`'s. |
| R8 | the learner's notes | `SC-S3-12` | `CMP-S4-9` | 5 | Perceived and produced. |
| R9 | mastery level as a display value | `SC-S3-28` | `CMP-S4-7` | 1 | Perceived as a progress indicator. Derived on read; **no store** (`04_…md` §3.5). |
| R10 | the `LearnerContext` aggregate — due counts, streak, weak areas | `SC-S3-29` | `CMP-S4-7` | 1 | Perceived: the dashboard's substance. Derived on read; no store. |
| R11 | analytics KPIs and window rollups | `SC-S3-30` | `CMP-S4-8` | 1 | Perceived. Derived on read; no store. |

### 9.2 Write-intents — 5

A write-intent entry means: **the API accepts a learner action and forwards it as an MCP tool call
across `CMP-S4-4`.** The listed authority performs the write. The API performs none.

| # | Capability (the API forwards an intent to…) | Category | **Authority** | Clause | Why an intent exists |
| --- | --- | --- | --- | --- | --- |
| W1 | start or end a learning session | `SC-S3-5` | `CMP-S4-9` | 5 | The learner determines when a run begins and ends. |
| W2 | advance teaching state within a run | `SC-S3-6` | `CMP-S4-9` | 5 | Status, approach and time-spent follow the learner's progress. |
| W3 | request the next question in a run | `SC-S3-7` | `CMP-S4-9` | 5 | The learner asks; the **core composes**. The API never authors a question. |
| W4 | submit an answer | `SC-S3-9` | `CMP-S4-9` | 5 | The response is the learner's. **Grade revision is excluded** — see §10.2. |
| W5 | create or delete a note | `SC-S3-12` | `CMP-S4-9` | 5 | Create and delete only: `04_…md` records **no update path**, so no update intent is published. |

### 9.3 The exactly-one-authority property

| Measure | Value |
| --- | --- |
| Inventory entries | **16** |
| Entries resolving to **exactly one** `CMP-S4-*` authority | **16** |
| Entries resolving to **zero** authorities | **0** |
| Entries resolving to **two or more** authorities | **0** |
| Entries whose authority was originated in this chapter | **0** |
| Distinct authorities used | **3** — `CMP-S4-9` (13), `CMP-S4-7` (2), `CMP-S4-8` (1) |
| Entries naming `CMP-S4-3` (the web tier) as authority | **0** |

**The `W` column of `10_…md` §8 is not counted, and that is deliberate.** That chapter states it
outright: *"`W` names the write path where `08_…md` §8 records one; **it is an annotation, never a
second authority**, and the exactly-one audit does not count it."* Two rows this inventory touches have
a multi-component `W` annotation (`SC-S3-13`'s *"`CMP-S4-7`; enforced at `CMP-S4-4`"* is the clearest
case, though it carries no inventory entry). Counting `W` would produce spurious two-or-more results;
this audit reproduces `10_…md`'s rule rather than inventing a stricter one.

---

## 10. The negative boundary — all forty-five categories, one at a time

**The claim this section makes, for every row:** *the general web API is **not** the authority for this
category.* Under `M-A` that is true of all forty-five, and `10_…md` §8's distribution confirms it
mechanically — **`CMP-S4-3` appears in the Authority column zero times.**

**Stating it forty-five times rather than once is the point.** A blanket sentence would be true and
useless: a downstream charter looking up one category needs to find *that category* addressed, with the
authority that displaces the API named, and with the concrete reason. §10.1's table gives each row its
own reason.

### 10.1 The forty-five

`API access`: **`R`** = read-projection published (§9.1) · **`R+W`** = read-projection and write-intent
published (§9.1, §9.2) · **`—`** = nothing published, for the reason given.

| Id | Category | **Authority — never the API** | API access | Why the API does not own it |
| --- | --- | --- | --- | --- |
| `SC-S3-1` | Topic record | `CMP-S4-9` | R | Authored through the MCP authoring path into `public.learning_topics`; the API renders it and writes nothing. |
| `SC-S3-2` | Chunk content record | `CMP-S4-9` | R | Author-written under content-version control. Any web- or browser-held copy is a cache under `FL-S4-2`, never an authority. |
| `SC-S3-3` | Per-chunk SM-2 scheduling state | `CMP-S4-9` | R | `04_…md` §3.1 records it *"mutated only by the scheduler"*. An API write would create a second scheduler for the same fields. |
| `SC-S3-4` | Content-audit verdict | `CMP-S4-7` | — | Written by the audit pipeline (`src/orchestration/audit-pipeline.ts:48`). Not learner-facing: the API neither reads nor writes it. |
| `SC-S3-5` | Learning-session record | `CMP-S4-9` | R+W | The run's lifecycle is a core transaction; the API forwards start and end as tool calls across `CMP-S4-4`. |
| `SC-S3-6` | Session-chunk teaching state | `CMP-S4-9` | R+W | Written by the core on each teaching tool call; the API contributes the learner's progress as an intent. |
| `SC-S3-7` | Session question | `CMP-S4-9` | R+W | The **core composes** questions. The API forwards a request for the next one and authors none. |
| `SC-S3-8` | Question→chunk assessment mapping | `CMP-S4-7` | — | Internal assessment mapping, created with the question and never mutated. No learner perceives it. |
| `SC-S3-9` | Attempt and grade record | `CMP-S4-9` | R+W | The API forwards the answer. The **derived quality is `CMP-S4-8`'s** (`grade-mapper.ts:71`, called at `teaching-workflows.ts:1213`); the API never computes or asserts a grade. |
| `SC-S3-10` | Pre-review scheduling snapshot (NEU-844) | `CMP-S4-9` | — | *"Written once at answer time and never revised"*, including when `revise_grade` mutates the surrounding row. A second writer would destroy the write-once property the snapshot exists for. |
| `SC-S3-11` | Grade-revision audit trail | `CMP-S4-9` | — | Appended **inside the revision transaction** and never mutated. A write from outside that transaction would break its atomicity with the revision it records. |
| `SC-S3-12` | Notes | `CMP-S4-9` | R+W | Learner-authored but core-written: create and delete are forwarded intents, and `04_…md` records no update path to forward. |
| `SC-S3-13` | Context tokens | `CMP-S4-9` (enforced at `CMP-S4-4`) | — | This is the gate the API's own forwarded calls pass through. **The API is the gated party, never the gate.** See `F-S7-4`. |
| `SC-S3-14` | Linter validation corpus | `CMP-S4-7` | — | Maintainer-curated OOD corpus. No learner surface exists over it and none is proposed. |
| `SC-S3-15` | Per-rule validation report | `CMP-S4-7` | — | Maintainer-facing validation evidence supporting a blocking-eligibility decision. |
| `SC-S3-16` | MCP request log | `CMP-S4-9` (write path `CMP-S4-19`) | — | Operator state that **contains** learner payload but is neither perceived nor produced by a learner. **No retention window and no deletion owner are implemented** — `CAP-S4-1`, and `F-S7-2`. |
| `SC-S3-17` | Operation event log | `CMP-S4-9` (write path `CMP-S4-19`) | — | As `SC-S3-16`, and additionally **read by the Tier-2 blocking gate** (`tier2-blocking-stats-repository.ts:39`), so it is gate input, not display data. |
| `SC-S3-18` | MCP transport registry | `CMP-S4-4` | — | Process-local to the MCP transport, keyed by MCP session id. The API is on the far side of `BND-S4-2`. |
| `SC-S3-19` | Subject-binding map | `CMP-S4-4` | — | Binds a JWT subject to an **MCP session**, not to a web session, in `CMP-S4-4`'s process memory. HTTP only. See `F-S7-1`. |
| `SC-S3-20` | Rate-limit windows | `CMP-S4-4` | — | Edge admission control keyed on the JWT subject. The API is a rate-limited caller, not the limiter. |
| `SC-S3-21` | Tier-2 breaker trip set + stats cache | `CMP-S4-14` | — | Content-gate machinery, one-shot per process and re-derived after restart by design. |
| `SC-S3-22` | Request context and correlation id | `CMP-S4-4` | — | `AsyncLocalStorage` inside the core process, entered per request and exited with the call. |
| `SC-S3-23` | Database client singletons | `CMP-S4-9` | — | **Under `M-A` the web tier holds no database credential at all**, so there is no client for it to own. |
| `SC-S3-24` | Event-logger sink toggle | `CMP-S4-19` | — | Boot-time process configuration of the core's logging, failing open to stderr when unset. |
| `SC-S3-25` | Transport batch buffers + per-sink breakers | `CMP-S4-19` | — | Worker-thread-local buffers that drop entries while a breaker is open. Not reachable from, or meaningful to, the API. |
| `SC-S3-26` | JWKS remote key set | `CMP-S4-4` | — | The core verifies signatures against its own fetched JWKS under an issuer allowlist (`BND-S4-6`). The API holds no verification material. |
| `SC-S3-27` | Classifier per-field model cache | `CMP-S4-14` | — | Lazily-initialised model runnables inside the classifier adapter's process. |
| `SC-S3-28` | Mastery level | `CMP-S4-7` | R | **Derived on read with no store** (`teaching-workflows.ts:602`) — structurally unwritable by anyone, the API included. §10.2. |
| `SC-S3-29` | `LearnerContext` aggregate | `CMP-S4-7` | R | Derived on read from five parallel repository reads. No store, so nothing to own. §10.2. |
| `SC-S3-30` | Analytics KPIs and window rollups | `CMP-S4-8` | R | Computed per request and discarded. No store. §10.2. |
| `SC-S3-31` | Assessment-evidence record | `CMP-S4-9` | — | `required-by-upstream`, **no store today**. It is input to the mastery model, not a display value; the display value is `SC-S3-39`. |
| `SC-S3-32` | Problem-citation record | `CMP-S4-7` | — | `required-by-upstream`, no store today. Field set frozen at `stable_id` + `canonical_url` by `DR-C09-01`, carried as `CAP-S3-1`; this chapter does not widen it. §10.3. |
| `SC-S3-33` | Cached citation-drift verdict | `CMP-S4-17` | — | Specified as internal with **no egress**; exposing it would put egress inside a component specified to have none. |
| `SC-S3-34` | Citation-drift verdict store | `CMP-S4-17` | — | Written only by the out-of-band producer — the system's only component with egress outside the operator's control. |
| `SC-S3-35` | Gate-verdict record | `CMP-S4-14` | — | Authoring-time gate output, written inside a terminable isolate under a wall-clock bound. |
| `SC-S3-36` | Quarantine record | `CMP-S4-14` | — | Authoring-time; opened by a gate and closed by its stated exit condition. |
| `SC-S3-37` | DP-map node + prerequisite-edge records | `CMP-S4-7` | — | A gate-verified artifact in NEU-889's package, learner-independent by construction, and `required-by-upstream` here. §10.3. |
| `SC-S3-38` | Per-learner per-node progression | `CMP-S4-9` | — | `required-by-upstream`, no store today. §10.3. |
| `SC-S3-39` | Per-learner mastery-gate state | `CMP-S4-9` | — | `required-by-upstream`, no store today — **and `A-27`'s envelope requires the server to re-evaluate every gate from server-held state**, so no API write may exist even once the store does. §10.3. |
| `SC-S3-40` | Measurement-contract register | `CMP-S4-7` | — | A frozen, versioned artifact in NEU-887's package; prior versions retained, never overwritten. |
| `SC-S3-41` | Operational-log derived extract `PLA-*` | `CMP-S4-9` | — | `required-by-upstream`; an allowlisted, payload-free operator aggregate with its own retention window and named deletion owner. Not a learner surface. |
| `SC-S3-42` | Tutoring / hint interaction state | `CMP-S4-9` | — | `assumed` — `A-25`, no store today. §10.3. |
| `SC-S3-43` | Web-session / UI interaction state | `CMP-S4-9` | — | `assumed` — `A-27`, no store today. **The one category literally named for the web surface is assigned to the core**, because `07_…md` §6.3's clause-3 presentation exception is empty under `M-A`. §10.4. |
| `SC-S3-44` | Handoff authorization envelope | `CMP-S4-9` (enforced at `CMP-S4-4`) | — | `assumed` — `A-29`, no store today. `BND-S4-5` and `FL-S4-19` place minting and revocation at `CMP-S4-4`; `A-29`'s invalidating outcome is an external client holding write authority. §10.3. |
| `SC-S3-45` | Learner-identity → owner mapping | `CMP-S4-10` | — | External identity provider, clause 4 as resolved by `F-S13-2`: *projected, never authored*. The API re-presents an identity it cannot author. `CAP-S16-1` applies. §10.3. |

**Count: 45 of 45 categories carry an explicit not-owned statement. Categories left silent: 0.**

### 10.2 Access-mode non-exposures on categories that *are* exposed

Eleven learner-facing rows carry inventory entries; only five carry a write-intent. The other six, and
one partial exclusion inside an entry that does exist, are recorded here rather than left to inference.

| Row | What is not exposed | Kind | Reason |
| --- | --- | --- | --- |
| `SC-S3-1` | write-intent | **deliberate** | Authoring is not a learner-facing capability under `A-27`, which scopes the surface as *learner*-facing. Whether a creator shares the surface is **`OI-S7-2`**. |
| `SC-S3-2` | write-intent | **deliberate** | As `SC-S3-1`. Content edits carry a content-version contract the API is not party to. |
| `SC-S3-3` | write-intent | **deliberate** | The scheduler is the sole mutator. Exposing a "reschedule" intent would make the browser a second input to the spaced-repetition state — the exact divergence this chapter's negative boundary exists to prevent. |
| `SC-S3-9` | write-intent for **grade revision** | **deliberate, partial** | `revise_grade` mutates a recorded grade and appends to `SC-S3-11`'s immutable trail. It is a correction path for an operator or creator, not a learner action; the learner's write-intent is the answer, and only the answer. |
| `SC-S3-28` | write-intent | **structural** | Derived on read, no store. There is nothing to write — not a decision this chapter made. |
| `SC-S3-29` | write-intent | **structural** | As `SC-S3-28`. |
| `SC-S3-30` | write-intent | **structural** | As `SC-S3-28`. |

**Three deliberate, one deliberate-partial, three structural.** The distinction matters: a structural
non-exposure cannot be lifted by any decision, and a downstream charter that reads all seven as
policy would go looking for a policy owner who does not exist.

### 10.3 Deliberate non-exposures over learner-facing categories with no store

Eight learner-facing rows are **not exposed at all**, and each is a stated decision with a named lifting
condition rather than an omission. **An API cannot project a value nothing holds**; publishing a
capability over one of these would publish a resource that does not exist. Recorded as **`CAP-S7-2`**.

| Row | `Status` | Non-exposure | **What would lift it** |
| --- | --- | --- | --- |
| `SC-S3-32` | `required-by-upstream` | Problem citations are not exposed. | NEU-890's record shapes acquire a store here. The field set stays frozen at `DR-C09-01`'s two fields; a wider set goes to ledger challenge `CH-F5-1`, not to this chapter. |
| `SC-S3-37` | `required-by-upstream` | The DP progression map is not exposed. | NEU-889's graph is imported into a store in this system. |
| `SC-S3-38` | `required-by-upstream` | Per-node progression is not exposed. | As `SC-S3-37`, plus a per-learner store. |
| `SC-S3-39` | `required-by-upstream` | Mastery-gate state is not exposed. | NEU-888's durability gate acquires a store. **Even then, read-only** — `A-27`'s envelope forbids a client-side gate input. |
| `SC-S3-42` | `assumed` — `A-25` | Tutoring / hint interaction state is not exposed. | `A-25`'s package (NEU-891) lands and the category acquires a store. |
| `SC-S3-43` | `assumed` — `A-27` | Web-session / UI interaction state is not exposed. | `A-27`'s re-validation trigger fires — **NEU-892 lands**. §10.4. |
| `SC-S3-44` | `assumed` — `A-29` | The handoff envelope is not exposed, in either direction — no minting intent, no revocation intent. | `A-29`'s package lands. Minting and revocation stay at `CMP-S4-4` per `BND-S4-5`; a web-tier mint would be the API asserting an authorization it has no authority over. |
| `SC-S3-45` | `assumed` — `A-28` | The identity→owner mapping is not exposed as a writable resource; **the current learner is re-presented, never authored.** | Nothing this package can do. `CAP-S16-1` records the verdict as permanently unimprovable from here; the owner is SUB-6 (NEU-976). |

### 10.4 `SC-S3-43` — the sharpest row in the boundary, stated plainly

**The category literally named "web-session and UI interaction state" is assigned to `CMP-S4-9`, the
MCP core's durable store — not to the web tier.** That is not an anomaly to explain away; it is what
`M-A` means, and `07_…md` §6.3 is explicit that the clause-3 presentation exception which *would* have
moved it is **empty**: *"`M-A` makes the MCP core the exclusive writer of all 45 categories, so clause 3
matches no row."* That section also names this row as the one whose membership would change under a
reversal — *"the reversal changes only the contents of this list — the single row `SC-S3-43`"*.

**What that leaves genuinely unresolved.** `A-27`'s envelope tolerates *"arbitrarily rich client-side
interaction state"*. Interaction state that stays in the browser and is never round-tripped is, in
practice, **held nowhere `CMP-S4-9` can see**. The assignment is not wrong — `FL-S4-2` classes the
browser copy as a cache — but it is **unenforceable for the browser-only portion**, because no mechanism
requires that portion to reach the authority at all. That is **`F-S7-3`**, routed to SUB-13 (NEU-977).

**It is not, however, a defect in the negative boundary.** The row is not gate-bearing by `A-27`'s own
terms, so browser-only interaction state cannot affect a mastery decision. The finding is about the
*completeness of the assignment's meaning*, not about a divergence risk on the Critical path. Saying so
is the honest reading; inflating it into a divergence risk would be manufacturing one.

---

## 11. The resource-inventory ↔ matrix cross-check

**This is Audit B of §3, and it discharges `OUT-5`.** It is not `10_…md` §7.2's audit and takes no
credit from it.

### 11.1 The routing rule, published before the counts

Stated in advance so it is reproducible and so it applies to an empty set as readily as a populated one:

- **An unmatched item on the *matrix* side** — a matrix row this chapter neither exposes nor explicitly
  disclaims — is **routed to SUB-13 (NEU-977)**, which owns the assignment, republished by SUB-16
  (NEU-979).
- **An unmatched item on the *inventory* side** — a capability the surface requires that resolves to no
  matrix row — is **held by SUB-7 (NEU-980)**, this sub-task, and each is published as a finding with
  its matrix-side counterpart routed to SUB-13 (NEU-977).
- **A bare count discharges nothing.** Every unmatched item carries the entry or category at issue, the
  expected value, a named owner, and **a recorded disposition**.
- **Where a direction's count is zero, the rule above is still published** — against the empty set — so
  SUB-11 (NEU-985) can re-run the audit and reproduce both the numbers and the routing.

### 11.2 Direction 1 — inventory → matrix: **2 unmatched**

The check: does every capability the learner-facing surface requires resolve to exactly one row of
`10_…md` §8, with exactly one authority?

**Sixteen of eighteen required capabilities resolve. Two do not.**

---

#### `U-1` — the web session's own identity binding

- **Inventory item:** *the authenticated learner this web session belongs to* — a read-projection the
  surface cannot function without, since every other projection in §9.1 is per-learner.
- **Expected:** a state category, assigned to exactly one `CMP-S4-*` authority, covering
  *web session → authenticated principal*.
- **Found:** nothing. `SC-S3-19` binds a JWT subject to an **MCP session** in `CMP-S4-4`'s process
  memory and is described as *"the only server-side learner-identity binding that exists anywhere in the
  system"*. `SC-S3-45` binds an authenticated principal to **the rows it owns** — a different relation,
  and its authority is external (`CMP-S4-10`). `SC-S3-43` is browser-held UI state, not a server-side
  binding. **The category does not exist**, so the matrix cannot assign it, and `10_…md` §7.2's
  `UNMATCHED 0 / 0` is untouched by this — that audit compares the matrix to `04_…md`'s inventory, and
  the gap is in `04_…md`'s category set.
- **Owner:** **SUB-13 (NEU-977)** on the matrix side. **Root cause upstream of it: SUB-3 (NEU-973)**,
  whose category set has no such row.
- **Disposition:** **Open, routed.** Filed as **`F-S7-1`**; the provisional reading this chapter
  proceeds on is filed as **`OI-S7-1`** — *the web tier holds no server-side binding of its own and
  re-presents the bearer token to `CMP-S4-4` on every call, which `BND-S4-2` then re-verifies*. That
  reading is consistent with `FL-S4-3` and is why the chapter can be written at all; it is **provisional,
  not derived**, and is labelled so at every use.
- **Residual, stated rather than discovered later:** SUB-13 is **merged and closed**. This is the
  accepted **F5.7** warning — four sub-tasks route findings backwards to a sub-task that has already
  shipped, and nothing in the package re-dispatches the owner. **`SUB-13 → SUB-7` is one of the four
  named instances, and this finding is its mirror image travelling the other way.** The residual is that
  `F-S7-1` may go unactioned; **NEU-896** at convergence and **SUB-12 (NEU-986)** at the completeness
  gate are named alongside so it is not routed only to a closed owner.

#### `U-2` — erasure of learner payload

- **Inventory item:** *erase this learner's payload* — a write-intent required by **NEU-887's privacy
  gate**, which `04_…md` records as requiring a retention window and a deletion owner (`F-S3-3`).
- **Expected:** for each row holding learner payload, a row-level **deletion owner** the intent can be
  forwarded to.
- **Found:** the two rows holding learner payload — `SC-S3-16` and `SC-S3-17` — carry an authority
  (`CMP-S4-9`, write path `CMP-S4-19`) but **no deletion owner**, and `05_…md` establishes that **no
  component in its inventory can be one**. The intent therefore resolves to **zero** authorities and is
  not published as an inventory entry.
- **Owner:** **SUB-13 (NEU-977)** on the matrix side, with **NEU-893** and **NEU-896** named alongside
  because the obstruction is structural rather than an assignment error.
- **Disposition:** **Open, routed, and capped.** Filed as **`F-S7-2`** and capped as **`CAP-S7-1`**,
  which records the specific consequence for *this* chapter: **the API's erasure capability cannot be
  scoped at all**, not merely postponed. This is **`CAP-S4-1`'s seventh sighting** (SUB-3, SUB-4, SUB-6,
  SUB-13, SUB-14, SUB-16, here). **`CAP-S4-1` stays open and this chapter does not close it**;
  `05_…md` §9.2's unblocking condition is unchanged, and `CAP-S7-1` is a *different* cap — on the API's
  scope, not on the ownership model — filed rather than folded in, so the two are not conflated at the
  completeness gate.

---

### 11.3 Direction 2 — matrix → inventory: **0 unmatched**

The check: is every one of the 45 rows of `10_…md` §8 accounted for by this chapter, as either a
published capability or an explicit not-owned statement?

| Accounting | Rows |
| --- | --- |
| Exposed — read-projection only | **6** (`SC-S3-1`, `-2`, `-3`, `-28`, `-29`, `-30`) |
| Exposed — read-projection and write-intent | **5** (`SC-S3-5`, `-6`, `-7`, `-9`, `-12`) |
| Not exposed, explicit not-owned statement in §10.1 | **34** |
| **Accounted for** | **45** |
| **Unmatched — a row this chapter neither exposes nor disclaims** | **0** |

**This zero is trivially zero by construction, and saying so is part of reporting it honestly.** §10.1
is generated by enumerating all forty-five rows, so no row *can* be missing; the audit's real content is
that **the enumeration was actually performed at row granularity with a row-specific reason**, not that
a search found nothing. A reader should weigh this `0` accordingly — it is a completeness property of
this chapter, not a discovery about the matrix.

### 11.4 The result

| | **Unmatched count** |
| --- | --- |
| **inventory → matrix** | **2** — `U-1`, `U-2` |
| **matrix → inventory** | **0** |
| Inventory entries mapping to exactly one authority | **16 of 16** |
| Entries with zero authorities | **0** |
| Entries with two or more authorities | **0** |
| Unmatched items published as findings with a named owner and a recorded disposition | **2 of 2** |

**This is `OUT-5`'s cross-check and its discharge. It is not `OUT-3`'s**, whose state-inventory ↔ matrix
audit is SUB-13's, re-run by SUB-16 at `10_…md` §7.2, and which reports its own `0 / 0` over a different
inventory. **Neither result is evidence for the other outcome.**

**Two unmatched items is a result, not a failure.** Both are absences in the category set rather than
mis-assignments, both have named owners, and both are dispositioned. Equally, neither was manufactured:
`U-1` is forced by the surface being per-learner, and `U-2` is forced by a privacy requirement an
upstream package states. **No further item was invented to make the audit look thorough, and neither of
these was suppressed to make it look clean.**

---

## 12. The scope audit — the stop, stated and counted

### 12.1 The counts

| Audited for | Count in this chapter |
| --- | --- |
| Endpoint paths specified | **0** |
| Payload schemas specified | **0** |
| Error catalogues specified | **0** |
| Versioning schemes specified | **0** |
| Pagination models specified | **0** |

### 12.2 The stop, in prose

**This chapter stops at the boundary of the wire contract, and the stop is deliberate.**

It names *what* the API may expose and *whose* authority backs each exposure. It says nothing about how
any of it is addressed, shaped, paginated, versioned, or how failures are reported — because those
decisions belong to **SUB-15 (NEU-982)**, which selects the protocol style and rendering model, and to
the downstream implementation charter that follows it. Deciding them here would have fixed a wire
contract before the protocol style that governs it was chosen, and a downstream charter would then be
inheriting a contract nobody had authority to set.

**A reader who finds no endpoint path here should conclude the contract is open, not missing.** The
constraint this chapter *does* impose on whoever writes it is the whole of §9, §10 and §11: **whatever
shape the wire contract takes, no resource on it may be authoritative for any of the forty-five
categories, and every resource must resolve to exactly one of the authorities §9 names.** That is a
binding constraint on a contract that does not exist yet, which is exactly what a scope document is
for.

---

## 13. The `R3` verdict for SUB-6's store-reversal conjunction

### 13.1 The question, as `07_…md` §5.3 poses it

**`R3`:** *"`SUB-7 (NEU-980)`'s resource inventory establishes **at least one required web-surface state
item that cannot be expressed as an MCP tool without making non-gate-bearing state gate-bearing**."*

`R3` is one of three conjuncts. `07_…md` §5.3's reversal requires **`R1` ∧ `R2` ∧ `R3`**, and with all
three the score moves `M-C` 428 against `M-A` 426 — *"M-C overtakes by 2 — selection reverses"* — a
result that chapter itself calls **real but fragile**, two points out of five hundred.

### 13.2 The verdict: **`R3` is not established**

**No item in this chapter's inventory meets `R3`'s condition.** The reasoning, stated so SUB-10
(NEU-984) can check it rather than take it:

1. **Every published capability is expressible as an MCP tool call.** All sixteen entries are
   read-projections or write-intents forwarded across `CMP-S4-4` (`FL-S4-5`). None requires the web tier
   to hold state.
2. **`SC-S3-43` — the strongest candidate — fails the condition's second half.** It *is* a required
   web-surface state item, and §10.4 shows its assignment is unenforceable for the browser-only portion.
   But routing it through an MCP tool does **not** make non-gate-bearing state gate-bearing: `A-27`
   states outright that *"no mastery gate depends on browser-held state"*, and its envelope's proviso —
   *"provided the server re-evaluates every gate from server-held state"* — is precisely the clause that
   keeps the conversion from happening. Persisting UI interaction state through the core makes it
   *durable*; it does not make it *gate-bearing*.
3. **Both unmatched items fail the condition for a different reason than `R3` names.** `U-1` cannot be
   expressed as an MCP tool because it is the state that **authorises** the tool call — a bootstrap
   circularity, not a gate-bearing conversion. `U-2` cannot be expressed because **no deletion owner
   exists** — a missing owner, not a gate-bearing conversion. `R3` is a specific condition, and
   satisfying its first clause by a different mechanism does not satisfy it.

**Verdict: `R3` = NOT ESTABLISHED. The conjunction `R1 ∧ R2 ∧ R3` therefore does not fire on `R3`'s
account, and `M-A` stands undisturbed by this chapter.**

### 13.3 The verdict's own tolerance, and where it is routed

**This verdict inherits `A-27`'s status.** It is `[unconfirmed]`, because the reasoning at step 2 rests
entirely on `A-27`'s envelope. **If `A-27` is invalidated by its stated invalidating outcome — a UI
direction requiring offline-capable or client-authoritative learning state — then browser-held state
becomes gate-bearing by definition, and `R3` is immediately re-openable over the same inventory.**
`05_…md` §6.3's rendering constraint `R-3` says the same from the rendering side. So the honest form of
the verdict is: **`R3` is not established under `A-27`, and `A-27`'s invalidation is the single event
that would change that.**

**Routed to SUB-10 (NEU-984)**, which runs the `07_…md` §5.3 check and files its finding to **SUB-6
(NEU-976)**, tracked as **`OI-S6-1`**. SUB-10 receives: this verdict, its dependence on `A-27`, and the
re-opening condition — so the check is run over a stated `R3` rather than an assumed one. **This chapter
does not run §5.3's check itself and does not claim `M-A` is re-confirmed**; it answers one conjunct.

---

## 14. What this chapter closes, and what it does not

### 14.1 Closes

- **`OUT-5`.** The API's responsibility, negative boundary, relationship to MCP and to production
  learning state, and auth/trust boundary are published (§5, §8, §10); the resource inventory names one
  authority per entry (§9); the cross-check is reported in both directions with every unmatched item
  routed and dispositioned (§11); the scope audit reports three zeroes with the stop in prose (§12).
- **`F-S14-6`'s consumer obligation.** That finding's disposition bounds web-tier scoping —
  `CMP-S4-3` holds zero of 45 rows by construction under `M-A` — and this chapter is the named consumer
  that acts on it. §5.1 and §10.1 do so at row granularity.
- **`R3`, as a conjunct.** Answered in §13 and routed. Not the reversal check itself.

### 14.2 Does not close, explicitly

- **`CAP-S4-1`** — open at its **seventh** sighting. Not closed here; `05_…md` §9.2's unblocking
  condition is unchanged.
- **`CAP-S5-1`**, **`CAP-S6-1`**, **`CAP-S16-1`**, **`CAP-S3-1`**, **`CAP-S1-3`** — cited at their
  points of use, none re-filed, none narrowed.
- **`F-S16-1`** — the tracker-id drift across 24 instances in five merged files. Already filed and
  routed to SUB-12 (NEU-986). **Not re-filed here, and not propagated**: every sub-task label paired
  with a tracker id in this chapter is checked against the package's own map (SUB-1 NEU-971, SUB-2
  NEU-972, SUB-3 NEU-973, SUB-4 NEU-974, SUB-5 NEU-975, SUB-6 NEU-976, SUB-7 NEU-980, SUB-8 NEU-981,
  SUB-9 NEU-983, SUB-10 NEU-984, SUB-11 NEU-985, SUB-12 NEU-986, SUB-13 NEU-977, SUB-14 NEU-978, SUB-15
  NEU-982, SUB-16 NEU-979). **This chapter does not repair the merged files** — they are append-only to
  a sibling.
- **`BND-S4-16`'s formal status in `05_…md`.** `M-A` resolves the edge (it does not exist), but
  `05_…md` still records the boundary as *undecided* and this chapter may not amend a merged sibling.
  The resolution is stated here (§8.1) and the annotation is left to its owner.
- **The wire contract.** Deliberately, per §12.

---

## 15. Handoff

| Recipient | What it receives |
| --- | --- |
| **SUB-15 (NEU-982)** | §9's inventory as the surface its protocol-style and rendering-model decision is made against, with each entry's access mode and single backing authority; §10.2/§10.3's non-exposures so it does not design a surface over a capability that is deliberately absent; **`OI-S7-2`** (whether a creator shares the learner-facing surface). |
| **SUB-10 (NEU-984)** | §13's **`R3` = NOT ESTABLISHED** verdict, its dependence on `A-27`, and the single event that re-opens it — so the `07_…md` §5.3 conjunction check runs over a stated conjunct. |
| **SUB-13 (NEU-977)** | **`F-S7-1`** (no category for the web-session identity binding) and **`F-S7-2`** (no deletion owner for the two learner-payload rows) and **`F-S7-3`** (`SC-S3-43`'s assignment unenforceable for the browser-only portion). **All three land on a closed owner — the F5.7 residual — and are therefore co-routed to NEU-896 and SUB-12 (NEU-986).** |
| **SUB-8 (NEU-981)** | **`F-S7-4`** — a web-originated mutation arrives gated but unattributed, because `SC-S3-13`'s table carries no authenticated subject. Bears directly on the access-path enumeration `10_…md` §8.3 names SUB-8 as owner of. |
| **SUB-3 (NEU-973)** | Named as root cause of `F-S7-1` — the category set has no *web session → principal* row. Closed; recorded, not dispatched. |
| **SUB-11 (NEU-985)** | §6's reproducible filter, §9.3's and §11.4's counts, and §11.1's routing rule — everything needed to re-run Audit B mechanically and reproduce **2 / 0**. |
| **SUB-12 (NEU-986)** | The `### SUB-7` register appends (§16), **`CAP-S7-1`** and **`CAP-S7-2`** for reconciliation, `CAP-S4-1`'s seventh sighting left open, and the F5.7 residual on three findings. |
| **The downstream web-API implementation charter** | §10.1's forty-five not-owned statements as a lookup table, §12's stop, and §12.2's binding constraint on whatever wire contract it writes. |

---

## 16. Verification note

**What was checked, and how.**

| Check | Result |
| --- | --- |
| File number | **`11_`** — `01_`–`10_` were taken on `origin/develop`; this is the only new numbered chapter. |
| Revision cited | **`08_…md` + `10_…md`, revision `post-validation` (SUB-16 / NEU-979)** — §2, matching `10_…md` §2's marker exactly. |
| Matrix rows consumed | **45**, all from `10_…md` §8. Rows added, split or merged here: **0**. |
| Authorities originated here | **0.** Every authority in §9 and §10.1 is read off `10_…md` §8. |
| Inventory entries | **16**; exactly-one-authority **16/16**; zero-authority **0**; two-or-more **0**. |
| Cross-check | **inventory→matrix 2 unmatched; matrix→inventory 0 unmatched.** Both directions reported; every unmatched item carries owner and disposition. |
| Negative boundary | **45 of 45** categories carry an explicit not-owned statement; **0** silent. |
| Learner-facing set | **19** rows enumerated; **11** exposed, **8** stated deliberate non-exposures; **0** silently absent. |
| Scope audit | endpoint paths **0**, payload schemas **0**, error catalogues **0**, versioning **0**, pagination **0**. |
| `A-27` | Cited **in the sentence of the scope decision** (§5.2) with its tolerance envelope and its invalidating outcome both stated at that point. |
| Security claims | **7** in §8.2, **each naming its transport and its deployment tier.** Unqualified claims: **0**. |
| `R3` | Answered: **NOT ESTABLISHED**, with its `A-27` dependence and re-opening condition; routed to SUB-10 (NEU-984). |
| Files this chapter modified outside its own | `02_findings-register.md`, `90_…md`, `91_…md` — **appends only**, `### SUB-7` sections. `92_…md`, `93_…md`, `94_…md`: **not modified**. Merged chapters `00_`–`10_`: **not modified**. |
| Source tree | **No file under `src/`, `tests/` or `drizzle/` is changed.** This is a documentation-only chapter. |

**No spike was run, and `92_spike-register.md` is untouched.** Stated explicitly rather than by
omission, because an empty section and a missing section read identically at the completeness gate.
Nothing in this chapter's scope was **uncertain-and-material and unsettled by an existing cap**: the two
genuine limits are `CAP-S7-1` (no deletion owner to route an erasure intent to) and `CAP-S7-2` (eight
learner-facing categories with no store), and both are limits **no bounded experiment settles** — they
are absences in other packages' outputs, not questions an experiment could answer.

**No QA pass is claimed.** `qa-execution:engine` and `qa-execution:host` are both unconfigured in this
repository, so scenario execution is a genuine **Core Article 8 no-op** and the scenarios authored for
NEU-980 are marked **`NOT RUN`**. **`CAP-S1-3` applies unchanged.** A mechanical enumeration of
forty-five rows is not a QA pass, and neither is a documentation gate.

**Evidence labelling.** The scope decision (§5.2), the whole of §10.3, and the `R3` verdict (§13) are
**`[unconfirmed]`** — they rest on `A-27`, whose re-validation trigger is **NEU-892 lands**. The
component and boundary facts in §8 are **`confirmed`** against `05_…md`'s cited paths. The authority
assignments in §9 and §10.1 are **`consumed`** from `10_…md` — honoured, not re-derived.
