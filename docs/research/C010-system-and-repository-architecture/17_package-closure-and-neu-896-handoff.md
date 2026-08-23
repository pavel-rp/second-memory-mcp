# 17 — Package Closure, the NEU-896 Handoff, and the Cold Read

**Sub-task:** `SUB-12 (NEU-986)` · **Charter:** C010 (umbrella NEU-895) · **Published:** 2026-08-22
**Covers:** `OUT-11` (stand-in reconciliation and the two decision-ownership records) · `OUT-12` (closure, the completeness gate, the cold read)
**Model:** claude-opus-5[1m]
**Verification cutoff:** `3352c00` (`origin/develop`), 2026-08-22
**Companion:** `94_package-completeness-gate.md` — the item-by-item gate. This chapter is everything the gate needs that is not the gate table itself.

---

## 1. What this chapter is, and the three things it does not do

This is the sixteenth and last chapter of the C010 package. It closes the package: it hands
NEU-896 the reconciliation list, stands both decision-ownership records up as named records,
publishes the risk register with severity and mitigation status, the selected architecture's
success measures and its evolution paths, and records the cold read `OUT-1` and `OUT-12` both
demand.

**It makes no architecture decision, and revises none.** Every gate failure, every cold-read gap
and every finding routed here is either routed onward to a named owner or recorded as a cap with
one. Nothing is closed by editing it away, and no merged sibling chapter, decision record or
register entry is amended, reflowed or renumbered. The three shared registers this chapter writes
to receive a new `### SUB-12` section appended below every existing one; `93_stand-in-assumption-register.md`
is **closed** and receives nothing.

**It does not re-run `NEU-985 (SUB-11)`'s four mechanical audits.** They are consumed as input,
verdicts and all. Re-measuring them would put a second, unreconciled set of counts into the package
at the exact point the package is supposed to stop producing them.

**It does not re-decide any consumed constraint.** `NEU-850`'s `OUT-2`, `OUT-6` and `OUT-7` are
recorded in §5 with their dispositions as their owning sub-tasks settled them; this chapter reports
those dispositions and adds none of its own.

### 1.1 The durability rule this chapter is written under

`_local/` and `docs/wf-plans/` are gitignored. A reader of this package cannot open either, and this
chapter's entire claim is that the package stands without them. **Every fact this chapter draws from
a gitignored tree is therefore restated in full here rather than cited** — the charter's risk table
(§8), its assumptions 19, 30 and 31 (§4.2), the four accepted review warnings and the six that were
repaired (§7.6). Naming `_local/` in order to say it is unreadable is not a violation of the
standalone rule; requiring a reader to *follow* a path into it is (`00_method-and-provenance.md` §3).

### 1.2 One label the closure must not blur

The cold read recorded in §2 was performed by an AI implementation agent. Under
`00_method-and-provenance.md` §1.1 that is a **proxy signal** — the same class as dogfooding,
structured AI review, adversarial evaluation and automated checks. It is **not** external-user
validation and **not** expert validation, and nothing in this chapter or in `94_…md` should be read
as claiming otherwise. What it *is* is the only evidence in the package produced by a party that had
not read the package, and that independence is the whole of its value.

---

## 2. The cold read

### 2.1 The contradiction this had to resolve, and how

`CAP-S11-1` — filed by `SUB-11 (NEU-985)`, owner `SUB-12 (NEU-986)` — records that the independent
cold read is **unperformable by any party inside the package**: *"Two outcomes name the same
verification, and nothing in the package performs it."* This sub-task's own brief nonetheless
requires one.

Both statements are true, and they do not conflict once the disqualifying property is named
precisely. SUB-11 was disqualified **because it had read the package** — its four audits required
reading all 61 files. A reader that has read nothing of this package or this run is not disqualified
by that property. `CAP-S11-1`'s own lifting condition says so directly: *"A cold read performed and
recorded by a reader who has opened nothing but this repository's tracked `docs/research/` tree …
Lifting requires the **record**, not the intention."*

So the cold read was **performed**, not capped. What follows is the record.

### 2.2 The isolation actually enforced — stated so it can be judged

| Control | What was done |
| --- | --- |
| **Context** | A freshly-spawned agent inheriting **none** of this run's context: no dispatch prompt, no plan, no spec, no prior message, no scoreboard. |
| **Filesystem** | The 63 published package files were copied to `_local/scratch/S12-cold-read/package/`, a directory whose parent holds nothing else. The agent was pointed at that path and at nothing else. |
| **Explicit bars** | The repository tree, `src/`, `_local/` (including this task's own folder), `docs/wf-plans/`, the run scoreboard, `CLAUDE.md`, git, the tracker, and the web. |
| **Questions put** | Q1 boundaries and their owners · Q2 authorities, over at least six sampled state categories · Q3 topology, deployment shape, web tier, data store · **Q4 a verbatim list of everything unreachable, contradictory, or requiring a question** · Q5 the deliberate stop (endpoint paths, payload schemas, error catalogues) · Q6 a plain yes/no implementability verdict. |
| **Anti-flattery instruction** | It was told in terms that *"a report claiming nothing was unreachable across a 14,000-line package would be a suspicious result."* |
| **Self-reported compliance** | *"No path outside that directory was read, listed, or grepped; no git command, tracker tool, or web search was run."* … *"No files were read outside the package. No file was edited, created, or modified. The package is byte-identical."* |

### 2.3 The reader's own disclosure about its isolation, quoted verbatim

The reader volunteered a limit on its own isolation without being asked. It is reproduced here in
full because suppressing it would make the isolation claim stronger than the evidence supports:

> **One disclosure, so you can judge it rather than have me judge it for you:** the harness injected
> material I did not seek and could not decline — a SessionStart hook containing a "Project
> Constitution", two background-task completion notices ("Ship NEU-982", "Ship NEU-986"), and a
> deferred-tool listing. I did not read the referenced task output files, did not act on any of it,
> and none of it informs a single finding below. Every citation in this report resolves to a file
> inside the package. **I consider the exercise intact, not void** — but the injections happened and
> you should know.

**The gate's reading of that disclosure, stated rather than left implicit.** The injected material
carried two tracker ids and a process constitution; it carried no package content, no finding, no
figure and no answer to any of the six questions. The isolation that matters for this exercise —
that the reader had not read the package, its charter, or this run's reasoning — held. The isolation
was therefore **strong but not hermetic**, and the record says so. This is recorded as a stated
limit on the evidence, not as a defect: `CAP-S11-1` asks for a reader who has opened nothing but the
tracked `docs/research/` tree, and on the package's own contents that condition was met.

### 2.4 What the reader could reach

- **Boundaries (Q1).** 20 components across 6 zones, 17 boundaries `BND-S4-1` … `BND-S4-17`, 22
  flows, each boundary row carrying zone pair, class, owner and transport. *"This is the strongest
  part of the package — for 15 of 17 boundaries I can name the owning component and the enforcing
  component without inference."* Trust-versus-process classification: *"cleanly distinguished
  throughout; I never had to guess which class a boundary was."*
- **Authorities (Q2).** The assignment machinery reached and reusable: *"`07_…md` §6.1 gives a
  six-clause first-match-wins rule with tie-breaks (a)–(d), and the model selection is quantified …
  with an explicit reversal condition `R1 ∧ R2 ∧ R3` that SUB-10 actually ran … I can apply that
  rule mechanically to a new category."* Six of eight sampled categories returned an unambiguous
  single authority.
- **Topology and deployment (Q3).** *"Determinable without guessing, and this is the cleanest answer
  in the package."* `T2` split-visibility workspace, TypeScript on Node for the web tier, resource
  reads plus named-intent writes, one shared Postgres with the MCP core sole credential holder, two
  processes on one self-managed host with migration exclusive to the core, AI orchestration inside
  the core behind the two existing ports.
- **The deliberate stop (Q5).** *"I searched. There are no HTTP endpoint paths, no request/response
  payload schemas, and no error catalogue anywhere in the package. Zero. And **yes** — the package
  states the stop explicitly, in three places."* It recorded the stop as *"a deliberate scope
  boundary, not a gap."*
- **`93_stand-in-assumption-register.md`**, unprompted: *"exemplary … I checked all five; the claim
  is true. It even flags which fields were derived rather than taken from the charter. I had no
  questions about it."*
- **One thing it checked and refused to report as a gap**: the 61-versus-63 file count and the
  13-versus-14 traceability count both reconcile, because `16_…md` §11 excludes itself and
  `traceability/S11_…md` from its own subject by construction. *"Correct, and stated before I could
  trip over it. Not a gap."*

### 2.5 Q6 — the verdict, verbatim

> **No. I could not start implementing from this package without asking a question.**
>
> Not because of the deliberate stop in Q5 — that is honest and correctly scoped. **I would be
> blocked by contradictions about who writes state**, which is the one thing an architecture package
> exists to settle, and which this package's own `OUT-3` promises to settle.

**This is the answer this gate reports.** `OUT-1`'s and `OUT-12`'s acceptance scenario — *"they
reach the boundaries, the authorities and the topology without asking a question"* — is **not met**.
The cold read was performed, and it returned negative. Recording it as anything else would make
`94_…md` the one document in this programme that cannot be trusted.

### 2.6 The seven blocking questions, verbatim, each routed

Reproduced exactly as the reader put them. **None is answered here** — this sub-task holds no
authority over any of them, and answering one would be the architecture decision this chapter is
barred from making.

| # | The question, verbatim | Already filed as | Routed to |
| --- | --- | --- | --- |
| 1 | *"For `SC-S3-17`, is the writer the one named in `FL-S4-8`/`FL-S4-9` or the one in `FL-S4-20`? I cannot implement a Tier-2 gate against a category with two writers."* | `F-S14-8`, carried forward as `F-S16-4`; `10_…md` §6.3 states it is *"not fixed here"* | `SUB-4 (NEU-974)` as author of `05_…md` — merged and closed, so routed as a residual — and **`NEU-896`**, live. |
| 2 | *"Is the MCP core the exclusive writer of all 45 categories, or does `CMP-S4-17` own `SC-S3-33`/`SC-S3-34`? Both are stated as absolutes."* | `F-S10-6` | `SUB-6 (NEU-976)` — merged and closed, residual — and **`NEU-896`**. See §7.3. |
| 3 | *"§4 says `SC-S3-41` is `assumed` under `A-28`, but §3.6 lists it as `required-by-upstream` and shows `SC-S3-45` as the `A-28` row. Which id is wrong — and does `SC-S3-41` have an assumption backing it or not?"* | **Nothing. Unfiled anywhere in the package.** Filed here as **`F-S12-3`**. | `SUB-3 (NEU-973)` as author of `04_…md` — merged and closed, residual — and **`NEU-896`**. |
| 4 | *"Deletion owner for `SC-S3-16` / `SC-S3-17` — open at its eighth sighting."* | `CAP-S4-1` | Not lifted. See §7.5. |
| 5 | *"Clause 4 of the assignment rule — `CMP-S4-2` or `CMP-S4-10` for `Z-IDP`?"* | `F-S13-2`, still open | `SUB-6 (NEU-976)` — merged, residual — and **`NEU-896`**. |
| 6 | *"What does `F5.5` say? It's cited twice as accepted and its text is in a file I can't open."* | Not a package defect — a durability gap. **Answered in §7.6 by restating `F5.5` in full**, together with the five warnings that were repaired rather than accepted. |
| 7 | *"The count in `04_…md:70` — 41 or 45?"* | `F-S4-2`; never repaired. 45 is correct and is used consistently everywhere else. | `SUB-3 (NEU-973)` — merged, residual — and **`NEU-896`**. |

Collectively these are **`CAP-S12-1`**: five of the seven name an owning sub-task that is merged and
closed, the registers are append-only, and no remaining pass in C010 can reconcile them. Owner:
**`NEU-896`**.

### 2.7 The other gaps the reader recorded, with the package's existing record for each

Recorded so that "seven blocking questions" is not mistaken for "seven problems". These are the
non-blocking gaps the reader named; **each already has a record**, which is itself the reportable
result.

| Gap the reader named | Package record |
| --- | --- |
| `BND-S4-17` has **no owner at all** (`owner: nobody`, class *trust — unenforced*, STDIO only) — *"as the implementer I cannot build an enforcement point for it, because none is specified"* | `05_…md` §4; `OI-S8-2`; `F-S5-4`. Open, owner `SUB-10 (NEU-984)` co-named with `NEU-896`. |
| `BND-S4-16`'s class still reads `undecided — see §4.4` in the file that defines it, though `M-A` resolves it later — *"a navigation defect, not a content gap, but it cost me a lookup"* | `OI-S15-2`, open, owners `SUB-6 (NEU-976)` and `SUB-13 (NEU-977)` |
| 161 unresolvable citations, *"C2 is materially worse than C1"* for exactly this reader | `F-S11-1`. See §7.1 and `DR-C10-S12-2`. |
| ~60 legitimate outward references to `C005-*` / `C009-*` that the package never distinguishes from the broken ones | Consequence of `F-S11-1`; the convention published in `DR-C10-S12-2` is what separates them. |
| Citations to the gitignored charter review log; `F5.5` cited twice and never restated; `F5.1`–`F5.4` and `F5.6` never appearing at all — *"I cannot tell whether they were rejected, never raised, or lost"* | Closed at §7.6 by restating all ten in full. |
| `CAP-S4-1` at its eighth sighting; `CAP-S5-1` (90 evaluations, **zero `holds`**, `fails-principal: 0` meaning *unreached*); `CAP-S8-1` (*"Not one is run."*); `SC-S3-42` and `SC-S3-31` scenario outcomes undefined; the undischarged fifth make-or-reuse record | `CAP-S4-1`, `CAP-S5-1`, `F-S14-2`, `CAP-S8-1`, `F-S14-4`, `F-S14-5`/`F-S10-4`, `F5.9` → **`CAP-S12-2`** (§7.2) |
| 38 tracker-id mis-pairings, none repaired; four wrong pairings in a single 8-row handoff table | `F-S3-2`, `F-S16-1`, `F-S11-4`. See §7.1 and `DR-C10-S12-2`. |
| `OUT-11` and `OUT-12` have no traceability row; `traceability/` holds no `S1` and no `S12` file | `F-S11-3`. **`traceability/S12_package-closure-coverage.md` is published by this sub-task**, carrying `OUT-11` and `OUT-12`. There is still no `S1`, and there must not be: writing SUB-1's coverage into a file SUB-1 did not write is what `F-S11-3` explicitly forbids. |
| `94_…md` ships unanswered | Answered by this sub-task. |
| `92_…md:7` and `:134` say the register is empty of results while it holds four spike records | `F-S6-5`, already filed |
| Findings routed backwards to closed sub-tasks | `OI-S6-2`, `OI-S16-1`, accepted warning `F5.7`. See §7.4 and §7.6. |
| *"the operational envelope around that shape is explicitly absent … I could stand up the process; I could not operate it"* | `CAP-S10-1`, `CAP-S10-2`, `CAP-S10-3`, `CAP-S10-4`, all with named owners |

### 2.8 The reader's overall assessment, quoted because it is the package's honest summary

> The reasoning quality here is high and unusually self-aware … The failure is not analytical, it is
> **integrative**: sixteen sub-tasks each did careful work, recorded their conflicts faithfully in
> `02_findings-register.md`, and **no pass reconciled them**. The package knows almost everything
> that is wrong with it … and repairs almost none of it. It is a package that has been audited but
> not edited.

Filed as **`F-S12-4`**. It is not a complaint about any sub-task; it is a property of the
append-only discipline itself, and the trade is real in both directions — the same rule that leaves
the package unreconciled is the rule that made `F-S11-1`'s single-mechanism character visible at
all. §7.1 states that trade explicitly. What the reader asked for is small and specific:

> **What I would need to unblock:** a single reconciliation pass over the seven questions above, and
> one correction to `01_outcome-register.md` adding a forward pointer to `F-S8-1` … That is a small
> amount of work relative to the package's size.

That reconciliation pass is **`NEU-896`'s**, and it is the single most useful sentence this package
hands forward.

---

## 3. The NEU-896 reconciliation list — exactly the four unbuilt packages' stand-ins

**This list is the reconciliation surface, and only stand-in assumptions belong on it.** It has
**five** entries, drawn from `93_stand-in-assumption-register.md`, which is **closed** at five and
takes no sixth. Everything else this package hands forward is in §4, on a separate list, and a
non-stand-in appearing here would be a named failure of this sub-task.

| Id | Stands in for | The assumption | Tolerance envelope | Invalidating outcome | Re-validation trigger |
| --- | --- | --- | --- | --- | --- |
| **`A-25`** | **NEU-891** (tutoring) | Adaptive hinting needs per-learner, per-node interaction state with sub-second read latency on the learner's path, and at least one AI provider call per hint escalation. | Hint models that read per-learner state and call a provider asynchronously or once per escalation. | A hint model requiring **synchronous multi-turn AI orchestration inside a gate-bearing write path**. | **NEU-891 lands** — its package published under `docs/research/`. |
| **`A-26`** | **NEU-891** (AI budgets) | No latency, privacy or cost budget for AI orchestration exists yet, so the architecture states the envelope it tolerates rather than assuming a budget. | Any budget the stated envelope contains. | A budget the AI-placement decision's envelope cannot contain. | **NEU-891 lands.** |
| **`A-27`** | **NEU-892** (UI) | A rich, stateful, authenticated **learner-facing** web surface whose interaction state is **not gate-bearing** — no mastery gate depends on browser-held state. | Any UI direction in which the browser holds nothing gate-bearing. | A UI direction requiring **offline-capable or client-authoritative learning state**. | **NEU-892 lands.** |
| **`A-28`** | **NEU-893** (production integration) | Learner isolation will be enforced **server-side at or below the port boundary**; the existing production deployment continues to back the product; a backward-compatible migration path for existing global rows exists. | Server-side enforcement mechanisms at or below the port boundary, on the existing deployment. | A finding that safe isolation requires a **separate deployment or datastore**. | **NEU-893 lands.** |
| **`A-29`** | **NEU-894** (handoff) | Course-to-chat handoff needs a bounded, expiring, revocable authorization and context envelope crossing the trust boundary to an external MCP client, with no continuous bidirectional state sync. | Envelope-based handoffs with expiry and revocation. | A handoff design requiring the external client to hold **write authority over any state category**. | **NEU-894 lands.** |

**Coverage, as `OUT-11`'s own verification clause requires it and as `16_…md` §4.1 measured it:**
5 entries, **4 packages** covered (NEU-891 ×2, NEU-892, NEU-893, NEU-894), **0 entries missing a
required field**. Each of the five is cited **outside** the register — in **22, 9, 39, 26 and 21**
package files respectively — so not one is appendix-only, and every decision resting on a stand-in
names it in place.

**The three decisions that rest wholly on one stand-in, named so NEU-896 knows what moves if it
falls.** `CAP-S15-2` records that all three of SUB-15's decisions rest on `A-27`; `OI-S7-1` and
`OI-S7-2` both record readings of `A-27`'s scope; `SC-S3-43` and `SC-S3-44` carry `assumed — A-27`
and `assumed — A-29` in the matrix; `SC-S3-45` carries `assumed — A-28`. `A-28`'s three clauses are
also exactly the three inputs the circularity record (§6) names as assumed rather than derived.

---

## 4. The non-stand-in handover — a separate list, deliberately

**Everything below is handed to NEU-896 and is NOT on the reconciliation surface.** It is listed
separately because `93_…md`'s admission rule is narrow — a stand-in stands in for a **missing
upstream package** — and a non-stand-in leaking onto the reconciliation list would tell NEU-896 to
reconcile it against a package landing, which will never resolve it.

### 4.1 The still-open items, with owners

Fourteen `OI-*` entries are open at close. Their full text is in
`90_open-items-and-provisional-register.md`; the owners are restated here so a reader of this
chapter alone can route.

| Id | One-line subject | Owner at close |
| --- | --- | --- |
| `OI-S1-2` | The authenticated subject may be an OAuth client, not a human (charter assumption 30) | **`NEU-893`** |
| `OI-S3-1` | Learner-scoping is open for most of the inventory; its closure condition as written is unsatisfiable | **`NEU-896`** — see §4.3 |
| `OI-S5-1` | Whether `NEU-850`'s `OUT-2` ranges over the two port-less log tables | **`NEU-850`**, via its `OUT-1` drift check |
| `OI-S5-2` | Will the resolved identity carry its `sub`/`azp` provenance | **`NEU-893`** |
| `OI-S7-1` | Whether the web tier holds a server-side session binding | `SUB-15 (NEU-982)` — merged without deciding it; **`NEU-896`** |
| `OI-S7-2` | Whether a creator shares the learner-facing web surface | `SUB-15 (NEU-982)` — merged; or **`NEU-892` lands** |
| `OI-S8-1` | `context_tokens` names no principal, so the obligated binding has nothing to bind to | **`SUB-10 (NEU-984)`** — merged; **`NEU-896`** |
| `OI-S8-2` | STDIO has no gate to extend; `CC-S8-3` and `BND-S4-17` have no owner | **`SUB-10 (NEU-984)`** co-named **`NEU-896`** |
| `OI-S9-1` | Nothing consumes the core as a published artifact, and the failure mode is already latent (`F-S9-3`) | **`NEU-896`** |
| `OI-S9-2` | The publish filter must be an allowlist, and none exists (`F-S9-4`) | **`NEU-896`** |
| `OI-S9-3` | Which `package.json` `NEU-850`'s `OUT-6` means under a workspace | **`NEU-850`** |
| `OI-S12-1` | No mechanical link check enforces the citation convention this gate publishes | **`NEU-896`** |
| `OI-S15-1` | The read surface's entry count depends on SUB-13's disposition of `F-S7-1`/`F-S7-2` | `SUB-13 (NEU-977)` — merged; **`NEU-896`** |
| `OI-S15-2` | Whether the web tier keeps a server-side session store — material on two limbs, two owners | `SUB-6 (NEU-976)` + `SUB-13 (NEU-977)` — both merged; **`NEU-896`** |

Thirteen further `OI-*` entries reached a recorded disposition inside the charter and are closed:
`OI-S1-1`, `OI-S1-3`, `OI-S2-1`, `OI-S2-2`, `OI-S3-2`, `OI-S4-1`, `OI-S5-3`, `OI-S6-1`, `OI-S6-2`,
`OI-S9-4`, `OI-S13-1`, `OI-S14-1`, `OI-S16-1`. **Twenty-seven distinct ids; 14 open, 13 closed;
every open one names an owner.**

### 4.2 The charter's three non-stand-in `[unconfirmed]` assumptions, restated in full

`OI-S1-1`, `OI-S1-2` and `OI-S1-3` are the charter's numbered assumptions 19, 30 and 31 — the
`[unconfirmed]` items that are **not** stand-ins. The charter is gitignored, so their text is
restated here rather than cited.

**Assumption 19 — the authoring-time execution environment.** *"An authoring-time execution
environment is nonetheless implied by NEU-890's `automated` gate class, which is defined as requiring
'an execution environment, and a re-run budget', with gate `EQ-S4-6` running an authored approach
over authored fixtures. Whether this is an architectural component of the selected system, and with
what isolation and trust boundary, is `OUT-9`'s to decide — it is recorded here as the tension to
resolve, not as a settled placement."* Status `[unconfirmed]`. **Disposition:** `OI-S1-1` was
**resolved** by `SUB-2 (NEU-972)`, which kept the component (`DR-C10-S2-2`). Its residue is not this
assumption but the undischarged make-or-reuse record — `F5.9`, §7.2, **`CAP-S12-2`**.

**Assumption 30 — the subject may be an OAuth client.** *"The `subject` a token yields may be a human
learner or an OAuth client, since `payload.sub || azp` resolves to the client for client_credentials
grants (Rauthy sets `sub=null` there), and the deployment's own smoke tests use exactly that grant.
Whether the production learner flow yields a human `sub` is treated as unverified until NEU-893
confirms it against a live token."* Status `[unconfirmed]`. **Disposition:** `OI-S1-2` is **open**.
`SUB-5 (NEU-975)` half-discharged it — the invariant's `I5` check and verdict `fails-principal` state
what the invariant means in each case (`06_…md` §4.1) — and routed the remaining fact to this gate.
**This gate settles it as follows: ownership moves to `NEU-893`, and it is not settled here.** No
party inside this charter can inspect a live production token; asserting an answer would be exactly
the fabrication the package forbids. This is `06_…md` List B question **`H5`**.

**Assumption 31 — the operator facts.** *"Hosting region, provider, TLS termination, backup and
monitoring arrangements are not discoverable in the repository. The only signals are a `deploy` VPS
user, an `.ee` domain on the test host and the Rauthy AS. Anything the package needs from these is
marked `[unconfirmed]` and confirmed with the operator rather than assumed."* Status `[unconfirmed]`.
**Disposition:** `OI-S1-3` was **discharged by conversion to `CAP-S10-1`** by `SUB-10 (NEU-984)`,
which ran with no interactive channel and recorded that inventing an operator answer would be the
assertion `OUT-8` forbids. Three facts in `15_…md` §9's production-compatibility assessment return
*cannot be determined* on that cap's account.

### 4.3 One closure condition restated, because it was unsatisfiable as written

`F-S13-3` routes to `SUB-12 (NEU-986)` *"the only party that can restate a closure condition without
violating the append convention"*, and `SUB-14 (NEU-978)` confirmed it hit the same wall.

`OI-S3-1`'s closure condition requires the matrix to carry **a resolved learner-scoping value for
every `SC-S3-*` row**. `04_state-category-inventory.md` §2 defines that column as recording the
scoping **question, never a schema fact**, and §6 establishes by a four-term search that **no
ownership column exists on any table today**. A matrix that resolved the column would be asserting a
schema fact the package forbids it to assert. The condition is therefore unsatisfiable by any
document that respects `04_…md` §6.

**Restated, without editing SUB-3's entry:** `OI-S3-1` closes when (a) a per-row learner-scoping
judgement is published — **already done**, `09_…md` §5 covers all 45 rows and §4.2 re-derives the
`I1` census independently as 19 explicit `no` / 18 `question — open` / 8 explicit `yes` → **26 in
domain**, agreeing with `06_…md` §3.3 — **and** (b) the ownership column exists in the tree, at which
point the value stops being a question and becomes a readable fact. **Half (b) is not a documentation
act at all**, which is why no C010 sub-task could discharge it. **Owner moves to `NEU-896`**, which
converges the implementation charters; `NEU-893` supplies the mechanism. `OI-S3-1`'s original entry
is untouched, and `F-S13-3` is not re-filed.

---

## 5. The C003 / NEU-850 decision-ownership record

This is the second of the two named records `README.md` says NEU-896 converges over, and the one
`02_findings-register.md` § SUB-1 deliberately left for this sub-task. It is filed as **`F-S12-1`**.
It is a **record of dispositions already settled by their owning sub-tasks**, gathered into one
place. **Nothing here is re-decided**, and this package's own outcome ids are never confused with
NEU-850's — every id below is written as `NEU-850's OUT-n`.

**Why the collision exists.** C003/NEU-850 converged three outcomes that overlap this charter's
subject. Two competing authorities over one decision is the risk; the charter's disposition, carried
as assumption 24 and labelled `confirmed`, is that **all three are consumed constraints with a
bounded routed-amendment right** exercised only where this package's evidence *actively contradicts*
one. NEU-850 is **converged but unimplemented** (tracker status Backlog at the 2026-08-19 read; the
schema still carries no ownership column), so each is a **decision to honour, never an existing
fact**. There is no NEU-850 package under `docs/research/` — its charter is in the gitignored
`docs/wf-plans/` tree — so each constraint's substance is carried in below rather than pointed at.

| Constraint | What it decided | Where this package consumes it | Amendment disposition |
| --- | --- | --- | --- |
| **`NEU-850`'s `OUT-2`** | Learner ownership lives in **the MCP core database schema, keyed to the JWT subject**: a `user_id` column, `NOT NULL`, on every core table, with the JWT subject threaded through the **9 row-owning repository ports** rather than resolved ad hoc at each call site. | `06_isolation-invariant-and-the-neu-893-split.md` §1, which takes the **placement** as settled and adds the **property** placement is in service of. `04_…md` §2 and §6 keep it a decision, never a schema fact. | **No amendment routed.** `06_…md` §2. |
| **`NEU-850`'s `OUT-6`** | Remove `package.json`'s `"private": true` and publish the general-purpose MCP core to a public registry under MIT. | `14_repository-topology-decision.md` §3.2, as weighted criterion input **(b)** to the topology trade; migration step **`M5`** is what makes it executable, since the core is not consumable as a dependency today (`F-S9-3`). | **No amendment routed.** `14_…md` §7.2. |
| **`NEU-850`'s `OUT-7`** | A **separate private repository** for the cloud tenant/billing/dashboard layer, with **"zero cloud-business code"** in the MIT repo. | `14_…md` §7 — consumed unchanged. The cloud business layer is **not** an alternative in `14_…md` §4 and is not scored; it sits alongside the selected topology in its own repository (`M10`). | **No amendment routed.** `14_…md` §7.2. |

### 5.1 `NEU-850`'s `OUT-7`'s overlap is **partial**, and this is the reason

**`NEU-850`'s `OUT-7` binds the cloud tenant/billing/dashboard business layer. It does not name the
DP course application.** The two outcomes ask the same-shaped question — *"which repository does this
tree live in?"* — and diverge in **subject**. `NEU-850`'s `OUT-7` fixes the placement of a third
tree; **the DP course application's placement is this charter's own `OUT-7` to decide**, and
`DR-C10-S9-1` decides it (`T2`, the split-visibility workspace). Charter assumption 24 records the
same reading. Stating the overlap as partial is what stops a reader treating this charter's `OUT-7`
as already decided elsewhere — the exact failure mode the charter's High-severity risk names.

### 5.2 The two amendment candidates that were examined and rejected

Recorded because *"no amendment routed"* is worth much less if nobody can see what was tested
(`06_…md` §2).

- **Candidate A — the two operational log tables are behind no repository port**, so `OUT-2`'s stated
  mechanism cannot reach them. `infrastructure.mcp_request_log` (`SC-S3-16`) and
  `infrastructure.operation_event_log` (`SC-S3-17`) are created by raw SQL migrations and written
  from the pino transports, not through any of the 13 ports. **Rejected** as a *scope* question about
  what "every core table" ranges over, not a contradiction of what `OUT-2` decided. Filed instead as
  **`OI-S5-1`**, owned by `NEU-850` through its `OUT-1` drift check.
- **Candidate B — the placement is insufficient for isolation.** The full `OUT-2` change lands and
  **no state category reaches `holds`**, because the binding constraint is the transport rather than
  the schema. **Rejected**: "necessary but not sufficient" is not a contradiction of a placement
  decision, and every further condition is on `NEU-893`'s List B.
- **What would have cleared the bar**, recorded so the disposition is falsifiable: evidence that the
  JWT subject is **not** a viable ownership key — that it is not stable across a learner's sessions,
  or that the row-owning ports cannot carry it. **Neither was found.**

`14_…md` §7.2 records the parallel disposition for `OUT-6`/`OUT-7`: *"This chapter's evidence does
not actively contradict either `OUT-6` or `OUT-7`."* One **mechanical** note is attached rather than
an amendment — under a workspace there are two manifests, and removing `"private": true` from the
**root** one would satisfy `OUT-6`'s letter while inverting its intent. That is `OI-S9-3`, owner
`NEU-850`.

### 5.3 `NEU-35` — the pre-existing duplicate

`NEU-35` is noted as the pre-existing tracker duplicate of the C003 topology decision, so the backlog
keeps **one** source of truth. This package does not touch it, does not close it, and does not route
work to it; it is recorded here because the charter's mitigation for the divergence risk names it
and a reader converging C003 against C010 needs to know it exists.

### 5.4 The count that matters

**Zero `NEU-850` constraints are re-decided by this package.** Three consumed, three dispositions,
**three "no amendment routed"**, two rejected candidates recorded with the bar they failed, one
partial-overlap statement, two mechanical notes filed as open items owned by `NEU-850`
(`OI-S5-1`, `OI-S9-3`).

---

## 6. The NEU-893 circularity record

Carried forward from `F-S1-1` and updated at closure. Filed by SUB-1; **not re-filed here**, and
SUB-1's entry is untouched.

**The finding.** **C005's `OUT-9`** (NEU-893, safe production integration and learner isolation)
presupposes an application architecture, and **C005's `OUT-8`** — this package — needs the ownership
model NEU-893 would settle. The dependency runs both ways, so one of the two had to proceed on
assumptions, and **it is this one**. (Both ids there are **program-level C005 outcomes**, not this
package's own `OUT-8`/`OUT-9`.) NEU-891, NEU-892, NEU-893 and NEU-894 were all Backlog and unstarted
at the 2026-08-19 tracker read; the choice to proceed rather than block was recorded, not defaulted
into.

### 6.1 What was assumed rather than derived — confirmed at closure

| Input | Id | Status at closure |
| --- | --- | --- |
| Learner isolation will be enforced **server-side at or below the port boundary** | `A-28` | **assumed** — `[unconfirmed]` stand-in. Unchanged. |
| The **existing production deployment continues to back the product** | `A-28` | **assumed** — `[unconfirmed]` stand-in. Unchanged. |
| A **backward-compatible migration path for existing global rows** exists | `A-28` | **assumed** — `[unconfirmed]` stand-in. Unchanged. |
| The authenticated subject a production token yields is a **human learner** rather than an OAuth client | `OI-S1-2` | **unverified**, and still unverified at closure — no live token was inspected by any sub-task. Owner moves to `NEU-893` (§4.2). |

**And what is *not* assumed:** learner-ownership **placement** is **consumed** from `NEU-850`'s
`OUT-2` with its source cited (§5) — a decision to honour, not a guess. The deployment facts (single
self-hosted VPS, unversioned compose stack outside the repository, no Dockerfile, no IaC, no
rollback, automatic migration on boot, process-local in-memory state) are **confirmed against the
repository**, not assumed from NEU-893.

**The circularity is narrower than it first appears**, and the boundary is the point of the record:
**three clauses of one stand-in plus one unverified transport fact** — not the whole isolation
question. Nothing found between SUB-1's filing and this closure widens it.

### 6.2 What this closure adds — the isolation residue list `NEU-893` receives

`06_…md` §5.3's **List B**, handed over in full so NEU-893 starts from this boundary rather than
rediscovering it. Eight questions; the disjointness audit reports **10 on List A, 8 on List B, 0 on
both, 0 on neither**, over a universe of 18 — with `06_…md` §5.5's own caveat carried forward
verbatim, that the "0 on neither" is **definitional rather than empirical**, and that what was
genuinely checked is that no question sits on two lists, that every question the five checks generate
was assigned, and that the seven questions falling outside the split are named with their owners.

| # | Question handed to NEU-893 | Carried input |
| --- | --- | --- |
| **`H1`** | Identity mapping to the production Rauthy IdP. | `OI-S1-2`, `OI-S5-2` |
| **`H2`** | Migration of the existing global rows — every row today is unowned. | `06_…md` §7's zero-ownership-column fact |
| **`H3`** | Staged rollout. | `06_…md` §4.3's sequencing consequence |
| **`H4`** | Rollback. | — |
| **`H5`** | Does the production learner flow yield a human `sub`? Needs a live production token; nothing in this package can inspect one. | `OI-S1-2` |
| **`H6`** | Will the resolved identity carry its `sub`/`azp` provenance, so `I5` is answerable at all? | `OI-S5-2` |
| **`H7`** | An identity gate on the transport that has none, so `I4` can pass on both. `BND-S4-17`, owner `nobody`. | `F-S4-5`, `F-S5-4` |
| **`H8`** | Where the enforcement is mechanically implemented, at or below the port boundary. | `A-28`'s envelope, `F-S5-2` |

`H1`–`H4` are the four the charter names for NEU-893; each appears on List B exactly once and on that
list only. **`H6` and `H7` are the two the charter did not name** — they are this package's addition,
and they are the reason the handover is worth more than the charter's own list. `06_…md` §4.3's
sequencing consequence travels with them: **closing STDIO surfaces the `sub`/`azp` defect rather than
resolving it.**

### 6.3 The residual NEU-893 must not misread

**Nothing in this package proves isolation in running code.** The invariant was applied to all 45
rows under two named target states — 90 row-evaluations — and returned **zero `holds`**.
`fails-principal: 0` means the check was **unreached**, never passed (`F-S14-2`). `CAP-S5-1` stands:
zero `holds` is consistent with the invariant being unsatisfiable *and* with the mechanism merely
being unimplemented, and `06_…md` §3.4.1's asymmetry rule means no census can distinguish them.
NEU-893 builds the mechanism; this package placed the property.

---

## 7. Dispositions of everything routed to this gate

**No finding below is closed by editing it away.** Each is either routed to a named owner or recorded
as a cap with one. Where the owning sub-task is merged and closed, the routing is recorded as a
**residual** under the charter's accepted warning `F5.7` pattern and co-named to `NEU-896`, which is
live — so nothing is routed to a closed owner alone.

### 7.1 `SUB-11 (NEU-985)`'s seven findings

| Finding | Subject | Disposition |
| --- | --- | --- |
| **`F-S11-1`** | 161 of 1,420 path citations do not resolve; **159 are one mechanism** — relative depth off by exactly one level in two opposite directions. 129 spurious `../` (C1), 30 one `../` short (C2), 2 bare upstream filenames (C3). Twelve of sixteen sub-tasks represented. | **Decided, not repaired.** The erratum-versus-convention question SUB-11 routed here is answered in **`DR-C10-S12-2`**: a **standing citation convention with a mechanical check**, no erratum pass, no repair of merged files. Per-owner counts stand as SUB-11 recorded them (SUB-2 43, SUB-6 32, SUB-3 23, SUB-13 17, SUB-4 14, SUB-5 7, SUB-15 7, SUB-7 6, SUB-9 5, SUB-14 3, SUB-16 3, SUB-10 1). The enforcement half is **`OI-S12-1`**, owner `NEU-896`. **Severity is reported as SUB-11 measured it and not inflated:** 159 occurrences of one mechanical defect is materially less serious than 161 independent ones, and the gate says so. |
| **`F-S11-2`** | `04_…md` cites two C009 documents by bare filename, with no directory — a **plausible wrong resolution to a same-numbered sibling**, which fails silently and confidently. | Routed to **`SUB-3 (NEU-973)`** as author — merged, residual — and to **`NEU-896`**. Folded into `DR-C10-S12-2`'s convention, which requires every upstream reference to carry its package directory. |
| **`F-S11-3`** | `OUT-11` and `OUT-12` have no traceability row, though both are substantively discharged; the cause is `traceability/README.md:7` — SUB-1 declared the folder's shape and wrote no file. | **Discharged in the only permitted direction.** `traceability/S12_package-closure-coverage.md` is published here, carrying `OUT-11` and `OUT-12`, which are the two outcomes **this** sub-task covers. There is still no `S1` file and there must not be — writing SUB-1's coverage into a file SUB-1 did not write is what the finding explicitly forbids. Coverage of `OUT-1` … `OUT-12` is now **12 / 12**. |
| **`F-S11-4`** | The label↔id check run over 843 pairs: 61 mismatches → 19 corrective quotations, 3 correct cross-charter references, 1 ambiguity, **38 genuine mis-pairings**. `F-S3-2`'s 13 and `F-S16-1`'s 24 reproduce exactly; **the 38th is new** — `09_…md:1342` writes `SUB-7 (NEU-982)`, mis-delivering a warning against conflating two audits. | **Decided, not repaired**, in `DR-C10-S12-2`: the tracker map is restated in full at `16_…md` §8.1 and in `F-S11-4`, so every mis-pairing is recoverable; repairing 38 pairs across ten merged files would destroy the audit's evidence. Routed to **`SUB-14 (NEU-978)`** as author of the new occurrence and to **`SUB-16 (NEU-979)`**, whose `F-S16-1` undercounts by one and names three families where there are four — both merged, residual — and to **`SUB-7 (NEU-980)`**, the actual addressee of `09_…md:1342`, named by sub-task rather than by the id written in the file. Co-named **`NEU-896`**. |
| **`F-S11-5`** | `01_outcome-register.md` publishes the charter's superseded figures in **11 places** with no forward pointer: *"45 tools and 3 prompts"* / *"42 gated"*, and *"165 TypeScript source files, ~25,200 lines, 197 test files"*. | **Recorded, not corrected — and the two are not the same kind of divergence.** `OUT-7`'s repository figures are **stale**: SUB-9's re-measurement gives **169 TypeScript source files, 26,816 lines, 202 test files, 25 migrations**, and **720 commits (468 human, 252 automated)**. `OUT-6`'s tool figure is a **miscount, not staleness** — one tool that was always there and was never counted: the frozen surface is **46 tools / 43 gated / 3 exempt / 49 audit entries** (`F-S8-1`, refining `F-S5-3`). **This chapter and `94_…md` are the forward pointer** the register lacks; the register itself is merged and `00_…md` §3 grants SUB-1 exactly two restatement edits, both already spent. Routed to **`SUB-1 (NEU-971)`** — merged, residual — and **`NEU-896`**, whose reconciliation pass the cold read named this as half of. |
| **`F-S11-6`** | Four coined product-domain terms have no `docs/GLOSSARY.md` row: `state category`, `read-projection`, `write-intent`, `split-visibility workspace` — and the glossary's own `isolation invariant` row cross-references `state category`, so **the glossary points at a term it does not define**. | **Discharged by action.** The four rows are added to `docs/GLOSSARY.md` by this sub-task, in the same change. This is the one repair this gate performs, and the reason it is permitted where the others are not: it **adds** to a tracked file *outside* the package rather than editing a merged chapter or a register entry, it destroys no audit evidence, and the project's standing glossary discipline requires a domain term to carry its row. All four coining sub-tasks (`SUB-3`, `SUB-7` ×2, `SUB-9`) are merged and closed, so no other party could act. |
| **`F-S11-7`** | `03_…md:189` writes `SUB-10 (NEU-966)` unqualified in a chapter that also uses `SUB-10` for this charter's SUB-10 — a **correct** id whose charter is left implicit. | Routed to **`SUB-2 (NEU-972)`** — merged, residual — and folded into `DR-C10-S12-2`, whose convention requires every cross-charter sub-task label to carry its charter. SUB-11's own restraint is carried forward: filing all four occurrences as drift would have been a **manufactured finding**, and this gate does not re-inflate it. |

**`CAP-S11-1` — the cold read.** **Lifted.** Its stated lifting condition is *"a cold read performed
and recorded by a reader who has opened nothing but this repository's tracked `docs/research/`
tree … Lifting requires the record, not the intention."* §2 is that record: the isolation enforced
is stated (§2.2), the reader's own disclosure about the limit of that isolation is quoted verbatim
(§2.3), what it could not reach is quoted verbatim (§2.6, §2.7), and its verdict is reported as
returned (§2.5). **Lifting the cap does not mean the package passed the test — it means the test was
run.** It returned **negative**, and that negative is `CAP-S12-1` and `F-S12-2`.

### 7.2 `F5.9` — the undischarged fifth make-or-reuse capability

**Undischarged, and it stays visible.** The charter's accepted warning `F5.9` reads, in full:

> The make-or-reuse set is a closed four; `OUT-9`'s authoring-time execution component may add a
> fifth whose build/reuse/adopt decision no sub-task owns if SUB-2 keeps it.

**SUB-2 kept it.** `DR-C10-S2-2`'s decision reads: *"An authoring-time execution environment is an
architectural component of the selected system."* It carries an **isolation boundary the host can
terminate**, one isolate per executed unit, and a **wall-clock resource bound**, with a trust
boundary of `first-party, creator-authored code`. (This is **not** the learner-facing environment —
`DR-C10-S2-1` eliminated that, and the two must never be conflated.) An isolation boundary the host
can terminate is a **boundary**, so by `13_…md`'s own architecture-material rule the capability is
architecture-material and a make-or-reuse record is owed. `15_…md` §8.6 states the disposition
plainly: *"the list stays closed at four, as published. `OUT-8`'s make-or-reuse requirement is left
undischarged for the authoring-time execution environment. This is declared, not absorbed."*

**This gate does not discharge it by assertion, and does not extend the list to five.** No sub-task
in this charter owns the build/reuse/adopt decision; SUB-2 out-of-scoped the runtime, sandbox and
scheduling mechanism, and `SUB-10 (NEU-984)` selected no isolation primitive. Recorded as
**`CAP-S12-2`**, owner **`NEU-896`** — named alone because it is discharged by making a decision no
party inside this charter holds, and because the charter's own review accepted the warning rather
than assigning it.

### 7.3 `F-S10-6` — the unresolved upstream authority conflict

**Recorded with its owner; not resolved here, and not resolved anywhere in the package.**
`DR-C10-S6-1` is titled *"The MCP core is the exclusive writer of every state category (all-MCP)"*
and its decision reads *"the MCP core is the exclusive writer of all 45 categories."* The
**republished** matrix assigns `SC-S3-33` (cached citation-drift verdict) and `SC-S3-34` (verdict
store) to **`CMP-S4-17`**, and `10_…md:227` calls `CMP-S4-17` the cache's *"only writer."* If
`CMP-S4-17` is the only writer of `SC-S3-33`, the MCP core is not the exclusive writer of all 45.
**Neither artifact acknowledges the other on this point.**

`SUB-10 (NEU-984)` filed it and explicitly did **not** decide it, taking the matrix as the operative
reading for its own record on three stated grounds — later artifact, republished, carrying SUB-14's
validation and SUB-16's disposition — while recording that this is *"a precedence argument, not a
demonstration that `DR-C10-S6-1`'s headline is wrong."* The consequence is bounded and already
stated in the record: grounds 1 and 2 of `DR-C10-S10-1`'s carve-out argument are independent of the
reading, so the **selection is stable either way**; what changes is whether a routing obligation was
owed. **The cold read reached this conflict independently and named it question 2 of the seven that
block implementation.**

Owner: **`SUB-6 (NEU-976)`**, author of `DR-C10-S6-1` and already the named owner of the unclosed
`F-S13-1` on `SC-S3-33`'s tie-break — merged and closed, so routed as a residual — co-named
**`NEU-896`**. It is part of `CAP-S12-1`.

### 7.4 `OI-S6-2` and `OI-S16-1` — the two items whose resolving event is this gate

**`OI-S6-2`** — owner the `NEU-895` umbrella, consumer `SUB-12 (NEU-986)`; one of its two resolving
events is *"SUB-12 recording at the gate that the back-routed finding is unactioned."*
**Recorded: it is unactioned.** The charter's accepted warning `F5.7` names four backward routes —
SUB-10→SUB-6, SUB-13→SUB-7, SUB-13→SUB-8, SUB-9→SUB-15 — with no re-dispatch mechanism, and states
that an un-actioned back-route's only disposition is an open-items entry recording the contradiction.
At closure the count is larger than four: `F-S10-1`, `F-S10-4`, `F-S10-5` and `F-S10-6` are four
further instances, `F-S16-2` and `F-S16-3` are two more, and the cold read's seven blocking questions
route to five closed owners between them. **No back-routed finding in this package was actioned by
its named sub-task owner, because every such owner was merged before the finding was filed.** This
records the fact; it does not repair it. `OI-S6-2` **closes** on this record.

**`OI-S16-1`** — owner `SUB-12 (NEU-986)`. `F-S16-2` (should a category whose authority is **external**
be in the isolation invariant's domain at all?) and `F-S16-3` (is clause 1 preceding clause 4
*intended* for a process-local projection of external state?) are **model questions**, correctly
routed to `SUB-6 (NEU-976)`, which is merged and `Done`. The item offers this gate exactly three
dispositions and requires it to **name which**.

> **This gate takes route (c): both questions are routed to `NEU-896` at convergence.**

Route (a) — recording them as accepted residuals of the selected model with their consequences
stated — is declined because accepting a residual *of a model* is a statement about that model, and
this sub-task holds no authority over the model. Route (b) — re-opening `NEU-976` — is declined
because this sub-task does not reach outside its own tracker item. Route (c) is the only disposition
available to a party that may neither decide the model nor re-open a closed sibling. `OI-S16-1`
**closes** on this record naming (c). `CAP-S16-1` — `SC-S3-45`'s permanently unimprovable verdict, the
*consequence* of `F-S16-2` — is a different thing and is **not lifted**.

### 7.5 The three unlifted caps, and NEU-983's `PARTIAL`

| Item | Disposition at closure |
| --- | --- |
| **`CAP-S4-1`** — no component can be the deletion owner for `SC-S3-16`/`SC-S3-17`; a structural obstruction, not an omission | **Not lifted.** Nothing in this gate supplies a deletion owner, and the cold read named it question 4 of seven. **One inconsistency is recorded rather than adjudicated:** `16_…md` §10 places the cap's **seventh** sighting at `91_…md:297` (SUB-7's section) and deliberately adds no eighth; `15_…md` §5.4 and `90_…md` § SUB-10 each record an **eighth**. The two are reading different file sets. **This gate does not adjudicate the count**, and the cap is not lifted on either reading. Owner remains as recorded: `NEU-986 (SUB-12)` at the gate, and beyond it **`NEU-896`**, since the obstruction is structural and no C010 pass removes it. |
| **`CAP-S6-1`** — the two-writer divergence is unobserved; no store could be stood up (no container runtime; `127.0.0.1:5432` `ECONNREFUSED`) | **Not lifted.** `SUB-10 (NEU-984)` re-confirmed at `15_…md` §10.3 that nothing was asserted in its place. Owner: **`SUB-10 (NEU-984)`** — merged — and **`NEU-896`**. This gate has no execution environment either and asserts nothing. |
| **`CAP-S15-1`** — the deployed round-trip cost is unmeasured; a deployment-dependent residual | **Not lifted.** `SUB-10 (NEU-984)` recorded that the topology precondition is now supplied but the harness precondition cannot be. Owner: **`SUB-10 (NEU-984)`** — merged — and **`NEU-896`**. |
| **`NEU-983` (SUB-9) merged with one `PARTIAL`** in its own verification record, and the criterion it attaches to is not identified in the published package | **Carried forward as published, with its owner named — and the limit stated.** Verification records live in the gitignored `_local/` tree, so **the identity of the `PARTIAL` criterion is not recoverable from the published package**, and this gate does not invent one. What *is* recoverable, and is the substantive content of SUB-9's chapter, is complete: `14_…md` §11.1 records what it closes and §11.2 records what it explicitly does not, `DR-C10-S9-1` carries all six required sections, `traceability/S9_…md` is present, and `OI-S9-1` … `OI-S9-4` are all filed with owners. Recorded as **`CAP-S12-5`**, owner **`NEU-896`**. |

### 7.6 The charter's review warnings, restated in full

The cold read could not open the charter's review log and asked what `F5.5` says; it also could not
tell whether `F5.1`–`F5.4` and `F5.6` were *"rejected, never raised, or lost."* The log is gitignored.
Restated here, in full, so no reader has to ask again.

**Ten round-5 findings were raised. Six were repaired in a close-out pass; four were accepted as
known open items, and the charter's final status is `Converged with warnings`.**

**Accepted — not fixed, published as known open items:**

- **`F5.5`** (MEDIUM) — `01_charter.md` § Outcomes, `OUT-1` "Verified by", inherited by SUB-4's in-scope,
  acceptance scenarios and verification evidence. The clause *"a walkthrough of the three C005
  benchmark journey shapes across the diagram showing each hop's authority"* is the problem: **"the
  three C005 benchmark journey shapes" is never defined or cited** anywhere in the charter, the
  decomposition or the intake, and the only source it can mean records **five**, not three —
  `docs/research/C005-product-foundation/README.md:24`, *"The benchmark design: five journeys
  (JNY-B1/B2/F1/F2/F3)"*. SUB-4 turned it into a mechanical acceptance scenario, and the charter's own
  Users & journeys section separately defines three unrelated journeys. **Effect on this gate:** the
  `OUT-1` verification item "three C005 benchmark journey walkthroughs" is answered
  **passing-with-qualification** — the walkthrough exists and discharges the authority-per-hop
  requirement, but the number "three" is uncitable and the source it names records five.
- **`F5.7`** (MEDIUM) — four sub-tasks route findings **backwards** to already-shipped owners
  (SUB-10→SUB-6, SUB-13→SUB-7, SUB-13→SUB-8, SUB-9→SUB-15) with no re-dispatch mechanism; an
  un-actioned back-route's only disposition is an open-items entry recording the contradiction. →
  `OI-S6-2`, §7.4.
- **`F5.8`** (MEDIUM) — SUB-9 scores deployment, observability and release before SUB-10 decides the
  deployment shape, with the coupling undeclared; unlike an ordering defect this **cannot be fixed by
  reordering**, since SUB-10 depends on SUB-9. → `OI-S9-4`, **discharged**: SUB-10 answered **No**
  explicitly, `DR-C10-S9-1`'s selection stands, and `K6`/`K7`/`K9` keep their published scores, with a
  correction to `14_…md` §6.4's structural premise routed as `F-S10-1`.
- **`F5.9`** (MEDIUM) — the closed make-or-reuse four. → §7.2, **`CAP-S12-2`**.

**Repaired in the close-out pass, which is why they appear nowhere in the package:**

- **`F5.1`** (CRITICAL) — the charter's headline compatibility claim was **inverted**. It read *"there
  is therefore no free per-call identity slot … carrying identity in it means declaring it on the 40
  gated tool schemas that do not."* Verified false: **all gated tools already declare `context_token`**
  (40 through shapes in `src/domain/types/*.ts`, 2 inline in `src/server/`). The figure "40" was the
  count of schemas that **do** declare it in one directory, mistaken for the count that do not.
  Repaired, and the corrected fact carried into assumption 8 and `OUT-6`. (The package later refined
  the surface itself to **46 / 43 / 3 / 49** — `F-S8-1`.)
- **`F5.2`** (HIGH) — the same inverted fact promoted into a mechanical acceptance check that
  *mandated* the false statement and *explicitly failed* the true one, so a truthful SUB-8 chapter
  could not have passed its own scenario. Repaired in the decomposition.
- **`F5.3`** (HIGH) — `OUT-1`'s success measure required SUB-4 to state *"which learner-facing surfaces
  render where"*, which **is** the rendering model — assigned to `OUT-8` and to SUB-15, and something
  SUB-4 was separately audited against. Repaired by restating `OUT-1`'s clause as the trust split
  alone.
- **`F5.4`** (HIGH) — SUB-13's acceptance could only be evaluated after SUB-14 published, while SUB-13
  declared no dependency on it, so the post-absorption matrix three sub-tasks depend on had no
  scheduled producer. Repaired by giving the absorption pass its own id — which is **SUB-16 /
  NEU-979**, and is why the matrix carries a `post-validation` revision at all.
- **`F5.6`** (MEDIUM) — an arithmetic mislabel counting 2 `Copilot` commits as non-bot in the sentence
  identifying them as Copilot's. Repaired; and superseded in any case by SUB-9's re-measurement at
  **720 commits, 468 human, 252 automated**.
- **`F5.10`, `F5.11`** — routed to the charter writer in the same close-out pass and repaired.

**Consequence for the package's own record:** `F5.1`–`F5.4` and `F5.6` are absent from the package
**because they were fixed before it began**, not because they were lost. The cold read's question 6 is
answered, and no cap is required for it.

---

## 8. The risk register, with severity and mitigation status

The charter's ten risks, restated in full because the charter is gitignored, each with its mitigation
status **as the finished package leaves it**. Status is one of **mitigated** (the mitigation is in
place and its evidence is published), **partially mitigated** (the mitigation is in place and a named
residual survives), or **open** (the mitigation is stated and the risk is not closed).

| # | Risk | Severity | Mitigation status at closure |
| --- | --- | --- | --- |
| **R1** | MCP-owned and web-owned state diverge or permit conflicting writes — *"the program's Critical risk, and the one this package exists to close."* | **Critical** | **Partially mitigated.** The matrix is published at revision **`post-validation`** (`08_…md` + `10_…md`, SUB-16 / NEU-979): 45 rows, **exactly one authority each**, audited mechanically with counts reported; per-category consistency, concurrency, conflict and recovery rules; divergence, conflicting-write, interruption and recovery scenarios walked; the web API's **negative** boundary stated and cross-checked in both directions. The web tier holds **0 of 45** rows. **Residual, named:** `F-S10-6` contests `SC-S3-33`/`SC-S3-34`'s authority and is unresolved (§7.3); `F-S14-8` records one merged artifact contradicting **itself** about `SC-S3-17`, a Tier-2 gate input; `F-S13-2` mis-zones `CMP-S4-2` in the assignment rule's clause 4. The cold read reached all three unaided. |
| **R2** | The architecture permits cross-learner data exposure, or destabilizes the existing production MCP. | **Critical** | **Open, by design and by declaration.** The invariant is stated as a testable property and applied to **every** matrix row under two named target states — **90 evaluations, zero `holds`**; the `sub`/`azp` conflation, the unbound context token, the unattributable audit log, the unscoped `getActiveSession()` and the unauthenticated STDIO path are each carried as named facts the invariant must survive; production compatibility is assessed against the **real** single-instance, in-memory-state, auto-migrate-on-boot deployment. **The charter's own residual holds unchanged:** this package places the invariant, `NEU-893` builds the mechanism, and **nothing here proves isolation in running code.** `CAP-S5-1` stands; `F-S14-2` records that `fails-principal: 0` is *unreached*, never *passed*. |
| **R3** | Application-specific demands erode the MCP server's standalone, general-purpose behaviour. | **High** | **Mitigated, with one named residual.** `R8-1` … `R8-5` state the classification rule with a demonstrated case each way; the regression boundary is fixed as **seven published surface properties** over **46 tools / 43 gated / 3 exempt / 49 audit entries** (`F-S8-1`), with a per-item audit and both transports covered; every implied core change carries its backward-compatibility obligation and a named detection method. **Residual:** `CAP-S8-1` — five detection methods are specified and *"not one is run."* |
| **R4** | The four unbuilt upstream packages land with outcomes the selected architecture cannot absorb, invalidating decisions that look grounded. | **High** | **Mitigated by construction.** Five stand-ins, each numbered, `[unconfirmed]`, tied to its package, its tolerance envelope, its invalidating outcome and its re-validation trigger; **0 entries missing a required field**; each cited outside the register in 22 / 9 / 39 / 26 / 21 files, so none is appendix-only; NEU-896 receives the reconciliation list explicitly at §3. **Residual:** nothing revalidates until NEU-891, NEU-892, NEU-893 and NEU-894 land, and `CAP-S15-2` records that all three of SUB-15's decisions rest on `A-27` alone. |
| **R5** | This package diverges from C003/NEU-850 on learner-ownership placement or repository topology, leaving two competing authorities over the same decision. | **High** | **Mitigated.** §5: `OUT-2`, `OUT-6` and `OUT-7` consumed with their sources carried in, cited at every decision resting on them, **never re-decided**; **three "no amendment routed"** with the two rejected candidates and the bar they failed recorded; the overlap stated as **partial**; `NEU-35` noted as the pre-existing duplicate. **Residual:** two mechanical notes owned by `NEU-850` — `OI-S5-1` and `OI-S9-3`. The charter's own residual holds: `NEU-850` is unimplemented, so its `OUT-2` is honoured as a decision and never described as an existing schema fact. |
| **R6** | The package's altitude slips — it designs components, endpoints or schemas that belong to implementation charters, or stops so short that a downstream charter has to invent an authority. | **Medium** | **Split result, and this is the one risk where the calibration returned two different answers.** The **stop-short half is mitigated**: zero endpoint paths, zero payload schemas, zero error catalogues, zero frameworks or libraries selected, the stop stated in three places — and the cold read confirmed it independently, recording it as *"a deliberate scope boundary, not a gap."* The **reach half failed**: the cold read could **not** reach every boundary and every authority without asking, and named seven questions. `CAP-S12-1`. |
| **R7** | A spike becomes disguised implementation, or a spike conclusion is cited long after it went stale. | **Medium** | **Mitigated.** `16_…md` §6.1: **4** spike records, **4/4** carrying all 13 fields including a mandatory expiry, **0** expired, **136** spike citations with **0** dangling, and a repository audit proving **no spike artifact under `src/`**. Quarantine is structural, and each spike passed the "could this have been read instead?" test. |
| **R8** | The deployment-shape decision is made against an imagined platform rather than the real one. | **Medium** | **Partially mitigated.** The decision is bound to verified facts — single VPS, unversioned off-repo compose stack, no Dockerfile, no IaC, no rollback, auto-deploy from `develop`, auto-migrate on boot, single-instance with process-local in-memory state, no metrics, non-probing health endpoint. **Residual:** `CAP-S10-1` and `CAP-S10-3` record the operator facts as undiscoverable, `CAP-S10-2` records no scheduler and `CAP-S10-4` no import mechanism. The cold read's summary is the honest one: *"I could stand up the process; I could not operate it."* |
| **R9** | The package rests on NEU-890 artifacts that are entirely unbuilt and treats specified behaviour as existing behaviour. | **Medium** | **Mitigated.** The inventory's status distribution is **30 `existing` / 11 `required-by-upstream` / 4 `assumed`**, carried unchanged into the matrix at both revisions; the citation-drift component is placed as a component **to be built**, with its cached-verdict and quarantine-on-stale behaviour stated as a requirement. **One defect, filed here:** `04_…md:452` writes `SC-S3-41` where the `A-28` row is `SC-S3-45` — **`F-S12-3`**, the cold read's third question. |
| **R10** | The package's own vocabulary collides with the domain's — `subject`, `session`, `schema` all already mean something else here. | **Low** | **Mitigated, and one gap closed at this gate.** `00_…md` §4 disambiguates each at first occurrence; the package added **17** rows to `docs/GLOSSARY.md`, all verified present and well-formed. `F-S11-6`'s four missing rows — `state category`, `read-projection`, `write-intent`, `split-visibility workspace` — **are added by this sub-task**, which also closes the glossary's own dangling cross-reference from `isolation invariant` to `state category`. |

**Register totals: 10 risks — 2 Critical, 3 High, 4 Medium, 1 Low. Mitigated 5; partially mitigated 3;
open 1; split 1.** Every non-mitigated status names its residual and that residual's owner.

---

## 9. Success measures for the selected architecture

What a later reader can measure to know whether the selected architecture is working. Each is
observable, and each names where it stands **today** so the measure is calibrated rather than
aspirational.

| # | Measure | Value today |
| --- | --- | --- |
| **`SM-1`** | Every state category has **exactly one** authority; a mechanical count over the published matrix returns 45 assigned, 0 shared, 0 unassigned. | **Met in the document** — `10_…md` §8.1. Contested for 2 rows by `F-S10-6`, for 1 by `F-S14-8`. |
| **`SM-2`** | The isolation invariant returns `holds` for every in-domain category under the **as-built** target state. | **0 of 26 in-domain rows.** This is the single measure that most distinguishes a built system from this package, and it is the one `NEU-893` moves. |
| **`SM-3`** | The regression boundary holds across the migration: **46 tools / 43 gated / 3 exempt** continue to satisfy the seven published surface properties, and every contract-changed item's named detection method actually runs. | Boundary published; **0 of 5 detection methods run** (`CAP-S8-1`). |
| **`SM-4`** | The core resolves from its **published or packed artifact**, not the workspace link, and a gate fails when the entry point is absent. | **Fails today** — the core declares no `main`, `exports`, `types` or `bin`, so a consumer resolving it fails with `TS2307` (`F-S9-3`). `OI-S9-1`. |
| **`SM-5`** | The distribution line is held by an **allowlist**: a packed core artifact contains **zero** files from the private application tree. | **No filter exists** — no `files` field, no `.npmignore` (`F-S9-4`). `OI-S9-2`. |
| **`SM-6`** | The serve path never blocks on a drift verdict: a stale or absent verdict **quarantines the unit** and the learner's request still completes. | Specified; unbuilt. At a revalidation budget of zero, stale-or-absent is the **ordinary** mode. |
| **`SM-7`** | **Zero** citations in `docs/research/` fail a mechanical link check. | **161 fail today** (`F-S11-1`). The convention is published in `DR-C10-S12-2`; the check is `OI-S12-1`. |
| **`SM-8`** | Every `SC-S3-*` row reaching an implementation charter carries a **destination**, not a shape. | **12 of 18** store-`none` rows placed in the shared store, 2 in the drift component's store, 3 with no destination by construction, 1 by decision — 18 accounted for, **0 silently unplaced** (`15_…md` §5.4). Record *shape* remains undecided for all eighteen. |

---

## 10. Evolution paths

How the selected architecture is expected to change, and what fires each change. Each path names its
trigger so a later reader can tell an anticipated evolution from an unanticipated reversal.

- **`EP-1` — one shared Postgres → per-component stores.** The `SC-S3-33`/`SC-S3-34` carve-out under
  `CMP-S4-17` is already the first instance, forced by `SC-S3-34`'s own prohibition on co-location.
  **Trigger:** a second category acquiring the same prohibition. **Cost recorded:** `SC-S3-36`'s
  interaction with `SC-S3-33` is already **cross-store** where the matrix wrote it cross-category.
- **`EP-2` — one instance of each process → multiple.** Three of the matrix's four named
  cross-category interactions (`SC-S3-18` MCP session affinity, `SC-S3-20` per-process counters,
  `SC-S3-21` per-process breaker state) are resolved **only** by one instance of each process, which
  makes divergence unreachable rather than mitigated. **Trigger:** any load or availability
  requirement that adds an instance. **Precondition:** `CAP-S10-3`'s premise stops holding, and all
  three must be re-resolved before it does.
- **`EP-3` — STDIO gains an identity gate.** `CC-S8-3`, classified reusable core, priced as **breaking
  and unavoidably so** — every existing STDIO client calls with no token today and would begin to
  fail. It is the only path by which `BND-S4-17` gets an owner. **Trigger:** any isolation claim that
  must hold on both transports. **Sequencing consequence, carried from `06_…md` §4.3:** closing STDIO
  **surfaces** the `sub`/`azp` defect rather than resolving it.
- **`EP-4` — split-visibility workspace `T2` → separate repositories `T1`.** `DR-C10-S9-1`'s revision
  trigger 2. **Trigger:** a deployment shape that requires the application to be built from a public
  repository. **Answered `No`** by `SUB-10 (NEU-984)` at `03efe1d` — the maintainer's own CI builds and
  deployment is a push to a host the maintainer controls — so the trigger has **not** fired, with the
  answer now conditioned on charter assumption 32 rather than independent of it (`F-S10-1`).
- **`EP-5` — `context_tokens` gains a principal column and a refusing mint path.** `DR-C10-S8-2`'s
  obligation; the table carries `id`, `created_at`, `expires_at` and nothing else. **Trigger:** the
  first isolation requirement that must survive a forged argument. **The column alone is not the
  path** — a column without the refusal is `DR-C10-S8-2`'s rejected alternative 3 arriving under the
  chosen option's name (`OI-S8-1`).
- **`EP-6` — the four stand-ins are reconciled and `93_…md` is superseded.** **Trigger:** each of
  NEU-891, NEU-892, NEU-893, NEU-894 publishing under `docs/research/`. Each stand-in carries its own
  invalidating outcome (§3), so the failure is **detected rather than discovered** — which is the
  whole design of the register.

---

## 11. Coverage of `OUT-11` and `OUT-12`

`traceability/S12_package-closure-coverage.md` carries the rows for both outcomes in the folder's six
stable columns, with **zero rows resolving into `_local/` or `docs/wf-plans/`**. That file, not this
section, is the traceability record; it exists because `F-S11-3` established that these were the two
outcomes with no row anywhere, and they are the two this sub-task covers.

---

## 12. Ids allocated by this sub-task, and the registers that receive none

| Register | Ids filed | Note |
| --- | --- | --- |
| `02_findings-register.md` | **`F-S12-1`**, **`F-S12-2`**, **`F-S12-3`**, **`F-S12-4`** | `F-S12-1` is the C003/NEU-850 decision-ownership collision the gate stub requires this sub-task to file. |
| `90_open-items-and-provisional-register.md` | **`OI-S12-1`**, plus dispositions of `OI-S1-2`, `OI-S3-1`, `OI-S5-1`, `OI-S5-2`, `OI-S6-2`, `OI-S16-1`, carrying no new id | |
| `91_caps-and-incomplete-scope.md` | **`CAP-S12-1`** … **`CAP-S12-5`** | Each with exactly one named owner. |
| `92_spike-register.md` | **None.** | Stated rather than omitted, following SUB-8's and SUB-10's precedent. **No `SPK-S12-*` record is filed, and none should be:** every question this sub-task met was settled by reading a published artifact or is settled by no experiment at all. A spike must first fail the "could this have been read instead?" test (`92_…md` §2), and not one of this sub-task's questions does. The cold read is **not** a spike — it wrote and ran no code, produced no quarantined artifact, and has no expiry; it is a review, recorded at §2. |
| `93_stand-in-assumption-register.md` | **None, and none is permitted.** | Closed at five entries. A sixth is itself a gate failure. It is read here as the reconciliation surface and is absent from this change entirely. |
| `decision-records/` | **`DR-C10-S12-1`** (the gate method), **`DR-C10-S12-2`** (erratum versus convention) | Both carry all six required sections including rejected alternatives. |
| `traceability/` | **`traceability/S12_package-closure-coverage.md`** | `OUT-11` and `OUT-12`. |
| `docs/GLOSSARY.md` | **4 rows added** | `state category`, `read-projection`, `write-intent`, `split-visibility workspace` — discharging `F-S11-6`. The only file this sub-task touches outside the package, and the only repair this gate performs. |

**Deletions from any shared register: 0. Entries reflowed, renumbered or amended: 0. Merged sibling
chapters modified: 0.**

---

## 13. Verification

- **Method.** Every claim in this chapter resolves to a file under `docs/research/`, to the cold-read
  record reproduced verbatim at §2, or to a fact restated in full from a gitignored tree with its
  source named in prose (§4.2, §5, §7.6, §8). `SUB-11 (NEU-985)`'s four audit results are **consumed**,
  not re-run: traceability **PARTIAL**, citations **FAIL**, spike register and quarantine **PASS**,
  no-in-app-judge sweep **PASS**.
- **Figures used.** Compatibility surface **46 tools / 43 gated / 3 exempt / 49 audit entries**
  (`F-S8-1`). Repository **169 TypeScript source files, 26,816 lines, 202 test files, 25 Drizzle
  migrations, 720 commits (468 human, 252 automated)** (SUB-9's re-measurement). Matrix cited at
  revision **`post-validation`** (`08_…md` + `10_…md`, SUB-16 / NEU-979). The superseded 45/42 and
  165/25,200/197 figures appear in §7.1 **only** where identified as superseded, and the distinction
  between `OUT-6`'s **miscount** and `OUT-7`'s **staleness** is preserved.
- **`qa-execution:engine` is unconfigured** in this repository — the active capability registry is
  `git, linear`, and no capability owns the `qa-execution` surface. That is recorded as a genuine
  no-op (`CAP-S1-3`), and **no QA pass is claimed** by this chapter or by `94_…md`.
- **Evidence class.** Everything in this package, including the cold read, is a **proxy signal**. No
  external-user validation and no expert validation exists for any claim in it.
