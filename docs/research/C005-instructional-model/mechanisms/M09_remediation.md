# M09 — Remediation

**Mechanism:** Detecting and intervening on persistently-failing items (leeches) and on lapses. **Task:** NEU-915 · **Cutoff:** 2026-07-07 (reused). **Makes no decision.**

## Scope

For DP acquisition by the fixed audience, remediation is what happens when a concept keeps failing: flag it, reformulate it, re-teach it, or set it aside — and how a lapse (a forgotten previously-known item) is handled. This file collects the evidence on leech intervention and post-lapse handling. It selects no threshold or intervention.

## Labeled findings

**F-M09-1** — `[literature]` · Flagging persistently-failing items and intervening is standard practice; the intervention is **reformulate/re-present**, not merely suspend: a leech is "an element that causes problems in the learning process," and "the most efficient method to deal with leeches is to change how the information is presented." *Provenance:* http://super-memory.com/archive/help99/leech.htm; https://docs.ankiweb.net/leeches.html (reused, audit Q7). *Cutoff:* 2026-07-07. *Evidence type:* deployed-system practice. *Limitation:* Practice conventions, not controlled outcome studies; no academic ITS literature uses "leech" (audit UNVERIFIED).

**F-M09-2** — `[literature]` · Thresholds vary and are not equivalent across counting rules: Anki flags at **8 lifetime lapses** ("When this counter reaches 8, Anki tags the note as a leech and suspends the card"), which is cumulative, not consecutive — so a small *consecutive* threshold is structurally far more sensitive. *Provenance:* https://docs.ankiweb.net/leeches.html; Anki forums (reused, audit Q7). *Cutoff:* 2026-07-07. *Evidence type:* deployed-system spec. *Limitation:* No causal basis for any specific threshold; "8" is a product default, not an optimum.

**F-M09-3** — `[literature]` · **Post-lapse memory is partially retained (savings), not zeroed** — evidence against full reset. FSRS post-lapse stability is a function of *prior* stability, capped below but "never greater than stability before the lapse," never zeroed; Ebbinghaus savings shows "forgotten" material relearns faster than fresh. *Provenance:* https://expertium.github.io/Algorithm.html; Murre & Dros (2015), PLOS ONE 10(7):e0120644 (reused, audit Q6). *Cutoff:* 2026-07-07. *Evidence type:* algorithm design + causal replication. *Limitation:* FSRS formula is a fitted model; savings magnitude varies by material.

**F-M09-4** — `[literature]` · Massed same-session recovery repetitions buy mostly *performance*, not durable memory — relevant to recovery gates: spaced criterion recalls yielded 68% vs 26% for massed (M04 F-M04-2). *Provenance:* Rawson & Dunlosky (2022), https://journals.sagepub.com/doi/full/10.1177/09637214221100484 (reused, audit Q5). *Cutoff:* 2026-07-07. *Evidence type:* causal. *Limitation:* Recovery-count parameters have "no evidence either way" for exact numbers.

## Cognitive-load / desirable-difficulty note

Remediation is a **difficulty-relief valve**: a leech is an item that has fallen *outside* the accomplishable band (persistently unlearnable as presented), so the evidenced response is to lower difficulty by *reformulating* the content (F-M09-1), not to keep failing the learner at the same presentation. Post-lapse handling (F-M09-3) is about not over-penalizing difficulty — resetting a well-established item to first-exposure difficulty discards real prior learning.

## DP-transfer uncertainty

Leech/lapse conventions come from flashcard SRS on facts; whether the same thresholds and post-lapse curves apply to conceptual DP chunks is unmeasured (F-TR-3). DP effectiveness stays provisional; a DP concept may "leech" for reasons (missing prerequisite, poor chunking) that differ from a fact-recall leech.

## Prior in-repo reconciliation evidence (evidence only — verdict deferred)

**F-M09-5** — `[code-evidence]` · Leech = **3 consecutive** failures → flagged, EF −0.20, chunk becomes `remediation` type, excluded until manually resolved; a `leechFailureThreshold=6` field is dead code. Lapse (q<3) unconditionally resets **repetitions→0 and interval→1d** regardless of prior review depth (EF is penalized-and-retained, not reset). Both diverge from F-M09-2/3. *Provenance:* `docs/research/03-pedagogy-evidence-audit.md` (recon), audit Q6/Q7; `src/domain/algorithms/sr-calculator.ts`, `src/domain/algorithms/classify-chunk.ts`. *Cutoff:* 2026-07-07. *Evidence type:* code fact. *Limitation:* Availability; the full-reset-vs-savings conflict (see `03_synthesis.md` C3) is evidence for the reconciliation sub-task — verdict deferred.
