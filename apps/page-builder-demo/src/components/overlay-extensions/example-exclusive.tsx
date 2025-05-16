import {OverlayExtensionDefinition} from '@sanity/visual-editing/react'

export const ExampleExclusiveExtension: OverlayExtensionDefinition = {
  type: 'exclusive',
  name: 'example-exclusive',
  title: 'Example Exclusive',
  component: function ExampleExclusiveComponent({closeExclusiveExtension, PointerEvents}) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          backgroundColor: 'var(--card-focus-ring-color)',
          borderRadius: '4px',
          padding: '2px 8px 2px 8px',
          fontSize: '14px',
        }}
      >
        <span>Example Exclusive</span>
        <PointerEvents>
          <button onClick={() => closeExclusiveExtension()}>Close</button>
        </PointerEvents>
      </div>
    )
  },
  guard: () => {
    return true
  },
}
