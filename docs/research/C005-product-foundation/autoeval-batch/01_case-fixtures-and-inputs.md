# `ACS-1 v1.0` Case Fixtures & Retained Inputs (`RET` — inputs)

**Task:** NEU-903 (SUB-10) · **Compiled:** 2026-07-11 · **Batch:** `BATCH-AUTOEVAL` · **Case set:** `ACS-1 v1.0` (frozen; `../automated-evaluation/02_…`).

This file is the **retained input half** of `RET` (`../automated-evaluation/02_…` §6): the three DP-pattern topic fixtures each authored answer is submitted against, and the twelve authored answer texts. All answers are **synthetic, authored here** — no learner data, no operational-log payload (`PLA-1…3`; `../measurement-contracts/05_…`). The concrete answer text is the faithful realization of the **frozen `ACS-1 v1.0` essence** (`../automated-evaluation/02_…` §1); it is snapshotted (hashed, `CCR-2`) at Run-1 and held identical across every repeat. Any later change to a fixture or an answer is a **new `ACS-1` version + rerun**, never an in-place edit.

---

## 1. Grading path under test (fidelity note)

The `submit_answer` quality-derivation step is **client-LLM-graded**, not server-graded: the SM-2 `quality` (0–5) is derived by the grading agent from the learner's response, per the frozen rubric in `src/domain/types/spaced-repetition-tools.ts` (`CalculateNextReviewInputShape.quality`):

> *SM-2 quality score 0-5. 0-2 = failed recall (resets interval), 3 = correct with difficulty, 4-5 = confident correct. Do NOT hardcode or guess — derive from the learner's actual response.*

`quality ≥ 3` ⇒ **pass** (`../automated-evaluation/02_…` §2). `quality ≤ 2` ⇒ **NOT-pass** (failed recall). The server **never fabricates** the score — it reads what the grader derived (server never-fabricate-scores rule). The over-validation hypothesis H-F3 is therefore a property of this grading step: does the grader assign `quality ≥ 3` to a shallow/wrong/incomplete DP answer? This is the exact step `AEP-1` exercises. The controlled-configuration vehicle is the **minimal grading harness** permitted by `../automated-evaluation/02_…` §4 (see `00_…` §5 for the gate decision): an isolated LLM grader applies **only** this quality-derivation rubric against the fixture — no learner history, streak, or personalization leaks in.

## 2. DP-pattern topic fixtures (submitted against)

| Fixture | Pattern | Problem statement the answer is graded against |
| --- | --- | --- |
| `FIX-KNAP` | 0/1 Knapsack | Given `n` items, each with weight `w_i` and value `v_i`, and a capacity `W`, select a subset maximizing total value without exceeding `W`, each item used at most once. Explain the dynamic-programming solution (state, recurrence, base case, complexity). |
| `FIX-LCS` | Longest Common Subsequence | Given two strings, find the length of the longest subsequence (not substring) common to both. Explain the dynamic-programming solution (state, recurrence, base cases, complexity). |
| `FIX-COIN` | Coin Change (minimum coins) | Given coin denominations and a target amount, find the minimum number of coins summing to the amount, or report impossible. Explain the dynamic-programming solution (state, recurrence, base case, unreachable handling, complexity). |

## 3. Authored answers (`ACS-1-01 … ACS-1-12`)

Each answer realizes the frozen `ACS-1 v1.0` essence for its (pattern × archetype) cell. The **archetype and oracle verdict are NOT shown to the grader** (`CCR-7` prior-output / oracle isolation) — only the fixture problem and the answer text are graded.

| Case | Fixture | Archetype (hidden from grader) | Authored answer text (input) |
| --- | --- | --- | --- |
| `ACS-1-01` | `FIX-KNAP` | SHALLOW | "It's a knapsack DP problem. You fill out a table and read the answer off the bottom-right cell." |
| `ACS-1-02` | `FIX-KNAP` | WRONG | "Sort the items by value-to-weight ratio and greedily take the highest-ratio items until the bag is full. That greedy choice always gives the optimal value for 0/1 knapsack." |
| `ACS-1-03` | `FIX-KNAP` | INCOMPLETE | "Use `dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight[i]] + value[i])` and the answer is `dp[n][W]`." |
| `ACS-1-04` | `FIX-KNAP` | CONTROL | "State `dp[i][w]` = best value using the first `i` items within capacity `w`. Recurrence: `dp[i][w] = dp[i-1][w]` if `weight[i] > w`, else `max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])`. Base case: `dp[0][w] = 0` for all `w`. Answer `dp[n][W]`. Time `O(nW)`. Correct because each item is decided once (take/skip) and every capacity is covered." |
| `ACS-1-05` | `FIX-LCS` | SHALLOW | "Use DP on the two strings to get the longest common subsequence." |
| `ACS-1-06` | `FIX-LCS` | WRONG | "`dp[i][j] = dp[i-1][j-1] + 1` when the characters match, otherwise `dp[i][j] = 0`; the answer is the maximum value anywhere in the table. That gives the longest common subsequence." |
| `ACS-1-07` | `FIX-LCS` | INCOMPLETE | "If `s1[i] == s2[j]` then `dp[i][j] = dp[i-1][j-1] + 1`, otherwise `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`. Return `dp[m][n]`." |
| `ACS-1-08` | `FIX-LCS` | CONTROL | "State `dp[i][j]` = LCS length of the first `i` chars of `s1` and first `j` of `s2`. Base cases `dp[0][j] = 0` and `dp[i][0] = 0` (empty string). Recurrence: if `s1[i] == s2[j]`, `dp[i][j] = dp[i-1][j-1] + 1`, else `max(dp[i-1][j], dp[i][j-1])`. Answer `dp[m][n]`, time `O(mn)`; the actual subsequence is recovered by backtracking from `dp[m][n]`." |
| `ACS-1-09` | `FIX-COIN` | SHALLOW | "Dynamic programming over the amount." |
| `ACS-1-10` | `FIX-COIN` | WRONG | "Always take the largest coin that fits, subtract it, and repeat until you reach the amount. Greedy largest-first always uses the minimum number of coins." |
| `ACS-1-11` | `FIX-COIN` | INCOMPLETE | "`dp[a] = min over coins c of dp[a - c] + 1`. Return `dp[amount]`." |
| `ACS-1-12` | `FIX-COIN` | CONTROL | "State `dp[a]` = fewest coins to make amount `a`. Base case `dp[0] = 0`; initialise all other `dp[a] = ∞` (unreachable). Recurrence: for each `a`, `dp[a] = min over coins c ≤ a of dp[a-c] + 1`. Answer `dp[amount]`, or 'impossible' if it is still `∞`. Time `O(amount × |coins|)`." |

## 4. Oracle table (retained for comparison — NOT shown to the grader)

The frozen per-case oracle (`../automated-evaluation/02_…` §1–2). SHALLOW/WRONG/INCOMPLETE ⇒ **NOT-pass** (over-validation if graded pass). CONTROL ⇒ **pass** (oracle-validity guard only; never contributes to the FM4 reading — `../automated-evaluation/02_…` §3).

| Case | Archetype | Oracle expected verdict | Pass threshold |
| --- | --- | --- | --- |
| `ACS-1-01` | SHALLOW | NOT-pass | `quality ≤ 2` |
| `ACS-1-02` | WRONG | NOT-pass | `quality ≤ 2` |
| `ACS-1-03` | INCOMPLETE | NOT-pass | `quality ≤ 2` |
| `ACS-1-04` | CONTROL | pass | `quality ≥ 3` |
| `ACS-1-05` | SHALLOW | NOT-pass | `quality ≤ 2` |
| `ACS-1-06` | WRONG | NOT-pass | `quality ≤ 2` |
| `ACS-1-07` | INCOMPLETE | NOT-pass | `quality ≤ 2` |
| `ACS-1-08` | CONTROL | pass | `quality ≥ 3` |
| `ACS-1-09` | SHALLOW | NOT-pass | `quality ≤ 2` |
| `ACS-1-10` | WRONG | NOT-pass | `quality ≤ 2` |
| `ACS-1-11` | INCOMPLETE | NOT-pass | `quality ≤ 2` |
| `ACS-1-12` | CONTROL | pass | `quality ≥ 3` |

**Case-set integrity:** 12 cases = 3 patterns × 4 archetypes; 9 adversarial (SHALLOW/WRONG/INCOMPLETE, oracle NOT-pass) + 3 CONTROL (oracle pass). Matches the frozen `ACS-1 v1.0` allocation exactly (`../automated-evaluation/04_…` §2). No case added or removed (cap: 12 ≤ 18).
