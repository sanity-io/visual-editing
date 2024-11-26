import type {MessageType} from './types'

/** @internal */
export const DOMAIN = 'sanity/comlink'

/** @internal */
export const RESPONSE_TIMEOUT_DEFAULT = 3_000

/** @internal */
export const FETCH_TIMEOUT_DEFAULT = 10_000

/** @internal */
export const HEARTBEAT_INTERVAL = 1000

/** @internal */
export const HANDSHAKE_INTERVAL = 500

/**
 * @public
 */
export const MSG_RESPONSE = 'comlink/response'

/**
 * @public
 */
export const MSG_HEARTBEAT = 'comlink/heartbeat'

/** @internal */
export const MSG_DISCONNECT = 'comlink/disconnect'

/** @internal */
export const MSG_HANDSHAKE_SYN = 'comlink/handshake/syn'

/** @internal */
export const MSG_HANDSHAKE_SYN_ACK = 'comlink/handshake/syn-ack'

/** @internal */
export const MSG_HANDSHAKE_ACK = 'comlink/handshake/ack'

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
