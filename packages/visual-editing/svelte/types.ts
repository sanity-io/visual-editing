import type {SanityClient} from '@sanity/client'
import type {HistoryRefresh, VisualEditingOptions} from '@sanity/visual-editing'
import type {SanityClientLike} from '@sanity/visual-editing-types'

/** @public */
export interface VisualEditingProps extends Omit<VisualEditingOptions, 'history' | 'refresh'> {
  /**
   * @deprecated The history adapter is already implemented
   */
  history?: never
  refresh?: (
    payload: HistoryRefresh,
    refreshDefault: () => false | Promise<void>,
  ) => false | Promise<void>
}

/** @public */
export interface HandlePreviewOptions {
  /**
   * The Sanity client instance to use for validating the preview URL, and to put on
   * `event.locals.client` with the preview perspective applied
   */
  client: SanityClientLike
  preview?: {
    /**
     * The preview secret to use for verifying preview access
     */
    secret?: string
    /**
     * The name of the cookie used to store preview secret
     * @defaultValue '__sanity_preview'
     */
    cookie?: string
    /**
     * The endpoints to use for enabling and disabling preview
     * @defaultValue { enable: '/preview/enable', disable: '/preview/disable' }
     */
    endpoints?: {
      enable?: string
      disable?: string
    }
    /**
     * For explicitly providing a redirect function in case of mistmatched
     * Svelte specific dependency versions, not needed in most cases. See
     * https://github.com/sveltejs/kit/issues/11749 for more information
     */
    redirect?: (status: number, location: string | URL) => never
  }
}

/**
 * `handlePreview` accepts any client shaped like `SanityClientLike`, but puts whichever one it was
 * given on `event.locals.client`. The type parameter defaults to `SanityClient` so the full client
 * API stays available. If your app resolves a different copy of `@sanity/client` than this package
 * does, pass your own client type to avoid a mismatch:
 * @example
 * ```ts
 * import type {SanityClient} from '@sanity/client'
 *
 * declare global {
 *   namespace App {
 *     interface Locals extends VisualEditingLocals<SanityClient> {}
 *   }
 * }
 * ```
 * @public
 */
export interface VisualEditingLocals<TClient extends SanityClientLike = SanityClient> {
  client: TClient
  preview: boolean
}
