# Proving a data right reaches every copy, including the ones this package itself created

**Sub-task:** SUB-9 (NEU-1003) · **Covers:** OUT-12
**Written:** 2026-08-26 · **Model:** claude-opus-5[1m]
**Codebase cutoff:** `origin/develop` @ `ee0a750`
**Depends on:** SUB-1 (NEU-993), position 1 — merged, published at `01_production-evidence-and-the-access-audit.md`; SUB-3 (NEU-995), position 3 — merged, at `03_learner-data-inventory-and-classification.md`; SUB-16 (NEU-999), position 7 — merged, at `16_attribution-and-detection.md`; SUB-6 (NEU-1000), position 8 — merged, at `06_the-disposition-of-every-unowned-row.md`; SUB-8 (NEU-1002), position 10 — merged, at `08_consent-and-what-a-learner-can-export-and-erase.md`
**Also consumes:** `05_the-enforcement-point-that-confines-every-read-and-write.md` (what escapes the enforcement point, read as recorded); `02_identity-the-learner-key-and-principal-kind.md` (the learner key); `DR-C10-S6-1` (`M-A`, consumed as given)
**Decision records:** `DR-C11-S9-1`, `DR-C11-S9-2`, `DR-C11-S9-3` · **Traceability:** `traceability/S9_propagation-and-completion-proof.md`

---

## 1. What this chapter is, and the one thing it must not be

OUT-12 asks for a propagation matrix in which no cell reads "unknown" without an owner and a date.
The failure it exists to prevent is **paper completion** — an erasure that reports success while
learner data survives in a copy nobody owns. The charter names that failure as its second § Risks
row and its second Critical one, and this sub-task is its named author. It is `R2`.

The temptation, at position 11, is to write a matrix that is complete because every cell has been
filled. That is the failure with better formatting. A matrix is only worth the completeness of the
copy set it ranges over, and **a proof that quietly assumes its copy set is complete is exactly the
paper completion it claims to prevent.** So this chapter does two things in a fixed order: it closes
the copy set with an argument that can be attacked (§4), and only then fills the matrix (§7).

**One inherited decision is settled here and nowhere else.** `F-S8-2` is blocking, and its named
owner for the disposition is this sub-task (`91_findings-register.md:435`). Three predecessors set
the board and each declined to pre-empt it. §6 decides it.

## 2. Where each predecessor's remit ended and this one begins

This is stated explicitly because the boundary between SUB-6's decision and this one is the single
most misreadable seam in the package, and `R-S6-1` exists because SUB-6 saw that.

| Sub-task | What it decided | What it left | 
| --- | --- | --- |
| **SUB-8** (position 10) | What an erasure request *means* per category, and that `unreachable` is a real disposition value rather than a rounding error (`08_consent-and-what-a-learner-can-export-and-erase.md:398`) | **What to do about the unreachable population.** It refused to narrow the duty to fit the mechanism: *"The duty covers both populations; only the mechanism reaches one"* (`:470`–`:472`) |
| **SUB-5** (position 5) | Where confinement is enforced, and that the same pre-cutover rows become invisible to everyone once it lands (`05_the-enforcement-point-that-confines-every-read-and-write.md:616`–`:641`) | The disposition of the population, explicitly out of scope there |
| **SUB-6** (position 8) | **Where the rows live** — `archive`, moved intact to a closed store outside the confined surface, deleting nothing (`06_the-disposition-of-every-unowned-row.md:175`) | **What a data right does to them.** It states all three options survive (`:311`–`:313`) and that `F-S8-2` is *"neither discharged nor re-raised here"* (`:337`–`:341`) |
| **SUB-9** (this chapter, position 11) | **What a data right does to them** — `DR-C11-S9-1` | The execution, which this package applies nowhere |

**SUB-6 decided where the rows live; this chapter decides what a data right does to them.** They are
values on two different axes over the same rows — the migration axis and the propagation axis — and
`06_…md:162`–`:176` sets them apart deliberately. Collapsing them is the conflation `R-S6-1` was
registered to prevent, and this chapter's answer to `R-S6-1` is in §6.4.

## 3. The six classes, each defined rather than inherited

A column heading that is a label rather than a definition guarantees the cell OUT-12 forbids. Each
of the six is defined here, and the mapping to SUB-3's inventory is given so the audit in §8 has
something mechanical to range over.

| # | Class | Definition | SUB-3 inventory categories |
| --- | --- | --- | --- |
| **C1** | **MCP-owned state** | Every store the MCP core writes: the ten `public` tables, the two `infrastructure` tables defined in `src/infrastructure/db/schema.ts`, and the ten process-local in-memory structures | `LD-S3-1` … `LD-S3-15`, `LD-S3-18` … `LD-S3-27` |
| **C2** | **Web-owned state** — browser-side only, under `M-A` | Local storage, session storage, cookies and cache **on the learner's own device**. See §3.1 | none — no server-side member exists |
| **C3** | **Backups** | Any copy produced by a platform-level backup arrangement for the production database. Existence unestablished | none inventoried; the fact is `OI-S1-8` |
| **C4** | **Operational logs** | `infrastructure.operation_event_log`, defined in raw SQL under `drizzle/`, behind no port | `LD-S3-17` |
| **C5** | **Audit logs** | `infrastructure.mcp_request_log`, defined in raw SQL under `drizzle/`, behind no port | `LD-S3-16` |
| **C6** | **The package's own captured production evidence** | This package's captures of real learner-derived production data. **Zero members; terms exist anyway** | `LD-S3-31` |

`LD-S3-28` … `LD-S3-30` are SUB-3's derived-never-persisted categories and `LD-S3-32` is the
aggregate result set; neither group is a copy class, and both are handled as tested exclusions in
§5.

### 3.1 `web-owned state` is resolved, not filled blind

The label is wording inherited from the adopted `NEU-893` brief, which predates `DR-C10-S6-1`. Under
`M-A` the MCP core is the exclusive writing tier for all 45 state categories and the web tier holds
no write authority and no database credential, so **no server-side web-owned copy of learner data
exists for a duty to propagate into.** The term is superseded by event — exactly as the preselection
guard is — and this chapter says so rather than silently redefining it.

**Resolution: the class denotes browser-side state on the learner's own device only**, and its cells
are populated with that content in §7. The server-side sub-class is recorded **empty-by-decision
under `M-A`**, cited to `DR-C10-S6-1`. It is not "unknown", and it is not an undefined heading —
an undefined heading guarantees precisely the cell OUT-12 forbids. Any future server-side web state
is a grant `NEU-896` converges and is not pre-empted here.

## 4. Closing the copy set: an argument, not a survey

### 4.1 Why an argument

**No production credential exists.** `SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*` and `VPS_*` are all
unset, verified 2026-08-26 in this environment. Across the package, **zero of twenty-two designed
spikes have executed** and the evidence label `observed-in-production` has been applied **zero**
times. Propagation cannot be demonstrated against a real copy, and the alternative that would make
it demonstrable — extracting real rows — is not authorized.

What remains is an argument with a falsifier, or a deferred spike with a method and an expiry. This
chapter gives **both**: the argument below, and `SPK-S9-1` as the observation that would settle the
one thing the argument cannot.

### 4.2 The argument closes over write paths, not over stores

Enumerating stores and asserting the list is complete is unfalsifiable — a store nobody thought of
is invisible to a survey of stores somebody thought of. Enumerating **writes** is closed, because a
copy exists only where a write put it, and the write set is bounded by the source tree.

This is SUB-6's move, mirrored. SUB-6 closed over what *enters* a generator — five inputs, none of
row type, therefore no output containing a copied row (`06_…md:579`–`:585`) — having rejected the
empirical diff as self-defeating, since performing it would create the copy it exists to disprove
(`:573`–`:577`). This chapter closes over what *leaves* a process.

Enumerated statically at cutoff `ee0a750`:

| # | Write channel | Method | Result | Lands in |
| --- | --- | --- | --- | --- |
| `W-1` | Database writes | grep `.insert(` / `.update(` / `.delete(` over `src/` | 14 files; learner-data writers are the row-owning Drizzle adapters and the two log transports | C1, C4, C5 |
| `W-2` | Filesystem writes | grep `writeFile` / `appendFile` / `createWriteStream` / `writeFileSync` / `mkdir` over `src/` | **Zero matches** | — |
| `W-3` | Outbound network | grep `fetch(` / `axios` / `http.request` / `new OpenAI` / `createClient` over `src/` | **Three call sites; two carry learner content** | **Egress exception, §4.4** |
| `W-4` | Process-local memory | SUB-3's inventory, read as recorded | Ten structures | C1 |
| `W-5` | The MCP response | The protocol's own return path | The client device | C2 |
| `W-6` | Platform backup | Outside `src/` by construction | Existence unestablished | C3 (`OI-S1-8`) |
| `W-7` | This package's captures | SUB-1's terms, read as recorded | Zero members | C6 |

> **Claim.** No copy of learner-derived data created by this deployment rests outside the six
> classes and the one named egress exception.
>
> **Argument.** A copy exists at a location only if some write placed it there. `W-1` … `W-7`
> enumerate every channel by which a byte can leave the process: persistence, disk, network, memory,
> protocol response, platform backup, and this package's own activity. There is no eighth — a byte
> that is neither persisted, written to disk, sent over the network, held in memory, returned to the
> caller, backed up, nor captured by this package has not gone anywhere. `W-2` is empty **by
> measurement**. `W-1`, `W-4`, `W-5`, `W-6` and `W-7` each terminate in an enumerated class. `W-3`
> terminates outside all six and is named as the exception rather than absorbed. ∎

The completeness claim rests on `W-1` … `W-7` partitioning process egress, which is a property of
the runtime rather than of this chapter's diligence. `W-2`'s zero is the measurement carrying the
most weight: the deployment writes **no** learner data to disk outside the database, which removes
an entire family of copies — log files, temp files, on-disk exports — that a store survey could only
have reasoned about speculatively.

### 4.3 The falsifier, stated

> **The claim is false if anyone exhibits a write of learner-derived data whose destination is
> neither one of the six classes nor one of §4.4's two named egress call sites.**

The falsification procedure is the enumeration re-run: four greps, no production access, any reader.
It is stated so a later reader can attack the claim rather than accept it.

### 4.4 What the argument found: the egress copies no class claims

`W-3` resolves to exactly three outbound call sites at this cutoff:

| Call site | What it sends | Learner content? |
| --- | --- | --- |
| `src/adapters/langchain/embedding-adapter.ts:89` — `new OpenAIEmbeddings({` | Chunk text, for embedding | **Yes** |
| `src/adapters/langchain/content-classifier-adapter.ts:199` — `new ChatOpenAI({`, invoked at `:145` | Classifier prompts over learner content | **Yes** |
| `src/transport/jwt-middleware.ts:15` — `fetch(discoveryUrl, …)` | IdP discovery document | No |

The first two place a copy of learner-derived data **in a third party's systems** — outside every
class the matrix defines, and outside any mechanism this package can bind. SUB-5 named the
confinement half of this as `F-S5-2`; the propagation half has no other home and is reported here.

**This is filed as `F-S9-1` with a named owner**, exactly as OUT-12 requires of *"any copy the
unowned-copy audit surfaces that no class claims"*. It is reported, not absorbed into prose, and the
matrix's completeness claim in §7 is bounded by it explicitly.

## 5. The membership test, applied per candidate and written down

**Membership turns on derivation, not on a label.** Each candidate is admitted or excluded on
whether it contains real learner-derived data, and the answer is recorded.

| Candidate | Derivation | Verdict |
| --- | --- | --- |
| SUB-1's captured production evidence | Copied from production — which is what makes it a member | **Admitted** → C6 (`LD-S3-31`) |
| SUB-6's synthetic dry-run dataset | Generated from schema text and scalar aggregates | **Excluded** — §5.1 |
| `LD-S3-32`, the aggregate result set | Derived from production by aggregation; counts over rows are not the rows | **Excluded** — §5.2 |
| `LD-S3-28` … `LD-S3-30`, derived-never-persisted | Computed at request time, never stored | **Excluded** — nothing comes to rest |
| This chapter's own quoted `file:line` evidence | Quoted from tracked source and from merged package files | **Excluded** — no production row is reproduced anywhere in it |

### 5.1 The dry-run exclusion, stated at position 11

SUB-6 recorded the evidence and named this sub-task as the party that states the exclusion in the
matrix. **The statement is:**

**SUB-6's synthetic dry-run dataset is not a member of the sixth copy class and is not a member of
any copy class. It enters no column of the matrix, and this sub-task sets no term for it** — no
owner, no retention bound, no destruction condition, no propagation action. A non-copy has nothing
for a propagation duty to attach to, and inventing a term for it would imply otherwise.

The exclusion turns on derivation and not on the phrase *"production-shaped"*, which was doing the
work of a decision nobody had made. The evidence is SUB-6's **input-closure argument**
(`DR-C11-S6-3`; `06_…md:551`–`:565`, `:579`–`:585`): the generator's five inputs are enumerated
exhaustively; `G-IN-1` is tracked schema text and contains no rows; `G-IN-2`, `G-IN-3` and `G-IN-4`
are `COUNT`, `MIN` and `MAX` results, whose return type is scalar and which therefore cannot carry a
row even in principle; `G-IN-5` is synthesized locally from a seeded PRNG. No input has row type,
therefore no output contains a copied row. The empirical row-by-row diff was rejected as
self-defeating (`:573`–`:577`). The derivation test itself is SUB-3's, recorded at position 3
(`03_learner-data-inventory-and-classification.md:484`–`:506`).

**This sub-task's acceptance adds one thing SUB-6 did not state — the exclusion's own falsifier.**
SUB-6's argument is closed over the input set *as it stood at position 8*. It is therefore not a
permanent property of the generator but a property of its current inputs, and:

> **The exclusion is falsified if any input of row type is added to the generator.** At that point
> the closure argument no longer runs, the dataset may contain a copied row, and its membership must
> be re-tested rather than inherited from this chapter.

Stating it here is what keeps the exclusion falsifiable rather than settled by precedent — the
distinction this package has repeatedly failed on in the other direction.

### 5.2 The aggregate result set, carried as SUB-3 inventoried it

`LD-S3-32` is per-disposition counts and pathology-probe results, **never rows**. SUB-3 classified it
**not personal data**: *"Counts over rows are not the rows"*
(`03_learner-data-inventory-and-classification.md:468`–`:482`). Because no learner value is carried,
there is no learner to scope an export to, and the same reasoning makes it not erasable — SUB-8
gave it `not-applicable` (`08_…md:433`). It is carried exactly as inventoried; this chapter adds no
classification of its own.

The reasoning has a boundary worth stating, because it is the one place a count *can* misbehave:
SUB-5's rule is that **an aggregate is confined if and only if the confinement predicate is applied
before aggregation** (`05_…md:591`–`:593`). That is a rule about *disclosure*, not about copies. An
unconfined aggregate discloses a true fact about another learner's data while creating no copy of
it. The distinction matters in §9.

## 6. The disposition of the pre-cutover population

### 6.1 The problem, as three predecessors left it

Rows written to either log table before the attribution carrier lands carry `principal_kind = 'none'`
and no learner key, and **no later process can supply one**: the only structure that ever held the
binding is the process-local map at `src/transport/http.ts:83`, emptied by every restart
(`16_attribution-and-detection.md:279`–`:285`). A `DELETE … WHERE learner_key = $1` therefore
"returns success and a row count while the entire pre-cutover population survives"
(`08_…md:441`–`:452`).

`F-S8-2` audits that population as a retention exception and finds it fails **two** of the four
fields outright — no justification, and no learner-scoped bound (`91_findings-register.md:431`).
Owner and basis can be supplied; those two cannot.

### 6.2 The decision

**Bulk deletion at archive close, taken under storage limitation rather than under per-request
erasure.** Recorded in full, with seven rejected alternatives, at
`decision-records/DR-C11-S9-1_the-pre-cutover-population-disposition.md`.

The whole population is deleted in one operation at the close of the archive `DR-C11-S6-2` creates.
The predicate is the archive's own boundary — every row in the archive is in the population — which
is exactly what SUB-6 bought by making the set finite and closed.

### 6.3 Why this answers a population that is simultaneously un-erasable and invisible

The two properties that make the population intractable are jointly the reason a population-wide
disposal is both available and cheap.

1. **Un-erasability removes the alternative.** No per-learner predicate selects a pre-cutover row,
   and none can be built. Every disposition that operates *per learner* is therefore unavailable by
   construction. The only predicates available over this population are population-wide ones — and a
   population-wide predicate is precisely what the archive boundary supplies.
2. **Invisibility removes the cost.** SUB-5 established that confinement **hides** these rows from
   everyone, "including the learner who created them" (`05_…md:616`–`:641`). So no learner can read
   them and no learner-facing feature depends on them. Their only residual value would be
   operational — and being unattributed, they cannot answer *"who did this"* for any row either.
   A population nobody can see, that cannot be attributed, and that no feature reads has nothing
   weighing against its disposal.

The exposure and the remedy have the same cause. **The same boundary that makes these rows
un-erasable makes them worthless to retain**, which is why bulk deletion is the correct answer here
and not merely the convenient one.

The duty actually discharged is **storage limitation**, which is population-wide and therefore
dischargeable by a population-wide predicate. The **erasure** duty is discharged over the population
as a consequence: a request cannot fail to reach a row that does not exist. `F-S8-2`'s two missing
fields are not manufactured — the population is removed from the class of things that need them. An
exception needs a justification; a disposal does not.

The two alternatives are rejected in `DR-C11-S9-1` and summarised here: an **accepted named
residual** leaves the duty attached indefinitely, which is the silent indefinite retention OUT-11
exists to end; **bulk anonymization** cannot be shown complete, because `response_body` is stored
whole and the only redaction ever written is a credentials-only denylist
(`src/shared/redact-params.ts:1`), so any missed residue is personal data sitting behind a claim of
removal — a self-certification the evidence cannot support.

### 6.4 The answer to `R-S6-1`

`R-S6-1` registered the hazard that a tidy archive reads as a discharge. Its mitigation status
records that *"the only thing that actually closes it is SUB-9 publishing its disposition"* and that
*"that residual's owner is SUB-9"* (`92_risk-register.md:586`–`:588`).

**The archive is not the discharge. This chapter's disposition is.** SUB-6 relocated the population;
this disposes of it. The archive is the *precondition* that makes the disposal bounded and safe —
finite, countable, in one place, already out of the read path — not a competing answer to it. And
because the conclusion is **not** "accepted residual", the specific misreading `R-S6-1` guards
against does not arise: the archive does not persist with the duty attached.

`R-S6-1`'s residual is therefore closed. **SUB-6's entry is not edited** — this register is
append-only and no sub-task rewrites another's — and the closure is recorded in this sub-task's own
append to `92_risk-register.md`.

### 6.5 `F-S8-2`: downgraded from blocking to resolved

`F-S8-2`'s own resolving event is *"SUB-9 publishes a disposition for the pre-cutover population —
bulk deletion, bulk anonymization, or an accepted and named residual. On that event this finding is
downgraded from blocking to resolved"* (`91_findings-register.md:436`).

Bulk deletion is published here, so **the finding is downgraded from blocking to resolved**, on its
own stated terms.

**What is discharged is the design obligation, not the rows.** This package applies nothing: no
DDL is executed, no file under `src/` or `drizzle/` changes, and no production access exists. The
execution of the disposal is carried forward as **`R-S9-1`** with a named owner and an escalation
route. Saying the finding is resolved *and* that the rows still exist is not a contradiction — the
finding was that no mechanism discharged the duty, and a mechanism now exists and is specified.

### 6.6 The retention and deletion mechanism, and the condition nobody had discharged

The mechanism is designed here and **handed** to the owners of `CAP-S3-3` (C010) and `CAP-S4-1`
(C010); it is not absorbed. Both are owned by `NEU-986` (`SUB-12 of C010`), co-named `NEU-896`
(`../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:499`–`:500`).

| Table | Retention window | Deletion owner | Floor, and where it comes from |
| --- | --- | --- | --- |
| `infrastructure.mcp_request_log` | 90 days | The creator, as sole maintainer and sole operator | No code-derived floor; 90 days is a stand-in (`A-S9-1`) |
| `infrastructure.operation_event_log` | 90 days | The creator, as sole maintainer and sole operator | **Hard floor of 5 weeks, fixed by code** — see below |

`CAP-S7-1` (C010) is owned by this package outright — its `Owner:` line names `NEU-893` as *"the
only party positioned to assign a retention-and-deletion owner"*
(`../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:283`). Its stated
lifting condition (`:284`) is a named deletion owner on `SC-S3-16` and `SC-S3-17` with a retention
window — plus, for `SC-S3-17` specifically, a statement of *"what happens to a gate input, **which
no party has yet done**."*

**That statement is made here, from the code.** The Tier-2 blocking gate reads
`infrastructure.operation_event_log` at
`src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`, filtered to
`event = 'classifier.tier2_blocked'` (`:40`) and bounded to
`"timestamp" >= NOW() - INTERVAL '5 weeks'` (`:41`). Three consequences:

1. **A retention window of ≥ 5 weeks leaves the gate input entirely intact**, because the gate's own
   query never reads a row older than that. The window's lower bound is therefore not a policy
   preference — it is a code fact. 90 days sits comfortably above it.
2. **The bulk deletion of §6.2 cannot affect the gate at all**, on a second and independent ground:
   it operates on the archive, and the gate queries the live table.
3. **The gate's input is not learner content.** It reads `data->>'field'` on classifier telemetry
   rows, so no part of the erasure duty attaches to what the gate actually reads.

**This is not a second record of `F-S6-3`.** SUB-6 already established what the same five-week
window means for the **archive**: moving the pre-cutover rows out truncates the gate's window, so it
under-reports for five weeks and then reads only carrier-bearing rows, at which point `F-S5-9`
becomes fixable for the first time (`91_findings-register.md:703`–`:711`). That is a transient
effect of the *relocation*, and it is SUB-6's. What is stated here is a different consequence of the
same literal — the **lower bound on the retention window**, which `CAP-S7-1` demanded and which no
party had supplied. The two are complementary and neither restates the other; `F-S6-3` is cited
rather than re-raised.

**`CAP-S7-1` is therefore discharged here**, by supplying exactly the condition it names, including
the one it records as never made.

## 7. The propagation matrix

Three duties × six classes = **18 (class, duty) pairs**, presented as **17 rows**: under consent
withdrawal C4 and C5 take one shared row, because the answer is identical for both and stating it
twice would imply a distinction that does not exist. **The merge is presentational only** — under
`DR-C11-S9-3` clause 1 each of the six classes still emits its **own** completion-proof row on every
request, so the declared cardinality stays 6 and `SIG-S16-3` still counts C4 and C5 separately. The
count is given as 17 rows rather than 18 so a reader recounting the tables gets the number this
chapter states.

Every cell carries a propagation action, a completion deadline, a permitted retention exception, a
learner-visible result and an auditable proof.

**Deadline convention.** Every `30 days` below is `A-S8-1`'s value, consumed by citation, not set
here. It is *"not observed, not calibrated, and not a legal determination"*
(`95_stand-in-assumption-register.md:567`–`:575`). **Proof convention.** Every "proof" cell is one
`propagation_proof` row conforming to `DR-C11-S9-3`; the emit-zero rule means every class emits one
on every request, including the classes with nothing to do.

### 7.1 Erasure

| Class | Propagation action | Deadline | Permitted retention exception | Learner-visible result | Auditable proof |
| --- | --- | --- | --- | --- | --- |
| **C1** MCP-owned | `delete` / `cascade` / `de-identify` per SUB-8's per-category dispositions (`08_…md` §8.1). In-memory structures are evicted on the same request | 30 days | `LD-S8-1`, the consent record: `de-identify` after 24 months, never `delete` on request (`08_…md:487`) | Per-category counts of rows deleted | `copy_class = C1`, `action = deleted`, `rows_affected = n` |
| **C2** Web-owned (browser-side) | **Instruct-and-confirm**: the response directs the client to clear local storage, session storage, cookies and cache for the origin. The server cannot reach the device | 30 days | None | A statement of what the device was instructed to clear, and that the instruction was issued | `copy_class = C2`, `action = deleted`, `rows_affected = 0` with the instruction recorded — **the count is of server-side rows, of which there are none by `M-A`** |
| **C3** Backups | **Not determinable at this cutoff.** Owner: the creator, as sole maintainer and sole operator, carried from `OI-S1-8` (`93_open-items-and-provisional-register.md:124`). Date: the resolving event at `:125` | 30 days from the point the class is resolved | **Reserved, unspecified** — a backup retention exception is the standard shape, but its bound cannot be written before the backups fact is established | That a backup class exists whose contents are unestablished, with the named owner | `copy_class = C3`, `action = not-applicable`, `rows_affected = 0`, **flagged unresolved** |
| **C4** Operational logs | Post-cutover rows: `delete` by `learner_key`. **Pre-cutover rows: `delete` in bulk at archive close** (§6) | 30 days for post-cutover; archive close for pre-cutover | Retained ≤ 90 days for operations, floor 5 weeks fixed by the Tier-2 gate (§6.6) | Two counts, stated separately: rows deleted by key, and the pre-cutover population's disposal status | Two rows are **not** emitted — one `copy_class = C4` row carrying the by-key count; the bulk disposal is a dated operation, not a per-request one |
| **C5** Audit logs | Post-cutover rows: `delete` by `learner_key`. **Pre-cutover rows: `delete` in bulk at archive close** (§6) | 30 days for post-cutover; archive close for pre-cutover | Retained ≤ 90 days | As C4 | `copy_class = C5`, `action = deleted`, `rows_affected = n` |
| **C6** Package's own captures | **Destroy on schedule**, with manual operator deletion available in the pre-publication window. Reasoning in §7.4 | Publication of C011, which is ≤ any request deadline | None. The class's own retention bound is stricter than any exception would be | That the class has zero members, or that the capture was destroyed at its quarantine path | `copy_class = C6`, `action = not-applicable`, `rows_affected = 0` at zero membership |

### 7.2 Export

| Class | Propagation action | Deadline | Permitted retention exception | Learner-visible result | Auditable proof |
| --- | --- | --- | --- | --- | --- |
| **C1** MCP-owned | `export` per SUB-8's six export dispositions (`08_…md` §7.3) — content, derived state, computed-at-export, or partial-and-labelled-partial | 30 days | n/a — export has no retention exception | A learner-readable export of their material | `action = exported`, `rows_affected = n` |
| **C2** Web-owned (browser-side) | **Not exported by the server.** The data is already on the learner's own device and under their control | 30 days | n/a | A statement that browser-side state is on their device and is not server-held | `action = not-applicable`, `rows_affected = 0` |
| **C3** Backups | **Not exported.** A backup is a copy of already-exported state; exporting it separately would return the same content twice and disclose the backup's structure | 30 days | n/a | A statement that backups hold no content the primary export omits | `action = not-applicable`, `rows_affected = 0`, **flagged unresolved** while `OI-S1-8` is open |
| **C4** Operational logs | Post-cutover: `export` the learner's own rows. **Pre-cutover: `not exported` — unreachable**, per SUB-8's `unreachable` value | 30 days | n/a | Both facts, stated: what was exported, and that a pre-cutover population exists that no predicate selects | `action = exported` with the by-key count; the unreachable population is stated in the result, not silently omitted |
| **C5** Audit logs | As C4. `response_body` holds the learner's own free-text answers whole, so this is genuine content, not metadata | 30 days | n/a | As C4 | As C4 |
| **C6** Package's own captures | **`not-exported — zero members`**, SUB-8's own value, written to hold *when the class acquires one* (`08_…md:365`). §7.4 | 30 days | n/a | That the class has zero members | `action = not-applicable`, `rows_affected = 0` |

### 7.3 Consent withdrawal

| Class | Propagation action | Deadline | Permitted retention exception | Learner-visible result | Auditable proof |
| --- | --- | --- | --- | --- | --- |
| **C1** MCP-owned | Processing switch takes effect on the next request; already-collected copies purged within **7 days** (`A-S8-1`) | 7 days | `LD-S8-1`: a new row is written recording the withdrawal; the record is never updated in place and never deleted on withdrawal (`08_…md:297`) | Which purposes stopped, and when | `action = deleted`, `rows_affected = n` |
| **C2** Web-owned (browser-side) | Instruct-and-confirm, as §7.1 | 7 days | None | As §7.1 | `action = deleted`, `rows_affected = 0` server-side |
| **C3** Backups | **Not determinable at this cutoff**, owner and date carried from `OI-S1-8` | 7 days from resolution | Reserved, unspecified | As §7.1 | `action = not-applicable`, **flagged unresolved** |
| **C4** / **C5** Logs | Withdrawal stops the *collection*, it does not retroactively unwrite a log row. Already-written rows follow the erasure path of §7.1 | 7 days to stop collection | Retained ≤ 90 days, floor 5 weeks for C4 | That collection stopped, and that existing rows follow the erasure path | `action = deleted` for the purge; the collection switch is not itself a row count |
| **C6** Package's own captures | Withdrawal does not reach a class with zero members. **On membership, the destruction condition already fires at publication regardless of consent** | Publication | None | That the class has zero members | `action = not-applicable`, `rows_affected = 0` |

### 7.4 The sixth column: its terms arrive set, and "destroy on schedule" is reasoned

**The terms are SUB-1's, recorded at position 1, and are read here rather than authored**
(`01_production-evidence-and-the-access-audit.md:151`–`:159`): named owner — the creator, as sole
maintainer and sole operator; retention bound — only until the decision the capture was taken to
settle is published, and in no case longer than the package's own publication; destruction condition
— on publication of C011 under `docs/research/`, every capture is destroyed at its quarantine path;
redaction discipline — payload segment only, never the signature; quarantine path — `_local/scratch/`.
**Members at revision 1: none.** Zero captures were produced
(`01_production-evidence-and-the-access-audit.md:128`), because SUB-1 executed zero of nine designed
spikes for want of a credential — not because the class is inapplicable.

**Why the action is "destroy on schedule" rather than "erase on request", stated rather than
assumed.** The class's own retention bound expires *no later than the package's publication*, and
that condition is **unconditional** — it does not wait for a learner to ask. A scheduled destruction
therefore has a deadline earlier than or equal to any erasure request's, and it covers **every**
member rather than only the requesting learner's. Destroy-on-schedule strictly dominates
erase-on-request over this class, which is why the charter permits it here and only here.

It does **not** replace erase-on-request, and the matrix does not pretend otherwise. A request can
arrive while a capture is live and before publication. In that window the action is a **manual
operator deletion** at the quarantine path: the class lives at `_local/scratch/`, is reached by no
port and by no SQL statement (`05_…md:564`–`:582`), so there is nothing to automate, and a design
claiming an automated path here would be a fiction. Both paths emit the same proof row.

### 7.5 How a data right routes through a class with zero members

`LD-S3-31` has **zero known members and terms that exist anyway**, and SUB-3 refused to collapse the
distinction precisely because this sub-task must route a data right *through* the class:
*"'Empty membership' and 'no such class' are not the same statement"*
(`03_learner-data-inventory-and-classification.md:431`–`:437`).

**The routing rule: the request does not ask the class for members — it requires the class to
produce a proof.** With zero members the proof is `action = not-applicable`, `rows_affected = 0`.
Because `DR-C11-S16-3` makes `0` legal and requires it to be **distinguishable from absent**, and
because its fourth negative clause forbids omitting a class merely because there was nothing to do
(`16_attribution-and-detection.md:333`–`:336`), that zero is a **positive statement rather than a
silence**.

The consequence is the whole point: an empty class that emits nothing is indistinguishable from a
forgotten one, whereas an empty class that emits a zero is checked by `SIG-S16-3` on **every single
request** — because the declared cardinality is 6 and the signal fires when fewer than six classes
carry a complete proof. The class is monitored, not assumed.

**When the class acquires a member**, SUB-1's terms attach unchanged at that instant, the action
becomes destroy-on-schedule per §7.4 with manual operator deletion in the pre-publication window,
and `rows_affected` becomes non-zero. Nothing about the matrix changes shape — which is the property
the pre-registered terms were for.

## 8. The unowned-copy audit

**Input set.** SUB-3's inventory ∪ the consent category SUB-8 created —
*"Every one of SUB-3's thirty-two entries, plus `LD-S8-1`. **Thirty-three rows; zero omitted**"*
(`08_…md:258`). SUB-3's inventory already includes the package's own copies. **Zero revisions are
raised against SUB-3's inventory, and none is requested.**

**Method.** Each of the 33 categories is mapped to a copy class in §3; each class carries a
propagation action and a named owner in §7. A category with no class, or a class with no owner, is
an unowned copy.

**Result.**

| Measure | Count |
| --- | --- |
| Categories audited | **33** |
| Categories mapping to a defined copy class | **33** |
| Categories with no propagation owner | **0** |
| Copy locations surfaced that **no class claims** | **1** — the external-provider egress of §4.4 |
| Matrix cells that cannot be resolved to an action, a deadline and an owner | **0** — every cell has all three; three C3 cells are flagged unresolved-with-owner-and-date, which is what OUT-12 permits |

**Every one is reported as a finding.** The single unclaimed copy location is **`F-S9-1`**, with a
named owner. The count of unowned copies *within the inventory* is zero — and that zero is only
meaningful because the audit ranged over a copy set closed by §4 rather than assumed.

**Declared copy-class cardinality: 6.** This is the figure `DR-C11-S16-3` requires each propagation
to declare, and it is the trigger `A-S8-1` names for its own re-validation
(`95_stand-in-assumption-register.md:600`–`:608`).

## 9. What this proof does not cover

The propagation proof is bounded by what escapes the enforcement point. SUB-5 states that **four**
things escape, "each named with its route" (`05_…md:544`–`:546`):

| # | Escapee | SUB-5's id | Effect on this proof |
| --- | --- | --- | --- |
| 1 | **Content egress** to external providers via `EmbeddingPort` and `ContentClassifierPort` | `F-S5-2` | **Bounds it directly.** The copy rests outside all six classes; no propagation action reaches it. Reported here as `F-S9-1` |
| 2 | **`LD-S3-31` is not confinable** — it lives at `_local/scratch/`, behind no port | (cross-reference, no new id) | Does **not** bound the proof: the class is in the matrix, confined by SUB-1's recorded terms rather than by a predicate |
| 3 | **`Tier2BlockingStatsRepository`'s aggregate** over a table with no ownership key | `F-S5-9` | Bounds *disclosure*, not copies. An unconfined `COUNT` discloses a true fact about another learner's data while creating no copy — §5.2. No propagation duty attaches; the confinement gap is real and is SUB-5's |
| 4 | **The non-retroactive boundary** | `F-S5-10` | Bounded it, and §6 is the response |

**A correction, made against the file rather than against a brief.** The four escapees are §6.1–§6.4
as listed above. **Operator and `psql` paths are *not* among them** — SUB-5 names them separately at
§7.4 as an uncovered *test* path, stating that direct `psql` access "is outside every port and
therefore outside the enforcement point entirely", and that modelling rather than exempting them is
**SUB-12's** obligation under OUT-17 (`05_…md:719`–`:722`). They bound this proof too — an operator
with a shell can create a copy no enumeration of `src/` will ever see — but they are a fifth thing,
named in a different section, and merging them into the four would misattribute SUB-5's own
structure.

Two further bounds this chapter states about itself:

- **The proof is static.** It establishes where copies come to rest given the code at `ee0a750`. It
  is not an observation of production, and **no quantity anywhere in this chapter is a production
  measurement.** No row count, no population size, no backup fact. `observed-in-production` is used
  zero times.
- **The proof is about resting places, not about readers.** Who may read a copy once it rests is
  confinement, and is SUB-5's. The two questions are not merged.

## 10. Dispositions recorded

| Id | Class | Owner | Recorded here as |
| --- | --- | --- | --- |
| `CAP-S3-3` (**C010**) | **Supplied-to** | `NEU-986` (`SUB-12 of C010`), co-named `NEU-896` | The retention window, its code-derived floor and the deletion owner are designed in §6.6 and handed over. **Not absorbed, not re-filed** |
| `CAP-S4-1` (**C010**) | **Supplied-to** | `NEU-986` (`SUB-12 of C010`), co-named `NEU-896` | Same gap sighted from component placement; same mechanism handed over |
| `CAP-S7-1` (**C010**) | **Owned here, discharged here** | `NEU-893` outright (`../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:283`) | Discharged in §6.6 by supplying its stated lifting condition, including the gate-input statement `:284` records as never made |
| `CAP-S5-1` (**C010**) | **Co-owned here, discharged elsewhere** | Co-owned with `NEU-986` | Discharged under OUT-8 by SUB-5, not here. Recorded so SUB-14's classification has a source. Neither absorbed nor declined |
| `OI-S5-1` | **Consumed, not owned** | `NEU-850` | Consumed by citing the stand-in entry SUB-3 authored at position 3 — the reading this package adopted, its owner and its re-validation trigger. **This chapter assumes no reading of its own** |

**On the two `CAP-S4-1`s.** C011 has its own `CAP-S4-1` — SUB-4's cap that the STDIO mechanism is
designed and never exercised (`94_caps-and-incomplete-scope.md:115`). It is **a different cap with
the same id**, and the log-table cap above is always written qualified as **C010's**, with its full
path. A bare `CAP-S4-1` in this package means SUB-4's. This is the collision class `F-S2-2` warns
about, and getting it wrong would misroute a disposition to the wrong owner.

**On the backups fact.** The backups column is populated **by citation only**. `OI-S1-8` is the
package's single record — *"This is the single register record of the backups fact"*
(`93_open-items-and-provisional-register.md:128`) — and it names this sub-task as the consumer that
*"populates its backups column by citation"* (`:123`). Its owner is the creator, as sole maintainer
and sole operator (`:124`). **This chapter raises no open item, finding, risk or register entry of
its own about backups**, so the package carries one id for one fact.

## 11. Ids allocated by this sub-task

| Register | Ids |
| --- | --- |
| Outcomes (`90_outcome-register.md`) | OUT-12's row |
| Findings (`91_findings-register.md`) | `F-S9-1` … `F-S9-4` |
| Risks (`92_risk-register.md`) | **`R2`** — charter § Risks row 2, the only one of the fifteen naming OUT-12 — plus `R-S9-1`, `R-S9-2`, `R-S9-3` |
| Open items (`93_open-items-and-provisional-register.md`) | `OI-S9-1` |
| Caps (`94_caps-and-incomplete-scope.md`) | none filed; four inherited caps recorded by disposition in §10 |
| Stand-ins (`95_stand-in-assumption-register.md`) | `A-S9-1` |
| Spikes (`96_spike-register.md`) | `SPK-S9-1` |
| Completeness gate (`97_package-completeness-gate.md`) | `G-S9-1` … `G-S9-13` |
| Decision records | `DR-C11-S9-1`, `DR-C11-S9-2`, `DR-C11-S9-3` |
| Document numbers | `09_` only |

**Id scheme.** `R2` is the charter § Risks row's position, per the package's convention
(`README.md:73`); every other id is sub-task-scoped `-S9-`, computed from the charter alone. **No id
here was chosen by reading a concurrent sibling's output** — SUB-7 (position 9) and SUB-11 (position
12) are in flight against these same registers, and a sub-task-scoped id cannot collide with either.

**Namespace note.** C010 has its own sub-task 8 **and** its own sub-task 9, so a bare `F-S9-*` or
`G-S9-*` could in principle collide in shape with C010's. It does not collide in subject, and the
package rule applies unchanged: **a bare `-S9-` id in this package is C011's own; C010's is always
cited with its full path and line.** Both C010 `CAP-S3-3`/`CAP-S4-1`/`CAP-S7-1` references in §10
are written qualified for exactly this reason.

## 12. What this chapter does not establish

- **Nothing about production.** No row count, no population size, no backup fact, no observed
  behaviour. Zero of twenty-two designed spikes have executed package-wide — a figure re-counted at
  this sub-task's own cutoff in `96_spike-register.md`, not inherited.
- **Nothing about whether the disposal happened.** §6 publishes a disposition; the execution is
  `R-S9-1`'s, with a named owner outside this package.
- **Nothing about the egressed copies' fate.** `F-S9-1` names the exposure; what the providers
  actually retain is `SPK-S9-1`, unexecuted.
- **Nothing about confinement.** Who may read a copy is SUB-5's, under OUT-8.
- **No QA pass.** The `qa-execution` surface is unconfigured, so the automated QA phase is a genuine
  Core Article 8 no-op, carried at package level as `CAP-S1-3` and not re-filed here.
- **No applied behaviour.** No file under `src/` or `drizzle/` changes, no DDL is authored, nothing
  is executed.
