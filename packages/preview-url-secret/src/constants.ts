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

/** @internal */
export const isDev = process.env.NODE_ENV === 'development'

/**
 * updated within the hour, if it's older it'll create a new secret or return null
 * @internal
 */
export const SECRET_TTL = 60 * 60

/** @internal */
export const fetchSecretQuery =
  /* groq */ `*[_type == "${schemaType}" && secret == $secret && dateTime(_updatedAt) > dateTime(now()) - ${SECRET_TTL}][0]{
  _id,
  _updatedAt,
  secret,
}` as const

/** @internal */
export const deleteExpiredSecretsQuery =
  /* groq */ `*[_type == "${schemaType}" && dateTime(_updatedAt) <= dateTime(now()) - ${SECRET_TTL}]` as const

/**
 * Used for tagging `client.fetch` queries
 * @internal
 */
export const tag = 'sanity.preview-url-secret' as const
