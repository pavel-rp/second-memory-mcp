# S4 — The STDIO identity gate and the bound context token

**Sub-task:** SUB-4 (NEU-996) · **Covers:** OUT-7, OUT-13
**Written:** 2026-08-25 · **Model:** claude-opus-5[1m]
**Codebase cutoff:** `origin/develop` @ `5111841`

Every row resolves into `docs/research/`. Chapter references are to
`../04_the-stdio-identity-gate-and-the-bound-context-token.md`.

---

## OUT-7 — An identity gate on the transport that has none, so check `I4` can pass on both

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| OUT-7 | STDIO carries no authentication, no origin check, no rate limit, no audit and no context-token gate, and the position is stated in the source itself | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §1.1 | Repository read — `src/config/resolve-auth-config.ts:2`, `:105`; `src/config/resolve-rate-limit-config.ts:31`; `src/transport/http.ts:108`, `:123`, `:164`, `:173`, `:180`, `:186` | `confirmed` | — |
| OUT-7 | There is no STDIO transport module; the path is four inline lines and both middlewares are Express-typed, so the gate is a rewrite rather than a mount | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §1.2; `F-S4-4` | Repository read — `src/transport/main.ts:55`–`:59`; `src/transport/audit-middleware.ts:23`; `src/transport/context-token-middleware.ts:43` | `confirmed` | The cost is unpriced by `CC-S8-3`'s classification; handed to `SUB-10 of C010 (NEU-984)` |
| OUT-7 | `TRANSPORT` defaults to `stdio`, so the ungated transport is the default rather than an opt-in minority path | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §1.3; `F-S4-2` | Repository read — `src/config/resolve-transport-config.ts:35` | `confirmed` | — |
| OUT-7 | The production learner arrives on a static client, not DCR, so no self-registration path exists for a STDIO client and the audience carries no learner information | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §2 | Consumed — `F-S2-1` (`../91_findings-register.md`); `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:63`–`:67` | `consumed` | Whether `claude-web` tokens carry a human `sub` is `OI-S2-2`, still open |
| OUT-7 | The gate is closed: STDIO is gated, its principal is server-held configuration, and an unconfigured deployment refuses every gated tool rather than falling open | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §3; `../decision-records/DR-C11-S4-1_the-stdio-identity-gate.md` | Design derivation over the two consumed rules (`DR-C10-S8-2` clause 2; `DR-C11-S2-2`) | `confirmed` | Nothing is implemented — `CAP-S4-1` |
| OUT-7 | "Leave STDIO ungated" is argued and rejected on the invariant, not on preference | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §3.1; `DR-C11-S4-1` rejected alternative 1 | Consumed — `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:482`–`:485` | `confirmed` | — |
| OUT-7 | Check `I4` no longer fails under the proposed gate, with the per-process-singleton residual named and owned | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §10.1 | Design derivation against `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:172` | `confirmed` | Not a `holds` verdict — `I3` is SUB-5's. Audit parity is a separate residual (`R-S4-4`). Singleton limit is `R-S4-3` |
| OUT-7 | All seven existing STDIO client paths are classified, two broken deliberately, with the largest broken class being the default invocation | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §9 | Repository read plus design derivation | `confirmed` | — |
| OUT-7 | The change is breaking and unavoidably so, staged over four stages whose two ordering constraints are stated; the schedule is SUB-7's | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §9.1 | Consumed — `../../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md:552`; `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:487`–`:496` | `confirmed` | The schedule itself is `OUT-3`, SUB-7's |
| OUT-7 | `BND-S4-17` is dispositioned **resolved here**, naming `SUB-10 of C010 (NEU-984)` co-named `NEU-896`, citing `OI-S8-2`'s resolving event and firing its limb one | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §11 | Consumed — `../../C010-system-and-repository-architecture/05_system-context-and-responsibility-boundaries.md:197`; `../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:429` | `confirmed` | Whether `OI-S8-2` thereby closes is `SUB-10 of C010 (NEU-984)`'s to record |
| OUT-7 | `OI-S8-2` and `CC-S8-3` are routed to their actual owner as supplied-to, never claimed | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §9.2 | Consumed — `../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:428`, `:614` | `confirmed` | — |

---

## OUT-13 — Context-token use under C010's token-bound identity decision

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| OUT-13 | The row carries exactly three columns today and the gate checks existence and expiry only, so any bearer of any live id passes | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §1.4 | Repository read — `src/infrastructure/db/schema.ts:312`–`:321`; `drizzle/0014_create_context_tokens.sql`; `src/transport/context-token-middleware.ts:43`–`:88`; `src/adapters/drizzle/context-token-repository.ts:39`–`:55` | `confirmed` | — |
| OUT-13 | The row gains `principal_id`, `principal_kind` and `principal_claim_source`, written at mint time, with the identifier a learner key if and only if the kind is `user` | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §4; `../decision-records/DR-C11-S4-2_what-the-context-token-row-carries.md` | Design derivation over `DR-C11-S2-1`, `DR-C11-S2-2`, `DR-C11-S2-3` and `DR-C10-S8-2` clauses 1–3 | `confirmed` | The rule cannot be enforced by the schema — `R-S4-1`, owner SUB-5 (NEU-997) |
| OUT-13 | Nullability is staged because a `NOT NULL` column cannot be added over live unbound rows without grandfathering | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §4; `DR-C11-S4-2` clause 5 | Design derivation over `DR-C10-S8-2` clause 4 | `confirmed` | The DDL and migration plan are OUT-19's artifacts |
| OUT-13 | `init_agent_context` obtains a principal per transport, and refuses to mint where there is none | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §5 | Consumed — `DR-C10-S8-2` clause 2; repository read `src/server/server-context-tools.ts:21`, `:33`; `src/transport/jwt-middleware.ts:129`–`:136` | `confirmed` | — |
| OUT-13 | A configured STDIO principal satisfies `I5` because configuration is server-held state, and its kind is declared rather than assumed | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §5, §10.3 | Design derivation against `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174` | `confirmed` | It certifies no human, exactly as `principal_kind = 'user'` does not — `DR-C11-S2-2`'s limitation inherited |
| OUT-13 | Mint, use, expiry, purge and cutover each have a defined behaviour on both transports and in the unconfigured case | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §6 | Design derivation | `confirmed` | — |
| OUT-13 | The only bulk purge is dead code, and the live per-row delete inside validation is not a purge | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §1.5, §7; `F-S4-1` | Repository read — `src/ports/context-token-repository.ts:6`; `src/adapters/drizzle/context-token-repository.ts:61`, `:39`–`:55`; zero call sites in `src/` at `5111841` | `confirmed` | — |
| OUT-13 | The purge is wired at the mint path, chosen for being transport-agnostic; a timer is a recommended addition, never the primary | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §7; `../decision-records/DR-C11-S4-3_expiry-purge-and-the-cutover-rejection-rule.md` | Design derivation | `confirmed` | Whether a failed sweep may fail a mint is left to OUT-19 as a stated reading |
| OUT-13 | Four classes of token are rejected at cutover, the deploy pipeline's `client_credentials` smoke principal named explicitly and distinguished from the one-time unbound class | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §8; `F-S4-3`; `R-S4-2` | Repository read — `.github/workflows/cd-prod.yml:145`–`:174`; `tests/smoke/smoke.test.ts:192`, `:207`, `:239` | `confirmed` | The population of class C1 is **not observed** — `A-S4-1`, resolving through `OI-S1-7` / `SPK-S1-7` |
| OUT-13 | The design adds no per-call identity argument; the context token is a per-call argument but not an identity assertion, and the distinction is stated | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §10.4; `F-S4-5` | Consumed — `DR-C10-S8-2` rationale; repository read `src/transport/context-token-middleware.ts:62` | `confirmed` | — |
| OUT-13 | `I2` is satisfied for `context_tokens` itself and consumed unchanged for every other category | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §10.2 | Design derivation against `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:171` | `confirmed` | Every other category still turns on `NEU-850`'s `OUT-2` |
| OUT-13 | `OI-S8-1`'s mechanism is supplied and the item remains open, because its resolving event is code this package may not write | `../04_the-stdio-identity-gate-and-the-bound-context-token.md` §9.2 | Consumed — `../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:418` | `confirmed` | Remains open, owner `SUB-10 of C010 (NEU-984)` co-named `NEU-896` |

---

## What this file does not establish

- **That any state category reaches `holds`.** `I3` is SUB-5's (`OUT-8`) and the ordered checks mean
  no verdict follows from `I4` alone. C010's `F-S5-4` census is unmoved by this sub-task.
- **That the gate or the binding works.** Nothing is implemented; every row above whose evidence
  class is *design derivation* is an obligation on unwritten code, exactly as `DR-C10-S8-2` clause 7
  describes its own. `CAP-S4-1`.
- **Any production quantity.** No production credential exists in this environment. The count of
  rows in cutover class C1, the number of learners affected, and whether any STDIO client reaches
  production are each carried as a stand-in or a spike, and **`observed-in-production` is used zero
  times in this sub-task's output.**
- **The rollout schedule.** SUB-7's (`OUT-3`). §9.1 supplies a stage set and two ordering
  constraints, not an order.
- **The whole-surface compatibility contract.** SUB-11's (`OUT-16`). Only this change's own
  consequence is stated.
- **A retention position for `context_tokens`.** The purge is wired so that the identity decision
  does not open the question; it does not close it.
- **Anything about band placement, cross-register consistency, or the package's final counts.**
  SUB-14's at position 15 and SUB-17's at position 16.
