import {Portal} from '@sanity/ui/_visual-editing'
import {type FunctionComponent, type MouseEvent} from 'react'
import {styled} from 'styled-components'

const PortalContainer = styled.div`
  height: 100%;
  inset: 0;
  overflow-y: scroll;
  overscroll-behavior: contain;
  pointer-events: all;
  position: fixed;
  width: 100%;
  -ms-overflow-style: none;
  scrollbar-width: none;
  display: flex;
  justify-content: center;
  align-items: center;
  &:before {
    content: '';
    display: block;
    height: calc(100% + 1px);
    position: absolute;
    top: 0;
    width: 100%;
    z-index: -1;
  }
`
const PortalBackground = styled.div`
  background: transparent;
  height: 100%;
  inset: 0;
  position: absolute;
  width: 100%;
`

export const PopoverPortal: FunctionComponent<{
  children: React.ReactNode
  onDismiss?: () => void
  setBoundaryElement?: (element: HTMLDivElement) => void
}> = (props) => {
  const {children, onDismiss, setBoundaryElement} = props

  // Prevent the event from propagating to the window, so that the controller's
  // `handleBlur` listener is not triggered. This is needed to prevent the
  // context menu from being dismissed when some click causes parent elements to
  // re-render, and the data-attribute method of preventing propagation fails.
  const handleClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <Portal>
      <PortalContainer data-sanity-overlay-element ref={setBoundaryElement} onClick={handleClick}>
        <PortalBackground onClickCapture={onDismiss} />
        {children}
      </PortalContainer>
    </Portal>
  )
}
