import {useLiveMode} from '@sanity/react-loader'
import {VisualEditing} from '@sanity/visual-editing/next-pages-router'
import {client} from './sanity.client'

// Always enable stega in Live Mode
const stegaClient = client.withConfig({stega: true})

export default function LiveVisualEditing() {
  useLiveMode({client: stegaClient})

  return <VisualEditing />
}
