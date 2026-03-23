import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import {
  createAuditMiddleware,
  MAX_CAPTURE_BYTES,
} from '../../../src/transport/audit-middleware.js';
import type pino from 'pino';

function createMockLogger(): pino.Logger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(),
  } as unknown as pino.Logger;
}

function createMockReq(body?: unknown): Request {
  return {
    body,
    method: 'POST',
    url: '/mcp',
  } as Request;
}

function createMockRes(): Response {
  const res = {
    statusCode: 200,
    write: vi.fn(() => true),
    end: vi.fn(),
  } as unknown as Response;
  return res;
}

describe('audit-middleware', () => {
  let auditLogger: pino.Logger;
  let next: ReturnType<typeof vi.fn<(err?: unknown) => void>>;

  beforeEach(() => {
    auditLogger = createMockLogger();
    next = vi.fn<(err?: unknown) => void>();
  });

  it('captures JSON-RPC method, id, and params from request body', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({
      jsonrpc: '2.0',
      method: 'tools/call',
      id: 'req-1',
      params: { name: 'get_server_info' },
    });
    const res = createMockRes();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();

    // Trigger res.end to emit the log entry
    res.end('{"jsonrpc":"2.0","result":{}}');

    expect(auditLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        module: 'mcp-audit',
        method: 'tools/call',
        rpcId: 'req-1',
        params: { name: 'get_server_info' },
      })
    );
  });

  it('captures response status code and body via patched res.end', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'tools/list', id: 2 });
    const res = createMockRes();
    res.statusCode = 200;

    middleware(req, res, next);

    const responseBody = '{"jsonrpc":"2.0","result":{"tools":[]}}';
    res.end(responseBody);

    expect(auditLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        responseStatus: 200,
        responseBody,
      })
    );
  });

  it('computes duration_ms between request start and response end', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);
    res.end('{}');

    const logCall = (auditLogger.info as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(typeof logCall.durationMs).toBe('number');
    expect(logCall.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('passes through to next middleware without blocking', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('handles numeric rpc_id by converting to string', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'tools/call', id: 42 });
    const res = createMockRes();

    middleware(req, res, next);
    res.end('{}');

    expect(auditLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        rpcId: '42',
      })
    );
  });

  it('handles missing body gracefully', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq(undefined);
    const res = createMockRes();

    middleware(req, res, next);
    res.end('{}');

    expect(auditLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        module: 'mcp-audit',
        method: undefined,
        rpcId: undefined,
        params: undefined,
      })
    );
  });

  it('handles null rpc_id', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'notifications/initialized', id: null });
    const res = createMockRes();

    middleware(req, res, next);
    res.end('{}');

    expect(auditLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        rpcId: undefined,
      })
    );
  });

  it('captures Buffer response body', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);
    res.end(Buffer.from('{"result":"ok"}'));

    expect(auditLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        responseBody: '{"result":"ok"}',
      })
    );
  });

  it('handles res.end called with encoding callback', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);
    const callback = vi.fn();
    res.end('{"ok":true}', callback);

    expect(auditLogger.info).toHaveBeenCalled();
  });

  it('captures SSE response body from res.write chunks', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'tools/call', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);

    // Simulate SSE: multiple write calls then end with no args
    res.write('event: message\n');
    res.write('data: {"jsonrpc":"2.0","result":{}}\n\n');
    res.end();

    expect(auditLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        responseBody: 'event: message\ndata: {"jsonrpc":"2.0","result":{}}\n\n',
      })
    );
  });

  it('captures Buffer chunks from res.write', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);
    res.write(Buffer.from('chunk1'));
    res.write(Buffer.from('chunk2'));
    res.end();

    expect(auditLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        responseBody: 'chunk1chunk2',
      })
    );
  });

  it('handles res.write with callback function', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);
    const cb = vi.fn();
    res.write('data', cb);
    res.end();

    expect(auditLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        responseBody: 'data',
      })
    );
  });

  it('handles null chunk in res.write without capturing', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);
    res.write(null as unknown as string);
    res.end();

    expect(auditLogger.info).toHaveBeenCalledWith(expect.objectContaining({ responseBody: '' }));
  });

  it('skips non-string non-Buffer chunk in res.write', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);
    res.write(12345 as unknown as string);
    res.end();

    expect(auditLogger.info).toHaveBeenCalledWith(expect.objectContaining({ responseBody: '' }));
  });

  it('skips non-string non-Buffer chunk in res.end', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);
    res.end(12345 as unknown as string);

    expect(auditLogger.info).toHaveBeenCalledWith(expect.objectContaining({ responseBody: '' }));
  });

  it('captures string chunk with explicit encoding in res.write', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);
    res.write('encoded-data', 'utf8');
    res.end();

    expect(auditLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ responseBody: 'encoded-data' })
    );
  });

  it('caps response capture at MAX_CAPTURE_BYTES', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);

    // Write more than MAX_CAPTURE_BYTES across multiple chunks
    const chunkSize = 1024;
    const totalChunks = Math.ceil(MAX_CAPTURE_BYTES / chunkSize) + 10;
    for (let i = 0; i < totalChunks; i++) {
      res.write('x'.repeat(chunkSize));
    }
    res.end();

    const logCall = (auditLogger.info as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect((logCall.responseBody as string).length).toBeLessThanOrEqual(MAX_CAPTURE_BYTES);
  });

  it('captures string chunk with explicit encoding in res.end', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);
    res.end('final-data', 'utf8');

    expect(auditLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ responseBody: 'final-data' })
    );
  });

  it('emits audit log when res.end is called with no arguments', () => {
    const middleware = createAuditMiddleware(auditLogger);
    const req = createMockReq({ jsonrpc: '2.0', method: 'test', id: 1 });
    const res = createMockRes();

    middleware(req, res, next);
    res.end();

    expect(auditLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        module: 'mcp-audit',
        responseBody: '',
        responseStatus: 200,
      })
    );
  });
});
