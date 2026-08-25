# Identity: the persisted learner key, the principal's kind, and what the production flow actually yields

**Sub-task:** SUB-2 (NEU-994) · **Covers:** OUT-1, OUT-5, OUT-6
**Written:** 2026-08-25 · **Model:** claude-opus-5[1m]
**Codebase cutoff:** `origin/develop` @ `86fb38a`
**Depends on:** SUB-1 (NEU-993), published at `01_production-evidence-and-the-access-audit.md`
**Consumes:** `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md` (check `I5`; `NEU-850`'s `OUT-2`), `../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md` (token-bound identity), and `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md` (`OI-S1-2`, `OI-S5-2`) — all published 2026-08-22.
**Decision records:** `DR-C11-S2-1`, `DR-C11-S2-2`, `DR-C11-S2-3` · **Traceability:** `traceability/S2_identity-and-the-learner-key.md`

---

## 0. What this chapter is

The settled identity rule for C011: which claim becomes the persisted learner key, what that key
denotes per principal shape, and whether the resolved identity records which claim it came from.
Nine later sub-tasks design against this rule rather than against
`src/transport/jwt-middleware.ts:127`.

**The headline, stated first.** Two of the three questions this chapter carries are **design**
questions and are settled here on repository evidence alone. The third — *does the production
learner flow yield a human `sub`?* — is an **evidence** question, and SUB-1 obtained no token for any
principal shape, so it is **not settled** and this chapter says so rather than manufacturing a
closure. C010's `OI-S5-2` therefore **closes** at this position, and C010's `OI-S1-2` **does not**.
That asymmetry is the chapter's organising fact, and §8 and §9 state each half.

The rule below is nonetheless **total**: every token the deployment can present yields exactly one
learner key or one defined rejection. It achieves that at `n = 0` because principal kind is
determined by **whether `sub` is present**, not by which audience shape the token carries. What the
missing evidence leaves open is *which branch each shape populates* — never whether a branch exists,
and never what happens once a token lands in one.

This chapter does not decide where the rule is enforced (SUB-5), how identity reaches STDIO or binds
to a context token (SUB-4), what happens to existing unowned rows (SUB-6), or how requests become
attributable (SUB-16).

## 1. The starting position

Identity is resolved once, at the transport edge:

```
const subject = (typeof payload.sub === 'string' && payload.sub) || azp || undefined;
```

`src/transport/jwt-middleware.ts:127`. A token yielding neither is rejected 401 with *"token carries
no usable subject (sub/azp)"* (`:129`–`:131`). The result is written to `res.locals.auth` as
`{ sub, email }` (`:133`–`:136`), where `email` is an optional convenience field (`:135`) and not an
identifier.

**Exactly two components read it, both at the transport edge and both fail-open.** The
session-binding map in `src/transport/http.ts` compares the current request's subject against the
stored session owner and 403s on mismatch — but a session with no stored identity *always passes*.
The rate-limit key in `src/transport/rate-limit-middleware.ts` windows on the subject, and when
there is none it calls `next()` and applies no limit. Nothing in `src/orchestration/`, `src/ports/`,
`src/adapters/` or `src/domain/` references the value at all (charter assumption 12).

So the value never crosses the transport boundary, **no persisted row is keyed to it**, and no
ownership column exists on any table (charter assumption 13). There is nothing today for this
chapter to be compatible with — which is why the rule can be stated cleanly rather than retrofitted.

## 2. The three principal shapes, and which one the learner actually arrives on

ADR-0001 fixes the audience-binding model. `audienceMatches()`
(`src/transport/jwt-middleware.ts:73`–`:85`) admits a token when any `aud` is in
`[AUTH_AUDIENCE, ...AUTH_ADDITIONAL_AUDIENCES]`, **or** any `aud` is `dyn$`-prefixed, **or** `aud` is
entirely absent and `azp` is `dyn$`-prefixed.

| # | Shape | How it is admitted | Evidence status |
|---|---|---|---|
| 1 | **`client_credentials` grant** — the CI smoke principal | `aud` matches the configured audience | Claim set **unobserved** — `SPK-S1-1` not executed, routed to `OI-S1-1` |
| 2 | **Pre-registered static client** — `claude-web` | `aud = "claude-web"`, admitted via `AUTH_ADDITIONAL_AUDIENCES` | Claim set **unobserved** — `SPK-S1-2` not executed, routed to `OI-S1-2` (C011's) |
| 3 | **DCR client** — `aud = dyn$<random>` | `dyn$` prefix on `aud`, or on `azp` with `aud` absent | Claim set **unobserved** — `SPK-S1-3` not executed, routed to `OI-S1-3` |

**A repository fact that changes which shape matters most.** ADR-0001's NEU-909 amendment states at
`docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`:

> The claude.ai connector in production authenticates with a **manually provisioned static client**
> (`claude-web`) rather than DCR, so its tokens carry `aud = "claude-web"` …

and at `:67`, *"(comma-separated static client ids; prod sets `claude-web`)"*. This is corroborated by
`.env.example:63` and by the middleware's own comment at `src/transport/jwt-middleware.ts:64`–`:66`.

Two consequences follow, and both are repository-derived rather than observed:

- **The production learner path is shape 2, not shape 3.** SUB-1 called the DCR shape *"the shape
  OUT-1 and OUT-5 most need"* (`01_production-evidence-and-the-access-audit.md` §2). On ADR-0001's
  amendment that is no longer where the human arrives; the static client is. The DCR path remains
  admissible and may carry no production traffic at all.
- **The static client is named in the repository.** C011's `OI-S1-2` records that *"neither which
  client that is nor what its token carries has been observed"*, and `SPK-S1-2` justifies that with
  *"`cd-prod.yml` never names it"* — true of that workflow, but the repository names it elsewhere.
  The client's **identity** is repository-established; only its **claim set** is unobserved.

Both are registered as `F-S2-1` in `91_findings-register.md` rather than left in this prose, and
`OI-S2-2` carries the narrowed residual. **No finding is routed against SUB-1**: `SPK-S1-2`'s
statement about `cd-prod.yml` is accurate, and the amendment sits in a document the spike did cite
for a different purpose. This is a narrowing, not a correction.

## 3. The rule — token shape to learner key

**The rule is applied in this order, and it is total.** Kind is determined first, from the presence
of `sub`; the key follows from the kind. The audience shape is *not* an input — it decides only
whether the token is admitted at all (§2).

| Step | Condition on the signature-verified token | Kind | Persisted learner key | Outcome |
|---|---|---|---|---|
| 1 | `sub` present and a non-empty string | **`user`** | the `sub` value, **verbatim** | Owns learner rows; the key is written to `NEU-850`'s `user_id` column unchanged |
| 2 | `sub` absent, null or empty **and** `azp` present | **`client`** | **none** | Admitted as a **service principal**: authenticates, may call the three gate-exempt tools and any tool touching no learner-owned row, owns **zero** rows; any read/write/delete of learner-owned state is **refused**, not silently scoped to an empty set |
| 3 | neither `sub` nor `azp` usable | *no principal* | **none** | Rejected 401 — already the deployed behaviour at `src/transport/jwt-middleware.ts:129`–`:131` |

`azp` is **never** a learner key, in any row. `DR-C11-S2-1` fixes the key; `DR-C11-S2-2` fixes the
kind and the service-principal disposition, with rejected alternatives for both.

**Applied to the three shapes.** The shape does not change the rule; it changes only which row is
expected to fire, and every such expectation is `[unconfirmed]`:

| Shape | Expected row | Expected key | Basis | Status |
|---|---|---|---|---|
| 1 — `client_credentials` (CI smoke) | Step 2 → `client` | none | Rauthy is **believed** to set `sub = null` for this grant, per the code comment at `src/transport/jwt-middleware.ts:116`. A belief recorded in a comment is not an observation. | `[unconfirmed]` — `OI-S1-1` / `SPK-S1-1` |
| 2 — static client `claude-web` (**the production learner path**) | Step 1 → `user` | the `sub` value | An authorization-code connector flow with a human at claude.ai would carry a `sub`. **This is an inference from the flow's shape, not a reading of a token**, and the grant type is not established in the repository. | `[unconfirmed]` — `OI-S2-2` / `SPK-S2-2`, narrowing `OI-S1-2` |
| 3 — DCR client `dyn$<random>` | Step 1 or step 2 | `sub` if present, else none | ADR-0001 establishes only the `dyn$` audience form. `OI-S1-3` records that a DCR principal **may present with no `sub` at all**, which the rule already handles by construction. | `[unconfirmed]` — `OI-S1-3` / `SPK-S1-3` |

**No case falls through to `sub || azp`.** Every token reaching the middleware satisfies exactly one
of the three numbered conditions, they are mutually exclusive and jointly exhaustive over the
`(sub, azp)` product, and each names one key or one rejection. The expression at
`src/transport/jwt-middleware.ts:127` is superseded **as the definition of ownership**; whether that
line is edited is an implementation matter for a later charter, and no file under `src/` is changed
by this package.

**The `[unconfirmed]` labels attach to the rows of the second table, never the first.** The rule is
settled. What is unconfirmed is which shape lands where.

## 4. The absent, changed and re-used cases

Each produces a stated, distinct outcome.

| Case | Definition | Outcome |
|---|---|---|
| **Absent** | The verified token carries no usable `sub`. | Kind is `client` (step 2) if `azp` is present — the principal is admitted, owns nothing, and is refused learner state. If `azp` is also absent, the request is rejected 401 (step 3). **The absent case never produces a learner key**, and it is never bridged by `azp`. |
| **Changed** | A principal presents a `sub` that differs from one previously seen for what an operator would call the same person. | **A different `sub` is a different learner.** No automatic re-binding, no merge, no heuristic match on `email` or any other claim. The prior rows keep the prior key and remain reachable only under it. Re-binding is an explicit operator action with a verified target, never an inference — the wrong-target-subject failure the charter names in OUT-2. Carried as `R-S2-3`; the re-binding procedure is **SUB-6**'s (`NEU-1000`), not this chapter's. |
| **Re-used** | The IdP issues a `sub` value to a principal that a different principal previously held — subject-identifier recycling after a deletion. | **The system cannot detect this and would treat the new principal as the previous learner**, granting it that learner's entire history. This is a real exposure, not a theoretical one, and it is stated as such: it is `R-S2-1`, High severity. Whether Rauthy ever recycles a subject identifier is **not established anywhere in the repository** — routed as `OI-S2-1` with spike `SPK-S2-1`. The choice of `sub` is sound independently of the answer; what the answer changes is the severity of this row. |

The **changed** and **re-used** cases are deliberately given opposite dispositions — one refuses to
merge, the other cannot avoid merging — and the asymmetry is the point: the system can see that a key
is *new*, and cannot see that a key has been *recycled*. Only the second needs an external guarantee.

## 5. Stability, uniqueness and re-issue under Rauthy — what cannot be stated

OUT-1's success measure requires the key's *"stability, uniqueness and re-issue behaviour under
Rauthy"* to be stated. Here is the honest position, per the constraint that every Rauthy claim is
read from ADR-0001 or the codebase, or observed on a real token — never asserted.

| Property | What the repository establishes | Disposition |
|---|---|---|
| **Stability** — is `sub` constant for one principal across sessions and token re-issues? | Nothing. ADR-0001 addresses `iss` and `aud` only; `sub` appears in it not at all. | `OI-S2-1` / `SPK-S2-1`. `[unconfirmed]`. |
| **Uniqueness** — is `sub` unique across principals at one moment? | Nothing directly. OIDC guarantees uniqueness only *within an issuer*, and ADR-0001 fixes this deployment as one dedicated AS, so a single-issuer key is well-scoped **given** that premise. The premise is repository-established; the guarantee is not. | Conditionally sound; see `DR-C11-S2-1` rejected alternative 5 and ADR-0001's safety premise. |
| **Re-issue** — is a released `sub` ever re-assigned? | Nothing. | `OI-S2-1` / `SPK-S2-1`, and the exposure is `R-S2-1`. |
| **Format** — is `sub` an opaque identifier or a human-meaningful value such as an email? | Nothing. This matters for OUT-9's classification: an email-shaped `sub` would make the ownership column itself personal data. | `OI-S2-1`; flagged forward to **SUB-3** (`NEU-995`) and **SUB-8** (`NEU-1002`) as an input to classification, not decided here. |

**A negative result is the result.** Three of the four rows are unestablished, and none of them is
guessed at. This is the `n = 0` position `CAP-S1-1` and `R13` describe, applied to the specific
claims OUT-1 needs.

## 6. Provenance — what is carried, where, who reads it, and what it entitles

`DR-C11-S2-3` decides it. In summary:

- **What.** The principal kind determined in §3 — `user` or `client` — travels with the resolved
  identity rather than being recomputed. It is a **separate field**, never encoded into the key
  string.
- **Where, in flight.** Alongside the resolved subject at the transport edge, beside
  `res.locals.auth.sub` (`src/transport/jwt-middleware.ts:133`–`:136`).
- **Where, at rest.** On the **`context_tokens` binding** that `DR-C10-S8-2` obligates and that
  **SUB-4** (`NEU-996`) designs. `F-S1-1` records that `context_tokens` carries exactly `id`,
  `createdAt` and `expiresAt` today, so there is no column to bind to yet — that is SUB-4's and
  SUB-13's to author. It is **not** duplicated onto every owned row: under §3 only a `user`-kind
  principal can own a row, so a per-row discriminator would carry one value and no information.
- **Who may read it.** Every component making an authorization or ownership decision, plus OUT-15's
  attribution path. It is server-held throughout, never returned to a caller, never accepted from
  one, and never placed in a tool argument — `DR-C10-S8-2`'s forgeability argument applies to the
  discriminator exactly as to the identity.
- **What a consumer may conclude.** Exactly this: **`user` means the token carried a `sub` claim;
  `client` means it did not.** A consumer may **not** conclude that a `user`-kind principal is a
  natural person. That is `OI-S1-2`, still open, and it is carried as the stand-in `A-35`. The
  discriminator records the *claim the identity came from* — which is what `I5` asks for — and it
  does not certify humanity.

That last limit is stated because it is the most available misreading of the field, and because
nine downstream sub-tasks will read it.

## 7. Check `I5`, applied to the proposed mechanism

`I5` (`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174`):

> **Principal integrity.** Is the principal server-derived rather than caller-asserted, **and** is its
> *kind* determined rather than assumed?

| Limb | Before this chapter | Under the proposed mechanism |
|---|---|---|
| **Server-derived, not caller-asserted** | Satisfied. The principal comes from a signature-verified token, and `DR-C10-S8-2` binds it server-side at mint time rather than accepting a per-call argument. | Unchanged — consumed, not re-argued. |
| **Kind determined, not assumed** | **Unanswerable.** `payload.sub \|\| azp` yields one opaque string that *"records no trace of which claim it came from, and nothing downstream re-derives the distinction"* (`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:216`). There is no kind to evaluate — the check has no input. | **Satisfied.** §3 determines the kind from a reading of the token, not an inference about it; §6 carries it to every consumer that must decide. |

**Verdict: `I5` is evaluable.** Both limbs now have an input, and every consumer of the identity
value can distinguish principal kinds. No consumer is documented as unable to, so no residual owner
is named on that clause.

**Three qualifications, because an over-claim here would be the failure mode.**

1. **Evaluable is not passing.** `I5` is the fifth check of an ordered procedure and is still
   **never reached**: `I4` (transport invariance) fails first because STDIO carries no identity gate,
   which C010 records as *masking* this defect
   (`../C010-system-and-repository-architecture/02_findings-register.md:267`). What this chapter
   changes is that when SUB-7's rollout advances the frontier from `I4` to `I5`, there is a
   determined kind to read instead of an unanswerable question. Closing the transport gate makes the
   defect visible; this chapter makes it *answerable* when it becomes visible. Those are different
   contributions and both are needed.
2. **Evaluable is not `holds`.** No state category reaches verdict `holds` on the current deployment
   (C010's `F-S5-4`), and nothing here changes that. Carrying a category to `holds` is **OUT-8**'s,
   under SUB-5.
3. **The determination is about the claim, not the person.** `I5` asks whether the kind is
   determined. It is. Whether kind `user` corresponds to a human is `OI-S1-2` and is open (§9).

## 8. Disposition of `OI-S5-2` — **closed**

**Item.** `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:213`–`:222`
— *"Whether the resolved identity will carry its `sub`-versus-`azp` provenance, so check `I5` is
answerable at all."* Status `provisional`. Owner (`:220`): **`NEU-893`** — *"it is a property of the
identity mechanism, and this package decides the invariant, not the mechanism."*

**Its resolving event** (`:221`):

> **NEU-893 publishes its identity mapping stating whether the resolved principal carries its kind**
> — and what the system does with a principal of kind `client`: reject it, map it to a learner, or
> admit it as a service principal holding no learner state. Any of the three closes the item;
> leaving the kind undetermined does not.

**Discharged, clause by clause.**

| The resolving event requires | Where this package supplies it |
|---|---|
| An identity mapping is published | §3 of this chapter, in `docs/research/` |
| It states whether the resolved principal carries its kind | §6 — it does, as a separate field, with storage site, readership and entitlement all stated (`DR-C11-S2-3`) |
| It states what the system does with a principal of kind `client` | §3 step 2 — **the third of the three named dispositions**: admitted as a service principal holding no learner state (`DR-C11-S2-2`) |
| The kind is not left undetermined | §3 — determined from `sub` presence, with three exhaustive outcomes |

**Status: closed.** The corresponding entry is recorded in
`93_open-items-and-provisional-register.md`.

**Why it closed at position 2 with zero production observations.** `OI-S5-2` was always a *design*
question. C010 routed it to `NEU-893` because the identity **mechanism** had no owner, not because an
observation was missing — its resolving event names three design acts and asks for no evidence. This
package therefore closes it on the day it authors the mechanism. The contrast with `OI-S1-2` in §9 is
exact and is the distinction this chapter exists to draw.

## 9. Disposition of `OI-S1-2` — owned here; the evidence half is not closable at this revision

**A naming hazard first, because two different items share this id.** `OI-S1-2` denotes **two
different facts** in two packages:

- **C010's `OI-S1-2`** (`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:74`–`:83`)
  — *"The authenticated subject a token yields may be an OAuth client, not a human learner."* This is
  the one this section disposes of, and the one the charter means.
- **C011's own `OI-S1-2`** (`93_open-items-and-provisional-register.md`, SUB-1) — the pre-registered
  static client's claim set, and which client it is.

They are related but not the same, and a bare `OI-S1-2` in this package is ambiguous. The ambiguity
is registered as `F-S2-2` and the disambiguation rule adopted here is: **a cross-package open item is
always written qualified**, as *C010's `OI-S1-2`*, exactly as the house style already requires for a
C010 sub-task reference.

**The item.** Status `[unconfirmed]`. Consumer (`:80`) `SUB-5 (NEU-975)`, also named as an input to
`NEU-893`. Resolving event (`:82`): *"A live production token is inspected and its `sub` claim
recorded."*

**Ownership.** The owner is **`NEU-893`** — this package. `SUB-12 of C010 (NEU-986)` moved it at
C010's completeness gate (`90_…md:615`): *"Owner moves to `NEU-893`; it is List B question `H5`."*
The original entry's `Owner:` line at `90_…md:81` still reads `SUB-5 (NEU-975)` **only** because no
C010 sub-task edits another's entry under C010's append-only convention. **That is a convention
artefact, noted here once so a reader of the entry alone is not misled, and no ownership finding is
routed against it** — as the charter's OUT-5 and this sub-task's own out-of-scope clause both
require.

**Disposition: owned here; design half discharged; evidence half not closable at this revision.**

| Half | Content | Status |
|---|---|---|
| **Design** — *what does the system do when the authenticated subject is an OAuth client rather than a human?* | §3 step 2 and `DR-C11-S2-2`: kind `client`, admitted as a service principal, owns no learner state, refused learner reads and writes. | **Discharged.** No downstream sub-task needs to carry this as an open question. |
| **Evidence** — *does the production learner flow in fact yield a human `sub`?* | The item's own resolving event requires a live production token to be inspected. **No token was inspected**, for any shape: `SPK-S1-1` … `SPK-S1-3` all record `Result: not executed`, and no production credential exists (`F-S1-2`, `CAP-S1-1`). | **Not closable.** Carried forward as the stand-in `A-35`, with C011's `OI-S1-1`, `OI-S1-2` and `OI-S1-3` as the observations that would close it. |

**This chapter does not record `OI-S1-2` as closed, and that is a departure from the letter of its
acceptance condition.** The charter's OUT-5 verified-by asks for *"an explicit disposition of
`OI-S1-2` as closed … and recording the observed value."* There is no observed value. Recording a
closure would mean asserting an observation that does not exist, against the constraint that no
production quantity is treated as measured and against SUB-1's whole discipline. The gap between the
acceptance condition and the deliverable evidence base is **registered as `F-S2-3`**, with the
consequence and the owner named, rather than absorbed into prose or quietly downgraded. That is the
reporting rule the charter states, applied to this sub-task's own acceptance.

## 10. The human-`sub` question, settled as far as the evidence permits

OUT-5 asks whether the production learner flow yields a human `sub`, *"closed on observed evidence"*.

**Per shape, on SUB-1's evidence:**

| Shape | Does it yield a human `sub`? | Basis | Confidence |
|---|---|---|---|
| 1 — `client_credentials` (CI smoke) | **No** — believed to yield no `sub` at all | Code comment at `src/transport/jwt-middleware.ts:116`; the grant is machine-to-machine by construction and there is no human in it | Repository-derived, `[unconfirmed]` as to the literal claim set (`OI-S1-1`) |
| 2 — static client `claude-web` | **Probably yes, and this is the shape that matters** | ADR-0001:65 places the production claude.ai connector here; a connector authorization-code flow has a human at it. **Inference from the flow's shape, not from a token.** The grant type is not established in the repository. | `[unconfirmed]` (`OI-S2-2`) |
| 3 — DCR client `dyn$<random>` | **Unknown, and may be no** | ADR-0001 establishes only the audience form. `OI-S1-3` records that a DCR principal may present with no `sub` at all. | `[unconfirmed]` (`OI-S1-3`) |

**The answer is mixed, and a mixed answer is a valid recorded result** — the charter says so
explicitly. The system routinely authenticates a non-human principal that writes to production
(charter assumption 20), so *"the production flow yields a human `sub`"* is false as a universal and
is at best true of shape 2.

**Zero of the three shapes were obtained by SUB-1**, so the acceptance clause *"settles the question
on SUB-1's observed evidence for every principal shape SUB-1 obtained"* is satisfied **vacuously** —
it ranges over an empty set. Reporting that as a satisfied criterion without saying it is vacuous
would be the same error `01_production-evidence-and-the-access-audit.md` §5 avoided for the redaction
audit, so it is reported the same way: **vacuous, not clean.**

The residual is therefore **not** confined to one named shape. It spans **all three**, and the
stand-in `A-35` in `95_stand-in-assumption-register.md` is written over all three with a named owner
and an observable re-validation trigger. Narrowing it to fewer shapes than the evidence supports
would be a fabrication in the opposite direction.

**What is nonetheless settled, and what downstream sub-tasks may rely on:** the *rule* is total over
every answer (§3). No later sub-task needs to carry the human-`sub` question in order to know what
the system does — only in order to know how many principals land in each branch. That is the
strongest honest position available at `n = 0`, and it is what OUT-1 and OUT-6 are discharged on.

## 11. Review against ADR-0001's stated expiry conditions

ADR-0001 names its own invalidating conditions under *"Safety premise and what would change this
decision"*. Each is reviewed against the rule above.

| ADR-0001 expiry condition | Effect on this chapter's rule |
|---|---|
| **The AS becomes multi-resource / multi-tenant.** | Confused-deputy becomes live and audience must bind to a real resource identifier. The **kind** rule (§3) is unaffected — it reads `sub`, not `aud`. The **key** is affected: a bare `sub` is unique only within an issuer, so the key would widen to `(iss, sub)`. That is `DR-C11-S2-1` rejected alternative 5, pre-argued, with revision trigger 3 pointing at exactly this condition. |
| **Migration to a hosted AS (Phase 2 — `NEU-850` / `NEU-858`).** | The same widening, plus DCR with RFC 8707 resource indicators becomes reachable, so shape 3's audience form changes. Again the kind rule is unaffected; §2's shape table is superseded. |
| **The AS changes its DCR id format** (ADR-0001 § Consequences: *"the `dyn$` prefix is a Rauthy-specific heuristic"*). | **No effect on this chapter at all** — and this is the direct payoff of `DR-C11-S2-2` decision 2. Because kind is never inferred from the audience shape, a change to the `dyn$` heuristic changes admission (ADR-0001's concern) and leaves the identity rule untouched. Had kind been derived from the audience shape, this condition would have invalidated the identity rule too. |
| **The `AUTH_ADDITIONAL_AUDIENCES` entries change** (the NEU-909 amendment: *"The safety premise below applies to these entries identically"*). | Affects which static clients are admitted, and would change the concrete value in §2 row 2. The rule is unaffected. `OI-S2-2` expires on any such change, which `SPK-S2-2`'s expiry rationale records. |

**Conclusion.** No ADR-0001 expiry condition invalidates the kind rule. Two of the four would widen
the key, and the widening is already argued in `DR-C11-S2-1`. This is a deliberate property of the
design rather than luck: the rule was built to read the one claim ADR-0001 says nothing about.

## 12. Consistency checks against C010 and `NEU-850`

Run so SUB-17's audit can see that they ran and what they returned, rather than inferring it from the
absence of an amendment.

| Check | Result |
|---|---|
| Does the identity rule contradict any published C010 decision? | **No.** `DR-C10-S8-2` treats the principal as an already-resolved opaque value and does not itself choose `sub` over `azp`, so naming the claim is an addition, not a divergence. `I5` is consumed as stated. `OI-S5-2` is discharged on its own terms. |
| Does persisting a principal-kind discriminator contradict `NEU-850`'s `OUT-2`? | **No.** `OUT-2` fixes the *key* — `user_id`, `NOT NULL`, keyed to the JWT subject (`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:51`). It is silent on companion fields. The key here is the `sub` claim written verbatim into exactly that column, and the discriminator lives on the `context_tokens` binding, not on the owning row (§6). `NEU-850`'s `OUT-2` is consumed as a decision to honour, never as an existing schema fact. |
| Does the rule sit inside `A-28`'s tolerance envelope? | **Yes.** `A-28` (`../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:104`–`:115`) tolerates enforcement at the port layer, in the schema, or both. This chapter names a key and a kind and enforces nothing; SUB-5 places the enforcement. `A-28`'s invalidating outcome — *a finding that safe isolation requires a separate deployment or datastore* — is not reached. |
| Any amendment routed to `NEU-895`? | **None.** The check ran and returned empty. |

## 13. Source-change confirmation

`git diff --name-only origin/develop` for this branch lists files **only** under
`docs/research/C011-safe-production-integration-and-learner-isolation/` and `docs/GLOSSARY.md`.

**Zero files changed under `src/`. Zero under `drizzle/`. Zero deployment-configuration files.** The
rule in §3 is a design position; nothing implements it here.

## 14. Ids allocated by this sub-task

- **Chapter:** `02_` only.
- **Decision records:** `DR-C11-S2-1`, `DR-C11-S2-2`, `DR-C11-S2-3`.
- **Traceability:** `traceability/S2_identity-and-the-learner-key.md`.
- **Outcomes:** OUT-1, OUT-5, OUT-6 rows (`90_outcome-register.md`).
- **Findings:** `F-S2-1` … `F-S2-3` (`91_findings-register.md`).
- **Risks:** `R-S2-1` … `R-S2-3` (`92_risk-register.md`). **Zero charter `R<n>` rows** — no § Risks
  row names OUT-1, OUT-5 or OUT-6 as its owning outcome (charter assumption 48), so their absence is
  correct, not a gap. The `R-S2-<k>` family is fixed in `DR-C11-S2-3`.
- **Open items:** `OI-S2-1` … `OI-S2-3`, plus the recorded dispositions of `OI-S5-2` and C010's
  `OI-S1-2` (`93_open-items-and-provisional-register.md`).
- **Caps:** `CAP-S2-1` (`94_caps-and-incomplete-scope.md`).
- **Stand-ins:** `A-35` (`95_stand-in-assumption-register.md`), continuing the charter's assumption
  numbering.
- **Spikes:** `SPK-S2-1`, `SPK-S2-2` (`96_spike-register.md`).
- **Completeness-gate rows:** `G-S2-1` … `G-S2-10` (`97_package-completeness-gate.md`), this
  sub-task's own only. The `G-S2-<k>` family is fixed in `DR-C11-S2-3`.
- **Glossary:** `learner key`, `principal kind` (`docs/GLOSSARY.md`, appended).

## 15. What this chapter does not establish

- **It establishes nothing about production.** Every claim here is repository-derived at cutoff
  `86fb38a` or cited from C010. `CAP-S1-1` and `CAP-S2-1` state the limits.
- **It does not close C010's `OI-S1-2`**, and it does not close C011's `OI-S1-1`, `OI-S1-2` or
  `OI-S1-3`. It narrows C011's `OI-S1-2` (§2) and routes the remainder.
- It does not say **where** the rule is enforced (SUB-5 / OUT-8), how identity reaches STDIO or binds
  to a context token (SUB-4 / OUT-7, OUT-13), what happens to existing unowned rows (SUB-6 / OUT-2),
  how requests become attributable (SUB-16 / OUT-15), or how the key is realised as DDL (SUB-13 /
  OUT-19).
- It does not classify the `sub` value as personal data. §5 flags the format question forward to
  SUB-3 and SUB-8; the classification is theirs.
- It does not carry any state category to verdict `holds`. `I5` is made **evaluable**, not passing,
  and `F-S5-4`'s census is unchanged by this chapter.
- It asserts nothing about band placement or cross-register consistency (SUB-14), or about the
  package's audit set (SUB-17).
