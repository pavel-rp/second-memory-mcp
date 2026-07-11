# Operational-Log Privacy Gate (OUT-4)

**Task:** NEU-901 · **Compiled:** 2026-07-11 · **Checked against:** develop `f917ca0`.
NEU-901 is the **sole owner of privacy approvals** for payload-bearing operational logs. This file defines the gate every proposed log use must pass **before** any operational-log evidence is collected (acceptance scenario 4). It enforces P5/EX6/BX-5 ("never expose raw learner payloads; log-derived evidence is aggregate-only"). **No raw payload appears in this artifact or any artifact it authorizes.**

**Grounding fact (why this gate is mandatory).** The logging stack redacts **credentials only** and intentionally leaves **learner text unredacted**:
- `shared/logger.ts` `LOG_REDACT` / `shared/redact-params.ts` denylist = `password, token, apiKey, apikey, api_key, authorization, secret` — nothing else. The comment is explicit: *"Learner `response` text is intentionally NOT redacted."*
- `transport/audit-middleware.ts` captures the **full JSON-RPC `responseBody`** (≤ 64 KB) and `params` (credential-redacted only) into `infrastructure.mcp_request_log` (`transport/pg-audit-transport.ts`).
- `transport/pg-event-transport.ts` writes a free-form `data` JSONB column into `infrastructure.operation_event_log`.

Therefore `response_body`, learner free-text inside `params.arguments` (e.g. `response`), and `event_log.data` are **payload-bearing** and cannot be treated as ordinary research inputs.

---

## 1. Payload classification of the log surface

| Source | Column | Class | Payload-bearing? |
| --- | --- | --- | --- |
| `mcp_request_log` | `response_body` | learner-facing text | **YES — payload** |
| `mcp_request_log` | `params` (JSONB) | tool args incl. learner free text (`response`, answer text) | **YES — payload** (credentials redacted only) |
| `mcp_request_log` | `method, rpc_id, timestamp, correlation_id, session_id, response_status, duration_ms` | metadata | **No — payload-free** |
| `operation_event_log` | `data` (JSONB) | free-form event payload | **YES — potentially payload** |
| `operation_event_log` | `timestamp, correlation_id, tool, level, operation, event, duration_ms` | metadata | **No — payload-free** |

**Payload-free provenance set** (the only fields any evidence artifact may quote directly): `method`, `operation`, `event`, `tool`, `level`, `response_status`, `duration_ms`, `timestamp` (as a time range), `correlation_id` / `session_id` (as counts or a hashed id — never a linkable per-learner key), plus **aggregate counts**. Everything else requires minimization/redaction to an aggregate.

## 2. The privacy gate — every condition must hold (any missing condition BLOCKS)

A proposed operational-log use passes **iff** it produces a `PLA-*` record (§3) satisfying **all** of:

1. **Research-question link.** Tied to a documented RQ (e.g. RQ4 G4.1 for `time_spent_ms` reliability). No RQ ⇒ BLOCK.
2. **Least-privilege, time-bounded access.** Access is scoped to the minimum fields, the minimum time range, and a stated expiry. No open-ended access.
3. **Field allowlist.** An explicit allowlist of columns; **payload-bearing columns are excluded** unless a per-field justification + protection is recorded (§2.5). Default: payload-free set only.
4. **Minimization / redaction record.** The extraction reduces to an **aggregate** (counts, distributions, rates); no row-level payload leaves the query. Any necessary identifier or free text is redacted/hashed with a recorded rationale.
5. **Credential exclusion.** Credentials are already `[REDACTED]` by the denylist; the query must additionally never select a column that could reintroduce them. Confirmed.
6. **Identifier & free-text exclusion.** `response_body`, `params.arguments.*` free text, and `event_log.data` are **excluded by default**; included only with explicit justification, protection (hash/aggregate), and a named approver.
7. **Retention limit + deletion owner.** Both the raw query result and any minimized derivative have a stated retention window and a **named deletion owner**.
8. **Payload-free provenance.** Reproducibility is preserved via **query scope, time range, field list, aggregate counts, and a query/snapshot id or hash** — **never** by copying raw payloads.

`GATE = PASS` for a use only when 1–8 all hold. Any missing condition ⇒ **BLOCK** (acceptance scenario 4: "any missing condition blocks access").

## 3. The access record (`PLA-*`)

| Field | Meaning |
| --- | --- |
| **`PLA-id`** | `PLA-<n>` + the `MC-*`/RQ it serves. |
| **`PLA-research-question`** | The documented RQ/gap the access answers. |
| **`PLA-scope`** | Table(s) + **allowlisted columns** (payload-free unless justified). |
| **`PLA-time-range`** | The bounded time window (start–end). |
| **`PLA-access-window`** | When access is granted and its **expiry** (time-bounded). |
| **`PLA-minimization`** | The aggregation/redaction applied (what leaves the query — counts/rates only). |
| **`PLA-excluded`** | Explicitly excluded payload columns (`response_body`, `params` free text, `event_log.data`) + credentials. |
| **`PLA-justified-inclusions`** | Any payload/identifier included, with per-field justification + protection (hash/aggregate) + approver. Default: `none`. |
| **`PLA-retention`** | Retention window for raw + minimized results. |
| **`PLA-deletion-owner`** | Named owner responsible for deletion at expiry. |
| **`PLA-provenance`** | Query scope + time range + field list + aggregate counts + **query/snapshot id or hash** (no raw payload). |
| **`PLA-verdict`** | `PASS` (all §2 conditions) / `BLOCK` (any missing). |

## 4. Pre-approved access records (for the contracts that need logs)

These are the **only** log uses this task authorizes for the current contract set; each is aggregate-only.

### PLA-1 · Cohort retention aggregate (serves `PRX-1` / MC-1)
- **RQ:** does retrieval+spacing hold DP patterns over time (P1/FM1)?
- **Scope/columns:** `mcp_request_log`: `method, session_id (hashed), timestamp, response_status` — **payload-free set only**.
- **Time range:** a bounded review window. **Access window:** single-snapshot, expires on extraction.
- **Minimization:** aggregate recall-pass **rate vs elapsed interval**; no row-level text; `session_id` hashed for cohorting, never a linkable key.
- **Excluded:** `response_body`, `params` free text, `event_log.data`, credentials. **Justified inclusions:** none.
- **Retention:** aggregate only, bounded; raw query result deleted at snapshot close. **Deletion owner:** the measurement-contract owner (SUB-4 role).
- **Provenance:** scope + time range + field list + row/aggregate counts + snapshot hash. **Verdict:** `PASS`.

### PLA-2 · Session-quality aggregate (serves `PRX-7` / MC-7)
- **RQ:** can `averageQuality` be aggregated meaningfully (CAND-15/P4)?
- **Scope/columns:** `sessionQuestionAttempts.quality` **aggregated** (mean/distribution per session) — the numeric grade only, **no answer text**.
- **Minimization:** per-session mean + distribution; no per-attempt text. **Excluded:** `response_body`, answer free text, credentials. **Justified inclusions:** none.
- **Retention/owner/provenance:** bounded aggregate; SUB-4 deletion owner; provenance via field list + counts + snapshot id. **Verdict:** `PASS`.

### PLA-3 · `time_spent_ms` reliability aggregate (serves `PRX-7` / MC-8)
- **RQ:** is `time_spent_ms` reliable in real usage (RQ4 G4.1)?
- **Scope/columns:** `sessionQuestionAttempts.time_spent_ms` **distribution** (percentiles, idle/outlier rate) — the numeric field only.
- **Minimization:** distribution + outlier rate; **no** linkage to answer text or identity. **Excluded:** `response_body`, `params` free text, `event_log.data`, credentials. **Justified inclusions:** none.
- **Retention/owner/provenance:** bounded aggregate; SUB-4 deletion owner; provenance via field list + counts + snapshot hash. **Verdict:** `PASS`.

**No `PLA-*` selects a payload column.** If a future contract needs one, it must record a `PLA-justified-inclusions` entry (justification + hash/aggregate protection + named approver) and re-pass §2 — otherwise `BLOCK`.

## 5. Interaction with the dogfooding observation record

The creator's own `OBS-*` responses (`../benchmark-suite/03_…`) may be captured **inside** the observation record for the creator's own review — that record is **not** an operational-log extract and is not governed by this gate. But any **log-derived** claim (a rate, a distribution, a count computed from `mcp_request_log`/`operation_event_log`) **must** go through a `PLA-*` here. The two paths never mix: a `PLA-*` never quotes an `OBS-*` payload, and an `OBS-*` never exports a raw log row (BX-5).

## 6. Gate audit summary

- Payload-bearing columns identified from real code: `response_body`, `params` free text, `event_log.data`. ✔
- Redaction confirmed credentials-only; learner text unredacted (by design). ✔
- Every authorized `PLA-*` (`PLA-1/2/3`) is aggregate-only, time-bounded, least-privilege, with a named deletion owner and payload-free provenance. ✔
- Zero raw payloads in this artifact; zero payload columns selected. ✔
- Any proposed use missing an RQ link, an allowlist, minimization, a retention/deletion owner, or payload-free provenance ⇒ **BLOCK**. ✔
