import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerAnalyticsTools } from '../../../src/server/analytics-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';
import type { AppContext } from '../../../src/composition-root.js';

describe('analytics-tools', () => {
  let server: CaptureServer;
  let ctx: AppContext;

  beforeEach(() => {
    server = new CaptureServer();
    ctx = createMockAppContext();
    registerAnalyticsTools(server as any, ctx);
  });

  it('registers analytics_daily and analytics_window tools', () => {
    expect(server.tools.has('analytics_daily')).toBe(true);
    expect(server.tools.has('analytics_window')).toBe(true);
  });

  describe('analytics_daily', () => {
    it('computes KPIs for valid entries', async () => {
      const handler = server.tools.get('analytics_daily')!.handler;
      const result = await handler({
        entries: [
          { date: '2026-01-15', quality: 4, topic: 'math' },
          { date: '2026-01-15', quality: 5, topic: 'math' },
        ],
      });
      const parsed = parseResult(result);
      expect(parsed.reviews_completed).toBe(2);
      expect(parsed.average_quality).toBeGreaterThan(0);
    });

    it('throws for invalid input', async () => {
      const handler = server.tools.get('analytics_daily')!.handler;
      await expect(handler({})).rejects.toThrow();
    });

    it('returns computation error when computeDailyKpis throws', async () => {
      ctx.computeDailyKpis = vi.fn().mockImplementation(() => {
        throw new Error('computation overflow');
      });
      const freshServer = new CaptureServer();
      registerAnalyticsTools(freshServer as any, ctx);
      const handler = freshServer.tools.get('analytics_daily')!.handler;

      const result = await handler({
        entries: [{ date: '2026-01-15', quality: 4 }],
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
      expect(parsed.error.message).toContain('computation overflow');
    });
  });

  describe('analytics_window', () => {
    it('computes window analytics for valid entries', async () => {
      const handler = server.tools.get('analytics_window')!.handler;
      const result = await handler({
        entries: [{ date: '2026-01-15', quality: 3, topic: 'science' }],
        window: { start: '2026-01-01', end: '2026-01-31' },
        include_breakdowns: false,
      });
      const parsed = parseResult(result);
      expect(parsed.days).toBeDefined();
    });

    it('returns computation error when computeWindowRollup throws', async () => {
      ctx.computeWindowRollup = vi.fn().mockImplementation(() => {
        throw new Error('window calc failed');
      });
      const freshServer = new CaptureServer();
      registerAnalyticsTools(freshServer as any, ctx);
      const handler = freshServer.tools.get('analytics_window')!.handler;

      const result = await handler({
        entries: [{ date: '2026-01-15', quality: 3 }],
        window: { start: '2026-01-01', end: '2026-01-31' },
      });
      const parsed = parseResult(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error.type).toBe('computation');
      expect(parsed.error.message).toContain('window calc failed');
    });

    it('passes include_breakdowns as includeBreakdowns to ctx', async () => {
      const mockFn = vi.fn().mockReturnValue({ days: [], total: {} });
      ctx.computeWindowRollup = mockFn;
      const freshServer = new CaptureServer();
      registerAnalyticsTools(freshServer as any, ctx);
      const handler = freshServer.tools.get('analytics_window')!.handler;

      await handler({
        entries: [{ date: '2026-01-15', quality: 3 }],
        window: { start: '2026-01-01', end: '2026-01-31' },
        include_breakdowns: true,
      });

      expect(mockFn).toHaveBeenCalledWith(
        expect.any(Object),
        { start: '2026-01-01', end: '2026-01-31' },
        { includeBreakdowns: true }
      );
    });

    it('throws for missing window field', async () => {
      const handler = server.tools.get('analytics_window')!.handler;
      await expect(handler({ entries: [] })).rejects.toThrow();
    });
  });
});
