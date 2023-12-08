import { v4 as uuid } from 'uuid'

import { isHandshakeMessage } from './helpers'
import {
  ChannelsConnectionStatus,
  ChannelsMsg,
  ChannelsMsgData,
  ChannelsMsgType,
  ChannelsSubscriber,
  ChannelsSubscriberConnection,
  ChannelsSubscriberOptions,
  ProtocolMsg,
  ToArgs,
} from './types'

export function createChannelsSubscriber<T extends ChannelsMsg>(
  config: ChannelsSubscriberOptions<T>,
): ChannelsSubscriber<T> {
  const inFrame = window.self !== window.top

  const connection: ChannelsSubscriberConnection = {
    id: null,
    status: 'fresh',
    origin: null,
  }

  async function send(type: ChannelsMsgType, data?: ChannelsMsgData) {
    if (connection.id && connection.origin) {
      const msg: ProtocolMsg<T> = {
        connectionId: connection.id,
        data,
        domain: 'sanity/channels',
        from: config.id,
        id: uuid(),
        to: config.connectTo,
        type,
      }
      parent.postMessage(msg, {
        targetOrigin: connection.origin,
      })
    }
  }

  function isValidMessageEvent(
    e: MessageEvent,
  ): e is MessageEvent<ProtocolMsg<T>> {
    const { data } = e
    return (
      data.domain === 'sanity/channels' &&
      data.to === config.id &&
      data.from === config.connectTo &&
      data.type !== 'channel/response'
    )
  }

  function handleEvents(e: MessageEvent) {
    if (isValidMessageEvent(e)) {
      const { data } = e
      if (isHandshakeMessage(data.type) && data.data) {
        if (data.type === 'handshake/syn') {
          connection.origin = e.origin
          connection.id = data.data.id as string
          setConnectionStatus('connecting')
          send('handshake/syn-ack', { id: connection.id })
          return
        }
        if (data.type === 'handshake/ack' && data.data.id === connection.id) {
          setConnectionStatus('connected')
          return
        }
      } else if (
        data.connectionId === connection.id &&
        origin === connection.origin
      ) {
        if (data.type === 'channel/disconnect') {
          setConnectionStatus('disconnected')
          return
        } else {
          const args = [data.type, data.data] as ToArgs<T>
          config.handler?.(...args)
          send('channel/response', { responseTo: data.id })
        }
      }
    }
  }

  function disconnect() {
    if (['fresh', 'disconnected'].includes(connection.status)) return
    send('channel/disconnect', { id: connection.id })
    setConnectionStatus('disconnected')
  }

  function destroy() {
    disconnect()
    window.removeEventListener('message', handleEvents, false)
  }

  function setConnectionStatus(next: ChannelsConnectionStatus) {
    connection.status = next
    config?.onStatusUpdate?.(next)
  }

  window.addEventListener('message', handleEvents, false)
  setConnectionStatus('fresh')

  return {
    destroy,
    inFrame,
    send,
  }
}
