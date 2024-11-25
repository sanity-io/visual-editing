import {
  cleanupChannel,
  createChannel,
  createChannelMachine,
  type Channel,
  type ChannelActorLogic,
  type ChannelInput,
} from './channel'
import {type InternalEmitEvent, type Message, type StatusEvent, type WithoutResponse} from './types'

/**
 * @public
 */
export type ConnectionInput = Omit<ChannelInput, 'target' | 'targetOrigin'>

/**
 * @public
 */
export interface ConnectionInstance<R extends Message, S extends Message> {
  on: <T extends R['type'], U extends Extract<R, {type: T}>>(
    type: T,
    handler: (event: U['data']) => Promise<U['response']> | U['response'],
  ) => () => void
  onInternalEvent: <
    T extends InternalEmitEvent<R, S>['type'],
    U extends Extract<InternalEmitEvent<R, S>, {type: T}>,
  >(
    type: T,
    handler: (event: U) => void,
  ) => () => void
  onStatus: (handler: (event: StatusEvent) => void) => void
  post: (data: WithoutResponse<S>) => void
  start: () => () => void
  stop: () => void
}

/**
 * @public
 */
export interface Controller {
  addTarget: (target: MessageEventSource) => () => void
  createConnection: <R extends Message, S extends Message>(
    input: ConnectionInput,
    machine?: ChannelActorLogic<R, S>,
  ) => ConnectionInstance<R, S>
  destroy: () => void
}

interface Connection<
  R extends Message = Message,
  S extends Message = Message,
  T extends InternalEmitEvent<R, S>['type'] = InternalEmitEvent<R, S>['type'],
> {
  input: ConnectionInput
  channels: Set<Channel<R, S>>
  internalEventSubscribers: Set<{
    type: T
    handler: (event: Extract<InternalEmitEvent<R, S>, {type: T}>) => void
    unsubscribers: Array<() => void>
  }>
  machine: ChannelActorLogic<R, S>
  statusSubscribers: Set<{
    handler: (event: StatusEvent) => void
    unsubscribers: Array<() => void>
  }>
  subscribers: Set<{
    type: R['type']
    handler: (event: R['data']) => Promise<R['response']> | R['response']
    unsubscribers: Array<() => void>
  }>
}

const noop = () => {}

/**
 * @public
 */
export const createController = (input: {targetOrigin: string}): Controller => {
  const {targetOrigin} = input
  const targets = new Set<MessageEventSource>()
  const connections = new Set<Connection>()

  const addTarget = (target: MessageEventSource) => {
    // If the target has already been added, return just a noop cleanup
    if (targets.has(target)) {
      return noop
    }

    if (!targets.size || !connections.size) {
      targets.add(target)

      // If there are existing connections, set the target on all existing
      // channels, and trigger a connection event
      connections.forEach((connection) => {
        connection.channels.forEach((channel) => {
          channel.setTarget(target)
          channel.connect()
        })
      })
      // We perform a 'soft' cleanup here: disconnect only as we want to
      // maintain at least one live channel per connection
      return () => {
        targets.delete(target)
        connections.forEach((connection) => {
          connection.channels.forEach((channel) => {
            if (channel.target === target) {
              channel.disconnect()
            }
          })
        })
      }
    }

    targets.add(target)

    // Maintain a list of channels to cleanup
    const targetChannels = new Set<Channel<Message, Message>>()

    // If we already have targets and connections, we need to create new
    // channels for each source with all the associated subscribers.
    connections.forEach((connection) => {
      const channel = createChannel(
        {
          ...connection.input,
          target,
          targetOrigin,
        },
        connection.machine,
      )

      targetChannels.add(channel)
      connection.channels.add(channel)

      connection.subscribers.forEach(({type, handler, unsubscribers}) => {
        unsubscribers.push(channel.on(type, handler))
      })
      connection.internalEventSubscribers.forEach(({type, handler, unsubscribers}) => {
        // @ts-expect-error @todo
        unsubscribers.push(channel.actor.on(type, handler).unsubscribe)
      })
      connection.statusSubscribers.forEach(({handler, unsubscribers}) => {
        unsubscribers.push(channel.onStatus((status) => handler({channel: channel.id, status})))
      })

      channel.start()
      channel.connect()
    })

    // We perform a more 'aggressive' cleanup here as we do not need to maintain
    // these 'duplicate' channels: disconnect, stop, and remove the channel from
    // all connections
    return () => {
      targets.delete(target)
      targetChannels.forEach((channel) => {
        cleanupChannel(channel)
        connections.forEach((connection) => {
          connection.channels.delete(channel)
        })
      })
    }
  }

  const createConnection = <R extends Message, S extends Message>(
    input: ConnectionInput,
    machine: ChannelActorLogic<R, S> = createChannelMachine<R, S>(),
  ): ConnectionInstance<R, S> => {
    const connection: Connection<R, S> = {
      channels: new Set(),
      input,
      internalEventSubscribers: new Set(),
      machine,
      statusSubscribers: new Set(),
      subscribers: new Set(),
    }

    connections.add(connection as unknown as Connection)

    const {channels, internalEventSubscribers, statusSubscribers, subscribers} = connection

    if (targets.size) {
      // If targets have already been added, create a channel for each target
      targets.forEach((target) => {
        const channel = createChannel<R, S>(
          {
            ...input,
            target,
            targetOrigin,
          },
          machine,
        )
        channels.add(channel)
      })
    } else {
      // If targets have not been added yet, create a channel without a target
      const channel = createChannel<R, S>({...input, targetOrigin}, machine)
      channels.add(channel)
    }

    const post: ConnectionInstance<R, S>['post'] = (data) => {
      channels.forEach((channel) => {
        channel.post(data)
      })
    }

    const on: ConnectionInstance<R, S>['on'] = (type, handler) => {
      const unsubscribers: Array<() => void> = []
      channels.forEach((channel) => {
        unsubscribers.push(channel.on(type, handler))
      })
      const subscriber = {type, handler, unsubscribers}
      subscribers.add(subscriber)
      return () => {
        unsubscribers.forEach((unsub) => unsub())
        subscribers.delete(subscriber)
      }
    }

    const onInternalEvent = <
      T extends InternalEmitEvent<R, S>['type'],
      U extends Extract<InternalEmitEvent<R, S>, {type: T}>,
    >(
      type: T,
      handler: (event: U) => void,
    ) => {
      const unsubscribers: Array<() => void> = []
      channels.forEach((channel) => {
        // @ts-expect-error @todo @help
        unsubscribers.push(channel.actor.on(type, handler).unsubscribe)
      })
      const subscriber = {type, handler, unsubscribers}
      // @ts-expect-error @todo @help
      internalEventSubscribers.add(subscriber)
      return () => {
        unsubscribers.forEach((unsub) => unsub())
        // @ts-expect-error @todo @help
        internalEventSubscribers.delete(subscriber)
      }
    }

    const onStatus = (handler: (event: StatusEvent) => void) => {
      const unsubscribers: Array<() => void> = []
      channels.forEach((channel) => {
        unsubscribers.push(channel.onStatus((status) => handler({channel: channel.id, status})))
      })
      const subscriber = {handler, unsubscribers}
      statusSubscribers.add(subscriber)
      return () => {
        unsubscribers.forEach((unsub) => unsub())
        statusSubscribers.delete(subscriber)
      }
    }

    // Stop a connection, cleanup all channels and remove the connection itself
    // from the controller
    // @todo Remove casting
    const stop = () => {
      const channels = connection.channels as unknown as Set<Channel>
      channels.forEach(cleanupChannel)
      channels.clear()
      connections.delete(connection as unknown as Connection)
    }

    const start = () => {
      channels.forEach((channel) => {
        channel.start()
        channel.connect()
      })

      return stop
    }

    return {
      on,
      onInternalEvent,
      onStatus,
      post,
      start,
      stop,
    }
  }

  // Destroy the controller, cleanup all channels in all connections
  const destroy = () => {
    connections.forEach(({channels}) => {
      channels.forEach(cleanupChannel)
      channels.clear()
    })
    connections.clear()
    targets.clear()
  }

  return {
    addTarget,
    createConnection,
    destroy,
  }
}
