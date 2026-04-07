import { describe, it, expect } from 'vitest';
import { resolveAlgorithmConfig } from '../../../src/config/resolve-algorithm-config.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';

describe('resolveAlgorithmConfig', () => {
  // ── Defaults ────────────────────────────────────────────────

  it('returns DEFAULT_ALGORITHM_CONFIG with empty env', () => {
    expect(resolveAlgorithmConfig({})).toEqual(DEFAULT_ALGORITHM_CONFIG);
  });

  // ── Top-level numeric overrides ─────────────────────────────

  it('overrides initialIntervalDays', () => {
    const result = resolveAlgorithmConfig({ SM_INITIAL_INTERVAL_DAYS: '3' });
    expect(result.initialIntervalDays).toBe(3);
  });

  it('overrides secondIntervalDays', () => {
    const result = resolveAlgorithmConfig({ SM_SECOND_INTERVAL_DAYS: '10' });
    expect(result.secondIntervalDays).toBe(10);
  });

  it('overrides easeDeltaGood', () => {
    const result = resolveAlgorithmConfig({ SM_EASE_DELTA_GOOD: '0.2' });
    expect(result.easeDeltaGood).toBe(0.2);
  });

  it('overrides easeDeltaHard', () => {
    const result = resolveAlgorithmConfig({ SM_EASE_DELTA_HARD: '-0.05' });
    expect(result.easeDeltaHard).toBe(-0.05);
  });

  it('overrides easePenaltyFailure', () => {
    const result = resolveAlgorithmConfig({ SM_EASE_PENALTY_FAILURE: '-0.3' });
    expect(result.easePenaltyFailure).toBe(-0.3);
  });

  it('overrides lapsePenalty', () => {
    const result = resolveAlgorithmConfig({ SM_LAPSE_PENALTY: '-0.25' });
    expect(result.lapsePenalty).toBe(-0.25);
  });

  it('overrides maxConsecutiveLapses', () => {
    const result = resolveAlgorithmConfig({ SM_MAX_CONSEC_LAPSES: '5' });
    expect(result.maxConsecutiveLapses).toBe(5);
  });

  it('overrides leechFailureThreshold', () => {
    const result = resolveAlgorithmConfig({ SM_LEECH_FAIL_THRESHOLD: '8' });
    expect(result.leechFailureThreshold).toBe(8);
  });

  it('overrides leechConsecutiveFailures', () => {
    const result = resolveAlgorithmConfig({ SM_LEECH_CONSEC_FAILS: '4' });
    expect(result.leechConsecutiveFailures).toBe(4);
  });

  it('overrides leechEasePenaltyAdjustment', () => {
    const result = resolveAlgorithmConfig({ SM_LEECH_EASE_ADJUST: '-0.1' });
    expect(result.leechEasePenaltyAdjustment).toBe(-0.1);
  });

  it('overrides minLeechEasePenalty', () => {
    const result = resolveAlgorithmConfig({ SM_MIN_LEECH_EASE_PENALTY: '-0.5' });
    expect(result.minLeechEasePenalty).toBe(-0.5);
  });

  // ── minimumEaseFactor clamping ──────────────────────────────

  it('clamps minimumEaseFactor to 1.3 when env value is below', () => {
    const result = resolveAlgorithmConfig({ SM_MIN_EASE_FACTOR: '1.0' });
    expect(result.minimumEaseFactor).toBe(1.3);
  });

  it('uses env value when minimumEaseFactor is above 1.3', () => {
    const result = resolveAlgorithmConfig({ SM_MIN_EASE_FACTOR: '1.5' });
    expect(result.minimumEaseFactor).toBe(1.5);
  });

  it('returns default 1.3 when minimumEaseFactor is exactly 1.3', () => {
    const result = resolveAlgorithmConfig({ SM_MIN_EASE_FACTOR: '1.3' });
    expect(result.minimumEaseFactor).toBe(1.3);
  });

  // ── Nested: priorityWeights ─────────────────────────────────

  it('overrides priorityWeights fields', () => {
    const result = resolveAlgorithmConfig({
      SM_PRIORITY_W_URGENCY: '0.5',
      SM_PRIORITY_W_EASE: '0.2',
      SM_PRIORITY_W_REPS: '0.15',
      SM_PRIORITY_W_DIFF: '0.15',
    });
    expect(result.priorityWeights).toEqual({
      urgency: 0.5,
      ease: 0.2,
      repetitions: 0.15,
      difficulty: 0.15,
    });
  });

  it('partially overrides priorityWeights, rest stays default', () => {
    const result = resolveAlgorithmConfig({ SM_PRIORITY_W_URGENCY: '0.8' });
    expect(result.priorityWeights.urgency).toBe(0.8);
    expect(result.priorityWeights.ease).toBe(DEFAULT_ALGORITHM_CONFIG.priorityWeights.ease);
  });

  // ── Nested: dailyCaps ───────────────────────────────────────

  it('overrides dailyCaps fields', () => {
    const result = resolveAlgorithmConfig({
      SM_DAILY_CAP_NEW: '30',
      SM_DAILY_CAP_REVIEWS: '300',
    });
    expect(result.dailyCaps).toEqual({ maxNew: 30, maxReviews: 300 });
  });

  // ── Nested: sessionConfig ───────────────────────────────────

  it('overrides sessionConfig fields', () => {
    const result = resolveAlgorithmConfig({
      SM_SESSION_QUALITY_THRESHOLD: '3.5',
      SM_SESSION_TIME_THRESHOLD_MS: '3600000',
      SM_SESSION_COMPLETION_THRESHOLD: '0.9',
      SM_SESSION_MAX_TIME_MS: '7200000',
    });
    expect(result.sessionConfig).toEqual({
      qualityThreshold: 3.5,
      timeThresholdMs: 3600000,
      completionThreshold: 0.9,
      maxTimeMs: 7200000,
    });
  });

  // ── Nested: recommendationConfig.cognitiveLoad ──────────────

  it('overrides cognitiveLoad fields', () => {
    const result = resolveAlgorithmConfig({
      SM_REC_MAX_COG_LOAD_DEFAULT: '25',
      SM_REC_COG_EASY_THRESHOLD: '5',
      SM_REC_COG_HARD_THRESHOLD: '18',
      SM_REC_COG_PER_MIN_FACTOR: '0.7',
    });
    expect(result.recommendationConfig.cognitiveLoad).toEqual({
      defaultMax: 25,
      easyThreshold: 5,
      hardThreshold: 18,
      perMinuteFactor: 0.7,
    });
  });

  // ── Nested: recommendationConfig.sessionComposition ─────────

  it('overrides sessionComposition numeric fields', () => {
    const result = resolveAlgorithmConfig({
      SM_REC_MAX_NEW_DEFAULT: '5',
      SM_REC_SHORT_SESSION_MIN: '10',
      SM_REC_MAX_NEW_SHORT: '2',
      SM_REC_LONG_SESSION_MIN: '60',
      SM_REC_MAX_NEW_LONG: '8',
    });
    expect(result.recommendationConfig.sessionComposition.maxNewDefault).toBe(5);
    expect(result.recommendationConfig.sessionComposition.shortSessionMinutes).toBe(10);
    expect(result.recommendationConfig.sessionComposition.maxNewShort).toBe(2);
    expect(result.recommendationConfig.sessionComposition.longSessionMinutes).toBe(60);
    expect(result.recommendationConfig.sessionComposition.maxNewLong).toBe(8);
  });

  // ── parseEnum: interleaveStrategy ───────────────────────────

  it('accepts valid interleaveStrategy "balanced"', () => {
    const result = resolveAlgorithmConfig({ SM_REC_INTERLEAVE_STRATEGY: 'balanced' });
    expect(result.recommendationConfig.sessionComposition.interleaveStrategy).toBe('balanced');
  });

  it('accepts valid interleaveStrategy "easy-medium-hard"', () => {
    const result = resolveAlgorithmConfig({ SM_REC_INTERLEAVE_STRATEGY: 'easy-medium-hard' });
    expect(result.recommendationConfig.sessionComposition.interleaveStrategy).toBe(
      'easy-medium-hard'
    );
  });

  it('falls back to default for invalid interleaveStrategy', () => {
    const result = resolveAlgorithmConfig({ SM_REC_INTERLEAVE_STRATEGY: 'random' });
    expect(result.recommendationConfig.sessionComposition.interleaveStrategy).toBe(
      DEFAULT_ALGORITHM_CONFIG.recommendationConfig.sessionComposition.interleaveStrategy
    );
  });

  // ── Nested: recommendationConfig.conversation ───────────────

  it('overrides conversation booleans', () => {
    const result = resolveAlgorithmConfig({
      SM_REC_CONVO_ENCOURAGEMENT: 'false',
      SM_REC_CONVO_PROGRESS: 'false',
    });
    expect(result.recommendationConfig.conversation.enableEncouragement).toBe(false);
    expect(result.recommendationConfig.conversation.enableProgressUpdates).toBe(false);
  });

  it('re-enables conversation booleans with truthy strings', () => {
    const result = resolveAlgorithmConfig({
      SM_REC_CONVO_ENCOURAGEMENT: '1',
      SM_REC_CONVO_PROGRESS: 'yes',
    });
    expect(result.recommendationConfig.conversation.enableEncouragement).toBe(true);
    expect(result.recommendationConfig.conversation.enableProgressUpdates).toBe(true);
  });

  // ── parseEnum: verbosity ────────────────────────────────────

  it('accepts valid verbosity "low"', () => {
    const result = resolveAlgorithmConfig({ SM_REC_CONVO_VERBOSITY: 'low' });
    expect(result.recommendationConfig.conversation.verbosity).toBe('low');
  });

  it('accepts valid verbosity "high"', () => {
    const result = resolveAlgorithmConfig({ SM_REC_CONVO_VERBOSITY: 'high' });
    expect(result.recommendationConfig.conversation.verbosity).toBe('high');
  });

  it('falls back to default for invalid verbosity', () => {
    const result = resolveAlgorithmConfig({ SM_REC_CONVO_VERBOSITY: 'ultra' });
    expect(result.recommendationConfig.conversation.verbosity).toBe(
      DEFAULT_ALGORITHM_CONFIG.recommendationConfig.conversation.verbosity
    );
  });

  it('overrides maxDependencyDepth', () => {
    const result = resolveAlgorithmConfig({ SM_PREREQ_MAX_DEPTH: '10' });
    expect(result.maxDependencyDepth).toBe(10);
  });

  // ── weakAreaEaseThreshold clamping ─────────────────────────

  it('overrides weakAreaEaseThreshold with valid value', () => {
    const result = resolveAlgorithmConfig({ SM_WEAK_AREA_EASE_THRESHOLD: '2.0' });
    expect(result.weakAreaEaseThreshold).toBe(2.0);
  });

  it('clamps weakAreaEaseThreshold to minimumEaseFactor when below', () => {
    const result = resolveAlgorithmConfig({ SM_WEAK_AREA_EASE_THRESHOLD: '0.5' });
    expect(result.weakAreaEaseThreshold).toBe(DEFAULT_ALGORITHM_CONFIG.minimumEaseFactor);
  });

  it('clamps weakAreaEaseThreshold to custom minimumEaseFactor when both are set', () => {
    const result = resolveAlgorithmConfig({
      SM_MIN_EASE_FACTOR: '1.5',
      SM_WEAK_AREA_EASE_THRESHOLD: '1.2',
    });
    expect(result.weakAreaEaseThreshold).toBe(1.5);
  });

  // ── parseRecord: tagWeights ─────────────────────────────────

  it('parses valid JSON tagWeights', () => {
    const result = resolveAlgorithmConfig({
      SM_TAG_WEIGHTS: '{"math":1.5,"history":0.8}',
    });
    expect(result.tagWeights).toEqual({ math: 1.5, history: 0.8 });
  });

  it('returns empty object for invalid JSON tagWeights', () => {
    const result = resolveAlgorithmConfig({ SM_TAG_WEIGHTS: 'not-json' });
    expect(result.tagWeights).toEqual({});
  });

  it('returns empty object when tagWeights is missing', () => {
    const result = resolveAlgorithmConfig({});
    expect(result.tagWeights).toEqual({});
  });

  // ── Invalid numeric values fall back to defaults ────────────

  it('falls back to default for non-numeric initialIntervalDays', () => {
    const result = resolveAlgorithmConfig({ SM_INITIAL_INTERVAL_DAYS: 'abc' });
    expect(result.initialIntervalDays).toBe(DEFAULT_ALGORITHM_CONFIG.initialIntervalDays);
  });

  it('falls back to default for non-numeric lapsePenalty', () => {
    const result = resolveAlgorithmConfig({ SM_LAPSE_PENALTY: 'xyz' });
    expect(result.lapsePenalty).toBe(DEFAULT_ALGORITHM_CONFIG.lapsePenalty);
  });

  it('falls back to default for non-numeric leechFailureThreshold', () => {
    const result = resolveAlgorithmConfig({ SM_LEECH_FAIL_THRESHOLD: '' });
    expect(result.leechFailureThreshold).toBe(DEFAULT_ALGORITHM_CONFIG.leechFailureThreshold);
  });

  it('falls back to default for non-numeric minimumEaseFactor', () => {
    const result = resolveAlgorithmConfig({ SM_MIN_EASE_FACTOR: 'nope' });
    expect(result.minimumEaseFactor).toBe(DEFAULT_ALGORITHM_CONFIG.minimumEaseFactor);
  });
});
