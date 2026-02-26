import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    globalSetup: ['./vitest.global-teardown.ts'],
    exclude: ['**/node_modules/**', '**/.claude/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['scripts/**'],
      thresholds: {
        statements: 65,
        lines: 65,
        functions: 75,
      },
    },
  },
});
