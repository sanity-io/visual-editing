'use client'
/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...index]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from '@/lib/env'
import {types} from '@/lib/sanity/schema'

const config = defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './src/sanity/schema' folder
  schema: {types},
  plugins: [
    presentationTool({
      previewUrl: {
        previewMode: {
          enable: '/api/draft',
          disable: 'api/disable-draft',
        },
      },
    }),
    structureTool(),
    // Add an image asset source for Unsplash
    unsplashImageAsset(),
    // Vision is a tool that lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
export default config
