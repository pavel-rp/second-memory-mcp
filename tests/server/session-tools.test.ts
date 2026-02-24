import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerSessionTools } from '../../src/server/session-tools.js';
import { resetDatabase } from '../../src/db/client.js';
import { ensureSchema } from '../../src/db/migrate.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function tmpDbPath() {
  return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

class CaptureServer {
  public tools = new Map<string, { spec: any; handler: Function }>();
  registerTool(name: string, spec: any, handler: Function) {
    this.tools.set(name, { spec, handler });
  }
}

function parseResult(out: any): any {
  return JSON.parse(out?.content?.[0]?.text);
}

describe('session-tools', () => {
  let server: CaptureServer;
  let dbFile: string;

  beforeEach(async () => {
    dbFile = tmpDbPath();
    process.env.SM_DB_PATH = dbFile;
    await resetDatabase();
    ensureSchema();

    server = new CaptureServer();
    registerSessionTools(server as any);
  });

  afterEach(async () => {
    await resetDatabase();
    for (const suffix of ['', '-shm', '-wal']) {
      const f = `${dbFile}${suffix}`;
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  });

  it('registers session analysis and conversation tools', () => {
    expect(server.tools.has('session_progress')).toBe(true);
    expect(server.tools.has('session_workflow')).toBe(true);
    expect(server.tools.has('session_completion')).toBe(true);
    expect(server.tools.has('guided_learning_conversation')).toBe(true);
  });

  describe('session_progress', () => {
    it('returns error for nonexistent session ID', async () => {
      const handler = server.tools.get('session_progress')!.handler;
      const result = await handler({ sessionId: 'nonexistent' });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });

    it('returns error when neither sessionId nor sessionData provided', async () => {
      const handler = server.tools.get('session_progress')!.handler;
      const result = await handler({});
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });
  });

  describe('session_workflow', () => {
    it('returns error for nonexistent session ID', async () => {
      const handler = server.tools.get('session_workflow')!.handler;
      const result = await handler({ sessionId: 'nonexistent' });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });
  });

  describe('session_completion', () => {
    it('returns error for nonexistent session ID', async () => {
      const handler = server.tools.get('session_completion')!.handler;
      const result = await handler({ sessionId: 'nonexistent' });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(false);
    });
  });
});
