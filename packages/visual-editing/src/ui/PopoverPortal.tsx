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
  &:before {
    content: '';
    display: block;
    height: 101%;
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
}> = (props) => {
  const {children, onDismiss} = props

  return (
    <Portal>
      <PortalContainer data-sanity-overlay-element>
        <PortalBackground onClickCapture={onDismiss} />
        {children}
      </PortalContainer>
    </Portal>
  )
}
