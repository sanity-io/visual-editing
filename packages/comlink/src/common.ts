import {bufferCount, concatMap, defer, filter, fromEvent, map, pipe, take} from 'rxjs'
import {fromEventObservable} from 'xstate'

import type {ListenInput, ProtocolMessage} from './types'

export const listenInputFromContext =
  (
    type: string | string[] = [],
    options: {matches?: boolean; count?: number; responseType?: string} = {},
  ) =>
  <
    T extends {
      domain: string
      connectTo: string
      id: string
      target: MessageEventSource | undefined
    },
  >({
    context,
  }: {
    context: T
  }): ListenInput => {
    const {count, matches = true, responseType = 'message.received'} = options
    return {
      count,
      domain: context.domain,
      from: context.connectTo,
      matches,
      responseType,
      target: context.target,
      to: context.id,
      type,
    }
  }

export const listenFilter =
  (input: ListenInput) =>
  (event: MessageEvent<ProtocolMessage>): boolean => {
    const {data} = event
    const types = Array.isArray(input.type) ? input.type : [input.type]
    return (
      (input.matches ? types.includes(data.type) : !types.includes(data.type)) &&
      data.domain === input.domain &&
      data.from === input.from &&
      data.to === input.to &&
      (!input.target || event.source === input.target)
    )
  }

export const eventToMessage =
  <T>(type: T) =>
  (event: MessageEvent<ProtocolMessage>): {type: T; message: MessageEvent<ProtocolMessage>} => ({
    type,
    message: event,
  })

export const messageEvents$ = defer(() =>
  fromEvent<MessageEvent<ProtocolMessage>>(window, 'message'),
)

export const listenActor = fromEventObservable(({input}: {input: ListenInput}) => {
  return messageEvents$.pipe(
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
