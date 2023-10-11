import type { ElementState, OverlayEventHandler } from '@sanity/overlays'

export const createDispatchHandler =
  (elements: Ref<ElementState[]>): OverlayEventHandler =>
  (message) => {
    if (
      message.type === 'element/register' ||
      message.type === 'element/activate'
    ) {
      if (!elements.value.find((e) => e.id === message.id)) {
        elements.value.push({
          activated: false,
          focused: false,
          hovered: false,
          id: message.id,
          rect: message.rect,
          sanity: message.sanity,
        })
      }
    } else if (
      message.type === 'element/unregister' ||
      message.type === 'element/deactivate'
    ) {
      elements.value = elements.value.filter((e) => e.id !== message.id)
    } else if (message.type === 'element/mouseenter') {
      elements.value = elements.value.map((e) => {
        if (e.id === message.id) {
          return { ...e, rect: message.rect, hovered: true }
        }
        return { ...e, hovered: false }
      })
    } else if (message.type === 'element/mouseleave') {
      const e = elements.value.find((e) => e.id === message.id)
      if (e) {
        e.hovered = false
      }
    } else if (message.type === 'element/updateRect') {
      const e = elements.value.find((e) => e.id === message.id)
      if (e) {
        e.rect = message.rect
      }
    }
  }
