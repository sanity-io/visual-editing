import {presentationTool} from '@sanity/presentation'
import {schema} from 'apps-common'
import {defineConfig, type Config} from 'sanity'
import {structureTool} from 'sanity/structure'

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
