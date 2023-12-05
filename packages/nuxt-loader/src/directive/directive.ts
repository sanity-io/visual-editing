import { encodeSanityNodeData } from '@sanity/visual-editing-helpers/csm'
import { Directive } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bindNodeDataToElement(node: any, el: HTMLElement) {
  if (!node) return
  el.textContent = node.value
  const encodedData = encodeSanityNodeData(node.source)
  if (encodedData) {
    el.setAttribute('data-sanity', encodedData)
  }
}

/** @beta */
export const vSanity: Directive<HTMLElement> = {
  created: (el, binding) => {
    const { value: node } = binding
    bindNodeDataToElement(node, el)
  },
  updated(el, binding) {
    const { value: node } = binding
    if (!node) return
    bindNodeDataToElement(node, el)
  },
}
