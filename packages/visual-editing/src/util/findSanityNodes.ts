import {decodeSanityNodeData} from '@sanity/visual-editing-csm'
import type {
  ElementNode,
  OverlayElement,
  ResolvedElement,
  ResolvedElementReason,
  ResolvedElementTarget,
  ResolvingElement,
  SanityNode,
  SanityStegaNode,
} from '../types'
import {findNonInlineElement} from './elements'
import {testAndDecodeStega, testVercelStegaRegex} from './stega'

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

    common = {...common, path: findCommonPath(common.path, node.path)}
  }

  return common
}

/**
 * Finds nodes containing sanity specific data
 * @param el - A parent element to traverse
 * @returns An array of overlay targets, each with containing HTML elements and a collection of HTML elements with decoded sanity data
 * @internal
 */
export function findSanityNodes(
  el: ElementNode | ChildNode | {childNodes: Array<ElementNode>},
): ResolvedElement[] {
  const mainResults: Omit<ResolvedElement, 'commonSanity'>[] = []

  function createResolvedElement(
    element: ElementNode,
    data: SanityStegaNode | string,
    reason: ResolvedElementReason,
    preventGrouping?: boolean,
  ): ResolvingElement | undefined {
    const sanity = decodeSanityNodeData(data)

    if (!sanity) {
      return
    }

    // resize observer does not fire for non-replaced inline elements https://drafts.csswg.org/resize-observer/#intro
    const measureElement = findNonInlineElement(element)
    if (!measureElement) {
      return
    }

    return {
      elements: {
        element,
        measureElement,
      },
      sanity,
      reason,
      preventGrouping,
    }
  }

  function resolveNode(node: ChildNode): ResolvingElement | undefined {
    const {nodeType, parentElement, textContent} = node
    // If an edit target is found, find common paths
    if (isElementNode(node) && node.dataset?.['sanityEditTarget'] !== undefined) {
      const nodesInTarget = findSanityNodes(node)
      const commonData = findCommonSanityData(
        nodesInTarget
          .map((node) => (node.type === 'element' ? node.commonSanity : undefined))
          .filter((n) => n !== undefined),
      )
      if (commonData) {
        return {
          reason: 'edit-target',
          elements: {
            element: node,
            measureElement: node,
          },
          sanity: commonData,
        }
      }

      // Check non-empty, child-only text nodes for stega strings
    } else if (nodeType === Node.TEXT_NODE && parentElement && textContent) {
      const data = testAndDecodeStega(textContent)
      if (!data) return
      return createResolvedElement(parentElement, data, 'stega-text', true)
    }
    // Check element nodes for data attributes, alt tags, etc
    else if (isElementNode(node)) {
      // Do not traverse script tags
      // Do not traverse the visual editing overlay
      if (node.tagName === 'SCRIPT' || node.tagName === 'SANITY-VISUAL-EDITING') {
        return
      }

      // Prefer elements with explicit data attributes
      if (node.dataset?.['sanity']) {
        return createResolvedElement(
          node,
          node.dataset['sanity'],
          'data-attribute',
          Boolean(node.textContent && testVercelStegaRegex(node.textContent)),
        )
      }
      // Look for legacy sanity data attributes
      else if (node.dataset?.['sanityEditInfo']) {
        return createResolvedElement(
          node,
          node.dataset['sanityEditInfo'],
          'data-attribute',
          Boolean(node.textContent && testVercelStegaRegex(node.textContent)),
        )
      } else if (isImgElement(node)) {
        const data = testAndDecodeStega(node.alt, true)
        if (!data) return
        return createResolvedElement(node, data, 'stega-attribute')
      } else if (isTimeElement(node)) {
        const data = testAndDecodeStega(node.dateTime, true)
        if (!data) return
        return createResolvedElement(node, data, 'stega-attribute')
      } else if (isSvgRootElement(node)) {
        if (!node.ariaLabel) return
        const data = testAndDecodeStega(node.ariaLabel, true)
        if (!data) return
        return createResolvedElement(node, data, 'stega-attribute')
      }
    }
    return
  }

  function processNode(
    node: ChildNode,
    _parentGroup: Omit<ResolvedElement, 'commonSanity'> | undefined,
  ): void {
    const resolvedElement = resolveNode(node)

    let parentGroup: Omit<ResolvedElement, 'commonSanity'> | undefined = _parentGroup

    if (isElementNode(node) && node.dataset?.['sanityEditGroup'] !== undefined) {
      parentGroup = {
        type: 'group',
        elements: {
          element: node,
          measureElement: node,
        },
        targets: [],
      }
      mainResults.push(parentGroup)
    }

    if (resolvedElement) {
      const target: ResolvedElementTarget = {
        elements: resolvedElement.elements,
        sanity: resolvedElement.sanity,
        reason: resolvedElement.reason,
      }
      if (parentGroup && !resolvedElement.preventGrouping) {
        parentGroup.targets.push(target)
      } else {
        mainResults.push({
          elements: resolvedElement.elements,
          type: 'element',
          targets: [target],
        })
      }
    }

    const shouldTraverseNode =
      isElementNode(node) &&
      !isImgElement(node) &&
      !(node.tagName === 'SCRIPT' || node.tagName === 'SANITY-VISUAL-EDITING')

    if (shouldTraverseNode) {
      for (const childNode of node.childNodes) {
        processNode(childNode, parentGroup)
      }
    }
  }

  if (el) {
    for (const node of el.childNodes) {
      processNode(node, undefined)
    }
  }

  return mainResults
    .map((node) => {
      if (node.targets.length === 0 && node.type === 'group')
        // Return empty groups for now so the controller can unregister them
        return {
          ...node,
          commonSanity: undefined,
        }

      const commonSanity =
        node.targets.length === 1
          ? node.targets[0].sanity
          : findCommonSanityData(
              node.targets.map(({sanity}) => sanity).filter((n) => n !== undefined),
            ) ||
            // TODO: We probably don't want to fallback to the first target's sanity node, but we currently need a node for the overlay element to register
            node.targets[0].sanity

      if (!commonSanity) return null

      return {
        ...node,
        commonSanity,
      }
    })
    .filter((node) => node !== null)
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
      elData?.sanity &&
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
