# `submit_answer` Retry Response: Teaching Re-injection Spec

## The Problem (with Evidence)

When `submit_answer` returns `"retry"`, the agent receives:

```json
{
  "status": "retry",
  "session_question_id": "...",
  "attempt": 1,
  "chunk_id": "...",
  "message": "Incorrect. Try again.",
  "feedback": "..."
}
```

No teaching guidance. No roadblock preview. No mode-specific pivot instruction. The agent defaults to generic retry behavior: offer to move on, or re-ask with trivially simpler wording.

### Observed session failure (2026-04-11)

```
Agent: "Want to retry the same question, or should I take this as
        understood and move on to chunk 2?"
Learner: "didn't you get instructions to ask multiple questions after failure?"
Agent: "You're right. The probing algorithm says: on wrong, give feedback
        then ask another question at the same level..."
```

The agent _remembered_ the probing algorithm only when prompted by the learner. Without the nudge, it would have advanced — hitting the roadblock gate at `teach_next` and wasting a round trip.

### Why this happens

The re-injection mechanism (NEU-312) only applies to `teach_next`. The retry is 3+ tool calls after the last `workflowHint`:

```
teach_next (workflowHint injected here)
  → agent asks question
    → submit_answer (inline, first attempt)
      → "retry" ← NO GUIDANCE
        → agent must scaffold ← BUT INSTRUCTIONS DRIFTED
```

NEU-424 cites arXiv 2601.04170: adherence degrades to **25% without reinforcement** vs. ~100% with re-injection.

---

## Proposed `retry_guidance` Field

Add a structured `retry_guidance` object to `SubmitAnswerRetry`. It has two concerns:

1. **Roadblock forecast** — how many follow-ups the server will require before allowing progression
2. **Mode-specific retry pivot** — what the agent should do differently on the retry, based on `teaching_approach`

### Full shape

```typescript
export type RetryGuidance = {
  // Roadblock state (from evaluateRoadblock logic, projected forward)
  roadblock: {
    trigger_quality: number; // the quality that triggered the gate
    required_followups: number; // total follow-ups required (from roadblockFollowups config)
    completed_followups: number; // how many qualifying follow-ups exist so far
    remaining: number; // required - completed
    quality_floor: 3; // each follow-up must score ≥ 3 to count
  };
  // Teaching pivot (keyed on teaching_approach from session chunk classification)
  teaching_approach: TeachingApproach; // 'scaffold' | 'reteach' | 'cued_recall' | 'recall'
  pivot: string; // mode-specific retry instruction
};
```

### Per-mode `pivot` strings

These are **not** restated tier instructions. They are explicit **pivots** — what to change because the first attempt failed.

#### `scaffold`

```
Open recall failed. Downgrade to a recognition question (multiple choice or true/false)
that tests the SAME concept. If recognition succeeds, escalate back to one open recall
question before moving on. Do not offer to skip or advance.
```

#### `reteach`

```
Recall probe showed weak retention. Give a compressed re-explanation (~60% of original
detail), highlighting the specific part the learner missed. Then ask a retrieval check
question that requires the learner to use the re-explained concept. Do not re-ask the
same question with simpler wording.
```

#### `cued_recall`

```
Open recall failed. Provide graduated hint #1: a contextual cue connecting this concept
to the broader topic. If the learner still cannot answer, provide hint #2: structural
("There are N key aspects — the first is..."). Ask a fresh question after each hint.
Max 3 hints before revealing the answer + requiring a retrieval check.
```

#### `recall` (standard)

```
Give specific feedback on what was wrong, then ask a NEW question at the same taxonomy
level testing the SAME concept from a different angle. Do not rephrase the original
question. Do not offer to advance — the server requires follow-up questions before
progression is allowed.
```

---

## How Roadblock State is Computed at Retry Time

The roadblock config lives in `algorithm-defaults.ts`:

```typescript
roadblockFollowups: { 0: 3, 1: 3, 2: 2, 3: 1, 4: 1, 5: 0 }
```

At the retry point in `submitAnswerForQuestion`, we already have:

- `primaryChunkId`
- `sessionQuestionId`
- `input.quality` (the quality the agent assigned, possibly capped by `computeQualityCap`)
- The capped `quality` value
- Access to `deps.algorithmConfig.roadblockFollowups`

The retry response fires when `!passed && attemptNumber === 1`. At this point:

- The capped quality is the `trigger_quality`
- `required_followups = roadblockFollowups[trigger_quality]`
- `completed_followups = 0` (this IS the first failure — no follow-ups yet)
- `remaining = required_followups`

Note: for `attemptNumber === 2` (second attempt on same question), the response is `"recorded"` not `"retry"`, so retry_guidance only applies to the first failure.

### Quality cap interaction

The quality cap (`computeQualityCap`) fires BEFORE the retry check. So if the agent submits quality 2, and there's a prior quality 1 for the same chunk, the cap doesn't change it (2 < cap of 3). The retry_guidance should use the **capped** quality as `trigger_quality` since that's what the roadblock gate will see.

---

## Example Responses

### Scaffold mode, quality 2

```json
{
  "status": "retry",
  "session_question_id": "sq_abc123",
  "attempt": 1,
  "chunk_id": "chunk_xyz",
  "message": "Incorrect. Try again.",
  "feedback": "The learner confused V with L in the closed-form formula.",
  "retry_guidance": {
    "roadblock": {
      "trigger_quality": 2,
      "required_followups": 2,
      "completed_followups": 0,
      "remaining": 2,
      "quality_floor": 3
    },
    "teaching_approach": "scaffold",
    "pivot": "Open recall failed. Downgrade to a recognition question (multiple choice or true/false) that tests the SAME concept. If recognition succeeds, escalate back to one open recall question before moving on. Do not offer to skip or advance."
  }
}
```

### Standard recall mode, quality 1

```json
{
  "status": "retry",
  "session_question_id": "sq_def456",
  "attempt": 1,
  "chunk_id": "chunk_xyz",
  "message": "Incorrect. Try again.",
  "feedback": "Complete blackout on the concept.",
  "retry_guidance": {
    "roadblock": {
      "trigger_quality": 1,
      "required_followups": 3,
      "completed_followups": 0,
      "remaining": 3,
      "quality_floor": 3
    },
    "teaching_approach": "recall",
    "pivot": "Give specific feedback on what was wrong, then ask a NEW question at the same taxonomy level testing the SAME concept from a different angle. Do not rephrase the original question. Do not offer to advance — the server requires follow-up questions before progression is allowed."
  }
}
```

### Quality 5 (no retry — passed)

No `retry_guidance` needed. `submit_answer` returns `"recorded"` with `passed: true`.

### Quality 3 or 4 (passed but roadblock still applies)

`submit_answer` returns `"recorded"` with `passed: true`. The roadblock gate in `teach_next` handles these — the agent discovers it needs 1 follow-up when it calls `teach_next` and gets `status: "roadblock"`. **This spec does not change that path** — the `"recorded"` response doesn't need retry_guidance because the agent is already done with the question.

---

## What This Does NOT Do

1. **Does not replicate the full probing algorithm.** The pivot string is ~50 words, not 250. The full algorithm lives in `teach_next`'s `workflowHint` and tool descriptions.

2. **Does not include `level_ceiling`.** The `teach_next` already stated the ceiling; omitting it here saves tokens and avoids the bloat problem NEU-383 is addressing.

3. **Does not add conditional pre-warnings.** NEU-479 explicitly concluded these are the weakest instruction category. The retry_guidance fires at the exact moment it's needed — it IS the response, not a "maybe later" warning.

4. **Does not change the `teach_next` roadblock path.** That path already works (NEU-478). This spec only addresses the `submit_answer` retry gap — the moment BETWEEN the initial failure and when the agent next calls `teach_next`.

---

## Files to Modify

| File                                      | Change                                                                                                                                                                                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/domain/types/teaching.ts`            | Add `RetryGuidance` type. Add optional `retry_guidance` to `SubmitAnswerRetry`.                                                                                                                                                                |
| `src/orchestration/teaching-workflows.ts` | In the retry return block (~line 1018), compute `retry_guidance` from capped quality + `roadblockFollowups` config + session chunk's `teaching_approach`.                                                                                      |
| `src/shared/instructions.ts`              | Update step 3: "On 'retry', follow the `retry_guidance`: use the mode-specific `pivot` to scaffold the learner, and note that `roadblock.remaining` follow-up questions (each ≥ quality 3) are required before the server allows progression." |

---

## Compatibility

- **NEU-383** (structured JSON over instruction blobs): `retry_guidance` is already structured JSON. No migration needed when NEU-383 ships.
- **NEU-479** (dynamic payloads > static descriptions): `retry_guidance` follows the same pattern — contextual guidance in the response, not buried in tool descriptions.
- **NEU-476** (roadblock gate): This is the upstream signal. The retry_guidance _forecasts_ the roadblock so the agent doesn't waste a round-trip discovering it at `teach_next`.

---

## Implementation Detail: `teaching_approach` Availability at Retry Point

**Verified:** `SessionChunk` (in `entities.ts`) does NOT store `teaching_approach`. The type is:

```typescript
export type SessionChunk = {
  id: string;
  sessionId: string;
  chunkId: string;
  status: string;
  timeSpentMs: number;
  createdAt: number;
  updatedAt: number;
};
```

`classifyChunk` runs inside `getNextTeachingStep` (teach_next), computes the tier, and returns it in the response — but never persists it to the session_chunk row.

### Options

1. **Add `teaching_approach` column to `session_chunks` table.** Write it when `teach_next` classifies the chunk and sets it to `in_progress`. Read it back in the retry path. This is the cleanest option — the classification is session-scoped state that should be externalized (per enforcement report §6.3).

2. **Re-classify at retry time.** Call `classifyChunk` again in `submitAnswerForQuestion`. The inputs (chunk schedule data, algorithm config) are all available. Adds ~1 DB query for the chunk's schedule. Correct but wasteful — the classification shouldn't change between teach_next and submit_answer within the same session.

3. **Default to `'recall'` if unavailable.** The standard probing algorithm is always safe. But this defeats the purpose of per-mode pivots — a scaffold chunk getting recall-mode guidance is exactly the failure we're trying to fix.

**Recommendation:** Option 1 (persist to session_chunks). It's a small migration, aligns with the state externalization principle, and makes the data available to any future consumer (analytics, session summaries, etc.).
