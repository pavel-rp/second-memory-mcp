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
