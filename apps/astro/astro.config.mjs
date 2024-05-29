import {defineConfig} from 'astro/config'
import {workspaces, studioUrl as baseUrl, apiVersion} from 'apps-common/env'
import sanity from '@sanity/astro'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel/serverless'
const {projectId, dataset, workspace} = workspaces['astro']
const studioUrl = `${baseUrl}/${workspace}`

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [
    sanity({
      projectId,
      dataset,
      useCdn: true,
      apiVersion,
      stega: {
        studioUrl,
      },
    }),
    react(),
    tailwind(),
  ],
  adapter: vercel(),
})
