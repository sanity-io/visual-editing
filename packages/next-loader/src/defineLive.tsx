/// <reference types="next" />
/// <reference types="react/experimental" />

import {
  type ClientPerspective,
  type ClientReturn,
  type ContentSourceMap,
  type QueryParams,
  type SanityClient,
} from '@sanity/client'
import SanityLiveClientComponent from '@sanity/next-loader/client-components/live'
import SanityLiveStreamClientComponent from '@sanity/next-loader/client-components/live-stream'
// import {handleDraftModeActionMissing} from '@sanity/next-loader/server-actions'
import {perspectiveCookieName} from '@sanity/preview-url-secret/constants'
// import {validateSecret} from '@sanity/preview-url-secret/validate-secret'
import {cookies, draftMode} from 'next/headers.js'
import {sanitizePerspective} from './utils'

/**
 * @public
 */
export type DefinedSanityFetchType = <const QueryString extends string>(options: {
  query: QueryString
  params?: QueryParams | Promise<QueryParams>
  perspective?: Exclude<ClientPerspective, 'raw'>
  stega?: boolean
  tag?: string
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
  params?: QueryParams | Promise<QueryParams>
  perspective?: Exclude<ClientPerspective, 'raw'>
  stega?: boolean
  tag?: string
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
   * Automatic refresh of RSC when the component <SanityLive /> is mounted.
   * Note that this is different from revalidation, which is based on tags and causes `sanityFetch` calls to be re-fetched.
   * @defaultValue `true`
   */
  refreshOnMount?: boolean
  /**
   * Automatically refresh when window gets focused
   * Note that this is different from revalidation, which is based on tags and causes `sanityFetch` calls to be re-fetched.
   * @defaultValue `false` if draftMode().isEnabled, otherwise `true` if not inside an iframe
   */
  refreshOnFocus?: boolean
  /**
   * Automatically refresh when the browser regains a network connection (via navigator.onLine)
   * Note that this is different from revalidation, which is based on tags and causes `sanityFetch` calls to be re-fetched.
   * @defaultValue `true`
   */
  refreshOnReconnect?: boolean

  /**
   * Optional request tag for the listener. Use to identify the request in logs.
   *
   * @defaultValue `next-loader.live`
   */
  tag?: string
  /**
   * Handle errors from the Live Events subscription.
   * By default it's reported using `console.error`, you can override this prop to handle it in your own way.
   */
  onError?: (error: unknown) => void
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
   * Optional. If provided then the token needs to have permissions to query documents with `drafts.` prefixes in order for `perspective: 'previewDrafts'` to work.
   * This token is not shared with the browser.
   */
  serverToken?: string
  /**
   * Optional. This token is shared with the browser, and should only have access to query published documents.
   * It is used to setup a `Live Draft Content` EventSource connection, and enables live previewing drafts stand-alone, outside of Presentation Tool.
   */
  browserToken?: string
  /**
   * Fetch options used by `sanityFetch`
   */
  fetchOptions?: {
    /**
     * Optional, enables time based revalidation in addition to the EventSource connection.
     * @defaultValue `false`
     */
    revalidate?: number | false
  }
  /**
   * Optional. Include stega encoding when draft mode is enabled.
   *  @defaultValue `true`
   */
  stega?: boolean
}

// export type VerifyPreviewSecretType = (
//   secret: string,
// ) => Promise<{isValid: boolean; studioUrl: string | null}>

/**
 * @public
 */
export function defineLive(config: DefineSanityLiveOptions): {
  /**
   * Use this function to fetch data from Sanity in your React Server Components.
   * @public
   */
  sanityFetch: DefinedSanityFetchType
  /**
   * Render this in your root layout.tsx to make your page revalidate on new content live, automatically.
   * @public
   */
  SanityLive: React.ComponentType<DefinedSanityLiveProps>
  /**
   * @alpha experimental, it may change or even be removed at any time
   */
  SanityLiveStream: DefinedSanityLiveStreamType
  // verifyPreviewSecret: VerifyPreviewSecretType
} {
  const {
    client: _client,
    serverToken,
    browserToken,
    fetchOptions,
    stega: stegaEnabled = true,
  } = config

  if (!_client) {
    throw new Error('`client` is required for `defineLive` to function')
  }

  if (process.env.NODE_ENV !== 'production' && !serverToken) {
    // eslint-disable-next-line no-console
    console.warn(
      'No `serverToken` provided to `defineLive`. This means that only published content will be fetched and respond to live events',
    )
  }

  if (process.env.NODE_ENV !== 'production' && !browserToken) {
    // eslint-disable-next-line no-console
    console.warn(
      'No `browserToken` provided to `defineLive`. This means that live previewing drafts will only work when using the Presentation Tool in your Sanity Studio. To support live previewing drafts stand-alone, provide a `browserToken`. It is shared with the browser so it should only have Viewer rights or lower',
    )
  }

  const client = _client.withConfig({allowReconfigure: false, useCdn: false})
  const {token: originalToken} = client.config()
  const studioUrlDefined = typeof client.config().stega.studioUrl !== 'undefined'

  const sanityFetch: DefinedSanityFetchType = async function sanityFetch<
    const QueryString extends string,
  >({
    query,
    params = {},
    stega: _stega,
    perspective: _perspective,
    tag = 'next-loader.fetch',
  }: {
    query: QueryString
    params?: QueryParams | Promise<QueryParams>
    stega?: boolean
    perspective?: Exclude<ClientPerspective, 'raw'>
    tag?: string
  }) {
    const stega = _stega ?? (stegaEnabled && studioUrlDefined && (await draftMode()).isEnabled)
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
    const useCdn = perspective === 'published'

    // fetch the tags first, with revalidate to 1s to ensure we get the latest tags, eventually
    const {syncTags} = await client.fetch(query, await params, {
      filterResponse: false,
      perspective: perspective as ClientPerspective,
      stega: false,
      returnQuery: false,
      next: {
        revalidate: fetchOptions?.revalidate,
        // tags: ['sanity'],
      },
      useCdn,
      cacheMode: useCdn ? 'noStale' : undefined,
      tag: [tag, 'fetch-sync-tags'].filter(Boolean).join('.'),
    })

    const tags = ['sanity', ...(syncTags?.map((tag) => `sanity:${tag}`) || [])]

    const {result, resultSourceMap} = await client.fetch(query, await params, {
      filterResponse: false,
      perspective: perspective as ClientPerspective,
      stega,
      token: perspective !== 'published' && serverToken ? serverToken : originalToken,
      next: {
        revalidate:
          (fetchOptions?.revalidate ?? process.env.NODE_ENV === 'production') ? false : undefined,
        tags,
      },
      // this is a bit of a hack, but it works as a cache buster for now in case next.js gets "stuck" and doesn't pick up on new/changed/removed tags related to a query
      // lastLiveEventId: syncTags?.map((tag) => tag.replace('s1:', '')).join(''),
      // Hash the syncTags to create a consistent, short lastLiveEventId
      lastLiveEventId: syncTags ? await hashSyncTags(syncTags) : undefined,
      useCdn,
      cacheMode: useCdn ? 'noStale' : undefined,
      tag,
    })
    return {data: result, sourceMap: resultSourceMap || null, tags}
  }
  // Helper function to hash syncTags using Web Crypto
  async function hashSyncTags(syncTags: string[]): Promise<string> {
    const input = syncTags.map((tag) => tag.replace('s1:', '')).join('')
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return hashHex.slice(0, 16)
  }

  const SanityLive: React.ComponentType<DefinedSanityLiveProps> = async function SanityLive(props) {
    const {
      // handleDraftModeAction = handleDraftModeActionMissing
      refreshOnMount,
      refreshOnFocus,
      refreshOnReconnect,
      tag = 'next-loader.live',
      onError,
    } = props
    const {
      projectId,
      dataset,
      apiHost,
      apiVersion: _apiVersion,
      useProjectHostname,
      requestTagPrefix,
    } = client.config()
    const {isEnabled: isDraftModeEnabled} = await draftMode()

    let apiVersion = _apiVersion
    // @TODO temporarily handle the Live Draft Content API only being available on vX
    if (typeof browserToken === 'string' && isDraftModeEnabled) {
      apiVersion = 'vX'
    }

    return (
      <SanityLiveClientComponent
        projectId={projectId}
        dataset={dataset}
        apiHost={apiHost}
        apiVersion={apiVersion}
        useProjectHostname={useProjectHostname}
        requestTagPrefix={requestTagPrefix}
        tag={tag}
        token={typeof browserToken === 'string' && isDraftModeEnabled ? browserToken : undefined}
        draftModeEnabled={isDraftModeEnabled}
        // handleDraftModeAction={handleDraftModeAction}
        draftModePerspective={
          isDraftModeEnabled
            ? (await cookies()).has(perspectiveCookieName)
              ? sanitizePerspective(
                  (await cookies()).get(perspectiveCookieName)?.value,
                  'previewDrafts',
                )
              : 'previewDrafts'
            : 'published'
        }
        refreshOnMount={refreshOnMount}
        refreshOnFocus={refreshOnFocus}
        refreshOnReconnect={refreshOnReconnect}
        onError={onError}
      />
    )
  }

  // @ts-expect-error - follow up on this after React 19: https://github.com/vercel/next.js/discussions/67365#discussioncomment-9935377
  const SanityLiveStream: DefinedSanityLiveStreamType = async function SanityLiveStream(props) {
    const {
      query,
      params,
      perspective: _perspective,
      stega: _stega,
      children,
      tag = 'next-loader.live-stream.fetch',
    } = props
    const {data, sourceMap, tags} = await sanityFetch({
      query,
      params,
      perspective: _perspective,
      stega: _stega,
      tag,
    })
    const {isEnabled: isDraftModeEnabled} = await draftMode()

    if (isDraftModeEnabled) {
      const stega = _stega ?? (stegaEnabled && studioUrlDefined && (await draftMode()).isEnabled)
      const perspective =
        (_perspective ?? (await cookies()).has(perspectiveCookieName))
          ? sanitizePerspective(
              (await cookies()).get(perspectiveCookieName)?.value,
              'previewDrafts',
            )
          : 'previewDrafts'
      const {projectId, dataset} = client.config()
      return (
        <SanityLiveStreamClientComponent
          projectId={projectId}
          dataset={dataset}
          query={query}
          params={await params}
          perspective={perspective}
          stega={stega}
          initial={children({data, sourceMap, tags})}
          // eslint-disable-next-line react/no-children-prop, @typescript-eslint/no-explicit-any
          children={children as unknown as any}
        />
      )
    }

    return children({data, sourceMap, tags})
  }

  // const verifyPreviewSecret: VerifyPreviewSecretType = async (secret) => {
  //   if (!serverToken) {
  //     throw new Error(
  //       '`serverToken` is required to verify a preview secrets and initiate draft mode',
  //     )
  //   }

  //   if (typeof secret !== 'string') {
  //     throw new TypeError('`secret` must be a string')
  //   }
  //   if (!secret.trim()) {
  //     throw new Error('`secret` must not be an empty string')
  //   }

  //   const client = _client.withConfig({
  //     // Use the token that is setup to query draft documents, it should also have permission to query for secrets
  //     token: serverToken,
  //     // Userland might be using an API version that's too old to use perspectives
  //     apiVersion,
  //     // We can't use the CDN, the secret is typically validated right after it's created
  //     useCdn: false,
  //     // Don't waste time returning a source map, we don't need it
  //     resultSourceMap: false,
  //     // Stega is not needed
  //     stega: false,
  //   })
  //   const {isValid, studioUrl} = await validateSecret(client, secret, false)
  //   return {isValid, studioUrl}
  // }

  return {
    sanityFetch,
    SanityLive,
    SanityLiveStream,
    // verifyPreviewSecret
  }
}
