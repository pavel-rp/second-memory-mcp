/** Extract a human-readable message from an unknown thrown value. */
export function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error occurred';
}
