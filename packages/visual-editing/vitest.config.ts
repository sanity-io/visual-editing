import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    typecheck: {
      // Not `tsconfig.build.json`: it sets `noCheck`, which silently makes every type assertion
      // pass. Errors outside test files are left to the build, which uses `tsconfig.build.json`.
      tsconfig: 'tsconfig.json',
      ignoreSourceErrors: true,
    },
  },
})
