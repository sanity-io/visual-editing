'use client'

import type {SanityDocument} from '@sanity/client'

import {type StudioPathLike} from '@sanity/client/csm'
import {get} from '@sanity/util/paths'
import {useOptimistic} from '@sanity/visual-editing'
import {Children, isValidElement} from 'react'

import type {DndTestPage} from '@/sanity.types'

/**
 * This component is used to apply optimistic state to a list of children. It is used to
 * provide a smooth user experience when reordering items in a list. The component
 * expects the children to have a unique key prop, and will reorder the children based
 * on the optimistic state.
 */

export function OptimisticSortOrder(props: {
  children: React.ReactNode
  /**
   * The id is needed to enable the optimistic state reducer to know if the document being mutated is relevant to the action
   */
  id: string
  /**
   * Where from the source document we're applying optimistic state
   */
  path?: StudioPathLike
}) {
  const {children, id, path = ['children']} = props
  const childrenLength = Children.count(children)

  const optimistic = useOptimistic<null | string[], SanityDocument<DndTestPage>>(
    null,
    (state, action) => {
      if (action.id !== id) return state
      const value = get(action.document, path) as {_key: string}[]
      if (!value) {
        console.error('No value found for path', path, 'in document', action.document)
        return state
      }
      const result = value.map(({_key}) => _key)
      // Support .slice?.(0, 4) being used to limit the number of items in `page.tsx`
      if (result.length > childrenLength) {
        result.length = childrenLength
      }
      return result
    },
  )

  if (optimistic) {
    if (optimistic.length < childrenLength) {
      // If the optimistic state is shorter than children, then we don't have enough data to accurately reorder the children so we bail
      return children
    }

    const cache = new Map<string, React.ReactNode>()
    Children.forEach(children, (child) => {
      if (!isValidElement(child) || !child.key) return
      cache.set(child.key, child)
    })
    return optimistic.map((key) => cache.get(key))
  }

  return children
}
