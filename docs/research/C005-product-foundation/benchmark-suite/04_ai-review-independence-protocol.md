# Independent AI-Review Protocol

**Task:** NEU-900 · **Compiled:** 2026-07-11 · **Sole inputs:** NEU-898 (`../product-model/`) + NEU-899 (`../traceability/`) + NEU-897 (`../`).
This file defines the **independent AI-review conditions** for each journey **before** evidence is collected (acceptance scenario 3): ≥ 2 separately initialized reviews per journey, isolation of each initial verdict, the full reproduction record, and disagreement / incomplete handling. It defines the protocol; it runs no review.

**AI review is class-4 (`[ai-critique]`) evidence.** Two AI reviewers giving a verdict on a journey are **not** two users, two experts, or a market signal (EX3). Their value is an *independent second read of the dogfooding evidence*, isolated from the creator's belief and from each other — not validation. The DP-domain *reliability* of AI critique is itself unmeasured (`INC-3`/G5.1); a verdict is a hypothesis-test input, never a settled finding, and RA5 (do not trust AI grading as the signal of record) applies to reviewers too.

---

## 1. Independence requirements (per journey)

1. **≥ 2 reviewers, separately initialized.** Each review runs in a **fresh, isolated context** — no shared conversation, memory, or state between reviewers, and none with the creator's dogfooding session.
2. **Initial verdict committed before exposure.** Each reviewer commits its **initial verdict** (append-only, timestamped) **before** any exposure to (a) the creator's conclusion (`OBS-creator-conclusion`, sealed per `03_…` §3) and (b) any other reviewer's verdict. A verdict is "committed" when it is written to the append-only `AIR-*` record; it cannot be edited afterward, only supplemented by a labeled post-commit note.
3. **Identical context package.** All reviewers of a journey receive the **same** context package (§3) so their verdicts are comparable; differences in verdict must be attributable to the reviewer/model, not to unequal exposure.
4. **No cross-contamination ordering.** Reviewers may run in parallel or in sequence, but sequence must not leak: reviewer 2 never sees reviewer 1's `AIR-*` record until both initial verdicts are committed.

## 2. The reproduction record (`AIR-*`) — one per review

Every AI review produces one record with these fields; every condition needed to **reproduce** the review must be present (a review with a missing field is not reproducible and does not count — §4).

| Field | Meaning |
| --- | --- |
| **`AIR-review-id`** | `JNY-<id>/R<k>` — journey + reviewer index (e.g. `JNY-F1/R2`). |
| **`AIR-reviewer-identity`** | The reviewer label/role and who initialized it (the creator acting as operator, or a named separate operator). |
| **`AIR-provider`** | The AI provider. |
| **`AIR-model-version`** | Model name **and** exact version/build identifier. |
| **`AIR-prompt`** | The **verbatim** review prompt given to the reviewer (including the hypothesis-under-test and the verdict rubric of §4). |
| **`AIR-context-exposure`** | Exactly what source material the reviewer saw (§3) — and, explicitly, that it did **not** see the creator's conclusion or any other verdict pre-commit. |
| **`AIR-run-date`** | ISO 8601 date/time of the review. |
| **`AIR-conditions`** | Run conditions needed to reproduce: temperature/sampling settings if exposed, tool access (typically none), any system preamble, and whether context was fresh. |
| **`AIR-verdict`** | The initial verdict from the closed set (§4) + rationale grounded only in the exposed context. |
| **`AIR-post-commit-note`** | Optional, labeled: any observation added *after* seeing the creator conclusion or the other verdict — never overwrites `AIR-verdict`. |

## 3. The standard context package (what a reviewer sees)

To make exposure reproducible and equal, every reviewer of a journey receives exactly:

- the journey id, its **hypothesis** (`H-*`, `01_…`), and the BM cell(s) and FM/X it targets;
- the journey's **vehicle and fidelity boundary** (`01_…`) — so the reviewer weighs the evidence at its true fidelity (class-3, n=1) and does not over-read it;
- the completed **`OBS-*` observation records** for the runs (minus `OBS-creator-conclusion`, which is sealed);
- the evidence-class discipline (class-3 dogfooding under review; no external-validation phrasing; EX3/BX-3).

A reviewer **never** receives: the creator's conclusion (pre-commit), any other reviewer's verdict (pre-commit), raw operational-log payloads (BX-5/P5), or any instruction to treat the evidence as user/market validation.

## 4. Verdict vocabulary, disagreement & incomplete handling

**Closed verdict set (per journey hypothesis `H-*`):**

| Verdict | Meaning |
| --- | --- |
| `supports` | The dogfooding evidence, at its stated fidelity, is consistent with the hypothesis. |
| `contradicts` | The evidence is inconsistent with the hypothesis. |
| `insufficient-evidence` | The runs do not let the reviewer decide (fidelity too low, cell unexecutable, confounds). |

**Disagreement handling (conflicts are preserved, not smoothed).** If a journey's ≥ 2 initial verdicts **disagree** (any mix of the three values that is not unanimous), the journey is marked **`conflicted`** and the disagreement is **recorded and routed to NEU-906** for adjudication under frozen rules (`LINK-4`). NEU-900 and the executing batches (NEU-904/905) do **not** resolve it, average it, or pick a winner — mirroring the NEU-897/898 discipline that conflicts `X1–X4` are carried, not adjudicated. A `conflicted` journey does **not** count as covered-with-settled-evidence.

**Incomplete-status handling.** A journey result is **`incomplete`** when any of these hold, and it is carried as incomplete — **it cannot silently count toward approval** (NEU-899 acceptance-scenario-4 discipline):

- a required `AIR-*` or `OBS-*` field is missing (not reproducible);
- fewer than two separately initialized verdicts were committed;
- both/all reviewers returned `insufficient-evidence`;
- the vehicle could not exercise the cell (e.g., **BM-3** hierarchical-schedule optimum is cap-bound INCOMPLETE — G1.2; a multi-month decay could not be observed within the window);
- the cell maps to an `INC-*` marker whose authoritative artifact does not yet exist (**BM-5 → `INC-3`**, **BM-8 → `INC-2`**) — the review can characterize the *shape* but the settled result is UNRESOLVED and owned elsewhere.

**No status flips here.** A `supports` / `contradicts` / `conflicted` / `incomplete` result is *input to* adjudication, not adjudication. Promoting or demoting any element (a BM cell, a risk R1–R5, a differentiator) is **NEU-906's** exclusive authority via `LINK-4`; a High risk (R1–R5) is non-downgradable regardless of verdicts (NEU-899 `OC-7`). NEU-900 defines the protocol that produces well-formed, reproducible, isolated verdicts — nothing more.

## 5. Pre-execution inspection checklist (acceptance scenario 3)

Before NEU-904/NEU-905 collect any evidence, an inspector can confirm, per journey, that:

- [ ] repeat-run conditions are fixed (`03_…` §2) — held-constant and varied dimensions named;
- [ ] reviewers are **separately initialized** in fresh contexts (§1.1);
- [ ] each **initial verdict is isolated** from the creator's conclusion and from other verdicts until committed (§1.2, `03_…` §3 seal);
- [ ] the **context package is identical** across a journey's reviewers (§3);
- [ ] every reproduction condition is named — reviewer identity, provider, model/version, verbatim prompt, context exposure, run date, conditions (§2);
- [ ] disagreement → `conflicted` → NEU-906, and incomplete → carried, never counted (§4).

If any box cannot be checked, the journey's review is **not** reproducible and its result cannot count toward coverage.
