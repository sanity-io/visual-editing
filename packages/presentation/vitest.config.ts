import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    server: {
      deps: {
        // `sanity` has a lot of dependencies, like refractor, that aren't shipping Node native ESM compatible modules yet
        inline: ['sanity'],
      },
    },
    environment: 'happy-dom',
  },
})
