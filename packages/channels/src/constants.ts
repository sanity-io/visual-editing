import type { ChannelsMsgType } from './types'

export const RESPONSE_TIMEOUT = 1000
export const HEARTBEAT_INTERVAL = 2000
export const HANDSHAKE_INTERVAL = 500

export const INTERNAL_MSG_TYPES = [
  'channel/disconnect',
  'channel/response',
  'channel/heartbeat',
] satisfies ChannelsMsgType[]

export const HANDSHAKE_MSG_TYPES = [
  'handshake/syn',
  'handshake/syn-ack',
  'handshake/ack',
] satisfies ChannelsMsgType[]
