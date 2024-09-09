import type {MSG_HEARTBEAT, MSG_RESPONSE} from './constants'

/**
 * @public
 */
export type Status = string // @todo strongly type these

/**
 * @public
 */
export type StatusEvent = {channel: string; status: Status}

/**
 * @public
 */
export type MessageType = string

/**
 * @public
 */
export type MessageData = Record<string, unknown> | undefined

/**
 * @public
 */
export interface Message {
  type: MessageType
  data?: MessageData
  response?: MessageData
}

/**
 * @public
 */
export interface RequestData<S extends Message> {
  data?: MessageData
  expectResponse?: boolean
  responseTo?: string
  type: MessageType
  resolvable?: PromiseWithResolvers<S['response']>
}

/**
 * @public
 */
export type WithoutResponse<T extends Message> = Omit<T, 'response'>

/**
 * @public
 */
export interface ListenInput {
  count?: number
  domain: string
  exclude: string[]
  from: string
  include: string[]
  responseType: string
  target: MessageEventSource | undefined
  to: string
}

/**
 * @public
 */
export interface BufferAddedEmitEvent<T extends Message> {
  type: '_buffer.added'
  message: T
}

/**
 * @public
 */
export interface BufferFlushedEmitEvent<T extends Message> {
  type: '_buffer.flushed'
  messages: T[]
}

/**
 * @public
 */
export interface HeartbeatEmitEvent {
  type: '_heartbeat'
}

/**
 * @public
 */
export interface MessageEmitEvent<T extends Message> {
  type: '_message'
  message: ProtocolMessage<T>
}

/**
 * @public
 */
export type InternalEmitEvent<R extends Message, S extends Message> =
  | BufferAddedEmitEvent<S>
  | BufferFlushedEmitEvent<R>
  | MessageEmitEvent<R>

/**
 * @public
 */
export type ProtocolMessage<T extends Message = Message> = {
  id: string
  connectionId: string
  data?: T['data']
  domain: string
  from: string
  responseTo?: string
  to: string
  type: T['type']
}

/**
 * @public
 */
export interface ResponseMessage {
  type: typeof MSG_RESPONSE
  data: MessageData
}

/**
 * @public
 */
export interface HeartbeatMessage {
  type: typeof MSG_HEARTBEAT
  data: undefined
}
