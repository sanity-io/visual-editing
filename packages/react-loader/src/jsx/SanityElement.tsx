import {encodeSanityNodeData, type SourceNode} from '@repo/visual-editing-helpers/csm'
import type {HTMLProps, Ref} from 'react'
import {forwardRef} from 'react'

export interface SanityElementProps {
  children?: SourceNode | null
}

export const SanityElement = forwardRef(function SanityElement(
  props: {as: string} & SanityElementProps & Omit<HTMLProps<HTMLElement>, 'children'>,
  ref: Ref<HTMLElement | SVGElement>,
) {
  const {as: As, children: node, ...restProps} = props

  if (node?.source) {
    return (
      // @ts-expect-error @TODO find out why children is not allowed in IntrinsicAttributes
      <As {...restProps} data-sanity={encodeSanityNodeData(node.source)} ref={ref}>
        {node.value}
      </As>
    )
  }

  return <As {...restProps}>{node?.value}</As>
})
