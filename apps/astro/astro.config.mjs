import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel/serverless'
import {apiVersion, workspaces} from '@repo/env'
import sanity from '@sanity/astro'
import {studioUrl as baseUrl} from 'apps-common/env'
import {defineConfig} from 'astro/config'

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
