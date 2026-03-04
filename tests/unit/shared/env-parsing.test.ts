import { describe, it, expect } from 'vitest';
import {
  parseNumber,
  parseRecord,
  parseBoolean,
  parseEnum,
  parseEmbeddingProvider,
} from '../../../src/shared/env-parsing.js';

describe('parseNumber', () => {
  it('returns fallback for undefined', () => {
    expect(parseNumber(undefined, 42)).toBe(42);
  });

  it('returns fallback for empty string', () => {
    expect(parseNumber('', 42)).toBe(42);
  });

  it('returns fallback for whitespace-only string', () => {
    expect(parseNumber('  ', 42)).toBe(42);
  });

  it('parses a valid number', () => {
    expect(parseNumber('7', 42)).toBe(7);
  });

  it('returns fallback for NaN', () => {
    expect(parseNumber('NaN', 42)).toBe(42);
  });

  it('returns fallback for Infinity', () => {
    expect(parseNumber('Infinity', 42)).toBe(42);
  });

  it('parses zero correctly (not treated as falsy)', () => {
    expect(parseNumber('0', 42)).toBe(0);
  });
});

describe('parseRecord', () => {
  it('returns empty object for undefined', () => {
    expect(parseRecord(undefined)).toEqual({});
  });

  it('parses valid JSON with numeric values', () => {
    expect(parseRecord('{"a":1.2,"b":0.8}')).toEqual({ a: 1.2, b: 0.8 });
  });

  it('parses string-encoded numbers', () => {
    expect(parseRecord('{"a":"3.5"}')).toEqual({ a: 3.5 });
  });

  it('returns empty object for invalid JSON', () => {
    expect(parseRecord('not json')).toEqual({});
  });

  it('extracts numeric entries from JSON array (no Array.isArray guard)', () => {
    expect(parseRecord('[1,2]')).toEqual({ '0': 1, '1': 2 });
  });

  it('returns empty object for JSON null', () => {
    expect(parseRecord('null')).toEqual({});
  });

  it('skips non-numeric values in mixed object', () => {
    expect(parseRecord('{"a":1,"b":"nope","c":3}')).toEqual({ a: 1, c: 3 });
  });
});

describe('parseBoolean', () => {
  it.each(['1', 'true', 'yes', 'on'])('returns true for "%s"', val => {
    expect(parseBoolean(val, false)).toBe(true);
  });

  it.each(['0', 'false', 'no', 'off'])('returns false for "%s"', val => {
    expect(parseBoolean(val, true)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(parseBoolean('TRUE', false)).toBe(true);
  });

  it('returns fallback for unrecognized value', () => {
    expect(parseBoolean('maybe', false)).toBe(false);
  });

  it('returns fallback for undefined', () => {
    expect(parseBoolean(undefined, true)).toBe(true);
  });
});

describe('parseEnum', () => {
  const allowed = ['openai', 'ollama'] as const;

  it('returns matching value', () => {
    expect(parseEnum('openai', allowed, 'openai')).toBe('openai');
  });

  it('matches case-insensitively', () => {
    expect(parseEnum('OLLAMA', allowed, 'openai')).toBe('ollama');
  });

  it('returns fallback for unknown value', () => {
    expect(parseEnum('unknown', allowed, 'openai')).toBe('openai');
  });
});

describe('parseEmbeddingProvider', () => {
  it('returns "openai" for "openai"', () => {
    expect(parseEmbeddingProvider('openai')).toBe('openai');
  });

  it('returns "ollama" for "OLLAMA" (case-insensitive)', () => {
    expect(parseEmbeddingProvider('OLLAMA')).toBe('ollama');
  });

  it('returns null for unsupported provider', () => {
    expect(parseEmbeddingProvider('azure')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(parseEmbeddingProvider(undefined)).toBeNull();
  });
});
