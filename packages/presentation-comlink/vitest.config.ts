import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    typecheck: {
      tsconfig: 'tsconfig.build.json',
    },
  },
})
