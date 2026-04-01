/**
 * Convert an epoch-millisecond timestamp to a full ISO 8601 string.
 * Example: 1743465600000 → "2025-04-01T00:00:00.000Z"
 */
export function toIsoTimestamp(epochMs: number): string {
  return new Date(epochMs).toISOString();
}
