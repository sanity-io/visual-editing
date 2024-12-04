import type {ClientPerspective} from '@sanity/client'
import {memo, useEffect, type FC} from 'react'
import {useClient} from 'sanity'
import type {VisualEditingConnection} from './types'

export interface PostMessageDocumentVersionsProps {
  comlink: VisualEditingConnection
  perspective: ClientPerspective
}

const PostMessageDocumentVersions: FC<PostMessageDocumentVersionsProps> = (props) => {
  const {comlink, perspective} = props

  const client = useClient({apiVersion: 'vX'})

  // Return the perspective when requested
  useEffect(() => {
    return comlink.on('visual-editing/document-versions', async (data) => {
      const res = await client.fetch(
        `
          *[_id in $ids] {
            _id,
            "versions": *[sanity::versionOf(^._id)] {
              _id
            }
          }
        `,
        {ids: data.elements},
      )

      return {
        versions: res,
        perspective,
      }
    })
  }, [client, comlink, perspective])

  return null
}

export default memo(PostMessageDocumentVersions)
