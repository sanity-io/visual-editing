const { readGitignoreFiles } = require('eslint-gitignore')

module.exports = {
  root: true,
  ignorePatterns: readGitignoreFiles({ cwd: __dirname }),
  settings: { react: { version: 'detect' } },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'simple-import-sort', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'no-console': 'error',
    'no-warning-comments': [
      'warn',
      { location: 'start', terms: ['todo', '@todo', 'fixme'] },
    ],
    'prettier/prettier': 'warn',
  },
}
