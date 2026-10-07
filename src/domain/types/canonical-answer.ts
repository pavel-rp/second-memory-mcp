import { z } from 'zod';

const identifier = z.string().trim().min(1).max(256);
const fingerprint = z.string().regex(/^[a-f0-9]{64}$/);

/** Code-unit order keeps source identity and lock order independent of host locale. */
export function compareCanonicalSources(
  left: { kind: string; sourceId: string },
  right: { kind: string; sourceId: string }
): number {
  const a = `${left.kind}:${left.sourceId}`;
  const b = `${right.kind}:${right.sourceId}`;
  return a < b ? -1 : a > b ? 1 : 0;
}

export const CanonicalPartSchema = z
  .object({
    part_id: identifier,
    text: z.string().min(1).max(16000),
  })
  .strict()
  .transform(({ part_id, text }) => ({ partId: part_id, text }));

const sourceSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('chunk'),
      source_id: identifier,
      components: z
        .array(z.enum(['content', 'condensed_summary']))
        .min(1)
        .max(2),
    })
    .strict(),
  z
    .object({
      kind: z.literal('topic'),
      source_id: identifier,
      components: z.array(z.literal('summary')).length(1),
    })
    .strict(),
]);

export const CanonicalScopeSchema = z
  .object({
    language: identifier,
    parts: z
      .array(
        z
          .object({
            part_id: identifier,
            required_facts: z.array(identifier).min(1).max(64),
          })
          .strict()
      )
      .min(1)
      .max(32),
    sources: z.array(sourceSchema).min(1).max(32),
  })
  .strict()
  .transform(({ language, parts, sources }) => ({
    language,
    parts: parts.map(p => ({ partId: p.part_id, requiredFacts: p.required_facts })),
    sources: sources
      .map(s => ({
        kind: s.kind,
        sourceId: s.source_id,
        components: [...s.components].sort(),
      }))
      .sort(compareCanonicalSources),
  }));

export type CanonicalScope = z.output<typeof CanonicalScopeSchema>;
export type CanonicalPart = z.output<typeof CanonicalPartSchema>;
export type CanonicalSourceSnapshot = {
  kind: 'chunk' | 'topic';
  sourceId: string;
  version: number | null;
  digest: string;
};
export type CanonicalObservation = {
  fingerprint: string;
  sources: CanonicalSourceSnapshot[];
};
export type CanonicalHead = { version: number; revisionId: string | null };
export type CanonicalAnswer = {
  identityId: string;
  revisionId: string;
  headVersion: number;
  scope: CanonicalScope;
  observation: CanonicalObservation;
  parts: CanonicalPart[];
};
export type CanonicalFeedbackReference = {
  sessionQuestionId: string;
  attemptNumber: 1 | 2;
};
export type CanonicalResult =
  | { status: 'ready'; answer: CanonicalAnswer; directive: string }
  | { status: 'miss'; observation: CanonicalObservation; head?: CanonicalHead; directive: string }
  | {
      status: 'unavailable' | 'withheld';
      reason: string;
      directive: string;
      observation?: CanonicalObservation;
      head?: CanonicalHead;
    };

export const CanonicalMaterialSchema = z
  .discriminatedUnion('kind', [
    z
      .object({
        kind: z.literal('candidate'),
        expected_fingerprint: fingerprint,
        parts: z.array(CanonicalPartSchema).min(1).max(32),
      })
      .strict(),
    z.object({ kind: z.literal('reference'), revision_id: identifier }).strict(),
    z
      .object({ kind: z.literal('unavailable'), reason: z.string().trim().min(1).max(1024) })
      .strict(),
  ])
  .transform(material => {
    if (material.kind === 'candidate') {
      return {
        kind: material.kind,
        expectedFingerprint: material.expected_fingerprint,
        parts: material.parts,
      };
    }
    if (material.kind === 'reference') {
      return { kind: material.kind, revisionId: material.revision_id };
    }
    return material;
  });
export type CanonicalMaterial = z.output<typeof CanonicalMaterialSchema>;

const contextShape = {
  session_id: identifier,
  question_scope: CanonicalScopeSchema,
  purpose: z.enum(['preparation', 'feedback']).default('preparation'),
  session_question_id: identifier.optional(),
  attempt_number: z.union([z.literal(1), z.literal(2)]).optional(),
  context_token: z.string().min(1),
};

function validPurpose(data: {
  purpose: string;
  session_question_id?: string;
  attempt_number?: number;
}): boolean {
  return data.purpose === 'feedback'
    ? data.session_question_id !== undefined && data.attempt_number !== undefined
    : data.session_question_id === undefined && data.attempt_number === undefined;
}

export const GetCanonicalAnswerInputShape = {
  ...contextShape,
  revision_id: identifier.optional(),
};
export const GetCanonicalAnswerInputSchema = z
  .object(GetCanonicalAnswerInputShape)
  .refine(validPurpose, 'Feedback requires its question and attempt; preparation names neither.')
  .transform(data => ({
    sessionId: data.session_id,
    scope: data.question_scope,
    revisionId: data.revision_id,
    feedback:
      data.purpose === 'feedback' &&
      data.session_question_id !== undefined &&
      data.attempt_number !== undefined
        ? { sessionQuestionId: data.session_question_id, attemptNumber: data.attempt_number }
        : undefined,
  }));
export type GetCanonicalAnswerInput = {
  sessionId: string;
  scope: CanonicalScope;
  revisionId?: string;
  feedback?: CanonicalFeedbackReference;
};

export const SaveCanonicalAnswerInputShape = {
  ...contextShape,
  operation: z.enum(['accept', 'correct', 'invalidate']),
  expected_fingerprint: fingerprint,
  parts: z.array(CanonicalPartSchema).min(1).max(32).optional(),
  expected_head_version: z.number().int().min(0).optional(),
  expected_revision_id: identifier.nullable().optional(),
  correction_reason: z.string().trim().min(1).max(1024).optional(),
};
export const SaveCanonicalAnswerInputSchema = z
  .object(SaveCanonicalAnswerInputShape)
  .refine(validPurpose, 'Feedback requires its question and attempt; preparation names neither.')
  .superRefine((data, ctx) => {
    if ((data.operation === 'invalidate') === (data.parts !== undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Accept/correct require parts; invalidate accepts none.',
      });
    }
    if (
      data.operation !== 'accept' &&
      (data.expected_head_version === undefined ||
        data.expected_revision_id === undefined ||
        data.correction_reason === undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Correction/invalidation require expected head, revision and reason.',
      });
    }
  })
  .transform(data => ({
    sessionId: data.session_id,
    scope: data.question_scope,
    operation: data.operation,
    expectedFingerprint: data.expected_fingerprint,
    parts: data.parts,
    expectedHeadVersion: data.expected_head_version,
    expectedRevisionId: data.expected_revision_id,
    correctionReason: data.correction_reason,
    feedback:
      data.purpose === 'feedback' &&
      data.session_question_id !== undefined &&
      data.attempt_number !== undefined
        ? { sessionQuestionId: data.session_question_id, attemptNumber: data.attempt_number }
        : undefined,
  }));
export type SaveCanonicalAnswerInput = {
  sessionId: string;
  scope: CanonicalScope;
  operation: 'accept' | 'correct' | 'invalidate';
  expectedFingerprint: string;
  parts?: CanonicalPart[];
  expectedHeadVersion?: number;
  expectedRevisionId?: string | null;
  correctionReason?: string;
  feedback?: CanonicalFeedbackReference;
};

export type CanonicalReadRequest = GetCanonicalAnswerInput & { learnerKey: string };
export type CanonicalWriteRequest = SaveCanonicalAnswerInput & { learnerKey: string };

export interface CanonicalAnswerRepository {
  read(input: CanonicalReadRequest): Promise<CanonicalResult>;
  save(input: CanonicalWriteRequest): Promise<CanonicalResult>;
}
