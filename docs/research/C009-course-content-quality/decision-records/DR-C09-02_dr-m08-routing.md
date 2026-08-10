# DR-C09-02 — Routing Gate-Bearing Evidence to In-App Artifacts (`DR-M08` honoured, not challenged)

**Task:** NEU-962 (SUB-6) · **Charter:** C009 (umbrella NEU-890) · **Covers:** OUT-5 · **Decision id:** `DR-C09-02` · **Owner:** **the creator** (default), as the party carrying the mastery-claim exposure; the `DR-M08` control itself is owned by **NEU-888**'s instructional ledger and is **not** touched here · **Status:** deferred — **this record sets no status of its own.** Status lives in a ledger: this package's `adjudication/`, or the owning package's ledger for an inherited decision (`A1`–`A5`: a producing task may not promote its own artifact). The route it writes up was decided upstream (C009 charter, umbrella NEU-890, **assumption 22, confirmed**); this record specifies and proves it · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10
**Model:** claude-opus-5[1m]

Follows the house decision-record shape (Decision · Rationale · Rejected alternatives · Consequences · Evidence · Revision trigger), as `DR-C09-01_permitted-field-set.md` does. **A producing task may not promote its own artifact** (`A1`–`A5`), so this record argues and demonstrates; it adjudicates nothing.

**This record does not reopen the route.** The route is decided. A local re-decision would be **inadmissible** regardless of what this record concluded, and this record concludes nothing new. Its job is to write the routing up and to demonstrate, control by control, that **nothing was weakened**.

---

## Decision

**All gate-bearing evidence comes from in-app artifacts the system owns.**

1. **The gate-bearing set is exactly three:** the **`retrieval`** item result, the **`assessment`** item result, and **the solution the learner pastes back**. A pasted solution **is** an in-app artifact — it is submitted here, persisted here, and graded here — **so the real solving work still counts.** The product decision to send the learner to the source platform does not discard their work; it discards only our claim to have watched them do it.
2. **A bare "I solved it" acknowledgement feeds no gate.** Not Gate A, B, C, D or E; not any of `MM-T1`…`MM-T15`. The full mapping, with an explicit may-feed and may-not-feed list per signal, is `../06_assessment-evidence-out-of-band.md` §4.
3. **No instructional-ledger challenge is filed for `DR-M08`, and no adjudication round is required.** The routing **honours** `DR-M08`'s control rather than weakening it: every gate-bearing signal is graded through the constrained rubric payload and the deterministic mapper `DR-M08` requires, so there is nothing to challenge. Filing one anyway would spend another package owner's adjudication round on a settled question.
4. **This record adds no challenge id, no challenge section, and no `adjudication/` entry** — for `DR-M08` or for anything else.

> **On vocabulary, so the record cannot be misread as a quotation.** The charter (umbrella NEU-890) refers to this as `DR-M08`'s **"captured-grading control"**. That phrase is **the charter's**, not `DR-M08`'s. `DR-M08`'s own words are a **"constrained grading payload (schema)"** and a **"deterministic (non-LLM) mapping"**. Both are used below in their own right; neither is presented as the other's verbatim text. Manufacturing a quotation to satisfy a criterion is the exact failure this package exists to prevent.

## Rationale

- **The tension is real, and routing dissolves it rather than arguing with it.** `DR-M08` assumes captured in-app grading and names **bare self-report a rejected alternative**. Out-of-band solving is an **unaddressed** case there, not a permitted one. There were only two honest moves: challenge the control, or route around the gap so the control never has to bend. The second is strictly cheaper and strictly safer, and it was available because *the learner comes back*.
- **The pasted solution is the whole reason no challenge is needed.** Had the gate-bearing set been limited to items we authored, the design would have had to argue that a learner's genuine solving work is evidentially worthless — which is both false and demotivating. A pasted solution routes the learner's real work through the *same* constrained payload and the *same* deterministic mapper as everything else. **The control is applied to more evidence, not to less.**
- **Nothing is weakened, because nothing is exempted.** There is no path in this design by which an artifact reaches a gate without passing the rubric-anchored payload and the deterministic mapping. The out-of-band case does not get a lighter standard; it gets **no** standard of its own.
- **The rejected alternative stays rejected, in the stronger form.** `DR-M08` rejects bare self-report. This design does not merely decline to grade a self-report — it gives `self_report_outcome` an **empty may-feed list**, so the signal cannot become gate-bearing by combination either. That is a strengthening of the rejection's practical effect, not a re-litigation of it.
- **Filing a challenge would have been the *appearance* of rigour.** A challenge is the correct move when a design needs a control to bend. This one does not. Filing regardless would consume an adjudication round belonging to another package's owner and would leave a ledger row implying `DR-M08` was in doubt, which it is not.

## Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| **File an instructional-ledger challenge against `DR-M08`** on the grounds that out-of-band solving is unaddressed there, and let the ledger decide the route. | Superficially the most rigorous option, and wrong for a precise reason: **a challenge is for a control you need to change.** This design needs `DR-M08` unchanged — every gate-bearing signal already satisfies it. The challenge would ask another package's owner to spend an adjudication round ratifying that nothing needs to happen, and the resulting ledger row would read, to any later reader, as evidence that the control was contested. **Charter assumption 22 is confirmed and says so explicitly.** |
| **Admit a bare self-report as a weak signal with a discounted weight** — let it contribute fractionally to `MM-T1` rather than not at all. | The single most tempting option, because it *feels* like it wastes less information and because a "small" weight sounds harmless. It fails on the composition invariant: a signal with a non-zero weight is a signal that accumulates, and three discounted self-reports become a counted success. It also re-admits by the back door precisely the alternative `DR-M08` names rejected. **An unfalsifiable signal has no honest weight, and a small one is just a slower laundering.** |
| **Infer the missing evidence** — reconstruct an attempt trail from `return_timing`, or treat a fast return as fluency evidence for `MM-T15`. | Manufactures a measurement out of a quantity that does not contain it. The interval between citing a problem and the learner returning contains arbitrary amounts of not-solving (`../06_…md` §3.2). This is the failure the package's own refuse-rather-than-invent discipline names, applied to a number instead of to a citation — and a fabricated number is harder to spot than a fabricated citation, because it arrives already looking like data. |
| **Require the learner to solve in-app after all**, restoring the captured-grading assumption by removing the out-of-band case. | Not this sub-task's decision to make, and it re-decides a settled product choice (assumption 5, confirmed: no in-app judge and no captured keystrokes exist for the external problem). A design that resolves its tension by deleting the premise has not resolved it. |

## Consequences

- **`M03`, `M04`, `M06`, `M08`, `M09` and `M10` are each satisfied without weakening.** The control-by-control demonstration is the table below; none is marked "re-adjudicated", because none was.
- **Gates D and E cannot be opened on out-of-band evidence at all**, and Gate C cannot be opened directly by any signal. Those are consequences of the routing, recorded as findings rather than as gaps to be filled later (`../06_…md` §8).
- **SUB-9 (NEU-965) inherits a mapping in SUB-2's own vocabulary.** Every field name in the mapping is spelled exactly as `02_content-and-exercise-forms.md` defines it, so the signal→gate mapping merges into one enforceable quality system **without a translation layer**.
- **The authorship of a pasted solution remains unobservable**, and no in-app signal closes that gap. It is bounded — one counted success toward `MM-T1` at most — and recorded as `OI-S6-3` / `CAP-S6-2` rather than solved by inference.
- **Nothing in `src/` changes.** `DR-M08`'s deterministic mapper (`src/domain/algorithms/grade-mapper.ts`) and `MC-4`'s ceiling check (`src/domain/algorithms/over-validation-guard.ts`) are already implemented and are honoured as they stand. This record proposes no change to either, and none is made.

### The control-by-control demonstration

Each learning-critical control, the in-app artifact and **SUB-2 field** that carries it, the threshold it answers to, and how the routing satisfies it **without weakening**.

| Control | Carried by (artifact · field) | Answers to | How the routing satisfies it — without weakening | Weakened? |
| --- | --- | --- | --- | :-: |
| **`M03`** Retrieval Practice | **`retrieval`** · **`hint_ladder`** | `MM-T1`, `MM-T3` | Every gate-bearing retrieval item offers the hint-scaffolded second attempt **before a failure is recorded**. The out-of-band solve does not substitute for a retrieval attempt and does not shorten the ladder; it simply is not one. A hint-assisted success still counts toward `MM-T1`/`MM-T3` but **not** toward `MM-T9`, which names unaidedness. | **No** |
| **`M04`** Spacing | **`retrieval`** · **`spacing_eligible`** | `MM-T1`, `MM-T2` | Session separation is declared per item by `spacing_eligible` and evaluated over the sequence of counted successes. A single out-of-band solve contributes at most one success in one session and **cannot satisfy the ≥ 2 separated-session criterion by itself**. The separation requirement is applied unchanged. `assessment` carries no `spacing_eligible`, so it feeds no separation — a narrowing, not a loosening. | **No** |
| **`M06`** Feedback | **`solution`** · **`exposure_precondition`** | `MM-T7` | **No gate-bearing evidence in this design depends on `exposure_precondition`.** The out-of-band path produces no failed in-app attempt, so no correct-answer-exposure step is owed on it and none is skipped. On the in-app path the precondition is applied exactly as `M06` requires, and `MM-T7`'s ≥ 0.90 detection rate is measured there, unchanged. The control is **narrowed in reach, not lowered in bar**. | **No** |
| **`M08`** Assessment | **`assessment`** · **`rubric_payload`** | `MM-T3`, `MM-T4`, `MM-T5`, `MM-T6` | Every gate-bearing artifact — including the pasted-back solution — is graded through the **constrained grading payload** and the **deterministic (non-LLM) mapping** `DR-M08` requires. No free-judgement quality enters any gate. The 0–5 signal is never binary-collapsed. Bare self-report, `DR-M08`'s named rejected alternative, is given an **empty may-feed list**. `RA5` retained: AI grading is not the signal of record. | **No** |
| **`M09`** Remediation | **`reflection`** · **`remediation_hook`** | `MM-T13`, `MM-T14` | A flagged leech emits a **reformulation action, not a silent suspend**: `post_hoc_reflection` is routed to `MM-T13`/`MM-T14` via `remediation_hook`. Reflection feeds remediation **only** — it opens no gate — so diagnostic narrative is used where `M09` wants it and nowhere else. | **No** |
| **`M10`** Progression | **`assessment`** · **`gate_relevance`** | `MM-T8` | `gate_relevance` records **which dependent a result can contribute to unlocking — relevance, never the threshold.** The durability gate stays **server-evaluated from persisted multi-session history**; **no signal in this design feeds `MM-T8` directly**, and `repetitions > 0` is not used as a proxy anywhere. Gate C reads Gate B's output, per the composition invariant. | **No** |

**Six controls, six rows, none re-adjudicated and none weakened.**

## Evidence

This is a **routing record resting on an upstream decision plus a demonstration — not an empirical finding**, and it is declared as such rather than dressed in manufactured evidence rows.

| What it rests on | Class | Provenance |
| --- | --- | --- |
| The route itself — all gate-bearing evidence from in-app artifacts; bare self-report feeds no gate; no `DR-M08` challenge filed | — (an upstream product decision, **confirmed**, consumed and not re-derived) | C009 charter (umbrella NEU-890), **assumption 22** — cited as the charter, per the `DR-C09-01` precedent for a charter-carried assumption |
| No in-app judge and no captured keystrokes exist for the external problem | — (upstream assumption, **confirmed**) | C009 charter (umbrella NEU-890), **assumption 5** |
| `DR-M08`'s constrained grading payload, deterministic non-LLM mapping, and its rejection of bare self-report | 2 `[code-evidence]` | `../../C005-instructional-model/decision-records/DR-M08_assessment.md` |
| Gates A–E, `MM-T1`…`MM-T15`, and the composition invariant | 2 `[code-evidence]` | `../../C005-instructional-model/mastery-model/00_operational-mastery-model.md` §4, §5 (invariant at `:55`) |
| Which mechanisms are learning-critical (`M03`, `M04`, `M06`, `M08`, `M09`, `M10`) and which are not | 2 `[code-evidence]` | `../../C005-instructional-model/package/00_per-mechanism-index.md` |
| The shipped deterministic mapper and the over-validation ceiling check, honoured and unchanged | 2 `[code-evidence]` | `src/domain/algorithms/grade-mapper.ts`; `src/domain/algorithms/over-validation-guard.ts`; `src/orchestration/teaching-workflows.ts` (`submitAnswerForAssessmentQuestion`) |
| The field names each control is carried by | 2 `[code-evidence]` | `../02_content-and-exercise-forms.md` §3.5, §3.8, §3.9, §3.10, §4 |
| `RA5`, and `MC-4`'s `PROXY-BOUNDING` label | 1 `[literature]` / 2 `[code-evidence]` as recorded at source | `../../C005-product-foundation/product-model/01_principles-differentiators-exclusions.md` §6; `../../C005-product-foundation/measurement-contracts/01_measurement-contract-register.md` |

**No class-7 `[future-real-user]` evidence supports any part of this record, and none could:** no learner has used any of this. Class 7 does not exist for this package.

## Revision trigger

- **`DR-M08` is itself revised in the instructional ledger** — the routing is re-stated against whatever the ledger then records. This record is superseded, not amended locally.
- **A new observable signal appears** that is neither enumerated in `../06_…md` §3.1 nor covered by its residual clause — it is classified there before it may feed anything, and this record's gate-bearing set is re-stated if the classification adds to it.
- **An in-app judge or captured-attempt surface becomes available** for the external problem, falsifying assumption 5. The out-of-band case would then no longer be the operative one, and the routing's premise would need re-reading.
- **SUB-9 (NEU-965) specifies the enforcing gates** and finds a control that the mapping cannot carry in SUB-2's vocabulary without translation — which would be evidence that this record's field attribution is wrong somewhere.
- **The authorship exposure (`OI-S6-3`) is closed or bounded differently** by a signal this record does not contemplate.
