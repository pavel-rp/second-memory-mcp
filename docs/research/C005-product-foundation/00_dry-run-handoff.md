# Dry-Run Handoff Test (cold-context downstream agent)

**Task:** NEU-907 · **Compiled:** 2026-07-12
**Method:** one isolated agent, cold context, given **only** two starting pointers — `README.md` and `00_vocabulary.md` — and instructed to read nothing else in the corpus and to say "NOT RESOLVABLE from README+vocabulary" whenever the pair was insufficient. It answered five questions a downstream pedagogy-chapter agent would ask. Its answers are recorded verbatim below; the one gap it exposed was repaired, and the repair is recorded.

## Outcome

**Q1–Q4: fully resolvable** from the two entry files. **Q5: partially resolvable** — the entry pair gave the shape of the answer and the headline signals plus a correct one-hop pointer to the full inventory, but did not reproduce the complete nine-signal list. Repaired (see below).

## The five questions and the agent's verbatim answers

> **Q1. Who is the target learner?**
> Answer: A programmer who already has language competence plus basic-algorithm competence, seeking durable mastery and competitive-programming (CP) breadth, with dynamic programming (DP) as the first domain. This prerequisite boundary is a charter-fixed decision (DEC1), not an evidence finding; absolute beginners are walled out (EX1/BX-1).
> Source: `00_vocabulary.md` §3 "Target learner & fixed prerequisite boundary" (points to `product-model/00_learner-and-prerequisite-model.md` §1–2); corroborated by README "Read the substance" row 2. Fully resolvable.

> **Q2. What are the binding exclusions?**
> Answer: Six accepted exclusions EX1–EX6, plus their five boundary walls BX-1…BX-5, all "accepted" via MC-11 (never empirical): EX1 absolute beginners (BX-1); EX2 general all-algorithms product (BX-2); EX3 market/demand/WTP claims as validated fact (BX-3, actively enforced); EX4 selecting pedagogy/curriculum/UI/architecture/provider/telemetry/production behavior (BX-4); EX5 new research or exceeding the NEU-897 caps; EX6 raw operational-log payloads / un-gated log evidence (BX-5, enforces P5).
> Source: `00_vocabulary.md` §3 "EX* — Explicit exclusions" and "BX-1…BX-5"; README "Binding / accepted" bullet. Fully resolvable.

> **Q3. Provisional vs. settled — the distinction and examples.**
> Answer: The package draws a hard line by what it is *entitled* to decide.
> - **Settled / binding (accepted):** scope/process/privacy decisions the foundation may make by audit, never by empirical evidence — reserved for the MC-11 NON-MEASURED-SETTLED set only. Examples: DEC1–DEC5, EX1–EX6 + walls BX-1…BX-5, discipline principles P3/P5/P6, rejected alternatives RA1–RA6. No class-1–6 (empirical) element is ever "accepted."
> - **Provisional:** evidence present but insufficient to settle (class-1–6 and/or class-4↔class-3 corroboration, which is *not* external validity); needs class-7 or in-domain measurement to move. Examples: H-B1/BM-2 (retention direction), H-B2/BM-6 (adherence shape), R2, R8, the D-family positioning, principles P1/P2/P4.
> - (Two further states: **unresolved** — depends on a downstream artifact that doesn't yet exist, carrying an INC-* marker, e.g. R1/BM-1/BM-4 under INC-1; and **contradicted** — H-F3 only.)
> Source: README "Binding vs provisional vs unresolved" section; `00_vocabulary.md` §8 LINK-4 status table and §4 completeness lattice. Fully resolvable.

> **Q4. Where is the evidence for the grader finding, and what did it find?**
> Answer:
> - **What it found:** The literal hypothesis H-F3 — "AI grading over-validates a shallow/wrong DP answer → false confidence" — is **contradicted as worded**: the SHALLOW and WRONG cases were correctly failed. The real, bounded over-validation appears only on the **INCOMPLETE** archetype (correct core idea but missing base case / complexity / correctness argument), specifically cases ACS-1-03, -07, -11. The 3 CONTROL cases passed. Result reproduced **12/12 identical across 3 isolated runs** (RUN-1/2/3), grader = Claude Opus 4.8. The finding is "present-bounded" (PROXY-BOUNDING-PRESENT): bounded presence for the probed items under that grader model/version only — explicitly **never a rate, reliability, prevalence, or effect size**. It is carried forward as new hypothesis H-F3.1 and reaffirms rejected alternative RA5. It changes no status; DP-grading reliability remains unresolved (R3/INC-3).
> - **Where the evidence lives:** executed batch BATCH-AUTOEVAL in `autoeval-batch/` (owner NEU-903), per-case detail in `autoeval-batch/03_per-case-results.md` and integrity in `04_repeat-comparison-and-integrity.md`; protocol/contract in `automated-evaluation/` (ACL-4, AEP-1, ACS-1 v1.0 under MC-4); reformulation in root `00_hypothesis-reformulations.md`; adjudication in `adjudication/` (BM-5/FM4/H-F3, present-bounded).
> Source: README rows 8–9 and "Contradicted" bullet; `00_vocabulary.md` §6 (ACS-1, ACL-4, 12/12 result), §3 (FM4/BM-5), §8 ("present-bounded"). Fully resolvable at the level of *what the finding is and where the file lives*.

> **Q5. Which learner metrics are collectible today, and which are not?**
> Answer (partial — see flag):
> - **Collectible today:** per-attempt data is persisted (RQ4). `time_spent_ms` is COMPUTABLE-UNVALIDATED (computable from the codebase, but its real-usage reliability is unvalidated — MC-8, gap G4.1, needs a privacy-gated log query).
> - **Not collectible today:** `averageQuality` session-summary signal is UNCOMPUTED (hardcoded `0` — MC-7, FEAS-5, finding F4.3); a per-DP-pattern mastery signal is UNAVAILABLE (no schema field — MC-6, BM-8, gap G4.2). Also: operational logs are payload-bearing / partly unredacted (`src/shared/logger.ts` leaves learner `response` text unredacted, F4.4), so log-derived evidence must go through the PLA aggregate-only gate.
> **Partial-resolvability flag:** The two files give the FEAS *verdict vocabulary* and the three headline signals, but the vocabulary names FEAS-1…FEAS-9 — a nine-signal inventory — and only surfaces those three. The **complete per-signal collectibility list is NOT resolvable from README+vocabulary**; the missing pointer is `measurement-contracts/02_feasibility-and-telemetry-inventory.md` (owner NEU-901), where all nine FEAS verdicts live. `questions/RQ4.md` (F4.1–F4.5) is the other source.

> **Sufficiency verdict (agent's own):** Q1–Q4 fully answerable from the two entry files alone; Q5 forces a partial "NOT RESOLVABLE" — the entry pair states the shape and headline cases but not the complete metric inventory. The two files are near-sufficient for orientation and headline facts; any exhaustive per-signal or per-case question bottoms out at a package sub-file the vocabulary correctly points to but does not reproduce.

## Gap exposed and repair

**Gap.** For the exhaustive form of Q5 ("the complete list of which metrics are collectible"), the entry pair surfaced only three of the nine FEAS signals. One-hop resolution technically held — the vocabulary's FEAS row already named `measurement-contracts/02_feasibility-and-telemetry-inventory.md` as the defining file — but the entry files did not clearly signal that this file is *the canonical, complete answer* to "which metrics are collectible today," so the agent had to infer it.

**Repair (applied in this task).**
1. `00_vocabulary.md` §5 FEAS row rewritten to state explicitly that the nine-signal inventory in `measurement-contracts/02_…` **is the canonical complete answer** to "which learner metrics are collectible today," to label the three surfaced verdicts as illustrative (not the full nine), to add the RQ4 F4.1–F4.5 code-findings pointer, and to state the net conclusion (almost nothing is validated-and-collectible today; most desired signals are COLLECTION-GAP pending INC-2).
2. `README.md` measurement-contracts summary row now names `02_feasibility-and-telemetry-inventory.md` inline as the canonical "which learner metrics are collectible today" inventory.

Both repairs make the collectibility question route to its authoritative file in one deliberate hop rather than by inference. No other gap was exposed; Q1–Q4 required no repair.
