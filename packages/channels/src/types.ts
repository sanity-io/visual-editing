import { HANDSHAKE_MSG_TYPES, INTERNAL_MSG_TYPES } from './constants'

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
export type HandshakeMsgTypeTuple = typeof HANDSHAKE_MSG_TYPES

/**
 * @internal
 */
export type HandshakeMsgType = HandshakeMsgTypeTuple[number]
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
  connectionId: string | null
  type: MsgType
  from: string
  to: string
}

/**
 * @internal
 */
export interface HandshakeMsg extends InternalMsg {
  type: 'handshake/syn' | 'handshake/syn-ack' | 'handshake/ack'
  data: {
    id: string
  }
}

/**
 * @internal
 */
export interface DisconnectMsg extends InternalMsg {
  type: 'channel/disconnect'
}

/**
 * @internal
 */
export interface ResponseMsg extends InternalMsg {
  type: 'channel/response'
  data: {
    responseTo: string
  }
}

/**
 * @internal
 */
export type ProtocolMsg = HandshakeMsg | ResponseMsg | DisconnectMsg

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
export interface ChannelConnection {
  id: string
  target: Window
  targetOrigin: string
  heartbeat?: boolean | number
}

/**
 * @internal
 */
export type ConnectionStatus =
  | 'fresh'
  | 'connecting'
  | 'connected'
  | 'unhealthy'
  | 'disconnected'

/**
 * @internal
 */
export interface Connection {
  buffer: ChannelMsg[]
  config: ChannelConnection
  heartbeat: number | null
  id: string | null
  status: ConnectionStatus
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
   * An identifier that should be unique amongst all clients
   */
  id: string
  /**
   * The connections that should be established
   */
  connections: ChannelConnection[]
  onStatusUpdate?: (
    newStatus: ConnectionStatus,
    prevStatus: ConnectionStatus,
    connection: Connection,
  ) => void
  handler: ChannelEventHandler<T>
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
