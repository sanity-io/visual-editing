import {
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewSecret,
} from './constants'
import type {
  PreviewUrlResolver,
  PreviewUrlResolverContext,
  PreviewUrlResolverOptions,
} from './types'

/**
 * @internal
 */
export function definePreviewUrl<SanityClientType>(
  options: PreviewUrlResolverOptions,
): PreviewUrlResolver<SanityClientType> {
  const {
    draftMode,
    origin = typeof location === 'undefined'
      ? 'https://localhost'
      : location.origin,
  } = options
  let { preview = '/' } = options
  const productionUrl = new URL(preview, origin)
  const enableDraftModeUrl = draftMode.enable
    ? new URL(draftMode.enable, origin)
    : undefined

  return async (context): Promise<string> => {
    try {
      if (context.previewSearchParam) {
        const restoredUrl = new URL(context.previewSearchParam, productionUrl)
        if (restoredUrl.origin === productionUrl.origin) {
          preview = `${restoredUrl.pathname}${restoredUrl.search}`
        }
      } else if (context.referrer) {
        const referrerUrl = new URL(context.referrer)
        if (referrerUrl.origin === productionUrl.origin) {
          preview = `${referrerUrl.pathname}${referrerUrl.search}`
        }
      }
    } catch {
      // ignore
    }
    const previewUrl = new URL(preview, productionUrl)
    if (enableDraftModeUrl) {
      const enableDraftModeRequestUrl = new URL(enableDraftModeUrl)
      const { searchParams } = enableDraftModeRequestUrl
      searchParams.set(urlSearchParamPreviewSecret, context.previewUrlSecret)
      if (previewUrl.pathname !== enableDraftModeRequestUrl.pathname) {
        searchParams.set(
          urlSearchParamPreviewPathname,
          `${previewUrl.pathname}${previewUrl.search}`,
        )
      }

      return enableDraftModeRequestUrl.toString()
    }
    return previewUrl.toString()
  }
}

export type {
  PreviewUrlResolver,
  PreviewUrlResolverContext,
  PreviewUrlResolverOptions,
}
