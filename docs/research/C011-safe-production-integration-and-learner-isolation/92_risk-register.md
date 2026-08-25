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
