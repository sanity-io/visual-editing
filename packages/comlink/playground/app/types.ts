import type {ProtocolMessage, WithoutResponse} from '@sanity/comlink'

export interface ControllerMessage {
  type: 'controller'
  data: {message: string}
}

export type NodeMessage =
  | {
      type: 'node'
      data: {message: string}
      response: {message: string}
    }
  | {
      type: 'foo'
      data: {message: string}
      response: {foo: string}
    }

export type PlaygroundMessage = ControllerMessage | NodeMessage

export type RenderedMessage =
  | WithoutResponse<PlaygroundMessage>
  | ProtocolMessage<WithoutResponse<PlaygroundMessage>>
