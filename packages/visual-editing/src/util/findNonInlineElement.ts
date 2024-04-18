import type {ElementNode} from '../types'

export function findNonInlineElement(element: ElementNode): ElementNode | null {
  const {display} = window.getComputedStyle(element)

  if (display !== 'inline') return element

  const parent = element.parentElement

  if (!parent) return null

  return findNonInlineElement(parent)
}
