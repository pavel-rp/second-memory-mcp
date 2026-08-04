import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerAnalyticsTools } from '../../../src/server/analytics-tools.js';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import {
  learningTopics,
  learningChunks,
  learningSessions,
  sessionChunks,
  sessionQuestions,
  sessionQuestionChunks,
  sessionQuestionAttempts,
} from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { CaptureServer, parseToolResult } from '../../helpers/capture-server.js';

type ToolEntry = { spec: any; handler: Function };

type RetentionCellResponse = {
  key: string;
  sample_size: number;
  retained: number;
  true_retention_rate: number | null;
  eventual_passed: number;
  eventual_pass_rate: number | null;
  below_min_sample: boolean;
};

/** One snake_case calibration bin as it crosses the MCP boundary (NEU-846). */
type CalibrationBinResponse = {
  key: string;
  sample_size: number;
  observed_passed: number;
  observed_pass_rate: number | null;
  mean_predicted_recall: number | null;
  calibration_gap: number | null;
  below_min_sample: boolean;
};

/** The ten fixed bin keys, in emission order. */
const CALIBRATION_BIN_KEYS = [
  '0.0-0.1',
  '0.1-0.2',
  '0.2-0.3',
  '0.3-0.4',
  '0.4-0.5',
  '0.5-0.6',
  '0.6-0.7',
  '0.7-0.8',
  '0.8-0.9',
  '0.9-1.0',
];

function findBin(bins: CalibrationBinResponse[], key: string): CalibrationBinResponse {
  const bin = bins.find(candidate => candidate.key === key);
  expect(bin).toBeDefined();
  return bin as CalibrationBinResponse;
}

const TOPIC_ID = 'topic-health';
const CHUNK_A = 'chunk-health-a';
const CHUNK_B = 'chunk-health-b';
const SESSION_ID = 'session-health';

/** A question to seed: its chunk mapping, its outcomes and its scheduling snapshot. */
type SeedQuestion = {
  id: string;
  chunkIds: string[];
  firstPassed: boolean;
  /** Present only when the question got an `attempt_number = 2` pivot-hint retry. */
  retryPassed?: boolean;
  band: string | null;
  predictedRecall: number | null;
  intervalDays: number | null;
  daysOverdue: number | null;
};

function findCell(cells: RetentionCellResponse[], key: string): RetentionCellResponse {
  const cell = cells.find(candidate => candidate.key === key);
  expect(cell).toBeDefined();
  return cell as RetentionCellResponse;
}

/**
 * The seeded population, hand-computed:
 *
 *   established : 23  (12 on chunk A @ interval 10 / overdue 0,
 *                      10 on chunk B @ interval 30 / overdue 5,
 *                       1 multi-chunk @ interval 3 / overdue 0)
 *   retained    : 17  (9 + 7 + 1)
 *   eventual    : 18  (one chunk-A failure passed its retry)
 *   fresh       :  2  (1 passed)
 *   uncovered   :  3
 *   total       : 28
 */
function seedPlan(): SeedQuestion[] {
  const questions: SeedQuestion[] = [];

  // 12 established observations on chunk A — 9 pass, 3 fail, one of which
  // passes the pivot-hint retry (so it lowers true retention but raises
  // eventual pass).
  for (let i = 0; i < 12; i += 1) {
    questions.push({
      id: `q-a-${i}`,
      chunkIds: [CHUNK_A],
      firstPassed: i < 9,
      retryPassed: i === 9 ? true : undefined,
      band: 'established',
      predictedRecall: 0.85,
      intervalDays: 10,
      daysOverdue: 0,
    });
  }

  // 10 established observations on chunk B — 7 pass, 3 fail, no retries.
  for (let i = 0; i < 10; i += 1) {
    questions.push({
      id: `q-b-${i}`,
      chunkIds: [CHUNK_B],
      firstPassed: i < 7,
      band: 'established',
      predictedRecall: 0.7,
      intervalDays: 30,
      daysOverdue: 5,
    });
  }

  // One question mapped to BOTH chunks. It must yield exactly one observation
  // with no single teaching tier — proving the session_question_chunks join
  // does not fan out.
  questions.push({
    id: 'q-multi',
    chunkIds: [CHUNK_A, CHUNK_B],
    firstPassed: true,
    band: 'established',
    predictedRecall: 0.95,
    intervalDays: 3,
    daysOverdue: 0,
  });

  // Fresh-band observations — excluded from the headline, reported separately.
  questions.push({
    id: 'q-fresh-0',
    chunkIds: [CHUNK_A],
    firstPassed: true,
    band: 'fresh',
    predictedRecall: null,
    intervalDays: null,
    daysOverdue: 0,
  });
  questions.push({
    id: 'q-fresh-1',
    chunkIds: [CHUNK_A],
    firstPassed: false,
    band: 'fresh',
    predictedRecall: null,
    intervalDays: null,
    daysOverdue: 0,
  });

  // Uncovered observations — coverage denominator only, no rate anywhere.
  for (let i = 0; i < 3; i += 1) {
    questions.push({
      id: `q-uncovered-${i}`,
      chunkIds: [CHUNK_A],
      firstPassed: i !== 1,
      band: null,
      predictedRecall: null,
      intervalDays: null,
      daysOverdue: null,
    });
  }

  return questions;
}

async function seedDatabase(): Promise<void> {
  const db = getSql();
  const now = Date.now();

  await db.insert(learningTopics).values({
    id: TOPIC_ID,
    title: 'Scheduler Health',
    subject: 'Meta',
    createdAt: now,
    updatedAt: now,
  });

  const chunkRows = [CHUNK_A, CHUNK_B].map((chunkId, index) => ({
    id: chunkId,
    topicId: TOPIC_ID,
    title: `Chunk ${chunkId}`,
    subject: 'Meta',
    difficulty: 5,
    nextReviewAt: now,
    easeFactor: 2.5,
    repetitions: 3,
    estimatedDuration: 10,
    chunkType: 'review',
    orderIndex: index + 1,
    createdAt: now,
    updatedAt: now,
  }));
  await db.insert(learningChunks).values(chunkRows);

  await db.insert(learningSessions).values({
    id: SESSION_ID,
    topicId: TOPIC_ID,
    mode: 'review',
    status: 'completed',
    startTime: now,
    endTime: now + 600_000,
    createdAt: now,
    updatedAt: now,
  });

  // The teaching tier lives here, joined on (session_id, chunk_id).
  await db.insert(sessionChunks).values([
    {
      id: 'sc-a',
      sessionId: SESSION_ID,
      chunkId: CHUNK_A,
      status: 'completed',
      teachingApproach: 'recall',
      timeSpentMs: 1000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sc-b',
      sessionId: SESSION_ID,
      chunkId: CHUNK_B,
      status: 'completed',
      teachingApproach: 'cued_recall',
      timeSpentMs: 1000,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const plan = seedPlan();

  const questionRows = plan.map((question, index) => ({
    id: question.id,
    sessionId: SESSION_ID,
    questionIndex: index + 1,
    promptText: `Prompt for ${question.id}`,
    status: 'answered',
    createdAt: now,
    updatedAt: now,
  }));
  await db.insert(sessionQuestions).values(questionRows);

  const mappingRows = plan.flatMap(question =>
    question.chunkIds.map(chunkId => ({
      id: `sqc-${question.id}-${chunkId}`,
      sessionQuestionId: question.id,
      chunkId,
    }))
  );
  await db.insert(sessionQuestionChunks).values(mappingRows);

  const firstAttemptRows = plan.map(question => ({
    id: `sqa-${question.id}-1`,
    sessionQuestionId: question.id,
    attemptNumber: 1,
    response: 'answer',
    passed: question.firstPassed,
    feedback: 'feedback',
    timeSpentMs: 5000,
    createdAt: now,
    snapshotBand: question.band,
    snapshotPredictedRecall: question.predictedRecall,
    snapshotIntervalDays: question.intervalDays,
    snapshotDaysOverdue: question.daysOverdue,
  }));
  await db.insert(sessionQuestionAttempts).values(firstAttemptRows);

  // The pivot-hint retry carries no snapshot of its own — the observation is
  // always the attempt-1 row, and this row only contributes to eventual pass.
  const retryRows = plan
    .filter(question => question.retryPassed !== undefined)
    .map(question => ({
      id: `sqa-${question.id}-2`,
      sessionQuestionId: question.id,
      attemptNumber: 2,
      response: 'second answer',
      passed: question.retryPassed === true,
      feedback: 'feedback',
      timeSpentMs: 3000,
      createdAt: now + 1000,
      snapshotBand: null,
      snapshotPredictedRecall: null,
      snapshotIntervalDays: null,
      snapshotDaysOverdue: null,
    }));
  await db.insert(sessionQuestionAttempts).values(retryRows);
}

describe('Integration: analytics_health tool', () => {
  let server: CaptureServer;
  let analyticsHealth: ToolEntry;

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerAnalyticsTools(server as any, createAppContext({ embedding: undefined }));
    analyticsHealth = server.tools.get('analytics_health')!;
    expect(analyticsHealth).toBeDefined();
  });
  afterAll(teardownTestDb);

  it('registers analytics_health with a context_token input schema', () => {
    expect(analyticsHealth.spec.inputSchema).toBeDefined();
    expect(analyticsHealth.spec.inputSchema.context_token).toBeDefined();
  });

  it('returns a complete well-formed payload when there is no history at all', async () => {
    const result = await analyticsHealth.handler({ context_token: 'ctx-test' });
    const parsed = parseToolResult(result);

    expect(parsed.status).toBe('ok');
    expect(parsed.data.min_sample_size).toBe(20);
    // NEU-846: calibration is always an object, never null — at zero
    // observations it is a complete payload with zero counts and null rates.
    expect(parsed.data.calibration.coverage).toEqual({
      total_first_attempts: 0,
      calibration_observations: 0,
      excluded_fresh_band: 0,
      excluded_uncovered: 0,
      coverage_ratio: 0,
    });
    expect(parsed.data.calibration.overall).toEqual({
      sample_size: 0,
      observed_passed: 0,
      observed_pass_rate: null,
      mean_predicted_recall: null,
      calibration_gap: null,
      below_min_sample: true,
      log_loss: null,
      rmse_bins: null,
    });
    expect(parsed.data.calibration.min_sample_size).toBe(20);
    expect(parsed.data.calibration.bin_edges).toEqual([
      0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ]);
    expect(parsed.data.calibration.log_loss_epsilon).toBe(1e-6);
    const emptyBins: CalibrationBinResponse[] = parsed.data.calibration.bins;
    expect(emptyBins.map(bin => bin.key)).toEqual(CALIBRATION_BIN_KEYS);
    expect(emptyBins.every(bin => bin.below_min_sample)).toBe(true);
    expect(emptyBins.reduce((sum, bin) => sum + bin.sample_size, 0)).toBe(0);
    expect(parsed.data.coverage).toEqual({
      total_first_attempts: 0,
      covered_first_attempts: 0,
      uncovered_first_attempts: 0,
      coverage_ratio: 0,
      established_first_attempts: 0,
      fresh_first_attempts: 0,
    });
    expect(parsed.data.true_retention.sample_size).toBe(0);
    expect(parsed.data.true_retention.true_retention_rate).toBeNull();
    expect(parsed.data.true_retention.below_min_sample).toBe(true);
    expect(parsed.data.breakdowns.by_teaching_tier).toHaveLength(5);
    expect(parsed.data.breakdowns.by_interval_band).toHaveLength(4);
    expect(parsed.data.breakdowns.by_days_overdue_band).toHaveLength(4);
  });

  describe('over a seeded population', () => {
    beforeEach(seedDatabase);

    it('reports the hand-computed headline over the established band', async () => {
      const result = await analyticsHealth.handler({ context_token: 'ctx-test' });
      const parsed = parseToolResult(result);

      expect(parsed.status).toBe('ok');
      // 17 of 23 passed on attempt 1 → 0.7391; 18 of 23 eventually → 0.7826.
      expect(parsed.data.true_retention).toEqual({
        key: 'established',
        sample_size: 23,
        retained: 17,
        true_retention_rate: 0.7391,
        eventual_passed: 18,
        eventual_pass_rate: 0.7826,
        below_min_sample: false,
      });
    });

    it('reports honest coverage including the uncovered rows', async () => {
      const result = await analyticsHealth.handler({ context_token: 'ctx-test' });
      const parsed = parseToolResult(result);

      // 28 first attempts total, one per seeded question — the multi-chunk
      // question contributes exactly one, proving the join does not fan out.
      expect(parsed.data.coverage).toEqual({
        total_first_attempts: 28,
        covered_first_attempts: 25,
        uncovered_first_attempts: 3,
        coverage_ratio: 0.8929,
        established_first_attempts: 23,
        fresh_first_attempts: 2,
      });
      expect(parsed.data.min_sample_size).toBe(20);
      expect(parsed.data.band_definitions).toEqual({
        interval_band_edges_days: [1, 7, 21, 60],
        days_overdue_band_edges_days: [1, 3, 7],
      });
      // NEU-846 widened this key from null to an object; every other key on the
      // payload is unchanged.
      expect(parsed.data.calibration).not.toBeNull();
      expect(typeof parsed.data.calibration).toBe('object');
      expect(typeof parsed.data.generated_at).toBe('string');
    });

    it('reports the hand-computed calibration block in snake_case', async () => {
      const result = await analyticsHealth.handler({ context_token: 'ctx-test' });
      const parsed = parseToolResult(result);

      // 23 established rows carry a prediction: 12 @ 0.85 (9 pass), 10 @ 0.7
      // (7 pass), 1 @ 0.95 (pass). The 2 fresh and 3 uncovered rows have no
      // stored prediction and are excluded — counted, never silently dropped.
      expect(parsed.data.calibration.coverage).toEqual({
        total_first_attempts: 28,
        calibration_observations: 23,
        excluded_fresh_band: 2,
        excluded_uncovered: 3,
        coverage_ratio: 0.8214,
      });
      // logLoss = −(1/23)·[9·ln0.85 + 3·ln0.15 + 7·ln0.7 + 3·ln0.3 + ln0.95]
      //         = 13.3139666/23 = 0.5789
      // rmseBins = sqrt((12·0.10² + 1·0.05²)/23) = sqrt(0.1225/23) = 0.0730
      expect(parsed.data.calibration.overall).toEqual({
        sample_size: 23,
        observed_passed: 17,
        observed_pass_rate: 0.7391,
        mean_predicted_recall: 0.7891,
        calibration_gap: 0.05,
        below_min_sample: false,
        log_loss: 0.5789,
        rmse_bins: 0.073,
      });
    });

    it('bins the calibration observations and keeps their counts under suppression', async () => {
      const result = await analyticsHealth.handler({ context_token: 'ctx-test' });
      const parsed = parseToolResult(result);
      const bins: CalibrationBinResponse[] = parsed.data.calibration.bins;

      expect(bins.map(bin => bin.key)).toEqual(CALIBRATION_BIN_KEYS);
      // Every bin is under the sample-size minimum, so the rates suppress while
      // the counts survive — and the p = 0.95 row lands in the top bin, which is
      // closed at 1.0 rather than half-open, so it is never dropped.
      expect(findBin(bins, '0.7-0.8')).toEqual({
        key: '0.7-0.8',
        sample_size: 10,
        observed_passed: 7,
        observed_pass_rate: null,
        mean_predicted_recall: null,
        calibration_gap: null,
        below_min_sample: true,
      });
      expect(findBin(bins, '0.8-0.9').sample_size).toBe(12);
      expect(findBin(bins, '0.8-0.9').observed_passed).toBe(9);
      expect(findBin(bins, '0.9-1.0').sample_size).toBe(1);
      expect(findBin(bins, '0.0-0.1').sample_size).toBe(0);
      expect(bins.reduce((sum, bin) => sum + bin.sample_size, 0)).toBe(23);
    });

    it('keeps every pre-existing top-level key alongside calibration', async () => {
      const result = await analyticsHealth.handler({ context_token: 'ctx-test' });
      const parsed = parseToolResult(result);

      expect(Object.keys(parsed.data).sort()).toEqual([
        'band_definitions',
        'breakdowns',
        'calibration',
        'coverage',
        'fresh_band_retention',
        'generated_at',
        'min_sample_size',
        'true_retention',
      ]);
    });

    it('reports the fresh band separately from the headline', async () => {
      const result = await analyticsHealth.handler({ context_token: 'ctx-test' });
      const parsed = parseToolResult(result);

      expect(parsed.data.fresh_band_retention).toEqual({
        key: 'fresh',
        sample_size: 2,
        retained: 1,
        true_retention_rate: null,
        eventual_passed: 1,
        eventual_pass_rate: null,
        below_min_sample: true,
      });
    });

    it('resolves the teaching tier per question and never fans out', async () => {
      const result = await analyticsHealth.handler({ context_token: 'ctx-test' });
      const parsed = parseToolResult(result);
      const tiers: RetentionCellResponse[] = parsed.data.breakdowns.by_teaching_tier;

      expect(tiers.map(cell => cell.key)).toEqual([
        'recall',
        'cued_recall',
        'reteach',
        'scaffold',
        'unknown',
      ]);
      // chunk A's 12 questions: 9 retained, and one failure passed its retry.
      expect(findCell(tiers, 'recall')).toEqual({
        key: 'recall',
        sample_size: 12,
        retained: 9,
        true_retention_rate: null,
        eventual_passed: 10,
        eventual_pass_rate: null,
        below_min_sample: true,
      });
      expect(findCell(tiers, 'cued_recall').sample_size).toBe(10);
      expect(findCell(tiers, 'cued_recall').retained).toBe(7);
      // The multi-chunk question has no single tier.
      expect(findCell(tiers, 'unknown').sample_size).toBe(1);
      expect(findCell(tiers, 'reteach').sample_size).toBe(0);
      expect(findCell(tiers, 'scaffold').sample_size).toBe(0);
      expect(tiers.reduce((sum, cell) => sum + cell.sample_size, 0)).toBe(23);
    });

    it('bands the established population by interval', async () => {
      const result = await analyticsHealth.handler({ context_token: 'ctx-test' });
      const parsed = parseToolResult(result);
      const bands: RetentionCellResponse[] = parsed.data.breakdowns.by_interval_band;
      const sizes = bands.map(cell => ({
        key: cell.key,
        sample_size: cell.sample_size,
      }));

      expect(sizes).toEqual([
        { key: '1-6d', sample_size: 1 },
        { key: '7-20d', sample_size: 12 },
        { key: '21-59d', sample_size: 10 },
        { key: '60d+', sample_size: 0 },
      ]);
      expect(bands.reduce((sum, cell) => sum + cell.sample_size, 0)).toBe(23);
    });

    it('bands overdue attempts without ever excluding them', async () => {
      const result = await analyticsHealth.handler({ context_token: 'ctx-test' });
      const parsed = parseToolResult(result);
      const bands: RetentionCellResponse[] = parsed.data.breakdowns.by_days_overdue_band;
      const sizes = bands.map(cell => ({
        key: cell.key,
        sample_size: cell.sample_size,
      }));

      // The 10 chunk-B attempts are 5 days overdue and still count toward the
      // headline; they simply land in the 3-6d band.
      expect(sizes).toEqual([
        { key: 'on_time', sample_size: 13 },
        { key: '1-2d', sample_size: 0 },
        { key: '3-6d', sample_size: 10 },
        { key: '7d+', sample_size: 0 },
      ]);
      expect(bands.reduce((sum, cell) => sum + cell.sample_size, 0)).toBe(23);
    });

    it('suppresses thin bands to null rates while keeping their counts', async () => {
      const result = await analyticsHealth.handler({ context_token: 'ctx-test' });
      const parsed = parseToolResult(result);
      const bands: RetentionCellResponse[] = parsed.data.breakdowns.by_interval_band;

      const thin = findCell(bands, '21-59d');
      expect(thin.below_min_sample).toBe(true);
      expect(thin.true_retention_rate).toBeNull();
      expect(thin.eventual_pass_rate).toBeNull();
      expect(thin.sample_size).toBe(10);
      expect(thin.retained).toBe(7);
      expect(thin.eventual_passed).toBe(7);

      const empty = findCell(bands, '60d+');
      expect(empty.below_min_sample).toBe(true);
      expect(empty.sample_size).toBe(0);
      expect(empty.retained).toBe(0);
      expect(empty.eventual_passed).toBe(0);
    });

    it('rejects a call with no context_token', async () => {
      await expect(analyticsHealth.handler({})).rejects.toThrow();
    });
  });

  it('fails open with a valid error envelope when the workflow throws', async () => {
    // A properly typed AppContext — a real one with only the health entry
    // replaced by a throwing implementation. No `as any` on the context.
    const throwingCtx: AppContext = {
      ...createAppContext({ embedding: undefined }),
      computeSchedulerHealth: async () => {
        throw new Error('forced scheduler health failure');
      },
    };
    const throwingServer = new CaptureServer();
    registerAnalyticsTools(throwingServer as any, throwingCtx);
    const tool = throwingServer.tools.get('analytics_health')!;

    // Resolves rather than rejecting — the process never crashes.
    const result = await tool.handler({ context_token: 'ctx-test' });
    expect(result).toBeDefined();
    expect(result.isError).toBe(true);

    const parsed = parseToolResult(result);
    expect(parsed.status).toBe('error');
    // ERROR_TYPE_MAP maps the `computation` type the handler raises to `internal`.
    expect(parsed.error.type).toBe('internal');
    expect(parsed.error.retryable).toBe(false);
    expect(typeof parsed.error.message).toBe('string');
    expect(parsed.error.message.length).toBeGreaterThan(0);
  });
});
