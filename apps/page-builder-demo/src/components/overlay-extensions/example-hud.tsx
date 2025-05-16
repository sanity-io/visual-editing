import {OverlayExtensionDefinition} from '@sanity/visual-editing/react'

export const ExampleHUDExtension: OverlayExtensionDefinition = {
  type: 'hud',
  name: 'example-hud',
  title: 'Example HUD',
  component: function ExampleHUDComponent() {
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
        <span>Example HUD</span>
      </div>
    )
  },
  guard: () => {
    return true
  },
}
