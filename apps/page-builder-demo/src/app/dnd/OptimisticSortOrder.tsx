'use client'

import type {DndTestPage} from '@/sanity.types'
import type {SanityDocument} from '@sanity/client'
import {type StudioPathLike} from '@sanity/client/csm'
import {get} from '@sanity/util/paths'
import {useOptimistic} from '@sanity/visual-editing'
import {Children, isValidElement} from 'react'

/**
 * The way CSS is rendered here is following new patterns in React 19, and doesn't work on React 18
 * https://react.dev/reference/react-dom/components/style#rendering-an-inline-css-stylesheet
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
        console.warn('No value found for path', path, 'in document', action.document)
        return state
      }
      const result = value.map(({_key}) => _key)
      if (result.length > childrenLength) {
        result.length = childrenLength
      }
      return result
    },
  )

  if (optimistic) {
    if (optimistic.length < childrenLength) {
      console.error('Length mismatch on children', optimistic.length, childrenLength, props)
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
