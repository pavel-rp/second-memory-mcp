import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // Global ignores
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', 'drizzle/', 'scripts/'],
  },

  // Base recommended rules
  js.configs.recommended,

  // TypeScript + Prettier for all source and test files
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-useless-assignment': 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-console': 'warn',
      'no-empty': 'warn',
      'no-unused-vars': 'off',
    },
  },

  // Test file overrides
  {
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      'no-console': 'off',
    },
  },

  // Domain-layer purity: ban runtime globals and Date construction
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'process',
          message: 'Domain must not access process. Receive config via injection.',
        },
        {
          name: 'setTimeout',
          message: 'Timeout management belongs in infrastructure.',
        },
        {
          name: 'setInterval',
          message: 'Timer management belongs in infrastructure.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'NewExpression[callee.name="Date"][arguments.length=0]',
          message: 'Domain must receive time as a parameter, not call new Date().',
        },
        {
          selector:
            'MemberExpression[object.name="Date"][property.name="now"]',
          message: 'Domain must receive time as a parameter, not call Date.now().',
        },
      ],
    },
  },

  // Ports must not import from infrastructure
  {
    files: ['src/ports/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**'],
              message: 'Ports must not import from infrastructure.',
            },
          ],
        },
      ],
    },
  },

  // Orchestration/server must not import Drizzle schema directly
  {
    files: ['src/orchestration/**/*.ts', 'src/server/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/db/schema**'],
              message:
                'Import domain entity types, not Drizzle row types.',
            },
          ],
        },
      ],
    },
  },

  // Prettier must be last to override conflicting rules
  prettierConfig,
];
