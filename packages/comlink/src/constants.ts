import type {MessageType} from './types'

/** @internal */
export const DOMAIN = 'sanity/channels'

/** @internal */
export const RESPONSE_TIMEOUT = 1000

/** @internal */
export const HEARTBEAT_INTERVAL = 1000

/** @internal */
export const HANDSHAKE_INTERVAL = 500

/**
 * @public
 */
export const MSG_RESPONSE = 'channel/response'

/**
 * @public
 */
export const MSG_HEARTBEAT = 'channel/heartbeat'

/** @internal */
export const MSG_DISCONNECT = 'channel/disconnect'

/** @internal */
export const MSG_HANDSHAKE_SYN = 'channel/handshake/syn'

/** @internal */
export const MSG_HANDSHAKE_SYN_ACK = 'channel/handshake/syn-ack'

/** @internal */
export const MSG_HANDSHAKE_ACK = 'channel/handshake/ack'

/** @internal */
export const HANDSHAKE_MSG_TYPES = [
  MSG_HANDSHAKE_SYN,
  MSG_HANDSHAKE_SYN_ACK,
  MSG_HANDSHAKE_ACK,
] satisfies MessageType[]

/** @internal */
export const INTERNAL_MSG_TYPES = [
  MSG_RESPONSE,
  MSG_DISCONNECT,
  MSG_HEARTBEAT,
  ...HANDSHAKE_MSG_TYPES,
] satisfies MessageType[]
