# `S1` — Production evidence: outcome-to-evidence trace

**Task:** NEU-993 (SUB-1) · **Charter:** C011 (umbrella NEU-893) · **Written:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]
**Covers:** OUT-18

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| `OUT-18` | Every uncertain-and-material production claim resolves to a spike record or an owned open item, and **both counts are reported and sum to the total**. | `../01_production-evidence-and-the-access-audit.md` §4; `../96_spike-register.md` (9 entries); `../93_open-items-and-provisional-register.md` (9 entries) | Published artifact, internally countable — the two registers are one-to-one and the counts are stated as numbers | `confirmed` | The count is complete; the *evidence* is not. 0 of 9 closed by observation. Capped at `CAP-S1-1`. |
| `OUT-18` | All three principal shapes are represented, each by a named acquisition method distinct from the other two. | `../01_production-evidence-and-the-access-audit.md` §2; `DR-C11-S1-1` | Published artifact — the three methods are named and differ in principal, endpoint and flow | `confirmed` | No shape was actually acquired. `OI-S1-1`, `OI-S1-2`, `OI-S1-3`. |
| `OUT-18` | No shape is represented by a capture taken from a different flow. | `../91_findings-register.md` § `F-S1-3`; `DR-C11-S1-1` rejected alternative 1 | Direct file inspection of `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md` — a DCR client can never obtain `aud = <resource URL>`, so the substitution is structurally impossible, not merely forbidden | `confirmed` | None. Zero captures exist, so zero substitutions are possible; and the structural bar holds independently of that. |
| `OUT-18` | The access audit reports zero mutating operations against the production database, the running MCP server and the deployment. | `../01_production-evidence-and-the-access-audit.md` §3 | Direct enumeration of operations performed — zero of any kind, because no credential was available | `confirmed` | The discipline is untested against a real access episode. Residual named at `R8`. |
| `OUT-18` | The single registered exception — IdP token issuance — is enumerated with its residue stated, and `init_agent_context` appears in neither list. | `../01_production-evidence-and-the-access-audit.md` §3 | Published artifact — the exception is registered with its scope and residue (a minted token, an IdP audit record, both outside the three protected systems) | `confirmed` | The exception was **not exercised**, so its residue is zero rather than "one token and one audit record". |
| `OUT-18` | An unregistered mutation is a blocking finding with a named owner, landing in the findings register. | `../91_findings-register.md` § "The standing rule OUT-18 owns" | Published artifact — the landing route is declared and the trigger's fire count is reported | `confirmed` | The rule has never fired, so its routing is unexercised. |
| `OUT-18` | Zero published captures contain token material, a signature, or any secret value. | `../01_production-evidence-and-the-access-audit.md` §5 | Direct enumeration — zero captures published | `confirmed` | **Vacuous.** Establishes that nothing leaked; establishes nothing about whether the redaction discipline would hold. Residual at `R8`. |
| `OUT-18` | The backups fact carries exactly one register record with a stable id. | `../93_open-items-and-provisional-register.md` § `OI-S1-8` | Published artifact — one entry, cross-referenced from `A-33` as an assumption rather than restated as a fact | `confirmed` | Whether SUB-15, SUB-7 and SUB-9 in fact cite `OI-S1-8` rather than restating it is **each of their own acceptances**, at positions 6, 9 and 11 — not assertable here. |
| `OUT-18` | OUT-18's outcome-register row carries its resolving evidence and its success measure. | `../90_outcome-register.md` § OUT-18 | Published artifact — a four-part measure with its measured result | `confirmed` | The measure is met while the evidence base is empty; both are reported. |
| `OUT-18` | Every residual exposure carries a risk-register entry with severity, mitigation, named owner and escalation route, including all three OUT-18-owned charter § Risks rows. | `../92_risk-register.md` § `R8`, `R13`, `R14` | Published artifact — three entries, each with all four fields | `confirmed` | `R13` records a position **worse** than the charter's: `n = 0`, not `n = 1`. `R14`'s stale-citation limb is open. |
| `OUT-18` | Every capture carries a named owner, a retention bound and a destruction condition tied to the package's publication. | `../01_production-evidence-and-the-access-audit.md` §6 | Published artifact — the sixth copy class's terms are set at position 1 with empty membership | `confirmed` | Whether the assembled class contains every capture is **SUB-9's** acceptance at position 11. |
| `OUT-18` | Charter assumptions 33 and 34 carry stand-in entries, each with the assumption, a named owner and a re-validation trigger. | `../95_stand-in-assumption-register.md` § `A-33`, `A-34` | Published artifact — neither entry has a blank owner or trigger | `confirmed` | Both are `[unconfirmed]` by construction. Their triggers are `OI-S1-8` and `OI-S1-9` closing. |
| `OUT-18` | No file under `src/`, `drizzle/` or any deployment configuration is modified. | `../01_production-evidence-and-the-access-audit.md` §7 | Direct measurement — `git diff --name-only origin/develop` lists files only under this package directory | `confirmed` | None. |
| `OUT-18` | The settled tool-surface figure is 46 registered / 43 gated / 3 exempt, re-derived at this cutoff. | `../01_production-evidence-and-the-access-audit.md` §8 | Direct measurement at `546ee90` — 46 `server.registerTool(` occurrences in `src/server/`; `EXCLUDED_TOOLS` in `src/transport/context-token-middleware.ts` holds exactly `init_agent_context`, `get_server_info`, `get_server_workflow` | `confirmed` | None. The figure is re-derived, not inherited. |
| `OUT-18` | C010 decisions are consumed with the source cited, and no contradiction was found. | `../91_findings-register.md` closing note; citations at `SPK-S1-4`, `SPK-S1-8`, `SPK-S1-9` | Published artifact — the check ran and returned empty; **no amendment routed to `NEU-895`** | `confirmed` | The check covers only the C010 material SUB-1 consumed — deployment shape and token-bound identity — not C010 in full. |

## What this file does not establish

- **It establishes nothing about the production system.** Every `confirmed` status above is confirmed
  about *this package's own artifacts* — that a register entry exists, that a count sums, that a
  method is named. Not one confirms a fact about production. `CAP-S1-1` states that limit, and it is
  the single most important thing a reader of this matrix should carry away.
- It does not establish that the access or redaction discipline **works**, only that it was not
  violated during an episode in which nothing was accessed.
- It does not establish anything about OUT-1, OUT-5, OUT-7, OUT-9, OUT-12, OUT-14 or OUT-15. SUB-1
  supplies inputs to their sub-tasks and asserts nothing about their artifacts.
- It does not establish band placement, cross-register consistency, or package completeness — SUB-14
  at position 15 and SUB-17 at position 16.
- It does not establish what C010's `A-28` re-check is handed. Publishing C011 fires `A-28`'s
  trigger, but stating the handoff is SUB-14's closure obligation.
