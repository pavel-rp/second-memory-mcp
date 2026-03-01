import { configDefaults, defineConfig } from 'vitest/config';

/**
 * Quarantine config — runs only `.quarantine.test.ts` files across all tiers.
 * Uses projects to give unit-tier quarantined tests no DB setup,
 * while integration/embedding quarantined tests get the full DB setup.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'quarantine-unit',
          include: ['tests/unit/**/*.quarantine.test.ts'],
          exclude: [...configDefaults.exclude, '**/.claude/**'],
          fileParallelism: false,
        },
      },
      {
        test: {
          name: 'quarantine-db',
          include: [
            'tests/integration/**/*.quarantine.test.ts',
            'tests/embedding/**/*.quarantine.test.ts',
            'tests/performance/**/*.quarantine.test.ts',
          ],
          exclude: [...configDefaults.exclude, '**/.claude/**'],
          setupFiles: ['./vitest.setup.ts'],
          fileParallelism: false,
        },
      },
    ],
  },
});
