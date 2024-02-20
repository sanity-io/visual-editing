import type { FunctionComponent } from 'react'

import type { VisualEditingOptions } from './enableVisualEditing'
import { Meta } from './Meta'
import { Overlays } from './Overlays'
// import { Refresh } from './Refresh'
import { useChannel } from './useChannel'

/**
 * @internal
 */
export const VisualEditing: FunctionComponent<VisualEditingOptions> = (
  props,
) => {
  const { history, zIndex } = props
  const channel = useChannel()

  return (
    channel && (
      <>
        <Overlays channel={channel} history={history} zIndex={zIndex} />
        <Meta channel={channel} />
        {/* <Refresh channel={channel} /> */}
      </>
    )
  )
}
