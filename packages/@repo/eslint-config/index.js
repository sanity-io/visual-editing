'use strict'

const js = require('@eslint/js')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const reactPlugin = require('eslint-plugin-react')
const reactHooksPlugin = require('eslint-plugin-react-hooks')
const turboConfig = require('eslint-config-turbo/flat').default
const globals = require('globals')

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  js.configs.recommended,
  ...tsPlugin.configs['flat/recommended'],
  tsPlugin.configs['flat/eslint-recommended'],
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooksPlugin.configs.flat.recommended,
  ...turboConfig,
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'no-console': 'error',
      'no-warning-comments': [
        'warn',
        {
          location: 'start',
          terms: ['todo', '@todo', 'fixme'],
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react/prop-types': 'off',
    },
  },
]
