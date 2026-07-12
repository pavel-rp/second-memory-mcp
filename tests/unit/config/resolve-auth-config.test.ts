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
      additionalAudiences: [],
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

  it('throws when AUTH_AUDIENCE missing and transport=http', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: 'https://auth.example.com',
      })
    ).toThrow('AUTH_AUDIENCE');
  });

  it('throws with an actionable message naming AUTH_AUDIENCE and the fix', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: 'https://auth.example.com',
      })
    ).toThrow('AUTH_AUDIENCE is required when TRANSPORT=http');
  });

  it('throws when AUTH_ISSUER missing even if AUTH_AUDIENCE also missing', () => {
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

  it('throws when CORS_ALLOWED_ORIGINS is unset in HTTP mode (required-and-explicit)', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: 'https://auth.example.com',
        AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      })
    ).toThrow('CORS_ALLOWED_ORIGINS is required when TRANSPORT=http');
  });

  // ── AUTH_ADDITIONAL_AUDIENCES parsing ──────────────────────

  it('parses AUTH_ADDITIONAL_AUDIENCES comma-separated string into array', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      AUTH_ADDITIONAL_AUDIENCES: 'claude-web,other-client',
      CORS_ALLOWED_ORIGINS: 'https://app.example.com',
    });

    expect(result!.additionalAudiences).toEqual(['claude-web', 'other-client']);
  });

  it('returns empty additionalAudiences when AUTH_ADDITIONAL_AUDIENCES is unset', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      CORS_ALLOWED_ORIGINS: 'https://app.example.com',
    });

    expect(result!.additionalAudiences).toEqual([]);
  });

  it('trims whitespace and drops empty entries in AUTH_ADDITIONAL_AUDIENCES', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      AUTH_ADDITIONAL_AUDIENCES: ' claude-web , , other-client ,',
      CORS_ALLOWED_ORIGINS: 'https://app.example.com',
    });

    expect(result!.additionalAudiences).toEqual(['claude-web', 'other-client']);
  });

  it('returns empty additionalAudiences when AUTH_ADDITIONAL_AUDIENCES is an empty string', () => {
    const result = resolveAuthConfig('http', {
      AUTH_ISSUER: 'https://auth.example.com',
      AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
      AUTH_ADDITIONAL_AUDIENCES: '',
      CORS_ALLOWED_ORIGINS: 'https://app.example.com',
    });

    expect(result!.additionalAudiences).toEqual([]);
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
      additionalAudiences: [],
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

  it('handles whitespace-only AUTH_AUDIENCE as absent (throws)', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: 'https://auth.example.com',
        AUTH_AUDIENCE: '   ',
      })
    ).toThrow('AUTH_AUDIENCE');
  });

  it('handles empty-string AUTH_AUDIENCE as absent (throws)', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: 'https://auth.example.com',
        AUTH_AUDIENCE: '',
      })
    ).toThrow('AUTH_AUDIENCE');
  });

  it('throws when CORS_ALLOWED_ORIGINS is an empty string in HTTP mode', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: 'https://auth.example.com',
        AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
        CORS_ALLOWED_ORIGINS: '',
      })
    ).toThrow('CORS_ALLOWED_ORIGINS is required when TRANSPORT=http');
  });

  it('throws when CORS_ALLOWED_ORIGINS is only commas/whitespace in HTTP mode', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: 'https://auth.example.com',
        AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
        CORS_ALLOWED_ORIGINS: ' , , ',
      })
    ).toThrow('CORS_ALLOWED_ORIGINS is required when TRANSPORT=http');
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

  it('throws when CORS_ALLOWED_ORIGINS is the wildcard "*" in HTTP mode', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: 'https://auth.example.com',
        AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
        CORS_ALLOWED_ORIGINS: '*',
      })
    ).toThrow('CORS_ALLOWED_ORIGINS must not contain "*"');
  });

  it('throws when CORS_ALLOWED_ORIGINS contains "*" among explicit origins', () => {
    expect(() =>
      resolveAuthConfig('http', {
        AUTH_ISSUER: 'https://auth.example.com',
        AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
        CORS_ALLOWED_ORIGINS: 'https://app.example.com,*',
      })
    ).toThrow('CORS_ALLOWED_ORIGINS must not contain "*"');
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
