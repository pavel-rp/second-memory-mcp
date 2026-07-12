# `LINK-4` Binding, Rule-Version Ledger & Package Self-Check

**Task:** NEU-906 · **Compiled:** 2026-07-12.
Discharges the binding + final verification: binds `LINK-4` (the mutable-status authority slot) to this package per the NEU-899 binding protocol; records the frozen rule version used for every adjudication; and self-checks the package against the acceptance bar. Adjudication content is `01_…`–`05_…`.

---

## 1. `LINK-4` binding (per `../traceability/03_…` §3 binding protocol)

`LINK-4` was reserved UNBOUND by NEU-899 as the slot carrying "the evidence/decision STATUS adjudication ledger (mutable status authority)," owned by NEU-906. This package binds it:

> **`LINK-4` → `../adjudication/` (NEU-906):** evidence/decision STATUS adjudication ledger. Every executed evidence item (BM-2/BM-6/BM-8/JNY-F1/F2/F3) adjudicated under its frozen `MC-* v1.0` rule (`01_…`); class-6 log items admitted via the `PLA-1…3` gate (`02_…`, all PASS, zero rejections); mutable evidence + decision status set per hypothesis/requirement over the full inventory (`03_…`); proxy-replacement dry-run with history preserved (`04_…`); orphan checks 7/7 + adversarial audit clean (`05_…`).

**Binding protocol honored:** this task edits **only** the `LINK-4` row of `../traceability/03_…` §3 (its reserved slot) from `UNBOUND` to `BOUND → ../adjudication/`. It edits **no** other row, **no** element's evidence class / limitation / id, and **renumbers nothing**. Mutable STATUS lives here (LINK-4), not in the NEU-899 structure.

**`INC-*` marker states after adjudication (recorded, not resolved-away):**

| Marker | Owner | State after NEU-906 |
| --- | --- | --- |
| INC-1 (DP in-domain benchmark effect) | NEU-900 suite | **UNRESOLVED** — proxy directional only; R1 High non-downgradable. Awaits NEU-900 in-domain results. |
| INC-2 (validated measurement contract / signals) | SUB-4 | **UNRESOLVED** — contract bound (LINK-2), signal values uncollectible; R6/BM-8 unresolved. |
| INC-3 (DP-grading reliability bound) | OUT-7 (NEU-902/903) | **UNRESOLVED** — over-validation bounded on INCOMPLETE archetype; reliability rate not established; R3 High non-downgradable. |
| INC-4 (revision rules / production replacement signals) | SUB-4 | **UNRESOLVED** — PRX-1…8 defined; triggers fire on future production evidence; dry-run in `04_…`. |
| INC-5 (class-7 real-user/market/adherence) | none (future program) | **UNRESOLVED** — R4/R5-prevalence/D1-demand/M-weighting class-7-absent. |

**No `INC-*` is resolved by this task** — every one remains an explicit hole with its named owner; NEU-906 sets the *status of the elements they hold*, not the artifacts themselves.

## 2. Rule-version ledger (frozen version stamped on every adjudication)

| Adjudicated cluster | Frozen rule + version | Rule held? | Result |
| --- | --- | --- | --- |
| H-B1 / BM-2 / P1 / FM1 / J4 | MC-1 `v1.0` (+ MC-9 `v1.0`) | ✅ | provisional (proxy); R1 unresolved |
| H-B2 / BM-6 / FM5 / M1–4 | MC-5 `v1.0` (+ MC-10 `v1.0`) | ✅ | provisional (shape); prevalence unresolved |
| H-F1 / BM-1 / BM-7 / P2 / FM2 / D2 / R2 | MC-2 `v1.0` | ✅ | unresolved; BM-7 INCOMPLETE |
| H-F2 / BM-3 / BM-4 / FM1 / FM3 / R7 | MC-3 `v1.0` | ✅ | unresolved; BM-3 INCOMPLETE |
| H-F3 / BM-5 / FM4 / R3 / RA5 / D3 | MC-4 `v1.0` | ✅ | H-F3-as-worded contradicted; FM4 present-bounded; R3 unresolved |
| BM-8 / R6 / signals | MC-6/7/8 `v1.0` | ✅ | unresolved (COLLECTION-GAP, INC-2) |
| DEC/RA/EX/BX/P3/P5/P6/D4 | MC-11 `v1.0` | ✅ | accepted (NON-MEASURED-SETTLED) |

**No contract changed, reinterpreted, or re-versioned; no v1.0 result rescored.**

## 3. Package self-check (acceptance bar)

| Requirement | Met? |
| --- | --- |
| Every material item + evidence link reconciled; zero unadjudicated evidence / unexplained omissions (OUT-2) | ✅ `03_…` §2 full inventory; `05_…` OC-1/2/3 + omission scan |
| Each evidence item adjudicated under its applicable frozen MC-* (rule never changed; no rule proved invalid) | ✅ `00_…` §2, `01_…` |
| Mutable statuses set: evidence status + decision status, contradiction/unresolved/proxy-replacement states distinct | ✅ `03_…` (dual columns), `04_…` |
| Evidence classes kept distinct; creator↔AI agreement not treated as external validity | ✅ stamped throughout; `00_…` §3, `05_…` §2 |
| Operational-log admissibility (PLA-1…3): least-privilege, allowlist, minimization, retention/deletion owner, payload-free; privacy-reject failures recorded (OUT-4) | ✅ `02_…` (all PASS, zero rejections, none manufactured) |
| No sensitive raw log content in any artifact | ✅ aggregates/metadata only; `02_…` §4, `05_…` |
| Open states handled honestly: INC-1 (BM-2), INC-5/CLASS-7-DEFERRED (BM-6 prevalence), retrospective n=1/not-pre-registered, over-validation consequence | ✅ `03_…` §5 |
| Proxy-replacement dry-run showing replace/revise with history preserved (≥1 accepted proxy) | ✅ `04_…` (MC-1 + MC-4) |
| Rule version recorded for every adjudication; stable identifiers; LINK-4 bound (OUT-7 automated-eval adjudicated) | ✅ §1/§2 |
| Orphan checks + adversarial unsupported-claims audit over own output | ✅ `05_…` (7/7 + clean) |
| High risks (R1–R5) non-downgradable, none SETTLED-as-closed (OC-7) | ✅ `03_…` §3 |
| Out-of-scope respected (no new evidence, no frozen-rule change, no model/suite redefinition, no final-package assembly) | ✅ |

## 4. Hand-off

NEU-907 (final consolidated product-decision package, `LINK-5`) consumes this bound `LINK-4` ledger together with the trace records and the resolved/open `INC-*`/`LINK-*` markers. The **headline adjudicated outcomes** it inherits:
- **accepted (settled at product altitude):** DEC1–5, EX1–6, BX1–5, P3/P5/P6, RA1–6 (MC-11 audit-settled) — RA5 reaffirmed.
- **provisional (directional/shape proxy, class-4↔class-3 only, not external validity):** H-B1/BM-2 retention direction; H-B2/BM-6 adherence *shape*; R2; R8; D-family positioning.
- **contradicted (literal wording only):** H-F3 ("shallow/wrong over-validated") — while FM4 is present-bounded on the INCOMPLETE archetype; reformulation flagged, routed to NEU-907.
- **unresolved (+ INC marker):** R1/BM-1/BM-4/transfer (INC-1); R6/BM-8/`averageQuality`/`time_spent_ms`/per-pattern-mastery (INC-2); R3/BM-5/FM4-reliability (INC-3); R4/D1-demand/R5-prevalence/M1–4 (INC-5).
- **INCOMPLETE (cap-bound):** BM-3/FM3/R7 (G1.2); BM-7 (G2.1).

**Every High risk (R1–R5) remains open and non-downgradable. No frozen rule was changed; no v1.0 result rescored; no metric/rate/threshold invented; no raw payload exposed.**
