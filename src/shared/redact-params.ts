const SENSITIVE_PATTERN = /^(token|authorization|secret|password|api_key|apikey)$/i;

/**
 * Recursively redact sensitive fields from an object before DB insertion.
 * Keys matching the denylist pattern are replaced with "[REDACTED]".
 */
export function redactParams(value: unknown): unknown {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(redactParams);
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = SENSITIVE_PATTERN.test(key) ? '[REDACTED]' : redactParams(val);
    }
    return result;
  }
  return value;
}
