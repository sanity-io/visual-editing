import { isDev } from './constants'
import { createClientWithConfig } from './createClientWithConfig'
import { parsePreviewUrl } from './parsePreviewUrl'
import {
  ParsedPreviewUrl,
  PreviewUrlValidateUrlResult,
  SanityClientLike,
} from './types'
import { validateSecret } from './validateSecret'

/**
 * @alpha
 */
export async function validatePreviewUrl(
  _client: SanityClientLike,
  previewUrl: string,
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
    return { isValid: false }
  }

  const isValid = await validateSecret(client, parsedPreviewUrl.secret)
  const redirectTo = isValid ? parsedPreviewUrl.redirectTo : undefined

  return { isValid, redirectTo }
}

export type { PreviewUrlValidateUrlResult, SanityClientLike }
