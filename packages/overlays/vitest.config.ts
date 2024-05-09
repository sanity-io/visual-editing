import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    typecheck: {
      tsconfig: 'tsconfig.build.json',
    },
  },
})
