# S2 — Identity, the learner key and principal kind: outcome-to-evidence traceability

**Sub-task:** SUB-2 (NEU-994) · **Covers:** OUT-1, OUT-5, OUT-6
**Written:** 2026-08-25 · **Model:** claude-opus-5[1m]
**Verification cutoff:** `86fb38a`, 2026-08-25

Every row resolves into `docs/research/`, never into `_local/`. Outcomes resolve into
`../90_outcome-register.md`.

**Evidence classes used here.** `repository-read` — a real path read at the stated cutoff.
`upstream-decision` — a published C010 or `NEU-850` decision, consumed and cited.
`design` — a decision authored in this package, whose evidence is its own decision record and
rejected alternatives. `observation` — a production observation. **No row in this file carries
evidence class `observation`**, and that is the single most important fact about it.

---

## OUT-1 — Identity mapping: which token claim becomes the learner key, and what that key means

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| OUT-1 | The persisted learner key is the OIDC `sub` claim, written verbatim; `azp` is never a learner key. | `DR-C11-S2-1`; `../02_identity-the-learner-key-and-principal-kind.md` §3 | `design` | confirmed | — |
| OUT-1 | The key is written unchanged into the `user_id NOT NULL` column `NEU-850`'s `OUT-2` fixes, so the ownership key is not reinterpreted. | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:51` | `upstream-decision` | consumed | `NEU-850` is converged and unimplemented — a decision to honour, never an existing schema fact (charter assumption 28) |
| OUT-1 | The `payload.sub \|\| azp` fallback is resolved into a rule: three mutually exclusive, jointly exhaustive conditions, zero fall-through. | `../02_…md` §3; `src/transport/jwt-middleware.ts:127`, `:129`–`:131` | `repository-read` + `design` | confirmed | — |
| OUT-1 | All three principal shapes are covered, and the rule is applied identically to each because kind is not derived from the audience shape. | `../02_…md` §2, §3; `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md`; `src/transport/jwt-middleware.ts:73`–`:85` | `repository-read` + `design` | confirmed | **Which branch each shape populates** is unconfirmed for all three — `../94_caps-and-incomplete-scope.md` § `CAP-S2-1` |
| OUT-1 | The production learner path is the static client `claude-web`, not the DCR shape. | `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`, `:67`; `.env.example:63`; `../91_findings-register.md` § `F-S2-1` | `repository-read` | confirmed | Its claim set is unobserved — `../93_open-items-and-provisional-register.md` § `OI-S2-2` |
| OUT-1 | **Absent** claim: no learner key; kind `client` if `azp` present, else 401. | `../02_…md` §4; `src/transport/jwt-middleware.ts:129`–`:131` | `repository-read` + `design` | confirmed | — |
| OUT-1 | **Changed** claim: a different `sub` is a different learner; no automatic merge, no heuristic match. | `../02_…md` §4; `DR-C11-S2-1` rejected alternative 4 | `design` | confirmed | The re-bind procedure with a verified target is **SUB-6**'s — `../92_risk-register.md` § `R-S2-3` |
| OUT-1 | **Re-used** claim: undetectable by construction; the new principal is served the previous learner's history. | `../02_…md` §4 | `design` | confirmed | Whether Rauthy recycles subjects is unestablished — `../93_open-items-and-provisional-register.md` § `OI-S2-1`; exposure carried as `../92_risk-register.md` § `R-S2-1` |
| OUT-1 | Stability, uniqueness, re-issue and format of `sub` under Rauthy. | `../02_…md` §5 | — | **`[unconfirmed]`** — 3 of 4 properties unestablished; uniqueness conditionally sound on ADR-0001's single-issuer premise | `../93_open-items-and-provisional-register.md` § `OI-S2-1`; `../96_spike-register.md` § `SPK-S2-1` |
| OUT-1 | No ADR-0001 expiry condition invalidates the kind rule; two would widen the key, and the widening is pre-argued. | `../02_…md` §11; `DR-C11-S2-1` rejected alternative 5 | `repository-read` + `design` | confirmed | — |

## OUT-5 — Whether the production learner flow yields a human `sub`, closed on observed evidence

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| OUT-5 | The answer is **mixed**: shape 1 believed no `sub`; shape 2 (`claude-web`) probably yes and is the learner path; shape 3 unknown and may be no. | `../02_…md` §10 | `repository-read` (inference stated as inference) | **`[unconfirmed]`** for all three shapes | `../93_open-items-and-provisional-register.md` § `OI-S1-1`, § `OI-S2-2`, § `OI-S1-3` |
| OUT-5 | The system routinely authenticates a non-human principal that writes to production, so *"the production flow yields a human `sub`"* is false as a universal. | Charter assumption 20; `.github/workflows/cd-prod.yml`; `src/server/server-context-tools.ts` | `repository-read` | confirmed | — |
| OUT-5 | **OUT-5's own success measure — an answer from a real token obtained from the production Rauthy IdP — is NOT MET.** | `../90_outcome-register.md` § OUT-5; `../96_spike-register.md` (`SPK-S1-1` … `SPK-S1-3`, all `Result: not executed`) | — | **not met**, reported as not met | `../91_findings-register.md` § `F-S2-3`; `../94_caps-and-incomplete-scope.md` § `CAP-S1-1`, § `CAP-S2-1` |
| OUT-5 | C010's `OI-S1-2` is **owned here**; its design half is discharged and its evidence half is not closable at this revision. | `../02_…md` §9; `../93_open-items-and-provisional-register.md` § SUB-2; `../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:615` | `upstream-decision` + `design` | owned here, **open** | `../95_stand-in-assumption-register.md` § `A-35` |
| OUT-5 | The unedited `Owner:` line at C010's `90_…md:81` is a convention artefact, noted once, with **no ownership finding routed**. | `../02_…md` §9; `../93_open-items-and-provisional-register.md` § SUB-2 | `upstream-decision` | confirmed | — |
| OUT-5 | The residual spans **all three** shapes, not one, and carries a named owner and an observable re-validation trigger. | `../95_stand-in-assumption-register.md` § `A-35` | `design` | **`[unconfirmed]`** | Owner: the creator, as sole operator. Trigger: `OI-S2-2` closes. |

## OUT-6 — Whether the resolved identity carries its `sub`/`azp` provenance, so check `I5` is answerable

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| OUT-6 | Principal kind is **determined** — from the presence of `sub`, with three exhaustive outcomes — and never inferred from the audience shape. | `DR-C11-S2-2` decisions 1–2; `../02_…md` §3 | `design` | confirmed | — |
| OUT-6 | Deriving kind from the audience shape would be **false on this deployment**, because the production human arrives on a static client. | `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`; `DR-C11-S2-2` rejected alternative 4 | `repository-read` | confirmed | — |
| OUT-6 | A `client`-kind principal is **admitted as a service principal holding no learner state**, and learner reads/writes under it are **refused**, not empty-scoped. | `DR-C11-S2-2` decision 3; `../02_…md` §3 | `design` | confirmed | Where the refusal is enforced is **SUB-5**'s (OUT-8) |
| OUT-6 | Provenance is **carried**, as a separate field, in flight beside `res.locals.auth` and at rest on the `context_tokens` binding. | `DR-C11-S2-3` clauses 1–3; `../02_…md` §6; `src/transport/jwt-middleware.ts:133`–`:136` | `design` + `repository-read` | confirmed | `context_tokens` has no column to bind to yet — `../91_findings-register.md` § `F-S1-1`; the column is **SUB-4**'s and **SUB-13**'s |
| OUT-6 | Who may read it, and the explicit limit on what it entitles: `user` means *a `sub` claim was present*, **not** *a natural person*. | `DR-C11-S2-3` clauses 4–5; `../02_…md` §6 | `design` | confirmed | The humanity question is `A-35`, carried by every consumer that reads the kind |
| OUT-6 | Check `I5` is **evaluable**: both limbs have an input, and zero consumers are documented as unable to distinguish kinds. | `../02_…md` §7; `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174` | `upstream-decision` + `design` | confirmed | **Evaluable, not passing** — `I4` fails first and masks it (`../../C010-system-and-repository-architecture/02_findings-register.md:267`); no category reaches `holds` (C010 `F-S5-4`) |
| OUT-6 | `OI-S5-2` is **closed**, discharged clause by clause against its own resolving event. | `../02_…md` §8; `../93_open-items-and-provisional-register.md` § SUB-2; `../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:221` | `upstream-decision` + `design` | **closed** | — |
| OUT-6 | Persisting a kind discriminator does not contradict `NEU-850`'s `OUT-2`; no amendment is routed to `NEU-895`. | `../02_…md` §12; `DR-C11-S2-3` clause 3 | `upstream-decision` | confirmed | — |

---

## What this file does not establish

- **It establishes nothing by observation.** No row carries evidence class `observation`, because
  none was available: SUB-1 executed zero of nine production spikes and SUB-2 adds three more,
  likewise unexecuted. Every `confirmed` status above is confirmed **as a design position or as a
  repository read at cutoff `86fb38a`** — never as a fact about running production.
- **It does not establish that OUT-5 is discharged.** OUT-5's own success measure is recorded as
  **not met**, and this file says so in its own row rather than leaving the reader to infer it from
  a residual column.
- It does not establish where the rule is enforced (SUB-5 / OUT-8), how identity reaches STDIO or
  binds to a context token (SUB-4 / OUT-7, OUT-13), what happens to existing unowned rows (SUB-6 /
  OUT-2), how requests become attributable (SUB-16 / OUT-15), or how the key becomes DDL (SUB-13 /
  OUT-19).
- It does not classify the `sub` value as personal data; the format question is flagged forward to
  SUB-3 and SUB-8 at `../02_identity-the-learner-key-and-principal-kind.md` §5.
- It asserts nothing about the completeness of the outcome set, cross-register consistency, or the
  package's audit set — SUB-14 at position 15 and SUB-17 at position 16.
