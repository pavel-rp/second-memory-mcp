# `90` — Outcome register

**Charter:** C011 (umbrella NEU-893) · **Opened:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]

Append-only. **Each producing sub-task records its own `OUT-n` row — the outcome, its resolving
evidence, and the success measure by which that outcome was judged done — inside this register, in
the shape SUB-14 aggregates.** A success measure is authored content, not a derivation, so it has a
named author upstream of assembly. SUB-14 (NEU-1007) aggregates the rows and checks the set for
completeness and **authors none of them**; a row or a measure that does not arrive is a routed gap
against its named author, never content invented at assembly.

These per-row success measures **are** the package's success metrics (charter assumption 47). There
is no separate deliverable and no separate author.

Twenty rows are expected in the assembled package: OUT-1 … OUT-19 from their producing sub-tasks,
plus the reserved **OUT-20 row slot** SUB-17 fills at position 16.

No sub-task reflows, renumbers, or rewrites another sub-task's row. On a merge conflict in this file,
keep **both** sides.

## Entry shape

```
## OUT-<n> — <title>

**Outcome.** <statement>
**Success measure.** <the measurable clause by which this outcome was judged done>
**Verified by.** <the evidence that discharges it>
**Authored by.** SUB-<n> (NEU-<id>)
```

---

### SUB-1

## OUT-18 — Production evidence obtained read-only, registered, bounded and redacted

**Outcome.** Every claim about production that cannot be settled from the repository is closed by
read-only observation or explicitly carried as an owned open item — never assumed. Access is
read-only and non-mutating with respect to the production database, the running MCP server and the
deployment, with exactly one registered exception: obtaining a token from the production Rauthy IdP.
Captured evidence is redacted of token material before publication, and each spike is a first-class
register entry carrying its question, why the repository could not answer it, its method, date,
result, confidence and an expiry after which the conclusion is stale.

**Success measure.** OUT-18 is judged done when **all four** of the following hold, each reported as
a number rather than an assertion:

1. **Total resolution, with both counts reported.** Every uncertain-and-material production claim
   resolves either to a spike-register entry carrying all of question, justification, method, date,
   result, confidence and expiry, or to an open item with a stable id and a named owner — and the
   two counts are reported and **sum to the total**, so no claim is silently absent.
2. **Three shapes, three distinct methods.** All three principal shapes are represented, each by a
   named acquisition method distinct from the other two, or by an owned open item stating what could
   not be obtained and why. **Zero shapes are represented by a capture taken from a different flow.**
3. **Zero mutations.** The access audit reports zero mutating operations against the production
   database, the running MCP server and the deployment, and enumerates the single registered
   exception with its residue stated. Any mutation outside that exception is reported as a blocking
   finding with a named owner in `91_findings-register.md`.
4. **Zero leaked captures.** The redaction audit reports zero published captures containing token
   material, a signature, or any secret value.

**Verified by.** `96_spike-register.md` (nine entries, every field populated);
`93_open-items-and-provisional-register.md` (nine owned open items);
`01_production-evidence-and-the-access-audit.md` §2 (the per-principal-shape acquisition table), §3
(the access audit), §4 (the counts), §5 (the redaction audit) and §6 (the per-capture terms record);
`95_stand-in-assumption-register.md` (`A-33`, `A-34`);
`92_risk-register.md` (`R8`, `R13`, `R14`).

**Measured result at revision 1.** (1) Nine claims, **0 closed by observation + 9 routed as owned
open items = 9**, sum matches. (2) Three shapes, three distinct designed methods, **0 substitutions**.
(3) **Zero** mutating operations — in fact zero production operations of any kind, since the single
registered exception was registered and **not exercised**; **zero** unregistered mutations, therefore
zero blocking findings on that trigger. (4) **Zero** published captures, therefore zero containing
token material — satisfied vacuously, and stated as vacuous rather than as a clean audit of a
non-empty set.

**The measure is met, and the evidence base it produced is empty of live observation.** Those are
both true, and OUT-18 is the outcome that requires them to be reported together: the discipline held,
and it produced routing rather than closure. The consequence for the package is carried as `F-S1-2`
in `91_findings-register.md` and as `R13` in `92_risk-register.md`, not smoothed over here.

**Authored by.** SUB-1 (NEU-993).

---

### SUB-2

## OUT-1 — Identity mapping to the production Rauthy IdP: which token claim becomes the learner key, and what that key means

**Outcome.** The package names the exact claim that becomes the persisted learner key — **the OIDC
`sub` claim, verbatim; `azp` never** — resolves the `payload.sub || azp` fallback
(`src/transport/jwt-middleware.ts:127`) into a rule rather than inheriting it, and covers all three
principal shapes the deployment produces, with the absent, changed and re-used cases each producing
a defined outcome.

**Success measure.** OUT-1 is judged done when **all four** hold, each reported as a count rather
than an assertion:

1. **Totality with zero fall-through.** The rule's conditions are mutually exclusive and jointly
   exhaustive over the `(sub, azp)` product, and every token yields exactly one learner key or one
   defined rejection. **Zero** cases reach the raw `sub || azp` expression.
2. **Three cases, three distinct outcomes.** Absent, changed and re-used each carry a stated outcome,
   and the three outcomes differ from one another.
3. **Three shapes, each placed.** All three principal shapes appear in the mapping with the branch
   they are expected to take **and** an explicit evidence status, so a reader cannot mistake an
   expectation for an observation.
4. **Four key properties, each disposed.** Stability, uniqueness, re-issue and format are each either
   established from a cited source or routed to a named open item — **never asserted**.

**Verified by.** `02_identity-the-learner-key-and-principal-kind.md` §3 (the mapping), §4 (the three
cases), §5 (the four key properties), §11 (the ADR-0001 expiry review);
`decision-records/DR-C11-S2-1_the-persisted-learner-key.md` (the key, with five rejected
alternatives); `93_open-items-and-provisional-register.md` (`OI-S2-1`, `OI-S2-2`);
`96_spike-register.md` (`SPK-S2-1`, `SPK-S2-2`); `92_risk-register.md` (`R-S2-1`, `R-S2-3`).

**Measured result at revision 1.** (1) **3** exhaustive conditions, **0** fall-throughs. (2) **3 of
3** cases distinct — absent yields no key, changed refuses to merge, re-used cannot be detected and
is carried as a High risk. (3) **3 of 3** shapes placed; **3 of 3** carry `[unconfirmed]` as to which
branch they populate. (4) **4** properties: **1** conditionally sound on ADR-0001's single-issuer
premise, **3** routed to `OI-S2-1`; **0** asserted.

**The measure is met, and it is met over a rule rather than over observations.** The distinction is
load-bearing and is stated rather than smoothed: the rule is total because kind is determined by
`sub`-presence and not by audience shape, so it holds at `n = 0`. What no measure here establishes is
how many real principals land in each branch — that is `CAP-S2-1`.

**Authored by.** SUB-2 (NEU-994).

---

## OUT-5 — Whether the production learner flow yields a human `sub`, closed on observed evidence

**Outcome.** The question is answered per principal shape, and the answer is **mixed**: the
`client_credentials` shape is believed to yield no `sub` at all, the static client `claude-web` is
the production learner path and probably does, and the DCR shape is unknown and may not. A negative
or mixed answer is a valid recorded result.

**Success measure.** The charter's own, quoted rather than restated so it cannot be quietly
weakened: *"The question is answered from a **real token obtained from the production Rauthy IdP**
(OUT-18), not from inference,"* and `OI-S1-2` is recorded as **closed with the observed value**,
citing `SUB-12 of C010 (NEU-986)`'s gate reassignment at
`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:615`.

**Verified by.** `02_identity-the-learner-key-and-principal-kind.md` §9 (the `OI-S1-2` disposition),
§10 (the per-shape answer); `95_stand-in-assumption-register.md` (`A-35`);
`91_findings-register.md` (`F-S2-1`, `F-S2-3`); `93_open-items-and-provisional-register.md`
(`OI-S2-2`, and C011's `OI-S1-1` … `OI-S1-3` inherited from SUB-1).

**Measured result at revision 1: the measure is NOT MET, and it is reported as not met.**

- **Real tokens obtained: 0.** For any shape. `SPK-S1-1` … `SPK-S1-3` all record `Result: not
  executed`; no production credential of any kind exists in the authoring environment (`F-S1-2`,
  `CAP-S1-1`).
- **`OI-S1-2` is therefore not closed.** Its own resolving event requires that *"a live production
  token is inspected and its `sub` claim recorded"*, and none was. The item is recorded as **owned
  here, design half discharged, evidence half not closable at this revision** (§9). The gate
  reassignment at `90_…md:615` is cited and the `Owner:` line at `90_…md:81` is noted once as a
  convention artefact, with **no ownership finding routed** — both as required.
- **The acceptance clause that ranges over shapes SUB-1 obtained is satisfied vacuously**, over an
  empty set, and is reported as vacuous rather than as a clean pass.

**What was delivered instead, and why it is not a substitute.** The question is answered per shape
from ADR-0001 and the codebase at cutoff `86fb38a`, with each answer's basis and confidence stated —
useful, and **not** the observation the measure names. The residual spans **all three** shapes, not
one, and is carried as `A-35` with a named owner and an observable re-validation trigger. The gap
between this outcome's acceptance condition and the evidence base SUB-1 could produce is registered
as **`F-S2-3`**, not absorbed here.

**This row records a not-met measure deliberately.** OUT-5 is the one outcome in this sub-task's set
that the charter defined against evidence rather than against design, and reporting it as met would
require asserting an observation that does not exist.

**Authored by.** SUB-2 (NEU-994).

---

## OUT-6 — Whether the resolved identity carries its `sub`/`azp` provenance, so check `I5` is answerable at all

**Outcome.** The resolved identity **does** carry its provenance. The principal's kind — `user` or
`client` — is determined from the presence of `sub`, never inferred from the audience shape, and is
carried as a separate field to every consumer that makes an authorization or ownership decision.
Check `I5` is consequently **evaluable**, and C010's `OI-S5-2` **closes**.

**Success measure.** OUT-6 is judged done when **all four** hold:

1. **`I5` has an input on both limbs.** The check is applied to the proposed mechanism and each limb
   — server-derived, and kind determined rather than assumed — is shown to have something to
   evaluate, where the second previously had nothing.
2. **The provenance decision is complete.** Whether it is carried is stated, and where it is stored,
   who may read it and **what a consumer is entitled to conclude** are each stated. Where it is not
   carried, what `I5` degrades to and who owns the residual are stated instead.
3. **Consumer coverage is total.** Every consumer of the identity value can distinguish principal
   kinds, or is explicitly documented as unable to with a named residual owner. **Zero** consumers
   are left unclassified.
4. **`OI-S5-2` carries an explicit disposition**, discharged clause by clause against its own
   resolving event rather than against a paraphrase of it.

**Verified by.** `02_identity-the-learner-key-and-principal-kind.md` §6 (provenance), §7 (the `I5`
application), §8 (the `OI-S5-2` disposition);
`decision-records/DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md` (kind
determination and the service-principal disposition, six rejected alternatives);
`decision-records/DR-C11-S2-3_provenance-persistence-and-parallel-safe-id-families.md` (provenance
carriage, eight rejected alternatives); `93_open-items-and-provisional-register.md` (the `OI-S5-2`
disposition).

**Measured result at revision 1.** (1) **2 of 2** limbs have an input; the second went from
*unanswerable* to *determined*. (2) **4 of 4** provenance elements stated — carried, storage site,
readership, entitlement — including the explicit negative that kind `user` does **not** certify a
natural person. (3) **All** consumers can distinguish kinds under the proposed mechanism; **0**
documented as unable, so **0** residual owners are named on that clause. (4) `OI-S5-2` disposed as
**closed**, discharged against all four clauses of its own resolving event at
`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:221`.

**Three things this measure does not claim, stated because the over-claim is the failure mode.**
`I5` is **evaluable, not passing** — it is still never reached, because `I4` fails first on ungated
STDIO and masks it. No state category reaches `holds`; C010's `F-S5-4` census is unchanged. And the
determination is about **which claim** the identity came from, not about whether a person is behind
it — that is `OI-S1-2`, still open under OUT-5.

**`OI-S5-2` closed at position 2 with zero production observations, because it was always a design
question** — C010 routed it to `NEU-893` for want of a mechanism owner, not for want of an
observation. That is the exact contrast with OUT-5 above, and it is why one row here reports met and
the other reports not met.

**Authored by.** SUB-2 (NEU-994).
