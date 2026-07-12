# Completeness States, Incomplete Markers & Deferred Link Slots

**Task:** NEU-899 · **Compiled:** 2026-07-11 · **Sole inputs:** NEU-898 (`../product-model/`) + NEU-897 (`../`).
This file is the completeness surface. §1 assigns every material element a state from the 4-value lattice (`00_…` §4), derived mechanically (`00_…` §5). §2 defines the `INC-*` markers that represent **missing downstream authoritative artifacts** — the acceptance-scenario-3 requirement that such items be *reported as incomplete, not populated with a locally invented value*. §3 defines the `LINK-*` deferred slots so later sub-tasks can bind their authoritative artifacts without their content being defined here. **This task does not adjudicate mutable STATUS (NEU-906) or define any metric/threshold/decision-rule (SUB-4).**

---

## 1. Completeness-state register

State ∈ {SETTLED, PROVISIONAL, INCOMPLETE, UNRESOLVED}. Each cell cites the NEU-898 line the state is derived from, so the derivation is reproducible.

### 1.1 SETTLED (product-foundation decisions this tier owns; no open gap gates them)

| Elements | Basis (NEU-898) |
| --- | --- |
| DEC1–DEC5 | `01_…` §5 "decisions this task is entitled to make"; `04_…` §3 "Settled at product altitude". |
| EX1–EX6 | `01_…` §3 charter-fixed scope walls. |
| BX-1–BX-5 | `03_…` §4 exclusion-boundary walls. |
| P3, P5, P6 | Discipline/privacy decisions (DEC2/DEC3 + OUT-4 gate). |
| RA1–RA6 | `01_…` §6 rejected-and-recorded (rejection is settled; each names its reopen condition). |
| Prerequisite boundary; feature-wide materiality rule | `00_…` §1; `02_…` §1 (DEC5). |
| CAND-16, CAND-29, CAND-30, CAND-32 (as provenance) | `02_…` §2 (privacy, discipline, caps, provenance). |

*Note:* SETTLED means settled **at this altitude**, not "evidence-closed". P4 is a settled discipline (*verify per signal*) whose per-signal feasibility is separately UNRESOLVED (INC-2); RA-rejections are settled while their reopen conditions remain class-7.

### 1.2 PROVISIONAL (class-1–6 evidence insufficient / class-7-dependent)

| Elements | Gap/conflict keeping them provisional (NEU-898) |
| --- | --- |
| J1–J4 | Weighting/ranking class-7 (G6.1); J2 also G2.2. |
| M1–M4 | Motivation distribution reserved for class-7 (RQ6 §class-7). |
| FM1, FM2, FM5 | G3.1/G6.1 (dominance), X2/G2.1 (expertise reversal), G6.1 (adherence). |
| P1, P2 | G1.1 (effect size), G2.3 (interaction). |
| D1–D4 | DEC4: all differentiators provisional; class-7 demand/preference + G2.3 + capability-only. |
| R2, R5, R8 | X1/G2.3; G6.1; capability-only. R2/R5 **High → non-downgradable** (G-a). |
| BM-1, BM-2, BM-4, BM-6, BM-7 | G1.1, G2.3, X3/G6.1, G2.1. |
| CAND-1/2/4/5/6/8/9/22/23/24/25/26/31 | Inherited from the elements above (`01_…` §5). |

### 1.3 INCOMPLETE (materially needed, cap-bound; EX5 bars closing here)

| Elements | Cap-bound gap (NEU-898) |
| --- | --- |
| FM3, R7, BM-3, CAND-7 | G1.2 hierarchical spacing schedule — not answerable within NEU-897 caps. |
| BM-7 (expertise-reversal slice), CAND-5 | G2.1 — cap-bound boundary. |
| CAND-27 | G6.1 direct jobs/motivations study — cap-bound. |

### 1.4 UNRESOLVED (depends on a missing downstream authoritative artifact — see §2)

| Elements | Missing artifact | Marker |
| --- | --- | --- |
| R1; BM-1/2/4 transfer claim; P1 effect size | DP-domain product-side transfer/retention benchmark evidence | **INC-1** |
| R6; BM-8; CAND-15/17/18; the `averageQuality`, `time_spent_ms`, per-pattern-mastery signals; any threshold/decision-rule/revision-trigger | Validated measurement contract + decision rules | **INC-2** |
| R3; FM4/BM-5 reliability; RA5 reopen condition | DP-domain AI-grading reliability (automated-eval) | **INC-3** |
| Any provisional element's future promotion/demotion; production replacement signals | Revision rules + production replacement signals | **INC-4** |
| R4; D1 demand; R5 adherence prevalence; M-weighting | Class-7 real-user/market/adherence evidence | **INC-5** |

## 2. Incomplete-state markers (`INC-*`) — missing downstream artifacts

Each marker is an **explicit hole**, not a value. Per acceptance scenario 3 and constraints, the traceability audit (`04_…` OC-5) treats any attempt to fill these here with a locally invented metric, threshold, decision rule, or revision trigger as a **failure**. Each marker names the owner authorized to supply the artifact and the `LINK-*` slot that will carry it.

| Marker | Missing authoritative artifact | Owner (sole authority) | Elements held UNRESOLVED | Fills slot |
| --- | --- | --- | --- | --- |
| **INC-1** | Benchmark evidence that retrieval+spacing / schema-building actually move DP problem-solving skill in-domain. | NEU-900 (bounded benchmark suite + review protocol); adjudicated by NEU-906. | R1, P1 (effect size), BM-1/2/4 | LINK-1 |
| **INC-2** | Validated **measurement contract** — which signals are computable, how, with what thresholds/decision-rules — for `averageQuality`, `time_spent_ms`, and a per-DP-pattern mastery signal. | **SUB-4 (measurement-contracts task)** — sole authority for validated measurement contracts and revision rules. | R6, BM-8, CAND-15/17/18, P4 (per-signal feasibility) | LINK-2 → **BOUND** `../measurement-contracts/` (NEU-901: MC-6/MC-7/MC-8 + feasibility `FEAS-*`). Contract exists; the signal *values* stay uncollectible and elements' mutable STATUS stays for NEU-906. |
| **INC-3** | DP-domain **AI-grading reliability** bound from an automated-evaluation protocol. | OUT-7 automated-eval (NEU-900+); adjudicated by NEU-906. | R3, FM4/BM-5 reliability, RA5 reopen | LINK-3 |
| **INC-4** | **Revision rules & production replacement signals** — the triggers that would promote/demote a provisional element when real-usage/production evidence arrives. | SUB-4 (revision rules); applied by NEU-906. | promotion/demotion of every PROVISIONAL element | LINK-2 → **BOUND** `../measurement-contracts/` (NEU-901: `PRX-1…PRX-8` revision/confirmation triggers + dry-run). Triggers *fire* on future production evidence; NEU-906 enacts any status flip via LINK-4. |
| **INC-5** | **Class-7 evidence** (real-user / market / adherence) that no artifact in this program stage supplies. | No current owner — class-7 does not exist yet (EX3); a future real-user program only. | R4, R5, D1 demand, M1–M4 weighting | LINK-5 (when a class-7 source exists) |

**Discipline note.** INC-1/INC-3 are *benchmark/automated-eval* holes; INC-2/INC-4 are *measurement-contract/decision-rule* holes owned exclusively by SUB-4; INC-5 is a *class-7* hole with no in-program owner. Keeping them distinct prevents a downstream reader from mistaking benchmark execution (NEU-900) for measurement-contract authority (SUB-4) or for class-7 validation that does not exist.

## 3. Deferred authoritative-artifact link slots (`LINK-*`) — currently UNBOUND

These are empty binding points. This task defines **no content** for them; it only reserves the address so a later sub-task can attach its authoritative artifact and thereby resolve the corresponding `INC-*` without renumbering anything here (in-scope: "allow authoritative artifacts from later sub-tasks to be linked without defining their content here").

| Slot | Will hold | Owner | Binds / resolves | Current binding |
| --- | --- | --- | --- | --- |
| **LINK-1** | The bounded benchmark suite + journey selection + results. | NEU-900 | INC-1; BM-* journey-suite selection (deferred from NEU-898 `03_…`) | **PARTIALLY BOUND** → `../benchmark-suite/` (NEU-900: journey selection `JNY-B1/B2/F1/F2/F3` + batch allocation + creator/AI review protocol). Results pending NEU-904/905; INC-1 stays UNRESOLVED until NEU-906 adjudicates via LINK-4. **NEU-904 baseline results (partial):** `../baseline-batch/` — JNY-B1 BM-8 measurement-feasibility inspection EXECUTED (class-2 code-evidence; 2 independent AI reviews, unanimous `supports`, `INC-2` still UNRESOLVED); JNY-B1 BM-2 retention + JNY-B2 BM-6 motivation runs INCOMPLETE/pending-creator; failure-batch results + adjudication still pending. **NEU-904 revised-vehicle results (2026-07-12, additive):** JNY-B1 BM-2 + JNY-B2 BM-6 subsequently EXECUTED at lower fidelity under vehicle revision v1.1 (`../baseline-batch/06_…`) — class-3 RETROSPECTIVE + class-6 operational-log evidence (separate records; `07_…`/`08_…`), 2 isolated AI reviews each (opus + sonnet), unanimous `supports` with caveats preserved (`09_…`/`10_…`). Fidelity downgrade, not coverage: `INC-1` (BM-2) and `INC-5`/`CLASS-7-DEFERRED` (BM-6 prevalence) stay UNRESOLVED, R5 (High) non-downgradable, EX3/BX-3 enforced; adjudication pending NEU-906 via LINK-4. **NEU-905 failure results (2026-07-12, additive):** `../failure-batch/` — JNY-F1 (BM-1/BM-7) + JNY-F2 (BM-3/BM-4) EXECUTED under vehicle revision v1.1 (`../failure-batch/01_…`), class-3 RETROSPECTIVE + class-6 operational-log (separate records; `02_…`/`04_…`), 2 isolated AI reviews each (opus + sonnet). Both journeys carried **`incomplete`** (unanimous `insufficient-evidence`): BM-1 transfer not isolable (no probe), BM-7 reversal not exercisable (n=1, G2.1), BM-4 decay *shape* pooled-not-per-pattern, BM-3 optimum not derivable (G1.2). `INC-1` (BM-1/BM-4) stays UNRESOLVED; BM-3/BM-7 stay cap-bound INCOMPLETE; R1/R7 (High) non-downgradable; EX3/BX-3 enforced; adjudication pending NEU-906 via LINK-4. (JNY-F3 results bind via LINK-3.) |
| **LINK-2** | The validated measurement contract + thresholds + revision rules. | SUB-4 | INC-2, INC-4 | **BOUND** → `../measurement-contracts/` (NEU-901: frozen register `MC-1…MC-11` v1.0, mapping gate `GATE-STATE = PASS`, proxy-replacement `PRX-*`, OUT-4 privacy gate `PLA-*`). Contract artifact bound; mutable STATUS of governed elements remains NEU-906 via LINK-4. |
| **LINK-3** | The automated-eval reliability protocol + DP-domain results. | OUT-7 (NEU-902 protocol) → NEU-903 (results) | INC-3 | **PARTIALLY BOUND** → `../automated-evaluation/` (NEU-902: automation classification `ACL-1…10`, automatable protocol `AEP-1` (H-F3/MC-4), case set `ACS-1 v1.0`, clean-context-repeat spec `CCR-1…7`). **NEU-903 results (bound):** `../autoeval-batch/` — `AEP-1`/`ACS-1 v1.0` EXECUTED across 3 isolated clean-context runs (`RUN-1/2/3`, all 7 `CCR-*` fields each); raw over-validation flags `{ACS-1-03, ACS-1-07, ACS-1-11}` (INCOMPLETE cases, stable across repeats), 6 SHALLOW/WRONG not over-validated, 3 CONTROLs correctly passed; class-5 `[automated-eval]`, payload-free, no mutable status set. INC-3 stays UNRESOLVED until NEU-906 adjudicates R3/FM4/BM-5 via LINK-4. **NEU-905 JNY-F3 journey binding (2026-07-12, additive):** `../failure-batch/06_…`+`07_…` — the NEU-903 over-validation evidence is bound (not re-run) as JNY-F3's journey evidence, plus a **class-4 `[ai-critique]`** review layer (2 isolated AI reviews, opus + sonnet). Raw signal: **unanimous `contradicts` of H-F3 as literally worded** — SHALLOW/WRONG answers were correctly failed; the real FM4 over-validation lands on the milder INCOMPLETE archetype. Settled result stays UNRESOLVED (`INC-3`); R3 (High) non-downgradable; reliability *rate* not established; adjudication (incl. any hypothesis reformulation) pending NEU-906 via LINK-4. |
| **LINK-4** | The evidence/decision STATUS adjudication ledger (mutable status authority). | NEU-906 | Promotion/demotion of PROVISIONAL/UNRESOLVED elements under frozen rules | **BOUND** → `../adjudication/` (NEU-906): every executed evidence item (BM-2/BM-6/BM-8/JNY-F1/F2/F3) adjudicated under its frozen `MC-* v1.0` rule (`../adjudication/01_…`); class-6 log items admitted via the `PLA-1…3` gate (`../adjudication/02_…`, all PASS); mutable evidence + decision status set over the full inventory (`../adjudication/03_…`); proxy-replacement dry-run with history preserved (`../adjudication/04_…`); orphan checks 7/7 + adversarial audit clean (`../adjudication/05_…`). **Headline:** H-F3-as-worded `contradicted` (shallow/wrong correctly failed) while FM4 over-validation present-bounded on the INCOMPLETE archetype; BM-2 retention + BM-6 adherence *shape* `provisional` (class-4↔class-3 agreement is not external validity); R1/R3/R4/R5 remain UNRESOLVED/provisional and **non-downgradable**; MC-11 settled set `accepted`. No `INC-*` resolved (all remain explicit holes with named owners); no frozen rule changed; no `v1.0` result rescored; no metric/rate/threshold invented; no raw payload exposed. |
| **LINK-5** | The consolidated, prompt-ready product-decision package. | NEU-907 | Consumes all trace records + resolved INC/LINK | **UNBOUND** |

**Binding protocol (for downstream siblings).** To bind a slot: attach the artifact's identifier to the `LINK-*` row, change the resolved `INC-*` markers' state from *open* to *bound → <artifact id>*, and record the new completeness state on the affected `TR-*` records — **without** editing their evidence class, limitation, or element id. Mutable STATUS changes (e.g. promoting R1 from UNRESOLVED once INC-1 is bound) are enacted only by NEU-906 via LINK-4; NEU-899 fixes the structure, not the adjudicated status.
