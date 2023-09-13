import { OVERLAY_ID } from './constants'
import { decodeSanityDataAttributeValue } from './decodeSanityNodes'
import { testAndDecodeStega } from './stega'
import { _ResolvedElement } from './types'

const isElementNode = (node: ChildNode): node is HTMLElement =>
  node.nodeType === Node.ELEMENT_NODE

const isImgElement = (el: HTMLElement): el is HTMLImageElement =>
  el.tagName === 'IMG'

const isTimeElement = (el: HTMLElement): el is HTMLTimeElement =>
  el.tagName === 'TIME'

const isTypographicElement = (
  el: HTMLElement,
): el is HTMLSpanElement | HTMLElement =>
  ['SPAN', 'B', 'STRONG'].includes(el.tagName)

/**
 * Finds nodes containing sanity specific data
 * @param el - A parent element to traverse
 * @returns An array of objects, each containing an HTML element and decoded sanity data
 * @internal
 */
export function findSanityNodes(
  el: HTMLElement | ChildNode,
): _ResolvedElement[] {
  const elements: _ResolvedElement[] = []

  function addElement(element: HTMLElement, data: string) {
    const sanity = decodeSanityDataAttributeValue(data)
    if (!sanity) {
      return
    }
    elements.push({
      element,
      sanity,
    })
  }

  if (el) {
    for (const node of el.childNodes) {
      const { nodeType, parentElement, textContent } = node
      // Scenario 1
      // Check non-empty, child-only text nodes for stega strings
      if (nodeType === Node.TEXT_NODE && parentElement && textContent) {
        const data = testAndDecodeStega(textContent)
        if (!data) continue
        // @todo Should spans not be targeted?
        if (
          isTypographicElement(parentElement) &&
          parentElement.parentElement
        ) {
          addElement(parentElement.parentElement, data)
        } else {
          addElement(parentElement, data)
        }
        // No need to recurse for text nodes
        continue
      }
      // Check element nodes for data attributes, alt tags, etc
      else if (isElementNode(node)) {
        // Do not traverse script tags
        // Do not traverse the visual editing overlay
        if (node.tagName === 'SCRIPT' || node.id === OVERLAY_ID) {
          continue
        }

        // Prefer elements with explicit data attributes
        if (node.dataset?.sanity) {
          addElement(node, node.dataset.sanity)
        }
        // Look for legacy sanity data attributes
        else if (node.dataset?.sanityEditInfo) {
          addElement(node, node.dataset.sanityEditInfo)
        }
        // If edit target, find common paths
        else if (node.dataset?.sanityEditTarget) {
          // @todo logic for common pathfinding
          const data = ''
          addElement(node, data)
          // No need to recurse for elements with a target data attr
          continue
        } else if (isImgElement(node)) {
          const data = testAndDecodeStega(node.alt, true)
          if (!data) continue
          addElement(node, data)
          // No need to recurse for img elements
          continue
        } else if (isTimeElement(node)) {
          const data = testAndDecodeStega(node.dateTime, true)
          addElement(node, data)
        }

        elements.push(...findSanityNodes(node))
      }
    }
  }
  return elements
}
