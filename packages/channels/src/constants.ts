import type {ChannelMsgType} from './types'

export const RESPONSE_TIMEOUT = 1000
export const HEARTBEAT_INTERVAL = 1000
export const HANDSHAKE_INTERVAL = 500

export const INTERNAL_MSG_TYPES = [
  'channel/disconnect',
  'channel/response',
  'channel/heartbeat',
] satisfies ChannelMsgType[]

export const HANDSHAKE_MSG_TYPES = [
  'handshake/syn',
  'handshake/syn-ack',
  'handshake/ack',
] satisfies ChannelMsgType[]

export const CHANNELS_DOMAIN = 'sanity/channels'
