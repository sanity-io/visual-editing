import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {VisualEditingDoctor} from './ui/VisualEditingDoctor'

export function mount() {
  const container = document.createElement('sanity-visual-editing-doctor')
  document.body.parentNode!.insertBefore(container, document.body.nextSibling)
  const root = createRoot(container)

  root.render(
    <StrictMode>
      <VisualEditingDoctor />
    </StrictMode>,
  )
}
