import {useSharedState} from '@sanity/visual-editing'
import {FunctionComponent} from 'react'

export const OverlayHighlight: FunctionComponent = () => {
  const overlayEnabled = useSharedState<boolean>('overlay-enabled')

  if (!overlayEnabled) {
    return null
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 255, 0.25)',
      }}
    />
  )
}
