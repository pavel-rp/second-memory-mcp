import {
  CanonicalMaterialSchema,
  compareCanonicalSources,
  type CanonicalMaterial,
  type CanonicalPart,
  type CanonicalResult,
  type CanonicalScope,
} from '../types/canonical-answer.js';

export const CANONICAL_WORD_LIMIT = 40;
export const CANONICAL_PREPARATION_DIRECTIVE =
  'Preparation only: ask the recall question without showing this target. Reveal only after a correct first answer or the completed second attempt.';
export const CANONICAL_FEEDBACK_DIRECTIVE =
  'If explanation is needed, give a focused supported explanation first. Then show one clearly labelled canonical target, copying its ordered parts exactly. Otherwise show only the target. Do not dump the full lesson or change the grade.';
export const CANONICAL_REPAIR_DIRECTIVE =
  'Do not invent a memorization target. Clarify the source/scope or repair canonical material without submitting another learner attempt or changing a grade.';

export function countCanonicalWords(text: string | null | undefined): number {
  if (typeof text !== 'string') return 0;
  const trimmed = text.replace(/^\p{White_Space}+|\p{White_Space}+$/gu, '');
  return trimmed.length === 0 ? 0 : trimmed.split(/\p{White_Space}+/u).length;
}

export function validateCanonicalScope(scope: CanonicalScope | null | undefined): boolean {
  try {
    if (!scope || !scope.language?.trim() || !scope.parts?.length || !scope.sources?.length) {
      return false;
    }
    const partIds = scope.parts.map(p => p.partId);
    const sourceIds = scope.sources.map(s => `${s.kind}:${s.sourceId}`);
    return (
      new Set(partIds).size === partIds.length &&
      new Set(sourceIds).size === sourceIds.length &&
      scope.parts.every(
        p =>
          p.partId.trim().length > 0 &&
          p.requiredFacts.length > 0 &&
          p.requiredFacts.every(f => f.trim().length > 0) &&
          new Set(p.requiredFacts).size === p.requiredFacts.length
      ) &&
      scope.sources.every(
        s =>
          s.sourceId.trim().length > 0 &&
          s.components.length > 0 &&
          new Set(s.components).size === s.components.length &&
          (s.kind === 'chunk'
            ? s.components.every(c => c === 'content' || c === 'condensed_summary')
            : s.kind === 'topic' && s.components.length === 1 && s.components[0] === 'summary')
      )
    );
  } catch {
    return false;
  }
}

export function validateCanonicalParts(
  scope: CanonicalScope | null | undefined,
  parts: CanonicalPart[] | null | undefined
): { ok: true } | { ok: false; reason: string } {
  if (!validateCanonicalScope(scope)) return { ok: false, reason: 'invalid_scope' };
  if (!scope || !Array.isArray(parts) || parts.length !== scope.parts.length) {
    return { ok: false, reason: 'part_count_mismatch' };
  }
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part || part.partId !== scope.parts[i]?.partId) {
      return { ok: false, reason: 'part_identity_mismatch' };
    }
    const count = countCanonicalWords(part.text);
    if (count === 0) return { ok: false, reason: 'empty_part' };
    if (count > CANONICAL_WORD_LIMIT) return { ok: false, reason: 'word_limit_exceeded' };
  }
  return { ok: true };
}

export function parseCanonicalMaterial(
  scope: CanonicalScope | null | undefined,
  input: unknown
): { ok: true; material: CanonicalMaterial } | { ok: false; reason: string } {
  try {
    const parsed = CanonicalMaterialSchema.safeParse(input);
    if (!parsed.success) return { ok: false, reason: 'invalid_material' };
    if (parsed.data.kind === 'candidate') {
      const validation = validateCanonicalParts(scope, parsed.data.parts);
      if (!validation.ok) return validation;
    }
    return { ok: true, material: parsed.data };
  } catch {
    return { ok: false, reason: 'invalid_material' };
  }
}

export function canonicalScopeKey(scope: CanonicalScope): string {
  if (!validateCanonicalScope(scope)) return '';
  return JSON.stringify({
    language: scope.language,
    parts: scope.parts,
    sources: [...scope.sources].sort(compareCanonicalSources),
  });
}

export function canonicalFeedbackEligible(input: {
  mode: string;
  questionType: string | null;
  attemptNumber: number;
  passed: boolean;
  actualPromptText: string | null | undefined;
}): boolean {
  return (
    input.mode !== 'assessment' &&
    input.questionType === 'recall' &&
    (input.attemptNumber === 2 || (input.attemptNumber === 1 && input.passed)) &&
    typeof input.actualPromptText === 'string' &&
    input.actualPromptText.trim().length > 0
  );
}

export function canonicalUnavailable(reason: string): CanonicalResult & { status: 'unavailable' } {
  return { status: 'unavailable', reason, directive: CANONICAL_REPAIR_DIRECTIVE };
}
