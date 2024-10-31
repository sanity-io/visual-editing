import type {ClientPerspective} from '@sanity/client'
import {memo, useEffect, type FC} from 'react'
import {getVersionFromId, useClient} from 'sanity'
import type {VisualEditingConnection} from './types'

export interface PostMessageReleasesProps {
  comlink: VisualEditingConnection
  perspective: ClientPerspective | `bundle.${string}`
  bundlesPerspective: string[]
}

const PostMessageReleases: FC<PostMessageReleasesProps> = (props) => {
  const {comlink, perspective, bundlesPerspective} = props

  const client = useClient({apiVersion: 'vX'})

  useEffect(() => {
    const run = async () => {
      const releases = await client.fetch(`*[_type=="system.release"] { ... }`)
      const releasesMeta = await client.fetch(`*[_type=="system-tmp.release"] { ... }`)

      comlink.post({
        type: 'presentation/releases',
        data: {
          releases: releases.map((r: any) => ({
            ...r,
            metadata: releasesMeta.find((rm: any) => rm._id === `system-tmp-releases.${r.name}`)
              .metadata,
          })),
        },
      })
    }

    run()
  }, [comlink, perspective, bundlesPerspective])

  return null
}

export default memo(PostMessageReleases)
