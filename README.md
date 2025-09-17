# Second Memory Learning

A Model Context Protocol (MCP) server for spaced repetition learning with SQLite persistence.

## Features

- **Spaced Repetition Algorithm**: SM-2 style scheduling with advanced features
- **Learning Analytics**: Performance tracking and cognitive load management
- **Session Management**: Structured learning sessions with progress tracking
- **SQLite Persistence**: Fast, reliable local database storage
- **MCP Integration**: Exposes prompts, tools, and resources via MCP protocol

## Quick Start

### Prerequisites

- Node.js 20 or higher
- pnpm package manager

### Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd second-memory
pnpm install

# Build the project
pnpm run build

# Start the MCP server
pnpm start
```

### Database Setup

The application uses SQLite for data persistence. The database file is created automatically on first run.

**Environment Variables:**
- `SM_DB_PATH`: Path to SQLite database file (default: `./second-memory.db`)

**Database Scripts:**
```bash
# Run database migrations
pnpm run db:migrate

# Open Drizzle Studio (database GUI)
pnpm run db:studio
```

## Migration from Notion

If you have existing data in Notion, you can migrate it to SQLite:

### Step 1: Export Notion Data

1. Export your Notion workspace as JSON
2. Place the exported file at `mock-notion-export.json` in the project root
3. Ensure the JSON structure matches the expected format:

```json
{
  "learning_topics": [
    {
      "id": "topic-id",
      "title": "Topic Title",
      "subject": "Subject",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "learning_chunks": [
    {
      "id": "chunk-id",
      "topicId": "topic-id",
      "title": "Chunk Title",
      "content": "Chunk content...",
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
      "id": "review-id",
      "chunkId": "chunk-id",
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
      "id": "session-id",
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
      "id": "analytics-id",
      "date": "2024-01-01T00:00:00.000Z",
      "topic": "Topic Name",
      "metricsJson": {"key": "value"},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Step 2: Run Migration

```bash
# Run the migration script
pnpm run db:migrate
```

The migration script will:
- Create the SQLite database schema
- Import all data from the JSON export
- Report the number of records imported per table
- Validate data integrity

### Step 3: Verify Migration

```bash
# Open Drizzle Studio to inspect the data
pnpm run db:studio
```

## MCP Tools

The server exposes several MCP tools for learning management:

### Learning Items
- `list_learning_items_sqlite`: Fetch learning items from SQLite database
  - Parameters: `subject` (optional), `chunkType` (optional)

### Spaced Repetition
- `calculate_next_review`: Calculate next review date using SM-2 algorithm
- `calculate_next_review_advanced`: Advanced scheduling with lapse handling
- `calculate_priority_score`: Rank items by review priority

### Analytics
- `analytics_daily`: Compute daily learning metrics
- `analytics_window`: Analyze performance over date ranges

### Session Management
- `session_progress`: Track session completion metrics
- `session_workflow`: Get guidance for next learning phase
- `session_completion`: Determine if session should end

## Development

### Project Structure

```
src/
├── db/                 # Database layer
│   ├── client.ts      # SQLite connection
│   ├── schema.ts      # Drizzle schema definitions
│   ├── operations.ts  # Database helpers
│   └── migrate.ts     # Migration script
├── services/          # Business logic services
│   ├── topics.ts      # Topic CRUD operations
│   ├── chunks.ts      # Learning chunk operations
│   └── reviews.ts     # Review schedule operations
├── server/            # MCP server implementation
├── tools/             # Learning algorithm tools
├── prompts/           # MCP prompts
└── types/             # TypeScript type definitions
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage
```

**Note**: SQLite tests may be skipped on systems without native build tools for `better-sqlite3`. To run all tests:

1. Install Visual Studio Build Tools (Windows) or Xcode Command Line Tools (macOS)
2. Install Python 3.x
3. Rebuild: `pnpm rebuild better-sqlite3`

### Building

```bash
# Build TypeScript to JavaScript
pnpm run build

# Watch mode for development
pnpm run dev
```

## Architecture

### Database Schema

The SQLite database contains five main tables:

- **learning_topics**: Subject areas and topics
- **learning_chunks**: Individual learning items with content
- **review_schedule**: Spaced repetition scheduling data
- **session_logs**: Learning session history
- **performance_analytics**: Performance metrics and analytics

### Service Layer

The application uses a service layer pattern:
- **Topics Service**: Manages learning topics and subjects
- **Chunks Service**: Handles learning items and content
- **Reviews Service**: Manages spaced repetition schedules

### MCP Integration

The server implements the Model Context Protocol to expose:
- **Prompts**: Learning guidance and instructions
- **Tools**: Pure calculation functions for algorithms
- **Resources**: Read-only data access

## Troubleshooting

### Database Issues

**Database file not found:**
- Ensure the `SM_DB_PATH` environment variable points to a valid location
- Check file permissions for the database directory

**Migration fails:**
- Verify the JSON export format matches the expected structure
- Check that all required fields are present
- Ensure timestamps are in ISO format

### Build Issues

**Native module compilation fails:**
- Install build tools for your platform
- Run `pnpm rebuild better-sqlite3`
- Consider using a pre-built binary if available

**TypeScript errors:**
- Run `pnpm run build` to check for type issues
- Ensure all dependencies are properly installed

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure all tests pass before submitting

## License

[Add your license information here]
