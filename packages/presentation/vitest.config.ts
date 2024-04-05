import { defineConfig } from 'vitest/config'

export default defineConfig({
  ssr: {
    noExternal: [/lodash/],
  },
  test: {
    environment: 'happy-dom',
  },
})
