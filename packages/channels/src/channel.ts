import {v4 as uuid} from 'uuid'

import {
  DOMAIN,
  HANDSHAKE_INTERVAL,
  HEARTBEAT_INTERVAL,
  MSG_DISCONNECT,
  MSG_HANDSHAKE_ACK,
  MSG_HANDSHAKE_SYN,
  MSG_HANDSHAKE_SYN_ACK,
  MSG_HEARTBEAT,
  MSG_RESPONSE,
  RESPONSE_TIMEOUT,
} from './constants'
import type {ChannelsController} from './controller'
import {isHandshakeMessage, isInternalMessage} from './helpers'
import type {
  ChannelMsg,
  ChannelsChannelHandler,
  ChannelsChannelHandlerMap,
  ChannelsControllerAPI,
  ChannelsInternalMsg,
  ChannelsStatusHandler,
  ChannelStatus,
  HandshakeSynAckMsg,
  Narrow,
  ProtocolMsg,
} from './types'

export class ChannelsChannel<
  API extends ChannelsControllerAPI,
  ID extends string = API['nodes']['id'],
  Receives extends ChannelMsg = Extract<API['nodes'], {id: ID}>['message'],
  Sends extends ChannelMsg = API['sends'],
> {
  public connectionId: string | null = null
  public status: ChannelStatus = 'connecting'
  private buffer: Array<ChannelMsg> = []
  private heartbeat: number | undefined = undefined
  private interval: number | undefined = undefined
  private eventHandlers: ChannelsChannelHandlerMap<Receives> = new Map()
  private statusHandlers: Set<ChannelsStatusHandler> = new Set()
  private handler: typeof this.handleMessage | typeof this.handleHandshake = this.handleHandshake

  constructor(
    public config: {
      nodeId: API['nodes']['id']
      controller: ChannelsController<API>
      heartbeat?: boolean | number
    },
  ) {
    this.connect()
  }

  private connect(reconnection = false) {
    this.setStatus(reconnection ? 'reconnecting' : 'connecting')
    this.handler = this.handleHandshake
    this.stopHeartbeat()
    this.startHandshake()
  }

  private connected() {
    if (!(this.status === 'connecting' || this.status === 'reconnecting')) {
      throw new Error('Incorrect connection flow')
    }
    this.setStatus('connected')
    this.handler = this.handleMessage
    this.stopHandshake()
    this.startHeartbeat()
    this.flush()
  }

  private disconnect() {
    this.postInternal(MSG_DISCONNECT, {id: this.connectionId})
    this.setStatus('disconnected')
    this.connectionId = null
    this.handler = this.handleHandshake
    this.stopHandshake()
    this.stopHeartbeat()
  }

  private startHandshake(): void {
    this.connectionId = `cnx-${uuid()}`
    this.interval = window.setInterval(() => {
      this.postInternal(MSG_HANDSHAKE_SYN, {id: this.connectionId!})
    }, HANDSHAKE_INTERVAL)
  }

  private stopHandshake(): void {
    window.clearInterval(this.interval)
  }

  // @todo should the typing be so prescriptive here, as we can't be sure the
  // message is a handshake message
  private handleHandshake(e: MessageEvent<ProtocolMsg<HandshakeSynAckMsg>>): void {
    const {data} = e
    if (data.type === MSG_HANDSHAKE_SYN_ACK) {
      this.connected()
      this.postInternal(MSG_HANDSHAKE_ACK, {id: this.connectionId!})
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    if (this.heartbeat) {
      const {heartbeat} = this.config
      const heartbeatInverval = typeof heartbeat === 'number' ? heartbeat : HEARTBEAT_INTERVAL
      this.heartbeat = window.setInterval(() => {
        this.postInternal(MSG_HEARTBEAT, undefined)
      }, heartbeatInverval)
    }
  }

  private stopHeartbeat(): void {
    window.clearInterval(this.heartbeat)
  }

  private flush(): void {
    const toFlush = [...this.buffer]
    this.buffer.splice(0, this.buffer.length)
    toFlush.forEach(({type, data}) => {
      this.post(type, data)
    })
  }

  public destroy(): void {
    this.eventHandlers.clear()
    this.statusHandlers.clear()
    this.disconnect()
    this.stopHeartbeat()
    this.stopHandshake()
    this.config.controller.connections.delete(this.config.nodeId)
  }

  private setStatus(next: ChannelStatus) {
    this.status = next
    this.statusHandlers.forEach((handler) => {
      handler(next)
    })
  }

  public on<T extends Receives['type']>(type: T, handler: ChannelsChannelHandler<T, Receives>) {
    if (this.eventHandlers.has(type)) {
      throw new Error('Already set')
    }
    this.eventHandlers.set(type, handler)
    return (): void => {
      this.eventHandlers.delete(type)
    }
  }

  public onStatus(handler: ChannelsStatusHandler) {
    this.statusHandlers.add(handler)
    return (): void => {
      this.statusHandlers.delete(handler)
    }
  }

  private shouldBuffer(type: string) {
    if (
      !isInternalMessage(type) &&
      (this.status === 'connecting' || this.status === 'reconnecting')
    ) {
      return true
    }
    return false
  }

  private createMessage<T extends Sends['type']>(
    type: T,
    data: Narrow<T, Sends>['data'],
    responseTo?: string,
  ) {
    const {
      connectionId,
      config: {controller, nodeId},
    } = this

    if (!connectionId) {
      throw new Error('No connection ID set')
    }

    const msg = {
      connectionId,
      data,
      domain: DOMAIN,
      from: controller.id,
      id: `msg-${uuid()}`,
      to: nodeId,
      type: isInternalMessage(type) ? type : `${controller.id}/${type}`,
      responseTo,
    } satisfies ProtocolMsg

    return msg
  }

  private async handleMessage(e: MessageEvent<ProtocolMsg<Receives>>): Promise<void> {
    const type = e.data.type.split('/').slice(1).join('/')
    const handler = this.eventHandlers.get(type)
    if (handler) {
      const response = await handler(e.data.data)
      if (response) {
        this.postInternal(MSG_RESPONSE, response, e.data.id)
      }
    }
  }

  private postInternal<T extends ChannelsInternalMsg, U extends T['type']>(
    type: U,
    data: Narrow<U, T>['data'],
    responseTo?: string,
  ): void {
    this.post(type, data, responseTo)
  }

  public post<T extends Sends, U extends T['type']>(
    type: U,
    data: Narrow<U, T>['data'],
    responseTo?: string,
  ): void {
    const {sources, targetOrigin} = this.config.controller
    if (sources.size === 0) {
      throw new Error('Add a source before sending')
    }

    if (this.shouldBuffer(type)) {
      this.buffer.push({type, data})
      return
    }

    if (!this.connectionId) {
      // @todo do we want to throw here, or just return? we've pushed to the buffer, so it's not lost
      throw new Error('No channel ID set')
    }

    const msg = this.createMessage(type, data, responseTo)

    const isHandshake = isHandshakeMessage(type)
    const expectResponse = !isHandshake && type !== MSG_RESPONSE

    if (expectResponse) {
      const maxWait = setTimeout(() => {
        // The channel may have changed, so only reject if the IDs match
        if (msg.connectionId === this.connectionId) {
          // Cleanup the transaction listener
          window.removeEventListener('message', transact, false)
          // Push the message to the buffer
          if (type !== MSG_HEARTBEAT) {
            this.buffer.push({type, data})
          }
          // Try to reconnect
          this.connect(true)
          // eslint-disable-next-line no-console
          console.warn(
            `Received no response to message '${msg.type}' on client '${this.connectionId}' (ID: '${msg.id}').`,
            msg,
          )
        }
      }, RESPONSE_TIMEOUT)

      let remainingResponseCount = sources.size
      // @todo should this be MessageEvent<unknown>?
      const transact = (e: MessageEvent) => {
        const {data: eventData} = e
        if (
          e.source &&
          sources.has(e.source) &&
          eventData.type === MSG_RESPONSE &&
          eventData['responseTo'] === msg.id
        ) {
          --remainingResponseCount
        }
        if (remainingResponseCount === 0) {
          window.removeEventListener('message', transact, false)
          clearTimeout(maxWait)
        }
      }

      window.addEventListener('message', transact, false)
    }

    sources.forEach((source) => {
      source.postMessage(msg, {
        targetOrigin: isHandshake ? '*' : targetOrigin,
      })
    })
  }

  public handleEvent(e: MessageEvent): void {
    this.handler(e)
  }
}
