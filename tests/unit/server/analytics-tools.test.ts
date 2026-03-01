import { describe, it, expect, beforeEach } from 'vitest';
import { registerAnalyticsTools } from '../../../src/server/analytics-tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { CaptureServer, parseResult } from '../../helpers/capture-server.js';

describe('analytics-tools', () => {
  let server: CaptureServer;

  beforeEach(() => {
    server = new CaptureServer();
    registerAnalyticsTools(server as any, createMockAppContext());
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
  });

  describe('analytics_window', () => {
    it('computes window analytics for valid entries', async () => {
      const handler = server.tools.get('analytics_window')!.handler;
      const result = await handler({
        entries: [{ date: '2026-01-15', quality: 3, topic: 'science' }],
        window: { start: '2026-01-01', end: '2026-01-31' },
        includeBreakdowns: false,
      });
      const parsed = parseResult(result);
      expect(parsed.days).toBeDefined();
    });
  });
});
