import type { RequestHandler } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { AuthConfig } from '../config/resolve-auth-config.js';

async function discoverJwksUri(issuer: string): Promise<string> {
  const normalizedIssuer = issuer.replace(/\/+$/, '');
  const discoveryUrl = `${normalizedIssuer}/.well-known/openid-configuration`;

  const controller = new AbortController();
  const timeoutMs = 5_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: globalThis.Response;
  try {
    res = await fetch(discoveryUrl, { signal: controller.signal });
  } catch (err) {
    const error = err as { name?: string; message?: string };
    if (error?.name === 'AbortError') {
      throw new Error(`OIDC discovery timed out after ${timeoutMs}ms: ${discoveryUrl}`, {
        cause: err,
      });
    }
    throw new Error(
      `OIDC discovery request failed: ${discoveryUrl}${error?.message ? ` - ${error.message}` : ''}`,
      { cause: err }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    throw new Error(`OIDC discovery failed: ${discoveryUrl} returned ${res.status}`);
  }
  const metadata = (await res.json()) as { jwks_uri?: unknown };
  if (typeof metadata.jwks_uri !== 'string' || !metadata.jwks_uri) {
    throw new Error(`OIDC discovery at ${discoveryUrl} missing or invalid jwks_uri`);
  }
  return new URL(metadata.jwks_uri, normalizedIssuer).href;
}

export async function createJwtMiddleware(authConfig: AuthConfig): Promise<RequestHandler> {
  const jwksUri = await discoverJwksUri(authConfig.issuer);
  const jwks = createRemoteJWKSet(new URL(jwksUri));
  const prmUrl = authConfig.audience
    ? new URL('/.well-known/oauth-protected-resource/mcp', authConfig.audience).href
    : undefined;

  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !/^bearer /i.test(authHeader)) {
      return reply401(res, prmUrl);
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return reply401(res, prmUrl);
    }

    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: authConfig.issuer,
        ...(authConfig.audience ? { audience: authConfig.audience } : {}),
      });

      if (typeof payload.sub !== 'string' || !payload.sub) {
        return reply401(res, prmUrl);
      }

      res.locals.auth = {
        sub: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : undefined,
      };
      next();
    } catch {
      return reply401(res, prmUrl);
    }
  };
}

function reply401(res: Parameters<RequestHandler>[1], prmUrl: string | undefined): void {
  const challenge = prmUrl ? `Bearer resource_metadata="${prmUrl}"` : 'Bearer';
  res.setHeader('WWW-Authenticate', challenge).status(401).json({ error: 'Unauthorized' }).end();
}
