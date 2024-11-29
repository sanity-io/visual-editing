import {
  MSG_DISCONNECT,
  MSG_HANDSHAKE_ACK,
  MSG_HANDSHAKE_SYN,
  MSG_HANDSHAKE_SYN_ACK,
  MSG_HEARTBEAT,
  type MSG_RESPONSE,
} from './constants'

/**
 * @public
 */
export type Status = 'idle' | 'handshaking' | 'connected' | 'disconnected'

/**
 * @public
 */
export type StatusEvent = {connection: string; status: Status}

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
  options?: {
    responseTimeout?: number
    signal?: AbortSignal
    suppressWarnings?: boolean
  }
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
export interface StatusEmitEvent {
  type: '_status'
  status: Status
}

export type ReceivedEmitEvent<T extends Message> = T extends T
  ? {type: T['type']; message: ProtocolMessage<T>}
  : never

/**
 * @public
 */
export type InternalEmitEvent<S extends Message, R extends Message> =
  | BufferAddedEmitEvent<S>
  | BufferFlushedEmitEvent<R>
  | MessageEmitEvent<R>
  | StatusEmitEvent

/**
 * @public
 */
export type ProtocolMessage<T extends Message = Message> = {
  id: string
  channelId: string
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

/**
 * @internal
 */
export interface DisconnectMessage {
  type: typeof MSG_DISCONNECT
  data: undefined
}

/**
 * @internal
 */
export type HandshakeMessageType =
  | typeof MSG_HANDSHAKE_ACK
  | typeof MSG_HANDSHAKE_SYN
  | typeof MSG_HANDSHAKE_SYN_ACK

/**
 * @internal
 */
export type InternalMessageType =
  | typeof MSG_DISCONNECT
  | typeof MSG_HANDSHAKE_ACK
  | typeof MSG_HANDSHAKE_SYN
  | typeof MSG_HANDSHAKE_SYN_ACK
  | typeof MSG_HEARTBEAT
  | typeof MSG_RESPONSE
