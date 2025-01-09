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
export interface RequestData<TSends extends Message> {
  data?: MessageData
  expectResponse?: boolean
  responseTo?: string
  type: MessageType
  resolvable?: PromiseWithResolvers<TSends['response']>
  options?: {
    responseTimeout?: number
    signal?: AbortSignal
    suppressWarnings?: boolean
  }
}

/**
 * @public
 */
export type WithoutResponse<TMessage extends Message> = Omit<TMessage, 'response'>

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
export interface BufferAddedEmitEvent<TMessage extends Message> {
  type: 'buffer.added'
  message: TMessage
}

/**
 * @public
 */
export interface BufferFlushedEmitEvent<TMessage extends Message> {
  type: 'buffer.flushed'
  messages: TMessage[]
}

/**
 * @public
 */
export interface HeartbeatEmitEvent {
  type: 'heartbeat'
}

/**
 * @public
 */
export interface StatusEmitEvent {
  type: 'status'
  status: Status
}

export type MessageEmitEvent<TMessage extends Message> = {
  type: 'message'
  message: ProtocolMessage<TMessage>
}

/**
 * @public
 */
export type InternalEmitEvent<TSends extends Message, TReceives extends Message> =
  | BufferAddedEmitEvent<TSends>
  | BufferFlushedEmitEvent<TReceives>
  | MessageEmitEvent<TReceives>
  | StatusEmitEvent

/**
 * @public
 */
export type ProtocolMessage<TMessage extends Message = Message> = {
  id: string
  channelId: string
  data?: TMessage['data']
  domain: string
  from: string
  responseTo?: string
  to: string
  type: TMessage['type']
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
