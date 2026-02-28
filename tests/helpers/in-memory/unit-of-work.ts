import type { UnitOfWorkPort, TransactionPorts } from '../../../src/ports/unit-of-work-port.js';
import { InMemoryChunkRepository } from './chunk-repository.js';
import { InMemoryTopicRepository } from './topic-repository.js';
import { InMemorySessionRepository } from './session-repository.js';

/**
 * In-memory unit of work — no real transactions, just passes the same
 * in-memory repos to the callback. For failure injection, set `shouldFail`.
 */
export class InMemoryUnitOfWork implements UnitOfWorkPort {
  shouldFail = false;

  constructor(
    private chunks: InMemoryChunkRepository,
    private topics: InMemoryTopicRepository,
    private sessions: InMemorySessionRepository
  ) {}

  async execute<T>(callback: (ports: TransactionPorts) => Promise<T>): Promise<T> {
    if (this.shouldFail) throw new Error('Transaction failed (injected)');
    return callback({
      chunks: this.chunks,
      topics: this.topics,
      sessions: this.sessions,
    });
  }
}
