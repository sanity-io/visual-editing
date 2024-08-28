import {v4 as uuid} from 'uuid'
import type {MetaFunction} from '@remix-run/node'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {
  createController,
  type Controller,
  type ConnectionInstance,
  type ProtocolMessage,
  type WithoutResponse,
} from '@sanity/comlink'
import {Card} from '../components/Card'
import {Button} from '../components/Button'
import {MessageStack} from '../components/MessageStack'
import {MessageControls} from '../components/MessageControls'
import {Frame} from '../components/Frame'
import {type ControllerMessage, type NodeMessage} from '../types'

export const meta: MetaFunction = () => {
  return [{title: 'Comlink Playground'}, {name: 'description', content: ''}]
}

export default function Index() {
  const [statusMap, setStatusMap] = useState(new Map<string, string>())
  const [received, setReceived] = useState<Array<ProtocolMessage<WithoutResponse<NodeMessage>>>>([])
  const [buffer, setBuffer] = useState<Array<WithoutResponse<ControllerMessage>>>([])

  const [frames, setFrames] = useState<string[]>([])

  const [controller, setController] = useState<Controller | null>(null)
  const [connection, setConnection] = useState<ConnectionInstance<
    NodeMessage,
    ControllerMessage
  > | null>(null)

  useEffect(() => {
    const controller = createController()
    setController(controller)

    const connection = controller.createConnection<NodeMessage, ControllerMessage>({
      connectTo: 'iframe',
      heartbeat: true,
      name: 'window',
      origin: '*',
    })

    setConnection(connection)

    connection.onInternalEvent('_message', (event) => {
      console.log('_message', event)
      setReceived((prev) => [event.message, ...prev])
    })

    connection.onInternalEvent('_buffer.added', (event) => {
      console.log('_buffer.added', event)
      setBuffer((prev) => [event.message, ...prev])
    })

    connection.onInternalEvent('_buffer.flushed', () => {
      setBuffer([])
    })

    connection.onStatus((event) => {
      setStatusMap((prev) => {
        const next = new Map(prev)
        if (event.status === 'disconnected') {
          next.delete(event.channel)
        } else {
          next.set(event.channel, event.status)
        }
        return next
      })
    })

    connection.on('node', () => {
      return {message: 'world'}
    })

    connection.start()

    return () => {
      controller.destroy()
    }
  }, [])

  const onSend = useCallback(
    (message: string) => {
      connection?.post({type: 'controller', data: {message}})
    },
    [connection],
  )

  const [tab, setTab] = useState<'buffer' | 'received'>('received')

  const status = useMemo(() => {
    const connected = Array.from(statusMap.values()).filter((status) => status === 'connected')
    return connected.length ? `${connected.length} connected` : 'idle'
  }, [statusMap])

  return (
    <div className="flex h-screen justify-evenly gap-8 bg-gradient-to-bl from-indigo-800 via-green-100 to-orange-800 font-sans">
      <div className={`p-8 pr-0 transition-all ${frames.length > 1 ? 'w-1/3' : 'w-1/2'}`}>
        <Card title="Window" status={status}>
          <div className="flex justify-evenly border-y border-gray-300 bg-gray-200 p-1 text-xs">
            <button
              className={`w-full rounded p-1 leading-tight ${tab === 'buffer' && 'bg-gray-300'}`}
              onClick={() => setTab('buffer')}
            >
              Buffer ({buffer.length})
            </button>
            <button
              className={`w-full rounded p-1 leading-tight ${tab === 'received' && 'bg-gray-300'}`}
              onClick={() => setTab('received')}
            >
              Received ({received.length})
            </button>
          </div>
          {tab === 'buffer' && <MessageStack messages={buffer} />}
          {tab === 'received' && <MessageStack messages={received} />}
          <MessageControls onSend={onSend}>
            <Button onClick={() => setFrames((curr) => [...curr, uuid()])}>Add Frame</Button>
            <Button onClick={() => setFrames((curr) => curr.toSpliced(-1))}>Remove Frame</Button>
          </MessageControls>
        </Card>
      </div>

      <div className={`flex flex-col px-8 pl-0 ${frames.length > 1 ? 'w-2/3' : 'w-1/2'}`}>
        <div className="-m-2 flex flex-grow flex-wrap overflow-y-scroll py-8">
          {controller && frames.map((id) => <Frame key={id} controller={controller} />)}
        </div>
      </div>
    </div>
  )
}
