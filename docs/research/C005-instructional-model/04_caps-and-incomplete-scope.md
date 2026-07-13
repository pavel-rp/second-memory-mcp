# Caps & Incomplete Scope

**Task:** NEU-915 · **Cutoff:** 2026-07-13
This synthesis inherits NEU-887's caps and materiality discipline rather than defining its own. This file states the caps applied, what fell outside them, and what the synthesis honestly does not cover — so a downstream agent never mistakes a bounded stop for a settled conclusion.

## 1. Inherited caps and materiality rule

- **Caps are hard** (NEU-887 revision rules, `docs/research/C005-product-foundation/README.md`): research scope is bounded, exceedance is recorded as incomplete scope and never silently expanded. This synthesis applies that discipline to literature search: a **small number of anchor sources per thinly-covered mechanism** (worked examples, sequencing, cognitive load, transfer) rather than an exhaustive sweep, plus reuse of the prior audit's already-live-verified corpus for the remaining mechanisms.
- **Materiality rule** (NEU-887 `product-model/02_materiality-rule-and-candidate-inventory.md`): only material elements are inventoried; immaterial detail is excluded. Applied here: a mechanism gets labeled findings sufficient for a downstream decision, not a literature review of everything published on it.
- **Provisional by default; conflicts and gaps preserved, not smoothed** (inherited). Every finding is revisable; no gap is filled with an invented value.

## 2. What this synthesis deliberately does NOT do (scope walls)

1. **No instructional decision.** No mechanism behavior, mastery signal, threshold, timing, or reconciliation verdict is chosen. Those are the NEU-888 mechanism-decision, mastery-model, and reconciliation sub-tasks.
2. **No scaffolding build.** It does not extend NEU-887's traceability register or adjudication ledger, and does not author the decision-record template — that is the separate follow-on scaffolding sub-task, explicitly out of scope for NEU-915.
3. **No experiments.** It runs no dogfooding, AI-critique, automated-eval, or MCP-workflow experiment; it generates no class-3/4/5 evidence. Targeted experiments belong to the experiment sub-task (NEU-888 OUT-6).
4. **No code change.** The existing Second Memory files are read as a compatibility fact; none are modified. Any implied scheduler/MCP change is routed to a later implementation charter.
5. **No DP-taxonomy enumeration, no lessons/assessments, no model/UI/provider selection.**

## 3. Incomplete-scope register (bounded stops, honestly marked)

| # | Incomplete item | Why bounded | Where flagged |
| - | --- | --- | --- |
| INC-1 | DP-domain transfer of every mechanism is unmeasured | No in-domain study sought/found within caps; inherited R1 | `03_synthesis.md` G1; every mechanism's transfer note |
| INC-2 | Three spec-named input files absent from repo | Files not present; cannot cite what does not exist | `00_method…` §2.2 / §5; `03_synthesis.md` G2 |
| INC-3 | Worked-example pooled effect sizes partly UNVERIFIED | PDFs did not decode; not asserted beyond direction | M02 F-M02-2; `03_synthesis.md` G4 |
| INC-4 | Exact criterion/recovery/attempt counts unsupported | "No evidence either way" for the specific numbers | M04/M07; `03_synthesis.md` G6 |
| INC-5 | Session-length / daily-cap numbers unanchored | Prior audit Q12 found them evidence-free | `03_synthesis.md` G5 |
| INC-6 | Specific LLM-bias percentages UNVERIFIED | Never primary-confirmed in prior audit | M08; `03_synthesis.md` G7 |
| INC-7 | Working-memory capacity precision (Cowan ~4) UNVERIFIED | Not independently fetched; principle used, number not | `02_…` F-CL-1; `03_synthesis.md` G8 |

## 4. Verification cutoff statement

- **Fresh literature** searched and cited in this task: verification cutoff **2026-07-13**. Every fresh `[literature]` finding carries a URL; where a primary datapoint could not be extracted it is marked UNVERIFIED and confined to a directional statement.
- **Reused prior in-repo research** (`docs/research/results/03-pedagogy-evidence-audit.md`, `docs/research/SYNTHESIS.md`): inherits its stated cutoff **2026-07-07**. Its `UNVERIFIED` items are carried forward as gaps, not upgraded.
- **Existing-code facts** (`[code-evidence]`): as of the develop base at compile time; the one contested characterization (prerequisite gating) is marked for re-verification (C1).

Any downstream sub-task extending this synthesis must state its own cutoff and may overturn any finding here with stronger, correctly-classed evidence, in the adjudication ledger the scaffolding sub-task will build — not by editing these findings in place.
