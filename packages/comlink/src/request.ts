import {EMPTY, filter, fromEvent, map, take, takeUntil, type Observable} from 'rxjs'
import {v4 as uuid} from 'uuid'
import {
  assign,
  fromEventObservable,
  sendTo,
  setup,
  type ActorRefFrom,
  type AnyActorRef,
} from 'xstate'
import {MSG_RESPONSE, RESPONSE_TIMEOUT_DEFAULT} from './constants'
import type {Message, MessageData, MessageType, ProtocolMessage, ResponseMessage} from './types'

const throwOnEvent =
  <T>(message?: string) =>
  (source: Observable<T>) =>
    source.pipe(
      take(1),
      map(() => {
        throw new Error(message)
      }),
    )

/**
 * @public
 */
export interface RequestMachineContext<TSends extends Message> {
  channelId: string
  data: MessageData | undefined
  domain: string
  expectResponse: boolean
  from: string
  id: string
  parentRef: AnyActorRef
  resolvable: PromiseWithResolvers<TSends['response']> | undefined
  response: TSends['response'] | null
  responseTimeout: number | undefined
  responseTo: string | undefined
  signal: AbortSignal | undefined
  suppressWarnings: boolean | undefined
  sources: Set<MessageEventSource>
  targetOrigin: string
  to: string
  type: MessageType
}

/**
 * @public
 */
export type RequestActorRef<TSends extends Message> = ActorRefFrom<
  ReturnType<typeof createRequestMachine<TSends>>
>

/**
 * @public
 */
export const createRequestMachine = <
  TSends extends Message,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
>() => {
  return setup({
    types: {} as {
      children: {
        'listen for response': 'listen'
      }
      context: RequestMachineContext<TSends>
      // @todo Should response types be specified?
      events: {type: 'message'; data: ProtocolMessage<ResponseMessage>} | {type: 'abort'}
      emitted:
        | {type: 'request.failed'; requestId: string}
        | {type: 'request.aborted'; requestId: string}
        | {
            type: 'request.success'
            requestId: string
            response: MessageData | null
            responseTo: string | undefined
          }
      input: {
        channelId: string
        data?: TSends['data']
        domain: string
        expectResponse?: boolean
        from: string
        parentRef: AnyActorRef
        resolvable?: PromiseWithResolvers<TSends['response']>
        responseTimeout?: number
        responseTo?: string
        signal?: AbortSignal
        sources: Set<MessageEventSource> | MessageEventSource
        suppressWarnings?: boolean
        targetOrigin: string
        to: string
        type: TSends['type']
      }
      output: {
        requestId: string
        response: TSends['response'] | null
        responseTo: string | undefined
      }
    },
    actors: {
      listen: fromEventObservable(
        ({
          input,
        }: {
          input: {
            requestId: string
            sources: Set<MessageEventSource>
            signal?: AbortSignal
          }
        }) => {
          const abortSignal$ = input.signal
            ? fromEvent(input.signal, 'abort').pipe(
                throwOnEvent(`Request ${input.requestId} aborted`),
              )
            : EMPTY

          const messageFilter = (event: MessageEvent<ProtocolMessage<ResponseMessage>>) =>
            event.data?.type === MSG_RESPONSE &&
            event.data?.responseTo === input.requestId &&
            !!event.source &&
            input.sources.has(event.source)

          return fromEvent<MessageEvent<ProtocolMessage<ResponseMessage>>>(window, 'message').pipe(
            filter(messageFilter),
            take(input.sources.size),
            takeUntil(abortSignal$),
          )
        },
      ),
    },
    actions: {
      'send message': ({context}, params: {message: ProtocolMessage}) => {
        const {sources, targetOrigin} = context
        const {message} = params

        sources.forEach((source) => {
          source.postMessage(message, {targetOrigin})
        })
      },
      'on success': sendTo(
        ({context}) => context.parentRef,
        ({context, self}) => {
          if (context.response) {
            context.resolvable?.resolve(context.response)
          }
          return {
            type: 'request.success',
            requestId: self.id,
            response: context.response,
            responseTo: context.responseTo,
          }
        },
      ),
      'on fail': sendTo(
        ({context}) => context.parentRef,
        ({context, self}) => {
          if (!context.suppressWarnings) {
            // eslint-disable-next-line no-console
            console.warn(
              `[@sanity/comlink] Received no response to message '${context.type}' on client '${context.from}' (ID: '${context.id}').`,
            )
          }
          context.resolvable?.reject(new Error('No response received'))
          return {type: 'request.failed', requestId: self.id}
        },
      ),
      'on abort': sendTo(
        ({context}) => context.parentRef,
        ({context, self}) => {
          context.resolvable?.reject(new Error('Request aborted'))
          return {type: 'request.aborted', requestId: self.id}
        },
      ),
    },
    guards: {
      expectsResponse: ({context}) => context.expectResponse,
    },
    delays: {
      initialTimeout: 0,
      responseTimeout: ({context}) => context.responseTimeout ?? RESPONSE_TIMEOUT_DEFAULT,
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiAD1gBd0GwT0AzFgJ2QNwdzoKAFVyowAewCuDItTRY8hUuSoBtAAwBdRKAAOE2P1wT8ukLUQBGAEwBWEgBYAnK+eOAzB7sB2DzY8rABoQAE9rDQc3V0cNTw8fAA4NHwBfVJCFHAJiElgwfAgCKGpNHSQQAyMBU3NLBDsrDxI7DTaAjQA2OOcNDxDwhHsNJx9Ou0TOq2cJxP9HdMyMbOU8gqL8ErUrcv1DY1qK+sbm1vaPLp6+gcRnGydo9wDGycWQLKVc9AB3dGNN6jiWCwdAwMrmKoHMxHRCJRKOEiJHwuZKBZwXKzBMKIGyYkhtAkXOweTqOHw2RJvD45Ug-P4CAH0JgsNicMA8LhwAz4fKicTSWTyZafWm-f5QcEVSE1aGgepwhFIlF9aYYrGDC4+JzEppjGzOUkeGbpDIgfASCBwczU5QQ-YyuqIAC0nRuCBd+IJXu9KSpwppZEoYDt1RMsosiEcNjdVjiJEeGisiSTHkcVgWpptuXyhWKIahjqGzi1BqRJINnVcdkcbuTLS9VYC8ISfsUAbp4vzDphCHJIyjBvJNlxNmRNexQ3sJGH43GPj8jWJrZWuXYfyoEC7YcLsbrgRsjkcvkmdgNbopVhIPhVfnsh8ClMz-tWsCkmEwcHgUvt257u8v+6Hse4xnhOdZnImVidPqCRNB4JqpEAA */
    context: ({input}) => {
      return {
        channelId: input.channelId,
        data: input.data,
        domain: input.domain,
        expectResponse: input.expectResponse ?? false,
        from: input.from,
        id: `msg-${uuid()}`,
        parentRef: input.parentRef,
        resolvable: input.resolvable,
        response: null,
        responseTimeout: input.responseTimeout,
        responseTo: input.responseTo,
        signal: input.signal,
        sources: input.sources instanceof Set ? input.sources : new Set([input.sources]),
        suppressWarnings: input.suppressWarnings,
        targetOrigin: input.targetOrigin,
        to: input.to,
        type: input.type,
      }
    },
    initial: 'idle',
    on: {
      abort: '.aborted',
    },
    states: {
      idle: {
        after: {
          initialTimeout: [
            {
              target: 'sending',
            },
          ],
        },
      },
      sending: {
        entry: {
          type: 'send message',
          params: ({context}) => {
            const {channelId, data, domain, from, id, responseTo, to, type} = context
            const message = {
              channelId,
              data,
              domain,
              from,
              id,
              to,
              type,
              responseTo,
            }
            return {message}
          },
        },
        always: [
          {
            guard: 'expectsResponse',
            target: 'awaiting',
          },
          'success',
        ],
      },
      awaiting: {
        invoke: {
          id: 'listen for response',
          src: 'listen',
          input: ({context}) => ({
            requestId: context.id,
            sources: context.sources,
            signal: context.signal,
          }),
          onError: 'aborted',
        },
        after: {
          responseTimeout: 'failed',
        },
        on: {
          message: {
            actions: assign({
              response: ({event}) => event.data.data,
              responseTo: ({event}) => event.data.responseTo,
            }),
            target: 'success',
          },
        },
      },
      failed: {
        type: 'final',
        entry: 'on fail',
      },
      success: {
        type: 'final',
        entry: 'on success',
      },
      aborted: {
        type: 'final',
        entry: 'on abort',
      },
    },
    output: ({context, self}) => {
      const output = {
        requestId: self.id,
        response: context.response,
        responseTo: context.responseTo,
      }
      return output
    },
  })
}

// export const delayedRequestMachine = requestMachine.provide({
//   delays: {
//     initialTimeout: 500,
//   },
// })
