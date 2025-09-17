# What to Learn Today

This MCP tool generates intelligent learning recommendations based on spaced repetition priorities, available time, and user preferences. It supports both guided "teach me" mode and explicit parameter mode.

## Tool Names
- `what_to_learn_today`: Generate recommendations
- `guided_learning_conversation`: Conduct a conversational, zero-friction session

## Inputs: `what_to_learn_today`
- `mode` (optional): `guided` | `explicit`. Default: `guided` if omitted
- `timeAvailable` (optional, number minutes)
- `subjectPreference` (optional): `CS` | `Math` | `SWE` | `Language` | `Any`
- `learningItems` (required): Array of candidate items
  - `id` (string)
  - `title` (string)
  - `subject` (string)
  - `difficulty` (1-10)
  - `nextReviewDate` (YYYY-MM-DD)
  - `easeFactor` (>=1.3)
  - `repetitions` (int >=0)
  - `lastReviewed` (YYYY-MM-DD, optional)
  - `estimatedDuration` (minutes)
  - `chunkType` (`new` | `review` | `remediation`)
  - `prerequisites` (string[], optional)
  - `tags` (string[], optional)
- `userHistory` (optional): recent sessions and learning patterns
- `sessionContext` (optional)
- `constraints` (optional):
  - `maxDuration` (minutes)
  - `maxCognitiveLoad`
  - `maxNewItems`
  - `subjectFilter` (string)
  - `excludeIds` (string[])

## Output: `what_to_learn_today`
- `recommendations`: ordered list with `priority`, `reason`, `order`, `cognitiveLoad`
- `sessionSummary`: totals and subject mix
- `conversationGuidance` (guided only)
- `estimatedDuration`: minutes
- `rationale`: brief explanation
- `alternatives`: optional backups
- `nextActions`: suggested steps

## Inputs: `guided_learning_conversation`
- `intent`: string (e.g., `start_learning`, `continue_session`, `need_clarification`)
- `context` (optional): can include `learningItems`, `userHistory`, `sessionContext`
- `userInput` (optional): free-form; parsed for time/subject hints
- `sessionState` (optional): for continuation

## Behavior
- Guided mode applies intelligent defaults (time, constraints, subject) using `userHistory.patterns`
- Composition balances overdue, review, and new items while respecting `maxDuration`, `maxCognitiveLoad`, and `maxNewItems`
- Items are interleaved for cognitive load optimization

## Configuration (env)
Key environment variables (defaults in parentheses):
- Cognitive load:
  - `SM_REC_MAX_COG_LOAD_DEFAULT` (20)
  - `SM_REC_COG_EASY_THRESHOLD` (8)
  - `SM_REC_COG_HARD_THRESHOLD` (15)
  - `SM_REC_COG_PER_MIN_FACTOR` (0.5)
- Session composition:
  - `SM_REC_MAX_NEW_DEFAULT` (3)
  - `SM_REC_SHORT_SESSION_MIN` (15), `SM_REC_MAX_NEW_SHORT` (1)
  - `SM_REC_LONG_SESSION_MIN` (45), `SM_REC_MAX_NEW_LONG` (5)
  - `SM_REC_INTERLEAVE_STRATEGY` ("easy-medium-hard")
- Conversation:
  - `SM_REC_CONVO_ENCOURAGEMENT` (true)
  - `SM_REC_CONVO_PROGRESS` (true)
  - `SM_REC_CONVO_VERBOSITY` ("medium")

## Examples

### Guided (zero input)
```json
{
  "mode": "guided",
  "learningItems": [
    {
      "id": "i1",
      "title": "Big-O Basics",
      "subject": "CS",
      "difficulty": 5,
      "nextReviewDate": "2025-09-17",
      "easeFactor": 2.5,
      "repetitions": 2,
      "estimatedDuration": 12,
      "chunkType": "review"
    }
  ],
  "userHistory": {
    "recentSessions": [],
    "patterns": {
      "averageSessionDuration": 25,
      "preferredDifficulty": 5,
      "successRate": 0.72,
      "fatigueThreshold": 18,
      "subjectPreferences": { "CS": 1 }
    }
  }
}
```

### Explicit with constraints
```json
{
  "mode": "explicit",
  "timeAvailable": 30,
  "subjectPreference": "Any",
  "constraints": { "maxDuration": 30, "maxCognitiveLoad": 40, "maxNewItems": 2 },
  "learningItems": [ /* ... */ ]
}
```

## Notes
- Validate inputs with the published Zod schemas in `src/types/recommendations.ts`.
- Provide realistic `estimatedDuration` and `nextReviewDate` to improve prioritization.
