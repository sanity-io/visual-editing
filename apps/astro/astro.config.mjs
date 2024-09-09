import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel/serverless'
import {apiVersion, workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import sanity from '@sanity/astro'
import {defineConfig} from 'astro/config'

const {projectId, dataset} = workspaces['astro']

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
        studioUrl: (sourceDocument) => {
          if (
            sourceDocument._projectId === workspaces['cross-dataset-references'].projectId &&
            sourceDocument._dataset === workspaces['cross-dataset-references'].dataset
          ) {
            const {workspace, tool} = workspaces['cross-dataset-references']
            return {baseUrl, workspace, tool}
          }
          const {workspace, tool} = workspaces['astro']
          return {baseUrl, workspace, tool}
        },
      },
    }),
    react(),
    tailwind(),
  ],
  adapter: vercel(),
})
