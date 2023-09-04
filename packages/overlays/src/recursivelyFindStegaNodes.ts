import { vercelStegaDecode } from '@vercel/stega'

import { testVercelStegaRegex } from './testVercelStegaRegex'

interface KeyedNode {
  key?: string
  nodeToTag?: HTMLElement
}

function tagElement(element: HTMLElement, { key, nodeToTag }: KeyedNode) {
  const nodeToTagReal = nodeToTag || element

  if (element?.dataset?.sanityEditInfo) {
    element.dataset.sanityStega = element?.dataset.sanityEditInfo
  }

  const text = key ? element[key as keyof HTMLElement] : undefined

  if (!text || typeof text !== 'string') {
    return
  }

  if (!testVercelStegaRegex(text)) {
    return
  }

  const decoded = vercelStegaDecode<{
    origin?: string
    href?: string
    data?: unknown
  }>(text)

  if (!decoded) {
    return
  }

  if (decoded.origin !== 'sanity.io') {
    return
  }

  const isAltText = key === 'alt'

  if (isAltText) {
    decoded.href = decoded.href?.replace('.alt', '')
  }

  decoded.href += ';view=preview,'

  if (key !== 'title') {
    nodeToTagReal.dataset.sanityStega = JSON.stringify(decoded)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function recursivelyFindStegaNodes(element: HTMLElement) {
  let node: HTMLElement | undefined = element

  if (node.dataset?.sanityEditInfo) {
    tagElement(node, { key: 'textContent' })
  }

  let parent = element.parentElement
  while (parent) {
    //if any parent has edit target, bail on further recursion
    // we need this bail since intersection observers fires independently for children and parents
    if (parent.dataset.sanityEditTarget) {
      return
    }
    parent = parent.parentElement
  }

  if (node.dataset?.sanityEditTarget && node.hasChildNodes()) {
    const child = Array.from(node.children).find((childElement) => {
      if (!childElement.textContent) {
        return false
      }

      if (!testVercelStegaRegex(childElement.textContent)) {
        return false
      }

      return childElement
    })

    if (!child) {
      return
    }

    tagElement(child as HTMLElement, { key: 'textContent', nodeToTag: node })
    // do not recurse when this node has data-sanity-edit-target
    return
  }

  if (node.tagName === 'SCRIPT') {
    return
  }

  if (
    ['SPAN', 'B', 'STRONG'].includes(node.tagName) &&
    node.parentElement?.dataset.sanityStega
  ) {
    node = node.parentElement
    return
  }

  if (node.tagName === 'TIME') {
    tagElement(node, { key: 'dateTime' })
  }

  if (node.tagName === 'IMG') {
    tagElement(node, { key: 'alt' })
  }

  if (node.tagName === 'TD' && node.textContent?.length !== 0) {
    tagElement(node, { key: 'title' })
  }

  if (node.parentElement?.dataset?.sanityStega) {
    return
  }

  if (
    node.nodeType === Node.TEXT_NODE &&
    node.tagName !== 'SPAN' &&
    node.parentElement
  ) {
    tagElement(node.parentElement, {
      key: 'textContent',
    })
  }

  for (const child of node.childNodes) {
    recursivelyFindStegaNodes(child as HTMLElement)
  }
}
