# `DR-C11-S8-1` — Consent covers only the severable secondary uses, and the consent record is a gate-bearing category with `CMP-S4-7` as its single authority

**Task:** NEU-1002 (SUB-8) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `d2e2b55`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-10 (`../90_outcome-register.md`) — the consent boundary in both directions, the record's shape and versioning, and its placement as a state category with exactly one authority

---

## Decision

**Three decisions, taken together because each is unsound without the others.**

**Decision 1 — consent covers only what is *severable* from the learning service.** A processing
purpose rests on consent **if and only if** the service continues to function when that purpose is
switched off. Under that test, exactly three of SUB-3's categories are consent-governed, and they are
named in `../08_consent-and-what-a-learner-can-export-and-erase.md` §3. **Everything else survives
withdrawal**, with its alternative basis named per category — contract for the learning service
itself, legitimate interests for the security and integrity controls.

**Decision 2 — the consent record is a new, append-only, versioned category.** A grant is a row; a
withdrawal is **a new row, never an update**. The record carries `policy_version`, so a consent given
against one statement of purposes is never silently re-read as consent to a later one. Its
`learner_key` is `DR-C11-S2-1`'s key — the OIDC `sub` verbatim, **never `azp`**.

**Decision 3 — its single authority is `CMP-S4-7`, under clause 2 of C010's ordered assignment
rule.** Consent state is **gate-bearing**: its value changes an authoring verdict, which is the whole
reason the record exists. Clause 2 therefore matches before clause 5 is reached, and
`../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:110`–`:113` states
that **no later clause may override clause 2**. The writer is on the request path — a learner grants
or withdraws — so the caller-side component is the orchestration workflows, `CMP-S4-7`. **Exactly
one authority. Authority is never split**
(`../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:128`).

## Rationale

**On decision 1.** The charter requires the negative boundary to be *"as explicitly as the positive
case"*, and the honest starting position is that **the positive case is currently empty**: not one of
SUB-3's thirty-two categories carries `consent` as its lawful-basis position
(`../03_learner-data-inventory-and-classification.md` §4–§8 — every entry reads *contract* or
*legitimate interests*). This outcome therefore **creates** a consent boundary rather than documenting
one, and the only defensible way to draw it is by a test a reader can apply themselves.

The severability test is that test. It also explains, without special pleading, why the learning
content itself is **not** consent-governed: withdrawal of consent to hold a learner's own chunks would
terminate the service, so a "consent" that cannot be withdrawn without destroying the thing it was
given for is not a real basis. That reasoning is not this package's invention — it is why
`../03_learner-data-inventory-and-classification.md` records those categories as **contract** in the
first place, and this decision consumes that position rather than restating it.

**On decision 2.** An overwritten consent row cannot prove what it needs to prove. The whole
evidentiary value of a consent record is the ability to say *"consent was in this state, against this
version of the purposes, at this instant"* — which an `UPDATE … SET state = 'withdrawn'` destroys.
Append-only also makes withdrawal **detectable** rather than merely effective, which is what lets
`SIG-S16-3` have a `deadline_at` to measure against at all.

**On decision 3, and why clause 2 rather than clause 5.** The row is learner-scoped, so clause 5
would fire — *if it were reached*. It is not, because the rule *"is ordered, and the first match
wins"* (`../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:103`) and
clause 2 sits above it. The substantive reason clause 2 exists is that **a gate's input must be owned
by the component that enforces the gate**, or the gate can be bypassed by writing its input somewhere
else. A consent record whose authority sat in the persistence layer would be exactly that: withdrawal
would become a row anyone on a database path could contradict.

**Reading, in C010's vocabulary, is not authority.** The quality-gate battery `CMP-S4-14` *reads*
consent state to decide whether a secondary-use write proceeds, and the persistence adapters
`CMP-S4-9` hold the bytes. Neither is the authority:
`../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:16` defines authority
as *"the single component permitted to write it"*, and
`../../C010-system-and-repository-architecture/05_system-context-and-responsibility-boundaries.md:121`
gives `CMP-S4-7` the unit of work for everything the use case writes. Two readers and one writer is
one authority, not a split.

**Minting a category C010 never inventoried is licensed by C010's own procedure, not by an
exception.** `../../C010-system-and-repository-architecture/decision-records/DR-C10-S3-1_state-category-individuation.md:11`–`:13`
makes individuation a **reusable test** — two pieces of state are one category iff they would
necessarily take the same single authority, with store, lifecycle and volatility as the
discriminators. A versioned, append-only consent record fails that test against every one of the 45
existing rows on lifecycle alone, so it mints a new category rather than widening an old one — the
negative precedent being
`../../C010-system-and-repository-architecture/04_state-category-inventory.md:355`–`:359`, where
matching store, writer, lifecycle and volatility produce a widening instead.
`../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:143` records that the
rule was chosen deliberately over *"the table-keyed alternative"*, which was rejected because it
*"cannot represent two thirds of the problem"*. **The inference this record draws from that — stated
as an inference, not as C010's words — is that a rule expressed over four discriminators rather than
over a table list is applicable to state that has no table yet.** C010 does not say that; it says why
the table-keyed rule lost, and this record reasons from the shape of the rule that survived.

**What this decision is careful not to claim.** `../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:96`–`:97`
and `../../C010-system-and-repository-architecture/10_republished-authority-matrix.md:46` each say no
category is added — and both are **local to those chapters' own scope over the existing 45**. This
decision does not read them as a prohibition on a downstream charter, and it does not edit either
matrix. It applies their published procedure to a category they never saw, and cites the revision in
the form `10_…` itself fixes:
**`08_…md` + `10_…md`, revision `post-validation` (`SUB-16 of C010` / NEU-979)**
(`../../C010-system-and-repository-architecture/10_republished-authority-matrix.md:62`–`:65`).

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Consent covers everything the learner's data is used for**, including the learning service itself. | It makes withdrawal undefined. A learner who withdraws would be asking the product to stop being the product, so either withdrawal is refused — and the consent was never real — or the account is destroyed as a side effect of a checkbox. This is the failure OUT-10's required finding exists to catch, and adopting it would have made the whole chapter that finding. |
| 2 | **Consent covers nothing; record that the package has no consent surface.** | Defensible on the codebase as it stands (zero categories rest on consent today) and still wrong: it leaves the secondary uses — a learner's chunks labelled into a rule-validation corpus — resting on legitimate interests with no learner-facing switch of any kind, which is the position `F-S3-1` already shows is weakest. OUT-10 asks what consent *covers*, not whether anything currently claims it. |
| 3 | **Authority `CMP-S4-9`, written through `CMP-S4-7` — clause 5.** | The landing the two log tables take, and the one this decision came closest to. It loses on clause order alone: clause 2 matches first and may not be overridden. Recording it here matters because a reader who tests only *"is it learner-scoped?"* will reach clause 5 and get a different answer; the reason they are wrong is that they never applied clause 2. |
| 4 | **Split authority — `CMP-S4-7` writes the grant, `CMP-S4-14` writes the gate outcome.** | Forbidden outright: *"Authority is never split"* (`../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:128`), and two producers is recorded there as **a defect in the inventory**, not a tie to be resolved. The gate outcome is in any case not consent state — it is a verdict *derived from* it, and conflating the two is how a derived value acquires an authority it should not have. |
| 5 | **Mutable consent row — one row per learner per purpose, updated in place.** | Cheaper, and it destroys the evidence. It cannot answer *"was consent in force at the moment that corpus row was written?"*, which is the only question a consent record is ever asked in anger. It also removes the withdrawal instant, leaving `SIG-S16-3` with nothing to compute `deadline_at` from. |
| 6 | **Capture consent at first sign-in, as a condition of using the product.** | Consent bundled with access to the service is not freely given, and it is unnecessary here: the service rests on contract, so bundling would extract a consent that does no work and simultaneously make withdrawal look like account closure. Consent is therefore captured **at the point the severable purpose is first offered**, which is also the only point at which a learner has enough context to answer. |
| 7 | **Version the consent by a timestamp alone rather than a `policy_version`.** | A timestamp orders events but does not say *what was consented to*. When the statement of purposes changes, a timestamp-only record silently re-reads an old consent as covering a new purpose — the exact drift the versioning exists to prevent. |

## Consequences

1. **Withdrawal has a defined, small, honest effect** — it stops three severable purposes and touches
   nothing else. The chapter must say this loudly, because a learner who expects withdrawal to erase
   their account will otherwise be misled by the word. Carried as `../92_risk-register.md` § `R-S8-1`.
2. **Erasure and withdrawal are different acts with different scopes**, and the chapter defines both
   rather than letting one stand in for the other.
3. **A new category exists that no C010 chapter inventories**, and this package — not C010 — carries
   its classification entry, per charter assumption 50. No revision of
   `../03_learner-data-inventory-and-classification.md` is produced, requested or owed.
4. **`CMP-S4-14` becomes a reader of consent state**, which is a new read edge C010's matrix does not
   show. It is a read, so it creates no second authority, but a later chapter re-running the matrix
   should expect to see it.
5. **What becomes harder:** any future proposal to rest the learning service on consent now has to
   argue against decision 1 explicitly, and any proposal to let a background job write consent state
   has to argue against clause 2. Both are deliberate.
6. **Nothing here is a legal determination.** Which basis each purpose *actually* rests on is
   `../93_open-items-and-provisional-register.md` § `OI-S3-1`, owned by SUB-3 and **cited, never
   restated**. This record states engineering positions.

## Evidence

| Claim | Source |
| --- | --- |
| The assignment rule is ordered and first-match-wins | `../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:103` |
| Clause 2 — gate-bearing state takes the MCP core caller-side, and no later clause may override it | `../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:110`–`:113` |
| Clause 5 — learner-scoped state takes `CMP-S4-9` written through `CMP-S4-7` | `../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:120`–`:122` |
| Authority is never split; two producers is a defect | `../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:125`–`:128` |
| Authority means the single component permitted to **write** — not the reader, not the byte-holder | `../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:16` |
| `CMP-S4-7` is the orchestration workflows and owns the use case's unit of work; `CMP-S4-9` is the persistence adapters; `CMP-S4-14` is the quality-gate battery | `../../C010-system-and-repository-architecture/05_system-context-and-responsibility-boundaries.md:121`, `:123`, `:128` |
| The revision to cite is `08_…md` + `10_…md`, revision `post-validation` | `../../C010-system-and-repository-architecture/10_republished-authority-matrix.md:62`–`:65` |
| `10_…md` adds no category and carries the authority vocabulary forward unchanged | `../../C010-system-and-repository-architecture/10_republished-authority-matrix.md:46`, `:94`–`:96` |
| The individuation test is reusable, and ambiguity resolves to two categories rather than one | `../../C010-system-and-repository-architecture/decision-records/DR-C10-S3-1_state-category-individuation.md:11`–`:13` |
| Matching store/writer/lifecycle/volatility yields a widening, not a new entry | `../../C010-system-and-repository-architecture/04_state-category-inventory.md:355`–`:359` |
| The individuation rule was chosen deliberately over a table-keyed alternative that *"cannot represent two thirds of the problem"* — the re-runnability inference drawn from it is **this record's**, labelled as such | `../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:143` |
| The learner key is the OIDC `sub` verbatim; `azp` never | `../decision-records/DR-C11-S2-1_the-persisted-learner-key.md`; `../02_identity-the-learner-key-and-principal-kind.md` §3 |
| Every one of SUB-3's 32 entries states *contract* or *legitimate interests* — none states consent | `../03_learner-data-inventory-and-classification.md` §4–§8 |
| The controller/processor role and lawful-basis selection are one question with one record | `../93_open-items-and-provisional-register.md` § `OI-S3-1` |

## Revision trigger

1. **`OI-S3-1` closes** with a lawful-basis determination that places any of the three severable
   purposes on a basis other than consent, or places a fourth purpose on consent.
2. **A consent-reading gate is proposed off the request path** — a background job or a scheduled
   task that writes consent state — which would put clause 2's caller-side reading in question.
3. **C010's authority matrix is revised again** beyond the `post-validation` revision, in a way that
   reorders the clause list or changes clause 2's scope.
4. **The severability test yields a different partition** because a purpose currently inseparable
   from the learning service becomes separable, or the reverse.
5. **A second learner exists.** At `n = 1` the consenting party and the operator are the same person,
   which is why no consent has ever in fact been captured; the first genuine third-party grant is the
   first real test of this record's shape.
