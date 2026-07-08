import { describe, it, expect } from 'vitest';
import { extractErrorMessage, toolError, toolData } from '../../../src/server/tool-helpers.js';
import { parseResult } from '../../helpers/capture-server.js';

describe('tool-helpers', () => {
  describe('extractErrorMessage', () => {
    it('extracts message from Error instances', () => {
      expect(extractErrorMessage(new Error('test error'))).toBe('test error');
    });

    it('returns fallback for non-Error values', () => {
      expect(extractErrorMessage('string')).toBe('Unknown error occurred');
      expect(extractErrorMessage(42)).toBe('Unknown error occurred');
      expect(extractErrorMessage(null)).toBe('Unknown error occurred');
      expect(extractErrorMessage(undefined)).toBe('Unknown error occurred');
    });
  });

  describe('toolError', () => {
    it('returns structured error response', () => {
      const result = toolError('Something failed', {
        type: 'database',
        message: 'DB connection lost',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.message).toBe('DB connection lost');
      expect(parsed.error.retryable).toBe(false);
    });

    it('flags the MCP result with isError: true', () => {
      const result = toolError('Something failed', {
        type: 'database',
        message: 'DB connection lost',
      });

      expect(result.isError).toBe(true);
    });

    it('sets isError: true even for content_quality errors carrying findings', () => {
      const result = toolError('blocked', {
        type: 'content_quality',
        message: 'blocked',
        retryable: false,
        findings: [{ chunk_id: 'c1', rule: 'no-empty' }],
      });

      expect(result.isError).toBe(true);
    });

    it('includes retryable flag when provided', () => {
      const result = toolError('Retry me', {
        type: 'system',
        message: 'Timeout',
        retryable: true,
      });
      const parsed = parseResult(result);

      expect(parsed.error.retryable).toBe(true);
    });

    it('defaults retryable to false when not provided', () => {
      const result = toolError('No retry', {
        type: 'computation',
        message: 'Bad math',
      });
      const parsed = parseResult(result);

      expect(parsed.error.retryable).toBe(false);
    });

    it('includes retryable false when explicitly set', () => {
      const result = toolError('No retry', {
        type: 'session',
        message: 'Not found',
        retryable: false,
      });
      const parsed = parseResult(result);

      expect(parsed.error.retryable).toBe(false);
    });

    it('includes findings in the serialized error when provided', () => {
      const result = toolError('blocked', {
        type: 'content_quality',
        message: 'blocked',
        retryable: false,
        findings: [{ chunk_id: 'c1', rule: 'no-empty' }],
      });
      const parsed = parseResult(result);

      expect(parsed.error.type).toBe('content_quality');
      expect(parsed.error.findings).toEqual([{ chunk_id: 'c1', rule: 'no-empty' }]);
    });

    it('drops non-serializable findings and emits a plain envelope', () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      const result = toolError('blocked', {
        type: 'content_quality',
        message: 'blocked',
        retryable: false,
        findings: circular,
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('content_quality');
      expect(parsed.error.message).toBe('blocked');
      expect(parsed.error.retryable).toBe(false);
      expect(parsed.error.findings).toBeUndefined();
    });

    it('maps legacy error types to API error types', () => {
      const mappings: Array<[string, string]> = [
        ['database', 'internal'],
        ['session', 'internal'],
        ['computation', 'internal'],
        ['auth', 'internal'],
        ['system', 'internal'],
        ['recommendation', 'internal'],
        ['generation', 'internal'],
        ['validation', 'validation'],
        ['not_found', 'not_found'],
        ['conflict', 'conflict'],
      ];
      for (const [input, expected] of mappings) {
        const result = toolError('msg', { type: input as any, message: 'test' });
        const parsed = parseResult(result);
        expect(parsed.error.type).toBe(expected);
      }
    });
  });

  describe('toolData', () => {
    it('wraps data in success envelope', () => {
      const result = toolData({ foo: 'bar', num: 42 });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.foo).toBe('bar');
      expect(parsed.data.num).toBe(42);
    });

    it('handles arrays inside envelope', () => {
      const result = toolData([1, 2, 3]);
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data).toEqual([1, 2, 3]);
    });

    it('returns error response for circular references', () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      const result = toolData(circular);
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
    });
  });

  // Full-shape `toEqual` assertions lock the envelope contract: any future
  // rename (status → result, data → payload, error.type → error.kind, …)
  // breaks `pnpm test:unit` before the drift can reach CD. See NEU-604.
  describe('envelope contract', () => {
    it('toolData emits exactly { status: "ok", data }', () => {
      expect(parseResult(toolData({ foo: 1 }))).toEqual({
        status: 'ok',
        data: { foo: 1 },
      });
    });

    it('toolError emits exactly { status: "error", error: { type, message, retryable } } and flags isError', () => {
      const result = toolError('oops', { type: 'not_found', message: 'gone', retryable: false });
      expect(result.isError).toBe(true);
      expect(parseResult(result)).toEqual({
        status: 'error',
        error: { type: 'not_found', message: 'gone', retryable: false },
      });
    });
  });
});
