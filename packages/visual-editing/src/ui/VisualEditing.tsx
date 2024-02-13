import { FunctionComponent } from 'react'

import { VisualEditingOptions } from './enableVisualEditing'
import { Meta } from './Meta'
import { Overlays } from './Overlays'
import { useChannel } from './useChannel'

/**
 * @internal
 */
export const VisualEditing: FunctionComponent<VisualEditingOptions> = function (
  props,
) {
  const { history, zIndex } = props
  const channel = useChannel()

  return (
    channel && (
      <>
        <Overlays channel={channel} history={history} zIndex={zIndex} />
        <Meta channel={channel} />
      </>
    )
  )
}
