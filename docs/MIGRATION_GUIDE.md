# Migration Guide: Notion to SQLite

This guide walks you through migrating your learning data from Notion to the new SQLite-based system.

## Overview

The migration process involves:
1. Exporting data from Notion
2. Formatting the export for the migration script
3. Running the migration
4. Verifying the results

## Prerequisites

- Existing Notion workspace with learning data
- Second Memory Learning application installed
- Access to Notion's export functionality

## Step 1: Export from Notion

### Option A: Full Workspace Export

1. Go to your Notion workspace settings
2. Navigate to "Settings & Members" → "Export"
3. Select "Export all content"
4. Choose "Markdown & CSV" or "HTML" format
5. Download the export file

### Option B: Database Export (Recommended)

1. Open each Notion database you want to migrate
2. Use the "..." menu → "Export"
3. Choose "CSV" format for structured data
4. Repeat for all relevant databases

## Step 2: Prepare Export Data

Create a file named `mock-notion-export.json` in your project root with the following structure:

```json
{
  "learning_topics": [
    {
      "id": "unique-topic-id",
      "title": "Topic Title",
      "subject": "Subject Area",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "learning_chunks": [
    {
      "id": "unique-chunk-id",
      "topicId": "topic-id-reference",
      "title": "Chunk Title",
      "content": "Full content text here...",
      "chunkType": "new",
      "difficulty": 5,
      "estimatedDuration": 15,
      "prerequisites": ["prereq1", "prereq2"],
      "tags": ["tag1", "tag2"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "review_schedule": [
    {
      "id": "unique-review-id",
      "chunkId": "chunk-id-reference",
      "nextReviewAt": "2024-01-01T00:00:00.000Z",
      "easeFactor": 2.5,
      "repetitions": 0,
      "intervalDays": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "session_logs": [
    {
      "id": "unique-session-id",
      "date": "2024-01-01T00:00:00.000Z",
      "duration": 30,
      "itemsCompleted": 5,
      "averageQuality": 4.2,
      "cognitiveLoad": 7.5,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "performance_analytics": [
    {
      "id": "unique-analytics-id",
      "date": "2024-01-01T00:00:00.000Z",
      "topic": "Topic Name",
      "metricsJson": {"key": "value"},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Data Mapping Guidelines

#### Learning Topics
- **id**: Unique identifier (string)
- **title**: Topic name
- **subject**: Subject area (e.g., "CS", "Math", "Language")
- **createdAt/updatedAt**: ISO timestamp strings

#### Learning Chunks
- **id**: Unique identifier (string)
- **topicId**: Reference to learning topic ID
- **title**: Chunk title
- **content**: Full content text
- **chunkType**: "new", "review", or "remediation"
- **difficulty**: Integer 1-10
- **estimatedDuration**: Minutes (integer)
- **prerequisites**: Array of prerequisite IDs
- **tags**: Array of tag strings

#### Review Schedule
- **id**: Unique identifier (string)
- **chunkId**: Reference to learning chunk ID
- **nextReviewAt**: Next review date (ISO timestamp)
- **easeFactor**: Spaced repetition ease factor (decimal)
- **repetitions**: Number of successful reviews (integer)
- **intervalDays**: Days until next review (integer)

#### Session Logs
- **id**: Unique identifier (string)
- **date**: Session date (ISO timestamp)
- **duration**: Session duration in minutes
- **itemsCompleted**: Number of items completed
- **averageQuality**: Average quality score (decimal)
- **cognitiveLoad**: Cognitive load rating (decimal)

#### Performance Analytics
- **id**: Unique identifier (string)
- **date**: Analytics date (ISO timestamp)
- **topic**: Topic name (optional)
- **metricsJson**: JSON object with metrics data

## Step 3: Run Migration

```bash
# Navigate to project directory
cd second-memory

# Run the migration script
pnpm run db:migrate
```

### Expected Output

```
Running Drizzle migrations...
Drizzle migrations complete.
Fetching data from Notion (mock)...
Notion data fetched.
Importing learning topics...
Imported 5 topics.
Importing learning chunks...
Imported 23 chunks.
Importing review schedule...
Imported 18 reviews.
Importing session logs...
Imported 12 session logs.
Importing performance analytics...
Imported 8 performance analytics.
Migration complete!
```

## Step 4: Verify Migration

### Option A: Database Studio

```bash
# Open Drizzle Studio
pnpm run db:studio
```

This opens a web interface where you can:
- Browse all tables
- View imported data
- Run queries
- Verify data integrity

### Option B: Test MCP Tools

```bash
# Start the MCP server
pnpm start

# Test the new SQLite tool
# (Use your MCP client to call list_learning_items_sqlite)
```

### Option C: Direct Database Query

```bash
# Install sqlite3 CLI tool
npm install -g sqlite3

# Query the database
sqlite3 second-memory.db "SELECT COUNT(*) FROM learning_topics;"
sqlite3 second-memory.db "SELECT COUNT(*) FROM learning_chunks;"
sqlite3 second-memory.db "SELECT COUNT(*) FROM review_schedule;"
```

## Troubleshooting

### Common Issues

#### "Could not locate the bindings file"
This error occurs when `better-sqlite3` native bindings aren't built:

```bash
# Install build tools and rebuild
pnpm rebuild better-sqlite3
```

#### "Foreign key constraint failed"
Ensure all foreign key references are valid:
- `topicId` in chunks must exist in topics
- `chunkId` in reviews must exist in chunks

#### "Invalid timestamp format"
Ensure all timestamps are in ISO format:
- ✅ `"2024-01-01T00:00:00.000Z"`
- ❌ `"2024-01-01"` or `"January 1, 2024"`

#### "JSON parse error"
Check that JSON fields are properly formatted:
- Arrays: `["item1", "item2"]`
- Objects: `{"key": "value"}`

### Data Validation

After migration, verify:

1. **Record counts match**: Compare exported vs imported counts
2. **Foreign keys are valid**: All references exist
3. **Timestamps are preserved**: Dates match original data
4. **JSON fields are intact**: Arrays and objects are properly stored

### Rollback Plan

If migration fails:

1. **Delete the database file**: `rm second-memory.db`
2. **Fix the JSON export**: Correct any formatting issues
3. **Re-run migration**: `pnpm run db:migrate`

## Post-Migration

### Clean Up

1. **Remove export file**: `rm mock-notion-export.json`
2. **Update environment**: Set `SM_DB_PATH` if needed
3. **Test functionality**: Verify all MCP tools work correctly

### Backup Strategy

```bash
# Create regular backups
cp second-memory.db "backup-$(date +%Y%m%d).db"

# Or use SQLite's backup command
sqlite3 second-memory.db ".backup backup-$(date +%Y%m%d).db"
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your JSON export format
3. Ensure all dependencies are installed
4. Check the application logs for detailed error messages

For additional help, refer to the main README.md or create an issue in the project repository.
