import {useVisualEditingEnvironment} from './useVisualEditingEnvironment'

/**
 * Initially returns `null`, until `<VisualEditing />` is rendered on the page.
 * Returns `false` if there's no parent window context with Presentation Tool connected over comlink.
 * Returns `true` when a connection is established over comlink and window.postMessage, the handshake might take a while and the hook may return `false` initially before it eventually returns `true`.
 */
export function useIsPresentationTool(): null | boolean {
  const env = useVisualEditingEnvironment()
  if (env === null) return null
  return env === 'presentation-iframe' || env === 'presentation-window'
}
