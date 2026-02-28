import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false,
    setupFiles: ['./vitest.setup.ts'],
    globalTeardown: ['./vitest.global-teardown.ts'],
    exclude: [...configDefaults.exclude, '**/.claude/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['scripts/**'],
      thresholds: {
        statements: 67,
        branches: 59,
        lines: 67,
        functions: 68,
      },
    },
  },
});
