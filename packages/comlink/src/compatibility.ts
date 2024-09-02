// @TODO Move this to visual-editing-helpers
import {
  DOMAIN,
  MSG_HANDSHAKE_ACK,
  MSG_HANDSHAKE_SYN,
  MSG_HANDSHAKE_SYN_ACK,
  MSG_HEARTBEAT,
  MSG_RESPONSE,
} from './constants'
import type {RequestMachineContext} from './request'
import type {Message, ProtocolMessage} from './types'

export const convertEventToNewFormat = (
  event: MessageEvent<ProtocolMessage>,
): MessageEvent<ProtocolMessage> => {
  const {data} = event

  if (data && 'domain' in data && 'type' in data && 'from' in data && 'to' in data) {
    if (data.domain === 'sanity/channels') {
      data.domain = DOMAIN
    }
    // Types
    if (data.type === 'handshake/syn') {
      data.type = MSG_HANDSHAKE_SYN
    } else if (data.type === 'handshake/syn-ack') {
      data.type = MSG_HANDSHAKE_SYN_ACK
    } else if (data.type === 'handshake/ack') {
      data.type = MSG_HANDSHAKE_ACK
    } else if (data.type === 'channel/response') {
      data.type = MSG_RESPONSE
    } else if (data.type === 'channel/heartbeat') {
      data.type = MSG_HEARTBEAT
    }
    return event
  }
  return event
}

export const convertMessageToLegacyFormat = (message: ProtocolMessage): ProtocolMessage => {
  // Domain
  if (message.domain === DOMAIN) {
    message.domain = 'sanity/channels'
  }
  // Types
  if (message.type === MSG_HANDSHAKE_SYN) {
    message.type = 'handshake/syn'
  } else if (message.type === MSG_HANDSHAKE_SYN_ACK) {
    message.type = 'handshake/syn-ack'
  } else if (message.type === MSG_HANDSHAKE_ACK) {
    message.type = 'handshake/ack'
  } else if (message.type === MSG_RESPONSE) {
    message.type = 'channel/response'
  } else if (message.type === MSG_HEARTBEAT) {
    message.type = 'channel/heartbeat'
  }

  return message
}

export const sendMessageInLegacyFormat = <S extends Message>(
  {context}: {context: RequestMachineContext<S>},
  params: {message: ProtocolMessage},
): void => {
  const {sources, origin} = context

  const message = convertMessageToLegacyFormat(params.message)

  sources.forEach((source) => {
    source.postMessage(message, {targetOrigin: origin})
  })
}
