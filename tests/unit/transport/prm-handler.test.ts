import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { AuthConfig } from '../../../src/config/resolve-auth-config.js';
import { createPrmHandler } from '../../../src/transport/prm-handler.js';

const AUTH_CONFIG: AuthConfig = {
  issuer: 'https://auth.example.com',
  audience: 'https://mcp.example.com/mcp',
  corsAllowedOrigins: ['https://app.example.com'],
};

function createMockReq(method = 'GET'): Request {
  return { method } as unknown as Request;
}

function createMockRes(): Response & {
  _status: number;
  _headers: Record<string, string>;
  _body: unknown;
} {
  const res = {
    _status: 0,
    _headers: {} as Record<string, string>,
    _body: undefined as unknown,
    status(code: number) {
      res._status = code;
      return res;
    },
    setHeader(name: string, value: string) {
      res._headers[name.toLowerCase()] = value;
      return res;
    },
    json(body: unknown) {
      res._body = body;
      return res;
    },
    type(contentType: string) {
      res._headers['content-type'] = contentType;
      return res;
    },
    send(body: unknown) {
      res._body = body;
      return res;
    },
    end() {
      return res;
    },
  };
  return res as unknown as Response & {
    _status: number;
    _headers: Record<string, string>;
    _body: unknown;
  };
}

describe('createPrmHandler', () => {
  const handler = createPrmHandler(AUTH_CONFIG);

  // ── GET returns valid PRM document (VC-05) ─────────────────

  it('returns 200 with JSON content-type (VC-05)', () => {
    const req = createMockReq('GET');
    const res = createMockRes();

    handler(req, res, vi.fn() as unknown as NextFunction);

    expect(res._status).toBe(200);
  });

  it('response contains resource field matching MCP endpoint URL (VC-05)', () => {
    const req = createMockReq('GET');
    const res = createMockRes();

    handler(req, res, vi.fn() as unknown as NextFunction);

    const body = res._body as Record<string, unknown>;
    expect(body.resource).toBe('https://mcp.example.com/mcp');
  });

  it('response contains authorization_servers array with issuer URL (VC-05)', () => {
    const req = createMockReq('GET');
    const res = createMockRes();

    handler(req, res, vi.fn() as unknown as NextFunction);

    const body = res._body as Record<string, unknown>;
    expect(body.authorization_servers).toEqual(['https://auth.example.com']);
  });

  it('response contains scopes_supported (VC-05)', () => {
    const req = createMockReq('GET');
    const res = createMockRes();

    handler(req, res, vi.fn() as unknown as NextFunction);

    const body = res._body as Record<string, unknown>;
    expect(body.scopes_supported).toEqual(['openid', 'profile', 'email']);
  });

  it('response contains bearer_methods_supported (VC-05)', () => {
    const req = createMockReq('GET');
    const res = createMockRes();

    handler(req, res, vi.fn() as unknown as NextFunction);

    const body = res._body as Record<string, unknown>;
    expect(body.bearer_methods_supported).toEqual(['header']);
  });

  // ── Non-GET methods return 405 ─────────────────────────────

  it('POST on PRM endpoint returns 405', () => {
    const req = createMockReq('POST');
    const res = createMockRes();

    handler(req, res, vi.fn() as unknown as NextFunction);

    expect(res._status).toBe(405);
  });

  it('DELETE on PRM endpoint returns 405', () => {
    const req = createMockReq('DELETE');
    const res = createMockRes();

    handler(req, res, vi.fn() as unknown as NextFunction);

    expect(res._status).toBe(405);
  });

  it('PUT on PRM endpoint returns 405', () => {
    const req = createMockReq('PUT');
    const res = createMockRes();

    handler(req, res, vi.fn() as unknown as NextFunction);

    expect(res._status).toBe(405);
  });
});
