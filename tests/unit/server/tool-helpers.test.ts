import { describe, it, expect } from 'vitest';
import {
  extractErrorMessage,
  toolError,
  toolOk,
  toolJson,
  toolData,
} from '../../../src/server/tool-helpers.js';
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

  describe('toolOk', () => {
    it('returns structured success response with envelope', () => {
      const result = toolOk('All good');
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.message).toBe('All good');
    });

    it('merges additional data into response envelope', () => {
      const result = toolOk('Created', { id: '123', count: 5 });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('ok');
      expect(parsed.data.message).toBe('Created');
      expect(parsed.data.id).toBe('123');
      expect(parsed.data.count).toBe(5);
    });
  });

  describe('toolJson', () => {
    it('serialises arbitrary data without envelope', () => {
      const result = toolJson({ foo: 'bar', num: 42 });
      const parsed = parseResult(result);

      expect(parsed.foo).toBe('bar');
      expect(parsed.num).toBe(42);
    });

    it('handles arrays', () => {
      const result = toolJson([1, 2, 3]);
      const parsed = parseResult(result);

      expect(parsed).toEqual([1, 2, 3]);
    });

    it('returns error response for circular references', () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      const result = toolJson(circular);
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
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
});
