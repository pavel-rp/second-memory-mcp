import type { SessionRepository } from '../ports/session-repository.js';
import type { ChunkRepository, ChunkMinimalMetadata } from '../ports/chunk-repository.js';
import type { NotesRepository } from '../ports/notes-repository.js';
import type { AlgorithmConfig } from '../domain/config/algorithm.js';
import type {
  RemediationPlan,
  WeakChunk,
  PrerequisiteChunk,
  GapNoteWritten,
  RecommendedSession,
  SrScheduleDelta,
} from '../domain/types/remediation.js';
import type { ServiceResult } from '../domain/types/service-result.js';
import { serviceOk, serviceFail } from '../domain/types/service-result.js';
import { generateRecommendations } from './recommendation-workflows.js';
import { logEvent, getRequestLogger } from '../shared/logger.js';

export type RemediationDeps = {
  sessions: SessionRepository;
  chunks: ChunkRepository;
  notes: NotesRepository;
  algorithmConfig: AlgorithmConfig;
};

export async function recommendRemediation(
  sessionId: string,
  deps: RemediationDeps,
  now: Date
): Promise<ServiceResult<RemediationPlan>> {
  const session = await deps.sessions.getSessionById(sessionId);
  if (!session) {
    return serviceFail({ type: 'not_found', message: `Session not found: ${sessionId}` });
  }
  if (session.status !== 'completed') {
    return serviceFail({
      type: 'validation',
      message: `Session is not completed (status: ${session.status})`,
    });
  }

  const sessionInput = await deps.sessions.convertSessionToSessionInput(sessionId);
  if (!sessionInput) {
    return serviceFail({ type: 'not_found', message: `Session data unavailable: ${sessionId}` });
  }

  const directlyFailedChunkIds = new Set<string>();
  for (const chunk of sessionInput.chunks) {
    if (chunk.attempts.some(a => !a.passed)) {
      directlyFailedChunkIds.add(chunk.chunk_id);
    }
  }

  const allSessionChunkIds = sessionInput.chunks.map(c => c.chunk_id);
  const chunkMetadata =
    allSessionChunkIds.length > 0
      ? await deps.chunks.batchFetchMinimal({ chunkIds: allSessionChunkIds })
      : [];
  const chunkMetaMap = new Map(chunkMetadata.map(c => [c.id, c]));

  const weakChunks: WeakChunk[] = [];

  for (const chunkId of directlyFailedChunkIds) {
    const meta = chunkMetaMap.get(chunkId);
    if (!meta) continue;
    weakChunks.push({
      chunkId: meta.id,
      topicId: meta.topicId,
      easeFactor: meta.easeFactor,
      leech: meta.chunkType === 'remediation',
      reasonCode: meta.chunkType === 'remediation' ? 'LEECH_THRESHOLD' : 'WEAK_AFTER_ASSESSMENT',
    });
  }

  for (const meta of chunkMetadata) {
    if (meta.chunkType === 'remediation' && !directlyFailedChunkIds.has(meta.id)) {
      weakChunks.push({
        chunkId: meta.id,
        topicId: meta.topicId,
        easeFactor: meta.easeFactor,
        leech: true,
        reasonCode: 'LEECH_THRESHOLD',
      });
    }
  }

  const hasLeeches = weakChunks.some(w => w.leech);

  const prerequisiteChunks = await walkPrerequisites(
    directlyFailedChunkIds,
    chunkMetaMap,
    allSessionChunkIds,
    deps
  );

  const srScheduleDelta = computeSrDelta(sessionInput.chunks, directlyFailedChunkIds);

  const gapNotesWritten = await writeGapNotes(directlyFailedChunkIds, sessionId, now, deps);

  let recommendedNextSession: RecommendedSession;

  if (weakChunks.length === 0) {
    recommendedNextSession = await buildNewMaterialRecommendation(session.topicId, deps, now);
  } else {
    const weakChunkIds = weakChunks.map(w => w.chunkId);
    const sessionChunkMap = new Map(sessionInput.chunks.map(c => [c.chunk_id, c]));
    const totalDuration = weakChunks.reduce((sum, w) => {
      const sc = sessionChunkMap.get(w.chunkId);
      return sum + (sc?.estimated_duration ?? 10);
    }, 0);

    recommendedNextSession = {
      mode: hasLeeches ? 'scaffolding' : 'review',
      topicId: session.topicId,
      chunkIds: weakChunkIds,
      estimatedDurationMinutes: totalDuration,
      reasonCode: hasLeeches ? 'LEECH_THRESHOLD' : 'WEAK_AFTER_ASSESSMENT',
    };
  }

  const plan: RemediationPlan = {
    weakChunks,
    prerequisiteChunksToRevisit: prerequisiteChunks,
    recommendedNextSession,
    srScheduleDelta,
    gapNotesWritten,
  };

  logEvent('recommendRemediation', 'remediation_plan_generated', {
    sessionId,
    weakChunkCount: weakChunks.length,
    prerequisiteCount: prerequisiteChunks.length,
    gapNotesCount: gapNotesWritten.length,
    plan,
  });

  return serviceOk(plan);
}

async function walkPrerequisites(
  directlyFailedChunkIds: Set<string>,
  chunkMetaMap: Map<string, ChunkMinimalMetadata>,
  sessionChunkIds: string[],
  deps: RemediationDeps
): Promise<PrerequisiteChunk[]> {
  const prereqIds = new Set<string>();
  const sessionChunkIdSet = new Set(sessionChunkIds);

  for (const chunkId of directlyFailedChunkIds) {
    const meta = chunkMetaMap.get(chunkId);
    if (!meta?.prerequisitesJson) continue;
    for (const prereqId of meta.prerequisitesJson) {
      if (!directlyFailedChunkIds.has(prereqId) && !sessionChunkIdSet.has(prereqId)) {
        prereqIds.add(prereqId);
      }
    }
  }

  if (prereqIds.size === 0) return [];

  const prereqMetadata = await deps.chunks.batchFetchMinimal({
    chunkIds: [...prereqIds],
  });

  const threshold = deps.algorithmConfig.weakAreaEaseThreshold;
  return prereqMetadata
    .filter(p => p.easeFactor < threshold)
    .map(p => ({
      chunkId: p.id,
      easeFactor: p.easeFactor,
      reasonCode: 'PREREQ_LOW_EASE' as const,
    }));
}

function computeSrDelta(
  sessionChunks: Array<{ chunk_id: string; repetitions?: number }>,
  directlyFailedChunkIds: Set<string>
): SrScheduleDelta {
  let chunksDemoted = 0;
  let chunksRescheduledSooner = 0;

  for (const chunk of sessionChunks) {
    if (directlyFailedChunkIds.has(chunk.chunk_id)) {
      chunksRescheduledSooner++;
      if ((chunk.repetitions ?? 0) > 0) {
        chunksDemoted++;
      }
    }
  }

  return { chunksDemoted, chunksRescheduledSooner };
}

async function writeGapNotes(
  directlyFailedChunkIds: Set<string>,
  sessionId: string,
  now: Date,
  deps: RemediationDeps
): Promise<GapNoteWritten[]> {
  const isoDate = now.toISOString().split('T')[0];

  const settled = await Promise.allSettled(
    [...directlyFailedChunkIds].map(async chunkId => {
      const note = await deps.notes.createNote({
        targetType: 'chunk',
        targetId: chunkId,
        noteType: 'gap',
        content: `Gap identified in session ${sessionId} on ${isoDate}`,
        author: 'agent',
      });
      return { chunkId, noteId: note.id } satisfies GapNoteWritten;
    })
  );

  const rejected = settled.filter(r => r.status === 'rejected');
  if (rejected.length > 0) {
    getRequestLogger().warn(
      `writeGapNotes: ${rejected.length} of ${settled.length} gap note writes failed`
    );
  }

  return settled
    .filter((r): r is PromiseFulfilledResult<GapNoteWritten> => r.status === 'fulfilled')
    .map(r => r.value);
}

async function buildNewMaterialRecommendation(
  topicId: string | null,
  deps: RemediationDeps,
  now: Date
): Promise<RecommendedSession> {
  const recommendationDeps = {
    chunks: deps.chunks,
    algorithmConfig: deps.algorithmConfig,
  };

  const result = await generateRecommendations({}, recommendationDeps, now);

  if (result.recommendations.length > 0) {
    const topRec = result.recommendations[0];
    return {
      mode: 'learning',
      topicId: topRec.topicId,
      chunkIds: topRec.dueChunkIds,
      estimatedDurationMinutes: topRec.estimatedDuration,
      reasonCode: 'NEW_MATERIAL',
    };
  }

  return {
    mode: 'learning',
    topicId,
    chunkIds: [],
    estimatedDurationMinutes: 0,
    reasonCode: 'NEW_MATERIAL',
  };
}
