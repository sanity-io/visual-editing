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

  // Return the document versions when requested
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let snapshot: null | {data: any; ids: string} = null
    return comlink.on('visual-editing/document-versions', async (data) => {
      if (snapshot === null || snapshot.ids !== JSON.stringify(data.elements)) {
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
        snapshot = {data: res, ids: JSON.stringify(data.elements)}

        return {
          versions: res,
          perspective,
        }
      }
      return {
        versions: snapshot.data,
        perspective,
      }
    })
  }, [client, comlink, perspective])

  return null
}

export default memo(PostMessageDocumentVersions)
