import {isDev} from './constants'
import {createClientWithConfig} from './createClientWithConfig'
import {parsePreviewUrl} from './parsePreviewUrl'
import type {ParsedPreviewUrl, PreviewUrlValidateUrlResult, SanityClientLike} from './types'
import {validateSecret} from './validateSecret'

/**
 * @public
 */
export async function validatePreviewUrl(
  _client: SanityClientLike,
  previewUrl: string,
  /**
   * @deprecated - this option is automatically determined based on the environment
   */
  // Default value based on https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
  disableCacheNoStore: boolean = globalThis.navigator?.userAgent === 'Cloudflare-Workers',
): Promise<PreviewUrlValidateUrlResult> {
  const client = createClientWithConfig(_client)
  let parsedPreviewUrl: ParsedPreviewUrl
  try {
    parsedPreviewUrl = parsePreviewUrl(previewUrl)
  } catch (error) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse preview URL', error, {
        previewUrl,
        client,
      })
    }
    return {isValid: false}
  }

  const {isValid, studioUrl} = await validateSecret(
    client,
    parsedPreviewUrl.secret,
    disableCacheNoStore,
  )
  const redirectTo = isValid ? parsedPreviewUrl.redirectTo : undefined
  const studioPreviewPerspective = isValid ? parsedPreviewUrl.studioPreviewPerspective : undefined
  let studioOrigin: string | undefined
  if (isValid) {
    try {
      studioOrigin = new URL(studioUrl!).origin
    } catch (error) {
      if (isDev) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse studioUrl', error, {
          previewUrl,
          studioUrl,
        })
      }
    }
  }

  return {isValid, redirectTo, studioOrigin, studioPreviewPerspective}
}

export type {PreviewUrlValidateUrlResult, SanityClientLike}
