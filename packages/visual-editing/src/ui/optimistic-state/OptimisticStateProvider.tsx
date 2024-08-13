import type {ChannelsNode} from '@repo/channels'
import type {VisualEditingAPI} from '@repo/visual-editing-helpers'
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
  of as observableOf,
  Subject,
  Subscription,
  tap,
  timer,
} from 'rxjs'

import {LISTENER_RESET_DELAY} from '../../constants'
import {getDraftId} from '../../util/documents'
import {shareReplayLatest} from '../../util/shareReplayLatest'
import {useOptimisticStateStore} from './optimisticState'
import {OptimisticStateContext, type OptimisticStateContextValue} from './OptimisticStateContext'

function getInitialSnapshot(channel: ChannelsNode<VisualEditingAPI>, documentId: string) {
  return from(channel.fetch('snapshots/snapshot', {documentId})).pipe(map(({snapshot}) => snapshot))
}

export const OptimisticStateProvider: FunctionComponent<
  PropsWithChildren<{
    channel: ChannelsNode<VisualEditingAPI>
    documentIds: string[]
  }>
> = function (props) {
  const {children, channel, documentIds} = props

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
              return getInitialSnapshot(channel, documentId).pipe(
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
            const payload = SanityEncoder.encodeTransaction(transaction)
            return channel.fetch('mutate', payload)
          }),
        )
      },
    })
  }, [channel, events$])

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

    const unsubscribeFromEvents = channel.on('snapshot/event', (data) => {
      incomingEvents$.next(data.event)
    })

    channel.post('snapshots/observe', {documentIds: uniqueIds})

    return () => {
      clearDocuments()
      unsubscribeFromEvents()
      datastoreSubscriptions.unsubscribe()
    }
  }, [addDocument, channel, clearDocuments, datastore, incomingEvents$, uniqueIds])

  const context = useMemo<OptimisticStateContextValue>(
    () => ({
      channel,
      datastore,
    }),
    [channel, datastore],
  )

  return (
    <OptimisticStateContext.Provider value={context}>{children}</OptimisticStateContext.Provider>
  )
}
