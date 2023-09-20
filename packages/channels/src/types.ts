import { INTERNAL_MSG_TYPES } from './constants'

/**
 * @public
 */
export type MsgType = `${string}/${string}`

/**
 * @public
 */
export type MsgBody = Record<string, unknown> | undefined

/**
 * @internal
 */
export type InternalMsgTypeTuple = typeof INTERNAL_MSG_TYPES

/**
 * @internal
 */
export type InternalMsgType = InternalMsgTypeTuple[number]

/**
 * @internal
 */
export interface InternalMsg {
  id: string
  type: MsgType
  from: string
  to: string
}

/**
 * @internal
 */
export interface ProtocolMsg extends InternalMsg {
  type: InternalMsgType
}

/**
 * @internal
 */
export interface EventMsg extends InternalMsg {
  data: MsgBody
}

/**
 * @internal
 */
export type Msg = ProtocolMsg | EventMsg

/**
 * @internal
 */
export interface BufferMessage<T extends MsgBody> {
  connection: Connection
  type: MsgType
  data?: T
}

/**
 * @public
 */
export interface Connection {
  target: Window
  id: string
}

/**
 * @public
 */
export interface ChannelOptions<T extends MsgBody = MsgBody> {
  /**
   * A client identifier that should be unique amongst all clients, a UUID will be generated if left blank
   */
  id: string
  /**
   * The connections that should be established
   */
  connections: Connection[]
  onConnect?: (connection: Connection) => void
  onDisconnect?: (connection: Connection) => void
  handle: (type: MsgType, data: T) => void
}

/**
 * @public
 */
export interface ChannelReturns<T extends MsgBody = MsgBody> {
  disconnect: () => void
  /**
   * Returns true if function was executed in an iFrame
   */
  inFrame: boolean
  send: (type: MsgType, data?: T) => Promise<unknown>
}
