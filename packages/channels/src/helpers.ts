import { HANDSHAKE_MSG_TYPES, INTERNAL_MSG_TYPES } from './constants'
import { ChannelsMsgType, HandshakeMsgType, InternalMsgType } from './types'

export const isInternalMessage = (
  type: ChannelsMsgType | InternalMsgType,
): type is InternalMsgType => {
  return INTERNAL_MSG_TYPES.some((t) => t === type)
}

export const isHandshakeMessage = (
  type: ChannelsMsgType | InternalMsgType,
): type is HandshakeMsgType => {
  return HANDSHAKE_MSG_TYPES.some((t) => t === type)
}
