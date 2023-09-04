import { studioTheme, ThemeProvider } from '@sanity/ui'
import { nanoid } from 'nanoid'
import { type JSX, useEffect, useMemo, useState } from 'react'

import { recursivelyFindStegaNodes } from '../recursivelyFindStegaNodes'
import { EditTooltip } from './EditTooltip'

interface ElementRef {
  element: HTMLElement
  id: string
}

export function VisualEditingOverlay(): JSX.Element {
  const [elementRefs, setElementRefs] = useState<ElementRef[]>([])

  const [mounted, setMounted] = useState(false)
  const [iframe, setIframe] = useState(false)

  const intersectionObserver = useMemo(
    () =>
      new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const { target } = entry

            // if the target is not an html element, we can't do anything with it
            if (!(target instanceof HTMLElement)) {
              continue
            }

            const exists = elementRefs.find((ref) => ref.element === target)

            // if the entry is not intersecting, we can remove it from the elementRefs list
            if (!entry.isIntersecting) {
              if (exists && !iframe) {
                setElementRefs((prev) =>
                  prev.filter((el) => el.element !== target),
                )
              }

              continue
            }

            if (entry.isIntersecting && target.dataset.sanityStega) {
              const decoded = JSON.parse(target.dataset.sanityStega)

              if (decoded.origin !== 'sanity.io') {
                continue
              }

              if (!exists && !iframe) {
                setElementRefs((prev) => [
                  ...prev,
                  { element: target, id: nanoid(5) },
                ])
              }
            }

            // scan the target node to check if its a stega node
            recursivelyFindStegaNodes(target)
          }
        },
        {
          threshold: 0.3,
        },
      ),
    [elementRefs, iframe],
  )

  const recursivelyObserveChildren = useMemo(
    () => (node: HTMLElement) => {
      if (node instanceof HTMLElement) {
        intersectionObserver.observe(node)
        node.childNodes.forEach((child) => {
          recursivelyObserveChildren(child as HTMLElement)
        })
      }
    },
    [intersectionObserver],
  )

  const mutationObserver = useMemo(
    () =>
      new MutationObserver((entries) => {
        // remove all previous tooltips
        for (const entry of entries) {
          if (entry.type === 'childList') {
            for (const node of entry.addedNodes) {
              recursivelyFindStegaNodes(node as HTMLElement)
              // recursivelyObserveChildren(node as HTMLElement)
            }
          }
        }
      }),
    [],
  )

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      return
    }

    document.body.childNodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        recursivelyObserveChildren(node)
      }
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // on initial load
    recursivelyFindStegaNodes(document.body)

    return () => {
      // mutationObserver.disconnect()
      intersectionObserver.disconnect()
    }
  }, [
    mounted,
    intersectionObserver,
    mutationObserver,
    recursivelyObserveChildren,
  ])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.self !== window.top) {
      setIframe(true)
    }
  }, [mounted])

  return (
    <ThemeProvider theme={studioTheme}>
      {elementRefs.map((elementRef) => {
        return <EditTooltip key={elementRef.id} element={elementRef.element} />
      })}
    </ThemeProvider>
  )
}
