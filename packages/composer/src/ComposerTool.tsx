import { ResetIcon } from '@sanity/icons'
import { Button, Card, Code, Flex, Text } from '@sanity/ui'
import { ChannelReturns, createChannel } from 'channels'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { Path, Tool } from 'sanity'
import styled from 'styled-components'

import { DocumentPane } from './editor/DocumentPane'
import { ComposerPluginOptions } from './types'

type Messages = {
  type: 'composer/focus'
  data: { path: Path }
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

  const [log, setLog] = useState<any[]>([])

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
      handle(type, data) {
        setLog((l) => [{ type, data }, ...l])
      },
    })
    setChannel(channel)

    return () => {
      channel.disconnect()
    }
  }, [])

  return (
    <Flex height="fill">
      <Card flex={1}>
        <IFrame ref={iframeRef} src={tool.options?.previewUrl || '/'} />
      </Card>
      <Card borderLeft flex={1} overflow="hidden">
        <Flex direction={'column'} height={'fill'}>
          <Card borderBottom flex={1} overflow="auto" padding={4}>
            <Code language="json" size={1}>
              {JSON.stringify(log, null, 2)}
            </Code>
          </Card>
          <Flex
            paddingX={4}
            paddingY={2}
            justify={'space-between'}
            gap={3}
            align={'center'}
          >
            <Text size={1}>
              {log.length} Item{log.length !== 1 && 's'}
            </Text>
            <Button
              icon={ResetIcon}
              fontSize={2}
              mode="ghost"
              padding={3}
              text="Clear"
              onClick={() => setLog([])}
              disabled={!log.length}
            />
          </Flex>
        </Flex>
      </Card>
      <Card borderLeft flex={1} overflow="auto">
        <DocumentPane
          documentId="siteSettings"
          documentType="siteSettings"
          onFocusPath={(path) => {
            if (!path) return
            channel?.send('composer/focus', { path })
          }}
        />
      </Card>
    </Flex>
  )
}
