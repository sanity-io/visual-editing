import { ClientPerspective, QueryParams } from '@sanity/client'
import { Card, Flex, useToast } from '@sanity/ui'
import { ChannelReturns, Connection, createChannel } from 'channels'
import {
  ReactElement,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Path, pathToString, Tool } from 'sanity'
import styled from 'styled-components'
import {
  getQueryCacheKey,
  HEARTBEAT_INTERVAL,
  HEARTBEAT_TIMEOUT,
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from 'visual-editing-helpers'

import { Resizable } from './components/Resizable'
import { ComposerNavigateProvider } from './ComposerNavigateProvider'
import { ComposerParamsProvider } from './ComposerParamsProvider'
import { ComposerProvider } from './ComposerProvider'
import { ContentEditor } from './editor/ContentEditor'
import LoaderQueries from './loader/LoaderQueries'
import { PreviewFrame } from './preview/PreviewFrame'
import { ComposerPluginOptions, DeskDocumentPaneParams } from './types'
import { useParams } from './useParams'

const Container = styled(Flex)`
  overflow-x: auto;
`

export default function ComposerTool(props: {
  tool: Tool<ComposerPluginOptions>
}): ReactElement {
  const { previewUrl = '/', components } = props.tool.options ?? {}

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
    // previewUrl might be relative, if it is we set `targetOrigin` to the same origin as the Studio
    // if it's an absolute URL we extract the origin from it
    const url = new URL(previewUrl, location.href)
    return url.origin
  }, [previewUrl])
  const [perspective, setPerspective] =
    useState<ClientPerspective>('previewDrafts')

  const [channel, setChannel] = useState<ChannelReturns<VisualEditingMsg>>()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [overlayDocuments, setOverlayDocuments] = useState<
    { _id: string; _type: string; _projectId?: string; dataset?: string }[]
  >([])
  const [liveQueries, setLiveQueries] = useState<
    Record<string, { query: string; params: QueryParams }>
  >({})

  const { defaultPreviewUrl, setParams, params, deskParams } = useParams({
    previewUrl,
  })

  const [overlayEnabled, setOverlayEnabled] = useState(true)

  const { onConnect, onDisconnect, handlePongEvent, lastPong, connected } =
    useChannelConnectionsStatus()
  useEffect(() => {
    const iframe = iframeRef.current?.contentWindow

    if (!iframe) return

    const nextChannel = createChannel<VisualEditingMsg>({
      id: 'composer' satisfies VisualEditingConnectionIds,
      onConnect,
      onDisconnect,
      connections: [
        {
          target: iframe,
          targetOrigin,
          id: 'overlays' satisfies VisualEditingConnectionIds,
        },
        {
          target: iframe,
          targetOrigin,
          id: 'loaders' satisfies VisualEditingConnectionIds,
        },
      ],
      handler(type, data) {
        if (handlePongEvent(type)) {
          // handled
        } else if (type === 'overlay/focus' && 'id' in data) {
          setParams({
            id: data.id,
            path: data.path,
            type: data.type,
          })
        } else if (type === 'overlay/navigate') {
          setParams({
            preview: data.url,
          })
        } else if (type === 'overlay/toggle') {
          setOverlayEnabled(data.enabled)
        } else if (type === 'loader/documents') {
          // @TODO match projectId and dataset in `data` before setting
          setOverlayDocuments(data.documents)
        } else if (type === 'loader/query-listen') {
          // @TODO match projectId and dataset in `data` before setting
          setLiveQueries((prev) => ({
            ...prev,
            [getQueryCacheKey(data.query, data.params)]: {
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
  }, [handlePongEvent, onConnect, onDisconnect, setParams, targetOrigin])
  // const reconnectChannel = useCallback(
  //   () => startTransition(() => setChannel(undefined)),
  //   [],
  // )

  const handleFocusPath = useCallback(
    // eslint-disable-next-line no-warning-comments
    // @todo nextDocumentId may not be needed with this strategy
    (nextDocumentId: string, nextPath: Path) => {
      setParams({
        // Don’t need to explicitly set the id here because it was either already set via postMessage or is the same if navigating in the document pane
        path: pathToString(nextPath),
      })
    },
    [setParams],
  )

  const healthy = useChannelsHeartbeat({ channel, lastPong, connected })
  const toast = useToast()
  useEffect(() => {
    if (!healthy.loaders) {
      toast.push({
        id: 'loader-channel-unhealthy',
        closable: true,
        description: `The connection to the preview iframe stopped responding. This means further draft changes won't be reflected in the preview.`,
        status: 'error',
        title: 'Loader channel unhealthy',
        duration: 1000 * 60 * 60,
      })
      return () =>
        toast.push({
          id: 'loader-channel-unhealthy',
          closable: true,
          description: `The connection to the preview iframe is working again.`,
          status: 'success',
          title: 'Loader channel restored',
        })
    }
  }, [healthy.loaders, toast])
  useEffect(() => {
    if (!healthy.overlays) {
      toast.push({
        id: 'overlay-channel-unhealthy',
        closable: true,
        description: `The connection to the preview iframe stopped responding. This means overlay's are unable to route clicks and focus path changes.`,
        status: 'error',
        title: 'Overlay channel unhealthy',
        duration: 1000 * 60 * 60,
      })
      return () =>
        toast.push({
          id: 'overlay-channel-unhealthy',
          closable: true,
          description: `The connection to the preview iframe is working again.`,
          status: 'success',
          title: 'Overlay channel restored',
        })
    }
  }, [healthy.overlays, toast])

  const handlePreviewPath = useCallback(
    (nextPath: string) => {
      const url = new URL(nextPath, defaultPreviewUrl.origin)
      const preview = url.pathname + url.search
      if (
        url.origin === defaultPreviewUrl.origin &&
        preview !== params.preview
      ) {
        setParams({ id: undefined, path: undefined, preview })
      }
    },
    [defaultPreviewUrl, params, setParams],
  )

  const handleDeskParams = useCallback(
    (deskParams: DeskDocumentPaneParams) => {
      setParams({ ...deskParams })
    },
    [setParams],
  )

  useEffect(() => {
    if (params.id && params.path) {
      channel?.send('composer/focus', { id: params.id, path: params.path })
    } else {
      channel?.send('composer/blur', undefined)
    }
  }, [channel, params.id, params.path])

  // Dispatch a navigation message whenever the preview param changes
  // @todo This will cause a reflection of received navigation messages which could be problematic
  useEffect(() => {
    if (params.preview) {
      channel?.send('composer/navigate', {
        url: params.preview,
        type: 'push',
      })
    }
  }, [channel, params.preview])

  // Resizing
  const minWidth = 320
  const [maxWidth, setMaxWidth] = useState(
    Math.max(window.innerWidth - minWidth, minWidth),
  )

  useEffect(() => {
    const handleWindowResize = () => {
      setMaxWidth(Math.max(window.innerWidth - minWidth, minWidth))
    }

    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])
  const [resizing, setResizing] = useState(false)
  const handleResizeStart = useCallback(() => setResizing(true), [])
  const handleResizeEnd = useCallback(() => setResizing(false), [])

  // The URL that should be loaded by the preview iframe
  // useRef to prevent iframe reloading when preview param changes
  const initialPreviewUrl = useRef(
    `${defaultPreviewUrl.origin}${params.preview}`,
  )

  const toggleOverlay = useCallback(
    () => channel?.send('composer/toggleOverlay', undefined),
    [channel],
  )

  return (
    <>
      <ComposerProvider
        deskParams={deskParams}
        devMode={devMode}
        params={params}
      >
        <ComposerNavigateProvider setParams={setParams}>
          <ComposerParamsProvider params={params}>
            <Container height="fill">
              {components?.unstable_navigator && (
                <Card borderRight flex="none">
                  <components.unstable_navigator />
                </Card>
              )}

              <Flex
                direction="column"
                flex={1}
                overflow="hidden"
                style={{ minWidth }}
              >
                <PreviewFrame
                  ref={iframeRef}
                  targetOrigin={targetOrigin}
                  initialUrl={initialPreviewUrl.current}
                  onPathChange={handlePreviewPath}
                  params={params}
                  pointerEvents={resizing ? 'none' : undefined}
                  toggleOverlay={toggleOverlay}
                  overlayEnabled={overlayEnabled}
                  perspective={perspective}
                  setPerspective={setPerspective}
                />
              </Flex>
              <Resizable
                minWidth={minWidth}
                maxWidth={maxWidth}
                onResizeStart={handleResizeStart}
                onResizeEnd={handleResizeEnd}
              >
                <ContentEditor
                  refs={overlayDocuments}
                  deskParams={deskParams}
                  documentId={params.id}
                  documentType={params.type}
                  onDeskParams={handleDeskParams}
                  onFocusPath={handleFocusPath}
                  previewUrl={params.preview}
                />
              </Resizable>
            </Container>
          </ComposerParamsProvider>
        </ComposerNavigateProvider>
      </ComposerProvider>
      {channel && (
        <LoaderQueries
          channel={channel}
          liveQueries={liveQueries}
          perspective={perspective}
        />
      )}
    </>
  )
}

function useChannelConnectionsStatus() {
  const [connected, setConnectionStatus] = useState({
    loaders: false,
    overlays: false,
  } satisfies Partial<Record<VisualEditingConnectionIds, boolean>>)
  const [lastPong, setLastPong] = useState(
    () =>
      ({
        loaders: 0,
        overlays: 0,
      }) satisfies Partial<Record<VisualEditingConnectionIds, number>>,
  )
  const onConnect = useCallback(
    (connection: Connection) =>
      setConnectionStatus((prev) => ({ ...prev, [connection.id]: true })),
    [],
  )
  const onDisconnect = useCallback(
    (connection: Connection) =>
      setConnectionStatus((prev) => ({ ...prev, [connection.id]: false })),
    [],
  )

  const handlePongEvent = useCallback((event: VisualEditingMsg['type']) => {
    let id: VisualEditingConnectionIds | undefined = undefined
    if (event === 'overlay/pong') {
      id = 'overlays'
    }
    if (event === 'loader/pong') {
      id = 'loaders'
    }
    if (id) {
      setLastPong((prev) => ({ ...prev, [id as string]: Date.now() }))
      return true
    }

    return false
  }, [])

  return { onConnect, onDisconnect, connected, lastPong, handlePongEvent }
}

function useChannelsHeartbeat(props: {
  channel?: ChannelReturns<VisualEditingMsg>
  connected: ReturnType<typeof useChannelConnectionsStatus>['connected']
  lastPong: ReturnType<typeof useChannelConnectionsStatus>['lastPong']
}) {
  const { channel, connected, lastPong } = props

  const loaders = useChannelHeartbeat({
    channel,
    pingType: 'loader/ping',
    lastPong: lastPong.loaders,
    connected: connected.loaders,
  })
  const overlays = useChannelHeartbeat({
    channel,
    pingType: 'overlay/ping',
    lastPong: lastPong.overlays,
    connected: connected.overlays,
  })

  return useMemo(
    () =>
      ({
        loaders,
        overlays,
      }) satisfies Partial<Record<VisualEditingConnectionIds, boolean>>,
    [loaders, overlays],
  )
}

function useChannelHeartbeat(props: {
  channel?: ChannelReturns<VisualEditingMsg>
  pingType: 'overlay/ping' | 'loader/ping'
  connected: boolean
  lastPong: number
}) {
  const { channel, pingType, lastPong } = props

  const [healthy, setHealthy] = useState(true)

  useEffect(() => {
    if (healthy && lastPong) {
      const timeout = setTimeout(
        () => setHealthy(false),
        Math.max(0, lastPong + HEARTBEAT_TIMEOUT - Date.now()),
      )
      return () => clearTimeout(timeout)
    }
    if (!healthy && lastPong + HEARTBEAT_INTERVAL > Date.now()) {
      setHealthy(true)
      const timeout = setTimeout(() => setHealthy(false), HEARTBEAT_INTERVAL)
      return () => clearTimeout(timeout)
    }
  }, [healthy, lastPong])
  useEffect(() => {
    if (!channel) return
    // We are connected, but haven't received the first pong yet
    if (!lastPong) {
      channel.send(pingType, undefined)
    } else if (lastPong + HEARTBEAT_INTERVAL < Date.now()) {
      channel.send(pingType, undefined)
    } else {
      const deadline = Math.max(0, lastPong + HEARTBEAT_INTERVAL - Date.now())
      const timeout = setTimeout(
        () => channel.send(pingType, undefined),
        deadline,
      )
      return () => clearTimeout(timeout)
    }
    return
  }, [channel, lastPong, pingType])

  return healthy
}
