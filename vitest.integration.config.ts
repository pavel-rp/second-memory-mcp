import { configDefaults, defineConfig } from 'vitest/config';

// Standalone integration-tier config for `test:integration` script.
// Source of truth: the 'integration' project in vitest.config.ts — keep in sync.
export default defineConfig({
  test: {
    name: 'integration',
    include: ['tests/integration/**/*.test.ts', 'tests/performance/**/*.test.ts'],
    exclude: [...configDefaults.exclude, '**/.claude/**', '**/*.quarantine.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
    globalTeardown: ['./vitest.global-teardown.ts'],
    fileParallelism: false,
  },
});
