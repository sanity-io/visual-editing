import {type Channel, type ChannelInput, createChannel} from './channel'
import {
  type BufferAddedEmitEvent,
  type BufferFlushedEmitEvent,
  type Message,
  type MessageEmitEvent,
  type WithoutResponse,
} from './types'

export type ConnectionInput = Omit<ChannelInput, 'target'>

export interface Connection<R extends Message, S extends Message> {
  on: <T extends R['type'], U extends Extract<R, {type: T}>>(
    type: T,
    handler: (event: U['data']) => U['response'],
  ) => void
  onInternal: <
    T extends (BufferAddedEmitEvent<R> | BufferFlushedEmitEvent<S> | MessageEmitEvent<S>)['type'],
    U extends Extract<
      MessageEmitEvent<R> | BufferAddedEmitEvent<S> | BufferFlushedEmitEvent<S>,
      {type: T}
    >,
  >(
    type: T,
    handler: (event: U) => void,
  ) => void
  post: (data: WithoutResponse<S>) => void
  start: () => () => void
  stop: () => void
  connect: () => () => void
  disconnect: () => void
  onStatus: (handler: (status: string) => void) => void
}

export interface Controller {
  addSource: (source: MessageEventSource) => void
  createConnection: <R extends Message, S extends Message>(
    input: ConnectionInput,
  ) => Connection<R, S>
  destroy: () => void
}

interface ConnectionConfig {
  input: ConnectionInput
  initialized: boolean
  channels: Array<Channel<Message, Message>>
  onSubscribers: Array<{
    type: Message['type']
    handler: (event: Message['data']) => Message['response']
  }>
  onUnsubscribers: Array<() => void>
  onStatusSubscribers: Array<(status: string) => void>
  onStatusUnsubscribers: Array<() => void>
  onInternalSubscribers: Array<{
    type: Message['type']
    handler: (event: Extract<Message, {type: Message['type']}>) => void
  }>
  onInternalUnsubscribers: Array<() => void>
}

export const createController = (): Controller => {
  const sources: Set<MessageEventSource> = new Set()

  const connectionMap = new Map<string, ConnectionConfig>()

  const createConnection = <R extends Message, S extends Message>(
    input: ChannelInput,
  ): Connection<R, S> => {
    const {id} = input

    connectionMap.set(input.id, {
      input,
      initialized: false,
      channels: [],
      onInternalSubscribers: [],
      onInternalUnsubscribers: [],
      onStatusSubscribers: [],
      onStatusUnsubscribers: [],
      onSubscribers: [],
      onUnsubscribers: [],
    })

    const {
      channels,
      onInternalSubscribers,
      onInternalUnsubscribers,
      onStatusSubscribers,
      onStatusUnsubscribers,
      onSubscribers,
      onUnsubscribers,
    } = connectionMap.get(id)!

    if (sources.size) {
      sources.forEach((source) => {
        const channel = createChannel({
          ...input,
          target: source,
        })
        channels.push(channel)
      })
    } else {
      const channel = createChannel(input)
      channels.push(channel)
    }

    const post = (data: WithoutResponse<S>) => {
      channels.forEach((channel) => {
        channel.post(data)
      })
    }

    const on = <T extends R['type'], U extends Extract<R, {type: T}>>(
      type: T,
      handler: (event: U['data']) => U['response'],
    ) => {
      onSubscribers.push({type, handler})
      channels.forEach((channel) => {
        onUnsubscribers?.push(channel.on(type, handler))
      })
      return () => {
        onUnsubscribers?.forEach((unsub) => unsub())
      }
    }

    const onInternal = <
      T extends (BufferAddedEmitEvent<R> | BufferFlushedEmitEvent<S> | MessageEmitEvent<S>)['type'],
      U extends Extract<
        MessageEmitEvent<R> | BufferAddedEmitEvent<S> | BufferFlushedEmitEvent<S>,
        {type: T}
      >,
    >(
      type: T,
      handler: (event: U) => void,
    ) => {
      // @ts-expect-error @todo / help handler type
      onInternalSubscribers.push({type, handler})
      channels.forEach((channel) => {
        // @ts-expect-error @help! handler type
        channel.actor.on(type, handler)
      })
      return () => {
        onInternalUnsubscribers?.forEach((unsub) => unsub())
      }
    }

    const onStatus = (handler: (status: string) => void) => {
      onStatusSubscribers.push(handler)
      channels.forEach((channel) => {
        onStatusUnsubscribers?.push(channel.onStatus(handler))
      })
      return () => {
        onStatusUnsubscribers?.forEach((unsub) => unsub())
      }
    }

    const stop = () => {
      channels.forEach((channel) => {
        channel.stop()
      })
    }

    const start = () => {
      channels.forEach((channel) => {
        channel.start()
      })

      return stop
    }

    const disconnect = () => {
      channels.forEach((channel) => {
        channel.disconnect()
      })
    }

    const connect = () => {
      channels.forEach((channel) => {
        channel.connect()
      })

      return disconnect
    }

    return {
      connect,
      disconnect,
      on,
      onStatus,
      onInternal,
      post,
      start,
      stop,
    }
  }

  const addSource = (source: MessageEventSource) => {
    if (sources.has(source)) return
    sources.add(source)

    Array.from(connectionMap.values()).forEach((config) => {
      if (!config.initialized) {
        config.channels.forEach((channel) => {
          config.initialized = true
          channel.setSource(source)
          channel.connect()
        })
      } else {
        const channel = createChannel({
          ...config.input,
          target: source,
        })
        config.channels.push(channel)
        config.onSubscribers.forEach(({type, handler}) => {
          channel.on(type, handler)
        })
        config.onInternalSubscribers.forEach(({type, handler}) => {
          channel.actor.on(type, handler)
        })
        config.onStatusSubscribers.forEach((onStatus) => {
          channel.onStatus(onStatus)
        })
        channel.start()
        channel.connect()
      }
    })
  }

  const destroy = () => {
    connectionMap.forEach(({channels}) => {
      channels.forEach((channel) => {
        channel.disconnect()
        // Necessary to allow disconnect messages to be sent before the channel
        // actor is stopped
        setTimeout(() => {
          channel.stop()
        }, 0)
      })
    })
  }

  return {
    addSource,
    createConnection,
    destroy,
  }
}
