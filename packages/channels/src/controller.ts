import { v4 as uuid } from 'uuid'

import {
  HANDSHAKE_INTERVAL,
  HEARTBEAT_INTERVAL,
  RESPONSE_TIMEOUT,
} from './constants'
import { isHandshakeMessage } from './helpers'
import type {
  ChannelMsg,
  ChannelsController,
  ChannelsControllerChannel,
  ChannelsControllerOptions,
  ChannelStatus,
  InternalMsgType,
  ProtocolMsg,
  ToArgs,
} from './types'

export function createChannelsController<T extends ChannelMsg>(
  config: ChannelsControllerOptions<T>,
): ChannelsController {
  const iframe = config.frame.contentWindow

  const channels: ChannelsControllerChannel<T>[] = config.connectTo.map(
    (config) => ({
      buffer: [],
      config,
      id: '',
      handler: handshakeHandler,
      status: 'connecting',
      interval: undefined,
      heartbeat: undefined,
    }),
  )

  function startHandshake(channel: ChannelsControllerChannel<T>) {
    channel.id = uuid()
    channel.interval = window.setInterval(() => {
      sendHandshake(channel, 'handshake/syn', { id: channel.id })
    }, HANDSHAKE_INTERVAL)
  }

  function stopHandshake(channel: ChannelsControllerChannel<T>) {
    window.clearInterval(channel.interval)
  }

  function isValidMessageEvent(
    e: MessageEvent,
  ): e is MessageEvent<ProtocolMsg<T>> {
    const { data, origin } = e
    return (
      data.domain === 'sanity/channels' &&
      data.to == config.id &&
      channels.map((channel) => channel.config.id).includes(data.from) &&
      data.type !== 'channel/response' &&
      origin === config.frameOrigin
    )
  }

  function handshakeHandler(e: MessageEvent<ProtocolMsg<T>>) {
    const { data } = e
    if (isHandshakeMessage(data.type)) {
      const channel = channels.find(
        (channel) => channel.config.id === data.from,
      )
      if (channel && data.type === 'handshake/syn-ack') {
        setChannelStatus(channel, 'connected')
        sendHandshake(channel, 'handshake/ack', { id: channel.id })
      }
    }
  }

  const messageHandler = (e: MessageEvent<ProtocolMsg<T>>) => {
    const { data } = e
    if (
      !isHandshakeMessage(data.type) &&
      channels.find((channel) => channel.id === data.connectionId)
      // && origin !== config.frameOrigin
    ) {
      const channel = channels.find(
        (channel) => channel.config.id === data.from,
      )
      if (channel) {
        // eslint-disable-next-line no-warning-comments
        // @todo Ugly type casting
        const args = [data.type, data.data] as ToArgs<T>
        channel.config.onEvent?.(...args)
        config.onEvent?.(...args)
        send(channel, 'channel/response', { responseTo: data.id }, false)
      }
    }
  }

  function handleEvents(e: MessageEvent<ProtocolMsg<T>>) {
    if (isValidMessageEvent(e)) {
      const { data } = e
      channels.find((channel) => channel.config.id === data.from)?.handler(e)
    }
  }

  function flush(channel: ChannelsControllerChannel<T>) {
    const toFlush = [...channel.buffer]
    channel.buffer.splice(0, channel.buffer.length)
    toFlush.forEach(({ type, data }) => {
      send(channel, type, data)
    })
  }

  function startHeartbeat(channel: ChannelsControllerChannel<T>) {
    stopHeartbeat(channel)
    if (channel.config.heartbeat) {
      const heartbeatInverval =
        typeof channel.config.heartbeat === 'number'
          ? channel.config.heartbeat
          : HEARTBEAT_INTERVAL
      channel.heartbeat = window.setInterval(() => {
        send(channel, 'channel/heartbeat')
      }, heartbeatInverval)
    }
  }

  function stopHeartbeat(channel: ChannelsControllerChannel<T>) {
    if (channel.heartbeat) {
      window.clearInterval(channel.heartbeat)
    }
  }

  function setChannelStatus(
    channel: ChannelsControllerChannel<T>,
    next: ChannelStatus,
  ) {
    channel.status = next
    channel.config.onStatusUpdate?.(next, channel.config.id)
    config.onStatusUpdate?.(next, channel.config.id)
    if (next === 'connecting' || next === 'reconnecting') {
      channel.handler = handshakeHandler
      stopHeartbeat(channel)
      startHandshake(channel)
    } else if (next === 'connected') {
      channel.handler = messageHandler
      stopHandshake(channel)
      startHeartbeat(channel)
      flush(channel)
    } else if (next === 'disconnected') {
      channel.id = null
      channel.handler = handshakeHandler
      stopHandshake(channel)
      stopHeartbeat(channel)
    }
  }

  function sendHandshake<K extends T['type']>(
    channel: ChannelsControllerChannel<T>,
    type: K,
    data?: Extract<T, { type: K }>['data'],
  ) {
    if (!channel.id) {
      throw new Error('No channel ID set')
    }

    const msg: ProtocolMsg<T> = {
      connectionId: channel.id,
      data,
      domain: 'sanity/channels',
      from: config.id,
      id: uuid(),
      to: channel.config.id,
      type,
    }

    try {
      iframe?.postMessage(msg, { targetOrigin: '*' })
    } catch (e) {
      throw new Error(`Failed to postMessage '${msg.id}' on '${config.id}'`)
    }
  }

  function send<K extends T['type']>(
    channel: ChannelsControllerChannel<T>,
    type: K | InternalMsgType,
    data?: Extract<T, { type: K }>['data'],
    expectResponse = true,
  ) {
    const id = uuid()

    // If there is no active channel, push to the buffer
    if (
      channel.status === 'connecting' ||
      channel.status === 'reconnecting' ||
      channel.status === 'disconnected'
    ) {
      channel.buffer.push({ type, data })
      return
    }

    if (!channel.id) {
      throw new Error('No channel ID set')
    }

    const msg: ProtocolMsg<T> = {
      connectionId: channel.id,
      data,
      domain: 'sanity/channels',
      from: config.id,
      id,
      to: channel.config.id,
      type,
    }

    if (expectResponse) {
      const maxWait = setTimeout(() => {
        // The channel may have changed, so only reject if the IDs match
        if (msg.connectionId === channel.id) {
          // Cleanup the transaction listener
          window.removeEventListener('message', transact, false)
          // Push the message to the buffer
          if (type !== 'channel/heartbeat') {
            channel.buffer.push({ type, data })
          }
          // Try to reconnect
          setChannelStatus(channel, 'reconnecting')
          // eslint-disable-next-line no-console
          console.warn({
            reason: `Received no response to message '${msg.id}' on channel '${config.id}'`,
            msg,
            channel,
          })
        }
      }, RESPONSE_TIMEOUT)

      const transact = (e: MessageEvent<ChannelMsg>) => {
        const { data: eventData } = e
        if (
          eventData.type === 'channel/response' &&
          eventData.data?.responseTo &&
          eventData.data.responseTo === msg.id
        ) {
          window.removeEventListener('message', transact, false)
          clearTimeout(maxWait)
        }
      }
      window.addEventListener('message', transact, false)
    }

    try {
      iframe?.postMessage(msg, { targetOrigin: config.frameOrigin })
    } catch (e) {
      throw new Error(
        `Failed to postMessage '${msg.id}' on client '${config.id}'`,
      )
    }
  }

  function disconnect() {
    channels.forEach((channel) => {
      if (['disconnected'].includes(channel.status)) return
      send(channel, 'channel/disconnect', { id: channel.id }, false)
      setChannelStatus(channel, 'disconnected')
    })
  }

  function destroy() {
    disconnect()
    window.removeEventListener('message', handleEvents, false)
    channels.forEach((channel) => {
      stopHeartbeat(channel)
      stopHandshake(channel)
    })
  }

  function initialise() {
    window.addEventListener('message', handleEvents, false)
    channels.forEach((channel) => {
      setChannelStatus(channel, 'connecting')
    })
  }

  initialise()

  function sendPublic<K extends T['type']>(
    id: string | string[] | undefined,
    type: K,
    data?: Extract<T, { type: K }>['data'],
  ) {
    const channelsToSend = id ? (Array.isArray(id) ? [...id] : [id]) : channels

    channelsToSend.forEach((id) => {
      const channel = channels.find((channel) => channel.config.id === id)
      if (!channel) throw new Error('Invalid channel ID')
      send(channel, type, data)
    })
  }

  return {
    destroy,
    send: sendPublic,
  }
}
