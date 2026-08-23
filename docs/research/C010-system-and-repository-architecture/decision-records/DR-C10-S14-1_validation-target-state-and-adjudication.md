# `DR-C10-S14-1` — The target state a per-row isolation verdict is evaluated against, and how a portless category is adjudicated

**Written by:** NEU-978 (SUB-14) · **Charter:** C010 (umbrella NEU-895) · **Covers:** `OUT-4`, `OUT-3`
**Written:** 2026-08-22
**Model:** claude-opus-5[1m]
**Carried in:** `../09_authority-matrix-validation.md` §4, §5, §6

---

## Decision

**Two decisions, both methodological, both about how the invariant is *applied* — neither about who owns
what. This record decides nothing about any authority.**

1. **The per-row census is published twice, under two explicitly named target states, and every verdict
   is labelled with the one that produced it.**
   - **Census A** runs against `../06_isolation-invariant-and-the-neu-893-split.md` §3.2 form **(b)** — the
     category's inventory row **plus** the authority `../08_per-state-authority-matrix.md` assigns it, as
     the system stands at this cutoff.
   - **Census B** runs against form **(c)**, composed, with its assumed set **enumerated in full**:
     *NEU-850's `OUT-2` implemented completely — an ownership key (`user_id NOT NULL`) on every
     learner-scoped durable `public`-schema store, threaded through the row-owning repository ports —
     **and nothing else***. No other change is assumed, and §3.2 makes an unenumerated composed state
     **void**, so the enumeration is a condition of the census existing at all.
   - **No verdict anywhere in the chapter is stated without its target state.**
2. **`I3`'s "enforced at or below the port boundary" is read purposively for the 15 categories that sit
   behind no port**, and the reading is **disclosed and routed** (`F-S14-1`) rather than applied
   silently. Where no port mediates a category, there is no port-scoping mechanism for a guard to sit
   above, so the clause's exclusion has no work to do; the check is adjudicated on the substance —
   whether confinement is enforced below the surface the caller reaches — rather than on a locus that
   does not exist.

---

## Rationale

**On the two censuses.** `OUT-4` obliges this sub-task to apply the invariant *to a real matrix*, and
`OI-S5-3`'s resolving event is exactly that. Form (b) is therefore mandatory: it is the only form that
exercises the procedure against what was actually assigned. But form (b) **alone** would have been close
to useless as a validation. Every in-domain row fails at `I2` for the same reason — no principal
attribution mechanism exists anywhere, per `../04_state-category-inventory.md` §6's four-term search
returning zero — so the census would report 24 `not-evaluable` rows and stop, **without ever reaching
the checks that discriminate between rows**. The frontier would be invisible, and SUB-8's confinement
workload would be unsized.

Form (c) moves the frontier past `I2` and lets `I3` and `I4` run, which is where the rows differ from one
another. Publishing **both** is what makes the pair honest: Census A says what is true today, Census B
says what would still be true after the one decision C010 has already committed to. Publishing only B
would have smuggled an unimplemented schema change into a verdict; publishing only A would have hidden
the result that matters most — that **`OUT-2` as scoped cannot reach `SC-S3-16` and `SC-S3-17` at all**,
because they sit behind no port (`OI-S5-1`), so the two categories holding raw learner payload stay
`not-evaluable` even under the composed state.

**On the portless `I3` reading.** `06_…md` §3.6 case 3 introduces the port clause to catch a specific
failure: a guard that sits **above** the ports, which a port-scoping mechanism would leave untouched —
the worked instance being `F-S5-2`'s `getActiveSession()`, unscoped at `session-repository.ts:73`–`:80`
with its guard at `session-workflows.ts:39`–`:46`. That failure mode requires ports to exist. Applied
literally to a category with none, the clause is not *failed* — it is **unaskable**, and an unaskable
check has no verdict in a closed six-verdict set. Two escapes were available and both are worse: invent a
seventh verdict (forbidden — the set is closed), or return `holds` because no counter-example was found
(forbidden absolutely by §3.4.1). The purposive reading is the only remaining option that keeps the
procedure total.

**Why it is routed rather than simply applied.** The reading is a change to how a sibling's procedure
behaves, and this sub-task **validates and reports; it decides nothing**. `F-S14-1` hands it to SUB-5 and
NEU-893, who own the procedure, and to SUB-16, which dispositions. Critically, **the reading changes no
row's disposition**: every one of the 15 fails at `I2` or `I3` under either reading, in both censuses. It
is disclosed because it would otherwise be an undocumented judgement inside 15 verdict cells, not because
it moves a number.

---

## Rejected alternatives

**1. A single census against form (b) only.** Rejected: it satisfies `OUT-4`'s letter and defeats its
purpose. 24 rows would return `not-evaluable` for one shared reason, `I3` and `I4` would run on two rows
out of 45, and the validation would produce no information about where confinement actually breaks —
leaving SUB-8 (NEU-981) with no sizing and SUB-12 with a gate input that says almost nothing.

**2. A single census against form (c) only.** Rejected as dishonest. It would report `fails-confinement`
for 15 rows that are in truth `not-evaluable` today, implying that principal attribution exists. NEU-850's
`OUT-2` is **a decision to honour, never an existing schema fact**, and a validation record whose headline
numbers silently assume an unshipped migration is exactly the artifact `F-S13-3` warns against.

**3. Form (a) — "as it stands", without the assigned authority.** Rejected: it evaluates the *inventory*,
not the *matrix*, and this sub-task's obligation is to validate the matrix. It would also have made the
count of assignment-caused failures unmeasurable, which is the single number the dispatch most needs.

**4. A third census assuming NEU-893's isolation mechanism landed as well.** Rejected: it would resolve
`I4` by assumption and produce a `holds`-heavy table that describes no system anyone has committed to
build. `OUT-2` is a merged decision; the isolation mechanism is NEU-893's open work. **Composing an
assumption that has not been decided is how a composed target state becomes fiction**, and §3.2's
enumeration rule exists to make the line visible. Two censuses, one assumption, enumerated.

**5. Returning `not-evaluable` for the 15 portless categories on `I3` grounds.** Rejected: `I2` already
fails for them, and the adjudication rule is *first failing check names the verdict, stop there*. Reaching
`I3` at all for those rows in Census A would have violated the ordering; in Census B, where `I2` is
satisfied by assumption, `not-evaluable` would have been a **second** meaning for a verdict that already
means "the category does not exist or cannot be reasoned about", collapsing two distinct situations into
one label.

**6. Inventing a seventh verdict for the unaskable case.** Rejected outright. `06_…md` §3.4 publishes a
**closed** set, and the census confirmed empirically that six suffice for a real 45-row matrix.

---

## Consequences

- **Every verdict in `../09_…md` carries its target state**, and the two distributions are reported
  separately and never summed. A reader quoting one number without its census is quoting nothing.
- **The cause tally is meaningful.** Because Census B isolates what remains after `OUT-2`, the residue it
  reports — 14 confinement-caused rows owned by SUB-8, 2 transport-caused owned by NEU-893 — is a
  workload, not an artefact of an unimplemented mechanism.
- **SUB-13's assignment causes zero failures under either target state.** That result is only credible
  *because* two target states were run: a single census could be dismissed as having stopped before the
  discriminating checks.
- **`fails-principal` is 0 in both censuses and this is a consequence of the decision, not a finding of
  soundness.** `I5` is last and is never reached. Filed as `F-S14-2` so the number cannot be misread.
- **`holds` is 0 in both censuses**, and §3.4.1 makes that unavoidable rather than incidental: no
  enumerated access-path set exists for any category, so `holds` was structurally unreachable before the
  census began. **This record does not claim the invariant is satisfiable** — `CAP-S5-1` stands.
- **The portless reading is on the page and overturnable.** If SUB-5 rejects it, the 15 rows' verdicts do
  not move; only the stated justification does.
- **`OI-S5-3` closes** and **`OI-S14-1` opens**: this record validates the `pre-validation` revision, and
  whether it must be re-run against SUB-16's post-absorption revision is not decidable from here.

---

## Evidence

- `../06_isolation-invariant-and-the-neu-893-split.md` §3 (the ordered checks and the adjudication rule),
  §3.2 (the three target-state forms and the enumeration requirement), §3.4 (the closed six-verdict set),
  §3.4.1 (the asymmetry rule, quoted verbatim in `../09_…md` §4.1), §3.5 (the ordering→owner table),
  §3.6 cases 1–5 (five worked cases reaching five distinct verdicts, and case 3's origin for the port
  clause).
- `../08_per-state-authority-matrix.md` §8 (45 `####` blocks, parsed mechanically), §9 (the 45-row
  summary), §10 (three audits, all zero), §11 (clause and authority distributions).
- `../04_state-category-inventory.md` §3 (the `Learner-scoped` column, re-derived independently: 19
  explicit `no`, 18 `question — open`, 8 explicit `yes` → 26 in domain), §6 (the four-term ownership-column
  search returning zero across all twelve Drizzle tables and both raw-SQL log tables), §8 (30 + 11 + 4 = 45).
- `../90_open-items-and-provisional-register.md` `OI-S5-1` (the two log tables sit behind no port, so
  `OUT-2`'s mechanism cannot reach them) and `OI-S5-3` (the resolving event this record discharges).
- `../02_findings-register.md` `F-S5-4` (no category can reach `holds` at this cutoff; the binding
  constraint is the transport, not the schema), `F-S5-2` (the guard-above-the-port instance), `F-S13-3`
  (the unsatisfiable closure condition), `F-S13-4` (the stale 25–30-row sizing).
- `../93_stand-in-assumption-register.md` `A-25`, `A-27`, `A-28` — each cited in `../09_…md` at the
  sentence of the verdict it decided, with tolerance envelope and invalidating outcome named there.
- Mechanical verification of the row domain, re-run at this cutoff: 45 `####` blocks, 45 distinct ids
  (min 1, max 45, no gaps), 450 authored cells, **0** blocks missing any of the nine `OUT-3` attributes.

---

## Revision trigger

This record is revised, or superseded, when any of the following lands on `origin/develop`:

1. **NEU-850's `OUT-2` ships in a form other than the one Census B enumerates** — a different key, a
   different scope, or enforcement somewhere other than the row-owning repository ports. Census B's
   assumed set is then wrong and its 15 `fails-confinement` and 9 `not-evaluable` rows must be re-derived.
2. **SUB-5 or NEU-893 states a rule for `I3` over a portless category** — accepting, rejecting or
   replacing the purposive reading `F-S14-1` routes. No row's disposition changes; the justification does.
3. **A category acquires an enumerated access-path set covering reads *and* writes**, making a `holds`
   verdict reachable for the first time and turning `CAP-S5-1` from a cap into a measurement.
4. **NEU-893 closes the transport gap at `BND-S4-17`**, at which point `I4` stops being the frontier for
   `SC-S3-19` and `SC-S3-20` and the two `fails-transport` verdicts must be re-run.
5. **SUB-16 republishes the matrix having changed an authority** — `OI-S14-1`'s resolving event. Any row
   whose authority moved has a stale verdict here, and `F-S14-7` and `F-S14-9` both put an assignment in
   question.
6. **The isolation invariant itself is amended** — a new check, a re-ordering, or a change to the closed
   verdict set. The adjudication in `../09_…md` is bound to the merged procedure and inherits nothing
   automatically.
