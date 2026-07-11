# Journey Records — Hypothesis, Vehicle & Fidelity Boundary

**Task:** NEU-900 · **Compiled:** 2026-07-11 · **Sole inputs:** NEU-898 (`../product-model/`) + NEU-899 (`../traceability/`) + NEU-897 (`../`).
One record per selected journey (acceptance scenario 2). Each names the **smallest sufficient vehicle** — an existing Second Memory MCP workflow (see `src/shared/instructions.ts`), a paper / Wizard-of-Oz artifact, or (last resort, ≤1 across the suite) a targeted prototype — with its **fidelity boundary** and the provisional/incomplete/unresolved status it inherits. **No journey is executed here.**

**Vehicle-selection ladder (smallest sufficient first).** (1) An existing MCP flow that already exercises the cell's real product behavior is preferred — it is the highest fidelity because it *is* the product path. (2) A paper / Wizard-of-Oz artifact is used only when real time or population cannot be compressed into a session (multi-month decay, adherence-over-weeks, population distribution). (3) A targeted prototype is the last resort, permitted **once**, only in `BATCH-FAILURE`, only when (1) and (2) cannot isolate the failure — with a written why-insufficient rationale (`02_…` §3). Existing MCP flows are **candidate vehicles, not the product experience** (CAND-31); a research vehicle is never treated as a product commitment (EX4/BX-4).

---

## JNY-B1 — Spaced-retention baseline + measurement feasibility

- **Cells:** BM-2 (spaced retrieval must hold a learned DP pattern over weeks), BM-8 (a per-DP-pattern mastery signal is wanted but not computed today).
- **Batch:** `BATCH-BASELINE` (→ NEU-904).
- **Hypothesis (H-B1):** For an in-audience learner (A1, B4), retrieval practice + spacing hold a newly learned DP pattern across ≥2 spaced re-reviews (BM-2, P1/FM1); and the signals the schema already captures (`pass/fail`, derived `quality`, `time_spent_ms`; the declared-but-uncomputed `averageQuality`) are **inspected for sufficiency** to score a per-DP-pattern mastery signal (BM-8, R6) — sufficiency is *observed*, not *decided* here.
- **Vehicle (existing MCP, smallest sufficient):** the TEACHING FLOW / rolling-session loop (`start_learning` → `submit_answer` → `teach_next`, or `create_session(learning)` for manual chunk control) over a single DP-pattern topic, repeated across the spaced interval read from `interval_days` (never hardcoded); plus a **static schema/code inspection** of which signals are persisted vs computed for the BM-8 half.
- **Fidelity boundary:** single creator (n=1), a **weeks-not-months** observation window — the retention claim is directional, not an effect size (G1.1, PROVISIONAL; `INC-1` UNRESOLVED). The BM-8 half is *capability inspection only*: whether a signal is computable ≠ whether it is a **validated** mastery signal — that is a measurement contract owned by **SUB-4** (`INC-2`, UNRESOLVED); NEU-900 must not invent a threshold or decision rule (NEU-899 `OC-5`). Class-3 dogfooding, never class-7.
- **Status inherited:** BM-2 PROVISIONAL (G1.1); BM-8 PROVISIONAL → UNRESOLVED via `INC-2`.

## JNY-B2 — Motivation & adherence under grind culture (boundary-respecting)

- **Cells:** BM-6 (a rating-driven learner grinds volume and abandons spaced review; documented culture diverges from evidence practice).
- **Batch:** `BATCH-BASELINE` (→ NEU-904). *Classified baseline because its primary axis is learner **motivation** (B1 rating / M1) and adherence — the "motivation" journey the baseline batch is scoped to hold — even though it exercises FM5 and X3, which it carries as the failure/conflict it touches.*
- **Hypothesis (H-B2):** A rating-motivated learner (A3, B1) tends to prioritize contest-volume grinding over scheduled review, exhibiting the adherence-collapse failure (FM5) and the documented-culture-vs-evidence-practice conflict (X3).
- **Vehicle (paper / Wizard-of-Oz, smallest sufficient):** a documented rating-driven-learner scenario in which the creator role-plays the grind-vs-review decision across a simulated week; existing MCP is **not** sufficient because adherence-over-time and its *prevalence* cannot be dogfooded into existence — they are class-7 questions (RQ6 §class-7). No prototype (a prototype cannot manufacture population adherence either).
- **Fidelity boundary:** a single creator **cannot** represent a population adherence distribution — the journey probes the failure *shape*, not its *prevalence* (R5 High, non-downgradable, G6.1 — the cell stays a Gap). **No market/demand/preference conclusion may be drawn** (EX3/BX-3); this is the wall most at risk in this journey. Class-3 dogfooding of a role-play, never class-7.
- **Status inherited:** BM-6 PROVISIONAL/Gap (G6.1); R5 non-downgradable.

## JNY-F1 — Schema formation vs surface memorization; expertise-reversal boundary

- **Cells:** BM-1 (first DP pattern; risk of memorizing the surface solution instead of a transferable schema — FM2 + X1), BM-7 (already-competent learner studies worked examples for a harder pattern; possible expertise reversal — FM2 under X2).
- **Batch:** `BATCH-FAILURE` (→ NEU-905).
- **Hypothesis (H-F1):** Subgoal-labeled worked examples + schema-formation pedagogy (P2/CAND-4) produce a *transferable* schema for the first DP pattern (BM-1) — testing transfer, not recall (X1) — but the worked-example benefit **may reverse** for the already-competent learner on a harder pattern (BM-7, X2 expertise reversal).
- **Vehicle (existing MCP, smallest sufficient):** CONTENT CREATION (`create_topic_with_chunks` with a subgoal-labeled worked-example DP chunk) → TEACHING FLOW, run at **two fixed prerequisite positions** — A1 first-pattern (BM-1) and A2 harder-pattern-for-a-competent-learner (BM-7) — with a Level-2/3 transfer probe (a *novel* instance of the pattern) to distinguish schema transfer from surface recall. Prerequisite position is fixed A1/A2 and never A0 (respects BX-1).
- **Fidelity boundary:** with n=1 the creator can only approximate two distinct prerequisite trajectories — A1 vs A2 separation is weak (the same person cannot un-know a pattern). Transfer is measured by a **proxy probe**, not a validated transfer instrument (`INC-1` UNRESOLVED; the instrument is not designed here). The expertise-reversal boundary is **cap-bound INCOMPLETE** (G2.1) — the journey can *surface* it but cannot resolve it (EX5). X1 (retention ≠ transfer) is preserved, not adjudicated. Class-3 dogfooding.
- **Status inherited:** BM-1 PROVISIONAL (G1.1, G2.3); BM-7 PROVISIONAL/INCOMPLETE (G2.1).

## JNY-F2 — Long-horizon decay/relapse & hierarchical scheduling

- **Cells:** BM-3 (consolidating multiple interdependent patterns; review scheduling for hierarchical multi-month dependencies is uncertain — FM3), BM-4 (after a long gap a previously mastered pattern has decayed; relapse / re-learning — FM1 + X1).
- **Batch:** `BATCH-FAILURE` (→ NEU-905).
- **Hypothesis (H-F2):** After a long gap a mastered pattern decays and requires re-learning (FM1/BM-4); and scheduling review for hierarchical, multi-month DP dependencies is *uncertain* — the product cannot assume a correct schedule (FM3/BM-3).
- **Vehicle (paper / Wizard-of-Oz, smallest sufficient):** a paper timeline the creator constructs — a decayed-pattern relapse scenario (BM-4) and a multi-pattern dependency review schedule (BM-3). Existing MCP is **not** sufficient because a multi-month decay curve and a multi-month schedule cannot be compressed into a dogfooding session; a prototype would not help either (it cannot fast-forward real forgetting).
- **Fidelity boundary:** a paper simulation **cannot** produce real decay curves — it is time-compressed and illustrative, not measured (G1.1 effect size remains PROVISIONAL). BM-3's *optimal hierarchical schedule* is **cap-bound INCOMPLETE** (G1.2) — the journey documents the uncertainty and its downstream owner; it does **not** start new scheduling research (EX5) and invents no interval rule (`INC-2`, SUB-4). Class-3 (paper artifact), never class-7.
- **Status inherited:** BM-4 PROVISIONAL (G1.1); BM-3 INCOMPLETE (G1.2) — a journey that *legitimately cannot fully answer its cell*, carried as an incomplete result (`04_…` incomplete-status handling).

## JNY-F3 — AI grading over-validation / false confidence

- **Cells:** BM-5 (the learner submits a wrong/shallow answer that AI grading over-validates, producing false confidence — FM4 + X4).
- **Batch:** `BATCH-FAILURE` (→ NEU-905).
- **Hypothesis (H-F3):** The server-derived grading over-validates a deliberately shallow or wrong DP answer, producing false confidence (FM4), consistent with the AI-judge-transfer conflict (X4).
- **Vehicle (existing MCP, smallest sufficient):** the real `submit_answer` grading path — the creator submits **adversarial shallow/wrong DP solutions** and observes whether the server-derived `quality` over-validates (the response's derived quality and `action` are read from the response, never fabricated — per the server's never-fabricate-scores rule). Dogfooding the real grading path is the **highest-fidelity** vehicle for FM4 because the failure lives in that exact path.
- **Fidelity boundary:** single creator, a few adversarial items — this **bounds** evidence classes 4–5 for the specific items; it does **not** establish DP-domain AI-grading **reliability** (G5.1), which is an automated-evaluation artifact owned by **OUT-7** (`INC-3`, UNRESOLVED; adjudicated by NEU-906). RA5 is retained: AI grading is **not** trusted as the signal of record. Class-3 dogfooding of a class-4 grader — never class-7.
- **Prototype reservation:** the single permissible targeted prototype is **reserved to this journey** and **UNUSED at selection exit** (`02_…` §3). It would be authorized only if, during NEU-905 execution, the existing `submit_answer` vehicle cannot isolate FM4 from confounds (e.g., cannot hold the grader prompt/context fixed enough to attribute over-validation) — at which point a **minimal grading-harness** that exposes only the quality-derivation step may be built, with the why-existing-MCP-insufficient rationale recorded then. It may create **no** UI, architecture, provider, or production commitment (EX4).
- **Status inherited:** BM-5 PROVISIONAL (G5.1) → UNRESOLVED via `INC-3`.

---

## Vehicle & fidelity summary

| Journey | Vehicle | Existing-MCP flow / artifact | Prototype | Dominant fidelity limitation |
| --- | --- | --- | --- | --- |
| JNY-B1 | Existing MCP + schema inspection | Teaching/rolling-session loop; static signal inspection | No | n=1, weeks-not-months; BM-8 is capability-only (`INC-2`) |
| JNY-B2 | Paper / Wizard-of-Oz | Role-played rating-learner scenario | No | n=1 cannot show prevalence; no market claim (EX3) |
| JNY-F1 | Existing MCP | Content-creation → teaching + transfer probe | No | n=1 weak A1/A2 separation; proxy transfer (`INC-1`); G2.1 INCOMPLETE |
| JNY-F2 | Paper / Wizard-of-Oz | Paper decay + hierarchical-schedule timeline | No | Time-compressed, illustrative; BM-3 INCOMPLETE (G1.2) |
| JNY-F3 | Existing MCP (`submit_answer`) | Adversarial-answer grading path | No (1 reserved) | n=1; bounds not reliability (`INC-3`); RA5 retained |

**Suite prototype count = 0 (≤ 1 ✔).** Every fidelity limitation ties to an existing NEU-897/898/899 gap or `INC-*` marker; NEU-900 introduces no new unbacked claim and upgrades no status.
