import { configDefaults, defineConfig } from 'vitest/config';

// Standalone smoke-tier config for `test:smoke` script.
// Runs HTTP-based smoke tests against a live MCP instance.
// Requires MCP_BASE_URL env var to be set.
export default defineConfig({
  test: {
    name: 'smoke',
    include: ['tests/smoke/**/*.test.ts'],
    exclude: [...configDefaults.exclude, '**/.claude/**'],
    fileParallelism: false,
    testTimeout: 30_000,
  },
});
