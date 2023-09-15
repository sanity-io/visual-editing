import type { SanityClient } from '@sanity/client'

export type * from '@sanity/client'

export interface DefineStoreOptions {
  /**
   * A configured instance of `createClient` from `@sanity/client`, or a library that is drop-in compatible.
   */
  client: SanityClient
  /**
   * Reconfigures `client` with the provided `token`, as well as changing its configuration to
   * have `perspective: 'previewDrafts'`, `useCdn: false` and `ignoreBrowserTokenWarning: true`.
   * If you want to use a different configuration, then use just the `client` prop and set the token yourself,
   * for example by: `client={client.withConfig({token})}`
   */
  previewDrafts?: PreviewDraftsOptions
  /**
   * Get verbose log output about the state of the store and how it's configured
   */
  logger?: Logger
}

export interface PreviewDraftsOptions {
  /**
   * Wether to preview drafts or not, if set to `true` then the `client` instance will be
   * reconfigured with optimal settings for previewing drafts and respond to updates in
   * a hybrid strategy that will respond in real-time, or on a refresh interval if the content is too dynamic.
   * @defaultValue false
   */
  enabled: boolean
  /**
   * A token is required for accessing draft content, without it you'll only see published content.
   * If the dataset is `private` then you'll see no content at all.
   * This option is optional if `client` is already configured with a token.
   */
  token?: string
}

/**
 * Specify a `console.log` compatible logger to aid debugging
 */
export type Logger =
  | typeof console
  | Pick<typeof console, 'warn' | 'error' | 'log'>
