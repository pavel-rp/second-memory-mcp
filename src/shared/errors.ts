/** Extract a human-readable message from an unknown thrown value. */
export function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error occurred';
}

/** Check whether an unknown thrown value is a Postgres unique-constraint violation on a specific constraint name. */
export function isPgUniqueViolation(err: unknown, constraint: string): boolean {
  return (
    err instanceof Error &&
    'code' in err &&
    (err as { code: string }).code === '23505' &&
    'constraint' in err &&
    (err as { constraint: string }).constraint === constraint
  );
}
