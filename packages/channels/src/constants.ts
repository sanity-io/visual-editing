import type { MsgType } from './types'

export const RESPONSE_TIMEOUT = 1000
export const HEARTBEAT_INTERVAL = 3000

export const INTERNAL_MSG_TYPES = [
  'channel/disconnect',
  'channel/response',
] satisfies MsgType[]

export const HANDSHAKE_MSG_TYPES = [
  'handshake/syn',
  'handshake/syn-ack',
  'handshake/ack',
] satisfies MsgType[]

export const HEARTBEAT_MSG_TYPES = ['channel/heartbeat'] satisfies MsgType[]
