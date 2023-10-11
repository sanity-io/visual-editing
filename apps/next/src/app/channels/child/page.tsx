'use client'

import Link from 'next/link'
import {
  studioTheme,
  ThemeProvider,
  Box,
  Button,
  Card,
  Code,
  Flex,
  Heading,
  Text,
} from '@sanity/ui'
import { type ChannelReturns, type Connection, createChannel } from 'channels'
import { useEffect, useState } from 'react'

function ChannelDisplay({ clientId }: { clientId: string }) {
  const [log, setLog] = useState<any[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [channel, setChannel] = useState<ChannelReturns>()

  useEffect(() => {
    const channel = createChannel({
      id: clientId,
      connections: [
        {
          target: parent,
          id: 'parent',
        },
      ],
      handler(type, data) {
        setLog((l) => [{ ...data, type }, ...l])
      },
      onConnect: (added) => setConnections((cs) => [...cs, added]),
      onDisconnect: (removed) =>
        setConnections((cs) =>
          cs.filter((c) => c.id === removed.id && c.target === removed.target),
        ),
    })

    setChannel(channel)
    return () => {
      setConnections([])
      setLog([])
      channel.disconnect()
    }
  }, [clientId])

  const sendMessage = () => {
    channel?.send('child/event', { from: clientId })
  }

  return !channel ? (
    <Card flex={1} padding={4}>
      <Text>Loading...</Text>
    </Card>
  ) : (
    <Card flex={1} overflow={'auto'}>
      <Card borderBottom>
        <Flex justify={'space-between'} align={'center'} padding={3}>
          <Heading as="h1" size={1}>
            Channel ({channel?.inFrame ? 'in iFrame' : 'outside iFrame'})
          </Heading>

          {channel.inFrame ? (
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
                tone="positive"
                onClick={sendMessage}
              />
            </Flex>
          ) : (
            <Link href="/channels/">
              <Button
                fontSize={1}
                mode="ghost"
                padding={3}
                text="Go to Parent"
              />
            </Link>
          )}
        </Flex>
      </Card>
      <Box padding={3}>
        <Card padding={4} tone="primary" radius={3} overflow={'hidden'}>
          <Code language="json" size={1}>
            {JSON.stringify(log, null, 2)}
          </Code>
        </Card>
      </Box>
    </Card>
  )
}

export default function ChildPage() {
  return (
    <ThemeProvider theme={studioTheme} tone="transparent">
      <Flex direction={'column'} className="h-screen">
        <ChannelDisplay clientId={'overlays'} />
        <Card flex={1} borderTop>
          <ChannelDisplay clientId={'store'} />
        </Card>
      </Flex>
    </ThemeProvider>
  )
}
