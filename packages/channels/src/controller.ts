import {ChannelsChannel} from './channel'
import {CHANNELS_DOMAIN} from './constants'
import type {ChannelMsg, ChannelsControllerAPI, ProtocolMsg} from './types'

export class ChannelsController<
  API extends ChannelsControllerAPI,
  Receives extends ChannelMsg = API['nodes']['message'],
> {
  public sources: Set<MessageEventSource> = new Set()
  public connections: Map<string, ChannelsChannel<API>> = new Map()
  public id: API['id']
  public targetOrigin: string

  constructor(config: {id: string; targetOrigin: string}) {
    this.id = config.id
    this.targetOrigin = config.targetOrigin
    window.addEventListener('message', this.handleEvent.bind(this), false)
  }

  public addSource(source: MessageEventSource): void {
    if (this.sources.has(source)) {
      return
    }
    if (!('closed' in source)) {
      // eslint-disable-next-line no-console
      console.warn('Source is unsupported', {source})
      throw new Error('Source is unsupported')
    }
    if (source.closed) {
      throw new Error('Source is closed')
    }
    this.sources.add(source)
  }

  public removeSource(source: MessageEventSource): void {
    this.sources.delete(source)
  }

  public createChannel<ID extends API['nodes']['id']>(config: {
    id: ID
    heartbeat?: boolean | number
  }): {
    channel: ChannelsChannel<API, ID>
    remove: () => void
  } {
    const {id} = config
    if (this.connections.has(id)) {
      throw new Error('Connection already exists')
    }
    const channel = new ChannelsChannel<API, ID>({
      nodeId: config.id,
      controller: this,
      heartbeat: config.heartbeat,
    })
    this.connections.set(id, channel)
    return {
      channel,
      remove: () => {
        this.removeConnection(id)
      },
    }
  }

  public removeConnection(id: string): void {
    this.connections.get(id)?.destroy()
    this.connections.delete(id)
  }

  private isValidMessageEvent(e: MessageEvent): e is MessageEvent<ProtocolMsg<Receives>> {
    const {data, origin} = e
    return (
      data.domain === CHANNELS_DOMAIN &&
      data.to == this.id &&
      this.connections.has(data.from) &&
      data.type !== 'channel/response' &&
      origin === this.targetOrigin
    )
  }

  private handleEvent(e: MessageEvent<unknown>): void {
    if (this.isValidMessageEvent(e)) {
      this.connections.get(e.data.from)!.handleEvent(e)
    }
  }

  public destroy(): void {
    window.removeEventListener('message', this.handleEvent.bind(this), false)
    this.connections.forEach((connection) => {
      connection.destroy()
    })
  }
}
