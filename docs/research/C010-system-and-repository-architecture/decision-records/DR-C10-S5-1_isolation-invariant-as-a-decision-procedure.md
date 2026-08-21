# `DR-C10-S5-1` — The isolation invariant is published as a decision procedure, not a principle

**Written by:** NEU-975 (SUB-5) · **Charter:** C010 (umbrella NEU-895) · **Covers:** `OUT-4`
**Written:** 2026-08-21
**Model:** claude-opus-5[1m]
**Carried in:** `../06_isolation-invariant-and-the-neu-893-split.md` §3

---

## Decision

The isolation invariant is published as a **decision procedure** with four fixed parts:

1. **A named evaluation domain** — one `SC-S3-*` row of `../04_state-category-inventory.md`
   §3, evaluated against an explicitly stated target state.
2. **Five ordered checks** — I1 in-domain, I2 principal attribution, I3 confinement,
   I4 transport invariance, I5 principal integrity — each answerable from a cited artifact
   rather than from judgement.
3. **A closed verdict set of six** — `not-applicable`, `not-evaluable`, `fails-confinement`,
   `fails-transport`, `fails-principal`, `holds`.
4. **One adjudication rule** — run the checks in order; the first failing check names the
   verdict; stop there.

The prose statement of the property is retained (§3.1), but it is explicitly **not** the
deliverable — it is the thing the procedure operationalizes.

**I1 carries one binding sub-rule:** a row whose `Learner-scoped` cell reads
`question — open` is **in domain**. Only an explicit `no` exempts a category.

## Rationale

`AC-2` requires the invariant to be evaluable against a single state category and produce a
pass/fail, because `SUB-14 (NEU-978)` applies it **row by row** over `SUB-13 (NEU-977)`'s
matrix. That is a mechanical consumer, and a mechanical consumer needs a mechanical artifact.
The failure mode the charter names — an invariant that reads well and cannot produce a
pass/fail on a single category — is not prevented by writing the prose more carefully. It is
prevented by there being a procedure to run.

Three properties of the design carry weight beyond satisfying `AC-2`:

- **The ordering is load-bearing, not presentational.** It is what makes the procedure return
  *one* verdict instead of a set of them, and it means two readers applying it to the same row
  under the same stated target state either agree or one of them made an error that can be
  pointed at.
- **`not-evaluable` is a distinct verdict from failing.** `SC-S3-16` and `SC-S3-17` store
  learner payload no principal can be attached to; the honest report is that no question about
  their isolation can be answered at all, in either direction — which is stronger and more
  useful than "fails".
- **The first failing check names the owner of the next work** (§3.5). I2 → the schema change
  (`NEU-850's OUT-2`); I3 → the query bodies and port signatures (`SUB-8`); I4 → the transport
  gate (NEU-893); I5 → the principal's kind (NEU-893, against `OI-S1-2`). This is not a
  coincidence: the checks are ordered by what each presupposes, and the work is ordered the
  same way because it is the same dependency. `DR-C10-S5-2` derives the two-list split from
  exactly this table.

**The target state must be named at each application.** The same category returns different
verdicts against today's tree and against `NEU-850's OUT-2` implemented. Leaving it implicit
would make the procedure deterministic in form and ambiguous in use, which is the failure mode
wearing a disguise.

## Rejected alternatives

**1. State it as a principle — "no learner may read or write another learner's data."**
Rejected: not evaluable. SUB-14 would have to *interpret* it against each row, and two
reviewers get two answers with no way to adjudicate between them. It also cannot express the
difference between a category that fails and one that cannot be assessed, which is precisely
the distinction `SC-S3-16` needs.

**2. A single boolean predicate over a category — isolated, yes or no.**
Rejected on two counts. It collapses five distinct failure modes into one, so the first
failing check no longer names the owner of the next piece of work and the two-list contract
loses its derivation. And it reports a `not-evaluable` category identically to a failing one —
so `SC-S3-16` and `SC-S3-17` read as merely broken when the truth is that they are untestable,
which is a different problem with a different owner.

**3. State it as a schema constraint — `user_id NOT NULL` on every core table.**
Rejected: that *is* `NEU-850's OUT-2`, i.e. the placement. Adopting it as the invariant would
both re-decide a consumed constraint (forbidden) and assert that a column is sufficient — which
§3.6's `SC-S3-5` case falsifies directly: the column lands, `getActiveSession()` is still
unscoped (`src/adapters/drizzle/session-repository.ts:73`–`:80`) and the global guard still sits
above the port boundary (`src/orchestration/session-workflows.ts:39`–`:46`).

**4. An unordered set of checks, each returning its own verdict.**
Rejected: a category then carries several verdicts at once and "exactly one verdict per
category" fails. SUB-14's row-by-row output would be a matrix of matrices. The ordering, not
the checks, is what makes the procedure decidable.

**5. Evaluate only against the system as it stands today.**
Rejected: every in-domain category returns `not-evaluable` or `fails-transport`, so the
procedure carries almost no information and SUB-14's per-row application would be uniform and
useless. SUB-14 needs it evaluable against SUB-13's target-state authority assignment, so the
target state is a parameter of the evaluation rather than a fixed cutoff.

**6. Include a worked verdict for all 45 categories.**
Rejected as **out of scope**, not as a bad idea — applying the invariant to each row is
`SUB-14 (NEU-978)`'s deliverable, and SUB-13's matrix does not exist yet. §3.6 works five
categories chosen to reach five different verdicts and §3.7 states explicitly that this is a
termination demonstration and the opposite of a representative sample.

## Consequences

- **SUB-14 receives a mechanical contract.** One row in, five ordered checks, one of six
  verdicts out. Its work becomes execution rather than interpretation.
- **The procedure currently has zero positive instances.** No category reaches `holds`, and
  none can until a schema change, scoped query bodies and a transport gate all land — none of
  which any C010 sub-task makes. Recorded as **`CAP-S5-1`**: this establishes the invariant is
  well-formed, never that it is **satisfiable**.
- **The procedure is unexercised against a real matrix.** Cases 3–5's target states are named
  by this chapter, not read from SUB-13's assignment. Recorded as **`OI-S5-3`**.
- **`F-S3-3` / `CAP-S4-1` gain a second, distinct consequence.** The deletion-owner gap now
  also means the two log categories are `not-evaluable` for isolation. Neither is closed or
  re-filed here; the third sighting is filed as its own finding shape rather than as a
  duplicate open item.
- **The invariant constrains where an isolation mechanism may live.** I4's transport-invariance
  requirement rules out enforcement above the port boundary, which lands on `A-28`'s tolerance
  envelope and is recorded as `F-S5-2`.
- **I3 is not symmetrically decidable, and the procedure says so** (`../06_…` §3.4.1). It asks
  a universal question, so it can be **failed** from one unscoped call site but cannot be
  **passed** without an enumerated access-path set for the category — and `../04_…` §3's
  `Store` and `Lifecycle` columns are a schema line and a lifecycle sentence, not a call-site
  enumeration. The rule adopted is that I3 **may not return `holds` by failing to find a
  counter-example**; absence of a found unscoped path is not evidence of absence. The
  enumeration is recorded as a precondition on the first `holds`, most naturally carried by
  `SUB-13 (NEU-977)`'s matrix — which bounds writes by construction but does not oblige itself
  to enumerate reads, and I3 covers both. Currently inert, because at this cutoff no in-domain
  category gets past I2/I4 anyway.
- **A cost, stated:** the procedure is more expensive to apply than a principle, and its
  verdicts are only as good as the artifacts the checks read from. A stale `Learner-scoped`
  column produces a confidently wrong I1 — and the census in `../06_…` §3.3 was re-parsed at
  this sub-task's own cutoff (19 `no` / 18 open / 8 `yes`; in-domain 26) precisely because an
  inherited figure here would corrupt every downstream verdict silently.

## Evidence

- **The consumer's requirement:** the SUB-5 charter's `AC-2`, and `SUB-14 (NEU-978)`'s
  row-by-row application over `SUB-13 (NEU-977)`'s matrix.
- **The evaluation domain:** `../04_state-category-inventory.md` §3 (45 rows, `SC-S3-1` …
  `SC-S3-45`; the §3 heading's "41" is stale per `F-S4-2`), §6 (the learner-scoping
  discipline — a question per entry, never a schema fact), §8 (the class counts).
- **The five worked cases**, at the lines cited in `../06_…` §3.6: `SC-S3-37` (`04_…:173`),
  `SC-S3-16` (`04_…:115`), `SC-S3-5` (`04_…:82`), `SC-S3-13` (`04_…:90`), `SC-S3-3`
  (`04_…:80`).
- **The `src/` facts the cases turn on**, read on `origin/develop` at the **2026-08-21**
  cutoff: `src/adapters/drizzle/session-repository.ts:37`–`:66`, `:73`–`:80`;
  `src/orchestration/session-workflows.ts:39`–`:46`;
  `src/infrastructure/db/schema.ts:312`–`:321`; `src/transport/jwt-middleware.ts:127`,
  `:133`–`:136`; `src/transport/http.ts:185`–`:187`;
  `src/transport/context-token-middleware.ts:5`–`:9`, `:55`–`:59`;
  `src/transport/main.ts:55`–`:59`.
- **Evidence class:** direct file inspection at cited lines, per
  `../00_method-and-provenance.md` §5. **A green type-check is not evidence about this
  decision's content.**
- **Status:** `confirmed` for the `src/` facts and the domain; `consumed` for
  `NEU-850's OUT-2` (§1) and for `A-28`.

## Revision trigger

Revise this record when any of the following becomes observable:

- **SUB-14 cannot apply a check to a row** — i.e. a check turns out not to be answerable from
  the artifact it names. That is a defect in this procedure, not in SUB-14's application.
- **A category reaches `holds`.** `CAP-S5-1` lifts, and the procedure acquires its first
  positive instance — at which point the claim that it is satisfiable can be made for the
  first time.
- **A sixth failure mode is found that none of I1–I5 detects**, or two of the five turn out
  never to discriminate between any two categories in the domain. Either would mean the check
  set is wrong, not merely incomplete.
- **Anyone is in a position to claim a `holds` on a category.** At that moment I3's asymmetry
  stops being inert and the enumerated access-path set must exist; a `holds` asserted without
  one falsifies §3.4.1's rule rather than satisfying the invariant.
- **`SUB-13 (NEU-977)`'s matrix assigns a target state that the procedure cannot be
  parameterized by** — the parameterization in §3.2 assumes a per-category ownership
  assignment.
- **NEU-893 selects a mechanism enforcing isolation somewhere other than at or below the port
  boundary** and can show I4 still holds. That would falsify I3's placement clause, which
  `F-S5-2` and `A-28` currently rest on.
