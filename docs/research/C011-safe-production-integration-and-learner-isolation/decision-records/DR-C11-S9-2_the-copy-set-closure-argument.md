# `DR-C11-S9-2` — The copy set is closed by enumerating write paths, not by enumerating stores, and the argument carries a stated falsifier

**Task:** NEU-1003 (SUB-9) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-26 · **Verification cutoff:** `ee0a750`, 2026-08-26
**Model:** claude-opus-5[1m]
**Discharges:** OUT-12 (`../90_outcome-register.md`) — the "no unowned copy" claim, made falsifiable rather than restated

## Decision

**Clause 1 — the claim.** Every copy of learner-derived data this deployment creates comes to rest
in one of the six enumerated copy classes, or in one of the **two named exceptions** of clause 5 —
the outbound egress to external providers (5a) and the process's own stderr log sink (5b).

**Clause 2 — the argument is over write paths, not over stores.** Enumerating stores and asserting
the list is complete is unfalsifiable: a store nobody thought of is invisible to a survey of stores
anyone thought of. Enumerating **writes** is closed, because a copy can only exist where a write put
it, and the write set is bounded by the source tree.

**Clause 3 — the enumeration, taken statically at cutoff `ee0a750`.**

| # | Write channel | How enumerated | Result | Lands in |
| --- | --- | --- | --- | --- |
| `W-1` | Database writes | `.insert(` / `.update(` / `.delete(` across `src/` | 14 files; the learner-data writers are the row-owning Drizzle adapters plus the two log transports | Classes 1, 4, 5 |
| `W-2` | Filesystem writes | `writeFile` / `appendFile` / `createWriteStream` / `writeFileSync` / `mkdir` across `src/` | **Zero matches** | — (no class needed) |
| `W-3` | Outbound network | `fetch(` / `axios` / `http.request` / `new OpenAI` / `createClient` across `src/` | **Three call sites; two carry learner content** | **Egress exception**, clause 5a |
| `W-4` | Process-local memory | SUB-3's inventory, consumed as recorded | 10 structures (`LD-S3-18` … `LD-S3-27`) | Class 1 (volatile) |
| `W-5` | The MCP response itself | The protocol's own return path | Reaches the client device | Class 2 |
| `W-6` | Database backup process | Outside `src/` by construction — a platform arrangement, not a code path | Existence unestablished | Class 3, cited to `OI-S1-8` |
| `W-7` | This package's own capture activity | SUB-1's terms, consumed as recorded | Zero members | Class 6 (`LD-S3-31`) |
| `W-8` | **Process stderr** — the pino logger's own sink | `src/shared/logger.ts:65` (`pino.destination(2)`); the redact config's own scope statement at `:25`–`:26` | **Carries learner content**, and the redaction is credentials-only | **Log-sink exception**, clause 5b |

**Clause 4 — the argument.**

> **Claim.** No copy of learner-derived data created by this deployment rests outside the six
> classes and the **two** named exceptions of clause 5.
>
> **Argument.** A copy exists at a location only if some write placed it there. `W-1` … `W-8`
> enumerate every channel by which a byte can leave the process: persistence, disk, network, memory,
> protocol response, platform backup, this package's own activity, and **the process's own standard
> streams**. A byte that is none of these has not left the process. `W-2` is empty **by
> measurement**. `W-1`, `W-4`, `W-5`, `W-6` and `W-7` each terminate in an enumerated class. `W-3`
> and `W-8` terminate outside all six and are **named as exceptions rather than absorbed**. ∎

**On the eighth channel, and why the first draft of this record did not have one.** An earlier
revision of this argument asserted `W-1` … `W-7` and the sentence *"there is no eighth channel"*.
That was wrong, and it was wrong in the most dangerous available way: the missing channel carries
learner free text, and the enumeration that missed it had already been checked by four greps and
returned green. `W-2`'s grep looked for `writeFile`, `appendFile`, `createWriteStream`,
`writeFileSync` and `mkdir` — **none of which a logger writing to a file descriptor calls.** The
defect is recorded here rather than quietly repaired, because the fact that a green four-grep check
missed an entire egress channel is the most useful thing this record can tell a later reader about
how much a green check is worth.

**Clause 5a — the named egress exception, stated as a finding and not as a footnote.** `W-3` resolves
to exactly three outbound call sites at this cutoff:

| Call site | What it sends | Learner content? |
| --- | --- | --- |
| `src/adapters/langchain/embedding-adapter.ts:89` — `new OpenAIEmbeddings({` | Chunk text, for embedding | **Yes** |
| `src/adapters/langchain/content-classifier-adapter.ts:199` — `new ChatOpenAI({`, invoked at `:145` | Classifier prompts over learner content | **Yes** |
| `src/transport/jwt-middleware.ts:15` — `fetch(discoveryUrl, …)` | The IdP discovery document request | No |

The first two create a copy of learner-derived data **in a third party's systems**, outside every
class the matrix defines and outside any mechanism this package can bind. This is `F-S5-2`'s content
egress reaching the propagation matrix from the other side. It is registered as **`F-S9-1`** with a
named owner, exactly as OUT-12 requires of "any copy the unowned-copy audit surfaces that no class
claims."

**Clause 5b — the named log-sink exception.** `W-8` is the pino logger's stderr sink. Three facts
fix it, all from the same file:

1. The logger writes to **file descriptor 2** in MCP mode — `pino.destination(2)`
   (`src/shared/logger.ts:65`).
2. The redact configuration is **shared across every sink**: it "censors credential/secret fields to
   `[REDACTED]` at serialization time across every pino sink (**stderr** + both DB transports)"
   (`src/shared/logger.ts:25`–`:26`). So whatever payload reaches `operation_event_log` or
   `mcp_request_log` through a pino transport reaches **stderr** as well.
3. The redaction is **credentials-only** — fourteen paths covering `password`, `token`, `apiKey`,
   `apikey`, `api_key`, `authorization` and `secret` (`src/shared/logger.ts:39`–`:54`) — and the file
   states outright that "**Learner `response` text is intentionally NOT redacted** — it is useful
   diagnostic data" (`:35`–`:36`).

Therefore the learner free text that classes **C4** and **C5** hold has a **copy on stderr**, which
in this deployment is captured by the container runtime and written to the host — outside the
database, outside every port, and outside all six classes. Its consequence is the sharpest instance
of `R2` in the package: **an erasure that correctly clears both log tables leaves the same content in
the container's log files.** Registered as **`F-S9-5`** with a named owner.

**Clause 6 — the falsifier.** The claim is false if anyone exhibits **a write of learner-derived
data whose destination is none of the six classes, is not one of clause 5a's two named egress call
sites, and is not clause 5b's stderr sink.** The falsification procedure is the enumeration itself,
re-run — mechanical, no production access required. **It is deliberately not stated as a fixed
number of greps.** An earlier revision said "four greps", and four greps is precisely what missed
`W-8`: a channel reached through a file descriptor matches none of the write-call names a grep for
filesystem APIs looks for. The procedure is *enumerate the channels and show each terminates in a
class or a named exception*; the greps are evidence for individual rows, not the method itself.

**Clause 7 — what the argument does not establish.** It bounds where copies *come to rest*. It says
nothing about who may *read* one once it rests there — that is confinement, and it is SUB-5's. The
two are different questions and are not merged here.

## Rationale

**Why a closure argument at all.** No production credential exists in this environment
(`SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*` and `VPS_*` all unset, verified 2026-08-26), and the
package has executed **zero of twenty-two** designed spikes, with the evidence label
`observed-in-production` used **zero** times anywhere in it. A propagation proof demonstrated
against a real copy is therefore unavailable, and the charter forbids the alternative that would
have made it available. What remains is either an argument or a deferred spike; this record gives
the argument, and `SPK-S9-1` registers the falsifying observation as the deferred spike, so the
claim is attackable from both directions.

**Why write paths rather than stores — the load-bearing choice.** SUB-6 faced the structurally
identical problem and solved it by closing over **inputs** rather than outputs: "A copied row can
only appear in an output if a row entered an input," and its five inputs are enumerated
exhaustively, none having row type
(`../06_the-disposition-of-every-unowned-row.md:579`–`:585`). That argument is available now and is
"strictly stronger than the empirical form" (`:573`–`:577`), because the empirical form would
require creating the copy it exists to disprove.

This record applies the same move in the mirror. SUB-6 closed over what *enters* a generator; this
closes over what *leaves* a process. In both cases the enumeration is over a channel set fixed by
the source tree rather than over a result set fixed by nobody, and in both cases that is what makes
the claim falsifiable instead of merely confident.

**Why the enumeration is credible as *complete* rather than merely long.** `W-1` … `W-7` are not a
list of places someone looked. They are a partition of the ways a byte can leave a process — write
it to a database, write it to disk, send it over a socket, keep it in memory, hand it back to the
caller, have the platform copy the disk, or copy it out by hand. The completeness claim rests on
that partition being exhaustive over process egress, which is a property of the runtime rather than
of this package's diligence. The falsifier in clause 6 attacks the partition directly.

**The one measurement that carried real information.** `W-2` returned **zero matches across all of
`src/`** — the deployment writes no learner data to disk outside the database. That was not assumed;
it was measured, and it removes an entire class of copy (log files, temp files, exports on disk)
that a store-oriented survey would have had to reason about speculatively.

**The egress hole is the point, not an embarrassment.** OUT-12's own text makes "no unowned copy" a
*falsifiable* claim by requiring that any copy no class claims be reported as a finding with an
owner. An enumeration that found nothing would be the weaker result — it is the outcome a false
self-certification also produces. This one found something, named it, and routed it.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Enumerate stores and assert completeness** | Unfalsifiable in exactly the way the charter warns against: a store nobody thought of is invisible to a survey of stores people thought of. Produces a green result indistinguishable from a false self-certification. |
| 2 | **Demonstrate propagation against a real copy** | No production credential exists. Zero of twenty-two spikes have executed. This is the alternative the environment forecloses, not one that was declined on preference. |
| 3 | **Defer the whole proof to a spike, publishing no argument** | Leaves OUT-12's central claim unmade at position 11, and blocks SUB-12, which consumes it. A deferred spike is registered (`SPK-S9-1`) *in addition to* the argument, not instead of it. |
| 4 | **Absorb the egress copies into class 1** ("MCP-owned state") on the grounds that the MCP tier initiated the call | Plainly false: the copy rests in a third party's systems, which the MCP tier neither owns nor can reach. Absorbing it would make "no unowned copy" true by relabelling — the exact paper completion `R2` names. |
| 5 | **Treat egress as out of scope because `F-S5-2` already routed it to SUB-8** | `F-S5-2` routed the *confinement* consequence. The *propagation* consequence — that a data right cannot reach the egressed copy — is OUT-12's and has no other home. Reporting it here creates no second record of `F-S5-2`; it is a distinct finding with a distinct consequence. |
| 6 | **Count the three outbound call sites as three copy classes** | Two of them are the same class of exposure with the same owner and the same absent mechanism; the third carries no learner content. Splitting would multiply the register without adding a party or a remedy. |

## Consequences

1. **`F-S9-1` is filed** — learner content egresses to external providers and no propagation action
   can bind the resulting copy. Owner and escalation route are recorded with it in
   `../91_findings-register.md`.
1b. **`F-S9-5` is filed** — the same learner free text the two log tables hold is written to stderr
   by the shared pino sink, so an erasure that correctly clears both tables leaves the content in
   the container's log files. This is the sharpest instance of `R2` the package contains, and it was
   found only because the enumeration was re-attacked after it had already returned green.
2. **The matrix's completeness claim is bounded and stated**, rather than asserted. The six classes
   are complete over copies this deployment controls; they are **not** complete over copies that
   exist, and the difference is exactly clause 5.
3. **The falsifier is mechanical and re-runnable by a reader with no production access**, which is
   the property the charter's evidence discipline actually asks for.
4. **`SPK-S9-1` is registered** as the deferred observation that would settle which provider
   receives the egressed content and under what terms — the one thing the static enumeration cannot
   establish.
5. **No claim is made about confinement.** Clause 7 keeps the read question with SUB-5.

## Evidence

| Claim | Source |
| --- | --- |
| Learner content egresses via the embedding adapter | `src/adapters/langchain/embedding-adapter.ts:89` |
| Learner content egresses via the classifier adapter | `src/adapters/langchain/content-classifier-adapter.ts:199`, invoked at `:145` |
| The third outbound call carries no learner content | `src/transport/jwt-middleware.ts:15` |
| The Tier-2 aggregate escapes the enforcement point | `../05_the-enforcement-point-that-confines-every-read-and-write.md:605`–`:611` |
| Four things escape the enforcement point, each named with its route | `../05_the-enforcement-point-that-confines-every-read-and-write.md:544`–`:546` |
| Operator and `psql` paths are outside every port | `../05_the-enforcement-point-that-confines-every-read-and-write.md:719`–`:722` |
| An aggregate is confined iff the predicate applies before aggregation | `../05_the-enforcement-point-that-confines-every-read-and-write.md:591`–`:593` |
| SUB-6's input-closure argument and its ∎ | `../06_the-disposition-of-every-unowned-row.md:579`–`:585` |
| SUB-6's five enumerated generator inputs | `../06_the-disposition-of-every-unowned-row.md:551`–`:565` |
| The empirical diff was rejected as self-defeating | `../06_the-disposition-of-every-unowned-row.md:573`–`:577` |
| SUB-3's ten in-memory structures | `../03_learner-data-inventory-and-classification.md:134`–`:142` |
| Backups are unestablished; single record | `../93_open-items-and-provisional-register.md:117`–`:132` |
| The sixth class has zero members | `../01_production-evidence-and-the-access-audit.md:128` |
| The pino logger writes to file descriptor 2 in MCP mode | `src/shared/logger.ts:65` |
| The redact config spans every sink, stderr included | `src/shared/logger.ts:25`–`:26` |
| The redaction is a credentials-only path list | `src/shared/logger.ts:39`–`:54` |
| Learner `response` text is intentionally not redacted | `src/shared/logger.ts:35`–`:36` |

## Revision trigger

- **A new outbound call site appears in `src/`.** Clause 5's enumeration is a count at a named
  cutoff, not a standing fact; `W-3` must be re-run at any later cutoff that cites this record.
- **A filesystem write appears in `src/`.** `W-2`'s zero is the measurement doing the most work in
  this argument, and it is the one most easily invalidated by a single new line of code.
- **The falsifier succeeds** — anyone exhibits a learner-data write terminating outside the six
  classes and outside clause 5. The claim is then false and this record is superseded rather than
  amended.
- **`SPK-S9-1` executes** and establishes the egress provider's actual retention and deletion terms,
  at which point `F-S9-1` may become resolvable rather than merely owned.
- **A seventh copy class is admitted** by any later sub-task, which would mean the partition in
  clause 4 was not exhaustive over process egress.
- **`src/shared/logger.ts`'s redact paths or sink configuration change.** Clause 5b rests on three
  lines of one file; a sink added, a sink removed, or `response` becoming redacted each changes what
  `F-S9-5` describes. In particular, adding `response` to the path list at `:39`–`:54` would close
  `F-S9-5` outright.
