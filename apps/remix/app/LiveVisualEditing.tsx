import {useLiveMode} from '@sanity/react-loader'
import {VisualEditing} from '@sanity/visual-editing/remix'
import {client} from '~/sanity'

export default function LiveVisualEditing() {
  useLiveMode({client})

  return <VisualEditing />
}
