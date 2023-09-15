import { ElementState, OverlayMsg } from '../types'

export const elementsReducer = (
  elements: ElementState[],
  message: OverlayMsg,
): ElementState[] => {
  if (
    message.type === 'element/register' ||
    message.type === 'element/activate'
  ) {
    if (!elements.find((e) => e.id === message.id)) {
      return [
        ...elements,
        {
          id: message.id,
          rect: message.rect,
          hovered: false,
          sanity: message.sanity,
        },
      ]
    }
  } else if (
    message.type === 'element/unregister' ||
    message.type === 'element/deactivate'
  ) {
    return elements.filter((e) => e.id !== message.id)
  } else if (message.type === 'element/mouseenter') {
    return elements.map((e) => {
      if (e.id === message.id) {
        return { ...e, rect: message.rect, hovered: true }
      }
      return { ...e, hovered: false }
    })
  } else if (message.type === 'element/mouseleave') {
    return elements.map((element) => {
      if (element.id === message.id) {
        return { ...element, hovered: false }
      }
      return element
    })
  } else if (message.type === 'element/updateRect') {
    return elements.map((element) => {
      if (element.id === message.id) {
        return { ...element, rect: message.rect }
      }
      return element
    })
  }
  return elements
}
