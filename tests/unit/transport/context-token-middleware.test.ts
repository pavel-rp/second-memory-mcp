import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { createContextTokenMiddleware } from '../../../src/transport/context-token-middleware.js';
import type { ContextTokenRepository } from '../../../src/ports/context-token-repository.js';

vi.mock('../../../src/shared/logger.js', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

function makeRepo(validateResult: { valid: boolean; expired: boolean }): ContextTokenRepository {
  return {
    create: vi.fn(),
    validate: vi.fn(),
    validateWithStatus: vi.fn().mockResolvedValue(validateResult),
    delete: vi.fn(),
    deleteExpired: vi.fn(),
  } as unknown as ContextTokenRepository;
}

function makeReq(body: unknown): Request {
  return { body } as unknown as Request;
}

function makeRes(): { res: Response; jsonSpy: ReturnType<typeof vi.fn> } {
  const jsonSpy = vi.fn();
  return { res: { json: jsonSpy } as unknown as Response, jsonSpy };
}

describe('createContextTokenMiddleware', () => {
  let next: ReturnType<typeof vi.fn<(err?: unknown) => void>>;

  beforeEach(() => {
    next = vi.fn<(err?: unknown) => void>();
  });

  describe('pass-through cases', () => {
    it('calls next() for non-tools/call method', async () => {
      const { res, jsonSpy } = makeRes();
      const mw = createContextTokenMiddleware(makeRepo({ valid: true, expired: false }));

      await mw(makeReq({ jsonrpc: '2.0', method: 'initialize', id: 1 }), res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(jsonSpy).not.toHaveBeenCalled();
    });

    it('calls next() when body is absent', async () => {
      const { res, jsonSpy } = makeRes();
      const mw = createContextTokenMiddleware(makeRepo({ valid: true, expired: false }));

      await mw(makeReq(undefined), res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(jsonSpy).not.toHaveBeenCalled();
    });

    it('calls next() for excluded tool init_agent_context', async () => {
      const { res } = makeRes();
      const mw = createContextTokenMiddleware(makeRepo({ valid: false, expired: false }));

      await mw(
        makeReq({ method: 'tools/call', params: { name: 'init_agent_context', arguments: {} } }),
        res,
        next
      );

      expect(next).toHaveBeenCalledOnce();
    });

    it('calls next() for excluded tool get_server_info', async () => {
      const { res } = makeRes();
      const mw = createContextTokenMiddleware(makeRepo({ valid: false, expired: false }));

      await mw(
        makeReq({ method: 'tools/call', params: { name: 'get_server_info', arguments: {} } }),
        res,
        next
      );

      expect(next).toHaveBeenCalledOnce();
    });

    it('calls next() for excluded tool get_server_workflow', async () => {
      const { res } = makeRes();
      const mw = createContextTokenMiddleware(makeRepo({ valid: false, expired: false }));

      await mw(
        makeReq({ method: 'tools/call', params: { name: 'get_server_workflow', arguments: {} } }),
        res,
        next
      );

      expect(next).toHaveBeenCalledOnce();
    });

    it('calls next() when params.name is missing', async () => {
      const { res } = makeRes();
      const mw = createContextTokenMiddleware(makeRepo({ valid: false, expired: false }));

      await mw(makeReq({ method: 'tools/call', params: { arguments: {} } }), res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('calls next() for a valid token', async () => {
      const { res, jsonSpy } = makeRes();
      const mw = createContextTokenMiddleware(makeRepo({ valid: true, expired: false }));

      await mw(
        makeReq({
          method: 'tools/call',
          id: 5,
          params: { name: 'teach_next', arguments: { context_token: 'ctx-valid' } },
        }),
        res,
        next
      );

      expect(next).toHaveBeenCalledOnce();
      expect(jsonSpy).not.toHaveBeenCalled();
    });
  });

  describe('auth error: missing context_token', () => {
    it('returns isError response with auth type and retryable', async () => {
      const { res, jsonSpy } = makeRes();
      const mw = createContextTokenMiddleware(makeRepo({ valid: true, expired: false }));

      await mw(
        makeReq({
          method: 'tools/call',
          id: 42,
          params: { name: 'teach_next', arguments: {} },
        }),
        res,
        next
      );

      expect(next).not.toHaveBeenCalled();
      expect(jsonSpy).toHaveBeenCalledOnce();

      const response = jsonSpy.mock.calls[0][0] as {
        jsonrpc: string;
        id: unknown;
        result: { isError: boolean; content: { type: string; text: string }[] };
      };
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(42);
      expect(response.result.isError).toBe(true);

      const payload = JSON.parse(response.result.content[0].text) as {
        success: boolean;
        error: { type: string; retryable: boolean };
        message: string;
      };
      expect(payload.success).toBe(false);
      expect(payload.error.type).toBe('auth');
      expect(payload.error.retryable).toBe(true);
      expect(payload.message).toContain('init_agent_context');
    });

    it('uses null id when request id is absent', async () => {
      const { res, jsonSpy } = makeRes();
      const mw = createContextTokenMiddleware(makeRepo({ valid: true, expired: false }));

      await mw(
        makeReq({ method: 'tools/call', params: { name: 'teach_next', arguments: {} } }),
        res,
        next
      );

      const response = jsonSpy.mock.calls[0][0] as { id: unknown };
      expect(response.id).toBeNull();
    });

    it('preserves string request id', async () => {
      const { res, jsonSpy } = makeRes();
      const mw = createContextTokenMiddleware(makeRepo({ valid: true, expired: false }));

      await mw(
        makeReq({
          method: 'tools/call',
          id: 'req-abc',
          params: { name: 'teach_next', arguments: {} },
        }),
        res,
        next
      );

      const response = jsonSpy.mock.calls[0][0] as { id: unknown };
      expect(response.id).toBe('req-abc');
    });
  });

  describe('auth error: expired token', () => {
    it('returns isError response with expired message', async () => {
      const { res, jsonSpy } = makeRes();
      const mw = createContextTokenMiddleware(makeRepo({ valid: false, expired: true }));

      await mw(
        makeReq({
          method: 'tools/call',
          id: 1,
          params: { name: 'teach_next', arguments: { context_token: 'ctx-expired' } },
        }),
        res,
        next
      );

      expect(next).not.toHaveBeenCalled();
      const response = jsonSpy.mock.calls[0][0] as {
        result: { isError: boolean; content: { text: string }[] };
      };
      expect(response.result.isError).toBe(true);

      const payload = JSON.parse(response.result.content[0].text) as {
        error: { type: string; retryable: boolean };
        message: string;
      };
      expect(payload.error.type).toBe('auth');
      expect(payload.error.retryable).toBe(true);
      expect(payload.message).toMatch(/expired/i);
    });
  });

  describe('auth error: invalid token', () => {
    it('returns isError response for unknown token', async () => {
      const { res, jsonSpy } = makeRes();
      const mw = createContextTokenMiddleware(makeRepo({ valid: false, expired: false }));

      await mw(
        makeReq({
          method: 'tools/call',
          id: 1,
          params: { name: 'teach_next', arguments: { context_token: 'ctx-unknown' } },
        }),
        res,
        next
      );

      expect(next).not.toHaveBeenCalled();
      const response = jsonSpy.mock.calls[0][0] as {
        result: { isError: boolean; content: { text: string }[] };
      };
      expect(response.result.isError).toBe(true);

      const payload = JSON.parse(response.result.content[0].text) as {
        error: { type: string; retryable: boolean };
      };
      expect(payload.error.type).toBe('auth');
      expect(payload.error.retryable).toBe(true);
    });
  });

  describe('fail-open exception handling', () => {
    it('calls next() when validateWithStatus throws', async () => {
      const repo = {
        create: vi.fn(),
        validate: vi.fn(),
        validateWithStatus: vi.fn().mockRejectedValue(new Error('DB connection failed')),
        delete: vi.fn(),
        deleteExpired: vi.fn(),
      } as unknown as ContextTokenRepository;

      const { res, jsonSpy } = makeRes();
      const mw = createContextTokenMiddleware(repo);

      await mw(
        makeReq({
          method: 'tools/call',
          id: 1,
          params: { name: 'teach_next', arguments: { context_token: 'ctx-abc' } },
        }),
        res,
        next
      );

      expect(next).toHaveBeenCalledOnce();
      expect(jsonSpy).not.toHaveBeenCalled();
    });
  });
});
