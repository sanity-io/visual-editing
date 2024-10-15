/// <reference types="next" />

import {
  type ClientPerspective,
  type ClientReturn,
  type ContentSourceMap,
  type QueryParams,
  type SanityClient,
} from '@sanity/client'
import SanityLiveClientComponent from '@sanity/next-loader/client-components/live'
import SanityLiveStreamClientComponent from '@sanity/next-loader/client-components/live-stream'
import {handleDraftModeActionMissing} from '@sanity/next-loader/server-actions'
import {apiVersion} from '@sanity/preview-url-secret/constants'
import {validateSecret} from '@sanity/preview-url-secret/validate-secret'
import {cookies, draftMode} from 'next/headers.js'
import {rsc} from 'rsc-env'
import {perspectiveCookieName} from './constants'
import {sanitizePerspective} from './utils'

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
export type DefinedSanityLiveStreamType = <const QueryString extends string>(props: {
  query: QueryString
  params?: QueryParams
  perspective?: Omit<ClientPerspective, 'raw'>
  stega?: boolean
  children: (result: {
    data: ClientReturn<QueryString>
    sourceMap: ContentSourceMap | null
    tags: string[]
  }) => Promise<Awaited<React.ReactNode>>
  // @TODO follow up on this after React 19: https://github.com/vercel/next.js/discussions/67365#discussioncomment-9935377
  // }) => Promise<Awaited<React.ReactNode>>
}) => React.ReactNode

/**
 * @public
 */
export interface DefinedSanityLiveProps {
  /**
   * Once you've checked that the `browserToken` is only Viewer rights or lower, you can set this to `true` to silence browser warnings about the token.
   * TODO: this warning should only be necessary when `serverToken` and `browserToken` are the same value
   */
  ignoreBrowserTokenWarning?: boolean
  /**
   * Required to enable draft mode in Presentation Tool. Requires `serverToken`. Returns a string if there were an error
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
  serverToken?: string
  /**
   * Optional. This token is shared with the browser, and should only have access to query published documents.
   * It is used to setup a `Live Draft Content` EventSource connection, and enables live previewing drafts stand-alone, outside of Presentation Tool.
   */
  browserToken?: string
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
  SanityLiveStream: DefinedSanityLiveStreamType
  verifyPreviewSecret: VerifyPreviewSecretType
} {
  if (!rsc) {
    throw new Error('defineLive can only be used in React Server Components')
  }

  const {client: _client, serverToken, browserToken} = config

  if (!_client) {
    throw new Error('`client` is required for `defineLive` to function')
  }

  if (!serverToken) {
    // eslint-disable-next-line no-console
    console.warn(
      'No `serverToken` provided to `defineLive`. This means that only published content will be fetched and respond to live events',
    )
  }

  if (!browserToken) {
    // eslint-disable-next-line no-console
    console.warn(
      'No `browserToken` provided to `defineLive`. This means that live previewing drafts will only work when using the Presentation Tool in your Sanity Studio. To support live previewing drafts stand-alone, provide a `browserToken`. It is shared with the browser so it should only have Viewer rights or lower',
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
    stega: _stega,
    perspective: _perspective,
  }: {
    query: QueryString
    params?: QueryParams
    stega?: boolean
    perspective?: Omit<ClientPerspective, 'raw'>
  }) {
    const stega = _stega ?? (await draftMode()).isEnabled
    const perspective =
      _perspective ??
      ((await draftMode()).isEnabled
        ? (await cookies()).has(perspectiveCookieName)
          ? sanitizePerspective(
              (await cookies()).get(perspectiveCookieName)?.value,
              'previewDrafts',
            )
          : 'previewDrafts'
        : 'published')

    // fetch the tags first, with revalidate to 1s to ensure we get the latest tags, eventually
    const {syncTags} = await client.fetch(query, params, {
      filterResponse: false,
      perspective: perspective as ClientPerspective,
      stega: false,
      returnQuery: false,
      next: {revalidate: 1, tags: ['sanity']},
    })

    const tags = ['sanity', ...(syncTags?.map((tag) => `sanity:${tag}`) || [])]

    const {result, resultSourceMap} = await client.fetch(query, params, {
      filterResponse: false,
      perspective: perspective as ClientPerspective,
      stega,
      token: perspective === 'previewDrafts' && serverToken ? serverToken : originalToken,
      next: {revalidate: false, tags},
      // this is a bit of a hack, but it works as a cache buster for now in case next.js gets "stuck" and doesn't pick up on new/changed/removed tags related to a query
      // lastLiveEventId: syncTags?.map((tag) => tag.replace('s1:', '')).join(''),
    })
    return {data: result, sourceMap: resultSourceMap || null, tags}
  }

  const SanityLive: React.ComponentType<DefinedSanityLiveProps> = async function SanityLive(props) {
    const {ignoreBrowserTokenWarning, handleDraftModeAction = handleDraftModeActionMissing} = props
    const {projectId, dataset, apiHost, apiVersion, useProjectHostname} = client.config()

    return (
      <SanityLiveClientComponent
        projectId={projectId}
        dataset={dataset}
        apiHost={apiHost}
        apiVersion={apiVersion}
        useProjectHostname={useProjectHostname}
        token={
          typeof browserToken === 'string' && (await draftMode()).isEnabled
            ? browserToken
            : undefined
        }
        ignoreBrowserTokenWarning={ignoreBrowserTokenWarning}
        draftModeEnabled={(await draftMode()).isEnabled}
        handleDraftModeAction={handleDraftModeAction}
        draftModePerspective={
          (await draftMode()).isEnabled
            ? (await cookies()).has(perspectiveCookieName)
              ? sanitizePerspective(
                  (await cookies()).get(perspectiveCookieName)?.value,
                  'previewDrafts',
                )
              : 'previewDrafts'
            : 'published'
        }
      />
    )
  }

  const SanityLiveStream: DefinedSanityLiveStreamType = async function SanityLiveStream(props) {
    const {query, params, perspective: _perspective, stega: _stega, children} = props
    const {data, sourceMap, tags} = await sanityFetch({
      query,
      params,
      perspective: _perspective,
      stega: _stega,
    })

    if ((await draftMode()).isEnabled) {
      const stega = _stega ?? (await draftMode()).isEnabled
      const perspective =
        _perspective ??
        ((await draftMode()).isEnabled
          ? (await cookies()).has(perspectiveCookieName)
            ? sanitizePerspective(
                (await cookies()).get(perspectiveCookieName)?.value,
                'previewDrafts',
              )
            : 'previewDrafts'
          : 'published')
      const {projectId, dataset} = client.config()
      return (
        <SanityLiveStreamClientComponent
          projectId={projectId}
          dataset={dataset}
          query={query}
          params={params}
          perspective={perspective}
          stega={stega}
          initial={await children({data, sourceMap, tags})}
          // eslint-disable-next-line react/no-children-prop, @typescript-eslint/no-explicit-any
          children={children as unknown as any}
        />
      )
    }

    return <>{children({data, sourceMap, tags})}</>
  }

  const verifyPreviewSecret: VerifyPreviewSecretType = async (secret) => {
    if (!serverToken) {
      throw new Error(
        '`serverToken` is required to verify a preview secrets and initiate draft mode',
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
      token: serverToken,
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

  return {sanityFetch, SanityLive, SanityLiveStream, verifyPreviewSecret}
}
