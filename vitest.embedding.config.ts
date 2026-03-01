import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'embedding',
    include: ['tests/embedding/**/*.test.ts'],
    exclude: [...configDefaults.exclude, '**/.claude/**', '**/*.quarantine.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
    fileParallelism: false,
  },
});
