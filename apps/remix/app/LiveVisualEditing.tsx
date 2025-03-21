import {useSearchParams} from '@remix-run/react'
import {ClientPerspective, SanityClient} from '@sanity/client'
import {useLiveMode} from '@sanity/react-loader'
import {OverlayComponentResolver} from '@sanity/visual-editing'
import {VisualEditing} from '@sanity/visual-editing/remix'
import {client as _client} from '~/sanity'
import {useMemo} from 'react'
import {CustomControlsComponent} from './CustomControlsComponent'

export default function LiveVisualEditing() {
  const [searchParams] = useSearchParams()
  const perspective = searchParams.get('sanity-preview-perspective') as string | undefined

  const client: SanityClient = useMemo(
    () => _client.withConfig({perspective: perspective?.split(',') as ClientPerspective}),
    [perspective],
  )

  useLiveMode({client})

  const components: OverlayComponentResolver = (props) => {
    const {type, node} = props

    if (type === 'string' && node.path === 'title') {
      return CustomControlsComponent
    }
  }

  return <VisualEditing components={components} />
}
