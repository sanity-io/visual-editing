import {
  type ChannelsController,
  type ChannelStatus,
  createChannelsController,
} from '@sanity/channels'
import type { ClientPerspective } from '@sanity/client'
import { studioPath } from '@sanity/client/csm'
import { BoundaryElementProvider, Flex } from '@sanity/ui'
import {
  getQueryCacheKey,
  isAltKey,
  isHotkey,
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from '@sanity/visual-editing-helpers'
import {
  type ReactElement,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useUnique } from 'sanity'
import {
  getPublishedId,
  type Path,
  type SanityDocument,
  type Tool,
  useDataset,
  useProjectId,
} from 'sanity'
import { RouterContextValue, useRouter } from 'sanity/router'
import styled from 'styled-components'

import {
  DEFAULT_TOOL_NAME,
  MIN_LOADER_QUERY_LISTEN_HEARTBEAT_INTERVAL,
} from './constants'
import { ContentEditor } from './editor/ContentEditor'
import LoaderQueries from './loader/LoaderQueries'
import { Panel } from './panels/Panel'
import { PanelResizer } from './panels/PanelResizer'
import { Panels } from './panels/Panels'
import { HoldEditState } from './perf/HoldEditState'
import { PresentationNavigateProvider } from './PresentationNavigateProvider'
import { usePresentationNavigator } from './PresentationNavigator'
import { PresentationParamsProvider } from './PresentationParamsProvider'
import { PresentationProvider } from './PresentationProvider'
import { PreviewFrame } from './preview/PreviewFrame'
import type {
  DeskDocumentPaneParams,
  LiveQueriesState,
  LiveQueriesStateValue,
  PresentationPluginOptions,
  PresentationStateParams,
} from './types'
import { DocumentOnPage, useDocumentsOnPage } from './useDocumentsOnPage'
import { useParams } from './useParams'
import { usePreviewUrl } from './usePreviewUrl'

const Container = styled(Flex)`
  overflow-x: auto;
`

export default function PresentationTool(props: {
  tool: Tool<PresentationPluginOptions>
}): ReactElement {
  const {
    previewUrl: _previewUrl,
    components,
    unstable_showUnsafeShareUrl = false,
  } = props.tool.options ?? {}
  const name = props.tool.name || DEFAULT_TOOL_NAME
  const { unstable_navigator } = components || {}

  const { navigate: routerNavigate, state: routerState } =
    useRouter() as RouterContextValue & { state: PresentationStateParams }
  const routerSearchParams = useUnique(
    Object.fromEntries(routerState._searchParams || []),
  )

  const initialPreviewUrl = usePreviewUrl(
    _previewUrl || '/',
    name,
    routerSearchParams.preview || null,
  )

  const [devMode] = useState(() => {
    const option = props.tool.options?.devMode

    if (typeof option === 'function') return option()
    if (typeof option === 'boolean') return option

    return (
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
    )
  })

  const targetOrigin = useMemo(() => {
    return initialPreviewUrl.origin
  }, [initialPreviewUrl.origin])

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [channel, setChannel] = useState<ChannelsController<VisualEditingMsg>>()

  const [liveQueries, setLiveQueries] = useState<LiveQueriesState>({})

  const { setParams, params, deskParams } = useParams({
    initialPreviewUrl,
    routerNavigate,
    routerState,
    routerSearchParams,
  })

  const [perspective, setPerspective] = useState<ClientPerspective>(() =>
    params.perspective === 'published' ? params.perspective : 'previewDrafts',
  )

  const [documentsOnPage, setDocumentsOnPage] = useDocumentsOnPage(perspective)

  const [overlayEnabled, setOverlayEnabled] = useState(true)

  const projectId = useProjectId()
  const dataset = useDataset()

  const previewRef = useRef<typeof params.preview>()

  const idRef = useRef(params.id)

  const [preloadRefs, setPreloadRefs] = useState<DocumentOnPage[]>(() =>
    documentsOnPage
      .slice(0, 3)
      .map((d) => ({ ...d, _id: getPublishedId(d._id) })),
  )

  // Update the perspective when the param changes
  useEffect(() => {
    if (perspective !== params.perspective) {
      setParams({ perspective })
    }
  }, [params.perspective, perspective, setParams])

  useEffect(() => {
    setPreloadRefs(
      documentsOnPage
        .slice(0, 3)
        .map((d) => ({ ...d, _id: getPublishedId(d._id) })),
    )
  }, [documentsOnPage])

  useEffect(() => {
    if (params.id !== idRef.current) {
      idRef.current = params.id

      if (params.id) {
        setPreloadRefs((p) => {
          const exists = p.find((d) => d._id === params.id)

          if (exists) return p

          return p.slice(1).concat([{ _id: params.id!, _type: params.type! }])
        })
      }
    }
  }, [params])

  const [overlaysConnection, setOverlaysConnection] =
    useState<ChannelStatus>('connecting')
  const [loadersConnection, setLoadersConnection] =
    useState<ChannelStatus>('connecting')
  const [previewKitConnection, setPreviewKitConnection] =
    useState<ChannelStatus>('connecting')

  const [popups] = useState<Set<Window>>(() => new Set())
  const handleOpenPopup = useCallback(
    (url: string) => {
      const source = window.open(url, '_blank')
      if (source) {
        popups.add(source)
      }
    },
    [popups],
  )

  useEffect(() => {
    if (popups.size && channel) {
      // loop popups and call channel.addSource
      for (const source of popups) {
        if (source && 'closed' in source && !source.closed) {
          channel.addSource(source)
        }
      }
    }
  }, [channel, popups, popups.size])

  useEffect(() => {
    const target = iframeRef.current?.contentWindow

    if (!target) return

    const nextChannel = createChannelsController<VisualEditingMsg>({
      id: 'presentation' satisfies VisualEditingConnectionIds,
      target,
      targetOrigin,
      connectTo: [
        {
          id: 'overlays' satisfies VisualEditingConnectionIds,
          heartbeat: true,
          onStatusUpdate: setOverlaysConnection,
          onEvent(type, data) {
            if (type === 'overlay/focus' && 'id' in data) {
              setParams({
                id: data.id,
                path: data.path,
                type: data.type,
              })
            } else if (type === 'overlay/navigate') {
              if (previewRef.current !== data.url) {
                const isInitialNavigation = previewRef.current === undefined

                previewRef.current = data.url
                setParams(
                  isInitialNavigation
                    ? { preview: data.url }
                    : { id: undefined, type: undefined, preview: data.url },
                )
              }
            } else if (type === 'overlay/toggle') {
              setOverlayEnabled(data.enabled)
            }
          },
        },
        {
          id: 'loaders' satisfies VisualEditingConnectionIds,
          heartbeat: true,
          onStatusUpdate: setLoadersConnection,
          onEvent(type, data) {
            if (type === 'loader/documents') {
              setDocumentsOnPage(data.perspective, data.documents)
            } else if (
              type === 'loader/query-listen' &&
              data.projectId === projectId &&
              data.dataset === dataset
            ) {
              if (
                typeof data.heartbeat === 'number' &&
                data.heartbeat! < MIN_LOADER_QUERY_LISTEN_HEARTBEAT_INTERVAL
              ) {
                throw new Error(
                  `Loader query listen heartbeat interval must be at least ${MIN_LOADER_QUERY_LISTEN_HEARTBEAT_INTERVAL}ms`,
                )
              }
              setLiveQueries((prev) => ({
                ...prev,
                [getQueryCacheKey(data.query, data.params)]: {
                  perspective: data.perspective,
                  query: data.query,
                  params: data.params,
                  receivedAt: Date.now(),
                  heartbeat: data.heartbeat ?? false,
                } satisfies LiveQueriesStateValue,
              }))
            }
          },
        },
        {
          id: 'preview-kit' satisfies VisualEditingConnectionIds,
          heartbeat: true,
          onStatusUpdate: setPreviewKitConnection,
          onEvent(type, data) {
            if (
              type === 'preview-kit/documents' &&
              data.projectId === projectId &&
              data.dataset === dataset
            ) {
              setDocumentsOnPage(data.perspective, data.documents)
            }
          },
        },
      ],
    })
    setChannel(nextChannel)

    return () => {
      nextChannel.destroy()
      setChannel(undefined)
    }
  }, [dataset, projectId, setDocumentsOnPage, setParams, targetOrigin])

  useEffect(() => {
    const interval = setInterval(
      () =>
        startTransition(() =>
          setLiveQueries((liveQueries) => {
            if (Object.keys(liveQueries).length < 1) {
              return liveQueries
            }

            const now = Date.now()
            const hasAnyExpired = Object.values(liveQueries).some(
              (liveQuery) =>
                liveQuery.heartbeat !== false &&
                now > liveQuery.receivedAt + liveQuery.heartbeat,
            )
            if (!hasAnyExpired) {
              return liveQueries
            }
            const next = {} as LiveQueriesState
            for (const [key, value] of Object.entries(liveQueries)) {
              if (
                value.heartbeat !== false &&
                now > value.receivedAt + value.heartbeat
              ) {
                continue
              }
              next[key] = value
            }
            return next
          }),
        ),
      MIN_LOADER_QUERY_LISTEN_HEARTBEAT_INTERVAL,
    )
    return () => clearInterval(interval)
  }, [])

  const handleFocusPath = useCallback(
    // eslint-disable-next-line no-warning-comments
    // @todo nextDocumentId may not be needed with this strategy
    (nextDocumentId: string, nextPath: Path) => {
      setParams({
        // Don’t need to explicitly set the id here because it was either already set via postMessage or is the same if navigating in the document pane
        path: studioPath.toString(nextPath),
      })
    },
    [setParams],
  )

  const handlePreviewPath = useCallback(
    (nextPath: string) => {
      const url = new URL(nextPath, initialPreviewUrl.origin)
      const preview = url.pathname + url.search
      if (
        url.origin === initialPreviewUrl.origin &&
        preview !== params.preview
      ) {
        setParams({ id: undefined, path: undefined, preview })
      }
    },
    [initialPreviewUrl, params, setParams],
  )

  const handleDeskParams = useCallback(
    (deskParams: DeskDocumentPaneParams) => {
      setParams({ ...deskParams })
    },
    [setParams],
  )

  useEffect(() => {
    if (params.id && params.path) {
      channel?.send('overlays', 'presentation/focus', {
        id: params.id,
        path: params.path,
      })
    } else {
      channel?.send('overlays', 'presentation/blur', undefined)
    }
  }, [channel, params.id, params.path])

  // Dispatch a navigation message whenever the preview param changes
  // @todo This will cause a reflection of received navigation messages which could be problematic
  useEffect(() => {
    if (
      previewRef.current &&
      params.preview &&
      previewRef.current !== params.preview
    ) {
      previewRef.current = params.preview
      if (overlaysConnection !== 'connected' && iframeRef.current) {
        iframeRef.current.src = `${targetOrigin}${params.preview}`
      } else {
        channel?.send('overlays', 'presentation/navigate', {
          url: params.preview,
          type: 'push',
        })
      }
    }
  }, [channel, overlaysConnection, targetOrigin, params.preview])

  const toggleOverlay = useCallback(
    () => channel?.send('overlays', 'presentation/toggleOverlay', undefined),
    [channel],
  )

  // The current document being edited, it's put on the fast track for super low latency updates
  const [liveDocument, setLiveDocument] = useState<SanityDocument | null>(null)
  const onDocumentChange = useCallback(
    (document: SanityDocument | null) => setLiveDocument(document),
    [],
  )

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (isAltKey(e)) {
        toggleOverlay()
      }
    }
    const handleKeydown = (e: KeyboardEvent) => {
      if (isAltKey(e)) {
        toggleOverlay()
      }

      if (isHotkey(['mod', '\\'], e)) {
        toggleOverlay()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [toggleOverlay])

  const [boundaryElement, setBoundaryElement] = useState<HTMLDivElement | null>(
    null,
  )

  const [{ navigatorEnabled, toggleNavigator }, PresentationNavigator] =
    usePresentationNavigator({ unstable_navigator })

  return (
    <>
      <PresentationProvider
        deskParams={deskParams}
        devMode={devMode}
        name={name}
        params={params}
        setParams={setParams}
      >
        {/* perf improvement: preload edit state */}
        {preloadRefs.map((d) => (
          <HoldEditState id={d._id} key={d._id} type={d._type} />
        ))}

        <PresentationNavigateProvider setParams={setParams}>
          <PresentationParamsProvider params={params}>
            <Container height="fill">
              <Panels>
                <PresentationNavigator />
                <Panel
                  id="preview"
                  minWidth={325}
                  defaultSize={navigatorEnabled ? 50 : 75}
                  order={3}
                >
                  <Flex
                    direction="column"
                    flex={1}
                    height="fill"
                    ref={setBoundaryElement}
                  >
                    <BoundaryElementProvider element={boundaryElement}>
                      <PreviewFrame
                        initialUrl={initialPreviewUrl}
                        navigatorEnabled={navigatorEnabled}
                        onPathChange={handlePreviewPath}
                        openPopup={handleOpenPopup}
                        overlayEnabled={overlayEnabled}
                        params={params}
                        perspective={perspective}
                        ref={iframeRef}
                        setPerspective={setPerspective}
                        targetOrigin={targetOrigin}
                        toggleNavigator={toggleNavigator}
                        toggleOverlay={toggleOverlay}
                        loadersConnection={loadersConnection}
                        overlaysConnection={overlaysConnection}
                        previewKitConnection={previewKitConnection}
                        unstable_showUnsafeShareUrl={
                          unstable_showUnsafeShareUrl
                        }
                      />
                    </BoundaryElementProvider>
                  </Flex>
                </Panel>
                <PanelResizer order={4} />
                <Panel id="content" minWidth={325} order={5}>
                  <ContentEditor
                    refs={documentsOnPage}
                    deskParams={deskParams}
                    documentId={params.id}
                    documentType={params.type}
                    onDeskParams={handleDeskParams}
                    onFocusPath={handleFocusPath}
                    onDocumentChange={onDocumentChange}
                    previewUrl={params.preview}
                  />
                </Panel>
              </Panels>
            </Container>
          </PresentationParamsProvider>
        </PresentationNavigateProvider>
      </PresentationProvider>
      {channel && (
        <>
          <LoaderQueries
            key="published"
            activePerspective={perspective === 'published'}
            channel={channel}
            liveQueries={liveQueries}
            perspective="published"
            // Only send the liveDocument if it's a published document
            liveDocument={
              liveDocument?._id?.startsWith('drafts.') ? null : liveDocument
            }
          />
          <LoaderQueries
            key="previewDrafts"
            activePerspective={perspective === 'previewDrafts'}
            channel={channel}
            liveQueries={liveQueries}
            perspective="previewDrafts"
            liveDocument={liveDocument}
          />
        </>
      )}
    </>
  )
}
