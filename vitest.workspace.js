import {defineWorkspace} from 'vitest/config'

export default defineWorkspace([
  './packages/presentation/vitest.config.ts',
  './packages/preview-url-secret/vitest.config.ts',
  './packages/react-loader/vitest.config.ts',
  './packages/preview-kit-compat/vitest.config.ts',
  './packages/visual-editing/vitest.config.ts',
  './packages/core-loader/vitest.config.ts',
  './packages/svelte-loader/vitest.config.ts',
  './packages/visual-editing-helpers/vitest.config.ts',
])
