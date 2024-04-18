import {VisualEditing} from '@sanity/visual-editing/remix'
import {useLiveMode} from '@sanity/react-loader'
import {client} from '~/sanity'

export default function LiveVisualEditing() {
  useLiveMode({client})

  return <VisualEditing />
}
