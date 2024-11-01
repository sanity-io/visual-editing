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

  // Dispatch a perspective message when the perspective changes
  useEffect(() => {
    const run = async () => {
      const releases = await client.fetch(`*[_type=="system.release"] { ... }`)
      const releasesMeta = await client.fetch(`*[_type=="system-tmp.release"] { ... }`)
      // const releaseAttachedDocuments = await client.fetch(`*[_id in path("versions.**")] { ... }`)

      // client fetch
      comlink.post({
        type: 'presentation/releases',
        data: {
          releases: releases.map((r: any) => ({
            ...r,
            metadata: releasesMeta.find(
              (rm: any) => getVersionFromId(rm._id) === getVersionFromId(r._id),
            ).metadata,
            // documents: releaseAttachedDocuments.filter((d: any) => {
            //   const releaseVersion = r._id.split('_.releases.')[1]
            //   const documentVersion = getVersionFromId(d._id)

            //   return releaseVersion === documentVersion
            // }),
          })),
        },
      })
    }

    run()
  }, [comlink, perspective, bundlesPerspective])

  return null
}

export default memo(PostMessageReleases)
