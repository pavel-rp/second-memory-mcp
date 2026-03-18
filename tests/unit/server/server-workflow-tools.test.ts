import { describe, it, expect, beforeEach } from 'vitest';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import { registerServerWorkflowTools } from '../../../src/server/server-workflow-tools.js';
import { SERVER_INSTRUCTIONS } from '../../../src/shared/instructions.js';

describe('server-workflow-tools', () => {
  let server: CaptureServer;

  beforeEach(() => {
    server = new CaptureServer();
    registerServerWorkflowTools(server as any);
  });

  it('registers get_server_workflow tool', () => {
    expect(server.tools.has('get_server_workflow')).toBe(true);
  });

  it('returns workflow field containing SERVER_INSTRUCTIONS', async () => {
    const handler = server.tools.get('get_server_workflow')!.handler;
    const result = parseResult(await handler());
    expect(result).toHaveProperty('workflow');
    expect(result.workflow).toBe(SERVER_INSTRUCTIONS);
  });

  it('returns response in toolJson format', async () => {
    const handler = server.tools.get('get_server_workflow')!.handler;
    const raw = await handler();
    expect(raw.content).toHaveLength(1);
    expect(raw.content[0].type).toBe('text');
    expect(() => JSON.parse(raw.content[0].text)).not.toThrow();
  });
});
