// https://nuxt.com/docs/api/configuration/nuxt-config
import { projectId, datasets } from 'apps-common/env'

export default defineNuxtConfig({
  build: {
    transpile: ['rxjs'],
  },
  devtools: { enabled: false },
  imports: {
    transform: {
      exclude: [/\bpackages\/.+\b/, /\bapps\/common\/.+\b/],
    },
  },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      vercel: {
        env: process.env.NUXT_ENV_VERCEL_ENV,
      },
      sanity: {
        projectId,
        dataset: datasets.development,
      },
    },
  },
})
