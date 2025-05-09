import {OverlayExtensionDefinition} from '@sanity/visual-editing/react'

export const ImageToolExtension: OverlayExtensionDefinition = {
  type: 'exclusive',
  name: 'image-tool',
  title: 'Hotspot/Crop Tool',
  component: function ImageToolComponent(props) {
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
        IMAGE TOOL
      </div>
    )
  },
  guard: (ctx) => {
    console.log('ctx', ctx)
    // @ts-ignore
    return ctx?.field?.value?.fields?.asset?.value?.dereferencesTo === 'sanity.imageAsset'
  },
}
