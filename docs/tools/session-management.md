# Session Management Tools

This document provides comprehensive documentation for the session management MCP tools in Second Memory Learning.

## Overview

The session management system provides structured learning sessions with persistent tracking of progress, attempts, and completion metrics. Sessions can be associated with topics and specific learning chunks, allowing for focused learning experiences.

### Automatic Session Chunk Creation

When creating a session with the `chunkIds` parameter, the system automatically creates corresponding `session_chunks` records. This eliminates the need to manually create session chunks after session creation, streamlining the learning workflow.

**Key Features:**

- **Automatic Initialization**: Session chunks are created with `status: "pending"` and default values
- **Validation**: Chunk IDs are validated against existing `learning_chunks` before session creation
- **Error Handling**: Clear error messages when invalid chunk IDs are provided
- **Atomic Operations**: Session and session chunks are created in a single transaction

## Database Schema

### learning_sessions Table

Stores learning session metadata and state:

```sql
CREATE TABLE learning_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    topic_id TEXT REFERENCES learning_topics(id) ON DELETE SET NULL,
    chunk_ids TEXT, -- JSON array of chunk IDs
    mode TEXT NOT NULL CHECK (mode IN ('scaffolding', 'learning', 'retrieval', 'review')),
    estimated_duration INTEGER, -- minutes
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    start_time INTEGER NOT NULL, -- epoch ms
    end_time INTEGER, -- epoch ms, set on completion
    feedback TEXT, -- optional completion feedback
    created_at INTEGER NOT NULL, -- epoch ms
    updated_at INTEGER NOT NULL -- epoch ms
);
```

### session_chunks Table

Tracks individual chunk progress within sessions:

```sql
CREATE TABLE session_chunks (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    chunk_id TEXT NOT NULL REFERENCES learning_chunks(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    attempts_json TEXT, -- JSON array of ChunkAttempt objects
    quality_scores_json TEXT, -- JSON array of quality scores (0-5)
    time_spent_ms INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL, -- epoch ms
    updated_at INTEGER NOT NULL -- epoch ms
);
```

## MCP Tools

### create_session

Creates a new learning session with specified parameters. When `chunkIds` are provided, session chunks are automatically created with `status: "pending"`.

**Parameters:**

- `topicId` (optional): ID of the topic to associate with the session
- `chunkIds` (optional): Array of chunk IDs to work on in this session. **When provided, session chunks are automatically created for each chunk ID.**
- `mode` (required): Session mode - one of: `scaffolding`, `learning`, `retrieval`, `review`
- `estimatedDuration` (optional): Estimated duration in minutes (1-480)

**Response:**

```json
{
  "sessionId": "uuid",
  "status": "created",
  "message": "Session created successfully with mode: learning and 2 chunks initialized"
}
```

**Automatic Chunk Creation:**
When `chunkIds` are provided, the system automatically:

1. Validates that all chunk IDs exist in the `learning_chunks` table
2. Creates corresponding `session_chunks` records with `status: "pending"`
3. Links each session chunk to the session via foreign key
4. Initializes default values: `timeSpentMs: 0`, empty attempts and quality scores

**Error Handling:**
If any chunk IDs are invalid (don't exist in `learning_chunks`), the session creation fails with a descriptive error message:

```json
{
  "error": "Invalid chunk IDs provided: Chunk 'nonexistent-chunk' not found in learning content. Please verify the chunk IDs or use list_chunks to see available chunks."
}
```

**Example:**

```javascript
const result = await create_session({
  topicId: 'math-algebra',
  chunkIds: ['chunk1', 'chunk2'],
  mode: 'learning',
  estimatedDuration: 30,
});
// This automatically creates 2 session chunks with status: "pending"
```

### get_active_session

Retrieves the most recently created active session.

**Parameters:** None

**Response:**

```json
{
  "session": {
    "id": "uuid",
    "topicId": "topic-id",
    "chunkIds": "[\"chunk1\",\"chunk2\"]",
    "mode": "learning",
    "estimatedDuration": 30,
    "status": "active",
    "startTime": 1704067200000,
    "endTime": null,
    "feedback": null,
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000,
    "chunks": [
      {
        "id": "session-chunk-1",
        "session_id": "uuid",
        "chunk_id": "chunk1",
        "status": "pending",
        "attempts": [],
        "quality_scores": [],
        "time_spent_ms": 0,
        "created_at": 1704067200000,
        "updated_at": 1704067200000
      },
      {
        "id": "session-chunk-2",
        "session_id": "uuid",
        "chunk_id": "chunk2",
        "status": "pending",
        "attempts": [],
        "quality_scores": [],
        "time_spent_ms": 0,
        "created_at": 1704067200000,
        "updated_at": 1704067200000
      }
    ]
  },
  "status": "found"
}
```

**Example:**

```javascript
const result = await get_active_session();
if (result.status === 'found') {
  console.log('Active session:', result.session.id);
}
```

### complete_session

Marks an active session as completed and optionally records feedback.

**Parameters:**

- `sessionId` (required): ID of the session to complete
- `feedback` (optional): Optional completion feedback

**Response:**

```json
{
  "sessionId": "uuid",
  "status": "completed",
  "finalMetrics": {
    "duration": 25,
    "chunksCompleted": 2,
    "averageQuality": 4.2
  },
  "message": "Session completed successfully"
}
```

**Example:**

```javascript
const result = await complete_session({
  sessionId: 'session-uuid',
  feedback: 'Great session! Learned a lot about algebra.',
});
```

### create_session_chunk

Creates a session chunk to track learning progress for a specific chunk within a session.

**Parameters:**

- `sessionId` (required): ID of the session
- `chunkId` (required): ID of the learning chunk
- `status` (optional): Chunk status - `pending`, `in_progress`, or `completed` (default: `pending`)
- `attempts` (optional): Array of attempt objects with timestamp, quality, timeSpentMs, completed
- `qualityScores` (optional): Array of quality scores (0-5)
- `timeSpentMs` (optional): Total time spent on this chunk in milliseconds (default: 0)

**Response:**

```json
{
  "sessionChunkId": "uuid",
  "status": "created",
  "message": "Session chunk created successfully"
}
```

**Example:**

```javascript
const result = await create_session_chunk({
  sessionId: 'session-uuid',
  chunkId: 'chunk-uuid',
  status: 'completed',
  attempts: [
    {
      timestamp: Date.now(),
      timeSpentMs: 5000,
      completed: true,
      quality: 4,
    },
  ],
  qualityScores: [4],
  timeSpentMs: 5000,
});
```

## Session Analysis Tools

The following tools work with both session IDs and SessionInput objects for backward compatibility:

### session_progress

Tracks session completion metrics and progress.

**Parameters:**

- `sessionId` (optional): ID of the session to analyze
- `sessionData` (optional): SessionInput object with session data

**Response:**

```json
{
  "sessionId": "uuid",
  "mode": "learning",
  "chunks": [
    {
      "chunk_id": "chunk-uuid",
      "title": "Chunk Title",
      "status": "completed",
      "attempts": [...],
      "quality_scores": [4, 5],
      "time_spent_ms": 10000
    }
  ],
  "progress": {
    "totalChunks": 2,
    "completedChunks": 1,
    "inProgressChunks": 1,
    "pendingChunks": 0,
    "completionPercentage": 50
  }
}
```

### session_workflow

Provides guidance for the next learning phase.

**Parameters:**

- `sessionId` (optional): ID of the session to analyze
- `sessionData` (optional): SessionInput object with session data

**Response:**

```json
{
  "sessionId": "uuid",
  "recommendations": "Continue with the next chunk...",
  "nextActions": ["Review completed chunks", "Start next pending chunk"],
  "workflowGuidance": "Focus on understanding the concepts..."
}
```

### session_completion

Determines if a session should be completed based on progress and metrics.

**Parameters:**

- `sessionId` (optional): ID of the session to analyze
- `sessionData` (optional): SessionInput object with session data

**Response:**

```json
{
  "sessionId": "uuid",
  "shouldComplete": true,
  "metrics": {
    "duration": 25,
    "chunksCompleted": 2,
    "averageQuality": 4.2,
    "cognitiveLoad": 7.5
  },
  "reason": "All chunks completed successfully"
}
```

## Usage Patterns

### Basic Session Lifecycle

```javascript
// 1. Create a session
const session = await create_session({
  topicId: 'math-algebra',
  mode: 'learning',
  estimatedDuration: 30,
});

// 2. Get the active session
const activeSession = await get_active_session();

// 3. Create session chunks as you work
await create_session_chunk({
  sessionId: session.sessionId,
  chunkId: 'chunk1',
  status: 'completed',
  attempts: [
    {
      timestamp: Date.now(),
      timeSpentMs: 5000,
      completed: true,
      quality: 4,
    },
  ],
  qualityScores: [4],
  timeSpentMs: 5000,
});

// 4. Check progress
const progress = await session_progress({
  sessionId: session.sessionId,
});

// 5. Complete the session
await complete_session({
  sessionId: session.sessionId,
  feedback: 'Great session!',
});
```

### Session Analysis with Backward Compatibility

```javascript
// Using sessionId (new way)
const progress = await session_progress({
  sessionId: "session-uuid"
});

// Using SessionInput (legacy way)
const progress = await session_progress({
  sessionData: {
    session_id: "session-uuid",
    mode: "learning",
    start_time: "2024-01-01T00:00:00.000Z",
    current_time: "2024-01-01T00:30:00.000Z",
    chunks: [...],
    context: { topicId: "math-algebra" }
  }
});
```

## Error Handling

All session management tools return structured error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common error scenarios:

- Invalid session ID
- Foreign key constraint violations
- Invalid input parameters
- Database connection issues

## Best Practices

1. **Session Creation**: Always specify a mode and consider setting an estimated duration
2. **Chunk Tracking**: Create session chunks as you work through learning materials
3. **Progress Monitoring**: Use session analysis tools to track progress and get guidance
4. **Completion**: Always complete sessions with meaningful feedback
5. **Error Handling**: Check for errors in tool responses and handle gracefully

## Integration with Existing Tools

Session management integrates seamlessly with existing learning tools:

- **Spaced Repetition**: Session completion can trigger review scheduling
- **Analytics**: Session data feeds into learning analytics
- **Recommendations**: Session history influences future learning recommendations
- **Content Management**: Sessions work with existing topic and chunk management
