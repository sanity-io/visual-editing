import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    typecheck: {
      // Not `tsconfig.build.json`: it only includes `src`, so files under `test` are outside the
      // program and every type assertion in them silently passes.
      tsconfig: 'tsconfig.json',
    },
  },
})
