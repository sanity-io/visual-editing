import { HANDSHAKE_MSG_TYPES, INTERNAL_MSG_TYPES } from './constants'
import type { HandshakeMsgType, InternalMsgType, MsgType } from './types'

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export const isInternalMessage = (
  type: MsgType | InternalMsgType,
): type is InternalMsgType => {
  return INTERNAL_MSG_TYPES.some((t) => t === type)
}

export const isHandshakeMessage = (
  type: MsgType | InternalMsgType,
): type is HandshakeMsgType => {
  return HANDSHAKE_MSG_TYPES.some((t) => t === type)
}

export const isHeartbeatMessage = (
  type: MsgType | InternalMsgType,
): type is 'channel/heartbeat' => {
  return type === 'channel/heartbeat'
}
