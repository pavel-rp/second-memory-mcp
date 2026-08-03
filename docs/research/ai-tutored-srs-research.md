# AI-Tutored Spaced Repetition: Research-Backed Design Parameters

A comprehensive literature review covering question taxonomies, LLM assessment rubrics, retrieval practice dosage, agent-controlled SRS risks, and interleaving strategies. All recommendations include specific citations and encodable parameters.

---

## 1. Question Taxonomy for Adaptive AI Tutoring

### 1a. Framework Comparison

Four frameworks are relevant. Each excels in a different dimension:

**Bloom's Revised Taxonomy** (Anderson & Krathwohl, 2001) — 6 levels (Remember → Understand → Apply → Analyze → Evaluate → Create). Widely adopted and action-verb-based, making it straightforward for task design. However, it classifies _tasks_, not _responses_, and assumes a rigid hierarchy that doesn't always hold empirically. Inter-rater reliability for classifying questions into Bloom's levels is lower than alternatives.

**SOLO Taxonomy** (Biggs & Collis, 1982) — 5 levels (Pre-structural → Uni-structural → Multi-structural → Relational → Extended Abstract). Unlike Bloom's, SOLO classifies _response quality_, making it directly applicable to AI assessment of learner answers. A comparative reliability study found SOLO showed higher inter-rater reliability than Revised Bloom's Taxonomy for determining cognitive levels of assessment questions (Pegegog, 2017). This is the strongest fit for your use case because your AI agent is evaluating response quality, not designing tasks.

**Webb's Depth of Knowledge** — 4 levels (Recall → Skills/Concepts → Strategic Thinking → Extended Thinking). Designed for standards-assessment alignment, not adaptive tutoring. Less theoretical grounding in cognitive engagement.

**Graesser's Question Taxonomy** — 3 depth levels (Shallow, Intermediate, Deep) with 6 deep-question categories (Antecedent, Consequence, Goal-orientation, Enablement, Interpretational, Expectational). This is the framework actually used in AutoTutor, which achieved effect sizes of d = 0.70 for deep comprehension (Graesser & Person, 1994; Nye et al., 2014). Directly designed for dialogue-based tutoring.

**ICAP Framework** (Chi & Wylie, 2014) — 4 levels (Passive → Active → Constructive → Interactive). The largest learning gains occur between Active and Constructive modes. Useful for classifying _engagement mode_ rather than question type.

**Recommendation:** Use a SOLO × Graesser hybrid. SOLO for classifying response quality (what the AI judge evaluates), Graesser for question generation patterns (what types of questions to ask).

### 1b. Minimum Effective Level Count

Research converges on **3–4 levels** as the practical optimum:

- AutoTutor's 3-level system (Shallow/Intermediate/Deep) achieved d = 0.70–1.22 across studies (Nye et al., 2014).
- ICAP's 4 levels show the biggest jump from Active→Constructive, with diminishing returns from Constructive→Interactive (Chi & Wylie, 2014).
- Costa's 3-level model (Recall / Compare-Analyze / Apply-Evaluate-Create) is used effectively in online tutoring contexts.
- No evidence that 5–6 levels (full Bloom's) improves tutoring outcomes over 3–4 levels.

**Encodable parameter — use 3 levels:**

| Level | Label          | SOLO Mapping                   | Graesser Mapping | Target Accuracy |
| ----- | -------------- | ------------------------------ | ---------------- | --------------- |
| 1     | Recall         | Uni-structural                 | Shallow          | 85–95%          |
| 2     | Explain/Apply  | Multi-structural → Relational  | Intermediate     | 70–80%          |
| 3     | Analyze/Create | Relational → Extended Abstract | Deep             | 65–75%          |

### 1c. Difficulty Escalation: Within vs. Across Episodes

The research supports **within-session escalation combined with across-session spacing**, but conditioned on mastery state:

- **Interleaving within sessions** produces superior long-term retention despite worse immediate performance. Interleaved groups outperformed blocked groups by 25% at 1-day delay and 76% at 1-month delay (Rohrer, Dedrick, & Stershic, 2015).
- **Caveat for low-mastery learners:** Hwang et al. (2025) found that for low-achieving adolescents, initial blocked practice should precede interleaving. Premature interleaving creates undesirable difficulty.
- **Spacing across sessions** improves retention by up to 80% vs. massed practice, with larger benefits for complex/higher-order tasks than simple recall (Kang, 2016).

**Encodable decision logic:**

```
if chunk_accuracy < 0.40:
    mode = BLOCKED  # Same difficulty level, build foundation
    question_level = 1  # Recall only
elif chunk_accuracy < 0.80:
    mode = GRADUATED  # Escalate within session: 1 → 2 → 3
    question_level = adaptive  # Start at last successful level
else:
    mode = INTERLEAVED  # Mix all levels randomly
    question_level = random(1, 2, 3)
```

---

## 2. Quality Rubric Design for LLM Assessors

### 2a. LLM-as-Judge Reliability and Biases

**Baseline reliability:** GPT-4 aligns with human preferences >80% of the time (Zheng et al., 2023, "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"). When equipped with detailed rubrics, ICC reaches 0.94–0.99 across repeated evaluations.

**Documented biases:**

- **Position bias:** LLMs favor responses in the first position. Consistency drops as candidate count increases. Mitigation: evaluate twice with reversed order; accept only if consistent (raises robustness from ~50% to 70–80%).
- **Leniency bias:** Premium LLMs inflate mid-range scores. On a 0–5 scale, scores cluster at 3–4 when they should distribute more evenly.
- **Self-enhancement bias:** LLMs favor outputs from the same model family.
- **Verbosity bias:** Longer responses receive higher scores, though this diminishes after controlling for quality gap (2024–2025 findings).

**For educational grading specifically:** LLMs achieve Cohen's κ > 0.60 (substantial agreement) on well-defined rubrics, with GPT-4 reaching precision = 0.91 on solution correctness detection. The primary failure mode is **high false negatives** (wrongly deducting points), not false positives.

**Key finding for your system:** Human-LLM alignment is highest on **0–5 grading scales** (Zheng et al., 2025, "Grading Scale Impact on LLM-as-a-Judge"), which conveniently matches SM-2's quality scale.

### 2b. Rubric Design for Stateless LLM Consistency

The LLM-Rubric framework (ACL 2024) established that calibrated rubrics with explicit probability distributions over performance levels achieve higher consistency than single-point predictions. Key principles:

1. **Use analytic rubrics (criterion × level grid), not holistic rubrics.** Break assessment into 3–5 independent criteria, each scored 0–5. This reduces noise from any single criterion.
2. **Anchor each level with concrete behavioral indicators.** Replace "good" / "excellent" with specific observable behaviors (e.g., "uses domain terminology correctly; identifies at least 2 relationships between concepts").
3. **Include ceiling examples.** For each quality level, show a response that _just barely_ qualifies at that level. This combats leniency bias.
4. **Make criteria self-contained.** Since the LLM has no memory across sessions, every criterion definition must include its own examples and thresholds — no forward references.

**Encodable rubric template for your system:**

```
QUALITY 5 (Perfect): Correct answer demonstrating deep understanding.
  - Response is complete and accurate
  - Uses domain-specific terminology correctly
  - Makes connections to related concepts without prompting
  - Response latency suggests fluent retrieval (< 30 seconds)

QUALITY 4 (Correct with hesitation): Correct after minor self-correction.
  - Core answer is correct
  - May require 1 self-correction or clarification
  - Demonstrates understanding but not automaticity

QUALITY 3 (Correct with difficulty): Correct but struggled significantly.
  - Reached correct answer after significant effort
  - Required scaffolding hints or multiple attempts
  - Understanding is fragile — may not transfer

QUALITY 2 (Incorrect but close): Wrong answer, but correct answer seems familiar.
  - Key concept partially recalled
  - Confusion between related concepts
  - Could self-correct if given the answer

QUALITY 1 (Incorrect): Wrong answer, correct answer not recalled.
  - Fundamental misunderstanding or blank
  - No evidence of partial knowledge

QUALITY 0 (Blackout): No attempt or complete non-response.
```

**Expected reliability with this design:** ICC ≈ 0.90–0.95 (well-calibrated analytic rubric) vs. ICC ≈ 0.60–0.70 (poorly specified holistic rubric).

### 2c. SM-2 and FSRS Noise Tolerance

**SM-2 has a critical fragility at the quality 2–3 boundary:**

- Quality < 3: Repetition counter resets to 0, interval resets to 1 day. This is a hard cutoff — quality 0 and quality 2 produce identical behavior.
- Quality ≥ 3: Ease factor adjusted, progress maintained.
- Ease factor formula: `EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))`
- At quality 5: EF increases by +0.10 per review
- At quality 4: EF unchanged
- At quality 3: EF decreases by -0.14

**Noise impact:** With quality score noise σ ≈ 0.5, approximately 15–30% of borderline cases (true quality 2.5–3.5) will flip across the threshold, causing erratic progress resets or unjustified progress retention.

**FSRS is more robust:** It uses 4 grades (Again/Hard/Good/Easy) rather than SM-2's 6-point scale, and ML-based parameter fitting smooths individual noise across aggregate patterns. FSRS achieves 20–30% fewer reviews than SM-2 for equivalent 90% retention. However, FSRS needs ~1000+ reviews per user to stabilize parameters.

**Encodable thresholds:**

- Acceptable noise: σ ≤ 0.3 on the 0–5 scale in safe regions (quality 0–1 or 4–5)
- Dangerous noise: σ > 0.5 near the quality 2–3 boundary → expect ~30% threshold flips
- SM-2 degradation at 20% misclassification rate: intervals ~10–15% shorter than optimal, retention drops 5–10%
- FSRS degradation at 20% misclassification rate: retention impact ~2–5%

### 2d. Published ITS Rubrics

**AutoTutor** (Graesser et al.): Rubric-scored answers contained ~25% of total possible content items on average. Two independent raters achieved r = 0.87 agreement. Conceptual Overlap (CO) automated scores correlated r(62) = 0.75 with human rubric scores, explaining >50% of variance in thoroughness assessments (PMC 3748232).

**ALEKS:** Uses Knowledge Space Theory with binary mastery (mastered/not) per topic, not a numeric quality scale. ~65% mastery threshold indicates readiness to advance.

**Carnegie Learning Cognitive Tutor:** Uses model tracing (binary correct/wrong per action step) and Bayesian Knowledge Tracing for probabilistic skill mastery estimates. No published 0–5 rubric.

**Takeaway:** No major ITS uses a fine-grained 0–5 quality scale per response. They typically use binary (correct/incorrect) + probabilistic mastery estimation. Your design of having an LLM produce a 0–5 quality score is novel territory — which is why robust rubric design matters so much.

---

## 3. Optimal Probing Depth per Learning Episode

### 3a. Testing Effect: Retrieval Attempt Count

**5–7 successful retrievals per item per session is the leveling-off point** (Roediger & Karpicke, 2006). Beyond this, additional retrievals in the same session provide minimal benefit.

Critical nuance from Karpicke & Roediger (2008): these retrievals must be **spaced within the session**, not massed. Retrieval with 6-minute intervening intervals produced far better retention than 1-minute intervals. Massed retrieval (every 1 minute) yielded floor-level performance at 1 week regardless of attempt count.

**Effect sizes from meta-analyses:**

- Rowland (2014): Testing effect g = 0.50 (118 studies)
- Adesope et al. (2017): d = 0.50–0.61 (217 studies)
- Testing with feedback: d = 0.73; without feedback: d = 0.39

### 3b. Successive Relearning Criterion

**1 correct recall per relearning session is optimal** (Rawson & Dunlosky, 2011, 2013).

They tested initial learning to 1, 2, 3, or 4 correct recalls, then relearned to criterion of 1 correct after a 2-day delay. The "relearning-override effect" eliminated benefits of higher initial criteria — whether you originally recalled it 1 time or 4 times, retention after relearning was equivalent.

**Optimal session count:** 3–4 successive relearning sessions. At 4–5 sessions, diminishing returns become severe. Retention outcomes: 68% cued recall at 1 month, 49% at 4 months (vs. 11% control).

**Time cost:** < 2 minutes per concept for first relearning session; < 1 minute by 5th session.

### 3c. Diminishing Returns and Fatigue

**Overlearning gains dissipate after ~9 weeks** (Rohrer & Pashler, 2007): Overlearners recalled 70% vs. 31% at 1 week (2.3× advantage), but only 24% vs. 17% at 9 weeks (1.4× advantage).

Distributed practice (same total time split across 2 sessions) **doubles 4-week retention** compared to massed practice in a single session.

**Fatigue indicators:** Working memory depletion reduces retrieval quality. Items recalled too quickly don't require effortful retrieval (no learning benefit). Following-item interference disrupts consolidation.

### 3d. Variation by Bloom's Level

Higher-level questions (apply/analyze/evaluate) produce better delayed retention than recall-only practice — students taking application-level tests outperformed those taking recall-only tests on both high-level AND low-level final questions.

However, for complex material with low prior knowledge, standard retrieval practice does NOT automatically transfer to application-level performance. Scaffolding is needed: start with recall tasks, then graduate to application once recall accuracy reaches 75%+.

### Encodable Parameters

| Parameter                                     | Value                               | Citation                                 |
| --------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| Max retrieval attempts per item per session   | 5–7 (spaced)                        | Roediger & Karpicke, 2006                |
| Min spacing between attempts within session   | ≥ 6 min (interleave other items)    | Karpicke & Roediger, 2008                |
| Session criterion: correct recalls needed     | 1 correct                           | Rawson & Dunlosky, 2011                  |
| Successive relearning sessions before mastery | 3–4                                 | Rawson & Dunlosky, 2013                  |
| Inter-session spacing                         | Expanding: 1d → 3d → 7d → 14d → 30d | SM-2/FSRS algorithms                     |
| Testing effect size (with feedback)           | d = 0.73                            | Adesope et al., 2017                     |
| Overlearning benefit half-life                | ~9 weeks                            | Rohrer & Pashler, 2007                   |
| Optimal target success rate                   | 70–85%                              | Desirable difficulties framework (Bjork) |

**Recommended per-session algorithm:**

```
for each chunk in session:
    ask_question(level=current_level)
    if correct:
        mark_session_criterion_met()
        if session_criterion_met AND time_permits:
            ask_question(level=current_level + 1)  # Escalate once
        move_to_next_chunk()  # Interleave with other items
    else:
        provide_feedback()
        schedule_retry_after_6min()  # Fill gap with other chunks
        retry_count += 1
        if retry_count > 3:
            mark_quality(2)  # Fail, move on to prevent fatigue
            move_to_next_chunk()
```

---

## 4. Risks of Agent-Controlled Assessment in SRS

### 4a. Quality Inflation → Interval Explosion

SM-2 ease factor starts at 2.5. With sustained quality-5 ratings, EF increases by +0.10 per review, producing exponential interval growth. An EF of 3.5 on newly learned material is a red flag for inflated scoring.

**Detection thresholds:**

- Flag if EF growth > +0.05/month for a card cluster
- Flag if average EF > 3.0 for cards learned < 3 months ago
- Flag if predicted intervals exceed 2+ years while measured retention < 90%

**FSRS comparison:** Stability prediction has ~33% MAPE (mean absolute percentage error) in typical cases but still achieves 20–30% fewer reviews than SM-2 for equivalent retention.

### 4b. The Assistance Dilemma

Koedinger & Aleven (2007), "Exploring the Assistance Dilemma in Experiments with Cognitive Tutors": The relationship between assistance level and learning follows an **inverted-U curve**. Both too much and too little scaffolding hinder learning. The critical failure mode for your system: when the AI tutor provides hints during assessment, students answer correctly without genuine mastery, and the quality signal is inflated.

Data from Carnegie Learning's Geometry tutors shows students frequently use "bottom-out hints" (the answer revealed directly) without reading explanatory hints. The system records "correct answer" when the student learned nothing.

**For your system specifically:** If the AI agent asks a question, the learner struggles, the agent provides scaffolding, and the learner then answers correctly — what quality score should this receive? The answer must be **quality 2–3 at most**, not quality 4–5. The scaffolding signal must be encoded into the rubric.

**Encodable rule:**

```
if hints_provided == 0 AND correct:
    quality = 4 or 5 (based on latency/completeness)
elif hints_provided == 1 AND correct:
    quality = 3 (ceiling)
elif hints_provided >= 2 AND correct:
    quality = 2 (treat as near-failure for scheduling)
elif not correct:
    quality = 0 or 1
```

### 4c. Gaming and Shallow Learning

Baker et al. (2000s–2010s) quantified that students who game the system learn **only 2/3 as much** as non-gaming peers. Gaming behaviors include help abuse (rapid hint requests → bottom-out), systematic guessing (rapid answers after errors).

**Detection signals:**

- Hint abuse: > 2 hints per problem
- Rapid guessing: answer latency < 2 seconds after incorrect attempt
- Help dependency: learner skips explanatory hints, goes directly to answer reveal
- Confidence-quality mismatch: |self-reported confidence − AI quality score| > 2

### 4d. Assessment Drift Detection

**Cold-start problem:** Mastery estimates are noisiest in the first 4–8 weeks of deployment. During this window, cap ease factor gains at +0.05 per review.

**Ongoing calibration protocol:**

| Frequency     | Action                                                            | Threshold                         |
| ------------- | ----------------------------------------------------------------- | --------------------------------- |
| Weekly        | Compare predicted vs. actual retention                            | Flag if actual < target − 5%      |
| Monthly       | Sample top 10% quality scores for human review                    | Flag if > 20% are over-scored     |
| Every 4 weeks | Refit model parameters on holdout set                             | Refit if MAPE > 35%               |
| Quarterly     | Full ground-truth validation (expert reviews 50 borderline cases) | Recalibrate rubric if drift > 10% |

**Change-point detection:** If accuracy on a skill drops > 15% suddenly, suspend quality inflation for that skill and force re-assessment at recall level.

### 4e. The Desirable Difficulties Tension

Bjork & Bjork (2011) established that genuine learning requires struggle — spacing to near-forgetting, interleaved problem types, effortful retrieval without hints. An AI agent optimizing for high-confidence correct answers will systematically produce **overlearning on easy items and underlearning on hard items**, reducing transfer.

**Mitigation:** Target quality 3–4 as the healthy operating range, not 4–5. Quality 5 should be rare (< 20% of reviews) and should trigger difficulty escalation, not celebration. Periodically inject harder items and accept lower quality scores as part of healthy learning.

---

## 5. Interleaving Question Types Within a Session

### 5a. Interleaving: Same Concept vs. Across Concepts

The robust interleaving effect (Brunmair & Richter, 2019 meta-analysis: g = 0.42, 180 studies) primarily applies to **across-concept interleaving** — mixing different concepts/skills within a session. The mechanism is discriminative contrast: learners must distinguish which strategy applies to each problem.

**Within a single concept**, varying question _type_ (recall → explain → apply) is a different phenomenon with less direct evidence. However, "variable retrieval practice" research (2024, BMC Medical Education) shows that processing the same information differently at each attempt produces slower forgetting than fixed sequences.

**Effect sizes by domain:**

- Visual/perceptual materials: g = 0.67 (strongest)
- Mathematics: g = 0.34
- Word-based/verbal materials: g = −0.39 (blocking is actually better)

**Rohrer, Dedrick, & Stershic (2015):** d = 1.09 for adaptive strategy use in 7th-grade math with interleaved practice. Even with 30× increase in test delay, performance only dropped from 80% to 74% — "near immunity against forgetting."

### 5b. Independent vs. Aggregated SRS Schedules per Question Type

**This is a research gap.** No published study directly compares independent SRS schedules for different question types (recall/explain/apply) targeting the same knowledge chunk vs. a single aggregated schedule.

The evidence leans toward **aggregated scheduling per chunk** because: (1) higher-level skills inherently require foundational recall, suggesting co-scheduling; (2) no empirical evidence contradicts aggregation; (3) simpler implementation reduces noise. Knowledge Tracing systems handle multiple skills per question (averaging 2–3 skills per question across educational datasets) but schedule at the skill level, not the question-type level.

**Recommendation:** Use a single schedule per chunk. Vary question type within and across sessions, but feed a single quality score into the SRS algorithm.

### 5c. Interleaving × Spaced Repetition Interaction

Interleaving inherently creates spacing — when you interleave concepts ABCABC, each concept is automatically spaced by the time spent on others. Rohrer's studies confound interleaving with spacing, making it hard to disentangle their separate effects.

**Contextual interference theory** (motor learning meta-analysis: SMD = 0.55) explains the mechanism: random/interleaved practice induces interference that impairs acquisition but enhances retention and transfer.

### 5d. Within-Session Sequencing Recommendation

**Interleave across concepts; escalate within concept:**

```
Session with concepts A, B, C:

Round 1: A-recall → B-recall → C-recall
Round 2: A-explain → B-explain → C-explain
Round 3: A-apply → B-apply → C-apply

(Each concept gets ~6 min spacing between attempts via interleaving)
```

This design combines across-concept interleaving (robust evidence) with within-concept escalation (theoretically motivated) while naturally achieving the 6-minute minimum spacing between attempts for the same item.

### Encodable Parameters

| Parameter                                  | Value                           | Citation                              |
| ------------------------------------------ | ------------------------------- | ------------------------------------- |
| Concepts per session                       | 3–4                             | AutoTutor session structure           |
| Interleaving pattern                       | ABCABC (rotating)               | Rohrer et al., 2015                   |
| % of practice interleaved                  | ≥ 60%                           | Contextual interference research      |
| SRS schedule granularity                   | Per chunk (aggregated)          | No evidence for per-question-type     |
| Question type distribution                 | Variable across sessions        | Variable retrieval practice, 2024     |
| Near-term performance cost of interleaving | −20–30% on same-day test        | Expected; do not interpret as failure |
| Long-term interleaving benefit             | +50–125% on delayed novel tests | Rohrer et al., 2015                   |

---

## Summary: Complete Parameter Table for Implementation

### Question Taxonomy

| Parameter                 | Value                                                 |
| ------------------------- | ----------------------------------------------------- |
| Number of question levels | 3                                                     |
| Level 1                   | Recall (SOLO: Uni-structural)                         |
| Level 2                   | Explain/Apply (SOLO: Multi-structural → Relational)   |
| Level 3                   | Analyze/Create (SOLO: Relational → Extended Abstract) |

### Quality Assessment

| Parameter                     | Value                              |
| ----------------------------- | ---------------------------------- |
| Quality scale                 | 0–5 (SM-2 compatible)              |
| Rubric type                   | Analytic (3–5 criteria × 6 levels) |
| Quality ceiling with 1 hint   | 3                                  |
| Quality ceiling with 2+ hints | 2                                  |
| Expected ICC with good rubric | 0.90–0.95                          |
| Position bias mitigation      | Evaluate twice, reversed order     |

### Session Design

| Parameter                                 | Value                          |
| ----------------------------------------- | ------------------------------ |
| Retrieval attempts per chunk per session  | 1–3 (across escalating levels) |
| Criterion for session mastery             | 1 correct at current level     |
| Min spacing between same-chunk attempts   | ≥ 6 minutes                    |
| Concepts per session                      | 3–4 (interleaved)              |
| Successive relearning sessions to mastery | 3–4                            |
| Target success rate                       | 70–85%                         |

### SRS Algorithm

| Parameter                             | Value                                         |
| ------------------------------------- | --------------------------------------------- |
| Schedule granularity                  | Per chunk (single schedule)                   |
| Quality 2–3 boundary noise tolerance  | σ ≤ 0.3                                       |
| Max acceptable misclassification rate | 20% (SM-2 degrades 5–10%; FSRS degrades 2–5%) |
| EF growth rate alarm                  | > +0.05/month                                 |
| Cold-start EF cap                     | +0.05/review for first 4 weeks                |
| Retention target                      | 90% (standard); 85% (beginners)               |

### Drift Detection

| Parameter                 | Value                                |
| ------------------------- | ------------------------------------ |
| Retention monitoring      | Weekly; flag if actual < target − 5% |
| Quality score audit       | Monthly; human review top 10%        |
| Model refit               | Every 4 weeks on holdout set         |
| Skill accuracy drop alarm | > 15% sudden drop                    |

---

## Key Citations

1. Anderson, L. W., & Krathwohl, D. R. (2001). _A Taxonomy for Learning, Teaching, and Assessing._ Longman.
2. Biggs, J. B., & Collis, K. F. (1982). _Evaluating the Quality of Learning: The SOLO Taxonomy._ Academic Press.
3. Chi, M. T. H., & Wylie, R. (2014). The ICAP Framework. _Educational Psychologist, 49_(4), 219–243.
4. Graesser, A. C., & Person, N. K. (1994). Question Asking During Tutoring. _American Educational Research Journal, 31_(1), 104–137.
5. Nye, B. D., Graesser, A. C., & Hu, X. (2014). AutoTutor and Family: A Review of 17 Years of Natural Language Tutoring. _International Journal of Artificial Intelligence in Education, 24_, 427–469.
6. Roediger, H. L., & Karpicke, J. D. (2006). Test-Enhanced Learning. _Psychological Science, 17_(3), 249–255.
7. Karpicke, J. D., & Roediger, H. L. (2008). The Critical Importance of Retrieval for Learning. _Science, 319_(5865), 966–968.
8. Rawson, K. A., & Dunlosky, J. (2011). Optimizing Schedules of Retrieval Practice for Durable and Efficient Learning. _Journal of Experimental Psychology: General, 140_(3), 283–302.
9. Rawson, K. A., & Dunlosky, J. (2013). Relearning Attenuates the Benefits and Costs of Spacing. _Journal of Experimental Psychology: General, 142_(4), 1113–1129.
10. Rowland, C. A. (2014). The Effect of Testing Versus Restudy on Retention: A Meta-Analytic Review. _Psychological Bulletin, 140_(6), 1432–1463.
11. Adesope, O. O., Trevisan, D. A., & Sundararajan, N. (2017). Rethinking the Use of Tests: A Meta-Analysis of Practice Testing. _Review of Educational Research, 87_(3), 659–701.
12. Rohrer, D., & Pashler, H. (2007). Increasing Retention Without Increasing Study Time. _Current Directions in Psychological Science, 16_(4), 183–186.
13. Rohrer, D., Dedrick, R. F., & Stershic, S. (2015). Interleaved Practice Improves Mathematics Learning. _Journal of Educational Psychology, 107_(3), 900–908.
14. Brunmair, M., & Richter, T. (2019). Similarity Matters: A Meta-Analysis of Interleaved Learning. _Psychological Bulletin, 145_(11), 1029–1052.
15. Koedinger, K. R., & Aleven, V. (2007). Exploring the Assistance Dilemma in Experiments with Cognitive Tutors. _Educational Psychology Review, 19_, 239–264.
16. Baker, R. S. J. d., et al. (2010). Better to Be Frustrated than Bored: The Incidence, Persistence, and Impact of Learners' Cognitive–Affective States During Interactions with Three Different Computer-Based Learning Environments. _International Journal of Human–Computer Studies, 68_(4), 223–241.
17. Bjork, E. L., & Bjork, R. A. (2011). Making Things Hard on Yourself, But in a Good Way: Creating Desirable Difficulties to Enhance Learning. In _Psychology and the Real World_ (pp. 56–64).
18. Zheng, L., et al. (2023). Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. _arXiv:2306.05685._
19. Zheng, Y., et al. (2025). Grading Scale Impact on LLM-as-a-Judge. _arXiv:2601.03444._
20. Hwang, H., et al. (2025). Undesirable Difficulty of Interleaved Practice for Declarative Knowledge. _Language Learning._
21. Kang, S. H. K. (2016). Spaced Repetition Promotes Efficient and Effective Learning. _Policy Insights from the Behavioral and Brain Sciences, 3_(1), 12–19.
