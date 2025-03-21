import {useSubmit} from '@remix-run/react'
import {ClientPerspective} from '@sanity/client'
import {useLiveMode} from '@sanity/react-loader'
import {OverlayComponentResolver} from '@sanity/visual-editing'
import {VisualEditing} from '@sanity/visual-editing/remix'
import {client as _client} from '~/sanity'
import {useMemo} from 'react'
import {useEffectEvent} from 'use-effect-event'
import {CustomControlsComponent} from './CustomControlsComponent'

export default function LiveVisualEditing({perspective}: {perspective: ClientPerspective}) {
  const client = useMemo(() => _client.withConfig({perspective}), [perspective])

  const submit = useSubmit()
  const onPerspective = useEffectEvent((perspective: Exclude<ClientPerspective, 'raw'>) => {
    const formData = new FormData()
    formData.set('perspective', Array.isArray(perspective) ? perspective.join(',') : perspective)
    submit(formData, {method: 'post', action: '/api/perspective', navigate: false})
  })

  useLiveMode({client, onPerspective})

  const components: OverlayComponentResolver = (props) => {
    const {type, node} = props

    if (type === 'string' && node.path === 'title') {
      return CustomControlsComponent
    }
  }

  return <VisualEditing components={components} />
}
