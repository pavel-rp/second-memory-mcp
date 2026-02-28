import { withTx, type SqlDb } from '../../infrastructure/db/operations.js';
import type { UnitOfWorkPort, TransactionPorts } from '../../ports/unit-of-work-port.js';
import { DrizzleChunkRepository } from './chunk-repository.js';
import { DrizzleTopicRepository } from './topic-repository.js';
import { DrizzleSessionRepository } from './session-repository.js';

export class DrizzleUnitOfWorkAdapter implements UnitOfWorkPort {
  async execute<T>(callback: (ports: TransactionPorts) => Promise<T>): Promise<T> {
    return withTx(async tx => {
      // SqlTx supports the same query operations as SqlDb (select/insert/update/delete)
      const db = tx as unknown as SqlDb;
      const txPorts: TransactionPorts = {
        chunks: new DrizzleChunkRepository(db),
        topics: new DrizzleTopicRepository(db),
        sessions: new DrizzleSessionRepository(db),
      };
      return callback(txPorts);
    });
  }
}
