import type {MutationEvent, ReconnectEvent, WelcomeEvent} from '@sanity/client'
import {SanityEncoder} from '@sanity/mutate'
import {
  createContentLakeStore,
  type ListenerSyncEvent,
  type SanityMutation,
} from '@sanity/mutate/_unstable_store'
import type {SanityDocument} from '@sanity/types'
import {type FunctionComponent, type PropsWithChildren, useEffect, useMemo, useState} from 'react'
import {
  concatMap,
  filter,
  from,
  map,
  type Observable,
  of as observableOf,
  Subject,
  Subscription,
  tap,
  timer,
} from 'rxjs'

import {LISTENER_RESET_DELAY} from '../../constants'
import type {VisualEditingNode} from '../../types'
import {getDraftId} from '../../util/documents'
import {shareReplayLatest} from '../../util/shareReplayLatest.ts'
import {OptimisticStateContext, type OptimisticStateContextValue} from './OptimisticStateContext'
import {useOptimisticStateStore} from './useOptimisticStateStore'

function getInitialSnapshot(comlink: VisualEditingNode, documentId: string) {
  return from(
    comlink.fetch({
      type: 'visual-editing/fetch-snapshot',
      data: {documentId},
    }),
  ).pipe(map(({snapshot}) => snapshot))
}

export const OptimisticStateProvider: FunctionComponent<
  PropsWithChildren<{
    comlink: VisualEditingNode
    documentIds: string[]
  }>
> = function (props) {
  const {children, comlink, documentIds} = props

  const [uniqueIds, setUniqueIds] = useState<string[]>([])

  useEffect(() => {
    setUniqueIds((prev) => {
      const next = Array.from(new Set(documentIds.map(getDraftId)))
      return prev.length === next.length &&
        prev.reduce((acc, prevId) => acc.filter((id) => id !== prevId), next)?.length === 0
        ? prev
        : next
    })
  }, [documentIds])

  const [incomingEvents$] = useState(
    () => new Subject<WelcomeEvent | MutationEvent | ReconnectEvent>(),
  )

  const events$ = useMemo(() => {
    return incomingEvents$.pipe(
      shareReplayLatest({
        predicate: (event) => event.type === 'welcome' || event.type === 'reconnect',
        resetOnRefCountZero: () => timer(LISTENER_RESET_DELAY),
      }),
    )
  }, [incomingEvents$])

  const datastore = useMemo(() => {
    const RECONNECT_EVENT: ReconnectEvent = {type: 'reconnect'}
    return createContentLakeStore({
      observe: (documentId) => {
        return events$.pipe(
          filter((event) => (event.type === 'mutation' ? event.documentId === documentId : true)),
          concatMap((event) => {
            if (event.type === 'reconnect') {
              return observableOf(RECONNECT_EVENT)
            }
            if (event.type === 'welcome') {
              return getInitialSnapshot(comlink, documentId).pipe(
                map(
                  (doc): ListenerSyncEvent => ({
                    type: 'sync',
                    transactionId: doc?._id,
                    document: doc,
                  }),
                ),
              )
            }
            return observableOf({
              type: 'mutation' as const,
              transactionId: event.transactionId,
              effects: event.effects!.apply,
              mutations: event.mutations as SanityMutation[],
            })
          }),
        )
      },
      submit: (transactions) => {
        return from(transactions).pipe(
          concatMap((transaction) => {
            const data = SanityEncoder.encodeTransaction(transaction)
            return comlink.fetch({type: 'visual-editing/mutate', data})
          }),
        ) as Observable<object>
      },
    })
  }, [comlink, events$])

  const {add: addDocument, clear: clearDocuments} = useOptimisticStateStore()

  useEffect(() => {
    const datastoreSubscriptions = new Subscription()
    uniqueIds.forEach((documentId) => {
      datastoreSubscriptions.add(
        datastore
          .observeEvents(documentId)
          .pipe(
            tap((event) => {
              const document = (
                event.type === 'optimistic' ? event.after : event.after.remote
              ) as SanityDocument
              addDocument(document)
            }),
          )
          .subscribe(),
      )
    })

    const unsubscribeFromEvents = comlink.on('presentation/snapshot-event', (data) => {
      incomingEvents$.next(data.event)
    })

    comlink.post({type: 'visual-editing/observe-documents', data: {documentIds: uniqueIds}})

    return () => {
      clearDocuments()
      unsubscribeFromEvents()
      datastoreSubscriptions.unsubscribe()
    }
  }, [addDocument, clearDocuments, comlink, datastore, incomingEvents$, uniqueIds])

  const context = useMemo<OptimisticStateContextValue>(
    () => ({
      comlink,
      datastore,
    }),
    [comlink, datastore],
  )

  return (
    <OptimisticStateContext.Provider value={context}>{children}</OptimisticStateContext.Provider>
  )
}
