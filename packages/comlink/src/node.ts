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
  StatusEmitEvent,
  WithoutResponse,
} from './types'
import {createPromiseWithResolvers} from './util'

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
export type NodeActorLogic<TSends extends Message, TReceives extends Message> = ReturnType<
  typeof createNodeMachine<TSends, TReceives>
>

/**
 * @public
 */
export type NodeActor<TSends extends Message, TReceives extends Message> = ActorRefFrom<
  NodeActorLogic<TSends, TReceives>
>

/**
 * @public
 */
export type Node<TSends extends Message, TReceives extends Message> = {
  actor: NodeActor<TSends, TReceives>
  fetch: <TType extends TSends['type'], TMessage extends Extract<TSends, {type: TType}>>(
    ...params:
      | (TMessage['data'] extends undefined ? [TType] : never)
      | [TType, TMessage['data']]
      | [TType, TMessage['data'], {signal?: AbortSignal; suppressWarnings?: boolean}]
  ) => TSends extends TMessage
    ? TSends['type'] extends TType
      ? Promise<TSends['response']>
      : never
    : never
  machine: NodeActorLogic<TSends, TReceives>
  on: <TType extends TReceives['type'], TMessage extends Extract<TReceives, {type: TType}>>(
    type: TType,
    handler: (event: TMessage['data']) => TMessage['response'],
  ) => () => void
  onStatus: (
    handler: (status: Exclude<Status, 'disconnected'>) => void,
    filter?: Exclude<Status, 'disconnected'>,
  ) => () => void
  post: <TType extends TSends['type'], TMessage extends Extract<TSends, {type: TType}>>(
    ...params: (TMessage['data'] extends undefined ? [TType] : never) | [TType, TMessage['data']]
  ) => void
  start: () => () => void
  stop: () => void
}

/**
 * @public
 */
export const createNodeMachine = <
  TSends extends Message, // Sends
  TReceives extends Message, // Receives
  TSendsWithoutResponse extends WithoutResponse<TSends> = WithoutResponse<TSends>,
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
          data: TSendsWithoutResponse
          resolvable?: PromiseWithResolvers<TSends['response']>
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
          message: MessageEvent<ProtocolMessage<TReceives>>
        }>
        name: string
        requests: Array<RequestActorRef<TSends>>
        target: MessageEventSource | undefined
        targetOrigin: string | null
      }
      emitted:
        | BufferAddedEmitEvent<TSendsWithoutResponse>
        | BufferFlushedEmitEvent<TSendsWithoutResponse>
        | HeartbeatEmitEvent
        | MessageEmitEvent<TReceives>
        | (StatusEmitEvent & {status: Exclude<Status, 'disconnected'>})
      events:
        | {type: 'heartbeat.received'; message: MessageEvent<ProtocolMessage<HeartbeatMessage>>}
        | {type: 'message.received'; message: MessageEvent<ProtocolMessage<TReceives>>}
        | {type: 'handshake.syn'; message: MessageEvent<ProtocolMessage<TReceives>>}
        | {
            type: 'post'
            data: TSendsWithoutResponse
            resolvable?: PromiseWithResolvers<TSends['response']>
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
            response: TSends['response'] | null
            responseTo: string | undefined
          }
        | {type: 'request'; data: RequestData<TSends> | RequestData<TSends>[]} // @todo align with 'post' type
      input: NodeInput
    },
    actors: {
      requestMachine: createRequestMachine<TSends>(),
      listen: createListenLogic(),
    },
    actions: {
      'buffer handshake': assign({
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
            type: 'buffer.added',
            message: event.data,
          } satisfies BufferAddedEmitEvent<TSendsWithoutResponse>
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
          type: 'heartbeat',
        } satisfies HeartbeatEmitEvent
      }),
      'emit received message': enqueueActions(({enqueue}) => {
        enqueue.emit(({event}) => {
          assertEvent(event, 'message.received')
          return {
            type: 'message',
            message: event.message.data,
          }
        })
      }),
      'emit status': emit((_, params: {status: Exclude<Status, 'disconnected'>}) => {
        return {
          type: 'status',
          status: params.status,
        } satisfies StatusEmitEvent & {status: Exclude<Status, 'disconnected'>}
      }),
      'post message': raise(({event}) => {
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
      'process pending handshakes': enqueueActions(({context, enqueue}) => {
        context.handshakeBuffer.forEach((event) => enqueue.raise(event))
        enqueue.assign({
          handshakeBuffer: [],
        })
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
      'send pending messages': enqueueActions(({enqueue}) => {
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
            type: 'buffer.flushed',
            messages: context.buffer.map(({data}) => data),
          } satisfies BufferFlushedEmitEvent<TSendsWithoutResponse>
        })
        enqueue.assign({
          buffer: [],
        })
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
        entry: [{type: 'emit status', params: {status: 'idle'}}],
        on: {
          post: {
            actions: 'buffer message',
          },
        },
      },
      handshaking: {
        guard: 'hasSource',
        entry: ['send handshake syn ack', {type: 'emit status', params: {status: 'handshaking'}}],
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
            actions: 'buffer handshake',
          },
          'disconnect': {
            target: 'idle',
          },
        },
      },
      connected: {
        entry: [
          'process pending handshakes',
          'send pending messages',
          {type: 'emit status', params: {status: 'connected'}},
        ],
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
            actions: 'post message',
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
export const createNode = <TSends extends Message, TReceives extends Message>(
  input: NodeInput,
  machine: NodeActorLogic<TSends, TReceives> = createNodeMachine<TSends, TReceives>(),
): Node<TSends, TReceives> => {
  const actor = createActor(machine, {
    input,
  })

  const eventHandlers: Map<
    string,
    Set<(event: TReceives['data']) => TReceives['response']>
  > = new Map()

  const unhandledMessages: Map<string, Set<ProtocolMessage<Message>>> = new Map()

  const on = <TType extends TReceives['type'], TMessage extends Extract<TReceives, {type: TType}>>(
    type: TType,
    handler: (event: TMessage['data']) => TMessage['response'],
    options?: {replay?: number},
  ) => {
    const handlers = eventHandlers.get(type) || new Set()

    if (!eventHandlers.has(type)) {
      eventHandlers.set(type, handlers)
    }

    // Register the new handler
    handlers.add(handler)

    // Process any unhandled messages for this type
    const unhandledMessagesForType = unhandledMessages.get(type)
    if (unhandledMessagesForType) {
      const replayCount = options?.replay ?? 1
      const messagesToReplay = Array.from(unhandledMessagesForType).slice(-replayCount)

      // Replay messages to the new handler
      messagesToReplay.forEach(({data}) => handler(data))

      // Clear the unhandled messages for this type
      unhandledMessages.delete(type)
    }

    return () => {
      handlers.delete(handler)
    }
  }

  let cachedStatus: Exclude<Status, 'disconnected'>
  const onStatus = (
    handler: (status: Exclude<Status, 'disconnected'>) => void,
    filter?: Exclude<Status, 'disconnected'>,
  ) => {
    const {unsubscribe} = actor.on(
      'status',
      (event: StatusEmitEvent & {status: Exclude<Status, 'disconnected'>}) => {
        cachedStatus = event.status
        if (filter && event.status !== filter) {
          return
        }

        handler(event.status)
      },
    )

    // Call the handler immediately with the current status, if we have one
    if (cachedStatus) {
      handler(cachedStatus)
    }

    return unsubscribe
  }

  const post = <TType extends TSends['type'], TMessage extends Extract<TSends, {type: TType}>>(
    type: TType,
    data?: TMessage['data'],
  ) => {
    const _data = {type, data} as WithoutResponse<TMessage>
    actor.send({type: 'post', data: _data})
  }

  const fetch = <TType extends TSends['type'], TMessage extends Extract<TSends, {type: TType}>>(
    type: TType,
    data?: TMessage['data'],
    options?: {
      responseTimeout?: number
      signal?: AbortSignal
      suppressWarnings?: boolean
    },
  ) => {
    const {responseTimeout = FETCH_TIMEOUT_DEFAULT, signal, suppressWarnings} = options || {}

    const resolvable = createPromiseWithResolvers<TSends['response']>()
    const _data = {type, data} as WithoutResponse<TMessage>

    actor.send({
      type: 'post',
      data: _data,
      resolvable,
      options: {responseTimeout, signal, suppressWarnings},
    })
    return resolvable.promise as never
  }

  actor.on('message', ({message}) => {
    const handlers = eventHandlers.get(message.type)

    if (handlers) {
      // Execute all registered handlers for this message type
      handlers.forEach((handler) => handler(message.data))
      return
    }

    // Store unhandled messages for potential replay
    const unhandledMessagesForType = unhandledMessages.get(message.type)
    if (unhandledMessagesForType) {
      unhandledMessagesForType.add(message)
    } else {
      unhandledMessages.set(message.type, new Set([message]))
    }
  })

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
