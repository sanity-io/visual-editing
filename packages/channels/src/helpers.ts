import {HANDSHAKE_MSG_TYPES, INTERNAL_MSG_TYPES} from './constants'
import type {ChannelMsgType, HandshakeMsgType, InternalMsgType} from './types'

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

export const isLegacyHandshakeMessage = ({data = {}}: MessageEvent): boolean => {
  return (
    // Check data is a record type
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    // The "domain" key was introduced in commit 4854e7f
    !('domain' in data) &&
    // Check the rest of the object shape is present
    ['id', 'type', 'from', 'to'].every((key) => key in data) &&
    // Prior to 4854e7f only handshake events were emitted prior to an established connection
    data.type.startsWith('handshake/')
  )
}
