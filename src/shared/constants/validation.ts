// Validation constants for MCP write endpoints
export const VALIDATION_CONSTANTS = {
  MAX_TITLE_LENGTH: 200,
  MAX_SUBJECT_LENGTH: 100,
  LEECH_THRESHOLD: 3,
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 10,
  MIN_QUALITY_SCORE: 0,
  MAX_QUALITY_SCORE: 5,
  DEFAULT_ESTIMATED_DURATION: 15,
  // Content validation limits
  MAX_CONTENT_SIZE: 8000, // ~2000 tokens — aligned with embedding chunk best practices
  MAX_SUMMARY_SIZE: 5000, // 5KB for topic summaries
  MIN_CONTENT_LENGTH: 1, // Minimum content length if provided
} as const;
