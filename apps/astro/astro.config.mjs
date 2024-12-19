import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel'
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
      // studioUrl must be a string for Astro https://github.com/sanity-io/sanity-astro/blob/61f984a207a7cb61b3ed9cf16b3842d17e923689/packages/sanity-astro/src/vite-plugin-sanity-client.ts#L22
      stega: {
        studioUrl: `${baseUrl}/astro/`,
      },
    }),
    react(),
    tailwind(),
  ],
  adapter: vercel(),
})
