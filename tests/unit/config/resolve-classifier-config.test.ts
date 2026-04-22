import { describe, it, expect } from 'vitest';
import { DEFAULT_CLASSIFIER_CONFIG } from '../../../src/domain/config/classifier-defaults.js';
import { resolveClassifierConfig } from '../../../src/config/resolve-classifier-config.js';

describe('resolveClassifierConfig', () => {
  it('returns all defaults with empty env', () => {
    const result = resolveClassifierConfig({});

    expect(result.classifier).toEqual({
      ...DEFAULT_CLASSIFIER_CONFIG,
      provider: null,
      openaiApiKey: null,
    });
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

  it('parses enableAtCreate and blockingMode booleans', () => {
    const result = resolveClassifierConfig({
      CLASSIFIER_ENABLE_AT_CREATE: 'false',
      CLASSIFIER_BLOCKING_MODE: 'true',
    });

    expect(result.classifier.enableAtCreate).toBe(false);
    expect(result.classifier.blockingMode).toBe(true);
  });

  it('falls back to defaults on empty-string overrides', () => {
    const result = resolveClassifierConfig({
      CLASSIFIER_MODEL: '',
      CLASSIFIER_REASONING_EFFORT: '',
      CLASSIFIER_TIMEOUT_MS: '',
      CLASSIFIER_ENABLE_AT_CREATE: '',
      CLASSIFIER_BLOCKING_MODE: '',
    });

    expect(result.classifier.model).toBe(DEFAULT_CLASSIFIER_CONFIG.model);
    expect(result.classifier.reasoningEffort).toBe(DEFAULT_CLASSIFIER_CONFIG.reasoningEffort);
    expect(result.classifier.timeout).toBe(DEFAULT_CLASSIFIER_CONFIG.timeout);
    expect(result.classifier.enableAtCreate).toBe(DEFAULT_CLASSIFIER_CONFIG.enableAtCreate);
    expect(result.classifier.blockingMode).toBe(DEFAULT_CLASSIFIER_CONFIG.blockingMode);
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
});
