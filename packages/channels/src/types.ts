import type {CHANNELS_DOMAIN, HANDSHAKE_MSG_TYPES, INTERNAL_MSG_TYPES} from './constants'

/**
 * @public
 */
export type ChannelMsgType = string

/**
 * @public
 */
export type ChannelMsgData = Record<string, unknown> | undefined

/**
 * @public
 */
export interface ChannelMsg {
  type: ChannelMsgType
  data?: ChannelMsgData
  response?: ChannelMsgData
}

/**
 * @internal
 */
export type ProtocolMsg<T extends ChannelMsg = ChannelMsg> = {
  id: string
  connectionId: string
  data?: T['data']
  domain: typeof CHANNELS_DOMAIN
  from: string
  responseTo?: string
  to: string
  type: T['type']
}

/**
 * @public
 */
export type ChannelStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

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
export interface ChannelsDisconnectMsg {
  type: 'channel/disconnect'
  data: {
    id: string | null
  }
}

export interface ChannelsResponseMsg {
  type: 'channel/response'
  data: ChannelMsgData & {
    responseTo: string
  }
}
export interface ChannelsHeartbeatMsg {
  type: 'channel/heartbeat'
  data: undefined
}

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

export interface HandshakeSynMsg {
  type: 'handshake/syn'
  data: {id: string}
}
export interface HandshakeSynAckMsg {
  type: 'handshake/syn-ack'
  data: {id: string}
}
export interface HandshakeAckMsg {
  type: 'handshake/ack'
  data: {id: string}
}

export type ChannelsChannelInternalMsg =
  | ChannelsDisconnectMsg
  | ChannelsHeartbeatMsg
  | ChannelsResponseMsg
  | HandshakeAckMsg
  | HandshakeSynAckMsg
  | HandshakeSynMsg

/**
 * @public
 */
export interface ChannelsControllerAPI {
  id: string
  sends: ChannelMsg
  nodes: {
    id: string
    message: ChannelMsg
  }
}

/**
 * @public
 */
export interface ChannelsNodeAPI {
  id: string
  controllerId: string
  sends: ChannelMsg
  receives: ChannelMsg
}

/**
 * @public
 */
export type ChannelsStatusHandler = (status: ChannelStatus) => void

/**
 * @public
 */
export type Narrow<T extends ChannelMsg['type'], Msg extends ChannelMsg> = Extract<Msg, {type: T}>

/**
 * @public
 */
export type ChannelsNodeHandler<T extends ChannelMsg['type'], U extends ChannelMsg> = (
  data: Narrow<T, U>['data'],
) => void
/**
 * @public
 */
export type ChannelsNodeHandlerMap<T extends ChannelMsg> = Map<
  T['type'],
  {type: T['type']; handler: ChannelsNodeHandler<T['type'], T>}
>

/**
 * @public
 */
export type ChannelsChannelHandler<T extends ChannelMsg['type'], Receives extends ChannelMsg> = (
  data: Narrow<T, Receives>['data'],
) => Promise<Narrow<T, Receives>['response'] | undefined> | void
/**
 * @public
 */
export type ChannelsChannelHandlerMap<Receives extends ChannelMsg> = Map<
  Receives['type'],
  ChannelsChannelHandler<Receives['type'], Receives>
>
