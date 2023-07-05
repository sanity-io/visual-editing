import { autoUpdate, useFloating } from '@floating-ui/react-dom'
import { Button } from '@sanity/ui'
import { type JSX, useEffect, useRef } from 'react'

export function EditTooltip({
  element,
}: {
  element: HTMLElement
}): JSX.Element | null {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)

  const { refs, floatingStyles } = useFloating({
    // @ts-expect-error - using a dummy value here gives us the desired placement. Undefined does NOT!
    placement: 'centered',
    whileElementsMounted: autoUpdate,
    elements: {
      reference: element,
    },
  })

  useEffect(() => {
    const onHover = () => {
      refs.floating.current?.style.setProperty('opacity', '1')
      buttonRef.current?.style.setProperty('display', 'block')
    }

    const onLeave = (event: MouseEvent) => {
      if (!areaRef.current) return

      // check if mouse is currently over areaRef
      const { x, y } = event
      const { top, left, width, height } =
        areaRef.current.getBoundingClientRect()

      if (x >= left && x <= left + width && y >= top && y <= top + height) {
        return
      }

      refs.floating.current?.style.setProperty('opacity', '0')
      buttonRef.current?.style.setProperty('display', 'none')
    }

    element.addEventListener('mouseenter', onHover)
    element.addEventListener('mouseleave', onLeave)

    return () => {
      element.removeEventListener('mouseenter', onHover)
      element.removeEventListener('mouseleave', onLeave)
    }
  }, [element, refs.floating, areaRef])

  useEffect(() => {
    if (!areaRef.current || !buttonRef.current) return

    const onHover = () => {
      refs.floating.current?.style.setProperty('opacity', '1')
      buttonRef.current?.style.setProperty('display', 'block')
    }

    const onLeave = (event: MouseEvent) => {
      if (!buttonRef.current) return

      // check if mouse is currently over buttonRef
      const { x, y } = event
      const { top, left, width, height } =
        buttonRef.current.getBoundingClientRect()

      if (x >= left && x <= left + width && y >= top && y <= top + height) {
        return
      }

      refs.floating.current?.style.setProperty('opacity', '0')
      buttonRef.current?.style.setProperty('display', 'none')
    }

    areaRef.current?.addEventListener('mouseenter', onHover)
    areaRef.current?.addEventListener('mouseleave', onLeave)
  }, [areaRef, refs.floating])

  if (!element.dataset.sanityStega) return null

  const { width, height } = element.getBoundingClientRect()
  const { href, origin, data } = JSON.parse(element.dataset.sanityStega)

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          ...floatingStyles,
          transition: 'opacity .3s',
          opacity: 0,
          position: 'absolute',
          outline: '2px solid #06f',
          outlineOffset: '3px',
          pointerEvents: 'none',
          borderRadius: '1px',
          width: width,
          height: height,
        }}
        ref={refs.setFloating}
      >
        <div
          ref={areaRef}
          style={{
            position: 'absolute',
            pointerEvents: 'visibleFill',
            top: -10,
            left: 5,
            zIndex: 98,
            bottom: 0,
            width: '100%',
            height: 20,
          }}
        />
        <Button
          as={data ? 'button' : 'a'}
          href={data ? undefined : href}
          target={data ? undefined : '_blank'}
          rel={data ? undefined : 'noreferrer'}
          ref={buttonRef}
          fontSize={1}
          padding={2}
          tone="primary"
          text={
            element.clientWidth > 200 && !data
              ? 'Edit in Sanity Studio'
              : 'Edit'
          }
          onMouseLeave={() => {
            refs.floating.current?.style.setProperty('opacity', '0')
            buttonRef.current?.style.setProperty('display', 'none')
          }}
          style={{
            textDecoration: 'none',
            outline: 'none',
            position: 'absolute',
            top: -34,
            right: -5,
            zIndex: 99,
            pointerEvents: 'all',
            display: 'none',
          }}
          onClick={() => {
            if (typeof window === 'undefined') return

            if (!data) {
              document.location = href
              return
            }

            const event = new CustomEvent('edit:open', {
              detail: {
                data,
                href,
                origin,
              },
            })

            window.dispatchEvent(event)
          }}
        />
      </div>
    </div>
  )
}
