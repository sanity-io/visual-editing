import schemas from '@/sanity/schemas'
import { visionTool } from '@sanity/vision'
import { assist } from '@sanity/assist'
import { documentI18n, pages } from '@tinloof/sanity-studio'
import { defineConfig, type BaseSchemaDefinition } from 'sanity'
import { structureTool } from 'sanity/structure'
import StudioLogo from './components/StudioLogo'
import config from './config'

export default defineConfig({
  basePath: config.sanity.studioUrl,
  projectId: config.sanity.projectId,
  dataset: config.sanity.dataset,
  title: config.siteName,
  icon: StudioLogo,
  schema: {
    types: schemas,
  },
  plugins: [
    assist({
      translate: {
        document: {
          languageField: 'locale',
          documentTypes: extractTranslatableSchemaTypes(schemas),
        },
      },
    }),
    pages({
      previewUrl: {
        previewMode: {
          enable: '/api/draft',
        },
      },
      creatablePages: ['page'],
      i18n: config.i18n,
    }),
    documentI18n({ ...config.i18n, schemas }),
    structureTool(),
    visionTool({ defaultApiVersion: config.sanity.apiVersion }),
  ],
})

/**
 * Extracts the translatable schema types the same way `@tinloof/sanity-studio` does:
 * https://github.com/tinloof/sanity-kit/blob/9c8a80b3afcfb8c0f1a5494e3a38ca3102a020d0/packages/sanity-studio/src/plugins/i18n/index.ts#L69
 */
function extractTranslatableSchemaTypes(schemas: BaseSchemaDefinition[]) {
  return schemas
    .filter((schema: any) =>
      schema?.fields?.find((field) => field.name === 'locale'),
    )
    .map((schema) => schema.name)
}
