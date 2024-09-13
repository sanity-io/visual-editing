import {at, createIfNotExists, insert, patch, unset} from '@sanity/mutate'
import {get} from '@sanity/util/paths'
import {useCallback, useEffect} from 'react'

import type {DragEndEvent} from '../types'
import {isEmptyActor} from '../ui/optimistic-state/context'
import {useOptimisticActor} from '../ui/optimistic-state/useOptimisticActor'
import {getDraftId} from './documents'
import {getArrayItemKeyAndParentPath} from './mutations'

export function useDragEndEvents(): {
  dispatchDragEndEvent: (event: DragEndEvent) => void
} {
  const actor = useOptimisticActor()

  useEffect(() => {
    if (isEmptyActor(actor)) {
      return
    }
    const handler = (e: CustomEvent<DragEndEvent>) => {
      const {insertPosition, target} = e.detail
      if (insertPosition?.top) {
        const id = getDraftId(target.id)
        const snapshotContext = actor.getSnapshot().context
        const doc = snapshotContext.documents[id]
        if (!doc) return
        const documentSnapshot = doc.getSnapshot().context.local
        if (!documentSnapshot) return
        const elementValue = get(documentSnapshot, target.path)
        const {path: arrayPath, key: referenceItemKey} = getArrayItemKeyAndParentPath(
          insertPosition.top.sanity,
        )
        if (referenceItemKey && arrayPath) {
          const mutations = [
            createIfNotExists({_id: id, _type: target.type!}),
            patch(id, at(target.path, unset())),
            patch(id, at(arrayPath, insert(elementValue, 'after', {_key: referenceItemKey}))),
          ]

          doc.send({
            type: 'mutate',
            mutations: mutations,
          })
          doc.send({type: 'submit'})
        }
      }
    }
    window.addEventListener('sanity/dragEnd', handler as EventListener)
    return () => {
      window.removeEventListener('sanity/dragEnd', handler as EventListener)
    }
  }, [actor])

  const dispatchDragEndEvent = useCallback((event: DragEndEvent) => {
    const customEvent = new CustomEvent<DragEndEvent>('sanity/dragEnd', {
      detail: event,
    })
    window.dispatchEvent(customEvent)
  }, [])

  return {dispatchDragEndEvent}
}
