import {createNode, type Node, type ProtocolMessage, type WithoutResponse} from '@sanity/comlink'
import {useCallback, useEffect, useState} from 'react'
import {Button} from '../components/Button'
import {Card} from '../components/Card'
import {MessageControls} from '../components/MessageControls'
import {MessageStack} from '../components/MessageStack'
import {type ControllerMessage, type NodeMessage} from '../types'

export default function Frame() {
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
