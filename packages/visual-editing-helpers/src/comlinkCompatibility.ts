import {
  createListenLogic,
  createRequestMachine,
  DOMAIN,
  type InternalMessageType,
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

import type {
  LoaderControllerMsg,
  LoaderNodeMsg,
  PreviewKitNodeMsg,
  VisualEditingControllerMsg,
  VisualEditingNodeMsg,
} from './types'

type NewDataType =
  | InternalMessageType
  | (
      | LoaderControllerMsg
      | LoaderNodeMsg
      | PreviewKitNodeMsg
      | VisualEditingControllerMsg
      | VisualEditingNodeMsg
    )['type']

type LegacyDataType =
  | 'handshake/syn'
  | 'handshake/syn-ack'
  | 'handshake/ack'
  | 'channel/response'
  | 'channel/heartbeat'
  | 'channel/disconnect'
  | 'overlay/focus'
  | 'overlay/navigate'
  | 'overlay/toggle'
  | 'presentation/toggleOverlay'

const legacyToNewTypeMap: {[key in LegacyDataType]?: NewDataType} = {
  'handshake/syn': MSG_HANDSHAKE_SYN,
  'handshake/syn-ack': MSG_HANDSHAKE_SYN_ACK,
  'handshake/ack': MSG_HANDSHAKE_ACK,
  'channel/response': MSG_RESPONSE,
  'channel/heartbeat': MSG_HEARTBEAT,
  'channel/disconnect': MSG_DISCONNECT,
  'overlay/focus': 'visual-editing/focus',
  'overlay/navigate': 'visual-editing/navigate',
  'overlay/toggle': 'visual-editing/toggle',
  'presentation/toggleOverlay': 'presentation/toggle-overlay',
}

const newToLegacyTypeMap: {[key in NewDataType]?: LegacyDataType} = {
  [MSG_HANDSHAKE_SYN]: 'handshake/syn',
  [MSG_HANDSHAKE_SYN_ACK]: 'handshake/syn-ack',
  [MSG_HANDSHAKE_ACK]: 'handshake/ack',
  [MSG_RESPONSE]: 'channel/response',
  [MSG_HEARTBEAT]: 'channel/heartbeat',
  [MSG_DISCONNECT]: 'channel/disconnect',
  'visual-editing/focus': 'overlay/focus',
  'visual-editing/navigate': 'overlay/navigate',
  'visual-editing/toggle': 'overlay/toggle',
  'presentation/toggle-overlay': 'presentation/toggleOverlay',
}

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

    data.type = legacyToNewTypeMap[data.type as LegacyDataType] ?? data.type
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

  message.type = newToLegacyTypeMap[message.type as NewDataType] ?? message.type

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
