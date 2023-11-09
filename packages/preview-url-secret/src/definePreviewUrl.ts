import { PreviewUrlResolver, PreviewUrlResolverOptions } from './types'

/**
 * @internal
 */
export function definePreviewUrl<SanityClientType>(
  options: PreviewUrlResolverOptions,
): PreviewUrlResolver<SanityClientType> {
  const { draftMode, origin, preview = '/' } = options
  // eslint-disable-next-line no-console
  console.log('definePreviewUrl', { draftMode, origin, preview })
  return async (context): Promise<string> => {
    // eslint-disable-next-line no-console
    console.log('resolvePreviewUrl', context)
    await new Promise((resolve) => setTimeout(resolve, 5000))
    // eslint-disable-next-line no-console
    console.log('After timeout')
    return '/'
  }
}

export type { PreviewUrlResolver, PreviewUrlResolverOptions }
