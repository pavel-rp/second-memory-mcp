import type { ChunkRepository } from './chunk-repository.js';
import type { TopicRepository } from './topic-repository.js';
import type { SessionRepository } from './session-repository.js';

/**
 * Transaction-scoped port instances provided to UnitOfWork callbacks.
 * All operations through these ports share a single database transaction.
 */
export type TransactionPorts = {
  chunks: ChunkRepository;
  topics: TopicRepository;
  sessions: SessionRepository;
};

/**
 * Port interface for atomic transaction execution (ADR-07).
 *
 * Provides tx-scoped port instances to the callback, ensuring all
 * repository operations within the callback participate in the same
 * transaction. This prevents bugs where queries bypass the tx handle.
 *
 * Production adapter wraps Drizzle `db.transaction()` and constructs
 * tx-scoped adapter instances. In-memory test adapter runs the callback
 * against shared stores with optional rollback-on-error semantics.
 */
export interface UnitOfWorkPort {
  execute<T>(callback: (ports: TransactionPorts) => Promise<T>): Promise<T>;
}
