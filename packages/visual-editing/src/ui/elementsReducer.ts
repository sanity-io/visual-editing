import type {VisualEditingControllerMsg} from '@sanity/presentation-comlink'
import type {ElementState, OverlayMsg} from '../types'

/**
 * Reducer for managing element state from received channel messages
 * @internal
 */
export const elementsReducer = (
  elements: ElementState[],
  message: OverlayMsg | VisualEditingControllerMsg,
): ElementState[] => {
  const {type} = message
  switch (type) {
    case 'element/register': {
      const elementExists = !!elements.find((e) => e.id === message.id)
      if (elementExists) return elements

      return [
        ...elements,
        {
          id: message.id,
          activated: false,
          element: message.element,
          focused: false,
          hovered: false,
          rect: message.rect,
          sanity: message.sanity,
          dragDisabled: message.dragDisabled,
        },
      ]
    }
    case 'element/activate':
      return elements.map((e) => {
        if (e.id === message.id) {
          return {...e, activated: true}
        }
        return e
      })
    case 'element/update': {
      return elements.map((e) => {
        if (e.id === message.id) {
          return {...e, sanity: message.sanity, rect: message.rect}
        }
        return e
      })
    }
    case 'element/unregister':
      return elements.filter((e) => e.id !== message.id)
    case 'element/deactivate':
      return elements.map((e) => {
        if (e.id === message.id) {
          return {...e, activated: false, hovered: false}
        }
        return e
      })
    case 'element/mouseenter':
      return elements.map((e) => {
        if (e.id === message.id) {
          return {...e, rect: message.rect, hovered: true}
        }
        return {...e, hovered: false}
      })
    case 'element/mouseleave':
      return elements.map((element) => {
        if (element.id === message.id) {
          return {...element, hovered: false}
        }
        return element
      })
    case 'element/updateRect':
      return elements.map((element) => {
        if (element.id === message.id) {
          return {...element, rect: message.rect}
        }
        return element
      })
    case 'element/click':
      return elements.map((e) => {
        return {...e, focused: e.id === message.id && 'clicked'}
      })
    case 'overlay/blur':
      return elements.map((e) => {
        return {...e, focused: false}
      })
    case 'presentation/blur':
      return elements.map((e) => {
        return {...e, focused: false}
      })
    case 'presentation/focus': {
      // Before setting the focus state of each element, check to see if any
      // element has gained focus from an `element/click` message. Presentation
      // tool "reflects" these back as a `presentation/focus` message.
      const clickedElement = elements.find((e) => e.focused === 'clicked')
      return elements.map((e) => {
        // We want to focus any element which matches the received id and path
        const focused =
          'path' in e.sanity &&
          e.sanity.id === message.data.id &&
          e.sanity.path === message.data.path

        // If we have a 'clicked' element, and that element matches, it is a
        // reflection, so we maintain the focus state
        if (clickedElement && e === clickedElement && focused) {
          return e
        }

        return {
          ...e,
          // Mark as a dupe if another matching item has been clicked to prevent
          // scrolling, otherwise just set focus as a boolean
          focused: focused && clickedElement ? 'duplicate' : focused,
        }
      })
    }
    default:
      return elements
  }
}
