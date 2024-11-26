import {
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewPerspective,
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
    previewMode,
    origin = typeof location === 'undefined' ? 'https://localhost' : location.origin,
  } = options
  const enableUrl = previewMode?.enable || draftMode?.enable
  let {preview = '/'} = options
  const productionUrl = new URL(preview, origin)
  const enablePreviewModeUrl = enableUrl ? new URL(enableUrl, origin) : undefined

  return async (context): Promise<string> => {
    try {
      if (context.previewSearchParam) {
        const restoredUrl = new URL(context.previewSearchParam, productionUrl)
        if (restoredUrl.origin === productionUrl.origin) {
          preview = `${restoredUrl.pathname}${restoredUrl.search}`
        }
      }
    } catch {
      // ignore
    }
    // Prevent infinite recursion
    if (
      typeof location !== 'undefined' &&
      location.origin === productionUrl.origin &&
      context.studioBasePath &&
      (preview.startsWith(`${context.studioBasePath}/`) || preview === context.studioBasePath)
    ) {
      preview = options.preview || '/'
    }
    const previewUrl = new URL(preview, productionUrl)
    if (enablePreviewModeUrl) {
      const enablePreviewModeRequestUrl = new URL(enablePreviewModeUrl)
      const {searchParams} = enablePreviewModeRequestUrl
      searchParams.set(urlSearchParamPreviewSecret, context.previewUrlSecret)
      searchParams.set(urlSearchParamPreviewPerspective, context.studioPreviewPerspective)
      if (previewUrl.pathname !== enablePreviewModeRequestUrl.pathname) {
        searchParams.set(
          urlSearchParamPreviewPathname,
          `${previewUrl.pathname}${previewUrl.search}`,
        )
      }

      return enablePreviewModeRequestUrl.toString()
    }
    return previewUrl.toString()
  }
}

export type {PreviewUrlResolver, PreviewUrlResolverContext, PreviewUrlResolverOptions}
