import type {FunctionComponent} from 'react'

import type {VisualEditingOptions} from '../types'
import {CustomControlsComponent} from './__TEMP__CustomControlsComponent'
import {Meta} from './Meta'
import {Overlays} from './Overlays'
import {Refresh} from './Refresh'
import {useChannel} from './useChannel'

/**
 * @public
 */
export const VisualEditing: FunctionComponent<VisualEditingOptions> = (props) => {
  const {components, history, refresh, zIndex} = props
  const channel = useChannel()

  // @TODO We just fake this for now, because next-sanity won't pass our new
  // `components` prop yet. This is also probably not the best designed API for
  // this: needs more thought.
  const fakeComponents = [
    {
      type: 'object',
      name: 'product',
      path: 'model',
      component: CustomControlsComponent,
    },
  ] satisfies VisualEditingOptions['components']

  return (
    channel && (
      <>
        <Overlays
          components={components || fakeComponents}
          channel={channel}
          history={history}
          zIndex={zIndex}
        />
        <Meta channel={channel} />
        {refresh && <Refresh channel={channel} refresh={refresh} />}
      </>
    )
  )
}
