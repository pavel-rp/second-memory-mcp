import type { RequestHandler, Request, Response } from 'express';
import type pino from 'pino';

interface JsonRpcRequest {
  jsonrpc?: string;
  method?: string;
  id?: string | number | null;
  params?: unknown;
}

/** Cap response capture to prevent unbounded memory growth on long-lived SSE connections. */
const MAX_CAPTURE_BYTES = 65_536;

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
    const chunks: (Buffer | Uint8Array)[] = [];
    let capturedBytes = 0;
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    function pushChunk(data: Buffer | Uint8Array): void {
      if (capturedBytes >= MAX_CAPTURE_BYTES) return;
      const remaining = MAX_CAPTURE_BYTES - capturedBytes;
      const slice = data.length > remaining ? data.subarray(0, remaining) : data;
      chunks.push(slice);
      capturedBytes += slice.length;
    }

    res.write = function captureWrite(
      chunk: unknown,
      encodingOrCallback?: BufferEncoding | ((error: Error | null | undefined) => void),
      callback?: (error: Error | null | undefined) => void
    ): boolean {
      if (chunk != null) {
        if (chunk instanceof Uint8Array) {
          pushChunk(chunk);
        } else if (typeof chunk === 'string') {
          const encoding = typeof encodingOrCallback === 'string' ? encodingOrCallback : 'utf8';
          pushChunk(Buffer.from(chunk, encoding));
        }
      }
      if (typeof encodingOrCallback === 'function') {
        return originalWrite(chunk, encodingOrCallback);
      }
      return originalWrite(chunk, encodingOrCallback as BufferEncoding, callback);
    } as typeof res.write;

    res.end = function captureEnd(
      chunk?: unknown,
      encodingOrCallback?: BufferEncoding | (() => void),
      callback?: () => void
    ): Response {
      if (chunk != null) {
        if (chunk instanceof Uint8Array) {
          pushChunk(chunk);
        } else if (typeof chunk === 'string') {
          const encoding = typeof encodingOrCallback === 'string' ? encodingOrCallback : 'utf8';
          pushChunk(Buffer.from(chunk, encoding));
        }
      }

      // Calculate duration
      const endHrTime = process.hrtime.bigint();
      const durationMs = Number((endHrTime - startHrTime) / 1_000_000n);

      // Skip logging for non-RPC requests (SSE stream connections)
      if (method) {
        const responseBody = Buffer.concat(chunks).toString('utf8');

        auditLogger.info({
          module: 'mcp-audit',
          method,
          rpcId,
          params,
          responseStatus: res.statusCode,
          responseBody,
          durationMs,
        });
      }

      // Call original end
      if (typeof encodingOrCallback === 'function') {
        return originalEnd(chunk, encodingOrCallback) as unknown as Response;
      }
      return originalEnd(
        chunk,
        encodingOrCallback as BufferEncoding,
        callback
      ) as unknown as Response;
    } as typeof res.end;

    next();
  };
}

export { MAX_CAPTURE_BYTES };
