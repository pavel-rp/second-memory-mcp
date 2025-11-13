# Search Learning Content

This MCP tool searches existing learning topics and chunks by title to help users discover content and avoid creating duplicates.

## Tool Names

- `search_learning_content`: Search across all learning topics and chunks

## Inputs: `search_learning_content`

- `query` (required, string): Keywords to search for across learning topics and chunk titles
  - Minimum: 2 characters
  - Maximum: 120 characters
  - Normalized to lowercase and tokenized for matching
- `subject` (optional, string): Filter results by subject
  - Minimum: 1 character (after trimming whitespace)
  - Maximum: 32 characters
  - Examples: `CS`, `Math`, `SWE`, `Language`
- `limit` (optional, number): Maximum number of results to return
  - Minimum: 1
  - Maximum: 50
  - Default: 10

## Output: `search_learning_content`

Returns a `SearchResultSet` object containing:

- `query` (string): Original search query
- `normalizedQuery` (string): Lowercase normalized query used for matching
- `tokens` (string[]): Individual search tokens extracted from the query
- `limit` (number): Maximum results returned
- `filters` (object): Applied filters
  - `subject` (string, optional): Subject filter if specified
- `counts` (object): Result counts by type
  - `topics` (number): Number of matching topics in results
  - `chunks` (number): Number of matching chunks in results
  - `total` (number): Total number of results returned
- `results` (array): Ordered list of matching items (see below)

### Result Items

Each item in the `results` array contains:

- `resultType` (string): Either `topic` or `chunk`
- `id` (string): Unique identifier
- `title` (string): Item title
- `subject` (string): Subject category
- `matchScore` (number): Relevance score (0.0 to 1.0, higher is better)
- `highlightTerms` (string[]): Search tokens found in the title
- `createdAt` (number): Unix timestamp of creation
- `updatedAt` (number): Unix timestamp of last update
- `topicId` (string, chunks only): Parent topic ID
- `topicTitle` (string, chunks only): Parent topic title

## Match Scoring Algorithm

The search uses a multi-factor relevance scoring algorithm:

1. **String Similarity (60% weight)**: Levenshtein distance ratio between the candidate title and normalized query
2. **Token Match (30% weight)**: Fraction of search tokens found in the candidate title
3. **Prefix Bonus (10%)**: Added if any token matches at the start of the title
4. **Exact Match Bonus (20%)**: Added for exact query matches after normalization

Search tokens use **OR logic** - items matching ANY search term are included in results. For example, searching for "react hooks" returns items containing "react" OR "hooks" in their title.

Results are ranked by match score (highest first), with ties broken by:

1. Alphabetical title order
2. Topics before chunks

## Behavior

- Fetches up to 3x the requested limit from the database to allow accurate relevance scoring before slicing to the final limit
- Normalizes queries by converting to lowercase and extracting alphanumeric tokens
- Searches both topics and chunks simultaneously
- Combines subject filter with token matching using AND logic (must match subject AND at least one token)
- Returns empty results if no matches are found

## Usage Examples

### Basic Search

```json
{
  "query": "react hooks"
}
```

Returns up to 10 results matching "react" OR "hooks" in the title.

### Subject-Filtered Search

```json
{
  "query": "algorithms",
  "subject": "CS",
  "limit": 20
}
```

Returns up to 20 results in the "CS" subject matching "algorithms".

### Exact Match Search

```json
{
  "query": "Big-O Notation"
}
```

Items with exact title matches receive higher scores due to the exact match bonus.

## Integration with Conversation Manager

The search tool is integrated into the conversation manager workflow to prevent duplicate content creation. Before generating new learning chunks, the system should:

1. Use this tool to search for existing content matching the topic or concept
2. Present existing matches to the user
3. Allow the user to decide whether to:
   - Use existing content
   - Create new content despite matches
   - Refine their request to avoid duplication

## Performance Considerations

- The tool fetches 3x the requested limit to ensure accurate ranking after scoring
- With the maximum limit of 50, this processes up to 300 database rows (150 topics + 150 chunks)
- Suitable for small-to-medium datasets; may require optimization for large libraries
- Consider pagination or early termination strategies for very large content collections

## Notes

- Input validation uses Zod schemas defined in `src/types/search-tools.ts`
- The search is case-insensitive and tokenizes queries automatically
- Whitespace is automatically trimmed from query and subject inputs during validation
- Match scores are rounded to 4 decimal places for consistent comparison
