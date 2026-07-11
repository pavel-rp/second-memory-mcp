# Case-to-Hypothesis Coverage Audit & Cap Proofs

**Task:** NEU-902 · **Compiled:** 2026-07-11 · **Inputs:** `01_…` (`ACL-*`), `02_…` (`AEP-1`/`ACS-1`).
This is the audit surface NEU-903 runs against and NEU-907's gate verifies. It proves: every automatable hypothesis is covered by ≥1 case; every case maps to an automatable hypothesis; the batch is within the 6-hypothesis / 18-case caps; and the cap-exceedance routing rule is fixed (acceptance scenarios 1 & 4).

---

## 1. Automatable-hypothesis → case-set coverage (acceptance scenario 1)

| Automatable hypothesis | Contract | Case set | Cases | Uncovered? |
| --- | --- | --- | --- | --- |
| H-F3 (DP-grading over-validation) — `ACL-4` | `MC-4 v1.0` | `ACS-1 v1.0` | `ACS-1-01 … ACS-1-12` (12) | No |

**Automatable hypotheses with ≥ 1 case: 1 / 1. Uncovered automatable hypotheses: 0.**

## 2. Case → hypothesis reverse coverage (no orphan case)

Every case in the batch traces to exactly one automatable hypothesis and its frozen contract.

| Cases | → Hypothesis | → Contract | Archetype coverage |
| --- | --- | --- | --- |
| `ACS-1-01/05/09` | H-F3 | `MC-4 v1.0` | SHALLOW ×3 |
| `ACS-1-02/06/10` | H-F3 | `MC-4 v1.0` | WRONG ×3 |
| `ACS-1-03/07/11` | H-F3 | `MC-4 v1.0` | INCOMPLETE ×3 |
| `ACS-1-04/08/12` | H-F3 | `MC-4 v1.0` | CONTROL ×3 (oracle-validity guard) |

**Orphan cases (no hypothesis): 0.** Each case also spans the three DP-pattern fixtures (knapsack, LCS, coin-change), so over-validation is probed across patterns, not a single item.

## 3. Cap proofs (acceptance scenario 1)

| Cap | Limit | This batch | Result |
| --- | --- | --- | --- |
| Automatable hypotheses | ≤ 6 | 1 (`ACL-4`) | ✔ within cap |
| Total cases | ≤ 18 | 12 (`ACS-1-01…12`) | ✔ within cap |
| Batches | 1 | 1 (`BATCH-AUTOEVAL` → NEU-903) | ✔ |

**Completeness of the automatable set.** The classification (`01_…`) applied the automatability test to **all ten** hypothesis-carrying contracts `MC-1…MC-10`; exactly one (`MC-4`) passed. So the automatable set `{H-F3}` is **complete** — not a sample — and the batch carries the *entire* automatable coverage of the feature, well inside both caps.

## 4. Batch allocation

| Batch | Cases | Executes | Consumes | Produces |
| --- | --- | --- | --- | --- |
| **`BATCH-AUTOEVAL`** | `ACS-1 v1.0` (12) | NEU-903 (SUB-10) | `AEP-1`, `MC-4 v1.0`, `CCR-1…7`, the `JNY-F3` reserved-harness gate | class-5 `[automated-eval]` runs (retained `RET` artifacts) feeding `PRX-4`; adjudicated by NEU-906 |

The whole automatable batch is one downstream session's worth of work (12 cases × `≥ 2` clean-context repeats), which is why the caps sizing holds.

## 5. Cap-exceedance routing rule (acceptance scenario 4) — fixed, not triggered here

If a future re-run of the classification finds **> 6** automatable material hypotheses, **or** a valid case design for the automatable set requires **> 18** total cases, then:

1. the protocol is declared **INCOMPLETE** (it does **not** silently expand a batch or spawn an unbounded evaluation task);
2. the feature is **routed back for scope revision** — the umbrella (NEU-887) re-slices which hypotheses enter the first automated batch and which defer to a later batch;
3. the incompleteness is recorded exactly like NEU-897's cap-exceedance handling (`../04_caps-and-incomplete-scope.md`): an explicit incomplete result, never a padded or truncated one.

**Trigger state at this compile:** automatable hypotheses = 1 (≤ 6), cases = 12 (≤ 18) ⇒ **not triggered**; the batch is complete and bounded. The rule is recorded so the boundary is auditable even though it did not fire.

## 6. Verification-evidence checklist (for NEU-903 / NEU-907)

- [ ] Every `ACL-*` row present and classified (10/10) — `01_…` §3.
- [ ] Each non-automatable hypothesis carries a rationale + retained non-automated path — `01_…`.
- [ ] The automatable hypothesis maps to a versioned case set, per-case oracle, referenced frozen rule, controlled config, tolerance, `ENV`, `RET`, and `CCR-*` — `02_…`.
- [ ] Case count ≤ 18, automatable-hypothesis count ≤ 6 — §3.
- [ ] Every case traces to a hypothesis; every automatable hypothesis has a case — §1–2.
- [ ] Each executed repeat carries all seven `CCR-*` evidence fields — `03_…` §2.
- [ ] No automated result is presented as class-3/4/6/7 evidence — `05_…` self-check.
