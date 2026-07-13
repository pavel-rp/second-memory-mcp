# M02 — Worked Examples

**Mechanism:** Presenting fully or partially worked solutions for study, versus having the learner solve unaided. **Task:** NEU-915 · **Cutoff:** 2026-07-13. **Makes no decision.**

## Scope

For DP acquisition by the fixed audience, worked examples are complete solution derivations (problem → recurrence → state definition → transition → base case → implementation) studied rather than produced. This file collects the evidence on when worked-example study beats problem-solving and when it stops helping. It selects no policy.

## Labeled findings

**F-M02-1** — `[literature]` · The worked-example effect is one of the most robust cognitive-load effects: "improved learning observed when worked examples are used as part of instruction, compared to other instructional techniques such as problem-solving and discovery learning," and per Sweller "the best known and most widely studied of the cognitive load effects." For novices, worked-example study is "generally more effective for learning and transfer than instruction consisting of problem solving, and is also often more efficient" in early skill acquisition. *Provenance:* https://en.wikipedia.org/wiki/Worked-example_effect. *Cutoff:* 2026-07-13. *Evidence type:* causal (many controlled studies) synthesized. *Limitation:* Strongest for novices and well-structured domains; "transfer" here is within-topic, not measured on DP.

**F-M02-2** — `[literature]` · The effect is meta-analytically supported with a moderate effect size. Crissman (2006) reported an effect size of **0.52** across worked-example studies; a 2023 meta-analysis of the worked-examples effect on mathematics performance (Barbieri et al., *Educational Psychology Review*, DOI 10.1007/s10648-023-09745-1) reports a significant positive effect. *Provenance:* Crissman d=0.52 via search summary (secondary, not primary-fetched — carried as directional); Barbieri et al. 2023 DOI confirmed to exist, but its exact pooled effect size could not be extracted in this task and is marked **UNVERIFIED**. *Cutoff:* 2026-07-13. *Evidence type:* meta-analytic (magnitudes partly UNVERIFIED). *Limitation:* Specific pooled numbers not verbatim-confirmed here; direction is well-supported, precise magnitude is not.

**F-M02-3** — `[literature]` · **Expertise reversal:** worked examples lose effectiveness — and can turn *negative* — as expertise grows. "The efficiency effect of worked examples became ineffective and often resulted in negative effects for more knowledgeable learners" (Kalyuga). Continuing full worked examples past rising expertise "can result in redundancy and an increased extraneous cognitive load." *Provenance:* https://en.wikipedia.org/wiki/Worked-example_effect; Kalyuga 2007 (https://www.uky.edu/~gmswan3/EDC608/Kalyuga2007_Article_ExpertiseReversalEffectAndItsI.pdf). *Cutoff:* 2026-07-13. *Evidence type:* causal (controlled expertise-by-treatment interaction). *Limitation:* "Expertise" is domain-specific and here unmeasured for DP sub-skills.

**F-M02-4** — `[literature]` · **Guidance fading / pairing:** gradually fading worked steps outperforms fixed worked examples or unaided problem solving, and the optimal pairing depends on expertise. "It is effective to successively fade out worked solution steps"; "novices benefited more from example–problem pairs, whereas experts benefited more from problem–example pairs and faded examples sequences," with adaptive fading beating fixed fading beating problem solving. *Provenance:* https://en.wikipedia.org/wiki/Worked-example_effect; Sweller guidance-fading (https://cogscisci.wordpress.com/wp-content/uploads/2019/08/sweller-guidance-fading.pdf); pairing claim via search summary (directional). *Cutoff:* 2026-07-13. *Evidence type:* causal (fading experiments). *Limitation:* Adaptive fading requires a per-learner expertise estimate; feasibility for DP in this product is unaddressed here.

## Cognitive-load / desirable-difficulty note

Worked examples are the paradigm **extraneous-load reduction** lever for novices — they replace high means-ends search with schema study (F-M02-1). But they sit on the desirable-difficulty dial: past a learner's expertise threshold they *remove* productive difficulty and add redundant load (expertise reversal, F-M02-3). Fading (F-M02-4) is the mechanism for restoring desirable difficulty as expertise grows. This is the clearest case of "reduce load" and "preserve desirable difficulty" being the same dial at different expertise levels (`02_…` §4).

## DP-transfer uncertainty

Worked-example transfer is measured within topics (math, physics, well-structured problems), not on dynamic-programming far transfer. Whether studying DP worked examples yields novel-DP-problem-solving transfer is unmeasured (F-TR-1/3); DP effectiveness stays provisional. Note the general finding that far transfer is hard (`02_…` F-TR-1) applies with full force here.

## Prior in-repo reconciliation evidence (evidence only — verdict deferred)

**F-M02-5** — `[code-evidence]` · The existing system delivers single-concept teaching scripts (200–8000 chars) with difficulty ≥4 triggering "incremental delivery pacing," and its retrievability tiers already degrade toward more-supported formats at low R (scaffold→multiple choice). There is no explicit worked-example *fading* construct tied to a per-learner expertise estimate. *Provenance:* `docs/research/03-pedagogy-evidence-audit.md` (recon); `src/domain/algorithms/classify-chunk.ts`. *Cutoff:* 2026-07-07. *Evidence type:* code fact. *Limitation:* Availability only; whether tiered instruction is a valid proxy for expertise-adaptive fading is a reconciliation-sub-task verdict, not made here.
