import {
  type ListenEvent,
  type MutationEvent,
  type ReconnectEvent,
  type WelcomeEvent,
} from '@sanity/client'
import {filter, merge, Observable, shareReplay, Subject, type ObservedValueOf} from 'rxjs'
import type {VisualEditingNode} from '../../../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SharedListenEvent = ListenEvent<Record<string, any>>

/**
 * Creates a single, shared, listener EventSource that strems remote mutations, and notifies when it's online (welcome), offline (reconnect).
 */
export function createSharedListener(comlink: VisualEditingNode): Observable<SharedListenEvent> {
  const incomingEvents$ = new Subject<SharedListenEvent>()

  comlink.on('presentation/snapshot-event', (data) => {
    incomingEvents$.next(data.event)
  })

  // Reconnect events emitted in case the connection is lost
  const reconnect = incomingEvents$.pipe(
    filter((event): event is ReconnectEvent => event.type === 'reconnect'),
  )

  // Welcome events are emitted when the listener is (re)connected
  const welcome = incomingEvents$.pipe(
    filter((event): event is WelcomeEvent => event.type === 'welcome'),
  )

  // Mutation events coming from the listener
  const mutations = incomingEvents$.pipe(
    filter((event): event is MutationEvent => event.type === 'mutation'),
  )

  // Replay the latest connection event that was emitted either when the connection was disconnected ('reconnect'), established or re-established ('welcome')
  const connectionEvent = merge(welcome, reconnect).pipe(
    shareReplay({bufferSize: 1, refCount: false}),
  )

  // Emit the welcome event if the latest connection event was the 'welcome' event.
  // Downstream subscribers will typically map the welcome event to an initial fetch
  const replayWelcome = connectionEvent.pipe(
    filter((latestConnectionEvent) => latestConnectionEvent.type === 'welcome'),
  )

  // Combine into a single stream
  return merge(replayWelcome, mutations, reconnect)
}

export type SharedListenerEvents = ObservedValueOf<ReturnType<typeof createSharedListener>>
