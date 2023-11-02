import { encodeSanityNodeData } from '@sanity/overlays'
import type { HTMLProps, Ref } from 'react'
import { createElement, forwardRef } from 'react'
import type { SourceNode } from 'visual-editing-helpers/csm'

export interface SanityElementProps {
  children?: SourceNode | null
}

export const SanityElement = forwardRef(function SanityElement(
  props: { as: string } & SanityElementProps &
    Omit<HTMLProps<HTMLElement>, 'children'>,
  ref: Ref<HTMLElement | SVGElement>,
) {
  const { as, children: node, ...restProps } = props

  if (node?.source) {
    return createElement(
      as,
      {
        ...restProps,
        'data-sanity': encodeSanityNodeData(node.source),
        ref,
      },
      node.value,
    )
  }

  return createElement(as, restProps, node?.value)
})
