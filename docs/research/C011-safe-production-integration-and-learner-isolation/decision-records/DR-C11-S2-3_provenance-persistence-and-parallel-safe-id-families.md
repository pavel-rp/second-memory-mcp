# `DR-C11-S2-3` — Claim provenance is carried as a separate discriminator rather than re-derived or encoded into the key; and three shared id families are scoped to the authoring sub-task so fifteen authors never negotiate a number

**Task:** NEU-994 (SUB-2) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `86fb38a`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-6 (`../90_outcome-register.md`) — *"whether the persisted and in-flight identity records **which claim it came from**"*, and the clause requiring the package to state where provenance is stored, who may read it and what a consumer may conclude. Its second half is house-style, in the shape `DR-C11-S1-3` established.

This record carries two decisions. They are filed together because both answer the same question —
*how does a fact travel to a reader who cannot see the context that produced it?* — once for a
principal's kind and once for a register id under parallel authoring.

## Decision

### A. Provenance is carried, as a separate field, at every hop

1. **The resolved identity records which claim it came from, in flight and at rest.** The principal
   kind `DR-C11-S2-2` determines is not recomputed by each consumer; it travels with the value.
2. **It is a separate field, never encoded into the key string.** No `user:<sub>` / `client:<azp>`
   prefixing, no sentinel value, no parsing a discriminator back out of an identifier.
3. **Where it is stored.** In flight, alongside the resolved subject at the transport edge —
   conceptually a second member beside `res.locals.auth.sub` (`src/transport/jwt-middleware.ts:133`–`:136`).
   At rest, on the **`context_tokens` binding** that `DR-C10-S8-2` obligates and that **SUB-4**
   (`NEU-996`) designs. It is **not** duplicated onto every owned row: `NEU-850`'s `OUT-2` fixes one
   ownership column, and under `DR-C11-S2-2` a row can only ever be owned by a `user`-kind
   principal, so a per-row discriminator would carry exactly one value and no information. Naming
   the storage site is this record's job; designing the column is SUB-4's and SUB-13's.
4. **Who may read it.** Every component that makes an authorization or ownership decision, plus the
   attribution path OUT-15 designs. It is server-held throughout and is never returned to a caller,
   never accepted from one, and never placed in a tool argument or response — `DR-C10-S8-2`'s
   forgeability position applies to the discriminator exactly as it does to the identity.
5. **What a consumer may conclude from it.** Exactly this: **`user` means the token carried a `sub`
   claim; `client` means it did not and carried an `azp`.** It may *not* conclude that a `user`-kind
   principal is a natural person — that is `OI-S1-2` / `A-S2-1`, still open. The discriminator records
   the **claim** the identity came from, which is what `I5` asks for; it does not certify humanity,
   and any design that reads it as certifying humanity is misreading it. This limit is stated here
   because it is the most available misreading of the field.

### B. Three shared id families are scoped to the authoring sub-task, for parallel-safe authoring

6. **A risk this sub-task raises itself is `R-S2-<k>`, not `R<n>`.** `R<n>` stays reserved for the
   fifteen rows of the charter's § Risks table, exactly as `DR-C11-S1-3` fixed it. **No row of that
   table names OUT-1, OUT-5 or OUT-6 as its owning outcome** (charter assumption 48), so SUB-2
   authors **zero** `R<n>` entries — and its residual exposures, which are real, need an id the rule
   does not supply.
7. **A completeness-gate row authored by a sub-task is `G-S2-<k>`, not the next free `G<n>`.**
   SUB-1 took `G-1` … `G-15` as a flat run.

8. **A stand-in assumption authored by a sub-task is `A-S2-<k>`, not a charter-continued `A-<n>`.**
   `../95_stand-in-assumption-register.md`'s opening convention makes the stand-in for charter
   assumption 33 `A-33`. That is not collision-free either: two sub-tasks standing in for two
   different charter assumptions concurrently cannot both compute "the next number" without seeing
   each other's work. The entry still names **which charter assumption it stands in for** in its
   `Assumption:` field, so the pointer the charter-continued scheme existed to provide is preserved —
   it simply lives in a field rather than in the id. **SUB-1's `A-33` and `A-34` are not
   renumbered**, and reconciling the two schemes across the package is **SUB-14's** (NEU-1007).

All three follow the existing `F-S<n>-<k>` / `OI-S<n>-<k>` / `CAP-S<n>-<k>` / `SPK-S<n>-<k>` shape,
so no new convention is invented — three families that were package-global are brought into line
with the four that are already sub-task-scoped.

**Why this record changed after it was first written.** Clauses 6 and 7 were authored on the
reasoning below. Clause 8 was added when a **concurrently shipping sibling sub-task independently
hit the same hazard on the assumption family** and adopted the same sub-task-scoped shape. That is
corroboration rather than coincidence: the collision is a property of parallel authoring against
append-only shared registers whose conflict rule is *keep both sides*, so it reaches **every**
package-global id family, not the two SUB-2 happened to notice first. Recording the sequence keeps
the reasoning honest rather than presenting clause 8 as foreseen.

## Rationale

**On A — re-derivation is not available, and encoding is a trap.** A consumer that wants to know a
principal's kind has three options: read it, recompute it, or parse it. Recomputing requires the
original token, which exists only at the transport edge and is gone by the time any port-boundary
check runs — C010 records that the resolved value reaches exactly two transport-local consumers and
nothing in `src/orchestration/`, `src/ports/`, `src/adapters/` or `src/domain/` (charter assumption
12). So re-derivation is not a design choice here; it is unavailable. Parsing a discriminator out of
a composite key is available and is worse: it makes the key's *format* load-bearing, so any subject
value containing the delimiter becomes a correctness bug, and it silently breaks
`DR-C11-S2-1`'s "written verbatim" rule the moment anything writes the composite into `user_id`.
Carrying a separate field is the only option that leaves the key untouched.

**On A — this is what makes `I5` answerable rather than merely answered.** `I5` asks whether the
kind is *determined*. `DR-C11-S2-2` determines it; if the determination then evaporates one hop
later, the check is satisfied at the edge and unanswerable everywhere it actually matters — which is
the state `OI-S5-2` describes when it says *"nothing downstream re-derives the distinction"*
(`../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:216`).
Determination and propagation are one decision split across two records.

**On A — the storage site follows from a consumed decision, not a preference.** `DR-C10-S8-2` binds
the principal to the `context_tokens` row at mint time, server-side, because an identity a caller can
assert is not an identity. The kind is part of that identity, so it binds in the same place, at the
same moment, under the same argument. Putting it anywhere else would create a second identity
channel with a different forgeability story.

**On A — stating the negative is the substance of clause 5.** OUT-6 asks what a consumer *is
entitled to conclude*. The honest answer is narrower than the field's name suggests, and the gap
between "carries a `sub` claim" and "is a human being" is precisely the gap `OI-S1-2` never closed.
Writing the entitlement down is what stops nine downstream sub-tasks each quietly widening it.

**On B — this applies `DR-C11-S1-3`'s own stated reason to the families it left flat.** That record
rejected *"let each author pick the next free `R<n>`"* because it *"requires seeing the other
fourteen entries first, which no author can do"*, and fixed `R<n>` to the charter row so a missing
entry is detectable **by number**. The reasoning is sound and it simply does not reach two cases:
a risk with no charter row, and a gate row (`G<n>` was never bound to anything). Both are live right
now — two sibling sub-tasks are authoring against this same register set concurrently and cannot see
each other's work — so a next-free-number pick is not a theoretical collision but the expected
outcome. Scoping the id to the sub-task makes it computable from the charter alone, which is the
property `DR-C11-S1-3` was protecting.

**On B — the alternative of raising no risks was considered and rejected on principle.** SUB-2 could
have avoided the id question entirely by declining to raise non-charter risks. That would keep the
register tidy and lose three real residual exposures, which is the *"a finding softened into a
paragraph is a lost finding"* failure the charter names. An id problem is not a reason to under-report.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Do not carry provenance; re-derive the kind wherever it is needed.** | Not available. The token exists only at the transport edge and the resolved value reaches nothing below it (charter assumption 12), so there is nothing to re-derive from. It also leaves `I5` unanswerable at every point past the edge, which is the state `OI-S5-2` already records. |
| 2 | **Encode the kind into the key string — `user:<sub>`, `client:<azp>`.** | Needs no new field and is self-describing, which is the appeal. It makes the key's *format* load-bearing (any subject containing the delimiter is a bug), breaks `DR-C11-S2-1`'s verbatim rule, and forces every reader to parse before comparing. A field that must be parsed to be trusted is not a determination. |
| 3 | **Carry provenance in flight only; persist nothing.** | The cheapest option, and it survives right up until an audit asks what kind of principal wrote a row. `I5` is then evaluable per-request and unanswerable historically, and OUT-15's attribution design would have no stored discriminator to attribute against. |
| 4 | **Persist the discriminator on every owned row** alongside `user_id`. | Rejected as informationless rather than wrong: under `DR-C11-S2-2` only a `user`-kind principal can own a row, so the column would carry one value on every row forever. It also multiplies `NEU-850`'s single ownership column into two per table, which is a schema change nobody argued for. |
| 5 | **Expose the kind to callers**, e.g. on a tool response, so clients can adapt. | Directly contradicts `DR-C10-S8-2`'s forgeability position and creates a caller-visible identity surface the compatibility contract (OUT-16) would then have to guarantee. Nothing in scope needs it. |
| 6 | **Keep `R<n>` flat and take the next free numbers (`R16`, `R17`, `R18`).** | The obvious choice, and it collides. Two siblings are authoring right now against the same file with no view of each other, so "next free" is computed from a different set by each — the exact failure `DR-C11-S1-3` rejected alternative 4 for. |
| 7 | **Raise no non-charter risks**, so no new risk id is needed. | Would make the id question disappear by discarding three stated residual exposures. That is the *"report as a finding; never absorb into prose"* rule broken for the convenience of a numbering scheme. |
| 8 | **Defer the id families to SUB-14 at assembly.** | SUB-14 aggregates and authors nothing (charter assumptions 46, 47). Handing it unnumbered entries would require it to author ids, which is the rule it exists to preserve. |
| 9 | **Keep the charter-continued `A-<n>` form** — file this sub-task's stand-in as `A-35`, since it stands in for charter assumption 35. | **This was the original text of this record, and it was wrong.** The id looks computable — charter assumption 35 gives `A-35` — but the computation is only unique if no other sub-task is standing in for a *different* charter assumption at the same time, and two were. Because a merge conflict in `../95_stand-in-assumption-register.md` resolves by **keeping both sides**, the collision would not fail loudly; it would land two rows sharing one id in a register whose whole purpose is that each assumption is separately accountable. The pointer back to the charter assumption is preserved in the entry's `Assumption:` field, so the scheme's actual benefit costs nothing to give up. |

## Consequences

1. **`I5` is answerable at every hop, not only at the edge**, which is what OUT-6 asks for and what
   makes the check usable by SUB-5's enforcement design rather than only by an auditor at the door.
2. **SUB-4 (`NEU-996`) inherits a named obligation**: the `context_tokens` binding it designs carries
   the kind as well as the key. It receives the requirement, not the column definition — SUB-13
   (`NEU-1006`) authors the DDL.
3. **No per-row schema change beyond `NEU-850`'s `OUT-2`.** The ownership column stays exactly as
   `OUT-2` specifies, so no amendment is routed to `NEU-895`. That check is recorded in the chapter
   so SUB-17's audit can see it ran and returned empty.
4. **A reader of the discriminator is bounded by clause 5** and must not treat `user` as *human*.
   Every downstream sub-task that reads the kind inherits `A-S2-1` with it.
5. **`R-S2-<k>`, `G-S2-<k>` and `A-S2-<k>` enter the package's id vocabulary.** SUB-14 aggregates
   them like any other family; the risk register gains a stated reason why SUB-2 contributes zero
   `R<n>` rows, so its absence there reads as correct rather than as a routed gap against SUB-2.
6. **The stand-in register now carries two id schemes at once** — SUB-1's charter-continued `A-33` /
   `A-34` and the sub-task-scoped `A-S2-1` — and SUB-2 deliberately does **not** reconcile them,
   because renumbering another sub-task's entries is exactly what the append-only rule forbids.
   Reconciliation is **SUB-14's** (NEU-1007). The divergence is stated at the head of SUB-2's own
   section so a reader meets it there rather than inferring it from two id shapes in one file.
7. **SUB-14 may supersede B entirely**, exactly as `DR-C11-S1-3` says of its own conventions. The
   cost is a mechanical rename plus a citation re-check.
8. **What becomes harder:** the package now carries two id shapes in each of two registers — `R<n>`
   versus `R-S2-<k>` for risks, and `A-<n>` versus `A-S2-<k>` for stand-ins. A reader must know
   which is which, and each register's own SUB-2 section header is where that is stated.

## Evidence

| Claim | Source |
| --- | --- |
| The fallback records no trace of which claim it came from, and nothing downstream re-derives it. | `../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:216` |
| `I5` requires the kind to be *determined rather than assumed*. | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174` |
| The principal binds to the `context_tokens` row at mint time, server-side, on a forgeability argument. | `../../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md` |
| `context_tokens` carries exactly `id`, `created_at`, `expires_at` today — no principal column exists to bind to. | `../91_findings-register.md` § `F-S1-1`; `src/infrastructure/db/schema.ts` |
| The resolved identity reaches only two transport-local consumers and nothing below the transport. | Charter assumption 12; `src/transport/http.ts`, `src/transport/rate-limit-middleware.ts` |
| The identity value is set at the transport edge as `res.locals.auth`. | `src/transport/jwt-middleware.ts:133`–`:136` |
| `NEU-850`'s `OUT-2` fixes a single ownership column keyed to the JWT subject. | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:51` |
| `R<n>` is the charter § Risks row number, and a next-free-number scheme was rejected because no author can see the others' entries. | `DR-C11-S1-3_package-house-style.md` § Decision 3 and § Rejected alternatives 4; `../92_risk-register.md` § "Id convention" |
| No charter § Risks row names OUT-1, OUT-5 or OUT-6 as its owning outcome. | C011 charter assumption 48; the fifteen-row mapping reproduced at `../92_risk-register.md` |
| SUB-1 took `G-1` … `G-15` as a flat run and recorded only its own rows. | `../97_package-completeness-gate.md` |
| `A-<n>` is defined as continuing the charter's assumption numbering, and SUB-1 authored `A-33` / `A-34` under it. | `../95_stand-in-assumption-register.md` § "Id convention"; `DR-C11-S1-3_package-house-style.md` § Decision 3 |
| A merge conflict in any shared register resolves by **keeping both sides**, so an id collision lands two rows rather than failing loudly. | `../95_stand-in-assumption-register.md`, `../92_risk-register.md`, `../97_package-completeness-gate.md` — each carries the shared-register append convention verbatim |
| SUB-14 aggregates registers and authors no entry. | C011 charter assumptions 46, 47 |

## Revision trigger

1. **SUB-4 (`NEU-996`) finds the `context_tokens` binding cannot carry the discriminator**, which
   would move the storage site and reopen clause 3.
2. **`DR-C10-S8-2` is amended** so the principal no longer binds at mint time — the kind follows the
   identity and moves with it.
3. **A learner-owned row becomes ownable by a `client`-kind principal** (i.e. `DR-C11-S2-2`
   decision 3 is revised), at which point rejected alternative 4 stops being informationless and a
   per-row discriminator becomes live.
4. **`OI-S1-2` closes** and the human-versus-machine question is settled on observed evidence,
   which may permit clause 5's entitlement to widen.
5. **SUB-14 (`NEU-1007`) renumbers or supersedes any of the three id families**, or reconciles the
   two stand-in schemes now coexisting in `../95_stand-in-assumption-register.md`, at assembly. That
   is the expected path, not an exception.
6. **The charter's § Risks table gains a row owned by OUT-1, OUT-5 or OUT-6**, which would give SUB-2
   a charter `R<n>` after all and change what B is compensating for.
