import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';

/**
 * NEU-839 config audit — every AlgorithmConfig field must be consumed by some
 * algorithm, not merely parsed-but-never-read. This guards against dead config
 * knobs like the former `leechFailureThreshold` (parsed in
 * resolve-algorithm-config.ts but read by no algorithm until this change).
 *
 * The audit scans all of src/ except the files that DEFINE or PARSE the config —
 * a mention there is declaration/plumbing, not consumption. Every top-level field
 * must then appear as a member access (`.field`) somewhere among the remaining
 * consumer source.
 */
const SRC_DIR = fileURLToPath(new URL('../../../src', import.meta.url));

const EXCLUDED = new Set([
  'domain/config/algorithm.ts', // type definition + clampEaseFactor
  'domain/config/algorithm-defaults.ts', // hardcoded defaults
  'config/resolve-algorithm-config.ts', // env parsing
]);

function collectConsumerSource(): string {
  const entries = readdirSync(SRC_DIR, { recursive: true }) as string[];
  const parts: string[] = [];
  for (const entry of entries) {
    const rel = entry.split('\\').join('/');
    if (!rel.endsWith('.ts')) continue;
    if (EXCLUDED.has(rel)) continue;
    parts.push(readFileSync(join(SRC_DIR, entry), 'utf8'));
  }
  return parts.join('\n');
}

describe('AlgorithmConfig consumption audit (NEU-839)', () => {
  const source = collectConsumerSource();
  const fields = Object.keys(DEFAULT_ALGORITHM_CONFIG);

  it('audits a non-trivial set of config fields', () => {
    expect(fields.length).toBeGreaterThanOrEqual(20);
    expect(source.length).toBeGreaterThan(0);
  });

  it.each(fields)(
    'config field "%s" is read by an algorithm (not parsed-but-never-read)',
    field => {
      expect(source).toMatch(new RegExp(`\\.${field}\\b`));
    }
  );

  it('specifically consumes the formerly-dead leechFailureThreshold knob', () => {
    // Regression guard for the exact dead-config finding this task eliminated.
    expect(source).toMatch(/\.leechFailureThreshold\b/);
  });
});
