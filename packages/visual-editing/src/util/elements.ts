import type {ElementNode} from '../types'

export const isElementNode = (target: EventTarget | null): target is ElementNode => {
  return target instanceof HTMLElement || target instanceof SVGElement
}

export function findNonInlineElement(element: ElementNode): ElementNode | null {
  const {display} = window.getComputedStyle(element)

  if (display !== 'inline') return element

  const parent = element.parentElement

  if (!parent) return null

  return findNonInlineElement(parent)
}

export const findOverlayElement = (
  el: EventTarget | ElementNode | null | undefined,
): ElementNode | null => {
  if (!el || !isElementNode(el)) {
    return null
  }

  if (el.dataset?.['sanityOverlayElement']) {
    return el
  }

  return findOverlayElement(el.parentElement)
}
