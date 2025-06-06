import {OverlayPluginDefinition} from '@sanity/visual-editing/react'

export const ExampleExclusivePlugin: OverlayPluginDefinition = {
  type: 'exclusive',
  name: 'example-exclusive',
  title: 'Example Exclusive',
  component: function ExampleExclusiveComponent({closeExclusiveView}) {
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
        <button onClick={() => closeExclusiveView()}>Close</button>
      </div>
    )
  },
  guard: () => {
    return true
  },
}
