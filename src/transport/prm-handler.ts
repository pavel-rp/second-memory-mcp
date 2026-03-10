import type { RequestHandler } from 'express';
import type { AuthConfig } from '../config/resolve-auth-config.js';

export function createPrmHandler(authConfig: AuthConfig): RequestHandler {
  const document = {
    ...(authConfig.audience ? { resource: authConfig.audience } : {}),
    authorization_servers: [authConfig.issuer],
    scopes_supported: ['openid', 'profile', 'email'],
    bearer_methods_supported: ['header'],
  };

  return (req, res) => {
    // PRM is a public metadata document — allow cross-origin discovery
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    if (req.method !== 'GET') {
      res.status(405).type('text/plain').send('Method not allowed');
      return;
    }
    res.status(200).json(document);
  };
}
