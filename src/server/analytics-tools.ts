import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import {
  AnalyticsDailyInputSchema,
  AnalyticsDailyInputShape,
  AnalyticsHealthInputSchema,
  AnalyticsHealthInputShape,
  AnalyticsWindowInputSchema,
  AnalyticsWindowInputShape,
  type AnalyticsHealthOutput,
  type CalibrationBinPayload,
  type CalibrationPayload,
  type RetentionCellPayload,
} from '../domain/types/analytics.js';
import { withRequestContext } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolData } from './tool-helpers.js';

// The camelCase shape the orchestration returns, taken straight off AppContext
// so the server layer gains no import edge to orchestration and the two shapes
// can never drift.
type SchedulerHealthResult = Awaited<ReturnType<AppContext['computeSchedulerHealth']>>;
type SchedulerHealthCell = SchedulerHealthResult['trueRetention'];
type CalibrationResult = SchedulerHealthResult['calibration'];
type CalibrationBinResult = CalibrationResult['bins'][number];

/**
 * The SC-8 conversion boundary: camelCase domain values in, snake_case MCP
 * payload out. One cell mapper serves the headline, the fresh figure and every
 * breakdown cell, so no cell can acquire a different shape from the others.
 */
function toCellPayload(cell: SchedulerHealthCell): RetentionCellPayload {
  return {
    key: cell.key,
    sample_size: cell.sampleSize,
    retained: cell.retained,
    true_retention_rate: cell.trueRetentionRate,
    eventual_passed: cell.eventualPassed,
    eventual_pass_rate: cell.eventualPassRate,
    below_min_sample: cell.belowMinSample,
  };
}

/**
 * One bin mapper serves every calibration bucket, so no bin can acquire a
 * different shape from the others. Suppressed metrics stay `null` — never
 * coerced to `0`, which would read as a measured figure.
 */
function toCalibrationBinPayload(bin: CalibrationBinResult): CalibrationBinPayload {
  return {
    key: bin.key,
    sample_size: bin.sampleSize,
    observed_passed: bin.observedPassed,
    observed_pass_rate: bin.observedPassRate,
    mean_predicted_recall: bin.meanPredictedRecall,
    calibration_gap: bin.calibrationGap,
    below_min_sample: bin.belowMinSample,
  };
}

/** The NEU-846 conversion boundary: camelCase calibration in, snake_case payload out. */
function toCalibrationPayload(calibration: CalibrationResult): CalibrationPayload {
  return {
    min_sample_size: calibration.minSampleSize,
    bin_edges: calibration.binEdges,
    log_loss_epsilon: calibration.logLossEpsilon,
    coverage: {
      total_first_attempts: calibration.coverage.totalFirstAttempts,
      calibration_observations: calibration.coverage.calibrationObservations,
      excluded_fresh_band: calibration.coverage.excludedFreshBand,
      excluded_uncovered: calibration.coverage.excludedUncovered,
      coverage_ratio: calibration.coverage.coverageRatio,
    },
    overall: {
      sample_size: calibration.overall.sampleSize,
      observed_passed: calibration.overall.observedPassed,
      observed_pass_rate: calibration.overall.observedPassRate,
      mean_predicted_recall: calibration.overall.meanPredictedRecall,
      calibration_gap: calibration.overall.calibrationGap,
      below_min_sample: calibration.overall.belowMinSample,
      log_loss: calibration.overall.logLoss,
      rmse_bins: calibration.overall.rmseBins,
    },
    bins: calibration.bins.map(bin => toCalibrationBinPayload(bin)),
  };
}

function toHealthPayload(result: SchedulerHealthResult): AnalyticsHealthOutput {
  return {
    generated_at: result.generatedAt,
    min_sample_size: result.minSampleSize,
    band_definitions: {
      interval_band_edges_days: result.bandDefinitions.intervalBandEdgesDays,
      days_overdue_band_edges_days: result.bandDefinitions.daysOverdueBandEdgesDays,
    },
    coverage: {
      total_first_attempts: result.coverage.totalFirstAttempts,
      covered_first_attempts: result.coverage.coveredFirstAttempts,
      uncovered_first_attempts: result.coverage.uncoveredFirstAttempts,
      coverage_ratio: result.coverage.coverageRatio,
      established_first_attempts: result.coverage.establishedFirstAttempts,
      fresh_first_attempts: result.coverage.freshFirstAttempts,
    },
    true_retention: toCellPayload(result.trueRetention),
    fresh_band_retention: toCellPayload(result.freshBandRetention),
    breakdowns: {
      by_teaching_tier: result.breakdowns.byTeachingTier.map(cell => toCellPayload(cell)),
      by_interval_band: result.breakdowns.byIntervalBand.map(cell => toCellPayload(cell)),
      by_days_overdue_band: result.breakdowns.byDaysOverdueBand.map(cell => toCellPayload(cell)),
    },
    calibration: toCalibrationPayload(result.calibration),
  };
}

export function registerAnalyticsTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'analytics_daily',
    {
      title: 'Calculate Daily KPIs',
      description: 'Compute daily analytics KPIs from stored review history for a single day',
      inputSchema: AnalyticsDailyInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('analytics_daily', async () => {
        const parsed = AnalyticsDailyInputSchema.parse(rawInput);
        try {
          const result = await ctx.computeDailyAnalytics(parsed.date);
          return toolData(result);
        } catch (error) {
          const msg = extractErrorMessage(error);
          return toolError(`Failed to compute daily KPIs: ${msg}`, {
            type: 'computation',
            message: msg,
          });
        }
      })
  );

  server.registerTool(
    'analytics_window',
    {
      title: 'Calculate Window Analytics',
      description: 'Compute analytics for a date range with optional topic/tag breakdowns',
      inputSchema: AnalyticsWindowInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('analytics_window', async () => {
        const parsed = AnalyticsWindowInputSchema.parse(rawInput);
        try {
          const result = await ctx.computeWindowAnalytics(parsed.from, parsed.to, {
            includeBreakdowns: parsed.includeBreakdowns,
          });
          return toolData(result);
        } catch (error) {
          const msg = extractErrorMessage(error);
          return toolError(`Failed to compute window analytics: ${msg}`, {
            type: 'computation',
            message: msg,
          });
        }
      })
  );

  server.registerTool(
    'analytics_health',
    {
      title: 'Scheduler Health and True Retention',
      description:
        'Report true retention (the first-attempt pass rate at due time) over recorded ' +
        'scheduling snapshots, with an eventual-pass secondary figure, an honest coverage ' +
        'block, and breakdowns by teaching tier, interval band and days overdue. Every ' +
        'figure carries its sample size, and rates below the minimum sample size are ' +
        'suppressed to null rather than printed as if authoritative.',
      inputSchema: AnalyticsHealthInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('analytics_health', async () => {
        // Parsed for the validation side effect only: this tool consumes no
        // input field beyond context_token, so binding the result would be an
        // unused variable and lint runs at --max-warnings 0.
        AnalyticsHealthInputSchema.parse(rawInput);
        try {
          const result = await ctx.computeSchedulerHealth();
          return toolData(toHealthPayload(result));
        } catch (error) {
          const msg = extractErrorMessage(error);
          return toolError(`Failed to compute scheduler health: ${msg}`, {
            type: 'computation',
            message: msg,
          });
        }
      })
  );
}
