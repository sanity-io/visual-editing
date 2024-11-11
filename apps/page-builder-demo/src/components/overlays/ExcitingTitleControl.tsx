'use client'

import {at, set} from '@sanity/mutate'
import {get} from '@sanity/util/paths'
import {SanityNode, useDocuments, type OverlayComponent} from '@sanity/visual-editing'
import {FunctionComponent, HTMLAttributes, PropsWithChildren} from 'react'

export const ExcitingTitleControl: FunctionComponent<{
  node: SanityNode
  PointerEvents: FunctionComponent<PropsWithChildren<HTMLAttributes<HTMLDivElement>>>
}> = (props) => {
  const {node, PointerEvents} = props

  const {getDocument} = useDocuments()
  const doc = getDocument(node.id)

  const onChange = () => {
    doc.patch(({snapshot}) => {
      const currentValue = get(snapshot, node.path)
      const newValue = `${currentValue}!`
      return [at(node.path, set(newValue))]
    })
  }

  return (
    <PointerEvents>
      <button
        className="absolute right-0 rounded bg-blue-500 px-2 py-1 text-sm text-white"
        onClick={onChange}
      >
        🎉
      </button>
    </PointerEvents>
  )
}
