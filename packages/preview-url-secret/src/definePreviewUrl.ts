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
    preview = '/',
  } = options
  const productionUrl = new URL(preview, origin)
  const enableDraftModeUrl = draftMode.enable
    ? new URL(draftMode.enable, origin)
    : undefined

  return async (context): Promise<string> => {
    const previewUrl = new URL(
      context.previewSearchParam || preview,
      productionUrl,
    )
    if (enableDraftModeUrl) {
      const enableDraftModeRequestUrl = new URL(enableDraftModeUrl)
      const { searchParams } = enableDraftModeRequestUrl
      searchParams.set(urlSearchParamPreviewSecret, context.previewUrlSecret)
      if (previewUrl.pathname !== enableDraftModeRequestUrl.pathname) {
        searchParams.set(urlSearchParamPreviewPathname, previewUrl.pathname)
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
