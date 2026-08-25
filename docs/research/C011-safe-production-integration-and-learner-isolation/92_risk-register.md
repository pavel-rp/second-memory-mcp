# `92` — Risk register

**Charter:** C011 (umbrella NEU-893) · **Opened:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]

Append-only. **Each entry is authored by whichever sub-task raises the risk** — carrying a severity,
a mitigation, a named owner and an escalation route — and SUB-14 (NEU-1007) aggregates them,
**authoring none**, on exactly the rule the findings register already follows (charter assumption 46).
A register that would otherwise be empty is a routed gap against its named author, never content
invented at assembly.

No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this
file, keep **both** sides.

## Id convention — why the numbering starts at `R8`

**`R<n>` is the row's position in the charter's § Risks table.** All fifteen rows of that table name
an owning outcome in the table itself (charter assumption 48), and each row is authored by the
sub-task covering that outcome. Fixing the id to the charter row means fifteen authors write into one
register without negotiating numbers, and SUB-14 renumbers nothing.

| Charter § Risks row | Severity | Owning outcome | Authoring sub-task |
|---|---|---|---|
| `R1` Mechanism ships and cross-learner exposure remains | Critical | OUT-8 | SUB-5 |
| `R2` Erasure or withdrawal completes on paper | Critical | OUT-12 | SUB-9 |
| `R3` Transport gate sequenced last | Critical | OUT-3 | SUB-7 |
| `R4` Cannot be rolled out or rolled back | High | OUT-4 | SUB-7 |
| `R5` Inherited 18-question universe | High | OUT-20 | SUB-17 |
| `R6` `NEU-896` overlap on the handoff boundary | High | OUT-20 | SUB-17 |
| `R7` Scope drifts from List B | High | OUT-20 | SUB-17 |
| **`R8` Production access incident or capture leak** | **High** | **OUT-18** | **SUB-1** |
| `R9` Unprobed dirty-data pathology survives the dry-run | High | OUT-2 | SUB-6 |
| `R10` Compatibility contract written against a stale tool count | High | OUT-16 | SUB-11 |
| `R11` Lifecycle half written as if it had an upstream | High | OUT-9 | SUB-3 |
| `R12` Legal determination asserted, authority overstated | Medium | OUT-9 | SUB-3 |
| **`R13` `n = 1` evidence** | **Medium** | **OUT-18** | **SUB-1** |
| **`R14` Spike becomes implementation, or a stale spike is cited** | **Medium** | **OUT-18** | **SUB-1** |
| `R15` Vocabulary collision with the domain's own terms | Low | OUT-20 | SUB-17 |

Fifteen rows, fifteen named authors: SUB-1 ×3, SUB-3 ×2, SUB-5, SUB-6, SUB-7 ×2, SUB-9, SUB-11 and
SUB-17 ×4. **SUB-1 authors `R8`, `R13` and `R14`** — all three OUT-18-owned rows — below. The
remaining twelve are their own authors' to write; their absence here is correct, not a gap.

## Mitigation-status vocabulary

Exactly three values. **Mitigated** — the mitigation is in place and its residual, if any, is
closed. **Partially mitigated** — the mitigation is in place and a named residual remains open.
**Open** — no mitigation is yet in place. Every non-mitigated status names its residual and that
residual's owner.

---

### SUB-1

## `R8` — Live production access causes an incident, or a published capture leaks token material

- **Risk:** Live production access causes an incident, or a published capture leaks token material.
- **Severity:** **High**
- **Owning outcome:** **OUT-18** — the spike register and its access and redaction audits, which is where every production touch and every published capture is recorded.
- **Named owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who can contain a production incident or revoke leaked credential material.
- **Escalation route:** The creator, as sole maintainer and sole operator, **with the incident and its residue additionally recorded for `NEU-896`**, since a leaked capture is a program-level exposure and not this package's alone.
- **Mitigation:** Access is read-only and non-mutating by constraint against the production database, the running MCP server and the deployment, with an access audit confirming zero mutating operations against those three and enumerating the single registered exception — IdP token issuance, whose only residue is a minted token and an IdP audit record. Credential handling follows the project's existing GitHub-Actions-secrets convention. A redaction audit runs over every published capture. Each spike is bounded, registered and expiring, and `init_agent_context` is excluded from the permitted set by name because it mints a `context_tokens` row.
- **Mitigation status:** **Mitigated at revision 1.** The realised exposure is zero on both limbs: zero production operations of any kind were performed (`01_production-evidence-and-the-access-audit.md` §3), and zero captures were published, so zero captures can leak (§5). **Residual:** the mitigation is untested against a real access episode, because no access episode occurred. The moment `OI-S1-1` … `OI-S1-9` are worked, this risk becomes live and its status must be re-assessed by the owner named above — the mitigation is designed and recorded, but it has not yet had to hold.

---

## `R13` — The whole design is validated against `n = 1` evidence

- **Risk:** The whole design is validated against `n = 1` evidence — the creator — because no multi-learner evidence exists anywhere upstream.
- **Severity:** **Medium**
- **Owning outcome:** **OUT-18** — the evidence outcome, which owns the standing evidence labels and requires every uncertain-and-material claim to resolve to a spike record or an owned open item.
- **Named owner:** **`NEU-896`** at convergence. No party inside this package can close it: no multi-learner evidence exists in any package, so this is a program-level evidence gap C011 can label but cannot close.
- **Escalation route:** `NEU-896` at convergence, where a claim needing multi-learner evidence is reconciled across packages.
- **Mitigation:** The absence is stated as a standing evidence label on every claim about multi-learner behaviour. Isolation claims rest on mechanically checkable invariants and DB-backed tests rather than on observed usage. Anything that would need real multi-learner data to confirm is marked `[unconfirmed]` with the production-evidence transition that would replace it.
- **Mitigation status:** **Partially mitigated, and worse at revision 1 than the charter anticipated.** The charter's mitigation assumes `n = 1` evidence — one real learner, the creator. **C011 SUB-1 delivered `n = 0`:** no token was observed for any principal shape and no production row was inspected, so the design rests not on one learner's evidence but on none, and on repository-derived design documents alone. **Residual, named:** all nine of `OI-S1-1` … `OI-S1-9`, owned by the creator as sole operator. Until at least `OI-S1-1` and `OI-S1-3` close, every downstream claim about real principal behaviour is `[unconfirmed]` rather than `n = 1`-confirmed. This is recorded as a distinct and worse position than the charter's, not folded into it — see `F-S1-2` in `91_findings-register.md`.

---

## `R14` — A spike becomes disguised implementation, or a stale spike conclusion is cited long after its expiry

- **Risk:** A spike becomes disguised implementation, or a stale spike conclusion is cited long after its expiry.
- **Severity:** **Medium**
- **Owning outcome:** **OUT-18** — the spike register, which sets each entry's method, confidence and expiry and carries the quarantine rule.
- **Named owner:** **`NEU-896`** at convergence for the stale-citation limb; **the creator, as sole operator**, for the spike-became-implementation limb, because that breach is against the production deployment they own.
- **Escalation route:** `NEU-896` at convergence, where a stale conclusion already cited by another package is reconciled; **additionally to the creator as sole operator** where a spike turned into implementation against the deployment they own.
- **Mitigation:** Quarantine is structural — read-only access only, nothing written to `src/`, nothing merged as product code. Every spike carries question, justification, method, result, confidence and a **mandatory** expiry, never blank and never "N/A". Every citation references the record by id rather than restating its conclusion. Each spike must first fail the *"could this have been read from the repository instead?"* test.
- **Mitigation status:** **Mitigated at revision 1 on the implementation limb, open on the stale-citation limb.** The implementation limb is discharged by construction: nothing was executed at all, and `git diff` against `origin/develop` shows zero files changed under `src/` or `drizzle/` — see `01_production-evidence-and-the-access-audit.md` §7. The stale-citation limb is **open and becomes live immediately**, and in an unusual form worth stating plainly: **the nine entries carry a `Result: not executed` and an expiry of 2026-11-25, so the risk here is not that a stale *observation* is cited, but that a stale *unobtainability* is.** A later reader could cite `SPK-S1-3` as evidence that the DCR shape cannot be captured, when what it records is that it could not be captured **from one particular authoring environment on one particular date**. **Residual, named:** every entry in `96_spike-register.md` past 2026-11-25 that has not been re-run or re-labelled, owned by the creator as sole operator. The register's expiry rationale states this for each entry.

---

**SUB-1 register totals at revision 1:** three entries — `R8` (High), `R13` (Medium), `R14` (Medium).
All three OUT-18-owned charter § Risks rows are present. One mitigated, two partially
mitigated-or-open; every non-mitigated status names its residual and that residual's owner.

---

### SUB-3

**A note on these two ids, because they do not match the allocation table above.** The id rule this
register states — *"`R<n>` is the row's position in the charter's § Risks table"* — was applied
directly to the charter, read at cutoff `86fb38a` on 2026-08-25. On that reading the charter's rows
10, 11 and 12 are **legal determination (Medium, OUT-9)**, **stale tool count (High, OUT-16)** and
**greenfield lifecycle half (High, OUT-9)**, in that order. SUB-3 therefore authors **`R10`** and
**`R12`**. Rows `R1`–`R9` and `R13`–`R15` agree exactly between the charter and the table above; only
10–12 differ, as a permutation. The discrepancy is reported as **`F-S3-3`** in
`91_findings-register.md` and handed to SUB-14, which aggregates this register. **Nothing above is
reflowed, renumbered or rewritten** — the append-only rule holds, and SUB-11 is co-named in that
finding because its own id is affected.

## `R10` — A privacy or ownership requirement is asserted where a legal determination is actually required

- **Risk:** A privacy or ownership requirement is asserted where a legal determination is actually required, and the package's authority is overstated.
- **Severity:** **Medium**
- **Owning outcome:** **OUT-9** — the inventory, which is where a lawful basis and a purpose are stated per category and therefore where an overstatement would first be written.
- **Named owner:** **The creator, as sole maintainer and sole operator of the production deployment**, named on `OI-S3-1` — the single register record of the controller/processor and lawful-basis question. They are the only party who can obtain, or commission, the legal determination this package cannot make.
- **Escalation route:** The named owner of `OI-S3-1` — the same party — **with `NEU-896` gating implementation authorization on that item carrying an owner**, so an unowned legal question escalates to convergence rather than sitting unresolved. The route is deliberately a party outside this package's own audits.
- **Mitigation:** The framing constraint is stated in the chapter itself and repeated per entry: **product and engineering requirements, not legal advice** (`03_learner-data-inventory-and-classification.md` §0, §1). The entry shape names field 3 *"Lawful basis (**position**)"* rather than "lawful basis", so every one of the 32 entries is self-labelling on this point. Controller/processor role and lawful-basis **selection** route to `OI-S3-1` with a named owner; cross-border transfer is deliberately **not** raised here and is SUB-8's own separate open item at position 10, keeping one question to one id. `93_open-items-and-provisional-register.md` carries exactly one record of the question, and §15 of the chapter states in terms that no legal determination is made.
- **Mitigation status:** **Partially mitigated.** The mitigation is in place: every basis in the inventory is written as a position, the framing is stated three times, and the question has one id and one named owner. **Residual, named:** the positions themselves are still *assertions about which basis would apply*, and nobody with legal standing has reviewed them. Until `OI-S3-1` closes, a reader could reasonably treat the inventory's basis column as settled when it is not — which is exactly the failure this entry describes, one step removed. The residual is owned by `OI-S3-1`'s named owner, and `NEU-896` holds the gate.

---

## `R12` — The data-lifecycle half has no upstream to consume and is written as if it did

- **Risk:** The data-lifecycle half has no upstream to consume and is written as if it did — quietly assuming a consent, retention or export position that no package ever took.
- **Severity:** **High**
- **Owning outcome:** **OUT-9** — the first outcome of the lifecycle half, which establishes the classification the rest of OUT-10…OUT-12 build on and is where an unsourced inherited position would enter.
- **Named owner:** **`NEU-895` (C010)** where a lifecycle position is found to exist upstream after all — the greenfield claim rests on a sweep of C010's package and is falsifiable by it. Otherwise **`NEU-896`** at convergence.
- **Escalation route:** **`NEU-895` (C010)** if a lifecycle position is found upstream, since charter assumption 37's greenfield claim is a claim *about C010's package* and C010 is the party that can contradict it; **otherwise `NEU-896`** at convergence, where a position taken by a sibling package would surface. Both are outside this package's own audits.
- **Mitigation:** The greenfield status is stated as a constraint in the chapter's opening (`03_learner-data-inventory-and-classification.md` §0) with the sweep and its date named, and with C010's only retention/deletion content enumerated exactly — the chain of **C010's** `CAP-S3-3` / `CAP-S4-1` / `F-S3-3` / `CAP-S7-1` over the two operational-log tables, and nothing else. (Those four ids are **C010's**, written qualified because two of them collide by shape with this package's own: C011 has its own `F-S3-3` — the risk-id discrepancy, immediately above — and its own `CAP-S3-1`. C010's `F-S3-3` is a different finding, about the log tables' missing retention window and deletion owner.) Every classification the chapter states carries **its own** evidence: a real path and line at a stated cutoff, or an explicit citation to the upstream record it consumes. Exactly one thing is consumed from C010 rather than re-derived — the state-category **individuation rule** (`DR-C10-S3-1`) — and it is cited at both §3 and §10 rather than absorbed. The rejected alternatives live in `DR-C11-S3-1`, `DR-C11-S3-2` and `DR-C11-S3-3` rather than being implied.
- **Mitigation status:** **Partially mitigated, and the residual is specific rather than generic.** The mitigation held on the audit that can be run: every basis, purpose and minimization position in the 32 entries is authored here with its own evidence, and none cites an upstream lifecycle position, because none exists to cite. **Two named residuals.** First, the greenfield claim rests on a **sweep dated 2026-08-24** of C010's package, not on a mechanical guarantee; a lifecycle position sitting in a C010 document the sweep did not open would falsify it, and that is why the escalation route names `NEU-895` on that limb specifically. Second, and more live: **OUT-10, OUT-11 and OUT-12 inherit this classification as their only upstream**, so an unsourced position entering *here* propagates to three outcomes rather than one — the reason this row is High while `R10` is Medium. The inventory's own defence against that is that every entry is falsifiable against a cited path, which a reader can check without leaving the package.
### SUB-15

**Id shape in this section, and why it differs.** SUB-15 authors **no `R<n>` entry**, because **no
row of the charter's fifteen-row § Risks table names OUT-14 as its owning outcome** (charter
assumption 48) — row `R4`, the cannot-roll-out-or-roll-back row, names **OUT-4** and is **SUB-7's**
entry, with SUB-15 named in its *mitigation* as the supplier of the platform objectives it is checked
against. The three entries below are residual exposures SUB-15 raises **itself**, which the charter
table does not cover and for which `R<n>` therefore yields no number. They take the sub-task-scoped
form **`R-S15-<k>`**, matching the convention the package's other five registers already use and
collision-free by construction against the sub-tasks authoring concurrently. The decision, its
rejected alternatives, and **SUB-14 (NEU-1007) as its adjudicator**, are recorded in
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`. Nothing above this line is
touched, and no charter-row number is claimed.

## `R-S15-1` — The whole objective set is derived from repository constants over zero production observations, and a reader treats it as measured

- **Risk:** Every number in `15_operational-objectives-for-the-real-platform.md` is a model built from shipped-code constants, this repository's own git history and one upstream micro-benchmark. **Not one was observed in production.** The risk is not that the model is wrong — it is that a later reader, meeting a table of numeric objectives, cites one as a measured property of the running system.
- **Severity:** **High** — because the objectives are consumed by SUB-7's rollout stages and SUB-9's lifecycle work, and a rollout gated on a mis-trusted capacity figure fails in production rather than on paper.
- **Owning outcome:** **OUT-14** — the objective set, which owns the evidence labels and the requirement that every unverifiable claim be spiked or `[unconfirmed]` with an owner.
- **Named owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who can convert any of the eight `[unconfirmed]` inputs into an observation. No party inside this package can close it.
- **Escalation route:** **`NEU-896`** at convergence, where a claim needing production evidence is reconciled across packages, and where the program-level question this raises actually belongs: **whether the product should accept a 2-to-200-learner ceiling at all** is a program decision, not one this package can take. Co-named the creator for the observations themselves.
- **Mitigation:** Four-label evidence vocabulary applied to every one of 27 inputs with the per-label counts reported and summed (§2, §6); the label `observed-in-production` used **zero** times and its emptiness stated in the chapter's own words rather than inferred; every threshold depending on an unobserved term published as a **formula plus a bounded band** with the term named and routed, so the two-order-of-magnitude uncertainty is visible in the objective itself rather than hidden behind a midpoint; four spikes registered with methods and expiries; and a "what this chapter does not establish" section naming the four things a reader must not quote.
- **Mitigation status:** **Partially mitigated.** The labelling is complete and the uncertainty is published rather than concealed. **Residual, named:** the eight `[unconfirmed]` inputs — `OI-S15-1` … `OI-S15-4` (SUB-15's own) plus the hosting and backups facts cited from `OI-S1-9` and `OI-S1-8` (SUB-1's) — owned by the creator. Until at least `OI-S15-3` closes, the capacity ceiling remains a band spanning two orders of magnitude and **no objective in the set is a measured property of anything**. This is a **worse** evidential position than `n = 1`: C011's base is `n = 0`, as `F-S1-2` records, and SUB-15 inherits it rather than improving on it.

---

## `R-S15-2` — A real memory leak in the session maps is contained only by release cadence, and slowing releases exposes it

- **Risk:** The transport and subject-binding maps are evicted only on a clean `onclose` (`F-S15-3`). They are currently kept small by the process restarting at least 1.36 times a day, and at least 3.29 times a day in the most recent week — an **accident of release cadence, not a mechanism**. Anything that slows releases (a feature freeze, a holiday, a stabilisation period, a CI outage) removes the containment without anyone changing the code that leaks.
- **Severity:** **Medium** — the exposure is real and unbounded in principle, but the current cadence makes it unlikely to bite soon, and the failure mode is a restart rather than data loss.
- **Owning outcome:** **OUT-14** — the first-break analysis, which is where the structure and its absent bound are named.
- **Named owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who can observe process memory on the host or change the release cadence.
- **Escalation route:** **`NEU-896`** at convergence, since a leak whose containment depends on deploy frequency is a property of the delivery pipeline as much as of this package's code, and the compose stack and VPS are outside this repository entirely. Co-named **SUB-16 (NEU-999)** as the sub-task that would design its detection.
- **Mitigation:** The absence of an eviction path is stated as a finding with `file:line` evidence rather than left implicit (`F-S15-3`); the dependency on release cadence is named as a dependency rather than reported as a bound; and the missing measurement is routed to `OI-S15-4` with a spike (`SPK-S15-4`) rather than estimated.
- **Mitigation status:** **Open.** No mitigation is in place — SUB-15 sets objectives and may not change `src/`, so it can name the exposure but not close it. **Residual, named:** the entire exposure. The per-entry footprint (`OI-S15-4`) and host RAM (cited via `OI-S1-9`) are both unknown, so **no entry-count threshold is stated at all**, and there is no monitoring established that would reveal the growth before a restart hid it (`OBJ-9`). Owned by the creator.

---

## `R-S15-3` — Two overlapping deploys run the unguarded boot migrator concurrently

- **Risk:** The migrator runs unconditionally as the first statement of `bootstrap()` with **no environment guard and no repository-owned lock** (`src/transport/main.ts:27`; `src/infrastructure/db/migrate.ts:38-50`), and deploys fire automatically from `develop` on green CI with no serialisation. `OBJ-12` requires **exactly one** concurrent migrator; the platform cannot currently guarantee it.
- **Severity:** **Medium** — the overlap window is small at the measured cadence, but the outcome of a partially applied concurrent migration on a database whose backup position is **unestablished** (`OI-S1-8`, SUB-1's record, cited not restated) and which has **no down-migrations** is exactly the unrecoverable state `F-S15-1` says has no RTO.
- **Owning outcome:** **OUT-14** — the failure objectives, which is where `OBJ-12` is stated and where the platform's inability to meet it is recorded.
- **Named owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who can serialise deploys or inspect whether an overlap has ever occurred.
- **Escalation route:** **`NEU-896`** at convergence: the deploy pipeline and the compose stack are outside this repository, so a change to deploy serialisation is not a change this package can make. Co-named **SUB-13 (NEU-1006)**, which authors the DDL and migration plan and inherits the constraint that its migrations must be safe to start twice.
- **Mitigation:** The unguarded boot migration is stated as a platform fact in §1 with its `file:line`, `OBJ-12` states the required property numerically ("exactly 1") **and states in the same row that the platform cannot guarantee it** rather than recording the objective as met, and the measured deploy cadence that sizes the window is published (`C-17`). C010 recorded the same unguarded-migration shape at its own cutoff (`../C010-system-and-repository-architecture/decision-records/DR-C10-S10-2_deployment-shape.md`), which is cited rather than re-derived. Whether the overlap has ever actually occurred is unobservable from here — there is no monitoring (`OI-S1-9`).
- **Mitigation status:** **Open.** No mitigation is in place; SUB-15 may not change `src/`, `drizzle/` or deployment configuration. **Residual, named:** the entire exposure, owned by the creator, with the observation of whether it has ever occurred blocked on the same monitoring gap `OBJ-9` records. Drizzle's own migrator may or may not take an advisory lock internally; **that was not verified at this cutoff** and is recorded as a bounded reading gap rather than assumed in either direction.

---

**SUB-15 register totals at revision 1:** three entries — `R-S15-1` (High), `R-S15-2` (Medium),
`R-S15-3` (Medium). **Zero charter § Risks rows are claimed**, correctly: no row names OUT-14, and
`R4` is SUB-7's. All three carry a severity, a mitigation, a named owner and an escalation route.
One partially mitigated, two open; **every non-mitigated status names its residual and that
residual's owner.**

---

### SUB-2

**Id family, and why SUB-2 authors zero `R<n>` rows.** The `R<n>` rule above binds an id to a row of
the charter's § Risks table. **No row of that table names OUT-1, OUT-5 or OUT-6 as its owning
outcome** (charter assumption 48), so SUB-2 has no charter row to author and its absence from the
fifteen-row mapping is **correct, not a routed gap**. The residual exposures SUB-2 states are
nonetheless real, and the `R<n>` rule is silent on them rather than forbidding them. They are
therefore filed as **`R-S2-<k>`**, scoped to the authoring sub-task exactly as `F-S<n>-<k>`,
`OI-S<n>-<k>`, `CAP-S<n>-<k>` and `SPK-S<n>-<k>` already are — which keeps the id computable from
the charter alone under parallel authoring, the property `DR-C11-S1-3` rejected alternative 4 was
protecting. Fixed in `decision-records/DR-C11-S2-3_provenance-persistence-and-parallel-safe-id-families.md`.

**One risk deliberately not raised here.** That the whole design rests on `n = 0` evidence is
already `R13`, owned by OUT-18 and authored by SUB-1. SUB-2 cites it in the mitigations below rather
than raising a second entry for the same exposure — the package carries one id per fact.

---

## `R-S2-1` — An IdP-recycled `sub` silently grants a new principal a previous learner's entire history

- **Risk:** The learner key is the `sub` claim. If the IdP ever re-issues a subject identifier that a previous principal held — after an account deletion, a tenant reset, or an identifier-format migration — the new principal presents a key the system already knows, and is served the previous learner's complete learning history: chunks, sessions, notes, answers. **The system cannot detect this.** By construction, an identical key is an identical learner; there is no second factor to disagree with it.
- **Severity:** **High** — it is a direct cross-learner data disclosure, the exact failure the isolation invariant exists to prevent, and it is silent.
- **Owning outcome:** **OUT-1** — the identity mapping, which is where the key is chosen and therefore where a re-use exposure is created.
- **Named owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who can state Rauthy's subject-recycling behaviour, and the only party who could configure it.
- **Escalation route:** **`NEU-896`** at convergence, as a cross-package isolation exposure that outlives this package; **additionally `NEU-895` (C010)** if the answer turns out to be that safe isolation cannot rest on `sub` alone, since that would reach `A-28`'s tolerance envelope and owes a recorded amendment rather than a silent divergence.
- **Mitigation:** **Incomplete, and stated as incomplete.** The design narrows the exposure without removing it: the key is the `sub` claim rather than a mutable, obviously-recyclable value such as `email` (`DR-C11-S2-1` rejected alternative 4), and ADR-0001 fixes a single dedicated AS so no cross-issuer collision is possible. The remaining exposure is entirely a property of the IdP, which no design in this package can constrain. The question is registered as `OI-S2-1` with spike `SPK-S2-1`; the mitigation that would actually close it — an IdP guarantee of non-recycling, or a second immutable claim to bind against — requires the observation `SPK-S2-1` is designed to take.
- **Mitigation status:** **Open.** No mitigation is yet in place beyond narrowing, because the controlling fact is unobserved. **Residual, named:** `OI-S2-1` — Rauthy's `sub` stability, uniqueness and re-issue behaviour — owned by the creator as sole operator. Until it closes, every isolation claim keyed to `sub` carries this exposure, and `R13`'s `n = 0` label applies to it in full.

---

## `R-S2-2` — The `client_credentials` smoke principal acquires a `sub` and silently becomes a learner that owns production rows

- **Risk:** Principal kind is determined by the presence of `sub` (`DR-C11-S2-2`). The CI smoke principal is expected to be kind `client` because Rauthy is **believed** to set `sub = null` for a `client_credentials` grant — a belief recorded in a code comment (`src/transport/jwt-middleware.ts:116`), never observed. If that belief is wrong today, or becomes wrong after a Rauthy upgrade or configuration change, the smoke principal is classified kind `user`, is issued a learner key, and begins **owning real production rows** on every deploy. Nothing announces the change: the deploy stays green, and a machine identity quietly becomes a learner.
- **Severity:** **Medium** — the trigger requires an IdP behaviour change or a wrong belief, but the consequence lands directly in persisted ownership, on a path that runs on **every deploy** (charter assumption 20), and it is silent in both directions.
- **Owning outcome:** **OUT-6** — the principal-kind determination, which is where the `sub`-presence discriminator is chosen and therefore where a mis-determination originates.
- **Named owner:** **The creator, as sole maintainer and sole operator** — the only party who can run `SPK-S1-1` and establish what the grant actually returns, and the only party who controls the Rauthy configuration that could change it.
- **Escalation route:** **`NEU-896`** at convergence, since a principal-kind mis-determination invalidates an input every package's isolation reasoning consumes; **additionally the creator as sole operator** for the immediate containment, because the affected rows are in the production database they own.
- **Mitigation:** **Partial, by design rather than by check.** Kind is read off the token rather than assumed from the audience shape, so the determination is at least *about the right thing* (`DR-C11-S2-2` decision 2 and rejected alternative 4). The belief is labelled `[unconfirmed]` at every point it is used — `02_identity-the-learner-key-and-principal-kind.md` §3 and §10 — and routed to `OI-S1-1` / `SPK-S1-1` rather than stated as fact. What is **not** mitigated is detection: no signal distinguishes "the smoke principal legitimately owns nothing" from "the smoke principal has started owning rows", and designing one is **OUT-15**'s, handed to **SUB-16** (NEU-999) by name.
- **Mitigation status:** **Partially mitigated.** The design is correct under either answer — the rule is total — but the *population* is unverified and the transition is undetectable. **Residual, named:** `OI-S1-1` (the grant's real claim set), owned by the creator as sole operator; and the absence of a detection signal, handed to **SUB-16** (NEU-999) under OUT-15. `DR-C11-S2-2`'s revision trigger 1 fires on exactly this change.

---

## `R-S2-3` — A learner whose `sub` changes is orphaned from their own history, and the only remedy is a manual re-bind that can be aimed at the wrong target

- **Risk:** A different `sub` is a different learner (`02_identity-the-learner-key-and-principal-kind.md` §4). If the IdP re-issues a subject for a real person — an account migration, an identifier-format change, a re-registration — that person authenticates successfully, is treated as new, and **loses access to their entire learning history**, which remains intact and unreachable. The remedy is an operator re-bind, and a re-bind aimed at an unverified target is the wrong-target-subject failure the charter names in OUT-2: it can attach one learner's rows to another's key.
- **Severity:** **Medium** — the loss is availability rather than disclosure and the data is not destroyed, but the remedy itself carries a disclosure risk, and at `n = 1` the affected learner is the operator, who is also the only person who can fix it.
- **Owning outcome:** **OUT-1** — the identity mapping, which is where the *"a changed claim is a new learner"* rule is set and where the no-automatic-merge position is taken.
- **Named owner:** **`SUB-6` (`NEU-1000`)** for the re-bind procedure and its target-verification step, which is that sub-task's scope under OUT-2; **the creator, as sole maintainer and sole operator**, for the underlying IdP behaviour that would trigger it.
- **Escalation route:** **`NEU-896`** at convergence, which hands OUT-19's migration plan to the charter that executes it and therefore inherits the target-verification obligation; a re-bind that cannot verify its target escalates there rather than back into a published package.
- **Mitigation:** **Deliberate refusal to automate.** No automatic re-binding, no merge, and no heuristic match on `email` or any other claim — an automated merge is precisely how a wrong target becomes silent (`DR-C11-S2-1` rejected alternative 4 records why `email` is unusable for this). Prior rows keep the prior key and remain intact rather than being rewritten. The exposure is therefore converted from *silent mis-assignment* into *visible inaccessibility*, which is the trade this rule deliberately takes: a learner who cannot see their history will say so, whereas a learner silently given someone else's will not.
- **Mitigation status:** **Partially mitigated.** The silent limb is closed by construction; the availability limb is open and its remedy is not designed here. **Residual, named:** the re-bind procedure with an explicitly verified target, owned by **SUB-6** (NEU-1000) under OUT-2; and `OI-S2-1`, which would establish whether `sub` is stable enough for this case to be rare or common, owned by the creator as sole operator.

---

**SUB-2 register totals at revision 1:** three entries — `R-S2-1` (High), `R-S2-2` (Medium),
`R-S2-3` (Medium). **Zero charter `R<n>` rows**, correctly: no § Risks row names OUT-1, OUT-5 or
OUT-6. One open, two partially mitigated; every non-mitigated status names its residual and that
residual's owner, and every entry carries a severity, a mitigation, a named owner and an escalation
route.

---

### SUB-4

*`NEU-996`, covering `OUT-7` and `OUT-13`. **Zero charter `R<n>` rows**, correctly: no row of the
charter's § Risks table names OUT-7 or OUT-13 as its owning outcome (charter assumption 48). The
Critical cross-learner-exposure row is `R1`, owned by OUT-8 and authored by SUB-5, and this
sub-task's two-transport `I4` application is named inside that row's mitigation rather than being an
entry of its own. The four entries below are residual exposures this sub-task raises itself.*

## `R-S4-1` — A consumer reads `principal_id` without `principal_kind` and rebuilds the `sub || azp` collapse one layer below the transport

- **Risk:** `DR-C11-S4-2` makes `principal_id` a learner key **if and only if** `principal_kind = 'user'`. Nothing in the schema enforces that. A repository, a service or an enforcement predicate that selects on `principal_id` alone will treat a service principal's `azp` as an owner key — which is precisely the `payload.sub || azp` merge at `src/transport/jwt-middleware.ts:127` that `DR-C11-S2-1` exists to undo, reappearing below the transport edge where there is no token left to re-derive the kind from. **The failure is silent and returns plausible data:** the query succeeds, rows come back, and they belong to whatever principal happened to share that identifier space.
- **Severity:** **High**
- **Owning outcome:** **OUT-13** — the row design, which is where the two-column rule is authored and therefore where its unenforceability originates.
- **Named owner:** **SUB-5 (NEU-997)**, which authors the enforcement point (`OUT-8`) and is the party positioned to make the rule structural rather than advisory — by taking `(principal_id, principal_kind)` as an indivisible pair at the port boundary rather than a value and a flag.
- **Escalation route:** **`NEU-895` (C010)**, which owns the isolation invariant and check `I5` — a confinement predicate that cannot distinguish principal kinds would be an `I5` failure in the deployed mechanism rather than a defect this package can close by writing more prose, and it **would route** a recorded amendment there. The amendment is conditional on the risk materialising in built code; **no amendment is routed to `NEU-895` by SUB-4** as things stand. Co-named **`NEU-896`** as the live recipient of C010's residual.
- **Mitigation:** **Partial by construction, and stated as partial.** The rule is stated once in `DR-C11-S4-2` clause 4, repeated in `04_the-stdio-identity-gate-and-the-bound-context-token.md` §4 as the section's load-bearing sentence, and carried into `traceability/S4_stdio-gate-and-bound-context-token.md`. Storing the kind on the row rather than recomputing it is itself a mitigation — the information is present at the point of use. What is **not** mitigated is enforcement: no schema constraint can express "this column means something different depending on that column". The structural fix belongs to the enforcement point's shape and is named as SUB-5's.
- **Mitigation status:** **Partially mitigated.** **Residual, named:** whether the enforcement point takes the identifier and the kind as an indivisible pair, owned by **SUB-5 (NEU-997)** under OUT-8.

## `R-S4-2` — The production deploy pipeline's own smoke run is refused by this package's rule, and the deploy gate fails on every release

- **Risk:** The CD workflow mints a `client_credentials` token on every production deploy and runs the smoke suite with it as a deploy step (`.github/workflows/cd-prod.yml:145`–`:174`). The suite calls gated learner-state tools — `list_learning_items` (`tests/smoke/smoke.test.ts:206`) and `session_status` (`:237`) — with the context token it captured at `:195`. Under `DR-C11-S2-2` that principal is `client`-kind and those calls are **refused**. A refused call fails the suite; a failed suite fails the deploy. **The enforcement stage therefore breaks the pipeline that would ship it**, and it breaks it every time, not once.
- **Severity:** **High**
- **Owning outcome:** **OUT-13** — the cutover impact assessment, which is where every class of rejected token is named and therefore where a rejected class with a release-gating consequence becomes visible.
- **Named owner:** **The creator, as sole maintainer and sole operator**, who owns `.github/workflows/cd-prod.yml`, the `SMOKE_PROD_*` credentials and the smoke suite — the only party who can re-scope the suite or re-provision the principal.
- **Escalation route:** **`NEU-896`** at convergence. A production release gate is a program-level surface, not this package's: if the smoke suite cannot be re-scoped without losing its regression value, the trade-off is between release confidence and the service-principal rule, and that is a go / conditional-go input rather than a decision C011 can take.
- **Mitigation:** **Named, not applied — this package may change no file under `.github/`, `src/` or `tests/`.** Three routes exist and the chapter states all three: re-scope the smoke suite to the three exempt tools plus a service-principal-appropriate path that touches no learner-owned row; re-provision the smoke principal as a `user`-kind static client with a real `sub`, on the same manual mechanism that produced `claude-web`; or accept a known-failing smoke step for the duration of the enforcement stage, which is the worst of the three and is named so it is chosen rather than defaulted into. **Softening the rule to an empty scope is not on the list** — `DR-C11-S2-2` rejects it on the ground that a silent empty result is indistinguishable from a learner with no data. Sequencing the fix **before** the enforcement stage is a stated obligation on SUB-7.
- **Mitigation status:** **Open.** No mitigation is in place. **Residual, named:** `OI-S4-2` — whether the suite can be re-scoped without losing regression value — owned by the creator; and the sequencing obligation, owned by **SUB-7 (NEU-1001)** under OUT-3.
- **Not a duplicate of `R-S2-2`, and the distinction is recorded:** `R-S2-2` is the branch where the smoke principal *acquires* a `sub` and silently becomes a learner owning production rows. This is the complementary branch, where it does not, is correctly classified `client`, is correctly refused — and the refusal breaks the release. Both are live because `OI-S1-1` / `SPK-S1-1` are open and no token has been observed.

## `R-S4-3` — The configured STDIO principal is a per-process singleton, so a shared STDIO process confines two learners to one identity

- **Risk:** `DR-C11-S4-1` clause 2 reads one principal from deployment configuration per process. If two learners ever share one STDIO process, both are confined to the configured principal — **correctly** by the gate's own rule, and wrongly for at least one of them. The gate does not detect this and cannot: from inside the process there is exactly one principal and it is the one the operator declared.
- **Severity:** **Medium**
- **Owning outcome:** **OUT-7** — the gate decision, which is where the singleton is introduced.
- **Named owner:** **`SUB-10 of C010 (NEU-984)`**, co-named **`NEU-896`** — the deployment-shape owner, since whether a STDIO process is ever shared is a property of how the deployment is operated rather than of the gate.
- **Escalation route:** **`NEU-896`** at convergence, as the party that reconciles a deployment shape this package's mechanism does not support against whatever shape the program actually needs.
- **Mitigation:** **Bounded rather than closed.** The elective bearer-on-STDIO path (`DR-C11-S4-1` clause 5) removes the limit entirely wherever an operator will provision a static client, because the principal then comes from the token per call rather than from the process. Where it is not taken, the limit is a documented property of the configured-principal design and is stated in `04_the-stdio-identity-gate-and-the-bound-context-token.md` §10.1 as a named residual on the `I4` verdict rather than folded into it. It is **not** an `I4` failure — the confinement decision is identical on both transports — and it is not represented as one.
- **Mitigation status:** **Partially mitigated.** **Residual, named:** whether any multi-learner STDIO deployment is intended at all, owned by **`SUB-10 of C010 (NEU-984)`** co-named `NEU-896`; and `OI-S4-1`, the operator's own answer on the configured principal, owned by the creator.

## `R-S4-4` — Audit parity is descoped as "just a mount", the gate lands, and the two transports stay unequal in what a reader can reconstruct

- **Risk:** `DR-C11-S4-1` clause 4 requires audit logging to reach STDIO on the same terms as the gate. `F-S4-4` establishes that this is a **rewrite, not a mount** — `createAuditMiddleware` returns an Express `RequestHandler` (`src/transport/audit-middleware.ts:23`) and there is no STDIO transport module to attach it to (`src/transport/main.ts:55`–`:59`). Work priced as a mount and discovered to be a rewrite is the work most likely to be cut. If it is cut, the gate still refuses identically on both transports — `I4` still passes — but a refusal on STDIO leaves no record, so the two transports remain unequal in a way no check in the invariant measures.
- **Severity:** **Medium**
- **Owning outcome:** **OUT-7** — the gate decision, whose clause 4 is the obligation at risk.
- **Named owner:** **SUB-16 (NEU-999)**, which owns how requests become attributable and is therefore the party for whom an unattributable transport is a first-order problem rather than a side effect.
- **Escalation route:** **`NEU-896`** at convergence, where an observability gap that spans the transport boundary and the audit surface is reconciled against whatever the program requires of both.
- **Mitigation:** **Stated rather than solved.** The cost is named as a finding (`F-S4-4`) instead of being carried inside clause 4's prose, specifically so that a reader planning the work sees a rewrite where the classification implies a mount. The chapter also separates the two effects explicitly (§10.1, non-claim 3): audit parity is **not** required for `I4`, so descoping it must be argued as an observability decision and cannot be justified by pointing at a green `I4`.
- **Mitigation status:** **Open.** No mitigation is in place; nothing here is implemented. **Residual, named:** `OI-S4-3` — whether audit logging can be made transport-invariant without an Express dependency — owned by **SUB-16 (NEU-999)**.

---

**SUB-4 register totals at revision 1:** four entries — `R-S4-1` (High), `R-S4-2` (High), `R-S4-3`
(Medium), `R-S4-4` (Medium). **Zero charter `R<n>` rows**, correctly: no § Risks row names OUT-7 or
OUT-13 as its owning outcome, per charter assumption 48. Two open, two partially mitigated; every
non-mitigated status names its residual and that residual's owner, and every entry carries a
severity, a mitigation, a named owner and an escalation route.

**One entry is deliberately recorded as a near-duplicate and marked as such.** `R-S4-2` and
`R-S2-2` describe the same principal under opposite answers to the same open question
(`OI-S1-1` / `SPK-S1-1`). Collapsing them would lose one of the two live branches; leaving the
relationship unstated would read as a register defect. It is therefore stated inside `R-S4-2`.

---

### SUB-16

**Zero charter `R<n>` rows are authored here, correctly.** No row of the charter's § Risks table
names **OUT-15** as its owning outcome (charter assumption 48), so this sub-task authors entries only
for residual exposures it raises itself. **Two risks are deliberately not raised**, because each is
already recorded exactly once elsewhere and the package carries one id per fact: that the whole design
rests on `n = 0` evidence is **`R13`** (OUT-18, SUB-1), cited in the mitigations below; and that
erasure completes on paper while a copy survives is the charter's § Risks row **`R2`**, owned by
OUT-12 and **authored by SUB-9** at position 11 — `R-S16-1` below is a *specific, newly created*
instance of that exposure and names it as such rather than pre-empting SUB-9's entry.

## `R-S16-1` — Attribution creates a mixed-population table, and a per-learner erasure over it reports success while provably missing every pre-cutover row

- **Risk:** Under `DR-C11-S16-2` both log tables become `learner-linked` personal data once the attribution carrier lands. Rows written **before** it lands carry no key and **can never be given one** — the only structure that ever held a session-to-subject binding is the process-local map at `src/transport/http.ts:83`, whose sole eviction path is a clean session close and which is emptied by every restart at a measured ≥3.29/day (`91_findings-register.md` § `F-S15-3`; `15_operational-objectives-for-the-real-platform.md` §3). A `DELETE … WHERE learner_key = $1` therefore returns a success and a row count while the entire pre-cutover population survives. **The failure is created by the fix**, which is what makes it easy to miss: a designer reading only *"learner-linked personal data"* would build exactly this predicate.
- **Severity:** **High** — it is a silent, systematic erasure failure over a store that holds whole unredacted learner free text (`F-S3-1`), and the erasing party is told it succeeded.
- **Owning outcome:** **OUT-15** — the attribution design, which is where the cutover boundary is created and therefore where the mixed population originates.
- **Named owner:** **SUB-9** (NEU-1003) for the disposition of the pre-cutover population, under OUT-12; **the creator, as sole maintainer and sole operator**, for the population itself and for the decision to delete or retain it.
- **Escalation route:** **`NEU-896`** at convergence, as a cross-package erasure-completeness exposure that outlives this package; **additionally SUB-9 (NEU-1003) directly**, because the disposition is a cell of its propagation matrix and the matrix is the artifact that would otherwise ship with it unresolved.
- **Mitigation:** **Incomplete, and stated as incomplete.** What is mitigated is discoverability: the boundary is named here (`F-S16-5`), the cutover instant is identified as the only thing that will ever separate the two populations, and SUB-9 receives an explicit obligation to give the pre-cutover rows a **disposition rather than a key** — bulk deletion, bulk anonymization, or an accepted and named residual. What is **not** mitigated is the underlying fact: no design in this package can retroactively attribute a row whose binding is gone.
- **Mitigation status:** **Open.** No disposition exists; the sub-task that owns it runs at position 11. **Residual, named:** the pre-cutover population's disposition, owned by **SUB-9** (NEU-1003); and its **size**, which is unobserved and depends on `OI-S1-5` / `OI-S1-6` (does either table hold rows with learner content) and `OI-S16-1` (is the writer mounted at all). **No row count is asserted.** `R13`'s `n = 0` label applies in full.

## `R-S16-2` — Every alert route in the detection matrix is unconfirmed, so a signal that fires reaches nobody

- **Risk:** All four signals in `16_attribution-and-detection.md` §3 carry the alert route `[unconfirmed]`. No monitoring, alerting or log-shipping arrangement is discoverable in the repository, and where production runs is unknown (`93_open-items-and-provisional-register.md` § `OI-S1-9`). SUB-15 recorded the same gap from the other side: `OBJ-9` states that unplanned availability is **not merely unmeasured but unmeasurable** on this platform today. A detection matrix whose routes do not exist is a matrix that converts an undetected failure into an unrouted one — an improvement in principle and, until a channel exists, none in practice.
- **Severity:** **High** — it applies to **all four** signals simultaneously, including the cross-learner-access signal, and it is the one limb of the design that no amount of schema work fixes.
- **Owning outcome:** **OUT-15** — the detection design, which is where a signal is required to have a route.
- **Named owner:** **The creator, as sole maintainer and sole operator** — the only party who knows what monitoring exists, and the only party who could arrange any.
- **Escalation route:** **`NEU-896`** at convergence, as the party that decides whether a package may declare a detection capability whose delivery mechanism is unestablished; **additionally the creator as sole operator** for the immediate arrangement, since the channel is theirs to create.
- **Mitigation:** **Partial, and by disclosure rather than by mechanism.** Every route is labelled `[unconfirmed]` at every point it is used rather than stated as a fact; the single owning record `OI-S1-9` is cited rather than duplicated; the reading the chapter proceeds on is carried explicitly as the stand-in `95_stand-in-assumption-register.md` § `A-S16-1`, with a tolerance envelope and an invalidating outcome. What is **not** mitigated is delivery: nothing in this package creates a channel, and nothing in it may.
- **Mitigation status:** **Open.** **Residual, named:** `OI-S1-9`, owned by the creator as sole operator — one record, cited by SUB-15, SUB-16, SUB-7 and SUB-9 rather than re-raised. Until it closes, every signal here is *specifiable and undeliverable*, and the chapter says so in `16_attribution-and-detection.md` §9 item 2.

## `R-S16-3` — Every count-based signal reads a lower bound, so a zero-tolerance threshold can be silently satisfied by dropped audit entries

- **Risk:** The audit pipeline loses entries on two paths and announces neither to any consumer: the circuit breaker discards the whole buffer with only a `stderr` write (`src/transport/pg-audit-transport.ts:83`–`:90`), and a batch whose `pool.query` throws is already out of the buffer (`:92`–`:93`) and is never requeued — once per failure, five times before the breaker even opens (`:32`). A count read from `mcp_request_log` is therefore a **lower bound on the true count**. A cross-learner access whose audit row was in a dropped batch is not merely unalerted; it never existed as far as any signal is concerned.
- **Severity:** **Medium** — the loss requires a database fault to trigger, and the thresholds are chosen so the failure mode is one-directional (see the mitigation). But the events most likely to coincide with a database fault are not independent of the events the signals watch for.
- **Owning outcome:** **OUT-15** — the detection design, which is where a threshold is set against a count.
- **Named owner:** **The creator, as sole maintainer and sole operator**, for the deployed transport behaviour.
- **Escalation route:** **`NEU-896`** at convergence, as the party that decides whether a detection guarantee may rest on a lossy pipeline; **additionally SUB-12 (NEU-1004)**, whose production gates measure counts from these tables and which must not treat a zero as a proven zero.
- **Mitigation:** **Partial, by threshold design rather than by fixing the pipeline.** Every count-based threshold in the matrix is **zero-tolerance** rather than a rate, chosen specifically because the loss is one-directional: a dropped entry can **hide** an event but cannot **manufacture** one, so the design yields false negatives and never false positives. Every count is labelled a lower bound at the point it is used (`16_attribution-and-detection.md` §3 conventions, §7). What is **not** mitigated is the loss itself; fixing it would be a `src/` change, which is out of this sub-task's scope entirely.
- **Mitigation status:** **Partially mitigated.** The direction of error is constrained and disclosed; the magnitude is not. **Residual, named:** the **audit-entry arrival rate** that would turn the structural bound into a number is unobserved and **no register item in this package covers it** — `OI-S15-3` is the distinct `t_db` question and is not claimed to settle it. No new item is raised, because no threshold stated here depends on the value; the loss accounting itself is `91_findings-register.md` § `F-S16-2`.

## `R-S16-4` — Attribution converts an indefinitely retained store into an indefinitely retained store of learner-linked personal data

- **Risk:** `infrastructure.operation_event_log` has **no retention bound of any kind** — no cleanup script covers it, and the codebase describes it as *"indefinitely-retained"* (`src/orchestration/topic-workflows.ts:584`; `src/orchestration/chunk-workflows.ts:160`; `scripts/retention-cleanup.sql` covers `mcp_request_log` only). Under `DR-C11-S16-2` it becomes `learner-linked` personal data. The determination therefore does not create the retention gap, but it changes what the gap **is**: an unbounded log becomes an unbounded store of personal data, and every day it runs the exposure grows monotonically with no ceiling.
- **Severity:** **High** — unbounded retention of personal data is the exposure with the longest tail in the package, it grows without any triggering event, and the table's `data` column is free-form `JSONB` into which rationales may quote learner content verbatim up to 256 characters.
- **Owning outcome:** **OUT-15** — this outcome makes the determination that reclassifies the store, so the consequence is raised here rather than left for a reader to infer from the classification.
- **Named owner:** **SUB-8** (NEU-1002) under OUT-11, which defines what learners can export and erase and is therefore where a retention position belongs; **the creator, as sole maintainer and sole operator**, for the deployed absence of a cleanup script.
- **Escalation route:** **`NEU-896`** at convergence, as a cross-package data-minimization exposure; **additionally the named owner of the controller/processor and lawful-basis open item** — `93_open-items-and-provisional-register.md` § `OI-S3-1`, cited and not duplicated — because a retention *period* rests on the lawful basis, and this package states positions rather than determinations.
- **Mitigation:** **Incomplete, and deliberately not overstated.** What is mitigated is visibility: the reclassification is stated together with its retention consequence in the same table (`16_attribution-and-detection.md` §5.1) rather than in a separate section a reader might not reach, and the asymmetry between the two log tables — one with a 30-day script, one with nothing — is called out explicitly. What is **not** mitigated is the retention itself. **This package sets no retention period**, because doing so would be a determination resting on a lawful basis it does not hold; that is `OI-S3-1`, and stating a number here would be exactly the overstatement `R10` is registered against.
- **Mitigation status:** **Open.** **Residual, named:** the retention position for `operation_event_log`, owned by **SUB-8** (NEU-1002); and the lawful basis it rests on, `OI-S3-1`, owned by the creator as sole operator. `DR-C11-S16-2`'s fifth revision trigger fires if a cleanup script covering the table is ever added.

---

**SUB-16 register totals at revision 1:** four entries — `R-S16-1` (High), `R-S16-2` (High),
`R-S16-3` (Medium), `R-S16-4` (High). **Zero charter `R<n>` rows**, correctly: no § Risks row names
OUT-15. Three open, one partially mitigated; every non-mitigated status names its residual and that
residual's owner, and every entry carries a severity, a mitigation, a named owner and an escalation
route. **Zero second records** — `R13` and the charter's `R2` are cited, not restated, and
`OI-S1-9`, `OI-S15-3` and `OI-S3-1` are consumed by citation from their single owning records.

---

### SUB-8

**Zero charter `R<n>` rows are authored here, correctly.** **No row of the charter's fifteen-row
§ Risks table names OUT-10 or OUT-11 as its owning outcome** (charter assumption 48), so this
sub-task has no charter row to author and its absence from the fifteen-row mapping above is correct,
not a routed gap. The four entries below are residual exposures SUB-8 raises **itself**, in the
sub-task-scoped form `R-S8-<k>` fixed by
`decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md` and already used by SUB-15, SUB-2
and SUB-16. Nothing above this line is touched.

**Two risks deliberately not raised**, because each is already recorded exactly once and the package
carries one id per fact. That the whole design rests on `n = 0` evidence is **`R13`** (OUT-18,
SUB-1), cited in the mitigations below. That erasure completes on paper while a copy survives is the
charter's § Risks row **`R2`**, owned by OUT-12 and **authored by SUB-9** at position 11; `R-S8-4`
below is about the *absence of a mechanism to erase with at all*, which is a different exposure, and
the pre-cutover instance of `R2` is already `R-S16-1`, cited and not restated.

## `R-S8-1` — A learner withdraws consent, almost nothing they care about changes, and the product looks compliant while doing so

- **Risk:** Consent covers three severable purposes and nothing else (`08_consent-and-what-a-learner-can-export-and-erase.md` §3). A learner who withdraws consent — reasonably expecting their material, answers and history to stop being processed — will find that **thirty of thirty-three categories are unchanged**, because they never rested on consent. The design is right and the *word* is misleading: "withdraw consent" is understood by the person using it as "stop using my data", and here it means "stop three secondary uses". A product that presents a consent toggle and honours it exactly as specified can therefore leave a learner materially misinformed about what just happened, **while every artifact in this package reports success**.
- **Severity:** **High** — it is not a defect a later audit catches, because nothing is broken. It is a mismatch between a correct mechanism and a reasonable expectation, and the failure surfaces only when a learner acts on the wrong belief — most damagingly by withdrawing consent *instead of* requesting erasure and believing their data is gone.
- **Owning outcome:** **OUT-10** — the consent boundary, which is where the scope of withdrawal is set and therefore where the gap between the word and the effect is created.
- **Named owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who controls what a learner is actually shown at the moment of withdrawal, which is where this risk is either mitigated or realised.
- **Escalation route:** **`NEU-896`** at convergence, as the party that decides whether a product may present a consent surface whose scope is this much narrower than the term implies; **additionally the named owner of `OI-S3-1`**, cited and not duplicated, because whether the boundary is drawn in the right place at all rests on the lawful-basis determination this package does not make.
- **Mitigation:** **By disclosure and by structure, not by mechanism.** The boundary is stated in **both** directions with every purpose carrying an explicit yes/no and every `no` naming its alternative basis (§4); the withdrawal walk enumerates all thirty-three categories so the small effect is visible as a count rather than inferable (§6); erasure is defined as a **separate act with a separate scope and its own deadline** (§7–§9), so the two are not conflated in the design even if they are in a learner's head; and the chapter states in terms that *withdrawing consent does not delete your account or your study material*. What is **not** mitigated is the presentation: nothing in this package controls what a learner reads next to the toggle, and no such surface exists to control.
- **Mitigation status:** **Partially mitigated.** The design half is complete and the boundary is unambiguous on the page. **Residual, named:** the learner-facing presentation of withdrawal — the wording, and whether the erasure route is offered alongside it — owned by the creator as sole operator. It cannot be closed inside this package, because there is no consent surface in the product to word (`F-S8-4`), and `R13`'s `n = 0` label applies in full: no learner has ever been asked, so no misunderstanding has ever been observed either.

---

## `R-S8-2` — Export completeness is measured against the inventory, so a store the inventory missed is exported by nobody

- **Risk:** `DR-C11-S8-2` scopes export by SUB-3's inventory rather than by the database, deliberately — a schema walk would miss the three derived-never-persisted categories, the ten process-local structures and both copy classes. The cost is that **the export is exactly as complete as the inventory is**. A store that exists and appears in none of `LD-S3-1` … `LD-S3-32` is not merely un-exported; it is invisible to the completeness check that certifies the export complete, so the check returns **25 of 25** and is wrong.
- **Severity:** **Medium** — the inventory was built by three independent enumerations that had to agree, cross-checked bidirectionally against C010's 45 categories, and published with a falsifier (`03_learner-data-inventory-and-classification.md` §11), so the base rate of a miss is low. It is not Low, because the falsifier **fired once during SUB-3's own work** — six process-local structures beyond the four its scope named (`91_findings-register.md` § `F-S3-2`) — which is direct evidence that the enumeration is missable, and because one of the six admitted then (`LD-S3-25`) is precisely a copy no `DELETE` reaches.
- **Owning outcome:** **OUT-11** — the export design, which is where completeness is defined and therefore where an inherited gap in the definition would first have effect.
- **Named owner:** **SUB-14** (NEU-1007), which owns the package's completeness assembly and is the party positioned to check the inventory against later chapters; **co-named the creator, as sole maintainer and sole operator**, who is the only party who could confirm from the running deployment that no undeclared store exists — which is `OI-S1-4`, cited and not re-raised.
- **Escalation route:** **`NEU-896`** at convergence, as the party that decides whether an export duty may be certified complete against a document rather than against a system; **additionally SUB-17** (NEU-1008), whose completeness audit runs the last check before publication.
- **Mitigation:** **Inherited, and stated as inherited.** SUB-3's falsifier remains standing and unretired — *"this inventory is falsified if any reader can name a store … that appears in none of `LD-S3-1` … `LD-S3-32`"* — and this chapter's export scope inherits it verbatim: naming such a store falsifies the export's completeness in the same act. The arithmetic is published with its subtrahend named by id (32 − 8 = 24, +1 = 25), so a reader who disagrees can name the entry they would move rather than having to reconstruct the count. What is **not** mitigated is the underlying dependency: nothing in this chapter re-derives the inventory, and re-deriving it would have been the back-edge revision charter assumption 50 forbids.
- **Mitigation status:** **Partially mitigated.** The dependency is disclosed and the falsifier is carried forward rather than dropped. **Residual, named:** whether the declared surface is the real one, which is **`OI-S1-4`** (SUB-1), owned by the creator as sole operator; and the standing possibility that the process-local enumeration — which rests on a manual read plus C010's independent agreement, with **no** mechanical enumerator (`CAP-S3-1`) — is still short. **No claim is made that the inventory is complete**; the claim is that the export is complete against it.

---

## `R-S8-3` — `deadline_at` now has a value, nothing emits a proof to measure against it, and the signal reads as working

- **Risk:** `DR-C11-S16-3` left `deadline_at`'s value to this sub-task, and §9.1 supplies it. `SIG-S16-3` therefore moves from *fully specified and not yet evaluable* to **evaluable in principle**. It does **not** move to *working*: `16_attribution-and-detection.md` §4 records `ME-S16-6` — **no completion-proof store, no `propagation_id`, and no propagation emits anything**. The risk is that the change of state is read as the removal of the blocker. A later reader meeting a detection matrix whose last `[unconfirmed]` threshold now carries a number can reasonably conclude the stalled-propagation signal is live, when what exists is a threshold with no input — and a signal with no input **fails silently**, reporting nothing rather than reporting that it has nothing.
- **Severity:** **Medium** — the misreading requires a reader to stop at the threshold column and not reach `ME-S16-6`, which the two documents make reasonably hard. It is not Low because the failure mode is a **false assurance about an erasure guarantee**, and because supplying the value is precisely the act that makes the row look finished.
- **Owning outcome:** **OUT-11** — this outcome sets the deadline, so the state change and the exposure it creates are raised here rather than left for a reader to infer from a threshold that quietly filled in.
- **Named owner:** **SUB-9** (NEU-1003) for the emission, under OUT-12 — `ME-S16-6` names it; **the creator, as sole maintainer and sole operator**, for the store the proof would live in, which does not exist on the deployment.
- **Escalation route:** **`NEU-896`** at convergence, as the party that decides whether a package may report a detection capability as complete when its input is unbuilt; **additionally SUB-12** (NEU-1004), whose gate register must not record this signal as a measurable gate on the strength of the threshold alone.
- **Mitigation:** **By explicit statement, at every point the value is used.** §9.1 states *"evaluable in principle and still unemitted"* in terms and cites `ME-S16-6` for the gap; OUT-11's outcome-register row repeats it rather than leaving it to the chapter; and `DR-C11-S8-2` consequence 1 records the same distinction a third time, deliberately, because this is the claim most likely to be over-read. The deadline is additionally carried as the stand-in `95_stand-in-assumption-register.md` § `A-S8-1`, so a reader meeting the number meets its provenance with it. What is **not** mitigated is the emission: nothing in this package emits a proof, and nothing in it may — that is a `src/` change.
- **Mitigation status:** **Open.** No proof is emitted and no store exists; the sub-task that owns the emission runs at position 11. **Residual, named:** `ME-S16-6`, owned by **SUB-9** (NEU-1003); and the deadline's own provenance, carried as `A-S8-1`, whose re-validation trigger is `OI-S3-1` closing. **Nothing here claims the signal has ever run** — `R13`'s `n = 0` position and `CAP-S16-1`'s uncalibrated-threshold cap both apply unchanged, and neither is restated.

---

## `R-S8-4` — The erasure duty this outcome states exceeds the erasure surface the product has, by an order of magnitude

- **Risk:** §8 dispositions thirty-three categories, thirteen of them `delete` or `cascade`. The product exposes **two** delete paths to a user-facing tool — `delete_chunk` and `delete_note` — and **no export surface of any kind**. There is no `delete_topic`, no `delete_session`, and no way to delete an attempt or an answer; four further deletion methods are defined on a port, implemented in the adapter, and called from nowhere (`91_findings-register.md` § `F-S8-3`). A published duty with no mechanism behind it is a specific hazard rather than a general one: it is the document a later charter will cite as evidence that erasure is *designed*, and design is what it is — the reachable surface covers **three** of the thirteen.
- **Severity:** **High** — because the gap is not a rough edge but the majority of the duty, because `deleteExpired()`'s unwired status means one store grows without bound today with no scheduler that could ever call it (§10.3), and because the same document that states the duty is the one a reader will take as evidence it can be discharged.
- **Owning outcome:** **OUT-11** — the erasure design, which is where a duty is stated and therefore where the distance between duty and capability is created.
- **Named owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who can authorise the `src/` work; **co-named SUB-13** (NEU-1006), which authors the DDL and migration plan and is the nearest sub-task to the mechanism.
- **Escalation route:** **`NEU-896`** at convergence, as the party that decides whether the erasure mechanism is built and by which charter — this package may not change `src/` by constraint, so the decision is not one it can take; **additionally SUB-12** (NEU-1004), for which *"a stated duty with no control behind it"* is a gate that cannot be made measurable and is therefore its own blocking trigger.
- **Mitigation:** **By audit-before-design, and by refusing the more flattering framing.** The purge audit (§10) was run **before** the disposition table was written rather than after, so the design is stated against a known surface; the chapter says in terms that *"the erasure design in §8 is a specification, not a description of a capability"*; the reachable-versus-dispositioned counts are published as **three of thirteen** rather than left implicit; and OUT-11's outcome-register row carries the same caveat so the gap is visible to a reader who never opens the chapter. What is **not** mitigated is the absence itself: building an erasure path is a `src/` change and is outside this package's scope by constraint.
- **Mitigation status:** **Open.** No mitigation is in place, and none is available to this sub-task. **Residual, named:** the entire mechanism gap, owned by the creator as sole operator with SUB-13 co-named; and `deleteExpired()`'s unbounded accumulation of expired `context_tokens` rows, whose production population is **unobserved** — that is `OI-S1-7` (SUB-1), cited and not re-raised. **No row count is asserted.**

---

**SUB-8 register totals at revision 1:** four entries — `R-S8-1` (High), `R-S8-2` (Medium),
`R-S8-3` (Medium), `R-S8-4` (High). **Zero charter `R<n>` rows**, correctly: no § Risks row names
OUT-10 or OUT-11. Two open, two partially mitigated; every non-mitigated status names its residual
and that residual's owner, and every entry carries a severity, a mitigation, a named owner and an
escalation route. **Zero second records** — `R13`, the charter's `R2`, `R-S16-1`, `CAP-S16-1`,
`OI-S1-4`, `OI-S1-7` and `OI-S3-1` are each consumed by citation from their single owning records.
### SUB-5

*`NEU-997`, covering `OUT-8`. **One charter `R<n>` row — `R1`, and it is the only one of the fifteen
that names OUT-8** (charter assumption 48), pre-allocated to this sub-task at `:24`. Three further
entries are residual exposures this sub-task raises itself and take the sub-task-scoped form
`DR-C11-S15-3` fixes. `R1` keeps the bare charter-row form because it is charter-covered.*

## `R1` — The mechanism ships and cross-learner exposure remains

- **Risk:** An ownership column lands while the unscoped `getActiveSession()`, the fail-open session binding, or the ungated STDIO path still permits access. The charter's wording understates the surface in two directions, and both are established here. **First, there are three unscoped session paths, not one:** `getActiveSession()` (`src/adapters/drizzle/session-repository.ts:73`–`:80`), `createSession`'s orchestration guard (`src/orchestration/session-workflows.ts:39`–`:46`) and **`listSessions()`** (`src/adapters/drizzle/session-repository.ts:105`–`:118`), which with no options returns every session row in the database and which the charter does not name (`F-S5-4`). A change set implementing exactly the two named removals ships with the third intact. **Second, `learning_chunks` has a second write path** through `ReviewPersistencePort`, which owns no table and writes into the chunk-owned one (`src/adapters/drizzle/review-persistence-adapter.ts:78`–`:82`, `F-S5-1`); scoping `ChunkRepository` alone leaves it open. **The failure is silent in the worst way:** an ownership column present in the schema is the strongest available evidence *to a reader* that confinement exists, so the column's presence actively suppresses the question.
- **Severity:** **Critical**
- **Owning outcome:** **OUT-8** — the enforcement point, which is where a confinement that does not actually confine is authored and proved.
- **Named owner:** **SUB-5 (NEU-997)** for the design, which is where the exposure is closed or left open on paper; **the implementation charter `NEU-896` hands the work to**, for the applied result, since nothing here is applied and no party inside this package can close the risk in code.
- **Escalation route:** **`NEU-895` (C010)**, which owns the isolation invariant (`DR-C10-S5-1`) and `A-28`'s tolerance envelope: a confinement that cannot be placed at or below the port boundary is `A-28`'s named invalidating outcome and routes a recorded amendment there rather than proceeding outside the envelope. Co-named **`NEU-896`** as the live recipient of C010's residual. **No amendment is routed by SUB-5 as things stand** — the envelope check at `05_the-enforcement-point-that-confines-every-read-and-write.md` §10 places the design inside the envelope under two of its three named forms, so the routing condition did not arise.
- **Mitigation:** **Substantial and stated as incomplete.** Enforcement is placed **at the adapter**, below the port boundary, and named per port across all 13 ports with the two exclusions justified (§3) — deliberately not at the transport gate, which is HTTP-only and **fails open on internal error** (`src/transport/context-token-middleware.ts:83`–`:86`), and not in orchestration, which is where C010's `../C010-system-and-repository-architecture/02_findings-register.md:237` puts the existing guard outside the envelope. All three write-path invariants are **removed rather than shadowed** (§4), with `createSession`'s guard **deleted** from orchestration rather than made correct by consequence. The principal is taken as an **indivisible `(principal_id, principal_kind)` pair** bound at construction, which settles `R-S4-1`'s named residual and makes the kind rule structural rather than advisory. A `client`- or `none`-kind principal is **refused**, not empty-scoped. An integration-test design proves A cannot touch B's rows through the tool paths, with a T5 limb specifically so a predicate that refuses everyone cannot pass, a T6 limb for the refusal, and a T7 limb for aggregates (§7). **The mitigation names the sibling outcomes it touches without transferring authorship:** OUT-7's two-transport `I4` application is SUB-4's and is consumed at §8.4; OUT-17's per-path invariant matrix with operator paths modelled is SUB-12's, and §7.4 names the four paths this design's tests do not cover so that matrix inherits them rather than rediscovers them.
- **Mitigation status:** **Partially mitigated.** The design closes the exposure; **nothing is applied**, so the deployed exposure is unchanged at this cutoff. **Residuals, named:** the applied result, owned by the implementation charter `NEU-896` hands the work to; the DDL that realizes the ownership key and the partial unique index, owned by **SUB-13 (NEU-1006)** under OUT-19; the disposition of existing unowned rows, owned by **SUB-6 (NEU-1000)** under OUT-2; the stage sequence that lands the three removals together, owned by **SUB-7 (NEU-1001)** under OUT-3; and the four uncovered test paths, owned by **SUB-12 (NEU-1005)** under OUT-17.

## `R-S5-1` — Confinement over a mixed population hides pre-cutover rows from every principal, and the loss is scored as a success

- **Risk:** A confinement predicate on the ownership key **excludes every row that has no owner**. Over a population that is part pre-cutover and part post-cutover, that makes unowned rows unreachable to **everyone**, including the learner who created them. This is the safe direction and that is exactly what makes it dangerous: an audit looking for over-exposure sees a clean result, and an audit looking for data loss is not the audit anyone runs against an isolation change. It is the exact inverse of `R-S16-1`, where erasure *misses* the same rows; both descend from the single fact that attribution is not retroactive (`16_attribution-and-detection.md:279`–`:285`). The population's size is **unobserved** and depends on open items this package cannot close.
- **Severity:** **High** — it is silent, it is systematic, it affects real learner content, and the direction of the error means no isolation test detects it.
- **Owning outcome:** **OUT-8** — the enforcement point, which is where the predicate is specified and therefore where its behaviour over an unowned row originates.
- **Named owner:** **SUB-6 (NEU-1000)** under OUT-2, which owns the disposition of every unowned row already in production and is the only party positioned to decide whether they are backfilled, quarantined or archived; **the creator, as sole maintainer and sole operator**, for the population itself.
- **Escalation route:** **`NEU-896`** at convergence, as a cross-package data-loss exposure created by a privacy control rather than by a defect; **additionally SUB-6 (NEU-1000) directly**, because the disposition is its deliverable and the matrix would otherwise ship with this cell unresolved.
- **Mitigation:** **Disclosure only, and stated as such.** The behaviour is named at `05_the-enforcement-point-that-confines-every-read-and-write.md` §6.4 rather than left for a reader to infer from the predicate; the confinement rule is written so it **does not assume a backfill has happened** — its correctness does not depend on every row having an owner, only its usefulness does; and the ordering constraint that `user_id NOT NULL` cannot be added to a populated table without a backfill or a default is stated as SUB-7's (`F-S5-10`). What is **not** mitigated is the loss itself: no predicate can return a row it cannot attribute, and no design in this package can attribute a row whose binding is gone.
- **Mitigation status:** **Open.** No disposition exists; the sub-task that owns it runs at position 8. **Residual, named:** the disposition, owned by **SUB-6 (NEU-1000)**; and the population's **size**, which is unobserved. **No row count is asserted.** `R13`'s `n = 0` evidence label applies in full.

## `R-S5-2` — The RLS second layer is implemented by wrapping every read in a transaction, and the pool of four becomes the isolation change's cost

- **Risk:** `DR-C11-S5-1` clause 5 recommends row-level security as an independent second defence. On this deployment the `pg.Pool` is shared and connections are reused (`max: 4`, `src/infrastructure/db/client.ts:42`), so a session-level setting leaks between requests and a **transaction-local** one is required — which means wrapping every row-owning read in a transaction. Most are not in one today. A transaction holds a connection for longer than a single statement, and `OBJ-1` is *"Concurrent DB-bound tool calls served without queueing: **≤ 4**"* (`15_operational-objectives-for-the-real-platform.md:248`), with the pool identified as **the first thing that breaks** (`:131`) over a band of 2–200 learners (`:161`–`:163`). An implementer who reads clause 5 as "add RLS" and not "add RLS and a transaction around every read" ships a correctness improvement that moves the deployment down its own scaling band.
- **Severity:** **Medium** — clause 5 is explicitly labelled *recommended, second, and not primary*, so the primary mechanism does not depend on it and a deployment that skips RLS entirely still confines. The severity is not lower because the clause is the kind a security reviewer promotes to mandatory without re-costing it.
- **Owning outcome:** **OUT-8** — the enforcement point, whose clause 5 introduces the second layer.
- **Named owner:** **SUB-13 (NEU-1006)** under OUT-19, as the party that would author the RLS DDL and the only one positioned to specify the transaction discipline alongside it; **the creator, as sole maintainer and sole operator**, for the pool configuration.
- **Escalation route:** **`NEU-896`** at convergence, as the party that weighs a defence-in-depth control against a platform capacity ceiling neither this package nor SUB-13 can raise.
- **Mitigation:** **By construction and by disclosure, not by measurement.** Clause 5 is written as the **second** layer and explicitly not the enforcement point, precisely so the primary mechanism carries no unpriced cost; the transaction requirement is stated in the clause itself rather than discovered at implementation; and `05_the-enforcement-point-that-confines-every-read-and-write.md` §12 checks clauses 1–4 against `OBJ-1` and reports **zero** added round-trips and zero added connection acquisitions, so the cost is isolated to clause 5 alone. What is **not** mitigated is the number: pricing the transaction cost needs `t_db`, which is unobserved.
- **Mitigation status:** **Partially mitigated.** The cost is bounded to one clause and disclosed at the point of use; its magnitude is unknown. **Residual, named:** `OI-S5-1` — whether the transaction requirement is acceptable against `OBJ-1` — owned by **SUB-13 (NEU-1006)**; and `OI-S15-3`, the `t_db` observation that would make it calculable, cited from its single owning record and not re-raised.

## `R-S5-3` — The enumerated access-path set silently rots, and the `holds` verdict outlives the closure argument that earned it

- **Risk:** `SC-S3-12`'s `holds` rests entirely on the claim that the access-path set for `public.notes` is **closed** — one import of the table object, no raw SQL, no tx-scoped instance, one test-only truncate (`05_the-enforcement-point-that-confines-every-read-and-write.md` §8.3). That is a statement about the code at cutoff `cc38cc9`, and **a single new import of the `notes` table object in any file falsifies it without touching this document.** The verdict would then be cited — by SUB-13's re-verification, by SUB-12's matrix, by `NEU-986` as the cap's positive instance — while the argument beneath it no longer holds. Nothing in the repository detects this: there is no lint rule, no CI check and no test that asserts the import is unique, and the closure argument is prose in a research document.
- **Severity:** **Medium** — the window is real but the failure is recoverable and visible on inspection, and `notes` is a stable, rarely-touched table with one adapter. It is not Low because the verdict is the package's headline result and the thing most likely to be quoted without its cutoff.
- **Owning outcome:** **OUT-8** — the derivation, which is where the closure argument is made and where its cutoff-boundedness originates.
- **Named owner:** **SUB-13 (NEU-1006)** under OUT-19, whose consistency check already re-verifies this derivation against the DDL it writes and is therefore the nearest scheduled re-read; **the implementation charter `NEU-896` hands the work to**, for the re-verification at the landing cutoff, which is clause 4 of `CAP-S5-1`'s stated lifting condition.
- **Escalation route:** **`NEU-895` (C010)**, which owns `DR-C10-S5-1` and §3.4.1's rule that a `holds` asserted without an enumerated access-path set *"falsifies §3.4.1's rule rather than satisfying the invariant"* — a stale enumeration cited as a live one is precisely that failure, and it is settled in C010's record rather than here. Co-named **`NEU-896`**.
- **Mitigation:** **Structural where it can be, disclosed where it cannot.** The closure argument is written as **four separately checkable facts** rather than one assertion, so a reader can re-run each mechanically in a single grep apiece; the cutoff is stated in the chapter front matter, in `DR-C11-S5-2` and in every verdict statement; **re-verification at the landing cutoff is written into `CAP-S5-1`'s lifting condition as clause 4**, so the cap cannot lift on a stale enumeration; and `DR-C11-S5-2`'s revision trigger names *"a new import of the `notes` table object, or any raw SQL naming it"* explicitly. What is **not** mitigated is detection: nothing fires automatically, and a lint rule asserting the import is unique would be a `src/`-adjacent change this sub-task may not make.
- **Mitigation status:** **Partially mitigated.** The staleness is bounded and its re-check is scheduled into two downstream obligations; it is not automated. **Residual, named:** the absence of an automated closure check, owned by **SUB-13 (NEU-1006)** as the party writing the runbook's verification step; and the re-verification itself at the landing cutoff, owned by the implementation charter.

---

**SUB-5 register totals at revision 1:** four entries — **`R1` (Critical)**, `R-S5-1` (High),
`R-S5-2` (Medium), `R-S5-3` (Medium). **Exactly one charter `R<n>` row**, correctly: charter § Risks
row 1 is the only one of the fifteen naming OUT-8 as its owning outcome, per charter assumption 48,
and `:24` pre-allocates it to SUB-5 by name. One open, three partially mitigated; every
non-mitigated status names its residual and that residual's owner, and every entry carries a
severity, a mitigation, a named owner and an escalation route.

**No amendment is routed to `NEU-895` by SUB-5.** `R1`'s escalation route is conditional on the
enforcement point failing to sit at or below the port boundary; `05_the-enforcement-point-that-confines-every-read-and-write.md`
§10 records that it does sit there, under two of `A-28`'s three named forms, so the condition did not
arise. The route is recorded because it remains live for the applied work, not because it fired.

**Two risks are deliberately not raised here, because each is already recorded exactly once
elsewhere and this package carries one id per fact.** That the whole design rests on `n = 0`
evidence is **`R13`** (OUT-18, SUB-1), cited in `R-S5-1`'s status rather than restated. That the
deploy pipeline's smoke run is refused on every release is **`R-S4-2`** (OUT-13, SUB-4) — this
sub-task adds a *second, independent cause* of the same break and records it as the finding
`F-S5-12` with a sequencing obligation on SUB-7, rather than opening a competing risk entry against
a hazard SUB-4 already owns.

---

### SUB-6

## `R9` — A dirty-data pathology that no aggregate query probed for survives the synthetic dry-run and surfaces during the real migration

- **Risk:** The accepted residual cost of the aggregate-in-place decision. The dry-run dataset is
  generated, not copied, so it reproduces **only the pathologies the aggregates were written to look
  for**. A production orphan, encoding anomaly, unexpected null, duplicate or out-of-range value
  outside the probe set will pass a green dry-run and then fail on the real rows — or, worse, silently
  mis-assign ownership. At this revision the exposure is wider than the charter anticipated, because
  the probe set was published but **never executed**: no probe has returned anything, so the dry-run
  that would have caught even the probed-for pathologies has not run either.
- **Severity:** **High**
- **Owning outcome:** **OUT-2** — the migration of the existing global rows, which owns the aggregate
  step, its probe set and the dry-run derived from it.
- **Named owner:** **SUB-6 (NEU-1000)** for authoring the probe set and stating the residual; **the
  creator, as sole maintainer and sole operator**, for executing the probes against production, which
  is the only party with the credential.
- **Escalation route:** **`NEU-896`**, which hands OUT-19's migration plan to the implementation
  charter that actually executes it. The pre-flight probe re-run and the abort condition are
  obligations that charter **inherits**, and a pathology found at execution time escalates there
  rather than back into a package that has already published.
- **Mitigation:** The probe set is an **obligation of the aggregate step, not a nice-to-have**, and is
  published at `06_the-disposition-of-every-unowned-row.md` §6.2 as twelve named probes covering all
  five pathology classes, each with its SQL and a **structural-possibility analysis** stating whether
  a constraint already forecloses that class for that table — so a reader sees what was looked for,
  what could not occur, and what was found. Two of the probes are strengthened by schema facts the
  analysis surfaced: `notes.target_id` is the only place in the schema where a referential orphan is
  possible, because it is polymorphic with no declared FK
  (`src/infrastructure/db/schema.ts:294`); and the SM-2 columns `difficulty`, `ease_factor`,
  `repetitions`, `interval_days` and `consecutive_failures` carry **no `CHECK` constraint at all**,
  making out-of-range values structurally possible where seventeen other columns are already
  foreclosed. **The real migration must therefore carry a pre-flight re-run of the same probe set at
  execution time, and must abort when any probe returns a shape the dry-run never saw** — and, at
  this revision, "a shape the dry-run never saw" means *any* shape, since the dry-run did not run.
  The alternative that would have eliminated the residual — extracting real rows to dry-run against —
  is **not authorized** (intake Q6), so the risk is accepted with its owner rather than mitigated
  away.
- **Mitigation status:** **Partially mitigated.** The probe set exists, is published, and is
  inherited as a pre-flight obligation. The residual is that **it has never been executed**
  (`SPK-S6-2`), so its coverage is untested and its results are unknown; that residual's owner is the
  creator, as the only party holding a production credential.

## `R-S6-1` — Archiving the pre-cutover population could be mistaken for discharging the erasure duty over it

- **Risk:** `DR-C11-S6-2` closes the pre-cutover log population and moves it out of the confined
  surface, which makes it finite, countable and separately addressable. A later reader — or a later
  sub-task — could take that tidiness for a resolution and treat `F-S8-2` as closed. **It is not.** A
  population-wide bound over a closed set is still not a **learner-scoped** bound, which is precisely
  the field `F-S8-2` records as impossible to supply, and archiving supplies no per-learner predicate
  because none can exist. If SUB-9 concludes "accepted residual", the archive persists with the
  erasure duty attached and undischarged — the correct outcome, but one that looks like completion.
- **Severity:** **Medium** — it does not create a new exposure; it creates a way to stop looking at an
  existing one.
- **Owning outcome:** **OUT-2**, which authored the archive decision and is therefore where the
  misreading it enables must be named.
- **Named owner:** **SUB-9 (NEU-1003)** under OUT-12, which owes the population its propagation action
  and is the party whose conclusion determines whether the duty is discharged, deferred or accepted.
- **Escalation route:** **`NEU-896`** at convergence, where a data-lifecycle duty recorded as
  satisfied by a package that did not satisfy it would surface across packages; the erasure duty
  itself is a program-level obligation, not this package's alone.
- **Mitigation:** The non-discharge is stated three times in three places rather than once —
  `06_the-disposition-of-every-unowned-row.md` §4.3 item 1, `DR-C11-S6-2` decision clause 5 and
  consequence 2, and `traceability/S6_the-disposition-of-unowned-rows.md`'s "does not establish"
  list. `F-S8-2`'s severity, owner and routing are left **entirely unchanged** by this sub-task, and
  the remit table at §4.3 sets the migration disposition and the propagation disposition on separate
  axes so the two cannot be read as the same answer.
- **Mitigation status:** **Partially mitigated.** The statements are in place; the residual is that
  they are statements, and the only thing that actually closes it is SUB-9 publishing its
  disposition. That residual's owner is SUB-9.

## `R-S6-2` — The migration sweep runs at boot, cannot be deferred, and breaches `OBJ-8`'s availability budget

- **Risk:** Migrations run automatically on boot, unconditionally, with no environment guard and no
  repository-owned lock. There is therefore **no deploy-independent way to defer the sweep**: a
  backfill over the population-A tables and a move of the two log tables both extend boot by their own
  duration, and `OBJ-8` allows **≤ 13 s** of planned unavailability per restart to meet a 99.9%
  availability target (≤ 65 s for 99.5%, ≤ 131 s for 99%). Any single boot whose sweep exceeds that
  breaches the objective, at `OBJ-7`'s cadence of **≥ 7 unannounced restarts per day**.
- **Severity:** **High** — it is a direct, arithmetic conflict between this sub-task's disposition and
  a published objective, on a deployment where a schema change and its deployment are not separable
  events.
- **Owning outcome:** **OUT-2**, whose migration creates the load; the objective it conflicts with is
  SUB-15's, under OUT-14.
- **Named owner:** **SUB-7 (NEU-1001)** under OUT-3, which owns the stage sequence and the
  deploy-independent disable path each stage must carry, and **SUB-13 (NEU-1006)** under OUT-19, which
  writes the migration and therefore chooses its batching.
- **Escalation route:** **`NEU-896`** as the convergence gate: a stage that cannot be executed within
  the platform's own availability objective is an input to the program-level go / conditional-go
  decision, not a defect this package can close — the compose stack and the VPS are outside this
  repository entirely.
- **Mitigation:** The sweep is required to be **batched, idempotent and resumable**, so that each boot
  performs a bounded slice and the whole migration spans several boots. That keeps any single boot
  inside `OBJ-8` and is also what `OBJ-7`'s restart cadence demands independently, since the sweep
  **will** be interrupted. It additionally respects `OBJ-1`: a batched sweep holds one of the pool's
  four connections briefly rather than one for the whole migration.
- **Mitigation status:** **Partially mitigated**, and the limit is stated rather than glossed.
  Batching converts one long breach into several short ones, which is better but is **not** "no
  breach" — and no design available to this package does better while boot-time migration cannot be
  deferred. The residual is owned by SUB-7 and escalates to `NEU-896`.

---

**SUB-6 register totals at revision 1:** three entries — **`R9` (High)**, `R-S6-1` (Medium),
`R-S6-2` (High). **Exactly one charter `R<n>` row**, correctly: charter § Risks row 9 is the only one
of the fifteen naming OUT-2 as its owning outcome, per charter assumption 48, and `:32` pre-allocates
it to SUB-6 by name. All three are partially mitigated; every one names its residual and that
residual's owner, and every entry carries a severity, a mitigation, a named owner and an escalation
route.

**No amendment is routed to `NEU-895` by SUB-6.** The `A-28` envelope check at
`06_the-disposition-of-every-unowned-row.md` §12 places every one of the five dispositions inside the
envelope, and the one value the envelope does not name — `no-key-owed` — is inside under **both**
readings of the envelope's scope, so the condition that would have routed an amendment did not arise.
`A-28`'s re-validation trigger is this package's own publication, which this chapter is part of; the
trigger's owner performs the re-check, not this sub-task.

**Two hazards are deliberately not raised here, because each is already recorded exactly once
elsewhere and this package carries one id per fact.** That the platform cannot guarantee exactly one
concurrent boot-time migrator is **`R-S15-3`** (OUT-14, SUB-15) — this sub-task adds the requirement
that every stage be safe under concurrent execution and cites the entry rather than opening a
competing one. That the whole design rests on `n = 1` evidence is **`R13`** (OUT-18, SUB-1) — cited as
the source of `A-S6-1`'s premise rather than restated, even though this sub-task is the one that makes
that premise load-bearing for ten tables.

**One thing that would look like a risk and is filed as a finding instead.** That the archive changes
the Tier-2 aggregate's counts for five weeks is `F-S6-3`, not a risk entry: it is a determinate,
bounded, self-correcting consequence of a decision taken here, with a known end date — a fact about
what will happen, not an exposure that might. A risk entry would imply an uncertainty the finding does
not have.
