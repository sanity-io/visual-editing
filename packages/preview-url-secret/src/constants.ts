import type {
  PreviewUrlSecretSchemaIdPrefix,
  PreviewUrlSecretSchemaType,
} from './types'

/** @internal */
export const schemaType =
  'sanity.previewUrlSecret' satisfies PreviewUrlSecretSchemaType

/** @internal */
export const schemaIdPrefix =
  'sanity-preview-url-secret' satisfies PreviewUrlSecretSchemaIdPrefix

/** @internal */
export const apiVersion = '2023-11-09'

/** @internal */
export const urlSearchParamPreviewSecret = 'sanity-preview-secret'

/** @internal */
export const urlSearchParamPreviewPathname = 'sanity-preview-pathname'
