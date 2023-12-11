import { HANDSHAKE_MSG_TYPES, INTERNAL_MSG_TYPES } from './constants'

/**
 * @public
 */
export type ChannelsMsgType = `${string}/${string}`

/**
 * @public
 */
export type ChannelsMsgData = Record<string, unknown> | undefined

/**
 * @public
 */
export interface ChannelsMsg {
  data: ChannelsMsgData
  type: ChannelsMsgType
}

/**
 * @internal
 */
export type ProtocolMsg<T extends ChannelsMsg = ChannelsMsg> = {
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
export type ToArgs<T extends ChannelsMsg> = T extends T
  ? [type: T['type'], data: T['data']]
  : never

/**
 * @public
 */
export type ChannelsConnectionStatus =
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
export type ChannelsEventHandler<T extends ChannelsMsg = ChannelsMsg> = (
  ...args: ToArgs<T>
) => void

/**
 * @public
 */
export interface ChannelsPublisherOptions<T extends ChannelsMsg = ChannelsMsg> {
  id: string
  connectTo: ChannelsPublisherConnectionOptions<T>[]
  frame: HTMLIFrameElement
  frameOrigin: string
  onEvent?: ChannelsEventHandler<T>
  onStatusUpdate?: (
    status: ChannelsConnectionStatus,
    connectionId: string,
  ) => void
}

/**
 * @public
 */
export interface ChannelsPublisherConnectionOptions<
  T extends ChannelsMsg = ChannelsMsg,
> {
  id: string
  heartbeat?: boolean | number
  onStatusUpdate?: (
    status: ChannelsConnectionStatus,
    connectionId: string,
  ) => void
  onEvent?: ChannelsEventHandler<T>
}

/**
 * @internal
 */
export interface ChannelsPublisherConnection<
  T extends ChannelsMsg = ChannelsMsg,
> {
  id: string | null
  buffer: ChannelsMsg[]
  config: ChannelsPublisherConnectionOptions<T>
  handler: (e: MessageEvent) => void
  heartbeat: number | undefined
  interval: number | undefined
  status: ChannelsConnectionStatus
}

/**
 * @public
 */
export interface ChannelsPublisher<T extends ChannelsMsg = ChannelsMsg> {
  destroy: () => void
  send: (id: string | string[] | undefined, ...args: ToArgs<T>) => void
}

/**
 * @public
 */
export interface ChannelsSubscriberOptions<
  T extends ChannelsMsg = ChannelsMsg,
> {
  id: string
  connectTo: string
  onEvent?: ChannelsEventHandler<T>
  onStatusUpdate?: (status: ChannelsConnectionStatus) => void
}

/**
 * @internal
 */
export interface ChannelsSubscriberConnection {
  id: string | null
  buffer: ChannelsMsg[]
  origin: string | null
  status: ChannelsConnectionStatus
}

/**
 * @public
 */
export interface ChannelsSubscriber<T extends ChannelsMsg = ChannelsMsg> {
  destroy: () => void
  inFrame: boolean
  send: (...args: ToArgs<T>) => void
}
