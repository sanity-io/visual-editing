import {
  createListenLogic,
  createRequestMachine,
  DOMAIN,
  type Message,
  MSG_DISCONNECT,
  MSG_HANDSHAKE_ACK,
  MSG_HANDSHAKE_SYN,
  MSG_HANDSHAKE_SYN_ACK,
  MSG_HEARTBEAT,
  MSG_RESPONSE,
  type ProtocolMessage,
  type RequestMachineContext,
} from '@sanity/comlink'

const convertEventToNewFormat = (
  event: MessageEvent<ProtocolMessage>,
): MessageEvent<ProtocolMessage> => {
  const {data} = event

  if (
    data &&
    typeof data === 'object' &&
    'domain' in data &&
    'type' in data &&
    'from' in data &&
    'to' in data
  ) {
    if (data.domain === 'sanity/channels') {
      data.domain = DOMAIN
    }

    if (data.to === 'overlays') {
      data.to = 'visual-editing'
    }

    if (data.from === 'overlays') {
      data.from = 'visual-editing'
    }

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
    } else if (data.type === 'channel/disconnect') {
      data.type = MSG_DISCONNECT
    } else if (data.type === 'overlay/focus') {
      data.type = 'visual-editing/focus'
    } else if (data.type === 'overlay/navigate') {
      data.type = 'visual-editing/navigate'
    } else if (data.type === 'overlay/toggle') {
      data.type = 'visual-editing/toggle'
    }
  }

  return event
}

const convertMessageToLegacyFormat = (message: ProtocolMessage): ProtocolMessage => {
  if (message.domain === DOMAIN) {
    message.domain = 'sanity/channels'
  }

  if (message.to === 'visual-editing') {
    message.to = 'overlays'
  }

  if (message.from === 'visual-editing') {
    message.from = 'overlays'
  }

  if (message.type === MSG_HANDSHAKE_SYN) {
    message.type = 'handshake/syn'
  } else if (message.type === MSG_HANDSHAKE_SYN_ACK) {
    message.type = 'handshake/syn-ack'
  } else if (message.type === MSG_HANDSHAKE_ACK) {
    message.type = 'handshake/ack'
  } else if (message.type === MSG_RESPONSE) {
    message.type = 'channel/response'
    message.data = {responseTo: message.responseTo}
  } else if (message.type === MSG_HEARTBEAT) {
    message.type = 'channel/heartbeat'
  } else if (message.type === MSG_DISCONNECT) {
    message.type = 'channel/disconnect'
  } else if (message.type === 'visual-editing/focus') {
    message.type = 'overlay/focus'
  } else if (message.type === 'visual-editing/navigate') {
    message.type = 'overlay/navigate'
  } else if (message.type === 'visual-editing/toggle') {
    message.type = 'overlay/toggle'
  }

  return message
}

const sendMessageInLegacyFormat = <S extends Message>(
  {context}: {context: RequestMachineContext<S>},
  params: {message: ProtocolMessage},
): void => {
  const {sources, targetOrigin} = context

  const message = convertMessageToLegacyFormat(params.message)

  sources.forEach((source) => {
    source.postMessage(message, {targetOrigin})
  })
}

// @todo Why is this necessary?
export {
  type ListenInput,
  type Message,
  type MessageData,
  type MessageType,
  MSG_RESPONSE,
  type ProtocolMessage,
  type RequestMachineContext,
  type ResponseMessage,
} from '@sanity/comlink'

export const createCompatibilityActors = <
  T extends Message,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
>() => ({
  listen: createListenLogic(convertEventToNewFormat),
  requestMachine: createRequestMachine<T>().provide({
    actions: {
      'send message': sendMessageInLegacyFormat,
    },
  }),
})
