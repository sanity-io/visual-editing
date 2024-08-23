import type {MetaFunction} from '@remix-run/node'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {
  createController,
  type Controller,
  type Connection,
  type ProtocolMessage,
  type WithoutResponse,
} from '@sanity/comlink'
import {Card} from '../components/Card'
import {Button} from '../components/Button'
import {MessageStack} from '../components/MessageStack'
import {MessageControls} from '../components/MessageControls'
import {type ControllerMessage, type NodeMessage} from '../types'

export const meta: MetaFunction = () => {
  return [{title: 'Comlink Playground'}, {name: 'description', content: ''}]
}

export default function Index() {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [status, setStatus] = useState('idle')
  const [received, setReceived] = useState<Array<ProtocolMessage<WithoutResponse<NodeMessage>>>>([])
  const [buffered, setBuffered] = useState<Array<WithoutResponse<ControllerMessage>>>([])

  // const [controller, setController] = useState<Channel<NodeMessage, ControllerMessage> | null>(null)

  // const sources = useRef(new Set<MessageEventSource>())
  const [frames, setFrames] = useState(0)
  const frameRefs = useRef<Set<HTMLIFrameElement>>(new Set())
  // const [frameState, setFrameState] = useState<Set<HTMLIFrameElement>>()

  const [controller, setController] = useState<Controller | null>(null)
  const [connection, setConnection] = useState<Connection<NodeMessage, ControllerMessage> | null>(
    null,
  )

  useEffect(() => {
    frameRefs.current.forEach((el) => {
      controller?.addSource(el.contentWindow!)
    })
  }, [controller, frames])

  useEffect(() => {
    const controller = createController()
    setController(controller)

    const connection = controller.createConnection<NodeMessage, ControllerMessage>({
      connectTo: 'iframe',
      heartbeat: false,
      id: 'window',
      origin: '*',
      // sources: sources.current,
    })

    setConnection(connection)

    connection.onInternal('_message', (event) => {
      console.log('_message', event)
      setReceived((prev) => [event.message, ...prev])
    })

    connection.onInternal('_buffer.added', (event) => {
      console.log('_buffer.added', event)
      setBuffered((prev) => [event.message, ...prev])
    })

    connection.onInternal('_buffer.flushed', () => {
      setBuffered([])
    })

    connection.onStatus(setStatus)

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

  // const onConnection = useCallback(() => {
  //   if (status === 'connected') {
  //     connection?.disconnect()
  //   } else if (status === 'idle') {
  //     connection?.connect()
  //   }
  // }, [connection, status])

  // const connectionText = useMemo(() => {
  //   if (status === 'idle') return 'Connect'
  //   if (status === 'disconnected') return 'Reconnect'
  //   if (status === 'connected') return 'Disconnect'
  //   return 'Connecting...'
  // }, [status])

  // const connectionDisabled = useMemo(
  //   () => !['idle', 'connected', 'disconnected'].includes(status),
  //   [status],
  // )

  return (
    <div className="flex h-screen justify-evenly gap-8 bg-gradient-to-bl from-indigo-800 via-green-100 to-orange-800 font-sans">
      <div className={`p-8 pr-0 transition-all ${frames > 1 ? 'w-1/3' : 'w-1/2'}`}>
        <Card title="Window" status={status}>
          <MessageStack messages={received.length ? received : buffered} />
          <MessageControls prefix="window" status={status} onSend={onSend}>
            <Button onClick={() => setFrames((curr) => curr + 1)}>Add Frame</Button>
            {/* <Button onClick={onConnection} disabled={connectionDisabled}>
              {connectionText}
            </Button> */}
          </MessageControls>
        </Card>
      </div>

      <div className={`flex flex-col px-8 pl-0 ${frames > 1 ? 'w-2/3' : 'w-1/2'}`}>
        <div className="-m-2 flex flex-grow flex-wrap overflow-y-scroll py-8">
          {Array.from({length: frames}).map((_, i) => (
            <div key={i} className="min-h-[20rem] w-1/2 flex-shrink-0 flex-grow p-2">
              <iframe
                src="/frame"
                className="m-0 h-full w-full rounded-lg p-0"
                ref={(el) => {
                  if (el) {
                    frameRefs.current.add(el)
                  }
                }}
                title={i.toString()}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
