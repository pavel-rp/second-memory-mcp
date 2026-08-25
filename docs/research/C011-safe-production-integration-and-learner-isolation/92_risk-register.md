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
- **Mitigation:** The greenfield status is stated as a constraint in the chapter's opening (`03_learner-data-inventory-and-classification.md` §0) with the sweep and its date named, and with C010's only retention/deletion content enumerated exactly — the `CAP-S3-3` / `CAP-S4-1` / `F-S3-3` / `CAP-S7-1` chain over the two operational-log tables, and nothing else. Every classification the chapter states carries **its own** evidence: a real path and line at a stated cutoff, or an explicit citation to the upstream record it consumes. Exactly one thing is consumed from C010 rather than re-derived — the state-category **individuation rule** (`DR-C10-S3-1`) — and it is cited at both §3 and §10 rather than absorbed. The rejected alternatives live in `DR-C11-S3-1`, `DR-C11-S3-2` and `DR-C11-S3-3` rather than being implied.
- **Mitigation status:** **Partially mitigated, and the residual is specific rather than generic.** The mitigation held on the audit that can be run: every basis, purpose and minimization position in the 32 entries is authored here with its own evidence, and none cites an upstream lifecycle position, because none exists to cite. **Two named residuals.** First, the greenfield claim rests on a **sweep dated 2026-08-24** of C010's package, not on a mechanical guarantee; a lifecycle position sitting in a C010 document the sweep did not open would falsify it, and that is why the escalation route names `NEU-895` on that limb specifically. Second, and more live: **OUT-10, OUT-11 and OUT-12 inherit this classification as their only upstream**, so an unsourced position entering *here* propagates to three outcomes rather than one — the reason this row is High while `R10` is Medium. The inventory's own defence against that is that every entry is falsifiable against a cited path, which a reader can check without leaving the package.
