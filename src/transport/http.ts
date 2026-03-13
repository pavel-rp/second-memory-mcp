import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { type Request, type Response, type NextFunction, type RequestHandler } from 'express';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../shared/logger.js';
import { getServerInfo } from '../shared/version.js';
import type { TransportConfig } from '../config/resolve-transport-config.js';
import type { AuthConfig } from '../config/resolve-auth-config.js';
import { createJwtMiddleware } from './jwt-middleware.js';
import { createPrmHandler } from './prm-handler.js';

/** Standard JSON-RPC 2.0 error codes. */
const JSON_RPC_INVALID_REQUEST = -32600;
const JSON_RPC_PARSE_ERROR = -32700;
const JSON_RPC_INTERNAL_ERROR = -32603;
const JSON_RPC_SERVER_ERROR = -32000;

export interface SessionIdentity {
  sub: string;
  email?: string;
}

export interface HttpTransportHandle {
  close: () => Promise<void>;
  port: number;
}

function getSessionId(req: Request): string | undefined {
  const raw = req.headers['mcp-session-id'];
  return typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
}

/**
 * Verify that the current request's authenticated subject matches the session owner.
 * Returns true if the request may proceed, false if a 403 was sent.
 * Sessions without stored identity (no auth) always pass.
 */
function verifySessionBinding(
  sessionIdentity: Map<string, SessionIdentity>,
  sessionId: string,
  res: Response
): boolean {
  const bound = sessionIdentity.get(sessionId);
  if (!bound) return true; // no-auth session
  const current = res.locals.auth as SessionIdentity | undefined;
  if (current && current.sub !== bound.sub) {
    res.status(403).json({
      jsonrpc: '2.0',
      error: {
        code: JSON_RPC_SERVER_ERROR,
        message: 'Forbidden: session bound to a different subject',
      },
      id: null,
    });
    return false;
  }
  return true;
}

export async function startHttpTransport(
  config: TransportConfig,
  createMcpServer: () => McpServer,
  authConfig?: AuthConfig | null
): Promise<HttpTransportHandle> {
  const transports = new Map<string, StreamableHTTPServerTransport>();
  const sessionIdentity = new Map<string, SessionIdentity>();
  const app = createMcpExpressApp({ host: config.httpHost });

  // Public endpoints — no auth required
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/version', (_req, res) => res.json(getServerInfo()));

  // PRM endpoint (before /mcp, only when auth is enabled)
  if (authConfig) {
    app.all('/.well-known/oauth-protected-resource/mcp', createPrmHandler(authConfig));
  }

  // CORS
  app.use('/mcp', (req, res, next) => {
    if (authConfig && !authConfig.corsAllowedOrigins.includes('*')) {
      const origin = req.headers.origin;
      if (origin && authConfig.corsAllowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
      }
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id, Authorization');
    res.setHeader(
      'Access-Control-Expose-Headers',
      authConfig ? 'mcp-session-id, WWW-Authenticate' : 'mcp-session-id'
    );
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // JWT middleware (after CORS, before route handlers — only when auth is enabled)
  if (authConfig) {
    app.use('/mcp', await createJwtMiddleware(authConfig));
  }

  // POST /mcp
  app.post('/mcp', async (req, res) => {
    const sessionId = getSessionId(req);
    const body = req.body as unknown;

    const existing = sessionId ? transports.get(sessionId) : undefined;
    if (existing && sessionId) {
      if (!verifySessionBinding(sessionIdentity, sessionId, res)) return;
      await existing.handleRequest(req, res, body);
      return;
    }

    if (isInitializeRequest(body)) {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid: string) => {
          transports.set(sid, transport);
          const auth = res.locals.auth as SessionIdentity | undefined;
          if (auth) {
            sessionIdentity.set(sid, auth);
          }
        },
      });
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid) {
          transports.delete(sid);
          sessionIdentity.delete(sid);
        }
      };

      const server = createMcpServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
      return;
    }

    if (sessionId) {
      // Stale or unknown session ID — 404 lets clients know to re-initialize
      res.status(404).json({
        jsonrpc: '2.0',
        error: { code: JSON_RPC_SERVER_ERROR, message: 'Session not found' },
        id: null,
      });
    } else {
      // No session header and not an initialize request — bad request
      res.status(400).json({
        jsonrpc: '2.0',
        error: { code: JSON_RPC_INVALID_REQUEST, message: 'Missing session ID' },
        id: null,
      });
    }
  });

  // GET/DELETE /mcp — session-bound
  const sessionHandler: RequestHandler = async (req, res) => {
    const sid = getSessionId(req) ?? '';
    const transport = transports.get(sid);
    if (!transport) {
      res.status(400).type('text/plain').send('Invalid or missing session ID');
      return;
    }
    if (!verifySessionBinding(sessionIdentity, sid, res)) return;
    await transport.handleRequest(req, res);
  };
  app.get('/mcp', sessionHandler);
  app.delete('/mcp', sessionHandler);

  app.all('/mcp', (_req, res) => res.status(405).type('text/plain').send('Method not allowed'));
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  // Error handler — maps body-parser errors to JSON-RPC format
  app.use(
    (
      err: Error & { status?: number; type?: string },
      _req: Request,
      res: Response,
      _next: NextFunction
    ) => {
      logger.error('Error handling MCP HTTP request:', err);
      if (res.headersSent) return;
      const [statusCode, errorCode, message] =
        err.status === 413
          ? ([413, JSON_RPC_INVALID_REQUEST, 'Request body exceeds limit'] as const)
          : err.type === 'entity.parse.failed'
            ? ([400, JSON_RPC_PARSE_ERROR, 'Invalid JSON in request body'] as const)
            : ([err.status ?? 500, JSON_RPC_INTERNAL_ERROR, 'Internal server error'] as const);
      res
        .status(statusCode)
        .json({ jsonrpc: '2.0', error: { code: errorCode, message }, id: null });
    }
  );

  const httpServer = createServer(app);

  await new Promise<void>((resolve, reject) => {
    const onError = (err: Error) => reject(err);
    httpServer.once('error', onError);
    httpServer.listen(config.httpPort, config.httpHost, () => {
      httpServer.removeListener('error', onError);
      const addr = httpServer.address();
      const boundPort = typeof addr === 'object' && addr ? addr.port : config.httpPort;
      logger.info(
        `MCP Streamable HTTP server listening on http://${config.httpHost}:${boundPort}/mcp`
      );
      resolve();
    });
  });

  // Graceful shutdown
  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info('Shutting down HTTP server...');
    for (const [sid, transport] of transports) {
      try {
        await transport.close();
        transports.delete(sid);
        sessionIdentity.delete(sid);
      } catch (error) {
        logger.error(`Error closing transport for session ${sid}:`, error);
      }
    }
    await new Promise<void>((resolve, reject) => {
      httpServer.close(err => (err ? reject(err) : resolve()));
    });
  };

  const onSignal = () =>
    void shutdown()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);

  const addr = httpServer.address();
  const actualPort = typeof addr === 'object' && addr ? addr.port : config.httpPort;

  return {
    close: async () => {
      process.removeListener('SIGINT', onSignal);
      process.removeListener('SIGTERM', onSignal);
      await shutdown();
    },
    port: actualPort,
  };
}
