import type {ClientPerspective} from '@sanity/client'
import {memo, useEffect, type FC} from 'react'
import {useReleases} from 'sanity'
import type {VisualEditingConnection} from './types'

export interface PostMessageReleasesProps {
  comlink: VisualEditingConnection
  perspective: ClientPerspective | `bundle.${string}`
  bundlesPerspective: string[]
}

const PostMessageReleases: FC<PostMessageReleasesProps> = (props) => {
  const {comlink, perspective, bundlesPerspective} = props

  const releases = useReleases()

  useEffect(() => {
    const run = async () => {
      comlink.post({
        type: 'presentation/releases',
        data: {
          releases: releases.data,
        },
      })
    }

    run()
  }, [comlink, perspective, bundlesPerspective])

  return null
}

export default memo(PostMessageReleases)
