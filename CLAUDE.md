# Agents Guide

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Second Memory Learning is an MCP (Model Context Protocol) server that implements an AI-powered spaced repetition learning system. It integrates with Claude Desktop to provide sophisticated tutoring capabilities using evidence-based learning science principles.

### Core Architecture

**MCP Server Stack:**

- TypeScript ES modules with Node.js 20+
- MCP SDK for Claude Desktop integration
- Zod for schema validation and type safety
- Vitest for testing with coverage
- Spaced repetition algorithms (enhanced SM-2)

**Key Components:**

- `src/server/main.ts` - MCP server bootstrap and prompt registration
- `src/server/tools.ts` - Tool handlers for spaced repetition calculations
- `src/algorithms/sr-calculator.ts` - Core spaced repetition algorithm implementations
- `src/config/algorithm.ts` - Configurable algorithm parameters
- `src/prompts/prompt-pack.ts` - Learning guidance prompts

**Learning System Design:**

- **Scaffolding**: Complex problems broken into a reasonable amount of digestible chunks
- **Spaced Repetition**: Advanced SM-2 with priority scheduling and leech handling
- **Cognitive Load Theory**: Chunking optimized for working memory limits
- **Evidence-Based**: Two-attempt policy, interleaving, retrieval practice

## Development Commands

```bash
# Build TypeScript to dist/
pnpm run build

# Development mode with watch
pnpm run dev

# Run server (after build)
pnpm run start

# Run server with build
pnpm run start:pnpm

# Run server for MCP stdio
pnpm run start:stdio

# Run tests with coverage
pnpm test

# Test prompts specifically
pnpm run test:prompts

# Formatting and linting
pnpm run format          # Format all files
pnpm run format:check    # Check formatting without fixing
pnpm run lint            # Run ESLint
pnpm run lint:fix        # Fix ESLint issues automatically
pnpm run type-check      # TypeScript type checking
```

## MCP Integration

**Client Configuration (.cursor/mcp.json):**

```json
{
  "mcpServers": {
    "second-memory-learning": {
      "command": "pnpm",
      "args": [
        "--silent",
        "--reporter",
        "silent",
        "--dir",
        "B:\\Projects\\second-memory\\",
        "run",
        "--silent",
        "start:stdio"
      ],
      "timeout": 51
    }
  }
}
```

**Exposed Capabilities:**

- **Tools**: Spaced repetition calculators, priority scoring, prompt generators, orchestration guidance
- **Prompts**: Scaffolding, learning, retrieval, review, workflow guidance

## SQLite Integration

**Learning Recommendations Workflow:**
The `what_to_learn_today` tool supports `fetchFromDatabase: true` to automatically query the local SQLite database — this is the canonical single-call approach.

**SQLite Tools:**

- `list_learning_items`: Fetches learning items from local SQLite database (storage-agnostic)
- `what_to_learn_today`: Use with `fetchFromDatabase: true` for automatic database retrieval

## Code Architecture Patterns

**Algorithm Configuration:**

- Environment-based configuration in `src/config/algorithm.ts`
- All parameters configurable via environment variables (prefixed `SM_`)
- Type-safe configuration with runtime validation
- Sensible defaults based on learning science research

**Tool Registration Pattern:**

```typescript
server.registerTool(
  'tool_name',
  {
    title: 'Display Name',
    description: 'What this tool does',
    inputSchema: zodSchema,
  },
  async args => {
    // Tool implementation
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
);
```

**Spaced Repetition Flow:**

1. `calculateNextReview()` - Basic SM-2 implementation
2. `calculateNextReviewAdvanced()` - Handles lapses and leech detection
3. `calculatePriorityScore()` - Multi-factor priority calculation
4. `rankCandidatesWithConstraints()` - Daily caps and tag weighting

**Prompt Engineering:**

- Evidence-based learning prompts in `src/prompts/prompt-pack.ts`
- Context-aware scaffolding for cognitive load management
- Retrieval practice with two-attempt policy
- Spaced review optimization for long-term retention

## Environment Configuration

Key environment variables for algorithm tuning:

- `SM_MIN_EASE_FACTOR` (default: 1.3) - Minimum ease factor floor
- `SM_INITIAL_INTERVAL_DAYS` (default: 1) - First review interval
- `SM_SECOND_INTERVAL_DAYS` (default: 6) - Second review interval
- `SM_EASE_DELTA_GOOD` (default: 0.1) - Ease increase for quality ≥4
- `SM_EASE_PENALTY_FAILURE` (default: -0.2) - Ease penalty for failures
- `SM_LEECH_CONSEC_FAILS` (default: 3) - Consecutive failures for leech status
- `SM_DAILY_CAP_REVIEWS` (default: 200) - Max reviews per day

## Testing Strategy

**Test Structure:**

- Unit tests for algorithm functions (`tests/tools/sr-calculator.test.ts`)
- Configuration tests (`tests/config/algorithm.test.ts`)
- Integration tests for tool registration
- Prompt validation tests

**Coverage Requirements:**

- Algorithm functions must have comprehensive test coverage
- Edge cases for invalid inputs, boundary conditions
- Config-driven test scenarios for algorithm parameters

## SQLite Database Schema

**Database Tables:**

- Learning Topics: Problem definitions and metadata
- Learning Chunks: Scaffolded learning segments with SM-2 scheduling data (single source of truth for review state)
- Learning Sessions: Session lifecycle tracking
- Session Chunks: Per-chunk progress within sessions

**Local-First Design:**

- Complete data ownership and privacy through local storage
- Fast, reliable operation without external dependencies
- SQLite integration via Drizzle ORM for type safety

## Code Formatting & Style Enforcement

**CRITICAL: All code must follow the exact formatting style of `conversation-manager.ts`**

### Automatic Formatting Tools

- **Prettier**: Enforces consistent code formatting
- **ESLint**: Integrates with Prettier for style enforcement
- **Pre-commit hooks**: Automatically format code before commits
- **CI/CD**: Formatting checks in GitHub Actions

### Formatting Rules (Based on conversation-manager.ts)

```typescript
// ✅ CORRECT formatting examples:

// 2-space indentation, single quotes, trailing commas
const response: ConversationResponse = {
  message: 'Perfect! I have a learning plan ready for you.',
  needsInput: false,
  suggestedInputs: [
    "Let's start",
    'Tell me more about this session',
    'Adjust the plan',
  ],
  sessionUpdated: true,
};

// Line breaks before operators
const message =
  `Perfect! ${guidance.nextAction}\n\n${
    guidance.encouragement || ''
  }\n\n${guidance.progressUpdate || ''}`.trim();

// Multi-line function parameters
private async handleTopicCreation(
  request: ConversationRequest,
  details: { topicTitle: string; originalInput: string }
): Promise<ConversationResponse> {
  // Implementation
}

// JSDoc comments with proper formatting
/**
 * Conduct a learning session conversation
 */
async conductLearningSession(
  request: ConversationRequest
): Promise<ConversationResponse> {
  // Implementation
}
```

### Formatting Commands

```bash
# Format all files to match conversation-manager.ts style
pnpm run format

# Check if files are properly formatted
pnpm run format:check

# Fix ESLint issues (includes formatting)
pnpm run lint:fix
```

### Pre-commit Enforcement

- **Automatic**: All staged files are formatted before commit
- **Required**: Commits will fail if formatting is incorrect
- **Zero-friction**: Developers don't need to remember to format

### Commit messages

- **Concise**: Commit messages must follow Pareto principle: most significant changes in most concise form.
- **What, not how**: Write what was implemented, not how. Implementation details don't belong in commit messages.
- **Signature**: Never add a signature that advertises you like 'Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>' or similar.

### Pull requests

- Never add promotional taglines like 'Generated with Claude Code' or similar advertising to PR descriptions.

### IDE Integration

- **VS Code**: Install Prettier extension for real-time formatting
- **Cursor**: Format on save enabled by default
- **EditorConfig**: Cross-editor consistency via `.editorconfig`

## Development Guidelines

**Naming Conventions:**

- **Spaced-repetition MCP tools** (`src/types/spaced-repetition-tools.ts`): snake_case — `ease_factor`, `next_review_date`, `days_overdue`, `consecutive_failures`. Other tool schemas (content, persistence, search) use camelCase; follow the existing style of each schema.
- **Internal types and logic** (`src/types/sr.ts`, `src/algorithms/`): camelCase — `easeFactor`, `nextReviewDate`, `daysOverdue`, `consecutiveFailures`
- **Conversion** happens in spaced-repetition tool registration (`src/server/spaced-repetition-tools.ts`), mapping snake_case inputs to camelCase and camelCase outputs back to snake_case. Tools whose schemas already use camelCase pass values through without renaming.

**Code Style:**

- Descriptive function/variable names
- Explicit types for public APIs
- Prefer early returns and minimal nesting
- No `any` types - use precise TypeScript types
- DRY. Don't inline type definitions, schemas, etc. Move them to separate locations if they must be reused.
- **MANDATORY**: Follow exact formatting style of `conversation-manager.ts`

**Algorithm Development:**

- All spaced repetition parameters must be configurable
- Algorithm changes require corresponding test updates
- Maintain backward compatibility for existing data
- Document algorithm choices with research citations

**MCP Best Practices:**

- Tools return JSON strings for cross-client compatibility
- Prompts have both MCP prompt registration and tool fallbacks
- Schema validation on all inputs
- Descriptive error messages for invalid inputs

**Error Handling Strategy:**

The codebase uses a layered error handling approach:

- **Algorithm layer** (`src/algorithms/`): Public APIs are pure functions with defensive clamping and never throw — they return computed values or Result objects with safe defaults for edge cases. Internal implementation may throw for control flow, but these exceptions are caught and converted before returning from the public API.
- **Service layer** (`src/services/`): Mixed patterns exist historically. Services that perform multi-step operations with partial failure modes (e.g., `topicCreationService`, `deleteChunk`) return `{ success: boolean, error?: { type, message } }` Result objects. Services that perform single atomic operations (e.g., `createSession`, `createChunkWithTopic`) throw on failure. **Convention for new code:** prefer Result objects for operations that can fail in expected ways; use throw only for truly unexpected errors.
- **Tool layer** (`src/server/*-tools.ts`): All handlers wrap service and domain-logic calls in try/catch. Use `toolOk()`/`toolJson()` for success responses. Service Result failures map to `toolJson()` with `success: false` and structured error details; caught exceptions (including those thrown from `src/tools/` helpers) map to `toolError()`.

**Fail-open philosophy:** The MCP server logs errors via `src/utils/logger.ts` (stderr) and returns structured error responses to clients rather than crashing. Tool handlers always return a valid MCP response, never propagate unhandled exceptions.

**File Organization:**

- Algorithm implementations in `src/algorithms/` (`sr-calculator`, `dependency-resolver`, `prerequisite-reference-validator`)
- Domain logic in `src/tools/` (recommendation engine, session manager, analytics — no MCP dependencies)
- Configuration in `src/config/`
- Constants in `src/constants/`
- MCP tool handlers and registration in `src/server/`
- Type definitions in `src/types/`
- Tests mirror source structure in `tests/`

**Workflow Specifications**

- Follow the spec-workflow defined in the corresponding MCP server when explicitly asked
- Before starting work in the spec-workflow paradigm, checkout a feature branch if we're on develop, and don't have uncommitted or unsynced with remote changes.
- If there are uncommitted or unsynced with remote changes, ask how to act.
- Always run all builds, lints and tests before claiming a task is completed.
