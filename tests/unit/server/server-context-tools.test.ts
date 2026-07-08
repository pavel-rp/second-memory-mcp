import { describe, it, expect, beforeEach } from 'vitest';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import { registerServerContextTools } from '../../../src/server/server-context-tools.js';
import { DOMAIN_RULES } from '../../../src/shared/domain-rules.js';
import { WORKFLOW_SUMMARY } from '../../../src/shared/instructions.js';
import type { AppContext } from '../../../src/composition-root.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';

function makeCtx(overrides: Partial<AppContext> = {}): AppContext {
  return createMockAppContext(new Date(), overrides);
}

describe('server-context-tools', () => {
  let server: CaptureServer;

  beforeEach(() => {
    server = new CaptureServer();
  });

  it('registers init_agent_context tool', () => {
    registerServerContextTools(server as any, makeCtx());
    expect(server.tools.has('init_agent_context')).toBe(true);
  });

  it('returns context_token, status, domain_rules, workflow_summary, and learner_context', async () => {
    registerServerContextTools(server as any, makeCtx());
    const handler = server.tools.get('init_agent_context')!.handler;
    const result = parseResult(await handler());

    expect(result.status).toBe('ok');
    expect(result.data).toHaveProperty('context_token', 'ctx-test-token-stub');
    expect(result.data).toHaveProperty('action', 'initialized');
    expect(result.data).toHaveProperty('domain_rules');
    expect(result.data).toHaveProperty('workflow_summary');
    expect(result.data).toHaveProperty('learner_context');
  });

  it('domain_rules contains all required fields', async () => {
    registerServerContextTools(server as any, makeCtx());
    const handler = server.tools.get('init_agent_context')!.handler;
    const result = parseResult(await handler());
    const rules = result.data.domain_rules;

    expect(rules).toHaveProperty('chunk_definition');
    expect(rules).toHaveProperty('topic_scoping');
    expect(rules).toHaveProperty('content_requirements');
    expect(rules).toHaveProperty('anti_patterns');
    expect(rules).toHaveProperty('sizing');
    expect(Array.isArray(rules.anti_patterns)).toBe(true);
    expect(rules.anti_patterns.length).toBeGreaterThan(0);
    expect(typeof rules.sizing).toBe('object');
    expect(rules.sizing).toHaveProperty('chunks_per_topic');
    expect(rules.sizing).toHaveProperty('novel_elements_per_chunk');
    expect(rules.sizing).toHaveProperty('content_length');
  });

  it('domain_rules matches the static DOMAIN_RULES constant', async () => {
    registerServerContextTools(server as any, makeCtx());
    const handler = server.tools.get('init_agent_context')!.handler;
    const result = parseResult(await handler());

    expect(result.data.domain_rules).toEqual(DOMAIN_RULES);
  });

  it('workflow_summary is a non-empty string matching WORKFLOW_SUMMARY', async () => {
    registerServerContextTools(server as any, makeCtx());
    const handler = server.tools.get('init_agent_context')!.handler;
    const result = parseResult(await handler());

    expect(typeof result.data.workflow_summary).toBe('string');
    expect(result.data.workflow_summary.length).toBeGreaterThan(0);
    expect(result.data.workflow_summary).toBe(WORKFLOW_SUMMARY);
  });

  it('returns toolError with type system when createContextToken throws', async () => {
    const ctx = makeCtx({
      createContextToken: async () => {
        throw new Error('token creation failed');
      },
    });
    registerServerContextTools(server as any, ctx);
    const handler = server.tools.get('init_agent_context')!.handler;
    const result = parseResult(await handler());

    expect(result.status).toBe('error');
    expect(result.error.type).toBe('internal');
    expect(result.error.message).toBe('token creation failed');
    expect(result.error.retryable).toBe(true);
  });

  it('learner_context contains expected snake_case fields from mock', async () => {
    registerServerContextTools(server as any, makeCtx());
    const handler = server.tools.get('init_agent_context')!.handler;
    const result = parseResult(await handler());
    const lc = result.data.learner_context;

    expect(lc).toHaveProperty('total_topics', 0);
    expect(lc).toHaveProperty('total_chunks', 0);
    expect(lc).toHaveProperty('due_today', 0);
    expect(lc).toHaveProperty('overdue', 0);
    expect(lc).toHaveProperty('overdue_topics');
    expect(lc).toHaveProperty('recent_subjects');
    expect(lc).toHaveProperty('recent_session_summary', null);
    expect(lc).toHaveProperty('flagged_weak_areas');
    expect(lc).toHaveProperty('streak_days', 0);
    expect(lc).toHaveProperty('leech_count', 0);
    expect(lc).toHaveProperty('active_session', null);
  });

  it('gracefully degrades to null learner_context when buildLearnerContext throws', async () => {
    const ctx = makeCtx({
      buildLearnerContext: async () => {
        throw new Error('learner context db failure');
      },
    });
    registerServerContextTools(server as any, ctx);
    const handler = server.tools.get('init_agent_context')!.handler;
    const result = parseResult(await handler());

    expect(result.status).toBe('ok');
    expect(result.data.learner_context).toBeNull();
    expect(result.data.action).toBe('initialized');
    expect(result.data.context_token).toBe('ctx-test-token-stub');
    expect(result.data.domain_rules).toBeDefined();
    expect(result.data.workflow_summary).toBeDefined();
  });

  it('response is valid JSON in toolData format (single text content block)', async () => {
    registerServerContextTools(server as any, makeCtx());
    const handler = server.tools.get('init_agent_context')!.handler;
    const raw = await handler();

    expect(raw.content).toHaveLength(1);
    expect(raw.content[0].type).toBe('text');
    expect(() => JSON.parse(raw.content[0].text)).not.toThrow();
  });
});
