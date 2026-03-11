import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('teaching workflows (composition-root wiring)', () => {
  let ctx: AppContext;

  beforeAll(async () => {
    await setupTestDb();
    ctx = createAppContext({ embedding: undefined });
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  it('getNextTeachingStep returns error when no active session', async () => {
    const result = await ctx.getNextTeachingStep();

    expect(result.status).toBe('error');
    expect(result).toHaveProperty('message', 'No active session. Call create_session first.');
  });
});
