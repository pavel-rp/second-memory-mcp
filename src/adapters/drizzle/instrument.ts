import { timedQuery } from './timed-query.js';

/**
 * Wrap a Drizzle adapter so every async method call is routed through
 * {@link timedQuery} — persisting `slow_query` / `query_failed` diagnostics to
 * `operation_event_log` — without modifying the adapter implementations.
 *
 * Each method is labelled `${name}.${method}` (e.g. `chunkRepository.getById`).
 * The returned value is a transparent `Proxy<T>`, so callers keep the original
 * port type and behavior; only the timing/telemetry wrapper is added.
 *
 * Internal `this.x()` calls inside a method dispatch on the underlying target,
 * not the proxy, so delegating methods do not double-emit events.
 *
 * Wrapping is fail-open by virtue of `timedQuery`: a broken event logger never
 * changes a method's result or thrown error.
 */
export function instrument<T extends object>(name: string, target: T): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value: unknown = Reflect.get(obj, prop, receiver);
      // Only wrap own/prototype methods; pass through everything else
      // (non-functions, symbol-keyed props, and the constructor).
      if (typeof value !== 'function' || typeof prop !== 'string' || prop === 'constructor') {
        return value;
      }
      const method = value as (...args: unknown[]) => unknown;
      return (...args: unknown[]): Promise<unknown> =>
        timedQuery(`${name}.${prop}`, async () => method.apply(obj, args));
    },
  });
}
