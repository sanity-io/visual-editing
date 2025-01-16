import {decodeSanityNodeData} from '@sanity/visual-editing-csm'
import type {
  ElementNode,
  OverlayElement,
  ResolvedElement,
  SanityNode,
  SanityStegaNode,
} from '../types'
import {findNonInlineElement} from './elements'
import {testAndDecodeStega} from './stega'

const isElementNode = (node: ChildNode): node is ElementNode => node.nodeType === Node.ELEMENT_NODE

const isImgElement = (el: ElementNode): el is HTMLImageElement => el.tagName === 'IMG'

const isTimeElement = (el: ElementNode): el is HTMLTimeElement => el.tagName === 'TIME'

const isSvgRootElement = (el: ElementNode): el is SVGSVGElement =>
  el.tagName.toUpperCase() === 'SVG'

export function isSanityNode(node: SanityNode | SanityStegaNode): node is SanityNode {
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
    .reduce((parts, part, i) => (part === secondParts[i] ? [...parts, part] : []), [] as string[])
    .reverse()
    .join('.')
}

/**
 * Returns common Sanity node data from multiple nodes
 * If document paths are present, tries to resolve a common path
 * @param nodes An array of Sanity nodes
 * @returns A single sanity node or undefined
 * @internal
 */
export function findCommonSanityData(
  nodes: (SanityNode | SanityStegaNode)[],
): SanityNode | SanityStegaNode | undefined {
  // If there are no nodes, or inconsistent node types
  if (!nodes.length || !nodes.map((n) => isSanityNode(n)).every((n, _i, arr) => n === arr[0])) {
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
  el: ElementNode | ChildNode | {childNodes: Array<ElementNode>},
): ResolvedElement[] {
  const elements: ResolvedElement[] = []

  function addElement(element: ElementNode, data: SanityStegaNode | string) {
    const sanity = decodeSanityNodeData(data)
    if (!sanity) {
      return
    }

    // resize observer does not fire for non-replaced inline elements https://drafts.csswg.org/resize-observer/#intro
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
      const {nodeType, parentElement, textContent} = node
      // If an edit target is found, find common paths
      if (isElementNode(node) && node.dataset?.['sanityEditTarget'] !== undefined) {
        const nodesInTarget = findSanityNodes(node).map(({sanity}) => sanity)
        // If there are inconsistent node types, continue
        if (!nodesInTarget.map((n) => isSanityNode(n)).every((n, _i, arr) => n === arr[0])) {
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
        if (node.tagName === 'SCRIPT' || node.tagName === 'SANITY-VISUAL-EDITING') {
          continue
        }

        // Prefer elements with explicit data attributes
        if (node.dataset?.['sanity']) {
          addElement(node, node.dataset['sanity'])
        }
        // Look for legacy sanity data attributes
        else if (node.dataset?.['sanityEditInfo']) {
          addElement(node, node.dataset['sanityEditInfo'])
        } else if (isImgElement(node)) {
          const data = testAndDecodeStega(node.alt, true)
          if (!data) continue
          addElement(node, data)
          // No need to recurse for img elements
          continue
        } else if (isTimeElement(node)) {
          const data = testAndDecodeStega(node.dateTime, true)
          if (!data) continue
          addElement(node, data)
        } else if (isSvgRootElement(node)) {
          if (!node.ariaLabel) continue
          const data = testAndDecodeStega(node.ariaLabel, true)
          if (!data) continue
          addElement(node, data)
        }

        elements.push(...findSanityNodes(node))
      }
    }
  }
  return elements
}

export function isSanityArrayPath(path: string): boolean {
  const lastDotIndex = path.lastIndexOf('.')
  const lastPathItem = path.substring(lastDotIndex, path.length)

  return lastPathItem.includes('[')
}

export function getSanityNodeArrayPath(path: string): string | null {
  if (!isSanityArrayPath(path)) return null

  const split = path.split('.')

  split[split.length - 1] = split[split.length - 1].replace(/\[.*?\]/g, '[]')

  return split.join('.')
}

export function sanityNodesExistInSameArray(
  sanityNode1: SanityNode,
  sanityNode2: SanityNode,
): boolean {
  if (!isSanityArrayPath(sanityNode1.path) || !isSanityArrayPath(sanityNode2.path)) return false

  return getSanityNodeArrayPath(sanityNode1.path) === getSanityNodeArrayPath(sanityNode2.path)
}

export function resolveDragAndDropGroup(
  element: ElementNode,
  sanity: SanityNode | SanityStegaNode,
  elementSet: Set<ElementNode>,
  elementsMap: WeakMap<ElementNode, OverlayElement>,
): null | OverlayElement[] {
  if (!element.getAttribute('data-sanity')) return null

  if (element.getAttribute('data-sanity-drag-disable')) return null

  if (!sanity || !isSanityNode(sanity) || !isSanityArrayPath(sanity.path)) return null

  const targetDragGroup = element.getAttribute('data-sanity-drag-group')

  const group = [...elementSet].reduce<OverlayElement[]>((acc, el) => {
    const elData = elementsMap.get(el)
    const elDragDisabled = el.getAttribute('data-sanity-drag-disable')
    const elDragGroup = el.getAttribute('data-sanity-drag-group')
    const elHasSanityAttribution = el.getAttribute('data-sanity') !== null

    const sharedDragGroup = targetDragGroup !== null ? targetDragGroup === elDragGroup : true

    if (
      elData &&
      !elDragDisabled &&
      isSanityNode(elData.sanity) &&
      sanityNodesExistInSameArray(sanity, elData.sanity) &&
      sharedDragGroup &&
      elHasSanityAttribution
    ) {
      acc.push(elData)
    }

    return acc
  }, [])

  if (group.length <= 1) return null

  return group
}
