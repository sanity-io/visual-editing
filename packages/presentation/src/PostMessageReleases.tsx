import type {ClientPerspective} from '@sanity/client'
import {memo, useEffect, type FC} from 'react'
import {useClient} from 'sanity'
import type {VisualEditingConnection} from './types'

export interface PostMessageReleasesProps {
  comlink: VisualEditingConnection
  perspective: ClientPerspective | `bundle.${string}`
  bundlesPerspective: string[]
}

const PostMessageReleases: FC<PostMessageReleasesProps> = (props) => {
  const {comlink, perspective, bundlesPerspective} = props

  const client = useClient({apiVersion: 'vX'})

  // Dispatch a perspective message when the perspective changes
  useEffect(() => {
    const run = async () => {
      const releases = await client.fetch('*[_type=="system.release"]')

      // client fetch
      comlink.post({
        type: 'presentation/releases',
        data: {
          releases,
        },
      })
    }

    run()
  }, [comlink, perspective, bundlesPerspective])

  return null
}

export default memo(PostMessageReleases)
