import type {SanityClient} from '@sanity/client'
import type {HistoryRefresh, VisualEditingOptions} from '../dist'

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
   * The Sanity client instance for fetching data and listening to mutations
   */
  client: SanityClient
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

/** @public */
export interface VisualEditingLocals {
  client: SanityClient
  preview: boolean
}
