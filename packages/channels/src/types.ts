import { INTERNAL_MSG_TYPES } from './constants'

/**
 * @public
 */
export interface ChannelMsg {
  type: MsgType
  data: MsgBody
}

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
export interface BufferMessage extends ChannelMsg {
  connection: Connection
}

/**
 * @public
 */
export interface Connection {
  target: Window
  id: string
}

export type ToArgs<T extends ChannelMsg> = T extends T
  ? [type: T['type'], data: T['data']]
  : never

/**
 * @public
 */
export type ChannelEventHandler<T extends ChannelMsg = ChannelMsg> = (
  ...args: ToArgs<T>
) => void

/**
 * @public
 */
export interface ChannelOptions<T extends ChannelMsg = ChannelMsg> {
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
  handle: ChannelEventHandler<T>
}

/**
 * @public
 */
export interface ChannelReturns<T extends ChannelMsg = ChannelMsg> {
  disconnect: () => void
  /**
   * Returns true if function was executed in an iFrame
   */
  inFrame: boolean
  send: (...args: ToArgs<T>) => Promise<unknown>
}
