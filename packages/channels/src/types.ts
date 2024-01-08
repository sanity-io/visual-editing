import { HANDSHAKE_MSG_TYPES, INTERNAL_MSG_TYPES } from './constants'

/**
 * @public
 */
export type ChannelMsgType = `${string}/${string}`

/**
 * @public
 */
export type ChannelMsgData = Record<string, unknown> | undefined

/**
 * @public
 */
export interface ChannelMsg {
  data: ChannelMsgData
  type: ChannelMsgType
}

/**
 * @internal
 */
export type ProtocolMsg<T extends ChannelMsg = ChannelMsg> = {
  id: string
  connectionId: string
  data?: T['data']
  domain: 'sanity/channels'
  from: string
  to: string
  type: T['type']
}

/**
 * @internal
 */
export type ToArgs<T extends ChannelMsg> = T extends T
  ? [type: T['type'], data: T['data']]
  : never

/**
 * @public
 */
export type ChannelStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'

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
export type HandshakeMsgTypeTuple = typeof HANDSHAKE_MSG_TYPES

/**
 * @internal
 */
export type HandshakeMsgType = HandshakeMsgTypeTuple[number]

/**
 * @public
 */
export type ChannelsEventHandler<T extends ChannelMsg = ChannelMsg> = (
  ...args: ToArgs<T>
) => void

/**
 * @public
 */
export interface ChannelsControllerOptions<T extends ChannelMsg = ChannelMsg> {
  id: string
  connectTo: ChannelsControllerChannelOptions<T>[]
  target: Window
  targetOrigin: string
  onEvent?: ChannelsEventHandler<T>
  onStatusUpdate?: (status: ChannelStatus, connectionId: string) => void
}

/**
 * @public
 */
export interface ChannelsControllerChannelOptions<
  T extends ChannelMsg = ChannelMsg,
> {
  id: string
  heartbeat?: boolean | number
  onStatusUpdate?: (status: ChannelStatus, connectionId: string) => void
  onEvent?: ChannelsEventHandler<T>
}

/**
 * @internal
 */
export interface ChannelsControllerChannel<T extends ChannelMsg = ChannelMsg> {
  id: string | null
  buffer: ChannelMsg[]
  config: ChannelsControllerChannelOptions<T>
  handler: (e: MessageEvent) => void
  heartbeat: number | undefined
  interval: number | undefined
  status: ChannelStatus
}

/**
 * @public
 */
export interface ChannelsController<T extends ChannelMsg = ChannelMsg> {
  addSource: (source: MessageEventSource) => void
  destroy: () => void
  send: (id: string | string[] | undefined, ...args: ToArgs<T>) => void
}

/**
 * @public
 */
export interface ChannelsNodeOptions<T extends ChannelMsg = ChannelMsg> {
  id: string
  connectTo: string
  onEvent?: ChannelsEventHandler<T>
  onStatusUpdate?: (status: ChannelStatus) => void
}

/**
 * @internal
 */
export interface ChannelsNodeChannel {
  id: string | null
  buffer: ChannelMsg[]
  origin: string | null
  source: MessageEventSource | null
  status: ChannelStatus
}

/**
 * @public
 */
export interface ChannelsNode<T extends ChannelMsg = ChannelMsg> {
  destroy: () => void
  inFrame: boolean
  send: (...args: ToArgs<T>) => void
}
