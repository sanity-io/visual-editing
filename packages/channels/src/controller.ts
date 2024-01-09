import { v4 as uuid } from 'uuid'

import {
  HANDSHAKE_INTERVAL,
  HEARTBEAT_INTERVAL,
  RESPONSE_TIMEOUT,
} from './constants'
import { isHandshakeMessage, isLegacyHandshakeMessage } from './helpers'
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
  const { destroy, send } = createChannelsControllerInternal(config)
  const sources = new Set<MessageEventSource>()
  const sendToSource = new WeakMap<
    MessageEventSource,
    ChannelsController['send']
  >()
  const destroySource = new Set<ChannelsController['destroy']>()

  const sendToMany = ((id, type, data) => {
    send(id, type, data)
    for (const source of sources) {
      if (
        source &&
        'closed' in source &&
        !source.closed &&
        sendToSource.has(source)
      ) {
        const send = sendToSource.get(source)
        send!(id, type, data)
      }
    }
  }) satisfies ChannelsController['send']

  const destroyMany = (() => {
    destroy()
    for (const destroy of destroySource) {
      destroy()
    }
  }) satisfies ChannelsController['destroy']

  return {
    destroy: destroyMany,
    send: sendToMany,
    addSource(source) {
      if (sources.has(source)) {
        return
      }
      if (!('closed' in source)) {
        // eslint-disable-next-line no-console
        console.warn('Source is unsupported', { source })
        throw new Error('Source is unsupported')
      }
      if (source.closed) {
        throw new Error('Source is closed')
      }
      const { send, destroy } = createChannelsControllerInternal({
        ...config,
        target: source,
        // @TODO temporary workaround for onStatusUpdate and onEvent not differentiating
        //       iframes from popups
        connectTo: config.connectTo.map((prevConnectTo) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { onStatusUpdate, onEvent, ...connectTo } = prevConnectTo

          return {
            ...connectTo,
            onEvent: onEvent
              ? (((type, data) => {
                  if (
                    type === 'preview-kit/documents' ||
                    type === 'overlay/navigate' ||
                    type === 'loader/documents'
                  ) {
                    return
                  }

                  // @ts-expect-error -- figure out ToArgs complaining
                  return onEvent(type, data)
                }) satisfies typeof onEvent)
              : undefined,
          }
        }),
      })
      destroySource.add(destroy)
      sendToSource.set(source, send)
      sources.add(source)
    },
  }
}

function createChannelsControllerInternal<T extends ChannelMsg>(
  config: ChannelsControllerOptions<T>,
): Omit<ChannelsController, 'addSource'> {
  const target = config.target

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
      origin === config.targetOrigin
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
    if (isLegacyHandshakeMessage(e)) {
      // eslint-disable-next-line no-console
      console.error(
        'Visual editing package mismatch detected! Please ensure you are using the latest version of Sanity Studio and any packages listed here:\nhttps://github.com/sanity-io/visual-editing',
      )
      return
    }

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
      target?.postMessage(msg, { targetOrigin: '*' })
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
          console.warn(
            `Received no response to message '${msg.type}' on client '${config.id}' (ID: '${msg.id}').`,
          )
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
      target?.postMessage(msg, { targetOrigin: config.targetOrigin })
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
