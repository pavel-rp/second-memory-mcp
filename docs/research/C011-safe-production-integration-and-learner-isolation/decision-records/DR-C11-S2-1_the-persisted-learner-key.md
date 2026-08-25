# `DR-C11-S2-1` — The persisted learner key is the `sub` claim alone, written verbatim; `azp` is never a learner key

**Task:** NEU-994 (SUB-2) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `86fb38a`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-1 (`../90_outcome-register.md`) — *"which token claim becomes the learner key, and what that key means"*, and the clause requiring the `payload.sub || azp` fallback to be resolved into a rule rather than inherited.

## Decision

1. **The persisted learner key is the value of the OIDC `sub` claim, verbatim.** It is written
   unchanged into the ownership column `NEU-850`'s `OUT-2` fixes — `user_id`, `NOT NULL`, on every
   core table — with no hashing, prefixing, casing change, trimming or other normalization.

2. **`azp` is never a learner key.** It identifies the authorized party — an OAuth client — and no
   value of `azp` ever becomes the owner of a learner-owned row, under any principal shape.

3. **A token carrying no usable `sub` yields no learner key at all.** It does not fall through to
   `azp`. What such a principal *may* do is `DR-C11-S2-2`'s subject, not this record's; this record
   fixes only that it owns nothing.

4. **The rule is shape-independent.** It is applied identically to a `client_credentials` grant, a
   pre-registered static client and a DCR client with `aud = dyn$<random>`. Which claim becomes the
   key never depends on the audience shape.

This replaces `const subject = (typeof payload.sub === 'string' && payload.sub) || azp || undefined;`
(`src/transport/jwt-middleware.ts:127`) **as the definition of ownership**. It does not require that
line to change — no file under `src/` is modified by this package — and the two existing consumers
of `res.locals.auth.sub`, the session-binding map in `src/transport/http.ts` and the rate-limit key
in `src/transport/rate-limit-middleware.ts`, are transport-local concerns that this record does not
disturb. What changes is that a *persisted* owner is no longer permitted to be whatever that
expression happened to return.

## Rationale

**The fallback is not a rule; it is the absence of one.** `payload.sub || azp` yields a single
opaque string that records no trace of which claim produced it, so two materially different
principals — a person and a machine — become indistinguishable downstream. C010 recorded exactly
this as `OI-S5-2`
(`../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:216`):
the expression *"collapses two materially different principals … into one opaque string that records
no trace of which claim it came from, and nothing downstream re-derives the distinction."* An
ownership column keyed to that expression would inherit the collapse into persisted state, where it
is far more expensive to unwind than at the edge.

**`sub` is the only claim that is *about* the end-user.** In OIDC, `sub` is the subject identifier —
the authenticated end-user at the issuer. `azp` is the authorized party: the client the token was
minted for. Keying learner ownership to `azp` would mean that every learner arriving through the
same connector client shares one owner, which is not isolation but its opposite. That consequence
holds regardless of what any production token turns out to contain, which is why this limb of the
decision does not wait on evidence.

**Verbatim, because `NEU-850` says "keyed to the JWT subject".** C010 records
(`../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`)
that `NEU-850`'s `OUT-2` decided ownership *"lives in the MCP core database schema, keyed to the JWT
subject: a `user_id` column, `NOT NULL`, on every core table"*. A derived key — a hash, a prefix, a
lowercased form — is no longer *the* JWT subject, and any transform introduces a second identity
space that some later component must map back. Storing the claim unchanged keeps one identity space
and keeps `NEU-850`'s decision honoured rather than reinterpreted. This is a consumed constraint,
cited and not re-argued (charter assumption 1).

**Shape-independence is what makes the rule deliverable at `n = 0`.** SUB-1 obtained no token for any
of the three shapes (`../96_spike-register.md`, nine entries, `Result: not executed`; `../91_findings-register.md` § `F-S1-2`).
If the rule keyed off the audience shape, it could not be written without observing the shapes. It
keys off the presence of `sub` instead, so the rule is total today and what remains unconfirmed is
only **which branch each shape populates** — never whether a branch exists, and never what happens
in it. That distinction is the chapter's central move and it is recorded here rather than left
implicit.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Keep `sub \|\| azp` and persist whatever it returns.** | The status quo. It is the defect `I5` exists to catch, and persisting it moves the principal-kind collapse from the edge — where C010 can still see it — into the ownership column, where every downstream read inherits it. Rejected outright. |
| 2 | **Use `azp` as the key when `sub` is absent, but record a flag saying so.** | Superficially attractive because it keeps every principal owning *something*. But it makes a machine identity the owner of learner-owned rows, and a flag on the row does not undo that — the isolation invariant is stated over *whose* rows they are, not over how they are labelled. It also creates rows that no human can ever export or erase, which OUT-11 and OUT-12 would then have to carve out. |
| 3 | **Key on a derived value — `sha256(sub)` or a locally minted surrogate id.** | Adds a second identity space with no stated benefit at this scale, breaks the operator's ability to correlate a row with an IdP subject during an incident, and stops the column being *"keyed to the JWT subject"* in `NEU-850`'s sense without an amendment nobody has argued for. A surrogate becomes right only when subjects must be re-mapped across issuers, which is Phase 2 (`NEU-850` / `NEU-858`), not here. |
| 4 | **Key on `email`.** | `email` is already read, optionally, at `src/transport/jwt-middleware.ts:135`, so it is the nearest at-hand human-looking value. It is also mutable, absent on most machine tokens, not guaranteed unique over time, and re-assignable — an address released and re-issued to a different person would silently transfer that person's entire learning history. Rejected on the same re-use exposure the chapter records as a risk for `sub`, only far more likely. |
| 5 | **Composite key `iss` + `sub`.** | **The closest alternative, and the one that is strictly more correct in general.** OIDC guarantees subject uniqueness only *within* an issuer, so `(iss, sub)` is the properly-scoped identity. It loses here only because ADR-0001 fixes this deployment as **one dedicated AS serving one resource** (`docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md`), so `iss` is a constant and the composite adds a column with exactly one distinct value. It is recorded rather than dismissed: ADR-0001's own safety premise names the multi-resource / hosted-AS migration as what invalidates that reasoning, and this record's revision trigger 3 fires on it. |

## Consequences

1. **A principal with no `sub` owns no rows.** That is a real behavioural position, not a gap, and it
   has to be paid for somewhere: `DR-C11-S2-2` pays for it by deciding what such a principal may
   still do, and the chapter records the deploy pipeline's `client_credentials` smoke run as the
   concrete instance.
2. **Rows already in production have no owner and cannot acquire one from this record.** Choosing a
   target subject for existing rows is SUB-6's (`NEU-1000`), and it now has a rule to target
   *against* — but the rule alone does not tell it which `sub` value the operator authenticates as,
   because no token was observed. It inherits `A-35` and C011's `OI-S1-1` … `OI-S1-3` with it.
3. **The key's stability, uniqueness and re-issue behaviour under Rauthy are not established by this
   record and cannot be** — nothing in the repository states them. They are routed as `OI-S2-1` with
   spike `SPK-S2-1`, and the re-use exposure is carried as `R-S2-1`. Choosing `sub` is sound
   independently of the answer; what the answer changes is the *severity* of the re-use case, not
   the choice.
4. **`email` stays a non-identifier.** Its optional read at `src/transport/jwt-middleware.ts:135`
   remains a convenience field; no downstream design may treat it as an owner, and OUT-9's inventory
   will classify it as learner-derived personal data like any other.
5. **What becomes harder:** a future migration to a hosted multi-tenant AS (`NEU-850` / `NEU-858`)
   will have to widen the key to include the issuer, and by then the column will hold real values.
   Alternative 5 is the pre-argued form of that change, so the migration inherits a recorded position
   rather than a fresh debate.

## Evidence

| Claim | Source |
| --- | --- |
| Identity is resolved as `payload.sub \|\| azp` and 401s when neither resolves. | `src/transport/jwt-middleware.ts:127`, `:129`–`:131`, read at cutoff `86fb38a` |
| `email` is read optionally at the same site and is not used for identity. | `src/transport/jwt-middleware.ts:135` |
| Exactly two consumers read the resolved value, both transport-local. | `src/transport/http.ts`, `src/transport/rate-limit-middleware.ts`; charter assumption 12 |
| The fallback collapses two principals into one opaque string with no provenance. | `../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:216` (`OI-S5-2`) |
| `NEU-850`'s `OUT-2` keys ownership to the JWT subject via `user_id NOT NULL` on every core table. | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:51`; consumed as a decision, never as an existing schema fact |
| The deployment is a single dedicated AS serving a single resource, and that premise is what makes a bare `sub` sufficient. | `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md` § "Safety premise and what would change this decision" |
| No token was observed for any principal shape, so no limb of this decision rests on one. | `../96_spike-register.md` (`SPK-S1-1` … `SPK-S1-3`, `Result: not executed`); `../91_findings-register.md` § `F-S1-2`; `../94_caps-and-incomplete-scope.md` § `CAP-S1-1` |

## Revision trigger

1. **A production token is observed whose `sub` is present but is not stable per learner** — for
   example a per-session subject. That would falsify the key's suitability directly and reopens this
   record, not merely `OI-S2-1`.
2. **`NEU-850`'s `OUT-2` is amended** so that ownership is no longer keyed to the JWT subject. The key
   here is downstream of that decision and follows it.
3. **ADR-0001's safety premise expires** — the AS becomes multi-resource or multi-tenant, or the
   deployment migrates to a hosted AS (`NEU-850` / `NEU-858`). Rejected alternative 5 becomes the
   live option and the key widens to `(iss, sub)`.
4. **Rauthy changes what it puts in `sub`** for any of the three principal shapes, including
   beginning to populate `sub` on a `client_credentials` grant — which would make kind determination
   by `sub`-presence unsound and reopens `DR-C11-S2-2` with it.
