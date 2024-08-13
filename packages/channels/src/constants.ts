import type {ChannelMsgType} from './types'

export const DOMAIN = 'sanity/channels'

export const RESPONSE_TIMEOUT = 1000
export const HEARTBEAT_INTERVAL = 1000
export const HANDSHAKE_INTERVAL = 500

export const MSG_RESPONSE = 'channel/response'
export const MSG_DISCONNECT = 'channel/disconnect'
export const MSG_HEARTBEAT = 'channel/heartbeat'
export const MSG_HANDSHAKE_SYN = 'channel/handshake/syn'
export const MSG_HANDSHAKE_SYN_ACK = 'channel/handshake/syn-ack'
export const MSG_HANDSHAKE_ACK = 'channel/handshake/ack'

export const HANDSHAKE_MSG_TYPES = [
  MSG_HANDSHAKE_SYN,
  MSG_HANDSHAKE_SYN_ACK,
  MSG_HANDSHAKE_ACK,
] satisfies ChannelMsgType[]

export const INTERNAL_MSG_TYPES = [
  MSG_RESPONSE,
  MSG_DISCONNECT,
  MSG_HEARTBEAT,
  ...HANDSHAKE_MSG_TYPES,
] satisfies ChannelMsgType[]
