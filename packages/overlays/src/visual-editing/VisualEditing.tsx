import { studioTheme, ThemeProvider } from '@sanity/ui'
import { useEffect, useReducer, useRef, useState } from 'react'
import styled from 'styled-components'

import { createOverlayController } from '../controller'
import type { OverlayController } from '../types'
import { ElementOverlay } from './ElementOverlay'
import { elementsReducer } from './elementsReducer'

const Root = styled.div`
  background-color: transparent;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 9999999;
`

export function VisualEditing(): JSX.Element {
  const [elements, dispatch] = useReducer(elementsReducer, [])
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null)
  const overlayController = useRef<OverlayController | undefined>()

  // On mount
  useEffect(() => {
    if (!rootElement) return undefined

    overlayController.current = createOverlayController({
      dispatch,
      overlayElement: rootElement,
    })
  }, [rootElement])

  return (
    <ThemeProvider theme={studioTheme} tone="transparent">
      <Root ref={setRootElement}>
        {elements.map(({ id, hovered, rect }) => {
          return <ElementOverlay key={id} rect={rect} hovered={hovered} />
        })}
      </Root>
    </ThemeProvider>
  )
}
