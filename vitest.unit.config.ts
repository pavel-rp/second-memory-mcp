import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'unit',
    include: ['tests/unit/**/*.test.ts'],
    exclude: [...configDefaults.exclude, '**/.claude/**', '**/*.quarantine.test.ts'],
    fileParallelism: true,
  },
});
