import { describe, it, expect } from 'vitest';
import {
  parseNumber,
  parseRecord,
  parseBoolean,
  parseEnum,
  parseEmbeddingProvider,
  parseVerdictFieldList,
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

  it('returns empty object for empty string', () => {
    expect(parseRecord('')).toEqual({});
  });

  it('returns empty object for whitespace-only string', () => {
    expect(parseRecord('  ')).toEqual({});
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

  it('rejects JSON arrays and returns empty object', () => {
    expect(parseRecord('[1,2]')).toEqual({});
  });

  it('returns empty object for JSON null', () => {
    expect(parseRecord('null')).toEqual({});
  });

  it('returns empty object when JSON parses to a primitive number', () => {
    expect(parseRecord('1')).toEqual({});
  });

  it('returns empty object when JSON parses to a primitive boolean', () => {
    expect(parseRecord('true')).toEqual({});
  });

  it('returns empty object when JSON parses to a primitive string', () => {
    expect(parseRecord('"x"')).toEqual({});
  });

  it('skips non-numeric values in mixed object', () => {
    expect(parseRecord('{"a":1,"b":"nope","c":3}')).toEqual({ a: 1, c: 3 });
  });

  it('skips boolean values in object', () => {
    expect(parseRecord('{"a":1,"b":true,"c":false}')).toEqual({ a: 1 });
  });

  it('skips non-finite numeric values in object', () => {
    expect(parseRecord('{"a":1e309,"b":2}')).toEqual({ b: 2 });
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

  it('returns fallback for empty string', () => {
    expect(parseBoolean('', false)).toBe(false);
  });

  it('returns fallback for whitespace-only string', () => {
    expect(parseBoolean('  ', true)).toBe(true);
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

  it('returns fallback for undefined', () => {
    expect(parseEnum(undefined, allowed, 'openai')).toBe('openai');
  });

  it('returns fallback for whitespace-only string', () => {
    expect(parseEnum('  ', allowed, 'openai')).toBe('openai');
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

describe('parseVerdictFieldList', () => {
  it('returns an empty set for undefined', () => {
    expect(parseVerdictFieldList(undefined)).toEqual(new Set());
  });

  it('returns an empty set for empty string', () => {
    expect(parseVerdictFieldList('')).toEqual(new Set());
  });

  it('returns an empty set for whitespace-only string', () => {
    expect(parseVerdictFieldList('   ')).toEqual(new Set());
  });

  it('parses a single field by snake-case name', () => {
    expect(parseVerdictFieldList('rendering_clarity')).toEqual(new Set(['renderingClarity']));
  });

  it('parses a comma-separated list and trims whitespace', () => {
    expect(parseVerdictFieldList(' rendering_clarity , overall_fit ')).toEqual(
      new Set(['renderingClarity', 'overallFit'])
    );
  });

  it('skips empty entries from leading or trailing commas', () => {
    expect(parseVerdictFieldList(', rendering_clarity , ,')).toEqual(new Set(['renderingClarity']));
  });

  it('throws on unknown verdict-field names', () => {
    expect(() => parseVerdictFieldList('rendering_clarity, not_a_field')).toThrow(
      /CLASSIFIER_BLOCKING_FIELDS.*not_a_field/
    );
  });

  it('throws when only an unknown name is provided', () => {
    expect(() => parseVerdictFieldList('mystery_field')).toThrow(
      /CLASSIFIER_BLOCKING_FIELDS.*mystery_field/
    );
  });

  it('rejects camelCase input — operator-facing names are snake-case only', () => {
    expect(() => parseVerdictFieldList('renderingClarity')).toThrow(
      /CLASSIFIER_BLOCKING_FIELDS.*renderingClarity/
    );
  });
});
