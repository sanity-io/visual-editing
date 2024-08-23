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
  machine: ReturnType<typeof createChannelMachine<R, S>>
  on: <T extends R['type'], U extends Extract<R, {type: T}>>(
    type: T,
    handler: (event: U['data']) => U['response'],
  ) => () => void
  onStatus: (handler: (status: string) => void) => () => void
  post: (data: WithoutResponse<S>) => void
  setSource: (source: MessageEventSource) => void
  start: () => () => void
  stop: () => void
}

/**
 * @public
 */
export interface ChannelInput {
  connectTo: string
  domain?: string
  heartbeat?: boolean
  id: string
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
        | {type: 'source.set'; source: MessageEventSource}
        | {type: 'syn'}
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
                from: context.id,
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
      'set source': assign({
        target: ({event}) => {
          assertEvent(event, 'source.set')
          return event.source
        },
      }),
    },
    guards: {
      'has source': ({context}) => !!context.target,
      'should send heartbeats': ({context}) => context.heartbeat,
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QGMAWBDAdpsAbAxAE5gCOArnAC4B0sZyycsA2gAwC6ioADgPawBLSgN6YuIAB6IAbACYAnNVYBGAKyr5Admkq5mgCwAaEAE9Ey1gA5q+1QGZld1nc2XLyzSoC+X42iw4BMTkVNQAZugCuJBsnEggfILCouJSCNJ2qtSyqq7Kso4WWsZmCPk+fhjYeNQCENH4yKI4yJSx4olCImLxaQWy1G6yrqqylqz6mdLSJYh249Qu8vqsBrmjqhUg-tW4tfVg+IltHB38XSm9iLJ2dtQeypY6q-PymZazCMOK+rJ6nq4AZZNFsdoFqFUILAMABrASYKD4WAmTDteKdZI9UBpZSTaiaOyTTSqVisVT6TQeD6mcwKTRKTSyViyWQUnS46SgqrgyHQ9BwhFEUgUWAnOI8c6Y1LmHT4v7qTTLeTyVSWeSffKk6jSR4quzyaTyBTySxcgI1Xmw+GI45oiVJbrSsq5aiqjROZyG-TSamlZQWfT3aSqyzkuRus27CFYKFWwUAWyY6Bg1GIjAEADcYqd0ZLHVcEHZDUow7ZMpMFKyNTkBhZLL9yb8tPpIzyY3yBYiIAJYE1qq07Qk85dsXNi2TvWXyXZK0YaWUKawbPoPDlDUa5C3fNtuTU+y1KJAjvwxWcHSPJIhlXd9EbHv75GppNpPm9lNl5pSG7c3CDt2C92aMBWiPYIRVPXNzyxS8EANQNbE8P4MnGNxfUQSxCXxUNVU-BDHlbQD+0PCAhVgPhMFgMBBwxfNR1g9xXX9TwJjJeQJmUT4CWsW5WXsW91lvAi9n3YDiPwRNYFgZMwFTYCwEzbNxSHKCnTeRQjQNYF6xZdlPmkFdBkVGcHGUQ0XD-SpzWEoCQJI7texsiD7QuaC0lyDUnmse8Z3GYkWSE6gRNsiEwHQQhKAAI1Cmg0GAzt8Go4dXMQNZ7kpIy1QcFdq2LZYPGWHiMPmAL7KCsSwKoRKVILSZrFZAofQUfIWU0Dz9JsVw-n0J5-R1EqezKo9bRzZypRqzJ7hUclnE6ix7A1bRrGZElGR1Zlfh8bdMF4CA4HEADcDPFynTnP1H2oDc-lWXIMnmU1-13PY6miI6xrotx7kffVQ0cbRcjsT55iXYE3lsN1fi6gLLX5a1XtomDRg1b7XRyVg2JNYYmoCwaIDhi83LGLC1UVVlpkZdV52VaRtUfetvRnJl1GxxzIBCsLIuivHkoQG6ia0I1vWfBQNTUellFpycDCBuxmaI1nUFC8KovQGKFeQTsuadTc+ZJwXyZyrzH2JQkdBWYZZYPeXFY5lXaDATBuwRTWCwNAZllGe81FJVr53yfRA0NR5SSNW5Rn6hy5dxyDjoLJklw0n03BXOQjY1A0sjfW5bmfYFVU2rwgA */
    id: 'channel',
    context: ({input}) => ({
      buffer: [],
      connectionId: `cnx-${uuid()}`,
      connectTo: input.connectTo,
      domain: input.domain ?? DOMAIN,
      heartbeat: input.heartbeat ?? false,
      id: input.id,
      origin: input.origin,
      requests: [],
      target: input.target,
    }),
    on: {
      'source.set': {
        actions: 'set source',
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
            guard: 'has source',
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
        entry: 'send disconnect',
        on: {
          request: {
            actions: 'create request',
          },
          post: {
            actions: 'buffer message',
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

  const setSource = (source: MessageEventSource) => {
    actor.send({type: 'source.set', source})
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
    machine,
    on,
    onStatus,
    post,
    setSource,
    start,
    stop,
  }
}
