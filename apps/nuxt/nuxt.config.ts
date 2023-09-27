// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ['rxjs'],
  },
  devtools: { enabled: false },
  devServer: {
    port: 3001,
  },
  imports: {
    transform: {
      exclude: [/\bpackages\/.+\b/],
    },
  },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      sanity: {
        projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NUXT_PUBLIC_SANITY_DATASET!,
      },
    },
  },
})
