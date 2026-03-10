import type { RequestHandler } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { AuthConfig } from '../config/resolve-auth-config.js';

export function createJwtMiddleware(authConfig: AuthConfig): RequestHandler {
  const jwks = createRemoteJWKSet(new URL(`${authConfig.issuer}/.well-known/jwks.json`));
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
