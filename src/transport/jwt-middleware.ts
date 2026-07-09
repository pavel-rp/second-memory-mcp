import type { RequestHandler } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { AuthConfig } from '../config/resolve-auth-config.js';

async function discoverJwksUri(issuer: string): Promise<string> {
  const discoveryUrl = `${issuer}/.well-known/openid-configuration`;

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
  let metadata: { jwks_uri?: unknown };
  try {
    metadata = (await res.json()) as { jwks_uri?: unknown };
  } catch (err) {
    throw new Error(`OIDC discovery at ${discoveryUrl} returned invalid JSON`, { cause: err });
  }
  if (typeof metadata.jwks_uri !== 'string' || !metadata.jwks_uri) {
    throw new Error(`OIDC discovery at ${discoveryUrl} missing or invalid jwks_uri`);
  }
  try {
    return new URL(metadata.jwks_uri, issuer).href;
  } catch (err) {
    throw new Error(
      `OIDC discovery returned invalid jwks_uri at ${discoveryUrl}: ${metadata.jwks_uri}`,
      { cause: err }
    );
  }
}

/**
 * Rauthy Dynamic Client Registration (DCR) mints client ids of the form `dyn$<random>`
 * and, absent RFC 8707 resource indicators, sets the token `aud` to that client id.
 */
function isDynClientId(value: string): boolean {
  return value.startsWith('dyn$');
}

/**
 * Audience binding for a single dedicated AS + single resource (NEU-882 / ADR-0001).
 * Accepts a token whose `aud` matches the configured AUTH_AUDIENCE (NEU-833's static
 * client_id / resource binding) OR whose `aud`/`azp` is a `dyn$` DCR client id of the
 * trusted issuer. `iss` + signature over the trusted JWKS (already validated by jose)
 * prove the token was minted by the trusted AS for one of its registered clients; with
 * only one resource behind that AS this satisfies the MCP audience-MUST (confused-deputy
 * requires a multi-resource AS, which this topology is not). A token with an unrelated
 * `aud`, or none at all with no `dyn$` `azp`, is rejected.
 */
function audienceMatches(
  aud: string | string[] | undefined,
  azp: string | undefined,
  expectedAudience: string
): boolean {
  const auds = typeof aud === 'string' ? [aud] : Array.isArray(aud) ? aud : [];
  if (auds.includes(expectedAudience)) return true;
  if (auds.some(isDynClientId)) return true;
  // Fall back to azp only when the token carries no aud claim at all, so an explicit
  // non-matching aud is never overridden by the authorized-party client id.
  if (auds.length === 0 && azp !== undefined && isDynClientId(azp)) return true;
  return false;
}

export async function createJwtMiddleware(authConfig: AuthConfig): Promise<RequestHandler> {
  const issuer = authConfig.issuer.replace(/\/+$/, '');
  const jwksUri = await discoverJwksUri(issuer);
  const jwks = createRemoteJWKSet(new URL(jwksUri));
  const prmUrl = new URL('/.well-known/oauth-protected-resource/mcp', authConfig.audience).href;
  // Accept the token's `iss` whether or not it carries a trailing slash (NEU-882):
  // Rauthy advertises and mints `iss` with a trailing slash, but AUTH_ISSUER may be
  // configured either way. jose exact-matches the token against each candidate, so any
  // other issuer is still rejected (and its signature would fail the trusted JWKS anyway).
  const allowedIssuers = [issuer, `${issuer}/`];

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
      // Audience is enforced explicitly below (accepts dyn$ DCR ids), so it is not passed
      // to jose here. jose still validates the signature, `exp`/`nbf`, and the issuer.
      const { payload } = await jwtVerify(token, jwks, { issuer: allowedIssuers });

      // For client_credentials grants, Rauthy sets sub=null and uses azp for the client identity
      const azp = typeof payload.azp === 'string' ? payload.azp : undefined;

      if (!audienceMatches(payload.aud, azp, authConfig.audience)) {
        return reply401(res, prmUrl);
      }

      const subject = (typeof payload.sub === 'string' && payload.sub) || azp || undefined;

      if (!subject) {
        return reply401(res, prmUrl);
      }

      res.locals.auth = {
        sub: subject,
        email: typeof payload.email === 'string' ? payload.email : undefined,
      };
      next();
    } catch {
      return reply401(res, prmUrl);
    }
  };
}

function reply401(res: Parameters<RequestHandler>[1], prmUrl: string): void {
  const challenge = `Bearer resource_metadata="${prmUrl}"`;
  res.setHeader('WWW-Authenticate', challenge).status(401).json({ error: 'Unauthorized' }).end();
}
