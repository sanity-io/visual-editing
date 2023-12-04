import type { ConnectionStatus } from '@sanity/channels'
import { ChannelReturns, createChannel } from '@sanity/channels'
import type { ClientPerspective, QueryParams } from '@sanity/client'
import { studioPath } from '@sanity/client/csm'
import { Flex } from '@sanity/ui'
import {
  getQueryCacheKey,
  isAltKey,
  isHotkey,
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from '@sanity/visual-editing-helpers'
import {
  type ReactElement,
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

import { DEFAULT_TOOL_NAME } from './constants'
import { ContentEditor } from './editor/ContentEditor'
import LoaderQueries from './loader/LoaderQueries'
import { Panel } from './panels/Panel'
import { PanelResizer } from './panels/PanelResizer'
import { Panels } from './panels/Panels'
import { HoldEditState } from './perf/HoldEditState'
import { PresentationNavigateProvider } from './PresentationNavigateProvider'
import { PresentationParamsProvider } from './PresentationParamsProvider'
import { PresentationProvider } from './PresentationProvider'
import { PreviewFrame } from './preview/PreviewFrame'
import {
  DeskDocumentPaneParams,
  NavigatorOptions,
  PresentationPluginOptions,
  PresentationStateParams,
} from './types'
import { DocumentOnPage, useDocumentsOnPage } from './useDocumentsOnPage'
import { useLocalState } from './useLocalState'
import { useParams } from './useParams'
import { usePreviewUrl } from './usePreviewUrl'

function Navigator(props: NavigatorOptions) {
  const { minWidth, maxWidth, component: NavigatorComponent } = props
  const navigatorDisabled =
    minWidth != null && maxWidth != null && minWidth === maxWidth
  return (
    <>
      <Panel id="navigator" minWidth={minWidth} maxWidth={maxWidth} order={1}>
        <NavigatorComponent />
      </Panel>
      <PanelResizer order={2} disabled={navigatorDisabled} />
    </>
  )
}

const Container = styled(Flex)`
  overflow-x: auto;
`

export default function PresentationTool(props: {
  tool: Tool<PresentationPluginOptions>
}): ReactElement {
  const { previewUrl: _previewUrl, components } = props.tool.options ?? {}
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

  // @TODO The iframe URL might change, we have to make sure we don't post Studio state to unknown origins
  // see https://medium.com/@chiragrai3666/exploiting-postmessage-e2b01349c205
  const targetOrigin = useMemo(() => {
    return initialPreviewUrl.origin
  }, [initialPreviewUrl.origin])

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [channel, setChannel] = useState<ChannelReturns<VisualEditingMsg>>()

  const [liveQueries, setLiveQueries] = useState<
    Record<
      string,
      { query: string; params: QueryParams; perspective: ClientPerspective }
    >
  >({})

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

  const navigatorProvided = !!unstable_navigator?.component

  const [navigatorEnabled, setNavigatorEnabled] = useLocalState<boolean>(
    'presentation/navigator',
    navigatorProvided,
  )

  const projectId = useProjectId()
  const dataset = useDataset()

  const previewRef = useRef<typeof params.preview>()

  const idRef = useRef(params.id)

  const toggleNavigator = useMemo(() => {
    if (!navigatorProvided) return undefined

    return () => setNavigatorEnabled((enabled) => !enabled)
  }, [navigatorProvided, setNavigatorEnabled])

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
    useState<ConnectionStatus>('fresh')
  const [loadersConnection, setLoadersConnection] =
    useState<ConnectionStatus>('fresh')
  const [previewKitConnection, setPreviewKitConnection] =
    useState<ConnectionStatus>('fresh')

  useEffect(() => {
    const iframe = iframeRef.current?.contentWindow

    if (!iframe) return

    const nextChannel = createChannel<VisualEditingMsg>({
      id: 'presentation' satisfies VisualEditingConnectionIds,
      onStatusUpdate(status, prevStatus, connection) {
        if (connection.config.id === 'loaders') setLoadersConnection(status)
        if (connection.config.id === 'overlays') setOverlaysConnection(status)
        if (connection.config.id === 'preview-kit')
          setPreviewKitConnection(status)
      },
      connections: [
        {
          target: iframe,
          targetOrigin,
          id: 'overlays' satisfies VisualEditingConnectionIds,
          heartbeat: true,
        },
        {
          target: iframe,
          targetOrigin,
          id: 'loaders' satisfies VisualEditingConnectionIds,
          heartbeat: true,
        },
        {
          target: iframe,
          targetOrigin,
          id: 'preview-kit' satisfies VisualEditingConnectionIds,
          heartbeat: true,
        },
      ],
      handler(type, data) {
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
        } else if (
          type === 'loader/documents' ||
          (type === 'preview-kit/documents' &&
            data.projectId === projectId &&
            data.dataset === dataset)
        ) {
          setDocumentsOnPage(data.perspective, data.documents)
        } else if (
          type === 'loader/query-listen' &&
          data.projectId === projectId &&
          data.dataset === dataset
        ) {
          setLiveQueries((prev) => ({
            ...prev,
            [getQueryCacheKey(data.query, data.params)]: {
              perspective: data.perspective,
              query: data.query,
              params: data.params,
            },
          }))
        }
      },
    })
    setChannel(nextChannel)

    return () => {
      nextChannel.disconnect()
      setChannel(undefined)
    }
  }, [dataset, projectId, setDocumentsOnPage, setParams, targetOrigin])

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
      channel?.send('presentation/focus', { id: params.id, path: params.path })
    } else {
      channel?.send('presentation/blur', undefined)
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
      channel?.send('presentation/navigate', {
        url: params.preview,
        type: 'push',
      })
    }
  }, [channel, params.preview])

  const toggleOverlay = useCallback(
    () => channel?.send('presentation/toggleOverlay', undefined),
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
                {navigatorProvided && navigatorEnabled && (
                  <Navigator {...unstable_navigator} />
                )}
                <Panel
                  id="preview"
                  minWidth={325}
                  defaultSize={navigatorEnabled ? 50 : 75}
                  order={3}
                >
                  <Flex direction="column" flex={1} height="fill">
                    <PreviewFrame
                      initialUrl={initialPreviewUrl}
                      navigatorEnabled={navigatorEnabled}
                      onPathChange={handlePreviewPath}
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
                    />
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
