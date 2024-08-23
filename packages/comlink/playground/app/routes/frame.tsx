import {useCallback, useEffect, useState} from 'react'
import {createNode, type Node, type ProtocolMessage, type WithoutResponse} from '@sanity/comlink'
import {Card} from '../components/Card'
import {MessageStack} from '../components/MessageStack'
import {MessageControls} from '../components/MessageControls'
import {type ControllerMessage, type NodeMessage} from '../types'

export default function Frame() {
  const [status, setStatus] = useState('idle')
  const [received, setReceived] = useState<
    Array<ProtocolMessage<WithoutResponse<ControllerMessage>>>
  >([])
  const [buffered, setBuffered] = useState<Array<WithoutResponse<NodeMessage>>>([])

  const [node, setNode] = useState<Node<ControllerMessage, NodeMessage> | null>(null)

  useEffect(() => {
    const node = createNode<ControllerMessage, NodeMessage>({
      id: 'iframe',
      connectTo: 'window',
    })

    setNode(node)

    node.actor.on('_message', (event) => {
      setReceived((prev) => [event.message, ...prev])
    })

    node.actor.on('_buffer.added', (event) => {
      setBuffered((prev) => [event.message, ...prev])
    })

    node.actor.on('_buffer.flushed', () => {
      setBuffered([])
    })

    node.onStatus(setStatus)

    node.on('controller', (event) => {
      console.log('controller', event)
    })

    return node.start()
  }, [])

  const onSend = useCallback(
    async (message: string) => {
      if (!node) return
      const response = await node.fetch({
        type: 'node',
        data: {message},
      })
      console.log('response!', response)
    },
    [node],
  )

  return (
    <div className="h-screen">
      <Card title="iFrame" status={status}>
        <MessageStack messages={received.length ? received : buffered} />
        <MessageControls prefix="iframe" status={status} onSend={onSend} />
      </Card>
    </div>
  )
}
