# Enforcement and Verification Mechanisms for AI Agent Compliance in a Learning Domain

**Research Report #3 — March 31, 2026**

---

## Executive Summary

This report investigates how to make AI agents actually follow rules in Second Memory, a spaced-repetition learning system where agents (Claude, via MCP tool calls) create learning content and run teaching sessions. The motivation is empirical: session logs show agents ignoring instructions at every salience level — from MCP `instructions` fields (never observed to be followed) to per-call tool response fields (routinely discarded). The most common root cause is a general-purpose heuristic (e.g., "be concise") overriding domain-specific instructions (e.g., "present the full teaching script").

We investigated six questions: (1) why agents ignore tool response instructions, (2) whether structured output constraints can force compliance, (3) whether self-verification chains work, (4) whether server-side nudges affect agent behavior, (5) whether detection-and-remediation beats prevention, and (6) how to maintain compliance across long sessions.

**Key findings:**

- Prompt-level instructions are empirically insufficient, and the research literature explains why: RLHF-trained helpfulness heuristics systematically override task-specific constraints, positional attention decay buries tool responses in long conversations, and agents lack theory-of-mind to distinguish their context from the learner's knowledge.
- **Schema-level constraints with constrained decoding are the single most reliable compliance mechanism** — moving from ~40% prose-instruction compliance to ~100% schema-enforced compliance. This is the highest-leverage intervention available.
- Self-verification by the same LLM is fundamentally unreliable (agreement bias, self-preference). External or deterministic verification outperforms self-critique.
- Server-side state externalization is the most validated pattern for long sessions — do not trust agent memory.
- A hybrid approach is required: prevention (schema constraints) for structural rules, detection (session analytics) for behavioral failures, nudges (tool response hints) as a middle layer.

The report concludes with a prioritized implementation plan cross-referenced with Linear issues NEU-312, NEU-306, NEU-310, NEU-311, and NEU-230.

---

## 1. Why LLM Agents Ignore Tool Response Fields and Instructions

### 1.1 Attention and Positional Effects

Tool response fields — whether structured JSON or embedded prose — are subject to architectural attention biases that no prompt engineering can fully overcome.

**The "Lost in the Middle" phenomenon** (Liu et al., 2023, _Transactions of the Association for Computational Linguistics_) demonstrates that LLMs show U-shaped attention: high at the beginning and end of context, degraded 30%+ in the middle. The root cause is Rotary Position Embedding (RoPE), which introduces long-term decay effects. A follow-up paper, "Found in the Middle" (2024), proposes Multi-scale Positional Encoding (Ms-PoE) achieving 20-40% accuracy improvements for middle-position information — but this is not deployed in production models.

**This generalizes to tool use.** The Berkeley Function Calling Leaderboard (BFCL V3/V4) specifically measures agent handling of tool responses across multi-turn dialogue. Key finding: agents struggle with state management after multiple tool invocations. The leaderboard uses Abstract Syntax Tree evaluation to detect hallucination in tool calls — and finds systematic hallucination in parameter generation (Gorilla: Large Language Model Connected with Massive APIs, UC Berkeley, arXiv 2305.15334).

**Critically, structured fields offer no inherent protection** against attention decay. The issue is architectural (positional encoding), not format-dependent. A JSON key buried at position 3000 in context receives the same degraded attention as prose at that position. The practical implication: field placement within tool responses matters more than field format.

**Evidence strength:** HIGH — peer-reviewed, widely cited, directly applicable.

### 1.2 Competing Heuristic Interference

This is the primary failure mode in Second Memory sessions, and the research literature provides a clear causal model.

**The instruction hierarchy problem** is well-documented. "The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions" (OpenReview, ICLR track) demonstrates that most LLMs fail to respect instruction priority when instructions conflict. The paper proposes an explicit hierarchy — built-in constraints → developer goals → user prompts — but shows that current models do not implement this reliably.

**RLHF is the root cause.** The InstructGPT paper (Ouyang et al., arXiv 2203.02155) documents 27% labeler disagreement on instruction priority, revealing that the reward model itself encodes ambiguity about when to be helpful vs. when to follow specific constraints. "Mitigating the Alignment Tax of RLHF" (arXiv 2309.06256, EMNLP 2024) documents that RLHF alignment improves general helpfulness but can degrade specific-instruction-following ability. This is the "alignment tax" — the model has learned that "be helpful and concise" is almost always rewarded, creating a strong prior that competes with any task-specific instruction to "present the full 5-step teaching script."

**Quantified severity:** "AgentIF: Benchmarking Instruction Following of Large Language Models in Agentic Scenarios" (arXiv 2505.16944) is the first benchmark specifically for agent instruction-following. Finding: ALL tested LLMs perform poorly on complex constraints; the best model follows fewer than 30% of instructions perfectly. Models particularly fail at conditional constraints — they recognize the condition but misapply it.

"ConInstruct" (arXiv 2511.14342) adds nuance: LLMs exhibit strong conflict _detection_ but fail to explicitly communicate conflicts. Instead, they generate responses that only partially satisfy conflicting constraints. This explains the Second Memory pattern precisely: the agent detects the conflict between "be concise" and "present full teaching script," resolves it silently in favor of conciseness, and produces a 4-line summary.

**Second Memory implication:** When `teach_next` returns a 5-step structured teaching script, the agent treats it as regular text to be summarized, not as a task specification to be executed. The competing heuristic ("be concise, be helpful, don't overwhelm the user") wins because it has stronger reward-model backing than the domain-specific instruction. This cannot be solved by making the instruction more prominent — the heuristic is baked into the model's weights, not into any particular context position.

**Evidence strength:** HIGH — multiple peer-reviewed papers directly address this mechanism.

### 1.3 Context Length and Attention Decay

Even if instructions are perfectly followed at turn 1, they degrade by turn 10 and are effectively absent by turn 50.

"LLMs Get Lost In Multi-Turn Conversation" (arXiv 2505.06120) documents a "loss-of-middle-turns" phenomenon where models overly adjust to first and last conversation turns, with performance degrading with conversation length. "Mitigating Conversational Inertia in Multi-Turn Agents" (arXiv 2602.03664) finds that models exhibit strong diagonal attention to their own previous responses — an imitation bias that constrains adaptation to new tool outputs. The agent replicates its own prior patterns rather than adapting to fresh tool-returned instructions.

"Context Length Alone Hurts LLM Performance Despite Perfect Retrieval" (arXiv 2510.05381) is the most concerning finding: even with perfect retrieval of relevant information, performance degrades 13.9%–85% as input length increases. Sheer context length alone damages performance, independent of distraction or irrelevant content. This means a 50-turn teaching session degrades instruction-following simply by existing, regardless of how well instructions are re-injected.

**Second Memory implication:** The `teach_next` instructions returned at turn 30 of a session receive fundamentally less attention than those at turn 1. This is not a fixable prompt-engineering problem — it's an architectural limitation of current transformer models.

**Evidence strength:** HIGH — controlled experiments isolating context-length effects.

### 1.4 The "My Context = Their Knowledge" Conflation

The agent repeatedly confused what it could see in its context window with what the learner had been shown. This is a documented failure mode with roots in LLM theory-of-mind limitations.

"Evaluating large language models in theory of mind tasks" (PNAS, 2024) found that GPT-4 fails 25% of perspective-taking tasks (GPT-3.5 fails 80%). The specific failure: imagining what information another agent does or does not have access to. "False Consensus Biases AI Against Vulnerable Stakeholders" (arXiv 2407.12143) demonstrates a false consensus effect where agents overestimate how much others share their knowledge and views. "Who Sees What? Structured Thought-Action Sequences for Epistemic Reasoning in LLMs" (arXiv 2508.14564) documents LLM failures in understanding what different agents can and cannot see.

"MindForge: Empowering Embodied Agents with Theory of Mind for Lifelong Collaborative Learning" (arXiv 2411.12977) addresses false belief failures directly: agents fail to model others' mental states, including knowledge gaps.

**This failure mode does not have a single canonical name.** In the theory-of-mind literature it falls under "perspective-taking failure" or "false belief task failure." In the agent literature it's sometimes called "context-knowledge conflation" or "epistemic modeling failure." We propose the term **"context-knowledge conflation"** for Second Memory: the agent conflates its context window contents with the learner's knowledge state.

**Second Memory implication:** When the agent has code from its own context window, it references that code in teaching — even if the learner has never seen it. When the agent sees a tool response containing a concept definition, it assumes the learner also "knows" that definition. The fix requires explicit tracking of what has been shown to the learner, maintained outside the agent's context.

**Evidence strength:** HIGH — peer-reviewed PNAS and multiple arXiv papers directly address the mechanism.

### 1.5 The Four-Factor Causal Model

These four mechanisms interact to produce the observed failures:

1. **Positional bias (RoPE):** Tool response fields at mid-context positions receive degraded attention regardless of format or emphasis.
2. **Helpfulness heuristic override:** RLHF-trained "be helpful and concise" behavior systematically overrides domain-specific task instructions.
3. **Temporal decay:** In multi-turn sessions, earlier tool outputs lose attention weight; agent imitates its own prior behavior rather than adapting to new instructions.
4. **Context-knowledge conflation:** The agent cannot reliably distinguish between information in its context and information the learner has access to.

**Critical implication for Second Memory:** "Put it in the prompt" fails because of (1) and (3). "Put it in the tool response" fails because of (1) and (2). "Trust the agent to track learner state" fails because of (4). The research confirms that compliance mechanisms must operate at the decision boundary — schema constraints, server-side state management, and external verification — not at the instruction level.

---

## 2. Structured Output Constraints as a Compliance Mechanism

### 2.1 Forced Decision Fields

If `create_topic_with_chunks` required a `scope_justification` field ("explain why these cards belong in one skill") or a `dependency_graph_type` enum (`linear_chain | convergent | divergent | independent`), would compliance improve?

**Yes, with caveats.** The TAFC (Think-Augmented Function Calling) framework (arXiv 2601.18282, January 2025) demonstrates that adding a mandatory "think" parameter that forces models to articulate reasoning for complex function parameters measurably improves parameter accuracy. For interdependent parameters, complexity-based triggering ensures granular justification for critical decisions.

However, CRANE (Constrained Reasoning Augmented Generation, arXiv 2502.09061, February 2025) reveals a fundamental trade-off: the strictest constraints diminish reasoning capabilities in reasoning-heavy tasks. CRANE solves this by alternating between unconstrained reasoning phases and constrained output phases, achieving up to 10 percentage points improvement. A separate study, "Let Me Speak Freely?" (arXiv 2408.02442), found unstructured reasoning achieves up to 18.9% better performance on complex math benchmarks compared to structured approaches.

**Practical implication for Second Memory:** Forced decision fields are effective when they require classification or categorization (choosing a `dependency_graph_type` enum) but can backfire when they require open-ended reasoning (writing a long `scope_justification`). The agent may produce a perfunctory justification to satisfy the schema requirement without genuine deliberation. The optimal pattern: use enums and structured choices for constraint enforcement, and reserve free-text fields for optional elaboration that the server can assess but not require.

**Evidence strength:** MEDIUM-HIGH — recent peer-reviewed work, but task-dependent results.

**Concrete recommendation:** Add `dependency_graph_type: enum('linear_chain', 'convergent', 'divergent', 'independent')` as a required field on `create_topic_with_chunks`. This forces the agent to classify the skill's structure, which is a well-defined categorization task. Do NOT add a free-text `scope_justification` field — the agent will fill it perfunctorily.

### 2.2 Schema as Implicit Instruction

**Strong evidence that schemas are parsed as constraints, not suggestions.** Multiple sources confirm that well-designed parameter schemas (field names, enums, descriptions, type constraints) are more reliably followed than equivalent prose instructions. The key mechanism: API-native constrained decoding (OpenAI Structured Outputs with `strict: true`, Anthropic's tool use with schema validation) achieves approximately 100% compliance through token masking — at each generation step, logits are modified to exclude tokens that would violate the schema. This is mathematically guaranteed compliance, not probabilistic.

By contrast, instruction-only approaches (older JSON mode, unguarded function calls) achieved less than 40% compliance. The gap between ~40% (prose instructions) and ~100% (constrained decoding) is the single largest compliance lever available.

**Field naming matters.** A field named `cards` with `maxItems: 7` communicates the constraint more reliably than prose saying "include no more than 7 cards." The schema is processed during the constrained decoding phase, while prose must survive attention competition with other context.

**Enum selection is reliable under constrained decoding** but vulnerable without it. Developers report that Literal types are more reliable than Enum types across model families, and that enum values can be attacked with 96.2% success on proprietary models when constrained decoding is not enforced.

**Evidence strength:** VERY HIGH for constrained decoding; HIGH for schema design effects.

**Concrete recommendation:** Move as many behavioral constraints as possible into the tool schema:

- `chunks: { type: "array", maxItems: 7, minItems: 2 }` — enforces skill sizing.
- `teaching_approach: { enum: ["recall", "cued_recall", "reteach", "scaffold"] }` — prevents invention of approaches.
- `dependency_graph_type: { enum: [...] }` — forces structural classification.
- Required fields with tight type constraints over optional fields with prose descriptions.

### 2.3 Validation Schemas as Lightweight Enforcement

JSON Schema constraints (min/max items, pattern matching, required fields) serve as effective lightweight enforcement when backed by constrained decoding. Real-world impact data: financial services teams reduced error rates from 5% to <0.3%; engineering teams improved multi-step workflow accuracy from 10% to 70% by introducing schema validation (cited in "Stop Blaming the LLM: JSON Schema Is the Cheapest Fix for Flaky AI Agents," February 2026).

Constraint types that work through token masking: min/max items, required fields, enum validation, pattern matching (regex), nested object validation, type constraints. All are mathematically guaranteed when backed by constrained decoding.

**The MCP limitation:** MCP schemas define tool _input_ parameters, but Second Memory's compliance problem is partly about tool _output_ behavior (how the agent uses the teaching script it receives). Schema constraints can enforce what the agent _sends_ to the server but not what it _does_ with what the server returns. This is a fundamental gap: schema enforcement works for content creation calls (`create_topic_with_chunks`) but not for teaching behavior (`teach_next` → agent presents content to learner).

**Evidence strength:** VERY HIGH for input schema enforcement; NOT APPLICABLE for output behavior enforcement.

**Concrete recommendation:** Use schema constraints aggressively for all content-creation tools. For teaching behavior, schema constraints are necessary (e.g., requiring `teaching_mode_confirmed` on `submit_answer`) but insufficient — they must be supplemented with state externalization (§6) and detection mechanisms (§5).

### 2.4 Whether Agents Fill Fields Perfunctorily

**Evidence suggests genuine reasoning attempts, not perfunctory filling.** CallNavi (arXiv 2501.05255) and ToolACE (arXiv 2409.00920) benchmarks show that models perform well on simple single-parameter calls but accuracy drops 6-25 F1 points on complex nested and dependent parameters. This pattern — good performance on simple fields, degradation on complex ones — indicates genuine reasoning attempts hitting cognitive limits, not slot-filling. Further evidence: adding mandatory think/reasoning parameters improves accuracy for complex parameters (TAFC). If filling were perfunctory, forced articulation wouldn't help.

**The exception:** When a field requires open-ended justification (like `scope_justification: string`), models do tend toward minimal, formulaic responses. The perfunctory-filling risk is real for free-text explanation fields but low for classification enums and constrained-choice fields.

**Evidence strength:** MEDIUM-HIGH — behavioral evidence is strong; mechanistic evidence is limited.

**Concrete recommendation:** Prefer enum/choice fields over free-text justification fields. If a free-text field is needed, make it optional and use its presence/absence or content as a quality signal rather than a compliance mechanism.

---

## 3. Self-Verification Chains: Can Agents Check Their Own Work?

### 3.1 Chain-of-Thought Verification

**Moderate evidence of effectiveness.** Chain-of-Verification (CoVe) (ACL Findings 2024) reduces factual hallucinations by 50-70% on QA and long-form generation tasks (F1 improvement from 0.39 to 0.48; FACTSCORE increase of 28%). The mechanism: the model drafts an initial response, plans verification questions, answers those questions independently (crucially, without seeing the draft to avoid bias repetition), then generates a final verified response.

The Reflexion framework (NeurIPS 2023, arXiv 2303.11366) shows even stronger results with iterative self-reflection: 97% success rate in 12 trials vs. 75% baseline (AlfWorld), 20% improvement on reasoning tasks (HotPotQA), and 88% pass@1 vs. 67% baseline on code generation (HumanEval).

**However, the key limitation:** CoVe and Reflexion work best when verification has a clear ground truth (factual questions, code compilation, task completion signals). In Second Memory's case, the "ground truth" for content structuring is soft — there's no compiler that rejects a badly-scoped skill. This reduces the expected benefit of self-verification for content creation.

**Evidence strength:** MODERATE-HIGH for factual/code tasks; MODERATE for soft-criteria tasks like content structuring.

### 3.2 Self-Consistency Checking Is Fundamentally Unreliable

**This is the most important negative finding in this report.** Multiple independent research streams converge on the conclusion that LLM self-evaluation is unreliable:

- "When Can LLMs Actually Correct Their Own Mistakes?" (_Transactions of the ACL_) — comprehensive survey finding that self-correction without external feedback often degrades performance.
- "Can Large Language Models Really Improve by Self-critiquing Their Own Plans?" (arXiv 2310.08118) — GPT-4 self-critiquing _diminishes_ plan generation performance compared to external verifiers.
- "Self-Preference Bias in LLM-as-a-Judge" (arXiv 2410.21819) — GPT-4 and Claude favor their own responses 10-25% more during evaluations.
- "Let's Think in Two Steps: Mitigating Agreement Bias in MLLMs" (arXiv 2507.11662) — multimodal LLMs over-validate agent behavior; they show strong tendency to favor information in their context window, generating chains of thought to rationalize flawed behavior.
- SelfCheck (arXiv 2308.00436) — self-verification on mathematical reasoning yields modest gains: +2.8% on GSM8K, +5.4% on MathQA, +2.2% on MATH. Not transformative.

**The core problem:** The assumption that verification should be easier than generation is incorrect for LLMs. Recent research demonstrates that "verification is not easier than generation in general" — verification and generation can be similarly difficult depending on task structure.

**Second Memory implication:** Asking the agent "before calling `create_topic_with_chunks`, verify that each card targets one KC and all cards share a dependency chain" will produce a verification response that agrees with whatever the agent already planned to do. The self-check is rubber-stamped. The agent has agreement bias toward its own prior output and self-preference bias toward its own reasoning.

**Evidence strength:** VERY HIGH — multiple independent research streams confirm the limitation.

### 3.3 Pre-Commit Review Patterns in Agent Frameworks

Agent frameworks are beginning to implement pre-commit validation, but it's not standardized:

- **LangChain:** Implements middleware hooks with `after_model` that runs after model decides on action but before execution. No built-in pre-commit validation for tool calls; requires custom middleware. Supports `wrap_tool_call` for runtime-registered tools.
- **CrewAI:** Integrates MCP for dynamic tool discovery but no explicit pre-commit validation. Validation likely via Pydantic schema enforcement.
- **MCP pattern:** Tool descriptions serve as "micro-prompts" injected each turn. Best practice: centralize validation, authentication, and schema enforcement in one function.

**No MCP-specific pre-commit validation pattern exists.** The closest pattern is a two-phase tool: `plan_skill_creation` (returns a plan for review) → `commit_skill_creation` (executes the plan). This is architecturally clean but doubles the number of tool calls.

**Evidence strength:** MODERATE — patterns exist but are not standardized or empirically validated.

### 3.4 Cost-Benefit Analysis

Self-verification is expensive:

- Chain-of-Verification: 4 phases (draft, plan, answer, final) = ~4x base token cost.
- Self-critique: ~2x minimum.
- Reflexion iterative loop: compounds cost over multiple trials.
- Output tokens cost 4-5x more than input tokens on frontier models ($10-15/M output vs. $2-3/M input).

Given that self-verification is both expensive and unreliable (§3.2), the cost-benefit is poor for single-model self-checking. The token budget is better spent on schema constraints (free — enforced at decoding time) and server-side validation (cheap — deterministic code).

**Evidence strength:** HIGH for cost data; the cost-benefit conclusion follows from combining cost data with reliability data.

### 3.5 Recommendation: External Verification Over Self-Verification

**Do not rely on single-model self-verification for content quality.** Instead:

1. **Schema constraints** (§2) for structural compliance — zero additional token cost.
2. **Server-side deterministic validation** for computable rules (e.g., prerequisite graph connectivity, chunk count limits) — milliseconds of server compute, no token cost.
3. **Post-creation auditing** (§5) for soft quality criteria — runs asynchronously, uses quality metrics rather than LLM judgment.
4. **If self-verification is used at all,** implement it as a separate tool call with a fresh context (not inline chain-of-thought), and focus verification on specific, objective criteria rather than open-ended quality assessment.

---

## 4. Response-Time Nudges: Server Feedback as a Behavioral Lever

### 4.1 Do Soft Signals Affect Agent Behavior?

**Yes, with meaningful but bounded effect.** Multiple convergent evidence streams:

- System prompts as behavioral control surfaces: persona characteristics injected via system prompts dramatically influence model behavior, including misalignment patterns. This suggests even subtle message framing is processed as behavioral guidance (ACM CHI 2024: "As an AI language model, I cannot").
- Field evidence from human-AI systems: workers receiving AI coaching based on performance history boost productivity 8-10% and cut rework 20-30% (Behavioral Scientist: "Scaling Nudges with Machine Learning"). While this is human data, the mechanism — performance-contextualized feedback changing subsequent behavior — is analogous.
- RLHF itself is a nudge mechanism: less than 1% of training interactions yield explicit feedback, yet implicit signals drive refinement (SuperAnnotate: RLHF for LLMs).

**The critical caveat:** Nudges compete with the same heuristic-override problem documented in §1.2. A `quality_hints` field saying "Warning: 7 cards with low prerequisite connectivity" will be processed, but if the agent's "be concise and move on" heuristic is stronger, the warning may be acknowledged but not acted upon.

**Evidence strength:** HIGH for effect existence; MODERATE for effect magnitude in agent contexts.

### 4.2 Warning Placement and Format

**Structured data in tool responses outperforms prose warnings.** Structured output (JSON fields, typed warnings) is processed through the same constrained-decoding pathway that handles schema compliance, giving it higher salience than prose embedded in string values.

**Placement recommendations based on evidence:**

1. **Highest salience:** Structured fields in the immediate tool response (e.g., `"quality_warnings": [{"type": "low_connectivity", "severity": "high", "affected_chunks": [...]}]`). The agent must parse these fields to generate its next response.
2. **Medium salience:** Prose warnings at the _end_ of tool response strings (recency bias favors final content).
3. **Lowest salience:** Warnings in separate follow-up tool calls (requires the agent to attend to a previous turn).

**Timing matters:** Early intervention during generation (streaming content monitoring, token-level supervision) is more effective than post-hoc examination of completed outputs. This suggests warnings should be delivered _before_ the agent commits to a course of action, not after.

**Evidence strength:** HIGH for structured-over-prose; MODERATE for timing effects.

### 4.3 Nudge vs. Hard Constraint Taxonomy

The Agent Behavioral Contracts (ABC) framework (arXiv 2602.22302) provides the most rigorous taxonomy:

- **Hard constraints:** Must never be violated; implemented as code running _outside_ the context window, evaluated before tool invocation reaches the agent's decision layer. System-prompt rules are data agents can reason about (and override) — they are NOT hard constraints.
- **Soft constraints:** Admit transient violations provided recovery occurs within bounded time. Implemented as quality signals in tool responses, with escalation paths.

**Mapping for Second Memory:**

| Rule                                               | Classification | Mechanism                                                                                                     |
| -------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------- |
| Skill has 2-7 cards                                | Hard           | Schema constraint: `minItems: 2, maxItems: 7`                                                                 |
| Cards share a dependency chain                     | Soft → Hard    | Nudge first (server checks connectivity, returns warning); future: server rejects disconnected graphs         |
| Teaching script presented in full                  | Soft           | Nudge (quality hint in `teach_next` response); cannot be schema-enforced because the agent produces free text |
| Agent tracks learner-shown vs. agent-known content | Hard           | Server-side state: `teach_next` returns explicit `learner_has_seen` list                                      |
| Topic orientation emitted once per topic           | Hard           | Server-side state: session tracks oriented topics (NEU-312's `is_first_chunk_in_topic`)                       |

**Principle:** Hard constraints for anything the server can verify deterministically. Soft constraints for behavioral guidelines that require judgment. Never classify something as "soft" because implementation is hard — classify based on the severity of violation.

**Evidence strength:** MEDIUM-HIGH — ABC framework is formally rigorous but recent (2025).

### 4.4 Adaptive Enforcement: Escalation from Nudge to Hard Constraint

**Real-world precedent exists.** Governance-as-a-Service (GaaS) implementations use Allow → Warn → Block escalation based on compliance history. PolicyGuard (arXiv 2510.03485) provides a lightweight model (~4B parameters) for detecting policy violations in agent trajectories with strong accuracy.

**For Second Memory, adaptive enforcement is feasible but premature.** The system currently has no compliance-tracking infrastructure. The implementation path:

1. **Phase 1 (now):** Log all quality warnings issued and whether the agent acted on them. No enforcement change.
2. **Phase 2 (when data exists):** Analyze compliance rates by warning type. Identify which warnings are systematically ignored.
3. **Phase 3 (data-driven):** Promote consistently-ignored soft constraints to hard constraints (schema enforcement or server rejection).

**Evidence strength:** HIGH for feasibility; the specific escalation thresholds need empirical calibration.

---

## 5. Detection and Remediation vs. Prevention

### 5.1 Quality Metrics for Content Structure

The following computable signals can indicate a poorly-scoped skill, ordered by validation strength:

**Validated in learning analytics literature:**

1. **Prerequisite graph connectivity** — low edge count relative to node count indicates disconnected cards that shouldn't be in the same skill. A skill with 5 cards and 1 prerequisite edge is likely misscoped. _ACE: AI-Assisted Construction of Educational Knowledge Graphs_ (Journal of Educational Data Mining) validates prerequisite graph analysis for educational content.

2. **Learner session failure patterns** — early termination, quality score drops mid-session, and learner frustration signals (e.g., "it's a shitload of different hard concepts") are strongly predictive of content problems. Machine learning models predict student dropout from session log data with high accuracy (Nature Scientific Reports: "Student Dropout Prediction Through ML Optimization"). Real-time frustration detection via interaction patterns enables timely intervention.

3. **Cognitive overload indicators** — high difficulty variance within a skill (e.g., one card at difficulty 2 and another at difficulty 5) indicates assumption mismatches. _Prerequisite Relation Learning: A Survey and Outlook_ (ACM Computing Surveys) validates KC dependency analysis for this purpose.

**Proposed but not yet validated for Second Memory:**

4. **Chunk count with low edge density** — `edges / (nodes * (nodes-1)/2)` below a threshold suggests topical-but-not-structural grouping (the Fenwick Tree failure mode from Research #1).

5. **Difficulty-weighted session time** — if a skill takes >20 minutes for initial learning, it likely exceeds the one-session scope constraint.

**Evidence strength:** HIGH for session failure signals; MEDIUM for graph-structural metrics (validated in education but not specifically for SRS skill scoping).

### 5.2 Post-Creation Auditing vs. Pre-Commit Prevention

**Hybrid is required; neither alone suffices.**

- **Prevention (schema constraints)** is highly reliable for structural rules (§2) but cannot enforce soft quality criteria like "cards share a meaningful dependency chain."
- **Post-creation auditing** catches failures that prevention misses, but allows bad content to exist temporarily. For Second Memory, this is acceptable — a poorly-scoped skill that exists for 10 minutes before being flagged is better than a perfect skill that takes 5x longer to create due to pre-commit verification overhead.

**Evidence from the literature:** "From Judgment to Interference: Early Stopping LLM Harmful Outputs via Streaming Content Monitoring" (arXiv 2506.09996) demonstrates that early intervention during generation outperforms post-hoc examination. However, this applies to _preventing harmful outputs_, not to _quality assessment of creative outputs_. For content quality, post-hoc analysis is more appropriate because quality criteria are softer and context-dependent.

**Industry consensus:** Proactive input constraints + reactive output monitoring is the standard hybrid pattern. Input constraints prevent bad trajectories; output monitoring catches emergent failures (WitnessAI: "AI Guardrails for Safe Deployment").

**Concrete recommendation for Second Memory:** Run automated quality checks after every `create_topic_with_chunks` call:

1. Compute prerequisite graph connectivity.
2. Check difficulty variance across cards.
3. Verify card count within bounds (schema should enforce this, but belt-and-suspenders).
4. Return quality assessment in the tool response — not as a blocking error, but as a `quality_assessment` field the agent can act on.

This is the NEU-230 pattern (consistency reminder in mutation tool responses) extended to content-creation tools.

**Evidence strength:** HIGH for the hybrid approach; MODERATE for specific metric thresholds.

### 5.3 Session-Level Failure Signals

**Session analytics are strongly validated as triggers for content restructuring.**

- Dropout prediction from session data: ML models predict disengagement from learning session logs with high accuracy (Nature Scientific Reports, 2025).
- Real-time frustration detection: spatial-temporal analysis of learner interaction patterns (response times, error rates, explicit feedback) detects frustration with high sensitivity (Springer: "Modeling Frustration Trajectories in Adaptive Learning Environments").
- Cognitive overload detection: EEG-based systems achieve sensitivity 0.89, specificity 0.84 — but Second Memory doesn't have EEG. Proxy signals available: rapid decline in quality scores within a session, increasing response times, explicit frustration keywords, early termination.

**The Fenwick session provides a concrete example:** The learner said "it's a shitload of different hard concepts, no chance I'll remember anything." Detectable signals: (1) low quality scores across multiple cards in the same skill, (2) explicit frustration language, (3) the session did not complete the planned review. Any of these could trigger a skill restructuring recommendation.

**Concrete recommendation:** Implement session-level quality monitoring:

1. Track quality score trajectory within sessions (declining scores = overload signal).
2. Flag sessions where >50% of cards in a skill receive quality scores ≤ 2.
3. When flagged, `complete_session` response includes a `restructuring_suggestion` field: "Skill X had 60% failure rate — consider splitting into smaller skills."
4. Do NOT auto-restructure. Flag for learner review with a suggested split plan. The learner decides.

**Evidence strength:** VERY HIGH for signal validity; the specific threshold values need empirical calibration against Second Memory session data.

### 5.4 Remediation Patterns

When a bad skill is detected, three options exist:

1. **Automatic splitting** — Risky. The agent might split incorrectly (the same heuristic problems from §1 apply). NOT recommended as a default.
2. **Flagging for human review** — Safe but slow. Appropriate for low-urgency issues.
3. **Suggesting a split plan for learner approval** — Best option. The system generates a proposed restructuring (using prerequisite graph analysis to identify natural split points), presents it to the learner, and the learner approves or modifies.

**The remediation should leverage the prerequisite graph.** If a skill has two disconnected subgraphs in its prerequisite structure, the natural split is along the disconnection. If the graph is connected but too large, split at the lowest-connectivity edge (the weakest link in the dependency chain).

**Evidence strength:** MODERATE — reasoning by analogy from graph partitioning literature. No direct evidence on SRS skill splitting.

---

## 6. The Attention Window Problem for Long Sessions

### 6.1 Re-injection Mechanisms

**Direct evidence shows system prompt influence dilutes dramatically in long conversations.** "Agent Drift: Quantifying Behavioral Degradation" (arXiv 2601.04170) found that baseline adherence to behavioral instructions degraded to 25% by end of session, but with reinforcement steering, adherence maintained 100%. Behavioral degradation affects nearly 50% of long-running agents, causing 42% reduction in task success rates and 3.2x increase in human intervention requirements.

**What works:** System prompt repetition and "split-softmax" techniques show highest effectiveness, with prompt repetition excelling specifically in high-turn-count scenarios. Multi-turn prompt injection attacks exploit exactly this weakness — instruction adherence weakening as conversational drift increases (OWASP LLM Injection Prevention Cheat Sheet).

**Concrete recommendation for Second Memory:** Every `teach_next` response should include a compact re-statement of critical rules — not the full workflow guide, but a focused 3-5 line reminder of the most commonly violated rules. This is already partially implemented in NEU-312's per-tier instruction generation, but should be extended to include universal rules (e.g., "present ALL content from the teaching script before asking questions").

**Evidence strength:** HIGH — the Agent Drift paper directly quantifies re-injection effectiveness.

### 6.2 Structured Output as Persistent Constraint

**Forcing specific tool schema fields (like `teaching_mode_confirmed: "learning"`) creates structural enforcement per turn, but evidence on whether this forces genuine re-checking is limited.**

MCP tool descriptions act as "micro-prompts" — the description is part of LLM context sent each turn and functions as an instruction manual. Models incorporate these into reasoning before generating tool calls (Merge: "MCP Tool Description Best Practices"). However, the same source warns: "AI agents may not read the entire description, especially if it's several sentences" — suggesting partial attention even to explicit constraints.

**The mechanism works for constrained-decoding-backed fields** (the agent literally cannot submit `teaching_mode_confirmed: "retrieval"` if the enum only contains `"learning"` and `"review"`). It does NOT work for free-text fields where the agent can write anything.

**Concrete recommendation:** Add `session_mode: enum("learning", "review", "mixed")` as a required field on `submit_answer` and `teach_next`. This forces mode re-confirmation each turn. However, recognize that this prevents _wrong mode declarations_ but doesn't prevent _wrong mode behavior_ — the agent could declare "learning" mode while behaving as if in retrieval mode. The gap between declaration and behavior must be addressed by state externalization (§6.3).

**Evidence strength:** MEDIUM-HIGH for schema enforcement; LOW for persistent-constraint behavioral effects.

### 6.3 Session State Externalization

**This is the highest-confidence recommendation in this report.** Externalizing state outside the agent's context is the most validated pattern for long-horizon agent reliability.

**InfiAgent** (arXiv 2601.03204) treats the file system as the authoritative persistent state record rather than the prompt. At each decision step, the agent reconstructs reasoning context solely from file snapshots + a fixed-size recent action window. This decouples unbounded task state from bounded context window.

**LangChain's four context strategies** (LangChain Blog: "Context Engineering for Agents") formalize this:

1. **Write:** Save context outside context window.
2. **Select:** Pull relevant context into window.
3. **Compress:** Summarize to preserve only essential tokens.
4. **Isolate:** Split context to focus task-specific sections.

**All major production frameworks implement state externalization:** Redis for hot session state, PostgreSQL for durable state, vector stores for semantic retrieval. The consensus is clear: do not trust agent in-context memory for anything that must persist across turns.

**Second Memory implication:** This directly validates NEU-312's approach. The `teach_next` response should return a compact state summary every turn:

```
{
  session_mode: "learning",
  topics_oriented: ["topic-abc", "topic-def"],
  chunks_presented_to_learner: ["chunk-1", "chunk-2", "chunk-3"],
  current_teaching_approach: "scaffold",
  learner_has_seen_content: true,  // whether content has been shown before asking
  universal_rules_reminder: "Present ALL content before asking questions. Do not reference code or concepts the learner has not been shown in this session."
}
```

This addresses the context-knowledge conflation (§1.4) by making `chunks_presented_to_learner` an explicit server-maintained list. The agent no longer needs to remember what was shown — the server tells it each turn.

**Evidence strength:** VERY HIGH — multiple production systems and research papers validate this pattern.

### 6.4 "Lost in the Middle" for Tool-Use Contexts

The Liu et al. 2023 finding generalizes to tool use: as tool catalogs and response histories grow, "attention dilution, recency bias, and lost-in-the-middle effects sharply degrade retrieval and tool-use accuracy" (EmergentMind: Multi-Turn Tool-Calling LLMs). Tool descriptions placed in middle of prompt receive weaker attention than those at beginning/end.

**Practical mitigation for Second Memory:** Place the most critical constraint information at the very beginning of tool descriptions (first sentence), and repeat the single most important rule at the end. Do not bury key rules in the middle of a multi-paragraph description.

**Evidence strength:** HIGH for the phenomenon; MEDIUM for tool-specific quantification.

---

## 7. Prioritized Implementation Plan

### Tier 1: Do Now (high confidence, low implementation cost)

| #   | Action                                                                                                                          | Mechanism                      | Linear Issue     | Rationale                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------- | ----------------------------------------------------------------------------------------------- |
| 1a  | Add schema constraints to `create_topic_with_chunks`: `chunks: { minItems: 2, maxItems: 7 }`, `dependency_graph_type` enum      | Schema enforcement (§2.2)      | New issue        | Highest-leverage single intervention. ~100% compliance for structural rules. Zero token cost.   |
| 1b  | Return compact session state with every `teach_next` response: `chunks_presented_to_learner`, `topics_oriented`, `session_mode` | State externalization (§6.3)   | NEU-312 (extend) | Directly fixes context-knowledge conflation. Server already tracks this state.                  |
| 1c  | Add `universal_rules_reminder` to every `teach_next` response (3-5 lines, most-violated rules only)                             | Re-injection (§6.1)            | NEU-312 (extend) | Empirically validated: re-injection maintains 100% adherence vs. 25% baseline in long sessions. |
| 1d  | Restructure tool descriptions: critical rules in first sentence, repeated in last sentence; middle for details                  | Positional optimization (§6.4) | New issue        | Low-cost, addresses lost-in-the-middle.                                                         |
| 1e  | Add `teaching_approach` enum field to `submit_answer`                                                                           | Persistent constraint (§6.2)   | NEU-312 (extend) | Forces mode re-confirmation per turn via constrained decoding.                                  |

### Tier 2: Experiment (moderate confidence, needs prototyping/testing)

| #   | Action                                                                                                                                              | Mechanism                        | Linear Issue             | Rationale                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 2a  | Post-creation quality checks on `create_topic_with_chunks`: prerequisite graph connectivity, difficulty variance, return `quality_assessment` field | Detection (§5.2)                 | NEU-230 (extend pattern) | Catches failures schema constraints miss. Returns nudge, not rejection. Needs threshold calibration.                |
| 2b  | Session-level quality monitoring: track quality score trajectory, flag sessions with >50% failure rate per skill                                    | Detection (§5.3)                 | New issue                | Strongly validated signal. Threshold needs empirical calibration against Second Memory data.                        |
| 2c  | Structured quality warnings in tool responses: `quality_warnings: [{ type, severity, affected_chunks }]` in mutation responses                      | Nudge (§4.1-4.2)                 | NEU-230 (extend)         | Moderate evidence of effectiveness. Test whether agents act on structured warnings vs. ignore them.                 |
| 2d  | Two-phase creation: `plan_skill_creation` → `commit_skill_creation` for high-stakes content                                                         | Pre-commit review (§3.3)         | New issue                | Adds a verification checkpoint. Higher token cost but separates planning from commitment. Test with A/B comparison. |
| 2e  | Log all quality warnings issued and whether agent acted on them (compliance tracking infrastructure)                                                | Adaptive enforcement prep (§4.4) | New issue                | Required foundation for future escalation logic. No behavioral change; pure instrumentation.                        |

### Tier 3: Defer (low confidence or high cost, revisit when evidence improves)

| #   | Action                                                                             | Mechanism                    | Linear Issue    | Rationale                                                                                                              |
| --- | ---------------------------------------------------------------------------------- | ---------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 3a  | Adaptive enforcement escalation (nudge → warn → block based on compliance history) | Adaptive enforcement (§4.4)  | Future          | Requires compliance tracking data (2e) to exist first. Premature without baseline data.                                |
| 3b  | Self-verification chains for content quality                                       | Self-check (§3.1-3.2)        | Not recommended | Evidence shows self-verification is unreliable for soft criteria. Token cost is high. External verification is better. |
| 3c  | Automatic skill splitting on detection of bad structure                            | Remediation (§5.4)           | Future          | High risk of incorrect splits. Prefer flagging + learner-approved restructuring.                                       |
| 3d  | Cross-model verification (separate model instance checks primary model's work)     | External verification (§3.5) | Future          | Addresses self-preference bias but doubles infrastructure cost. Revisit when multi-model MCP patterns mature.          |

### Implementation Sequence

```
Phase 1 (immediate, NEU-312 implementation window):
  1a → Schema constraints on create_topic_with_chunks
  1b → Session state in teach_next response
  1c → Universal rules reminder in teach_next
  1d → Tool description restructuring
  1e → teaching_approach enum on submit_answer

Phase 2 (next sprint, after NEU-312 ships):
  2e → Compliance logging infrastructure (foundation for everything else)
  2a → Post-creation quality checks
  2c → Structured quality warnings

Phase 3 (following sprint, after compliance data accumulates):
  2b → Session-level quality monitoring
  2d → Two-phase creation experiment

Phase 4 (data-driven, when compliance logs show patterns):
  3a → Adaptive enforcement escalation
  Revisit 3b-3d based on observed failure modes
```

### Cross-Reference with Linear Issues

- **NEU-312** (teach_next response enrichment, In Progress): Primary vehicle for Tier 1 changes. Extend to include `chunks_presented_to_learner`, `universal_rules_reminder`, and `teaching_approach` confirmation field. The per-tier instruction generation already addresses part of the re-injection mechanism.

- **NEU-306** (graduated reteaching tiers, Backlog): The four-tier teaching approach system (`recall`, `cued_recall`, `reteach`, `scaffold`) is exactly the kind of behavioral specification that benefits from schema enforcement (enum fields) and state externalization (server tracks which tier applies, agent doesn't need to remember).

- **NEU-310** (classifyChunk, Done): Pure computation — no compliance implications. Foundation for NEU-312's tier-aware instructions.

- **NEU-311** (computeTopicProfile, Done): The `needs_topic_orientation` and `prerequisite_chain_broken` fields are examples of server-computed state that should be externalized to the agent per turn (§6.3). These directly address the "agent forgets to orient" and "agent teaches dependent content before prerequisites" failures.

- **NEU-230** (consistency reminder after mutations, Done): Established the pattern of embedding behavioral reminders in tool responses. This research validates that pattern (§4.1) and recommends extending it with structured quality warnings (§4.2) rather than prose reminders. The NEU-230 implementation used prose `consistency_reminder` — future iterations should use structured `quality_warnings` arrays for higher salience.

---

## 8. Key Cited Sources

### Instruction Following and Compliance

- Liu et al. "Lost in the Middle: How Language Models Use Long Contexts." _TACL_, 2023. arXiv:2307.03172.
- "The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions." OpenReview, ICLR track.
- Ouyang et al. "Training language models to follow instructions with human feedback." NeurIPS, 2022. arXiv:2203.02155.
- "Mitigating the Alignment Tax of RLHF." EMNLP, 2024. arXiv:2309.06256.
- "AgentIF: Benchmarking Instruction Following of LLMs in Agentic Scenarios." arXiv:2505.16944.
- "ConInstruct: Evaluating LLMs on Conflict Detection and Resolution in Instructions." arXiv:2511.14342.

### Tool Use and Function Calling

- "Gorilla: Large Language Model Connected with Massive APIs." UC Berkeley. arXiv:2305.15334.
- Patil et al. "The Berkeley Function Calling Leaderboard (BFCL)." OpenReview.
- "Think-Augmented Function Calling (TAFC)." arXiv:2601.18282.
- "CRANE: Reasoning with Constrained LLM Generation." arXiv:2502.09061.
- "CallNavi: A Challenge and Empirical Study on LLM Function Calling." arXiv:2501.05255.

### Self-Verification and Self-Correction

- "Chain-of-Verification Reduces Hallucination in LLMs." ACL Findings, 2024.
- "Reflexion: Language Agents with Verbal Reinforcement Learning." NeurIPS, 2023. arXiv:2303.11366.
- "When Can LLMs Actually Correct Their Own Mistakes? A Critical Survey." _TACL_. doi:10.1162/tacl_a_00713.
- "Self-Preference Bias in LLM-as-a-Judge." arXiv:2410.21819.
- "SelfCheck: Using LLMs to Zero-Shot Check Their Own Step-by-Step Reasoning." arXiv:2308.00436.

### Agent Drift and Long Conversations

- "Agent Drift: Quantifying Behavioral Degradation." arXiv:2601.04170.
- "LLMs Get Lost In Multi-Turn Conversation." arXiv:2505.06120.
- "Mitigating Conversational Inertia in Multi-Turn Agents." arXiv:2602.03664.
- "Context Length Alone Hurts LLM Performance Despite Perfect Retrieval." arXiv:2510.05381.
- "InfiAgent: Infinite-Horizon Framework." arXiv:2601.03204.

### Theory of Mind and Perspective-Taking

- "Evaluating large language models in theory of mind tasks." _PNAS_, 2024.
- "False Consensus Biases AI Against Vulnerable Stakeholders." arXiv:2407.12143.
- "Who Sees What? Structured Thought-Action Sequences for Epistemic Reasoning." arXiv:2508.14564.

### Enforcement and Governance

- "Agent Behavioral Contracts: Formal Specification and Runtime Enforcement." arXiv:2602.22302.
- "PolicyGuard: Towards Policy-Compliant Agents." arXiv:2510.03485.
- "Governance-as-a-Service Multi-Agent Compliance." arXiv:2508.18765.
- Microsoft. "Taxonomy of Failure Mode in Agentic AI Systems." 2025.

### Learning Analytics and Content Quality

- "ACE: AI-Assisted Construction of Educational Knowledge Graphs." _Journal of Educational Data Mining_.
- "Prerequisite Relation Learning: A Survey and Outlook." _ACM Computing Surveys_.
- "Student Dropout Prediction Through ML Optimization." _Nature Scientific Reports_, 2025.
- "Modeling Frustration Trajectories in Adaptive Learning Environments." Springer, 2021.

### Structured Output

- "Stop Blaming the LLM: JSON Schema Is the Cheapest Fix for Flaky AI Agents." Medium, February 2026.
- "Let Me Speak Freely? A Study on the Impact of Format Restrictions on LLM Performance." arXiv:2408.02442.
- LangChain Blog: "Context Engineering for Agents."
