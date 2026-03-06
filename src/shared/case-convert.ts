// ---------------------------------------------------------------------------
// Bidirectional key converters for MCP tool boundary
// ---------------------------------------------------------------------------

// -- Type-level utilities ---------------------------------------------------

/** Convert a snake_case string to camelCase at the type level. */
type SnakeToCamel<S extends string> = S extends `${infer P}_${infer R}`
  ? `${P}${Capitalize<SnakeToCamel<R>>}`
  : S;

/** Recursively convert all keys of T from snake_case to camelCase. */
export type CamelCaseKeys<T> = T extends readonly (infer U)[]
  ? CamelCaseKeys<U>[]
  : T extends Record<string, unknown>
    ? { [K in keyof T as K extends string ? SnakeToCamel<K> : K]: CamelCaseKeys<T[K]> }
    : T;

// -- Runtime: snake_case → camelCase ----------------------------------------

/** Convert a snake_case string to camelCase. */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Internal implementation with optional rawKeys. */
function toCamelCaseKeysImpl<T>(value: T, rawKeys?: Set<string>): CamelCaseKeys<T> {
  if (value === null || value === undefined) return value as CamelCaseKeys<T>;
  if (typeof value !== 'object') return value as CamelCaseKeys<T>;
  if (Array.isArray(value))
    return value.map(v => toCamelCaseKeysImpl(v, rawKeys)) as CamelCaseKeys<T>;
  if (Object.getPrototypeOf(value) !== Object.prototype) return value as CamelCaseKeys<T>;

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    result[snakeToCamel(key)] = rawKeys?.has(key) ? val : toCamelCaseKeysImpl(val, rawKeys);
  }
  return result as CamelCaseKeys<T>;
}

/**
 * Recursively convert all keys of an object from snake_case to camelCase.
 * Designed for use as a Zod `.transform()` callback.
 */
export function toCamelCaseKeys<T>(value: T): CamelCaseKeys<T> {
  return toCamelCaseKeysImpl(value);
}

/**
 * Returns a Zod `.transform()` callback that converts keys from snake_case
 * to camelCase but skips recursion into values of the specified keys.
 * Use for `z.record()` fields where keys are user data, not schema field names.
 */
export function toCamelCaseKeysExcept(rawKeys: Set<string>) {
  return <T>(value: T): CamelCaseKeys<T> => toCamelCaseKeysImpl(value, rawKeys);
}

// -- Runtime: camelCase → snake_case ----------------------------------------

/** Convert a camelCase string to snake_case. */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (ch, i: number) => (i > 0 ? '_' : '') + ch.toLowerCase());
}

/**
 * Recursively convert all keys of an object from camelCase to snake_case.
 * Used for MCP tool output serialization.
 *
 * @param rawKeys - Original (camelCase) key names whose values should NOT be
 *   recursed into. Use for `z.record()` fields where keys are user data.
 */
export function toSnakeCase<T>(value: T, rawKeys?: Set<string>): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(item => toSnakeCase(item, rawKeys));
  if (Object.getPrototypeOf(value) !== Object.prototype) return value;

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    result[camelToSnake(key)] = rawKeys?.has(key) ? val : toSnakeCase(val, rawKeys);
  }
  return result;
}
