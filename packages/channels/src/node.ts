import { v4 as uuid } from 'uuid'

import { isHandshakeMessage, isInternalMessage } from './helpers'
import {
  ChannelMsg,
  ChannelsNode,
  ChannelsNodeChannel,
  ChannelsNodeOptions,
  ChannelStatus,
  HandshakeMsgType,
  InternalMsgType,
  ProtocolMsg,
  ToArgs,
} from './types'

export function createChannelsNode<T extends ChannelMsg>(
  config: ChannelsNodeOptions<T>,
): ChannelsNode<T> {
  const inFrame = window.self !== window.top

  const channel: ChannelsNodeChannel = {
    buffer: [],
    id: null,
    origin: null,
    status: 'connecting',
  }

  function flush() {
    const toFlush = [...channel.buffer]
    channel.buffer.splice(0, channel.buffer.length)
    toFlush.forEach(({ type, data }) => {
      send(type, data)
    })
  }

  function send<K extends T['type']>(
    type: K | InternalMsgType | HandshakeMsgType,
    data?: Extract<T, { type: K }>['data'],
  ) {
    if (
      !isHandshakeMessage(type) &&
      !isInternalMessage(type) &&
      (channel.status === 'connecting' || channel.status === 'reconnecting')
    ) {
      channel.buffer.push({ type, data })
      return
    }

    if (channel.id && channel.origin) {
      const msg: ProtocolMsg<T> = {
        connectionId: channel.id,
        data,
        domain: 'sanity/channels',
        from: config.id,
        id: uuid(),
        to: config.connectTo,
        type,
      }

      try {
        parent.postMessage(msg, {
          targetOrigin: channel.origin,
        })
      } catch (e) {
        throw new Error(`Failed to postMessage '${msg.id}' on '${config.id}'`)
      }
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
          channel.origin = e.origin
          channel.id = data.data.id as string
          setConnectionStatus('connecting')
          send('handshake/syn-ack', { id: channel.id })
          return
        }
        if (data.type === 'handshake/ack' && data.data.id === channel.id) {
          setConnectionStatus('connected')
          return
        }
      } else if (
        data.connectionId === channel.id &&
        e.origin === channel.origin
      ) {
        if (data.type === 'channel/disconnect') {
          setConnectionStatus('disconnected')
          return
        } else {
          const args = [data.type, data.data] as ToArgs<T>
          config.onEvent?.(...args)
          send('channel/response', { responseTo: data.id })
        }
        return
      }
    }
  }

  function disconnect() {
    if (['disconnected'].includes(channel.status)) return
    // send('channel/disconnect', { id: channel.id })
    setConnectionStatus('disconnected')
  }

  function destroy() {
    disconnect()
    window.removeEventListener('message', handleEvents, false)
  }

  function setConnectionStatus(next: ChannelStatus) {
    channel.status = next
    config?.onStatusUpdate?.(next)
    if (next === 'connected') {
      flush()
    }
  }

  function initialise() {
    window.addEventListener('message', handleEvents, false)
    setConnectionStatus('connecting')
  }

  initialise()

  function sendPublic<K extends T['type']>(
    type: K,
    data?: Extract<T, { type: K }>['data'],
  ) {
    send(type, data)
  }

  return {
    destroy,
    inFrame,
    send: sendPublic,
  }
}
