import {defineWorkspace} from 'vitest/config'

export default defineWorkspace([
  './packages/preview-url-secret/vitest.config.ts',
  './packages/react-loader/vitest.config.ts',
  './packages/visual-editing/vitest.config.ts',
  './packages/core-loader/vitest.config.ts',
  './packages/svelte-loader/vitest.config.ts',
  './packages/visual-editing-csm/vitest.config.ts',
])
