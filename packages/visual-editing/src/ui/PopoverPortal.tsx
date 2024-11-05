import {Portal} from '@sanity/ui'
import {type FunctionComponent} from 'react'
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

  return (
    <Portal>
      <PortalContainer data-sanity-overlay-element ref={setBoundaryElement}>
        <PortalBackground onClickCapture={onDismiss} />
        {children}
      </PortalContainer>
    </Portal>
  )
}
