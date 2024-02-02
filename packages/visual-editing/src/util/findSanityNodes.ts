import { decodeSanityNodeData } from '@sanity/visual-editing-helpers/csm'

import { OVERLAY_ID } from '../constants'
import { _ResolvedElement, SanityNode, SanityNodeLegacy } from '../types'
import { findNonInlineElement } from './findNonInlineElement'
import { testAndDecodeStega } from './stega'

const isElementNode = (node: ChildNode): node is HTMLElement =>
  node.nodeType === Node.ELEMENT_NODE

const isImgElement = (el: HTMLElement): el is HTMLImageElement =>
  el.tagName === 'IMG'

const isTimeElement = (el: HTMLElement): el is HTMLTimeElement =>
  el.tagName === 'TIME'

function isSanityNode(node: SanityNode | SanityNodeLegacy): node is SanityNode {
  return 'path' in node
}

/**
 * Finds commonality between two document paths strings
 * @param first First path to compare
 * @param second Second path to compare
 * @returns A common path
 */
export function findCommonPath(first: string, second: string): string {
  let firstParts = first.split('.')
  let secondParts = second.split('.')
  const maxLength = Math.min(firstParts.length, secondParts.length)
  firstParts = firstParts.slice(0, maxLength).reverse()
  secondParts = secondParts.slice(0, maxLength).reverse()

  return firstParts
    .reduce(
      (parts, part, i) => (part === secondParts[i] ? [...parts, part] : []),
      [] as string[],
    )
    .reverse()
    .join('.')
}

/**
 * Returns common Sanity node data from multiple nodes
 * If doocument paths are present, tries to resolve a common path
 * @param nodes An array of Sanity nodes
 * @returns A single sanity node or undefined
 * @internal
 */
export function findCommonSanityData(
  nodes: (SanityNode | SanityNodeLegacy)[],
): SanityNode | SanityNodeLegacy | undefined {
  // If there are no nodes, or inconsistent node types
  if (
    !nodes.length ||
    !nodes.map((n) => isSanityNode(n)).every((n, _i, arr) => n === arr[0])
  ) {
    return undefined
  }
  // If legacy nodes, return first match (no common pathfinding)
  if (!isSanityNode(nodes[0])) return nodes[0]

  const sanityNodes = nodes.filter(isSanityNode)
  let common: SanityNode | undefined = nodes[0]

  const consistentValueKeys: Array<keyof SanityNode> = [
    'projectId',
    'dataset',
    'id',
    'baseUrl',
    'workspace',
    'tool',
  ]
  for (let i = 1; i < sanityNodes.length; i++) {
    const node = sanityNodes[i]
    if (consistentValueKeys.some((key) => node[key] !== common?.[key])) {
      common = undefined
      break
    }

    common.path = findCommonPath(common.path, node.path)
  }

  return common
}

/**
 * Finds nodes containing sanity specific data
 * @param el - A parent element to traverse
 * @returns An array of objects, each containing an HTML element and decoded sanity data
 * @internal
 */
export function findSanityNodes(
  el: HTMLElement | ChildNode | { childNodes: HTMLElement[] },
): _ResolvedElement[] {
  const elements: _ResolvedElement[] = []

  function addElement(element: HTMLElement, data: string) {
    const sanity = decodeSanityNodeData(data)
    if (!sanity) {
      return
    }

    const measureElement = findNonInlineElement(element)
    if (!measureElement) {
      return
    }

    elements.push({
      elements: {
        element,
        measureElement,
      },
      sanity,
    })
  }

  if (el) {
    for (const node of el.childNodes) {
      const { nodeType, parentElement, textContent } = node
      // If an edit target is found, find common paths
      if (isElementNode(node) && node.dataset?.sanityEditTarget !== undefined) {
        const nodesInTarget = findSanityNodes(node).map(({ sanity }) => sanity)
        // If there are inconsistent node types, continue
        if (
          !nodesInTarget
            .map((n) => isSanityNode(n))
            .every((n, _i, arr) => n === arr[0])
        ) {
          continue
        }

        const commonData = findCommonSanityData(nodesInTarget)

        if (commonData) {
          elements.push({
            elements: {
              element: node,
              measureElement: node,
            },
            sanity: commonData,
          })
        }

        // Check non-empty, child-only text nodes for stega strings
      } else if (nodeType === Node.TEXT_NODE && parentElement && textContent) {
        const data = testAndDecodeStega(textContent)
        if (!data) continue
        addElement(parentElement, data)
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
