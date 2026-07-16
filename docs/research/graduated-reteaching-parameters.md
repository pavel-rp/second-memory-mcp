# Graduated Reteaching in Spaced Repetition: Research-Backed Parameters

Design parameters for a system that switches from cold retrieval practice to reteaching when items become heavily overdue. Covers retrievability thresholds, stability-dependent reteaching depth, and recognition-to-recall escalation.

---

## 1. Retrievability Threshold: When to Reteach vs. Test

### The Core Finding

The testing effect has a **floor at approximately R = 0.50 without feedback**. Below that threshold, cold retrieval practice produces no benefit over restudying and can backfire.

**Rowland (2014) meta-analysis** (118 studies): No testing effect observed for experiments with retrieval success rates at or below 50% when no corrective feedback was provided. This is the most robust quantitative threshold in the literature.

**With immediate corrective feedback**, the picture changes dramatically. Kornell, Hays, & Bjork (2009) demonstrated that unsuccessful retrieval attempts enhance subsequent learning even at 0% initial success — the "pretesting effect" — **provided the correct answer is shown immediately afterward**. Richland, Kornell, & Kao (2009) replicated this across 5 experiments.

### The Grimaldi & Karpicke (2012) Backfire

The backfire effect is not purely about R value. Grimaldi & Karpicke found retrieval practice backfires when constraining retrieval to a particular candidate before study (e.g., recalling "tide-wa\_\_" before studying "tide-beach") prevents activation of the full search set needed for encoding. The practical implication: if your reteaching provides partial cues that activate wrong candidates, it can be worse than no cue at all.

### The Optimal Testing Band

Converging evidence places the productive testing range at **R = 0.50–0.95**:

- R > 0.95: Too easy, minimal cognitive effort, no learning benefit (Bjork's desirable difficulties)
- R = 0.80–0.95: Strong testing effect regardless of feedback (optimal SRS operating range)
- R = 0.50–0.80: Marginal without feedback; strong with feedback
- R < 0.50: No testing advantage without feedback; pretesting effect with feedback
- R < 0.30: 30%+ of learners show negative testing effects even with some support (Minear & Coane, 2018)

### Encodable Decision Logic

```
function decide_mode(R, S, feedback_available):
    if R >= 0.50:
        return TEST_FIRST          # Standard retrieval practice
    elif R >= 0.30 and feedback_available:
        return TEST_WITH_FEEDBACK  # Pretesting effect applies
    elif R >= 0.30 and S > S_high_threshold:
        return LIGHT_RETEACH       # High storage strength → fast recovery
    else:  # R < 0.30 OR (R < 0.50 and no feedback and low S)
        return FULL_RETEACH        # Graduated reteaching sequence
```

**Why not a single cutoff?** Because the interaction of R, S, and feedback availability creates meaningfully different zones. A chunk at R = 0.35 with S = 50 (reviewed 8 times, just very overdue) needs much less reteaching than a chunk at R = 0.35 with S = 5 (reviewed once, barely learned).

---

## 2. Storage Strength Interaction: Reteaching Depth by Prior History

### The Savings Effect Is Real and Quantifiable

**Ebbinghaus (1885)** established the foundational principle: previously learned material is relearned faster, following a power law. With 8, 16, 24, 32, 42, 53, or 64 initial repetitions, savings in next-day relearning increased monotonically. The relationship follows: **T = a × N^(−b)** where N = prior trials, T = relearning time, and b typically ranges 0.3–0.6.

**Rawson & Dunlosky (2011, 2013)** confirmed this with modern materials (533 students, conceptual learning). Items practiced to criterion of 3 correct recalls with 3 spaced relearning sessions achieved 83% retention at 30 days vs. 56% with only 2 relearning sessions. Critically, the costs of initial learning were "substantially attenuated by faster relearning in subsequent sessions" — directly confirming that deeper initial learning produces faster recovery.

### FSRS Encodes This Directly

FSRS models post-lapse stability with an explicit formula:

```
S'_f(D, S, R) = w₁₁ · D^(−w₁₂) · ((S + 1)^w₁₃ − 1) · e^(w₁₄ · (1 − R))
```

Where S = prior stability, D = difficulty, R = retrievability at time of lapse, and w₁₁–w₁₄ are trainable parameters. The `(S + 1)^w₁₃` term is the key: **higher prior stability produces higher post-lapse stability**, following a power law. The formula also enforces `min(S'_f, S)` — post-lapse stability never exceeds pre-lapse stability.

### Bjork's New Theory of Disuse (1992)

The theoretical framework underpinning all of this: storage strength (SS, analogous to FSRS stability S) and retrieval strength (RS, analogous to retrievability R) are independent dimensions. When RS drops to near zero but SS remains high, restudy produces a disproportionately large increase in SS. A childhood address you haven't recalled in 20 years relearns in seconds; a new address takes many repetitions. This is why prior retrieval count matters for reteaching depth.

### Bahrick's Permastore (1984)

50-year longitudinal study of Spanish vocabulary retention. Items with sufficient original learning depth enter "permastore" — stable retention for up to 30 years after an initial 3–6 year forgetting period. The depth of original training (number of courses, grades achieved) predicted long-term retention. Subjects who relearned with 30-day intervals between sessions showed substantially enhanced 8-year retention compared to 1-day intervals.

### Karpicke & Roediger (2006, 2007)

Tested subjects recalled 61% after one week vs. 40% for restudied subjects — a 52.5% advantage. Repeated testing produced a 14% forgetting rate vs. 52% in the repeated-study condition. Prior retrievals produce dramatically slower forgetting.

### Encodable Reteaching Depth Formula

Based on the power-law savings relationship and FSRS's stability model:

```
function reteaching_depth(S, R):
    # S = FSRS stability (days), R = current retrievability

    # Normalize S to a "learning depth" proxy
    # S < 5 days → barely learned (1-2 successful reviews)
    # S = 5-30 days → moderately learned (3-5 reviews)
    # S > 30 days → deeply learned (6+ reviews)

    if S > 30:
        # High storage strength: light reteach
        # Show summary → 1 recognition check → 1 recall attempt
        return LIGHT  # ~1-2 min per chunk
        # Expected recovery: near-instant (savings > 0.7)

    elif S > 5:
        # Moderate storage strength: standard reteach
        # Full explanation → 1 recognition → 1 cued recall → 1 free recall
        return STANDARD  # ~3-5 min per chunk
        # Expected recovery: moderate (savings 0.3-0.7)

    else:
        # Low storage strength: deep reteach
        # Full teach → 2 recognition → 2 cued recall → 1 free recall
        # Essentially treat as new learning
        return DEEP  # ~5-8 min per chunk
        # Expected recovery: slow (savings < 0.3)

    # Post-reteach quality score ceiling:
    # LIGHT reteach: quality ceiling = 4 (recovered quickly)
    # STANDARD reteach: quality ceiling = 3 (needed significant help)
    # DEEP reteach: quality ceiling = 2 (essentially relearned)
```

**Key constraint:** Even after successful reteaching, the quality score fed into SM-2/FSRS should be capped. A deeply reteaught item that the learner now "knows" should not receive quality 5 — that would inflate the ease factor and schedule the next review too far out, likely causing another lapse.

---

## 3. Recognition → Recall Escalation for Low-R Items

### The Headline Finding: 44% Retention Advantage

**Fiechter & Benjamin (2017)** tested diminishing-cues retrieval practice — starting with high-support recognition-like cues and gradually removing them across practice trials. For items at ~25% initial retrievability, this produced **44% more information retained** compared to standard retrieval practice that started with difficult free recall.

This is the strongest direct evidence for your recognition → recall escalation approach.

### Why It Works: The Bifurcation Model

**Halamish & Bjork (2011)** showed that testing bifurcates the memory strength distribution: successful retrievals boost items well above restudied levels, but **failed retrievals leave items weaker than restudied items**. For items at R < 0.30, free recall attempts will mostly fail, pushing those items into the "worse than restudy" bin. Recognition-first scaffolding ensures initial success, placing items in the "boosted" bin, then escalates difficulty to induce deeper processing.

### Critical Boundary Conditions

**1. MC lure interference is a real danger.** Marsh, Roediger, Bjork & Bjork (2007) found that after MC testing, lure intrusion rates on subsequent free recall tests increased from 5% (control) to 12% — a 140% increase. This effect is strongest when initial MC performance is low to moderate. For items at R < 0.30, MC questions **must use high-quality distractors and immediate corrective feedback** to prevent false learning.

**2. Recognition accuracy must be high enough.** Butler et al. (2006) found recognition testing with multiple lures enhanced subsequent recall only when MC performance was near ceiling. When MC performance was low, recognition testing with lures **produced costs** on later tests. Floor threshold: ~60–70% MC accuracy. If the learner can't even do the recognition task reliably, you need pure reteaching first.

**3. Transfer from recognition to free recall is limited without escalation.** Little, Bjork, Bjork & Angello (2012) found MC test benefits transferred to free recall only when MC performance exceeded ~70%. Recognition practice alone (without graduating to harder formats) produces small-to-moderate effects (d ≈ 0.30–0.50) compared to free recall practice (d ≈ 0.52–1.30). The escalation is what captures the full benefit.

**4. The retrieval effort hypothesis constrains the lower bound.** Pyc & Rawson (2009) showed more effortful retrieval produces more learning — but only when retrieval succeeds. Below R ≈ 0.30, direct free recall effort is wasted because it mostly fails. Recognition provides the success; graduated escalation provides the effort.

### Strategy by Retrievability Band

| R Range       | Optimal Approach                                  | Expected Effect            | Key Risk                                            |
| ------------- | ------------------------------------------------- | -------------------------- | --------------------------------------------------- |
| R > 0.70      | Free recall throughout                            | d ≈ 0.8–1.3 vs. restudy    | None                                                |
| R = 0.50–0.70 | Cued recall → free recall                         | d ≈ 0.5–0.7                | Slight effort mismatch                              |
| R = 0.30–0.50 | Recognition → cued recall → free recall           | d ≈ 0.5 + pretesting boost | Must provide feedback                               |
| R < 0.30      | Reteach → recognition → cued recall → free recall | +44% vs. direct recall     | MC lure interference; must ensure MC accuracy > 60% |

### Encodable Graduated Reteaching Sequence

```
function graduated_reteach(chunk, R, S):
    depth = reteaching_depth(S, R)

    if depth == LIGHT:
        # High S, moderate-low R: quick refresher
        steps = [
            SHOW_SUMMARY(chunk, duration="brief"),     # 15-30 sec
            RECOGNITION_CHECK(chunk, options=3),        # True/false or 3-option MC
            FREE_RECALL(chunk)                          # One attempt
        ]
        quality_ceiling = 4

    elif depth == STANDARD:
        # Moderate S, low R: structured reteach
        steps = [
            TEACH(chunk, depth="full"),                 # Full explanation, 1-2 min
            RECOGNITION_CHECK(chunk, options=4),        # 4-option MC
            CUED_RECALL(chunk, cue_strength="strong"),  # Partial cue
            FREE_RECALL(chunk)                          # Attempt without support
        ]
        quality_ceiling = 3

    elif depth == DEEP:
        # Low S, very low R: essentially new learning
        steps = [
            TEACH(chunk, depth="full_with_examples"),   # Full teach, 2-3 min
            RECOGNITION_CHECK(chunk, options=3),        # Easy MC first
            RECOGNITION_CHECK(chunk, options=4),        # Harder MC
            CUED_RECALL(chunk, cue_strength="strong"),  # Strong cue
            CUED_RECALL(chunk, cue_strength="weak"),    # Weak cue
            FREE_RECALL(chunk)                          # Final attempt
        ]
        quality_ceiling = 2

    # Execute steps; score based on where learner succeeds
    for i, step in enumerate(steps):
        result = execute(step)
        if is_assessment(step) and result.failed:
            provide_corrective_feedback(chunk)  # ALWAYS
            # Don't abort — continue with remaining steps

    # Final quality = min(quality_ceiling, performance_on_last_recall)
    return min(quality_ceiling, score_final_recall(result))
```

### MC Question Design for Low-R Items

To avoid lure interference (Marsh et al., 2007):

- Use **3 options, not 4–5**, for items at R < 0.30 (reduces lure exposure)
- Make distractors **categorically different**, not similar (e.g., for "mitochondria = powerhouse of cell," use distractors from different organelle functions, not similar energy-related terms)
- **Always provide corrective feedback immediately** after MC response
- If MC accuracy < 60%, **abort the recognition phase** and return to pure reteaching — the item needs more study before any testing format is productive

---

## Complete Parameter Reference

### Retrievability Thresholds

| Parameter                            | Value                        | Citation                               |
| ------------------------------------ | ---------------------------- | -------------------------------------- |
| Testing effect floor (no feedback)   | R = 0.50                     | Rowland, 2014 meta-analysis            |
| Testing effect floor (with feedback) | R ≈ 0.00 (pretesting effect) | Kornell, Hays, & Bjork, 2009           |
| Negative testing effect risk zone    | R < 0.30                     | Minear & Coane, 2018                   |
| Optimal testing band                 | R = 0.50–0.95                | Bjork desirable difficulties framework |
| FSRS default desired retention       | R = 0.90                     | open-spaced-repetition                 |
| "Too easy" threshold                 | R > 0.95                     | Bjork & Bjork, 2011                    |

### Reteaching Depth by Stability

| Prior Stability (S) | Reteaching Depth                      | Expected Savings | Quality Ceiling |
| ------------------- | ------------------------------------- | ---------------- | --------------- |
| S > 30 days         | Light (summary + 1 check)             | > 0.70           | 4               |
| S = 5–30 days       | Standard (teach + 3-step escalation)  | 0.30–0.70        | 3               |
| S < 5 days          | Deep (full teach + 5-step escalation) | < 0.30           | 2               |

### Recognition → Recall Escalation

| Parameter                               | Value                     | Citation                  |
| --------------------------------------- | ------------------------- | ------------------------- |
| Diminishing-cues advantage at R ≈ 0.25  | +44% retention            | Fiechter & Benjamin, 2017 |
| MC lure intrusion rate increase         | +140% (5% → 12%)          | Marsh et al., 2007        |
| Min MC accuracy for recognition benefit | 60–70%                    | Butler et al., 2006       |
| Free recall effect size (strong items)  | d = 0.52–1.30             | Multiple meta-analyses    |
| Recognition practice effect size        | d = 0.30–0.50             | Little et al., 2012       |
| Graduated scaffolding effect size       | d ≈ 0.50–0.70 + 44% bonus | Fiechter & Benjamin, 2017 |

### Power Law of Relearning

| Parameter                                | Value             | Citation                                |
| ---------------------------------------- | ----------------- | --------------------------------------- |
| Relearning time formula                  | T = a × N^(−b)    | Ebbinghaus, 1885; power law of practice |
| Exponent b range                         | 0.3–0.6           | Cross-domain meta-analyses              |
| Successive relearning: 2 sessions at 30d | 56% retention     | Rawson & Dunlosky, 2013                 |
| Successive relearning: 5 sessions at 30d | 83% retention     | Rawson & Dunlosky, 2013                 |
| Optimal initial criterion                | 3 correct recalls | Rawson & Dunlosky, 2011                 |
| Optimal relearning sessions              | 3 spaced sessions | Rawson & Dunlosky, 2013                 |

---

## Key Citations

1. Rowland, C. A. (2014). The Effect of Testing Versus Restudy on Retention: A Meta-Analytic Review. _Psychological Bulletin, 140_(6), 1432–1463.
2. Kornell, N., Hays, M. J., & Bjork, R. A. (2009). Unsuccessful Retrieval Attempts Enhance Subsequent Learning. _Journal of Experimental Psychology: Learning, Memory, and Cognition, 35_(4), 989–998.
3. Richland, L. E., Kornell, N., & Kao, L. S. (2009). The Pretesting Effect: Do Unsuccessful Retrieval Attempts Enhance Learning? _Journal of Experimental Psychology: Applied, 15_(3), 243–257.
4. Grimaldi, P. J., & Karpicke, J. D. (2012). When and Why Do Retrieval Attempts Enhance Subsequent Encoding? _Memory & Cognition, 40_, 505–513.
5. Fiechter, J. L., & Benjamin, A. S. (2017). Diminishing-Cues Retrieval Practice: A Memory-Enhancing Technique That Works When Regular Testing Doesn't. _Psychonomic Bulletin & Review, 25_, 1868–1876.
6. Halamish, V., & Bjork, R. A. (2011). When Does Testing Enhance Retention? A Distribution-Based Interpretation of Retrieval as a Memory Modifier. _Journal of Experimental Psychology: Learning, Memory, and Cognition, 37_(4), 801–812.
7. Marsh, E. J., Roediger, H. L., Bjork, R. A., & Bjork, E. L. (2007). The Memorial Consequences of Multiple-Choice Testing. _Psychonomic Bulletin & Review, 14_(2), 194–199.
8. Butler, A. C., et al. (2006). When Additional Multiple-Choice Lures Aid Versus Hinder Later Memory. _Applied Cognitive Psychology, 20_, 941–956.
9. Little, J. L., Bjork, E. L., Bjork, R. A., & Angello, G. (2012). Multiple-Choice Tests Exonerated, at Least of Some Charges. _Psychological Science in the Public Interest, 13_(2), 67–73.
10. Pyc, M. A., & Rawson, K. A. (2009). Testing the Retrieval Effort Hypothesis: Does Greater Difficulty Correctly Recalling Information Lead to Higher Levels of Memory? _Journal of Memory and Language, 60_(4), 437–447.
11. Rawson, K. A., & Dunlosky, J. (2011). Optimizing Schedules of Retrieval Practice for Durable and Efficient Learning. _Journal of Experimental Psychology: General, 140_(3), 283–302.
12. Rawson, K. A., & Dunlosky, J. (2013). Relearning Attenuates the Benefits and Costs of Spacing. _Journal of Experimental Psychology: General, 142_(4), 1113–1129.
13. Bjork, R. A., & Bjork, E. L. (1992). A New Theory of Disuse and an Old Theory of Stimulus Fluctuation. In A. Healy et al. (Eds.), _From Learning Processes to Cognitive Processes: Essays in Honor of William K. Estes_ (Vol. 2, pp. 35–67).
14. Bahrick, H. P. (1984). Semantic Memory Content in Permastore: Fifty Years of Memory for Spanish Learned in School. _Journal of Experimental Psychology: General, 113_(1), 1–29.
15. Minear, M., & Coane, J. H. (2018). The Benefits of Retrieval Practice Depend on Item Difficulty and Intelligence. _Journal of Experimental Psychology: Learning, Memory, and Cognition, 44_(9), 1474–1486.
16. Ebbinghaus, H. (1885/1913). _Memory: A Contribution to Experimental Psychology._ Teachers College, Columbia University.
17. Karpicke, J. D., & Roediger, H. L. (2008). The Critical Importance of Retrieval for Learning. _Science, 319_(5865), 966–968.
