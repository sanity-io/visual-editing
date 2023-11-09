/** @internal */
export type PreviewUrlSecretSchemaIdPrefix = `sanity-preview-url-secret`

/** @internal */
export type PreviewUrlSecretSchemaIdToolName =
  | 'presentation'
  | 'desk'
  | 'production-url'
  | string

/** @internal */
export type PreviewUrlSecretSchemaIdType =
  `${PreviewUrlSecretSchemaIdPrefix}.${PreviewUrlSecretSchemaIdToolName}`

/** @internal */
export type PreviewUrlSecretSchemaType = `sanity.previewUrlSecret`

/**
 * A subset type that's compatible with most SanityClient typings,
 * this makes it easier to use this package in libraries that may use `import type { SanityClient } from 'sanity'`
 * as well as those that use `import type { SanityClient } from '@sanity/client'`
 * @internal
 */
export type SanityClientLike = {
  config(): { token?: string }
  withConfig(config: {
    apiVersion?: string
    useCdn?: boolean
    perspective: 'raw'
    resultSourceMap: boolean
  }): SanityClientLike
  fetch<
    R,
    Q = {
      [key: string]: any
    },
  >(
    query: string,
    params: Q,
    options: { tag?: string },
  ): Promise<R>
}
