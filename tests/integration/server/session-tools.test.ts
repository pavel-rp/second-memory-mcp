import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerSessionTools } from '../../../src/server/session-tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

import { CaptureServer, parseResult } from '../../helpers/capture-server.js';

describe('session-tools', () => {
  let server: CaptureServer;

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerSessionTools(server as any, createAppContext({ embedding: undefined }));
  });
  afterAll(teardownTestDb);

  it('registers session_status tool', () => {
    expect(server.tools.has('session_status')).toBe(true);
  });

  it('old tools are not registered', () => {
    expect(server.tools.has('session_progress')).toBe(false);
    expect(server.tools.has('session_workflow')).toBe(false);
    expect(server.tools.has('session_completion')).toBe(false);
  });

  describe('session_status', () => {
    it('returns error for nonexistent session ID', async () => {
      const handler = server.tools.get('session_status')!.handler;
      const result = await handler({ session_id: 'nonexistent', context_token: 'ctx-test' });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('error');
    });
  });
});
