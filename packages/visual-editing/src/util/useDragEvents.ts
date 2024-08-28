import {at, createIfNotExists, insert, patch, unset} from '@sanity/mutate'
import {get} from '@sanity/util/paths'
import {useCallback, useContext, useEffect} from 'react'

import type {DragEndEvent} from '../types'
import {useOptimisticStateStore} from '../ui/optimistic-state/optimisticState'
import {OptimisticStateContext} from '../ui/optimistic-state/OptimisticStateContext'
import {getDraftId} from './documents'

export function useDragEndEvents(): {
  dispatchDragEndEvent: (event: DragEndEvent) => void
} {
  const {datastore} = useContext(OptimisticStateContext)!
  const {documents} = useOptimisticStateStore()

  useEffect(() => {
    const handler = (e: CustomEvent<DragEndEvent>) => {
      const {insertPosition, target} = e.detail
      if (insertPosition?.top) {
        const id = getDraftId(target.id)
        const doc = documents.get(id)
        const elementValue = get(doc, target.path)
        const result = insertPosition.top.sanity.path.match(/^(.+)\[_key=="(.+)"]$/)
        if (!result) return
        const [, arrayPath, referenceItemKey] = result
        if (referenceItemKey && arrayPath) {
          const mutations = [
            createIfNotExists({_id: id, _type: target.type!}),
            patch(id, at(target.path, unset())),
            patch(id, at(arrayPath, insert(elementValue, 'after', {_key: referenceItemKey}))),
          ]
          datastore.mutate(mutations)
          datastore.submit()
        }
      }
    }
    window.addEventListener('sanity/dragEnd', handler as EventListener)
    return () => {
      window.removeEventListener('sanity/dragEnd', handler as EventListener)
    }
  }, [datastore, documents])

  const dispatchDragEndEvent = useCallback((event: DragEndEvent) => {
    const customEvent = new CustomEvent<DragEndEvent>('sanity/dragEnd', {
      detail: event,
    })
    window.dispatchEvent(customEvent)
  }, [])

  return {dispatchDragEndEvent}
}
