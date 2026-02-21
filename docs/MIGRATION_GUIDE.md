# Data Migration & Seeding Guide

The `pnpm run db:migrate` script creates (or upgrades) the SQLite schema and optionally imports seed data from a JSON file. Use this guide when you need to:

- Bootstrap a fresh database with existing topics, chunks, schedules, or session history.
- Move data between environments (for example, from a laptop to a desktop machine).
- Restore a backup generated from the same schema.

## Overview of the Migration Script

`src/db/migrate.ts` performs three tasks:

1. Ensures every required table and index exists.
2. Applies lightweight column migrations for content persistence and removes deprecated tables.
3. If an import file is supplied, bulk inserts data into the current schema.

You can point the script at a JSON file in two ways:

- Set the `MIGRATE_SOURCE` environment variable.
- Pass the file path as the first CLI argument (`pnpm run db:migrate -- ./my-export.json`).

If neither is provided the script looks for `./learning-import.json` in the project root.

## JSON Structure

The import format mirrors the Drizzle models defined in `src/db/schema.ts`. Each top-level array is optional—include only the collections you need to seed.

```json
{
  "learning_topics": [
    {
      "id": "uuid",
      "title": "Topic title",
      "subject": "Math",
      "summary": "Optional learner-facing summary",
      "summaryVersion": 1,
      "summaryUpdatedAt": 1737072000000,
      "createdAt": 1736985600000,
      "updatedAt": 1737072000000
    }
  ],
  "learning_chunks": [
    {
      "id": "uuid",
      "topicId": "uuid",
      "title": "Chunk title",
      "subject": "Math",
      "difficulty": 5,
      "nextReviewAt": 1737158400000,
      "easeFactor": 2.5,
      "repetitions": 0,
      "lastReviewedAt": null,
      "estimatedDuration": 15,
      "chunkType": "new",
      "prerequisites": ["chunk-prereq-id"],
      "tags": ["algebra"],
      "content": "Optional stored content",
      "contentVersion": 1,
      "contentUpdatedAt": 1737072000000,
      "createdAt": 1736985600000,
      "updatedAt": 1737072000000
    }
  ],
  "review_schedule": [
    {
      "id": "uuid",
      "chunkId": "uuid",
      "nextReviewAt": 1737244800000,
      "intervalDays": 3,
      "repetitions": 1,
      "easeFactor": 2.36,
      "createdAt": 1736985600000,
      "updatedAt": 1737072000000
    }
  ],
  "learning_sessions": [
    {
      "id": "uuid",
      "topicId": "uuid",
      "chunkIds": "[\"chunk-1\",\"chunk-2\"]",
      "mode": "learning",
      "estimatedDuration": 40,
      "status": "completed",
      "startTime": 1737072000000,
      "endTime": 1737074400000,
      "feedback": "Focused review session",
      "createdAt": 1737072000000,
      "updatedAt": 1737074400000
    }
  ],
  "session_chunks": [
    {
      "id": "uuid",
      "sessionId": "uuid",
      "chunkId": "uuid",
      "status": "completed",
      "attempts_json": "[]",
      "quality_scores_json": "[4,5]",
      "time_spent_ms": 540000,
      "createdAt": 1737072000000,
      "updatedAt": 1737074400000
    }
  ]
}
```

### Notes on Field Names

- For `learning_chunks` you may provide `prerequisites` and `tags` as arrays; the migrator automatically encodes them for storage.
- Fields with `_json` suffix (`attempts_json`, `quality_scores_json`) should be valid JSON strings representing arrays.
- Timestamps are stored as epoch milliseconds.

## Running the Import

```bash
# Using an environment variable
MIGRATE_SOURCE=./backups/2025-01-05-learning.json pnpm run db:migrate

# Passing the file as an argument
pnpm run db:migrate -- ./backups/2025-01-05-learning.json
```

The script logs a JSON summary indicating how many records were inserted per collection. Existing records with conflicting primary keys will cause the migration to fail, so ensure you start from an empty database when importing full backups.

## Verification Checklist

1. **Inspect counts** – Use `pnpm run db:studio` or the SQLite CLI to verify row counts across tables.
2. **Exercise core tools** – Invoke `list_learning_items` or `what_to_learn_today({ fetchFromDatabase: true })` to confirm items are visible through the MCP layer.
3. **Validate sessions** – Run `session_progress` for a migrated session to confirm attempts and quality scores round-trip correctly.

## Troubleshooting

| Symptom                                                  | Resolution                                                                                                                       |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `Database error: UNIQUE constraint failed`               | Remove existing rows or use a fresh database file before re-importing.                                                           |
| `Database error: JSON parse error`                       | Confirm any `_json` field contains a valid JSON string (e.g., `"[]"`).                                                           |
| `Database error: foreign key constraint failed`          | Ensure referenced IDs exist (chunks must reference an existing topic, session chunks must reference both a session and a chunk). |
| Script exits with `Content persistence migration failed` | Another process may be holding the database open. Shut down the MCP server and retry.                                            |

## Backups

To capture a portable snapshot of your learning data:

```bash
sqlite3 second-memory.db ".backup backups/$(date +%Y-%m-%d)-second-memory.db"
```

Store the resulting file with your version control or cloud backups and restore it by copying it back to the path referenced by `SM_DB_PATH`.
