import {get} from '@sanity/util/paths'
import {useDocuments} from '@sanity/visual-editing/react'
import {defineOverlayPlugin} from '@sanity/visual-editing/unstable_overlay-components'
import {useEffect, useState} from 'react'

export const LEDLifespanHUD = defineOverlayPlugin((options) => ({
  type: 'hud',
  name: 'led-lifespan-hud',
  component: function LEDLifespanHUDComponent(props) {
    const {getDocument} = useDocuments()
    const doc = getDocument(props.node.id)
    const [ledLifespan, setLedLifespan] = useState<string | undefined>()
    useEffect(() => {
      doc.getSnapshot().then((snapshot) => setLedLifespan(get<string>(snapshot, props.node.path)))
    }, [doc, props.node.path])
    return (
      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'var(--card-focus-ring-color)',
          borderRadius: '4px',
          padding: '2px 8px 2px 4px',
          fontSize: '14px',
        }}
      >
        💡 {ledLifespan}
      </div>
    )
  },
  guard: (ctx) => {
    return ctx?.field?.name === 'ledLifespan'
  },
}))
