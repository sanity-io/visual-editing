import {v4 as uuid} from 'uuid'

import {
  CHANNELS_DOMAIN,
  HANDSHAKE_INTERVAL,
  HEARTBEAT_INTERVAL,
  RESPONSE_TIMEOUT,
} from './constants'
import type {ChannelsController} from './controller'
import {isHandshakeMessage} from './helpers'
import type {
  ChannelMsg,
  ChannelMsgData,
  ChannelsChannelHandler,
  ChannelsChannelHandlerMap,
  ChannelsChannelInternalMsg,
  ChannelsControllerAPI,
  ChannelsStatusHandler,
  ChannelStatus,
  HandshakeAckMsg,
  HandshakeSynAckMsg,
  HandshakeSynMsg,
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
    this._post('channel/disconnect', {id: this.connectionId})
    this.setStatus('disconnected')
    this.connectionId = null
    this.handler = this.handleHandshake
    this.stopHandshake()
    this.stopHeartbeat()
  }

  private startHandshake(): void {
    this.connectionId = `cnx-${uuid()}`
    this.interval = window.setInterval(() => {
      this.sendHandshake('syn', {id: this.connectionId!})
    }, HANDSHAKE_INTERVAL)
  }

  private stopHandshake(): void {
    window.clearInterval(this.interval)
  }

  private sendHandshake(type: 'syn' | 'ack', data: {id: string}): void {
    if (!this.connectionId) {
      throw new Error('No channel ID set')
    }

    const {controller, nodeId} = this.config

    const msg = {
      connectionId: this.connectionId,
      data,
      domain: CHANNELS_DOMAIN,
      from: controller.id,
      id: `msg-${uuid()}`,
      to: nodeId,
      type: `handshake/${type}`,
    } satisfies ProtocolMsg<HandshakeSynMsg | HandshakeAckMsg>

    try {
      controller.sources.forEach((source) => {
        source.postMessage(msg, {targetOrigin: '*'})
      })
    } catch (e) {
      throw new Error(`Failed to postMessage '${msg.id}' on '${this.connectionId}'`)
    }
  }

  // @todo should the typing be so prescriptive here, as we can't be sure the
  // message is a handshake message
  private handleHandshake(e: MessageEvent<ProtocolMsg<HandshakeSynAckMsg>>): void {
    const {data} = e
    if (isHandshakeMessage(data.type)) {
      if (data.type === 'handshake/syn-ack') {
        this.connected()
        this.sendHandshake('ack', {id: this.connectionId!})
      }
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    if (this.heartbeat) {
      const {heartbeat} = this.config
      const heartbeatInverval = typeof heartbeat === 'number' ? heartbeat : HEARTBEAT_INTERVAL
      this.heartbeat = window.setInterval(() => {
        this._post('channel/heartbeat', undefined)
      }, heartbeatInverval)
    }
  }

  private stopHeartbeat(): void {
    window.clearInterval(this.heartbeat)
  }

  private flush(): void {
    const toFlush = [...this.buffer]
    this.buffer.splice(0, this.buffer.length)
    toFlush.forEach((msg) => {
      this.postMessage(msg)
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

  private postResponse(data: ChannelMsgData, responseTo: string) {
    const {controller, nodeId} = this.config

    const msg = {
      connectionId: this.connectionId!,
      data,
      domain: CHANNELS_DOMAIN,
      from: controller.id,
      id: `msg-${uuid()}`,
      to: nodeId,
      type: 'channel/response',
      responseTo,
    } satisfies ProtocolMsg

    controller.sources.forEach((source) => {
      const {targetOrigin} = controller
      source.postMessage(msg, {targetOrigin})
    })
  }

  private postMessage<T extends ChannelMsg>(message: T): void {
    const {sources} = this.config.controller
    if (sources.size === 0) {
      throw new Error('Add a source before sending')
    }

    // If there is no active channel, push to the buffer
    if (
      this.status === 'connecting' ||
      this.status === 'reconnecting' ||
      this.status === 'disconnected'
    ) {
      this.buffer.push(message)
      return
    }

    if (!this.connectionId) {
      // @todo do we want to throw here, or just return? we've pushed to the buffer, so it's not lost
      throw new Error('No channel ID set')
    }

    const {controller, nodeId} = this.config
    const {data} = message

    const msg = {
      connectionId: this.connectionId,
      data,
      domain: CHANNELS_DOMAIN,
      from: controller.id,
      id: `msg-${uuid()}`,
      to: nodeId,
      type: `${controller.id}/${message.type}`,
    } satisfies ProtocolMsg

    const maxWait = setTimeout(() => {
      // The channel may have changed, so only reject if the IDs match
      if (msg.connectionId === this.connectionId) {
        // Cleanup the transaction listener
        window.removeEventListener('message', transact, false)
        // Push the message to the buffer
        if (message.type !== 'channel/heartbeat') {
          this.buffer.push(message)
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
        eventData.type === 'channel/response' &&
        eventData.data?.['responseTo'] === msg.id
      ) {
        --remainingResponseCount
      }
      if (remainingResponseCount === 0) {
        window.removeEventListener('message', transact, false)
        clearTimeout(maxWait)
      }
    }

    window.addEventListener('message', transact, false)

    sources.forEach((source) => {
      const {targetOrigin} = controller
      source.postMessage(msg, {targetOrigin})
    })
  }

  private async handleMessage(e: MessageEvent<ProtocolMsg<Receives>>): Promise<void> {
    const type = e.data.type.split('/').slice(1).join('/')
    const handler = this.eventHandlers.get(type)
    if (handler) {
      const response = await handler(e.data.data)
      if (response) {
        this.postResponse(response, e.data.id)
      }
    }
  }

  private _post<T extends ChannelsChannelInternalMsg, U extends T['type']>(
    type: U,
    data: Narrow<U, T>['data'],
  ): void {
    this.postMessage({type, data})
  }

  // Public facing, don't use internally
  public post<T extends Sends, U extends T['type']>(type: U, data: Narrow<U, T>['data']): void {
    this.postMessage({type, data})
  }

  public handleEvent(e: MessageEvent): void {
    this.handler(e)
  }
}
