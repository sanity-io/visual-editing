import { schema } from 'apps-common'
import { composerTool } from '@sanity/composer'
import { Config, defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

export default function getSanityConfig(config: Config) {
  return defineConfig({
    basePath: '/studio',
    plugins: [
      composerTool({
        name: 'composer',
        previewUrl: '/',
      }),
      deskTool(),
    ],
    schema,
    ...config,
  })
}
