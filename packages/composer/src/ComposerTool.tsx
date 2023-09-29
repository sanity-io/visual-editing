import { Card, Code, Flex } from '@sanity/ui'
import { ChannelReturns, createChannel } from 'channels'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { Path, pathToString, Tool } from 'sanity'
import styled from 'styled-components'

import { ComposerProvider } from './ComposerProvider'
import { ContentEditor } from './editor/ContentEditor'
import { ComposerPluginOptions } from './types'
import { useComposerParams } from './useComposerParams'

type Messages =
  | {
      type: 'composer/focus'
      data: { id: string; path: string }
    }
  | {
      type: 'composer/blur'
      data: undefined
    }
  | {
      type: 'overlay/focus'
      data: {
        projectId: string
        dataset: string
        id: string
        path: string
        type?: string
        baseUrl: string
        tool?: string
        workspace?: string
      }
    }

const IFrame = styled.iframe`
  border: 0;
  height: 100%;
  width: 100%;
  display: block;
`

export default function ComposerTool(props: {
  tool: Tool<ComposerPluginOptions>
}): ReactElement {
  const { tool } = props

  const [channel, setChannel] = useState<ChannelReturns<Messages>>()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const { setParams, params, deskParams } = useComposerParams()

  useEffect(() => {
    const iframe = iframeRef.current?.contentWindow

    if (!iframe) return

    const channel = createChannel<Messages>({
      id: 'composer',
      connections: [
        {
          target: iframe,
          id: 'overlays',
        },
      ],
      handler(type, data) {
        if (type === 'overlay/focus') {
          setParams((p) => ({
            ...p,
            id: data.id,
            path: data.path,
            type: data.type,
          }))
        }
      },
    })
    setChannel(channel)

    return () => {
      channel.disconnect()
    }
  }, [setParams])

  const focusPathHandler = useCallback(
    // @todo nextDocumentId may not be needed with this strategy
    (nextDocumentId: string, path: Path) => {
      setParams((p) => {
        return {
          ...p,
          // Don’t need to explicitly set the id here because it was either already set via postMessage or is the same if navigating in the document pane
          path: pathToString(path),
        }
      })
    },
    [setParams],
  )

  useEffect(() => {
    if (params.id && params.path) {
      channel?.send('composer/focus', { id: params.id, path: params.path })
    } else {
      channel?.send('composer/blur', undefined)
    }
  }, [channel, params])

  return (
    <ComposerProvider deskParams={deskParams} params={params}>
      <Flex height="fill">
        <Card flex={1}>
          <IFrame ref={iframeRef} src={tool.options?.previewUrl || '/'} />
        </Card>
        <Card borderLeft flex={1} overflow="auto">
          <Card borderBottom flex={1} overflow="auto" padding={4}>
            <Code language="json" size={1}>
              {JSON.stringify(params, null, 2)}
            </Code>
          </Card>
          <ContentEditor
            deskParams={deskParams}
            documentId={params.id}
            documentType={params.type}
            onFocusPath={focusPathHandler}
          />
        </Card>
      </Flex>
    </ComposerProvider>
  )
}
