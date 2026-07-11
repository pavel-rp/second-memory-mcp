# Method & Provenance — C005 Product-Foundation Bounded Research Synthesis

**Task:** NEU-897 (SUB-2 of NEU-887, program C005) · **Compiled:** 2026-07-11
**Status:** Complete within declared caps. This document defines the reproducible method; the per-question records under `questions/` are the primary evidence.

This package is a **bounded, reproducible research synthesis**. It answers a predeclared, capped set of material product-research questions for the AI-backed dynamic-programming (DP) course foundation. It **makes no product, pedagogy, curriculum, UI, architecture, provider, telemetry, or production decision** — it supplies labeled, provenance-bearing evidence for the downstream learner/product-model task (NEU-898) and its siblings (NEU-899…907).

---

## 1. Caps (hard limits)

| Dimension | Cap | Enforcement |
| --- | --- | --- |
| Material research questions | **≤ 6** | Predeclared in `02_research-questions.md` before any findings. |
| Candidate sources **reviewed** per question | **≤ 5** | Recorded in each question's candidate ledger. |
| Sources **included** per question | **≤ 3** | Recorded in each question's inclusion ledger. |

A cap is **never silently expanded.** If a seventh material question emerged, or a sixth candidate source was needed to answer one question, the need is recorded in `04_caps-and-incomplete-scope.md` and the affected item is left **incomplete**, not extended. The full caps tally is in `04_caps-and-incomplete-scope.md`.

## 2. Question selection

Questions were framed by the **fixed target audience** carried from the intake and parent charter (NEU-887), which this task does **not** re-litigate: *programmers with language and basic-algorithm competence who seek durable mastery and competitive-programming breadth.* Absolute beginners and general all-algorithms learners are out of audience.

A question was declared **material** when the evidence bearing on it could plausibly change a later chapter's learner model, product principle, differentiator, benchmark-state coverage, evidence class/limitation, a binding requirement, a success metric/threshold, or a High/Critical risk. Six such questions were declared (RQ1–RQ6). Candidate questions considered but **not** declared material within the cap are listed in `04_caps-and-incomplete-scope.md`.

## 3. Search interfaces used

| Interface | Used for | Access record |
| --- | --- | --- |
| `WebSearch` tool (Claude Code), US region | RQ1, RQ2, RQ3, RQ5 primary literature/tool discovery | Exact query string recorded per question; **web cutoff 2026-07-11**. |
| Repository research corpus `docs/research/results/*` + `docs/research/SYNTHESIS.md` | Reused labeled candidate sources across RQ1–RQ6 | Cited by repo path; those reports carry their own **verification cutoff 2026-07-07**. |
| Repository source tree (`src/**`, `README.md`) via Read/Grep | RQ4 code evidence only | Cited by file path + line; commit base `origin/develop` @ `e96a6c4`. |

**Source-selection rule (applied uniformly):** from the candidate list a query returned, prefer (a) primary or official sources over listicles/SEO aggregators, (b) sources whose population/domain matches the target audience (adult, already-competent programmers; algorithmic problem-solving) over mismatched populations (e.g. primary-school, second-language), and (c) systematic reviews / meta-analyses over single studies. Every inclusion and every exclusion carries a one-line rationale in its question record.

**Cutoff policy:** each web-derived claim is valid as of **2026-07-11**; each repo-research-derived claim inherits the underlying report's **2026-07-07** verification date. No claim is asserted beyond its recorded cutoff.

## 4. Provenance conventions

Every claim in a question record and in the synthesis carries:
- an **evidence-class label** (see `01_evidence-taxonomy.md`), and
- a **provenance pointer** — a URL (web), a repo path (repo research / code), or, for any operational-log-derived claim, an aggregate/query-scope descriptor only (never a raw payload).

Claims recalled from general knowledge without a retrievable source in this pass are marked **[unverified]** and treated as gaps, not findings.

## 5. Privacy gate (operational-log evidence)

This task **does not access payload-bearing operational logs.** That is out of scope here and is gated by NEU-887 OUT-4. The code evidence in RQ4 is limited to what the **source tree** declares about signal availability. The constraint is real and code-grounded: `src/shared/logger.ts` (the `LOG_REDACT` config, lines 24–56) redacts only credential/secret fields and **intentionally leaves learner `response` text unredacted** ("Learner `response` text is intentionally NOT redacted — it is useful diagnostic data"). Consequently, any future log-derived claim must use **query scope / time range / field list / aggregate counts** as provenance and must never copy raw learner payloads into an artifact. No file in this package contains a raw log payload.

## 6. Claim discipline (what this package must never say)

No evidence in this package — literature, code, dogfooding, AI critique, automated evaluation, or operational-log — may be presented as **external-user, expert, or broad-market validation.** Literature findings describe what studies report; code findings describe what the codebase declares; neither validates the proposed DP product with real users. An adversarial self-check for unsupported validation/generalizability phrasing was run before completion; its result is recorded in `03_synthesis.md` §Adversarial self-check.
