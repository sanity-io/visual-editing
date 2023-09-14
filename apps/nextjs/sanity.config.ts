import { composerTool } from '@sanity/composer'
import { schema } from 'apps-common'
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  plugins: [
    composerTool({
      name: 'composer',
      previewUrl: '/preview',
    }),
    deskTool(),
  ],
  schema,
})
