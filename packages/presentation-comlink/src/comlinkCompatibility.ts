import {
  createListenLogic,
  createRequestMachine,
  DOMAIN,
  MSG_DISCONNECT,
  MSG_HANDSHAKE_ACK,
  MSG_HANDSHAKE_SYN,
  MSG_HANDSHAKE_SYN_ACK,
  MSG_HEARTBEAT,
  MSG_RESPONSE,
  type InternalMessageType,
  type Message,
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

type ComlinkMessageType =
  | InternalMessageType
  | (
      | LoaderControllerMsg
      | LoaderNodeMsg
      | PreviewKitNodeMsg
      | VisualEditingControllerMsg
      | VisualEditingNodeMsg
    )['type']

type ChannelsMessageType =
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

const channelsToComlinkMap: {[key in ChannelsMessageType]: ComlinkMessageType} = {
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

const comlinkToChannelsMap: {[key in ComlinkMessageType]?: ChannelsMessageType} = {
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

type ChannelMsg = Omit<ProtocolMessage, 'channelId'> & {connectionId: string}

const convertToComlinkEvent = (event: MessageEvent): MessageEvent<ProtocolMessage> => {
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

    data.channelId = data.connectionId
    delete data.connectionId

    data.type = channelsToComlinkMap[data.type as ChannelsMessageType] ?? data.type
  }

  return event
}

const convertToChannelsMessage = (comlinkMessage: ProtocolMessage): ChannelMsg => {
  const {channelId, ...rest} = comlinkMessage
  const message = {...rest, connectionId: channelId} as ChannelMsg

  if (message.domain === DOMAIN) {
    message.domain = 'sanity/channels'
  }

  if (message.to === 'visual-editing') {
    message.to = 'overlays'
  }

  if (message.from === 'visual-editing') {
    message.from = 'overlays'
  }

  message.type = comlinkToChannelsMap[message.type as ComlinkMessageType] ?? message.type

  if (message.type === 'channel/response' && message.responseTo && !message.data) {
    message.data = {responseTo: message.responseTo}
  }

  if (
    message.type === 'handshake/syn' ||
    message.type === 'handshake/syn-ack' ||
    message.type === 'handshake/ack'
  ) {
    message.data = {id: message.connectionId}
  }

  return message
}

const sendAsChannelsMessage = <S extends Message>(
  {context}: {context: RequestMachineContext<S>},
  params: {message: ProtocolMessage},
): void => {
  const {sources, targetOrigin} = context

  const message = convertToChannelsMessage(params.message)

  sources.forEach((source) => {
    source.postMessage(message, {targetOrigin})
  })
}

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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createCompatibilityActors = <T extends Message>() => ({
  listen: createListenLogic(convertToComlinkEvent),
  requestMachine: createRequestMachine<T>().provide({
    actions: {
      'send message': sendAsChannelsMessage,
    },
  }),
})
