import { v4 as uuid } from 'uuid'

import { findSanityNodes } from './findSanityNodes'
import { getRect } from './getRect'
import type {
  _EventHandlers,
  _OverlayElement,
  _ResolvedElement,
  OverlayController,
  OverlayOptions,
} from './types'

/**
 * Creates a controller which dispatches overlay related events
 *
 * @param dispatch - Dispatched event handler
 * @param overlayElement - Parent element containing rendered overlay elements
 * @public
 */
export function createOverlayController({
  dispatch,
  overlayElement,
}: OverlayOptions): OverlayController {
  // Map for getting element by ID
  const elementIdMap = new Map<string, HTMLElement>()
  // WeakMap for getting data by element
  const elements = new WeakMap<HTMLElement, _OverlayElement>()
  // Set for iterating over elements
  const elementSet = new Set<HTMLElement>()

  let hoverStack: HTMLElement[] = []
  const getHoveredElement = () =>
    hoverStack[hoverStack.length - 1] as HTMLElement | undefined

  function addEventHandlers(el: HTMLElement, handlers: _EventHandlers) {
    el.addEventListener('click', handlers.click, {
      capture: true,
    })
    el.addEventListener('mouseenter', handlers.mouseenter)
    el.addEventListener('mouseleave', handlers.mouseleave)
  }

  function removeEventHandlers(el: HTMLElement, handlers: _EventHandlers) {
    el.removeEventListener('click', handlers.click, {
      capture: true,
    })
    el.removeEventListener('mouseenter', handlers.mouseenter)
    el.removeEventListener('mouseleave', handlers.mouseleave)
  }

  /**
   * Executed when element enters the viewport
   * Enables an element’s event handlers
   */
  function activateElement({ id, element, handlers, sanity }: _OverlayElement) {
    addEventHandlers(element, handlers)
    ro.observe(element)
    const rect = getRect(element)
    dispatch({
      type: 'element/activate',
      id,
      rect,
      sanity,
    })
  }

  /**
   * Executed when element leaves the viewport
   * Disables an element’s event handlers
   */
  function deactivateElement({ id, element, handlers }: _OverlayElement) {
    removeEventHandlers(element, handlers)
    ro.unobserve(element)
    dispatch({
      type: 'element/deactivate',
      id,
    })
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const { target } = entry
        const match = target instanceof HTMLElement && elements.get(target)
        if (!match) continue
        if (entry.isIntersecting) {
          activateElement(match)
        } else {
          deactivateElement(match)
        }
      }
    },
    {
      threshold: 0.3,
    },
  )

  /**
   * Stores an element’s DOM node and decoded sanity data in state and sets up event handlers
   */
  function registerElement({ element, sanity }: _ResolvedElement) {
    const eventHandlers: _EventHandlers = {
      click(event) {
        const target = event.target as HTMLElement | null
        if (element === getHoveredElement() && element.contains(target)) {
          event.preventDefault()
          event.stopPropagation()
          dispatch({
            type: 'element/edit',
            id,
            sanity,
          })
        }
      },
      mouseenter() {
        hoverStack.push(element)
        dispatch({
          type: 'element/mouseenter',
          id,
        })
      },
      mouseleave(e) {
        function leave() {
          hoverStack.pop()
          const hoveredElement = getHoveredElement()

          dispatch({
            type: 'element/mouseleave',
            id,
          })

          if (hoveredElement) {
            const overlayElement = elements.get(hoveredElement)
            if (overlayElement) {
              dispatch({
                type: 'element/mouseenter',
                id: overlayElement.id,
              })
            }
          }
        }

        /**
         * If moving to an element within the overlay which handles pointer events, attach a new event handler to that element and defer the original leave event
         */
        const { relatedTarget } = e
        const isInteractiveOverlayElement =
          relatedTarget instanceof HTMLElement &&
          overlayElement.contains(relatedTarget)

        if (isInteractiveOverlayElement) {
          const deferredLeave = () => {
            leave()
            relatedTarget.removeEventListener('mouseleave', deferredLeave)
          }
          relatedTarget.addEventListener('mouseleave', deferredLeave)
          return
        }

        leave()
      },
    }

    const id = uuid()
    elementSet.add(element)
    elementIdMap.set(id, element)
    elements.set(element, {
      id,
      element,
      sanity,
      handlers: eventHandlers,
    })

    io.observe(element)
    ro.observe(element)

    const rect = getRect(element)
    dispatch({
      type: 'element/register',
      id,
      rect,
      sanity,
    })
  }

  function registerElements(node: HTMLElement) {
    const sanityNodes = findSanityNodes(node)
    for (const sanityNode of sanityNodes) {
      if (
        sanityNode.element instanceof HTMLElement &&
        !elements.has(sanityNode.element)
      ) {
        registerElement(sanityNode)
      }
    }
  }

  function unregisterElement(element: HTMLElement) {
    const overlayElement = elements.get(element)
    if (overlayElement) {
      const { id, handlers } = overlayElement
      removeEventHandlers(element, handlers)
      ro.unobserve(element)
      elements.delete(element)
      elementSet.delete(element)
      elementIdMap.delete(id)
      dispatch({
        type: 'element/unregister',
        id,
      })
    }
  }

  // Mutations
  function handleMutation(mutations: MutationRecord[]) {
    const needsUpdate = !!mutations.filter((mutation) => {
      const node: Node | null = mutation.target

      if (node === overlayElement || overlayElement.contains(node)) {
        return false
      }

      if (node instanceof HTMLElement && !elements.has(node)) {
        registerElements(node)
      }
      return true
    }).length

    if (needsUpdate) {
      for (const element of elementSet) {
        if (element.isConnected) {
          updateRect(element)
        } else {
          unregisterElement(element)
        }
      }
    }
  }
  const mo = new MutationObserver(handleMutation)
  mo.observe(document.body, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  })

  /**
    
   * Dispatches an event containing the size and position (rect) of an element
   * @param el - Element to dispatch rect information for
   */
  function updateRect(el: HTMLElement) {
    const overlayElement = elements.get(el)
    if (overlayElement) {
      const rect = getRect(el)

      dispatch({
        type: 'element/updateRect',
        id: overlayElement.id,
        rect,
      })
    }
  }

  function handleResize(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
      const target = entry.target

      if (target instanceof HTMLElement) {
        updateRect(target)
      }
    }
  }

  const ro = new ResizeObserver(handleResize)

  function destroy() {
    io.disconnect()
    mo.disconnect()

    elementSet.forEach((element) => {
      unregisterElement(element)
    })

    elementIdMap.clear()
    elementSet.clear()

    hoverStack = []
  }

  function activate() {
    registerElements(document.body)
  }

  window.document.fonts.ready.then(() => {
    for (const element of elementSet) {
      updateRect(element)
    }
  })

  activate()

  return {
    destroy,
    toggle() {
      // @todo toggle
    },
  }
}
