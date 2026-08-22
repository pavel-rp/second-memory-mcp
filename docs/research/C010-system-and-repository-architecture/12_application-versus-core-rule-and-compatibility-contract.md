# 12 — The application-versus-reusable-core rule, and the backward-compatibility contract

**Task:** NEU-981 (SUB-8) · **Charter:** C010 (umbrella NEU-895) · **Compiled:** 2026-08-22
**Model:** claude-opus-5[1m]
**Covers:** `OUT-6` · **Consumes:** `05_…md` (SUB-4 / NEU-974), `06_…md` (SUB-5 / NEU-975), `07_…md` (SUB-6 / NEU-976), `10_…md` (SUB-16 / NEU-979)
**Consumers:** SUB-9 (NEU-983), SUB-10 (NEU-984), SUB-11 (NEU-985), SUB-12 (NEU-986), NEU-896

---

## 1. What this chapter is, and what it is not

**It is** two published instruments and the evidence that each one works.

1. **A rule** — an ordered, first-match-wins decision procedure (§5) that takes a proposed capability the
   package never enumerated and returns a classification: **application-specific** or **reusable core**
   or **split**, together with the side of the **distribution line** — public MIT core, or private closed
   application — that each part lands on. The licensing consequence is carried **inside** the rule's
   clauses, not appended to them, because charter assumption 32 makes misclassification a
   licensing-and-distribution event rather than an architectural preference.
2. **A compatibility contract** (§8) that fixes the **existing public surface** as this architecture's
   regression boundary, and gives every core change this architecture implies a stated
   backward-compatibility obligation and a named regression-detection method.

**It is not** an implementation plan, a migration script, a test suite, or a repository topology. It
touches **no** file under `src/`, `tests/` or `drizzle/`, and it writes nothing that a downstream charter
must adopt before it can be checked. The topology decision that consumes this rule as its criterion is
**SUB-9 (NEU-983)**'s and is not taken here (§14.2).

**It is also not a re-decision of anything upstream.** SUB-5's identity placement and isolation
invariant, SUB-6's ownership model, and SUB-13's per-category authority assignments as republished by
SUB-16 are **consumed**. Where applying the rule surfaced something that contradicts one of them, this
chapter files a **routed finding** and leaves the upstream artifact untouched (§12).

---

## 2. The revision this chapter resolved against

Every authority assignment cited below is read off one revision of the matrix pair, named here before any
count is reported, exactly as `../11_…md` §2 does:

> **`08_…md` + `10_…md`, revision `post-validation` (SUB-16 / NEU-979)**

That marker string is reproduced verbatim from `../10_…md` §2. It is **SUB-16's post-absorption
republication**, not SUB-13's pre-validation matrix. An audit resolved against the pre-validation matrix
would be resolved against a superseded artifact, and §10's per-item results would be uninterpretable.

The chapter also resolves against a **codebase cutoff**: commit `ad5eebb` on `develop`, 2026-08-22. Every
figure in §7 was re-derived at that cutoff by direct count rather than carried forward from any prior
statement — including this charter's own (§7.4 records why, and what the re-derivation found).

---

## 3. Vocabulary, disambiguated at first use

| Term | Meaning in this chapter |
| --- | --- |
| **Capability** | A behaviour someone proposes the system should have, stated at the level of *what it does for whom*, before any decision about where it lives. The rule's input. |
| **Application-specific** | A capability that cannot be stated without naming an artifact of a **particular** course — a syllabus, a qualification, a subject taxonomy, a grade scale, a content map, or a node within one. |
| **Reusable core** | A capability a second operator, running this server with **no** relationship to any course of ours, would want and could use with the vocabulary the public surface already publishes. |
| **Split** | The rule's third outcome, not a hedge: the capability **decomposes** into a course-noun-free mechanism and a course-specific policy value supplied to it. Both halves are classified, and both land on a stated side of the line. |
| **The distribution line** | The boundary charter assumption 32 fixes: **the general-purpose MCP core is public MIT; the DP course application is private and closed.** Crossing it is a publication event in one direction and a withholding event in the other. |
| **Regression boundary** | The set of published surface properties that this architecture undertakes not to break, enumerated in §8.1. A change that alters one of them is *contract-changed* and owes a detection method. |
| **`DP`** — **read this before grepping** | In the **charter** and in this chapter, `DP` is the **IB Diploma Programme** — the course application on the private side of the line. In `src/`, the only two `DP` tokens (`src/domain/types/teaching.ts:285`, `src/domain/algorithms/grade-mapper.ts:10`) are **Dynamic Programming**, a computer-science teaching concept, evidenced by the surrounding fields `correct_recurrence`, `correct_base_case`, `correct_iteration_order`, `complexity_stated`. They are a naming collision, **not** course leakage. Filed as `F-S8-4` so a future reviewer's grep does not report them as a finding. |
| **Gated tool** | A registered tool whose input schema is not `z.object({}).shape`, and which the HTTP context-token middleware therefore requires a `context_token` from. |
| **Exempt tool** | One of the three tools named in the middleware's own exempt list, each carrying an empty input schema. |

---

## 4. What the rule needs as input, and what it deliberately does not

The rule is applied by **a reader who has only the published artifact** — that is the acceptance
condition (`AC-1`), and it constrains the design more than anything else in this chapter. So each clause
is written as a test the reader can run against the capability's own statement plus artifacts that are
already published in this package or in the public repository.

**The rule needs, and only needs:**

1. The capability's statement, in one or two sentences.
2. `../10_…md` §8 — the forty-five state categories with their authorities and `Status` markings.
3. The public tool surface as it stands (§7), which is readable from the repository.
4. `docs/GLOSSARY.md`, for whether a term is already public vocabulary.

**The rule does not need**, and must not be given, a judgement about whether the capability is *good*,
whether it is *wanted*, or whether it is *feasible*. Those are real questions and none of them is this
one. A rule that quietly absorbs them stops being reproducible, which is the property `AC-1` is actually
asking for.

---

## 5. The rule

**Ordered. First match wins. Every clause returns a classification and a side of the distribution line;
no clause returns "it depends".**

Apply `R8-1` first. If it does not fire, apply `R8-2`. Continue until one fires. `R8-5` always fires, so
the procedure terminates on every input.

---

### `R8-1` — The course-noun test

> **Test.** Rewrite the capability's statement, replacing every proper noun of a course artifact — a
> named syllabus, qualification, subject, grade scale, content map, or a node within one — with a free
> variable. **If the rewritten statement is no longer well-formed** — if it now refers to something that
> must exist for the capability to mean anything, and nothing in the core supplies it — `R8-1` fires.
>
> **Classification:** application-specific.
> **Distribution line:** **private, closed.** Publishing it under MIT publishes the course's structure
> to every self-hoster, which is the *withholding-in-reverse* failure charter assumption 32 names.

**Why this is first.** It is the only clause that can be evaluated without knowing anything about the
core, so it never returns a wrong answer because the reader misunderstood the core. It is also the clause
whose failure is most expensive: a course artifact published under MIT cannot be un-published.

**The test is about well-formedness, not about word-count.** A capability that merely *mentions* a course
in an example does not fire `R8-1`; a capability whose statement collapses without the course does.

---

### `R8-2` — The new-authority test

> **Test.** Does the capability require **write authority** over state that is not one of the forty-five
> categories in `../10_…md` §8, or over a category whose named authority would have to change?
>
> **If yes, `R8-2` fires — and the rule returns no classification.** The output is a **finding routed to
> SUB-13 (NEU-977)**, co-routed to NEU-896 and SUB-12 (NEU-986), because a new category or a reassigned
> authority is SUB-13's decision and this rule may not take it.
> **Distribution line:** **not determined.** It cannot be, until the category exists and has an owner.

**Why this is second, and why it returns nothing.** This is the clause that keeps the rule honest. A
classification rule under pressure will invent a home for a capability rather than admit the category is
missing, and the invented home is always "core" because core is where the machinery is. Firing here
costs a round-trip; not firing here costs an authority assignment taken by the wrong party.

**`R8-2` is a stop, not a verdict.** A reader who reaches it has learned something real — the capability
is not classifiable yet — and that is a better output than a confident wrong answer.

---

### `R8-3` — The mechanism/policy separability test

> **Test.** Does the capability decompose into (a) a **mechanism** whose statement survives `R8-1`'s
> rewrite intact, and (b) one or more **policy values** that do not? Concretely: can you state the
> mechanism as *"given ⟨value⟩, do X"* such that X is fully specified and ⟨value⟩ is the only
> course-dependent part?
>
> **If yes, `R8-3` fires. Classification: split.**
> **Distribution line:** the **mechanism** goes to the **public MIT core**; the **policy values** go to
> the **private closed application**, and are supplied to the mechanism as configuration or as call
> arguments — never compiled into it.

**Why this clause exists at all.** Without it the rule would be forced to send whole capabilities one way
or the other, and the most common real capability in this system is neither: it is a general check
parameterised by a course-specific value. §7 of `../11_…md` shows the same shape from the other side —
the API is general, the values it projects are not. `R8-3` is what stops the rule from either publishing
the course's policy or withholding a general mechanism.

**The obligation the split carries.** A split classification is only honoured if the mechanism, as
shipped to core, contains **no** course value — not as a default, not as an example in its documentation,
not as a test fixture that a reader would take for a specification. `AC-8`'s review (§13) checks exactly
this property over every core surface this chapter proposes.

---

### `R8-4` — The second-operator test

> **Test.** Would an operator running this MCP server with **no** relationship to any course of ours want
> this capability, **and** can it be described using vocabulary the public surface already publishes
> (`docs/GLOSSARY.md`, the tool names, the response envelope)?
>
> **Both halves must hold.** Wanting it without shared vocabulary means the capability drags private
> concepts into the public surface under general-sounding names, which is the *quiet* form of the
> publication failure — worse than the loud one, because nothing in the diff looks course-specific.
>
> **If yes, `R8-4` fires. Classification: reusable core.**
> **Distribution line:** **public MIT.**

**Why the vocabulary half is not optional.** A capability can be genuinely general and still be
unstatable in public vocabulary, in which case shipping it to core either exports a private term or
forces a euphemism. Both are worse than a split. A capability that passes the first half and fails the
second is routed back through `R8-3`: name the mechanism in public terms, and let the private term be a
policy value.

---

### `R8-5` — The default

> **No clause above fired.**
>
> **Classification: application-specific.**
> **Distribution line: private, closed.**

**The default is deliberately the conservative one, and it is asymmetric on purpose.** The two errors are
not equal. Misclassifying application behaviour as core **publishes** it — irreversibly, to every
self-hoster, under a licence that permits redistribution. Misclassifying core behaviour as application
**withholds** it — recoverably, by reclassifying and moving it later. A rule with a symmetric default
would be treating an irreversible error as interchangeable with a reversible one.

**This is the clause most likely to be argued with**, and that is fine: an argument against `R8-5` is an
argument that `R8-4` should have fired, which is a specific, checkable disagreement about the
second-operator test rather than a general one about taste.

---

### 5.1 What the rule does not decide

- **Whether the capability should be built.** The rule classifies; it does not prioritise.
- **Which repository the classified capability lands in.** That is the topology, **SUB-9 (NEU-983)**'s,
  which consumes this rule as its criterion (§14.2).
- **Who writes it.** Ownership of work is not ownership of state.
- **Anything about a category's authority.** `R8-2` routes rather than decides, by construction.

---

## 6. Demonstration — the rule applied

A rule that has only been stated has not been shown to work. It is applied twice: to every core change
this architecture implies (§6.1), and to NEU-890's server-side enforcement points, which it must be able
to send **both** ways (§6.2). A rule that sends everything one way fails the second demonstration by
construction, which is why the second one is the real test.

### 6.1 To every core change this architecture implies

The rule is only worth publishing if it survives contact with the changes this package actually implies.
Six are implied. Each is put through the rule in clause order, and each is carried into §8's contract
with a backward-compatibility obligation and a detection method.

| Id | Implied core change | Source | First clause to fire | Classification | Side of the line |
| --- | --- | --- | --- | --- | --- |
| `CC-S8-1` | **`user_id NOT NULL` on learner-scoped tables, keyed to the authenticated principal** | SUB-5's handover, consuming NEU-850's `OUT-2` | `R8-4` | **reusable core** | public MIT |
| `CC-S8-2` | **A principal bound to the context token at issue time** — `context_tokens` gains a principal column and `init_agent_context` binds it | This chapter, §9 | `R8-4` | **reusable core** | public MIT |
| `CC-S8-3` | **A gate on the STDIO transport** — STDIO carries none today | `../06_…md`; `src/transport/main.ts` | `R8-4` | **reusable core** | public MIT |
| `CC-S8-4` | **A per-call identity argument on gated tools** | The alternative to `CC-S8-2`, priced in §9 | `R8-4` | **reusable core** *(and rejected on other grounds — §9)* | public MIT |
| `CC-S8-5` | **Read-projection and write-intent service of the forty-five categories to a web tier** | SUB-7, `../11_…md` §9 | `R8-4` | **reusable core** | public MIT |
| `CC-S8-6` | **Any tool-contract change forced by a per-category authority assignment** | `../10_…md` §8 | — | **the set is empty** (§10.3) | not applicable |

**Each classification, with the clause evaluation stated rather than asserted:**

**`CC-S8-1` — learner-scoped rows keyed to a principal.** `R8-1` does not fire: rewrite it with every
course noun replaced and it is still well-formed — there are no course nouns in it. `R8-2` does not fire:
it adds no state category and reassigns no authority; it adds a **column** to tables whose categories
already have authorities in `../10_…md` §8, all of them `CMP-S4-9`. `R8-3` does not fire: there is no
policy value to peel off; "the principal" is not course-specific. `R8-4` fires on both halves — any
multi-tenant operator of this server wants per-principal row confinement, and `authenticated principal`
is already public vocabulary in `docs/GLOSSARY.md`. **Reusable, backward-compatible (§8.3), and
non-DP-specific** — which is exactly the three-part claim the scope required of this change.

**`CC-S8-2` — principal bound to the token.** Same evaluation through `R8-1`–`R8-3`. `R8-4` fires: the
capability is *"the server, not the caller, decides whose data a session may reach"*, which every
operator wants and which uses only published vocabulary (`context token`, `authenticated principal`).

**`CC-S8-3` — a STDIO gate.** `R8-4` fires for the same reason. Worth stating explicitly because the
absence is currently load-bearing in the other direction: `../06_…md` records that **no** state category
reaches the `holds` verdict, and STDIO's ungated transport is one of the reasons. A core that ships a
gate on one transport and not the other is publishing a security property that holds only under HTTP —
which §11 requires be said out loud at every use.

**`CC-S8-4` — per-call identity.** Classified **reusable core** by `R8-4` — it is not
application-specific, and the rule says so even though §9 rejects it. **This matters.** A rule that
returned "application-specific" for options it dislikes would be laundering a design preference through a
classification procedure. `CC-S8-4` is core behaviour that this chapter declines to adopt, and those are
two separate statements.

**`CC-S8-5` — projections and intents.** `R8-2` is the interesting check: does serving a projection
require write authority over anything? **No** — `../11_…md` §5.1 establishes that a write-intent is
forwarded as an MCP tool call and the listed authority performs the write. So `R8-2` does not fire, and
`R8-4` does.

**`CC-S8-6` — the authority-driven set is empty.** See §10.3. This is a result, not an omission.

### 6.2 To NEU-890's server-side enforcement points, sent both ways

**What NEU-890 is, stated before its rows are used.** NEU-890 is the adopted umbrella for **charter
C009**, *"Specify the course content, problem, assessment, and quality system"*. Its scope names
*"deterministic, schema, **server-side**, automated, and AI quality gates"*, and the chapter that
publishes them with their enforcement classes is
`docs/research/C009-course-content-quality/09_enforceable-quality-system.md`. Its `server-side` class is
defined there as a requirement whose decision *"require[s] reading a record the unit does not contain"* —
15 of 89 rows. Those rows are this demonstration's material.

**A namespace warning, because the ids collide.** The `EQ-S3-*` ids below belong to **C009's** sub-task 3,
not to C010's SUB-3. This package already resolved that collision as `F-S3-1`. They are cited here as
C009 ids and are never to be read against `../04_…md`.

**The demonstration uses real published rows, not manufactured examples**, because a rule demonstrated on
examples chosen to make it work has not been demonstrated.

---

#### Sent to **application-specific** — `EQ-S3-12`, gate `G-NODE-EXISTS`

> **`S2`** — *"the node is named and exists in the map, in one of CL-1…CL-4"* · `server-side` · `blocks` ·
> authoring-time

**`R8-1` fires, and it is the first clause tried.** Apply the rewrite: replace every course-artifact
proper noun with a free variable. *"The node is named and exists in ⟨a map⟩, in one of ⟨a set of
classes⟩."* The statement is **no longer well-formed** — "the map" is C009's adjudicated DP
knowledge-and-skill map (187 nodes, 572 edges), `CL-1…CL-4` are its coverage classes, and nothing in the
core supplies either. Strip them and the requirement asserts nothing checkable.

**Classification: application-specific. Distribution line: private, closed.**

**What would go wrong if it were sent the other way.** Publishing this gate under MIT publishes the shape
of the course's knowledge map into the public package — the class structure `CL-1…CL-4` and the
expectation that a node identifier resolves within it. That is the *publication* failure charter
assumption 32 names, and it is irreversible.

---

#### Sent to **reusable core** — `EQ-S1-10`, gate `G-CITE-RESOLVE`

> **MAY NEVER 1** — *"no artifact asserts a problem id with no corresponding dated resolution record in
> SUB-3's verification record"* · `server-side` · `blocks` · authoring-time

**`R8-1` does not fire.** Apply the same rewrite: *"no artifact asserts ⟨an external item id⟩ with no
corresponding dated resolution record in ⟨the verification store⟩."* Still well-formed, still checkable,
and it has lost nothing — the requirement was never about problems, or about DP. It is a **provenance
invariant**: an asserted external reference must resolve to a dated observation that it exists.

**`R8-2` does not fire.** It needs no new state category and reassigns no authority. `SC-S3-32`
(problem-citation record, authority `CMP-S4-7`, clause 6) and `SC-S3-33`/`SC-S3-34` (the drift verdict
and its store, authority `CMP-S4-17`) already exist in `../10_…md` §8.

**`R8-3` does not fire.** There is no policy value to peel off. The store's *location* is configuration,
not a course concept; the mechanism is complete without any course-supplied value.

**`R8-4` fires, on both halves.** Any operator whose content cites external sources wants it — a citation
that no longer resolves is a defect in every domain, not in this one. And it is statable in published
vocabulary: `citation-drift verdict producer` and `drift-verdict cache` are already rows in
`docs/GLOSSARY.md`, and `../05_…md` places `CMP-S4-17` as *the only component with egress to a party
outside the operator's control*.

**Classification: reusable core. Distribution line: public MIT.**

**What would go wrong if it were sent the other way.** Withholding it puts a general egress-bearing
component — the one component in the whole model that talks to third parties — on the private side, where
self-hosters cannot see, audit or fix it. That is the *withholding* failure, and unlike the other
direction it is recoverable, which is exactly why `R8-5`'s default is asymmetric (§5).

---

#### Sent to **split** — `EQ-S3-2` and `EQ-S3-15`, gate `G-PRESELECT`

> **`V1`** — *"the candidate was selected by §6's criteria against a named graph node **before** any
> request; a candidate sourced from a response is not repairable"*
> **`X1`** — *"the candidate's origin is not a returned list, ranking or 'recommended set', including one
> returned by a sanctioned request; it cannot be cured after the fact"*

**`R8-1` does not fire on the whole**, and this is the case the rule exists for. The pair decomposes
cleanly under `R8-3`'s test — *given ⟨value⟩, do X*:

| Half | Statement | Survives `R8-1`'s rewrite? | Side |
| --- | --- | --- | --- |
| **Mechanism** | A candidate's **origin** may not be a system-returned list, ranking or recommended set, and the defect is **not curable after the fact** — it must be decided at selection time, from recorded provenance, not re-derived later | **Yes.** No course noun appears. This is a provenance-ordering constraint over any selection process. | **public MIT core** |
| **Policy value** | *Which* named graph node the candidate must have been selected against, and §6's criteria for doing so | **No.** "Named graph node" and "§6's criteria" are C009 map artifacts. | **private, closed application** |

**`R8-3` fires. Classification: split.**

**The obligation the split carries, checked rather than asserted.** The mechanism shipped to core must
carry **no** course value — not as a default, not as a documentation example, not as a test fixture. §13
runs that check over every core surface this chapter proposes and reports the count.

**Why this row is the most useful of the three.** It is the shape most real capabilities have, and it is
the shape a two-outcome rule would have to mangle: forced to choose, a binary rule either publishes
C009's node criteria or withholds a general anti-laundering provenance check. `R8-3` is what makes the
third answer available, and it is available *by rule*, not by discretion.

---

#### The demonstration's result

| Direction | Rows | `AC-2` requirement |
| --- | --- | --- |
| **Application-specific** | `EQ-S3-12` (`G-NODE-EXISTS`) | ≥ 1 — **met** |
| **Reusable core** | `EQ-S1-10` (`G-CITE-RESOLVE`) | ≥ 1 — **met** |
| **Split** | `EQ-S3-2` + `EQ-S3-15` (`G-PRESELECT`) | — |

**The rule does not send everything one way**, which is the property `AC-2` is actually testing. Three
different clauses fired — `R8-1`, `R8-4`, `R8-3` — on rows drawn from the same published table under the
same enforcement class, so the differentiation comes from the rule and not from the selection of rows.

---

## 7. The public surface, re-derived — the regression boundary's actual state

Every figure in this section was produced by direct count at commit `ad5eebb`, not carried forward.
SUB-5's frozen contract instructs SUB-8 to **re-run the command rather than cite any figure**, precisely
because two upstream statements disagree. They do. §7.4 reports what the re-run found.

### 7.1 Registered tools — 46 across 16 modules

| Module (`src/server/`) | Registrations |
| --- | --- |
| `analytics-tools.ts` | 3 |
| `chunk-tools.ts` | 6 |
| `content-tools.ts` | 3 |
| `notes-tools.ts` | 3 |
| `query-tools.ts` | 3 |
| `remediation-tools.ts` | 1 |
| `search-tools.ts` | 1 |
| `server-context-tools.ts` | 1 |
| `server-info-tools.ts` | 1 |
| `server-workflow-tools.ts` | 1 |
| `session-lifecycle-tools.ts` | 4 |
| `session-progress-tools.ts` | 3 |
| `session-tools.ts` | 1 |
| `spaced-repetition-tools.ts` | 7 |
| `teaching-tools.ts` | 5 |
| `topic-tools.ts` | 3 |
| **Total** | **46** |

**Eighteen files match `src/server/*-tools.ts`; sixteen register anything.** `persistence-tools.ts` and
`session-management-tools.ts` register **zero** tools each — they are delegation aggregators that call
the other modules' `register*Tools` functions. The "16 modules" figure is therefore correct and the
"18 files" figure would also be correct; they are not the same claim, and this chapter uses the first.

### 7.2 The gated / exempt split — 43 gated, 3 exempt

The three exempt tools are exactly the three named in the middleware's own exempt list at
`src/transport/context-token-middleware.ts:5`–`:9`, and each carries `z.object({}).shape`:

| Exempt tool | Site |
| --- | --- |
| `init_agent_context` | `src/server/server-context-tools.ts:11` |
| `get_server_info` | `src/server/server-info-tools.ts:8` |
| `get_server_workflow` | `src/server/server-workflow-tools.ts:8` |

**46 − 3 = 43 gated.**

### 7.3 All 43 gated tools already declare `context_token` — 41 + 2

Resolved per tool by following each registration's `inputSchema` to its defining shape constant and
brace-matching the declaration block:

| Where the declaring shape is defined | Gated tools |
| --- | --- |
| `src/domain/types/*.ts`, via a named `*InputShape` constant | **41** |
| `src/server/*.ts` | **2** — `teach_next` (inline `z.object({…}).shape`, `src/server/teaching-tools.ts:19`) and `get_historical_feedback` (locally-defined `GetHistoricalFeedbackInputShape`, `src/server/session-progress-tools.ts:131`, consumed at `:144`) |
| **Declaring `context_token`** | **43 of 43** |
| **Gated tools lacking it** | **0** |

**The substantive claim is held count-independently**, as SUB-5's contract requires: *the set of gated
tools lacking `context_token` is empty.* That statement is true at 42 and true at 43, and it is the only
form in which this chapter's §9 pricing depends on it.

**A precision note the upstream statement flattens.** Of the two shapes defined outside
`src/domain/types/`, only `teach_next` is genuinely *inline* at the registration site.
`get_historical_feedback` is a locally-defined constant. The property that matters — the shape is not in
`src/domain/types/` — holds for both; "inline" is imprecise for the second and is not used here.

### 7.4 The count drift — `F-S5-3` corroborated, and its diagnosis refined (`F-S8-1`)

| Quantity | Charter assumption 8 (`confirmed`, re-verified 2026-08-21) | SUB-5, `../06_…md` §6.2 / §7 | **Re-derived here at `ad5eebb`** |
| --- | --- | --- | --- |
| Registered tools | 45 | 46 | **46** |
| Modules registering ≥1 | 16 | 16 | **16** |
| Exempt | 3 | 3 | **3** |
| Gated | 42 | 43 | **43** |
| Gated tools declaring `context_token` | 42 | 43 | **43** |
| Gated tools lacking it | 0 | 0 | **0** |

**This chapter files no new count.** SUB-5 already filed it as **`F-S5-3`** — *"All 43 gated tools already
declare `context_token`; the charter's 45 / 42 / 40 are stale in all three positions"*. SUB-5's frozen
contract instructed SUB-8 to *re-run the count rather than cite any figure*. The re-run was performed
independently at this chapter's own cutoff and **agrees with `F-S5-3` exactly**, including on the
partition of the 43:

| Partition | SUB-5's cut | This chapter's cut | Same 43? |
| --- | --- | --- | --- |
| — | 42 via a named `*InputShape` (41 imported + 1 module-local) + 1 genuinely inline | 41 defined in `src/domain/types/` + 2 defined in `src/server/` | **Yes.** The module-local `GetHistoricalFeedbackInputShape` and the inline `teach_next` are SUB-5's "1 + 1" and this chapter's "2". The two cuts partition the same set on different axes. |

**What this chapter adds is one word, and it is a correction to `F-S5-3` rather than to the charter.**
`F-S5-3` diagnoses the charter's figures as **stale**. They are not stale; they are a **miscount**.
`git log -1 -- src/server/` returns **`6efd9fe`, 2026-08-04**. The charter's own evidence note records a
re-verification on **2026-08-21** — seventeen days after `src/server/` last changed, against a tree
identical to this one. No tool landed in between, so no elapsed time explains the difference. The
re-verification was run and returned the wrong number.

**Filed as `F-S8-1`** — a refinement of `F-S5-3`, not a duplicate of it — routed to NEU-896 and SUB-12
(NEU-986). The distinction is worth a finding because the two diagnoses imply different remedies: a stale
figure is fixed by re-running the procedure, and this figure was **produced by** running the procedure.
A `confirmed` assumption whose stated evidence procedure yields the wrong number when honestly executed
is a defect in the procedure's reliability, and every downstream consumer that read "42 gated" inherited
it from a note that said it had been checked.

**Nothing in this chapter's conclusions moves.** The pricing in §9 depends only on *"zero gated tools lack
the argument"*, which holds at 42 and at 43 — which is precisely why SUB-5 chose to hold the claim
count-independently, and that judgement is vindicated twice over here.

### 7.5 Registered prompts — 3

`scaffolding`, `chunk_generation`, `chunk_management`, all at `src/transport/create-server.ts:25`, `:45`,
`:80`. Prompts take an `argsSchema`, carry **no** `context_token`, and are not reached by the
context-token middleware.

---

## 8. The compatibility contract

### 8.1 What the regression boundary consists of

This architecture undertakes not to break the following, and §10 audits every item in it:

| Id | Boundary property | Verified state at `ad5eebb` |
| --- | --- | --- |
| `B-1` | The set of **registered tool names** | 46 |
| `B-2` | Each tool's **declared input schema**, field-for-field | 43 gated declaring `context_token`; 3 exempt with empty schemas |
| `B-3` | The **snake_case tool-schema convention** at the MCP boundary | `CLAUDE.md` → Naming Conventions; conversion in `src/server/*-tools.ts` |
| `B-4` | The **response envelope** — `toolData` → `{status:'ok',data}`; `toolError` → `{status:'error',…}` plus `isError: true` | `src/server/tool-helpers.ts:80`, `:53`, `:76` |
| `B-5` | **`content_quality` is the only error type carrying structured per-item `findings`** | `src/server/topic-tools.ts:85`–`:96`; every other type drops them |
| `B-6` | The set of **registered prompt names** and their `argsSchema` | 3 |
| `B-7` | The **exempt-tool list** — which tools may be called with no token | 3, at `src/transport/context-token-middleware.ts:5`–`:9` |

**`B-5` is on this list for a reason that is easy to miss.** It is not a schema property; it is a
*routing* property, invisible to any structural diff of the tool manifest, and a change to it silently
drops data that a caller was relying on. It is the second of this chapter's two
schema-diff-invisible boundary items, the first being `B-7`.

### 8.2 The three regression-detection methods, defined once

| Id | Method | Detects |
| --- | --- | --- |
| `RD-S8-1` | **Cross-principal replay.** Under HTTP, authenticate as principal `P1`, obtain a token, then invoke the tool while authenticated as `P2` — and, separately, invoke it with `P1`'s token from a session that never authenticated. Pre-change both succeed; post-change both must fail. | A break in `CC-S8-1`/`CC-S8-2`'s confinement. **A schema diff cannot see this** — no declared field changes. |
| `RD-S8-2` | **Issue-time binding probe.** Call `init_agent_context` and assert the returned token resolves, server-side, to exactly one principal; assert a token minted with no authenticated principal is refused rather than issued unbound. | A break in `CC-S8-2` at the mint point, including silent fallback to an unbound token. |
| `RD-S8-3` | **Transport-parity probe.** Invoke the same gated tool over STDIO and over HTTP with no token. Today HTTP refuses and STDIO succeeds; after `CC-S8-3` both must refuse. Until then the asymmetry is the *expected* result and the probe records it rather than failing. | A break in `CC-S8-3`, and — run today — it documents the standing gap instead of hiding it. |
| `RD-S8-4` | **Golden manifest snapshot.** Serialize the full tool and prompt manifest — names, schemas field-for-field, prompt `argsSchema` — and diff against a committed golden file. | Any change to `B-1`, `B-2`, `B-6`. This is the method that **proves the "zero schemas newly declaring" claim** in §9 mechanically rather than by assertion. |
| `RD-S8-5` | **Error-envelope and findings-routing probe.** Force each error type and assert the envelope shape, `isError`, and that `findings` survives on `content_quality` and only there. | A break in `B-4`, `B-5`. |

**`RD-S8-4` and `RD-S8-1` are deliberately complementary**, and the pairing is the whole answer to
`AC-6`'s "name a detection method a schema diff would miss": `RD-S8-4` *is* the schema diff, and it is
specified to return **zero delta** under this architecture. If it returns zero delta and nothing else is
checked, a total confinement regression ships green. `RD-S8-1` is the check that has teeth.

### 8.3 Per implied core change — obligation and detection

| Change | Backward-compatibility obligation | Detection |
| --- | --- | --- |
| `CC-S8-1` — `user_id NOT NULL` | **Additive at the wire; breaking at the store.** No tool schema changes; no response field is removed. The migration must backfill existing rows to a principal before the constraint is enforced, and the backfill has no correct value for rows written before any principal existed — so the obligation includes **naming that cohort explicitly** rather than defaulting it to a synthetic principal that would then own real learner data. | `RD-S8-1`, `RD-S8-4` (must show zero delta) |
| `CC-S8-2` — principal bound to the token | **Additive at the wire; semantic at the contract.** `context_tokens` gains a column; no tool schema changes. The `context_token` argument's *meaning* narrows from "a session handle" to "a principal-bearing capability" — clients pass the same value and get a stricter server. Tokens minted before the change carry no principal and **must be rejected, not grandfathered**; grandfathering would leave an unbound-token path open indefinitely. | `RD-S8-2`, `RD-S8-1`, `RD-S8-4` |
| `CC-S8-3` — a STDIO gate | **Breaking, and unavoidably so.** Every existing STDIO client calls with no token today and would begin to fail. The obligation is to state it as a breaking change with a version boundary — not to soften it with a permissive mode, which would reproduce the current gap under a new name. | `RD-S8-3` |
| `CC-S8-4` — per-call identity | **Breaking at the wire** if the argument is required, and **ineffective** if optional. See §9; not adopted. | `RD-S8-4` would show a 43-schema delta |
| `CC-S8-5` — projections and intents | **No obligation on the MCP surface.** The web tier reaches state only through existing tool calls (`../11_…md` §5.1); it adds no tool and changes no schema. | `RD-S8-4` (zero delta) |
| `CC-S8-6` — authority-driven | **The set is empty** (§10.3). No obligation, and this is stated with its count rather than left blank. | — |

---

## 9. Pricing identity: per-call versus token-bound, assessed and chosen

### 9.1 The cost of a per-call identity argument, against the verified schema state

| Priced quantity | Value | Basis |
| --- | --- | --- |
| Tools in the **gated** class | **43** | §7.2 |
| Tools in the **exempt** class | **3**, recorded separately | §7.2 — *not folded into the gated count* |
| Registered prompts | 3, unaffected — no token, not middleware-reached | §7.5 |
| **Schemas newly declaring the argument** | **0** | §7.3 — all 43 already declare `context_token` |
| **Bulk schema migration required** | **None** | Follows directly from the line above |
| **The actual cost** | The **semantics** of reusing or widening an argument already declared to every client as required on every call | §9.2 |
| **Detection method a schema diff would miss** | **`RD-S8-1`, cross-principal replay** | §8.2 |
| **STDIO** | **Has no gate to extend.** `src/transport/main.ts` and `create-server.ts` contain zero references to the middleware or to `context_token`. Extending the gate's semantics extends nothing there. | §11 |

**The pricing's real content is the last three rows, not the first.** The intuitive cost of "carry
identity per call" is a 43-file schema migration and a coordinated client release. That cost is **zero
here**, and reporting it as zero is the point: the slot exists. What is *not* zero is that the same
declared field would change meaning without changing shape — invisible to `RD-S8-4`, invisible to any
client's generated types, invisible in review to anyone reading the diff.

**The exempt three are a separately recorded decision, and it is not uniform.** `init_agent_context` is
the **mint point** — `src/server/server-context-tools.ts:11` calls `ctx.createContextToken()` and returns
the token to the caller. Any identity scheme changes its contract, whichever option is chosen.
`get_server_info` and `get_server_workflow` return static server metadata, touch no learner state, and
change under neither option. **1 of 3 changes; 2 of 3 do not.** Folding all three into the gated count
would have hidden precisely the one that matters.

### 9.2 The assessment

| Criterion (weight stated before scoring) | Per-call identity (`CC-S8-4`) | Token-bound identity (`CC-S8-2`) |
| --- | --- | --- |
| **Forgeability by the caller** — *decisive* | **Fails.** An identity carried in a tool argument is caller-supplied. Nothing in the MCP argument path distinguishes "the client's true subject" from "a subject the client typed". Making it trustworthy requires the server to cross-check it against the transport-level principal — at which point the argument is redundant with the check. | **Holds.** The token is server-minted at `init_agent_context`. Binding the principal at issue time means the caller never names its own identity, so there is nothing to forge. |
| **Wire compatibility** — *high* | Neutral: 0 schemas newly declare (§9.1). | Neutral: 0 schemas newly declare. |
| **Semantic compatibility** — *high* | **Worse.** Widens an argument's meaning across 43 tools at once. | **Better.** Narrows one server-side check; the argument's client-visible contract is unchanged in shape and stricter in effect. |
| **Store cost** — *medium* | None beyond `CC-S8-1`. | One column on one table (`context_tokens`, `src/infrastructure/db/schema.ts:312`–`:321`, currently `id`/`created_at`/`expires_at` only) plus a mint-path change. |
| **Blast radius of getting it wrong** — *high* | 43 call sites, each independently able to trust the wrong value. | One mint point and one middleware check. |
| **Transport coverage** — *high* | **Neither option covers STDIO.** Per-call identity under STDIO would be entirely caller-asserted with no authenticated principal to check against — strictly worse than nothing, because it looks like identity. | Under STDIO there is no authenticated principal to bind, so `init_agent_context` must **refuse to mint a bound token** rather than mint an unbound one. The gap remains and is named (`CC-S8-3`, `OI-S8-2`). |

### 9.3 The choice — this contract obligates the token-bound option

> **The compatibility contract obligates `CC-S8-2`: bind the principal to the context token at issue
> time. `CC-S8-4`, per-call identity, is rejected.**

**Decided on forgeability, which is the criterion weighted decisive before the scoring.** Every other row
is close or neutral. A caller-supplied identity argument is not an identity mechanism; it is a request
that the server trust the caller about the one thing the server must not trust the caller about. The
`context_token` slot's existence on all 43 gated tools — the fact that made per-call identity look cheap
— is exactly what makes the token-bound option cheap **and** sound: the value is already flowing, it is
already server-minted, and only the binding is missing.

Recorded as **`DR-C10-S8-2`**. **Mentioning the alternative without choosing would fail `AC-7`**; the
alternative is chosen against, with the consequence that decided it named.

**Two residuals, carried rather than resolved.** (1) The token-bound option does **not** close STDIO —
`CC-S8-3` remains a separate, breaking core change with no assigned owner (`OI-S8-2`). (2)
`context_tokens` has no principal column today, so the choice is an obligation on unwritten code, not a
description of running code (`OI-S8-1`).

---

## 10. The per-item audit — 49 entries against both drivers

### 10.1 What is audited, and why the count is 49

**Every registered tool and every registered prompt, resolved against both drivers**, with no entry left
conditional on a later sub-task. Both drivers have published and settled, so every entry resolves here.

- **Driver A — the identity change** (SUB-5's handover, as this chapter obligates it in §9.3).
- **Driver B — the per-category authority assignments** (`../10_…md` §8, revision `post-validation`).

**46 tools + 3 prompts = 49.** The acceptance criterion says "each of the 45 tools and 3 prompts"; the
verified surface is 46 tools (§7.1, §7.4). Auditing 45 would leave one registered tool unaudited in order
to match a figure the same evidence procedure disproves. **49 entries; zero conditional.**

### 10.2 Driver A — the identity change

| Verdict | Count | Entries |
| --- | --- | --- |
| **contract-changed — semantics only, zero schema delta** | **43** | All 43 gated tools (§7.3). The declared `context_token` field is unchanged in name, type and requiredness; what changes is that the server resolves it to a principal and confines the call. **Detection: `RD-S8-1`** (cross-principal replay) — a schema diff returns zero delta by design, confirmed by `RD-S8-4`. |
| **contract-changed — mint point** | **1** | `init_agent_context`. It issues the token (`ctx.createContextToken()`, `src/server/server-context-tools.ts:11`) and must bind a principal at issue time, refusing to mint when none exists. Its **input** schema stays empty; its **behaviour** and its failure modes change. **Detection: `RD-S8-2`.** |
| **unchanged** | **5** | `get_server_info`, `get_server_workflow` (static metadata, no learner state, no token); the 3 prompts (`scaffolding`, `chunk_generation`, `chunk_management` — no `context_token`, not middleware-reached). |
| **conditional on a later sub-task** | **0** | — |

**44 changed / 5 unchanged / 0 conditional.**

**Not one of the 44 is a schema change.** `RD-S8-4` is specified to return zero delta across all 49
entries under this driver, and that expected-zero is itself the assertion — a non-zero delta means
someone widened a schema, which this contract does not authorise.

### 10.3 Driver B — the authority assignments

| Verdict | Count |
| --- | --- |
| **contract-changed** | **0** |
| **unchanged** | **49** |
| **conditional on a later sub-task** | **0** |

**This is a result, and it is derived rather than assumed.** `../10_…md` §8 assigns all forty-five
categories, and the distribution of the Authority column is: `CMP-S4-9` (persistence), `CMP-S4-7`
(orchestration), `CMP-S4-4` (HTTP transport edge), `CMP-S4-14` (quality-gate battery), `CMP-S4-17` (drift
verdict producer), `CMP-S4-19` (logging sinks), `CMP-S4-8` (domain core), `CMP-S4-10` (identity
provider). **`CMP-S4-3`, the web tier, holds zero of forty-five rows** — stated by `../10_…md` §11 as
holding *by construction* under `M-A`, and independently confirmed here by reading the Authority column
of all forty-five rows.

Under `M-A` the MCP core is the exclusive writer of every category, so no authority assignment relocates
a write away from the tool surface, and therefore **no tool's contract changes under Driver B**.

### 10.4 `AC-5` — the web-authority tool, and why the criterion is discharged vacuously

`AC-5` asks that a tool writing a state category **assigned to web authority** be recorded as
contract-changed with a detection method named, rather than deferred.

> **The set of such tools is empty, because the set of such categories is empty: 0 of 45 rows name
> `CMP-S4-3`.** The criterion is discharged **vacuously**, and this chapter says so with its count rather
> than manufacturing an entry to satisfy the form of the check.

**The nearest row is `SC-S3-43`, "Web-session / UI interaction state"** — and even it is authored by
`CMP-S4-9` with a write path through `CMP-S4-7`, clause 5, marked `assumed — A-27`. **No MCP tool writes
it today**, so it contributes zero entries to §10.2 or §10.3 as well.

**The conditional statement, so the vacuous pass is still useful.** `../07_…md` §6.3 names `SC-S3-43` as
**the single row a model reversal would move**. If `../07_…md` §5.3's conjunction `R1 ∧ R2 ∧ R3` were
satisfied and `M-C` selected, `SC-S3-43` would take a web authority, and any tool then written to serve
web-session state would become contract-changed with **`RD-S8-1`** as its detection method — a
confinement question, not a schema question. `../11_…md` §13 records `R3` as **not established**, so the
antecedent does not hold at this revision. **Filed as `F-S8-3`** so that the zero is reported as a
finding with its derivation, not left as an empty section a reader might read as unfinished work.

---

## 11. Transport qualification — every claim names where it holds

`AC-9` forbids stating unqualified any claim that holds only under HTTP. The asymmetry is total, so the
qualification is repeated at every use rather than declared once:

| Claim | Holds under HTTP | Holds under STDIO |
| --- | --- | --- |
| Gated tools require a `context_token` | **Yes** — `app.use('/mcp', createContextTokenMiddleware(…))`, `src/transport/http.ts:186`, and only when `contextTokenRepo` is configured | **No** — zero references to the middleware or to `context_token` in `src/transport/main.ts` or `create-server.ts` |
| An authenticated principal exists per request | **Yes, optionally** — `createJwtMiddleware` resolves `payload.sub`, falling back to `azp`, into `res.locals.auth`; mounted only when `authConfig` is set | **No** — none is produced at all |
| Per-principal rate limiting | **Yes** — keyed off `res.locals.auth.sub` | **No** |
| Origin allowlist, audit capture, correlation id | **Yes** — `CMP-S4-4` | **No** — `CMP-S4-5` mounts none of it (`src/transport/main.ts:55`–`:59`) |
| `CC-S8-2`'s issue-time binding | **Yes** | **No principal to bind** — `init_agent_context` must refuse rather than mint unbound |

**Consequence, stated plainly: every security claim this chapter makes is HTTP-qualified**, and the
token-bound choice in §9.3 does not change that. `CC-S8-3` is the change that would, and it has no owner
(`OI-S8-2`).

**The identity plumbing that already exists — consumed, not discovered.** `src/transport/jwt-middleware.ts`
implements per-request identity extraction: OIDC/JWT verification resolving `payload.sub`, **or `azp` for
client-credentials grants**, into `res.locals.auth = { sub, email }`, which
`src/transport/rate-limit-middleware.ts` keys per-subject limiting off. **`../06_…md` §4.1 already
publishes this**, and `docs/GLOSSARY.md`'s `authenticated principal` row states the `sub`-falling-back-to-
`azp` resolution and its consequence — under a `client_credentials` grant the principal is an **OAuth
client, not a person**. That is SUB-5's `F-S5-4` `fails-principal` result, **inherited and not
re-decided**. No finding is filed here; it would duplicate a published one.

**What this chapter does add is a pricing consequence, not a fact.** The plumbing is **entirely decoupled**
from both the `context_token` gate and the database schema — it authenticates the calling agent or
client, never a per-learner data dimension, and nothing wires its `sub` into token minting. So
`CC-S8-2`'s implementation cost is *"connect two existing things"* under HTTP rather than *"build
identity"*, and a reader who priced it from the charter's *"no tool takes a learner/user/subject
argument"* alone would over-price it. Carried into §9.2's store-cost row.

---

## 12. Findings routed rather than absorbed

Applying the rule surfaced four things that contradict or extend a merged input. **None is fixed here** —
this chapter may not amend a merged sibling — and each is routed with a named owner.

| Id | What | Routed to |
| --- | --- | --- |
| `F-S8-1` | `F-S5-3` independently corroborated at a later cutoff (46/43/3, 43 of 43 declaring), and its **diagnosis refined**: the charter's figures are a **miscount**, not staleness — `src/server/` last changed at `6efd9fe`, 2026-08-04, seventeen days before the charter's recorded re-verification (§7.4) | NEU-896, SUB-12 (NEU-986) |
| `F-S8-2` | Two of the 13 ports are characterised as *pure-compute*; `embedding-port` and `content-classifier-port` both wrap **external network calls**. They are *no-DB-row, external-provider I/O* ports — material for an egress boundary and for SUB-9's topology criterion | SUB-4 (NEU-974, closed), SUB-9 (NEU-983), SUB-12 (NEU-986) |
| `F-S8-3` | The authority driver changes **zero** tool contracts; `AC-5` is discharged vacuously, with the conditional statement recorded (§10.4) | SUB-11 (NEU-985), SUB-12 (NEU-986) |
| `F-S8-4` | The two `DP` tokens in `src/` are **Dynamic Programming**, not the Diploma Programme — a naming collision a grep-based leakage audit will misreport | SUB-11 (NEU-985) |

**Two things this chapter deliberately does *not* file**, because each would duplicate a published
finding rather than add one:

- **The tool-surface count itself.** `F-S5-3` filed it. `F-S8-1` is scoped to the *diagnosis*, and says so
  in its own text (§7.4).
- **The `sub`-or-`azp` principal collapse.** `../06_…md` §4.1 publishes it and `F-S5-4` is its finding;
  `docs/GLOSSARY.md`'s `authenticated principal` row already carries the consequence. §11 consumes it and
  adds only a pricing observation.

**Filing a duplicate would not have been an error** — `../91_…md` records that a duplicate entry is
correct-by-convention until SUB-12 reconciles, and that two sub-tasks independently capping the same gap
is *signal*. It is avoided here because in both cases the duplicate would have been **less precise than
the original**, not merely redundant.

**Two of the four route to a closed owner.** That is the accepted **F5.7** warning, shared with SUB-6,
SUB-7 and SUB-15: four sub-tasks route findings backwards to an already-shipped sub-task and nothing
re-dispatches the owner. Each is co-routed to NEU-896 or SUB-12 so no finding is addressed **solely** to
a closed party. The residual — that a back-routed finding goes unactioned — is **carried, not fixed**.

---

## 13. `AC-8` — no DP-specific concept in any proposed core surface

**Reviewed: every core surface this chapter proposes.** That is `CC-S8-1`, `CC-S8-2`, `CC-S8-3`,
`CC-S8-4`, `CC-S8-5` — five surfaces, plus the rule's own vocabulary and the five detection methods.

| Surface | Course-specific concept present? |
| --- | --- |
| `CC-S8-1` — `user_id NOT NULL` keyed to the authenticated principal | **No.** `authenticated principal` is published core vocabulary. |
| `CC-S8-2` — principal bound at token issue time | **No.** |
| `CC-S8-3` — a STDIO gate | **No.** |
| `CC-S8-4` — per-call identity | **No.** |
| `CC-S8-5` — read-projection / write-intent service | **No.** The projections are of the forty-five categories, none of which is course-specific. |
| `R8-1`–`R8-5` and §3's vocabulary | **No.** The rule names *a* course as a variable; it names no course. |
| `RD-S8-1`–`RD-S8-5` | **No.** |

**Count: 0 of 5 core surfaces carry a DP-specific concept; 0 findings.** Independently corroborated
against the codebase: no IB Diploma Programme or course-specific vocabulary appears in any tool name,
schema field or prompt. The only two `DP` tokens in `src/` are Dynamic Programming (§3, `F-S8-4`).

**The reason this section is a table and not a sentence.** `AC-8` says a DP-specific concept in a core
surface is *a finding, not a footnote*. A blanket "we checked and found none" is unfalsifiable; naming
the five surfaces means a reader who disagrees can disagree about a specific one.

---

## 14. What this chapter closes, and what it does not

### 14.1 Closes

1. **`OUT-6`.** The rule is stated as an applicable ordered procedure (§5), demonstrated against every
   implied core change (§6) and against NEU-890's enforcement points **both ways** (see
   `DR-C10-S8-1` §"Demonstration"), and the compatibility contract fixes the regression boundary with a
   per-change obligation and detection method (§8).
2. **The identity option.** Token-bound binding is **chosen**, not merely preferred (§9.3,
   `DR-C10-S8-2`).
3. **The compatibility-surface figures.** Re-derived at `ad5eebb` and reported with the drift filed
   (§7.4).
4. **The authority driver's effect on tool contracts.** Zero, with its derivation (§10.3–§10.4).

### 14.2 Does not close, explicitly

1. **The repository topology.** SUB-9 (NEU-983) consumes this rule as its criterion. This chapter states
   which *side of the distribution line* a capability lands on; it does not state which repository, which
   visibility mechanism, or which packaging realises that side.
2. **STDIO's gate.** `CC-S8-3` is named, classified, priced and left **unowned** (`OI-S8-2`).
3. **`context_tokens`' principal column.** An obligation on unwritten code (`OI-S8-1`).
4. **Whether the detection methods pass.** They are **specified, not run** — no implementation exists to
   run them against and no regression suite exists to host them (`CAP-S8-1`). This chapter's green
   type-check and lint lines are **not** evidence about any claim in it, per `../00_…md` §1.1.
5. **Anything upstream.** Five findings routed (§12); zero merged artifacts amended.

---

## 15. Handoff

| To | What it gets |
| --- | --- |
| **SUB-9 (NEU-983)** | The rule (§5) as the topology criterion, with the distribution-line consequence already carried inside each clause — so the topology decision reads a side, not a judgement. Plus `F-S8-2`: two ports carry external egress, which bears on any split. |
| **SUB-10 (NEU-984)** | `CC-S8-1`–`CC-S8-3` with obligations and detection methods (§8.3); and §11's note that the existing HTTP identity plumbing is decoupled from both the gate and the schema, which changes the implementation cost. |
| **SUB-11 (NEU-985)** | §10's audit as **49 entries, 44 + 0 changed across two drivers, 0 conditional**; `F-S8-3`'s vacuous discharge with its derivation; `F-S8-4`'s grep collision. |
| **SUB-12 (NEU-986)** | `F-S8-1` (a `confirmed` charter assumption whose re-run yields a different figure), `OI-S8-1`, `OI-S8-2`, `CAP-S8-1`. |
| **NEU-896** | `F-S8-1`, and the three findings routed to closed owners under F5.7. |

---

## 16. Verification note

- **Revision resolved against:** `` `08_…md` + `10_…md`, revision `post-validation` (SUB-16 / NEU-979) ``
  — reproduced verbatim from `../10_…md` §2 (§2).
- **Codebase cutoff:** `ad5eebb`, 2026-08-22. Every count re-derived by direct enumeration; **no figure
  carried forward from any prior statement**, per SUB-5's frozen contract.
- **Audit entries:** 49 (46 tools + 3 prompts). Driver A: 44 changed / 5 unchanged. Driver B: 0 changed /
  49 unchanged. **Conditional entries: 0.**
- **Schemas newly declaring an identity argument: 0.** Bulk schema migration: none. Gated 43, exempt 3
  recorded separately (1 of the 3 changes).
- **Core surfaces proposed: 5. Carrying a DP-specific concept: 0.**
- **State categories assigned to a web authority: 0 of 45.** Tools writing one: 0.
- **Merged chapters modified: 0.** Register writes are append-only; `../93_…md` and `../94_…md`
  untouched. Deletions on `../02_…md`, `../90_…md`, `../91_…md`: **0**.
- **A green type-check or lint line is not evidence about this chapter's content** and appears in no
  claim above.
- **`[unconfirmed]` inheritance.** §10.4's conditional statement rests on `../11_…md` §13's `R3` verdict,
  which inherits `A-27`. If `A-27` is invalidated, §10.4's antecedent may begin to hold and the vacuous
  discharge re-opens — recorded as `DR-C10-S8-1`'s revision trigger.
