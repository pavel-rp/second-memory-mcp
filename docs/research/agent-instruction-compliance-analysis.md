# Agent Instruction Compliance: Why Agents Ignore Tool Instructions and Mitigation Analysis

**Date:** 2026-04-10
**Source:** Research Report #3 (Enforcement and Verification Mechanisms for AI Agent Compliance), codebase audit of Second Memory MCP instruction delivery mechanisms, and cross-reference analysis.

---

## 1. Why Agents Ignore Tool Instructions: The Four-Factor Causal Model

### 1.1 Positional Attention Decay (RoPE)

Tool response fields at mid-context positions receive ~30% less attention regardless of format. The root cause is Rotary Position Embedding (RoPE), which introduces long-term decay effects (Liu et al., "Lost in the Middle," TACL 2023). A JSON key buried at position 3000 in context receives the same degraded attention as prose at that position.

**Key insight:** Structured fields offer no inherent protection against attention decay. The issue is architectural (positional encoding), not format-dependent. Field placement within tool responses matters more than field format.

**Cited:** Liu et al. 2023; Berkeley Function Calling Leaderboard (BFCL V3/V4); Gorilla (arXiv 2305.15334).

### 1.2 RLHF Helpfulness Heuristic Override

The primary failure mode in Second Memory sessions. RLHF-trained "be helpful and concise" behavior systematically overrides domain-specific task instructions.

- The InstructGPT paper (arXiv 2203.02155) documents 27% labeler disagreement on instruction priority — the reward model itself encodes ambiguity.
- "Mitigating the Alignment Tax of RLHF" (EMNLP 2024) shows RLHF improves general helpfulness but degrades specific-instruction-following.
- AgentIF benchmark (arXiv 2505.16944): ALL tested LLMs perform poorly on complex constraints; best model follows fewer than 30% of instructions perfectly. Models particularly fail at conditional constraints.
- ConInstruct (arXiv 2511.14342): LLMs exhibit strong conflict detection but fail to explicitly communicate conflicts. They generate responses that only partially satisfy conflicting constraints.

**Second Memory pattern:** When `teach_next` returns a 5-step structured teaching script, the agent treats it as regular text to be summarized, not as a task specification to be executed. The competing heuristic ("be concise") wins because it has stronger reward-model backing.

### 1.3 Temporal Decay Across Turns

Instructions followed at turn 1 degrade by turn 10 and are effectively absent by turn 50.

- "Agent Drift: Quantifying Behavioral Degradation" (arXiv 2601.04170): baseline adherence to behavioral instructions degraded to 25% by end of session. With reinforcement steering, adherence maintained 100%. 42% reduction in task success rates, 3.2x increase in human intervention.
- "LLMs Get Lost In Multi-Turn Conversation" (arXiv 2505.06120): "loss-of-middle-turns" phenomenon — models overly adjust to first and last conversation turns.
- "Mitigating Conversational Inertia" (arXiv 2602.03664): models exhibit strong diagonal attention to their own previous responses — imitation bias constraining adaptation to new tool outputs.
- "Context Length Alone Hurts" (arXiv 2510.05381): even with perfect retrieval, performance degrades 13.9%–85% as input length increases. Sheer context length damages performance independent of distraction.

### 1.4 Context-Knowledge Conflation

The agent cannot reliably distinguish between information in its context window and information the learner has access to.

- "Evaluating LLMs in theory of mind tasks" (PNAS 2024): GPT-4 fails 25% of perspective-taking tasks.
- "False Consensus Biases AI" (arXiv 2407.12143): agents overestimate how much others share their knowledge.
- "MindForge" (arXiv 2411.12977): agents fail to model others' mental states, including knowledge gaps.

**Second Memory pattern:** The agent references code or concepts from its context window even if the learner has never seen them. When the agent sees a tool response containing a concept definition, it assumes the learner also "knows" that definition.

### 1.5 Interaction Summary

1. **"Put it in the prompt"** fails due to positional bias (1.1) and temporal decay (1.3).
2. **"Put it in the tool response"** fails due to positional bias (1.1) and heuristic override (1.2).
3. **"Trust the agent to track learner state"** fails due to context-knowledge conflation (1.4).

Compliance mechanisms must operate at the decision boundary — schema constraints, server-side state management, and external verification — not at the instruction level.

---

## 2. What Second Memory Currently Does: Instruction Delivery Mechanisms

The codebase implements a 13-mechanism layered instruction delivery system across 4 tiers.

### 2.1 Protocol Layer (Init-Time)

**SERVER_INSTRUCTIONS via MCP `instructions` field**

- Location: `src/shared/instructions.ts` → `src/transport/create-server.ts:18-21`
- Content: ~1,100+ word comprehensive workflow guide covering Teaching Flow, Rolling Session Flow, Content Creation, Assessment
- Fires: Once at MCP server initialization
- Limitation: Some MCP clients (e.g., Claude.ai Projects) don't surface the `instructions` field

**`get_server_workflow` tool (fallback)**

- Location: `src/server/server-context-tools.ts`
- Purpose: Zero-param tool returning `SERVER_INSTRUCTIONS` for clients that don't support the `instructions` field
- Fires: On-demand when agent calls it

### 2.2 Init Context Layer

**WORKFLOW_SUMMARY + DOMAIN_RULES via `init_agent_context`**

- Location: `src/shared/instructions.ts:67-73` (WORKFLOW_SUMMARY), `src/shared/domain-rules.ts` (DOMAIN_RULES)
- WORKFLOW_SUMMARY: Condensed 1-paragraph variant of SERVER_INSTRUCTIONS
- DOMAIN_RULES: Ubiquitous language definitions, anti-patterns, sizing constraints (2-7 chunks per topic, 300-1500 words per chunk)
- Fires: When agent calls `init_agent_context`

### 2.3 Per-Call Nudge Layer

**workflowHint in `teach_next` responses**

- Location: `src/server/teaching-tools.ts:49-73`
- Content: Adaptive per-approach instruction. Branches based on `teaching_approach`:
  - `scaffold`: "Start with recognition → escalate to open recall after success. Stay at Level 1 only."
  - `reteach`: "Brief recall probe first. If weak, compressed re-presentation then retrieval check."
  - `cued_recall`: "Ask what they remember first. On failure, graduated hints."
  - `recall` (default): "Taxonomy escalation: Recall → Explain/Apply → Analyze/Create."
- Includes: sessionId, chunkId, mode, dominantTier, instruction, nextStep
- Fires: Every `teach_next` response when status==='teach'

**workflowHint in `batch_fetch_chunks_minimal`**

- Location: `src/server/query-tools.ts:137-148`
- Content: Enforces session creation for recall — "You MUST call create_session with mode 'retrieval' or 'review'"
- Fires: Whenever chunks are fetched and results are non-empty

**Reflection prompt**

- Location: `src/shared/constants/prompts.ts:1-8`
- Content: Nudge to call `add_note` with insight/confusion/connection/deeper_exploration types
- Fires: Every `submit_answer` response when status==='recorded'

### 2.4 Conditional Gate Layer

**Roadblock Gate (NEU-479)**

- Location: `src/domain/algorithms/roadblock-gate.ts`
- Trigger: Quality 0-2 on a chunk with insufficient follow-up questions
- Configuration: `roadblockFollowups: { 0: 3, 1: 3, 2: 2, 3: 1, 4: 1, 5: 0 }`
- Emits: Socratic DO/DON'T follow-up question principles appended to `buildRoadblockInstruction`
  - DO: why/how questions, same concept from different angles, scaffolded difficulty, compare/contrast
  - DON'T: rephrase original question, yes/no questions, unrelated questions to pad count
- Response status: `'roadblock'` with `roadblock_detail` object
- Invoked in: `src/orchestration/teaching-workflows.ts:163-188`

**Quality Cap**

- Location: `src/domain/algorithms/quality-cap.ts`
- Rules: min prior quality 0-1 → cap at 3; min prior quality 2 → cap at 4; ≥3 → no cap
- Fires: Per `submit_answer` call
- Emits: `wasCapped: true, agentQuality: input.quality` when cap applied

**Prerequisite Staleness Injection**

- Location: `src/orchestration/teaching-workflows.ts:321-443`
- Purpose: If prerequisites are stale, inserts them before the dependent chunk
- Emits: `prerequisite_reteach_needed: [chunkId1, chunkId2, ...]`
- Fires: During chunk selection phase of `teach_next`

**Message-based Blocking**

- Statuses: `blocked` (no attempts, unanswered questions, no assessment questions), `retry` (incorrect first attempt), `error` (data/logic errors)
- Fires: Per-call when gate or error condition triggers

### 2.5 State Signal Layer

**Teaching Approach + Retrievability**

- Location: `src/domain/algorithms/classify-chunk.ts`
- Content: Per-chunk retrievability estimation (FSRS power-law) mapped to teaching approach
- Thresholds: R≥0.7 → recall, 0.5≤R<0.7 → cued_recall, 0.3≤R<0.5 → reteach, R<0.3 → scaffold
- Fires: Per-chunk in `teach_next`

**Topic Staleness Profile**

- Location: `src/domain/algorithms/compute-topic-profile.ts`
- Emits: topicId, totalChunks, tierDistribution, medianRetrievability, dominantTier, needsTopicOrientation, prerequisiteChainBroken
- Fires: Per-chunk in `teach_next`

**Historical Feedback Context**

- Location: `src/orchestration/teaching-workflows.ts:450-470`
- Content: Up to 5 prior feedback entries per chunk (sessionMode, completedAt, feedback)
- Purpose: Personalizes guidance based on learner's previous struggles

**Schema `.describe()` Honesty Reinforcement (NEU-479)**

- Content: `quality` field description includes "Score HONESTLY" and session-scoped cap warnings
- Fires: Per `submit_answer` via schema description processing

---

## 3. Gap Analysis: What We're Not Doing But Should

### 3.1 Tier 1 — High Confidence, Should Be Done Now

#### 1a: Schema Constraints on `create_topic_with_chunks`

- **Status:** NOT IMPLEMENTED
- **What:** Add `chunks: { minItems: 2, maxItems: 7 }`, `dependency_graph_type` enum (`linear_chain | convergent | divergent | independent`)
- **Why highest priority:** Constrained decoding takes compliance from ~40% (prose instruction) to ~100% (schema enforcement) at zero token cost. This is mathematically guaranteed compliance through token masking.
- **Evidence:** VERY HIGH — "Stop Blaming the LLM: JSON Schema Is the Cheapest Fix" (2026); CRANE (arXiv 2502.09061); CallNavi (arXiv 2501.05255)

#### 1b: Compact Session State in Every `teach_next` Response

- **Status:** PARTIALLY DONE — topic staleness profile and `is_first_chunk_in_topic` exist, but no explicit `chunks_presented_to_learner` list
- **What:** Return `chunks_presented_to_learner`, `topics_oriented`, `session_mode` with every `teach_next` call
- **Why:** Directly fixes context-knowledge conflation (§1.4). The agent no longer needs to remember what was shown — the server tells it each turn.
- **Evidence:** VERY HIGH — InfiAgent (arXiv 2601.03204); LangChain context engineering patterns

#### 1c: Universal Rules Reminder in Every `teach_next`

- **Status:** NOT IMPLEMENTED — workflowHint has per-approach guidance but no universal rules re-injection
- **What:** 3-5 line compact re-statement of most-violated rules (e.g., "present ALL content from the teaching script before asking questions")
- **Why:** Agent Drift paper shows re-injection maintains 100% adherence vs. 25% baseline in long sessions
- **Evidence:** HIGH — Agent Drift (arXiv 2601.04170)

#### 1d: Tool Description Positional Optimization

- **Status:** NOT AUDITED — tool descriptions exist but haven't been structured per lost-in-the-middle findings
- **What:** Critical rules in first sentence of tool description, repeated in last sentence. Middle for details.
- **Why:** Addresses lost-in-the-middle effect in tool catalogs. Low cost.
- **Evidence:** HIGH — Liu et al. 2023; EmergentMind multi-turn tool-calling analysis

#### 1e: `teaching_approach` Enum on `submit_answer`

- **Status:** NOT IMPLEMENTED — approach is server-computed and returned, but agent doesn't confirm it back
- **What:** Add required `teaching_approach: enum("recall", "cued_recall", "reteach", "scaffold")` field
- **Why:** Forces mode re-confirmation per turn via constrained decoding. Prevents mode drift.
- **Evidence:** MEDIUM-HIGH — constrained decoding guarantees; Agent Drift (arXiv 2601.04170)

### 3.2 Tier 2 — Should Experiment With

#### 2a: Post-Creation Quality Checks

- **Status:** NOT IMPLEMENTED
- **What:** After every `create_topic_with_chunks`, compute prerequisite graph connectivity, difficulty variance. Return `quality_assessment` field (nudge, not rejection).
- **Why:** Catches failures schema constraints miss — "are these chunks actually related?"
- **Evidence:** HIGH for session failure signals; MEDIUM for graph-structural metrics

#### 2b: Session-Level Quality Monitoring

- **Status:** NOT IMPLEMENTED
- **What:** Track quality score trajectory within sessions. Flag sessions where >50% of chunks in a skill receive quality ≤ 2. Return `restructuring_suggestion` in `complete_session` response.
- **Why:** Strongly validated signal for content overload and miscoped topics.
- **Evidence:** VERY HIGH for signal validity; thresholds need empirical calibration

#### 2c: Structured `quality_warnings` Arrays

- **Status:** NOT IMPLEMENTED — NEU-230 used prose `consistency_reminder`, not structured warnings
- **What:** Replace prose reminders with `quality_warnings: [{ type, severity, affected_chunks }]` in mutation responses
- **Why:** Structured data processed through constrained-decoding pathway = higher salience than prose
- **Evidence:** HIGH for structured-over-prose; MODERATE for magnitude

#### 2d: Two-Phase Creation

- **Status:** NOT IMPLEMENTED
- **What:** `plan_skill_creation` (returns plan for review) → `commit_skill_creation` (executes plan)
- **Why:** Adds verification checkpoint. Separates planning from commitment.
- **Trade-off:** Doubles tool calls. Higher token cost.
- **Evidence:** MODERATE — patterns exist but not standardized

#### 2e: Compliance Logging Infrastructure

- **Status:** NOT IMPLEMENTED
- **What:** Log all quality warnings issued and whether agent acted on them. Pure instrumentation — no behavioral change.
- **Why:** Foundation for data-driven decisions about all other interventions. Without this, you can't measure if anything works.
- **Arguably Tier 1:** This is the biggest blind spot. Every intervention is flying blind without measurement.
- **Evidence:** HIGH for necessity — required foundation for adaptive enforcement

### 3.3 Tier 3 — Correctly Deferred

| Item                                                           | Why Deferred                                                                                                                                               |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **3a: Adaptive enforcement escalation** (nudge → warn → block) | Requires compliance tracking data (2e) to exist first                                                                                                      |
| **3b: Self-verification chains**                               | Evidence shows self-verification is unreliable for soft criteria. Self-preference bias (10-25% GPT-4/Claude). Token cost high. Explicitly NOT recommended. |
| **3c: Automatic skill splitting**                              | High risk of incorrect splits. Same heuristic problems from §1 apply. Prefer flagging + learner-approved restructuring.                                    |
| **3d: Cross-model verification**                               | Addresses self-preference bias but doubles infrastructure cost. Revisit when multi-model MCP patterns mature.                                              |

---

## 4. Key Research Framework: Agent Behavioral Contracts (ABC)

The ABC framework (arXiv 2602.22302) provides the rigorous taxonomy for classifying enforcement mechanisms:

- **Hard constraints:** Must never be violated. Implemented as code running outside the context window, evaluated before tool invocation reaches the agent's decision layer. System-prompt rules are data agents can reason about (and override) — they are NOT hard constraints.
- **Soft constraints:** Admit transient violations provided recovery occurs within bounded time. Implemented as quality signals in tool responses, with escalation paths.

**Mapping for Second Memory:**

| Rule                                       | Classification | Current Mechanism              | Recommended Mechanism                                                        |
| ------------------------------------------ | -------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| Skill has 2-7 cards                        | Hard           | Prose in DOMAIN_RULES          | Schema: `minItems: 2, maxItems: 7`                                           |
| Cards share dependency chain               | Soft → Hard    | None                           | Nudge first (quality_assessment), future: server rejects disconnected graphs |
| Teaching script presented in full          | Soft           | workflowHint instruction       | Nudge (quality hint) — cannot be schema-enforced (agent produces free text)  |
| Agent tracks learner-shown vs. agent-known | Hard           | None                           | Server-side: `chunks_presented_to_learner` list                              |
| Topic orientation emitted once per topic   | Hard           | `is_first_chunk_in_topic` flag | Already implemented via topic staleness profile                              |

**Principle:** Hard constraints for anything the server can verify deterministically. Soft constraints for behavioral guidelines requiring judgment. Never classify as "soft" because implementation is hard.

---

## 5. The Fundamental Limitation

For teaching behavior — where the agent produces free text to the learner — schema constraints can't help. You can't schema-constrain what the agent says to the user. The best available mitigations for this gap are:

1. **State externalization** (1b: `chunks_presented_to_learner`) — server tells the agent what the learner has seen
2. **Re-injection** (1c: universal rules reminder) — repeat critical rules every turn
3. **Detection** (2e/2b: compliance logging + session quality monitoring) — measure failures after the fact

This is an unsolved problem in the field. The research consensus is that a hybrid of prevention + detection + nudges is the best available approach — not any single mechanism.

---

## 6. Implementation Priority

```
IMMEDIATE (highest leverage):
  2e → Compliance logging infrastructure (measure before optimizing)
  1a → Schema constraints on create_topic_with_chunks
  1b → chunks_presented_to_learner in teach_next
  1c → Universal rules reminder in teach_next

NEXT SPRINT:
  1d → Tool description positional audit
  1e → teaching_approach enum on submit_answer
  2c → Structured quality_warnings arrays

FOLLOWING SPRINT:
  2a → Post-creation quality checks
  2b → Session-level quality monitoring
  2d → Two-phase creation experiment

DATA-DRIVEN (when compliance logs show patterns):
  3a → Adaptive enforcement escalation
  Revisit 3b-3d based on observed failure modes
```

---

## 7. Key Cited Sources

### Instruction Following and Compliance

- Liu et al. "Lost in the Middle." TACL 2023. arXiv:2307.03172
- "The Instruction Hierarchy." OpenReview, ICLR track
- Ouyang et al. "Training language models to follow instructions." NeurIPS 2022. arXiv:2203.02155
- "Mitigating the Alignment Tax of RLHF." EMNLP 2024. arXiv:2309.06256
- "AgentIF: Benchmarking Instruction Following." arXiv:2505.16944
- "ConInstruct: Conflict Detection in Instructions." arXiv:2511.14342

### Tool Use and Function Calling

- "Gorilla: LLM Connected with Massive APIs." arXiv:2305.15334
- "TAFC: Think-Augmented Function Calling." arXiv:2601.18282
- "CRANE: Constrained Reasoning." arXiv:2502.09061
- Guo et al. "Learning to Rewrite Tool Descriptions." arXiv:2602.20426

### Self-Verification

- "Chain-of-Verification." ACL Findings 2024
- "Reflexion." NeurIPS 2023. arXiv:2303.11366
- "When Can LLMs Actually Correct Their Own Mistakes?" TACL
- "Self-Preference Bias in LLM-as-a-Judge." arXiv:2410.21819

### Agent Drift and Long Conversations

- "Agent Drift: Quantifying Behavioral Degradation." arXiv:2601.04170
- "LLMs Get Lost In Multi-Turn Conversation." arXiv:2505.06120
- "Mitigating Conversational Inertia." arXiv:2602.03664
- "Context Length Alone Hurts." arXiv:2510.05381
- "InfiAgent." arXiv:2601.03204

### Theory of Mind

- "Evaluating LLMs in theory of mind tasks." PNAS 2024
- "False Consensus Biases AI." arXiv:2407.12143
- "MindForge." arXiv:2411.12977

### Enforcement and Governance

- "Agent Behavioral Contracts." arXiv:2602.22302
- "PolicyGuard." arXiv:2510.03485
- "Stop Blaming the LLM: JSON Schema Is the Cheapest Fix." February 2026

### Structured Output

- "Let Me Speak Freely?" arXiv:2408.02442
- LangChain: "Context Engineering for Agents"
