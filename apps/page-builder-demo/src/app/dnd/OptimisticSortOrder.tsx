'use client'

import type {DndTestPage} from '@/sanity.types'
import type {SanityDocument} from '@sanity/client'
import {type StudioPathLike} from '@sanity/client/csm'
import {get} from '@sanity/util/paths'
import {useOptimistic} from '@sanity/visual-editing'

/**
 * The way CSS is rendered here is following new patterns in React 19, and doesn't work on React 18
 * https://react.dev/reference/react-dom/components/style#rendering-an-inline-css-stylesheet
 */

export function OptimisticSortOrder(props: {
  'children': React.ReactNode
  'data-sanity'?: string
  'className'?: string
  /**
   * This format is trading readability with the samllest possible payload size,
   * to demonstrate how small the client footprint can be when everything is server rendered,
   * while the handling of optimistic state is a thin client component wrapper, using CSS to change the order optimistically
   */
  'snapshot': string[]
  /**
   * The id is needed to enable the optimistic state reducer to know if the document being mutated is relevant to the action
   */
  'id': string
  /**
   * Where from the source document we're applying optimistic state
   */
  'path'?: StudioPathLike
}) {
  const {className, children, id, snapshot, path = ['children'], ...rest} = props

  const optimistic = useOptimistic<
    {snapshot: string[]; ordering: null | number[]},
    SanityDocument<DndTestPage>
  >({snapshot, ordering: null}, (state, action) => {
    if (action.id !== id) return state
    const value = get(action.document, path) as {_key: string}[]
    if (!value) {
      console.warn('No value found for path', path, 'in document', action.document)
      return state
    }
    return {
      snapshot: state.snapshot,
      ordering: state.snapshot.map((key, index) => {
        const order = value.findIndex((item) => item._key === key)
        if (order === -1) return index
        return order
      }),
    }
  })

  let stylesheet: string | null = null
  let optimisticClassName: string | null = null
  if (optimistic.ordering && !optimistic.ordering.every((order, index) => order === index)) {
    optimisticClassName = `optimistic-${hash(JSON.stringify({optimistic, id, path}))}`
    stylesheet = optimistic.ordering
      .map(
        (order, index) =>
          `.${optimisticClassName} > :nth-child(${index + 1}) \{ order: ${order}; \}`,
      )
      .join('\n')
  }

  return (
    <div
      {...rest}
      className={
        optimisticClassName
          ? className
            ? `${className} ${optimisticClassName}`
            : optimisticClassName
          : className
      }
    >
      {stylesheet && (
        <style
          href={`OptimisticSortOrder-${optimisticClassName}`}
          precedence="optimistic"
          data-debug={JSON.stringify({optimistic, id, path})}
        >
          {stylesheet}
        </style>
      )}
      {children}
    </div>
  )
}

const SEED = 5381
const phash = (h: number, x: string) => {
  let i = x.length

  while (i) {
    h = (h * 33) ^ x.charCodeAt(--i)
  }

  return h
}
const hash = (x: string) => {
  return phash(SEED, x)
}
