import type {ClientPerspective} from '@sanity/client'
import {memo, useEffect, type FC} from 'react'
import {useReleases} from 'sanity'
import type {VisualEditingConnection} from './types'

export interface PostMessageReleasesProps {
  comlink: VisualEditingConnection
  perspective: ClientPerspective
  bundlesPerspective: string[]
}

const PostMessageReleases: FC<PostMessageReleasesProps> = (props) => {
  const {comlink, perspective, bundlesPerspective} = props

  const releases = useReleases()

  useEffect(() => {
    const run = async () => {
      comlink.post('presentation/releases', {
        releases: releases.data,
        bundlesPerspective,
        perspective,
      })
    }

    run()
  }, [bundlesPerspective, comlink, perspective, releases.data])

  return null
}

export default memo(PostMessageReleases)
