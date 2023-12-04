import { PresentationMsg } from '@sanity/visual-editing-helpers'

import { ElementState, OverlayMsg } from '../types'

/**
 * Reducer for managing element state from received channel messages
 * @internal
 */
export const elementsReducer = (
  elements: ElementState[],
  message: OverlayMsg | PresentationMsg,
): ElementState[] => {
  const { type } = message
  switch (type) {
    case 'element/register': {
      const elementExists = !!elements.find((e) => e.id === message.id)
      if (elementExists) return elements
      return [
        ...elements,
        {
          id: message.id,
          activated: false,
          focused: false,
          hovered: false,
          rect: message.rect,
          sanity: message.sanity,
        },
      ]
    }
    case 'element/activate':
      return elements.map((e) => {
        if (e.id === message.id) {
          return { ...e, activated: true }
        }
        return e
      })
    case 'element/unregister':
      return elements.filter((e) => e.id !== message.id)
    case 'element/deactivate':
      return elements.map((e) => {
        if (e.id === message.id) {
          return { ...e, activated: false, hovered: false }
        }
        return e
      })
    case 'element/mouseenter':
      return elements.map((e) => {
        if (e.id === message.id) {
          return { ...e, rect: message.rect, hovered: true }
        }
        return { ...e, hovered: false }
      })
    case 'element/mouseleave':
      return elements.map((element) => {
        if (element.id === message.id) {
          return { ...element, hovered: false }
        }
        return element
      })
    case 'element/updateRect':
      return elements.map((element) => {
        if (element.id === message.id) {
          return { ...element, rect: message.rect }
        }
        return element
      })
    case 'element/click':
      return elements.map((e) => {
        return { ...e, focused: e.id === message.id && 'clicked' }
      })
    case 'overlay/blur':
      return elements.map((e) => {
        return { ...e, focused: false }
      })
    case 'presentation/blur':
      return elements.map((e) => {
        return { ...e, focused: false }
      })
    case 'presentation/focus': {
      // This event will be reflected from the presentation tool after a click event, so check if an element has been clicked
      const clickedElement = elements.find((e) => e.focused === 'clicked')
      return elements.map((e) => {
        if (e === clickedElement) {
          return e
        }
        // We want to focus any element which matches the id and path...
        const focused =
          'path' in e.sanity &&
          e.sanity.id === message.data.id &&
          e.sanity.path === message.data.path
        return {
          ...e,
          // ... but mark as a dupe if another matching item has been clicked to prevent scrolling
          focused: focused && clickedElement ? 'duplicate' : focused,
        }
      })
    }
    default:
      return elements
  }
}
