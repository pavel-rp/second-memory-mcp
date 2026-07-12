# Orphan Checks & Adversarial Unsupported-Claims Audit (over this package's output)

**Task:** NEU-906 · **Compiled:** 2026-07-12 · **Check definitions:** `../traceability/00_…` §6 (`OC-1…7`).
Item 8 of the adjudication. §1 re-runs the orphan checks **over this adjudication's output** (every element/evidence/decision/exclusion must be reachable and no High risk downgraded). §2 is an **adversarial audit of my own statuses** — a hostile pass hunting for any claim stronger than its evidence, any invented value, any laundered class, any unexplained omission. An item failing any check is reported and **cannot count toward approval**.

---

## 1. Orphan checks over the adjudication (`OC-1…7`)

| Id | Check (applied to *this* package) | Result |
| --- | --- | --- |
| **OC-1** | Forward-orphan — every material element has an adjudicated status tied to ≥1 evidence item or a settled basis. | ✅ `03_…` §2 covers J1–4, M1–4, FM1–5, P1–6, D1–4, DEC1–5, RA1–6, EX1–6, BX1–5, R1–8, BM-1–8, signals, CAND-1…32. No element without a status. |
| **OC-2** | Reverse-orphan — every executed evidence item is consumed by an adjudication row. | ✅ `01_…` §7: BM-8, BM-2(`OBS`+`OPLOG`), BM-6(`OBS`+`OPLOG`), F1(`OBS`+`OPLOG`), F2(`OBS`+`OPLOG`), F3(class-5 `RUN-1/2/3` + 2× class-4). Zero executed items unadjudicated. |
| **OC-3** | Candidate-orphan — every CAND-1…32 adjudicated directly or by inheritance. | ✅ `03_…` §2.7 + `../traceability/01_…` §5 cross-map. None absent. |
| **OC-4** | Decision-orphan — every DEC/RA linked to basis + what it governs. | ✅ DEC1–5, RA1–6 adjudicated `accepted` (MC-11 NON-MEASURED-SETTLED) with reopen conditions retained; RA5 reaffirmed by MC-4 finding. |
| **OC-5** | Metric/invented-authority — every metric/signal ties to an element + a completeness state; **no UNRESOLVED metric carries a locally invented value**. | ✅ `averageQuality`/`time_spent_ms`/per-pattern-mastery = `COLLECTION-GAP`/UNRESOLVED (INC-2); **no threshold, rate, decay curve, interval rule, effect size, or over-validation rate invented**. The only quantity used (`quality ≥ 3` = pass) is quoted from frozen MC-4, not redefined. |
| **OC-6** | Exclusion-orphan — every EX/BX carries rationale + guarded boundary. | ✅ EX1–6, BX1–5 = `accepted`; EX3/BX-3 (no market/prevalence claim) actively enforced on BM-6/H-B2. |
| **OC-7** | Risk severity-floor — every High risk (R1–R5) present, material, non-downgradable, none SETTLED-as-closed. | ✅ `03_…` §3: R1/R3/R4 unresolved; R2/R5 provisional; **none downgraded**; the MC-4 over-validation finding **reinforces** R3, never closes it. |

**All seven orphan checks PASS over this package's output.**

## 2. Adversarial unsupported-claims audit (hostile self-review)

Each row is a way this adjudication could have over-claimed; the verdict states whether it did.

| Attack | Did the package commit it? |
| --- | --- |
| Treat two AI reviewers agreeing `supports` as validation of the hypothesis. | ❌ Avoided. Every empirical status stamps "class-4 agreement ≠ external validity"; no empirical element is `accepted`. |
| Upgrade a class-3/6 proxy to class-7 external/user/market validity. | ❌ Avoided. Classes kept distinct (`00_…` §3); `OBS`/`OPLOG` adjudicated separately; no class laundering. |
| Read the BM-2/BM-6 present-leaning direction as an effect size / prevalence. | ❌ Avoided. BM-2 = direction only (no effect size, G1.1); BM-6 = *shape* only (prevalence CLASS-7-ABSENT, INC-5). |
| Let the H-F3 `contradicted`-as-worded verdict downgrade FM4/BM-5/R3. | ❌ Avoided. `contradicted` scoped strictly to H-F3's literal wording; FM4/BM-5/R3 stay unresolved/reinforced, non-downgradable. |
| Infer an over-validation **rate** ("33% / 3-of-9") as a finding. | ❌ Avoided. Reported as **bounded presence** on the INCOMPLETE archetype, this grader/version only — no rate, no reliability (INC-3). |
| Invent a mastery threshold / decay curve / interval rule / revision trigger to "close" a gap. | ❌ Avoided (OC-5). All such artifacts remain UNRESOLVED with their INC marker; SUB-4 authority untouched. |
| Rewrite H-F3 / the model / the suite while "reformulating." | ❌ Avoided. Reformulation **flagged + routed to NEU-907**; no hypothesis/model/suite text changed. |
| Silently drop an INCOMPLETE (cap-bound) cell to tidy the register. | ❌ Avoided. BM-3 (G1.2), BM-7 (G2.1), FM3, R7 carried as INCOMPLETE/unresolved, never dropped. |
| Mark a frozen contract invalid to justify rescoring. | ❌ Avoided. All exercised MC-* held at v1.0; none marked `NON-ADJUDICABLE-FOR-CHANGED-RULE`; no v1.0 result rescored. |
| Quote a raw log payload for "provenance." | ❌ Avoided. `02_…` admits only aggregates/metadata; zero payload columns quoted; all `PLA-*` PASS, zero rejections manufactured. |
| Enact a future production flip in the dry-run. | ❌ Avoided. `04_…` sets no current status; both branches append-only, history preserved. |
| Re-query the DB / re-run a journey to "strengthen" evidence. | ❌ Avoided. Authorized snapshot not re-queried; no journey re-run (hard rule). |

**Forbidden-phrasing scan.** The strings "users want", "market validates", "experts confirm", "proven", "validated as", "effect size of", "reliability of X%", "prevalence of" appear in this package **only** inside prohibitions and this audit row — never as an asserted finding. ✅

**Unexplained-omission scan.** Every element with no executed evidence this stage (M1–4, R4, D1 demand, MC-6/7/8 signals, BM-3/BM-7) is explicitly adjudicated as a **hole** (`CLASS-7-ABSENT`/`COLLECTION-GAP`/`INCOMPLETE`) with its INC marker and owner — none is silently omitted. ✅

## 3. Audit verdict

- **Orphan checks:** 7/7 PASS.
- **Adversarial audit:** 0 unsupported claims; 0 invented values; 0 class launderings; 0 unexplained omissions; 0 High-risk downgrades; 0 rule invalidations; 0 payload exposures.
- **Acceptance bar (zero unadjudicated evidence or unexplained omissions):** met.
