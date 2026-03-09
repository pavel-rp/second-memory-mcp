import type { RequestHandler } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { AuthConfig } from '../config/resolve-auth-config.js';

export function createJwtMiddleware(authConfig: AuthConfig): RequestHandler {
  const jwks = createRemoteJWKSet(new URL(`${authConfig.issuer}/.well-known/jwks.json`));
  const prmUrl = `${authConfig.audience}/.well-known/oauth-protected-resource/mcp`;

  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply401(res, prmUrl);
    }

    const token = authHeader.slice(7);
    if (!token) {
      return reply401(res, prmUrl);
    }

    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: authConfig.issuer,
        audience: authConfig.audience,
      });

      res.locals.auth = {
        sub: payload.sub,
        email: payload.email as string | undefined,
      };
      next();
    } catch {
      return reply401(res, prmUrl);
    }
  };
}

function reply401(res: Parameters<RequestHandler>[1], prmUrl: string): void {
  res
    .setHeader('WWW-Authenticate', `Bearer resource_metadata="${prmUrl}"`)
    .status(401)
    .json({ error: 'Unauthorized' })
    .end();
}
