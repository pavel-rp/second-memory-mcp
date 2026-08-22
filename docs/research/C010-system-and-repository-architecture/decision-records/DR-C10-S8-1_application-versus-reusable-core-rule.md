# `DR-C10-S8-1` — How a proposed capability is classified application-specific or reusable core: an ordered rule that carries the distribution line inside it

**Task:** NEU-981 (SUB-8) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-22 · **Verification cutoff:** `ad5eebb`, 2026-08-22
**Model:** claude-opus-5[1m]
**Discharges:** part of `OUT-6` (`../01_outcome-register.md`) — the classification rule and its demonstration, published as `12_application-versus-core-rule-and-compatibility-contract.md` §5–§6.

---

## Decision

**A proposed capability is classified by an ordered, first-match-wins decision procedure of five clauses,
each of which returns both a classification and a side of the distribution line. The distribution-line
consequence is carried *inside* each clause, not appended after it.** Concretely:

1. **`R8-1` — the course-noun test.** Rewrite the capability's statement replacing every proper noun of a
   course artifact with a free variable. If the rewritten statement is **no longer well-formed**, the
   capability is **application-specific** and lands on the **private, closed** side.
2. **`R8-2` — the new-authority test.** If the capability needs write authority over state outside the
   forty-five categories of `../10_…md` §8, or would change a named authority, **the rule returns no
   classification.** It emits a **finding routed to SUB-13 (NEU-977)**, co-routed to NEU-896 and SUB-12
   (NEU-986). The distribution line is **not determined**, because it cannot be.
3. **`R8-3` — the mechanism/policy separability test.** If the capability decomposes into a
   course-noun-free **mechanism** and one or more course-specific **policy values**, the classification is
   **split**: the mechanism to the **public MIT core**, the values to the **private closed application**,
   supplied as configuration or arguments and **never compiled in**.
4. **`R8-4` — the second-operator test.** If an operator with no relationship to any course of ours would
   want it **and** it is statable in vocabulary the public surface already publishes, it is **reusable
   core**, **public MIT**. **Both halves must hold**; passing the first and failing the second routes back
   through `R8-3`.
5. **`R8-5` — the default.** Anything reaching here is **application-specific**, **private, closed**.

**The rule decides classification and distribution side only.** It does not decide whether the capability
should be built, who builds it, which repository it lands in (SUB-9 / NEU-983), or any category's
authority — `R8-2` routes rather than decides, by construction.

---

## Rationale

The criteria set, with each criterion's weight stated **before** the scoring rather than reverse-engineered
from the conclusion:

| Criterion | Weight | Why it carries that weight |
| --- | --- | --- |
| **Applicable by a reader holding only the published artifact** | **decisive** | This is `AC-1` stated as a property. A rule requiring its author to adjudicate is not a rule; it is a queue. |
| **Asymmetric in the direction of the irreversible error** | **decisive** | Charter assumption 32 makes misclassification a licensing and distribution event. Publishing under MIT cannot be undone; withholding can. |
| **Able to send real material both ways** | **high** | `AC-2`. A rule that classifies everything as core is a rubber stamp and would read as a rule. |
| **Refuses to decide what it may not decide** | **high** | The package's whole discipline is exactly-one-owner. A classification rule that quietly assigns authority would be taking SUB-13's decision under another name. |
| **Cheap to apply** | medium | A rule nobody runs protects nothing. |

**The course-noun rewrite is first because it is the only clause evaluable in isolation.** Every other
clause requires knowing something about the core — what the categories are, what the public vocabulary is,
what a second operator would want. `R8-1` requires only the capability's own sentence, so it cannot return
a wrong answer because the reader misunderstood the core. Putting the cheapest, most self-contained and
highest-consequence test first is also what makes the rule cheap to apply in the common case.

**`R8-2` returns nothing, and that is the clause the rule is built around.** A classification rule under
pressure will invent a home rather than admit a category is missing, and the invented home is always
"core", because core is where the machinery is. That failure is invisible in review — the capability looks
general, the classification looks confident — and it lands an authority assignment on the wrong party.
Making "not classifiable yet" a **first-class output** costs a round-trip and buys the exactly-one-owner
property the rest of the package depends on. `../11_…md` §11.1 publishes its routing rule before its
counts for the same reason: a procedure that can only return success is not a check.

**`R8-3` exists because the most common real capability is neither.** It is a general mechanism
parameterised by a course-specific value. Forced into a binary, such a capability either publishes the
course's policy or withholds a general mechanism — and §6.2's `G-PRESELECT` demonstration is exactly that
shape, drawn from published material rather than invented to justify the clause. Without `R8-3` the rule
would produce a wrong answer on its most frequent input.

**The asymmetric default is the rule's one deliberate thumb on the scale, and it is declared.** The two
errors are not equal. Misclassifying application behaviour as core **publishes** it irreversibly, under a
licence permitting redistribution. Misclassifying core behaviour as application **withholds** it
recoverably. A symmetric default would be treating an irreversible error as interchangeable with a
reversible one — which is a position, not a neutrality.

**The distribution line is carried inside the clauses rather than appended to the rule**, because charter
assumption 32 states that misclassification *"now carries a licensing and distribution consequence, not
merely an architectural one"*. A rule that classified first and looked up the consequence afterwards would
let a reader stop at the classification, which is the half that carries no cost.

---

## Rejected alternatives

### 1. An enumerated list of application concepts and core concepts

Maintain two lists; classify by lookup.

**Rejected because the outcome asks for a rule and a list cannot answer the question that matters.** `OUT-6`
and `AC-1` are both stated over *a capability the package never enumerated*. A list answers only for
capabilities already on it, so the first genuinely new capability — the only case where classification is
hard — falls through to whoever is holding it. Worse, a list degrades silently: it keeps returning answers
for the easy cases long after it has stopped covering the hard ones, so nobody notices it stopped working.

### 2. A weighted scoring rubric — score each capability on several dimensions, threshold the total

Superficially attractive: it looks more nuanced than first-match-wins, and it is the shape `../triage`-style
instruments elsewhere in this workflow use.

**Rejected on reproducibility, which is the decisive criterion.** Two readers scoring the same capability
produce different totals, and near the threshold the classification flips on a judgement neither reader
stated. `AC-1` requires a classification *"without further interpretation"*. A rubric relocates the
interpretation into the scoring rather than removing it — and it hides it, because the total looks
objective. **The specific consequence that decided it:** a threshold rule has no way to express `R8-2`. A
capability needing an authority that does not exist would score like any other and receive a confident
number, which is the exact failure the rule most needs to prevent.

### 3. Two outcomes only — application or core, with no `split`

Simpler to state, simpler to audit, and it matches the binary the distribution line actually has.

**Rejected because it produces a wrong answer on the most common input shape, and §6.2 demonstrates this on
real published material.** `EQ-S3-2`/`EQ-S3-15` (`G-PRESELECT`) is a course-noun-free provenance mechanism
plus a course-specific node criterion. A binary rule must either send the whole thing to core — publishing
C009's selection criteria — or the whole thing to application — withholding a general anti-laundering
check from every self-hoster. Both are misclassifications the rule was written to prevent, and one of them
is the irreversible kind.

**The objection that `split` weakens the binary was considered and does not hold**: a split does not
straddle the line, it names **both** sides explicitly, and it carries an extra obligation (no course value
in the core half) that §13 checks and reports as a count.

### 4. Classify by architectural layer — everything in `src/domain/` is core, everything above is application

Mechanical, cheap, and requires no judgement at all.

**Rejected because layer is a statement about coupling, not about distribution rights.** The counter-example
is already in the tree: `src/domain/algorithms/grade-mapper.ts` sits in the domain core and encodes a
rubric-anchored grade mapping, while `src/transport/context-token-middleware.ts` sits at the edge and is as
general as anything in the system. **The specific consequence that decided it:** this rule's output feeds
SUB-9 (NEU-983)'s topology decision. A criterion defined by the *current* directory layout would make the
topology decision circular — the layout would justify the split that then justifies the layout.

### 5. Defer classification to whoever proposes the capability, with a review gate

The proposer knows the capability best, and a reviewer catches errors.

**Rejected because it is the status quo that `OUT-6` exists to replace** — the charter's problem statement
is that *"today there is no rule"*. It also fails the asymmetry criterion: a proposer with a capability they
want shipped has a standing incentive toward "core", where the machinery and the reviewers already are, and
a reviewer with no stated rule has nothing to point at when disagreeing.

### 6. A symmetric default at `R8-5`

Route unclassifiable capabilities to core rather than application, on the argument that core is where
review is strongest.

**Rejected on the criterion weighted decisive, and stated so the thumb on the scale is visible rather than
implicit.** It inverts the asymmetry: it makes the *irreversible* error the default outcome of uncertainty.
Strong review does not make publication recoverable.

---

## Consequences

**Accepted, and stated as costs rather than as neutral facts.**

1. **Some capabilities will return `R8-2` and stop.** That is a real cost paid in round-trips, and it will
   feel like the rule failing when it is the rule working. The alternative is an authority assigned by the
   wrong party, which is invisible until it is expensive.
2. **`R8-3` splits create a standing obligation on the core half** — no course value as a default, in
   documentation, or in a test fixture. That obligation has no automated enforcement in this package; §13
   checks it by enumeration over five surfaces and reports the count, which is a review discipline, not a
   gate.
3. **The rule is deliberately conservative, so it will withhold things that could have been shared.** Over
   time this biases the public core smaller than optimal. Reclassification is the remedy and it is
   available in the cheap direction, which is the whole design.
4. **SUB-9 (NEU-983) inherits a criterion, not a topology.** The rule states which *side of the line* a
   capability lands on; it says nothing about repositories, submodules, or visibility mechanisms. A reader
   expecting the rule to imply a topology will find it does not, by construction.
5. **The rule binds this package too.** §13 applies it to the five core surfaces this chapter itself
   proposes, and reports 0 of 5 carrying a DP-specific concept. A rule its author exempted themselves from
   would not be a rule.
6. **Nothing here is enforced by machinery.** No linter, no CI check, no schema. The rule's whole force is
   that it is published, ordered, and cheap enough to actually run.

---

## Evidence

| What | Where |
| --- | --- |
| The distribution line: public MIT core, private closed DP application; misclassification as a licensing and distribution consequence | Charter C010 assumption **32** (`confirmed`, source Intake Q7) |
| The compatibility surface the rule is stated against | Charter C010 assumption **8** (`confirmed`) — and its figures corrected, see `F-S5-3` and `F-S8-1` |
| The forty-five categories, their authorities, clauses and `Status` markings | `../10_…md` §8, revision `post-validation` (SUB-16 / NEU-979) |
| `CMP-S4-3` (web tier) holds zero of forty-five rows, by construction under `M-A` | `../10_…md` §11; `../11_…md` §9.3 (0 of 16 inventory entries) |
| Clause 3 (presentation exception) is empty under `M-A` | `../07_…md` §6.3 |
| The ownership model `M-A` and its six ordered first-match-wins clauses — the precedent this rule's shape follows | `../07_…md` §6.1 |
| A routing rule published **before** its counts, so the procedure is reproducible by a third party | `../11_…md` §11.1 — the precedent for `R8-2` |
| NEU-890 is the adopted umbrella for charter **C009**; its scope names `server-side` quality gates | Linear NEU-890, *"Specify the course content, problem, assessment, and quality system"* |
| The `server-side` enforcement class and its 15 rows | `docs/research/C009-course-content-quality/09_enforceable-quality-system.md` §3.1 (class definition), §"EQ" table, §"Mechanism distribution" |
| `EQ-S3-12` / `G-NODE-EXISTS` — the application-specific demonstration | Same file, row `EQ-S3-12` |
| `EQ-S1-10` / `G-CITE-RESOLVE` — the reusable-core demonstration | Same file, row `EQ-S1-10` |
| `EQ-S3-2` + `EQ-S3-15` / `G-PRESELECT` — the split demonstration | Same file, rows `EQ-S3-2`, `EQ-S3-15` |
| The `EQ-S3-*` namespace collision (C009's SUB-3, not C010's) | `F-S3-1` |
| `CMP-S4-17` is the only component with egress outside the operator's control | `../05_…md` §3.2 |
| Published core vocabulary the second-operator test reads against | `docs/GLOSSARY.md` — `citation-drift verdict producer`, `drift-verdict cache`, `authenticated principal`, `gate-bearing` |
| Layer does not track distribution rights | `src/domain/algorithms/grade-mapper.ts:10`; `src/transport/context-token-middleware.ts:5`–`:9` |

**Evidence class.** Charter assumptions 8 and 32 are `confirmed` and consumed as criterion inputs — 32 is
cited **in the rule's clauses themselves**, not only here, per `../00_…md`'s requirement. The authority
assignments are `consumed` from `../10_…md`, honoured and not re-derived. The C009 rows are `confirmed`
against that package's published table. The rule itself, and every classification it produces, is
`[unconfirmed]` in the sense that no capability has yet been shipped under it.

**A green type-check or lint line is not evidence about this decision** and appears nowhere above.

---

## Revision trigger

This record is revised — not patched — when any one of the following becomes observable:

1. **Charter assumption 32 changes.** If the open-core split is abandoned, narrowed, or extended — the DP
   application going public, or the core going closed — every clause's distribution-line half is wrong at
   once. The classifications would survive; the consequences would not. This is the trigger most likely to
   fire, because it is a commercial decision outside this charter's reach.
2. **A capability is classified by the rule and the classification is overturned in practice.** One
   overturned classification is evidence about the clause that fired. The remedy is to revise that clause
   with the counter-example recorded, **not** to add an exception list — an exception list is alternative 1
   arriving by the back door.
3. **`R8-2` fires and SUB-13's successor declines to own the routed finding.** The clause then has no
   destination, and a clause that routes into nothing is a stop with extra steps. The **F5.7** warning makes
   this materially likely: SUB-13 (NEU-977) is already merged and closed.
4. **The matrix is revised past `post-validation`.** `R8-2`'s test is stated over the forty-five categories
   of that revision. A new revision obliges re-reading the clause against the new category set, not
   carrying its result forward.
5. **`../11_…md` §13's `R3` verdict re-opens** — its trigger being `A-27`'s invalidation when NEU-892 lands.
   `R8-2`'s scope is stated under `M-A`'s exclusive-writer property; if the ownership model reverses to
   `M-C`, clause 3 of `../07_…md` §6.1 stops being empty and `R8-2`'s "outside the forty-five" test acquires
   a second authority to reason about.
