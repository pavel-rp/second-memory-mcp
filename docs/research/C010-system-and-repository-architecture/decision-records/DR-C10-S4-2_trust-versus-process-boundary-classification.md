# `DR-C10-S4-2` — Trust versus process boundary classification, and who owns a boundary

**Task:** NEU-974 (SUB-4) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-21
**Model:** claude-opus-5[1m]
**Discharges:** `OUT-1` · **Applied in:** `../05_system-context-and-responsibility-boundaries.md` §4

---

## Decision

**Three classes, decided by two independent questions, plus one ownership rule.**

| Class | Test |
| --- | --- |
| **trust** | One side must remain correct **while assuming the other side is hostile or compromised** — the two sides are under different control, or under the same control but reachable by a different principal. |
| **process** | The two sides are under the **same** control and mutually trusted, but a call between them can fail, be delayed or be lost independently of the caller — so **the caller must handle absence**. |
| **neither** | An in-process call between mutually trusted code under one control, whose failure mode *is* the caller's own failure mode. |

**Ownership rule: a boundary is owned by the side that must still be correct when the other side
misbehaves.** On a trust boundary that is always the side inside the operator's control; on a process
boundary it is the side that must handle absence.

**Two riders are part of the decision.** First, **every protection claim names the transport it holds
for** — an unqualified claim is false for half the surface. Second, **a boundary that meets the trust test
and that no component enforces is still published as a trust boundary**, marked unenforced, rather than
downgraded or omitted (`BND-S4-17`).

The classification yields **seven trust boundaries**: the four the charter names — browser ↔ server
(`BND-S4-1`), web tier ↔ MCP core (`BND-S4-2`), our infrastructure ↔ external source sites (`BND-S4-3`),
our infrastructure ↔ AI provider (`BND-S4-4`) — plus three the rule finds that the charter's list does
not enumerate: the handoff boundary to an external MCP client (`BND-S4-5`, under **`A-29`**), the identity
boundary to the token issuer (`BND-S4-6`), and the unenforced STDIO boundary (`BND-S4-17`).

## Rationale

The criteria and their weights, fixed **before** any option was scored:

| # | Criterion | Weight |
| --- | --- | --- |
| C1 | A reader holding only the two sides' descriptions must be able to decide the class, without consulting the author. | **decisive** |
| C2 | The scheme must not collapse "different process" into "different trust" — the most common failure of architecture documents, and the one that puts security obligations on edges nobody should be hardening. | high |
| C3 | The scheme must produce exactly one owner per boundary, derivable from a published rule rather than assigned case by case. | high |
| C4 | The scheme must survive the transport split — a class that is right on HTTP and wrong on STDIO is not a class. | medium |

**Why two questions rather than one.** "Who controls the other side" and "can the call fail
independently" are genuinely orthogonal, and conflating them loses information in both directions.
`BND-S4-9` — the gate runner's terminable isolate — is the clean case: the isolate can be killed mid-gate,
so the battery must handle a missing verdict, but both sides are first-party creator-authored code, so the
isolate exists for **liveness, not containment** (`../03_…` §3.5). A one-question scheme has to call that
either "trust" (implying containment obligations SUB-2 explicitly disclaimed) or "not trust" (losing the
absence-handling obligation that is the entire reason the boundary matters).

**Why the ownership rule falls out of the trust test rather than being chosen separately.** The trust
test already names which side must be correct under adversity; naming that side the owner costs nothing
and removes every case-by-case argument. It is also what makes C3 hold for the awkward rows: `BND-S4-16`'s
owner is conditional because its *existence* is conditional, and `BND-S4-17`'s owner is **nobody** —
stated as a finding (`F-S4-5`) rather than papered over with a plausible name.

**Why the transport rider is part of the decision and not a note.** `src/transport/main.ts:46` mounts
origin checking, JWT verification, per-JWT-subject rate limiting, MCP-session-to-subject binding, the
context-token gate and audit capture; `:55`–`:59` mounts none of them. A classification that did not carry
the transport would be simultaneously true and false for half of `BND-S4-2`'s content, which fails C1 and
C4 at once.

The stand-ins are named here, in the rationale, not only in Evidence: `BND-S4-1` and `BND-S4-2` exist
because **`A-27`** predicts a rich authenticated learner-facing web surface, and `BND-S4-5` exists because
**`A-29`** predicts a bounded, expiring, revocable handoff envelope to an external MCP client.

## Rejected alternatives

| Alternative | The specific consequence that decided against it |
| --- | --- |
| **Two classes — trust and not-trust.** | `BND-S4-9`, `BND-S4-10`, `BND-S4-12`, `BND-S4-13` and `BND-S4-15` all collapse into "not-trust", and the obligation they actually carry — *the caller must handle absence* — vanishes from the model. That obligation is the one that bites in this system today: the logging sinks **drop entries outright while a breaker is open** (`SC-S3-25`), and the Tier-2 classifier pass lands **after** the unit is committed (`src/orchestration/audit-pipeline.ts:174`). Five rows of real, actionable content would be lost. |
| **Network boundary equals trust boundary.** | `BND-S4-12` (Postgres over a socket) becomes a trust boundary, implying the core must treat its own store of record as hostile — an obligation nobody should implement. And it gets `BND-S4-17` exactly backwards: STDIO is a trust boundary with **no network at all**. Fails C1 and C2. |
| **Classify by data sensitivity.** | The class then depends on the payload, so it changes whenever a payload changes, and it yields no owner at all (C3). It also cannot classify `BND-S4-6`, across which the only thing that crosses is a public key set. |
| **Classify by organizational ownership (who operates each side).** | Gets `BND-S4-17` wrong — both sides are the operator's code — and gets `BND-S4-6` wrong in the other direction, since the identity provider is operated *for* the operator yet is trusted only for a verified signature. Fails C1. |
| **Defer classification to each consuming sub-task.** | This is precisely the programme's Critical risk: two implementation charters classifying the same pair differently, with the divergence surfacing in production. The package exists to prevent it. |
| **Owner = the component that initiates the call.** | `BND-S4-1` would be owned by the browser and `BND-S4-3` by the external source site — the two parties in the whole model that the operator most explicitly does not control. Fails C3 on its face. |
| **Omit `BND-S4-17`, or downgrade it to "process", because nothing enforces it.** | Publishing a boundary set in which an unenforced trust boundary is invisible is worse than publishing no set: a downstream charter reading §4.2 would conclude the tool surface is uniformly gated. The three benchmark journeys are dogfooded across exactly this boundary (`F-S4-5`). |
| **Publish only the four trust boundaries the charter enumerates.** | `BND-S4-5` and `BND-S4-6` meet the test and carry real obligations — envelope revocation under `A-29`, and issuer-allowlisted signature verification. Suppressing them to match a list would make the list, rather than the rule, the authority. |

## Consequences

- **Every protection claim in this package now carries a transport qualifier.** A downstream sub-task
  that writes "the tool surface is authenticated" without one is writing something false.
- **Treating STDIO as "the same system with fewer features" is foreclosed.** It is a distinct component
  (`CMP-S4-5`) across a distinct, unenforced trust boundary.
- **Introducing a call between two components not already paired in §4.2 costs a classification.** §4.3's
  completeness argument is structural, so a new flow creates an unclassified boundary by construction.
- **`BND-S4-12` and `BND-S4-13` are explicitly *not* security boundaries.** No sub-task should spend
  hardening budget on them; the obligation there is absence-handling, and for `BND-S4-13` specifically it
  is that the request path must not depend on log delivery.
- **Migration path, in exactly one place:** if a future transport mounts the protections uniformly,
  `BND-S4-17` closes and `F-S4-5` resolves without any other row changing.

## Evidence

- `src/transport/main.ts:46`, `:55`–`:59` — the transport split that forces the rider.
- `src/transport/http.ts:99`–`:111` (origin allowlist, rejecting only when an `Origin` header is present,
  and a no-op without an auth configuration), `:48`–`:65` (MCP-session-to-subject binding),
  `:167`–`:170` (per-JWT-subject rate limiting, mounted only when auth is enabled).
- `src/transport/jwt-middleware.ts:90` (JWKS fetched from the issuer), `:114` (verification under an
  issuer allowlist), `:127` (JWT subject resolution) — `BND-S4-6`'s content.
- `src/transport/context-token-middleware.ts:5`–`:9` — the three exempt tools; the gate is HTTP-only.
- `src/transport/pg-audit-transport.ts:45`–`:52`, `pg-event-transport.ts:41`–`:48` — the buffered,
  breaker-guarded sinks that make `BND-S4-13` a process boundary.
- `src/orchestration/audit-pipeline.ts:174` (post-commit Tier-2 pass), `:165`–`:191` (fail-open on the
  circuit breaker) — `BND-S4-15` and `BND-S4-4`'s content.
- `../03_execution-environment-and-citation-drift-component.md` §3.5 (first-party creator-authored code,
  isolation for liveness), §4.2–§4.3 (NEU-972, merged 2026-08-21).
- `../04_state-category-inventory.md` `SC-S3-25` (buffered entries dropped while a breaker is open),
  `SC-S3-43`, `SC-S3-44`.
- `../93_stand-in-assumption-register.md` **`A-27`**, **`A-29`** — both named in the Rationale itself.
- `../01_outcome-register.md` `OUT-1` — the four trust boundaries the charter enumerates.

## Revision trigger

Either of these **observable events** reopens this record:

1. **A merged change that mounts auth, origin checking, rate limiting or the context-token gate on the
   STDIO branch of `src/transport/main.ts`.** That closes `BND-S4-17`, resolves `F-S4-5`, and removes the
   reason `CMP-S4-4` and `CMP-S4-5` are two components.
2. **`SUB-6 (NEU-976)` publishing an ownership model in which the web tier writes a database schema the
   MCP core also writes.** That turns `BND-S4-16` from undecided into a real row, and §4.4's disjointness
   constraint from a condition into a finding.
