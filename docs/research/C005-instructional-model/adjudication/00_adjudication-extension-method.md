# Instructional Adjudication Extension — Method & Status Discipline

**Task:** NEU-916 · **Compiled:** 2026-07-13 · **Extends (references, never rebuilds):** `../../C005-product-foundation/adjudication/00_adjudication-method-and-rule-versions.md` (NEU-906 status vocabularies, evidence-class firewall, severity floor) and `../../C005-product-foundation/adjudication/03_decision-status-register.md` (the per-element status ledger this mirrors). **Content input:** the instructional register (`../traceability/01_…`) and the NEU-915 synthesis (`../`).

This file says **how** the NEU-887 adjudication ledger is extended to instructional decisions, and fixes the **status discipline** the ledger skeleton (`01_instructional-decision-ledger.md`) obeys. **NEU-916 seeds the skeleton and flips no status to `settled`/`accepted`** — it makes no instructional decision. The ledger is driven later: each mechanism-decision sub-task sets its own rows; the final package sub-task (NEU-925) reconciles the whole.

---

## 1. What this extension may and may not do (inherited from NEU-906 §1)

| May (NEU-916 scope) | May not |
| --- | --- |
| Seed one ledger row per mechanism (M01–M10), per cluster, per conflict (C1–C6), and per gap (G1–G8), each with an **initial** status and a named owner. | Set any mechanism decision status to `settled`/`accepted`; make any mechanism behavior, mastery signal, or threshold decision. |
| Reuse NEU-906's status vocabulary verbatim and stamp each row with it. | Re-version, reinterpret, or re-derive NEU-906's rules, taxonomy, or severity floor. |
| Record which conflict/gap keeps a row `provisional`/`unresolved`, and the artifact (`INC-I#`) that would move it. | Resolve any conflict (C1–C6) or fill any gap (G1–G8) with an invented value. |
| Carry the DP-transfer severity floor (`INC-I1`) as non-downgradable. | Downgrade a High-severity conflict on confirmatory-direction proxy evidence. |

## 2. Status vocabulary (reused verbatim from NEU-906 §4)

**Decision status** (the mutable disposition of a mechanism decision / conflict / gap):

- `accepted` — settled at this altitude, audit-verified. **Reserved:** only a non-measured discipline decision reaches it. **No empirical (class-1–6) instructional element is `accepted`** — and NEU-916 sets *nothing* to `accepted`.
- `provisional` — directional/bounded class-1–6 evidence present, cannot settle; class-7 or in-domain (DP) measurement still required.
- `withheld` — not used as a positive signal (reserved).
- `contradicted` — the claim as literally worded is not matched by its evidence.
- `unresolved` — depends on a missing downstream artifact; carries an `INC-I#` marker.

**Settled / provisional / unresolved (NEU-916's three required statuses)** map onto this vocabulary as: `settled` ⇒ `accepted` (discipline only — none set here); `provisional` ⇒ `provisional`; `unresolved` ⇒ `unresolved` (+`INC-I#`). The `withheld`/`contradicted` values remain available for a downstream sub-task that needs them.

## 3. The evidence-class firewall (binding on every ledger status)

Inherited unchanged from NEU-906 §3:

1. **Classes kept distinct** — no fusion of class-1/2/6; a `code-evidence` compatibility fact and a `literature` effect are separate items.
2. **Agreement ≠ external validity** — nothing here is class-7; no class-1–6 status is `accepted` on the strength of concordant literature.
3. **`accepted` is reserved** — the strongest an empirical instructional element reaches is `provisional`.
4. **Severity floor** — the DP-transfer risk (`INC-I1`, inherited R1) and every HIGH conflict (C1, C2, C3, C4) is **non-downgradable** on confirmatory-direction evidence; its status moves only on new correctly-classed (ideally class-7 / in-domain) evidence.
5. **No invented value** — a `provisional`/`unresolved` row never carries a locally invented threshold, rate, or effect size.

## 4. Seeding rule (deterministic — how NEU-916 sets each initial status)

Applied in order, first match wins, reading only the register and synthesis:

1. If the row is a **mechanism decision** (M01–M10): initial status **`unresolved`** — the decision record (`DR-Mxx`) does not yet exist (`INC-I2`); owner = the cluster sub-task. (No mechanism decision is made by NEU-916.)
2. If the row is a **`code-evidence` reconciliation conflict** (C1–C6): initial status **`unresolved`** — the reconciliation verdict / live-rule re-verification does not yet exist (`INC-I3`); owner named per the synthesis conflict register.
3. If the row is a **gap** (G1–G8): **`unresolved`** if artifact-bound (`INC-I*`), else **`provisional`/INCOMPLETE** if cap-bound (out of NEU-887 caps — G2/G5/G8).
4. The **evidence** behind each mechanism (the `F-*` findings) is separately noted as **`provisional`** (directional class-1/2 present) — this is the *evidence* status, distinct from the *decision* status, which stays `unresolved` until a compliant `DR-Mxx` is authored.

This makes the acceptance bar visible: **every element carries a status and an owner; zero are unadjudicated-but-counted; nothing is `settled` by this task.**

## 5. Relation to the decision-record template

A mechanism's ledger row moves `unresolved → provisional` **only** when a **compliant** `DR-Mxx` record (per `../decision-records/00_…` §5 conformance checklist) is authored and its status mirrored here. For a **learning-critical** mechanism, "compliant" includes a non-prose-only enforceable control (template §2). Thus the ledger cannot show a learning-critical mechanism as `provisional`/`settled` while its decision record carries only a prose control — the two artifacts are cross-checked. That cross-check is the enforcement surface for NEU-916 acceptance scenario 3 at the ledger level.
