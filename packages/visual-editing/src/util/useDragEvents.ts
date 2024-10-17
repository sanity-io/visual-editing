import {at, insert, remove} from '@sanity/mutate'
import {get as getFromPath} from '@sanity/util/paths'
import {useCallback, useEffect} from 'react'
import type {DragEndEvent, DragInsertPosition} from '../types'
import {useDocuments} from '../ui/optimistic-state/useDocuments'
import {getArrayItemKeyAndParentPath} from './mutations'

// Finds the node that the drag end event was relative to, and the relative
// position the new element should be inserted in. If the reference node was
// "top" or "left", we insert "after". If it was "bottom" or "right", we insert
// "before".
function getReferenceNodeAndInsertPosition(position: DragInsertPosition) {
  if (position) {
    const {top, right, bottom, left} = position
    if (left || top) {
      return {node: (left ?? top)!.sanity, position: 'after' as const}
    } else if (right || bottom) {
      return {node: (right ?? bottom)!.sanity, position: 'before' as const}
    }
  }
  return undefined
}

export function useDragEndEvents(): {
  dispatchDragEndEvent: (event: DragEndEvent) => void
} {
  const {getDocument} = useDocuments()

  useEffect(() => {
    const handler = (e: CustomEvent<DragEndEvent>) => {
      if (e.defaultPrevented) return

      const {insertPosition, target} = e.detail
      const reference = getReferenceNodeAndInsertPosition(insertPosition)
      if (reference) {
        const doc = getDocument(target.id)
        // We must have access to the document actor in order to perform the
        // necessary mutations. If this is undefined, something went wrong when
        // resolving the currently in use documents
        const {node, position} = reference
        // Get the key of the element that was dragged
        const {key: targetKey} = getArrayItemKeyAndParentPath(target)
        // Get the key of the reference element, and path to the parent array
        const {path: arrayPath, key: referenceItemKey} = getArrayItemKeyAndParentPath(node)
        // Don't patch if the keys match, as this means the item was only
        // dragged to its existing position, i.e. not moved
        if (arrayPath && referenceItemKey && referenceItemKey !== targetKey) {
          doc.patch(({snapshot}) => {
            // Get the current value of the element we dragged, as we will need
            // to clone this into the new position
            const elementValue = getFromPath(snapshot, target.path)
            return [
              // Remove the original dragged item
              at(arrayPath, remove({_key: targetKey})),
              // Insert the cloned dragged item into its new position
              at(arrayPath, insert(elementValue, position, {_key: referenceItemKey})),
            ]
          })
        }
      }
    }
    window.addEventListener('sanity/dragEnd', handler as EventListener)
    return () => {
      window.removeEventListener('sanity/dragEnd', handler as EventListener)
    }
  }, [getDocument])

  const dispatchDragEndEvent = useCallback((event: DragEndEvent) => {
    const customEvent = new CustomEvent<DragEndEvent>('sanity/dragEnd', {
      detail: event,
      cancelable: true,
    })
    window.dispatchEvent(customEvent)
  }, [])

  return {dispatchDragEndEvent}
}
