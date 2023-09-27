import type { MsgType } from './types'

export const INTERNAL_MSG_TYPES = [
  'channel/disconnect',
  'channel/response',
  'handshake/syn',
  'handshake/syn-ack',
  'handshake/ack',
] satisfies MsgType[]
