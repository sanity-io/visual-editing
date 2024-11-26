'use strict'

/** @type import('eslint').Linter.Config */
module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['import'],
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
    'strict': ['warn', 'global'],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'],
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      plugins: ['import', '@typescript-eslint'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/no-empty-interface': 'off',
      },
    },
  ],
}
