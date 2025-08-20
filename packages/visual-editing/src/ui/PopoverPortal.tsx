import {Portal} from '@sanity/ui'
import {type FunctionComponent, type MouseEvent} from 'react'
import {css, styled} from 'styled-components'

const scrollBlockStyles = css`
  overflow-y: scroll;
  overscroll-behavior: contain;
  -ms-overflow-style: none;
  scrollbar-width: none;

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

const PortalContainer = styled.div<{$blockScroll: boolean}>`
  height: 100%;
  inset: 0;
  pointer-events: all;
  position: fixed;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  ${(props) => props.$blockScroll && scrollBlockStyles}
`
const PortalBackground = styled.div`
  background: transparent;
  height: 100%;
  inset: 0;
  position: absolute;
  width: 100%;
`

type PopoverPortalProps = {
  children?: React.ReactNode
  onDismiss?: () => void
  setBoundaryElement?: (element: HTMLDivElement) => void
  blockScroll?: boolean
}

export const PopoverPortal: FunctionComponent<PopoverPortalProps> = (props) => {
  return (
    <Portal>
      <PopoverBackground {...props} />
    </Portal>
  )
}

export const PopoverBackground: FunctionComponent<{
  children?: React.ReactNode
  onDismiss?: () => void
  setBoundaryElement?: (element: HTMLDivElement) => void
  blockScroll?: boolean
}> = (props) => {
  const {children, onDismiss, setBoundaryElement, blockScroll = true} = props

  // Prevent the event from propagating to the window, so that the controller's
  // `handleBlur` listener is not triggered. This is needed to prevent the
  // context menu from being dismissed when some click causes parent elements to
  // re-render, and the data-attribute method of preventing propagation fails.
  const handleClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <PortalContainer
      data-sanity-overlay-element
      ref={setBoundaryElement}
      onClick={handleClick}
      $blockScroll={blockScroll}
    >
      <PortalBackground
        onMouseDownCapture={() => {
          onDismiss?.()
        }}
      />
      {children}
    </PortalContainer>
  )
}
