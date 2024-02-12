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
export type ChannelsEventHandler<Receives extends ChannelMsg = ChannelMsg> = (
  ...args: ToArgs<Receives>
) => void

/**
 * @public
 */
export type ChannelsControllerStatusSubscriber = (
  status: ChannelStatus,
  connectionId: string,
) => void

/**
 * @public
 */
export interface ChannelsControllerOptions<
  Receives extends ChannelMsg = ChannelMsg,
> {
  id: string
  connectTo: ChannelsControllerChannelOptions<Receives>[]
  target: Window
  targetOrigin: string
  onEvent?: ChannelsEventHandler<Receives>
  onStatusUpdate?: ChannelsControllerStatusSubscriber
}

/**
 * @public
 */
export interface ChannelsControllerChannelOptions<
  Receives extends ChannelMsg = ChannelMsg,
> {
  id: string
  heartbeat?: boolean | number
  onEvent?: ChannelsEventHandler<Receives>
  onStatusUpdate?: ChannelsControllerStatusSubscriber
}

/**
 * @internal
 */
export interface ChannelsControllerChannel<
  Receives extends ChannelMsg = ChannelMsg,
> {
  id: string | null
  buffer: ChannelMsg[]
  config: ChannelsControllerChannelOptions<Receives>
  handler: (e: MessageEvent) => void
  heartbeat: number | undefined
  interval: number | undefined
  status: ChannelStatus
}

/**
 * @public
 */
export interface ChannelsController<Sends extends ChannelMsg = ChannelMsg> {
  addSource: (source: MessageEventSource) => void
  destroy: () => void
  send: (id: string | string[] | undefined, ...args: ToArgs<Sends>) => void
}

/**
 * @public
 */
export interface ChannelsNodeOptions {
  id: string
  connectTo: string
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
export type ChannelsEventSubscriber<Receives extends ChannelMsg> = (
  ...args: ToArgs<Receives>
) => void

/**
 * @public
 */
export type ChannelsNodeStatusSubscriber = (status: ChannelStatus) => void

/**
 * @public
 */
export interface ChannelsNode<
  Sends extends ChannelMsg,
  Receives extends ChannelMsg,
> {
  destroy: () => void
  inFrame: boolean
  onStatusUpdate: (subscriber: ChannelsNodeStatusSubscriber) => () => void
  send: (...args: ToArgs<Sends>) => void
  subscribe: (subscriber: ChannelsEventSubscriber<Receives>) => () => void
}
