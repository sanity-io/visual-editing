import {createNode, type Node, type ProtocolMessage, type WithoutResponse} from '@sanity/comlink'
import {useCallback, useEffect, useState} from 'react'
import {v4 as uuid} from 'uuid'
import {Button} from '../components/Button'
import {Card} from '../components/Card'
import {MessageControls} from '../components/MessageControls'
import {MessageStack} from '../components/MessageStack'
import {type ControllerMessage, type NodeMessage} from '../types'

function Frame() {
  const [status, setStatus] = useState('idle')
  const [received, setReceived] = useState<
    Array<ProtocolMessage<WithoutResponse<ControllerMessage>>>
  >([])
  const [buffered, setBuffered] = useState<Array<WithoutResponse<NodeMessage>>>([])

  const [node, setNode] = useState<Node<NodeMessage, ControllerMessage> | null>(null)

  const [started, setStarted] = useState(true)

  useEffect(() => {
    if (!started) return

    const node = createNode<NodeMessage, ControllerMessage>({
      name: 'iframe',
      connectTo: 'window',
    })

    setNode(node)

    node.actor.on('message', (event) => {
      setReceived((prev) => [event.message, ...prev])
    })

    node.actor.on('buffer.added', (event) => {
      setBuffered((prev) => [event.message, ...prev])
    })

    node.actor.on('buffer.flushed', () => {
      setBuffered([])
    })

    node.onStatus(setStatus)

    return node.start()
  }, [started])

  const toggleActor = useCallback(() => {
    setStarted((started) => !started)
  }, [])

  const onSend = useCallback(
    async (message: string) => {
      if (!node) return
      const response = await node.fetch('node', {message})
      console.log('response!', response)
    },
    [node],
  )

  return (
    <div className="h-screen">
      <Card title="iFrame" status={started ? status : 'stopped'}>
        <MessageStack messages={received.length ? received : buffered} />
        <MessageControls onSend={onSend}>
          <Button onClick={toggleActor}>{started ? 'Force Stop' : 'Restart'} </Button>
        </MessageControls>
      </Card>
    </div>
  )
}

function SecondFrame() {
  const [status, setStatus] = useState('idle')
  const [received, setReceived] = useState<
    Array<ProtocolMessage<WithoutResponse<ControllerMessage>>>
  >([])
  const [buffered, setBuffered] = useState<Array<WithoutResponse<NodeMessage>>>([])

  const [node, setNode] = useState<Node<NodeMessage, ControllerMessage> | null>(null)

  const [started, setStarted] = useState(true)

  useEffect(() => {
    if (!started) return

    const node = createNode<NodeMessage, ControllerMessage>({
      name: 'iframe',
      connectTo: 'window',
    })
    const {channelId, domain, connectTo, name} = node.actor.getSnapshot().context
    // Initiate handshake as if it's coming from the parent window
    window.postMessage(
      {
        channelId,
        domain,
        from: connectTo,
        to: name,
        id: `msg-${uuid()}`,
        type: 'comlink/handshake/syn',
      },
      location.origin,
    )
    /**
     * This will make the node send a postMessage to the parent window, that comlink will ignore since it currently doesn't support more than one node connection per target/iframe/popup
     * The message looks like:
     * ```
     {
        "channelId": channelId,
        "domain": domain,
        "from": name,
        "id": `msg-${uuid()}`,
        "to": connectTo,
        "type": "comlink/handshake/syn-ack"
      }
     * ```
      We wait a bit and send the message that the parent should've sent
     */
    setTimeout(() => {
      window.postMessage(
        {
          channelId,
          domain,
          from: connectTo,
          to: name,
          id: `msg-${uuid()}`,
          type: 'comlink/handshake/ack',
        },
        location.origin,
      )
    }, 1_000)

    setNode(node)

    node.actor.on('message', (event) => {
      setReceived((prev) => [event.message, ...prev])
    })

    node.actor.on('buffer.added', (event) => {
      setBuffered((prev) => [event.message, ...prev])
    })

    node.actor.on('buffer.flushed', () => {
      setBuffered([])
    })

    node.onStatus(setStatus)

    return node.start()
  }, [started])

  const toggleActor = useCallback(() => {
    setStarted((started) => !started)
  }, [])

  const onSend = useCallback(
    async (message: string) => {
      if (!node) return
      const response = await node.fetch('node', {message})
      console.log('response!', response)
    },
    [node],
  )

  return (
    <div className="h-screen">
      <Card title="iFrame" status={started ? status : 'stopped'}>
        <MessageStack messages={received.length ? received : buffered} />
        <MessageControls onSend={onSend}>
          <Button onClick={toggleActor}>{started ? 'Force Stop' : 'Restart'} </Button>
        </MessageControls>
      </Card>
    </div>
  )
}

export default function Route() {
  // const [mounted, setMounted] = useState(false)
  // useEffect(() => {
  //   const timeout = setTimeout(() => setMounted(true), 3_000)
  //   return () => clearTimeout(timeout)
  // }, [])
  return (
    <>
      <Frame />
      {/* {mounted && <SecondFrame />} */}
    </>
  )
}
