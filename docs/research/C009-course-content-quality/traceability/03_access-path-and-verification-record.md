# Access-Path and Verification Record — SUB-3

**Task:** NEU-959 (SUB-3) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Status:** **this record SETS no status.** Status lives in a ledger
**Model:** claude-opus-5[1m]

**This is the package's own verification record**, referenced by `../03_problem-citation-verification-and-access-paths.md` §4, §5 and §9. It is the home of the **access-path record** and of the **dated verification observations** — the title, constraints and difficulty-signal values that `CH-F5-1` forbids storing as citation fields.

**Two structural rules this file obeys, both inherited and neither invented here:**

1. **The access path is recorded here, never as a field of a citation record.** `01_provenance-and-rights.md` §4.1 admits exactly `stable_id` and `canonical_url`; an `access_path` field would be a third stored field admitted on local judgment. The charter states the same rule directly: the record *"lives in the package's own verification record, not as a field of any citation record."*
2. **This file names no problem identifier and no problem-level URL of any of the twelve sources**, because none was verified and because §2's bright line forbids recording which problems a source has.

---

## 1. The access-path record — one row per source, per path attempted

**Cutoff:** 2026-08-10 · **Requests issued to any of the twelve sources: zero** · **Evidence class:** 2 `[code-evidence]` for each attempt outcome; the access dispositions consumed are class 1 `[literature]`, dated 2026-08-10 by `../01_provenance-and-rights.md` §3

**How to read the `Resolved through` column.** It carries a real recorded value in every row — never a blank. `none — gate` means the source's SUB-1 access-permission row stopped it **before** any path was reached, which is a materially different state from *"path (1) failed, path (2) resolved it"* and from *"attempted and refused by the source."* A future reader must be able to tell those three apart; a blank cell cannot, and a blank cell is also indistinguishable from a row nobody evaluated.

| Source | Documented API on record | SUB-1 access disposition (2026-08-10) | Path (1) attempted? | Path (2) attempted? | Bulk method | Outcome | Date | **Resolved through** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **T1** CP-Algorithms | no | **Restricted** | **No** — no API on record | **No** — gate | never | **Gate-blocked.** No request issued. | 2026-08-10 | **`none — gate`** |
| **T2** Competitive Programmer's Handbook | no | **Restricted** | **No** — no API on record | **No** — gate | never | **Gate-blocked.** No request issued. | 2026-08-10 | **`none — gate`** |
| **T3** USACO Guide | no | **Restricted** | **No** — no API on record | **No** — gate | never | **Gate-blocked.** No request issued. | 2026-08-10 | **`none — gate`** |
| **T4** Codeforces catalogues | no | **Restricted** | **No** — no API on record | **No** — gate | never | **Gate-blocked.** No request issued. **`CAP-2`'s own source; the 403 of 2026-07-16 is neither reproduced nor refuted here, because nothing was attempted.** | 2026-08-10 | **`none — gate`** |
| **T5** CN/JP olympiad traditions | no | **Restricted** | **No** — no API on record | **No** — gate | never | **Gate-blocked.** No request issued. | 2026-08-10 | **`none — gate`** |
| **T6** Primary literature | no | **Restricted** | **No** — no API on record | **No** — gate | never | **Gate-blocked.** No request issued. | 2026-08-10 | **`none — gate`** |
| **C1** CSES | no (assumption 24) | **Restricted** | **No** — no API on record | **No** — gate | never | **Gate-blocked.** No request issued. **Carries CL-1/CL-2 foundational material; its loss is the largest single contributor to `CAP-S3-1`.** | 2026-08-10 | **`none — gate`** |
| **C2** AtCoder EDPC | no (assumption 24) | **Restricted** | **No** — no API on record | **No** — gate | never | **Gate-blocked.** No request issued. | 2026-08-10 | **`none — gate`** |
| **C3** AtCoder TDPC | no (assumption 24) | **Restricted** | **No** — no API on record | **No** — gate | never | **Gate-blocked.** No request issued. | 2026-08-10 | **`none — gate`** |
| **C4** Codeforces problemset | **Yes — `api.codeforces.com`** (assumption 24, confirmed) | **Restricted** | **No — gate.** The API was never called; `problemset.problems` was never requested. | **No** — gate | never | **Gate-blocked.** **The one source whose path (1) exists failed the gate before path (1) was reachable**, so Branch B was never entered: there is no failed API attempt to fall from. | 2026-08-10 | **`none — gate`** |
| **C5** ICPC / IOI / JOI / POI / CEOI archives | no (assumption 24) | **Restricted** | **No** — no API on record | **No** — gate | never | **Gate-blocked.** No request issued. | 2026-08-10 | **`none — gate`** |
| **C6** Library Checker | no (assumption 24) | **Restricted** | **No** — no API on record | **No** — gate | never | **Gate-blocked.** No request issued. **A permissive content licence is not a crawl permission and did not change this row.** | 2026-08-10 | **`none — gate`** |

**Totals:** 12 sources · 12 gate-blocked · **0 requests issued** · 0 path-(1) attempts · 0 path-(2) attempts · **0 enumerations, crawls or corpus walks** · 12 rows carrying a dated outcome and a recorded resolved-through value.

### 1.1 The one non-source request, disclosed

| Endpoint | Class | Date | What it was | What it establishes |
| --- | --- | --- | --- | --- |
| `example.com` (IANA-reserved documentation domain) | **Not one of the twelve sources** | 2026-08-10 | One HTTPS GET, returning the expected document. | **Outbound network capability exists in this execution environment.** Evidence class 2 `[code-evidence]`. **Nothing about any source's rights, robots directives, or rate limits.** |

**Why it is in this table rather than omitted.** A request-pattern audit that silently excluded a request the auditing task itself made would be self-serving accounting. It is disclosed, labelled, and separated from the twelve-source table so it can never be miscounted into it.

**Why it matters.** It fires the named revision trigger on `CAP-S1-1` and `../01_provenance-and-rights.md` §11.2 — *"network access becomes available to a re-verification pass."* The **capability** half of that condition is now satisfied and dated. The **authority** half is not, and belongs to SUB-1.

---

## 2. Dated verification observations

**This is where the title, the constraints and the difficulty signal live** while `CH-F5-1` is open — never as stored citation fields (`../01_provenance-and-rights.md` §4.1; `DR-C09-01` consequence 5).

| Observation | Source | Value | Date |
| --- | --- | --- | --- |
| — | — | **None. Zero observations recorded.** | — |

**The table is empty because no source was resolved, and it is present because its shape is part of the deliverable.** A future pass that resolves a citation records the title match, the constraints match and (for C4) the numeric rating here, each dated and attributed, and every downstream calibrated output carries the observation date. `../03_…` §5 steps V5 and V6 produce exactly these rows.

**Nothing is inferred into this table from memory, from a model's prior knowledge of a corpus, or from a plausible reconstruction.** An observation is a record of something observed on a date; there is no other way to earn a row here.

---

## 3. Rights-check resolution for this sub-task

`RC-7` and `RC-8` were introduced by SUB-1 and are re-resolved here **against this sub-task's own conduct**, not restated as SUB-1's results.

| Check | Passing condition | Result for SUB-3 at 2026-08-10 |
| --- | --- | --- |
| **RC-7** | A completed per-source access-permission record exists, **dated at or before the first citation request**. | **Pass, and strengthened by the outcome.** SUB-1's record is dated 2026-08-10; SUB-3 issued **zero** citation requests, so the precondition precedes the (non-existent) first request by construction rather than by claim. |
| **RC-8** | A retention disposition covering enumerating API responses exists, is dated at or before SUB-3's cutoff, and was in force before the first request on path (1). | **Pass, vacuously.** In force before the gate was evaluated; **no enumerating response was ever received.** See `../03_…` §8 for why this is a vacuous pass and must not be cited as precedent that the discipline holds under a live response. |
| **RC-9** *(new, SUB-3)* | **No access outcome recorded by this sub-task promotes a restricted source to permissive**, and no rights claim anywhere in its output rests on reachability. | **Pass.** Zero requests to any source; the one neutral-endpoint request is recorded as a class 2 operational fact about the environment and is nowhere cited as a rights argument. **No row of §1 was rewritten, and no disposition was formed locally.** |
| **RC-10** *(new, SUB-3)* | **Every asserted problem id has a corresponding dated resolution record** (`../01_provenance-and-rights.md` §8, enforcement clause — mechanically checkable at review). | **Pass, trivially and checkably.** **Zero problem ids are asserted anywhere in SUB-3's output**, so the set of ids lacking a resolution record is empty. Verified by scans B and C of §4, both returning 0 matches. |

---

## 4. Scan re-run — the standing obligation, discharged over the new files

**Scan date:** 2026-08-10 · **Scope:** `docs/research/C009-course-content-quality/`, recursive, **including** `03_problem-citation-verification-and-access-paths.md`, this file, and `dry-run/03_template-fabrication-probe-run-2.md` · **Evidence class:** 2 `[code-evidence]`

Both scan families of `../01_provenance-and-rights.md` §5.1 (no statement text) and §6 (no retained problem list or enumerated candidate set) were re-run, per the standing re-run obligation on any sub-task that adds a path holding problem references.

| # | Checks for | Command (paths relative to the repository root) | Outcome |
| --- | --- | --- | --- |
| **A** | Statement-section markers at line start | `grep -rnE '^(Input\|Output\|Constraints\|Sample Input\|Sample Output)\b' docs/research/C009-course-content-quality/` | **0 matches.** No output. |
| **B** | Problem-level URLs of the twelve sources | `grep -rnE '(codeforces\.com/(problemset/problem\|contest)/\|cses\.fi/problemset/task/\|atcoder\.jp/contests/[A-Za-z0-9_-]+/tasks/\|usaco\.org/index\.php\?page=viewproblem\|judge\.yosupo\.jp/problem/)' docs/research/C009-course-content-quality/` | **0 matches.** No output. |
| **C** | An enumerated candidate set — sibling rows carrying source-native problem identifiers | `grep -rnE '^(\s*[-*]\|\|)\s*.*\b(abc\|arc\|agc\|dp)[0-9]{2,4}_[a-z]\b' docs/research/C009-course-content-quality/` | **0 matches.** No output. |
| **D** | Fenced blocks — where a sample, an example, or a serialised response body would sit | `grep -rn '^\`\`\`' docs/research/C009-course-content-quality/` | Matches **only** in `dry-run/03_…`, which carries the probe's verbatim per-template output. **Every fenced block there contains refusal strings and instruction text — no identifier, no address, no statement text, no response body.** Inspected line by line, not merely counted. |
| **E** | The enumerating endpoint by name | `grep -rniE '(problemset\.problems\|api\.codeforces\.com)' docs/research/C009-course-content-quality/` | **7 matches** — 3 pre-existing in `01_provenance-and-rights.md` (SUB-1's §3, §6, §7.3) and **4 new in `03_…`** (§3's hierarchy table, §4.1, §9's retention row, §8's caveat). **Every one names the endpoint as the subject of a prohibition or of a recorded non-event.** None carries, quotes or summarises a response. **Expected and correct** — a retention rule must be able to name the thing it bounds. |

**Outcome: PASS.** No problem statement text, no problem-level URL, no enumerated candidate set, and no serialised response body appears anywhere in the package, including in the three files this sub-task added.

**Change against SUB-1's baseline run, stated so the delta is visible rather than implied:** scan D moves from *"0 matches — the package contains no fenced block at all"* to *"fenced blocks exist, in `dry-run/03_…` only, and every one was inspected."* **That is a real change in the package's shape and it is recorded as one.** A reader who assumed D still returned zero would draw a false conclusion about what the scan proves; what it now proves is narrower and is stated narrowly.

**Stated limitation, unchanged:** these are lexical scans (`CAP-S1-5`, `CAP-S2-6`). They establish **structural absence**. They cannot prove that no sentence anywhere is a semantic paraphrase of a protected statement, and no grep can. The residual is a review obligation on this sub-task as on every other.
