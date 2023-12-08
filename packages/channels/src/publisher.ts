import { v4 as uuid } from 'uuid'

import {
  HANDSHAKE_INTERVAL,
  HEARTBEAT_INTERVAL,
  RESPONSE_TIMEOUT,
} from './constants'
import { isHandshakeMessage } from './helpers'
import {
  ChannelsConnectionStatus,
  ChannelsMsg,
  ChannelsPublisher,
  ChannelsPublisherConnection,
  ChannelsPublisherOptions,
  ProtocolMsg,
  ToArgs,
} from './types'

export function createChannelsPublisher<T extends ChannelsMsg>(
  config: ChannelsPublisherOptions<T>,
): ChannelsPublisher {
  let iframe = config.frame.contentWindow

  const connections: ChannelsPublisherConnection[] = config.connectTo.map(
    (config) => ({
      buffer: [],
      config,
      id: '',
      handler: handshakeHandler,
      status: 'fresh',
      interval: undefined,
      heartbeat: undefined,
    }),
  )

  function startHandshakes() {
    const inactiveConnections = connections.filter((connection) =>
      ['disconnected', 'fresh'].includes(connection.status),
    )
    inactiveConnections.forEach((connection) => {
      connection.interval = window.setInterval(() => {
        connection.id = uuid()
        setConnectionStatus(connection, 'connecting')
        sendHandshake(connection, 'handshake/syn', { id: connection.id })
      }, HANDSHAKE_INTERVAL)
    })
  }

  function stopHandshake(connection: ChannelsPublisherConnection) {
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
        stopHandshake(connection)
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
        if (data.type === 'channel/disconnect') {
          setConnectionStatus(connection, 'disconnected')
          return
        } else {
          // eslint-disable-next-line no-warning-comments
          // @todo Ugly type casting
          const args = [data.type, data.data] as ToArgs<T>
          config.handler?.(...args)
          // config.handler?.(data.type, data.data);
          send(connection, 'channel/response', { responseTo: data.id })
        }
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

  function flush(connection: ChannelsPublisherConnection) {
    const toFlush = [...connection.buffer]
    connection.buffer.splice(0, connection.buffer.length)
    toFlush.forEach(({ type, data }) => {
      send(connection, type, data)
    })
  }

  function startHeartbeat(connection: ChannelsPublisherConnection) {
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

  function stopHeartbeat(connection: ChannelsPublisherConnection) {
    if (connection.heartbeat) {
      window.clearInterval(connection.heartbeat)
    }
  }

  function setConnectionStatus(
    connection: ChannelsPublisherConnection,
    next: ChannelsConnectionStatus,
  ) {
    connection.status = next
    connection.config.onStatusUpdate?.(next, connection.config.id)
    if (next === 'connected') {
      connection.handler = messageHandler
      startHeartbeat(connection)
      flush(connection)
    } else if (next === 'disconnected') {
      connection.handler = handshakeHandler
      stopHeartbeat(connection)
    }
  }

  function sendHandshake<K extends T['type']>(
    connection: ChannelsPublisherConnection,
    type: K,
    data?: Extract<T, { type: K }>['data'],
  ) {
    if (!connection.id) throw new Error('No connection ID set')
    const msg: ProtocolMsg<T> = {
      connectionId: connection.id,
      data,
      domain: 'sanity/channels',
      from: config.id,
      id: uuid(),
      to: connection.config.id,
      type,
    }
    iframe?.postMessage(msg, { targetOrigin: '*' })
  }

  function send<K extends T['type']>(
    connection: ChannelsPublisherConnection,
    type: K,
    data?: Extract<T, { type: K }>['data'],
    expectResponse = true,
  ) {
    return new Promise<string>((resolve, reject) => {
      if (!connection.id) return reject('No connection ID set')
      const id = uuid()

      // If there is no active connection, push to the buffer
      if (connection.status === 'fresh' || connection.status === 'connecting') {
        connection.buffer.push({
          type,
          data,
        })
        return resolve(id)
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

      // const isInternal = isInternalMessage(type);

      if (expectResponse) {
        const maxWait = setTimeout(() => {
          // The connection may have changed, so only reject if the IDs match
          if (msg.connectionId === connection.id) {
            // eslint-disable-next-line no-console
            console.error('Received no response to message', {
              msg,
              connection,
            })
            setConnectionStatus(connection, 'disconnected')
            window.removeEventListener('message', transact, false)
            return reject({
              reason: `Received no response to message '${msg.id}' on client '${config.id}'`,
              msg,
              connection,
            })
          } else {
            return resolve(msg.id)
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
            return resolve(msg.id)
          }
        }
        window.addEventListener('message', transact, false)
      }

      try {
        iframe?.postMessage(msg, { targetOrigin: config.frameOrigin })
        // Resolve immediately if we don't expect a response
        if (!expectResponse) {
          return resolve(msg.id)
        }
        return
      } catch (e) {
        reject({
          reason: `Failed to postMessage '${msg.id}' on client '${config.id}'`,
          msg,
          connection,
        })
      }

      // const isInternal = isInternalMessage(type);
      // const isHandshake = isHandshakeMessage(type);
      // const isHeartbeat = isHeartbeatMessage(type);

      // Always send internal messages
      // Otherwise send if connection is active
      // Buffer messages if we have a fresh connection or connecting
      // if (connection.status === "fresh" || connection.status === "connecting") {
      //   connection.buffer.push({
      //     type,
      //     data,
      //   });
      //   resolve(msg.id);
      // }

      return reject({
        reason: `Will not send message '${msg.id}' on client '${config.id}'`,
        msg,
        connection,
      })
    })
  }

  function disconnect() {
    connections.forEach((connection) => {
      if (['fresh', 'disconnected'].includes(connection.status)) return
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

  config.frame.onload = () => {
    iframe = config.frame.contentWindow
  }

  function connect() {
    window.addEventListener('message', handleEvents, false)
    startHandshakes()
  }

  connections.forEach((connection) => setConnectionStatus(connection, 'fresh'))
  connect()

  function sendToAll(type: T['type'], data?: T['data']) {
    return Promise.all(
      connections.map((connection) => send(connection, type, data)),
    )
  }

  return {
    destroy,
    send: sendToAll,
  }
}
