import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**'],
  },
  js.configs.recommended,
  {
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2015,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'error',
      'no-shadow': 'error',
      'no-warning-comments': [
        'warn',
        {
          location: 'start',
          terms: ['todo', 'fixme'],
        },
      ],
      'quote-props': ['warn', 'consistent-as-needed'],
      strict: ['warn', 'global'],
    },
  },
  ...tsPlugin.configs['flat/recommended'],
  tsPlugin.configs['flat/eslint-recommended'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-empty-interface': 'off',
    },
  },
  {
    files: ['src/__workshop__/**/*.ts', 'src/__workshop__/**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]
