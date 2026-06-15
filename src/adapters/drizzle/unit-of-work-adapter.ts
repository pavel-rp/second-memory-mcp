import { withTx, type SqlDb } from '../../infrastructure/db/operations.js';
import type { UnitOfWorkPort, TransactionPorts } from '../../ports/unit-of-work-port.js';
import { DrizzleChunkRepository } from './chunk-repository.js';
import { DrizzleTopicRepository } from './topic-repository.js';
import { DrizzleSessionRepository } from './session-repository.js';
import { instrument } from './instrument.js';

export class DrizzleUnitOfWorkAdapter implements UnitOfWorkPort {
  async execute<T>(callback: (ports: TransactionPorts) => Promise<T>): Promise<T> {
    return withTx(async tx => {
      // SqlTx supports the same query operations as SqlDb (select/insert/update/delete)
      const db = tx as unknown as SqlDb;
      // Instrument the transaction-scoped repositories so their queries emit
      // slow_query/query_failed diagnostics. `topics` is left raw — out of scope
      // for NEU-363's target adapter set. The execute() boundary itself is timed
      // by instrumenting this adapter in the composition root.
      const txPorts: TransactionPorts = {
        chunks: instrument('chunkRepository', new DrizzleChunkRepository(db)),
        topics: new DrizzleTopicRepository(db),
        sessions: instrument('sessionRepository', new DrizzleSessionRepository(db)),
      };
      return callback(txPorts);
    });
  }
}
