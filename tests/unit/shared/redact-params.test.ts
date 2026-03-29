import { describe, it, expect } from 'vitest';
import { redactParams } from '../../../src/shared/redact-params.js';

describe('redactParams', () => {
  it('returns null as-is', () => {
    expect(redactParams(null)).toBeNull();
  });

  it('returns undefined as-is', () => {
    expect(redactParams(undefined)).toBeUndefined();
  });

  it('returns primitive values as-is', () => {
    expect(redactParams('hello')).toBe('hello');
    expect(redactParams(42)).toBe(42);
    expect(redactParams(true)).toBe(true);
  });

  it('redacts sensitive keys in a flat object', () => {
    const input = { token: 'abc', name: 'test' };
    expect(redactParams(input)).toEqual({ token: '[REDACTED]', name: 'test' });
  });

  it('redacts multiple sensitive key patterns', () => {
    const input = {
      authorization: 'Bearer xxx',
      secret: 's3cret',
      password: 'p@ss',
      api_key: 'key-123',
      apiKey: 'key-456',
      token: 'tok',
      safe: 'value',
    };
    expect(redactParams(input)).toEqual({
      authorization: '[REDACTED]',
      secret: '[REDACTED]',
      password: '[REDACTED]',
      api_key: '[REDACTED]',
      apiKey: '[REDACTED]',
      token: '[REDACTED]',
      safe: 'value',
    });
  });

  it('is case-insensitive for key matching', () => {
    const input = { TOKEN: 'abc', Authorization: 'Bearer x', SECRET: 's' };
    expect(redactParams(input)).toEqual({
      TOKEN: '[REDACTED]',
      Authorization: '[REDACTED]',
      SECRET: '[REDACTED]',
    });
  });

  it('recurses into nested objects', () => {
    const input = { outer: { token: 'abc', safe: 'ok' } };
    expect(redactParams(input)).toEqual({ outer: { token: '[REDACTED]', safe: 'ok' } });
  });

  it('recurses into arrays containing objects', () => {
    const input = [{ password: 'p1' }, { name: 'test' }];
    expect(redactParams(input)).toEqual([{ password: '[REDACTED]' }, { name: 'test' }]);
  });

  it('handles deeply nested structures', () => {
    const input = { a: { b: { c: { secret: 'deep' } } } };
    expect(redactParams(input)).toEqual({ a: { b: { c: { secret: '[REDACTED]' } } } });
  });

  it('preserves non-sensitive fields unchanged', () => {
    const input = { chunk_id: '123', topic_name: 'math', score: 0.95 };
    expect(redactParams(input)).toEqual({ chunk_id: '123', topic_name: 'math', score: 0.95 });
  });

  it('handles arrays of primitives', () => {
    const input = [1, 'hello', true];
    expect(redactParams(input)).toEqual([1, 'hello', true]);
  });

  it('handles empty objects and arrays', () => {
    expect(redactParams({})).toEqual({});
    expect(redactParams([])).toEqual([]);
  });
});
