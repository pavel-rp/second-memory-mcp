import { describe, it, expect } from 'vitest';
import { extractErrorMessage, isPgUniqueViolation } from '../../../src/shared/errors.js';

describe('extractErrorMessage', () => {
  it('extracts message from Error instance', () => {
    expect(extractErrorMessage(new Error('test error'))).toBe('test error');
  });

  it('extracts message from Error subclasses', () => {
    expect(extractErrorMessage(new TypeError('type err'))).toBe('type err');
    expect(extractErrorMessage(new RangeError('range err'))).toBe('range err');
  });

  it('returns fallback for string', () => {
    expect(extractErrorMessage('oops')).toBe('Unknown error occurred');
  });

  it('returns fallback for null', () => {
    expect(extractErrorMessage(null)).toBe('Unknown error occurred');
  });

  it('returns fallback for undefined', () => {
    expect(extractErrorMessage(undefined)).toBe('Unknown error occurred');
  });

  it('returns fallback for number', () => {
    expect(extractErrorMessage(42)).toBe('Unknown error occurred');
  });

  it('returns fallback for plain object', () => {
    expect(extractErrorMessage({ message: 'not an error' })).toBe('Unknown error occurred');
  });
});

describe('isPgUniqueViolation', () => {
  function makePgError(code: string, constraint: string): Error {
    const err = new Error('duplicate key value violates unique constraint');
    (err as Error & { code: string }).code = code;
    (err as Error & { constraint: string }).constraint = constraint;
    return err;
  }

  it('returns true for matching code and constraint', () => {
    expect(isPgUniqueViolation(makePgError('23505', 'uq_foo'), 'uq_foo')).toBe(true);
  });

  it('returns false for different constraint', () => {
    expect(isPgUniqueViolation(makePgError('23505', 'uq_bar'), 'uq_foo')).toBe(false);
  });

  it('returns false for non-23505 code', () => {
    expect(isPgUniqueViolation(makePgError('23503', 'uq_foo'), 'uq_foo')).toBe(false);
  });

  it('returns false for plain Error without code/constraint', () => {
    expect(isPgUniqueViolation(new Error('boom'), 'uq_foo')).toBe(false);
  });

  it('returns false for non-Error values', () => {
    expect(isPgUniqueViolation('string error', 'uq_foo')).toBe(false);
    expect(isPgUniqueViolation(null, 'uq_foo')).toBe(false);
    expect(isPgUniqueViolation(undefined, 'uq_foo')).toBe(false);
  });

  it('returns true when the violation is wrapped in a cause chain (e.g. a DrizzleQueryError)', () => {
    const wrapped = new Error('Failed query: insert into "x" ...');
    (wrapped as Error & { cause: unknown }).cause = makePgError('23505', 'uq_foo');
    expect(isPgUniqueViolation(wrapped, 'uq_foo')).toBe(true);
  });

  it('returns false when a wrapped cause has a different constraint', () => {
    const wrapped = new Error('Failed query: ...');
    (wrapped as Error & { cause: unknown }).cause = makePgError('23505', 'uq_bar');
    expect(isPgUniqueViolation(wrapped, 'uq_foo')).toBe(false);
  });
});
