import { describe, it, expect } from 'vitest';
import { resolveAuthConfig } from '../../../src/config/resolve-auth-config.js';

describe('resolveAuthConfig', () => {
  // ── HTTP mode — valid config ────────────────────────────────

  it('returns AuthConfig with correct values when all env vars present and transport=http', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      CORS_ALLOWED_ORIGINS: 'https://app.example.com',
    });

    expect(result).toEqual({
      issuer: 'https://auth.example.com',
      audience: 'https://mcp.example.com/mcp',
      corsAllowedOrigins: ['https://app.example.com'],
    });
  });

  // ── HTTP mode — missing required vars (VC-10) ──────────────

  it('throws when AUTH_ISSUER missing and transport=http', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      })
    ).toThrow('AUTH_ISSUER');
  });

  it('returns AuthConfig with audience undefined when AUTH_AUDIENCE missing and transport=http', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
    });
    expect(result).toEqual({
      issuer: 'https://auth.example.com',
      audience: undefined,
      corsAllowedOrigins: ['*'],
    });
  });

  it('throws when both AUTH_ISSUER and AUTH_AUDIENCE missing and transport=http', () => {
    expect(() => resolveAuthConfig('http', {})).toThrow();
  });

  // ── HTTP mode — invalid URLs ──────────────────────────────

  it('throws when AUTH_ISSUER is not a valid URL', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: 'not-a-url',
        AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      })
    ).toThrow('AUTH_ISSUER must be a valid absolute URL');
  });

  it('throws when AUTH_AUDIENCE is not a valid URL', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: 'https://auth.example.com',
        AUTH_AUDIENCE: '/relative/path',
      })
    ).toThrow('AUTH_AUDIENCE must be a valid absolute URL');
  });

  // ── STDIO mode (VC-09) ─────────────────────────────────────

  it('returns null when transport=stdio regardless of auth env vars', () => {
    const result = resolveAuthConfig('stdio', {});
    expect(result).toBeNull();
  });

  it('returns null when transport=stdio even if auth vars ARE present', () => {
    const result = resolveAuthConfig('stdio', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      CORS_ALLOWED_ORIGINS: 'https://app.example.com',
    });
    expect(result).toBeNull();
  });

  // ── CORS_ALLOWED_ORIGINS parsing ───────────────────────────

  it('parses CORS_ALLOWED_ORIGINS comma-separated string into array', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      CORS_ALLOWED_ORIGINS: 'https://a.com,https://b.com,https://c.com',
    });

    expect(result!.corsAllowedOrigins).toEqual(['https://a.com', 'https://b.com', 'https://c.com']);
  });

  it("defaults CORS_ALLOWED_ORIGINS to ['*'] when not set", () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
    });

    expect(result!.corsAllowedOrigins).toEqual(['*']);
  });

  // ── Whitespace trimming ────────────────────────────────────

  it('trims whitespace from all string values', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: '  https://auth.example.com  ',
      AUTH_AUDIENCE: '  https://mcp.example.com/mcp  ',
      CORS_ALLOWED_ORIGINS: ' https://a.com , https://b.com ',
    });

    expect(result).toEqual({
      issuer: 'https://auth.example.com',
      audience: 'https://mcp.example.com/mcp',
      corsAllowedOrigins: ['https://a.com', 'https://b.com'],
    });
  });

  // ── Empty strings treated as absent ────────────────────────

  it('handles empty-string AUTH_ISSUER as absent', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: '',
        AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      })
    ).toThrow('AUTH_ISSUER');
  });

  it('handles whitespace-only AUTH_ISSUER as absent', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: '   ',
        AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      })
    ).toThrow('AUTH_ISSUER');
  });

  it('handles empty-string AUTH_AUDIENCE as absent (returns undefined)', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: '',
    });
    expect(result!.audience).toBeUndefined();
  });

  it("defaults CORS_ALLOWED_ORIGINS to ['*'] when set to empty string", () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      CORS_ALLOWED_ORIGINS: '',
    });

    expect(result!.corsAllowedOrigins).toEqual(['*']);
  });

  // ── CORS origin normalization ────────────────────────────────

  it('strips trailing slashes from CORS origin entries', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      CORS_ALLOWED_ORIGINS: 'https://app.example.com/',
    });

    expect(result!.corsAllowedOrigins).toEqual(['https://app.example.com']);
  });

  it('strips paths from CORS origin entries to match browser Origin header format', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      CORS_ALLOWED_ORIGINS: 'https://app.example.com/some/path',
    });

    expect(result!.corsAllowedOrigins).toEqual(['https://app.example.com']);
  });

  it('preserves wildcard "*" as-is during origin normalization', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      CORS_ALLOWED_ORIGINS: '*',
    });

    expect(result!.corsAllowedOrigins).toEqual(['*']);
  });

  it('normalizes multiple CORS origins with trailing slashes and paths', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      CORS_ALLOWED_ORIGINS: 'https://a.com/,https://b.com/path,https://c.com:8080/',
    });

    expect(result!.corsAllowedOrigins).toEqual([
      'https://a.com',
      'https://b.com',
      'https://c.com:8080',
    ]);
  });

  it('throws on invalid CORS origin entry to fail fast on misconfiguration', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: 'https://auth.example.com',
        AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
        CORS_ALLOWED_ORIGINS: 'https//not-a-url',
      })
    ).toThrow('CORS_ALLOWED_ORIGINS contains an invalid origin');
  });
});
