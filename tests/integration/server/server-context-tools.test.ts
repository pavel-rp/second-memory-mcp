import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerServerContextTools } from '../../../src/server/server-context-tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { DrizzleContextTokenRepository } from '../../../src/adapters/drizzle/context-token-repository.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';

describe('server-context-tools (integration)', () => {
  let server: CaptureServer;
  let tokenRepo: DrizzleContextTokenRepository;

  beforeAll(setupTestDb);

  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerServerContextTools(server as any, createAppContext({ embedding: undefined }));
    tokenRepo = new DrizzleContextTokenRepository(getSql());
  });

  afterAll(teardownTestDb);

  it('returns a token starting with ctx-', async () => {
    const handler = server.tools.get('init_agent_context')!.handler;
    const envelope = parseResult(await handler());

    expect(envelope.status).toBe('ok');
    expect(envelope.data.context_token).toMatch(/^ctx-/);
    expect(envelope.data.action).toBe('initialized');
  });

  it('returned token passes validation', async () => {
    const handler = server.tools.get('init_agent_context')!.handler;
    const envelope = parseResult(await handler());

    const isValid = await tokenRepo.validate(envelope.data.context_token);
    expect(isValid).toBe(true);
  });

  it('full response structure is correct with real database backend', async () => {
    const handler = server.tools.get('init_agent_context')!.handler;
    const envelope = parseResult(await handler());
    const result = envelope.data;

    expect(result).toHaveProperty('context_token');
    expect(result).toHaveProperty('action', 'initialized');
    expect(result).toHaveProperty('domain_rules');
    expect(result).toHaveProperty('workflow_summary');

    expect(result.domain_rules).toHaveProperty('chunk_definition');
    expect(result.domain_rules).toHaveProperty('topic_scoping');
    expect(result.domain_rules).toHaveProperty('content_requirements');
    expect(result.domain_rules).toHaveProperty('anti_patterns');
    expect(result.domain_rules).toHaveProperty('sizing');
    expect(typeof result.workflow_summary).toBe('string');
    expect(result.workflow_summary.length).toBeGreaterThan(0);
  });

  it('full response includes learner_context with real database data', async () => {
    const handler = server.tools.get('init_agent_context')!.handler;
    const envelope = parseResult(await handler());
    const result = envelope.data;

    expect(result.learner_context).toBeDefined();
    expect(result.learner_context).not.toBeNull();
    expect(typeof result.learner_context).toBe('object');

    const lc = result.learner_context;
    expect(lc).toHaveProperty('total_topics');
    expect(lc).toHaveProperty('total_chunks');
    expect(lc).toHaveProperty('due_today');
    expect(lc).toHaveProperty('overdue');
    expect(lc).toHaveProperty('overdue_topics');
    expect(lc).toHaveProperty('recent_subjects');
    expect(lc).toHaveProperty('recent_session_summary');
    expect(lc).toHaveProperty('flagged_weak_areas');
    expect(lc).toHaveProperty('streak_days');
    expect(lc).toHaveProperty('leech_count');
    expect(lc).toHaveProperty('active_session');
  });

  it('init_agent_context completes within 500ms', async () => {
    const handler = server.tools.get('init_agent_context')!.handler;
    const start = performance.now();
    await handler();
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(500);
  });
});
