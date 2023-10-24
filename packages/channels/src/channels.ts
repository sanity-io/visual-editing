import { v4 as uuid } from 'uuid'

import { HEARTBEAT_INTERVAL, RESPONSE_TIMEOUT } from './constants'
import {
  isHandshakeMessage,
  isHeartbeatMessage,
  isInternalMessage,
  isObject,
} from './helper'
import type {
  ChannelMsg,
  ChannelOptions,
  ChannelReturns,
  Connection,
  ConnectionStatus,
  Msg,
  ProtocolMsg,
  ToArgs,
} from './types'

/**
 *
 * @public
 */
export function createChannel<T extends ChannelMsg>(
  config: ChannelOptions<T>,
): ChannelReturns<T> {
  const inFrame = window.self !== window.top

  const connections: Connection[] = config.connections.map((connection) => {
    // const { target, targetOrigin, id: targetId } = connection
    return {
      buffer: [],
      config: connection,
      heartbeat: null,
      id: null,
      status: 'fresh',
      // target,
      // targetId,
      // targetOrigin,
    }
  })

  function flush(connection: Connection) {
    const toFlush = [...connection.buffer]
    connection.buffer.splice(0, connection.buffer.length)
    toFlush.forEach(({ type, data }) => {
      post(connection, type, data)
    })
  }

  function startHeartbeat(connection: Connection) {
    stopHeartbeat(connection)
    if (connection.config.heartbeat) {
      const heartbeatInverval =
        typeof connection.config.heartbeat === 'number'
          ? connection.config.heartbeat
          : HEARTBEAT_INTERVAL
      connection.heartbeat = window.setInterval(() => {
        send('channel/heartbeat', undefined, [connection])
      }, heartbeatInverval)
    }
  }
  function stopHeartbeat(connection: Connection) {
    if (connection.heartbeat) {
      window.clearInterval(connection.heartbeat)
    }
  }

  function setConnectionStatus(
    connection: Connection,
    newStatus: ConnectionStatus,
  ) {
    const prevStatus = connection.status
    if (prevStatus !== newStatus) {
      connection.status = newStatus
      config.onStatusUpdate?.(newStatus, prevStatus, connection)
      if (newStatus === 'connected') {
        flush(connection)
        startHeartbeat(connection)
      }
      if (newStatus === 'disconnected') {
        stopHeartbeat(connection)
      }
    }
  }

  function findConnection(e: MessageEvent<unknown>) {
    const { source, origin, data } = e
    if (isObject(data)) {
      return connections.find((connection) => {
        return (
          config.id === data.to &&
          connection.config.id === data.from &&
          connection.config.target === source &&
          (connection.config.targetOrigin === origin ||
            connection.config.targetOrigin === '*') &&
          // Must match the connection id or be a handshake
          (connection.id === data.connectionId ||
            (typeof data.type === 'string' &&
              data.type.startsWith('handshake/')))
        )
      })
    }
    return undefined
  }

  function post<K extends T['type']>(
    connection: Connection,
    type: K,
    data?: Extract<T, { type: K }>['data'],
  ) {
    return new Promise<string>((resolve, reject) => {
      const msg: Msg = {
        id: uuid(),
        type,
        connectionId: connection.id,
        from: config.id,
        to: connection.config.id,
        data,
      }

      const isInternal = isInternalMessage(type)
      const isHandshake = isHandshakeMessage(type)
      const isHeartbeat = isHeartbeatMessage(type)
      const activeConnection = connections.find(
        (c) => c.id === connection.id && c.status === 'connected',
      )

      // Always send internal messages
      // Otherwise send if connection is active
      if (isInternal || isHandshake || isHeartbeat || activeConnection) {
        if (!isInternal || isHeartbeat) {
          // If the message isn’t internal, and the connection is active, we should receive a response. If we don't, reject, as the channel is unhealthy
          const maxWait = setTimeout(() => {
            // The connection may have changed, so only reject if the IDs match
            if (msg.connectionId === connection.id) {
              reject({
                reason: `Received no response to message '${msg.id}' on client '${config.id}'`,
                msg,
                connection,
              })
            } else {
              resolve(msg.id)
            }
          }, RESPONSE_TIMEOUT)

          const transact = (e: MessageEvent<Msg>) => {
            const { data: eventData } = e
            if (
              eventData.type === 'channel/response' &&
              eventData.data?.responseTo &&
              eventData.data.responseTo === msg.id
            ) {
              window.removeEventListener('message', transact, false)
              clearTimeout(maxWait)
              resolve(msg.id)
            }
          }
          window.addEventListener('message', transact, false)
        }

        try {
          // Handshakes may be dispatched before an iframe has loaded in which case the targetOrigin will not match, so send handshakes using '*'
          const targetOrigin = isHandshake
            ? '*'
            : connection.config.targetOrigin
          connection.config.target.postMessage(msg, { targetOrigin })
          // Don't wait for internal message or handshake responses
          if (isInternal || isHandshake) resolve(msg.id)
          return
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to postMessage', e, { msg, connection })
          reject({
            reason: `Failed to postMessage '${msg.id}' on client '${config.id}'`,
            msg,
            connection,
          })
        }
      }

      // Buffer messages if we have a fresh connection or connecting
      if (connection.status === 'fresh' || connection.status === 'connecting') {
        connection.buffer.push({
          type,
          data,
        })
        resolve(msg.id)
      }

      reject({
        reason: `Will not send message '${msg.id}' on client '${config.id}'`,
        msg,
        connection,
      })
    })
  }

  function postMany<K extends T['type']>(
    connections: Connection[],
    type: K,
    data?: Extract<T, { type: K }>['data'],
  ) {
    return Promise.allSettled(
      connections.map((connection) => post(connection, type, data)),
    )
  }

  function handleHandshake(
    connection: Connection,
    e: MessageEvent<ProtocolMsg>,
  ) {
    if (e.data.type === 'handshake/syn') {
      const id = e.data.data.id || connection.id
      connection.id = id
      post(connection, 'handshake/syn-ack', { id })
    }
    if (e.data.type === 'handshake/syn-ack') {
      const id = e.data.data.id || connection.id
      connection.id = id
      setConnectionStatus(connection, 'connected')
      post(connection, 'handshake/ack', { id })
    }
    if (e.data.type === 'handshake/ack') {
      const id = e.data.data.id || connection.id
      connection.id = id
      setConnectionStatus(connection, 'connected')
    }
  }

  function handleEvents(e: MessageEvent) {
    const connection = findConnection(e)
    if (!connection) return
    const { data } = e
    if (isHandshakeMessage(data.type)) {
      handleHandshake(connection, e)
    } else if (data.type === 'channel/disconnect') {
      setConnectionStatus(connection, 'disconnected')
    } else if (data.type === 'channel/response') {
      // Do nothing for now
    } else {
      // eslint-disable-next-line no-warning-comments
      // @todo Ugly type casting
      const args = [data.type, data.data] as ToArgs<T>
      config.handler(...args)
      post(connection, 'channel/response', { responseTo: data.id })
    }
  }

  function disconnect() {
    window.removeEventListener('message', handleEvents, false)
    const connectionsToDisconnect = connections.filter(
      ({ status }) => status === 'connecting' || status === 'connected',
    )
    if (!connectionsToDisconnect.length) return
    postMany(connectionsToDisconnect, 'channel/disconnect')
    connectionsToDisconnect.forEach((connection) => {
      setConnectionStatus(connection, 'disconnected')
    })
  }

  function connect() {
    window.addEventListener('message', handleEvents, false)
    const inactiveConnections = connections.filter((connection) =>
      ['disconnected', 'fresh', 'unhealthy'].includes(connection.status),
    )
    return Promise.all(
      inactiveConnections.map((connection) => {
        setConnectionStatus(connection, 'connecting')
        return post(connection, 'handshake/syn', { id: uuid() })
      }),
    )
  }

  /**
   * Dispatch a message to all connections
   * @param type The message type
   * @param data The message body
   * @returns void
   */
  async function send(
    type: T['type'],
    data?: T['data'],
    connectionSubset?: Connection[],
  ) {
    const results = await postMany(connectionSubset || connections, type, data)
    results.forEach((result) => {
      if (result.status === 'rejected') {
        const connection = connections.find(
          (connection) =>
            connection.status === 'connected' &&
            connection.id === result.reason.connection.id,
        )
        if (connection) {
          setConnectionStatus(connection, 'unhealthy')
        }
      }
    })
    return results
  }

  connect()

  return {
    disconnect,
    inFrame,
    send,
  }
}
