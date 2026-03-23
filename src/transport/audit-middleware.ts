import type { RequestHandler, Request, Response } from 'express';
import type pino from 'pino';

interface JsonRpcRequest {
  jsonrpc?: string;
  method?: string;
  id?: string | number | null;
  params?: unknown;
}

/**
 * Creates Express middleware that captures JSON-RPC request/response data
 * for MCP audit logging.
 *
 * Emits structured pino log entries with module: 'mcp-audit' that are picked up
 * by the pg-audit-transport for batch insertion into infrastructure.mcp_request_log.
 */
export function createAuditMiddleware(auditLogger: pino.Logger): RequestHandler {
  return (req: Request, res: Response, next) => {
    const startHrTime = process.hrtime.bigint();

    // Extract JSON-RPC fields from parsed body
    const body = req.body as JsonRpcRequest | undefined;
    const method = body?.method;
    const rpcId = body?.id != null ? String(body.id) : undefined;
    const params = body?.params;

    // Intercept response body by patching both res.write and res.end.
    // MCP uses SSE (res.write for data frames, res.end to close), so we
    // must capture chunks from both methods.
    const chunks: Buffer[] = [];
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.write = function captureWrite(
      chunk: unknown,
      encodingOrCallback?: BufferEncoding | ((error: Error | null | undefined) => void),
      callback?: (error: Error | null | undefined) => void
    ): boolean {
      if (chunk != null) {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else if (typeof chunk === 'string') {
          const encoding = typeof encodingOrCallback === 'string' ? encodingOrCallback : 'utf8';
          chunks.push(Buffer.from(chunk, encoding));
        }
      }
      if (typeof encodingOrCallback === 'function') {
        return originalWrite(chunk, encodingOrCallback);
      }
      return originalWrite(chunk, encodingOrCallback, callback);
    } as typeof res.write;

    res.end = function captureEnd(
      chunk?: unknown,
      encodingOrCallback?: BufferEncoding | (() => void),
      callback?: () => void
    ): Response {
      if (chunk != null) {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else if (typeof chunk === 'string') {
          const encoding = typeof encodingOrCallback === 'string' ? encodingOrCallback : 'utf8';
          chunks.push(Buffer.from(chunk, encoding));
        }
      }

      // Calculate duration
      const endHrTime = process.hrtime.bigint();
      const durationMs = Number((endHrTime - startHrTime) / 1_000_000n);

      // Build response body string
      const responseBody = Buffer.concat(chunks).toString('utf8');

      // Emit structured audit log entry
      auditLogger.info({
        module: 'mcp-audit',
        method,
        rpcId,
        params,
        responseStatus: res.statusCode,
        responseBody,
        durationMs,
      });

      // Call original end
      if (typeof encodingOrCallback === 'function') {
        return originalEnd(chunk, encodingOrCallback) as unknown as Response;
      }
      return originalEnd(chunk, encodingOrCallback, callback) as unknown as Response;
    } as typeof res.end;

    next();
  };
}
