import { INTERNAL_MSG_TYPES } from './constants'
import type { InternalMsgType, MsgType } from './types'

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export const isInternalMessage = (
  type: MsgType | InternalMsgType,
): type is InternalMsgType => {
  return INTERNAL_MSG_TYPES.some((t) => t === type)
}

export const isHandshake = (type: MsgType): boolean =>
  isInternalMessage(type) && type.startsWith('handshake/')
