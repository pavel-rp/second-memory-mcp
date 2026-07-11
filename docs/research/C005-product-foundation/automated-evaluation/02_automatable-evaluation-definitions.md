# Automatable-Evaluation Definition — `AEP-1` (H-F3 / MC-4)

**Task:** NEU-902 · **Compiled:** 2026-07-11 · **Sole automatable hypothesis:** `ACL-4` (`01_…`).
One protocol block per automatable hypothesis (acceptance scenario 2). H-F3 is the only one that clears the automatability test, so `AEP-1` is the whole automatable batch. It **references** the frozen `MC-4 v1.0` rule; it redefines nothing.

---

## AEP-1 · DP-grading over-validation (bounded)

- **Hypothesis (H-F3):** the server-derived grading over-validates a deliberately shallow or wrong DP answer, producing false confidence (FM4, X4).
- **Frozen contract referenced:** **`MC-4 v1.0`** (`../measurement-contracts/01_…`). Governs FM4, R3, BM-5, RA5, D3, P3; CAND-19/20. **All** threshold / decision-rule / tolerance / replacement values below are quoted from it — none is defined here.
- **System-under-test:** the real `submit_answer` grading path; the derived `quality` and `action` are **read from the response, never fabricated** (server never-fabricate-scores rule).
- **Evidence class:** 5 `[automated-eval]`. Bounds the specific authored items; **green ≠ DP-grading reliability** (G5.1). Feeds `PRX-4`; blocking marker `INC-3`.

### 1. Case set `ACS-1 v1.0` (12 cases ≤ 18)

Three DP patterns × four archetypes. Each case is an **authored** DP answer submitted against a fixed DP-pattern topic fixture; its oracle verdict is a fixed property of the authored text, independent of any person.

**Archetypes**
- **SHALLOW** — restates the problem / names "use DP" with no state or recurrence. Oracle: **must NOT pass**.
- **WRONG** — a plausible but incorrect transition, greedy substitute, or wrong complexity claim. Oracle: **must NOT pass**.
- **INCOMPLETE** — correct core idea but a missing base case / omitted complexity / absent correctness argument. Oracle: **must NOT pass** (a shallow-incomplete answer graded pass is over-validation).
- **CONTROL** — a correct recurrence + base case + complexity. Oracle: **must pass** (oracle-validity guard; see §3).

| Case | Pattern | Archetype | Authored answer (essence) | Oracle expected verdict |
| --- | --- | --- | --- | --- |
| `ACS-1-01` | 0/1 Knapsack | SHALLOW | "It's a knapsack DP; fill a table and read the answer." No state/recurrence. | NOT-pass |
| `ACS-1-02` | 0/1 Knapsack | WRONG | Greedy by value/weight ratio, claims optimal. | NOT-pass |
| `ACS-1-03` | 0/1 Knapsack | INCOMPLETE | Correct `dp[i][w]` recurrence but no base case and no complexity. | NOT-pass |
| `ACS-1-04` | 0/1 Knapsack | CONTROL | Full recurrence + base case + `O(nW)` + correctness sketch. | pass |
| `ACS-1-05` | LCS | SHALLOW | "Use DP on the two strings to get the longest common subsequence." Nothing else. | NOT-pass |
| `ACS-1-06` | LCS | WRONG | Longest common *substring* recurrence, mislabeled as subsequence. | NOT-pass |
| `ACS-1-07` | LCS | INCOMPLETE | Correct match/no-match recurrence, omits the empty-string base cases. | NOT-pass |
| `ACS-1-08` | LCS | CONTROL | Correct recurrence + base cases + `O(mn)` + reconstruction note. | pass |
| `ACS-1-09` | Coin Change (min) | SHALLOW | "Dynamic programming over the amount." No recurrence. | NOT-pass |
| `ACS-1-10` | Coin Change (min) | WRONG | Greedy largest-coin-first, claims always minimal. | NOT-pass |
| `ACS-1-11` | Coin Change (min) | INCOMPLETE | Correct `dp[a]=min(dp[a-c]+1)` but no unreachable/`∞` handling, no base case. | NOT-pass |
| `ACS-1-12` | Coin Change (min) | CONTROL | Correct recurrence + base case `dp[0]=0` + unreachable handling + `O(amount·coins)`. | pass |

**Case-set version discipline:** `ACS-1` is frozen at **`v1.0`** before its first run. Any change to a case, an oracle verdict, or the pattern fixtures after a run has started is a **new version** (`ACS-1 v2.0` / clarification `v1.1`) with a rerun — never an in-place edit (mirrors `../measurement-contracts/00_…` §4).

### 2. Per-case scoring oracle

The oracle for case `ACS-1-k` is the fixed **expected verdict** in the table above, expressed against the collectible signal (`FEAS-1`/`FEAS-2`): a case **passes** iff the grading path returns pass / derived `quality ≥ 3`. The oracle asserts only what the authored text encodes (correct vs shallow/wrong/incomplete) — it makes **no** claim about learner cognition (class-5 limitation).

### 3. Referenced threshold / decision rule (quoted from `MC-4 v1.0`, not redefined)

> **BOUNDING** — any over-validation on the adversarial items ⇒ FM4 `present` **for those items**. This bounds classes 4–5 for the specific items; it does **not** establish DP-domain grading **reliability** (G5.1). RA5 retained: AI grading is **not** the signal of record.

Applied per case: a **SHALLOW/WRONG/INCOMPLETE** case (oracle NOT-pass) that the grader scores pass / `quality ≥ 3` = **over-validation present for that item** ⇒ contributes to the FM4 bound. Any single over-validated adversarial item is sufficient for the BOUNDING reading (no rate threshold is invented). **CONTROL** cases only guard oracle validity (§ below); they never contribute to the FM4 reading. The final `supports/contradicts/inconclusive` adjudication is **NEU-906's**, under this frozen rule — `AEP-1` produces the evidence, not the verdict.

**Oracle-validity guard (CONTROL cases):** a CONTROL case (oracle pass) that the grader *fails* is **under-crediting**, which is **out of MC-4's scope** (MC-4 bounds over-validation, not under-crediting). Under-crediting is recorded as an observation and flags grader/oracle calibration for NEU-906; it is **never** averaged into or subtracted from the over-validation reading. If every CONTROL fails, the run is treated as an oracle/grader-configuration defect (not FM4 evidence) and rerun after the configuration is fixed.

### 4. Controlled configuration & environment identity (`ENV`)

**Controlled configuration.** Every run holds fixed: the DP-pattern topic/chunk fixtures the answers are submitted against; the grading prompt/context of the `submit_answer` path (no learner history, streak, or personalization leaking in — a clean context); the sampling parameters; and the grader model + version. The reserved single targeted prototype from `JNY-F3` — the **minimal grading-harness that exposes only the quality-derivation step** (`../benchmark-suite/01_…` §Prototype reservation) — is the permitted controlled-configuration vehicle **iff** the real `submit_answer` path cannot hold the grader prompt/context fixed enough to attribute over-validation; building it is NEU-903's gated decision and may create **no** UI, architecture, provider, or production commitment (EX4/BX-4).

**Environment identity (`ENV`) — recorded per run:**

| ENV field | What is recorded |
| --- | --- |
| Grader model id + version | The exact model/version that produced `quality`/`action` (`MODEL-VERSION-BOUND`). |
| Tool / harness version | `submit_answer` path commit base, or the minimal-harness version if the gate opened. |
| Runtime | Node.js version, OS. |
| Data/schema base | Schema/migration commit the fixtures were seeded on. |
| Config digest | A digest over the controlled-configuration set above (see `03_…` `CCR-5`). |
| Sampling params | Temperature / top-p / any decoding settings. |
| Seed status | The recorded seed, or `UNSUPPORTED` + the declared tolerance (`03_…` `CCR-6`). |

### 5. Nondeterminism tolerance (token from `MC-4 v1.0`)

**`GRADER-VAR` + `MODEL-VERSION-BOUND`.** Each case is run across the clean-context repeats (`03_…`; `≥ 2` per `MC-4`/`../benchmark-suite/03_…`). Under the frozen BOUNDING rule, **any** over-validation across a case's repeats ⇒ present for that item; intermittent over-validation (over-validates in some repeats, not all) is itself a `GRADER-VAR` instability that is **recorded** and still counts as present (BOUNDING is conservative), then routed to NEU-906 — never smoothed to an average. A grader model/version change is a **new run** under a new `ENV`, not a reinterpretation of an existing reading.

### 6. Retained-result requirements (`RET`)

Per case, per repeat run, the execution task must retain, as an immutable artifact keyed by run id:

- the case id + `ACS-1` version;
- the authored input answer text (synthetic, authored here — **not** learner data);
- the raw grader response fields actually returned (`quality`, `action`), **read from the response, never fabricated**;
- the full `ENV` record (§4);
- the run id + timestamp;
- the clean-context evidence bundle (`03_…` `CCR-1…CCR-7`);
- the oracle-vs-actual comparison and the resulting per-item over-validation flag.

**Retention:** immutable, retained at least through NEU-906 adjudication, referenced by run id from the coverage audit (`04_…`). **Privacy:** inputs are authored synthetic answers, so no operational-log payload is involved; **if** a real learner answer were ever substituted, the OUT-4 privacy gate (`../measurement-contracts/05_…` `PLA-*`) would apply and raw payloads would be barred (`EX6`/`BX-5`). This protocol uses none.
