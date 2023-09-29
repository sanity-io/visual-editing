import { ElementState, OverlayMsg } from '../types'
import { ComposerMsg } from './VisualEditing'

export const elementsReducer = (
  elements: ElementState[],
  message: OverlayMsg | ComposerMsg,
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
        return { ...e, focused: e.id === message.id }
      })
    case 'overlay/blur':
      return elements.map((e) => {
        return { ...e, focused: false }
      })
    case 'composer/blur':
      return elements.map((e) => {
        return { ...e, focused: false }
      })
    case 'composer/focus':
      return elements.map((e) => {
        return {
          ...e,
          focused:
            'path' in e.sanity &&
            e.sanity.id === message.data.id &&
            e.sanity.path === message.data.path,
        }
      })
    default:
      return elements
  }
}
