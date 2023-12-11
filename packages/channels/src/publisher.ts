import { v4 as uuid } from 'uuid'

import {
  HANDSHAKE_INTERVAL,
  HEARTBEAT_INTERVAL,
  RESPONSE_TIMEOUT,
} from './constants'
import { isHandshakeMessage } from './helpers'
import type {
  ChannelsConnectionStatus,
  ChannelsMsg,
  ChannelsPublisher,
  ChannelsPublisherConnection,
  ChannelsPublisherOptions,
  InternalMsgType,
  ProtocolMsg,
  ToArgs,
} from './types'

export function createChannelsPublisher<T extends ChannelsMsg>(
  config: ChannelsPublisherOptions<T>,
): ChannelsPublisher {
  const iframe = config.frame.contentWindow

  const connections: ChannelsPublisherConnection<T>[] = config.connectTo.map(
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

  function startHandshake(connection: ChannelsPublisherConnection<T>) {
    connection.id = uuid()
    connection.interval = window.setInterval(() => {
      sendHandshake(connection, 'handshake/syn', { id: connection.id })
    }, HANDSHAKE_INTERVAL)
  }

  function stopHandshake(connection: ChannelsPublisherConnection<T>) {
    window.clearInterval(connection.interval)
  }

  function isValidMessageEvent(
    e: MessageEvent,
  ): e is MessageEvent<ProtocolMsg<T>> {
    const { data, origin } = e
    return (
      data.domain === 'sanity/channels' &&
      data.to == config.id &&
      connections
        .map((connection) => connection.config.id)
        .includes(data.from) &&
      data.type !== 'channel/response' &&
      origin === config.frameOrigin
    )
  }

  function handshakeHandler(e: MessageEvent<ProtocolMsg<T>>) {
    const { data } = e
    if (isHandshakeMessage(data.type)) {
      const connection = connections.find(
        (connection) => connection.config.id === data.from,
      )
      if (connection && data.type === 'handshake/syn-ack') {
        setConnectionStatus(connection, 'connected')
        sendHandshake(connection, 'handshake/ack', { id: connection.id })
      }
    }
  }

  const messageHandler = (e: MessageEvent<ProtocolMsg<T>>) => {
    const { data } = e
    if (
      !isHandshakeMessage(data.type) &&
      connections.find((connection) => connection.id === data.connectionId)
      // && origin !== config.frameOrigin
    ) {
      const connection = connections.find(
        (connection) => connection.config.id === data.from,
      )
      if (connection) {
        // eslint-disable-next-line no-warning-comments
        // @todo Ugly type casting
        const args = [data.type, data.data] as ToArgs<T>
        connection.config.onEvent?.(...args)
        config.onEvent?.(...args)
        send(connection, 'channel/response', { responseTo: data.id }, false)
      }
    }
  }

  function handleEvents(e: MessageEvent<ProtocolMsg<T>>) {
    if (isValidMessageEvent(e)) {
      const { data } = e
      connections
        .find((connection) => connection.config.id === data.from)
        ?.handler(e)
    }
  }

  function flush(connection: ChannelsPublisherConnection<T>) {
    const toFlush = [...connection.buffer]
    connection.buffer.splice(0, connection.buffer.length)
    toFlush.forEach(({ type, data }) => {
      send(connection, type, data)
    })
  }

  function startHeartbeat(connection: ChannelsPublisherConnection<T>) {
    stopHeartbeat(connection)
    if (connection.config.heartbeat) {
      const heartbeatInverval =
        typeof connection.config.heartbeat === 'number'
          ? connection.config.heartbeat
          : HEARTBEAT_INTERVAL
      connection.heartbeat = window.setInterval(() => {
        send(connection, 'channel/heartbeat')
      }, heartbeatInverval)
    }
  }

  function stopHeartbeat(connection: ChannelsPublisherConnection<T>) {
    if (connection.heartbeat) {
      window.clearInterval(connection.heartbeat)
    }
  }

  function setConnectionStatus(
    connection: ChannelsPublisherConnection<T>,
    next: ChannelsConnectionStatus,
  ) {
    connection.status = next
    connection.config.onStatusUpdate?.(next, connection.config.id)
    config.onStatusUpdate?.(next, connection.config.id)
    if (next === 'connecting' || next === 'reconnecting') {
      connection.handler = handshakeHandler
      stopHeartbeat(connection)
      startHandshake(connection)
    } else if (next === 'connected') {
      connection.handler = messageHandler
      stopHandshake(connection)
      startHeartbeat(connection)
      flush(connection)
    } else if (next === 'disconnected') {
      connection.id = null
      connection.handler = handshakeHandler
      stopHandshake(connection)
      stopHeartbeat(connection)
    }
  }

  function sendHandshake<K extends T['type']>(
    connection: ChannelsPublisherConnection<T>,
    type: K,
    data?: Extract<T, { type: K }>['data'],
  ) {
    if (!connection.id) {
      throw new Error('No connection ID set')
    }

    const msg: ProtocolMsg<T> = {
      connectionId: connection.id,
      data,
      domain: 'sanity/channels',
      from: config.id,
      id: uuid(),
      to: connection.config.id,
      type,
    }

    try {
      iframe?.postMessage(msg, { targetOrigin: '*' })
    } catch (e) {
      throw new Error(`Failed to postMessage '${msg.id}' on '${config.id}'`)
    }
  }

  function send<K extends T['type']>(
    connection: ChannelsPublisherConnection<T>,
    type: K | InternalMsgType,
    data?: Extract<T, { type: K }>['data'],
    expectResponse = true,
  ) {
    const id = uuid()

    // If there is no active connection, push to the buffer
    if (
      connection.status === 'connecting' ||
      connection.status === 'reconnecting' ||
      connection.status === 'disconnected'
    ) {
      connection.buffer.push({ type, data })
      return
    }

    if (!connection.id) {
      throw new Error('No connection ID set')
    }

    const msg: ProtocolMsg<T> = {
      connectionId: connection.id,
      data,
      domain: 'sanity/channels',
      from: config.id,
      id,
      to: connection.config.id,
      type,
    }

    if (expectResponse) {
      const maxWait = setTimeout(() => {
        // The connection may have changed, so only reject if the IDs match
        if (msg.connectionId === connection.id) {
          // Cleanup the transaction listener
          window.removeEventListener('message', transact, false)
          // Push the message to the buffer
          if (type !== 'channel/heartbeat') {
            connection.buffer.push({ type, data })
          }
          // Try to reconnect
          setConnectionStatus(connection, 'reconnecting')
          // eslint-disable-next-line no-console
          console.warn({
            reason: `Received no response to message '${msg.id}' on connection '${config.id}'`,
            msg,
            connection,
          })
        }
      }, RESPONSE_TIMEOUT)

      const transact = (e: MessageEvent<ChannelsMsg>) => {
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
    connections.forEach((connection) => {
      if (['disconnected'].includes(connection.status)) return
      send(connection, 'channel/disconnect', { id: connection.id }, false)
      setConnectionStatus(connection, 'disconnected')
    })
  }

  function destroy() {
    disconnect()
    window.removeEventListener('message', handleEvents, false)
    connections.forEach((connection) => {
      stopHeartbeat(connection)
      stopHandshake(connection)
    })
  }

  function initialise() {
    window.addEventListener('message', handleEvents, false)
    connections.forEach((connection) => {
      setConnectionStatus(connection, 'connecting')
    })
  }

  initialise()

  function sendPublic<K extends T['type']>(
    id: string | string[] | undefined,
    type: K,
    data?: Extract<T, { type: K }>['data'],
  ) {
    const connectionsToSend = id
      ? Array.isArray(id)
        ? [...id]
        : [id]
      : connections

    connectionsToSend.forEach((id) => {
      const connection = connections.find(
        (connection) => connection.config.id === id,
      )
      if (!connection) throw new Error('Invalid connection ID')
      send(connection, type, data)
    })
  }

  return {
    destroy,
    send: sendPublic,
  }
}
