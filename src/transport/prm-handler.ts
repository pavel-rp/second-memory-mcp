import type { RequestHandler } from 'express';
import type { AuthConfig } from '../config/resolve-auth-config.js';

export function createPrmHandler(authConfig: AuthConfig): RequestHandler {
  const document = {
    resource: authConfig.audience,
    authorization_servers: [authConfig.issuer],
    scopes_supported: ['openid', 'profile', 'email'],
    bearer_methods_supported: ['header'],
  };

  return (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).type('text/plain').send('Method not allowed');
      return;
    }
    res.status(200).json(document);
  };
}
