# `DR-C11-S15-1` — Objectives are set from labelled non-production sources, and an objective with no admissible source is a finding rather than a number

**Task:** NEU-998 (SUB-15) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `86fb38a`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-14 (`../90_outcome-register.md`) — *"Anything not verifiable from the repository is closed by production read-only evidence (OUT-18) or marked `[unconfirmed]` with an owner — never assumed"*, and *"an objective that cannot be set at all is a finding, not a blank."*

## Decision

Numeric operational objectives are set **from explicitly labelled non-production sources**, under a
four-value label vocabulary applied to every model input without exception:

| Label | Admissible source |
| --- | --- |
| `observed-in-repository` | A constant read out of this repository at cutoff `86fb38a`, cited `file:line`. A fact about **shipped code**, never about production behaviour. |
| `derived` | Computed from `observed-in-repository` inputs, or measured from this repository's own git history, with the derivation shown and its bounds stated. |
| `cited` | An upstream package's own measured result, taken **by id** and never re-derived or restated. |
| `[unconfirmed]` | Not establishable from any of the above. Carries a named owner and a routing id. |

Three consequences are decided along with the vocabulary:

1. **`observed-in-production` is a fifth label this chapter is entitled to use and uses zero times**,
   and that count is **stated explicitly in the chapter** rather than left to be inferred from the
   absence of the word.
2. **Where a threshold depends on an unobserved term, the objective publishes a formula and a
   bounded band** with the unobserved term named and routed — never a point value chosen from
   inside the band.
3. **An objective with no admissible source is recorded as a finding or as `[unconfirmed]` with an
   owner, never as a number and never as a blank.**

## Rationale

The evidential position this sub-task inherits is not "thin"; it is **empty**. SUB-1 designed nine
production spikes and executed zero, its access audit reports zero production operations of any kind,
and `F-S1-2` records that the package proceeds on repository-derived evidence alone. SUB-15
independently re-probed the environment at its own cutoff and reproduced that result: `DATABASE_URL`,
`SMOKE_PROD_CLIENT_ID`, `SMOKE_PROD_CLIENT_SECRET`, `AUTH_*` and `VPS_*` are all unset.

That leaves exactly one honest way to produce numeric objectives, and one dishonest way. The
dishonest way — pick a plausible figure, state it flatly, and let the reader assume it was measured —
is available, cheap, and produces a document that looks far more finished than this one. It is also
the failure mode the charter names twice (assumption 49) and the one SUB-17 audits for, and its cost
is not borne here: it is borne by SUB-7, which gates rollout stages on these numbers, and by SUB-9,
which builds lifecycle obligations on the recovery position.

The honest way is to admit that a repository constant **is** evidence — just not evidence of the same
kind as an observation. `max: 4` at `src/infrastructure/db/client.ts:42` is a hard fact about what
will run in production, verifiable by anyone, and an objective built on it is genuinely grounded. It
is simply not a *measurement of production behaviour*, and the label makes that distinction visible
in the objective itself rather than in a caveat three sections away.

Two non-production sources beyond this repository's constants were admitted, each for a stated
reason. `tests/performance/content-retrieval.test.ts` is DB-backed against a real Postgres instance
and is already a green CI guard, so its thresholds are **upper bounds the code is known to satisfy**
— weaker than a measured p95 and stronger than a guess, and labelled as exactly that. C010's
`SPK-S6-1` is a genuine measurement with its own registered method, confidence and expiry, so it is
**cited by id** under the package's standing rule that a citation references a record rather than
restating its conclusion.

The band rule follows from the same discipline. The first-break threshold is
`N ≥ 2 / t_db`, and `t_db` is unobserved. Every point value inside the resulting 2-to-200 range is
equally unsupported, so choosing one would be choosing which unsupported number to make load-bearing.
Publishing the band puts the two-order-of-magnitude uncertainty **into the objective**, where SUB-7
cannot miss it, instead of into a footnote it can.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | Set no numeric objectives at all until production evidence exists | Fails OUT-14 outright — the outcome's whole content is that objectives are *numeric* and set against the *real* platform. It also throws away real evidence: the pool ceiling, the rate-limit window, the audit-buffer bounds and the deploy cadence are all knowable today, and three of them turn out to be the load-bearing facts. An empty chapter would have hidden the four-connection ceiling. |
| 2 | Set the objectives from industry-typical figures for a single-VPS Node service | The single worst option. It produces numbers that look measured, carry no provenance, and are unfalsifiable against this deployment. It is precisely the "number presented as observed when it was assumed" failure, and it would have silently overwritten the genuinely derived four-connection ceiling with a plausible-sounding larger one. |
| 3 | Run a load test against production to get real numbers | Not available and not permitted. No credential exists; and a load test is a **mutation** of the running system, outside the read-only constraint and outside SUB-1's single registered exception (IdP token issuance). It would also be the *"spike becomes disguised implementation"* limb of `R14`. |
| 4 | Pick the midpoint of each uncertain range and label the whole document "estimates" | A document-level caveat does not survive being quoted from. Readers cite rows, not front matter, and SUB-7 will cite `OBJ-1`. The label has to travel **with the number**, which is why it is a column and not a preamble. Also: no evidence supports the midpoint over either endpoint. |
| 5 | Treat the `tests/performance/` thresholds as the production latency SLO | They are single-request, concurrency-1, against a small synthetic test database, and they are regression *guards* — upper bounds the code passes, not typical service times. Using them as an SLO would assert a concurrency behaviour they say nothing about, which is exactly why `OBJ-4` is scoped "at concurrency 1" and `OBJ-5` is left `[unconfirmed]`. |
| 6 | Leave the unsettable objectives blank and let SUB-14 fill them | Forbidden by charter assumptions 46 and 49: SUB-14 authors nothing, and an unsettable objective is required to be a **blocking finding with a named owner**. A blank is also indistinguishable from an oversight, whereas `F-S15-1` is a record somebody owns. |

## Consequences

1. **Every objective travels with its provenance.** `OBJ-1` is defensible as a hard ceiling; `OBJ-4`
   must always be quoted with "at concurrency 1"; `OBJ-8` can never be quoted as an achieved
   availability. Downstream sub-tasks inherit the distinction whether or not they read this record,
   because it is in the table.
2. **The chapter is less impressive and more useful.** Nine of fourteen objectives carry a number;
   five do not. A reader learns quickly that the deployment's real ceiling is small and
   sharply-known (4 connections) while its capacity in learners is barely known at all (2–200).
   That asymmetry is the actual operational picture.
3. **Eight `[unconfirmed]` inputs are now owned and routed** rather than silently assumed, which
   converts an invisible gap into four spikes with methods and expiries and two open items paired
   with stand-ins.
4. **What becomes harder:** every downstream consumer must now handle a band where it would have
   preferred a number. SUB-7 cannot gate a rollout stage on "capacity is N"; it must gate on
   "capacity is between 2 and 200, and `OI-S15-3` closes it." That is more work and it is the correct
   amount of work.
5. **The chapter's headline claim is negative and stated first** — no number here was observed in
   production. Stated in §1, re-stated as a count in §2.1 and §6, and capped as `CAP-S15-1`.
6. **`OBJ-4`'s dependence on a test file creates a maintenance seam.** If
   `tests/performance/content-retrieval.test.ts` changes its thresholds, `OBJ-4`'s basis moves
   without anyone editing this package. The revision trigger below names it.

## Evidence

| Claim | Source |
| --- | --- |
| No production credential exists in the authoring environment | Re-probed at cutoff `86fb38a`: `DATABASE_URL`, `SMOKE_PROD_*`, `AUTH_*`, `VPS_*` all unset. Independently reproduces `F-S1-2` in `../91_findings-register.md` |
| SUB-1 executed zero of nine designed spikes; zero production operations of any kind | `../96_spike-register.md` (nine entries, `Result: not executed`); `../01_production-evidence-and-the-access-audit.md` §3 |
| The pool ceiling is 4 with a 5 000 ms acquisition timeout | `src/infrastructure/db/client.ts:40-47` |
| The rate limiter admits 120 requests per 60 000 ms per subject | `src/config/resolve-rate-limit-config.ts:24-25`; `.env.example:83`–`:88` |
| The single-instance assumption is stated in the shipped configuration | `.env.example:79`–`:81`; charter assumption 22 |
| Deploy cadence ≥1.36/day over 90 days, ≥3.29/day over 7 days | `git rev-list --count origin/develop --grep="chore: bump version"` at cutoff `86fb38a` |
| The `tests/performance/` thresholds are single-request, concurrency-1, DB-backed regression guards | `tests/performance/content-retrieval.test.ts:85,145,230,306` |
| MCP-boundary overhead p50 0.0769 ms / p95 0.1892 ms | C010 `SPK-S6-1`, `../../C010-system-and-repository-architecture/92_spike-register.md` |
| The 1 000 ms budget is a C010 design assumption, not a measured SLA | C010 `A-25`, `../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md` |
| An unsettable objective must be a blocking finding with a named owner, never a blank | Charter assumption 49 |
| SUB-14 authors nothing at assembly | Charter assumption 46 |
| A citation references a record by id rather than restating its conclusion | `../96_spike-register.md`, `R14`'s mitigation in `../92_risk-register.md` |

## Revision trigger

- **Any of `OI-S15-1` … `OI-S15-4` closes**, converting a `[unconfirmed]` input into an observation
  and narrowing or collapsing a published band. `OI-S15-3` in particular collapses the 2–200
  capacity band and would make `OBJ-3` and `OBJ-5` settable.
- **`OI-S1-8` closes**, which makes `OBJ-13` and `OBJ-14` settable and resolves `F-S15-1`.
- **`OI-S1-9` closes**, supplying the host and monitoring facts `OBJ-9` and `C-26` currently lack.
- **`tests/performance/content-retrieval.test.ts` changes its thresholds or its fixture size**, which
  moves `OBJ-4`'s cited basis without any change to this package.
- **A load observation is taken against the real deployment by any party**, which would supersede the
  whole labelled-derivation approach with measurement and lift `CAP-S15-1`.
- **C010's `SPK-S6-1` passes its expiry without re-run**, which would make `OBJ-6`'s cited basis
  stale — the stale-citation limb `R14` names.
</content>
