# JNY-B2 — Observation Records (`OBS-*`)

**Task:** NEU-904 · **Journey:** JNY-B2 (Motivation & adherence under grind culture, boundary-respecting) · **Cell:** BM-6 · **Hypothesis:** H-B2 · **Contract:** MC-5 (frozen `v1.0`, `CLASS-7-DEFERRED` prevalence + `PROXY-DIRECTIONAL` failure-shape).

---

## Status: INCOMPLETE / pending-creator (both required runs)

JNY-B2's vehicle is a **paper / Wizard-of-Oz role-play in which the creator role-plays the grind-vs-review decision across a simulated week** (`../benchmark-suite/01_journey-vehicles-and-fidelity.md` JNY-B2). This is **class-3 `[dogfooding]`** by the human creator acting as a first-class learner. Per NEU-904's evidence-integrity rule, an agent **cannot** authentically role-play a rating-motivated learner's adherence choices as class-3 dogfooding, and **must not** fabricate or relabel such evidence. With the **creator AFK**, both required runs are carried as **`incomplete`** (`../benchmark-suite/04_ai-review-independence-protocol.md` §4; acceptance scenario 5) — **not** as coverage. No `OBS-*` fields are invented.

| `OBS-run-id` (reserved) | Target | Required vehicle & role | Varied dimension | Why INCOMPLETE / pending-creator |
| --- | --- | --- | --- | --- |
| `JNY-B2#R1` | BM-6 (rating-driven learner grinds volume, abandons spaced review; FM5 adherence-collapse *shape* + X3 documented-culture-vs-evidence conflict) | Paper/WoZ role-play across a simulated week; creator role = `learner`/`wizard`; adherence counters read from `FEAS-8` (`streakDays`, `dueToday`, `overdue`) per MC-5. | (run 1 baseline conditions) | Human creator AFK; class-3 role-play cannot be authentically produced by an agent (evidence-integrity rule). **Not fabricated.** |
| `JNY-B2#R2` | BM-6 repeat run | Same role-play, same held-constant conditions (`03_…` §2). | One controlled dimension varied (e.g., grind-pressure level), one at a time. | Same as above. |

## What the creator must observe when these runs are executed

So the pending runs are reproducible when the creator returns, the record shape is fixed here (no evidence pre-filled):
- Fill every `OBS-*` field (`03_…` §1); `OBS-prereq-position` must be **A3** (rating-driven learner) and **never A0/A4** (respects BX-1/BX-2).
- `OBS-failure-signal` for **FM5 / X3** = `present`/`absent`/`inconclusive`, grounded in the adherence counters — **failure *shape* only**.
- `OBS-boundary-check` must confirm the **EX3/BX-3 wall** (the wall most at risk in this journey): **no market / demand / preference / prevalence conclusion** may be drawn from n=1 (`R5` is High, non-downgradable, `G6.1`).
- `OBS-creator-conclusion` written **last and sealed** until both independent AI verdicts commit (`03_…` §3).

## Status carried

BM-6 remains **PROVISIONAL/Gap** (`G6.1`) with **no executed evidence** in this batch; prevalence stays **`CLASS-7-DEFERRED`** (`INC-5`, no in-program owner). R5 (High) untouched and non-downgradable. No status set here (NEU-906 owns adjudication via `LINK-4`). Creator runs listed in `05_…` §5.

---

## RESOLUTION via revised vehicle v1.1 (2026-07-12, appended)

The reserved role-play runs above (`JNY-B2#R1/R2`) describe the **v1.0 simulated-week role-play**, which the creator **explicitly declined**: *"I'm not gonna roleplay a week lol"* (verbatim, 2026-07-12). Per the append-only rule the rows above are **left intact and un-filled**; this section records their resolution by pointer.

- **Vehicle revision:** `06_vehicle-revision.md` §2 (v1.0 role-play → v1.1 retrospective aggregates + informal testimony), versioned and reviewable; breaches no NEU-900 routing-rule prohibition.
- **Revised-vehicle evidence:** `08_JNY-B2-BM6-retrospective-evidence.md` — class-3 `[dogfooding]` **RETROSPECTIVE** record `OBS-JNY-B2#RETRO-BM6` (Oct grind-heavy onboarding → Dec–Jan lapse → Mar review comeback → relapse; **266/271 overdue** review debt while recent months skew to new-learning) **and** the separately-labeled class-6 `[operational-log]` record `OPLOG-JNY-B2#BM6`.
- **Independent AI reviews:** `10_JNY-B2-BM6-ai-reviews.md` — 2 isolated reviewers (opus + sonnet), **unanimous `supports`** of the failure *shape*, both noting the "rating-motivated" cause is not directly measured and X3 is not independently substantiated.
- **Boundary re-asserted (EX3/BX-3):** **failure-*shape* only — no market / demand / preference / prevalence conclusion**; prevalence stays **`CLASS-7-DEFERRED` / `INC-5`**; **R5 (High) non-downgradable**; no status set here (NEU-906 via `LINK-4`).

The v1.1 vehicle is a lower-fidelity substitute (real behavioral aggregates in place of a controlled simulated week), not coverage of BM-6.
</content>
