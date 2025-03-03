import type {
  PreviewUrlSecretSchemaIdPrefix,
  PreviewUrlSecretSchemaType,
  PreviewUrlSecretSchemaTypeSingleton,
  VercelProtectionBypassSchemaType,
} from './types'

/** @internal */
export const schemaType = 'sanity.previewUrlSecret' satisfies PreviewUrlSecretSchemaType

/** @internal */
export const schemaIdPrefix = 'sanity-preview-url-secret' satisfies PreviewUrlSecretSchemaIdPrefix

/** @internal */
export const schemaIdSingleton = `${schemaIdPrefix}.share-access` as const

/** @internal */
export const schemaTypeSingleton =
  'sanity.previewUrlShareAccess' satisfies PreviewUrlSecretSchemaTypeSingleton

/** @internal */
export const apiVersion = '2025-02-19'

/** @internal */
export const urlSearchParamPreviewSecret = 'sanity-preview-secret'

/** @internal */
export const urlSearchParamPreviewPathname = 'sanity-preview-pathname'

/** @internal */
export const urlSearchParamPreviewPerspective = 'sanity-preview-perspective'

/** @internal */
export const urlSearchParamVercelProtectionBypass = 'x-vercel-protection-bypass'

/** @internal */
export const urlSearchParamVercelSetBypassCookie = 'x-vercel-set-bypass-cookie'

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
    studioUrl,
  }` as const

/** @internal */
export const fetchSharedAccessQuery =
  /* groq */ `*[_id == "${schemaIdSingleton}" && _type == "${schemaTypeSingleton}"][0].secret` as const

/** @internal */
export const fetchSharedAccessSecretQuery =
  /* groq */ `*[_id == "${schemaIdSingleton}" && _type == "${schemaTypeSingleton}" && secret == $secret][0]{
  secret,
  studioUrl,
}` as const

/** @internal */
export const deleteExpiredSecretsQuery =
  /* groq */ `*[_type == "${schemaType}" && dateTime(_updatedAt) <= dateTime(now()) - ${SECRET_TTL}]` as const

/** @internal */
export const vercelProtectionBypassSchemaType =
  'sanity.vercelProtectionBypass' satisfies VercelProtectionBypassSchemaType

/** @internal */
export const vercelProtectionBypassSchemaId = `${schemaIdPrefix}.vercel-protection-bypass` as const

/** @internal */
export const fetchVercelProtectionBypassSecret =
  /* groq */ `*[_id == "${vercelProtectionBypassSchemaId}" && _type == "${vercelProtectionBypassSchemaType}"][0].secret` as const

/**
 * Used for tagging `client.fetch` queries
 * @internal
 */
export const tag = 'sanity.preview-url-secret' as const

/** @internal */
export const perspectiveCookieName = 'sanity-preview-perspective'

export type {VercelSetBypassCookieValue} from './types'
