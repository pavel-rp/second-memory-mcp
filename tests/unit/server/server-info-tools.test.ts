import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerServerInfoTools } from '../../../src/server/server-info-tools.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';

describe('server-info-tools', () => {
  let server: CaptureServer;

  beforeEach(() => {
    server = new CaptureServer();
    registerServerInfoTools(server as any);
  });

  afterEach(() => {
    delete process.env.BUILD_TIME;
  });

  it('registers get_server_info tool', () => {
    expect(server.tools.has('get_server_info')).toBe(true);
  });

  it('returns name, version, and build_time in snake_case', async () => {
    const handler = server.tools.get('get_server_info')!.handler;
    const result = parseResult(await handler());
    expect(result).toHaveProperty('name', 'second-memory-learning');
    expect(result).toHaveProperty('version');
    expect(result.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(result).toHaveProperty('build_time');
  });

  it('returns build_time as null when BUILD_TIME is unset', async () => {
    delete process.env.BUILD_TIME;
    const handler = server.tools.get('get_server_info')!.handler;
    const result = parseResult(await handler());
    expect(result.build_time).toBeNull();
  });

  it('returns build_time when BUILD_TIME is set', async () => {
    process.env.BUILD_TIME = '2026-03-12T14:30:00Z';
    const handler = server.tools.get('get_server_info')!.handler;
    const result = parseResult(await handler());
    expect(result.build_time).toBe('2026-03-12T14:30:00Z');
  });
});
