import {
  cleanupConnection,
  createConnection,
  createConnectionMachine,
  type Connection,
  type ConnectionActorLogic,
  type ConnectionInput,
} from './connection'
import {type InternalEmitEvent, type Message, type StatusEvent, type WithoutResponse} from './types'

/**
 * @public
 */
export type ChannelInput = Omit<ConnectionInput, 'target' | 'targetOrigin'>

/**
 * @public
 */
export interface ChannelInstance<R extends Message, S extends Message> {
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
  createChannel: <R extends Message, S extends Message>(
    input: ChannelInput,
    machine?: ConnectionActorLogic<R, S>,
  ) => ChannelInstance<R, S>
  destroy: () => void
}

interface Channel<
  R extends Message = Message,
  S extends Message = Message,
  T extends InternalEmitEvent<R, S>['type'] = InternalEmitEvent<R, S>['type'],
> {
  input: ChannelInput
  connections: Set<Connection<R, S>>
  internalEventSubscribers: Set<{
    type: T
    handler: (event: Extract<InternalEmitEvent<R, S>, {type: T}>) => void
    unsubscribers: Array<() => void>
  }>
  machine: ConnectionActorLogic<R, S>
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
  const channels = new Set<Channel>()

  const addTarget = (target: MessageEventSource) => {
    // If the target has already been added, return just a noop cleanup
    if (targets.has(target)) {
      return noop
    }

    if (!targets.size || !channels.size) {
      targets.add(target)

      // If there are existing connections, set the target on all existing
      // channels, and trigger a connection event
      channels.forEach((channel) => {
        channel.connections.forEach((connection) => {
          connection.setTarget(target)
          connection.connect()
        })
      })
      // We perform a 'soft' cleanup here: disconnect only as we want to
      // maintain at least one live channel per connection
      return () => {
        targets.delete(target)
        channels.forEach((channel) => {
          channel.connections.forEach((connection) => {
            if (connection.target === target) {
              connection.disconnect()
            }
          })
        })
      }
    }

    targets.add(target)

    // Maintain a list of connections to cleanup
    const targetConnections = new Set<Connection<Message, Message>>()

    // If we already have targets and connections, we need to create new
    // channels for each source with all the associated subscribers.
    channels.forEach((channel) => {
      const connection = createConnection(
        {
          ...channel.input,
          target,
          targetOrigin,
        },
        channel.machine,
      )

      targetConnections.add(connection)
      channel.connections.add(connection)

      channel.subscribers.forEach(({type, handler, unsubscribers}) => {
        unsubscribers.push(connection.on(type, handler))
      })
      channel.internalEventSubscribers.forEach(({type, handler, unsubscribers}) => {
        // @ts-expect-error @todo
        unsubscribers.push(connection.actor.on(type, handler).unsubscribe)
      })
      channel.statusSubscribers.forEach(({handler, unsubscribers}) => {
        unsubscribers.push(
          connection.onStatus((status) => handler({connection: connection.id, status})),
        )
      })

      connection.start()
      connection.connect()
    })

    // We perform a more 'aggressive' cleanup here as we do not need to maintain
    // these 'duplicate' channels: disconnect, stop, and remove the channel from
    // all connections
    return () => {
      targets.delete(target)
      targetConnections.forEach((connection) => {
        cleanupConnection(connection)
        channels.forEach((channel) => {
          channel.connections.delete(connection)
        })
      })
    }
  }

  const createChannel = <R extends Message, S extends Message>(
    input: ChannelInput,
    machine: ConnectionActorLogic<R, S> = createConnectionMachine<R, S>(),
  ): ChannelInstance<R, S> => {
    const channel: Channel<R, S> = {
      connections: new Set(),
      input,
      internalEventSubscribers: new Set(),
      machine,
      statusSubscribers: new Set(),
      subscribers: new Set(),
    }

    channels.add(channel as unknown as Channel)

    const {connections, internalEventSubscribers, statusSubscribers, subscribers} = channel

    if (targets.size) {
      // If targets have already been added, create a connection for each target
      targets.forEach((target) => {
        const connection = createConnection<R, S>(
          {
            ...input,
            target,
            targetOrigin,
          },
          machine,
        )
        connections.add(connection)
      })
    } else {
      // If targets have not been added yet, create a channel without a target
      const connection = createConnection<R, S>({...input, targetOrigin}, machine)
      connections.add(connection)
    }

    const post: ChannelInstance<R, S>['post'] = (data) => {
      connections.forEach((connection) => {
        connection.post(data)
      })
    }

    const on: ChannelInstance<R, S>['on'] = (type, handler) => {
      const unsubscribers: Array<() => void> = []
      connections.forEach((connection) => {
        unsubscribers.push(connection.on(type, handler))
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
      connections.forEach((connection) => {
        // @ts-expect-error @todo @help
        unsubscribers.push(connection.actor.on(type, handler).unsubscribe)
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
      connections.forEach((connection) => {
        unsubscribers.push(
          connection.onStatus((status) => handler({connection: connection.id, status})),
        )
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
      const connections = channel.connections as unknown as Set<Connection>
      connections.forEach(cleanupConnection)
      connections.clear()
      channels.delete(channel as unknown as Channel)
    }

    const start = () => {
      connections.forEach((connection) => {
        connection.start()
        connection.connect()
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
    channels.forEach(({connections}) => {
      connections.forEach(cleanupConnection)
      connections.clear()
    })
    channels.clear()
    targets.clear()
  }

  return {
    addTarget,
    createChannel,
    destroy,
  }
}
