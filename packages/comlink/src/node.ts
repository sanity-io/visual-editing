import {v4 as uuid} from 'uuid'
import {
  assertEvent,
  assign,
  createActor,
  emit,
  enqueueActions,
  raise,
  setup,
  stopChild,
  type ActorRefFrom,
} from 'xstate'
import {createListenLogic, listenInputFromContext} from './common'
import {
  DOMAIN,
  FETCH_TIMEOUT_DEFAULT,
  MSG_DISCONNECT,
  MSG_HANDSHAKE_ACK,
  MSG_HANDSHAKE_SYN,
  MSG_HANDSHAKE_SYN_ACK,
  MSG_HEARTBEAT,
  MSG_RESPONSE,
} from './constants'
import {createRequestMachine, type RequestActorRef} from './request'
import type {
  BufferAddedEmitEvent,
  BufferFlushedEmitEvent,
  HeartbeatEmitEvent,
  HeartbeatMessage,
  Message,
  MessageEmitEvent,
  ProtocolMessage,
  RequestData,
  Status,
  WithoutResponse,
} from './types'

/**
 * @public
 */
export interface NodeInput {
  name: string
  connectTo: string
  domain?: string
}

/**
 * @public
 */
export type NodeActorLogic<R extends Message, S extends Message> = ReturnType<
  typeof createNodeMachine<R, S>
>

/**
 * @public
 */
export type NodeActor<R extends Message, S extends Message> = ActorRefFrom<NodeActorLogic<R, S>>

/**
 * @public
 */
export type Node<R extends Message, S extends Message> = {
  actor: NodeActor<R, S>
  fetch: <const T extends S['type'], U extends WithoutResponse<S>>(
    data: U,
    options?: {signal?: AbortSignal; suppressWarnings?: boolean},
  ) => S extends U ? (S['type'] extends T ? Promise<S['response']> : never) : never
  machine: NodeActorLogic<R, S>
  on: <T extends R['type'], U extends Extract<R, {type: T}>>(
    type: T,
    handler: (event: U['data']) => U['response'],
  ) => () => void
  onStatus: (handler: (status: Status) => void) => () => void
  post: (data: WithoutResponse<S>) => void
  start: () => () => void
  stop: () => void
}

/**
 * @public
 */
export const createNodeMachine = <
  R extends Message, // Receives
  S extends Message, // Sends
  V extends WithoutResponse<S> = WithoutResponse<S>,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
>() => {
  const nodeMachine = setup({
    types: {} as {
      children: {
        'listen for disconnect': 'listen'
        'listen for handshake ack': 'listen'
        'listen for handshake syn': 'listen'
        'listen for heartbeat': 'listen'
        'listen for messages': 'listen'
      }
      context: {
        buffer: Array<{
          data: V
          resolvable?: PromiseWithResolvers<S['response']>
          options?: {
            signal?: AbortSignal
            suppressWarnings?: boolean
          }
        }>
        channelId: string | null
        connectTo: string
        domain: string
        // The handshake buffer is a workaround to maintain backwards
        // compatibility with the Sanity channels package, which may incorrectly
        // send buffered messages _before_ it completes the handshake (i.e.
        // sends an ack message). It should be removed in the next major.
        handshakeBuffer: Array<{
          type: 'message.received'
          message: MessageEvent<ProtocolMessage<R>>
        }>
        name: string
        requests: Array<RequestActorRef<S>>
        target: MessageEventSource | undefined
        targetOrigin: string | null
      }
      emitted:
        | BufferAddedEmitEvent<V>
        | BufferFlushedEmitEvent<V>
        | HeartbeatEmitEvent
        | MessageEmitEvent<R>
        | (R extends R ? {type: R['type']; message: ProtocolMessage<R>} : never)
      events:
        | {type: 'heartbeat.received'; message: MessageEvent<ProtocolMessage<HeartbeatMessage>>}
        | {type: 'message.received'; message: MessageEvent<ProtocolMessage<R>>}
        | {type: 'handshake.syn'; message: MessageEvent<ProtocolMessage<R>>}
        | {
            type: 'post'
            data: V
            resolvable?: PromiseWithResolvers<S['response']>
            options?: {
              responseTimeout?: number
              signal?: AbortSignal
              suppressWarnings?: boolean
            }
          }
        | {type: 'request.aborted'; requestId: string}
        | {type: 'request.failed'; requestId: string}
        | {
            type: 'request.success'
            requestId: string
            response: S['response'] | null
            responseTo: string | undefined
          }
        | {type: 'request'; data: RequestData<S> | RequestData<S>[]} // @todo align with 'post' type
      input: NodeInput
    },
    actors: {
      requestMachine: createRequestMachine<S>(),
      listen: createListenLogic(),
    },
    actions: {
      'buffer incoming message': assign({
        handshakeBuffer: ({event, context}) => {
          assertEvent(event, 'message.received')
          return [...context.handshakeBuffer, event]
        },
      }),
      'buffer message': enqueueActions(({enqueue}) => {
        enqueue.assign({
          buffer: ({event, context}) => {
            assertEvent(event, 'post')
            return [
              ...context.buffer,
              {
                data: event.data,
                resolvable: event.resolvable,
                options: event.options,
              },
            ]
          },
        })
        enqueue.emit(({event}) => {
          assertEvent(event, 'post')
          return {
            type: '_buffer.added',
            message: event.data,
          } satisfies BufferAddedEmitEvent<V>
        })
      }),
      'create request': assign({
        requests: ({context, event, self, spawn}) => {
          assertEvent(event, 'request')
          const arr = Array.isArray(event.data) ? event.data : [event.data]
          const requests = arr.map((request) => {
            const id = `req-${uuid()}`
            return spawn('requestMachine', {
              id,
              input: {
                channelId: context.channelId!,
                data: request.data,
                domain: context.domain!,
                expectResponse: request.expectResponse,
                from: context.name,
                parentRef: self,
                resolvable: request.resolvable,
                responseTimeout: request.options?.responseTimeout,
                responseTo: request.responseTo,
                signal: request.options?.signal,
                sources: context.target!,
                suppressWarnings: request.options?.suppressWarnings,
                targetOrigin: context.targetOrigin!,
                to: context.connectTo,
                type: request.type,
              },
            })
          })
          return [...context.requests, ...requests]
        },
      }),
      'emit heartbeat': emit(() => {
        return {
          type: '_heartbeat',
        } satisfies HeartbeatEmitEvent
      }),
      'emit received message': enqueueActions(({enqueue}) => {
        enqueue.emit(({event}) => {
          assertEvent(event, 'message.received')
          return {
            type: '_message',
            message: event.message.data,
          } satisfies MessageEmitEvent<R>
        })
        enqueue.emit(({event}) => {
          assertEvent(event, 'message.received')
          const emit = {
            type: event.message.data.type,
            message: event.message.data,
          }
          return emit
        })
      }),
      'flush buffer': enqueueActions(({enqueue}) => {
        enqueue.raise(({context}) => ({
          type: 'request',
          data: context.buffer.map(({data, resolvable, options}) => ({
            data: data.data,
            type: data.type,
            expectResponse: resolvable ? true : false,
            resolvable,
            options,
          })),
        }))
        enqueue.emit(({context}) => {
          return {
            type: '_buffer.flushed',
            messages: context.buffer.map(({data}) => data),
          } satisfies BufferFlushedEmitEvent<V>
        })
        enqueue.assign({
          buffer: [],
        })
      }),
      'flush handshake buffer': enqueueActions(({context, enqueue}) => {
        context.handshakeBuffer.forEach((event) => enqueue.raise(event))
        enqueue.assign({
          handshakeBuffer: [],
        })
      }),
      'post': raise(({event}) => {
        assertEvent(event, 'post')
        return {
          type: 'request' as const,
          data: {
            data: event.data.data,
            expectResponse: event.resolvable ? true : false,
            type: event.data.type,
            resolvable: event.resolvable,
            options: event.options,
          },
        }
      }),
      'remove request': enqueueActions(({context, enqueue, event}) => {
        assertEvent(event, ['request.success', 'request.failed', 'request.aborted'])
        stopChild(event.requestId)
        enqueue.assign({requests: context.requests.filter(({id}) => id !== event.requestId)})
      }),
      'send response': raise(({event}) => {
        assertEvent(event, ['message.received', 'heartbeat.received'])
        return {
          type: 'request' as const,
          data: {
            type: MSG_RESPONSE,
            responseTo: event.message.data.id,
            data: undefined,
          },
        }
      }),
      'send handshake syn ack': raise({
        type: 'request',
        data: {type: MSG_HANDSHAKE_SYN_ACK},
      }),
      'set connection config': assign({
        channelId: ({event}) => {
          assertEvent(event, 'handshake.syn')
          return event.message.data.channelId
        },
        target: ({event}) => {
          assertEvent(event, 'handshake.syn')
          return event.message.source || undefined
        },
        targetOrigin: ({event}) => {
          assertEvent(event, 'handshake.syn')
          return event.message.origin
        },
      }),
    },
    guards: {
      hasSource: ({context}) => context.target !== null,
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QDsD2EwGIBOYCOArnAC4B0sBAxpXLANoAMAuoqAA6qwCWxXqyrEAA9EAVgYAWUgEYJDUQA4JAZmUSJC0coDsAGhABPRNIYLSErdOkBOAGzbx227YUBfV-rQYc+IrDIAZgCGXAA2kIwsSCAc3Lz8giIIoiakqgBMDKbp2tYS0srp+kYI0ununuhgpFwQ4ZgQ-NVcyABuqADW1V7NdWAILe2UQfHIkZGCsTx8AtFJ6aKipAzWOtrpC7Z5BUWGiNoK6aS26RLW2tLaqkqqFSA9NX2YALa0QTCkuDRcrRHMk5xpgk5ogJLZSNZIVDoVCFLZiohbIVSLkXLZRHZDgxbHcHrV6rFiBNolNRolEVJbCsdGUzsoyhiEcllOC1DowelVmVrOUPPcqqQABZBZAQWDCjotKANJo1NqdboC4Wi8VBSXIKADeXDUbjf4kwFkkEILbg8RZMHKOzWKzKJkHJa086Xa4qZS4pUisUSqU+QgkYnsQ0zcnJaRLDbpZwKNQSBYspm2MEyC5KTnaDSSd18h7K71q32EwMxYPA0BJFLKY5yZxIrKSURM0RnFHSBTrQqQ9babQejBCr2q9XSiBcWCUfjIMCUIn6oNxEPGtTWFFR0RUy7iGzt+3Ip0XURXVZKPvVCfIKczyB+vyzqLzoGzcuIG0MGTyCztjRtjaJjbHVMNAUTdu1PUhz0vYhryLOcSwXMthBfK0ZGsLQGBZekCi0Jso1IdI23WG04zOE4wIg6coIgBox3Imdi1JRdnxNOxSHNSQkWtW0mTjMxMQ7fDzgcbNKn7WjKJeN4Pi+MAfj+e84MfUMFHbZZwxOHZNDyO09gQOQjmAhZJCM9IMjIycKOvQUwCCbBiAAI2sshpNkiB6NLJ9EIQBQbWOdJlMhYCUjbJkchXGsFmsJQMVsWl3BzKp4GiHoAXgjykgAWmkZZ6xy3LZF2EobCy6xsQWJQ42kE4FjA-EwBSxTjSRUhDgqkzgO2BxdykU4AvXFQ-KjMC8yHKV6qNJi6WOdcypcZsXGxe0JG0XySKjM5lKsMyLwsiAxsYzylDfONznUEqrmi+1ThkHqXDONbULi1wgA */
    id: 'node',
    context: ({input}) => ({
      buffer: [],
      channelId: null,
      connectTo: input.connectTo,
      domain: input.domain ?? DOMAIN,
      handshakeBuffer: [],
      name: input.name,
      requests: [],
      target: undefined,
      targetOrigin: null,
    }),
    // Always listen for handshake syn messages. The channel could have
    // disconnected without being able to notify the node, and so need to
    // re-establish the connection.
    invoke: {
      id: 'listen for handshake syn',
      src: 'listen',
      input: listenInputFromContext({
        include: MSG_HANDSHAKE_SYN,
        responseType: 'handshake.syn',
      }),
    },
    on: {
      'request.success': {
        actions: 'remove request',
      },
      'request.failed': {
        actions: 'remove request',
      },
      'request.aborted': {
        actions: 'remove request',
      },
      'handshake.syn': {
        actions: 'set connection config',
        target: '.handshaking',
      },
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          post: {
            actions: 'buffer message',
          },
        },
      },
      handshaking: {
        guard: 'hasSource',
        entry: 'send handshake syn ack',
        invoke: [
          {
            id: 'listen for handshake ack',
            src: 'listen',
            input: listenInputFromContext({
              include: MSG_HANDSHAKE_ACK,
              count: 1,
              // Override the default `message.received` responseType to prevent
              // buffering the ack message. We transition to the connected state
              // using onDone instead of listening to this event using `on`
              responseType: 'handshake.complete',
            }),
            onDone: 'connected',
          },
          {
            id: 'listen for disconnect',
            src: 'listen',
            input: listenInputFromContext({
              include: MSG_DISCONNECT,
              count: 1,
              responseType: 'disconnect',
            }),
          },
          {
            id: 'listen for messages',
            src: 'listen',
            input: listenInputFromContext({
              exclude: [
                MSG_DISCONNECT,
                MSG_HANDSHAKE_SYN,
                MSG_HANDSHAKE_ACK,
                MSG_HEARTBEAT,
                MSG_RESPONSE,
              ],
            }),
          },
        ],
        on: {
          'request': {
            actions: 'create request',
          },
          'post': {
            actions: 'buffer message',
          },
          'message.received': {
            actions: 'buffer incoming message',
          },
          'disconnect': {
            target: 'idle',
          },
        },
      },
      connected: {
        entry: ['flush handshake buffer', 'flush buffer'],
        invoke: [
          {
            id: 'listen for messages',
            src: 'listen',
            input: listenInputFromContext({
              exclude: [
                MSG_DISCONNECT,
                MSG_HANDSHAKE_SYN,
                MSG_HANDSHAKE_ACK,
                MSG_HEARTBEAT,
                MSG_RESPONSE,
              ],
            }),
          },
          {
            id: 'listen for heartbeat',
            src: 'listen',
            input: listenInputFromContext({
              include: MSG_HEARTBEAT,
              responseType: 'heartbeat.received',
            }),
          },
          {
            id: 'listen for disconnect',
            src: 'listen',
            input: listenInputFromContext({
              include: MSG_DISCONNECT,
              count: 1,
              responseType: 'disconnect',
            }),
          },
        ],
        on: {
          'request': {
            actions: 'create request',
          },
          'post': {
            actions: 'post',
          },
          'disconnect': {
            target: 'idle',
          },
          'message.received': {
            actions: ['send response', 'emit received message'],
          },
          'heartbeat.received': {
            actions: ['send response', 'emit heartbeat'],
          },
        },
      },
    },
  })
  return nodeMachine
}

/**
 * @public
 */
export const createNode = <R extends Message, S extends Message>(
  input: NodeInput,
  machine: NodeActorLogic<R, S> = createNodeMachine<R, S>(),
): Node<R, S> => {
  const actor = createActor(machine, {
    input,
  })

  const on = <T extends R['type'], U extends Extract<R, {type: T}>>(
    type: T,
    handler: (event: U['data']) => U['response'],
  ) => {
    const {unsubscribe} = actor.on(
      // @ts-expect-error @todo `type` typing
      type,
      (event: {type: T; message: ProtocolMessage<U>}) => {
        handler(event.message.data)
      },
    )
    return unsubscribe
  }

  const onStatus = (handler: (status: Status) => void) => {
    const snapshot = actor.getSnapshot()
    let currentStatus: Status =
      typeof snapshot.value === 'string' ? snapshot.value : Object.keys(snapshot.value)[0]

    const {unsubscribe} = actor.subscribe((state) => {
      const status: Status =
        typeof state.value === 'string' ? state.value : Object.keys(state.value)[0]
      if (currentStatus !== status) {
        currentStatus = status
        handler(status)
      }
    })
    return unsubscribe
  }

  const post = (data: WithoutResponse<S>) => {
    actor.send({type: 'post', data})
  }

  const fetch = (
    data: WithoutResponse<S>,
    options?: {
      responseTimeout?: number
      signal?: AbortSignal
      suppressWarnings?: boolean
    },
  ) => {
    const {responseTimeout = FETCH_TIMEOUT_DEFAULT, signal, suppressWarnings} = options || {}

    const resolvable = Promise.withResolvers<S['response']>()
    actor.send({
      type: 'post',
      data,
      resolvable,
      options: {responseTimeout, signal, suppressWarnings},
    })
    return resolvable.promise as never
  }

  const stop = () => {
    actor.stop()
  }

  const start = () => {
    actor.start()
    return stop
  }

  return {
    actor,
    fetch,
    machine,
    on,
    onStatus,
    post,
    start,
    stop,
  }
}
