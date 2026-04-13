import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerAnalyticsTools } from '../../../src/server/analytics-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';
import type { DailyKpis, AnalyticsOutput } from '../../../src/domain/types/analytics.js';

describe('analytics-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  const dailyKpisResult: DailyKpis = {
    date: '2026-01-15',
    reviews_completed: 3,
    average_quality: 4.0,
    new_chunks_learned: 1,
  };

  const windowResult: AnalyticsOutput = {
    days: [
      {
        date: '2026-01-15',
        reviews_completed: 3,
        average_quality: 4.0,
        new_chunks_learned: 1,
        streak_days: 1,
      },
    ],
    total: {
      reviews_completed: 3,
      average_quality: 4.0,
      new_chunks_learned: 1,
      streak_days: 1,
    },
  };

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
    ctx.computeDailyAnalytics = vi.fn().mockResolvedValue(dailyKpisResult);
    ctx.computeWindowAnalytics = vi.fn().mockResolvedValue(windowResult);
    registerAnalyticsTools(server as any, ctx);
  });

  it('registers analytics_daily and analytics_window tools', () => {
    expect(server.tools.has('analytics_daily')).toBe(true);
    expect(server.tools.has('analytics_window')).toBe(true);
  });

  describe('analytics_daily', () => {
    it('computes KPIs for a valid date', async () => {
      const handler = server.tools.get('analytics_daily')!.handler;
      const result = await handler({ date: '2026-01-15', context_token: 'ctx-test' });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.reviews_completed).toBe(3);
      expect(parsed.data.average_quality).toBe(4.0);
      expect(ctx.computeDailyAnalytics).toHaveBeenCalledWith('2026-01-15');
    });

    it('rejects missing date', async () => {
      const handler = server.tools.get('analytics_daily')!.handler;
      await expect(handler({})).rejects.toThrow();
    });

    it('rejects invalid date format', async () => {
      const handler = server.tools.get('analytics_daily')!.handler;
      await expect(handler({ date: '2026-1-15' })).rejects.toThrow();
    });

    it('returns computation error when computeDailyAnalytics throws', async () => {
      ctx.computeDailyAnalytics = vi.fn().mockRejectedValue(new Error('db connection lost'));
      const freshServer = new CaptureServer();
      registerAnalyticsTools(freshServer as any, ctx);
      const handler = freshServer.tools.get('analytics_daily')!.handler;

      const result = await handler({ date: '2026-01-15', context_token: 'ctx-test' });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.message).toContain('db connection lost');
    });
  });

  describe('analytics_window', () => {
    it('computes window analytics for valid date range', async () => {
      const handler = server.tools.get('analytics_window')!.handler;
      const result = await handler({
        from: '2026-01-01',
        to: '2026-01-31',
        include_breakdowns: false,
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('ok');
      expect(parsed.data.days).toBeDefined();
      expect(parsed.data.total.reviews_completed).toBe(3);
    });

    it('passes includeBreakdowns option correctly', async () => {
      const handler = server.tools.get('analytics_window')!.handler;
      await handler({
        from: '2026-01-01',
        to: '2026-01-31',
        include_breakdowns: true,
        context_token: 'ctx-test',
      });

      expect(ctx.computeWindowAnalytics).toHaveBeenCalledWith('2026-01-01', '2026-01-31', {
        includeBreakdowns: true,
      });
    });

    it('defaults include_breakdowns to false', async () => {
      const handler = server.tools.get('analytics_window')!.handler;
      await handler({
        from: '2026-01-01',
        to: '2026-01-31',
        context_token: 'ctx-test',
      });

      expect(ctx.computeWindowAnalytics).toHaveBeenCalledWith('2026-01-01', '2026-01-31', {
        includeBreakdowns: false,
      });
    });

    it('returns computation error when computeWindowAnalytics throws', async () => {
      ctx.computeWindowAnalytics = vi.fn().mockRejectedValue(new Error('window calc failed'));
      const freshServer = new CaptureServer();
      registerAnalyticsTools(freshServer as any, ctx);
      const handler = freshServer.tools.get('analytics_window')!.handler;

      const result = await handler({
        from: '2026-01-01',
        to: '2026-01-31',
        context_token: 'ctx-test',
      });
      const parsed = parseResult(result);

      expect(parsed.status).toBe('error');
      expect(parsed.error.type).toBe('internal');
      expect(parsed.error.message).toContain('window calc failed');
    });

    it('rejects missing from field', async () => {
      const handler = server.tools.get('analytics_window')!.handler;
      await expect(handler({ to: '2026-01-31' })).rejects.toThrow();
    });

    it('rejects invalid date format in from', async () => {
      const handler = server.tools.get('analytics_window')!.handler;
      await expect(handler({ from: 'invalid', to: '2026-01-31' })).rejects.toThrow();
    });
  });
});
