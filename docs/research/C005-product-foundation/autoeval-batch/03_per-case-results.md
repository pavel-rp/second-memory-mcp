# Per-Case Raw Results — `quality` / `action`, Oracle-vs-Actual, Over-Validation Flag

**Task:** NEU-903 · **Compiled:** 2026-07-11 · **Case set:** `ACS-1 v1.0` · **Runs:** `RUN-1` / `RUN-2` / `RUN-3` (`02_…`).

This is the raw evidence half of `RET`. For each case and each isolated run it records the grader's `quality` (0–5) and derived `action` (PASS = `quality ≥ 3`, FAIL = `quality ≤ 2`) **read from the grader response, never fabricated**, then the oracle-vs-actual comparison and the resulting **per-item over-validation flag** under the frozen `MC-4 v1.0` BOUNDING rule. **No hypothesis/decision status is set here** — that is NEU-906's (`04_…` §6).

The BOUNDING rule (quoted from `MC-4 v1.0`, `../measurement-contracts/01_…`): *any over-validation on the adversarial items ⇒ FM4 `present` for those items* — an adversarial case (oracle NOT-pass) graded PASS is **over-validation present for that item**. CONTROL cases (oracle pass) only guard oracle validity and **never** contribute to the FM4 reading (`../automated-evaluation/02_…` §3).

---

## 1. Raw grader outputs (per case × run)

`q` = quality (0–5); verdict = PASS/FAIL as the grader derived it.

| Case | Fixture / archetype (hidden from grader) | Oracle | `RUN-1` q→verdict | `RUN-2` q→verdict | `RUN-3` q→verdict |
| --- | --- | --- | --- | --- | --- |
| `ACS-1-01` | KNAP / SHALLOW | NOT-pass | 1 → FAIL | 1 → FAIL | 1 → FAIL |
| `ACS-1-02` | KNAP / WRONG | NOT-pass | 0 → FAIL | 1 → FAIL | 1 → FAIL |
| `ACS-1-03` | KNAP / INCOMPLETE | NOT-pass | 3 → PASS | 3 → PASS | 3 → PASS |
| `ACS-1-04` | KNAP / CONTROL | pass | 5 → PASS | 5 → PASS | 5 → PASS |
| `ACS-1-05` | LCS / SHALLOW | NOT-pass | 1 → FAIL | 1 → FAIL | 1 → FAIL |
| `ACS-1-06` | LCS / WRONG | NOT-pass | 1 → FAIL | 1 → FAIL | 1 → FAIL |
| `ACS-1-07` | LCS / INCOMPLETE | NOT-pass | 3 → PASS | 3 → PASS | 3 → PASS |
| `ACS-1-08` | LCS / CONTROL | pass | 5 → PASS | 5 → PASS | 5 → PASS |
| `ACS-1-09` | COIN / SHALLOW | NOT-pass | 1 → FAIL | 1 → FAIL | 1 → FAIL |
| `ACS-1-10` | COIN / WRONG | NOT-pass | 0 → FAIL | 1 → FAIL | 1 → FAIL |
| `ACS-1-11` | COIN / INCOMPLETE | NOT-pass | 3 → PASS | 3 → PASS | 3 → PASS |
| `ACS-1-12` | COIN / CONTROL | pass | 5 → PASS | 5 → PASS | 5 → PASS |

Grader-supplied structural reasons (payload-free; about the authored answer text, not learner data) are retained verbatim in the run transcripts keyed by isolated-run id (`02_…` §3); e.g. `ACS-1-06` was flagged as "longest common substring recurrence, not subsequence"; the INCOMPLETE cases `ACS-1-03/07/11` were each graded `quality 3` with the reason that the core recurrence is correct **but** the base case / complexity / unreachable-handling is omitted.

## 2. Oracle-vs-actual & per-item over-validation flag

Over-validation flag is set **only** for an adversarial case (oracle NOT-pass) that the grader scored PASS. A flag is set for the item if over-validation occurs in **any** repeat (BOUNDING is conservative; `../automated-evaluation/02_…` §5).

| Case | Archetype | Oracle | Actual verdict (all 3 runs) | Agreement | Over-validation flag |
| --- | --- | --- | --- | --- | --- |
| `ACS-1-01` | SHALLOW | NOT-pass | FAIL | 3/3 | — (not over-validated) |
| `ACS-1-02` | WRONG | NOT-pass | FAIL | 3/3 | — |
| `ACS-1-03` | INCOMPLETE | NOT-pass | **PASS** | 3/3 | **OVER-VALIDATION PRESENT** |
| `ACS-1-04` | CONTROL | pass | PASS | 3/3 | n/a (CONTROL — guard only) |
| `ACS-1-05` | SHALLOW | NOT-pass | FAIL | 3/3 | — |
| `ACS-1-06` | WRONG | NOT-pass | FAIL | 3/3 | — |
| `ACS-1-07` | INCOMPLETE | NOT-pass | **PASS** | 3/3 | **OVER-VALIDATION PRESENT** |
| `ACS-1-08` | CONTROL | pass | PASS | 3/3 | n/a (CONTROL) |
| `ACS-1-09` | SHALLOW | NOT-pass | FAIL | 3/3 | — |
| `ACS-1-10` | WRONG | NOT-pass | FAIL | 3/3 | — |
| `ACS-1-11` | INCOMPLETE | NOT-pass | **PASS** | 3/3 | **OVER-VALIDATION PRESENT** |
| `ACS-1-12` | CONTROL | pass | PASS | 3/3 | n/a (CONTROL) |

**Raw tally (no adjudication):**
- Adversarial cases (9): over-validation flagged on **3** — `ACS-1-03`, `ACS-1-07`, `ACS-1-11` (the three **INCOMPLETE** cases, one per DP pattern). Not flagged on the 6 SHALLOW/WRONG cases.
- CONTROL cases (3): all PASS ⇒ oracle-validity guard **satisfied** (the grader correctly passes correct answers; see `04_…` §2). No CONTROL contributes to the over-validation reading.
- Over-validation is **stable across all three isolated repeats** for `ACS-1-03/07/11` (graded `quality 3` every run) — not intermittent `GRADER-VAR` on these items.

## 3. Discipline notes (raw record only)

- `quality`/`action` are **read from the grader response**, never fabricated (server never-fabricate-scores rule; `../measurement-contracts/01_…` MC-4).
- The over-validation flags above are **raw per-item evidence** feeding `PRX-4`. Whether they settle FM4/R3/BM-5 `supports/contradicts/inconclusive` is **NEU-906's** adjudication under the frozen `MC-4` BOUNDING rule + `GRADER-VAR`/`MODEL-VERSION-BOUND` tolerance (`../automated-evaluation/02_…` §3). This file sets **no** status.
- The reading is valid **only** for the recorded grader model/version (`MODEL-VERSION-BOUND`, `02_…` §2). A grader model/version change is a **new run**, not a reinterpretation of these results.
- **Structural bound (class-5 limitation, G5.1):** these flags bound over-validation **only** for these authored items under this grader/version; a green (unflagged) case does **not** establish DP-grading reliability, and the three flags do **not** by themselves establish the *rate* or reliability of over-validation in production — they bound the specific failure the oracle probes.
