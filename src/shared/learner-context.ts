import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * NEU-1015: learner-key resolution at the transport boundary.
 *
 * Mirrors the `httpCorrelationStorage` precedent in `src/shared/logger.ts`
 * (`withHttpCorrelation`/`getCorrelationId`): an `AsyncLocalStorage` context
 * established once per HTTP request by `jwt-middleware.ts`, read later at the
 * composition-root boundary to resolve (or refuse) the learner key for that
 * request.
 *
 * `rawSub` is the *raw*, independently-read `payload.sub` claim — never
 * `res.locals.auth.sub`, which already folds in the `sub`-or-`azp` fallback
 * and must keep its existing shape/behavior for session-binding purposes.
 */
const learnerAuthStorage = new AsyncLocalStorage<{ rawSub: string | undefined }>();

/**
 * NEU-1015 stdio placeholder learner key. Stdio has no per-request identity —
 * one fixed key is used for every session created or read over stdio, so
 * stdio sessions are mutually invisible to token-transport learners but
 * mutually visible to each other. Stdio is slated for deprecation; this
 * placeholder is not a real per-learner scoping mechanism.
 */
export const STDIO_PLACEHOLDER_LEARNER_KEY = 'stdio-placeholder-learner';

/** Run `fn` within an HTTP-level learner-auth context (established by the JWT middleware). */
export function withLearnerAuthContext<T>(rawSub: string | undefined, fn: () => T): T {
  return learnerAuthStorage.run({ rawSub }, fn);
}

export type ResolvedLearnerAuth =
  | { source: 'http'; rawSub: string }
  | { source: 'http'; rawSub: undefined }
  | { source: 'stdio' };

/**
 * Resolve the learner-auth state for the current call.
 *
 * - `{ source: 'http', rawSub: string }` — a token-transport request with a
 *   verified, non-empty `sub`. Proceed, using `rawSub` as the learner key.
 * - `{ source: 'http', rawSub: undefined }` — a token-transport request whose
 *   verified principal has no `sub` (including an `azp`-only client_credentials
 *   principal). Refuse before any session lookup — this is not a learner key.
 * - `{ source: 'stdio' }` — no learner-auth context at all (stdio never runs
 *   the JWT middleware). Use `STDIO_PLACEHOLDER_LEARNER_KEY`.
 */
export function getResolvedLearnerAuth(): ResolvedLearnerAuth {
  const store = learnerAuthStorage.getStore();
  if (!store) {
    return { source: 'stdio' };
  }
  return { source: 'http', rawSub: store.rawSub };
}
