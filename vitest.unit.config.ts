import { configDefaults, defineConfig } from 'vitest/config';

// Standalone unit-tier config for `test:unit` script.
// Source of truth: the 'unit' project in vitest.config.ts — keep in sync.
export default defineConfig({
  test: {
    name: 'unit',
    include: ['tests/unit/**/*.test.ts'],
    exclude: [...configDefaults.exclude, '**/.claude/**'],
    fileParallelism: true,
  },
});
