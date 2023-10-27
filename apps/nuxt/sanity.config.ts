import { schema } from 'apps-common'
import { pagesTool } from '@sanity/pages'
import { Config, defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

export default function getSanityConfig(config: Config) {
  return defineConfig({
    basePath: '/studio',
    plugins: [
      pagesTool({
        name: 'pages',
        previewUrl: '/preview',
      }),
      deskTool(),
    ],
    schema,
    ...config,
  })
}
