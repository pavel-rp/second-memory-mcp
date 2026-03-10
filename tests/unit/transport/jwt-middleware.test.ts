import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { AuthConfig } from '../../../src/config/resolve-auth-config.js';

// Mock jose before importing the module under test
const mockJwtVerify = vi.fn();
const mockCreateRemoteJWKSet = vi.fn();

vi.mock('jose', () => ({
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
  createRemoteJWKSet: (...args: unknown[]) => mockCreateRemoteJWKSet(...args),
}));

// Mock fetch for OIDC discovery
const MOCK_JWKS_URI = 'https://auth.example.com/auth/v1/oidc/certs';
const mockFetch = vi.fn<(input: RequestInfo | URL) => Promise<globalThis.Response>>();
vi.stubGlobal('fetch', mockFetch);

const { createJwtMiddleware } = await import('../../../src/transport/jwt-middleware.js');

const AUTH_CONFIG: AuthConfig = {
  issuer: 'https://auth.example.com',
  audience: 'https://mcp.example.com/mcp',
  corsAllowedOrigins: ['https://app.example.com'],
};

function createMockReq(headers: Record<string, string> = {}, method = 'POST'): Request {
  return { headers, method } as unknown as Request;
}

function createMockRes(): Response & {
  _status: number;
  _headers: Record<string, string>;
  _body: string;
} {
  const res = {
    _status: 0,
    _headers: {} as Record<string, string>,
    _body: '',
    locals: {} as Record<string, unknown>,
    status(code: number) {
      res._status = code;
      return res;
    },
    setHeader(name: string, value: string) {
      res._headers[name.toLowerCase()] = value;
      return res;
    },
    json(body: unknown) {
      res._body = JSON.stringify(body);
      return res;
    },
    end() {
      return res;
    },
  };
  return res as unknown as Response & {
    _status: number;
    _headers: Record<string, string>;
    _body: string;
  };
}

describe('createJwtMiddleware', () => {
  const jwksFunction = vi.fn();
  let middleware: Awaited<ReturnType<typeof createJwtMiddleware>>;
  let next: NextFunction;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ jwks_uri: MOCK_JWKS_URI }), { status: 200 })
    );
    mockCreateRemoteJWKSet.mockReturnValue(jwksFunction);
    middleware = await createJwtMiddleware(AUTH_CONFIG);
    next = vi.fn();
  });

  // ── Factory ─────────────────────────────────────────────────

  it('returns a middleware function', () => {
    expect(typeof middleware).toBe('function');
  });

  it('calls createRemoteJWKSet with JWKS URI from OIDC discovery', () => {
    expect(mockCreateRemoteJWKSet).toHaveBeenCalledWith(new URL(MOCK_JWKS_URI));
  });

  it('fetches OIDC discovery document from issuer', () => {
    expect(mockFetch).toHaveBeenCalledWith(
      'https://auth.example.com/.well-known/openid-configuration',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('strips trailing slashes from issuer for discovery and jwtVerify', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ jwks_uri: MOCK_JWKS_URI }), { status: 200 })
    );
    mockJwtVerify.mockResolvedValue({ payload: { sub: 'u1' } });

    const trailingSlashConfig: AuthConfig = {
      ...AUTH_CONFIG,
      issuer: 'https://auth.example.com/',
    };
    const mw = await createJwtMiddleware(trailingSlashConfig);
    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://auth.example.com/.well-known/openid-configuration',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );

    // Verify normalized issuer is also used for jwtVerify
    const req = createMockReq({ authorization: 'Bearer tok' });
    const res = createMockRes();
    await mw(req, res, vi.fn());
    expect(mockJwtVerify).toHaveBeenCalledWith(
      'tok',
      jwksFunction,
      expect.objectContaining({ issuer: 'https://auth.example.com' })
    );
  });

  it('throws when OIDC discovery returns non-200 status', async () => {
    mockFetch.mockResolvedValue(new Response('Not Found', { status: 404 }));
    await expect(createJwtMiddleware(AUTH_CONFIG)).rejects.toThrow('returned 404');
  });

  it('throws when OIDC discovery returns non-JSON body', async () => {
    mockFetch.mockResolvedValue(new Response('<html>Error</html>', { status: 200 }));
    await expect(createJwtMiddleware(AUTH_CONFIG)).rejects.toThrow('returned invalid JSON');
  });

  it('throws on non-string jwks_uri in discovery response', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ jwks_uri: 42 }), { status: 200 }));
    await expect(createJwtMiddleware(AUTH_CONFIG)).rejects.toThrow('missing or invalid jwks_uri');
  });

  it('throws on missing jwks_uri in discovery response', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
    await expect(createJwtMiddleware(AUTH_CONFIG)).rejects.toThrow('missing or invalid jwks_uri');
  });

  it('throws on unparseable jwks_uri string in discovery response', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ jwks_uri: 'http://[invalid' }), { status: 200 })
    );
    await expect(createJwtMiddleware(AUTH_CONFIG)).rejects.toThrow('invalid jwks_uri at');
  });

  it('throws on fetch timeout (AbortError)', async () => {
    vi.useFakeTimers();
    try {
      mockFetch.mockImplementation(
        (_url: RequestInfo | URL, init?: RequestInit) =>
          new Promise<globalThis.Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              reject(new DOMException('The operation was aborted', 'AbortError'));
            });
          })
      );
      const promise = createJwtMiddleware(AUTH_CONFIG);
      vi.advanceTimersByTime(5_000);
      await expect(promise).rejects.toThrow('timed out');
    } finally {
      vi.useRealTimers();
    }
  });

  it('throws on network error with message', async () => {
    mockFetch.mockRejectedValue(new Error('getaddrinfo ENOTFOUND'));
    await expect(createJwtMiddleware(AUTH_CONFIG)).rejects.toThrow('OIDC discovery request failed');
  });

  // ── No Authorization header → 401 (VC-01, VC-02, VC-03) ───

  it('POST without Authorization header returns 401 with WWW-Authenticate (VC-01)', async () => {
    const req = createMockReq({}, 'POST');
    const res = createMockRes();

    await middleware(req, res, next);

    expect(res._status).toBe(401);
    expect(res._headers['www-authenticate']).toContain('Bearer');
    expect(res._headers['www-authenticate']).toContain('resource_metadata=');
    expect(next).not.toHaveBeenCalled();
  });

  it('GET without Authorization header returns 401 with WWW-Authenticate (VC-02)', async () => {
    const req = createMockReq({}, 'GET');
    const res = createMockRes();

    await middleware(req, res, next);

    expect(res._status).toBe(401);
    expect(res._headers['www-authenticate']).toContain('Bearer');
    expect(next).not.toHaveBeenCalled();
  });

  it('DELETE without Authorization header returns 401 with WWW-Authenticate (VC-03)', async () => {
    const req = createMockReq({}, 'DELETE');
    const res = createMockRes();

    await middleware(req, res, next);

    expect(res._status).toBe(401);
    expect(res._headers['www-authenticate']).toContain('Bearer');
    expect(next).not.toHaveBeenCalled();
  });

  // ── Valid Bearer token → access granted (VC-06) ────────────

  it('valid Bearer token calls next() and sets res.locals.auth (VC-06)', async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { sub: 'user-123', email: 'user@example.com' },
    });

    const req = createMockReq({ authorization: 'Bearer valid-token' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals.auth).toEqual({ sub: 'user-123', email: 'user@example.com' });
    expect(mockJwtVerify).toHaveBeenCalledWith('valid-token', jwksFunction, {
      issuer: AUTH_CONFIG.issuer,
      audience: AUTH_CONFIG.audience,
    });
  });

  // ── Expired token → 401 (VC-07) ────────────────────────────

  it('expired token returns 401 (VC-07)', async () => {
    const error = new Error('JWT expired');
    (error as Error & { code: string }).code = 'ERR_JWT_EXPIRED';
    mockJwtVerify.mockRejectedValue(error);

    const req = createMockReq({ authorization: 'Bearer expired-token' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  // ── Invalid signature → 401 (VC-07) ────────────────────────

  it('invalid signature returns 401 (VC-07)', async () => {
    const error = new Error('signature verification failed');
    (error as Error & { code: string }).code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
    mockJwtVerify.mockRejectedValue(error);

    const req = createMockReq({ authorization: 'Bearer bad-sig-token' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  // ── Wrong audience → 401 (VC-08) ──────────────────────────

  it('wrong audience returns 401 (VC-08)', async () => {
    const error = new Error('claim validation failed');
    (error as Error & { code: string }).code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
    mockJwtVerify.mockRejectedValue(error);

    const req = createMockReq({ authorization: 'Bearer wrong-aud-token' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  // ── Malformed Authorization header → 401 ───────────────────

  it('Basic auth scheme returns 401', async () => {
    const req = createMockReq({ authorization: 'Basic dXNlcjpwYXNz' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('Bearer with no token returns 401', async () => {
    const req = createMockReq({ authorization: 'Bearer' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('Bearer with empty token returns 401', async () => {
    const req = createMockReq({ authorization: 'Bearer ' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  // ── Case-insensitive Bearer scheme (RFC 9110) ──────────────

  it('lowercase "bearer" scheme is accepted', async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { sub: 'user-123', email: 'user@example.com' },
    });

    const req = createMockReq({ authorization: 'bearer valid-token' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals.auth).toEqual({ sub: 'user-123', email: 'user@example.com' });
  });

  it('uppercase "BEARER" scheme is accepted', async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { sub: 'user-123', email: 'user@example.com' },
    });

    const req = createMockReq({ authorization: 'BEARER valid-token' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ── Missing sub claim → 401 ───────────────────────────────

  it('token without sub claim returns 401', async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { email: 'user@example.com' },
    });

    const req = createMockReq({ authorization: 'Bearer no-sub-token' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('token with empty sub claim returns 401', async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { sub: '', email: 'user@example.com' },
    });

    const req = createMockReq({ authorization: 'Bearer empty-sub-token' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  // ── PRM URL in WWW-Authenticate header ────────────────────

  it('WWW-Authenticate resource_metadata URL uses origin of audience (not appended path)', async () => {
    const req = createMockReq({}, 'POST');
    const res = createMockRes();

    await middleware(req, res, next);

    // audience is https://mcp.example.com/mcp — PRM URL should be at the origin, not appended
    expect(res._headers['www-authenticate']).toBe(
      'Bearer resource_metadata="https://mcp.example.com/.well-known/oauth-protected-resource/mcp"'
    );
  });

  // ── No-audience config ───────────────────────────────────

  it('calls jwtVerify without audience option when audience is undefined', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ jwks_uri: MOCK_JWKS_URI }), { status: 200 })
    );
    const noAudConfig: AuthConfig = { ...AUTH_CONFIG, audience: undefined };
    const noAudMiddleware = await createJwtMiddleware(noAudConfig);

    mockJwtVerify.mockResolvedValue({
      payload: { sub: 'user-123', email: 'user@example.com' },
    });

    const req = createMockReq({ authorization: 'Bearer valid-token' });
    const res = createMockRes();

    await noAudMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(mockJwtVerify).toHaveBeenCalledWith('valid-token', jwksFunction, {
      issuer: noAudConfig.issuer,
    });
  });

  it('WWW-Authenticate is plain Bearer when audience is undefined', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ jwks_uri: MOCK_JWKS_URI }), { status: 200 })
    );
    const noAudConfig: AuthConfig = { ...AUTH_CONFIG, audience: undefined };
    const noAudMiddleware = await createJwtMiddleware(noAudConfig);

    const req = createMockReq({}, 'POST');
    const res = createMockRes();

    await noAudMiddleware(req, res, next);

    expect(res._headers['www-authenticate']).toBe('Bearer');
  });

  // ── Valid token with sub but no email ──────────────────────

  it('valid token with sub but no email sets email as undefined', async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { sub: 'service-account-42' },
    });

    const req = createMockReq({ authorization: 'Bearer no-email-token' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals.auth).toEqual({ sub: 'service-account-42', email: undefined });
  });

  // ── Non-string email claim is discarded ────────────────────

  it('non-string email claim is stored as undefined', async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { sub: 'user-123', email: ['user@example.com'] },
    });

    const req = createMockReq({ authorization: 'Bearer array-email-token' });
    const res = createMockRes();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals.auth).toEqual({ sub: 'user-123', email: undefined });
  });
});
