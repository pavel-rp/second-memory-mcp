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
        statements: 83,
        branches: 74,
        lines: 83,
        functions: 89,
      },
    },
  },
});
