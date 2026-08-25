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
- **Mitigation status:** **Partially mitigated.** The direction of error is constrained and disclosed; the magnitude is not. **Residual, named:** the audit-entry arrival rate that would turn the structural bound into a number is **`OI-S15-3`**, owned by SUB-15's record and cited rather than re-raised; the loss accounting itself is `91_findings-register.md` § `F-S16-2`.

## `R-S16-4` — Attribution converts an indefinitely retained store into an indefinitely retained store of learner-linked personal data

- **Risk:** `infrastructure.operation_event_log` has **no retention bound of any kind** — no cleanup script covers it, and the codebase describes it as *"indefinitely-retained"* (`src/orchestration/topic-workflows.ts:585`; `src/orchestration/chunk-workflows.ts:161`; `scripts/retention-cleanup.sql` covers `mcp_request_log` only). Under `DR-C11-S16-2` it becomes `learner-linked` personal data. The determination therefore does not create the retention gap, but it changes what the gap **is**: an unbounded log becomes an unbounded store of personal data, and every day it runs the exposure grows monotonically with no ceiling.
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
