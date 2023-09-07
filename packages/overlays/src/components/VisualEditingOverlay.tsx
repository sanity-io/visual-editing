import { studioTheme, ThemeProvider } from '@sanity/ui'
import { useEffect, useState } from 'react'

import { OVERLAY_ID } from '../constants'
import { ElementReference } from '../types'
import { findEditableElements } from '../util/traverse'
import { EditTooltip } from './EditTooltip'

export function VisualEditingOverlay(): JSX.Element {
  const [elements, setElements] = useState<ElementReference[]>([])
  const [activeElementIds, setActiveElementIds] = useState<string[]>([])

  const elementsToRender = elements.filter((element) =>
    activeElementIds.includes(element.id),
  )

  function findAndSetElements() {
    // Traverses the DOM and finds elements that are editable
    // i.e. where an overlay element should be rendered
    const els = findEditableElements(document.body)
    setElements(els)
  }

  // On mount
  useEffect(() => {
    findAndSetElements()

    const mutationObserver = new MutationObserver((entries) => {
      for (const entry of entries) {
        // If the mutation occured within the overlay, ignore it
        if ((entry.target as HTMLElement).id === OVERLAY_ID) {
          continue
        }
        // Only care about mutations where some child element changed
        if (entry.type === 'childList') {
          findAndSetElements()
        }
      }
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      mutationObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const { target } = entry
          const match = elements.find(({ element }) => element === target)
          if (!match) continue
          if (entry.isIntersecting) {
            setActiveElementIds((prev) => [...prev, match.id])
          } else {
            setActiveElementIds((prev) => prev.filter((id) => id !== match.id))
          }
        }
      },
      {
        threshold: 0.3,
      },
    )

    elements.forEach(({ element }) => {
      intersectionObserver.observe(element)
    })

    return () => {
      intersectionObserver.disconnect()
    }
  }, [elements])

  return (
    <ThemeProvider theme={studioTheme}>
      {elementsToRender.map(({ id, data, element }) => {
        return <EditTooltip key={id} element={element} decodedData={data} />
      })}
    </ThemeProvider>
  )
}
