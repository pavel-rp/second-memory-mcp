import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../shared/logger.js';
import type { TransportConfig } from '../config/resolve-transport-config.js';

const MAX_BODY_BYTES = 1_048_576; // 1 MB

class ReadBodyError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
  }
}

/**
 * Start the HTTP transport for MCP Streamable HTTP/SSE.
 *
 * Each client session gets its own McpServer + transport pair (stateful mode).
 * The `createServer` factory is called per session so prompts/tools are registered fresh.
 */
export async function startHttpTransport(
  config: TransportConfig,
  createMcpServer: () => McpServer
): Promise<void> {
  const transports = new Map<string, StreamableHTTPServerTransport>();

  const httpServer = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

      if (url.pathname !== '/mcp') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
      }

      // CORS headers for cross-origin clients
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
      res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const sessionId = req.headers['mcp-session-id'] as string | undefined;

      if (req.method === 'POST') {
        const body = await readBody(req);

        const existingTransport = sessionId ? transports.get(sessionId) : undefined;
        if (existingTransport) {
          await existingTransport.handleRequest(req, res, body);
          return;
        }

        if (!sessionId && isInitializeRequest(body)) {
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sid: string) => {
              transports.set(sid, transport);
            },
          });

          transport.onclose = () => {
            const sid = transport.sessionId;
            if (sid) transports.delete(sid);
          };

          const server = createMcpServer();
          await server.connect(transport);
          await transport.handleRequest(req, res, body);
          return;
        }

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: { code: -32000, message: 'Bad Request: No valid session ID provided' },
            id: null,
          })
        );
        return;
      }

      if (req.method === 'GET' || req.method === 'DELETE') {
        const sessionTransport = sessionId ? transports.get(sessionId) : undefined;
        if (!sessionTransport) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid or missing session ID');
          return;
        }
        await sessionTransport.handleRequest(req, res);
        return;
      }

      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method not allowed');
    } catch (error) {
      logger.error('Error handling MCP HTTP request:', error);
      if (!res.headersSent) {
        const statusCode = error instanceof ReadBodyError ? error.statusCode : 500;
        const errorCode = error instanceof ReadBodyError ? -32700 : -32603;
        const message = error instanceof ReadBodyError ? error.message : 'Internal server error';
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: { code: errorCode, message },
            id: null,
          })
        );
      }
    }
  });

  await new Promise<void>((resolve, reject) => {
    httpServer.listen(config.httpPort, config.httpHost, () => {
      logger.info(
        `MCP Streamable HTTP server listening on http://${config.httpHost}:${config.httpPort}/mcp`
      );
      resolve();
    });
    httpServer.on('error', reject);
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down HTTP server...');
    for (const [sid, transport] of transports) {
      try {
        await transport.close();
        transports.delete(sid);
      } catch (error) {
        logger.error(`Error closing transport for session ${sid}:`, error);
      }
    }
    await new Promise<void>((resolve, reject) => {
      httpServer.close(err => (err ? reject(err) : resolve()));
    });
  };

  process.on('SIGINT', () => void shutdown().then(() => process.exit(0)));
  process.on('SIGTERM', () => void shutdown().then(() => process.exit(0)));
}

function readBody(req: import('node:http').IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let exceeded = false;
    req.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        exceeded = true;
        return;
      }
      if (!exceeded) chunks.push(chunk);
    });
    req.on('end', () => {
      if (exceeded) {
        reject(new ReadBodyError(413, `Request body exceeds ${MAX_BODY_BYTES} bytes`));
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(raw ? JSON.parse(raw) : undefined);
      } catch {
        reject(new ReadBodyError(400, 'Invalid JSON in request body'));
      }
    });
    req.on('error', reject);
  });
}
