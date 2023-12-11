import { HANDSHAKE_MSG_TYPES, INTERNAL_MSG_TYPES } from './constants'
import { ChannelMsgType, HandshakeMsgType, InternalMsgType } from './types'

export const isInternalMessage = (
  type: ChannelMsgType | InternalMsgType,
): type is InternalMsgType => {
  return INTERNAL_MSG_TYPES.some((t) => t === type)
}

export const isHandshakeMessage = (
  type: ChannelMsgType | InternalMsgType,
): type is HandshakeMsgType => {
  return HANDSHAKE_MSG_TYPES.some((t) => t === type)
}
