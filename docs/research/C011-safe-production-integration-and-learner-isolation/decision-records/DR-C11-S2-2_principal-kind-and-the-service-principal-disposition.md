# `DR-C11-S2-2` — Principal kind is determined by the presence of `sub`, never by the audience shape, and a `client`-kind principal is admitted as a service principal holding no learner state

**Task:** NEU-994 (SUB-2) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `86fb38a`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-6 (`../90_outcome-register.md`) — the clause requiring the package to state *"what the system does with a principal of kind `client`"*; and it is the act that closes C010's `OI-S5-2` under that item's own resolving event.

## Decision

1. **Principal kind is a determined value with exactly three outcomes**, computed from the verified
   token alone:

   | Condition on the verified token | Kind | Learner key |
   | --- | --- | --- |
   | `sub` present and a non-empty string | **`user`** | the `sub` value (`DR-C11-S2-1`) |
   | `sub` absent, null or empty **and** `azp` present | **`client`** | **none** |
   | neither `sub` nor `azp` usable | *no principal* — the request is rejected | n/a |

   The third row is already the deployed behaviour: `src/transport/jwt-middleware.ts:129`–`:131`
   replies 401 with *"token carries no usable subject (sub/azp)"*. This record adopts it unchanged
   and gives it a name.

2. **Kind is never inferred from the audience shape.** Not from `aud = dyn$<random>`, not from a
   static client id, not from `aud` being absent. The audience determines *whether the token is
   admitted* (ADR-0001); it does not determine *what the principal is*.

3. **A `client`-kind principal is admitted, as a service principal that holds no learner state.**
   Concretely: it authenticates and is not rejected at the edge; it may call the three gate-exempt
   tools and any tool whose effect touches no learner-owned row; it owns **zero** rows; and any read,
   write or delete of learner-owned state attempted under a `client` principal is **refused**, not
   silently scoped to an empty set.

4. **This closes `OI-S5-2`.** That item's resolving event
   (`../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:221`)
   is *"NEU-893 publishes its identity mapping stating whether the resolved principal carries its
   kind — and what the system does with a principal of kind `client`: reject it, map it to a
   learner, or admit it as a service principal holding no learner state. Any of the three closes the
   item."* Decision 1 states the kind is carried and determined; decision 3 selects the third
   disposition by name. The disposition is recorded in `../93_open-items-and-provisional-register.md`.

**Refused, not empty-scoped** (decision 3) is deliberate and load-bearing. A confinement predicate
that scopes a `client` principal's query to `user_id = <nothing>` returns zero rows and looks
identical to a learner with no data. That makes a misconfiguration — a machine principal wired into
a learner path — indistinguishable from ordinary emptiness, and it is exactly the class of silent
failure OUT-15's detection design would then have to reconstruct from nothing. An explicit refusal
is observable.

## Rationale

**Determining kind is the whole content of `I5`.** C010's fifth check
(`../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174`)
asks: *"Principal integrity. Is the principal server-derived rather than caller-asserted, and is its
kind determined rather than assumed?"* Both halves must hold. The first already does — the principal
comes from a signature-verified token, never from a tool argument, which is the position
`DR-C10-S8-2` fixed. The second does not, and cannot, while the only kind signal is an expression
that discards it. Decision 1 supplies a determination; without it `I5` has nothing to evaluate and
the check is not merely failing but *unanswerable*, which is the precise state `OI-S5-2` records.

**`sub`-presence is a determination; audience shape is an assumption.** This distinction is the
reason decision 2 exists, and it is not hypothetical. ADR-0001's NEU-909 amendment
(`docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`) records that *"the claude.ai
connector in production authenticates with a manually provisioned static client (`claude-web`)
rather than DCR"*. So the intuitive shape-based mapping — *`dyn$` means a human at a connector,
anything else means a machine* — is **already false on this deployment**: the human learner path is
a static client, and the `dyn$` path may carry no production traffic at all. Any rule keyed to the
audience shape would have been wrong on the day it was written, and would have been wrong in the
direction that matters, misclassifying the actual learner. `sub`-presence is read off the token
rather than inferred about it, which is what "determined rather than assumed" means.

**Why admit rather than reject (the choice among C010's three).** Rejecting `client`-kind tokens at
the edge is the tidiest rule and it breaks production. The deployment's own CI authenticates by
`client_credentials` and runs smoke tests against production that call `init_agent_context` on every
deploy (charter assumption 20; `.github/workflows/cd-prod.yml`; `tests/smoke/smoke.test.ts`), so a
blanket rejection turns every deploy red and removes the only automated post-deploy signal the
platform has. That cost is not worth paying to express a rule that decision 3 expresses anyway.

**Why admit rather than map to a learner.** Mapping a machine principal onto a learner identity is
the wrong-target-subject failure the charter names directly in OUT-2: a wrong target *"silently
orphans the operator's data behind an identity they do not authenticate as."* It also manufactures
exactly the evidence `OI-S1-2` exists to obtain — it would make the system behave as though the
production flow yields a human `sub` while the question is still open. Admitting the principal and
denying it learner state keeps the deploy pipeline working and keeps the open question open, which
is the only combination that is both operable and honest.

**Why not leave the kind undetermined.** C010 forecloses it explicitly: `OI-S5-2`'s resolving event
ends *"leaving the kind undetermined does not"* close the item. Deferring would hand SUB-4, SUB-5,
SUB-13 and SUB-16 the same unanswerable check this sub-task exists to answer.

**This decision is evidence-independent, and that is the point.** Every limb above is settled from
ADR-0001, the codebase at a stated cutoff and C010's published decisions. None of it waits on a
token. `OI-S5-2` was always a design question — C010 assigned it to `NEU-893` because the *mechanism*
had no owner, not because an observation was missing — which is why it closes here at position 2
while `OI-S1-2`, an evidence question, does not.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Reject every `client`-kind token at the transport edge.** | C010's first named disposition, and the strongest expression of "learner state belongs to learners". It breaks the deploy pipeline: `cd-prod.yml`'s smoke job authenticates by `client_credentials` and calls `init_agent_context` against production on every deploy, so this turns every deploy red and destroys the platform's only automated post-deploy check. Decision 3 achieves the same protection of learner state at no operational cost. |
| 2 | **Map the `client` principal to a learner** — the operator, or a designated default subject. | C010's second named disposition. It is the wrong-target-subject failure OUT-2 names, it silently assigns real learner-owned rows to a machine identity, and it fabricates behavioural evidence for the very proposition `OI-S1-2` is open on. Rejected on correctness, not convenience. |
| 3 | **Leave the kind undetermined and let each consumer decide.** | Explicitly foreclosed by `OI-S5-2`'s resolving event, which states that leaving the kind undetermined does **not** close the item. It also guarantees the inconsistency `I5` is written to detect, since four downstream sub-tasks would each decide separately. |
| 4 | **Determine kind from the audience shape** — `dyn$`-prefixed `aud` means `user`, a static or configured `aud` means `client`. | Genuinely tempting: it needs no `sub` at all, and it reads like it matches ADR-0001's three shapes. It is **false on this deployment** — ADR-0001:65 records the production human learner arriving on the *static* client `claude-web`, so this rule misclassifies the actual learner as a machine. It is also an assumption about the token rather than a reading of it, which is the precise thing `I5` prohibits. |
| 5 | **Admit the `client` principal and scope its learner-state queries to an empty result set** rather than refusing them. | Reaches the same isolation outcome with less code and no new error path. Rejected because it makes a misconfigured machine principal indistinguishable from a learner with no data, converting a detectable fault into silence — and OUT-15 would then owe a detection design for a signal that no longer exists. |
| 6 | **Introduce a third kind for the DCR shape**, so `user`, `client` and `connector` are distinct. | Rejected as unfounded: nothing observed distinguishes a DCR principal's *kind* from a static client's, only its audience. Adding a kind nobody can populate would put an `[unconfirmed]` value into a discriminator whose whole purpose is to be determined. |

## Consequences

1. **`I5` becomes evaluable.** It does not thereby pass — `I4` still fails first on ungated STDIO,
   which C010 records as *masking* this defect
   (`../../C010-system-and-repository-architecture/02_findings-register.md:267`). What changes is
   that when SUB-7's rollout closes the transport gate and the frontier advances from `I4` to `I5`,
   there is a determined kind for `I5` to read instead of an unanswerable question. The chapter
   applies the check and records the result.
2. **`OI-S5-2` closes at position 2, with zero production observations.** Recorded in
   `../93_open-items-and-provisional-register.md`.
3. **Every consumer of the identity value must now carry the kind with it.** That obligation is
   `DR-C11-S2-3`'s subject; without it decision 1 is a determination nobody downstream can read.
4. **The deploy pipeline keeps working, and its rows become a named class.** The smoke principal
   continues to authenticate and to call `init_agent_context`, but under decision 3 it owns no
   learner rows. The `context_tokens` rows it mints on every deploy are a real cohort with a real
   disposition question, handed to **SUB-4** (`NEU-996`) and **SUB-13** (`NEU-1006`), and their
   interaction with `DR-C10-S8-2`'s reject-don't-grandfather rule is SUB-4's to resolve, not this
   record's.
5. **A refusal path is a new observable behaviour that does not exist today** and has no
   implementation here — nothing under `src/` changes. SUB-5 (`NEU-997`) owns where the refusal is
   enforced; this record fixes only that it is a refusal and not an empty result.
6. **What becomes harder:** if Rauthy ever begins populating `sub` on a `client_credentials` grant,
   the smoke principal silently becomes kind `user` and would start owning rows. That is a real
   exposure, it is carried as `R-S2-2`, and it is this record's revision trigger 1.

## Evidence

| Claim | Source |
| --- | --- |
| `I5` asks whether the principal is server-derived **and** whether its kind is determined rather than assumed. | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174` |
| `OI-S5-2` is owned by `NEU-893`, and its resolving event names the three admissible dispositions and states any of the three closes it. | `../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:220`, `:221` |
| `I5` is currently never reached, because `I4` fails first and masks the defect. | `../../C010-system-and-repository-architecture/02_findings-register.md:267` |
| The principal is already server-derived, never caller-asserted. | `../../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md` |
| A token with neither `sub` nor `azp` is already rejected at the edge. | `src/transport/jwt-middleware.ts:129`–`:131` |
| The production claude.ai connector authenticates with a manually provisioned **static** client, `claude-web` — so the human learner path is not the `dyn$` shape. | `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`, `:67`; corroborated at `.env.example:63` and `src/transport/jwt-middleware.ts:64`–`:66` |
| Rauthy is believed to set `sub = null` on a `client_credentials` grant — **believed, not observed**. | `src/transport/jwt-middleware.ts:116` (code comment); routed as `../93_open-items-and-provisional-register.md` § `OI-S1-1` |
| The deploy pipeline authenticates by `client_credentials` and calls `init_agent_context` against production on every deploy. | Charter assumption 20; `.github/workflows/cd-prod.yml`; `src/server/server-context-tools.ts` |
| A wrong target subject silently orphans the operator's data behind an identity they do not authenticate as. | C011 charter, OUT-2 success measure |

## Revision trigger

1. **Rauthy begins populating `sub` on a `client_credentials` grant**, or on any shape for which it
   is currently believed absent. Kind determination by `sub`-presence stops being sound and both this
   record and `DR-C11-S2-1` reopen.
2. **`OI-S1-1`, `OI-S1-2` or `OI-S1-3` closes with an observed claim set** that contradicts the
   believed shape — in particular a DCR or static-client token carrying no `sub`, which would make
   the production learner path kind `client` and force a re-reading of decision 3's operational
   consequence.
3. **A learner-facing path is found that must be served under a `client` principal.** Decision 3
   would then deny a real use, and the choice among C010's three dispositions is re-taken.
4. **`I5` is reached in a real evaluation and returns something other than the verdict this record
   predicts** — the frontier advances past `I4` under SUB-7's rollout and the check does not behave
   as designed.
5. **A fourth principal shape appears** on the deployment, which rejected alternative 6 assumed would
   not happen without observation.
