import { configDefaults, defineConfig } from 'vitest/config';

// Workspace root — composes unit + integration for `test:ci` with merged coverage.
// Standalone per-tier configs (vitest.{unit,integration,embedding}.config.ts) must stay in sync.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          exclude: [...configDefaults.exclude, '**/.claude/**'],
          fileParallelism: true,
        },
      },
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts', 'tests/performance/**/*.test.ts'],
          exclude: [
            ...configDefaults.exclude,
            '**/.claude/**',
            'tests/integration/transport/mcp-stdout-validation.test.ts',
          ],
          setupFiles: ['./vitest.setup.ts'],
          globalTeardown: ['./vitest.global-teardown.ts'],
          fileParallelism: false,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      exclude: ['scripts/**'],
      thresholds: {
        statements: 90,
        branches: 84,
        lines: 90,
        functions: 88,
      },
    },
  },
});
