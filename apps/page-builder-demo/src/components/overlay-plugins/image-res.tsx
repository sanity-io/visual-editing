import {get} from '@sanity/util/paths'
import {useDocuments} from '@sanity/visual-editing/react'
import {defineOverlayPlugin} from '@sanity/visual-editing/unstable_overlay-components'
import {useEffect, useState} from 'react'

export function parseImageAssetId(documentId: string) {
  const [, assetId, dimensionString, extension] = documentId.split('-')
  const [width, height] = (dimensionString || '').split('x').map(Number)

  return {type: 'image', assetId, width, height, extension}
}

export const ImageResolutionHUD = defineOverlayPlugin(() => ({
  type: 'hud',
  name: 'image-resolution-hud',
  component: function ImageResolutionHUDComponent(props) {
    const {getDocument} = useDocuments()
    const doc = getDocument(props.node.id)
    const [resolution, setResolution] = useState<string | undefined>()
    useEffect(() => {
      doc.getSnapshot().then((snapshot) => {
        const image = get<any>(snapshot, props.node.path)
        const parts = parseImageAssetId(image.asset._ref)
        setResolution(`${parts.width}x${parts.height}`)
      })
    }, [doc, props.node.path])
    return (
      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'var(--card-focus-ring-color)',
          borderRadius: '4px',
          padding: '2px 8px 2px 8px',
          fontSize: '14px',
        }}
      >
        {resolution}
      </div>
    )
  },
  guard: (context) => {
    const fieldValue = context.field?.value

    if (fieldValue?.type !== 'object') {
      return false
    }

    const assetValue = fieldValue.fields.asset?.value

    if (assetValue?.type !== 'object') {
      return false
    }

    return assetValue?.dereferencesTo === 'sanity.imageAsset'
  },
}))
