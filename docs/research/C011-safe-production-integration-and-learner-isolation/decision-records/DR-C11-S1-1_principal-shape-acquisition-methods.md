# `DR-C11-S1-1` — Each principal shape is acquired by its own named method, and the DCR shape is never substituted from another flow

**Task:** NEU-993 (SUB-1) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-18 (`../90_outcome-register.md`) — the clause requiring that all three principal shapes be represented, each by a named and distinct acquisition method, with no shape represented by a capture taken from a different flow.

## Decision

The three principal shapes the deployment produces are acquired by **three distinct methods**, fixed
in advance and recorded per shape:

1. **`client_credentials` grant (CI smoke principal)** — a direct grant against the production Rauthy
   token endpoint, exactly the request the deployment's own CD workflow makes, using the smoke
   principal's credentials. This grant is **the single registered exception** to the zero-mutation
   constraint.
2. **Pre-registered static client** — a grant using **that client's own** credentials, a different
   principal from (1).
3. **DCR client with `aud = dyn$<random>`** — **captured from an existing authenticated remote-connector
   session.** It is not obtainable from the `client_credentials` endpoint.

Where a shape cannot be acquired within the read-only, non-mutating constraint, it is **recorded as an
owned open item** naming what could not be obtained, why, and what OUT-1 and OUT-5 must therefore
assume. **It is never represented by a capture taken from a different flow.**

## Rationale

The three shapes differ in exactly the field the identity rule turns on. A `client_credentials` grant
produces a token for which Rauthy sets `sub = null`, falling back to `azp` for the client identity —
that is the behaviour `src/transport/jwt-middleware.ts` is written against. A DCR client carries a
random non-URL `client_id` of the form `dyn$<random>`, and
`docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md` states that such a client **can
never obtain `aud = <resource URL>` on Rauthy**.

So a substitution would not be a slightly-imprecise proxy. Presenting a `client_credentials` capture
as the DCR shape would supply positive evidence for the proposition *"a DCR principal has no `sub`"* —
which is precisely the open question OUT-1 and OUT-5 need answered, and precisely the answer that
would be wrong if DCR sessions do carry a human `sub`. The error would be invisible downstream: SUB-2
would write a defensible-looking identity rule on fabricated evidence, and every sub-task after it
would inherit the rule without a way to detect its origin.

Fixing the method **per shape and in advance** is what makes the substitution detectable. A reader of
`../96_spike-register.md` can check that the method recorded against `SPK-S1-3` is a connector-session
capture and not a grant, without re-deriving the ADR.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | Run the `client_credentials` grant and present the result as representative of "a production token" generally. | Collapses three shapes into one and silently answers the `sub` question with the one shape guaranteed not to have a `sub`. The most dangerous option precisely because it produces a plausible-looking capture. |
| 2 | Register a fresh DCR client to obtain shape 3. | A mutation of the IdP beyond the single registered exception. The exception authorizes obtaining a token, not creating a client registration, and widening it silently is the failure `R14` names. |
| 3 | Infer shape 3's claim set from ADR-0001 and record it as observed. | Inference is not observation. The ADR fixes `aud`'s form; it says nothing about whether `sub` is present or human-identifying, which is the load-bearing part. |
| 4 | Drop shape 3 from scope because it cannot be captured read-only. | It is the shape OUT-1 and OUT-5 most need. Dropping it would remove the question rather than answer it, and a later reader would have no record that it was ever asked. |
| 5 | Block SUB-1 until a credential is available. | Thirteen sub-tasks are gated on this one. The brief's own design routes an unobtainable observation to an owned open item precisely so the package proceeds with an honest gap rather than stalling. |

## Consequences

1. All three shapes are recorded at `../01_production-evidence-and-the-access-audit.md` §2 with their
   methods, and all three are currently **unobtained** — routed to `OI-S1-1`, `OI-S1-2`, `OI-S1-3`.
2. SUB-2's identity rule must be **total over the `sub`-absent case** and must not treat `azp` as
   human-identifying without evidence. `OI-S1-3` records this as the assumption OUT-1 and OUT-5 carry
   in the DCR shape's absence.
3. Closing `OI-S1-3` is harder than closing `OI-S1-1`: it needs an authenticated connector session,
   not just a credential. The two are not interchangeable work items, and a plan that treats "get a
   production token" as one task will close one and leave the other open.
4. The structural impossibility recorded as `F-S1-3` is a **safeguard**: a later session cannot take
   the shortcut even carelessly, because the endpoint will not mint the shape.
5. The three-method rule costs the package a shape it might have had. That is the intended trade.

## Evidence

| Claim | Source |
| --- | --- |
| The CD workflow obtains a token by `POST`ing `grant_type=client_credentials` to `https://auth.neurasphere.ee/auth/v1/oidc/token`. | `.github/workflows/cd-prod.yml` at `546ee90` |
| Rauthy sets `sub = null` for `client_credentials` grants and `azp` carries the client identity. | `src/transport/jwt-middleware.ts` — recorded as the implementation's own stated basis, **not** as an observation of the IdP |
| A DCR client receives a `dyn$<random>` `client_id` and can never obtain `aud = <resource URL>`. | `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md` |
| The code consumes `iss`, `aud`, `azp`, `sub` and optional `email`, and nothing else. | `src/transport/jwt-middleware.ts`, `src/transport/http.ts`, `src/transport/rate-limit-middleware.ts` |
| No credential for any shape was available; no grant was run. | `../96_spike-register.md` § `SPK-S1-1` … `SPK-S1-3`; `../01_production-evidence-and-the-access-audit.md` §3 |

## Revision trigger

1. **Any of `OI-S1-1`, `OI-S1-2` or `OI-S1-3` closes** — the method recorded here is confirmed or
   corrected against what actually worked.
2. **ADR-0001 is amended**, in particular its audience-binding rule or the `dyn$` client-id form —
   which would change what shape 3 even is.
3. **The deployment adds or removes a principal shape** — a second static client, a different grant
   type, or a move away from DCR — making "three shapes" the wrong enumeration.
4. **Rauthy's `sub` behaviour for `client_credentials` changes**, which would invalidate the premise
   that shape 1 cannot stand in for shape 3.
