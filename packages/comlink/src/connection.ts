import {v4 as uuid} from 'uuid'
import {
  assertEvent,
  assign,
  createActor,
  enqueueActions,
  fromCallback,
  raise,
  setup,
  stopChild,
  type ActorRefFrom,
  type EventObject,
} from 'xstate'
import {createListenLogic, listenInputFromContext} from './common'
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
export type ConnectionActorLogic<S extends Message, R extends Message> = ReturnType<
  typeof createConnectionMachine<S, R>
>
/**
 * @public
 */
export type ConnectionActor<S extends Message, R extends Message> = ActorRefFrom<
  ReturnType<typeof createConnectionMachine<S, R>>
>

/**
 * @public
 */
export type Connection<S extends Message = Message, R extends Message = Message> = {
  actor: ConnectionActor<S, R>
  connect: () => void
  disconnect: () => void
  id: string
  name: string
  machine: ReturnType<typeof createConnectionMachine<S, R>>
  on: <T extends R['type'], U extends Extract<R, {type: T}>>(
    type: T,
    handler: (event: U['data']) => Promise<U['response']> | U['response'],
  ) => () => void
  onStatus: (handler: (status: Status) => void) => () => void
  post: <T extends S['type'], U extends Extract<S, {type: T}>>(
    ...params: (U['data'] extends undefined ? [T] : never) | [T, U['data']]
  ) => void
  setTarget: (target: MessageEventSource) => void
  start: () => () => void
  stop: () => void
  target: MessageEventSource | undefined
}

/**
 * @public
 */
export interface ConnectionInput {
  connectTo: string
  domain?: string
  heartbeat?: boolean
  name: string
  id?: string
  target?: MessageEventSource
  targetOrigin: string
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
export const createConnectionMachine = <
  S extends Message, // Sends
  R extends Message, // Receives
  V extends WithoutResponse<S> = WithoutResponse<S>,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
>() => {
  const connectionMachine = setup({
    types: {} as {
      children: {
        'listen for handshake': 'listen'
        'listen for messages': 'listen'
        'send heartbeat': 'sendBackAtInterval'
        'send syn': 'sendBackAtInterval'
      }
      context: {
        buffer: Array<V>
        channelId: string
        connectTo: string
        domain: string
        heartbeat: boolean
        id: string
        name: string
        requests: Array<RequestActorRef<S>>
        target: MessageEventSource | undefined
        targetOrigin: string
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
        | {type: 'request.aborted'; requestId: string}
        | {type: 'request.failed'; requestId: string}
        | {
            type: 'request.success'
            requestId: string
            response: S['response'] | null
            responseTo: string | undefined
          }
        | {type: 'request'; data: RequestData<S> | RequestData<S>[]}
        | {type: 'syn'}
        | {type: 'target.set'; target: MessageEventSource}
      input: ConnectionInput
    },
    actors: {
      requestMachine: createRequestMachine<S>(),
      listen: createListenLogic(),
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
        requests: ({context, event, self, spawn}) => {
          assertEvent(event, 'request')
          const arr = Array.isArray(event.data) ? event.data : [event.data]
          const requests = arr.map((request) => {
            const id = `req-${uuid()}`
            return spawn('requestMachine', {
              id,
              input: {
                channelId: context.channelId,
                data: request.data,
                domain: context.domain,
                expectResponse: request.expectResponse,
                from: context.name,
                parentRef: self,
                responseTo: request.responseTo,
                sources: context.target!,
                targetOrigin: context.targetOrigin,
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
      'remove request': enqueueActions(({context, enqueue, event}) => {
        assertEvent(event, ['request.success', 'request.failed', 'request.aborted'])
        stopChild(event.requestId)
        enqueue.assign({requests: context.requests.filter(({id}) => id !== event.requestId)})
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
    /** @xstate-layout N4IgpgJg5mDOIC5QGMAWBDAdpsAbAxAC7oBOMhAdLGIQNoAMAuoqAA4D2sAloV+5ixAAPRAHZRAJgoAWABz0ArHICMy2QGZZCgJwAaEAE9EE+tIrb6ANgkLl46fTuj1AXxf60WHARJgAjgCucJSwAcjIcLAMzEggHNy8-IIiCKLS2hQS6qb2yurisrL6RgjK9LIyCuqq0g7WstZuHhjYePi+gcEUAGboXLiQ0YLxPHwCsSmiCgoykpayDtqS6trqxYjKEk0gnq24FFwQA-jI-DjIdEzDnKNJExuOZpZ12eq29OrSCuupypYUojUaTKCnm5Wk2123gORzA+HilxibBuiXGoBSGnUAIU4gU9FWamUtR+lmUM1EllBEkslMUEnpkJa0JaEFgGAA1lxMFB8LADJghrERqjkhtshk3mTtNo5OpqpYfqCKhTptoqpY1WUtu4dky8BQWWz0Jzue1-EFYIjrgkxqLSupqRRPpoPqJtLI0hIioZENJJE7NnJ8ZYHVk1YyvPrDRyuTyEYLkTa7uixVlMh81KGFhS1j6EPkZlpVjTphr8mkI3sDVhWTHTQBbSLoGAUXwRLgAN0GVyFKNt91KimUFEKXvKC2s9R+6X+jipnzJeSqEJ1UKjNaNJp5EC4sFOrQuCbifeTwg2cgoym0RPxDtqkj0eaB9Ao8zSolMEivZVcq71+33c5CEgeFOCtXskzRM8EDxKRpmkSw3QJbQsmpH5tHmV8JHSbJpDsakV2aSMALOMALhAjoLXAxNbiglI-SxWw1Vw0QNDw0Qfg9KQ7EJSxHHxApK2hQCyOAiAzVgDhMGoI9hX7FMEHSF8cWkelpHURCbBsb481xAEgT9BQJCmWQsiE-URPI8TG1gWBmzAVsyLATtuyRY9ILtWoKmlL82Kqd0tAVJ91LMHFZDKIkVlkNVZHMkiDzE-Adz3UjDx7GiRQHCKnheD53k+HSSkDDIwpBVTqQwuKKEssSDTAUhCAAI3qyg0DIrd8Fkk86MQUMnVM+RynoegTDJH48hGp0vR-FDRqqKqasgOqGua9AQjATAd1NSiul6fpXOtWi7Wy19cslD4vnG7IX3oVjVDUVYEJQqrksW8SdstLqPKy0wKgG1RhtMWogqKhoMjkWp6XxUyFBe3c3tAz70vco6fq+V8PTkGUFzdQqNnELEM2yClrwwzQ4ZShKQJqr7UYU98AS0W9pT4z5pHG0yXwMkNNTyGk3B1TB2AgOBBDXXBDsyhSFG9EovQqN5i1JeRcKqw4Bkl+ToMx8x0j+EaqQ9XMSkBURMgMkEwQWKro2NWNNdPFJAzN0lJGM4slDxhBEJfXyplBd03wW1KxIdnrBxBh4JAyW75C8rJpmDqmIGWkgmpasPjqUcaHooMLHA0uU1UkJOgKW1B6rT1bWor5At0zgcTAkK7hrz1irB0D8cW0UvRPLyv07WqgNq2qAG+l9SnXUz0UOXD5xuMs3Y4+DVJBX7UiKrV6Q8gcfoJO54rFefLLqfJYX1WKYNLxL4NO1NwgA */
    id: 'connection',
    context: ({input}) => ({
      id: input.id || `${input.name}-${uuid()}`,
      buffer: [],
      channelId: `chn-${uuid()}`,
      connectTo: input.connectTo,
      domain: input.domain ?? DOMAIN,
      heartbeat: input.heartbeat ?? false,
      name: input.name,
      requests: [],
      target: input.target,
      targetOrigin: input.targetOrigin,
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
        id: 'handshaking',
        invoke: [
          {
            id: 'send syn',
            src: 'sendBackAtInterval',
            input: () => ({
              event: {type: 'syn'},
              interval: HANDSHAKE_INTERVAL,
              immediate: true,
            }),
          },
          {
            id: 'listen for handshake',
            src: 'listen',
            input: (input) =>
              listenInputFromContext({
                include: MSG_HANDSHAKE_SYN_ACK,
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
          id: 'listen for messages',
          src: 'listen',
          input: listenInputFromContext({
            exclude: [MSG_RESPONSE, MSG_HEARTBEAT],
          }),
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
                    target: '#handshaking',
                  },
                },
                invoke: {
                  id: 'send heartbeat',
                  src: 'sendBackAtInterval',
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

  return connectionMachine
}

/**
 * @public
 */
export const createConnection = <S extends Message, R extends Message>(
  input: ConnectionInput,
  machine: ConnectionActorLogic<S, R> = createConnectionMachine<S, R>(),
): Connection<S, R> => {
  const id = input.id || `${input.name}-${uuid()}`
  const actor = createActor(machine, {
    input: {...input, id},
  })

  const on = <T extends R['type'], U extends Extract<R, {type: T}>>(
    type: T,
    handler: (event: U['data']) => Promise<U['response']> | U['response'],
  ) => {
    const {unsubscribe} = actor.on(
      // @ts-expect-error @todo `type` typing
      type,
      async (event: {type: T; message: ProtocolMessage<U>}) => {
        const response = await handler(event.message.data)
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

  const onStatus = (handler: (status: Status) => void) => {
    const currentSnapshot = actor.getSnapshot()
    let currentStatus: Status =
      typeof currentSnapshot.value === 'string'
        ? currentSnapshot.value
        : Object.keys(currentSnapshot.value)[0]

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

  const setTarget = (target: MessageEventSource) => {
    actor.send({type: 'target.set', target})
  }

  const post = <T extends S['type'], U extends Extract<S, {type: T}>>(
    type: T,
    data?: U['data'],
  ) => {
    const _data = {type, data} as WithoutResponse<U>
    actor.send({type: 'post', data: _data})
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

// Helper function to cleanup a connection
export const cleanupConnection: (connection: Connection<Message, Message>) => void = (
  connection,
) => {
  connection.disconnect()
  // Necessary to allow disconnect messages to be sent before the connection
  // actor is stopped
  setTimeout(() => {
    connection.stop()
  }, 0)
}
