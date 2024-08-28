import {v4 as uuid} from 'uuid'
import {
  type ActorRefFrom,
  assertEvent,
  assign,
  createActor,
  enqueueActions,
  type EventObject,
  fromCallback,
  raise,
  setup,
} from 'xstate'

import {listenActor, listenInputFromContext} from './common'
import {
  DOMAIN,
  HANDSHAKE_INTERVAL,
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
  MessageEmitEvent,
  RequestData,
  WithoutResponse,
} from './types'
import type {Message, MessageData, ProtocolMessage} from './types'

/**
 * @public
 */
export type ChannelActor<R extends Message, S extends Message> = ActorRefFrom<
  ReturnType<typeof createChannelMachine<R, S>>
>

/**
 * @public
 */
export type Channel<R extends Message, S extends Message> = {
  actor: ChannelActor<R, S>
  connect: () => void
  disconnect: () => void
  id: string
  name: string
  machine: ReturnType<typeof createChannelMachine<R, S>>
  on: <T extends R['type'], U extends Extract<R, {type: T}>>(
    type: T,
    handler: (event: U['data']) => U['response'],
  ) => () => void
  onStatus: (handler: (status: string) => void) => () => void
  post: (data: WithoutResponse<S>) => void
  setTarget: (target: MessageEventSource) => void
  start: () => () => void
  stop: () => void
  target: MessageEventSource | undefined
}

/**
 * @public
 */
export interface ChannelInput {
  connectTo: string
  domain?: string
  heartbeat?: boolean
  name: string
  id?: string
  origin: string
  target?: MessageEventSource
}

const sendBackAtInterval = fromCallback<
  EventObject,
  {event: EventObject; immediate?: boolean; interval: number}
>(({sendBack, input}) => {
  const send = () => {
    sendBack(input.event)
  }

  if (input.immediate) {
    send()
  }

  const interval = setInterval(send, input.interval)

  return () => {
    clearInterval(interval)
  }
})

/**
 * @public
 */
export const createChannelMachine = <
  R extends Message, // Receives
  S extends Message, // Sends
  V extends WithoutResponse<S> = WithoutResponse<S>,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
>() => {
  const channelMachine = setup({
    types: {} as {
      context: {
        buffer: Array<V>
        connectionId: string
        connectTo: string
        domain: string
        heartbeat: boolean
        id: string
        name: string
        origin: string
        requests: Array<RequestActorRef<S>>
        target: MessageEventSource | undefined
      }
      emitted:
        | BufferAddedEmitEvent<V>
        | BufferFlushedEmitEvent<V>
        | MessageEmitEvent<R>
        | (R extends R ? {type: R['type']; message: ProtocolMessage<R>} : never)
      events:
        | {type: 'connect'}
        | {type: 'disconnect'}
        | {type: 'message.received'; message: MessageEvent<ProtocolMessage<R>>}
        | {type: 'post'; data: V}
        | {type: 'response'; respondTo: string; data: Pick<S, 'response'>}
        | {type: 'request.failed'; requestId: string}
        | {
            type: 'request.success'
            requestId: string
            response: MessageData | null
            responseTo: string | undefined
          }
        | {type: 'request'; data: RequestData<S> | RequestData<S>[]}
        | {type: 'syn'}
        | {type: 'target.set'; target: MessageEventSource}
      input: ChannelInput
    },
    actors: {
      requestMachine: createRequestMachine<S>(),
      listen: listenActor,
      sendBackAtInterval,
    },
    actions: {
      'buffer message': enqueueActions(({enqueue}) => {
        enqueue.assign({
          buffer: ({event, context}) => {
            assertEvent(event, 'post')
            return [...context.buffer, event.data]
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
        requests: ({context, event, spawn}) => {
          assertEvent(event, 'request')
          const arr = Array.isArray(event.data) ? event.data : [event.data]
          const requests = arr.map((request) => {
            const id = `req-${uuid()}`
            return spawn('requestMachine', {
              id,
              input: {
                connectionId: context.connectionId,
                data: request.data,
                domain: context.domain,
                expectResponse: request.expectResponse,
                from: context.name,
                origin: context.origin,
                responseTo: request.responseTo,
                sources: context.target!,
                to: context.connectTo,
                type: request.type,
              },
            })
          })
          return [...context.requests, ...requests]
        },
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
          data: context.buffer.map(({data, type}) => ({data, type})),
        }))
        enqueue.emit(({context}) => {
          return {
            type: '_buffer.flushed',
            messages: context.buffer,
          } satisfies BufferFlushedEmitEvent<V>
        })
        enqueue.assign({
          buffer: [],
        })
      }),
      'post': raise(({event}) => {
        assertEvent(event, 'post')
        return {
          type: 'request' as const,
          data: {
            data: event.data.data,
            expectResponse: true,
            type: event.data.type,
          },
        }
      }),
      'remove request': assign({
        requests: ({context, event}) => {
          assertEvent(event, ['request.success', 'request.failed'])
          return context.requests.filter((request) => request.id !== event.requestId)
        },
      }),
      'respond': raise(({event}) => {
        assertEvent(event, 'response')
        return {
          type: 'request' as const,
          data: {
            data: event.data,
            type: MSG_RESPONSE,
            responseTo: event.respondTo,
          },
        }
      }),
      'send handshake ack': raise({
        type: 'request',
        data: {type: MSG_HANDSHAKE_ACK},
      }),
      'send disconnect': raise(() => {
        return {
          type: 'request' as const,
          data: {type: MSG_DISCONNECT},
        }
      }),
      'send handshake syn': raise({
        type: 'request',
        data: {type: MSG_HANDSHAKE_SYN},
      }),
      'set target': assign({
        target: ({event}) => {
          assertEvent(event, 'target.set')
          return event.target
        },
      }),
    },
    guards: {
      'has target': ({context}) => !!context.target,
      'should send heartbeats': ({context}) => context.heartbeat,
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QGMAWBDAdpsAbAxLAPYCuATsmAHSxgAuA2gAwC6ioADkbAJZ09FM7EAA9EAdnFMqAJgCs4gBwA2RTMVqAzNoA0IAJ6IZTaQE4mymQBYrc7TYCM4qwF8XetFhwEyYAI4kcHQ0JMiUsLDMbEggXLz8gsJiCM6msppMVuYyznKKTnqGCA4WVLaaDhmmTpma+W4eGNh4+L4BQVQAZug8uJBRwnF8AkIxyeJycmXiOUxODlbKGVaFiA4yDSCezbhUPBB9+MiCOMiMrIPcw4lja3MyVMpWFnLWS6Z1DqspJVTiDio6qZ5DIKqZNttvHsDmB8HFztFOFcEqNQMlFBU-gpFCYZDJTFZFM5vsomGlxMpJnMbMZ6u4tk0oU0ILAMABrHiYKCEfSYAYxIYopJrDLiKiaOQOZTSuTS0lPb6yh4UyaKOSLSUS1z0yF4KjM1noDlc1r+QKwBGXeIjYXFTTWcVWOpWBwfJ1S76LZTi9Yu7Q45TAykQxl6g3sznc+H8pHWm5okUyByyJgVFSEmxO76aQNUNUfcSmKQLJwbHWh3bho2R-AAWzgsHQMCovkoPAAbv0LgLkTbbsVMmkNOo7HjM4pPeYqHN1UTTGpKSqQ14w1gWRGTRAeLBjs0zjHYr346I1oSqK6S9VTE8mIpr98AbLHkTCcoHA51XjweWV7td6c6EgOFuEtHs41RE8EDkJgHkmDV7UsRRbGUb5TDyR5rDVJCJjyTRlx2Kh-zAM4gLac1QNja4IOSKxxE0KhJTQ+072UYtpW+dNz3+f4YOxD4HHwqEiJIiBTVgLhMFoA9BT7BMECyaQFCsUEcnnJZJk0b4KXJAEll9HIiUEvVhMA0T6wiJtqFbMAOy7RFD3A20bEUKhTGBV1r1dRYnBQgxTzxBilA-YEpCYf5tUaX9CJOYjTPwLcdxi-du0ooV+xKdZHmeSk3k0D58gfJNvVJKUqlsPFpSMv8ktM-UwHQMg6AAI3q4I0GI41uWko9qMQe0HjqHIKTqBCYMK6pxXUEtJiLKVlCq6K91q1B6salr0GCWhMC3E0yI6bpejsq0qNtDKHhvHLFjyz5Cspc8ZyeQtaJzOQFoSkzSLNIJusc9LMm9NR8nyedvImB81SmDNlIpKQZEqn8CPemqgOjFKHJOv6nWfCY30qUkcwfCY0lTSowsJSQ3zwhGoSRpbPpMn6MbkmZirc6xnDVQsFnB0oAWcCkshmPEy3pTAiAgOBhF1XBjrSuS8m+dQBrkAt1WgwlZSpyKCP2PpZdkyCiQeAl3IJeQWJWPyfmTJMVFqUECRghaq06-Xj2SX0pjfGZXiQkw5hJJ5ZF0i9M3fBaPogN3eoHXyigysUwpxCY7zyTWI+RiA6oa5rWuj071QfJwxWxW9LGgosFAzums5WnP1ralbkFdsCmcg4wZEKjRAvyd9lMpeHtaEzPs7W1qaDAbbI3z-t1WTTQnXed8woUL4rfWO6k7JJhoNdMm3u3SOZ7ks6speXL8rX+O0O9VXaLVIbKjcNwgA */
    id: 'channel',
    context: ({input}) => ({
      id: input.id || `${input.name}-${uuid()}`,
      buffer: [],
      connectionId: `cnx-${uuid()}`,
      connectTo: input.connectTo,
      domain: input.domain ?? DOMAIN,
      heartbeat: input.heartbeat ?? false,
      name: input.name,
      origin: input.origin,
      requests: [],
      target: input.target,
    }),
    on: {
      'target.set': {
        actions: 'set target',
      },
      'request.success': {
        actions: 'remove request',
      },
      'request.failed': {
        actions: 'remove request',
      },
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          connect: {
            target: 'handshaking',
            guard: 'has target',
          },
          post: {
            actions: 'buffer message',
          },
        },
      },
      handshaking: {
        invoke: [
          {
            src: 'sendBackAtInterval',
            id: 'sendSyn',
            input: () => ({
              event: {type: 'syn'},
              interval: HANDSHAKE_INTERVAL,
              immediate: true,
            }),
          },
          {
            src: 'listen',
            input: (input) =>
              listenInputFromContext(MSG_HANDSHAKE_SYN_ACK, {
                count: 1,
              })(input),
            /* Below would maybe be more readable than transitioning to
          'connected' on 'message', and 'ack' on exit but having onDone when
          using passing invocations currently breaks XState Editor */
            // onDone: {
            //   target: 'connected',
            //   actions: 'ack',
            // },
          },
        ],
        on: {
          'syn': {
            actions: 'send handshake syn',
          },
          'request': {
            actions: 'create request',
          },
          'post': {
            actions: 'buffer message',
          },
          'message.received': {
            target: 'connected',
          },
          'disconnect': {
            target: 'disconnected',
          },
        },
        exit: 'send handshake ack',
      },
      connected: {
        entry: 'flush buffer',
        invoke: {
          src: 'listen',
          input: listenInputFromContext([MSG_RESPONSE, MSG_HEARTBEAT], {matches: false}),
        },
        on: {
          'post': {
            actions: 'post',
          },
          'request': {
            actions: 'create request',
          },
          'response': {
            actions: 'respond',
          },
          'message.received': {
            actions: 'emit received message',
          },
          'disconnect': {
            target: 'disconnected',
          },
        },
        initial: 'heartbeat',
        states: {
          heartbeat: {
            initial: 'checking',
            states: {
              checking: {
                always: {
                  guard: 'should send heartbeats',
                  target: 'sending',
                },
              },
              sending: {
                on: {
                  'request.failed': {
                    target: '#disconnected',
                  },
                },
                invoke: {
                  src: 'sendBackAtInterval',
                  id: 'sendHeartbeat',
                  input: () => ({
                    event: {type: 'post', data: {type: MSG_HEARTBEAT, data: undefined}},
                    interval: 2000,
                    immediate: false,
                  }),
                },
              },
            },
          },
        },
      },
      disconnected: {
        id: 'disconnected',
        entry: 'send disconnect',
        on: {
          request: {
            actions: 'create request',
          },
          post: {
            actions: 'buffer message',
          },
          connect: {
            target: 'handshaking',
            guard: 'has target',
          },
        },
      },
    },
  })

  return channelMachine
}

/**
 * @public
 */
export const createChannel = <R extends Message, S extends Message>(
  input: ChannelInput,
): Channel<R, S> => {
  const machine = createChannelMachine<R, S>()

  const id = input.id || `${input.name}-${uuid()}`
  const actor = createActor(machine, {
    input: {...input, id},
  })

  const on = <T extends R['type'], U extends Extract<R, {type: T}>>(
    type: T,
    handler: (event: U['data']) => U['response'],
  ) => {
    const {unsubscribe} = actor.on(
      // @ts-expect-error @todo `type` typing
      type,
      (event: {type: T; message: ProtocolMessage<U>}) => {
        const response = handler(event.message.data)
        if (response) {
          actor.send({type: 'response', respondTo: event.message.id, data: response})
        }
      },
    )
    return unsubscribe
  }

  const connect = () => {
    actor.send({type: 'connect'})
  }

  const disconnect = () => {
    actor.send({type: 'disconnect'})
  }

  const onStatus = (handler: (status: string) => void) => {
    const currentSnapshot = actor.getSnapshot()
    let currentStatus: string | undefined =
      typeof currentSnapshot.value === 'string'
        ? currentSnapshot.value
        : Object.keys(currentSnapshot.value)[0]

    const {unsubscribe} = actor.subscribe((state) => {
      const status = typeof state.value === 'string' ? state.value : Object.keys(state.value)[0]
      if (currentStatus !== status) {
        currentStatus = status
        handler(status)
      }
    })
    return unsubscribe
  }

  const setTarget = (target: MessageEventSource) => {
    actor.send({type: 'target.set', target})
  }

  const post = (data: WithoutResponse<S>) => {
    actor.send({type: 'post', data})
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
    connect,
    disconnect,
    id,
    name: input.name,
    machine,
    on,
    onStatus,
    post,
    setTarget,
    start,
    stop,
    get target() {
      return actor.getSnapshot().context.target
    },
  }
}
