import { describe, it, expect } from 'vitest';
import {
  CLASSIFIER_FEW_SHOTS,
  CLASSIFIER_PROMPT_CHAR_BUDGET,
  CLASSIFIER_PROMPT_VERSION,
  CLASSIFIER_RUBRIC,
  PERSISTED_TIER2_FIELD_NAMES,
  VERDICT_FIELDS,
  buildClassifierPrompt,
  toPersistedTier2,
} from '../../../src/shared/prompts/classifier-prompts.js';
import type { ChunkClassifierVerdict } from '../../../src/domain/types/classifier.js';

const SEMVER = /^\d+\.\d+\.\d+$/;

describe('classifier prompts module', () => {
  it('exposes a semver prompt version', () => {
    expect(CLASSIFIER_PROMPT_VERSION).toMatch(SEMVER);
  });

  it('cites Wozniak, Sweller, and Merrill in the rubric', () => {
    const haystack = CLASSIFIER_RUBRIC.toLowerCase();
    expect(haystack).toContain('wozniak');
    expect(haystack).toContain('sweller');
    expect(haystack).toContain('merrill');
  });

  it('supplies exactly 6 few-shot exemplars: 3 clean-pass + 3 phantom-chapter', () => {
    expect(CLASSIFIER_FEW_SHOTS).toHaveLength(6);
    const clean = CLASSIFIER_FEW_SHOTS.filter(e => e.verdict === 'clean');
    const phantom = CLASSIFIER_FEW_SHOTS.filter(e => e.verdict === 'phantom_chapter');
    expect(clean).toHaveLength(3);
    expect(phantom).toHaveLength(3);
  });

  it('few-shot labels are non-empty and unique', () => {
    const labels = CLASSIFIER_FEW_SHOTS.map(e => e.label);
    for (const label of labels) expect(label.length).toBeGreaterThan(0);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('PERSISTED_TIER2_FIELD_NAMES maps every verdict field to a snake_cased key', () => {
    for (const field of VERDICT_FIELDS) {
      const snake = PERSISTED_TIER2_FIELD_NAMES[field];
      expect(snake).toBeDefined();
      expect(snake).toMatch(/^[a-z][a-z0-9_]*$/);
      // Does not contain uppercase letters.
      expect(snake).toBe(snake.toLowerCase());
    }
  });

  it('buildClassifierPrompt returns non-empty system + user prompts', () => {
    const { systemPrompt, userPrompt } = buildClassifierPrompt();
    expect(systemPrompt.length).toBeGreaterThan(0);
    expect(userPrompt.length).toBeGreaterThan(0);
  });

  it('buildClassifierPrompt embeds all few-shot labels in the system prompt', () => {
    const { systemPrompt } = buildClassifierPrompt();
    for (const example of CLASSIFIER_FEW_SHOTS) {
      expect(systemPrompt).toContain(example.label);
    }
  });

  it('buildClassifierPrompt respects the char budget', () => {
    const { systemPrompt, userPrompt } = buildClassifierPrompt();
    expect(systemPrompt.length + userPrompt.length).toBeLessThanOrEqual(
      CLASSIFIER_PROMPT_CHAR_BUDGET
    );
  });

  it('buildClassifierPrompt accepts overrides for rubric and few-shots', () => {
    const { systemPrompt } = buildClassifierPrompt('RUBRIC_MARKER', [
      {
        label: 'custom-example',
        verdict: 'clean',
        chunkTitle: 'Custom',
        chunkContent: 'Body.',
        rationale: 'Custom rationale.',
      },
    ]);
    expect(systemPrompt).toContain('RUBRIC_MARKER');
    expect(systemPrompt).toContain('custom-example');
    // Default few-shots are not in the rendered prompt when overridden.
    expect(systemPrompt).not.toContain('et-tin-tout-construction');
  });

  describe('toPersistedTier2', () => {
    const classifiedAt = '2026-04-22T12:00:00.000Z';

    it('snake-cases every verdict field and preserves per-field values', () => {
      const verdict: ChunkClassifierVerdict = {
        renderingClarity: { score: 4, rationale: 'clean markdown' },
        vocabularyAppropriate: { score: 3, rationale: 'mixed' },
        mathNotationRenderingRisk: { score: 5, rationale: 'no math' },
        definitionConstructive: { score: 2, rationale: 'property list' },
        epistemicConsistency: { score: 5, rationale: 'consistent' },
        overallFit: { score: 2, rationale: 'smells like TOC' },
      };
      const persisted = toPersistedTier2(verdict, classifiedAt);
      expect(persisted).toEqual({
        rendering_clarity: { score: 4, rationale: 'clean markdown' },
        vocabulary_appropriate: { score: 3, rationale: 'mixed' },
        math_notation_rendering_risk: { score: 5, rationale: 'no math' },
        definition_constructive: { score: 2, rationale: 'property list' },
        epistemic_consistency: { score: 5, rationale: 'consistent' },
        overall_fit: { score: 2, rationale: 'smells like TOC' },
        prompt_version: CLASSIFIER_PROMPT_VERSION,
        classified_at: classifiedAt,
      });
    });

    it('preserves per-field nulls', () => {
      const verdict: ChunkClassifierVerdict = {
        renderingClarity: null,
        vocabularyAppropriate: { score: 4, rationale: 'ok' },
        mathNotationRenderingRisk: null,
        definitionConstructive: null,
        epistemicConsistency: { score: 3, rationale: 'middling' },
        overallFit: null,
      };
      const persisted = toPersistedTier2(verdict, classifiedAt);
      expect(persisted.rendering_clarity).toBeNull();
      expect(persisted.math_notation_rendering_risk).toBeNull();
      expect(persisted.definition_constructive).toBeNull();
      expect(persisted.overall_fit).toBeNull();
      expect(persisted.vocabulary_appropriate).toEqual({ score: 4, rationale: 'ok' });
      expect(persisted.prompt_version).toBe(CLASSIFIER_PROMPT_VERSION);
      expect(persisted.classified_at).toBe(classifiedAt);
    });
  });
});
