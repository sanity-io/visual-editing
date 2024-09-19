/// <reference types="next" />

import {
  type ClientPerspective,
  type ClientReturn,
  type ContentSourceMap,
  type QueryParams,
  type SanityClient,
} from '@sanity/client'
import {handleDraftModeActionMissing} from '@sanity/next-loader/server-actions'
import {apiVersion} from '@sanity/preview-url-secret/constants'
import {validateSecret} from '@sanity/preview-url-secret/validate-secret'
import dynamic from 'next/dynamic.js'
import {cookies, draftMode} from 'next/headers.js'
import {perspectiveCookieName} from './constants'

const SanityLiveClientComponent = dynamic(
  () => import('@sanity/next-loader/client-components/live'),
  {ssr: false},
)

/**
 * @public
 */
export type DefinedSanityFetchType = <const QueryString extends string>(options: {
  query: QueryString
  params?: QueryParams
  perspective?: Omit<ClientPerspective, 'raw'>
  stega?: boolean
}) => Promise<{
  data: ClientReturn<QueryString>
  sourceMap: ContentSourceMap | null
  tags: string[]
}>

/**
 * @public
 */
export interface DefinedSanityLiveProps {
  /**
   * Once you've checked that the `liveDraftsToken` is only Viewer rights or lower, you can set this to `true` to silence browser warnings about the token.
   */
  ignoreBrowserTokenWarning?: boolean
  /**
   * Required to enable draft mode in Presentation Tool. Requires `previewDraftsToken`. Returns a string if there were an error
   */
  handleDraftModeAction?: (secret: string) => Promise<void | string>
}

/**
 * @public
 */
export interface DefineSanityLiveOptions {
  /**
   * Required for `sanityFetch` and `SanityLive` to work
   */
  client: SanityClient
  /**
   * Optional. If provided then the token needs to have permissions to query documents with `drafts.` prefixes as well as `sanity-preview-url-secret.` prefixes.
   * This token is not shared with the browser.
   */
  previewDraftsToken?: string
  /**
   * Optional. This token is shared with the browser, and should only have access to query published documents.
   * It is used to setup a `Live Draft Content` EventSource connection, and enables live previewing drafts stand-alone, outside of Presentation Tool.
   */
  liveDraftsToken?: string
}

/**
 * @public
 */
export type VerifyPreviewSecretType = (
  secret: string,
) => Promise<{isValid: boolean; studioUrl: string | null}>

/**
 * @public
 */
export function defineLive(config: DefineSanityLiveOptions): {
  sanityFetch: DefinedSanityFetchType
  SanityLive: React.ComponentType<DefinedSanityLiveProps>
  verifyPreviewSecret: VerifyPreviewSecretType
} {
  const {client: _client, previewDraftsToken, liveDraftsToken} = config

  if (!_client) {
    throw new Error('`client` is required for `defineLive` to function')
  }

  if (!previewDraftsToken) {
    // eslint-disable-next-line no-console
    console.warn(
      'No `previewDraftsToken` provided to `defineLive`. This means that only published content will be fetched and respond to live events',
    )
  }

  if (!liveDraftsToken) {
    // eslint-disable-next-line no-console
    console.warn(
      'No `liveDraftsToken` provided to `defineLive`. This means that live previewing drafts will only work when using the Presentation Tool in your Sanity Studio. To support live previewing drafts stand-alone, provide a `liveDraftsToken`. It is shared with the browser so it should only have Viewer rights or lower',
    )
  }

  const client = _client.withConfig({
    allowReconfigure: false,
    useCdn: false,
  })
  const {token: originalToken} = client.config()

  const sanityFetch: DefinedSanityFetchType = async function sanityFetch<
    const QueryString extends string,
  >({
    query,
    params = {},
    stega = draftMode().isEnabled,
    perspective: _perspective = draftMode().isEnabled
      ? cookies().has(perspectiveCookieName)
        ? cookies().get(perspectiveCookieName)?.value
        : 'previewDrafts'
      : 'published',
  }: {
    query: QueryString
    params?: QueryParams
    stega?: boolean
    perspective?: Omit<ClientPerspective, 'raw'>
  }) {
    const perspective = _perspective === 'previewDrafts' ? 'previewDrafts' : 'published'

    // fetch the tags first, with revalidate to 1s to ensure we get the latest tags, eventually
    const {syncTags} = await client.fetch(query, params, {
      filterResponse: false,
      perspective,
      stega: false,
      returnQuery: false,
      next: {revalidate: 1, tags: ['sanity']},
    })

    const tags = ['sanity', ...(syncTags?.map((tag) => `sanity:${tag}`) || [])]

    const {result, resultSourceMap} = await client.fetch(query, params, {
      filterResponse: false,
      perspective: perspective as ClientPerspective,
      stega,
      token:
        perspective === 'previewDrafts' && previewDraftsToken ? previewDraftsToken : originalToken,
      next: {revalidate: false, tags},
    })
    return {data: result, sourceMap: resultSourceMap || null, tags}
  }

  const SanityLive: React.ComponentType<DefinedSanityLiveProps> = function SanityLive(props) {
    const {ignoreBrowserTokenWarning, handleDraftModeAction = handleDraftModeActionMissing} = props
    const {projectId, dataset, apiHost, apiVersion, useProjectHostname} = client.config()

    return (
      <SanityLiveClientComponent
        projectId={projectId}
        dataset={dataset}
        apiHost={apiHost}
        apiVersion={apiVersion}
        useProjectHostname={useProjectHostname}
        token={liveDraftsToken && draftMode().isEnabled ? liveDraftsToken : undefined}
        ignoreBrowserTokenWarning={ignoreBrowserTokenWarning}
        draftModeEnabled={draftMode().isEnabled}
        handleDraftModeAction={handleDraftModeAction}
      />
    )
  }

  const verifyPreviewSecret: VerifyPreviewSecretType = async (secret) => {
    if (!previewDraftsToken) {
      throw new Error(
        '`previewDraftsToken` is required to verify a preview secrets and initiate draft mode',
      )
    }

    if (typeof secret !== 'string') {
      throw new TypeError('`secret` must be a string')
    }
    if (!secret.trim()) {
      throw new Error('`secret` must not be an empty string')
    }

    const client = _client.withConfig({
      // Use the token that is setup to query draft documents, it should also have permission to query for secrets
      token: previewDraftsToken,
      // Userland might be using an API version that's too old to use perspectives
      apiVersion,
      // We can't use the CDN, the secret is typically validated right after it's created
      useCdn: false,
      // Don't waste time returning a source map, we don't need it
      resultSourceMap: false,
      // Stega is not needed
      stega: false,
    })
    const {isValid, studioUrl} = await validateSecret(client, secret, false)
    return {isValid, studioUrl}
  }

  return {sanityFetch, SanityLive, verifyPreviewSecret}
}
