import {Box} from '@sanity/ui'
import {motion, type VariantLabels, type Variants} from 'framer-motion'
import {forwardRef, type ReactEventHandler} from 'react'
import {styled} from 'styled-components'

const IFrameElement = motion(styled.iframe`
  box-shadow: 0 0 0 1px var(--card-border-color);
  border-top: 1px solid transparent;
  border-bottom: 0;
  border-right: 0;
  border-left: 0;
  max-height: 100%;
  width: 100%;
`)

const IFrameOverlay = styled(Box)`
  position: absolute;
  inset: 0;
  background: transparent;
`

interface IFrameProps {
  animate: VariantLabels
  initial: VariantLabels
  onLoad: ReactEventHandler<HTMLIFrameElement>
  preventClick: boolean
  src: string
  variants: Variants
}

export const IFrame = forwardRef<HTMLIFrameElement, IFrameProps>(function IFrame(props, ref) {
  const {animate, initial, onLoad, preventClick, src, variants} = props

  return (
    <>
      <IFrameElement
        animate={animate}
        initial={initial}
        onLoad={onLoad}
        ref={ref}
        src={src}
        variants={variants}
      />
      {preventClick && <IFrameOverlay />}
    </>
  )
})
