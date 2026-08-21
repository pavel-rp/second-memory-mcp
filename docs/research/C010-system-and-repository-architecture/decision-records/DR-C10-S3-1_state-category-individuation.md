# `DR-C10-S3-1` — What makes two pieces of state one category

**Task:** NEU-973 (SUB-3) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-21 · **Verification cutoff:** 2026-08-21
**Model:** claude-opus-5[1m]
**Discharges:** part of `OUT-2` (`../01_outcome-register.md`) — specifically the "appears **exactly once**" property.

---

## Decision

**Two pieces of state are the same category if and only if they would necessarily take the same single
authority under `OUT-3`. Store, lifecycle and volatility are the discriminators used to decide that;
where the test is ambiguous, the pieces are recorded as two categories, not one.**

Concretely, `04_state-category-inventory.md` treats state as one category when **all four** of these
agree — the writing component, the lifecycle/retention rule, the volatility class, and the store — and
as two categories when **any one** of them differs in a way an ownership model could act on.

The rule has a wrong answer, and it is checkable: if `SUB-13 (NEU-977)`'s exactly-one-authority audit
finds a row needing two authorities, this rule under-split; if it finds two rows whose authority,
lifecycle, volatility and store are all identical, this rule over-split.

**The ambiguity tie-break is deliberately asymmetric.** An unnecessary split costs one duplicate row in
the matrix, which the exactly-one audit **detects**. An unwarranted merge hides a second writer inside a
row that the exactly-one audit **passes**. Since only one of those two errors is visible to the audit
that follows, the rule is biased toward the visible one.

---

## Rationale

**The criteria and their weights are stated here before the scoring, not derived from the conclusion.**
They come from what `OUT-2` and `OUT-3` actually require of this artifact.

| # | Criterion | Weight | Why it carries that weight |
| --- | --- | --- | --- |
| 1 | Makes "appears exactly once" **mechanically checkable** | **highest** | `OUT-2`'s success measure and `NEU-985 (SUB-11)`'s audit both reduce to this. A rule that cannot be mechanically applied makes the central claim of the document unfalsifiable. |
| 2 | Survives a category that **has no store at all** | **high** | Roughly a third of the inventory is process-local, derived, or required-by-upstream-with-no-store. A rule keyed on persistence silently drops all of it — the exact failure `OUT-2` was written to prevent. |
| 3 | Does not bake **current implementation structure** into an architecture decision | **high** | `OUT-1` and `OUT-3` are meant to outlive the present adapter layout. A rule that reads the code's own partitioning back out as the architecture's partitioning cannot be used to *evaluate* that layout. |
| 4 | Produces **few rows** | **lowest — explicitly** | Compactness is not a property `OUT-2` asks for anywhere. It is recorded only so that nobody later mistakes row count for a quality signal. |

Against criterion 1, keying individuation on *the authority question itself* is the only rule that makes
the downstream audit a real test: every row exists precisely because it is a distinguishable answer to
"who may write this", which is the question `SUB-13` must answer once per row.

Against criterion 2, the rule never mentions a table, so a category standing in for unbuilt work is
individuated by the same test as a live one. That matters because several entries exist only because a
stand-in predicts them — **`A-25`** (tutoring needs per-learner, per-node interaction state), **`A-27`**
(a rich authenticated web surface holding non-gate-bearing interaction state), and **`A-29`** (a bounded,
expiring, revocable handoff authorization envelope) each introduce a category with **no store today**.
Under a store-keyed rule none of the three would be individuable at all; under this rule each is a
category because each has a distinct prospective writer, lifecycle and volatility. **`A-28`** is what
makes the learner-scoping column a *question* per row rather than a fact.

Against criterion 3, the rule deliberately refuses the repository-port partition even though it is the
most convenient one available in this codebase.

---

## Rejected alternatives

Every credible alternative is listed with the specific consequence that decided against it. None was
eliminated silently.

**1. One category per physical table.** *Rejected — it cannot represent two thirds of the problem.*
Process-local state has no table (eleven structures, `src/transport/http.ts:82`–`:83`,
`src/transport/rate-limit-middleware.ts:58`, `src/orchestration/tier2-circuit-breaker.ts:68`,
`src/shared/logger.ts:115`–`:116`, and six more), derived state has no table
(`src/orchestration/learner-context-workflows.ts:84`), and every required-by-upstream category has no
table by definition. It *also* fails in the other direction: the NEU-844 scheduling-snapshot quad
(`src/infrastructure/db/schema.ts:213`–`:220`) shares a table with the attempt row it annotates, yet is
written once at answer time and never revised, while the surrounding attempt row **is** mutated in place
by `revise_grade` (`src/adapters/drizzle/session-question-repository.ts:194`–`:223`). One table, two
write rules, two authorities — a table-keyed rule would fuse them and the exactly-one audit would pass on
a row that has two writers.

**2. One category per domain concept**, as named in `docs/GLOSSARY.md`. *Rejected — domain concepts
cross-cut authority.* "A chunk" is one concept spanning authored content, scheduler-written SM-2 fields
(`src/infrastructure/db/schema.ts:59`–`:65`) and a validator-written audit verdict (`:77`) — three
different writers under one name. Any matrix built on this partition has rows that need three
authorities, which `OUT-3`'s exactly-one audit forbids by construction, so the inventory would be
guaranteed to fail the audit it exists to feed.

**3. One category per repository port.** *Rejected — it is a code-structure artifact, not an
architecture fact.* The ports are this hexagonal implementation's present partition of persistence. Using
them would (a) bake today's adapter layout into a decision meant to evaluate it, violating criterion 3,
and (b) omit outright everything with no port: both raw-SQL log tables — written through hand-built
`INSERT` strings at `src/transport/pg-audit-transport.ts:117` and
`src/transport/pg-event-transport.ts:109`, not through any port — all eleven process-local structures,
and all three derived values.

**4. One category per column group.** *Rejected — it multiplies rows without changing a single authority
answer.* Column grouping is a presentation choice, so two readers legitimately group differently, and the
exactly-once property becomes unfalsifiable in practice: any disagreement about the inventory reduces to
a disagreement about grouping taste rather than about the system. It scores well on criterion 1 only
superficially — the check becomes mechanical but no longer means anything.

**5. One category per lifecycle alone** (durable / TTL / process-lifetime / request-scoped / derived).
*Rejected — too coarse in exactly the wrong place.* It is genuinely attractive on criteria 2 and 3, and
it is the closest runner-up. But it merges the MCP transport map with the subject-binding map
(`src/transport/http.ts:82` and `:83`) — same store, same lifetime, same volatility — even though the
second is the system's only server-side record of *which authenticated subject owns a live connection*
and the first is a connection registry. Merging them would put the only identity-bearing process-local
state inside a row about transport plumbing, and `SUB-14`'s per-row isolation test would then be applied
to the wrong thing. Lifecycle is retained as one of the four discriminators rather than as the whole rule.

---

## Consequences

**What this commits the programme to.**

- The inventory has **more rows than the system has tables**, and that is the intended result rather than
  an artifact. Anyone reconciling row count against table count is applying alternative 1.
- `SUB-13 (NEU-977)` gets a row set where every row is already a well-posed authority question, so its
  exactly-one audit is a genuine test rather than a formality.
- `SUB-11 (NEU-985)` can check the correspondence mechanically, because both sides are id-keyed and the
  ids are stable.

**What it forecloses.**

- The inventory cannot be regenerated automatically from the database schema. There is no script that
  reproduces it, and there will not be one, because two of its four discriminators (writing component,
  and the prospective authority under an ownership model not yet selected) are not present in the schema.
  This is a real, permanent maintenance cost and it is recorded as **`CAP-S3-2`**.

**What it makes more expensive.**

- Adding a table to `src/infrastructure/db/schema.ts` no longer implies exactly one new inventory row; a
  contributor must ask the four-part question. The cost is one judgement per schema change.

**Migration path.** None is implied — this rule governs a document, not a running system. If `SUB-6`
selects an ownership model that merges entries this rule split, the merge is applied to the inventory
by `SUB-13` as a recorded amendment, and the entry ids of the merged rows are retained as aliases so
existing citations continue to resolve.

---

## Evidence

- `src/infrastructure/db/schema.ts` — 10 `public` tables and 2 under `pgSchema('infrastructure')` (`:331`);
  SM-2 group `:59`–`:65`; `validatorReport` `:77`; NEU-844 snapshot quad `:213`–`:220`.
- `src/adapters/drizzle/session-question-repository.ts:194`–`:223` — `reviseAttempt` mutates the live
  attempt row in a transaction while inserting an immutable revision row.
- `src/transport/http.ts:82`, `:83` — the transport map and the subject-binding map.
- `src/transport/pg-audit-transport.ts:117`, `src/transport/pg-event-transport.ts:109` — the two raw-SQL
  log tables are written outside every repository port.
- `src/orchestration/learner-context-workflows.ts:84`–`:228` — a derived value with no store.
- `../93_stand-in-assumption-register.md` — **`A-25`**, **`A-27`**, **`A-28`**, **`A-29`**, each named in
  the Rationale above, not only here. All four are `[unconfirmed]` and inherit their register's
  re-validation triggers.
- `../00_method-and-provenance.md` §1.1 — the evidence-labelling rule this record is judged by; the walk
  backing the citations above is an **automated check** (a proxy signal), not external validation.
- **No spike backs this record.** `../92_spike-register.md` §3's justification test asks whether the
  question could have been read instead; for every claim above it could, so no spike was run and none is
  cited.

---

## Revision trigger

**Any one of these observable events reopens this decision:**

1. `SUB-6` publishes an ownership model under which two entries this rule **separated** would necessarily
   take the same authority.
2. `SUB-13 (NEU-977)`'s exactly-one-authority audit reports **any** row requiring two authorities — that
   is a recorded under-split, and this rule is what produced it.
3. A category is added to the inventory that the four-part test **cannot** classify, and the adder
   records that it could not.

Not a date, and not anyone's satisfaction with the rule.
