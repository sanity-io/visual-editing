import {bufferCount, concatMap, defer, filter, fromEvent, map, pipe, take} from 'rxjs'
import {fromEventObservable} from 'xstate'
import type {ListenInput, ProtocolMessage} from './types'

export const listenInputFromContext =
  (
    config: (
      | {
          include: string | string[]
          exclude?: string | string[]
        }
      | {
          include?: string | string[]
          exclude: string | string[]
        }
    ) & {
      matches?: boolean
      count?: number
      responseType?: string
    },
  ) =>
  <
    TContext extends {
      domain: string
      connectTo: string
      name: string
      target: MessageEventSource | undefined
    },
  >({
    context,
  }: {
    context: TContext
  }): ListenInput => {
    const {count, include, exclude, responseType = 'message.received'} = config
    return {
      count,
      domain: context.domain,
      from: context.connectTo,
      include: include ? (Array.isArray(include) ? include : [include]) : [],
      exclude: exclude ? (Array.isArray(exclude) ? exclude : [exclude]) : [],
      responseType,
      target: context.target,
      to: context.name,
    }
  }

export const listenFilter =
  (input: ListenInput) =>
  (event: MessageEvent<ProtocolMessage>): boolean => {
    const {data} = event
    return (
      (input.include.length ? input.include.includes(data.type) : true) &&
      (input.exclude.length ? !input.exclude.includes(data.type) : true) &&
      data.domain === input.domain &&
      data.from === input.from &&
      data.to === input.to &&
      (!input.target || event.source === input.target)
    )
  }

export const eventToMessage =
  <TType>(type: TType) =>
  (
    event: MessageEvent<ProtocolMessage>,
  ): {type: TType; message: MessageEvent<ProtocolMessage>} => ({
    type,
    message: event,
  })

export const messageEvents$ = defer(() =>
  fromEvent<MessageEvent<ProtocolMessage>>(window, 'message'),
)

/**
 * @public
 */
export const createListenLogic = (
  compatMap?: (event: MessageEvent<ProtocolMessage>) => MessageEvent<ProtocolMessage>,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) =>
  fromEventObservable(({input}: {input: ListenInput}) => {
    return messageEvents$.pipe(
      compatMap ? map(compatMap) : pipe(),
      filter(listenFilter(input)),
      map(eventToMessage(input.responseType)),
      input.count
        ? pipe(
            bufferCount(input.count),
            concatMap((arr) => arr),
            take(input.count),
          )
        : pipe(),
    )
  })
