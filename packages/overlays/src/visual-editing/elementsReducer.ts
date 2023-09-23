import { ElementState, OverlayMsg } from '../types'
import { ComposerMsg } from './VisualEditing'

export const elementsReducer = (
  elements: ElementState[],
  message: OverlayMsg | ComposerMsg,
): ElementState[] => {
  const { type } = message
  if (type === 'element/register') {
    if (!elements.find((e) => e.id === message.id)) {
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
  } else if (type === 'element/activate') {
    return elements.map((e) => {
      if (e.id === message.id) {
        return { ...e, activated: true }
      }
      return e
    })
  } else if (type === 'element/unregister') {
    return elements.filter((e) => e.id !== message.id)
  } else if (type === 'element/deactivate') {
    return elements.map((e) => {
      if (e.id === message.id) {
        return { ...e, activated: false, hovered: false }
      }
      return e
    })
  } else if (type === 'element/mouseenter') {
    return elements.map((e) => {
      if (e.id === message.id) {
        return { ...e, rect: message.rect, hovered: true }
      }
      return { ...e, hovered: false }
    })
  } else if (type === 'element/mouseleave') {
    return elements.map((element) => {
      if (element.id === message.id) {
        return { ...element, hovered: false }
      }
      return element
    })
  } else if (type === 'element/updateRect') {
    return elements.map((element) => {
      if (element.id === message.id) {
        return { ...element, rect: message.rect }
      }
      return element
    })
  } else if (type === 'element/click') {
    return elements.map((e) => {
      return { ...e, focused: e.id === message.id }
    })
  } else if (type === 'overlay/blur') {
    return elements.map((e) => {
      return { ...e, focused: false }
    })
  } else if (type === 'composer/focus') {
    return elements.map((e) => {
      return {
        ...e,
        focused: 'path' in e.sanity && e.sanity.path === message.data.path[0],
      }
    })
  }
  return elements
}
