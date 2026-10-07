import { describe, it, expect } from 'vitest';
import {
  CanonicalScopeSchema,
  GetCanonicalAnswerInputSchema,
  SaveCanonicalAnswerInputSchema,
} from '../../../../src/domain/types/canonical-answer.js';
import {
  countCanonicalWords,
  validateCanonicalScope,
  validateCanonicalParts,
  parseCanonicalMaterial,
  canonicalScopeKey,
  canonicalFeedbackEligible,
} from '../../../../src/domain/services/canonical-answer.js';

const wire = {
  language: 'en',
  parts: [{ part_id: 'definition', required_facts: ['identity verification'] }],
  sources: [{ kind: 'chunk', source_id: 'c1', components: ['content'] }],
};
const scope = CanonicalScopeSchema.parse(wire);
const fp = 'a'.repeat(64);

describe('canonical answer policy', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['empty', ''],
    ['spaces', '   '],
    ['Unicode whitespace', '  \t\n'],
    ['next-line Unicode whitespace', '\u0085'],
  ])('does not count a %s value', (_name, value) => {
    expect(countCanonicalWords(value)).toBe(0);
  });

  it.each([
    ['missing text', undefined, 'invalid_material'],
    ['empty text', '', 'invalid_material'],
    ['whitespace-only text', ' \t\n  ', 'empty_part'],
  ])('rejects candidate material with %s', (_name, text, reason) => {
    expect(
      parseCanonicalMaterial(scope, {
        kind: 'candidate',
        expected_fingerprint: fp,
        parts: [{ part_id: 'definition', text }],
      })
    ).toEqual({ ok: false, reason });
  });
  it('does not treat a byte-order mark as Unicode White_Space', () => {
    expect(countCanonicalWords('﻿')).toBe(1);
  });

  it('counts Unicode whitespace without altering contractions, hyphens or math tokens', () => {
    expect(countCanonicalWords("don't well-defined O(n)\tvalue\nlast")).toBe(5);
  });
  it('accepts exactly 40 Unicode-separated words per multipart item and rejects 41', () => {
    const multi = CanonicalScopeSchema.parse({
      ...wire,
      parts: [...wire.parts, { part_id: 'qualifier', required_facts: ['time-bound condition'] }],
    });
    const fortyWords = Array.from({ length: 40 }, (_, index) => `word${index + 1}`).join('\u0085');
    const fortyOneWords = `${fortyWords}\u0085extra`;

    expect(
      validateCanonicalParts(multi, [
        { partId: 'definition', text: `\u0085${fortyWords}\u0085` },
        { partId: 'qualifier', text: 'Only while the condition holds.' },
      ])
    ).toEqual({ ok: true });
    expect(
      validateCanonicalParts(multi, [
        { partId: 'definition', text: `\u0085${fortyOneWords}\u0085` },
        { partId: 'qualifier', text: 'Only while the condition holds.' },
      ])
    ).toEqual({ ok: false, reason: 'word_limit_exceeded' });
  });

  it('requires matching multipart identities, cardinality, and order', () => {
    const multi = CanonicalScopeSchema.parse({
      ...wire,
      parts: [...wire.parts, { part_id: 'qualifier', required_facts: ['time-bound condition'] }],
    });
    const matching = [
      { partId: 'definition', text: 'Authentication verifies identity.' },
      { partId: 'qualifier', text: 'Only while the condition holds.' },
    ];

    expect(validateCanonicalParts(multi, undefined)).toEqual({
      ok: false,
      reason: 'part_count_mismatch',
    });
    expect(validateCanonicalParts(multi, matching.slice(0, 1))).toEqual({
      ok: false,
      reason: 'part_count_mismatch',
    });
    expect(validateCanonicalParts(multi, [matching[1]!, matching[0]!])).toEqual({
      ok: false,
      reason: 'part_identity_mismatch',
    });
    expect(
      validateCanonicalParts(multi, [
        matching[0]!,
        { partId: 'definition', text: 'Duplicate identity.' },
      ])
    ).toEqual({ ok: false, reason: 'part_identity_mismatch' });
    expect(
      validateCanonicalParts(multi, [
        matching[0]!,
        { partId: 'foreign', text: 'Foreign identity.' },
      ])
    ).toEqual({ ok: false, reason: 'part_identity_mismatch' });
    expect(
      validateCanonicalParts(multi, [{ partId: 'definition', text: '  ' }, matching[1]!])
    ).toEqual({ ok: false, reason: 'empty_part' });
  });
  it('accepts only source components valid for each source kind', () => {
    const chunkScope = CanonicalScopeSchema.parse({
      ...wire,
      sources: [
        {
          kind: 'chunk',
          source_id: 'c1',
          components: ['content', 'condensed_summary'],
        },
      ],
    });
    const topicScope = CanonicalScopeSchema.parse({
      ...wire,
      sources: [{ kind: 'topic', source_id: 't1', components: ['summary'] }],
    });
    const chunkWithTopicComponent = structuredClone(chunkScope);
    const topicWithChunkComponent = structuredClone(topicScope);
    const topicWithDuplicateSummary = structuredClone(topicScope);

    Object.assign(chunkWithTopicComponent.sources[0]!, {
      components: ['summary'],
    });
    Object.assign(topicWithChunkComponent.sources[0]!, {
      components: ['content'],
    });
    Object.assign(topicWithDuplicateSummary.sources[0]!, {
      components: ['summary', 'summary'],
    });

    expect(validateCanonicalScope(chunkScope)).toBe(true);
    expect(validateCanonicalScope(topicScope)).toBe(true);
    expect(validateCanonicalScope(chunkWithTopicComponent)).toBe(false);
    expect(validateCanonicalScope(topicWithChunkComponent)).toBe(false);
    expect(validateCanonicalScope(topicWithDuplicateSummary)).toBe(false);
  });

  it('normalizes Unicode-distinct source identities in code-unit order', () => {
    const composed = 'é';
    const decomposed = 'é';
    const sources = [
      { kind: 'chunk' as const, source_id: composed, components: ['content'] as const },
      { kind: 'chunk' as const, source_id: decomposed, components: ['content'] as const },
    ];
    const forward = CanonicalScopeSchema.parse({ ...wire, sources });
    const reversed = CanonicalScopeSchema.parse({
      ...wire,
      sources: [...sources].reverse(),
    });

    expect(forward.sources.map(source => source.sourceId)).toEqual([decomposed, composed]);
    expect(reversed.sources).toEqual(forward.sources);
    expect(canonicalScopeKey(reversed)).toBe(canonicalScopeKey(forward));
  });

  it('rejects absent and duplicate scope identities/facts/sources', () => {
    expect(validateCanonicalScope(undefined)).toBe(false);
    expect(validateCanonicalScope(null)).toBe(false);
    expect(
      validateCanonicalScope({
        ...scope,
        parts: [...scope.parts, ...scope.parts],
      })
    ).toBe(false);
    expect(
      validateCanonicalScope({
        ...scope,
        sources: [...scope.sources, ...scope.sources],
      })
    ).toBe(false);
    expect(
      validateCanonicalScope({
        ...scope,
        parts: [{ partId: 'x', requiredFacts: ['x', 'x'] }],
      })
    ).toBe(false);
    expect(canonicalScopeKey({ ...scope, parts: [] })).toBe('');
  });
  it('parses optional material without throwing or normalizing target bytes', () => {
    for (const value of [undefined, '', ' ', {}, { kind: 'candidate', parts: [] }]) {
      expect(parseCanonicalMaterial(scope, value).ok).toBe(false);
    }
    expect(
      parseCanonicalMaterial(scope, {
        kind: 'candidate',
        expected_fingerprint: fp,
        parts: [{ part_id: 'definition', text: '  Exact words.  ' }],
      })
    ).toEqual({
      ok: true,
      material: {
        kind: 'candidate',
        expectedFingerprint: fp,
        parts: [{ partId: 'definition', text: '  Exact words.  ' }],
      },
    });
    expect(parseCanonicalMaterial(scope, { kind: 'reference', revision_id: 'r1' })).toEqual({
      ok: true,
      material: { kind: 'reference', revisionId: 'r1' },
    });
    expect(
      parseCanonicalMaterial(scope, {
        kind: 'unavailable',
        reason: 'contradictory',
      }).ok
    ).toBe(true);
  });
  it('derives eligibility from actual persisted attempt facts', () => {
    const base = {
      mode: 'learning',
      questionType: 'recall',
      attemptNumber: 1,
      passed: true,
      actualPromptText: 'Question?',
    };
    expect(canonicalFeedbackEligible(base)).toBe(true);
    expect(canonicalFeedbackEligible({ ...base, passed: false })).toBe(false);
    expect(canonicalFeedbackEligible({ ...base, attemptNumber: 2, passed: false })).toBe(true);
    for (const actualPromptText of [undefined, null, '', ' ']) {
      expect(canonicalFeedbackEligible({ ...base, actualPromptText })).toBe(false);
    }
    expect(canonicalFeedbackEligible({ ...base, attemptNumber: 3 })).toBe(false);
    expect(canonicalFeedbackEligible({ ...base, mode: 'assessment' })).toBe(false);
    expect(canonicalFeedbackEligible({ ...base, questionType: 'explain_apply' })).toBe(false);
  });
  it('does not permit an arbitrary feedback reveal flag or incomplete correction CAS', () => {
    const base = {
      session_id: 's1',
      question_scope: wire,
      context_token: 'ctx',
    };
    expect(GetCanonicalAnswerInputSchema.safeParse({ ...base, purpose: 'feedback' }).success).toBe(
      false
    );
    expect(
      GetCanonicalAnswerInputSchema.safeParse({
        ...base,
        session_question_id: 'q1',
      }).success
    ).toBe(false);
    expect(
      GetCanonicalAnswerInputSchema.safeParse({
        ...base,
        purpose: 'feedback',
        session_question_id: 'q1',
        attempt_number: 2,
      }).success
    ).toBe(true);
    expect(
      SaveCanonicalAnswerInputSchema.safeParse({
        ...base,
        operation: 'correct',
        expected_fingerprint: fp,
        parts: [{ part_id: 'definition', text: 'Correct.' }],
      }).success
    ).toBe(false);
    expect(
      SaveCanonicalAnswerInputSchema.safeParse({
        ...base,
        operation: 'invalidate',
        expected_fingerprint: fp,
        expected_head_version: 2,
        expected_revision_id: null,
        correction_reason: 'Correction needed',
      }).success
    ).toBe(true);
  });
});
