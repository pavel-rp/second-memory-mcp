import { describe, it, expect } from 'vitest';
import { extractErrorMessage } from '../../src/utils/errors.js';

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
