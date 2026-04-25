import { describe, it, expect } from 'vitest';
import {
  CLASSIFIER_FEW_SHOTS,
  CLASSIFIER_PROMPT_CHAR_BUDGET,
  CLASSIFIER_PROMPT_VERSION,
  CLASSIFIER_RUBRIC,
  EDGE_CASE_BLOCK,
  GROUNDING_BLOCK,
  PERSISTED_TIER2_FIELD_NAMES,
  VERDICT_FIELDS,
  buildClassifierPrompt,
  toPersistedTier2,
  type FewShotExample,
} from '../../../src/shared/prompts/classifier-prompts.js';
import {
  VerdictFieldSchema,
  type ChunkClassifierVerdict,
  type VerdictFieldName,
} from '../../../src/domain/types/classifier.js';

const SEMVER = /^\d+\.\d+\.\d+$/;

describe('classifier prompts module', () => {
  it('exposes a semver prompt version pinned to 1.1.0', () => {
    expect(CLASSIFIER_PROMPT_VERSION).toMatch(SEMVER);
    expect(CLASSIFIER_PROMPT_VERSION).toBe('1.1.0');
  });

  it('cites Wozniak, Sweller, and Merrill across the rubric lines', () => {
    const haystack = Object.values(CLASSIFIER_RUBRIC)
      .map(entry => entry.line)
      .join(' ')
      .toLowerCase();
    expect(haystack).toContain('wozniak');
    expect(haystack).toContain('sweller');
    expect(haystack).toContain('merrill');
  });

  describe('few-shot exemplars', () => {
    it('supplies exactly 3 exemplars per field, 18 total', () => {
      let total = 0;
      for (const field of VERDICT_FIELDS) {
        const examples = CLASSIFIER_FEW_SHOTS[field];
        expect(examples).toHaveLength(3);
        total += examples.length;
      }
      expect(total).toBe(18);
    });

    it('every per-field set includes a score-3 boundary exemplar', () => {
      for (const field of VERDICT_FIELDS) {
        const scores = CLASSIFIER_FEW_SHOTS[field].map(e => e.expectedScore);
        expect(scores).toContain(3);
      }
    });

    it('every per-field set includes a high-score (4 or 5) and a low-score (1 or 2) exemplar', () => {
      for (const field of VERDICT_FIELDS) {
        const scores = CLASSIFIER_FEW_SHOTS[field].map(e => e.expectedScore);
        expect(scores.some(s => s >= 4)).toBe(true);
        expect(scores.some(s => s <= 2)).toBe(true);
      }
    });

    it('exemplar labels are non-empty and unique across the entire corpus', () => {
      const allLabels: string[] = [];
      for (const field of VERDICT_FIELDS) {
        for (const example of CLASSIFIER_FEW_SHOTS[field]) {
          expect(example.label.length).toBeGreaterThan(0);
          expect(example.field).toBe(field);
          allLabels.push(example.label);
        }
      }
      expect(new Set(allLabels).size).toBe(allLabels.length);
    });

    it('every exemplar rationale satisfies the schema (≤240 chars, single line)', () => {
      for (const field of VERDICT_FIELDS) {
        for (const example of CLASSIFIER_FEW_SHOTS[field]) {
          const parsed = VerdictFieldSchema.safeParse({
            score: example.expectedScore,
            rationale: example.expectedRationale,
            applicable: example.expectedApplicable,
          });
          expect(parsed.success).toBe(true);
        }
      }
    });
  });

  describe('PERSISTED_TIER2_FIELD_NAMES', () => {
    it('maps every verdict field to a snake_cased key', () => {
      for (const field of VERDICT_FIELDS) {
        const snake = PERSISTED_TIER2_FIELD_NAMES[field];
        expect(snake).toBeDefined();
        expect(snake).toMatch(/^[a-z][a-z0-9_]*$/);
        expect(snake).toBe(snake.toLowerCase());
      }
    });
  });

  describe('buildClassifierPrompt', () => {
    it('returns a record keyed by every VERDICT_FIELDS member', () => {
      const prompts = buildClassifierPrompt();
      for (const field of VERDICT_FIELDS) {
        expect(prompts[field]).toBeDefined();
        expect(typeof prompts[field].systemPrompt).toBe('string');
        expect(typeof prompts[field].userPrompt).toBe('string');
        expect(prompts[field].systemPrompt.length).toBeGreaterThan(0);
        expect(prompts[field].userPrompt.length).toBeGreaterThan(0);
      }
    });

    it('every per-field system prompt embeds the grounding block verbatim', () => {
      const prompts = buildClassifierPrompt();
      for (const field of VERDICT_FIELDS) {
        expect(prompts[field].systemPrompt).toContain('Ground every score and rationale');
        expect(prompts[field].systemPrompt).toContain('not applicable:');
        expect(prompts[field].systemPrompt).toContain(GROUNDING_BLOCK);
      }
    });

    it('every per-field system prompt embeds the edge-case block verbatim', () => {
      const prompts = buildClassifierPrompt();
      for (const field of VERDICT_FIELDS) {
        expect(prompts[field].systemPrompt).toContain('insufficient content to grade');
        expect(prompts[field].systemPrompt).toContain('stub content; defer scoring');
        expect(prompts[field].systemPrompt).toContain(EDGE_CASE_BLOCK);
      }
    });

    it('each per-field system prompt names its own field label and renders only its exemplars', () => {
      const prompts = buildClassifierPrompt();
      for (const field of VERDICT_FIELDS) {
        const ownLabel = CLASSIFIER_RUBRIC[field].label;
        expect(prompts[field].systemPrompt).toContain(`Aspect: ${ownLabel}`);
        for (const example of CLASSIFIER_FEW_SHOTS[field]) {
          expect(prompts[field].systemPrompt).toContain(example.label);
        }
        // Exemplars from other fields must not leak in.
        for (const other of VERDICT_FIELDS) {
          if (other === field) continue;
          for (const otherExample of CLASSIFIER_FEW_SHOTS[other]) {
            expect(prompts[field].systemPrompt).not.toContain(otherExample.label);
          }
        }
      }
    });

    it('each per-field user prompt names the field being scored', () => {
      const prompts = buildClassifierPrompt();
      for (const field of VERDICT_FIELDS) {
        expect(prompts[field].userPrompt).toContain(CLASSIFIER_RUBRIC[field].label);
      }
    });

    it('each per-field combined prompt fits within the char budget', () => {
      const prompts = buildClassifierPrompt();
      for (const field of VERDICT_FIELDS) {
        const total = prompts[field].systemPrompt.length + prompts[field].userPrompt.length;
        expect(total).toBeLessThanOrEqual(CLASSIFIER_PROMPT_CHAR_BUDGET);
      }
    });

    it('accepts overrides for rubric and few-shots', () => {
      const customRubric = {} as Record<VerdictFieldName, { label: string; line: string }>;
      const customFewShots = {} as Record<VerdictFieldName, readonly FewShotExample[]>;
      for (const field of VERDICT_FIELDS) {
        customRubric[field] = { label: 'custom_label', line: 'CUSTOM_LINE' };
        const example: FewShotExample = {
          label: `custom-${field}`,
          field,
          chunkTitle: 'Custom',
          chunkContent: 'Body.',
          expectedScore: 3,
          expectedRationale: 'Custom rationale.',
          expectedApplicable: true,
        };
        customFewShots[field] = [example];
      }
      const prompts = buildClassifierPrompt(customRubric, customFewShots);
      for (const field of VERDICT_FIELDS) {
        expect(prompts[field].systemPrompt).toContain('CUSTOM_LINE');
        expect(prompts[field].systemPrompt).toContain(`custom-${field}`);
        // Default exemplars are not in the rendered prompt when overridden.
        for (const defaultExample of CLASSIFIER_FEW_SHOTS[field]) {
          expect(prompts[field].systemPrompt).not.toContain(defaultExample.label);
        }
      }
    });
  });

  describe('VerdictFieldSchema', () => {
    it('accepts a well-formed verdict with applicable=true', () => {
      const parsed = VerdictFieldSchema.safeParse({
        score: 3,
        rationale: 'reasonable rationale',
        applicable: true,
      });
      expect(parsed.success).toBe(true);
    });

    it('accepts the not-applicable escape (applicable=false)', () => {
      const parsed = VerdictFieldSchema.safeParse({
        score: 5,
        rationale: 'not applicable: chunk has no math notation',
        applicable: false,
      });
      expect(parsed.success).toBe(true);
    });

    it('rejects rationale longer than 240 chars', () => {
      const parsed = VerdictFieldSchema.safeParse({
        score: 3,
        rationale: 'x'.repeat(241),
        applicable: true,
      });
      expect(parsed.success).toBe(false);
    });

    it('accepts rationale at the 240-char boundary', () => {
      const parsed = VerdictFieldSchema.safeParse({
        score: 3,
        rationale: 'x'.repeat(240),
        applicable: true,
      });
      expect(parsed.success).toBe(true);
    });

    it('rejects multi-line rationale', () => {
      const parsed = VerdictFieldSchema.safeParse({
        score: 3,
        rationale: 'first line\nsecond line',
        applicable: true,
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects payload missing applicable', () => {
      const parsed = VerdictFieldSchema.safeParse({
        score: 3,
        rationale: 'ok',
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects score outside [1,5]', () => {
      expect(
        VerdictFieldSchema.safeParse({ score: 0, rationale: 'ok', applicable: true }).success
      ).toBe(false);
      expect(
        VerdictFieldSchema.safeParse({ score: 6, rationale: 'ok', applicable: true }).success
      ).toBe(false);
    });
  });

  describe('toPersistedTier2', () => {
    const classifiedAt = '2026-04-25T12:00:00.000Z';

    it('snake-cases every verdict field, preserves values incl. applicable', () => {
      const verdict: ChunkClassifierVerdict = {
        renderingClarity: { score: 4, rationale: 'clean markdown', applicable: true },
        vocabularyAppropriate: { score: 3, rationale: 'mixed', applicable: true },
        mathNotationRenderingRisk: {
          score: 5,
          rationale: 'not applicable: no math',
          applicable: false,
        },
        definitionConstructive: { score: 2, rationale: 'property list', applicable: true },
        epistemicConsistency: { score: 5, rationale: 'consistent', applicable: true },
        overallFit: { score: 2, rationale: 'smells like TOC', applicable: true },
      };
      const persisted = toPersistedTier2(verdict, classifiedAt);
      expect(persisted).toEqual({
        rendering_clarity: { score: 4, rationale: 'clean markdown', applicable: true },
        vocabulary_appropriate: { score: 3, rationale: 'mixed', applicable: true },
        math_notation_rendering_risk: {
          score: 5,
          rationale: 'not applicable: no math',
          applicable: false,
        },
        definition_constructive: { score: 2, rationale: 'property list', applicable: true },
        epistemic_consistency: { score: 5, rationale: 'consistent', applicable: true },
        overall_fit: { score: 2, rationale: 'smells like TOC', applicable: true },
        prompt_version: CLASSIFIER_PROMPT_VERSION,
        classified_at: classifiedAt,
      });
    });

    it('preserves per-field nulls', () => {
      const verdict: ChunkClassifierVerdict = {
        renderingClarity: null,
        vocabularyAppropriate: { score: 4, rationale: 'ok', applicable: true },
        mathNotationRenderingRisk: null,
        definitionConstructive: null,
        epistemicConsistency: { score: 3, rationale: 'middling', applicable: true },
        overallFit: null,
      };
      const persisted = toPersistedTier2(verdict, classifiedAt);
      expect(persisted.rendering_clarity).toBeNull();
      expect(persisted.math_notation_rendering_risk).toBeNull();
      expect(persisted.definition_constructive).toBeNull();
      expect(persisted.overall_fit).toBeNull();
      expect(persisted.vocabulary_appropriate).toEqual({
        score: 4,
        rationale: 'ok',
        applicable: true,
      });
      expect(persisted.prompt_version).toBe(CLASSIFIER_PROMPT_VERSION);
      expect(persisted.classified_at).toBe(classifiedAt);
    });
  });
});
