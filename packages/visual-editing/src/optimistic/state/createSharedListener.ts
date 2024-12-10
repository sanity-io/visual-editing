import {type ListenEvent} from '@sanity/client'
import {merge, ReplaySubject, Subject, type Observable, type ObservedValueOf} from 'rxjs'
import type {VisualEditingNode} from '../../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SharedListenEvent = ListenEvent<Record<string, any>>

/**
 * Creates a single, shared, listener EventSource that strems remote mutations, and notifies when it's online (welcome), offline (reconnect).
 */
export function createSharedListener(comlink: VisualEditingNode): Observable<SharedListenEvent> {
  // Welcome events could be received before the listener has been subscribed
  // to. Using a ReplaySubject will ensure the welcome event is re-emitted when
  // a new subscriber arrives.
  const incomingConnection$ = new ReplaySubject<SharedListenEvent>(1)
  const incomingMutations$ = new Subject<SharedListenEvent>()

  comlink
    .fetch('visual-editing/snapshot-welcome', undefined, {suppressWarnings: true})
    .then((data) => {
      incomingConnection$.next(data.event)
    })
    .catch(() => {
      // Fail silently as the app may be communicating with a version of
      // Presentation that does not support this feature
    })

  comlink.on('presentation/snapshot-event', (data) => {
    // Welcome events are still emitted by Presentation for backwards
    // compatibility. We don't need them anymore as we explicitly fetch the
    // welcome event, so filter them out here.
    if (data.event.type === 'reconnect') {
      incomingConnection$.next(data.event)
    }
    if (data.event.type === 'mutation') {
      incomingMutations$.next(data.event)
    }
  })

  return merge(incomingConnection$, incomingMutations$)
}

export type SharedListenerEvents = ObservedValueOf<ReturnType<typeof createSharedListener>>
