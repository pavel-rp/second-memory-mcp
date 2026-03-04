import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'embedding',
    include: ['tests/embedding/**/*.test.ts'],
    exclude: [...configDefaults.exclude, '**/.claude/**'],
    setupFiles: ['./vitest.setup.ts'],
    globalTeardown: ['./vitest.global-teardown.ts'],
    fileParallelism: false,
  },
});
