import { describe, it, expect } from 'vitest';
import {
  extractErrorMessage,
  toolError,
  toolOk,
  toolJson,
} from '../../../src/server/tool-helpers.js';

function parseResult(result: any) {
  return JSON.parse(result.content[0].text);
}

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

      expect(parsed.success).toBe(false);
      expect(parsed.message).toBe('Something failed');
      expect(parsed.error.type).toBe('database');
      expect(parsed.error.message).toBe('DB connection lost');
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

    it('omits retryable flag when not provided', () => {
      const result = toolError('No retry', {
        type: 'computation',
        message: 'Bad math',
      });
      const parsed = parseResult(result);

      expect(parsed.error).not.toHaveProperty('retryable');
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
  });

  describe('toolOk', () => {
    it('returns structured success response', () => {
      const result = toolOk('All good');
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.message).toBe('All good');
    });

    it('merges additional data into response', () => {
      const result = toolOk('Created', { id: '123', count: 5 });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(parsed.message).toBe('Created');
      expect(parsed.id).toBe('123');
      expect(parsed.count).toBe(5);
    });
  });

  describe('toolJson', () => {
    it('serialises arbitrary data', () => {
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

      expect(parsed.success).toBe(false);
      expect(parsed.message).toBe('Failed to serialise tool response payload');
    });
  });
});
