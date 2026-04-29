import { describe, it, expect, vi, beforeEach } from 'vitest';

const warnSpy = vi.fn();

vi.mock('../../../src/shared/logger.js', () => ({
  getRequestLogger: () => ({
    warn: warnSpy,
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
  withRequestContext: <T>(_id: string, fn: () => T) => fn(),
  logEvent: vi.fn(),
}));

import { DEFAULT_CLASSIFIER_CONFIG } from '../../../src/domain/config/classifier-defaults.js';
import { resolveClassifierConfig } from '../../../src/config/resolve-classifier-config.js';

describe('resolveClassifierConfig', () => {
  beforeEach(() => {
    warnSpy.mockClear();
  });

  it('returns all defaults with empty env', () => {
    const result = resolveClassifierConfig({});

    expect(result.classifier).toEqual({
      ...DEFAULT_CLASSIFIER_CONFIG,
      provider: null,
      openaiApiKey: null,
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('resolves provider + CLASSIFIER_OPENAI_API_KEY', () => {
    const result = resolveClassifierConfig({
      CLASSIFIER_PROVIDER: 'openai',
      CLASSIFIER_OPENAI_API_KEY: 'sk-classifier',
    });

    expect(result.classifier.provider).toBe('openai');
    expect(result.classifier.openaiApiKey).toBe('sk-classifier');
  });

  it('falls back to OPENAI_API_KEY when CLASSIFIER_OPENAI_API_KEY is unset', () => {
    const result = resolveClassifierConfig({
      CLASSIFIER_PROVIDER: 'openai',
      OPENAI_API_KEY: 'sk-shared',
    });

    expect(result.classifier.openaiApiKey).toBe('sk-shared');
  });

  it('prefers CLASSIFIER_OPENAI_API_KEY when both keys are set', () => {
    const result = resolveClassifierConfig({
      CLASSIFIER_PROVIDER: 'openai',
      CLASSIFIER_OPENAI_API_KEY: 'sk-classifier',
      OPENAI_API_KEY: 'sk-shared',
    });

    expect(result.classifier.openaiApiKey).toBe('sk-classifier');
  });

  it('returns provider null for unknown provider string', () => {
    const result = resolveClassifierConfig({ CLASSIFIER_PROVIDER: 'anthropic' });

    expect(result.classifier.provider).toBeNull();
  });

  it('returns provider null for empty provider', () => {
    const result = resolveClassifierConfig({ CLASSIFIER_PROVIDER: '' });

    expect(result.classifier.provider).toBeNull();
  });

  it('returns provider null for whitespace-only provider', () => {
    const result = resolveClassifierConfig({ CLASSIFIER_PROVIDER: '   ' });

    expect(result.classifier.provider).toBeNull();
  });

  it('normalizes provider casing', () => {
    const result = resolveClassifierConfig({ CLASSIFIER_PROVIDER: 'OpenAI' });

    expect(result.classifier.provider).toBe('openai');
  });

  it('overrides model, reasoningEffort, temperature, maxRetries, timeout', () => {
    const result = resolveClassifierConfig({
      CLASSIFIER_MODEL: 'gpt-5',
      CLASSIFIER_REASONING_EFFORT: 'high',
      CLASSIFIER_TEMPERATURE: '0.3',
      CLASSIFIER_MAX_RETRIES: '5',
      CLASSIFIER_TIMEOUT_MS: '20000',
    });

    expect(result.classifier.model).toBe('gpt-5');
    expect(result.classifier.reasoningEffort).toBe('high');
    expect(result.classifier.temperature).toBe(0.3);
    expect(result.classifier.maxRetries).toBe(5);
    expect(result.classifier.timeout).toBe(20_000);
  });

  it('leaves temperature null by default so reasoning models use their own default', () => {
    const result = resolveClassifierConfig({});
    expect(result.classifier.temperature).toBeNull();
  });

  it('falls back to default-null temperature on non-numeric override', () => {
    const result = resolveClassifierConfig({ CLASSIFIER_TEMPERATURE: 'hot' });
    expect(result.classifier.temperature).toBeNull();
  });

  it('falls back to default when reasoning effort is unrecognized', () => {
    const result = resolveClassifierConfig({ CLASSIFIER_REASONING_EFFORT: 'ludicrous' });

    expect(result.classifier.reasoningEffort).toBe(DEFAULT_CLASSIFIER_CONFIG.reasoningEffort);
  });

  it('parses enable boolean and CLASSIFIER_BLOCKING_FIELDS list', () => {
    const result = resolveClassifierConfig({
      CLASSIFIER_ENABLE: 'false',
      CLASSIFIER_BLOCKING_FIELDS: 'rendering_clarity, overall_fit',
    });

    expect(result.classifier.enable).toBe(false);
    expect(result.classifier.blockingFields).toEqual(new Set(['renderingClarity', 'overallFit']));
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns an empty blockingFields set when CLASSIFIER_BLOCKING_FIELDS is unset', () => {
    const result = resolveClassifierConfig({});
    expect(result.classifier.blockingFields).toEqual(new Set());
  });

  it('throws on unknown verdict-field name in CLASSIFIER_BLOCKING_FIELDS', () => {
    expect(() =>
      resolveClassifierConfig({ CLASSIFIER_BLOCKING_FIELDS: 'rendering_clarity,not_a_field' })
    ).toThrow(/CLASSIFIER_BLOCKING_FIELDS.*not_a_field/);
  });

  it('treats whitespace-only and empty entries in the blocking list as no-ops', () => {
    const result = resolveClassifierConfig({
      CLASSIFIER_BLOCKING_FIELDS: ' , rendering_clarity , ,',
    });
    expect(result.classifier.blockingFields).toEqual(new Set(['renderingClarity']));
  });

  it('falls back to defaults on empty-string overrides', () => {
    const result = resolveClassifierConfig({
      CLASSIFIER_MODEL: '',
      CLASSIFIER_REASONING_EFFORT: '',
      CLASSIFIER_TIMEOUT_MS: '',
      CLASSIFIER_ENABLE: '',
      CLASSIFIER_ENABLE_AT_CREATE: '',
      CLASSIFIER_BLOCKING_FIELDS: '',
    });

    expect(result.classifier.model).toBe(DEFAULT_CLASSIFIER_CONFIG.model);
    expect(result.classifier.reasoningEffort).toBe(DEFAULT_CLASSIFIER_CONFIG.reasoningEffort);
    expect(result.classifier.timeout).toBe(DEFAULT_CLASSIFIER_CONFIG.timeout);
    expect(result.classifier.enable).toBe(DEFAULT_CLASSIFIER_CONFIG.enable);
    expect(result.classifier.blockingFields).toEqual(DEFAULT_CLASSIFIER_CONFIG.blockingFields);
    // Empty alias must not trigger the deprecation warning — empty strings are
    // treated as "unset" by the presence check.
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('falls back to default timeout on non-numeric CLASSIFIER_TIMEOUT_MS', () => {
    const result = resolveClassifierConfig({ CLASSIFIER_TIMEOUT_MS: 'abc' });

    expect(result.classifier.timeout).toBe(DEFAULT_CLASSIFIER_CONFIG.timeout);
  });

  it('treats whitespace-only api keys as unset', () => {
    const result = resolveClassifierConfig({
      CLASSIFIER_OPENAI_API_KEY: '   ',
      OPENAI_API_KEY: '   ',
    });

    expect(result.classifier.openaiApiKey).toBeNull();
  });

  it('reads process.env when invoked without arguments', () => {
    // No arguments — just ensure the default parameter path is exercised
    // and returns a syntactically valid config. Value-level assertions would
    // be flaky depending on the runner's real environment.
    expect(() => resolveClassifierConfig()).not.toThrow();
  });

  describe('CLASSIFIER_ENABLE alias migration', () => {
    it('canonical CLASSIFIER_ENABLE alone resolves to enable=true with no warning', () => {
      const result = resolveClassifierConfig({ CLASSIFIER_ENABLE: 'true' });

      expect(result.classifier.enable).toBe(true);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('legacy CLASSIFIER_ENABLE_AT_CREATE alone resolves to enable=true with one deprecation warning', () => {
      const result = resolveClassifierConfig({ CLASSIFIER_ENABLE_AT_CREATE: 'true' });

      expect(result.classifier.enable).toBe(true);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const warningMessage = warnSpy.mock.calls[0][0] as string;
      expect(warningMessage).toContain('CLASSIFIER_ENABLE_AT_CREATE');
      expect(warningMessage).toContain('CLASSIFIER_ENABLE');
      expect(warningMessage.toLowerCase()).toContain('deprecated');
    });

    it('legacy alias with whitespace-only value is treated as unset (no warning, default applies)', () => {
      const result = resolveClassifierConfig({ CLASSIFIER_ENABLE_AT_CREATE: '   ' });

      expect(result.classifier.enable).toBe(DEFAULT_CLASSIFIER_CONFIG.enable);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('throws when CLASSIFIER_ENABLE=true and CLASSIFIER_ENABLE_AT_CREATE=false disagree', () => {
      expect(() =>
        resolveClassifierConfig({
          CLASSIFIER_ENABLE: 'true',
          CLASSIFIER_ENABLE_AT_CREATE: 'false',
        })
      ).toThrow(/CLASSIFIER_ENABLE.*CLASSIFIER_ENABLE_AT_CREATE/);
    });

    it('throws when CLASSIFIER_ENABLE=false and CLASSIFIER_ENABLE_AT_CREATE=true disagree', () => {
      expect(() =>
        resolveClassifierConfig({
          CLASSIFIER_ENABLE: 'false',
          CLASSIFIER_ENABLE_AT_CREATE: 'true',
        })
      ).toThrow(/CLASSIFIER_ENABLE.*CLASSIFIER_ENABLE_AT_CREATE/);
    });

    it('accepts both vars when parsed booleans agree (true=on equivalence) without warning', () => {
      const result = resolveClassifierConfig({
        CLASSIFIER_ENABLE: 'true',
        CLASSIFIER_ENABLE_AT_CREATE: 'on',
      });

      expect(result.classifier.enable).toBe(true);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('accepts both vars when parsed booleans agree (false=0 equivalence) without warning', () => {
      const result = resolveClassifierConfig({
        CLASSIFIER_ENABLE: 'false',
        CLASSIFIER_ENABLE_AT_CREATE: '0',
      });

      expect(result.classifier.enable).toBe(false);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
