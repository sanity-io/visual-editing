import { schema } from 'apps-common'
import { presentationTool } from '@sanity/presentation'
import { type Config, defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

export default function getSanityConfig(config: Config) {
  return defineConfig({
    basePath: '/studio',
    plugins: [
      presentationTool({
        name: 'presentation',
        previewUrl: '/preview',
      }),
      structureTool(),
    ],
    schema,
    ...config,
  })
}
