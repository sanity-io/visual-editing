'use client'

import { studioTheme, ThemeProvider } from '@sanity/ui'
import { Button, Box, Card, Code, Flex, Heading, Text } from '@sanity/ui'
import { type Connection, type ChannelReturns, createChannel } from 'channels'
import { forwardRef, useEffect, useRef, useState } from 'react'

const IFrame = forwardRef<HTMLIFrameElement, { src: string }>(function IFrame(
  { src },
  ref,
) {
  return (
    <Card flex={1} borderRight>
      <iframe className="h-full w-full bg-white" src={src} ref={ref} />
    </Card>
  )
})

export default function ParentPage() {
  const [log, setLog] = useState<any[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const frameOne = useRef<HTMLIFrameElement>(null)
  const frameTwo = useRef<HTMLIFrameElement>(null)
  const [channel, setChannel] = useState<ChannelReturns>()

  useEffect(() => {
    const targetOne = frameOne.current?.contentWindow
    const targetTwo = frameTwo.current?.contentWindow
    if (!targetOne || !targetTwo) return
    const channel = createChannel({
      connections: [
        {
          target: targetOne,
          id: 'overlays',
        },
        {
          target: targetOne,
          id: 'store',
        },
        {
          target: targetTwo,
          id: 'overlays',
        },
        {
          target: targetTwo,
          id: 'store',
        },
      ],
      id: 'parent',
      handle(type, data) {
        setLog((l) => [{ ...data, type }, ...l])
      },
      onConnect: (added) => {
        setConnections((cs) => [...cs, added])
      },
      onDisconnect: (removed) => {
        setConnections((cs) =>
          cs.filter((c) => c.id === removed.id && c.target === removed.target),
        )
      },
    })
    setChannel(channel)

    return () => {
      channel.disconnect()
      setLog([])
    }
  }, [])

  const sendMessage = async () => {
    console.log('Send!')
    const value = await channel?.send('parent/event', {
      foo: 'bar',
    })
    console.log('Done!', value)
  }

  return (
    <ThemeProvider theme={studioTheme} tone="transparent">
      <Flex justify={'space-evenly'} className={'h-screen'}>
        <Flex flex={1} justify={'space-evenly'} direction={'column'}>
          <IFrame ref={frameOne} src="/channels/child" />
          <IFrame ref={frameTwo} src="/channels/child" />
        </Flex>
        <Card flex={1} overflow="auto">
          <Card borderBottom>
            <Flex justify={'space-between'} align={'center'} padding={3}>
              <Heading as="h1" size={1}>
                Composer
              </Heading>
              <Flex gap={2} align={'center'}>
                <Text size={0}>{connections.length} Connections</Text>
                <Button
                  fontSize={1}
                  mode="ghost"
                  padding={3}
                  text="Clear"
                  onClick={() => setLog([])}
                  disabled={!log.length}
                />
                <Button
                  fontSize={1}
                  mode="default"
                  padding={3}
                  text="Send"
                  tone="primary"
                  onClick={sendMessage}
                />
              </Flex>
            </Flex>
          </Card>
          <Box padding={3}>
            <Card padding={4} tone="positive" radius={3} overflow={'hidden'}>
              <Code language="json" size={1}>
                {JSON.stringify(log, null, 2)}
              </Code>
            </Card>
          </Box>
        </Card>
      </Flex>
    </ThemeProvider>
  )
}
