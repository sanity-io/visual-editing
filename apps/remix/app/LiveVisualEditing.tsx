import {useLiveMode} from '@sanity/react-loader'
import {OverlayComponentResolver} from '@sanity/visual-editing'
import {VisualEditing} from '@sanity/visual-editing/remix'
import {client} from '~/sanity'
import {CustomControlsComponent} from './CustomControlsComponent'

export default function LiveVisualEditing() {
  useLiveMode({client})

  const components: OverlayComponentResolver = (props) => {
    const {type, node} = props

    if (type === 'string' && node.path === 'title') {
      return CustomControlsComponent
    }
  }

  return <VisualEditing components={components} />
}
