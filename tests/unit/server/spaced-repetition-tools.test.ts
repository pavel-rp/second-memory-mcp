import { describe, it, expect, beforeEach } from 'vitest';
import { registerSpacedRepetitionTools } from '../../../src/server/spaced-repetition-tools.js';
import { createAppContext } from '../../../src/composition-root.js';

class CaptureServer {
  public tools = new Map<string, { spec: any; handler: Function }>();
  registerTool(name: string, spec: any, handler: Function) {
    this.tools.set(name, { spec, handler });
  }
}

function parseResult(out: any): any {
  return JSON.parse(out?.content?.[0]?.text);
}

describe('spaced-repetition-tools', () => {
  let server: CaptureServer;

  beforeEach(() => {
    server = new CaptureServer();
    registerSpacedRepetitionTools(server as any, createAppContext());
  });

  it('registers all spaced repetition tools', () => {
    expect(server.tools.has('calculate_next_review')).toBe(true);
    expect(server.tools.has('calculate_priority_score')).toBe(true);
    expect(server.tools.has('calculate_next_review_advanced')).toBe(true);
    expect(server.tools.has('rank_candidates')).toBe(true);
    expect(server.tools.has('what_to_learn_today')).toBe(true);
    expect(server.tools.has('record_review_result')).toBe(true);
  });

  describe('calculate_next_review', () => {
    it('returns next review schedule for quality >= 3', async () => {
      const handler = server.tools.get('calculate_next_review')!.handler;
      const result = await handler({
        quality: 4,
        repetitions: 1,
        ease_factor: 2.5,
        interval: 1,
      });
      const parsed = parseResult(result);
      expect(parsed.interval).toBeGreaterThan(0);
      expect(parsed.repetitions).toBe(2);
      expect(parsed.ease_factor).toBeGreaterThan(0);
      expect(parsed.next_review).toBeDefined();
    });

    it('resets repetitions for quality < 3', async () => {
      const handler = server.tools.get('calculate_next_review')!.handler;
      const result = await handler({
        quality: 1,
        repetitions: 5,
        ease_factor: 2.5,
        interval: 10,
      });
      const parsed = parseResult(result);
      expect(parsed.repetitions).toBe(0);
      expect(parsed.interval).toBe(1);
    });
  });

  describe('calculate_priority_score', () => {
    it('returns a priority score', async () => {
      const handler = server.tools.get('calculate_priority_score')!.handler;
      const result = await handler({
        next_review_date: '2025-01-01',
        ease_factor: 2.5,
        repetitions: 3,
        difficulty: 5,
      });
      const parsed = parseResult(result);
      expect(typeof parsed.priority).toBe('number');
    });
  });

  describe('calculate_next_review_advanced', () => {
    it('returns advanced review data with leech detection', async () => {
      const handler = server.tools.get('calculate_next_review_advanced')!.handler;
      const result = await handler({
        quality: 1,
        repetitions: 5,
        ease_factor: 1.5,
        interval: 1,
        days_overdue: 0,
        consecutive_failures: 5,
      });
      const parsed = parseResult(result);
      expect(parsed).toHaveProperty('interval');
      expect(parsed).toHaveProperty('ease_factor');
      expect(parsed).toHaveProperty('next_review');
      expect(parsed).toHaveProperty('leech');
      expect(parsed).not.toHaveProperty('easeFactor');
      expect(parsed).not.toHaveProperty('nextReview');
    });
  });

  describe('rank_candidates', () => {
    it('ranks candidates by priority', async () => {
      const handler = server.tools.get('rank_candidates')!.handler;
      const result = await handler({
        candidates: [
          {
            id: 'a',
            next_review_date: '2025-01-01',
            ease_factor: 2.5,
            repetitions: 1,
            difficulty: 5,
            tags: ['math'],
          },
          {
            id: 'b',
            next_review_date: '2025-06-01',
            ease_factor: 3.0,
            repetitions: 10,
            difficulty: 2,
            tags: ['science'],
          },
        ],
        timeboxMinutes: 60,
      });
      const parsed = parseResult(result);
      expect(parsed.orderedIds).toBeDefined();
    });
  });
});
