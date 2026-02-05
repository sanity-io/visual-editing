/**
 * The environment is `null` initially, until `<VisualEditing />` is rendered on the page.
 * It then becomes `'standalone'` by default. If Presentation Tool is detected and connected over comlink it then becomes either:
 * - `'presentation-iframe'` if the page is loaded in an iframe, this is the default
 * - `'presentation-window'` if the page is loaded in a new window, which happens if the studio user has clicked the "Open preview" button in the Presentation Tool URL bar.
 */
export type VisualEditingEnvironment =
  | null
  | 'presentation-iframe'
  | 'presentation-window'
  | 'standalone'

const listeners: Set<() => void> = new Set()
export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

let environment: VisualEditingEnvironment = null
export function getSnapshot(): VisualEditingEnvironment {
  return environment
}

export function setEnvironment(nextEnvironment: VisualEditingEnvironment): void {
  if (environment === nextEnvironment) return
  environment = nextEnvironment
  for (const onEnvironmentChange of listeners) {
    onEnvironmentChange()
  }
}
