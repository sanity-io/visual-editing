import {v4 as uuid} from 'uuid'

import {CHANNELS_DOMAIN, RESPONSE_TIMEOUT} from './constants'
import {isHandshakeMessage, isInternalMessage, isLegacyHandshakeMessage} from './helpers'
import type {
  ChannelMsg,
  ChannelsNodeAPI,
  ChannelsNodeHandler,
  ChannelsNodeHandlerMap,
  ChannelsStatusHandler,
  ChannelStatus,
  Narrow,
  ProtocolMsg,
} from './types'

export class ChannelsNode<
  API extends ChannelsNodeAPI,
  Sends extends ChannelMsg = API['sends'],
  Receives extends ChannelMsg = API['receives'],
> {
  private connectionId: string | null = null
  private origin: string | null = null
  private source: MessageEventSource | null = null
  private status: ChannelStatus = 'connecting'
  private eventHandlers: ChannelsNodeHandlerMap<Receives> = new Map()
  private statusHandlers: Set<ChannelsStatusHandler> = new Set()
  private buffer: Array<
    ChannelMsg & {
      method: 'post' | 'fetch'
      resolvable?: PromiseWithResolvers<NonNullable<Narrow<Sends['type'], Sends>['response']>>
    }
  > = []
  private nodeId: API['id']
  private controllerId: API['controllerId']
  public inFrame = window.self !== window.top || window.opener

  constructor(config: {id: API['id']; connectTo: API['controllerId']}) {
    this.nodeId = config.id
    this.controllerId = config.connectTo
    window.addEventListener('message', this.handleEvent.bind(this), false)
  }

  private isValidMessageEvent(e: MessageEvent): e is MessageEvent<ProtocolMsg<Receives>> {
    const {data} = e
    return (
      data.domain === CHANNELS_DOMAIN &&
      data.to === this.nodeId &&
      data.from === this.controllerId &&
      data.type !== 'channel/response'
    )
  }

  private flush() {
    const toFlush = [...this.buffer]
    this.buffer.splice(0, this.buffer.length)
    toFlush.forEach(({type, data, method, resolvable}) => {
      this[method](type, data, resolvable)
    })
  }

  private connect() {
    this.setStatus('connecting')
    this.post('handshake/syn-ack', {id: this.connectionId})
  }

  private connected() {
    this.setStatus('connected')
    this.flush()
  }

  private disconnect() {
    this.setStatus('disconnected')
  }

  private setStatus(next: ChannelStatus) {
    this.status = next
    this.statusHandlers.forEach((handler) => {
      handler(next)
    })
  }

  private handleHandshake(e: MessageEvent<ProtocolMsg<Receives>>) {
    const {data} = e
    if (!data.data) {
      throw new Error('No data')
    }
    if (data.type === 'handshake/syn') {
      this.origin = e.origin
      // @todo no casting
      this.connectionId = data.data['id'] as string
      this.connect()
      return
    }
    if (data.type === 'handshake/ack' && data.data['id'] === this.connectionId) {
      this.connected()
      return
    }
  }

  private handleMessage(data: ProtocolMsg<Receives>) {
    if (data.type === 'channel/disconnect') {
      this.disconnect()
      return
    }
    const type = data.type.split('/').slice(1).join('/')
    const handler = this.eventHandlers.get(type)
    if (handler) {
      handler.handler(data.data)
    }
    this.post('channel/response', {responseTo: data.id})
  }

  private handleEvent(e: MessageEvent): void {
    if (isLegacyHandshakeMessage(e)) {
      // eslint-disable-next-line no-console
      console.error(
        'Visual editing package mismatch detected! Please ensure you are using the latest version of Sanity Studio and any packages listed here:\nhttps://github.com/sanity-io/visual-editing',
      )
      return
    }

    if (!this.isValidMessageEvent(e)) {
      return
    }

    const {data} = e

    // Once we know the origin, after a valid handshake, we always verify it
    if (this.origin && e.origin !== this.origin) {
      return
    }
    // Always update the channel source reference, in case it changes
    if (e.source && this.source !== e.source) {
      this.source = e.source
    }

    if (isHandshakeMessage(data.type) && data.data) {
      this.handleHandshake(e)
      return
    }

    if (data.connectionId === this.connectionId && e.origin === this.origin) {
      this.handleMessage(data)
    }
  }

  public on<T extends Receives['type']>(type: T, handler: ChannelsNodeHandler<T, Receives>) {
    if (this.eventHandlers.has(type)) {
      throw new Error('Already set')
    }
    this.eventHandlers.set(type, {type, handler})
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
    const isHandshake = isHandshakeMessage(type)
    const isInternal = isInternalMessage(type)

    if (
      !isHandshake &&
      !isInternal &&
      (this.status === 'connecting' || this.status === 'reconnecting')
    ) {
      return true
    }
    return false
  }

  private createMessage<T extends Sends['type']>(type: T, data: Narrow<T, Sends>['data']) {
    const id = `msg-${uuid()}`
    const isHandshake = isHandshakeMessage(type)
    const isInternal = isInternalMessage(type)

    if (this.connectionId && this.source && this.origin) {
      const msg = {
        connectionId: this.connectionId,
        data,
        domain: CHANNELS_DOMAIN,
        from: this.nodeId,
        id,
        to: this.controllerId,
        type: isInternal || isHandshake ? type : `${this.nodeId}/${type}`,
      } satisfies ProtocolMsg
      return msg
    }

    return undefined
  }

  public post<T extends Sends['type']>(type: T, data: Narrow<T, Sends>['data']): void {
    if (this.shouldBuffer(type)) {
      this.buffer.push({type, data, method: 'post'})
      return
    }

    const msg = this.createMessage(type, data)
    if (msg) {
      try {
        this.source!.postMessage(msg, {targetOrigin: this.origin!})
      } catch (e) {
        throw new Error(`Failed to postMessage '${msg.id}' on '${this.nodeId}'`)
      }
    }
  }

  public fetch<T extends Sends['type']>(
    type: T,
    data: Narrow<T, Sends>['data'],
    resolvable?: PromiseWithResolvers<NonNullable<Narrow<T, Sends>['response']>>,
  ): Promise<NonNullable<Narrow<T, Sends>['response']>> {
    const resolvablePromise = resolvable
      ? resolvable
      : Promise.withResolvers<NonNullable<Narrow<T, Sends>['response']>>()

    if (this.shouldBuffer(type)) {
      this.buffer.push({type, data, method: 'fetch', resolvable: resolvablePromise})
      return resolvablePromise.promise
    }

    const msg = this.createMessage(type, data)
    if (msg) {
      const maxWait = setTimeout(() => {
        // The channel may have changed, so only reject if the IDs match
        if (msg.connectionId === this.connectionId) {
          // Cleanup the transaction listener
          window.removeEventListener('message', transact, false)
          // eslint-disable-next-line no-console
          console.warn(
            `Received no response to message '${msg.type}' on client '${this.connectionId}' (ID: '${msg.id}').`,
          )
        }
      }, RESPONSE_TIMEOUT)

      const transact = (e: MessageEvent<ProtocolMsg<NonNullable<Narrow<T, Sends>>>>) => {
        const {data: eventData} = e
        if (
          (e.source === this.source,
          eventData.type === 'channel/response' && eventData?.['responseTo'] === msg.id)
        ) {
          this.post('channel/response', {responseTo: eventData.id})
          window.removeEventListener('message', transact, false)
          clearTimeout(maxWait)
          resolvablePromise.resolve(eventData.data!)
        }
      }
      window.addEventListener('message', transact, false)

      try {
        this.source!.postMessage(msg, {targetOrigin: this.origin!})
      } catch (e) {
        throw new Error(`Failed to postMessage '${msg.id}' on '${this.nodeId}'`)
      }
    }
    return resolvablePromise.promise
  }

  public destroy(): void {
    this.disconnect()
    this.eventHandlers.clear()
    this.statusHandlers.clear()
    window.removeEventListener('message', this.handleEvent.bind(this), false)
  }
}
