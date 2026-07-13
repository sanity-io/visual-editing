import {decodeSanityNodeData} from '@sanity/visual-editing-csm'
import {vercelStegaDecode} from '@vercel/stega'

import type {SanityNode, SanityStegaNode, SuspiciousStegaReport} from '../types'
import {stegaClean, testVercelStegaRegex} from './stega'

const OVERLAY_TAG = 'SANITY-VISUAL-EDITING'

/**
 * Attributes where stega payloads are expected and supported by the overlay element discovery
 * in `findSanityNodes`, keyed by (uppercase) tag name. Stega anywhere else in an attribute is
 * always a bug.
 */
const EXPECTED_STEGA_ATTRIBUTES: Record<string, string[] | undefined> = {
  IMG: ['alt'],
  TIME: ['datetime'],
  SVG: ['aria-label'],
}

type ReportSink = (
  kind: SuspiciousStegaReport['kind'],
  element: Element | undefined,
  attribute: string | undefined,
  value: string,
) => void

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}

function isOverlayElement(node: Node): boolean {
  return isElement(node) && node.tagName.toUpperCase() === OVERLAY_TAG
}

function isInsideOverlay(node: Node): boolean {
  const element = isElement(node) ? node : node.parentElement
  return element ? element.closest('sanity-visual-editing') !== null : false
}

function isInsideHead(node: Node): boolean {
  return document.head ? document.head.contains(node) : false
}

function isExpectedStegaAttribute(element: Element, attributeName: string): boolean {
  return (
    EXPECTED_STEGA_ATTRIBUTES[element.tagName.toUpperCase()]?.includes(
      attributeName.toLowerCase(),
    ) ?? false
  )
}

function checkAttribute(
  element: Element,
  attributeName: string,
  value: string | null,
  inHead: boolean,
  sink: ReportSink,
): void {
  if (!value || !testVercelStegaRegex(value)) return
  if (inHead) {
    sink('head', element, attributeName, value)
    return
  }
  if (isExpectedStegaAttribute(element, attributeName)) return
  sink('attribute', element, attributeName, value)
}

function checkElementAttributes(element: Element, inHead: boolean, sink: ReportSink): void {
  const {attributes} = element
  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i]
    if (!attribute) continue
    checkAttribute(element, attribute.name, attribute.value, inHead, sink)
  }
}

function checkTextNode(node: Node, inHead: boolean, sink: ReportSink): void {
  const parentElement = node.parentElement
  let kind: SuspiciousStegaReport['kind']
  if (inHead) {
    kind = 'head'
  } else {
    // Outside of `<head>`, text nodes are only suspicious in containers where they are never
    // rendered or where they act as a form value. Stega in rendered text is expected — it's
    // how visual editing locates editable content
    switch (parentElement?.tagName.toUpperCase()) {
      case 'SCRIPT':
        kind = 'script'
        break
      case 'STYLE':
        kind = 'style'
        break
      case 'TEXTAREA':
        kind = 'form-value'
        break
      default:
        return
    }
  }
  const value = node.textContent
  if (!value || !testVercelStegaRegex(value)) return
  sink(kind, parentElement ?? undefined, undefined, value)
}

function visitNode(node: Node, inHead: boolean, sink: ReportSink): void {
  if (isElement(node)) {
    if (isOverlayElement(node)) return
    checkElementAttributes(node, inHead, sink)
  } else if (node.nodeType === Node.TEXT_NODE) {
    checkTextNode(node, inHead, sink)
  }
}

function auditTree(root: Node, inHead: boolean, sink: ReportSink): void {
  visitNode(root, inHead, sink)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      isOverlayElement(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  })
  let node: Node | null
  while ((node = walker.nextNode())) {
    visitNode(node, inHead, sink)
  }
}

function checkLocation(sink: ReportSink): void {
  const href = location.href
  if (testVercelStegaRegex(href)) {
    sink('url', undefined, undefined, href)
    return
  }
  // Stega characters in URLs usually end up percent-encoded, so also test the decoded URL
  try {
    const decoded = decodeURIComponent(href)
    if (testVercelStegaRegex(decoded)) {
      sink('url', undefined, undefined, decoded)
    }
  } catch {
    // `decodeURIComponent` throws on malformed sequences — nothing to report then
  }
}

function auditDocument(sink: ReportSink): void {
  const {documentElement, head, body} = document
  if (documentElement) {
    checkElementAttributes(documentElement, false, sink)
  }
  if (head) {
    auditTree(head, true, sink)
  }
  if (body) {
    auditTree(body, false, sink)
  }
  checkLocation(sink)
}

function processMutation(mutation: MutationRecord, sink: ReportSink): void {
  const {target, type} = mutation
  if (!target.isConnected || isInsideOverlay(target)) return

  if (type === 'attributes') {
    if (isElement(target) && mutation.attributeName) {
      const value = target.getAttributeNS(mutation.attributeNamespace, mutation.attributeName)
      checkAttribute(target, mutation.attributeName, value, isInsideHead(target), sink)
    }
  } else if (type === 'characterData') {
    checkTextNode(target, isInsideHead(target), sink)
  } else {
    for (let i = 0; i < mutation.addedNodes.length; i++) {
      const added = mutation.addedNodes[i]
      if (!added || !added.isConnected || isInsideOverlay(added)) continue
      auditTree(added, isInsideHead(added), sink)
    }
  }
}

function decodeSanity(value: string): SanityNode | SanityStegaNode | undefined {
  try {
    const decoded = vercelStegaDecode<SanityStegaNode>(value)
    if (!decoded || typeof decoded !== 'object' || decoded.origin !== 'sanity.io') {
      return undefined
    }
    return decodeSanityNodeData(decoded) ?? decoded
  } catch {
    return undefined
  }
}

function scheduleIdle(callback: () => void): () => void {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(callback, {timeout: 1000})
    return () => cancelIdleCallback(id)
  }
  const id = setTimeout(callback, 0)
  return () => clearTimeout(id)
}

/**
 * Scans the document for stega payloads in places where they always cause bugs or bloat
 * (attributes, `<head>`, `<script>` and `<style>` contents, form values and the page URL) and
 * reports findings to the given callback.
 *
 * Performs an initial full audit and then watches for DOM changes, only re-checking what
 * actually changed. All work is deferred to idle time, reports are deduped and batched.
 * @returns A function that stops the scanning
 * @internal
 */
export function observeSuspiciousStega(
  onSuspiciousStega: (reports: SuspiciousStegaReport[]) => void,
): () => void {
  const reported = new Set<string>()
  const pendingReports: SuspiciousStegaReport[] = []
  const pendingMutations: MutationRecord[] = []
  let initialAuditDone = false
  let cancelScheduled: (() => void) | null = null
  let disposed = false

  const sink: ReportSink = (kind, element, attribute, value) => {
    const cleaned = stegaClean(value)
    const key = `${kind}|${attribute ?? ''}|${cleaned}`
    if (reported.has(key)) return
    reported.add(key)
    pendingReports.push({kind, element, attribute, value, cleaned, sanity: decodeSanity(value)})
  }

  const process = () => {
    cancelScheduled = null
    if (disposed) return
    if (!initialAuditDone) {
      initialAuditDone = true
      auditDocument(sink)
    }
    if (pendingMutations.length > 0) {
      const mutations = pendingMutations.splice(0)
      for (const mutation of mutations) {
        processMutation(mutation, sink)
      }
    }
    if (pendingReports.length > 0) {
      onSuspiciousStega(pendingReports.splice(0))
    }
  }

  const schedule = () => {
    if (cancelScheduled || disposed) return
    cancelScheduled = scheduleIdle(process)
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      pendingMutations.push(mutation)
    }
    schedule()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  })
  schedule()

  return () => {
    disposed = true
    observer.disconnect()
    cancelScheduled?.()
    cancelScheduled = null
  }
}
