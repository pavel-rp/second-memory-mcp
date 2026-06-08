/** Extract a human-readable message from an unknown thrown value. */
export function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error occurred';
}

/**
 * Check whether an unknown thrown value — or any error in its `cause` chain — is
 * a Postgres unique-constraint violation on a specific constraint name.
 *
 * Drizzle wraps the node-postgres error in a `DrizzleQueryError` and exposes the
 * original driver error (which carries `code`/`constraint`) on `.cause`, so we
 * walk the chain to match both the raw and the wrapped forms.
 */
export function isPgUniqueViolation(err: unknown, constraint: string): boolean {
  for (let current: unknown = err, depth = 0; current instanceof Error && depth < 5; depth++) {
    if (
      'code' in current &&
      (current as { code: unknown }).code === '23505' &&
      'constraint' in current &&
      (current as { constraint: unknown }).constraint === constraint
    ) {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}
