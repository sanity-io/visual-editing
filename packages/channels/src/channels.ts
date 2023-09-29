import { v4 as uuid } from 'uuid'

import { isHandshake, isInternalMessage, isObject } from './helper'
import type {
  BufferMessage,
  ChannelMsg,
  ChannelOptions,
  ChannelReturns,
  Connection,
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
  const { connections, handler } = config
  const clientId = config.id || uuid()
  const inFrame = window.self !== window.top
  const activeConnections: Connection[] = []
  const messageBuffer: BufferMessage[] = []

  function addToBuffer(msg: BufferMessage) {
    messageBuffer.push(msg)
  }

  function flush() {
    const toFlush = [...messageBuffer]
    messageBuffer.splice(0, messageBuffer.length)
    toFlush.forEach(({ connection, type, data }) => {
      post(connection, type, data)
    })
  }

  function connectionIsActive(connection: Connection) {
    return function (activeConnection: Connection) {
      return (
        activeConnection.id === connection.id &&
        activeConnection.target === connection.target
      )
    }
  }

  function setConnectionState(connection: Connection, connected = true) {
    const activeIndex = activeConnections.findIndex(
      connectionIsActive(connection),
    )
    if (connected && activeIndex < 0) {
      activeConnections.push(connection)
      config.onConnect?.(connection)
      flush()
    } else if (!connected && activeIndex) {
      activeConnections.splice(activeIndex, 1)
      config.onDisconnect?.(connection)
    }
  }

  function findConnection(e: MessageEvent<unknown>) {
    const { source, origin, data } = e
    if (isObject(data)) {
      return connections.find(
        (connection) =>
          data &&
          data.to === clientId &&
          connection.id === data.from &&
          connection.target === source &&
          connection.target.origin === origin,
      )
    }
    return undefined
  }

  function post<K extends T['type']>(
    connection: Connection,
    type: K,
    data?: Extract<T, { type: K }>['data'],
  ) {
    const msg = {
      id: uuid(),
      type,
      from: clientId,
      to: connection.id,
      data,
    }

    // Always send internal messages
    // Otherwise send if connection is active
    if (
      isInternalMessage(type) ||
      activeConnections.find(connectionIsActive(connection))
    ) {
      return connection.target.postMessage(msg, {
        targetOrigin: connection.target.origin,
      })
    }
    // If not connected, add to bus
    addToBuffer({
      connection,
      type,
      data,
    })
  }

  function postMany<K extends T['type']>(
    connections: Connection[],
    type: K,
    data?: Extract<T, { type: K }>['data'],
  ) {
    return connections.forEach((connection) => {
      post(connection, type, data)
    })
  }

  function handleHandshake(
    connection: Connection,
    e: MessageEvent<ProtocolMsg>,
  ) {
    if (e.data.type === 'handshake/syn') {
      post(connection, 'handshake/syn-ack')
    }
    if (e.data.type === 'handshake/syn-ack') {
      setConnectionState(connection, true)
      post(connection, 'handshake/ack')
    }
    if (e.data.type === 'handshake/ack') {
      setConnectionState(connection, true)
    }
  }

  function handleEvents(e: MessageEvent) {
    const connection = findConnection(e)
    if (!connection) return
    const { data } = e
    if (isHandshake(data.type)) {
      handleHandshake(connection, e)
    } else if (data.type === 'channel/disconnect') {
      setConnectionState(connection, false)
    } else if (data.type === 'channel/response') {
      // Do nothing for now
    } else {
      // eslint-disable-next-line no-warning-comments
      // @todo Ugly type casting
      const args = [data.type, data.data] as ToArgs<T>
      handler(...args)
      // handle(data.type, data.data)
      post(connection, 'channel/response')
    }
  }

  function disconnect() {
    window.removeEventListener('message', handleEvents, false)
    if (!activeConnections.length) return
    postMany(activeConnections, 'channel/disconnect')
    activeConnections.forEach((connection) => {
      setConnectionState(connection, false)
    })
  }

  function connect() {
    window.addEventListener('message', handleEvents, false)
    // Should this post to only inactive connections?
    postMany(connections, 'handshake/syn')
  }

  /**
   * Dispatch a message to all active connections
   * @param type The message type
   * @param data The message body
   * @returns void
   */
  function send(type: T['type'], data?: T['data']) {
    return new Promise<void>((resolve) => {
      const transact = (e: MessageEvent<Msg>) => {
        const { data: eventData } = e
        if (eventData.type === 'channel/response') {
          window.removeEventListener('message', transact, false)
          resolve()
        }
      }
      window.addEventListener('message', transact, false)
      postMany(connections, type, data)
    })
  }

  connect()

  return {
    disconnect,
    inFrame,
    send,
  }
}
