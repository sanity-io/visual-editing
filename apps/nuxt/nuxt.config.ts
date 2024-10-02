// https://nuxt.com/docs/api/configuration/nuxt-config
import {apiVersion, datasets, projectId, workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'

const studioUrl = `${baseUrl}/${workspaces['nuxt'].workspace}`

export default defineNuxtConfig({
  devtools: {enabled: false},

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
    apiVersion,
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

  compatibilityDate: '2024-08-07',
})
