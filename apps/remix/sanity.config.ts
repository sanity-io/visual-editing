import { composerTool } from '@sanity/composer'
import { schema } from 'apps-common'
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

export function getSanityConfig(options: {
  projectId: string
  dataset: string
}) {
  const { projectId, dataset } = options

  return defineConfig({
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
}
