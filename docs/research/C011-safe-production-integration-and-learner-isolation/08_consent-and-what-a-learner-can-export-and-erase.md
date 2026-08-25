# 08 — What consent covers, and what a learner can export and erase

**Task:** NEU-1002 (SUB-8) · **Charter:** C011 (umbrella NEU-893) · **Covers:** OUT-10, OUT-11
**Model:** claude-opus-5[1m] · **Written:** 2026-08-25 · **Verification cutoff:** `d2e2b55`, 2026-08-25
**Depends on:** SUB-3 (NEU-995), position 3 — merged; SUB-16 (NEU-999), position 7 — merged
**Consumes:** `03_learner-data-inventory-and-classification.md` §1 (the published entry shape), §2 (the
status vocabulary), §4–§8 (the 32 entries), §9 (the consent seam);
`16_attribution-and-detection.md` §5 (the privacy determination), §6 (the signal contract), §7 (the
truncation bound); `../C010-system-and-repository-architecture/08_per-state-authority-matrix.md` +
`../C010-system-and-repository-architecture/10_republished-authority-matrix.md`, revision
`post-validation`, consumed with the source cited.
**Decision records:** `DR-C11-S8-1`, `DR-C11-S8-2` · **Traceability:** `traceability/S8_consent-export-and-erasure.md`

---

## 0. What this chapter is, and what it is not

**It is** four things. A **consent boundary** stated in both directions — what rests on consent, and,
as explicitly, what does not and therefore survives withdrawal (§2–§4). The **classification entry**
for the one category this sub-task creates, in SUB-3's published shape plus the seventh field charter
assumption 50 requires (§5). A **withdrawal walk** over every category of SUB-3's inventory, with the
resulting behaviour of each (§6). And an **export and erasure design** — learner-readable export
scoped by the inventory, a per-category erasure disposition, a completion deadline, and a
four-field audit of every retention exception (§7–§9).

**It is not an implementation.** **Nothing under `src/` or `drizzle/` changes in this sub-task**
(§13). Every duty described here is a shape a later charter builds.

**It is not legal advice.** Every lawful basis below is written as a **position** — an engineering
judgement about which basis *would* apply — exactly as `03_learner-data-inventory-and-classification.md`
§1 defines field 3. The determination itself is `93_open-items-and-provisional-register.md` §
`OI-S3-1`, owned by SUB-3, and it is **cited here and never restated**. This chapter raises no second
record of it.

**It is not measured.** No production credential exists in the environment this package was written
in: `SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*` and `VPS_*` are all unset, re-probed at this cutoff.
Across five merged chapters **zero spikes have executed** and the evidence label
`observed-in-production` has been used **zero times**. No consent has ever been captured, no export
has ever been produced, and no erasure has ever been run. `94_caps-and-incomplete-scope.md` §
`CAP-S8-1` states that limit; `92_risk-register.md` § `R13` is cited for the evidence position rather
than restated.

**One qualification the package requires.** Per `91_findings-register.md` § `F-S2-2`, an id can denote
different facts in C010 and C011. Every cross-package reference in this chapter is written
**qualified**, and §14 discloses the one id shape this sub-task allocates that collides with a C010
id.

---

## 1. The starting position, stated because it is not what a reader expects

**There is no consent record, no export path and no erasure path anywhere in the product.** That much
the charter states. Two further facts, both re-derived at this cutoff, set the actual starting line:

**First — the positive side of the consent boundary is currently empty.** Not one of SUB-3's
thirty-two inventory entries carries `consent` as its lawful-basis position. Every one reads
*contract* or *legitimate interests* (`03_learner-data-inventory-and-classification.md` §4–§8). A
grep of the source agrees from the other side: `consent`, `gdpr`, `dsar` and `erasure` return **zero
hits** across `src/` and `drizzle/`, and every `retention` hit is the SM-2 spaced-repetition
*retention rate* domain metric, unrelated to data-retention policy. This corroborates charter
assumption 37 from the codebase rather than from the sweep of C010 that originally established it.

So this outcome **creates** a consent boundary; it does not document one. That is reported as
`91_findings-register.md` § `F-S8-4` rather than absorbed here, because a reader who assumes the
chapter is describing an existing surface will misread every section that follows.

**Second — the only purge mechanism the codebase owns is unwired, and it is not the only unwired
one.** §10 is the audit. The headline is that a learner today cannot delete a topic, a session, or an
answer they gave, by any route the product exposes.

---

## 2. Consent state as a category, and its single authority

C010's per-state authority matrix assigns exactly one authority per category by an **ordered rule
whose first match wins** (`../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:103`).
The consent record is a category C010 never inventoried, so the rule is applied to it here rather
than looked up. The reasoning, the component definitions and five rejected alternatives are in
`decision-records/DR-C11-S8-1_the-consent-record-and-the-consent-boundary.md`; the result:

> **Clause 2 fires. Authority is `CMP-S4-7`, the orchestration workflows. Exactly one authority.**

**Why clause 2 and not clause 5.** Clause 2 covers state whose *"value can change a serve or
authoring verdict"*, and assigns it to the MCP core caller-side —
*"`CMP-S4-7` on the request path, `CMP-S4-14` on the authoring path"* — closing with
***"No later clause may override clause 2."***
(`../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:110`–`:113`.) Consent
state is gate-bearing by construction: if its value changed no verdict, withdrawal would do nothing,
which is the defect OUT-10 exists to prevent. The **writer** is on the request path — a learner
grants or withdraws — so the caller-side component is `CMP-S4-7`.

Clause 5 would also match, since the row is learner-scoped, and it is where the two operational log
tables land. It is **never reached**, because the rule is ordered. A reader who tests only
*"is it learner-scoped?"* will get `CMP-S4-9` and be wrong for exactly that reason; the alternative is
recorded as `DR-C11-S8-1` rejected alternative 3 rather than left for them to rediscover.

**Two readers, one writer, one authority.** The quality-gate battery `CMP-S4-14` *reads* consent state
to decide whether a secondary-use write proceeds, and the persistence adapters `CMP-S4-9` hold the
bytes. Neither is an authority: C010 defines authority as *"the single component permitted to write
it"*
(`../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:16`), and
***"Authority is never split"***
(`../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:128`), where two
producers is recorded as **a defect in the inventory** rather than a tie.

**Consistent with the revision this package must cite.** The matrix is cited in the form `10_…md`
itself fixes — **`08_…md` + `10_…md`, revision `post-validation` (`SUB-16 of C010` / NEU-979)**
(`../C010-system-and-repository-architecture/10_republished-authority-matrix.md:62`–`:65`). That
revision carries the authority vocabulary forward unchanged and revises only two rows' **write path**,
never their authority
(`../C010-system-and-repository-architecture/10_republished-authority-matrix.md:46`, `:94`–`:96`), so
nothing in it disturbs this placement. **Neither matrix is edited by this sub-task**, and no
amendment is routed to `NEU-895` on this ground — see §12.

**`M-A` is satisfied.** Under all-MCP state ownership every write of an MCP-core-owned category is
issued through the MCP tool surface, and consent state is written by an orchestration workflow behind
that surface. No web-tier component holds any part of it.

---

## 3. What consent covers — the severability test, and the three purposes that pass it

A processing purpose rests on consent **if and only if the service continues to function when that
purpose is switched off**. The test is stated so a reader can apply it themselves rather than take
this chapter's partition on trust.

**Three purposes pass.**

| Id | Purpose | Categories it touches | Why it is severable |
| --- | --- | --- | --- |
| `CP-S8-1` | **Rule-validation corpus** — retaining labelled examples drawn from a learner's chunks to measure linter-rule precision and recall | `LD-S3-14`; derived from `LD-S3-2` | The linter runs without a labelled corpus. The corpus measures how good the *rules* are; removing it degrades rule tuning, not the learner's service. |
| `CP-S8-2` | **Scheduling-algorithm evaluation** — retaining the pre-review snapshot after the grade it preceded, so predictions can be scored after the fact | `LD-S3-10` | SUB-3 separated this from `LD-S3-9` for exactly this reason, and records that whether it survives an erasure of the grade *"would be decided deliberately — a decision that is SUB-8's"* (`03_learner-data-inventory-and-classification.md` §4). Scheduling itself reads `LD-S3-3`, not the snapshot. |
| `CP-S8-3` | **Third-party model processing** — transmitting learner content to an external provider for embedding and classification | `LD-S3-1`, `LD-S3-2` in transit | **Conditionally severable, and the condition is mechanical.** Both adapters select a provider at runtime — `src/config/resolve-embedding-config.ts:25` and `src/config/resolve-classifier-config.ts:80` — and each has a non-OpenAI branch. Where a local provider is available, the purpose is severable. Where it is not, it is **inseparable from the service** and rests on contract instead. |

**`CP-S8-3`'s condition is not assumed satisfied.** Which provider production actually uses is not
discoverable from the repository, and it is raised as this sub-task's single new open item,
`93_open-items-and-provisional-register.md` § `OI-S8-1`. **Consent for `CP-S8-3` may only be offered
on a deployment where the local alternative exists** — offering it otherwise would capture a consent
that cannot be withdrawn, which is precisely the defect §4 reports. Until `OI-S8-1` closes, this
chapter states the rule and does not assert which branch the deployment is on.

**Everything else survives withdrawal**, and §4 says so purpose by purpose.

---

## 4. What consent does **not** cover — the negative boundary

Stated as explicitly as the positive case, because the charter requires it and because the asymmetry
is the thing a learner will get wrong.

| Processing purpose | Governed by consent? | Basis that carries it instead | Effect of withdrawal |
| --- | --- | --- | --- |
| Holding and organising the learner's own study material | **No** | **Contract** — the learner asked for the learning service this record constitutes | None. The material stays. |
| Scheduling reviews (SM-2) | **No** | Contract | None |
| Running a study session, posing questions, recording answers and grades | **No** | Contract | None |
| Search over the learner's own corpus | **No** | Contract | None |
| Authorising the learner's calls (context tokens) | **No** | Contract | None |
| Session-hijack rejection; per-subject rate limiting | **No** | **Legitimate interests**, on a **security** justification | None. A security control a subject can switch off is not a control. |
| Grade-revision audit trail | **No** | Legitimate interests — integrity of the grading record | None; retained, as a named exception (§9) |
| Operational logging — request log and event log | **No** | Legitimate interests — operating and debugging the service | None. **And a purpose here that *did* rest on consent could not be withdrawn — reported as `F-S8-1`.** |
| Content-quality gating at authoring time | **No** | Legitimate interests — maintaining content quality | None. Only the *retention of the labelled corpus* beyond the gate decision is severable, and that is `CP-S8-1`. |
| Keeping the consent record itself | **No** | **Demonstrating that consent was given and withdrawn.** Consent cannot be the basis for the record of consent — that is circular | The record is **retained**, as a named exception (§9) |
| Rule-validation corpus retention | **Yes** — `CP-S8-1` | — | Stop labelling; purge existing corpus rows within 7 days |
| Scheduling-algorithm evaluation | **Yes** — `CP-S8-2` | — | Stop retaining new snapshots; purge existing snapshot quads within 7 days |
| Third-party model processing | **Yes, conditionally** — `CP-S8-3` | Contract, where no local provider exists | Switch to the local provider on the next request; where none exists, consent is not offered |

**The sentence this chapter most needs a learner to read:** *withdrawing consent does not delete your
account or your study material, because your study material was never held on consent.* Erasure is a
**different act** with a different scope, defined in §7 and §8. Conflating them is
`92_risk-register.md` § `R-S8-1`.

### 4.1 The OUT-10 finding — a purpose that would rest on consent it could not withdraw

Operational logging is the case, and it fails withdrawability in **three independent ways**, any one
of which is sufficient:

1. **No consent check can run before the write.** The audit middleware is mounted at the transport
   layer and writes its row around the request (`src/transport/audit-middleware.ts`), before any
   orchestration workflow — the authority for consent state, §2 — is reached.
2. **No per-learner emission switch exists.** Emission is conditional on one process-wide variable
   (`src/transport/http.ts:177`–`:182`), which is all-or-nothing for the deployment.
3. **Historical rows cannot be reached.** Pre-cutover rows carry no key and can never be given one
   (`91_findings-register.md` § `F-S16-5`), so a withdrawal could not locate the processing it was
   withdrawing.

**Reported as `91_findings-register.md` § `F-S8-1` with a named owner**, under OUT-10's consent
boundary, rather than reconciled here. The consequence for the design is that operational logging is
placed on legitimate interests in §4 and stays there.

---

## 5. The consent category's classification entry

Authored here, not by SUB-3 and not by SUB-14 at assembly, per charter assumption 50 and
`03_learner-data-inventory-and-classification.md` §9. **Checked field for field against the shape
published at `03_learner-data-inventory-and-classification.md` §1** — the six fields, in that
chapter's own order — **plus the seventh** that only this category needs.

### `LD-S8-1` — Consent record

- **Where:** a new MCP-core-owned table in the `public` schema. It **does not exist at this cutoff**;
  the DDL is **SUB-13's** (NEU-1006) under OUT-19. Proposed columns: `consent_id`, `learner_key`,
  `purpose_id`, `policy_version`, `state`, `granted_at`, `withdrawn_at`, `source`, `recorded_by`.
- **Field 1 — Data class:** consent state — a learner's recorded decision about a named severable
  purpose, plus the version of the purpose statement it was given against.
- **Field 2 — Personal-data status:** **`learner-identifying`**, from the first row written. It is
  the **only** category in the package that is learner-identifying *by construction on the data
  alone* rather than by a deployment property: `learner_key` carries the OIDC `sub` verbatim
  (`DR-C11-S2-1`), so the row resolves to the authenticated principal without any FK walk and without
  relying on `n = 1`. This is a **stronger** status than any of SUB-3's thirty-two persisted entries
  holds today, and it is stated as such rather than levelled down.
- **Field 3 — Lawful basis (position):** **demonstrating that consent was given and withdrawn** — a
  legal-obligation-shaped position, **never consent itself**, which would be circular. As with every
  basis in this package this is a position, not a determination; selection is `OI-S3-1`.
- **Field 4 — Purpose:** to make withdrawal *effective* (the gate at `CMP-S4-14` reads it) and
  *provable* (an append-only history says what was in force when).
- **Field 5 — Minimization position:** **minimal by construction, with one deliberate retention.** It
  holds a key, a purpose id, a version, a state and two timestamps — no content, no free text, and no
  copy of anything it governs. The deliberate part is that a **withdrawn** row is kept rather than
  deleted, which is the exception audited in §9. `source` and `recorded_by` are the only fields that
  could grow: both are bounded enumerations, and neither may carry a caller-asserted identifier
  (`F-S16-1`).
- **Field 6 — Derivation:** **learner-supplied.** The learner's own decision, recorded verbatim as a
  state value. Not derived, not agent-authored, not system-generated.
- **Field 7 — Retention/erasure position after withdrawal:** **retained after withdrawal, and
  retained after an erasure of everything else.** A consent record deleted on withdrawal destroys the
  only evidence that the withdrawal happened and was honoured. Bound, owner and basis are in §9,
  where it is audited as **one exception among five and is not exempted for being the package's
  own**.

**Consumable as-is by both completeness checks.** §7's export-completeness check reads the union
*"every category SUB-3 marks as the learner's, plus the consent category this sub-task creates"* and
resolves that second term to this entry. **SUB-9's unowned-copy audit at position 11 reads the same
union.** Whether SUB-9 in fact consumes it is SUB-9's acceptance at its own position; this chapter
asserts only that the entry exists, carries all seven fields, and is stated in the published shape.

**Zero back-edge edits.** `03_learner-data-inventory-and-classification.md` is **not modified by this
sub-task** — no revision of it is produced, requested or owed. The id is `LD-S8-1`, in this
sub-task's own scoped family, and **not** `LD-S3-33`: continuing SUB-3's sequence would imply an
edit to SUB-3's enumeration that this chapter is forbidden to make and does not make.

---

## 6. The withdrawal walk — every category, with its resulting behaviour

Every one of SUB-3's thirty-two entries, plus `LD-S8-1`. **Thirty-three rows; zero omitted.** The
walk is exhaustive rather than restricted to the affected categories precisely because the negative
boundary must be as explicit as the positive one — a category absent from this table would be a
category whose behaviour on withdrawal a reader has to guess.

| Id | Category | Consent purpose | Behaviour on withdrawal |
| --- | --- | --- | --- |
| `LD-S3-1` | Topic record | — | Unchanged (contract). `CP-S8-3` may change *where* future embeddings are computed. |
| `LD-S3-2` | Chunk content | — | Unchanged (contract). `CP-S8-3` as above. |
| `LD-S3-3` | Per-chunk SM-2 state | — | Unchanged (contract) |
| `LD-S3-4` | Content-audit verdict | — | Unchanged (legitimate interests). Only its use as corpus is severable, via `CP-S8-1`. |
| `LD-S3-5` | Learning-session record | — | Unchanged (contract) |
| `LD-S3-6` | Session-chunk teaching state | — | Unchanged (contract) |
| `LD-S3-7` | Session question | — | Unchanged (contract) |
| `LD-S3-8` | Question→chunk mapping | — | Unchanged (contract) |
| `LD-S3-9` | Attempt and grade record | — | Unchanged (contract) |
| `LD-S3-10` | Pre-review scheduling snapshot | **`CP-S8-2`** | **Stop writing new snapshots; purge existing snapshot quads within 7 days.** Grading and scheduling are unaffected — they read `LD-S3-3` and `LD-S3-9`. |
| `LD-S3-11` | Grade-revision audit trail | — | Unchanged (legitimate interests — record integrity); retained as an exception (§9) |
| `LD-S3-12` | Notes | — | Unchanged (contract) |
| `LD-S3-13` | Context tokens | — | Unchanged (contract; not personal data at this cutoff) |
| `LD-S3-14` | Linter validation corpus | **`CP-S8-1`** | **Stop adding rows for this learner's chunks; purge existing rows within 7 days.** Linting continues; only rule *measurement* loses input. |
| `LD-S3-15` | Per-rule validation report | — | Unchanged (not personal data — aggregate counts). Withdrawal does not retract a learner's contribution to an already-computed aggregate, and §7 explains why that is defensible rather than convenient. |
| `LD-S3-16` | MCP request log | — | Unchanged (legitimate interests). **See `F-S8-1`** — consent is not available as a basis here. |
| `LD-S3-17` | Operation event log | — | Unchanged (legitimate interests). As above. |
| `LD-S3-18` | MCP transport registry | — | Unchanged; process-local, evicted on session close |
| `LD-S3-19` | Subject-binding map | — | Unchanged (legitimate interests, security). Switchable off by a subject, it would be no control at all. |
| `LD-S3-20` | Rate-limit windows | — | Unchanged (legitimate interests, security) |
| `LD-S3-21` | Circuit-breaker set and stats cache | — | Unchanged (not personal data) |
| `LD-S3-22` | Request context and correlation id | — | Unchanged; request-scoped |
| `LD-S3-23` | Database client singletons | — | Unchanged (not personal data) |
| `LD-S3-24` | Event-logger sink toggle | — | Unchanged (not personal data) |
| `LD-S3-25` | Audit/event batch buffers | — | Unchanged. Transiently holds what `LD-S3-16`/`LD-S3-17` persist; bounded by the flush interval, not by consent. |
| `LD-S3-26` | JWKS remote key set | — | Unchanged (not personal data) |
| `LD-S3-27` | Classifier model cache | — | Unchanged (not personal data). Holds runnables, not content. |
| `LD-S3-28` | Mastery level | — | Unchanged; computed on read, stored nowhere |
| `LD-S3-29` | `LearnerContext` aggregate | — | Unchanged; assembled fresh per call, stored nowhere |
| `LD-S3-30` | Analytics KPIs and rollups | — | Unchanged; transient |
| `LD-S3-31` | Sixth copy class — this package's captured production evidence | — | **Unchanged, and the class has zero members.** Its terms bind if it ever acquires one; SUB-1's recorded destruction condition fires at package publication regardless of any withdrawal. |
| `LD-S3-32` | Aggregate result set | — | Unchanged (not personal data — counts over rows are not the rows) |
| **`LD-S8-1`** | **Consent record** | — | **A new row is written recording the withdrawal.** The record is never updated in place and never deleted on withdrawal — that is the point of it (§5 field 7, §9). |

**Three affected categories out of thirty-three, and the number is the finding.** A reader who
expected withdrawal to sweep the product now has the enumeration that says otherwise, per category,
with the basis that carries each one.

---

## 7. Export

### 7.1 What it is

A **learner-readable artifact**, specified by properties rather than by an endpoint, because no
delivery surface exists to name and naming one would presuppose a transport decision this package
does not own (`DR-C11-S8-2` decision 2).

| Property | Requirement |
| --- | --- |
| **Readable** | One section per category, with a plain-language heading, the data rendered rather than dumped, and a one-line *what this is / why it is held / on what basis* drawn from that category's own inventory fields. |
| **Not a dump** | No table names as headings, no raw foreign keys as the primary presentation, timestamps rendered as dates, coded values rendered as their meaning (`quality` as its grade, not as an integer). |
| **Self-describing** | The artifact states its own generation instant, the policy version in force, and the inventory revision its section list was derived from. |
| **Honest about truncation** | Any `response_body` of exactly 65 536 bytes is labelled **possibly truncated** — never presented as complete. The bound is applied twice by two constants of the same value (`src/transport/audit-middleware.ts:14`; `src/transport/pg-audit-transport.ts:36`), and `16_attribution-and-detection.md` §7 fixes the reading. |
| **Authenticated** | Scoped on the **server-derived** `learner_key` only — the OIDC `sub` verbatim, from the signature-verified token. **Never** on `session_id` or `correlation_id`, both caller-asserted (`F-S16-1`); never on `azp`. |
| **Complete** | Against the union defined in §7.2, with every category carrying an explicit disposition. |
| **Deadline** | **30 days** from an authenticated, verified request (§9.1). |

### 7.2 The completeness check, with its arithmetic shown

The union is SUB-3's own: *"every category the inventory marks as the learner's, plus the consent
category SUB-8 creates"* (`03_learner-data-inventory-and-classification.md` §9). Resolved
mechanically against SUB-3's four-value status vocabulary (§2 of that chapter) rather than by
judgement:

**Eight entries are `not personal data`** — `LD-S3-13`, `LD-S3-15`, `LD-S3-21`, `LD-S3-23`,
`LD-S3-24`, `LD-S3-26`, `LD-S3-27`, `LD-S3-32`. Naming the subtrahend by id is what makes the count
auditable: a reader who disagrees can name the entry they would move.

> **32 − 8 = 24 · 24 + 1 = 25.** Twenty-five sections, each with a disposition. **Zero categories
> from either set are unaccounted for.**

### 7.3 The table-top, and what it produced

A table-top export was assembled against the union and reviewed. It is a **paper exercise over the
declared schema** — no database was read, because none is reachable (§0) — and it is reported as one.

| Disposition | Count | Which, and why |
| --- | --- | --- |
| **Exported — content** | 9 | `LD-S3-1`, `LD-S3-2`, `LD-S3-4`, `LD-S3-5`, `LD-S3-7`, `LD-S3-9`, `LD-S3-11`, `LD-S3-12`, `LD-S8-1`. The learner's material, answers, notes, the verdicts on their content, the revision trail, and their own consent history. |
| **Exported — derived state about the learner** | 5 | `LD-S3-3`, `LD-S3-6`, `LD-S3-8`, `LD-S3-10`, `LD-S3-14`. Behavioural and structural state. Included because it is *about a person* even where they did not author it. |
| **Exported — computed at export time** | 3 | `LD-S3-28`, `LD-S3-29`, `LD-S3-30`. Stored nowhere, so there is nothing to *erase* — but `LD-S3-29` is the richest learner profile the system ever assembles, and an export that omitted it would omit the most revealing thing the product knows. **Recomputed for the export rather than retrieved.** |
| **Exported — partial, and labelled as partial** | 2 | `LD-S3-16`, `LD-S3-17`. `user` rows matching the requester's `learner_key` are in scope under `DR-C11-S16-2`. The export must state, in the artifact itself, that **rows predating attribution are not included and cannot be** (§8.2). |
| **Not exported, with reason** | 5 | `LD-S3-18`, `LD-S3-19`, `LD-S3-20`, `LD-S3-22`, `LD-S3-25` — process-local structures that exist only for the duration of a connection, a window or a flush. Exporting a live socket handle or a request-scoped correlation id gives a learner nothing and is stated as such rather than padded into the artifact. |
| **Not exported — class has zero members** | 1 | `LD-S3-31`. **Not "no such class."** The terms bind and the disposition holds the moment it acquires a member; see §7.4. |
| **Total** | **25** | 9 + 5 + 3 + 2 + 5 + 1 = 25 ✓ |

**What the table-top surfaced.** Two things worth recording rather than smoothing. First, the
**partial** row is the only one whose incompleteness a learner could not detect from the artifact
alone, which is why the label is mandatory rather than advisory. Second, three of the five
`not exported` categories (`LD-S3-19`, `LD-S3-20`, `LD-S3-22`) are the ones that *do* hold an
identifier for a natural person — so the reason they are excluded is **transience, never
insignificance**, and the artifact says so.

### 7.4 `LD-S3-31` and `LD-S3-32` — the two the charter singles out

**`LD-S3-31` — the sixth copy class, with zero known members and terms that exist anyway.** SUB-3
refuses to collapse that distinction and this chapter refuses with it. Its export disposition is
**`not-exported — zero members`**, and the disposition is written so it holds *when the class acquires
one*: a member would be a verbatim capture of real learner-derived production data, would be
`learner-identifying`, and would be **in scope for the learner whose `sub` the captured claim set
carries**. What prevents export today is membership, not applicability. Membership is empty because
SUB-1 executed zero of nine designed spikes for want of any production credential (`F-S1-2`) — **not
because the class is inapplicable**. The class's terms, its owner, its retention bound and its
destruction condition are SUB-1's as recorded at
`01_production-evidence-and-the-access-audit.md` §6; this chapter **reads them and sets none**.

**`LD-S3-32` — the aggregate result set: counts and probe results, never rows.** Its export
disposition is **excluded from the union**, on SUB-3's classification of `not personal data`, and the
reason is stated rather than assumed: *counts over rows are not the rows*. No learner value and no
learner-derived value is carried, so there is no learner to scope an export to. **The same reasoning
is what makes it not erasable** (§8), and it is the reason `LD-S3-15` is treated identically. This is
the one place where the honest answer to *"can I have it / can you delete it"* is **no, and here is
why** — and stating that is better than an export section containing a number that describes a
population rather than a person.

---

## 8. Erasure — the per-category disposition

### 8.1 The dispositions

Five values. **`unreachable` is a real value and is used**, because a table that claimed otherwise
would be the *"erasure completes on paper"* failure the charter's `R2` names, written into the design.

| Disposition | Meaning |
| --- | --- |
| `delete` | The row is removed |
| `cascade` | Removed automatically as a consequence of another category's deletion |
| `de-identify` | The record survives with the learner-linking or learner-authored part removed |
| `not-applicable` | Nothing is stored, or the category is not personal data |
| `unreachable` | Personal data that **no per-learner predicate can select** |

| Id | Disposition | Reason |
| --- | --- | --- |
| `LD-S3-1` | `delete` | Learner's own study structure |
| `LD-S3-2` | `delete` | Learner's own content; the product's most obvious erasure target |
| `LD-S3-3` | `delete` | Behavioural data about a person; a column group of the same row as `LD-S3-2` |
| `LD-S3-4` | `delete` | A column group of `learning_chunks`; goes with the chunk. May quote the content it judges, which is why it is not retained separately. |
| `LD-S3-5` | `delete` | Includes learner free text (`feedback`) |
| `LD-S3-6` | `delete` | Behavioural: per-chunk effort and progress |
| `LD-S3-7` | `delete` | Generated against the learner's own material |
| `LD-S3-8` | `delete` | Links one learner's question to one learner's chunk |
| `LD-S3-9` | `delete` | The learner's own words and a judgement of them — SUB-3's most sensitive persisted category |
| `LD-S3-10` | `delete` | **The decision SUB-3 handed here.** Deleted with the attempt. Its evaluation purpose is severable (`CP-S8-2`) and can be met by aggregates, so retaining per-person prediction records after erasure would need an exception it cannot justify. |
| `LD-S3-11` | `de-identify` | Retain that a grade changed and when; drop `original_feedback`, `new_feedback` and `reason`. **Named exception, §9.** |
| `LD-S3-12` | `delete` | Learner free text. **Not reachable by an FK walk** — `target_id` is a loose polymorphic reference with no database foreign key (`03_learner-data-inventory-and-classification.md` §4), so an erasure sweep must target notes explicitly and may not rely on a cascade. |
| `LD-S3-13` | `not-applicable` | Not personal data at this cutoff. Becomes `delete` the moment a principal is bound to it — OUT-13's change, not this chapter's. |
| `LD-S3-14` | `cascade` | `ON DELETE CASCADE` on `chunk_id` → `learning_chunks.id` (`src/infrastructure/db/schema.ts:333`). Deleting the chunk removes its corpus rows. A propagation path the design gets for free — and one that only fires if the chunk is deleted, so a corpus-only withdrawal (§6) still needs its own delete. |
| `LD-S3-15` | `not-applicable` | Aggregate counts, no learner reference, no FK |
| `LD-S3-16` | `delete` for `user` rows post-cutover · **`unreachable`** for the pre-cutover population | §8.2 |
| `LD-S3-17` | `delete` for `user` rows post-cutover · **`unreachable`** for the pre-cutover population | §8.2 |
| `LD-S3-18` | `not-applicable` | Process-local; evicted on session close, gone on restart |
| `LD-S3-19` | `not-applicable` | As above. Holds the only email address in the system, and holds it for the duration of a connection. |
| `LD-S3-20` | `not-applicable` | Fixed-window counters, swept lazily |
| `LD-S3-21` | `not-applicable` | Not personal data |
| `LD-S3-22` | `not-applicable` | Request-scoped |
| `LD-S3-23` | `not-applicable` | Not personal data |
| `LD-S3-24` | `not-applicable` | Not personal data |
| `LD-S3-25` | **`unreachable`**, bounded | Transiently holds the same unredacted payloads the log tables persist, **outside every table and reachable by no `DELETE` whatsoever** (`F-S3-2`). Bounded by the flush interval — `DEFAULT_FLUSH_INTERVAL_MS = 5 000` (`src/transport/pg-audit-transport.ts:31`) — so the exposure is seconds, not indefinite. Named exception, §9. |
| `LD-S3-26` | `not-applicable` | The IdP's public keys |
| `LD-S3-27` | `not-applicable` | Lazily built runnables, no content |
| `LD-S3-28` | `not-applicable` | Computed on read; nothing stored |
| `LD-S3-29` | `not-applicable` | Assembled fresh per call; nothing stored. Erasing its **inputs** empties it. |
| `LD-S3-30` | `not-applicable` | Transient aggregates |
| `LD-S3-31` | `delete`, on SUB-1's recorded terms | Zero members. If it acquires one, SUB-1's destruction condition applies at its quarantine path; **this chapter sets no term of its own.** |
| `LD-S3-32` | `not-applicable` | Counts over rows are not the rows (§7.4) |
| **`LD-S8-1`** | **`de-identify` after the retention window, never `delete` on request** | The record that proves the erasure was requested and honoured cannot be the first thing the erasure destroys. **Named exception, §9**, audited like any other. |

### 8.2 What erasure honestly guarantees, and what it provably cannot reach

**This is the section SUB-9 and SUB-12 build on, and it is stated as a limit rather than as a
caveat.**

Under `DR-C11-S16-2` both log tables become `learner-linked` personal data once the attribution
carrier lands, and become reachable by `DELETE … WHERE learner_key = $1`. **That predicate is
complete only for rows written after the carrier lands.** Rows written before it carry
`principal_kind = 'none'` and no key, and **no later process can supply one**: the only structure that
ever held a session-to-subject binding is the process-local map at `src/transport/http.ts:83`, whose
sole eviction path is a clean session close and which is emptied by every restart, at a measured
**≥3.29 restarts/day over the most recent 7 days** (`91_findings-register.md` § `F-S15-3`;
`15_operational-objectives-for-the-real-platform.md` §2.2, `C-17`).

> **An erasure over either log table therefore returns success and a row count while the entire
> pre-cutover population survives.** The failure is created by the fix, which is what makes it easy
> to miss.

**What this chapter does about it — three things, and not a fourth.**

1. **It scopes the guarantee rather than the request.** An erasure is stated as complete *for the
   attributable population*, and the artifact confirming it must say so. A completion notice that
   says "erased" without that qualifier is false, and this chapter declines to design one.
2. **It records the exception as a blocking finding**, because the pre-cutover population **cannot be
   given a learner-scoped retention bound at all** — no predicate selects it per learner, and the
   only bound available to it is time-based and population-wide, which is a **different kind of
   thing** from a retention exception and must not be recorded as one. That is
   `91_findings-register.md` § `F-S8-2`, and it is this sub-task's OUT-11 blocking finding.
3. **It routes the disposition and does not pre-empt it.** **SUB-9 (NEU-1003) owes that population a
   disposition — bulk deletion, bulk anonymization, or an accepted and named residual — rather than a
   key**, exactly as `F-S16-5` and `R-S16-1` state. This chapter asserts **nothing** about which SUB-9
   will choose, and its own `unreachable` disposition is a statement about the *predicate*, not a
   recommendation about the *population*.

**The fourth thing, which it deliberately does not do:** it does not assume the delete is complete,
and it does not quietly narrow the erasure duty to the attributable population so that the numbers
work. The duty covers both populations; only the mechanism reaches one.

**No row count is asserted.** The population's size is unobserved and depends on `OI-S1-5`,
`OI-S1-6` and `OI-S16-1`, all owned and unclosed.

---

## 9. Retention exceptions — the four-field audit

**Every exception carries a justification, a time bound, an owner and a stated basis, or it is a
blocking finding.** Five candidates were audited. **Four pass; one fails.** **Zero exceptions of
indefinite duration are accepted.**

| # | Exception | Justification | Time bound | Owner | Stated basis | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **`LD-S8-1` — the consent record, retained after withdrawal** | Proving that consent was given, that withdrawal was received, and that it was honoured. Deleting it destroys the only evidence of the very act it records. | **24 months after the withdrawal instant**, then `de-identify` — drop `learner_key`, keep the counts and the policy version | **`CMP-S4-7`**'s operator: the creator, as sole maintainer and sole operator | Demonstrating consent — a legal-obligation-shaped position, **never consent itself**; selection is `OI-S3-1` | **Passes.** Audited as one exception among five, **not exempted for being the package's own.** |
| 2 | **`LD-S3-11` — the grade-revision trail, de-identified rather than deleted** | Integrity of the grading record: that a grade was changed must remain visible even after the content is gone | **Retained indefinitely only in de-identified form**; the learner-linking and free-text fields are dropped **at the erasure deadline**, 30 days | The creator, as sole maintainer and sole operator | Legitimate interests — record integrity | **Passes.** The bound is on the **identifiable** form, which is what the four-field test is about. An indefinite retention of a non-identifying counter is not a retention exception. |
| 3 | **`LD-S3-25` — the in-memory batch buffers, unreachable by any `DELETE`** | No mechanism can reach them; the exposure is a consequence of batching, not a choice to retain | **≤ 5 s** — `DEFAULT_FLUSH_INTERVAL_MS = 5 000` (`src/transport/pg-audit-transport.ts:31`); entries also die with the process | The creator, as sole maintainer and sole operator | Legitimate interests — operating the service | **Passes**, and it is the strongest bound in the table because a constant enforces it rather than a policy. |
| 4 | **`LD-S3-16` — the 30-day request-log window** | Operating and debugging the service | **30 days**, by `scripts/retention-cleanup.sql` | The creator, as sole maintainer and sole operator | Legitimate interests | **Passes with a stated condition.** The script's cron registration exists **only as a comment**, so whether it runs on the deployment is not establishable from the repository and is **not asserted** here. The bound is stated; its enforcement is `OI-S1-9`'s territory and is cited, not re-raised. |
| 5 | **The pre-cutover population of `LD-S3-16` and `LD-S3-17`** | — | **Cannot be given one that discharges an erasure request** | SUB-9 (NEU-1003) for the disposition; the creator for the population | — | **FAILS. Recorded as the OUT-11 blocking finding `F-S8-2`** rather than accepted. |

**Why #5 fails rather than being given a bound.** A population-wide time bound *could* be written
next to it, and it would pass the test on paper and mean nothing: a time bound does not discharge one
learner's erasure request, and recording it as an exception would convert an **inability** into a
**policy**. The charter's rule is that an exception which cannot be given all four is recorded as a
blocking finding, and this one cannot be given a justification or a learner-scoped bound at all.

**`operation_event_log` has no retention bound of any kind** — no cleanup script covers it, and the
codebase describes it in its own words as *"the indefinitely-retained `infrastructure.operation_event_log`"*
(`src/orchestration/chunk-workflows.ts:160`–`:161`). `92_risk-register.md` § `R-S16-4` names **SUB-8**
as the owner of that retention position. **This chapter sets one, as a product-and-engineering
position and not as a determination:** the table takes **the same 30-day window as `LD-S3-16`**, on
the same basis, with the same owner. Stating a *position* is not the legal determination `R-S16-4`
declined to make — that remains `OI-S3-1` — and leaving the field blank would have been the silent
indefinite retention OUT-11 exists to end. **No mechanism enforces it**, which is `R-S8-4`.

### 9.1 The completion deadline, and its provenance

| Act | Deadline | Provenance |
| --- | --- | --- |
| **Export** | **30 days** from an authenticated, verified request | Derived from the one-month response norm of the **GDPR-shaped baseline the charter ratified at intake**. **Not observed. Not calibrated. Not a legal determination.** |
| **Erasure** | **30 days** from an authenticated, verified request; the propagation proof is due at the same instant | As above |
| **Withdrawal — stop processing** | **The next request.** No window. | A switch that takes 30 days to flip is not a switch |
| **Withdrawal — purge collected copies** | **7 days** | Shorter than erasure because the scope is three severable purposes, not every copy |

**This is the value `DR-C11-S16-3` left to this sub-task.** `16_attribution-and-detection.md` §6
records that the contract *"fixes that the field exists, is required and is carried on the proof"*
and that *"until SUB-8 states a policy, `SIG-S16-3` is fully specified and not yet evaluable"*.
**It is now stated.** `SIG-S16-3` becomes **evaluable in principle** — and remains **unemitted**,
because `ME-S16-6` records that no completion-proof store exists and no propagation emits anything.
Evaluable-and-unemitted is a real advance and is **not** the same as working; `92_risk-register.md` §
`R-S8-3` carries the difference.

The value is carried as the stand-in `95_stand-in-assumption-register.md` § `A-S8-1`, with a tolerance
envelope and an invalidating outcome, because it is a chosen number resting on a basis that is not
determined.

---

## 10. The purge-mechanism audit

Re-derived at cutoff `d2e2b55` by direct read, not inherited.

### 10.1 Which mechanisms exist, and which are wired

| Mechanism | Port | Adapter | Wired? | What it requires |
| --- | --- | --- | --- | --- |
| `ContextTokenRepository.deleteExpired(before)` | `src/ports/context-token-repository.ts:6` | `src/adapters/drizzle/context-token-repository.ts:61` | **No — zero call sites in `src/`** | A caller. There is no scheduler to be that caller (§10.3). |
| `ContextTokenRepository.delete(token)` | `src/ports/context-token-repository.ts:5` | `src/adapters/drizzle/context-token-repository.ts:58` | Single-token only | A token value |
| `SessionRepository.deleteSession(id)` | `src/ports/session-repository.ts:62` | `src/adapters/drizzle/session-repository.ts:100` | **No — zero call sites in `src/`** | A caller and an MCP tool |
| `SessionRepository.deleteSessionChunk(id)` | `src/ports/session-repository.ts:76` | `src/adapters/drizzle/session-repository.ts:160` | **No — zero call sites in `src/`** | A caller and an MCP tool |
| `LinterValidationRepository.deleteCorpusEntry(ruleId, chunkId)` | `src/ports/linter-validation-repository.ts:73` | `src/adapters/drizzle/linter-validation-repository.ts:52` | **No — zero call sites in `src/`** | A caller |
| `ChunkRepository.delete` | `src/ports/chunk-repository.ts:83` | `src/adapters/drizzle/chunk-repository.ts:165` | **Yes** — MCP tool `delete_chunk` | — |
| `NotesRepository.deleteNote` | `src/ports/notes-repository.ts:21` | `src/adapters/drizzle/notes-repository.ts:61` | **Yes** — MCP tool `delete_note` | — |
| `TopicRepository.delete` | `src/ports/topic-repository.ts:32` | `src/adapters/drizzle/topic-repository.ts:85` | **Rollback only** — no `delete_topic` tool exists | An MCP tool, if a learner is ever to reach it |
| `scripts/retention-cleanup.sql` | — | — | **Unknown** — cron registration present only as a comment | A scheduler on the deployment |

### 10.2 What the audit found

**`deleteExpired()`'s unwired status, recorded explicitly and as the charter requires:** it is defined
on the port, implemented in the Drizzle adapter, and **called from nowhere in `src/`**. Expired
`context_tokens` rows accumulate without bound.

**And it is not the only one.** **Four** methods are defined on a port, implemented in an adapter, and
invoked from nowhere: `deleteExpired`, `deleteSession`, `deleteSessionChunk` and `deleteCorpusEntry`.
Charter assumption 16 calls `deleteExpired()` *"the only purge path in the codebase"* — accurate for a
**bulk/sweep** purge, and narrower than the deletion surface actually is. Reported as
`91_findings-register.md` § `F-S8-3`, not absorbed here.

**The consequence for OUT-11 is the sharpest finding in this chapter.** Exactly **two** delete paths
are reachable from a user-facing MCP tool — `delete_chunk` and `delete_note`. There is **no
`delete_topic`, no `delete_session` and no way to delete an attempt or an answer**. So of the
**thirteen** categories §8 dispositions as `delete` or `cascade` outright — `LD-S3-1` … `LD-S3-10`,
`LD-S3-12`, `LD-S3-14` and `LD-S3-31` — a learner can today reach **three**: `LD-S3-2` and
`LD-S3-12` directly, and `LD-S3-14` by cascade. `LD-S3-3` and `LD-S3-4` go only as a side effect,
because they are column groups of the same row a chunk deletion removes; a learner cannot erase them
without erasing the chunk. (`LD-S3-16` and `LD-S3-17` carry a **split** disposition and are counted
in neither figure; see §8.2.)

**The erasure design in §8 is therefore a specification, not a description of a capability.** Stating
that plainly is the point of running the audit before writing the design rather than after.

### 10.3 Scheduling

`setInterval` occurs exactly **four** times in `src/`, in two pairs: a declaration and its assignment
in each of `src/transport/pg-audit-transport.ts:46`, `:151` and
`src/transport/pg-event-transport.ts:42`, `:138`. **Both are log-flush timers. There is no purge
timer, no cron registration and no scheduled job of any kind in `src/`.** This confirms charter
assumption 16's *"no scheduled job in `src/` beyond the two log-flush timers"* at this cutoff, by
independent re-derivation.

---

## 11. The tool-surface figure, disclosed

The settled figure this package uses is **46 registered / 43 gated / 3 exempt**. It was re-counted
independently at this cutoff and **it holds**: `registerTool(` occurs **46** times across
`src/server/`, and `EXCLUDED_TOOLS` at `src/transport/context-token-middleware.ts:5`–`:9` holds
exactly three names — `init_agent_context`, `get_server_info`, `get_server_workflow`. 46 − 3 = 43.

**One disclosure, so SUB-17's audit meets the explanation rather than the anomaly.** The gating split
is **not visible at the registration sites**: all 46 tools are registered unconditionally, and the
gate is applied later, in the transport middleware, by name-exclusion. A reader counting *"gated"*
tools in `src/server/` will find no such distinction and may conclude the figure is unsupported. It
is supported — the two halves of it simply live in different files. `F-S16-3`'s existing
qualifications on the word *gated* (HTTP-only mount; fails open on internal error) apply unchanged
and are **cited, not restated**.

**`42` appears nowhere in this chapter as a codebase fact**, and no citation in it resolves to a
line 42.

---

## 12. C010 consistency check

Run, and recorded so SUB-17's audit can see that it ran rather than infer it from an absence.

- **The authority-assignment rule** was consumed from
  `../C010-system-and-repository-architecture/08_per-state-authority-matrix.md` §5 with the source
  cited, applied rather than re-invented, and **neither matrix is edited**.
- **The individuation rule** was consumed from
  `../C010-system-and-repository-architecture/decision-records/DR-C10-S3-1_state-category-individuation.md:11`–`:13`
  with its source cited, to establish that a versioned consent record mints a new category rather
  than widening an existing one.
- **Charter assumption 37's greenfield claim** was independently corroborated from the codebase side
  (§1) and from C010's side: C010's only retention/deletion content is the chain of **C010's**
  `CAP-S3-3` / `CAP-S4-1` / `F-S3-3` / `CAP-S7-1` over the two operational-log tables. Those four ids
  are **C010's** and are written qualified, on the discipline
  `03_learner-data-inventory-and-classification.md` §0 already applies — C011 has its own `F-S3-3`
  and its own `CAP-S3-1`, which are different records.
- **C010's `CAP-S7-1`** — *the web API's erasure capability cannot be scoped at all, because no row
  holding learner payload has a deletion owner* — is **consistent with** this chapter rather than
  contradicted by it. This chapter scopes an erasure **duty** per category; it does not claim a web
  API capability, and it does not discharge that cap. **Discharging `CAP-S7-1` is SUB-9's**, and this
  chapter asserts nothing about whether SUB-9 does.

**No contradiction with C010 was found by SUB-8, and no amendment is routed to `NEU-895`.**

---

## 13. Source-change confirmation

`git diff --name-only origin/develop` for this branch lists files **only** under
`docs/research/C011-safe-production-integration-and-learner-isolation/` and one appended row block in
`docs/GLOSSARY.md`.

**Zero files changed under `src/`. Zero under `drizzle/`.** This chapter reads both extensively and
edits neither. The package `README.md` is **not** touched — it is SUB-14's to supersede.

**On the cutoff, after the pre-merge re-sync.** Every codebase fact in this chapter was read at
`d2e2b55`. `develop` moved to `cc38cc9` while this chapter was being written — SUB-4's chapter `04_`
(NEU-996) merged, plus a version bump — and this branch was re-synced onto it by **merge**, never a
rebase. `git diff --name-only d2e2b55 cc38cc9` lists **zero** paths under `src/` and **zero** under
`drizzle/`, so every citation above still resolves to the same line at the merged head and the
cutoff is left stated as `d2e2b55` rather than silently advanced to a commit whose code was never
read.

---

## 14. Ids allocated by this sub-task

- **Consent purposes:** `CP-S8-1` … `CP-S8-3` (§3). A new id family; `CP` is *consent purpose*.
- **Inventory category:** **`LD-S8-1`** (§5) — the consent record. Deliberately **not** `LD-S3-33`:
  continuing SUB-3's sequence would imply an edit to SUB-3's enumeration that this chapter is
  forbidden to make and does not make.
- **Findings:** `F-S8-1` … `F-S8-5` (`91_findings-register.md`), of which **`F-S8-2` is blocking**.
- **Risks:** **`R-S8-1` … `R-S8-4`** (`92_risk-register.md`). **Zero charter `R<n>` rows**, correctly:
  **no row of the charter's fifteen-row § Risks table names OUT-10 or OUT-11** as its owning outcome,
  so this sub-task has no charter row to author and its absence from that mapping is correct, not a
  gap.
- **Open items:** **`OI-S8-1`** (`93_open-items-and-provisional-register.md`) — one item, one
  question. **See the collision disclosure below.**
- **Caps:** `CAP-S8-1` (`94_caps-and-incomplete-scope.md`).
- **Stand-ins:** `A-S8-1` (`95_stand-in-assumption-register.md`) — sub-task-scoped, on
  `DR-C11-S15-3`'s scheme, because this entry stands in for **no numbered charter assumption**.
- **Spikes:** `SPK-S8-1` (`96_spike-register.md`) — designed, **not executed**.
- **Completeness-gate rows:** `G-S8-1` … `G-S8-12` (`97_package-completeness-gate.md`), scoped on
  SUB-2's `G-S<n>-<k>` scheme.
- **Outcomes:** OUT-10's and OUT-11's rows (`90_outcome-register.md`).
- **Decision records:** `DR-C11-S8-1`, `DR-C11-S8-2`. **Document numbers:** `08_` only.

**Every id above was computed from the charter and this package's published conventions alone**, so
that sub-tasks running concurrently cannot collide with them. **No sibling sub-task's output was read
to pick a number.**

### 14.1 The `OI-S8-1` collision, disclosed

**C010 also has an `OI-S8-1`, and it is a different record.** C010's is
*"`context_tokens` names no principal, so the obligated identity binding has nothing to bind to"*
(`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:410`–`:419`),
owned by **`SUB-10 of C010` (NEU-984)**. C011's `OI-S8-1`, raised here, is the cross-border and
third-party-processor question. **They collide in id shape only, never in subject.**

This is the same class of hazard `91_findings-register.md` § **`F-S2-2`** records for `OI-S1-2`, and
it is handled by the rule that finding already established and this package already applies: **a
cross-package open item is always written
qualified** — *C010's `OI-S8-1`* — **and a bare `OI-S8-1` always means this package's own.** The
collision is disclosed here rather than avoided by renumbering, because the id is computed from the
charter's own scheme and renumbering it would break the property that makes the scheme
collision-safe among concurrent siblings.

**Note for a reader of SUB-3:** `03_learner-data-inventory-and-classification.md` §9's closing
paragraph cites a bare *"`OI-S8-1`, owned by `NEU-984` (`SUB-10 of C010`)"*. That reference was
written at position 3, before `F-S2-2`'s qualification rule existed, and its own parenthetical names
the owner, so it resolves unambiguously to **C010's** item. **No revision of SUB-3 is requested or
owed on this ground**, and no finding is routed against it.

---

## 15. What this chapter does not establish

1. **It establishes nothing about production.** No consent has been captured, no export produced, no
   erasure run, no row counted. `CAP-S8-1`.
2. **It does not decide the disposition of the pre-cutover log population** — that is **SUB-9's**
   under OUT-12. It scopes erase around it and names the limit; it recommends nothing.
3. **It asserts nothing about SUB-9's propagation matrix, its copy-class cardinality, or its
   completion-proof design**, none of which exists at this position.
4. **It makes no legal determination** — not controller/processor role, not lawful-basis selection
   (`OI-S3-1`, cited and not duplicated), and not whether a cross-border transfer is lawful
   (`OI-S8-1`, raised here, unanswered).
5. **It does not re-route `F-S3-1`.** The unread, unredacted `response_body` minimization finding was
   routed by SUB-3 to **`NEU-986`**; this chapter neither re-routes it nor designs as though it were
   already fixed — §7.1's truncation label and §8.2's scope statement both describe the field as it
   stands.
6. **It does not revise SUB-3's inventory or SUB-16's determination.** Both are consumed. Zero
   revisions are produced, requested or owed.
7. **It does not claim `SIG-S16-3` works.** It supplies the missing value; emission remains
   `ME-S16-6`'s gap.
8. **It asserts nothing about band placement, cross-register consistency, or the package's audit
   set** — SUB-14's at position 15 and SUB-17's at position 16.
9. **No QA pass is claimed.** No capability owns the `qa-execution` surface, so the autonomous QA
   phase is a genuine no-op under Core Article 8 rather than a skipped gate.
