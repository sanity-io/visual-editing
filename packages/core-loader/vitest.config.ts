import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    typecheck: {
      // Not `tsconfig.build.json`: it sets `noCheck`, which silently makes every type assertion
      // pass. Type errors in `src` are caught by `pkg build --strict --check` instead.
      tsconfig: 'tsconfig.json',
    },
  },
})
