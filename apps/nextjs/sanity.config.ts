import { composerTool } from '@sanity/composer'
import { schema } from 'apps-common'
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import Iframe, {
  defineUrlResolver,
  IframeOptions,
} from 'sanity-plugin-iframe-pane'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

const urlResolver = defineUrlResolver({
  base: '/preview',
})

const iframeOptions = {
  url: urlResolver,
  reload: { button: true },
} satisfies IframeOptions

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  plugins: [
    composerTool({
      name: 'composer',
      previewUrl: '/preview',
    }),
    deskTool({
      defaultDocumentNode: (S) => {
        return S.document().views([
          // Default form view
          S.view.form(),
          // Preview
          S.view.component(Iframe).options(iframeOptions).title('Preview'),
        ])
      },
    }),
  ],
  schema,
})
