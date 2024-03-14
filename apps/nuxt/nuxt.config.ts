// https://nuxt.com/docs/api/configuration/nuxt-config
import { projectId, datasets, studioUrl } from 'apps-common/env'

export default defineNuxtConfig({
  build: {
    transpile: ['rxjs'],
  },
  devtools: { enabled: false },
  imports: {
    transform: {
      exclude: [/\bpackages\/.+\b/],
    },
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/sanity'],
  sanity: {
    globalHelper: true,
    projectId,
    dataset: datasets.development,
    apiVersion: '2021-03-25',
    visualEditing: {
      token: process.env.NUXT_SANITY_API_READ_TOKEN,
      studioUrl,
      stega: true,
    },
  },
  runtimeConfig: {
    public: {
      vercel: {
        env: process.env.NUXT_ENV_VERCEL_ENV,
      },
    },
  },
})
