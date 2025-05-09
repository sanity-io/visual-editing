import {get} from '@sanity/util/paths'
import {OverlayExtensionDefinition, useDocuments} from '@sanity/visual-editing/react'
import {useEffect, useState} from 'react'

export function parseImageAssetId(documentId: string) {
  const [, assetId, dimensionString, extension] = documentId.split('-')
  const [width, height] = (dimensionString || '').split('x').map(Number)

  return {type: 'image', assetId, width, height, extension}
}

export const ImageResolutionHUD: OverlayExtensionDefinition = {
  type: 'hud',
  name: 'image-resolution-hud',
  component: function ImageResolutionHUDComponent(props) {
    console.log('props', props)
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
  guard: (ctx) => {
    console.log('ctx', ctx)
    // @ts-ignore
    return ctx?.field?.value?.fields?.asset?.value?.dereferencesTo === 'sanity.imageAsset'
  },
}
