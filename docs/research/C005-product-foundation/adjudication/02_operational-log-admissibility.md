# Operational-Log Evidence Admissibility (OUT-4 · `PLA-1…3` gate)

**Task:** NEU-906 · **Compiled:** 2026-07-12 · **Gate definition:** `../measurement-contracts/05_…` (NEU-901, sole owner of log-privacy approvals).
Every **class-6 `[operational-log]`** evidence item admitted into this adjudication must carry a passing `PLA-*` record — **least-privilege access, field allowlist, minimization to aggregate, retention window + named deletion owner, payload-free provenance** (`../measurement-contracts/05_…` §2, conditions 1–8). Any item failing **any** condition is **privacy-rejected**, and the rejection is recorded here. **No sensitive raw log content enters this artifact; no payload column is quoted; aggregates and metadata only.**

This gate also covers the **class-3 RETROSPECTIVE** records that were *derived from* production DB aggregates (`../baseline-batch/07_…`,`08_…`, `../failure-batch/02_…`,`04_…`): although labeled class-3 (the creator's own historical behavior), their provenance is a DB snapshot, so they are held to the same payload-free standard.

---

## 1. Log-derived items presented for admission

| Item | Class | Journey | Source record | Backing `PLA-*` |
| --- | --- | --- | --- | --- |
| `OPLOG-JNY-B1#BM2` | 6 | JNY-B1/BM-2 | `../baseline-batch/07_…` R2 | PLA-1 (cohort/loop aggregate, MC-1) |
| `OPLOG-JNY-B2#BM6` | 6 | JNY-B2/BM-6 | `../baseline-batch/08_…` R2 | PLA-1 (activity aggregate, MC-5 context) |
| `OPLOG-JNY-F1#…` | 6 | JNY-F1/BM-1 | `../failure-batch/02_…` R2 | PLA-1 (activity aggregate) |
| `OPLOG-JNY-F2#…` | 6 | JNY-F2/BM-4 | `../failure-batch/04_…` R2 | PLA-1 (activity aggregate) |
| `OBS-*#RETRO-*` (B1/B2/F1/F2) | 3 RETRO | all baseline/failure | `07_…`/`08_…`/`02_…`/`04_…` R1 | PLA-1…3 provenance (DB aggregate) |

## 2. Gate evaluation per item (all 8 conditions must hold — `../measurement-contracts/05_…` §2)

| Condition (`05_…` §2) | `OPLOG-JNY-B1#BM2` | `OPLOG-JNY-B2#BM6` | `OPLOG-JNY-F1` | `OPLOG-JNY-F2` |
| --- | --- | --- | --- | --- |
| 1 · RQ link | ✅ MC-1/P1/FM1 loop reality | ✅ MC-5/FM5 context | ✅ MC-2 context | ✅ MC-3 context |
| 2 · Least-privilege, time-bounded | ✅ single authorized snapshot, 2026-03-24…07-12 window | ✅ same snapshot | ✅ same snapshot | ✅ same snapshot |
| 3 · Field allowlist (payload cols excluded) | ✅ counts, tool name, active-days, avg duration, error count — **no `params`/`response_body`** | ✅ same allowlist | ✅ same | ✅ same |
| 4 · Minimization to aggregate | ✅ whole-table aggregate + `GROUP BY tool`; no row-level text | ✅ same | ✅ same | ✅ same |
| 5 · Credential exclusion | ✅ no column that could reintroduce credentials | ✅ | ✅ | ✅ |
| 6 · Identifier & free-text exclusion | ✅ `response_body`/`params` free text/`event_log.data` excluded | ✅ | ✅ | ✅ |
| 7 · Retention limit + **named deletion owner** | ✅ bounded aggregate; deletion owner = measurement-contract (SUB-4) role (PLA-1) | ✅ | ✅ | ✅ |
| 8 · Payload-free provenance | ✅ query scope + time range + field list + aggregate counts (snapshot id) | ✅ | ✅ | ✅ |
| **Verdict** | **PASS** | **PASS** | **PASS** | **PASS** |

**Class-3 RETROSPECTIVE records (DB-derived).** Each `OBS-*#RETRO-*` reports **aggregate counts only** (e.g. topic/chunk/session/attempt totals, SR-ladder distribution, monthly session-mode mix, overdue-review aggregate); **no `session_id`/`chunk_ids` enumerated, no answer/response text, no `event_log.data`**. Provenance is the authorized read-only snapshot `neu904-retrospective-evidence.md` (creator authorization recorded verbatim; least-privilege, read-only, aggregate-only). Conditions 1–8 hold ⇒ **PASS** (payload-free). The snapshot is **not re-queried** by this task (hard rule).

## 3. Rejections

**None.** All four class-6 `OPLOG-*` items and all four class-3 RETRO records are **aggregate-only and payload-free at source** and satisfy every `PLA-*` condition ⇒ **zero privacy rejections**. This is the honest outcome — no rejection is manufactured for thoroughness. Had any item selected a payload column (`response_body`, `params` free text, `event_log.data`) without a recorded `PLA-justified-inclusions` entry (justification + hash/aggregate protection + named approver), it would be **BLOCKED** here and excluded from the adjudication, with the block recorded.

## 4. Admissibility firewall notes

- **No sensitive raw log content in this package.** This artifact quotes **only** aggregate counts and payload-free metadata (tool names, request/active-day counts, durations, error counts, distributions). No learner free text, answer text, or `event_log.data` appears anywhere.
- **Class separation preserved.** A `PLA-*`-admitted class-6 `OPLOG-*` is adjudicated **separately** from its co-collected class-3 `OBS-*`; neither is fused into the other, and neither is upgraded toward class-7 (`../measurement-contracts/05_…` §5, BX-5).
- **Coverage-window honesty carried.** The class-6 log window (from 2026-03-24) is **narrower** than the learning-table history (from 2025-10-17); the 2025-12/2026-01 activity lapse is visible only in the class-3 learning-table aggregate, not the log. This limitation is carried into the decision status (`03_…`), not smoothed.
- **Deletion owner.** Every admitted item inherits the `PLA-1…3` deletion owner (the measurement-contract / SUB-4 role) and bounded retention; this task adds no new raw extract requiring its own owner.
